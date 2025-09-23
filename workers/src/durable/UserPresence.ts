import { DurableObject } from 'cloudflare:workers';
import type { Env } from '../index';
import { updateUserStatus, touchUserStatus } from '../services/userStatus';

interface PresenceState {
  userId: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'STUDYING';
  lastSeenAt: string;
  deviceInfo?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

const STATUS_KEY = 'status';
const ONLINE_LIST_PREFIX = 'presence:online';
const SESSION_PREFIX = 'presence:session';
const INACTIVE_THRESHOLD_MS = 15 * 60 * 1000; // 15분

export class UserPresence extends DurableObject {
  env: Env;
  private userId: string;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.env = env;
    this.userId = state.id.toString();
  }

  private async ensureState(): Promise<PresenceState | null> {
    const cached = await this.ctx.storage.get<PresenceState>(STATUS_KEY);
    if (cached) {
      return cached;
    }

    const row = await this.env.DB.prepare(
      `SELECT status, last_seen_at, device_info, current_session_id
         FROM user_status WHERE user_id = ? LIMIT 1`
    )
      .bind(this.userId)
      .first<{ status: string; last_seen_at: string | null; device_info: string | null; current_session_id: string | null }>();

    if (!row) {
      return null;
    }

    const state: PresenceState = {
      userId: this.userId,
      status: (row.status as PresenceState['status']) ?? 'OFFLINE',
      lastSeenAt: row.last_seen_at ?? new Date().toISOString(),
      deviceInfo: row.device_info ?? undefined,
      sessionId: row.current_session_id ?? undefined
    };

    await this.ctx.storage.put(STATUS_KEY, state);
    await this.updateIndexes(state);
    return state;
  }

  async setStatus(request: Request): Promise<Response> {
    const body = await request.json<PresenceState>();
    const state: PresenceState = {
      ...body,
      userId: body.userId ?? this.userId,
      lastSeenAt: body.lastSeenAt ?? new Date().toISOString()
    };

    await this.ctx.storage.put(STATUS_KEY, state);
    await this.updateIndexes(state);
    await updateUserStatus(this.env, state.userId, state.status, {
      sessionId: state.sessionId,
      deviceInfo: state.deviceInfo
    });

    return new Response(JSON.stringify(state), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  async touch(): Promise<Response> {
    const current = (await this.ctx.storage.get<PresenceState>(STATUS_KEY)) ?? (await this.ensureState());
    if (!current) {
      return new Response(JSON.stringify({ success: false, reason: 'USER_NOT_FOUND' }), { status: 404 });
    }

    const updated: PresenceState = {
      ...current,
      lastSeenAt: new Date().toISOString()
    };

    await this.ctx.storage.put(STATUS_KEY, updated);
    await this.updateIndexes(updated);
    await touchUserStatus(this.env, updated.userId);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  async getStatus(): Promise<Response> {
    const current = (await this.ctx.storage.get<PresenceState>(STATUS_KEY)) ?? (await this.ensureState());
    if (!current) {
      return new Response(JSON.stringify({ status: 'OFFLINE' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(current), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  async setOffline(): Promise<Response> {
    const current = (await this.ctx.storage.get<PresenceState>(STATUS_KEY)) ?? (await this.ensureState());
    if (!current) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    const updated: PresenceState = {
      ...current,
      status: 'OFFLINE',
      sessionId: undefined,
      lastSeenAt: new Date().toISOString()
    };

    await this.ctx.storage.put(STATUS_KEY, updated);
    await this.updateIndexes(updated, { removeFromSession: current.sessionId });
    await updateUserStatus(this.env, updated.userId, 'OFFLINE');

    return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  async alarm(): Promise<void> {
    const current = await this.ctx.storage.get<PresenceState>(STATUS_KEY);
    if (!current) {
      return;
    }

    const lastSeen = new Date(current.lastSeenAt).getTime();
    if (Date.now() - lastSeen > INACTIVE_THRESHOLD_MS && current.status !== 'OFFLINE') {
      await this.setOffline();
    } else {
      await this.scheduleAlarm();
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    switch (url.pathname) {
      case '/status':
        return this.getStatus();
      case '/set':
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        await this.scheduleAlarm();
        return this.setStatus(request);
      case '/touch':
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        await this.scheduleAlarm();
        return this.touch();
      case '/offline':
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        return this.setOffline();
      default:
        return new Response('Not Found', { status: 404 });
    }
  }

  private async updateIndexes(state: PresenceState, options: { removeFromSession?: string } = {}) {
    const { status, userId, sessionId } = state;

    if (!userId) return;

    if (status === 'ONLINE' || status === 'STUDYING' || status === 'AWAY') {
      await this.env.CACHE.put(`${ONLINE_LIST_PREFIX}:${userId}`, state.status, { expirationTtl: 60 * 10 });
    } else {
      await this.env.CACHE.delete(`${ONLINE_LIST_PREFIX}:${userId}`);
    }

    if (sessionId) {
      await this.env.CACHE.put(`${SESSION_PREFIX}:${sessionId}:${userId}`, state.status, { expirationTtl: 60 * 10 });
    }
    if (options.removeFromSession) {
      await this.env.CACHE.delete(`${SESSION_PREFIX}:${options.removeFromSession}:${userId}`);
    }
  }

  private async scheduleAlarm() {
    const alarmTime = Date.now() + INACTIVE_THRESHOLD_MS;
    await this.ctx.storage.setAlarm(alarmTime);
  }
}
