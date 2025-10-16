import type { Env } from '../index';
import { query, queryFirst, execute, transaction } from '../utils/db';
import { AppError } from '../utils/errors';
import type {
  MatchingPartner,
  MatchingRequestItem,
  MatchSummary,
  CompatibilityScoreResponseType,
  CompatibilitySharedInsights,
  CompatibilityCategoryDetail
} from '../types';

const MATCHING_DEFAULT_EXPIRE_DAYS = 7;

interface RecommendOptions {
  nativeLanguage?: string;
  targetLanguage?: string;
  languageLevel?: string;
  minAge?: number;
  maxAge?: number;
  page: number;
  size: number;
}

interface RequestInsertPayload {
  senderId: string;
  receiverId: string;
  message?: string;
}

interface AcceptOptions {
  requestId: string;
  receiverId: string;
  responseMessage?: string;
}

interface RejectOptions {
  requestId: string;
  receiverId: string;
  responseMessage?: string;
}

interface RemoveMatchOptions {
  matchId: string;
  userId: string;
}

interface PaginatedResult<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
}

interface TargetLanguageProfile {
  languageId?: number;
  languageCode?: string;
  languageName?: string;
  currentLevelOrder?: number | null;
  targetLevelOrder?: number | null;
}

interface CompatibilityProfile {
  userId: string;
  nativeLanguageId?: number;
  nativeLanguageCode?: string;
  nativeLanguageName?: string;
  targetLanguages: TargetLanguageProfile[];
  personalities: string[];
  studyGoals: string[];
  interests: string[];
}

const MATCHING_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
} as const;

