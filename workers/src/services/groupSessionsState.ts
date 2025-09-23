import type { Env } from '../index';

const INVITATION_PREFIX = 'group-session:invitation';
const ACTIVE_PREFIX = 'group-session:user-active';
const RECENT_PREFIX = 'group-session:recent';
const INVITATION_TTL_SECONDS = 60 * 60 * 24 * 3; // 3 days
const ACTIVE_TTL_SECONDS = 60 * 60 * 24; // 1 day
const RECENT_MAX = 10;

interface InvitationRecord {
  sessionId: string;
  userId: string;
  hostUserId: string;
  createdAt: string;
}

interface ActiveSessionsRecord {
  userId: string;
  sessions: string[];
  updatedAt: string;
}

interface RecentSessionRecord {
  sessionId: string;
  viewedAt: string;
}

function invitationKey(sessionId: string, userId: string): string {
  return `${INVITATION_PREFIX}:${sessionId}:${userId}`;
}

function activeKey(userId: string): string {
  return `${ACTIVE_PREFIX}:${userId}`;
}

function recentKey(userId: string): string {
  return `${RECENT_PREFIX}:${userId}`;
}

export async function saveInvitation(
  env: Env,
  sessionId: string,
  userId: string,
  hostUserId: string
): Promise<void> {
  const record: InvitationRecord = {
    sessionId,
    userId,
    hostUserId,
    createdAt: new Date().toISOString()
  };

  await env.CACHE.put(invitationKey(sessionId, userId), JSON.stringify(record), {
    expirationTtl: INVITATION_TTL_SECONDS
  });
}

export async function getInvitation(
  env: Env,
  sessionId: string,
  userId: string
): Promise<InvitationRecord | null> {
  const raw = await env.CACHE.get(invitationKey(sessionId, userId), { type: 'json' });
  return (raw as InvitationRecord | null) ?? null;
}

export async function deleteInvitation(env: Env, sessionId: string, userId: string): Promise<void> {
  await env.CACHE.delete(invitationKey(sessionId, userId));
}

export async function addActiveSession(env: Env, userId: string, sessionId: string): Promise<void> {
  const key = activeKey(userId);
  const existing = (await env.CACHE.get(key, { type: 'json' })) as ActiveSessionsRecord | null;
  const set = new Set(existing?.sessions ?? []);
  set.add(sessionId);
  const record: ActiveSessionsRecord = {
    userId,
    sessions: Array.from(set),
    updatedAt: new Date().toISOString()
  };
  await env.CACHE.put(key, JSON.stringify(record), { expirationTtl: ACTIVE_TTL_SECONDS });
}

export async function removeActiveSession(env: Env, userId: string, sessionId: string): Promise<void> {
  const key = activeKey(userId);
  const existing = (await env.CACHE.get(key, { type: 'json' })) as ActiveSessionsRecord | null;
  if (!existing) {
    return;
  }
  const set = new Set(existing.sessions);
  set.delete(sessionId);
  const record: ActiveSessionsRecord = {
    userId,
    sessions: Array.from(set),
    updatedAt: new Date().toISOString()
  };
  if (record.sessions.length === 0) {
    await env.CACHE.delete(key);
  } else {
    await env.CACHE.put(key, JSON.stringify(record), { expirationTtl: ACTIVE_TTL_SECONDS });
  }
}

export async function listActiveSessions(env: Env, userId: string): Promise<string[]> {
  const key = activeKey(userId);
  const existing = (await env.CACHE.get(key, { type: 'json' })) as ActiveSessionsRecord | null;
  return existing?.sessions ?? [];
}

export async function addRecentSession(env: Env, userId: string, sessionId: string): Promise<void> {
  const key = recentKey(userId);
  const existing = (await env.CACHE.get(key, { type: 'json' })) as string[] | null;
  const recent = (existing ?? []).filter((id) => id !== sessionId);
  recent.unshift(sessionId);
  const trimmed = recent.slice(0, RECENT_MAX);
  await env.CACHE.put(key, JSON.stringify(trimmed), { expirationTtl: ACTIVE_TTL_SECONDS });
}

export async function listRecentSessions(env: Env, userId: string): Promise<string[]> {
  const key = recentKey(userId);
  const existing = (await env.CACHE.get(key, { type: 'json' })) as string[] | null;
  return existing ?? [];
}
