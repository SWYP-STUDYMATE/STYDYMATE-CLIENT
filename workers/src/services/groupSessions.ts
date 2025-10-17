import type { Env } from '../index';
import type { GroupSessionRecord, GroupSessionListItem, GroupSessionParticipant } from '../types';
import { query, queryFirst, execute } from '../utils/db';
import {
  getCachedGroupSession,
  setCachedGroupSession,
  invalidateGroupSessionCache
} from './groupSessionsCache';
import {
  saveInvitation as saveSessionInvitation,
  getInvitation as getSessionInvitation,
  deleteInvitation as deleteSessionInvitation,
  addActiveSession,
  removeActiveSession,
  addRecentSession
} from './groupSessionsState';
import { createNotification } from './notifications';

interface CreateGroupSessionPayload {
  title: string;
  description?: string;
  topicCategory: string;
  targetLanguage: string;
  languageLevel: string;
  maxParticipants: number;
  scheduledAt: string;
  sessionDuration: number;
  sessionTags?: string[];
  isPublic: boolean;
}

interface JoinPayload {
  joinCode?: string;
  message?: string;
}

interface GroupSessionRow {
  session_id: string;
  title: string;
  description: string | null;
  host_user_id: string;
  topic_category: string | null;
  target_language: string | null;
  language_level: string | null;
  max_participants: number | null;
  current_participants: number | null;
  scheduled_at: string | null;
  session_duration: number | null;
  status: string | null;
  room_id: string | null;
  session_tags: string | null;
  is_public: number | null;
  join_code: string | null;
  started_at: string | null;
  ended_at: string | null;
  rating_average: number | null;
  rating_count: number | null;
  host_user_name?: string | null;
  host_profile_image?: string | null;
}

interface ParticipantRow {
  participant_id: string;
  session_id: string;
  user_id: string;
  status: string | null;
  joined_at: string | null;
  left_at: string | null;
  participation_duration: number | null;
  rating: number | null;
  feedback: string | null;
  connection_quality: string | null;
  is_muted: number | null;
  is_video_enabled: number | null;
  user_name?: string | null;
  profile_image?: string | null;
}

