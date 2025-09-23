import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse, paginatedResponse } from '../utils/response';
import {
  createSession,
  listSessions,
  getSessionById,
  listUserSessions,
  listPublicSessions,
  listSessionsByLanguage,
  listSessionsByType,
  listAvailableSessions,
  bookSession,
  joinSession,
  cancelBooking,
  listUserBookings,
  getUserCalendar,
  startSession,
  endSession,
  rescheduleSession,
  submitSessionFeedback,
  listSessionHistory,
  getSessionStats,
  listUpcomingSessions,
  getSessionParticipants,
  generateSessionInvite,
  acceptSessionInvite,
  getSessionNotifications,
  updateSessionNotifications,
  requestSessionRecording,
  stopSessionRecording,
  getSessionRecording,
  getSessionSummary,
  getSessionTranscript,
  cancelSession
} from '../services/session';
import type { SessionCreatePayload, SessionNotificationSettings } from '../types';

const sessionsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
const requireAuth = authMiddleware();

function getPaginationParams(c: any) {
  const page = Math.max(Number(c.req.query('page') ?? '1'), 1);
  const size = Math.max(Math.min(Number(c.req.query('size') ?? '20'), 50), 1);
  return { page, size };
}

function parseSessionId(c: any): number {
  const sessionId = Number(c.req.param('sessionId'));
  if (!Number.isFinite(sessionId)) throw new AppError('Invalid sessionId', 400, 'INVALID_PATH_PARAM');
  return sessionId;
}

function normalizeCreatePayload(body: any): SessionCreatePayload {
  if (!body || typeof body !== 'object') {
    throw new AppError('Invalid payload', 400, 'INVALID_PAYLOAD');
  }
  const scheduledAt = typeof body.scheduledAt === 'string' ? body.scheduledAt : null;
  if (!scheduledAt) {
    throw new AppError('scheduledAt is required', 400, 'INVALID_PAYLOAD');
  }
  const sessionTypeRaw = typeof body.sessionType === 'string' ? body.sessionType : typeof body.type === 'string' ? body.type : null;
  const sessionType = sessionTypeRaw ? String(sessionTypeRaw).toUpperCase() : 'VIDEO';
  const durationMinutes = typeof body.durationMinutes === 'number'
    ? body.durationMinutes
    : typeof body.duration === 'number'
      ? body.duration
      : 30;

  const payload: SessionCreatePayload = {
    title: typeof body.title === 'string' ? body.title : typeof body.topic === 'string' ? body.topic : 'Study Session',
    description: typeof body.description === 'string' ? body.description : typeof body.topic === 'string' ? body.topic : undefined,
    sessionType,
    languageCode: typeof body.languageCode === 'string' ? body.languageCode : typeof body.language === 'string' ? body.language : undefined,
    skillFocus: typeof body.skillFocus === 'string' ? body.skillFocus : typeof body.targetLanguage === 'string' ? body.targetLanguage : undefined,
    levelRequirement: typeof body.levelRequirement === 'string' ? body.levelRequirement : undefined,
    scheduledAt,
    durationMinutes,
    maxParticipants: typeof body.maxParticipants === 'number' ? body.maxParticipants : undefined,
    isRecurring: Boolean(body.isRecurring),
    recurrencePattern: typeof body.recurrencePattern === 'string' ? body.recurrencePattern : undefined,
    recurrenceEndDate: typeof body.recurrenceEndDate === 'string' ? body.recurrenceEndDate : undefined,
    isPublic: typeof body.isPublic === 'boolean' ? body.isPublic : undefined,
    tags: typeof body.tags === 'string' ? body.tags : undefined,
    preparationNotes: typeof body.preparationNotes === 'string' ? body.preparationNotes : undefined,
    meetingUrl: typeof body.meetingUrl === 'string' ? body.meetingUrl : undefined,
    partnerId: typeof body.partnerId === 'string' ? body.partnerId : undefined,
    topic: typeof body.topic === 'string' ? body.topic : undefined,
    language: typeof body.language === 'string' ? body.language : undefined,
    targetLanguage: typeof body.targetLanguage === 'string' ? body.targetLanguage : undefined,
    webRtcRoomId: typeof body.webRtcRoomId === 'string' ? body.webRtcRoomId : undefined,
    webRtcRoomType: typeof body.webRtcRoomType === 'string' ? body.webRtcRoomType : undefined,
    duration: typeof body.duration === 'number' ? body.duration : undefined,
    metadata: typeof body.metadata === 'object' && body.metadata !== null ? body.metadata : undefined
  };

  return payload;
}

