import type { Env } from '../index';
import type {
  NotificationRecord,
  NotificationListItem,
  NotificationPreferenceSettings,
  NotificationStats
} from '../types';
import { query, queryFirst, execute } from '../utils/db';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

interface ListOptions {
  page?: number;
  size?: number;
  category?: string;
  status?: string;
  unreadOnly?: boolean;
}

interface CreateNotificationPayload {
  userId: string;
  type: string;
  title: string;
  content: string;
  actionUrl?: string;
  actionData?: Record<string, any> | null;
  imageUrl?: string;
  iconUrl?: string;
  priority?: number;
  category?: string;
  scheduledAt?: string;
  expiresAt?: string;
  isPersistent?: boolean;
  senderUserId?: string;
  templateId?: string;
  templateVariables?: Record<string, any> | null;
  deliveryChannels?: string;
  status?: string;
  scheduleMetadata?: Record<string, any> | null;
}

interface NotificationRow {
  notification_id: number;
  user_id: string;
  type: string;
  title: string;
  content: string;
  action_url: string | null;
  action_data: string | null;
  image_url: string | null;
  icon_url: string | null;
  status: string;
  priority: number | null;
  category: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  is_persistent: number | null;
  sender_user_id: string | null;
  template_id: string | null;
  template_variables: string | null;
  delivery_channels: string | null;
  push_sent: number | null;
  email_sent: number | null;
  sms_sent: number | null;
  schedule_metadata: string | null;
}

interface PreferenceRow {
  preference_id?: number;
  user_id: string;
  notifications_enabled: number;
  push_enabled: number;
  email_enabled: number;
  sms_enabled: number;
  session_notifications: number;
  session_reminders: number;
  matching_notifications: number;
  chat_notifications: number;
  level_test_notifications: number;
  system_notifications: number;
  marketing_notifications: number;
  quiet_hours_enabled: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string | null;
  notification_language: string | null;
  digest_enabled: number;
  digest_frequency: string | null;
  digest_time: string | null;
  created_at: string;
  updated_at: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalizePageSize(size?: number): number {
  if (!size || Number.isNaN(size)) return DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.min(size, MAX_PAGE_SIZE));
}

function normalizePage(page?: number): number {
  if (!page || Number.isNaN(page) || page < 1) return 1;
  return page;
}

function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return null;
  }
}

function mapNotificationRow(row: NotificationRow): NotificationRecord {
  const expiresAt = row.expires_at ?? undefined;
  const priority = row.priority ?? 1;
  const expired = expiresAt ? new Date(expiresAt) < new Date() : undefined;
  const highPriority = priority >= 3;
  const scheduleMetadata = parseJson<Record<string, any>>(row.schedule_metadata);
  return {
    userId: row.user_id,
    notificationId: row.notification_id,
    type: row.type,
    title: row.title,
    content: row.content,
    actionUrl: row.action_url ?? undefined,
    actionData: parseJson<Record<string, any>>(row.action_data) ?? undefined,
    imageUrl: row.image_url ?? undefined,
    iconUrl: row.icon_url ?? undefined,
    status: row.status,
    priority,
    category: row.category ?? undefined,
    scheduledAt: row.scheduled_at ?? undefined,
    sentAt: row.sent_at ?? undefined,
    readAt: row.read_at ?? undefined,
    expiresAt,
    createdAt: row.created_at,
    isPersistent: Boolean(row.is_persistent ?? 1),
    senderUserId: row.sender_user_id ?? undefined,
    templateId: row.template_id ?? undefined,
    deliveryChannels: row.delivery_channels ?? undefined,
    pushSent: Boolean(row.push_sent ?? 0),
    emailSent: Boolean(row.email_sent ?? 0),
    smsSent: Boolean(row.sms_sent ?? 0),
    expired,
    highPriority,
    scheduleMetadata
  };
}

function toListItem(record: NotificationRecord): NotificationListItem {
  return {
    id: record.notificationId,
    type: record.type,
    category: record.category,
    title: record.title,
    message: record.content,
    content: record.content,
    isRead: record.status === 'READ',
    status: record.status,
    priority: record.priority,
    createdAt: record.createdAt,
    readAt: record.readAt,
    scheduledAt: record.scheduledAt,
    expiresAt: record.expiresAt,
    clickUrl: record.actionUrl,
    data: record.actionData ?? undefined,
    imageUrl: record.imageUrl,
    iconUrl: record.iconUrl,
    highPriority: record.highPriority,
    expired: record.expired
  };
}