const GROUP_STATUS = {
  SCHEDULED: 'SCHEDULED',
  WAITING: 'WAITING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

const PARTICIPANT_STATUS = {
  INVITED: 'INVITED',
  JOINED: 'JOINED',
  LEFT: 'LEFT',
  KICKED: 'KICKED',
  BANNED: 'BANNED'
} as const;

function nowIso(): string {
  return new Date().toISOString();
}

function newJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function mapGroupSession(row: GroupSessionRow, participants: GroupSessionParticipant[] = [], currentUserId?: string): GroupSessionRecord {
  const isPublic = row.is_public === null ? undefined : Number(row.is_public) !== 0;
  const currentParticipants = Number(row.current_participants ?? 0);
  const maxParticipants = row.max_participants !== null ? Number(row.max_participants) : undefined;
  const status = row.status ?? GROUP_STATUS.SCHEDULED;
  const tags = row.session_tags
    ? row.session_tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;

  return {
    id: row.session_id,
    title: row.title,
    description: row.description ?? undefined,
    hostUserId: row.host_user_id,
    hostUserName: row.host_user_name ?? undefined,
    hostProfileImage: row.host_profile_image ?? undefined,
    topicCategory: row.topic_category ?? undefined,
    targetLanguage: row.target_language ?? undefined,
    languageLevel: row.language_level ?? undefined,
    maxParticipants,
    currentParticipants,
    scheduledAt: row.scheduled_at ?? undefined,
    sessionDuration: row.session_duration !== null ? Number(row.session_duration) : undefined,
    status,
    roomId: row.room_id ?? undefined,
    sessionTags: tags && tags.length > 0 ? tags : undefined,
    isPublic,
    joinCode: row.join_code ?? undefined,
    startedAt: row.started_at ?? undefined,
    endedAt: row.ended_at ?? undefined,
    ratingAverage: row.rating_average !== null ? Number(row.rating_average) : undefined,
    ratingCount: row.rating_count !== null ? Number(row.rating_count) : undefined,
    participants,
    canJoin:
      currentUserId !== undefined &&
      row.host_user_id !== currentUserId &&
      (isPublic ?? false) &&
      status === GROUP_STATUS.SCHEDULED &&
      currentParticipants < (maxParticipants ?? 10),
    joinMessage: undefined
  };
}

function cloneParticipants(participants?: GroupSessionParticipant[]): GroupSessionParticipant[] | undefined {
  return participants ? participants.map((participant) => ({ ...participant })) : undefined;
}

function applyJoinMetadata(
  record: GroupSessionRecord,
  currentUserId?: string
): GroupSessionRecord {
  const cloned: GroupSessionRecord = {
    ...record,
    participants: cloneParticipants(record.participants)
  };

  const isPublic = record.isPublic ?? false;
  const status = record.status ?? GROUP_STATUS.SCHEDULED;
  const maxParticipants = record.maxParticipants ?? 10;

  cloned.canJoin =
    currentUserId !== undefined &&
    record.hostUserId !== currentUserId &&
    isPublic &&
    status === GROUP_STATUS.SCHEDULED &&
    record.currentParticipants < maxParticipants;

  return cloned;
}

function mapGroupList(row: GroupSessionRow, currentUserId?: string): GroupSessionListItem {
  const scheduledAt = row.scheduled_at ?? undefined;
  const status = row.status ?? GROUP_STATUS.SCHEDULED;
  let timeUntilStart: string | undefined;
  if (scheduledAt) {
    const diffMs = new Date(scheduledAt).getTime() - Date.now();
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      timeUntilStart = `${hours}h ${minutes}m`;
    }
  }
  const tags = row.session_tags
    ? row.session_tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;
  return {
    id: row.session_id,
    title: row.title,
    description: row.description ?? undefined,
    hostUserName: row.host_user_name ?? undefined,
    hostProfileImage: row.host_profile_image ?? undefined,
    topicCategory: row.topic_category ?? undefined,
    targetLanguage: row.target_language ?? undefined,
    languageLevel: row.language_level ?? undefined,
    maxParticipants: row.max_participants !== null ? Number(row.max_participants) : undefined,
    currentParticipants: Number(row.current_participants ?? 0),
    scheduledAt,
    sessionDuration: row.session_duration !== null ? Number(row.session_duration) : undefined,
    status,
    sessionTags: tags && tags.length > 0 ? tags : undefined,
    ratingAverage: row.rating_average !== null ? Number(row.rating_average) : undefined,
    ratingCount: row.rating_count !== null ? Number(row.rating_count) : undefined,
    canJoin:
      currentUserId !== undefined &&
      row.host_user_id !== currentUserId &&
      status === GROUP_STATUS.SCHEDULED &&
      Number(row.current_participants ?? 0) < Number(row.max_participants ?? 10),
    timeUntilStart
  };
}

async function fetchParticipants(env: Env, sessionId: string): Promise<GroupSessionParticipant[]> {
  const rows = await query<ParticipantRow>(
    env.DB,
    `SELECT gsp.*, u.name AS user_name, u.profile_image AS profile_image
       FROM group_session_participants gsp
       LEFT JOIN users u ON u.user_id = gsp.user_id
      WHERE gsp.session_id = ?
      ORDER BY gsp.joined_at ASC`,
    [sessionId]
  );
  return rows.map((row) => ({
    userId: row.user_id,
    userName: row.user_name ?? undefined,
    profileImage: row.profile_image ?? undefined,
    status: row.status ?? undefined,
    joinedAt: row.joined_at ?? undefined,
    isMuted: row.is_muted === null ? undefined : Boolean(row.is_muted),
    isVideoEnabled: row.is_video_enabled === null ? undefined : Boolean(row.is_video_enabled)
  }));
}

