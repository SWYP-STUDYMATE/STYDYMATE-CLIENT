import type { Env } from '../index';
import type {
  SessionCreatePayload,
  SessionResponseType,
  SessionBookingResponseType,
  SessionCalendarResponse,
  SessionParticipantInfo,
  SessionNotificationSettings,
  SessionStatsResponseType,
  SessionSummaryResponse,
  SessionTranscriptResponse,
  SessionRecordingStatus,
  SessionInviteResponse
} from '../types';
import { query, queryFirst, execute } from '../utils/db';

const SESSION_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
} as const;

const DEFAULT_INVITE_EXPIRATION_HOURS = 24;

const NOTIFICATION_DEFAULTS: SessionNotificationSettings = {
  reminderBefore: 30,
  enableEmailReminder: true,
  enablePushReminder: true,
  enableSmsReminder: false,
  updatedAt: new Date(0).toISOString()
};

interface SessionNotificationRow {
  session_id: number;
  user_id: string;
  reminder_before: number;
  enable_email: number;
  enable_push: number;
  enable_sms: number;
  updated_at: string;
}

interface SessionRecordingRow {
  session_id: number;
  status: string;
  record_audio: number;
  record_video: number;
  record_transcript: number;
  download_url: string | null;
  message: string | null;
  updated_at: string;
}

interface SessionInviteRow {
  invite_token: string;
  session_id: number;
  inviter_user_id: string;
  expires_at: string;
  created_at: string;
  used_at: string | null;
  used_by: string | null;
}

interface SessionSummaryRow {
  session_id: number;
  notes: string | null;
  duration_minutes: number | null;
  rating: number | null;
  highlights: string | null;
  action_items: string | null;
  feedback: string | null;
  updated_at: string;
}

interface SessionTranscriptRow {
  session_id: number;
  language: string;
  segments: string | null;
  generated_at: string;
  updated_at: string;
}

function intToBool(value: number | null | undefined): boolean {
  return value === 1;
}

function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}

async function fetchNotificationRow(env: Env, sessionId: number, userId: string): Promise<SessionNotificationRow | null> {
  return queryFirst<SessionNotificationRow>(
    env.DB,
    `SELECT * FROM session_notifications WHERE session_id = ? AND user_id = ? LIMIT 1`,
    [sessionId, userId]
  );
}

async function upsertNotificationRow(
  env: Env,
  sessionId: number,
  userId: string,
  settings: SessionNotificationSettings
) {
  await execute(
    env.DB,
    `INSERT INTO session_notifications (
        session_id,
        user_id,
        reminder_before,
        enable_email,
        enable_push,
        enable_sms,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id, user_id) DO UPDATE SET
        reminder_before = excluded.reminder_before,
        enable_email = excluded.enable_email,
        enable_push = excluded.enable_push,
        enable_sms = excluded.enable_sms,
        updated_at = excluded.updated_at`,
    [
      sessionId,
      userId,
      settings.reminderBefore,
      boolToInt(settings.enableEmailReminder),
      boolToInt(settings.enablePushReminder),
      boolToInt(settings.enableSmsReminder),
      settings.updatedAt
    ]
  );
}

async function fetchRecordingRow(env: Env, sessionId: number): Promise<SessionRecordingRow | null> {
  return queryFirst<SessionRecordingRow>(
    env.DB,
    'SELECT * FROM session_recordings WHERE session_id = ? LIMIT 1',
    [sessionId]
  );
}

async function upsertRecordingRow(env: Env, sessionId: number, status: SessionRecordingStatus) {
  await execute(
    env.DB,
    `INSERT INTO session_recordings (
        session_id,
        status,
        record_audio,
        record_video,
        record_transcript,
        download_url,
        message,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        status = excluded.status,
        record_audio = excluded.record_audio,
        record_video = excluded.record_video,
        record_transcript = excluded.record_transcript,
        download_url = excluded.download_url,
        message = excluded.message,
        updated_at = excluded.updated_at`,
    [
      sessionId,
      status.status,
      boolToInt(status.recordAudio),
      boolToInt(status.recordVideo),
      boolToInt(status.recordTranscript),
      status.downloadUrl ?? null,
      status.message ?? null,
      status.updatedAt
    ]
  );
}

async function fetchInviteRow(env: Env, token: string): Promise<SessionInviteRow | null> {
  return queryFirst<SessionInviteRow>(
    env.DB,
    'SELECT * FROM session_invites WHERE invite_token = ? LIMIT 1',
    [token]
  );
}

async function insertInviteRow(
  env: Env,
  record: SessionInviteRow
) {
  await execute(
    env.DB,
    `INSERT INTO session_invites (
        invite_token,
        session_id,
        inviter_user_id,
        expires_at,
        created_at,
        used_at,
        used_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(invite_token) DO UPDATE SET
        session_id = excluded.session_id,
        inviter_user_id = excluded.inviter_user_id,
        expires_at = excluded.expires_at,
        created_at = excluded.created_at,
        used_at = excluded.used_at,
        used_by = excluded.used_by`,
    [
      record.invite_token,
      record.session_id,
      record.inviter_user_id,
      record.expires_at,
      record.created_at,
      record.used_at,
      record.used_by
    ]
  );
}

async function markInviteUsed(
  env: Env,
  token: string,
  usedBy: string,
  usedAt: string
) {
  await execute(
    env.DB,
    'UPDATE session_invites SET used_at = ?, used_by = ? WHERE invite_token = ?',
    [usedAt, usedBy, token]
  );
}

async function fetchSummaryRow(env: Env, sessionId: number): Promise<SessionSummaryRow | null> {
  return queryFirst<SessionSummaryRow>(
    env.DB,
    'SELECT * FROM session_summaries WHERE session_id = ? LIMIT 1',
    [sessionId]
  );
}

async function upsertSummaryRow(env: Env, row: SessionSummaryRow) {
  await execute(
    env.DB,
    `INSERT INTO session_summaries (
        session_id,
        notes,
        duration_minutes,
        rating,
        highlights,
        action_items,
        feedback,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        notes = excluded.notes,
        duration_minutes = excluded.duration_minutes,
        rating = excluded.rating,
        highlights = excluded.highlights,
        action_items = excluded.action_items,
        feedback = excluded.feedback,
        updated_at = excluded.updated_at`,
    [
      row.session_id,
      row.notes,
      row.duration_minutes,
      row.rating,
      row.highlights,
      row.action_items,
      row.feedback,
      row.updated_at
    ]
  );
}