function mapPreferenceRow(row: PreferenceRow): NotificationPreferenceSettings {
  return {
    notificationsEnabled: Boolean(row.notifications_enabled),
    pushEnabled: Boolean(row.push_enabled),
    emailEnabled: Boolean(row.email_enabled),
    smsEnabled: Boolean(row.sms_enabled),
    sessionNotifications: Boolean(row.session_notifications),
    sessionReminders: Boolean(row.session_reminders),
    matchingNotifications: Boolean(row.matching_notifications),
    chatNotifications: Boolean(row.chat_notifications),
    levelTestNotifications: Boolean(row.level_test_notifications),
    systemNotifications: Boolean(row.system_notifications),
    marketingNotifications: Boolean(row.marketing_notifications),
    quietHoursEnabled: Boolean(row.quiet_hours_enabled),
    quietHoursStart: row.quiet_hours_start ?? undefined,
    quietHoursEnd: row.quiet_hours_end ?? undefined,
    timezone: row.timezone ?? undefined,
    notificationLanguage: row.notification_language ?? undefined,
    digestEnabled: Boolean(row.digest_enabled),
    digestFrequency: row.digest_frequency ?? undefined,
    digestTime: row.digest_time ?? undefined
  };
}
type RecurringSchedule = {
  type: 'daily' | 'weekly' | 'monthly';
  interval?: number;
  endDate?: string;
  time?: string;
};

function parseRecurringSchedule(raw: unknown): RecurringSchedule | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const typeValue = typeof record.type === 'string' ? record.type.toLowerCase() : '';
  if (!['daily', 'weekly', 'monthly'].includes(typeValue)) {
    return null;
  }
  const intervalValue = record.interval !== undefined ? Number(record.interval) : undefined;
  const interval =
    Number.isFinite(intervalValue) && intervalValue !== undefined && intervalValue > 0
      ? Math.floor(intervalValue)
      : undefined;
  const endDate = typeof record.endDate === 'string' ? record.endDate : undefined;
  const time = typeof record.time === 'string' ? record.time : undefined;
  return {
    type: typeValue as RecurringSchedule['type'],
    interval,
    endDate,
    time,
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const currentDate = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months);
  while (result.getUTCDate() < currentDate) {
    result.setUTCDate(result.getUTCDate() - 1);
  }
  return result;
}

function applyTimeComponent(date: Date, metadata: RecurringSchedule, fallback: Date): void {
  const timeString = metadata.time;
  if (!timeString) {
    date.setUTCHours(
      fallback.getUTCHours(),
      fallback.getUTCMinutes(),
      fallback.getUTCSeconds(),
      fallback.getUTCMilliseconds()
    );
    return;
  }
  const match = timeString.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    date.setUTCHours(
      fallback.getUTCHours(),
      fallback.getUTCMinutes(),
      fallback.getUTCSeconds(),
      fallback.getUTCMilliseconds()
    );
    return;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] ? Number(match[3]) : 0;
  date.setUTCHours(hours, minutes, seconds, 0);
}