export async function createGroupSession(env: Env, hostUserId: string, payload: CreateGroupSessionPayload): Promise<GroupSessionRecord> {
  const now = nowIso();
  const sessionId = crypto.randomUUID();
  const joinCode = newJoinCode();
  await execute(
    env.DB,
    `INSERT INTO group_sessions (
        session_id,
        title,
        description,
        host_user_id,
        topic_category,
        target_language,
        language_level,
        max_participants,
        current_participants,
        scheduled_at,
        session_duration,
        status,
        room_id,
        session_tags,
        is_public,
        join_code,
        started_at,
        ended_at,
        rating_average,
        rating_count,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, NULL, ?, ?, ?, NULL, NULL, 0, 0, ?, ?)
    `,
    [
      sessionId,
      payload.title,
      payload.description ?? null,
      hostUserId,
      payload.topicCategory,
      payload.targetLanguage,
      payload.languageLevel,
      payload.maxParticipants,
      payload.scheduledAt,
      payload.sessionDuration,
      GROUP_STATUS.SCHEDULED,
      payload.sessionTags ? payload.sessionTags.join(',') : null,
      payload.isPublic ? 1 : 0,
      joinCode,
      now,
      now
    ]
  );

  await execute(
    env.DB,
    `INSERT INTO group_session_participants (
        participant_id,
        session_id,
        user_id,
        status,
        joined_at,
        left_at,
        participation_duration,
        rating,
        feedback,
        connection_quality,
        is_muted,
        is_video_enabled,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, 0, 1, ?, ?)
    `,
    [crypto.randomUUID(), sessionId, hostUserId, PARTICIPANT_STATUS.JOINED, now, now, now]
  );

  const row = await queryFirst<GroupSessionRow>(
    env.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      WHERE gs.session_id = ?
      LIMIT 1`,
    [sessionId]
  );
  if (!row) {
    throw new Error('그룹 세션을 찾을 수 없습니다.');
  }

  const participants = await fetchParticipants(env, sessionId);
  const baseRecord = mapGroupSession(row, participants);
  await setCachedGroupSession(env, baseRecord);
  await addActiveSession(env, hostUserId, sessionId);
  await addRecentSession(env, hostUserId, sessionId);
  return applyJoinMetadata(baseRecord, hostUserId);
}

export async function getGroupSessionById(env: Env, sessionId: string, currentUserId?: string): Promise<GroupSessionRecord> {
  const cached = await getCachedGroupSession(env, sessionId);
  if (cached) {
    if (currentUserId) {
      await addRecentSession(env, currentUserId, sessionId);
    }
    return applyJoinMetadata(cached, currentUserId);
  }

  const row = await queryFirst<GroupSessionRow>(
    env.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      WHERE gs.session_id = ?
      LIMIT 1`,
    [sessionId]
  );
  if (!row) throw new Error('그룹 세션을 찾을 수 없습니다.');
  const participants = await fetchParticipants(env, sessionId);
  const baseRecord = mapGroupSession(row, participants);
  await setCachedGroupSession(env, baseRecord);
  return applyJoinMetadata(baseRecord, currentUserId);
}

async function ensureParticipant(env: Env, sessionId: string, userId: string): Promise<ParticipantRow | null> {
  return queryFirst<ParticipantRow>(
    env.DB,
    `SELECT * FROM group_session_participants WHERE session_id = ? AND user_id = ? LIMIT 1`,
    [sessionId, userId]
  );
}

