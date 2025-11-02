/**
 * 세션 API 필드명 어댑터
 *
 * 클라이언트와 백엔드 간 필드명 불일치를 해결하기 위한 유틸리티입니다.
 *
 * @see docs/04-api/session-types.md
 */

/**
 * 1:1 세션 생성 요청 데이터 정규화
 *
 * @param {Object} data - 클라이언트 세션 데이터
 * @returns {Object} 백엔드 호환 페이로드
 */
export function normalizeSessionCreatePayload(data) {
  return {
    partnerId: data.partnerId,
    type: data.type || data.sessionType,
    scheduledAt: data.scheduledAt,
    duration: data.duration || data.durationMinutes || 30,
    topic: data.topic || data.title,
    description: data.description,
    language: data.language || data.languageCode,
    targetLanguage: data.targetLanguage || data.skillFocus,
    webRtcRoomId: data.webRtcRoomId,
    webRtcRoomType: data.webRtcRoomType
  };
}

/**
 * 그룹 세션 생성 요청 데이터 정규화
 *
 * @param {Object} data - 클라이언트 그룹 세션 데이터
 * @returns {Object} 백엔드 호환 페이로드
 */
export function normalizeGroupSessionCreatePayload(data) {
  return {
    title: data.title,
    description: data.description,
    topicCategory: data.topic || data.topicCategory,
    targetLanguage: data.language || data.targetLanguage,
    languageLevel: data.targetLevel || data.languageLevel,
    maxParticipants: data.maxParticipants || 6,
    scheduledAt: data.scheduledStartTime || data.scheduledAt,
    sessionDuration: data.durationMinutes || data.sessionDuration || 60,
    isPublic: data.isPublic !== false,
    sessionTags: data.tags || data.sessionTags || []
  };
}

/**
 * 백엔드 세션 응답 데이터를 클라이언트 형식으로 변환
 *
 * @param {Object} session - 백엔드 세션 객체
 * @returns {Object} 클라이언트 호환 세션 객체
 */
export function normalizeSessionResponse(session) {
  if (!session) return session;

  return {
    ...session,
    // 시간 관련 필드 정규화
    scheduledAt: session.scheduledAt || session.scheduledStartTime,
    duration: session.durationMinutes || session.duration || session.sessionDuration,
    durationMinutes: session.durationMinutes || session.duration || session.sessionDuration,

    // 세션 타입 정규화
    type: session.sessionType || session.type,
    sessionType: session.sessionType || session.type,

    // 언어 관련 필드 정규화
    language: session.languageCode || session.targetLanguage || session.language,
    languageCode: session.languageCode || session.targetLanguage || session.language,

    // 주제 관련 필드 정규화
    topic: session.topicCategory || session.topic || session.title,
    title: session.title || session.topicCategory || session.topic
  };
}

/**
 * 그룹 세션 응답 데이터를 클라이언트 형식으로 변환
 *
 * @param {Object} session - 백엔드 그룹 세션 객체
 * @returns {Object} 클라이언트 호환 그룹 세션 객체
 */
export function normalizeGroupSessionResponse(session) {
  if (!session) return session;

  // 참가자 목록 정규화
  const participants = Array.isArray(session.participants)
    ? session.participants.map((participant) => ({
        ...participant,
        id: participant.userId || participant.id,
        name: participant.userName || participant.name || '참가자'
      }))
    : [];

  return {
    ...session,
    // 호스트 정보
    hostId: session.hostUserId || session.hostId,
    hostName: session.hostUserName || session.hostName,

    // 언어 및 레벨
    language: session.targetLanguage || session.language || session.topicCategory,
    targetLevel: session.languageLevel || session.targetLevel,

    // 시간 관련
    scheduledStartTime: session.scheduledAt || session.scheduledStartTime,
    scheduledAt: session.scheduledAt || session.scheduledStartTime,
    durationMinutes: session.sessionDuration || session.durationMinutes,

    // 주제 및 태그
    topic: session.topicCategory || session.topic,
    tags: session.sessionTags || session.tags || [],

    // 참가자 정보
    participants,
    participantIds: participants.map((p) => p.id),

    // 세션 타입
    sessionType: session.sessionType || 'VIDEO'
  };
}