function computeNextScheduledAt(currentIso: string | null, metadata: RecurringSchedule, reference: Date): string | null {
  if (!currentIso) {
    return null;
  }
  const base = new Date(currentIso);
  if (Number.isNaN(base.getTime())) {
    return null;
  }

  const interval = Math.max(1, metadata.interval ?? 1);
  let next = new Date(base.getTime());

  const advance = () => {
    switch (metadata.type) {
      case 'daily':
        next = addDays(next, interval);
        break;
      case 'weekly':
        next = addDays(next, interval * 7);
        break;
      case 'monthly':
        next = addMonths(next, interval);
        break;
      default:
        next = addDays(next, interval);
        break;
    }
  };

  advance();
  applyTimeComponent(next, metadata, base);

  const endDate = metadata.endDate ? new Date(metadata.endDate) : null;

  while (next <= reference) {
    advance();
    applyTimeComponent(next, metadata, base);
    if (endDate && next > endDate) {
      return null;
    }
  }

  if (endDate && next > endDate) {
    return null;
  }

  return next.toISOString();
}
async function ensurePreference(env: Env, userId: string): Promise<PreferenceRow> {
  const existing = await queryFirst<PreferenceRow>(
    env.DB,
    'SELECT * FROM notification_preferences WHERE user_id = ? LIMIT 1',
    [userId]
  );

  if (existing) {
    return existing;
  }

  const now = nowIso();
  await execute(
    env.DB,
    `INSERT INTO notification_preferences (
        user_id,
        notifications_enabled,
        push_enabled,
        email_enabled,
        sms_enabled,
        session_notifications,
        session_reminders,
        matching_notifications,
        chat_notifications,
        level_test_notifications,
        system_notifications,
        marketing_notifications,
        quiet_hours_enabled,
        timezone,
        notification_language,
        digest_enabled,
        digest_frequency,
        digest_time,
        created_at,
        updated_at
      ) VALUES (?, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, NULL, 'ko', 0, 'DAILY', '09:00', ?, ?)
    `,
    [userId, now, now]
  );

  const inserted = await queryFirst<PreferenceRow>(
    env.DB,
    'SELECT * FROM notification_preferences WHERE user_id = ? LIMIT 1',
    [userId]
  );
  if (!inserted) {
    throw new Error('알림 설정을 초기화할 수 없습니다.');
  }
  return inserted;
}

async function listSubscriptionTopics(env: Env, userId: string): Promise<string[]> {
  const rows = await query<{ topic: string }>(
    env.DB,
    'SELECT topic FROM notification_topic_subscription WHERE user_id = ? ORDER BY topic',
    [userId]
  );
  return rows.map((row) => row.topic);
}

export async function createNotification(env: Env, payload: CreateNotificationPayload): Promise<NotificationRecord> {
  const now = nowIso();
  const actionData = payload.actionData ? JSON.stringify(payload.actionData) : null;
  const templateVariables = payload.templateVariables ? JSON.stringify(payload.templateVariables) : null;
  const scheduleMetadata = payload.scheduleMetadata ? JSON.stringify(payload.scheduleMetadata) : null;
  const status = payload.status ?? (payload.scheduledAt ? 'SCHEDULED' : 'UNREAD');

  await execute(
    env.DB,
    `INSERT INTO notifications (
        user_id,
        type,
        title,
        content,
        action_url,
        action_data,
        image_url,
        icon_url,
        status,
        priority,
        category,
        scheduled_at,
        sent_at,
        read_at,
        expires_at,
        is_persistent,
        sender_user_id,
        template_id,
        template_variables,
        schedule_metadata,
        delivery_channels,
        push_sent,
        email_sent,
        sms_sent,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?)
    `,
    [
      payload.userId,
      payload.type,
      payload.title,
      payload.content,
      payload.actionUrl ?? null,
      actionData,
      payload.imageUrl ?? null,
      payload.iconUrl ?? null,
      status,
      payload.priority ?? 1,
      payload.category ?? null,
      payload.scheduledAt ?? null,
      payload.expiresAt ?? null,
      payload.isPersistent === false ? 0 : 1,
      payload.senderUserId ?? null,
      payload.templateId ?? null,
      templateVariables,
      scheduleMetadata,
      payload.deliveryChannels ?? null,
      now,
      now
    ]
  );

  const row = await queryFirst<NotificationRow>(
    env.DB,
    'SELECT last_insert_rowid() as id'
  );

  const notificationId = Number((row as any)?.id ?? 0);
  if (!notificationId) {
    throw new Error('알림 생성 결과를 확인할 수 없습니다.');
  }

  return getNotificationById(env, notificationId);
}

export async function getNotificationById(env: Env, notificationId: number): Promise<NotificationRecord> {
  const row = await queryFirst<NotificationRow>(
    env.DB,
    'SELECT * FROM notifications WHERE notification_id = ? LIMIT 1',
    [notificationId]
  );
  if (!row) {
    throw new Error('알림을 찾을 수 없습니다.');
  }
  return mapNotificationRow(row);
}