export async function joinGroupSession(env: Env, userId: string, sessionId: string, payload: JoinPayload = {}): Promise<GroupSessionRecord> {
  const session = await getGroupSessionById(env, sessionId);
  if (session.hostUserId === userId) {
    return session;
  }
  if (session.status !== GROUP_STATUS.SCHEDULED) {
    throw new Error('이미 진행 중이거나 종료된 세션입니다.');
  }
  if (session.currentParticipants >= (session.maxParticipants ?? 10)) {
    throw new Error('세션 정원이 가득 찼습니다.');
  }

  const existing = await ensureParticipant(env, sessionId, userId);
  if (existing && existing.status === PARTICIPANT_STATUS.JOINED) {
    return session;
  }

  // 참가자 정보 조회
  const userInfo = await queryFirst<{
    english_name: string | null;
    name: string | null;
  }>(env.DB, 'SELECT english_name, name FROM users WHERE user_id = ? LIMIT 1', [userId]);

  const userName = userInfo?.english_name || userInfo?.name || '사용자';

  const now = nowIso();
  if (existing) {
    await execute(
      env.DB,
      `UPDATE group_session_participants
         SET status = ?, joined_at = ?, left_at = NULL, updated_at = ?
       WHERE session_id = ? AND user_id = ?`,
      [PARTICIPANT_STATUS.JOINED, now, now, sessionId, userId]
    );
  } else {
    await execute(
      env.DB,
      `INSERT INTO group_session_participants (
          participant_id, session_id, user_id, status, joined_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      [crypto.randomUUID(), sessionId, userId, PARTICIPANT_STATUS.JOINED, now, now, now]
    );
  }

  await execute(
    env.DB,
    `UPDATE group_sessions
        SET current_participants = current_participants + 1,
            updated_at = ?
      WHERE session_id = ?`,
    [now, sessionId]
  );

  // 호스트에게 참가 알림 전송
  try {
    await createNotification(env, {
      userId: session.hostUserId,
      type: 'GROUP_SESSION_JOINED',
      title: '새로운 참가자',
      content: `${userName}님이 "${session.title}" 그룹 세션에 참가했습니다.`,
      category: 'group_session',
      priority: 1,
      actionUrl: `/group-sessions/${sessionId}`,
      actionData: {
        sessionId,
        sessionTitle: session.title,
        participantId: userId,
        participantName: userName
      },
      senderUserId: userId
    });
  } catch (error) {
    console.error('Failed to send GROUP_SESSION_JOINED notification:', error);
  }

  await invalidateGroupSessionCache(env, sessionId);
  await addActiveSession(env, userId, sessionId);
  await addRecentSession(env, userId, sessionId);
  return getGroupSessionById(env, sessionId, userId);
}

export async function joinGroupSessionByCode(env: Env, userId: string, joinCode: string, payload: JoinPayload = {}) {
  const row = await queryFirst<{ session_id: string }>(
    env.DB,
    'SELECT session_id FROM group_sessions WHERE join_code = ? LIMIT 1',
    [joinCode]
  );
  if (!row) throw new Error('참가 코드를 찾을 수 없습니다.');
  return joinGroupSession(env, userId, row.session_id, payload);
}

export async function leaveGroupSession(env: Env, userId: string, sessionId: string) {
  const participant = await ensureParticipant(env, sessionId, userId);
  if (!participant || participant.status !== PARTICIPANT_STATUS.JOINED) {
    return;
  }
  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE group_session_participants
        SET status = ?, left_at = ?, updated_at = ?
      WHERE session_id = ? AND user_id = ?`,
    [PARTICIPANT_STATUS.LEFT, now, now, sessionId, userId]
  );
  await execute(
    env.DB,
    `UPDATE group_sessions
        SET current_participants = CASE WHEN current_participants > 0 THEN current_participants - 1 ELSE 0 END,
            updated_at = ?
      WHERE session_id = ?`,
    [now, sessionId]
  );

  await invalidateGroupSessionCache(env, sessionId);
  await removeActiveSession(env, userId, sessionId);
}

export async function startGroupSession(env: Env, userId: string, sessionId: string) {
  const session = await getGroupSessionById(env, sessionId);
  if (session.hostUserId !== userId) throw new Error('세션을 시작할 권한이 없습니다.');
  const now = nowIso();
  await execute(
    env.DB,
    'UPDATE group_sessions SET status = ?, started_at = ?, updated_at = ? WHERE session_id = ?',
    [GROUP_STATUS.ACTIVE, now, now, sessionId]
  );

  // 모든 참가자에게 세션 시작 알림 전송
  const participants = await query<{ user_id: string }>(
    env.DB,
    'SELECT user_id FROM group_session_participants WHERE session_id = ? AND status = ? AND user_id != ?',
    [sessionId, PARTICIPANT_STATUS.JOINED, userId]
  );

  for (const participant of participants) {
    try {
      await createNotification(env, {
        userId: participant.user_id,
        type: 'GROUP_SESSION_STARTED',
        title: '그룹 세션 시작',
        content: `"${session.title}" 그룹 세션이 시작되었습니다. 지금 참여하세요!`,
        category: 'group_session',
        priority: 3, // 긴급 (세션이 시작되었으므로 즉시 알림 필요)
        actionUrl: `/group-sessions/${sessionId}`,
        actionData: {
          sessionId,
          sessionTitle: session.title,
          hostUserId: userId
        },
        senderUserId: userId
      });
    } catch (error) {
      console.error(`Failed to send GROUP_SESSION_STARTED notification to ${participant.user_id}:`, error);
    }
  }

  await invalidateGroupSessionCache(env, sessionId);
  return getGroupSessionById(env, sessionId, userId);
}

export async function endGroupSession(env: Env, userId: string, sessionId: string) {
  const session = await getGroupSessionById(env, sessionId);
  if (session.hostUserId !== userId) throw new Error('세션을 종료할 권한이 없습니다.');
  const now = nowIso();
  await execute(
    env.DB,
    'UPDATE group_sessions SET status = ?, ended_at = ?, updated_at = ? WHERE session_id = ?',
    [GROUP_STATUS.COMPLETED, now, now, sessionId]
  );
  await invalidateGroupSessionCache(env, sessionId);
  return getGroupSessionById(env, sessionId, userId);
}

export async function cancelGroupSession(env: Env, userId: string, sessionId: string, reason?: string) {
  const session = await getGroupSessionById(env, sessionId);
  if (session.hostUserId !== userId) throw new Error('세션을 취소할 권한이 없습니다.');

  // 모든 참가자 조회
  const participants = await query<{ user_id: string }>(
    env.DB,
    'SELECT user_id FROM group_session_participants WHERE session_id = ? AND status = ? AND user_id != ?',
    [sessionId, PARTICIPANT_STATUS.JOINED, userId]
  );

  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE group_sessions
        SET status = ?, ended_at = ?, updated_at = ?
      WHERE session_id = ?`,
    [GROUP_STATUS.CANCELLED, now, now, sessionId]
  );
  await execute(
    env.DB,
    `UPDATE group_session_participants
        SET status = ?, updated_at = ?
      WHERE session_id = ? AND status = ?`,
    [PARTICIPANT_STATUS.LEFT, now, sessionId, PARTICIPANT_STATUS.JOINED]
  );

  // 모든 참가자에게 취소 알림 전송
  const reasonText = reason ? ` (사유: ${reason})` : '';
  for (const participant of participants) {
    try {
      await createNotification(env, {
        userId: participant.user_id,
        type: 'GROUP_SESSION_CANCELLED',
        title: '그룹 세션 취소',
        content: `"${session.title}" 그룹 세션이 취소되었습니다${reasonText}.`,
        category: 'group_session',
        priority: 2,
        actionUrl: `/group-sessions`,
        actionData: {
          sessionId,
          sessionTitle: session.title,
          hostUserId: userId,
          reason
        },
        senderUserId: userId
      });
    } catch (error) {
      console.error(`Failed to send GROUP_SESSION_CANCELLED notification to ${participant.user_id}:`, error);
    }
  }

  await invalidateGroupSessionCache(env, sessionId);
}

export async function listAvailableGroupSessions(
  env: Env,
  page: number,
  size: number,
  filters: { language?: string; level?: string; category?: string; tags?: string[] } = {},
  currentUserId?: string
) {
  const offset = (page - 1) * size;
  const where: string[] = ['status = ?', 'is_public = 1'];
  const params: any[] = [GROUP_STATUS.SCHEDULED];

  if (filters.language) {
    where.push('UPPER(target_language) = UPPER(?)');
    params.push(filters.language);
  }
  if (filters.level) {
    where.push('UPPER(language_level) = UPPER(?)');
    params.push(filters.level);
  }
  if (filters.category) {
    where.push('UPPER(topic_category) = UPPER(?)');
    params.push(filters.category);
  }
  if (filters.tags && filters.tags.length > 0) {
    where.push(filters.tags.map(() => "session_tags LIKE '%' || ? || '%' ").join(' AND '));
    params.push(...filters.tags);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM group_sessions ${whereClause}`,
    params
  );

  const rows = await query<GroupSessionRow>(
    env.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      ${whereClause}
      ORDER BY gs.scheduled_at ASC
      LIMIT ? OFFSET ?`,
    [...params, size, offset]
  );

  const data = rows.map((row) => mapGroupList(row, currentUserId));
  return {
    data,
    page,
    size,
    total: totalRow?.count ?? 0
  };
}

export async function listUserGroupSessions(env: Env, userId: string, status?: string) {
  const rows = await query<GroupSessionRow>(
    env.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_session_participants gsp
       JOIN group_sessions gs ON gs.session_id = gsp.session_id
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      WHERE gsp.user_id = ? ${status ? 'AND gs.status = ?' : ''}
      ORDER BY gs.scheduled_at DESC`,
    status ? [userId, status] : [userId]
  );
  const result: GroupSessionRecord[] = [];
  for (const row of rows) {
    const participants = await fetchParticipants(env, row.session_id);
    result.push(mapGroupSession(row, participants, userId));
  }
  return result;
}

