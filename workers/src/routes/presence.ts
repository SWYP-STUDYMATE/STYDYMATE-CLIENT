import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware, internalAuth } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';

const presenceRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
const requireAuth = authMiddleware();

interface PresencePayload {
  userId?: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'STUDYING';
  deviceInfo?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

function getPresenceId(userId: string): DurableObjectId {
  const stub = (presenceRoutes as any).context?.env?.USER_PRESENCE as DurableObjectNamespace;
  if (!stub) {
    throw new Error('Durable Object binding USER_PRESENCE is not configured');
  }
  return stub.idFromString(userId);
}

async function fetchPresence(env: Env, userId: string, path: string, init?: RequestInit) {
  const id = env.USER_PRESENCE.idFromString(userId);
  const stub = env.USER_PRESENCE.get(id);
  const url = `https://user-presence/${path}`;
  return stub.fetch(new Request(url, init));
}

presenceRoutes.use('/internal/*', internalAuth());

presenceRoutes.post('/internal/presence/set', async (c) => {
  const body = (await c.req.json()) as PresencePayload;
  const userId = body.userId;
  if (!userId) throw new AppError('userId is required', 400, 'INVALID_PAYLOAD');
  const response = await fetchPresence(c.env, userId, 'set', {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      userId,
      lastSeenAt: new Date().toISOString()
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return c.json(data, response.status as any);
});

presenceRoutes.post('/internal/presence/touch', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { userId?: string };
  const userId = body.userId;
  if (!userId) throw new AppError('userId is required', 400, 'INVALID_PAYLOAD');
  const response = await fetchPresence(c.env, userId, 'touch', { method: 'POST' });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return c.json(data, response.status as any);
});

presenceRoutes.post('/internal/presence/offline', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { userId?: string };
  const userId = body.userId;
  if (!userId) throw new AppError('userId is required', 400, 'INVALID_PAYLOAD');
  const response = await fetchPresence(c.env, userId, 'offline', { method: 'POST' });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return c.json(data, response.status as any);
});

presenceRoutes.get('/internal/presence/status/:userId', async (c) => {
  const userId = c.req.param('userId');
  if (!userId) throw new AppError('userId is required', 400, 'INVALID_PATH_PARAM');
  const response = await fetchPresence(c.env, userId, 'status');
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return c.json(data, response.status as any);
});

presenceRoutes.use('/*', requireAuth);

presenceRoutes.post('/presence/status', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = (await c.req.json().catch(() => ({}))) as PresencePayload;
  const payload: PresencePayload = {
    ...body,
    userId,
    status: body.status ?? 'ONLINE'
  };
  const response = await fetchPresence(c.env, userId, 'set', {
    method: 'POST',
    body: JSON.stringify({ ...payload, lastSeenAt: new Date().toISOString() }),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return c.json(data, response.status as any);
});

presenceRoutes.post('/presence/touch', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const response = await fetchPresence(c.env, userId, 'touch', { method: 'POST' });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return c.json(data, response.status as any);
});

presenceRoutes.post('/presence/offline', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const response = await fetchPresence(c.env, userId, 'offline', { method: 'POST' });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return c.json(data, response.status as any);
});

presenceRoutes.get('/presence/status', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const response = await fetchPresence(c.env, userId, 'status');
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return c.json(data, response.status as any);
});

export default presenceRoutes;