export async function listNotifications(
  env: Env,
  userId: string,
  options: ListOptions = {}
): Promise<{ data: NotificationListItem[]; page: number; size: number; total: number; unreadCount: number }> {
  const page = normalizePage(options.page);
  const size = normalizePageSize(options.size);
  const offset = (page - 1) * size;

  const where: string[] = ['user_id = ?'];
  const params: (string | number)[] = [userId];

  if (options.category) {
    where.push('UPPER(category) = UPPER(?)');
    params.push(options.category);
  }

  if (options.unreadOnly) {
    where.push("status = 'UNREAD'");
  } else if (options.status) {
    where.push('status = ?');
    params.push(options.status);
  }

  const whereClause = `WHERE ${where.join(' AND ')}`;

  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM notifications ${whereClause}`,
    params
  );

  const rows = await query<NotificationRow>(
    env.DB,
    `SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
    [...params, size, offset]
  );

  const records = rows.map(mapNotificationRow);
  const unreadCount = await getUnreadCount(env, userId);

  return {
    data: records.map(toListItem),
    page,
    size,
    total: totalRow?.count ?? 0,
    unreadCount
  };
}

export async function getUnreadCount(env: Env, userId: string): Promise<number> {
  const row = await queryFirst<{ count: number }>(
    env.DB,
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND status = 'UNREAD'",
    [userId]
  );
  return row?.count ?? 0;
}

export async function markAsRead(env: Env, userId: string, notificationId: number) {
  const record = await getNotificationById(env, notificationId);
  if (record.userId !== userId) {
    throw new Error('알림을 읽음으로 표시할 권한이 없습니다.');
  }
  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE notifications
        SET status = 'READ', read_at = ?, updated_at = ?
      WHERE notification_id = ?`,
    [now, now, notificationId]
  );
}

export async function markAllAsRead(env: Env, userId: string) {
  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE notifications SET status = 'READ', read_at = ?, updated_at = ?
      WHERE user_id = ? AND status = 'UNREAD'`,
    [now, now, userId]
  );
}

export async function markCategoryAsRead(env: Env, userId: string, category: string) {
  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE notifications SET status = 'READ', read_at = ?, updated_at = ?
      WHERE user_id = ? AND category = ? AND status = 'UNREAD'`,
    [now, now, userId, category]
  );
}

export async function deleteNotification(env: Env, userId: string, notificationId: number) {
  await execute(
    env.DB,
    'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
    [notificationId, userId]
  );
}

export async function deleteAllNotifications(env: Env, userId: string) {
  await execute(env.DB, 'DELETE FROM notifications WHERE user_id = ?', [userId]);
}

export async function deleteNotificationsBatch(env: Env, userId: string, notificationIds: number[]): Promise<void> {
  const ids = notificationIds.filter((id) => Number.isFinite(id));
  if (!ids.length) {
    return;
  }
  const placeholders = ids.map(() => '?').join(', ');
  await execute(
    env.DB,
    `DELETE FROM notifications WHERE user_id = ? AND notification_id IN (${placeholders})`,
    [userId, ...ids]
  );
}

export async function cancelScheduledNotification(env: Env, userId: string, notificationId: number): Promise<boolean> {
  const row = await queryFirst<NotificationRow>(
    env.DB,
    'SELECT * FROM notifications WHERE notification_id = ? AND user_id = ? LIMIT 1',
    [notificationId, userId]
  );
  if (!row) {
    return false;
  }
  if (row.status !== 'SCHEDULED') {
    await deleteNotification(env, userId, notificationId);
    return true;
  }

  await execute(
    env.DB,
    "UPDATE notifications SET status = 'CANCELLED', updated_at = ?, schedule_metadata = NULL WHERE notification_id = ?",
    [nowIso(), notificationId]
  );
  return true;
}

export async function listNotificationCategories(env: Env, userId: string): Promise<Array<{ category: string; total: number; unread: number }>> {
  const rows = await query<{ category: string | null; total: number; unread: number }>(
    env.DB,
    `SELECT
        COALESCE(category, 'general') AS category,
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'UNREAD' THEN 1 ELSE 0 END) AS unread
      FROM notifications
      WHERE user_id = ?
      GROUP BY COALESCE(category, 'general')
      ORDER BY category`,
    [userId]
  );

  return rows.map((row) => ({
    category: row.category ?? 'general',
    total: Number(row.total ?? 0),
    unread: Number(row.unread ?? 0)
  }));
}

export async function listScheduledNotifications(
  env: Env,
  userId: string,
  page: number,
  size: number
): Promise<{ data: NotificationRecord[]; page: number; size: number; total: number }> {
  const normalizedPage = normalizePage(page);
  const normalizedSize = normalizePageSize(size);
  const offset = (normalizedPage - 1) * normalizedSize;

  const whereClause = `WHERE user_id = ? AND (status = 'SCHEDULED' OR (scheduled_at IS NOT NULL AND datetime(scheduled_at) >= datetime('now'))) `;
  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) AS count FROM notifications ${whereClause}`,
    [userId]
  );

  const rows = await query<NotificationRow>(
    env.DB,
    `SELECT * FROM notifications
      ${whereClause}
      ORDER BY scheduled_at ASC, created_at DESC
      LIMIT ? OFFSET ?`,
    [userId, normalizedSize, offset]
  );

  return {
    data: rows.map(mapNotificationRow),
    page: normalizedPage,
    size: normalizedSize,
    total: totalRow ? Number(totalRow.count ?? 0) : 0
  };
}

