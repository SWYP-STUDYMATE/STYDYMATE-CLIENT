import api from './index.js';
import {
  normalizeSessionCreatePayload,
  normalizeSessionResponse,
  normalizeSessionList
} from '../utils/sessionAdapter.js';

// 세션 목록 조회
export const getSessions = async (page = 1, size = 20, status = null) => {
  try {
    const params = { page, size };
    if (status) params.status = status;
    
    const response = await api.get('/sessions', { params });
    return response.data;
  } catch (error) {
    console.error('Get sessions error:', error);
    throw error;
  }
};

// 특정 세션 정보 조회
export const getSession = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Get session error:', error);
    throw error;
  }
};

// 세션 생성
export const createSession = async (sessionData) => {
  try {
    const payload = normalizeSessionCreatePayload(sessionData);
    const response = await api.post('/sessions', payload);
    return normalizeSessionResponse(response.data);
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  }
};

// 세션 참가
export const joinSession = async (sessionId) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/join`);
    return response.data;
  } catch (error) {
    console.error('Join session error:', error);
    throw error;
  }
};

// 세션 시작
export const startSession = async (sessionId) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/start`);
    return response.data;
  } catch (error) {
    console.error('Start session error:', error);
    throw error;
  }
};

// 세션 종료
export const endSession = async (sessionId, sessionSummary) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/end`, {
      duration: sessionSummary.duration,
      notes: sessionSummary.notes,
      rating: sessionSummary.rating
    });
    return response.data;
  } catch (error) {
    console.error('End session error:', error);
    throw error;
  }
};

// 세션 취소
export const cancelSession = async (sessionId, reason) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/cancel`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Cancel session error:', error);
    throw error;
  }
};

// 세션 일정 변경
export const rescheduleSession = async (sessionId, newSchedule) => {
  try {
    const response = await api.patch(`/sessions/${sessionId}/reschedule`, {
      scheduledAt: newSchedule.scheduledAt,
      duration: newSchedule.duration,
      reason: newSchedule.reason
    });
    return response.data;
  } catch (error) {
    console.error('Reschedule session error:', error);
    throw error;
  }
};

// 세션 피드백 및 평가
export const submitSessionFeedback = async (sessionId, feedback) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/feedback`, {
      rating: feedback.rating, // 1-5
      comment: feedback.comment,
      partnerRating: feedback.partnerRating,
      partnerComment: feedback.partnerComment,
      tags: feedback.tags, // ['helpful', 'patient', 'knowledgeable', etc.]
      improvementAreas: feedback.improvementAreas,
      wouldRecommend: feedback.wouldRecommend
    });
    return response.data;
  } catch (error) {
    console.error('Submit session feedback error:', error);
    throw error;
  }
};

// 세션 히스토리 조회
export const getSessionHistory = async (page = 1, size = 20, partnerId = null) => {
  try {
    const params = { page, size };
    if (partnerId) params.partnerId = partnerId;
    
    const response = await api.get('/sessions/history', { params });
    return response.data;
  } catch (error) {
    console.error('Get session history error:', error);
    throw error;
  }
};

// 세션 통계 조회
export const getSessionStats = async (period = 'month') => {
  try {
    const response = await api.get('/sessions/stats', {
      params: { period } // week, month, year
    });
    return response.data;
  } catch (error) {
    console.error('Get session stats error:', error);
    throw error;
  }
};

// 예정된 세션 조회
export const getUpcomingSessions = async (limit = 10) => {
  try {
    const response = await api.get('/sessions/upcoming', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get upcoming sessions error:', error);
    throw error;
  }
};

// 세션 알림 설정 조회
export const getSessionNotifications = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/notifications`);
    return response.data;
  } catch (error) {
    console.error('Get session notifications error:', error);
    throw error;
  }
};

// 개인 캘린더 조회
export const getUserCalendar = async ({ startDate, endDate }) => {
  try {
    const response = await api.get('/sessions/calendar', {
      params: {
        startDate,
        endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get user calendar error:', error);
    throw error;
  }
};

// 세션 알림 설정 업데이트
export const updateSessionNotifications = async (sessionId, settings) => {
  try {
    const response = await api.patch(`/sessions/${sessionId}/notifications`, {
      reminderBefore: settings.reminderBefore, // 세션 시작 전 알림 시간 (분)
      enableEmailReminder: settings.enableEmailReminder,
      enablePushReminder: settings.enablePushReminder,
      enableSmsReminder: settings.enableSmsReminder
    });
    return response.data;
  } catch (error) {
    console.error('Update session notifications error:', error);
    throw error;
  }
};

// 세션 녹화 요청
export const requestSessionRecording = async (sessionId, options) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/recording`, {
      recordAudio: options.recordAudio || true,
      recordVideo: options.recordVideo || false,
      recordTranscript: options.recordTranscript || true,
      language: options.language,
      targetLanguage: options.targetLanguage
    });
    return response.data;
  } catch (error) {
    console.error('Request session recording error:', error);
    throw error;
  }
};

// 세션 녹화 중단
export const stopSessionRecording = async (sessionId) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/recording/stop`);
    return response.data;
  } catch (error) {
    console.error('Stop session recording error:', error);
    throw error;
  }
};

// 세션 녹화 다운로드 URL 조회
export const getSessionRecording = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/recording`);
    return response.data;
  } catch (error) {
    console.error('Get session recording error:', error);
    throw error;
  }
};

// 세션 참가자 정보 조회
export const getSessionParticipants = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/participants`);
    return response.data;
  } catch (error) {
    console.error('Get session participants error:', error);
    throw error;
  }
};

// 세션 초대 링크 생성
export const generateSessionInviteLink = async (sessionId, expiresInHours = 24) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/invite`, {
      expiresInHours
    });
    return response.data;
  } catch (error) {
    console.error('Generate session invite link error:', error);
    throw error;
  }
};

// 세션 초대 수락
export const acceptSessionInvite = async (inviteToken) => {
  try {
    const response = await api.post('/sessions/invite/accept', {
      token: inviteToken
    });
    return response.data;
  } catch (error) {
    console.error('Accept session invite error:', error);
    throw error;
  }
};

// 세션 요약 및 학습 포인트 조회
export const getSessionSummary = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Get session summary error:', error);
    throw error;
  }
};

// 세션 스크립트/대화록 조회
export const getSessionTranscript = async (sessionId, language = null) => {
  try {
    const params = {};
    if (language) params.language = language;
    
    const response = await api.get(`/sessions/${sessionId}/transcript`, { params });
    return response.data;
  } catch (error) {
    console.error('Get session transcript error:', error);
    throw error;
  }
};
