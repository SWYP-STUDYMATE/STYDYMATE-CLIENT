import api from './index.js';

const normalizeSessionRecord = (record = {}) => {
  const participants = Array.isArray(record.participants)
    ? record.participants.map((participant) => ({
        ...participant,
        id: participant.userId ?? participant.id,
        name: participant.userName ?? participant.name ?? '참가자'
      }))
    : [];

  return {
    ...record,
    hostId: record.hostUserId ?? record.hostId,
    hostName: record.hostUserName ?? record.hostName,
    language: record.targetLanguage ?? record.language ?? record.topicCategory ?? '미정',
    targetLevel: record.languageLevel ?? record.targetLevel ?? '미정',
    scheduledStartTime: record.scheduledAt ?? record.scheduledStartTime ?? null,
    durationMinutes: record.sessionDuration ?? record.durationMinutes ?? 0,
    topic: record.topicCategory ?? record.topic ?? null,
    tags: record.sessionTags ?? record.tags ?? [],
    participants,
    participantIds: participants.map((participant) => participant.id),
    sessionType: record.sessionType ?? 'VIDEO'
  };
};

const mapSessionList = (payload) => {
  if (!payload) return payload;
  if (Array.isArray(payload)) {
    return payload.map(normalizeSessionRecord);
  }
  if (Array.isArray(payload.content)) {
    return {
      ...payload,
      content: payload.content.map(normalizeSessionRecord)
    };
  }
  return payload;
};

// 그룹 세션 생성
export const createGroupSession = async (sessionData) => {
  try {
    const payload = {
      title: sessionData.title,
      description: sessionData.description,
      topicCategory: sessionData.topic ?? sessionData.topicCategory ?? null,
      targetLanguage: sessionData.language ?? sessionData.targetLanguage,
      languageLevel: sessionData.targetLevel ?? sessionData.languageLevel,
      maxParticipants: sessionData.maxParticipants || 6,
      scheduledAt: sessionData.scheduledStartTime,
      sessionDuration: sessionData.durationMinutes || 60,
      isPublic: sessionData.isPublic !== false,
      sessionTags: sessionData.tags || []
    };

    const response = await api.post('/group-sessions', payload);
    const payloadResponse = response.data;
    if (payloadResponse?.data) {
      payloadResponse.data = normalizeSessionRecord(payloadResponse.data);
    }
    return payloadResponse;
  } catch (error) {
    console.error('Create group session error:', error);
    throw error;
  }
};

// 세션 ID로 그룹 세션 참가
export const joinGroupSession = async (sessionId, joinData = {}) => {
  try {
    const response = await api.post(`/group-sessions/${sessionId}/join`, {
      message: joinData.message,
      micEnabled: joinData.micEnabled !== false,
      cameraEnabled: joinData.cameraEnabled !== false
    });
    return response.data;
  } catch (error) {
    console.error('Join group session error:', error);
    throw error;
  }
};

// 참가 코드로 그룹 세션 참가
export const joinGroupSessionByCode = async (joinCode, joinData = {}) => {
  try {
    const response = await api.post(`/group-sessions/join/${joinCode}`, {
      message: joinData.message,
      micEnabled: joinData.micEnabled !== false,
      cameraEnabled: joinData.cameraEnabled !== false
    });
    return response.data;
  } catch (error) {
    console.error('Join group session by code error:', error);
    throw error;
  }
};

// 그룹 세션 나가기
export const leaveGroupSession = async (sessionId) => {
  try {
    const response = await api.post(`/group-sessions/${sessionId}/leave`);
    return response.data;
  } catch (error) {
    console.error('Leave group session error:', error);
    throw error;
  }
};

// 세션 시작 (호스트 전용)
export const startGroupSession = async (sessionId) => {
  try {
    const response = await api.post(`/group-sessions/${sessionId}/start`);
    return response.data;
  } catch (error) {
    console.error('Start group session error:', error);
    throw error;
  }
};

// 세션 종료 (호스트 전용)
export const endGroupSession = async (sessionId) => {
  try {
    const response = await api.post(`/group-sessions/${sessionId}/end`);
    return response.data;
  } catch (error) {
    console.error('End group session error:', error);
    throw error;
  }
};

// 세션 취소 (호스트 전용)
export const cancelGroupSession = async (sessionId, reason = '') => {
  try {
    const response = await api.post(`/group-sessions/${sessionId}/cancel`, null, {
      params: { reason }
    });
    return response.data;
  } catch (error) {
    console.error('Cancel group session error:', error);
    throw error;
  }
};

