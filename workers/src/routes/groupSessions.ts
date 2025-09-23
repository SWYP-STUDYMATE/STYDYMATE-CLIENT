import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse, paginatedResponse } from '../utils/response';
import {
  createGroupSession,
  joinGroupSession,
  joinGroupSessionByCode,
  leaveGroupSession,
  startGroupSession,
  endGroupSession,
  cancelGroupSession,
  getGroupSessionById,
  listAvailableGroupSessions,
  listUserGroupSessions,
  listHostedGroupSessions,
  kickGroupParticipant,
  rateGroupSession,
  updateGroupSession,
  getRecommendedGroupSessions,
  inviteToGroupSession,
  respondToInvitation,
  searchGroupSessions
} from '../services/groupSessions';

const groupSessionsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
const requireAuth = authMiddleware();

function getPaginationParams(c: any) {
  const page = Math.max(Number(c.req.query('page') ?? '1'), 1);
  const size = Math.max(Math.min(Number(c.req.query('size') ?? '20'), 50), 1);
  return { page, size };
}

function requirePathParam(value: string | undefined, field: string): string {
  if (!value) {
    throw new AppError(`Invalid ${field}`, 400, 'INVALID_PATH_PARAM');
  }
  return value;
}

function requireUserId(c: any): string {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  }
  return userId;
}

groupSessionsRoutes.use('*', requireAuth);

groupSessionsRoutes.post('/', async (c) => {
  const hostUserId = c.get('userId');
  if (!hostUserId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const required = ['title', 'topicCategory', 'targetLanguage', 'languageLevel', 'maxParticipants', 'scheduledAt', 'sessionDuration', 'isPublic'];
  const missing = required.filter((key) => body[key] === undefined || body[key] === null || body[key] === '');
  if (missing.length) {
    throw new AppError(`Missing fields: ${missing.join(', ')}`, 400, 'INVALID_PAYLOAD');
  }
  const session = await createGroupSession(c.env, hostUserId, body);
  return successResponse(c, session);
});

groupSessionsRoutes.get('/:sessionId', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  const session = await getGroupSessionById(c.env, sessionId, userId);
  return successResponse(c, session);
});

groupSessionsRoutes.post('/:sessionId/join', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  const body = await c.req.json().catch(() => ({}));
  const session = await joinGroupSession(c.env, userId, sessionId, body);
  return successResponse(c, session);
});

groupSessionsRoutes.post('/join/:joinCode', async (c) => {
  const userId = requireUserId(c);
  const joinCode = requirePathParam(c.req.param('joinCode'), 'joinCode');
  const body = await c.req.json().catch(() => ({}));
  const session = await joinGroupSessionByCode(c.env, userId, joinCode, body);
  return successResponse(c, session);
});

groupSessionsRoutes.post('/:sessionId/leave', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  await leaveGroupSession(c.env, userId, sessionId);
  return successResponse(c, { success: true });
});

groupSessionsRoutes.post('/:sessionId/start', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  const session = await startGroupSession(c.env, userId, sessionId);
  return successResponse(c, session);
});

groupSessionsRoutes.post('/:sessionId/end', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  const session = await endGroupSession(c.env, userId, sessionId);
  return successResponse(c, session);
});

groupSessionsRoutes.post('/:sessionId/cancel', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  const reason = c.req.query('reason') ?? undefined;
  await cancelGroupSession(c.env, userId, sessionId, reason);
  return successResponse(c, { success: true });
});

groupSessionsRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  const { page, size } = getPaginationParams(c);
  const filters = {
    language: c.req.query('language'),
    level: c.req.query('level'),
    category: c.req.query('category'),
    tags: c.req.query('tags') ? c.req.query('tags')!.split(',').map((t) => t.trim()).filter(Boolean) : undefined
  };
  const result = await listAvailableGroupSessions(c.env, page, size, filters, userId ?? undefined);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

groupSessionsRoutes.get('/available', async (c) => {
  const userId = c.get('userId');
  const { page, size } = getPaginationParams(c);
  const filters = {
    language: c.req.query('language'),
    level: c.req.query('level'),
    category: c.req.query('category'),
    tags: c.req.query('tags') ? c.req.query('tags')!.split(',').map((t) => t.trim()).filter(Boolean) : undefined
  };
  const result = await listAvailableGroupSessions(c.env, page, size, filters, userId ?? undefined);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

groupSessionsRoutes.get('/my', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const status = c.req.query('status') ?? undefined;
  const sessions = await listUserGroupSessions(c.env, userId, status ?? undefined);
  return successResponse(c, sessions);
});

groupSessionsRoutes.get('/my-sessions', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const status = c.req.query('status') ?? undefined;
  const sessions = await listUserGroupSessions(c.env, userId, status ?? undefined);
  return successResponse(c, sessions);
});

groupSessionsRoutes.get('/hosted', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const sessions = await listHostedGroupSessions(c.env, userId);
  return successResponse(c, sessions);
});

groupSessionsRoutes.post('/:sessionId/kick/:participantId', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  const participantId = requirePathParam(c.req.param('participantId'), 'participantId');
  await kickGroupParticipant(c.env, userId, sessionId, participantId);
  return successResponse(c, { success: true });
});

groupSessionsRoutes.post('/:sessionId/rate', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  const rating = Number(c.req.query('rating') ?? c.req.query('score') ?? 0);
  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('rating must be between 1 and 5', 400, 'INVALID_QUERY_PARAM');
  }
  const feedback = c.req.query('feedback') ?? undefined;
  await rateGroupSession(c.env, userId, sessionId, rating, feedback);
  return successResponse(c, { success: true });
});

groupSessionsRoutes.put('/:sessionId', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  const body = await c.req.json();
  await updateGroupSession(c.env, userId, sessionId, body);
  return successResponse(c, { success: true });
});

groupSessionsRoutes.get('/recommended/list', async (c) => {
  const userId = requireUserId(c);
  const sessions = await getRecommendedGroupSessions(c.env, userId);
  return successResponse(c, sessions);
});

groupSessionsRoutes.post('/:sessionId/invite', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  const body = await c.req.json();
  if (!Array.isArray(body)) {
    throw new AppError('Expected an array of userIds', 400, 'INVALID_PAYLOAD');
  }
  const session = await inviteToGroupSession(c.env, userId, sessionId, body);
  return successResponse(c, session);
});

groupSessionsRoutes.post('/:sessionId/invitation/respond', async (c) => {
  const userId = requireUserId(c);
  const sessionId = requirePathParam(c.req.param('sessionId'), 'sessionId');
  const accept = c.req.query('accept');
  const accepted = accept ? accept.toLowerCase() === 'true' : true;
  await respondToInvitation(c.env, userId, sessionId, accepted);
  return successResponse(c, { success: true, accepted });
});

groupSessionsRoutes.get('/search', async (c) => {
  const keyword = c.req.query('keyword') ?? '';
  const language = c.req.query('language') ?? undefined;
  const level = c.req.query('level') ?? undefined;
  const sessions = await searchGroupSessions(c.env, keyword, language, level);
  return successResponse(c, sessions);
});

export default groupSessionsRoutes;
