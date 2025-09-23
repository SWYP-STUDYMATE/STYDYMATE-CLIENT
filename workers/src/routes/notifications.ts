import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';
import {
  createNotification,
  createNotificationFromTemplate,
  listNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  deleteNotificationsBatch,
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotificationStats,
  getUnreadCount,
  registerPushToken,
  unregisterPushToken,
  listNotificationCategories,
  listScheduledNotifications,
  subscribeToNotificationTopics,
  unsubscribeFromNotificationTopics,
  scheduleNotification,
  sendTestNotification,
  sendUrgentNotifications,
  cancelScheduledNotification
} from '../services/notifications';

const notificationsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
const requireAuth = authMiddleware();

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const lowered = value.toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(lowered)) return true;
  if (['false', '0', 'no', 'n'].includes(lowered)) return false;
  return undefined;
}

notificationsRoutes.use('*', requireAuth);

notificationsRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const page = Number(c.req.query('page')) || 1;
  const size = Number(c.req.query('size')) || 20;
  const unreadOnly = parseBoolean(c.req.query('unreadOnly')) ?? undefined;
  const isRead = parseBoolean(c.req.query('isRead'));

  let status: string | undefined;
  if (isRead === true) status = 'READ';
  else if (isRead === false) status = 'UNREAD';

  const result = await listNotifications(c.env, userId, {
    page,
    size,
    category: c.req.query('category') ?? c.req.query('type') ?? undefined,
    status,
    unreadOnly
  });

  return successResponse(c, {
    notifications: result.data,
    unreadCount: result.unreadCount,
    pagination: {
      page: result.page,
      size: result.size,
      total: result.total,
      totalPages: Math.ceil(result.total / result.size)
    }
  });
});

notificationsRoutes.get('/unread', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const result = await listNotifications(c.env, userId, { page: 1, size: 50, unreadOnly: true });
  return successResponse(c, { notifications: result.data, unreadCount: result.unreadCount });
});

notificationsRoutes.get('/unread-count', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const count = await getUnreadCount(c.env, userId);
  return successResponse(c, { unreadCount: count });
});

notificationsRoutes.get('/categories', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const categories = await listNotificationCategories(c.env, userId);
  return successResponse(c, categories);
});

notificationsRoutes.get('/history', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const page = Math.max(Number(c.req.query('page') ?? '1'), 1);
  const size = Math.max(Math.min(Number(c.req.query('size') ?? '20'), 100), 1);
  const category = c.req.query('category') ?? undefined;
  const status = c.req.query('status') ?? undefined;
  const unreadOnlyParam = c.req.query('unreadOnly');
  const unreadOnly = typeof unreadOnlyParam === 'string'
    ? ['true', '1'].includes(unreadOnlyParam.toLowerCase())
    : false;
  const result = await listNotifications(c.env, userId, {
    page,
    size,
    category,
    status,
    unreadOnly
  });
  return successResponse(c, result);
});

notificationsRoutes.get('/scheduled', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const page = Math.max(Number(c.req.query('page') ?? '1'), 1);
  const size = Math.max(Math.min(Number(c.req.query('size') ?? '20'), 100), 1);
  const result = await listScheduledNotifications(c.env, userId, page, size);
  return successResponse(c, result);
});

notificationsRoutes.get('/category/:category', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const category = c.req.param('category');
  const page = Number(c.req.query('page')) || 1;
  const size = Number(c.req.query('size')) || 20;
  const result = await listNotifications(c.env, userId, { page, size, category });
  return successResponse(c, {
    notifications: result.data,
    pagination: {
      page: result.page,
      size: result.size,
      total: result.total,
      totalPages: Math.ceil(result.total / result.size)
    }
  });
});

notificationsRoutes.get('/:notificationId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const notificationId = Number(c.req.param('notificationId'));
  if (!Number.isFinite(notificationId)) throw new AppError('Invalid notificationId', 400, 'INVALID_PATH_PARAM');
  const record = await getNotificationById(c.env, notificationId);
  if (record && record.notificationId && record.notificationId !== notificationId) {
    throw new AppError('알림을 찾을 수 없습니다.', 404, 'NOTIFICATION_NOT_FOUND');
  }
  if (record && record.userId !== userId) {
    throw new AppError('접근 권한이 없습니다.', 403, 'NOTIFICATION_FORBIDDEN');
  }
  return successResponse(c, record);
});

notificationsRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const userId = typeof body.userId === 'string' ? body.userId : c.get('userId');
  if (!userId) throw new AppError('userId is required', 400, 'INVALID_PAYLOAD');
  if (!body.title || !body.content || !body.type) {
    throw new AppError('type, title, content are required', 400, 'INVALID_PAYLOAD');
  }
  const record = await createNotification(c.env, {
    userId,
    type: body.type,
    title: body.title,
    content: body.content,
    actionUrl: body.actionUrl,
    actionData: body.actionData,
    imageUrl: body.imageUrl,
    iconUrl: body.iconUrl,
    priority: body.priority,
    category: body.category,
    scheduledAt: body.scheduledAt,
    expiresAt: body.expiresAt,
    isPersistent: body.isPersistent,
    senderUserId: body.senderUserId,
    templateId: body.templateId,
    templateVariables: body.templateVariables,
    deliveryChannels: body.deliveryChannels
  });
  return successResponse(c, record);
});

notificationsRoutes.post('/schedule', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const notification = (body as any).notification ?? body;
  const scheduledAt = typeof (body as any).scheduledAt === 'string'
    ? (body as any).scheduledAt
    : typeof notification?.scheduledAt === 'string'
      ? notification.scheduledAt
      : undefined;
  if (!scheduledAt) {
    throw new AppError('scheduledAt is required', 400, 'INVALID_PAYLOAD');
  }
  const record = await scheduleNotification(c.env, userId, {
    title: notification?.title ?? 'Scheduled Notification',
    message: notification?.message ?? notification?.content ?? '알림 내용이 없습니다.',
    type: notification?.type ?? 'SCHEDULED',
    data: notification?.data ?? notification?.actionData ?? null,
    scheduledAt,
    recurring: notification?.recurring ?? (body as any).recurring ?? null,
    priority: notification?.priority,
    category: notification?.category ?? 'scheduled',
    deliveryChannels: notification?.deliveryChannels ?? undefined
  });
  return successResponse(c, record);
});

notificationsRoutes.post('/subscribe', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const topics = Array.isArray((body as any).topics) ? (body as any).topics : [];
  const updated = await subscribeToNotificationTopics(c.env, userId, topics);
  return successResponse(c, { topics: updated });
});

notificationsRoutes.post('/unsubscribe', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const topics = Array.isArray((body as any).topics) ? (body as any).topics : [];
  const updated = await unsubscribeFromNotificationTopics(c.env, userId, topics);
  return successResponse(c, { topics: updated });
});

notificationsRoutes.post('/template/:templateId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const templateId = c.req.param('templateId');
  const body = await c.req.json().catch(() => ({}));
  const record = await createNotificationFromTemplate(c.env, userId, templateId, body.variables, {
    type: body.type,
    title: body.title,
    content: body.content,
    actionUrl: body.actionUrl,
    actionData: body.actionData
  });
  return successResponse(c, record);
});

notificationsRoutes.post('/test', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const record = await sendTestNotification(c.env, userId, typeof (body as any).type === 'string' ? (body as any).type : null);
  return successResponse(c, record);
});

notificationsRoutes.post('/urgent', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const notification = (body as any).notification ?? body;
  const recipients = Array.isArray((body as any).recipients) ? (body as any).recipients : [];
  const result = await sendUrgentNotifications(c.env, userId, recipients, {
    title: notification?.title ?? '긴급 알림',
    message: notification?.message ?? notification?.content ?? '',
    type: notification?.type ?? 'URGENT',
    expiresAt: notification?.expiresAt ?? undefined,
    priority: notification?.priority ?? 4,
    category: notification?.category ?? 'urgent',
    data: notification?.data ?? notification?.actionData ?? null
  });
  return successResponse(c, result);
});

notificationsRoutes.patch('/:notificationId/read', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const notificationId = Number(c.req.param('notificationId'));
  if (!Number.isFinite(notificationId)) throw new AppError('Invalid notificationId', 400, 'INVALID_PATH_PARAM');
  await markAsRead(c.env, userId, notificationId);
  return successResponse(c, { success: true });
});

notificationsRoutes.patch('/read-all', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  await markAllAsRead(c.env, userId);
  return successResponse(c, { success: true });
});

notificationsRoutes.delete('/batch', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const rawIds: unknown[] = Array.isArray((body as any).notificationIds)
    ? (body as any).notificationIds
    : Array.isArray((body as any).ids)
      ? (body as any).ids
      : Array.isArray(body)
        ? body
        : [];
  const ids = rawIds
    .map((value): number => Number(value))
    .filter((id): id is number => Number.isFinite(id));
  await deleteNotificationsBatch(c.env, userId, ids);
  return successResponse(c, { success: true });
});

