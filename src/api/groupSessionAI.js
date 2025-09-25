import axios from 'axios';

// Workers AI API 설정
const WORKERS_API_URL = import.meta.env.VITE_WORKERS_API_URL || 'https://api.languagemate.kr';

const workersApi = axios.create({
  baseURL: WORKERS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터 - 토큰 추가
workersApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 그룹 세션 AI 기능 API
 */

// 세션 주제 추천
export const getSessionTopicRecommendations = async (language, level, interests = []) => {
  try {
    const response = await workersApi.post('/api/v1/group-sessions/ai/recommend-topics', {
      language,
      level,
      interests
    });
    return response.data;
  } catch (error) {
    console.error('Get topic recommendations error:', error);
    throw error;
  }
};

// 대화 분석 및 피드백
export const analyzeConversation = async (transcript, language, participantId) => {
  try {
    const response = await workersApi.post('/api/v1/group-sessions/ai/analyze-conversation', {
      transcript,
      language,
      participantId
    });
    return response.data;
  } catch (error) {
    console.error('Analyze conversation error:', error);
    throw error;
  }
};

// 세션 요약 생성
export const generateSessionSummary = async (sessionId, transcript, duration, participants) => {
  try {
    const response = await workersApi.post('/api/v1/group-sessions/ai/generate-summary', {
      sessionId,
      transcript,
      duration,
      participants
    });
    return response.data;
  } catch (error) {
    console.error('Generate session summary error:', error);
    throw error;
  }
};

// 아이스브레이커 질문 생성
export const getIcebreakers = async (language, level, topic) => {
  try {
    const response = await workersApi.post('/api/v1/group-sessions/ai/icebreakers', {
      language,
      level,
      topic
    });
    return response.data;
  } catch (error) {
    console.error('Get icebreakers error:', error);
    throw error;
  }
};

// 역할극 시나리오 생성
export const getRolePlayScenario = async (language, level, situation) => {
  try {
    const response = await workersApi.post('/api/v1/group-sessions/ai/roleplay', {
      language,
      level,
      situation
    });
    return response.data;
  } catch (error) {
    console.error('Get role-play scenario error:', error);
    throw error;
  }
};

// 실시간 번역
export const translateExpression = async (text, fromLanguage, toLanguage) => {
  try {
    const response = await workersApi.post('/api/v1/group-sessions/ai/translate', {
      text,
      fromLanguage,
      toLanguage
    });
    return response.data;
  } catch (error) {
    console.error('Translate expression error:', error);
    throw error;
  }
};

// 세션 매칭 추천
export const getSessionMatchRecommendations = async (userId, userProfile, availableSessions) => {
  try {
    const response = await workersApi.post('/api/v1/group-sessions/ai/match-recommendation', {
      userId,
      userProfile,
      availableSessions
    });
    return response.data;
  } catch (error) {
    console.error('Get session match recommendations error:', error);
    throw error;
  }
};

// 실시간 음성 전사 (세션 중 사용)
export const transcribeAudio = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    
    const response = await workersApi.post('/api/v1/leveltest/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Transcribe audio error:', error);
    throw error;
  }
};

// 세션 피드백 저장 (로컬 스토리지)
export const saveSessionFeedback = (sessionId, feedback) => {
  const key = `session_feedback_${sessionId}`;
  const existingFeedback = JSON.parse(localStorage.getItem(key) || '[]');
  existingFeedback.push({
    ...feedback,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(key, JSON.stringify(existingFeedback));
};

// 세션 피드백 가져오기
export const getSessionFeedback = (sessionId) => {
  const key = `session_feedback_${sessionId}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
};

// 학습 진행 상황 추적
export const trackLearningProgress = async (sessionData) => {
  try {
    // 세션 데이터를 Workers KV에 저장
    const response = await workersApi.post('/api/v1/group-sessions/progress/track', sessionData);
    return response.data;
  } catch (error) {
    console.error('Track learning progress error:', error);
    // 실패 시 로컬 스토리지에 저장
    const progress = JSON.parse(localStorage.getItem('learning_progress') || '[]');
    progress.push(sessionData);
    localStorage.setItem('learning_progress', JSON.stringify(progress));
  }
};