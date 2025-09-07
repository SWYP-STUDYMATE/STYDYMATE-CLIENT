import api from './index.js';

/**
 * 그룹 세션 시스템 API
 */

// 그룹 세션 생성
export const createGroupSession = async (sessionData) => {
  try {
    const response = await api.post('/group-sessions', {
      title: sessionData.title,
      description: sessionData.description,
      language: sessionData.language,
      targetLevel: sessionData.targetLevel,
      maxParticipants: sessionData.maxParticipants || 6,
      scheduledStartTime: sessionData.scheduledStartTime,
      durationMinutes: sessionData.durationMinutes || 60,
      isPublic: sessionData.isPublic !== false,
      tags: sessionData.tags || [],
      sessionType: sessionData.sessionType || 'VIDEO', // VIDEO, AUDIO, TEXT
      topic: sessionData.topic,
      materials: sessionData.materials
    });
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error('Get group session details error:', error);
    throw error;
  }
};

// 공개 세션 목록 조회 (available 엔드포인트 사용)
export const getPublicGroupSessions = async (params = {}) => {
  try {
    const response = await api.get('/group-sessions/available', {
      params: {
        page: params.page || 0,
        size: params.size || 20,
        language: params.language,
        level: params.level,
        category: params.category,
        tags: params.tags
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get public group sessions error:', error);
    throw error;
  }
};

// 내가 참가한 세션 목록 조회
export const getMyGroupSessions = async (params = {}) => {
  try {
    const response = await api.get('/group-sessions/my-sessions', {
      params: {
        page: params.page || 0,
        size: params.size || 20,
        role: params.role // HOST, PARTICIPANT
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get my group sessions error:', error);
    throw error;
  }
};

// 예정된 세션 목록 조회 (내 세션에서 필터링)
export const getUpcomingGroupSessions = async (params = {}) => {
  try {
    const response = await api.get('/group-sessions/my-sessions', {
      params: {
        status: 'SCHEDULED'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get upcoming group sessions error:', error);
    throw error;
  }
};

// 진행 중인 세션 목록 조회 (내 세션에서 필터링)
export const getOngoingGroupSessions = async () => {
  try {
    const response = await api.get('/group-sessions/my-sessions', {
      params: {
        status: 'ONGOING'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get ongoing group sessions error:', error);
    throw error;
  }
};

// 세션 참가자 목록 조회
export const getSessionParticipants = async (sessionId) => {
  try {
    const response = await api.get(`/group-sessions/${sessionId}/participants`);
    return response.data;
  } catch (error) {
    console.error('Get session participants error:', error);
    throw error;
  }
};

// 참가자 강퇴 (호스트 전용)
export const kickParticipant = async (sessionId, participantId, reason = '') => {
  try {
    const response = await api.post(`/group-sessions/${sessionId}/kick/${participantId}`, null, {
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
    const response = await api.put(`/group-sessions/${sessionId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Update group session error:', error);
    throw error;
  }
};

// 세션 피드백 제출
export const submitSessionFeedback = async (sessionId, feedback) => {
  try {
    const response = await api.post(`/group-sessions/${sessionId}/feedback`, {
      rating: feedback.rating,
      comment: feedback.comment,
      hostRating: feedback.hostRating,
      participantRatings: feedback.participantRatings,
      wouldJoinAgain: feedback.wouldJoinAgain
    });
    return response.data;
  } catch (error) {
    console.error('Submit session feedback error:', error);
    throw error;
  }
};

// 세션 피드백 조회
export const getSessionFeedback = async (sessionId) => {
  try {
    const response = await api.get(`/group-sessions/${sessionId}/feedback`);
    return response.data;
  } catch (error) {
    console.error('Get session feedback error:', error);
    throw error;
  }
};

// 세션 통계 조회
export const getSessionStatistics = async (sessionId) => {
  try {
    const response = await api.get(`/group-sessions/${sessionId}/statistics`);
    return response.data;
  } catch (error) {
    console.error('Get session statistics error:', error);
    throw error;
  }
};

// 세션 녹화 URL 조회 (완료된 세션)
export const getSessionRecording = async (sessionId) => {
  try {
    const response = await api.get(`/group-sessions/${sessionId}/recording`);
    return response.data;
  } catch (error) {
    console.error('Get session recording error:', error);
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