export async function subscribeToNotificationTopics(env: Env, userId: string, topics: string[]): Promise<string[]> {
  const normalized = topics
    .map((topic) => String(topic).trim().toLowerCase())
    .filter((topic) => topic.length > 0);

  if (!normalized.length) {
    return listSubscriptionTopics(env, userId);
  }

  const now = nowIso();
  for (const topic of new Set(normalized)) {
    await execute(
      env.DB,
      `INSERT INTO notification_topic_subscription (user_id, topic, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, topic) DO UPDATE SET updated_at = excluded.updated_at`,
      [userId, topic, now, now]
    );
  }

  return listSubscriptionTopics(env, userId);
}

export async function unsubscribeFromNotificationTopics(env: Env, userId: string, topics: string[]): Promise<string[]> {
  const normalized = topics
    .map((topic) => String(topic).trim().toLowerCase())
    .filter((topic) => topic.length > 0);

  if (!normalized.length) {
    return listSubscriptionTopics(env, userId);
  }

  const placeholders = normalized.map(() => '?').join(', ');
  await execute(
    env.DB,
    `DELETE FROM notification_topic_subscription WHERE user_id = ? AND topic IN (${placeholders})`,
    [userId, ...normalized]
  );

  return listSubscriptionTopics(env, userId);
}

export async function scheduleNotification(
  env: Env,
  userId: string,
  payload: {
    title: string;
    message: string;
    type?: string;
    data?: Record<string, any>;
    scheduledAt: string;
    recurring?: Record<string, any> | null;
    priority?: number;
    category?: string;
    deliveryChannels?: string;
  }
): Promise<NotificationRecord> {
  return createNotification(env, {
    userId,
    type: payload.type ?? 'SCHEDULED',
    title: payload.title,
    content: payload.message,
    actionData: payload.data ?? null,
    scheduledAt: payload.scheduledAt,
    status: 'SCHEDULED',
    scheduleMetadata: payload.recurring ?? null,
    priority: payload.priority ?? 2,
    category: payload.category ?? 'scheduled',
    deliveryChannels: payload.deliveryChannels ?? undefined
  });
}

export async function sendTestNotification(env: Env, userId: string, type: string | null): Promise<NotificationRecord> {
  return createNotification(env, {
    userId,
    type: type ?? 'TEST',
    title: '테스트 알림',
    content: '테스트 알림입니다.',
    category: 'test',
    priority: 1
  });
}