async function fetchTranscriptRow(
  env: Env,
  sessionId: number,
  language: string
): Promise<SessionTranscriptRow | null> {
  return queryFirst<SessionTranscriptRow>(
    env.DB,
    'SELECT * FROM session_transcripts WHERE session_id = ? AND language = ? LIMIT 1',
    [sessionId, language]
  );
}

async function upsertTranscriptRow(
  env: Env,
  row: SessionTranscriptRow
) {
  await execute(
    env.DB,
    `INSERT INTO session_transcripts (
        session_id,
        language,
        segments,
        generated_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(session_id, language) DO UPDATE SET
        segments = excluded.segments,
        generated_at = excluded.generated_at,
        updated_at = excluded.updated_at`,
    [
      row.session_id,
      row.language,
      row.segments,
      row.generated_at,
      row.updated_at
    ]
  );
}

function deserializeSummaryRow(row: SessionSummaryRow): SessionSummaryResponse {
  const highlights = row.highlights ? safeParseStringArray(row.highlights) : [];
  const actionItems = row.action_items ? safeParseStringArray(row.action_items) : [];
  const feedback = row.feedback ? safeParseObject(row.feedback) : undefined;
  return {
    sessionId: row.session_id,
    notes: row.notes ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    rating: row.rating ?? undefined,
    highlights,
    actionItems,
    feedback,
    updatedAt: row.updated_at
  };
}

function serializeSummaryResponse(summary: SessionSummaryResponse): SessionSummaryRow {
  return {
    session_id: summary.sessionId,
    notes: summary.notes ?? null,
    duration_minutes: summary.durationMinutes ?? null,
    rating: summary.rating ?? null,
    highlights: JSON.stringify(summary.highlights ?? []),
    action_items: JSON.stringify(summary.actionItems ?? []),
    feedback: summary.feedback ? JSON.stringify(summary.feedback) : null,
    updated_at: summary.updatedAt
  };
}

function deserializeTranscriptRow(row: SessionTranscriptRow): SessionTranscriptResponse {
  const segments = row.segments ? safeParseSegments(row.segments) : [];
  return {
    sessionId: row.session_id,
    language: row.language,
    segments,
    generatedAt: row.generated_at
  };
}