sessionsRoutes.use('*', requireAuth);

sessionsRoutes.get('/', async (c) => {
  const { page, size } = getPaginationParams(c);
  const status = c.req.query('status') ?? undefined;
  const result = await listSessions(c.env, page, size, status);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

sessionsRoutes.post('/', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const payload = normalizeCreatePayload(body);
  const session = await createSession(c.env, userId, payload);
  return successResponse(c, session);
});

sessionsRoutes.post('/:sessionId/join', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const bookingMessage = typeof body?.bookingMessage === 'string' ? body.bookingMessage : undefined;
  const session = await joinSession(c.env, userId, sessionId, bookingMessage);
  return successResponse(c, session);
});

sessionsRoutes.post('/book', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  if (typeof body.sessionId !== 'number') {
    throw new AppError('sessionId is required', 400, 'INVALID_PAYLOAD');
  }
  const booking = await bookSession(c.env, userId, {
    sessionId: body.sessionId,
    bookingMessage: typeof body.bookingMessage === 'string' ? body.bookingMessage : undefined
  });
  return successResponse(c, booking);
});

sessionsRoutes.delete('/bookings/:bookingId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const bookingId = Number(c.req.param('bookingId'));
  if (!Number.isFinite(bookingId)) throw new AppError('Invalid bookingId', 400, 'INVALID_PATH_PARAM');
  const reason = c.req.query('reason') ?? undefined;
  await cancelBooking(c.env, userId, bookingId, reason);
  return successResponse(c, { success: true });
});