export async function recommendPartners(
  env: Env,
  userId: string,
  options: RecommendOptions
): Promise<PaginatedResult<MatchingPartner>> {
  const whereClauses: string[] = ['u.user_id != ?', 'IFNULL(u.user_disable, 0) = 0'];
  const params: (string | number)[] = [userId];

  if (options.nativeLanguage) {
    whereClauses.push('EXISTS (SELECT 1 FROM languages nl WHERE nl.language_id = u.native_lang_id AND (nl.language_code = ? OR nl.language_name = ?))');
    params.push(options.nativeLanguage, options.nativeLanguage);
  }

  if (options.targetLanguage) {
    whereClauses.push(
      `EXISTS (
        SELECT 1 FROM onboarding_lang_level oll
        JOIN languages tl ON tl.language_id = oll.language_id
        WHERE oll.user_id = u.user_id AND (tl.language_code = ? OR tl.language_name = ?)
      )`
    );
    params.push(options.targetLanguage, options.targetLanguage);
  }

  if (options.languageLevel) {
    whereClauses.push(
      `EXISTS (
        SELECT 1 FROM onboarding_lang_level oll
        JOIN lang_level_type lt ON lt.lang_level_id = oll.target_level_id
        WHERE oll.user_id = u.user_id AND (lt.lang_level_name = ? OR lt.category = ?)
      )`
    );
    params.push(options.languageLevel, options.languageLevel);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM users u ${where}`,
    params
  );

  const total = totalRow?.count ?? 0;
  const offset = (options.page - 1) * options.size;

  const selectParams = [...params, options.size, offset];

  const rows = await query<{
    user_id: string;
    name: string | null;
    english_name: string | null;
    profile_image: string | null;
    self_bio: string | null;
    birthyear: string | null;
    gender: string | null;
    location_country: string | null;
    location_city: string | null;
    native_lang_id: number | null;
    native_language_name: string | null;
    native_language_code: string | null;
    communication_method: string | null;
    daily_minute: string | null;
    partner_gender: string | null;
    learning_expectation: string | null;
    status: string | null;
    last_seen_at: string | null;
  }>(
    env.DB,
    `SELECT
        u.user_id,
        u.name,
        u.english_name,
        u.profile_image,
        u.self_bio,
        u.birthyear,
        u.gender,
        loc.country AS location_country,
        loc.city AS location_city,
        u.native_lang_id,
        nl.language_name AS native_language_name,
        nl.language_code AS native_language_code,
        u.communication_method,
        u.daily_minute,
        u.partner_gender,
        u.learning_expectation,
        us.status,
        us.last_seen_at
      FROM users u
      LEFT JOIN user_status us ON us.user_id = u.user_id
      LEFT JOIN locations loc ON loc.location_id = u.location_id
      LEFT JOIN languages nl ON nl.language_id = u.native_lang_id
      ${where}
      ORDER BY u.updated_at DESC, u.created_at DESC
      LIMIT ? OFFSET ?
    `,
    selectParams
  );

  const userIds = rows.map((row) => row.user_id);
  const targetLanguagesMap = await loadTargetLanguages(env, userIds);
  const interestsMap = await loadInterests(env, userIds);
  const personalitiesMap = await loadPartnerPersonalities(env, userIds);

  const partners: MatchingPartner[] = rows.map((row) => {
    const birthyearNum = row.birthyear ? Number(row.birthyear) : undefined;
    let age: number | undefined;
    if (birthyearNum && Number.isFinite(birthyearNum)) {
      const currentYear = new Date().getUTCFullYear();
      age = currentYear - birthyearNum;
    }

    const profileImageUrl = row.profile_image
      ? `/api/v1/upload/file/${row.profile_image}`
      : undefined;

    return {
      userId: row.user_id,
      englishName: row.english_name ?? row.name ?? undefined,
      profileImageUrl,
      selfBio: row.self_bio ?? undefined,
      age,
      gender: row.gender ?? undefined,
      location: row.location_country
        ? row.location_city
          ? `${row.location_country}, ${row.location_city}`
          : row.location_country
        : undefined,
      nativeLanguage: row.native_language_name ?? undefined,
      targetLanguages: targetLanguagesMap.get(row.user_id) ?? [],
      interests: interestsMap.get(row.user_id) ?? [],
      partnerPersonalities: personalitiesMap.get(row.user_id) ?? [],
      compatibilityScore: calculateQuickCompatibilityScore(row.user_id, userId),
      onlineStatus: row.status ?? 'OFFLINE',
      lastActiveTime: row.last_seen_at ?? undefined
    };
  });

  return {
    data: partners,
    page: options.page,
    size: options.size,
    total
  };
}

function calculateQuickCompatibilityScore(partnerId: string, currentUserId: string): number {
  const base = partnerId.localeCompare(currentUserId);
  const normalized = Math.abs(base) % 101;
  return Math.round(normalized);
}

async function loadTargetLanguages(env: Env, userIds: string[]) {
  const map = new Map<string, MatchingPartner['targetLanguages']>();
  if (userIds.length === 0) return map;

  const placeholders = userIds.map(() => '?').join(',');
  const rows = await query<{
    user_id: string;
    language_name: string | null;
    current_level_name: string | null;
    target_level_name: string | null;
  }>(
    env.DB,
    `SELECT
        oll.user_id,
        lang.language_name,
        curr.lang_level_name AS current_level_name,
        target.lang_level_name AS target_level_name
      FROM onboarding_lang_level oll
      LEFT JOIN languages lang ON lang.language_id = oll.language_id
      LEFT JOIN lang_level_type curr ON curr.lang_level_id = oll.current_level_id
      LEFT JOIN lang_level_type target ON target.lang_level_id = oll.target_level_id
      WHERE oll.user_id IN (${placeholders})
    `,
    userIds
  );

  for (const row of rows) {
    const list = map.get(row.user_id) ?? [];
    list.push({
      languageName: row.language_name ?? 'Unknown',
      currentLevel: row.current_level_name ?? undefined,
      targetLevel: row.target_level_name ?? undefined
    });
    map.set(row.user_id, list);
  }
  return map;
}

async function loadInterests(env: Env, userIds: string[]) {
  const map = new Map<string, string[]>();
  if (userIds.length === 0) return map;
  const placeholders = userIds.map(() => '?').join(',');
  const rows = await query<{
    user_id: string;
    topic_name: string | null;
  }>(
    env.DB,
    `SELECT ot.user_id, t.topic_name
       FROM onboarding_topic ot
       JOIN topic t ON t.topic_id = ot.topic_id
       WHERE ot.user_id IN (${placeholders})
    `,
    userIds
  );
  for (const row of rows) {
    const list = map.get(row.user_id) ?? [];
    if (row.topic_name) list.push(row.topic_name);
    map.set(row.user_id, list);
  }
  return map;
}

async function loadPartnerPersonalities(env: Env, userIds: string[]) {
  const map = new Map<string, string[]>();
  if (userIds.length === 0) return map;
  const placeholders = userIds.map(() => '?').join(',');
  const rows = await query<{
    user_id: string;
    partner_personality: string | null;
  }>(
    env.DB,
    `SELECT op.user_id, pp.partner_personality
       FROM onboarding_partner op
       JOIN partner_personality pp ON pp.partner_personality_id = op.partner_personality_id
       WHERE op.user_id IN (${placeholders})
    `,
    userIds
  );
  for (const row of rows) {
    const list = map.get(row.user_id) ?? [];
    if (row.partner_personality) list.push(row.partner_personality);
    map.set(row.user_id, list);
  }
  return map;
}

function nowIso(): string {
  return new Date().toISOString();
}

function addDays(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function normalizePair(a: string, b: string): [string, string] {
  return [a, b].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)) as [string, string];
}

export async function createMatchingRequest(env: Env, payload: RequestInsertPayload) {
  try {
    console.log('[createMatchingRequest] Starting with payload:', JSON.stringify({
      senderId: payload.senderId,
      receiverId: payload.receiverId,
      hasMessage: !!payload.message
    }));

    if (payload.senderId === payload.receiverId) {
      throw new AppError('자기 자신에게는 매칭을 보낼 수 없습니다.', 400, 'MATCHING_SELF_REQUEST');
    }

    // 중복 요청 확인
    console.log('[createMatchingRequest] Checking for duplicate requests');
    const duplicate = await queryFirst<{ request_id: string }>(
      env.DB,
      `SELECT request_id FROM matching_requests
         WHERE sender_id = ? AND receiver_id = ? AND status = ?
         LIMIT 1`,
      [payload.senderId, payload.receiverId, MATCHING_STATUS.PENDING]
    );

    if (duplicate) {
      console.log('[createMatchingRequest] Duplicate request found:', duplicate.request_id);
      throw new AppError('이미 대기 중인 매칭 요청이 있습니다.', 400, 'MATCHING_DUPLICATE_REQUEST');
    }

    // 기존 매칭 확인
    console.log('[createMatchingRequest] Checking for existing matches');
    const [user1, user2] = normalizePair(payload.senderId, payload.receiverId);
    const existingMatch = await queryFirst<{ match_id: string; is_active: number }>(
      env.DB,
      `SELECT match_id, is_active FROM user_matches
         WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
         LIMIT 1`,
      [user1, user2, user1, user2]
    );

    if (existingMatch?.is_active) {
      console.log('[createMatchingRequest] Active match found:', existingMatch.match_id);
      throw new AppError('이미 매칭된 사용자입니다.', 400, 'MATCHING_ALREADY_MATCHED');
    }

    // 매칭 요청 생성
    const requestId = crypto.randomUUID();
    const now = nowIso();
    const expiresAt = addDays(MATCHING_DEFAULT_EXPIRE_DAYS);

    console.log('[createMatchingRequest] Inserting new request:', {
      requestId,
      senderId: payload.senderId,
      receiverId: payload.receiverId
    });

    await execute(
      env.DB,
      `INSERT INTO matching_requests (
          request_id, sender_id, receiver_id, message, status, response_message,
          responded_at, expires_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?)
      `,
      [
        requestId,
        payload.senderId,
        payload.receiverId,
        payload.message ?? null,
        MATCHING_STATUS.PENDING,
        expiresAt,
        now,
        now
      ]
    );

    console.log('[createMatchingRequest] Successfully created request:', requestId);
    return { requestId };
  } catch (error) {
    console.error('[createMatchingRequest] Error occurred:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      payload: {
        senderId: payload.senderId,
        receiverId: payload.receiverId
      }
    });

    // AppError는 그대로 throw
    if (error instanceof AppError) {
      throw error;
    }

    // 기타 에러는 AppError로 변환
    throw new AppError(
      error instanceof Error ? error.message : '매칭 요청 생성 중 오류가 발생했습니다.',
      500,
      'MATCHING_REQUEST_CREATE_FAILED'
    );
  }
}

export async function listSentRequests(
  env: Env,
  userId: string,
  page: number,
  size: number
): Promise<PaginatedResult<MatchingRequestItem>> {
  return listRequests(env, { userId, page, size, mode: 'sent' });
}

export async function listReceivedRequests(
  env: Env,
  userId: string,
  page: number,
  size: number
): Promise<PaginatedResult<MatchingRequestItem>> {
  return listRequests(env, { userId, page, size, mode: 'received' });
}

async function listRequests(
  env: Env,
  options: { userId: string; page: number; size: number; mode: 'sent' | 'received' }
): Promise<PaginatedResult<MatchingRequestItem>> {
  const column = options.mode === 'sent' ? 'sender_id' : 'receiver_id';
  const partnerColumn = options.mode === 'sent' ? 'receiver_id' : 'sender_id';

  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count FROM matching_requests WHERE ${column} = ?`,
    [options.userId]
  );
  const total = totalRow?.count ?? 0;
  const offset = (options.page - 1) * options.size;

  const rows = await query<{
    request_id: string;
    sender_id: string;
    receiver_id: string;
    message: string | null;
    status: string;
    response_message: string | null;
    responded_at: string | null;
    expires_at: string | null;
    created_at: string;
    partner_id: string;
    partner_name: string | null;
    partner_profile_image: string | null;
  }>(
    env.DB,
    `SELECT
        mr.request_id,
        mr.sender_id,
        mr.receiver_id,
        mr.message,
        mr.status,
        mr.response_message,
        mr.responded_at,
        mr.expires_at,
        mr.created_at,
        partner.user_id AS partner_id,
        partner.name AS partner_name,
        partner.profile_image AS partner_profile_image
      FROM matching_requests mr
      JOIN users partner ON partner.user_id = mr.${partnerColumn}
      WHERE mr.${column} = ?
      ORDER BY mr.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [options.userId, options.size, offset]
  );

  const data: MatchingRequestItem[] = rows.map((row) => ({
    requestId: row.request_id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    message: row.message ?? undefined,
    status: row.status,
    responseMessage: row.response_message ?? undefined,
    respondedAt: row.responded_at ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
    partner: {
      userId: row.partner_id,
      name: row.partner_name ?? undefined,
      profileImageUrl: row.partner_profile_image
        ? `/api/v1/upload/file/${row.partner_profile_image}`
        : undefined
    }
  }));

  return {
    data,
    page: options.page,
    size: options.size,
    total
  };
}

export async function acceptMatchingRequest(env: Env, options: AcceptOptions) {
  const request = await queryFirst<{
    request_id: string;
    sender_id: string;
    receiver_id: string;
    status: string;
  }>(
    env.DB,
    'SELECT request_id, sender_id, receiver_id, status FROM matching_requests WHERE request_id = ? LIMIT 1',
    [options.requestId]
  );

  if (!request) {
    throw new Error('매칭 요청을 찾을 수 없습니다.');
  }
  if (request.receiver_id !== options.receiverId) {
    throw new Error('다른 사용자의 요청입니다.');
  }
  if (request.status !== MATCHING_STATUS.PENDING) {
    throw new Error('이미 처리된 요청입니다.');
  }

  const now = nowIso();
  const [user1, user2] = normalizePair(request.sender_id, request.receiver_id);

  await transaction(env.DB, [
    {
      sql: `UPDATE matching_requests
              SET status = ?, response_message = ?, responded_at = ?, updated_at = ?
            WHERE request_id = ?`,
      params: [
        MATCHING_STATUS.ACCEPTED,
        options.responseMessage ?? null,
        now,
        now,
        options.requestId
      ]
    },
    {
      sql: `INSERT INTO user_matches (
                match_id, user1_id, user2_id, matched_at, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 1, ?, ?)
            ON CONFLICT(user1_id, user2_id) DO UPDATE SET
              is_active = 1,
              matched_at = excluded.matched_at,
              deactivated_at = NULL,
              deactivated_by = NULL,
              updated_at = excluded.updated_at`,
      params: [crypto.randomUUID(), user1, user2, now, now, now]
    }
  ]);
}

export async function rejectMatchingRequest(env: Env, options: RejectOptions) {
  const request = await queryFirst<{
    receiver_id: string;
    status: string;
  }>(
    env.DB,
    'SELECT receiver_id, status FROM matching_requests WHERE request_id = ? LIMIT 1',
    [options.requestId]
  );

  if (!request) {
    throw new Error('매칭 요청을 찾을 수 없습니다.');
  }

  if (request.receiver_id !== options.receiverId) {
    throw new Error('다른 사용자의 요청입니다.');
  }

  if (request.status !== MATCHING_STATUS.PENDING) {
    throw new Error('이미 처리된 요청입니다.');
  }

  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE matching_requests
       SET status = ?, response_message = ?, responded_at = ?, updated_at = ?
       WHERE request_id = ?`,
    [MATCHING_STATUS.REJECTED, options.responseMessage ?? null, now, now, options.requestId]
  );
}