export async function sendUrgentNotifications(
  env: Env,
  initiatorUserId: string,
  recipients: string[],
  payload: {
    title: string;
    message: string;
    type?: string;
    expiresAt?: string;
    priority?: number;
    category?: string;
    data?: Record<string, any>;
  }
): Promise<{ delivered: number }>
{
  const normalized = recipients
    .map((id) => String(id).trim())
    .filter((id) => id.length > 0);

  let targetIds: string[] = [];
  const hasAll = normalized.some((id) => id.toLowerCase() === 'all');
  if (hasAll) {
    const rows = await query<{ user_id: string }>(
      env.DB,
      'SELECT user_id FROM users ORDER BY created_at DESC LIMIT 200'
    );
    targetIds = rows.map((row) => row.user_id);
  } else {
    targetIds = Array.from(new Set(normalized.filter((id) => id.toLowerCase() !== 'all')));
  }

  if (!targetIds.length) {
    return { delivered: 0 };
  }

  const jobs = targetIds.map((targetId) =>
    createNotification(env, {
      userId: targetId,
      type: payload.type ?? 'URGENT',
      title: payload.title,
      content: payload.message,
      actionData: payload.data ?? null,
      expiresAt: payload.expiresAt ?? undefined,
      priority: payload.priority ?? 3,
      category: payload.category ?? 'urgent',
      senderUserId: initiatorUserId
    }).catch((error) => {
      console.error('[notifications] failed to send urgent notification', error);
      return null;
    })
  );

  const results = await Promise.all(jobs);
  const delivered = results.filter((record) => record !== null).length;
  return { delivered };
}

export async function processScheduledNotifications(env: Env, limit = 100): Promise<number> {
  const nowIsoStr = nowIso();
  const reference = new Date(nowIsoStr);
  const rows = await query<NotificationRow>(
    env.DB,
    "SELECT * FROM notifications WHERE status = 'SCHEDULED' AND scheduled_at IS NOT NULL AND datetime(scheduled_at) <= datetime(?) LIMIT ?",
    [nowIsoStr, limit]
  );

  let processed = 0;

  for (const row of rows) {
    try {
      await execute(
        env.DB,
        "UPDATE notifications SET status = 'UNREAD', sent_at = ?, updated_at = ?, schedule_metadata = NULL WHERE notification_id = ?",
        [nowIsoStr, nowIsoStr, row.notification_id]
      );
      processed += 1;

      const metadata = parseRecurringSchedule(parseJson<Record<string, unknown>>(row.schedule_metadata));
      if (metadata) {
        const nextScheduledAt = computeNextScheduledAt(row.scheduled_at ?? row.created_at, metadata, reference);
        if (nextScheduledAt) {
          const actionData = parseJson<Record<string, any>>(row.action_data);
          const templateVariables = parseJson<Record<string, any>>(row.template_variables);
          await createNotification(env, {
            userId: row.user_id,
            type: row.type,
            title: row.title,
            content: row.content,
            actionUrl: row.action_url ?? undefined,
            actionData: actionData ?? null,
            imageUrl: row.image_url ?? undefined,
            iconUrl: row.icon_url ?? undefined,
            priority: row.priority ?? undefined,
            category: row.category ?? undefined,
            scheduledAt: nextScheduledAt,
            status: 'SCHEDULED',
            scheduleMetadata: metadata,
            isPersistent: row.is_persistent !== null ? Boolean(row.is_persistent) : undefined,
            senderUserId: row.sender_user_id ?? undefined,
            templateId: row.template_id ?? undefined,
            templateVariables: templateVariables ?? null,
            deliveryChannels: row.delivery_channels ?? undefined,
          });
        }
      }
    } catch (error) {
      console.error('[notifications] failed to process scheduled notification', error);
    }
  }

  return processed;
}

export async function getNotificationPreferences(env: Env, userId: string): Promise<NotificationPreferenceSettings> {
  const row = await ensurePreference(env, userId);
  const base = mapPreferenceRow(row);
  const subscriptionTopics = await listSubscriptionTopics(env, userId);
  return {
    ...base,
    subscriptionTopics
  };
}