notificationsRoutes.delete('/scheduled/:notificationId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const notificationId = Number(c.req.param('notificationId'));
  if (!Number.isFinite(notificationId)) {
    throw new AppError('Invalid notificationId', 400, 'INVALID_PATH_PARAM');
  }
  const cancelled = await cancelScheduledNotification(c.env, userId, notificationId);
  if (!cancelled) {
    throw new AppError('예약 알림을 찾을 수 없습니다.', 404, 'SCHEDULED_NOTIFICATION_NOT_FOUND');
  }
  return successResponse(c, { success: true });
});

notificationsRoutes.delete('/:notificationId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const notificationId = Number(c.req.param('notificationId'));
  if (!Number.isFinite(notificationId)) throw new AppError('Invalid notificationId', 400, 'INVALID_PATH_PARAM');
  await deleteNotification(c.env, userId, notificationId);
  return successResponse(c, { success: true });
});

notificationsRoutes.delete('/all', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  await deleteAllNotifications(c.env, userId);
  return successResponse(c, { success: true });
});

notificationsRoutes.get('/settings', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const prefs = await getNotificationPreferences(c.env, userId);
  return successResponse(c, prefs);
});

function mapNotificationSettingsPayload(body: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const booleanMap: Array<[string, string]> = [
    ['notificationsEnabled', 'notificationsEnabled'],
    ['notificationsEnabled', 'notifications'],
    ['pushEnabled', 'pushEnabled'],
    ['pushEnabled', 'pushNotifications'],
    ['emailEnabled', 'emailEnabled'],
    ['emailEnabled', 'emailNotifications'],
    ['smsEnabled', 'smsEnabled'],
    ['smsEnabled', 'smsNotifications'],
    ['sessionNotifications', 'sessionNotifications'],
    ['sessionReminders', 'sessionReminderNotifications'],
    ['matchingNotifications', 'matchRequestNotifications'],
    ['chatNotifications', 'chatMessageNotifications'],
    ['systemNotifications', 'systemNotifications'],
    ['marketingNotifications', 'marketingNotifications'],
    ['quietHoursEnabled', 'quietHoursEnabled'],
    ['digestEnabled', 'digestEnabled']
  ];

  for (const [targetKey, sourceKey] of booleanMap) {
    if (Object.prototype.hasOwnProperty.call(body, sourceKey)) {
      payload[targetKey] = Boolean((body as any)[sourceKey]);
    }
  }

  if (typeof body.quietHours === 'object' && body.quietHours !== null) {
    const quiet = body.quietHours as { start?: string; end?: string };
    if (quiet.start !== undefined) payload.quietHoursStart = quiet.start ?? null;
    if (quiet.end !== undefined) payload.quietHoursEnd = quiet.end ?? null;
  }

  if (body.quietHoursStart !== undefined) payload.quietHoursStart = body.quietHoursStart ?? null;
  if (body.quietHoursEnd !== undefined) payload.quietHoursEnd = body.quietHoursEnd ?? null;

  if (body.notificationSound !== undefined) payload.notificationSound = body.notificationSound ?? null;
  if (body.timezone !== undefined) payload.timezone = body.timezone ?? null;
  if (body.notificationLanguage !== undefined) payload.notificationLanguage = body.notificationLanguage ?? null;
  if (body.digestFrequency !== undefined) payload.digestFrequency = body.digestFrequency ?? null;
  if (body.digestTime !== undefined) payload.digestTime = body.digestTime ?? null;

  return payload;
}

notificationsRoutes.patch('/settings', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const payload = mapNotificationSettingsPayload(body as Record<string, unknown>);
  const prefs = await updateNotificationPreferences(c.env, userId, payload);
  return successResponse(c, prefs);
});

notificationsRoutes.get('/stats', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const stats = await getNotificationStats(c.env, userId);
  return successResponse(c, stats);
});

notificationsRoutes.post('/push-token', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const token = c.req.query('token') ?? body.token;
  if (!token || typeof token !== 'string') {
    throw new AppError('token is required', 400, 'INVALID_PAYLOAD');
  }
  const deviceType = (c.req.query('deviceType') ?? body.deviceType ?? 'web') as string;
  await registerPushToken(c.env, userId, token, deviceType);
  return successResponse(c, { success: true });
});

notificationsRoutes.delete('/push-token', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const token = c.req.query('token') ?? body.token;
  if (!token || typeof token !== 'string') {
    throw new AppError('token is required', 400, 'INVALID_PAYLOAD');
  }
  await unregisterPushToken(c.env, userId, token);
  return successResponse(c, { success: true });
});

export default notificationsRoutes;