export async function listMatches(
  env: Env,
  userId: string,
  page: number,
  size: number
): Promise<PaginatedResult<MatchSummary>> {
  const totalRow = await queryFirst<{ count: number }>(
    env.DB,
    'SELECT COUNT(*) as count FROM user_matches WHERE is_active = 1 AND (user1_id = ? OR user2_id = ?)',
    [userId, userId]
  );
  const total = totalRow?.count ?? 0;
  const offset = (page - 1) * size;

  const rows = await query<{
    match_id: string;
    user1_id: string;
    user2_id: string;
    matched_at: string;
    partner_id: string;
    partner_name: string | null;
    partner_profile_image: string | null;
  }>(
    env.DB,
    `SELECT
        um.match_id,
        um.user1_id,
        um.user2_id,
        um.matched_at,
        CASE WHEN um.user1_id = ? THEN um.user2_id ELSE um.user1_id END AS partner_id,
        p.name AS partner_name,
        p.profile_image AS partner_profile_image
      FROM user_matches um
      JOIN users p ON p.user_id = CASE WHEN um.user1_id = ? THEN um.user2_id ELSE um.user1_id END
      WHERE um.is_active = 1 AND (um.user1_id = ? OR um.user2_id = ?)
      ORDER BY um.matched_at DESC
      LIMIT ? OFFSET ?
    `,
    [userId, userId, userId, userId, size, offset]
  );

  const data: MatchSummary[] = rows.map((row) => ({
    matchId: row.match_id,
    partnerId: row.partner_id,
    partnerName: row.partner_name ?? undefined,
    partnerProfileImageUrl: row.partner_profile_image
      ? `/api/v1/upload/file/${row.partner_profile_image}`
      : undefined,
    matchedAt: row.matched_at
  }));

  return {
    data,
    page,
    size,
    total
  };
}