export async function listHostedGroupSessions(env: Env, userId: string) {
  const rows = await query<GroupSessionRow>(
    env.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      WHERE gs.host_user_id = ?
      ORDER BY gs.scheduled_at DESC`,
    [userId]
  );
  const result: GroupSessionRecord[] = [];
  for (const row of rows) {
    const participants = await fetchParticipants(env, row.session_id);
    result.push(mapGroupSession(row, participants, userId));
  }
  return result;
}

export async function kickGroupParticipant(env: Env, hostUserId: string, sessionId: string, participantId: string) {
  const session = await getGroupSessionById(env, sessionId, hostUserId);
  if (session.hostUserId !== hostUserId) throw new Error('참가자를 추방할 권한이 없습니다.');
  const participant = await ensureParticipant(env, sessionId, participantId);
  if (!participant) throw new Error('참가자를 찾을 수 없습니다.');
  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE group_session_participants
        SET status = ?, left_at = ?, updated_at = ?
      WHERE session_id = ? AND user_id = ?`,
    [PARTICIPANT_STATUS.KICKED, now, now, sessionId, participantId]
  );
  await execute(
    env.DB,
    `UPDATE group_sessions
        SET current_participants = CASE WHEN current_participants > 0 THEN current_participants - 1 ELSE 0 END,
            updated_at = ?
      WHERE session_id = ?`,
    [now, sessionId]
  );

  await invalidateGroupSessionCache(env, sessionId);
  await removeActiveSession(env, participantId, sessionId);
}

