import { handleApiError, handleLevelTestError, withRetry } from '../utils/errorHandler.js';

const API_BASE_URL = import.meta.env.VITE_WORKERS_API_URL || 'http://localhost:8787';

// 레벨 테스트 질문 조회
export async function getLevelTestQuestions() {
  return withRetry(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/level-test/questions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${response.status}`);
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error) {
      handleLevelTestError(error, 'getLevelTestQuestions');
    }
  }, 2);
}

// 레벨 테스트 결과 제출
export async function submitLevelTest(audioBlob, questionNumber) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, `question_${questionNumber}.webm`);
    formData.append('questionNumber', questionNumber.toString());
    formData.append('userId', localStorage.getItem('userId') || 'guest');

    const response = await fetch(`${API_BASE_URL}/level-test/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Level test submission error:', error);
    throw error;
  }
}

// 레벨 테스트 완료 및 평가 요청
export async function completeLevelTest(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/level-test/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Level test completion error:', error);
    throw error;
  }
}

// 레벨 테스트 결과 조회
export async function getLevelTestResult(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/level-test/result/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get level test result error:', error);
    throw error;
  }
}

// 레벨 테스트 진행 상태 조회
export async function getLevelTestProgress(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/level-test/progress/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get level test progress error:', error);
    throw error;
  }
}

// ===== Spring Boot API 연동 함수들 =====

import api from './index.js';

// Spring Boot: 레벨 테스트 시작
export const startSpringBootLevelTest = async (language = 'en') => {
  try {
    const response = await api.post('/level-test/start', {
      targetLanguage: language
    });
    return response.data;
  } catch (error) {
    console.error('Start spring boot level test error:', error);
    throw error;
  }
};

// Spring Boot: 레벨 테스트 질문 조회
export const getSpringBootLevelTestQuestions = async (testId, category = 'general') => {
  try {
    const response = await api.get(`/level-test/${testId}/questions`, {
      params: { category }
    });
    return response.data;
  } catch (error) {
    console.error('Get spring boot level test questions error:', error);
    throw error;
  }
};

// Spring Boot: 답변 제출
export const submitSpringBootAnswer = async (testId, questionId, answer) => {
  try {
    const response = await api.post(`/level-test/${testId}/answers`, {
      questionId,
      answer: answer.text || answer,
      audioUrl: answer.audioUrl,
      answerTime: answer.answerTime,
      confidence: answer.confidence
    });
    return response.data;
  } catch (error) {
    console.error('Submit spring boot answer error:', error);
    throw error;
  }
};

// Spring Boot: 오디오 답변 업로드
export const uploadSpringBootAudioAnswer = async (testId, questionId, audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, `question_${questionId}.webm`);
    formData.append('questionId', questionId);
    
    const response = await api.post(`/level-test/${testId}/audio-answer`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Upload spring boot audio answer error:', error);
    throw error;
  }
};

// Spring Boot: 레벨 테스트 완료
export const completeSpringBootLevelTest = async (testId) => {
  try {
    const response = await api.post(`/level-test/${testId}/complete`);
    return response.data;
  } catch (error) {
    console.error('Complete spring boot level test error:', error);
    throw error;
  }
};

// Spring Boot: 레벨 테스트 결과 조회
export const getSpringBootLevelTestResult = async (testId) => {
  try {
    const response = await api.get(`/level-test/${testId}/result`);
    return response.data;
  } catch (error) {
    console.error('Get spring boot level test result error:', error);
    throw error;
  }
};

// Spring Boot: 사용자 레벨 테스트 히스토리 조회
export const getSpringBootLevelTestHistory = async (page = 1, size = 10) => {
  try {
    const response = await api.get('/level-test/history', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Get spring boot level test history error:', error);
    throw error;
  }
};

// Spring Boot: 레벨 테스트 진행 상태 조회
export const getSpringBootLevelTestProgress = async (testId) => {
  try {
    const response = await api.get(`/level-test/${testId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Get spring boot level test progress error:', error);
    throw error;
  }
};

// Spring Boot: 레벨 테스트 재시작
export const restartSpringBootLevelTest = async (language = 'en') => {
  try {
    const response = await api.post('/level-test/restart', {
      targetLanguage: language
    });
    return response.data;
  } catch (error) {
    console.error('Restart spring boot level test error:', error);
    throw error;
  }
};

// Spring Boot: 레벨 테스트 설정 조회
export const getSpringBootLevelTestSettings = async () => {
  try {
    const response = await api.get('/level-test/settings');
    return response.data;
  } catch (error) {
    console.error('Get spring boot level test settings error:', error);
    throw error;
  }
};

// Spring Boot: 레벨 테스트 통계 조회
export const getSpringBootLevelTestStats = async () => {
  try {
    const response = await api.get('/level-test/stats');
    return response.data;
  } catch (error) {
    console.error('Get spring boot level test stats error:', error);
    throw error;
  }
};