export async function removeMatch(env: Env, options: RemoveMatchOptions) {
  const match = await queryFirst<{
    match_id: string;
    user1_id: string;
    user2_id: string;
    is_active: number;
  }>(
    env.DB,
    'SELECT match_id, user1_id, user2_id, is_active FROM user_matches WHERE match_id = ? LIMIT 1',
    [options.matchId]
  );

  if (!match) {
    throw new Error('매칭 정보를 찾을 수 없습니다.');
  }

  if (match.is_active !== 1) {
    return;
  }

  if (match.user1_id !== options.userId && match.user2_id !== options.userId) {
    throw new Error('해당 매칭에 대한 권한이 없습니다.');
  }

  const now = nowIso();
  await execute(
    env.DB,
    `UPDATE user_matches
       SET is_active = 0,
           deactivated_at = ?,
           deactivated_by = ?,
           updated_at = ?
       WHERE match_id = ?`,
    [now, options.userId, now, options.matchId]
  );
}

export async function getMatchingQueueStatus(env: Env, userId: string) {
  return queryFirst(
    env.DB,
    'SELECT queue_id, session_type, queue_status, priority_score, joined_at, estimated_wait_minutes FROM matching_queue WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
}

export async function addToMatchingQueue(env: Env, userId: string, sessionType: string) {
  const now = nowIso();
  await transaction(env.DB, [
    { sql: 'DELETE FROM matching_queue WHERE user_id = ?', params: [userId] },
    {
      sql: `INSERT INTO matching_queue (
              user_id, session_type, queue_status, priority_score,
              joined_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      params: [userId, sessionType, 'WAITING', 0, now, now, now]
    }
  ]);
}

export async function removeFromMatchingQueue(env: Env, userId: string) {
  await execute(env.DB, 'DELETE FROM matching_queue WHERE user_id = ?', [userId]);
}

export async function recordFeedback(
  env: Env,
  options: {
    reviewerId: string;
    partnerId: string;
    matchId: string;
    overallRating: number;
    writtenFeedback?: string;
    wouldMatchAgain?: boolean;
  }
) {
  const now = nowIso();
  await execute(
    env.DB,
    `INSERT INTO matching_feedback (
        reviewer_id, partner_id, match_id, overall_rating,
        written_feedback, would_match_again, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      options.reviewerId,
      options.partnerId,
      options.matchId,
      options.overallRating,
      options.writtenFeedback ?? null,
      options.wouldMatchAgain ? 1 : 0,
      now,
      now
  ]
  );
}

async function loadCompatibilityProfile(env: Env, userId: string): Promise<CompatibilityProfile> {
  const userRow = await queryFirst<{
    user_id: string;
    native_lang_id: number | null;
    language_code: string | null;
    language_name: string | null;
  }>(
    env.DB,
    `SELECT u.user_id,
            u.native_lang_id,
            lang.language_code,
            lang.language_name
       FROM users u
       LEFT JOIN languages lang ON lang.language_id = u.native_lang_id
      WHERE u.user_id = ?
      LIMIT 1`,
    [userId]
  );

  if (!userRow) {
    throw new AppError('사용자를 찾을 수 없습니다.', 404, 'MATCHING_USER_NOT_FOUND');
  }

  const languageRows = await query<{
    language_id: number | null;
    language_code: string | null;
    language_name: string | null;
    current_level_order: number | null;
    target_level_order: number | null;
  }>(
    env.DB,
    `SELECT
        oll.language_id,
        lang.language_code,
        lang.language_name,
        curr.level_order AS current_level_order,
        target.level_order AS target_level_order
      FROM onboarding_lang_level oll
      LEFT JOIN languages lang ON lang.language_id = oll.language_id
      LEFT JOIN lang_level_type curr ON curr.lang_level_id = oll.current_level_id
      LEFT JOIN lang_level_type target ON target.lang_level_id = oll.target_level_id
     WHERE oll.user_id = ?`,
    [userId]
  );

  const targetLanguages: TargetLanguageProfile[] = languageRows.map((row) => ({
    languageId: row.language_id ?? undefined,
    languageCode: row.language_code ?? undefined,
    languageName: row.language_name ?? undefined,
    currentLevelOrder: row.current_level_order,
    targetLevelOrder: row.target_level_order
  }));

  const personalityMap = await loadPartnerPersonalities(env, [userId]);
  const interestsMap = await loadInterests(env, [userId]);

  const studyGoalRows = await query<{
    motivation_name: string | null;
  }>(
    env.DB,
    `SELECT m.motivation_name
       FROM onboarding_study_goal osg
       JOIN motivation m ON m.motivation_id = osg.motivation_id
      WHERE osg.user_id = ?`,
    [userId]
  );

  return {
    userId: userRow.user_id,
    nativeLanguageId: userRow.native_lang_id ?? undefined,
    nativeLanguageCode: userRow.language_code ?? undefined,
    nativeLanguageName: userRow.language_name ?? undefined,
    targetLanguages,
    personalities: personalityMap.get(userId) ?? [],
    studyGoals: studyGoalRows
      .map((row) => row.motivation_name)
      .filter((name): name is string => Boolean(name)),
    interests: interestsMap.get(userId) ?? []
  };
}

function intersectStrings(a: string[], b: string[]): string[] {
  const setB = new Set(b.map((value) => value.toLowerCase()));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of a) {
    const key = value.toLowerCase();
    if (!seen.has(key) && setB.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }
  return result;
}

function computeLanguageCompatibility(
  current: CompatibilityProfile,
  partner: CompatibilityProfile
): {
  score: number;
  description: string;
  mutualExchangeLanguages: string[];
  sharedTargetLanguages: string[];
} {
  const descriptionParts: string[] = [];
  const mutualExchangeLanguages: string[] = [];

  let score = 0;

  if (current.nativeLanguageId) {
    const partnerTargets = partner.targetLanguages.filter(
      (lang) => lang.languageId === current.nativeLanguageId
    );
    if (partnerTargets.length > 0) {
      const label = current.nativeLanguageName ?? current.nativeLanguageCode ?? 'native language';
      mutualExchangeLanguages.push(label);
      score += 40;
      descriptionParts.push('상대가 내 모국어를 학습 중입니다.');
    }
  }

  if (partner.nativeLanguageId) {
    const userTargets = current.targetLanguages.filter(
      (lang) => lang.languageId === partner.nativeLanguageId
    );
    if (userTargets.length > 0) {
      const label = partner.nativeLanguageName ?? partner.nativeLanguageCode ?? 'partner language';
      mutualExchangeLanguages.push(label);
      score += 40;
      descriptionParts.push('내가 상대의 모국어를 학습하고 있습니다.');
    }
  }

  const currentTargets = current.targetLanguages
    .map((lang) => lang.languageCode ?? lang.languageName ?? String(lang.languageId ?? ''))
    .filter((value): value is string => value.length > 0);
  const partnerTargets = partner.targetLanguages
    .map((lang) => lang.languageCode ?? lang.languageName ?? String(lang.languageId ?? ''))
    .filter((value): value is string => value.length > 0);

  const sharedTargetLanguages = intersectStrings(currentTargets, partnerTargets);

  if (sharedTargetLanguages.length > 0) {
    score += 15;
    descriptionParts.push('같은 목표 언어를 함께 학습하고 있습니다.');
  }

  let levelBonus = 0;
  if (sharedTargetLanguages.length > 0) {
    const averages = sharedTargetLanguages.map((code) => {
      const normalized = code.toLowerCase();
      const currentLanguage = current.targetLanguages.find((lang) => {
        const candidate = lang.languageCode ?? lang.languageName ?? '';
        return candidate.toLowerCase() === normalized;
      });
      const partnerLanguage = partner.targetLanguages.find((lang) => {
        const candidate = lang.languageCode ?? lang.languageName ?? '';
        return candidate.toLowerCase() === normalized;
      });
      const currentLevel = currentLanguage?.targetLevelOrder ?? currentLanguage?.currentLevelOrder;
      const partnerLevel = partnerLanguage?.targetLevelOrder ?? partnerLanguage?.currentLevelOrder;
      if (currentLevel != null && partnerLevel != null) {
        const diff = Math.abs(currentLevel - partnerLevel);
        if (diff <= 1) return 12;
        if (diff <= 2) return 8;
        return 5;
      }
      return 5;
    });

    if (averages.length > 0) {
      levelBonus = Math.min(15, averages.reduce((sum, value) => sum + value, 0) / averages.length);
      if (levelBonus >= 10) {
        descriptionParts.push('언어 레벨이 비슷해 대화가 수월합니다.');
      }
    }
  }

  score += levelBonus;

  if (score === 0) {
    if (current.targetLanguages.length === 0 || partner.targetLanguages.length === 0) {
      score = 50;
      descriptionParts.push('언어 학습 정보가 부족하여 기본 점수를 적용했습니다.');
    } else {
      score = 30;
      descriptionParts.push('언어 학습 방향이 부분적으로만 겹칩니다.');
    }
  }

  return {
    score: Math.min(100, Math.round(score * 10) / 10),
    description: descriptionParts.join(' '),
    mutualExchangeLanguages: Array.from(new Set(mutualExchangeLanguages)),
    sharedTargetLanguages: Array.from(new Set(sharedTargetLanguages))
  };
}

function hasComplementaryTrait(traitsA: Set<string>, traitsB: Set<string>, pair: [string, string]): boolean {
  const [first, second] = pair;
  const aHasFirst = traitsA.has(first);
  const aHasSecond = traitsA.has(second);
  const bHasFirst = traitsB.has(first);
  const bHasSecond = traitsB.has(second);
  return (aHasFirst && bHasSecond) || (aHasSecond && bHasFirst);
}

function computePersonalityCompatibility(
  current: CompatibilityProfile,
  partner: CompatibilityProfile
): { score: number; description: string; overlap: string[] } {
  const traitsA = new Set(current.personalities.map((trait) => trait.toUpperCase()));
  const traitsB = new Set(partner.personalities.map((trait) => trait.toUpperCase()));

  if (traitsA.size === 0 || traitsB.size === 0) {
    return {
      score: 50,
      description: '성격 데이터가 충분하지 않아 기본 점수를 적용했습니다.',
      overlap: []
    };
  }

  const commonTraits = Array.from(traitsA).filter((trait) => traitsB.has(trait));
  let score = commonTraits.length * 20;

  const complementaryPairs: Array<[string, string]> = [
    ['INTROVERT', 'EXTROVERT'],
    ['LEADER', 'SUPPORTER'],
    ['PLANNER', 'ADVENTURER'],
    ['ANALYTICAL', 'CREATIVE']
  ];

  let complementaryScore = 0;
  for (const pair of complementaryPairs) {
    if (hasComplementaryTrait(traitsA, traitsB, pair)) {
      complementaryScore += 15;
    }
  }

  score += complementaryScore;

  if (score === 0) {
    score = 45;
  }

  return {
    score: Math.min(100, Math.round(score * 10) / 10),
    description:
      commonTraits.length > 0
        ? '성격 유형이 잘 맞으며 보완 관계도 기대할 수 있습니다.'
        : complementaryScore > 0
          ? '서로의 성격이 보완적인 조합입니다.'
          : '성격 조합 데이터가 제한적입니다.',
    overlap: commonTraits
  };
}

function computeGoalCompatibility(
  current: CompatibilityProfile,
  partner: CompatibilityProfile
): { score: number; description: string; sharedGoals: string[] } {
  if (current.studyGoals.length === 0 || partner.studyGoals.length === 0) {
    return {
      score: 50,
      description: '학습 목표 데이터가 부족하여 기본 점수를 적용했습니다.',
      sharedGoals: []
    };
  }

  const sharedGoals = intersectStrings(current.studyGoals, partner.studyGoals);
  let score = sharedGoals.length * 25;

  const normalizedCurrent = current.studyGoals.map((goal) => goal.toUpperCase());
  const normalizedPartner = partner.studyGoals.map((goal) => goal.toUpperCase());
  const currentSet = new Set(normalizedCurrent);
  const partnerSet = new Set(normalizedPartner);

  const complementaryPairs: Array<[string, string]> = [
    ['BUSINESS', 'CASUAL'],
    ['ACADEMIC', 'PRACTICAL'],
    ['TEST_PREP', 'CONVERSATION']
  ];

  for (const [a, b] of complementaryPairs) {
    if ((currentSet.has(a) && partnerSet.has(b)) || (currentSet.has(b) && partnerSet.has(a))) {
      score += 20;
      break;
    }
  }

  if (score === 0) {
    score = 45;
  }

  return {
    score: Math.min(100, Math.round(score * 10) / 10),
    description:
      sharedGoals.length > 0
        ? '공통 학습 목표가 있어 학습 방향이 유사합니다.'
        : '학습 목표가 보완적이어서 서로 시너지를 낼 수 있습니다.',
    sharedGoals
  };
}

function computeInterestCompatibility(
  current: CompatibilityProfile,
  partner: CompatibilityProfile
): { score: number; description: string; sharedInterests: string[] } {
  if (current.interests.length === 0 || partner.interests.length === 0) {
    return {
      score: 50,
      description: '관심사 데이터가 부족하여 기본 점수를 적용했습니다.',
      sharedInterests: []
    };
  }

  const sharedInterests = intersectStrings(current.interests, partner.interests);
  const totalUnique = new Set(
    [...current.interests.map((i) => i.toLowerCase()), ...partner.interests.map((i) => i.toLowerCase())]
  ).size;
  const ratio = totalUnique > 0 ? (sharedInterests.length * 2) / totalUnique : 0;
  const score = Math.round(Math.min(100, ratio * 1000)) / 10;

  return {
    score,
    description:
      sharedInterests.length > 0
        ? '공통 관심사가 있어 자연스럽게 대화를 이어갈 수 있습니다.'
        : '관심사가 다양하게 분포해 있어 새로운 주제를 공유할 수 있습니다.',
    sharedInterests
  };
}

function determineCompatibilityLevel(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score >= 80) return 'HIGH';
  if (score >= 60) return 'MEDIUM';
  return 'LOW';
}

function createRecommendation(
  score: number,
  categoryScores: Record<string, number>
): string {
  let message = '';
  if (score >= 80) {
    message = '매우 좋은 매칭입니다! ';
  } else if (score >= 60) {
    message = '괜찮은 매칭입니다. ';
  } else {
    message = '호환성이 낮을 수 있습니다. ';
  }

  const bestCategory = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)[0];

  switch (bestCategory) {
    case 'language':
      message += '언어 교환에 최적화된 파트너입니다.';
      break;
    case 'personality':
      message += '성격이 잘 맞는 파트너입니다.';
      break;
    case 'goals':
      message += '학습 목표가 비슷한 파트너입니다.';
      break;
    case 'interests':
      message += '공통 관심사가 많은 파트너입니다.';
      break;
    default:
      message += '함께 학습하며 시너지를 확인해보세요!';
  }

  return message;
}

export async function calculateCompatibilityAnalysis(
  env: Env,
  currentUserId: string,
  partnerId: string
): Promise<CompatibilityScoreResponseType> {
  if (currentUserId === partnerId) {
    throw new AppError('자신과의 호환성은 분석할 수 없습니다.', 400, 'MATCHING_SELF_COMPATIBILITY');
  }

  const [currentProfile, partnerProfile] = await Promise.all([
    loadCompatibilityProfile(env, currentUserId),
    loadCompatibilityProfile(env, partnerId)
  ]);

  const language = computeLanguageCompatibility(currentProfile, partnerProfile);
  const personality = computePersonalityCompatibility(currentProfile, partnerProfile);
  const goals = computeGoalCompatibility(currentProfile, partnerProfile);
  const interests = computeInterestCompatibility(currentProfile, partnerProfile);

  const overallScore = Math.round(
    (language.score * 0.3 + personality.score * 0.25 + goals.score * 0.25 + interests.score * 0.2) * 10
  ) / 10;

  const categoryScores: Record<string, number> = {
    language: language.score,
    personality: personality.score,
    goals: goals.score,
    interests: interests.score
  };

  const categoryDetails: CompatibilityCategoryDetail[] = [
    { category: 'language', score: language.score, description: language.description },
    { category: 'personality', score: personality.score, description: personality.description },
    { category: 'goals', score: goals.score, description: goals.description },
    { category: 'interests', score: interests.score, description: interests.description }
  ];

  const sharedInsights: CompatibilitySharedInsights = {
    mutualExchangeLanguages: language.mutualExchangeLanguages,
    sharedTargetLanguages: language.sharedTargetLanguages,
    sharedInterests: interests.sharedInterests,
    sharedGoals: goals.sharedGoals,
    personalityOverlap: personality.overlap
  };

  return {
    overallScore,
    compatibilityLevel: determineCompatibilityLevel(overallScore),
    recommendation: createRecommendation(overallScore, categoryScores),
    categoryScores,
    categoryDetails,
    sharedInsights
  };
}