export async function rateGroupSession(env: Env, userId: string, sessionId: string, rating: number, feedback?: string) {
  const participant = await ensureParticipant(env, sessionId, userId);
  if (!participant || participant.status !== PARTICIPANT_STATUS.JOINED) {
    throw new Error('세션에 참가하지 않았습니다.');
  }
  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE group_session_participants
        SET rating = ?, feedback = ?, updated_at = ?
      WHERE session_id = ? AND user_id = ?`,
    [rating, feedback ?? null, now, sessionId, userId]
  );

  await execute(
    env.DB,
    `UPDATE group_sessions
        SET rating_average = (
          SELECT AVG(rating) FROM group_session_participants
            WHERE session_id = ? AND rating IS NOT NULL
        ),
            rating_count = (
          SELECT COUNT(*) FROM group_session_participants
            WHERE session_id = ? AND rating IS NOT NULL
        ),
            updated_at = ?
      WHERE session_id = ?`,
    [sessionId, sessionId, now, sessionId]
  );

  await invalidateGroupSessionCache(env, sessionId);
}

export async function updateGroupSession(env: Env, hostUserId: string, sessionId: string, payload: CreateGroupSessionPayload) {
  const session = await getGroupSessionById(env, sessionId);
  if (session.hostUserId !== hostUserId) throw new Error('세션을 수정할 권한이 없습니다.');

  // 모든 참가자 조회
  const participants = await query<{ user_id: string }>(
    env.DB,
    'SELECT user_id FROM group_session_participants WHERE session_id = ? AND status = ? AND user_id != ?',
    [sessionId, PARTICIPANT_STATUS.JOINED, hostUserId]
  );

  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE group_sessions
        SET title = ?,
            description = ?,
            topic_category = ?,
            target_language = ?,
            language_level = ?,
            max_participants = ?,
            scheduled_at = ?,
            session_duration = ?,
            session_tags = ?,
            is_public = ?,
            updated_at = ?
      WHERE session_id = ?`,
    [
      payload.title,
      payload.description ?? null,
      payload.topicCategory,
      payload.targetLanguage,
      payload.languageLevel,
      payload.maxParticipants,
      payload.scheduledAt,
      payload.sessionDuration,
      payload.sessionTags ? payload.sessionTags.join(',') : null,
      payload.isPublic ? 1 : 0,
      now,
      sessionId
    ]
  );

  // 세션 정보가 변경되었음을 참가자들에게 알림
  let changeDetails = '';
  if (session.title !== payload.title) {
    changeDetails = '세션 제목이 변경되었습니다.';
  } else if (session.scheduledAt !== payload.scheduledAt) {
    changeDetails = '세션 일정이 변경되었습니다.';
  } else {
    changeDetails = '세션 정보가 업데이트되었습니다.';
  }

  for (const participant of participants) {
    try {
      await createNotification(env, {
        userId: participant.user_id,
        type: 'GROUP_SESSION_UPDATED',
        title: '그룹 세션 변경',
        content: `"${payload.title}" 그룹 세션 정보가 업데이트되었습니다. ${changeDetails}`,
        category: 'group_session',
        priority: 2,
        actionUrl: `/group-sessions/${sessionId}`,
        actionData: {
          sessionId,
          sessionTitle: payload.title,
          hostUserId,
          scheduledAt: payload.scheduledAt,
          changes: changeDetails
        },
        senderUserId: hostUserId
      });
    } catch (error) {
      console.error(`Failed to send GROUP_SESSION_UPDATED notification to ${participant.user_id}:`, error);
    }
  }

  await invalidateGroupSessionCache(env, sessionId);
}