sessionsRoutes.get('/my-sessions', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const { page, size } = getPaginationParams(c);
  const result = await listUserSessions(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

sessionsRoutes.get('/public', async (c) => {
  const { page, size } = getPaginationParams(c);
  const result = await listPublicSessions(c.env, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

sessionsRoutes.get('/language/:languageCode', async (c) => {
  const { page, size } = getPaginationParams(c);
  const languageCode = c.req.param('languageCode');
  const result = await listSessionsByLanguage(c.env, languageCode, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

sessionsRoutes.get('/type/:sessionType', async (c) => {
  const { page, size } = getPaginationParams(c);
  const sessionType = c.req.param('sessionType');
  const result = await listSessionsByType(c.env, sessionType, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

sessionsRoutes.get('/available', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const { page, size } = getPaginationParams(c);
  const result = await listAvailableSessions(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

sessionsRoutes.get('/my-bookings', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const { page, size } = getPaginationParams(c);
  const result = await listUserBookings(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

sessionsRoutes.get('/history', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const { page, size } = getPaginationParams(c);
  const partnerId = c.req.query('partnerId') ?? undefined;
  const result = await listSessionHistory(c.env, userId, page, size, typeof partnerId === 'string' ? partnerId : undefined);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

sessionsRoutes.get('/stats', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const periodParam = (c.req.query('period') ?? 'month').toString().toLowerCase();
  const period = periodParam === 'week' || periodParam === 'year' ? periodParam : 'month';
  const stats = await getSessionStats(c.env, userId, period as 'week' | 'month' | 'year');
  return successResponse(c, stats);
});

sessionsRoutes.get('/upcoming', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const limitRaw = Number(c.req.query('limit') ?? '5');
  const limit = Math.max(1, Math.min(Number.isFinite(limitRaw) ? limitRaw : 5, 20));
  const sessions = await listUpcomingSessions(c.env, userId, limit);
  return successResponse(c, sessions);
});

sessionsRoutes.get('/calendar', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const start = c.req.query('startDate') ?? new Date().toISOString();
  const end = c.req.query('endDate') ?? addDaysIso(7);
  const calendar = await getUserCalendar(c.env, userId, start, end);
  return successResponse(c, calendar);
});

sessionsRoutes.get('/:sessionId/notifications', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const settings = await getSessionNotifications(c.env, sessionId, userId);
  return successResponse(c, settings);
});

sessionsRoutes.patch('/:sessionId/notifications', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const settings = await updateSessionNotifications(c.env, sessionId, userId, body as Partial<SessionNotificationSettings>);
  return successResponse(c, settings);
});

sessionsRoutes.post('/:sessionId/feedback', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({ }));
  const summary = await submitSessionFeedback(c.env, userId, sessionId, body ?? {});
  return successResponse(c, summary);
});

sessionsRoutes.patch('/:sessionId/reschedule', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const session = await rescheduleSession(c.env, userId, sessionId, {
    scheduledAt: typeof body?.scheduledAt === 'string' ? body.scheduledAt : undefined,
    duration: typeof body?.duration === 'number' ? body.duration : undefined,
    reason: typeof body?.reason === 'string' ? body.reason : undefined
  });
  return successResponse(c, session);
});

sessionsRoutes.post('/:sessionId/invite', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const expiresInHours = Number(body?.expiresInHours ?? 24);
  const invite = await generateSessionInvite(c.env, userId, sessionId, Number.isFinite(expiresInHours) ? expiresInHours : 24);
  return successResponse(c, invite);
});

sessionsRoutes.post('/invite/accept', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const token = typeof body?.token === 'string' ? body.token : '';
  if (!token) throw new AppError('Invite token is required', 400, 'INVALID_PAYLOAD');
  const session = await acceptSessionInvite(c.env, userId, token);
  return successResponse(c, session);
});

sessionsRoutes.post('/:sessionId/recording', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const status = await requestSessionRecording(c.env, userId, sessionId, body ?? {});
  return successResponse(c, status);
});

sessionsRoutes.post('/:sessionId/recording/stop', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const status = await stopSessionRecording(c.env, userId, sessionId);
  return successResponse(c, status);
});

sessionsRoutes.get('/:sessionId/recording', async (c) => {
  const sessionId = parseSessionId(c);
  const status = await getSessionRecording(c.env, sessionId);
  return successResponse(c, status);
});

sessionsRoutes.get('/:sessionId/participants', async (c) => {
  const sessionId = parseSessionId(c);
  const participants = await getSessionParticipants(c.env, sessionId);
  return successResponse(c, participants);
});

sessionsRoutes.get('/:sessionId/summary', async (c) => {
  const sessionId = parseSessionId(c);
  const summary = await getSessionSummary(c.env, sessionId);
  return successResponse(c, summary);
});

sessionsRoutes.get('/:sessionId/transcript', async (c) => {
  const sessionId = parseSessionId(c);
  const language = c.req.query('language') ?? 'default';
  const transcript = await getSessionTranscript(c.env, sessionId, typeof language === 'string' ? language : 'default');
  return successResponse(c, transcript);
});

sessionsRoutes.get('/:sessionId', async (c) => {
  const userId = c.get('userId');
  const sessionId = parseSessionId(c);
  const session = await getSessionById(c.env, sessionId, userId);
  return successResponse(c, session);
});

sessionsRoutes.post('/:sessionId/start', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  await startSession(c.env, userId, sessionId);
  return successResponse(c, { success: true });
});

sessionsRoutes.post('/:sessionId/end', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  await endSession(c.env, userId, sessionId, {
    duration: typeof body?.duration === 'number' ? body.duration : undefined,
    notes: typeof body?.notes === 'string' ? body.notes : undefined,
    rating: typeof body?.rating === 'number' ? body.rating : undefined
  });
  return successResponse(c, { success: true });
});

sessionsRoutes.post('/:sessionId/cancel', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const body = await c.req.json().catch(() => ({}));
  const reason = typeof body?.reason === 'string' ? body.reason : undefined;
  await cancelSession(c.env, userId, sessionId, reason);
  return successResponse(c, { success: true });
});

sessionsRoutes.delete('/:sessionId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const sessionId = parseSessionId(c);
  const reason = c.req.query('reason') ?? undefined;
  await cancelSession(c.env, userId, sessionId, typeof reason === 'string' ? reason : undefined);
  return successResponse(c, { success: true });
});

function addDaysIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export default sessionsRoutes;