export async function updateNotificationPreferences(
  env: Env,
  userId: string,
  settings: Partial<NotificationPreferenceSettings>
): Promise<NotificationPreferenceSettings> {
  await ensurePreference(env, userId);
  const now = nowIso();
  const setClauses: string[] = [];
  const params: (string | number)[] = [];

  const booleanFields: Array<keyof NotificationPreferenceSettings> = [
    'notificationsEnabled',
    'pushEnabled',
    'emailEnabled',
    'smsEnabled',
    'sessionNotifications',
    'sessionReminders',
    'matchingNotifications',
    'chatNotifications',
    'levelTestNotifications',
    'systemNotifications',
    'marketingNotifications',
    'quietHoursEnabled',
    'digestEnabled'
  ];

  for (const field of booleanFields) {
    if (settings[field] !== undefined) {
      const column = field.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
      setClauses.push(`${column} = ?`);
      params.push(settings[field] ? 1 : 0);
    }
  }

  if (settings.quietHoursStart !== undefined) {
    setClauses.push('quiet_hours_start = ?');
    params.push(settings.quietHoursStart ?? null);
  }
  if (settings.quietHoursEnd !== undefined) {
    setClauses.push('quiet_hours_end = ?');
    params.push(settings.quietHoursEnd ?? null);
  }
  if (settings.timezone !== undefined) {
    setClauses.push('timezone = ?');
    params.push(settings.timezone ?? null);
  }
  if (settings.notificationLanguage !== undefined) {
    setClauses.push('notification_language = ?');
    params.push(settings.notificationLanguage ?? null);
  }
  if (settings.digestFrequency !== undefined) {
    setClauses.push('digest_frequency = ?');
    params.push(settings.digestFrequency ?? null);
  }
  if (settings.digestTime !== undefined) {
    setClauses.push('digest_time = ?');
    params.push(settings.digestTime ?? null);
  }

  if (setClauses.length > 0) {
    setClauses.push('updated_at = ?');
    params.push(now, userId);
    await execute(
      env.DB,
      `UPDATE notification_preferences SET ${setClauses.join(', ')} WHERE user_id = ?`,
      params
    );
  }

  return getNotificationPreferences(env, userId);
}

export async function getNotificationStats(env: Env, userId: string): Promise<NotificationStats> {
  const totals = await queryFirst<{ total: number; unread: number; read: number }>(
    env.DB,
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status = 'UNREAD' THEN 1 ELSE 0 END) AS unread,
            SUM(CASE WHEN status = 'READ' THEN 1 ELSE 0 END) AS read
       FROM notifications
      WHERE user_id = ?`,
    [userId]
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND substr(created_at, 1, 10) = ?`,
    [userId, todayKey]
  );

  const categoryRows = await query<{ category: string | null; cnt: number }>(
    env.DB,
    `SELECT COALESCE(category, 'UNCATEGORIZED') as category, COUNT(*) as cnt
       FROM notifications
      WHERE user_id = ?
      GROUP BY COALESCE(category, 'UNCATEGORIZED')`,
    [userId]
  );

  const categories: Record<string, number> = {};
  for (const row of categoryRows) {
    categories[row.category ?? 'UNCATEGORIZED'] = row.cnt;
  }

  return {
    total: totals?.total ?? 0,
    unread: totals?.unread ?? 0,
    read: totals?.read ?? 0,
    today: todayRow?.count ?? 0,
    categories
  };
}

export async function registerPushToken(env: Env, userId: string, token: string, deviceType?: string) {
  const now = nowIso();
  await execute(
    env.DB,
    `INSERT INTO notification_push_tokens (user_id, token, device_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(token) DO UPDATE SET updated_at = excluded.updated_at, user_id = excluded.user_id, device_type = excluded.device_type`,
    [userId, token, deviceType ?? 'web', now, now]
  );
}

export async function unregisterPushToken(env: Env, userId: string, token: string) {
  await execute(
    env.DB,
    'DELETE FROM notification_push_tokens WHERE token = ? AND user_id = ?',
    [token, userId]
  );
}

export async function createNotificationFromTemplate(
  env: Env,
  userId: string,
  templateId: string,
  variables: Record<string, any> | undefined,
  options: Partial<CreateNotificationPayload> = {}
) {
  const title = options.title ?? `Template ${templateId}`;
  const content = options.content ?? '알림이 도착했습니다.';
  return createNotification(env, {
    userId,
    type: options.type ?? 'SYSTEM',
    title,
    content,
    templateId,
    templateVariables: variables ?? null,
    ...options
  });
}

/**
 * 학습 리마인더 알림 생성
 * 매일 특정 시간에 사용자에게 학습 리마인더 전송
 */