export async function inviteToGroupSession(env: Env, hostUserId: string, sessionId: string, invitedUserIds: string[]) {
  const session = await getGroupSessionById(env, sessionId);
  if (session.hostUserId !== hostUserId) throw new Error('세션을 초대할 권한이 없습니다.');

  // 호스트 정보 조회
  const hostInfo = await queryFirst<{
    english_name: string | null;
    name: string | null;
  }>(env.DB, 'SELECT english_name, name FROM users WHERE user_id = ? LIMIT 1', [hostUserId]);

  const hostName = hostInfo?.english_name || hostInfo?.name || '사용자';
  const now = nowIso();

  for (const userId of invitedUserIds) {
    await execute(
      env.DB,
      `INSERT INTO group_session_participants (
          participant_id, session_id, user_id, status, joined_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, NULL, ?, ?)
        ON CONFLICT(session_id, user_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
      [crypto.randomUUID(), sessionId, userId, PARTICIPANT_STATUS.INVITED, now, now]
    );
    await saveSessionInvitation(env, sessionId, userId, hostUserId);

    // 초대 알림 전송
    try {
      await createNotification(env, {
        userId,
        type: 'GROUP_SESSION_INVITE',
        title: '그룹 세션 초대',
        content: `${hostName}님이 "${session.title}" 그룹 세션에 초대했습니다.`,
        category: 'group_session',
        priority: 2,
        actionUrl: `/group-sessions/${sessionId}`,
        actionData: {
          sessionId,
          sessionTitle: session.title,
          hostUserId,
          hostName,
          scheduledAt: session.scheduledAt
        },
        senderUserId: hostUserId
      });
    } catch (error) {
      console.error('Failed to send GROUP_SESSION_INVITE notification:', error);
    }
  }
  await invalidateGroupSessionCache(env, sessionId);
  return getGroupSessionById(env, sessionId, hostUserId);
}

export async function respondToInvitation(env: Env, userId: string, sessionId: string, accept: boolean) {
  const invitation = await getSessionInvitation(env, sessionId, userId);
  if (!invitation) throw new Error('초대 기록이 없습니다.');
  const participant = await ensureParticipant(env, sessionId, userId);
  if (!participant) throw new Error('초대 기록이 없습니다.');
  const now = nowIso();
  if (accept) {
    await execute(
      env.DB,
      `UPDATE group_session_participants
          SET status = ?, joined_at = COALESCE(joined_at, ?), updated_at = ?
        WHERE session_id = ? AND user_id = ?`,
      [PARTICIPANT_STATUS.JOINED, now, now, sessionId, userId]
    );
    await execute(
      env.DB,
      `UPDATE group_sessions
          SET current_participants = current_participants + 1,
              updated_at = ?
        WHERE session_id = ?`,
      [now, sessionId]
    );
    await addActiveSession(env, userId, sessionId);
  } else {
    await execute(
      env.DB,
      `UPDATE group_session_participants
          SET status = ?, updated_at = ?, left_at = COALESCE(left_at, ?)
        WHERE session_id = ? AND user_id = ?`,
      [PARTICIPANT_STATUS.BANNED, now, now, sessionId, userId]
    );
  }

  await invalidateGroupSessionCache(env, sessionId);
  await deleteSessionInvitation(env, sessionId, userId);
}

export async function getRecommendedGroupSessions(env: Env, userId: string) {
  const rows = await query<GroupSessionRow>(
    env.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      WHERE gs.is_public = 1 AND gs.status = ?
      ORDER BY gs.scheduled_at ASC
      LIMIT 5`,
    [GROUP_STATUS.SCHEDULED]
  );
  const items: GroupSessionRecord[] = [];
  for (const row of rows) {
    const participants = await fetchParticipants(env, row.session_id);
    items.push(mapGroupSession(row, participants, userId));
  }
  return items;
}

export async function searchGroupSessions(env: Env, keyword: string, language?: string, level?: string) {
  const where: string[] = ['is_public = 1'];
  const params: any[] = [];
  if (keyword) {
    where.push('(title LIKE ? OR description LIKE ? OR topic_category LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }
  if (language) {
    where.push('target_language = ?');
    params.push(language);
  }
  if (level) {
    where.push('language_level = ?');
    params.push(level);
  }
  const rows = await query<GroupSessionRow>(
    env.DB,
    `SELECT gs.*, host.name AS host_user_name, host.profile_image AS host_profile_image
       FROM group_sessions gs
       LEFT JOIN users host ON host.user_id = gs.host_user_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY gs.scheduled_at ASC
      LIMIT 50`,
    params
  );
  return rows.map((row: any) => mapGroupList(row));
}