/**
 * 세션 목록 응답 데이터 정규화
 *
 * @param {Object|Array} payload - 세션 목록 페이로드
 * @param {Function} normalizer - 개별 세션 정규화 함수
 * @returns {Object|Array} 정규화된 세션 목록
 */
export function normalizeSessionList(payload, normalizer = normalizeSessionResponse) {
  if (!payload) return payload;

  // 배열인 경우
  if (Array.isArray(payload)) {
    return payload.map(normalizer);
  }

  // 페이지네이션 응답인 경우 (content 배열 포함)
  if (Array.isArray(payload.content)) {
    return {
      ...payload,
      content: payload.content.map(normalizer)
    };
  }

  // 단일 데이터인 경우
  return normalizer(payload);
}

/**
 * 세션 업데이트 요청 데이터 정규화
 *
 * @param {Object} data - 클라이언트 업데이트 데이터
 * @returns {Object} 백엔드 호환 업데이트 페이로드
 */
export function normalizeSessionUpdatePayload(data) {
  const payload = {};

  // 제공된 필드만 포함
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.scheduledAt !== undefined) payload.scheduledAt = data.scheduledAt;
  if (data.scheduledStartTime !== undefined) payload.scheduledAt = data.scheduledStartTime;
  if (data.duration !== undefined) payload.durationMinutes = data.duration;
  if (data.durationMinutes !== undefined) payload.durationMinutes = data.durationMinutes;

  return payload;
}

/**
 * 그룹 세션 업데이트 요청 데이터 정규화
 *
 * @param {Object} data - 클라이언트 업데이트 데이터
 * @returns {Object} 백엔드 호환 업데이트 페이로드
 */
export function normalizeGroupSessionUpdatePayload(data) {
  const payload = {};

  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.topic !== undefined) payload.topicCategory = data.topic;
  if (data.topicCategory !== undefined) payload.topicCategory = data.topicCategory;
  if (data.language !== undefined) payload.targetLanguage = data.language;
  if (data.targetLanguage !== undefined) payload.targetLanguage = data.targetLanguage;
  if (data.targetLevel !== undefined) payload.languageLevel = data.targetLevel;
  if (data.languageLevel !== undefined) payload.languageLevel = data.languageLevel;
  if (data.maxParticipants !== undefined) payload.maxParticipants = data.maxParticipants;
  if (data.scheduledStartTime !== undefined) payload.scheduledAt = data.scheduledStartTime;
  if (data.scheduledAt !== undefined) payload.scheduledAt = data.scheduledAt;
  if (data.durationMinutes !== undefined) payload.sessionDuration = data.durationMinutes;
  if (data.sessionDuration !== undefined) payload.sessionDuration = data.sessionDuration;
  if (data.isPublic !== undefined) payload.isPublic = data.isPublic;
  if (data.tags !== undefined) payload.sessionTags = data.tags;
  if (data.sessionTags !== undefined) payload.sessionTags = data.sessionTags;

  return payload;
}

/**
 * 세션 필터 파라미터 정규화
 *
 * @param {Object} filters - 클라이언트 필터 객체
 * @returns {Object} 백엔드 호환 쿼리 파라미터
 */
export function normalizeSessionFilters(filters) {
  const params = {};

  if (filters.language) params.language = filters.language;
  if (filters.level) params.level = filters.level;
  if (filters.category) params.category = filters.category;
  if (filters.tags) {
    params.tags = Array.isArray(filters.tags) ? filters.tags.join(',') : filters.tags;
  }
  if (filters.status) params.status = filters.status;
  if (filters.page) params.page = filters.page;
  if (filters.size) params.size = filters.size;

  return params;
}

// 타입 변환 헬퍼
export const SESSION_TYPE_MAP = {
  audio: 'AUDIO',
  video: 'VIDEO',
  text: 'TEXT',
  AUDIO: 'audio',
  VIDEO: 'video',
  TEXT: 'text'
};

/**
 * 세션 타입을 백엔드 형식으로 변환
 */
export function toBackendSessionType(type) {
  return SESSION_TYPE_MAP[type] || type?.toUpperCase() || 'VIDEO';
}

/**
 * 세션 타입을 클라이언트 형식으로 변환
 */
export function toClientSessionType(type) {
  return SESSION_TYPE_MAP[type] || type?.toLowerCase() || 'video';
}