function safeParseStringArray(payload: string): string[] {
  try {
    const parsed = JSON.parse(payload);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function safeParseObject(payload: string): Record<string, any> | undefined {
  try {
    const parsed = JSON.parse(payload);
    return typeof parsed === 'object' && parsed !== null ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function safeParseSegments(payload: string): SessionTranscriptResponse['segments'] {
  try {
    const parsed = JSON.parse(payload);
    if (Array.isArray(parsed)) {
      return parsed.map((segment) => {
        if (segment && typeof segment === 'object') {
          return {
            speaker: String(segment.speaker ?? ''),
            content: String(segment.content ?? ''),
            startTime: segment.startTime ?? undefined,
            endTime: segment.endTime ?? undefined
          };
        }
        return {
          speaker: '',
          content: String(segment ?? '')
        };
      });
    }
    return [];
  } catch {
    return [];
  }
}

interface SessionRow {
  session_id: number;
  host_user_id: string;
  guest_user_id: string | null;
  title: string;
  description: string | null;
  session_type: string;
  language_code: string | null;
  skill_focus: string | null;
  level_requirement: string | null;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number | null;
  current_participants: number | null;
  status: string;
  meeting_url: string | null;
  meeting_password: string | null;
  is_recurring: number | null;
  recurrence_pattern: string | null;
  recurrence_end_date: string | null;
  is_public: number | null;
  tags: string | null;
  preparation_notes: string | null;
  started_at: string | null;
  ended_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  host_name: string | null;
  host_profile_image: string | null;
  guest_name: string | null;
  guest_profile_image: string | null;
}

interface BookingRow {
  booking_id: number;
  session_id: number;
  user_id: string;
  status: string;
  booking_message: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  attended: number;
  feedback_rating: number | null;
  feedback_comment: string | null;
  reminder_sent: number;
  created_at: string;
  session_title: string;
  session_scheduled_at: string;
  session_duration_minutes: number;
  session_language_code: string | null;
  host_user_id: string;
  host_user_name: string | null;
  host_user_profile_image: string | null;
}

interface BookingWithSessionRow {
  booking_id: number;
  session_id: number;
  user_id: string;
  status: string;
  current_participants: number | null;
  guest_user_id: string | null;
}

interface CalendarRow {
  session_id: number;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  host_user_id: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function mapSessionRow(row: any, currentUserId?: string): SessionResponseType {
  const scheduledAt = row.scheduled_at as string;
  const duration = Number(row.duration_minutes ?? 0);
  const startDate = scheduledAt ? new Date(scheduledAt) : null;
  const startedAt = row.started_at ?? undefined;
  const endedAt = row.ended_at ?? undefined;

  let canJoin: boolean | undefined;
  let isHost: boolean | undefined;
  let isParticipant: boolean | undefined;
  if (currentUserId) {
    isHost = row.host_user_id === currentUserId;
    isParticipant = row.guest_user_id === currentUserId;
    canJoin =
      row.status === SESSION_STATUS.SCHEDULED &&
      !isHost &&
      Number(row.current_participants ?? 0) < Number(row.max_participants ?? 1);
  }

  return {
    sessionId: row.session_id,
    hostUserId: row.host_user_id,
    hostUserName: row.host_name ?? undefined,
    hostUserProfileImage: row.host_profile_image ?? undefined,
    guestUserId: row.guest_user_id ?? undefined,
    guestUserName: row.guest_name ?? undefined,
    guestUserProfileImage: row.guest_profile_image ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    sessionType: row.session_type,
    languageCode: row.language_code ?? undefined,
    skillFocus: row.skill_focus ?? undefined,
    levelRequirement: row.level_requirement ?? undefined,
    scheduledAt: scheduledAt,
    durationMinutes: duration,
    maxParticipants: row.max_participants !== null ? Number(row.max_participants) : undefined,
    currentParticipants: Number(row.current_participants ?? 0),
    status: row.status,
    meetingUrl: row.meeting_url ?? undefined,
    isRecurring: Boolean(row.is_recurring),
    recurrencePattern: row.recurrence_pattern ?? undefined,
    recurrenceEndDate: row.recurrence_end_date ?? undefined,
    isPublic: Boolean(row.is_public ?? 1),
    tags: row.tags ?? undefined,
    preparationNotes: row.preparation_notes ?? undefined,
    startedAt: startedAt,
    endedAt: endedAt,
    canJoin,
    isHost,
    isParticipant
  };
}

function mapBookingRow(row: any): SessionBookingResponseType {
  return {
    bookingId: row.booking_id,
    sessionId: row.session_id,
    sessionTitle: row.session_title,
    sessionScheduledAt: row.session_scheduled_at,
    sessionDurationMinutes: Number(row.session_duration_minutes ?? 0),
    sessionLanguageCode: row.session_language_code ?? undefined,
    hostUserId: row.host_user_id,
    hostUserName: row.host_user_name ?? undefined,
    hostUserProfileImage: row.host_user_profile_image ?? undefined,
    status: row.status,
    bookingMessage: row.booking_message ?? undefined,
    bookedAt: row.created_at,
    cancelledAt: row.cancelled_at ?? undefined,
    cancellationReason: row.cancellation_reason ?? undefined,
    attended: Boolean(row.attended),
    feedbackRating: row.feedback_rating !== null ? Number(row.feedback_rating) : undefined,
    feedbackComment: row.feedback_comment ?? undefined,
    reminderSent: Boolean(row.reminder_sent),
    canCancel: calculateCanCancel(row.session_scheduled_at)
  };
}

function calculateCanCancel(scheduledAt: string | null): boolean {
  if (!scheduledAt) return false;
  const sessionTime = new Date(scheduledAt);
  const threshold = new Date();
  threshold.setUTCHours(threshold.getUTCHours() + 1);
  return sessionTime > threshold;
}

async function getSessionRow(env: Env, sessionId: number) {
  return queryFirst<SessionRow>(
    env.DB,
    `SELECT s.*, 
            host.name AS host_name,
            host.profile_image AS host_profile_image,
            guest.name AS guest_name,
            guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.session_id = ?
      LIMIT 1`,
    [sessionId]
  );
}

async function ensureSessionExists(env: Env, sessionId: number): Promise<SessionRow> {
  const row = await getSessionRow(env, sessionId);
  if (!row) throw new Error('세션을 찾을 수 없습니다.');
  return row;
}

export async function createSession(
  env: Env,
  hostUserId: string,
  payload: SessionCreatePayload
): Promise<SessionResponseType> {
  const now = nowIso();

  const title = payload.title ?? payload.topic ?? 'Study Session';
  const sessionType = payload.sessionType ?? payload.sessionType ?? 'VIDEO';
  const scheduledAt = payload.scheduledAt;
  const durationMinutes = payload.durationMinutes ?? payload.duration ?? 30;
  const maxParticipants = payload.maxParticipants ?? (payload.partnerId ? 2 : 1);
  const isPublic = payload.isPublic ?? !payload.partnerId;
  const languageCode = payload.languageCode ?? payload.language ?? null;
  const skillFocus = payload.skillFocus ?? payload.targetLanguage ?? null;
  const description = payload.description ?? payload.topic ?? null;
  const guestUserId = payload.partnerId ?? null;
  const metadata = {
    webRtcRoomId: payload.webRtcRoomId ?? null,
    webRtcRoomType: payload.webRtcRoomType ?? null,
    targetLanguage: payload.targetLanguage ?? null,
    topic: payload.topic ?? null,
    language: payload.language ?? null
  };
  const preparationNotes = payload.preparationNotes ?? JSON.stringify(metadata);
  const meetingUrl = payload.meetingUrl ?? (payload.webRtcRoomId ? `webrtc:${payload.webRtcRoomId}` : null);

  await execute(
    env.DB,
    `INSERT INTO sessions (
        host_user_id,
        guest_user_id,
        title,
        description,
        session_type,
        language_code,
        skill_focus,
        level_requirement,
        scheduled_at,
        duration_minutes,
        max_participants,
        current_participants,
        status,
        meeting_url,
        meeting_password,
        is_recurring,
        recurrence_pattern,
        recurrence_end_date,
        is_public,
        tags,
        preparation_notes,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      hostUserId,
      guestUserId,
      title,
      description,
      sessionType,
      languageCode,
      skillFocus,
      payload.levelRequirement ?? null,
      scheduledAt,
      durationMinutes,
      maxParticipants,
      SESSION_STATUS.SCHEDULED,
      meetingUrl,
      payload.isRecurring ? 1 : 0,
      payload.recurrencePattern ?? null,
      payload.recurrenceEndDate ?? null,
      isPublic ? 1 : 0,
      payload.tags ?? null,
      preparationNotes,
      now,
      now
    ]
  );

  const idRow = await queryFirst<{ id: number }>(
    env.DB,
    'SELECT last_insert_rowid() as id'
  );
  const sessionId = Number(idRow?.id ?? 0);
  if (!sessionId) {
    throw new Error('세션 ID를 확인할 수 없습니다.');
  }
  const row = await getSessionRow(env, sessionId);
  if (!row) {
    throw new Error('세션 생성 후 데이터를 로드할 수 없습니다.');
  }
  return mapSessionRow(row, hostUserId);
}

export async function listSessions(
  env: Env,
  page: number,
  size: number,
  statusFilter?: string
) {
  const offset = (page - 1) * size;
  const filters: string[] = [];
  const params: any[] = [];
  const status = statusFilter?.toLowerCase();
  const now = nowIso();

  if (status === 'upcoming') {
    filters.push('status = ?');
    params.push(SESSION_STATUS.SCHEDULED);
    filters.push('scheduled_at >= ?');
    params.push(now);
  } else if (status === 'completed' || status === 'done') {
    filters.push('status = ?');
    params.push(SESSION_STATUS.COMPLETED);
  } else if (status === 'cancelled') {
    filters.push('status = ?');
    params.push(SESSION_STATUS.CANCELLED);
  } else if (status === 'in-progress') {
    filters.push('status = ?');
    params.push(SESSION_STATUS.IN_PROGRESS);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM sessions ${whereClause}`,
    params
  );

  const rows = await query<SessionRow>(
    env.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      ${whereClause}
      ORDER BY s.scheduled_at DESC
      LIMIT ? OFFSET ?`,
    params.concat([size, offset])
  );

  const data = rows.map((row) => mapSessionRow(row));
  return {
    data,
    page,
    size,
    total: totalRow?.count ?? 0
  };
}

export async function getSessionById(env: Env, sessionId: number, currentUserId?: string) {
  const row = await getSessionRow(env, sessionId);
  if (!row) throw new Error('세션을 찾을 수 없습니다.');
  return mapSessionRow(row, currentUserId);
}

export async function listUserSessions(
  env: Env,
  userId: string,
  page: number,
  size: number
) {
  const offset = (page - 1) * size;
  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM sessions
      WHERE host_user_id = ? OR guest_user_id = ?`,
    [userId, userId]
  );

  const rows = await query<SessionRow>(
    env.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.host_user_id = ? OR s.guest_user_id = ?
      ORDER BY s.scheduled_at DESC
      LIMIT ? OFFSET ?`,
    [userId, userId, size, offset]
  );

  const data = rows.map((row) => mapSessionRow(row, userId));
  return {
    data,
    page,
    size,
    total: totalRow?.count ?? 0
  };
}

export async function listPublicSessions(env: Env, page: number, size: number) {
  const offset = (page - 1) * size;
  const now = nowIso();
  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM sessions
      WHERE is_public = 1 AND status = ? AND scheduled_at >= ?`,
    [SESSION_STATUS.SCHEDULED, now]
  );

  const rows = await query<SessionRow>(
    env.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.is_public = 1 AND s.status = ? AND s.scheduled_at >= ?
      ORDER BY s.scheduled_at ASC
      LIMIT ? OFFSET ?`,
    [SESSION_STATUS.SCHEDULED, now, size, offset]
  );

  const data = rows.map((row) => mapSessionRow(row));
  return { data, page, size, total: totalRow?.count ?? 0 };
}

export async function listSessionsByLanguage(
  env: Env,
  languageCode: string,
  page: number,
  size: number
) {
  const offset = (page - 1) * size;
  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM sessions
      WHERE status = ? AND language_code = ?`,
    [SESSION_STATUS.SCHEDULED, languageCode]
  );

  const rows = await query<SessionRow>(
    env.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.status = ? AND s.language_code = ?
      ORDER BY s.scheduled_at ASC
      LIMIT ? OFFSET ?`,
    [SESSION_STATUS.SCHEDULED, languageCode, size, offset]
  );

  const data = rows.map((row) => mapSessionRow(row));
  return { data, page, size, total: totalRow?.count ?? 0 };
}

export async function listSessionsByType(
  env: Env,
  sessionType: string,
  page: number,
  size: number
) {
  const offset = (page - 1) * size;
  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM sessions
      WHERE status = ? AND session_type = ?`,
    [SESSION_STATUS.SCHEDULED, sessionType]
  );

  const rows = await query<SessionRow>(
    env.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.status = ? AND s.session_type = ?
      ORDER BY s.scheduled_at ASC
      LIMIT ? OFFSET ?`,
    [SESSION_STATUS.SCHEDULED, sessionType, size, offset]
  );

  const data = rows.map((row) => mapSessionRow(row));
  return { data, page, size, total: totalRow?.count ?? 0 };
}

export async function listAvailableSessions(
  env: Env,
  userId: string,
  page: number,
  size: number
) {
  const offset = (page - 1) * size;
  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM sessions s
      WHERE s.status = ?
        AND s.is_public = 1
        AND s.host_user_id != ?
        AND (s.max_participants IS NULL OR s.current_participants < s.max_participants)`,
    [SESSION_STATUS.SCHEDULED, userId]
  );

  const rows = await query<SessionRow>(
    env.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.status = ?
        AND s.is_public = 1
        AND s.host_user_id != ?
        AND (s.max_participants IS NULL OR s.current_participants < s.max_participants)
      ORDER BY s.scheduled_at ASC
      LIMIT ? OFFSET ?`,
    [SESSION_STATUS.SCHEDULED, userId, size, offset]
  );

  const data = rows.map((row) => mapSessionRow(row, userId));
  return { data, page, size, total: totalRow?.count ?? 0 };
}

export async function bookSession(
  env: Env,
  userId: string,
  payload: { sessionId: number; bookingMessage?: string }
): Promise<SessionBookingResponseType> {
  const session = await ensureSessionExists(env, payload.sessionId);

  if (session.host_user_id === userId) {
    throw new Error('호스트는 자신의 세션을 예약할 수 없습니다.');
  }

  if (session.status !== SESSION_STATUS.SCHEDULED) {
    throw new Error('예약할 수 없는 세션입니다.');
  }

  const maxParticipants = session.max_participants ?? 1;
  const currentParticipants = Number(session.current_participants ?? 0);
  if (currentParticipants >= maxParticipants) {
    throw new Error('세션 정원이 가득 찼습니다.');
  }

  const existing = await queryFirst(
    env.DB,
    `SELECT booking_id FROM session_bookings
      WHERE session_id = ? AND user_id = ? AND status = ?
      LIMIT 1`,
    [payload.sessionId, userId, BOOKING_STATUS.CONFIRMED]
  );

  if (existing) {
    throw new Error('이미 예약된 세션입니다.');
  }

  const now = nowIso();
  await execute(
    env.DB,
    `INSERT INTO session_bookings (
        session_id, user_id, status, booking_message,
        cancelled_at, cancellation_reason, attended, feedback_rating,
        feedback_comment, reminder_sent, reminder_sent_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NULL, NULL, 0, NULL, NULL, 0, NULL, ?, ?)
    `,
    [payload.sessionId, userId, BOOKING_STATUS.CONFIRMED, payload.bookingMessage ?? null, now, now]
  );

  const newParticipants = currentParticipants + 1;
  await execute(
    env.DB,
    `UPDATE sessions
        SET guest_user_id = CASE WHEN guest_user_id IS NULL THEN ? ELSE guest_user_id END,
            current_participants = ?,
            updated_at = ?
      WHERE session_id = ?`,
    [userId, newParticipants, now, payload.sessionId]
  );

  const bookingRow = await queryFirst<BookingRow>(
    env.DB,
    `SELECT b.*, 
            s.title AS session_title,
            s.scheduled_at AS session_scheduled_at,
            s.duration_minutes AS session_duration_minutes,
            s.language_code AS session_language_code,
            s.host_user_id,
            host.name AS host_user_name,
            host.profile_image AS host_user_profile_image
       FROM session_bookings b
       JOIN sessions s ON s.session_id = b.session_id
       LEFT JOIN users host ON host.user_id = s.host_user_id
      WHERE b.session_id = ? AND b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT 1`,
    [payload.sessionId, userId]
  );

  if (!bookingRow) throw new Error('예약 정보를 불러올 수 없습니다.');
  return mapBookingRow(bookingRow);
}

export async function joinSession(
  env: Env,
  userId: string,
  sessionId: number,
  bookingMessage?: string
): Promise<SessionResponseType> {
  const session = await ensureSessionExists(env, sessionId);
  if (session.host_user_id === userId) {
    return mapSessionRow(session, userId);
  }
  await bookSession(env, userId, { sessionId, bookingMessage });
  const updated = await getSessionRow(env, sessionId);
  if (!updated) {
    throw new Error('세션 정보를 갱신할 수 없습니다.');
  }
  return mapSessionRow(updated, userId);
}

export async function cancelBooking(
  env: Env,
  userId: string,
  bookingId: number,
  reason?: string
) {
  const booking = await queryFirst<BookingWithSessionRow>(
    env.DB,
    `SELECT b.*, s.host_user_id, s.guest_user_id, s.current_participants
       FROM session_bookings b
       JOIN sessions s ON s.session_id = b.session_id
      WHERE b.booking_id = ?
      LIMIT 1`,
    [bookingId]
  );

  if (!booking) throw new Error('예약을 찾을 수 없습니다.');
  if (booking.user_id !== userId) throw new Error('예약을 취소할 권한이 없습니다.');
  if (booking.status !== BOOKING_STATUS.CONFIRMED) throw new Error('이미 처리된 예약입니다.');

  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE session_bookings
       SET status = ?, cancelled_at = ?, cancellation_reason = ?, updated_at = ?
     WHERE booking_id = ?`,
    [BOOKING_STATUS.CANCELLED, now, reason ?? null, now, bookingId]
  );

  const newParticipants = Math.max(Number(booking.current_participants ?? 1) - 1, 0);
  const guestUserId = booking.guest_user_id === userId ? null : booking.guest_user_id;

  await execute(
    env.DB,
    `UPDATE sessions
        SET guest_user_id = ?,
            current_participants = ?,
            updated_at = ?
      WHERE session_id = ?`,
    [guestUserId, newParticipants, now, booking.session_id]
  );
}

export async function listUserBookings(env: Env, userId: string, page: number, size: number) {
  const offset = (page - 1) * size;
  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    'SELECT COUNT(*) as count FROM session_bookings WHERE user_id = ?',
    [userId]
  );

  const rows = await query<BookingRow>(
    env.DB,
    `SELECT b.*, s.title AS session_title, s.scheduled_at AS session_scheduled_at,
            s.duration_minutes AS session_duration_minutes, s.language_code AS session_language_code,
            s.host_user_id, host.name AS host_user_name, host.profile_image AS host_user_profile_image
       FROM session_bookings b
       JOIN sessions s ON s.session_id = b.session_id
       LEFT JOIN users host ON host.user_id = s.host_user_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?`,
    [userId, size, offset]
  );

  const data = rows.map((row) => mapBookingRow(row));
  return { data, page, size, total: totalRow?.count ?? 0 };
}

export async function getUserCalendar(
  env: Env,
  userId: string,
  start: string,
  end: string
): Promise<SessionCalendarResponse> {
  const rows = await query<CalendarRow>(
    env.DB,
    `SELECT s.*, host.name AS host_name, guest.name AS guest_name
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE s.scheduled_at BETWEEN ? AND ?
        AND (s.host_user_id = ? OR s.guest_user_id = ?)
      ORDER BY s.scheduled_at ASC`,
    [start, end, userId, userId]
  );

  const events = rows.map((row) => ({
    sessionId: row.session_id,
    title: row.title,
    description: row.description ?? undefined,
    startTime: row.scheduled_at,
    endTime: new Date(new Date(row.scheduled_at).getTime() + Number(row.duration_minutes ?? 0) * 60000).toISOString(),
    eventType: 'SESSION',
    status: row.status,
    isHost: row.host_user_id === userId,
    color: row.host_user_id === userId ? '#4CAF50' : '#2196F3'
  }));

  // simple hourly slots between range
  const availableSlots: SessionCalendarResponse['availableSlots'] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  let cursor = new Date(startDate);
  while (cursor < endDate) {
    const next = new Date(cursor.getTime() + 60 * 60000);
    availableSlots.push({ startTime: cursor.toISOString(), endTime: next.toISOString(), isAvailable: true });
    cursor = next;
  }

  return { events, availableSlots };
}

export async function startSession(env: Env, userId: string, sessionId: number) {
  const session = await ensureSessionExists(env, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error('세션을 시작할 권한이 없습니다.');
  }
  const now = nowIso();
  await execute(
    env.DB,
    'UPDATE sessions SET status = ?, started_at = ?, updated_at = ? WHERE session_id = ?',
    [SESSION_STATUS.IN_PROGRESS, now, now, sessionId]
  );
}

export async function endSession(
  env: Env,
  userId: string,
  sessionId: number,
  summary?: { duration?: number; notes?: string; rating?: number }
) {
  const session = await ensureSessionExists(env, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error('세션을 종료할 권한이 없습니다.');
  }
  const now = nowIso();
  await execute(
    env.DB,
    'UPDATE sessions SET status = ?, ended_at = ?, updated_at = ? WHERE session_id = ?',
    [SESSION_STATUS.COMPLETED, now, now, sessionId]
  );
  if (summary) {
    await mergeSessionSummary(env, sessionId, {
      sessionId,
      durationMinutes: summary.duration ?? undefined,
      notes: summary.notes,
      rating: summary.rating,
      updatedAt: now,
      highlights: [],
      actionItems: []
    });
  }
}

export async function cancelSession(
  env: Env,
  userId: string,
  sessionId: number,
  reason?: string
) {
  const session = await ensureSessionExists(env, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error('세션을 취소할 권한이 없습니다.');
  }
  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE sessions
        SET status = ?, cancelled_at = ?, cancellation_reason = ?, updated_at = ?
      WHERE session_id = ?`,
    [SESSION_STATUS.CANCELLED, now, reason ?? null, now, sessionId]
  );

  await execute(
    env.DB,
    `UPDATE session_bookings
        SET status = ?, cancelled_at = ?, cancellation_reason = ?, updated_at = ?
      WHERE session_id = ? AND status = ?`,
    [BOOKING_STATUS.CANCELLED, now, reason ?? 'Session cancelled by host', now, sessionId, BOOKING_STATUS.CONFIRMED]
  );
}


async function mergeSessionSummary(
  env: Env,
  sessionId: number,
  update: Partial<SessionSummaryResponse> & { sessionId: number }
): Promise<SessionSummaryResponse> {
  const existingRow = await fetchSummaryRow(env, sessionId);
  const existing = existingRow ? deserializeSummaryRow(existingRow) : null;
  const combinedFeedback = {
    ...(existing?.feedback ?? {}),
    ...(update.feedback ?? {})
  } as SessionSummaryResponse['feedback'];
  const feedback = combinedFeedback && Object.keys(combinedFeedback).length > 0 ? combinedFeedback : existing?.feedback;
  const highlights = update.highlights ?? existing?.highlights ?? [];
  const actionItems = update.actionItems ?? existing?.actionItems ?? [];
  const merged: SessionSummaryResponse = {
    sessionId,
    notes: update.notes ?? existing?.notes,
    durationMinutes: update.durationMinutes ?? existing?.durationMinutes,
    rating: update.rating ?? existing?.rating,
    highlights,
    actionItems,
    feedback,
    updatedAt: update.updatedAt ?? nowIso()
  };
  await upsertSummaryRow(env, serializeSummaryResponse(merged));
  return merged;
}

async function getStoredSessionSummary(env: Env, sessionId: number): Promise<SessionSummaryResponse | null> {
  const row = await fetchSummaryRow(env, sessionId);
  return row ? deserializeSummaryRow(row) : null;
}

async function buildDefaultSessionSummary(env: Env, sessionId: number): Promise<SessionSummaryResponse> {
  const row = await getSessionRow(env, sessionId);
  if (!row) {
    throw new Error('세션을 찾을 수 없습니다.');
  }
  return {
    sessionId,
    notes: undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    rating: undefined,
    highlights: [],
    actionItems: [],
    feedback: undefined,
    updatedAt: row.updated_at
  };
}

function parsePreparationNotes(raw: string | null): any {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { notes: raw };
  }
}

export async function rescheduleSession(
  env: Env,
  userId: string,
  sessionId: number,
  payload: { scheduledAt?: string; duration?: number; reason?: string }
): Promise<SessionResponseType> {
  const session = await ensureSessionExists(env, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error('세션 일정을 변경할 권한이 없습니다.');
  }
  const now = nowIso();
  const newScheduledAt = payload.scheduledAt ?? session.scheduled_at;
  const newDuration = payload.duration ?? session.duration_minutes ?? 30;
  const notes = parsePreparationNotes(session.preparation_notes ?? null);
  const reason = payload.reason?.trim();
  if (reason) {
    const history = Array.isArray(notes.rescheduleHistory) ? notes.rescheduleHistory : [];
    history.push({ reason, updatedAt: now, userId });
    notes.rescheduleHistory = history;
  }
  notes.lastRescheduleAt = now;
  notes.lastRescheduleBy = userId;
  await execute(
    env.DB,
    `UPDATE sessions
        SET scheduled_at = ?,
            duration_minutes = ?,
            preparation_notes = ?,
            updated_at = ?
      WHERE session_id = ?`,
    [newScheduledAt, newDuration, JSON.stringify(notes), now, sessionId]
  );
  const updated = await getSessionRow(env, sessionId);
  if (!updated) throw new Error('세션을 찾을 수 없습니다.');
  return mapSessionRow(updated, userId);
}

interface SessionFeedbackPayload {
  rating?: number;
  comment?: string;
  partnerRating?: number;
  partnerComment?: string;
  tags?: string[];
  improvementAreas?: string[];
  wouldRecommend?: boolean;
}

export async function submitSessionFeedback(
  env: Env,
  userId: string,
  sessionId: number,
  feedback: SessionFeedbackPayload
): Promise<SessionSummaryResponse> {
  const now = nowIso();
  const booking = await queryFirst<BookingRow>(
    env.DB,
    `SELECT * FROM session_bookings WHERE session_id = ? AND user_id = ? LIMIT 1`,
    [sessionId, userId]
  );
  if (booking) {
    const feedbackComment = JSON.stringify({
      comment: feedback.comment ?? null,
      partnerRating: feedback.partnerRating ?? null,
      partnerComment: feedback.partnerComment ?? null,
      tags: feedback.tags ?? [],
      improvementAreas: feedback.improvementAreas ?? [],
      wouldRecommend: feedback.wouldRecommend ?? false
    });
    await execute(
      env.DB,
      `UPDATE session_bookings
          SET feedback_rating = ?,
              feedback_comment = ?,
              attended = 1,
              updated_at = ?
        WHERE booking_id = ?`,
      [feedback.rating ?? null, feedbackComment, now, booking.booking_id]
    );
  }
  return mergeSessionSummary(env, sessionId, {
    sessionId,
    feedback: {
      rating: feedback.rating,
      comment: feedback.comment,
      partnerRating: feedback.partnerRating,
      partnerComment: feedback.partnerComment,
      tags: feedback.tags,
      improvementAreas: feedback.improvementAreas,
      wouldRecommend: feedback.wouldRecommend
    },
    updatedAt: now
  });
}

export async function listSessionHistory(
  env: Env,
  userId: string,
  page: number,
  size: number,
  partnerId?: string
) {
  const offset = (page - 1) * size;
  const filters = ['(s.host_user_id = ? OR s.guest_user_id = ?)'];
  const params: any[] = [userId, userId];
  if (partnerId) {
    filters.push('((s.host_user_id = ? AND s.guest_user_id = ?) OR (s.host_user_id = ? AND s.guest_user_id = ?))');
    params.push(userId, partnerId, partnerId, userId);
  }
  filters.push('s.status IN (?, ?)');
  params.push(SESSION_STATUS.COMPLETED, SESSION_STATUS.CANCELLED);
  const whereClause = `WHERE ${filters.join(' AND ')}`;

  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM sessions s ${whereClause}`,
    params
  );

  const rows = await query<SessionRow>(
    env.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      ${whereClause}
      ORDER BY s.scheduled_at DESC
      LIMIT ? OFFSET ?`,
    params.concat([size, offset])
  );

  const data = rows.map((row) => mapSessionRow(row, userId));
  return { data, page, size, total: totalRow?.count ?? 0 };
}

export async function getSessionStats(
  env: Env,
  userId: string,
  period: 'week' | 'month' | 'year'
): Promise<SessionStatsResponseType> {
  const now = new Date();
  const start = new Date(now);
  if (period === 'week') {
    start.setUTCDate(start.getUTCDate() - 7);
  } else if (period === 'month') {
    start.setUTCMonth(start.getUTCMonth() - 1);
  } else {
    start.setUTCFullYear(start.getUTCFullYear() - 1);
  }
  const startIso = start.toISOString();

  // 1. 전체 학습 시간 계산 (모든 기간)
  const allTimeRows = await query<SessionRow>(
    env.DB,
    `SELECT duration_minutes
       FROM sessions
      WHERE (host_user_id = ? OR guest_user_id = ?)
        AND status = ?`,
    [userId, userId, SESSION_STATUS.COMPLETED]
  );

  const totalMinutes = allTimeRows.reduce((sum, row) => sum + Number(row.duration_minutes ?? 0), 0);

  // 2. 지정된 기간의 세션 조회
  const rows = await query<SessionRow>(
    env.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE (s.host_user_id = ? OR s.guest_user_id = ?)
        AND s.scheduled_at >= ?
      ORDER BY s.scheduled_at DESC`,
    [userId, userId, startIso]
  );

  let completed = 0;
  let cancelled = 0;
  let upcoming = 0;
  let monthlyMinutes = 0;
  const partners = new Set<string>();
  const completedDates = new Set<string>();
  let lastSessionAt: string | undefined;

  for (const row of rows) {
    if (!lastSessionAt || row.scheduled_at > lastSessionAt) {
      lastSessionAt = row.scheduled_at;
    }
    const otherUser = row.host_user_id === userId ? row.guest_user_id : row.host_user_id;
    if (otherUser) partners.add(otherUser);
    if (row.status === SESSION_STATUS.COMPLETED) {
      completed += 1;
      monthlyMinutes += Number(row.duration_minutes ?? 0);
      completedDates.add(new Date(row.scheduled_at).toISOString().slice(0, 10));
    } else if (row.status === SESSION_STATUS.CANCELLED) {
      cancelled += 1;
    } else if (row.status === SESSION_STATUS.SCHEDULED) {
      upcoming += 1;
    }
  }

  const averageDuration = completed > 0 ? monthlyMinutes / completed : 0;
  const streakDays = (() => {
    if (completedDates.size === 0) return 0;
    const cursor = new Date();
    let streak = 0;
    for (;;) {
      const key = cursor.toISOString().slice(0, 10);
      if (completedDates.has(key)) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  })();

  return {
    period,
    totalSessions: rows.length,
    completedSessions: completed,
    cancelledSessions: cancelled,
    upcomingSessions: upcoming,
    totalMinutes,
    monthlyMinutes,
    averageDuration,
    partnersCount: partners.size,
    streakDays,
    lastSessionAt
  };
}

export async function listUpcomingSessions(
  env: Env,
  userId: string,
  limit: number
): Promise<SessionResponseType[]> {
  const rows = await query<SessionRow>(
    env.DB,
    `SELECT s.*, host.name AS host_name, host.profile_image AS host_profile_image,
            guest.name AS guest_name, guest.profile_image AS guest_profile_image
       FROM sessions s
       LEFT JOIN users host ON host.user_id = s.host_user_id
       LEFT JOIN users guest ON guest.user_id = s.guest_user_id
      WHERE (s.host_user_id = ? OR s.guest_user_id = ?)
        AND s.status = ?
        AND s.scheduled_at >= ?
      ORDER BY s.scheduled_at ASC
      LIMIT ?`,
    [userId, userId, SESSION_STATUS.SCHEDULED, nowIso(), limit]
  );
  return rows.map((row) => mapSessionRow(row, userId));
}

export async function getSessionParticipants(
  env: Env,
  sessionId: number
): Promise<SessionParticipantInfo[]> {
  const row = await getSessionRow(env, sessionId);
  if (!row) throw new Error('세션을 찾을 수 없습니다.');
  const participants: SessionParticipantInfo[] = [];
  participants.push({
    userId: row.host_user_id,
    name: row.host_name ?? undefined,
    profileImage: row.host_profile_image ?? undefined,
    role: 'HOST',
    joinedAt: row.created_at
  });
  if (row.guest_user_id) {
    participants.push({
      userId: row.guest_user_id,
      name: row.guest_name ?? undefined,
      profileImage: row.guest_profile_image ?? undefined,
      role: 'GUEST',
      joinedAt: row.created_at
    });
  }
  const bookingRows = await query<BookingRow & { name?: string | null; profile_image?: string | null }>(
    env.DB,
    `SELECT b.*, u.name, u.profile_image
       FROM session_bookings b
       LEFT JOIN users u ON u.user_id = b.user_id
      WHERE b.session_id = ? AND b.status = ?`,
    [sessionId, BOOKING_STATUS.CONFIRMED]
  );
  for (const booking of bookingRows) {
    if (booking.user_id === row.host_user_id || booking.user_id === row.guest_user_id) {
      continue;
    }
    participants.push({
      userId: booking.user_id,
      name: booking.name ?? undefined,
      profileImage: booking.profile_image ?? undefined,
      role: 'BOOKED',
      joinedAt: booking.created_at
    });
  }
  return participants;
}

export async function generateSessionInvite(
  env: Env,
  userId: string,
  sessionId: number,
  expiresInHours: number = 24
): Promise<SessionInviteResponse> {
  const session = await ensureSessionExists(env, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error('초대 링크를 생성할 권한이 없습니다.');
  }
  const token = crypto.randomUUID();
  const hours = Number.isFinite(expiresInHours) ? Math.max(1, expiresInHours) : DEFAULT_INVITE_EXPIRATION_HOURS;
  const now = nowIso();
  const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
  await insertInviteRow(env, {
    invite_token: token,
    session_id: sessionId,
    inviter_user_id: userId,
    expires_at: expiresAt,
    created_at: now,
    used_at: null,
    used_by: null
  });
  const baseUrl = env.API_BASE_URL ?? '';
  const joinUrl = baseUrl ? `${baseUrl}/sessions/join?token=${token}` : `/sessions/join?token=${token}`;
  return { sessionId, inviteToken: token, expiresAt, joinUrl };
}

export async function acceptSessionInvite(
  env: Env,
  userId: string,
  token: string
): Promise<SessionResponseType> {
  const record = await fetchInviteRow(env, token);
  if (!record) {
    throw new Error('유효하지 않은 초대 토큰입니다.');
  }
  if (record.used_at) {
    throw new Error('이미 사용된 초대 토큰입니다.');
  }
  if (new Date(record.expires_at).getTime() < Date.now()) {
    throw new Error('초대 토큰이 만료되었습니다.');
  }
  const now = nowIso();
  await markInviteUsed(env, token, userId, now);
  return joinSession(env, userId, record.session_id);
}

export async function getSessionNotifications(
  env: Env,
  sessionId: number,
  userId: string
): Promise<SessionNotificationSettings> {
  const row = await fetchNotificationRow(env, sessionId, userId);
  if (row) {
    return {
      reminderBefore: row.reminder_before,
      enableEmailReminder: intToBool(row.enable_email),
      enablePushReminder: intToBool(row.enable_push),
      enableSmsReminder: intToBool(row.enable_sms),
      updatedAt: row.updated_at
    };
  }
  return { ...NOTIFICATION_DEFAULTS, updatedAt: nowIso() };
}

export async function updateSessionNotifications(
  env: Env,
  sessionId: number,
  userId: string,
  settings: Partial<SessionNotificationSettings>
): Promise<SessionNotificationSettings> {
  const current = await getSessionNotifications(env, sessionId, userId);
  const merged: SessionNotificationSettings = {
    reminderBefore: settings.reminderBefore ?? current.reminderBefore,
    enableEmailReminder: settings.enableEmailReminder ?? current.enableEmailReminder,
    enablePushReminder: settings.enablePushReminder ?? current.enablePushReminder,
    enableSmsReminder: settings.enableSmsReminder ?? current.enableSmsReminder,
    updatedAt: nowIso()
  };
  await upsertNotificationRow(env, sessionId, userId, merged);
  return merged;
}

export async function requestSessionRecording(
  env: Env,
  userId: string,
  sessionId: number,
  options: { recordAudio?: boolean; recordVideo?: boolean; recordTranscript?: boolean; language?: string; targetLanguage?: string }
): Promise<SessionRecordingStatus> {
  const session = await ensureSessionExists(env, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error('녹화를 요청할 권한이 없습니다.');
  }
  const status: SessionRecordingStatus = {
    sessionId,
    status: 'scheduled',
    recordAudio: options.recordAudio ?? true,
    recordVideo: options.recordVideo ?? false,
    recordTranscript: options.recordTranscript ?? true,
    downloadUrl: undefined,
    message: options.language ? `Recording language: ${options.language}` : undefined,
    updatedAt: nowIso()
  };
  await upsertRecordingRow(env, sessionId, status);
  return status;
}

export async function stopSessionRecording(
  env: Env,
  userId: string,
  sessionId: number
): Promise<SessionRecordingStatus> {
  const session = await ensureSessionExists(env, sessionId);
  if (session.host_user_id !== userId) {
    throw new Error('녹화를 중단할 권한이 없습니다.');
  }
  const current = await fetchRecordingRow(env, sessionId);
  const status: SessionRecordingStatus = {
    sessionId,
    status: 'completed',
    recordAudio: current ? intToBool(current.record_audio) : true,
    recordVideo: current ? intToBool(current.record_video) : false,
    recordTranscript: current ? intToBool(current.record_transcript) : true,
    downloadUrl: current?.download_url ?? `/sessions/${sessionId}/recordings/latest`,
    updatedAt: nowIso()
  };
  await upsertRecordingRow(env, sessionId, status);
  return status;
}

export async function getSessionRecording(
  env: Env,
  sessionId: number
): Promise<SessionRecordingStatus> {
  const stored = await fetchRecordingRow(env, sessionId);
  if (stored) {
    return {
      sessionId,
      status: stored.status as SessionRecordingStatus['status'],
      recordAudio: intToBool(stored.record_audio),
      recordVideo: intToBool(stored.record_video),
      recordTranscript: intToBool(stored.record_transcript),
      downloadUrl: stored.download_url ?? undefined,
      message: stored.message ?? undefined,
      updatedAt: stored.updated_at
    };
  }
  return {
    sessionId,
    status: 'idle',
    recordAudio: false,
    recordVideo: false,
    recordTranscript: false,
    updatedAt: nowIso()
  };
}

export async function getSessionSummary(
  env: Env,
  sessionId: number
): Promise<SessionSummaryResponse> {
  const cached = await getStoredSessionSummary(env, sessionId);
  if (cached) return cached;
  return buildDefaultSessionSummary(env, sessionId);
}

export async function getSessionTranscript(
  env: Env,
  sessionId: number,
  language: string = 'default'
): Promise<SessionTranscriptResponse> {
  const row = await fetchTranscriptRow(env, sessionId, language);
  if (row) {
    return deserializeTranscriptRow(row);
  }
  const now = nowIso();
  const transcript: SessionTranscriptResponse = {
    sessionId,
    language,
    segments: [],
    generatedAt: now
  };
  await upsertTranscriptRow(env, {
    session_id: sessionId,
    language,
    segments: JSON.stringify(transcript.segments),
    generated_at: now,
    updated_at: now
  });
  return transcript;
}