// 세션 상세 정보 조회
export const getGroupSessionDetails = async (sessionId) => {
  try {
    const response = await api.get(`/group-sessions/${sessionId}`);
    const payloadResponse = response.data;
    if (payloadResponse?.data) {
      payloadResponse.data = normalizeSessionRecord(payloadResponse.data);
    }
    return payloadResponse;
  } catch (error) {
    console.error('Get group session details error:', error);
    throw error;
  }
};

// 공개 세션 목록 조회 (available 엔드포인트 사용)
export const getPublicGroupSessions = async (params = {}) => {
  try {
    const response = await api.get('/group-sessions', {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        language: params.language,
        level: params.level,
        category: params.category,
        tags: params.tags
      }
    });
    const payloadResponse = response.data;
    if (payloadResponse?.data) {
      payloadResponse.data = mapSessionList(payloadResponse.data);
    }
    return payloadResponse;
  } catch (error) {
    console.error('Get public group sessions error:', error);
    throw error;
  }
};

// 내가 참가한 세션 목록 조회
export const getMyGroupSessions = async (params = {}) => {
  try {
    const response = await api.get('/group-sessions/my', {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 20,
        status: params.status,
        role: params.role
      }
    });
    const payloadResponse = response.data;
    if (payloadResponse?.data) {
      payloadResponse.data = mapSessionList(payloadResponse.data);
    }
    return payloadResponse;
  } catch (error) {
    console.error('Get my group sessions error:', error);
    throw error;
  }
};

// 예정된 세션 목록 조회 (내 세션에서 필터링)
export const getUpcomingGroupSessions = async () => {
  try {
    const response = await api.get('/group-sessions/my', {
      params: {
        status: 'SCHEDULED'
      }
    });
    const payloadResponse = response.data;
    if (payloadResponse?.data) {
      payloadResponse.data = mapSessionList(payloadResponse.data);
    }
    return payloadResponse;
  } catch (error) {
    console.error('Get upcoming group sessions error:', error);
    throw error;
  }
};

// 진행 중인 세션 목록 조회 (내 세션에서 필터링)
export const getOngoingGroupSessions = async () => {
  try {
    const response = await api.get('/group-sessions/my', {
      params: {
        status: 'ONGOING'
      }
    });
    const payloadResponse = response.data;
    if (payloadResponse?.data) {
      payloadResponse.data = mapSessionList(payloadResponse.data);
    }
    return payloadResponse;
  } catch (error) {
    console.error('Get ongoing group sessions error:', error);
    throw error;
  }
};

// 세션 참가자 목록 조회
// 참가자 강퇴 (호스트 전용)
export const kickParticipant = async (sessionId, participantUserId, reason = '') => {
  try {
    const response = await api.post(`/group-sessions/${sessionId}/kick/${participantUserId}`, null, {
      params: { reason }
    });
    return response.data;
  } catch (error) {
    console.error('Kick participant error:', error);
    throw error;
  }
};

// 세션 정보 수정 (호스트 전용)
export const updateGroupSession = async (sessionId, updateData) => {
  try {
    const payload = {
      title: updateData.title,
      description: updateData.description,
      topicCategory: updateData.topic ?? updateData.topicCategory,
      targetLanguage: updateData.language ?? updateData.targetLanguage,
      languageLevel: updateData.targetLevel ?? updateData.languageLevel,
      maxParticipants: updateData.maxParticipants,
      scheduledAt: updateData.scheduledStartTime ?? updateData.scheduledAt,
      sessionDuration: updateData.durationMinutes ?? updateData.sessionDuration,
      isPublic: updateData.isPublic,
      sessionTags: updateData.tags ?? updateData.sessionTags
    };

    const response = await api.put(`/group-sessions/${sessionId}`, payload);
    const payloadResponse = response.data;
    if (payloadResponse?.data) {
      payloadResponse.data = normalizeSessionRecord(payloadResponse.data);
    }
    return payloadResponse;
  } catch (error) {
    console.error('Update group session error:', error);
    throw error;
  }
};

// 세션 피드백 제출
export const submitSessionFeedback = async (sessionId, feedback) => {
  try {
    const params = {
      rating: feedback.rating,
      feedback: feedback.comment
    };
    const response = await api.post(`/group-sessions/${sessionId}/rate`, null, { params });
    return response.data;
  } catch (error) {
    console.error('Submit session feedback error:', error);
    throw error;
  }
};

// 세션 타입
export const SESSION_TYPES = {
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  TEXT: 'TEXT'
};

// 세션 상태
export const SESSION_STATUS = {
  SCHEDULED: 'SCHEDULED',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// 참가자 역할
export const PARTICIPANT_ROLES = {
  HOST: 'HOST',
  PARTICIPANT: 'PARTICIPANT',
  CO_HOST: 'CO_HOST'
};