export async function createStudyReminderNotifications(env: Env): Promise<number> {
  try {
    // 활성 사용자 중 오늘 학습하지 않은 사용자 조회
    const users = await query<{ user_id: string; name: string; english_name: string | null }>(
      env.DB,
      `SELECT u.user_id, u.name, u.english_name
       FROM users u
       WHERE u.is_active = 1
         AND u.user_id NOT IN (
           SELECT DISTINCT gsp.user_id
           FROM group_session_participants gsp
           JOIN group_sessions gs ON gs.session_id = gsp.session_id
           WHERE DATE(gs.started_at) = DATE('now')
             AND gsp.status = 'JOINED'
         )
       LIMIT 1000`
    );

    let count = 0;
    for (const user of users) {
      const userName = user.english_name || user.name || '사용자';
      try {
        await createNotification(env, {
          userId: user.user_id,
          type: 'STUDY_REMINDER',
          title: '📚 학습 리마인더',
          content: `${userName}님, 오늘 아직 학습하지 않으셨어요! 지금 시작해보는 건 어떨까요?`,
          category: 'reminder',
          priority: 1,
          actionUrl: '/group-sessions',
          actionData: {
            reminderType: 'daily_study'
          }
        });
        count++;
      } catch (error) {
        console.error(`Failed to create STUDY_REMINDER for user ${user.user_id}:`, error);
      }
    }

    return count;
  } catch (error) {
    console.error('Failed to create study reminder notifications:', error);
    return 0;
  }
}

/**
 * 목표 진행률 알림 생성
 * 주간/월간 목표 달성률에 따라 알림 전송
 */
export async function createGoalProgressNotifications(env: Env): Promise<number> {
  try {
    // 사용자별 이번 주 세션 수 조회
    const userProgress = await query<{
      user_id: string;
      name: string;
      english_name: string | null;
      session_count: number;
    }>(
      env.DB,
      `SELECT u.user_id, u.name, u.english_name, COUNT(gsp.participant_id) as session_count
       FROM users u
       LEFT JOIN group_session_participants gsp ON gsp.user_id = u.user_id
       LEFT JOIN group_sessions gs ON gs.session_id = gsp.session_id
       WHERE u.is_active = 1
         AND (gs.started_at IS NULL OR DATE(gs.started_at) >= DATE('now', '-7 days'))
         AND (gsp.status IS NULL OR gsp.status = 'JOINED')
       GROUP BY u.user_id, u.name, u.english_name
       HAVING session_count > 0 AND session_count < 10
       LIMIT 1000`
    );

    let count = 0;
    const weeklyGoal = 5; // 주간 목표: 5회 세션

    for (const progress of userProgress) {
      const userName = progress.english_name || progress.name || '사용자';
      const sessionsCompleted = Number(progress.session_count);
      const progressPercent = Math.round((sessionsCompleted / weeklyGoal) * 100);

      let message = '';
      let priority = 1;

      if (progressPercent >= 80) {
        message = `${userName}님, 이번 주 목표를 거의 달성했어요! 🎉 (${sessionsCompleted}/${weeklyGoal} 완료)`;
        priority = 2;
      } else if (progressPercent >= 50) {
        message = `${userName}님, 이번 주 목표의 절반을 달성했어요! 💪 (${sessionsCompleted}/${weeklyGoal} 완료)`;
      } else {
        message = `${userName}님, 이번 주 목표 달성을 위해 조금만 더 노력해볼까요? 📈 (${sessionsCompleted}/${weeklyGoal} 완료)`;
      }

      try {
        await createNotification(env, {
          userId: progress.user_id,
          type: 'GOAL_PROGRESS',
          title: '🎯 주간 목표 진행률',
          content: message,
          category: 'goal',
          priority,
          actionUrl: '/achievements',
          actionData: {
            goalType: 'weekly',
            currentProgress: sessionsCompleted,
            targetGoal: weeklyGoal,
            progressPercent
          }
        });
        count++;
      } catch (error) {
        console.error(`Failed to create GOAL_PROGRESS for user ${progress.user_id}:`, error);
      }
    }

    return count;
  } catch (error) {
    console.error('Failed to create goal progress notifications:', error);
    return 0;
  }
}
