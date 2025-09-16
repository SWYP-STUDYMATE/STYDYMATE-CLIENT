import { API_CONFIG, API_ENDPOINTS, apiCall, APIError } from './config.js';
import api from './index.js';

// ===== Spring Boot 서버 API 함수들 =====

// 레벨 테스트 시작 (Spring Boot)
// export const startLevelTest = async (language = 'en') => {
//   try {
//     const response = await api.post(API_ENDPOINTS.LEVEL_TEST.START, {
//       targetLanguage: language
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Start level test error:', error);
//     throw error;
//   }
// };

export const levelTestStart = async ({
  languageCode = 'en',
  testType = 'SPEAKING',
  testLevel = 'INTERMEDIATE',
  totalQuestions = 5,
} = {}) => {
  const res = await api.post(API_ENDPOINTS.LEVEL_TEST.START, {
    testType, languageCode, testLevel, totalQuestions,
  });

  const outer = res?.data ?? res;
  const inner = outer?.data ?? outer;
  const testId = Number(
    inner?.testId ??
    inner?.id ??
    outer?.testId ??
    outer?.id
  );

  if (!testId) {
    console.error('[start] unexpected response shape:', res?.data);
    throw new Error('NO_TEST_ID_FROM_API');
  }

  // 항상 testId 키를 포함해 반환
  return { ...inner, testId };
};


export const startLevelTest = (language = 'en') =>
  levelTestStart({ languageCode: language });




// 레벨 테스트 질문 조회 (Spring Boot)
export const getLevelTestQuestions = async (testId, category = 'general') => {
  try {
    const response = await api.get(API_ENDPOINTS.LEVEL_TEST.GET(testId), {
      params: { category }
    });
    return response.data;
  } catch (error) {
    console.error('Get level test questions error:', error);
    throw error;
  }
};

// 음성 답변 제출 (Spring Boot)
export const submitVoiceAnswer = async (testId, questionId, audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, `question_${questionId}.webm`);
    formData.append('questionId', questionId.toString());
    
    const response = await api.post(`${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/${testId}/audio-answer`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Submit voice answer error:', error);
    throw error;
  }
};

 export const submitAnswer = async ({
   testId,
   questionNumber,
   userAnswer,
   userAudioUrl,
   responseTimeSeconds,
 }) => {
   const response = await api.post(API_ENDPOINTS.LEVEL_TEST.SUBMIT, {
     testId,
     questionNumber,
     userAnswer,
     userAudioUrl,
     responseTimeSeconds,
   });
    return response.data;
 };

const unwrap = (resp) => (resp?.data?.data ?? resp?.data ?? resp);
// 음성 테스트 시작 (Spring Boot)
export const startVoiceTest = async (languageCode, currentLevel = null) => {
  try {
    const response = await api.post(API_ENDPOINTS.LEVEL_TEST.VOICE.START, {
      languageCode,
      currentLevel
    });
    return unwrap(response);
  } catch (error) {
    console.error('Start voice test error:', error);
    throw error;
  }
};

// 음성 파일 업로드 (Spring Boot)
export const uploadVoiceRecording = async (testId, audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await api.post(API_ENDPOINTS.LEVEL_TEST.VOICE.UPLOAD(testId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return unwrap(response);

  } catch (error) {
    console.error('Upload voice recording error:', error);
    throw error;
  }
};

// 음성 테스트 분석 (Spring Boot)
export const analyzeVoiceTest = async (testId) => {
  try {
    const response = await api.post(API_ENDPOINTS.LEVEL_TEST.VOICE.ANALYZE(testId));
    return unwrap(response);

  } catch (error) {
    console.error('Analyze voice test error:', error);
    throw error;
  }
};

// 음성 테스트 결과 조회 (Spring Boot)

// export const getVoiceTestResult = async (testId) => {
//   try {
//     const response = await api.get(API_ENDPOINTS.LEVEL_TEST.VOICE.RESULT(testId));
//     return response.data;
//   } catch (error) {
//     console.error('Get voice test result error:', error);
//     throw error;
//   }
// };
export const getVoiceTestResult = async (testId) => {
   const resp = await api.get(API_ENDPOINTS.LEVEL_TEST.VOICE.RESULT(testId));
   return unwrap(resp);
 };


// 레벨 테스트 완료 (Spring Boot)
export const completeLevelTest = async (testId) => {
  try {
    const response = await api.post(API_ENDPOINTS.LEVEL_TEST.COMPLETE(testId));
    return response.data;
  } catch (error) {
    console.error('Complete level test error:', error);
    throw error;
  }
};

// 레벨 테스트 결과 조회 (Spring Boot)
export const getLevelTestResult = async (testId) => {
  try {
    const response = await api.get(API_ENDPOINTS.LEVEL_TEST.GET(testId));
    return response.data;
  } catch (error) {
    console.error('Get level test result error:', error);
    throw error;
  }
};

// 사용자의 레벨 테스트 목록 조회 (Spring Boot)
export const getUserLevelTests = async (page = 0, size = 10) => {
  try {
    const response = await api.get(API_ENDPOINTS.LEVEL_TEST.MY_TESTS, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Get user level tests error:', error);
    throw error;
  }
};

// 레벨 테스트 요약 정보 조회 (Spring Boot)
export const getLevelTestSummary = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.LEVEL_TEST.SUMMARY);
    return response.data;
  } catch (error) {
    console.error('Get level test summary error:', error);
    throw error;
  }
};

// ===== 백워드 호환성을 위한 별칭 (Deprecated - 추후 제거 예정) =====

// 기존 Workers API 호환성을 위한 함수들
export const uploadAudioFile = submitVoiceAnswer;
export const submitLevelTest = submitAnswer;
export const analyzeResponses = analyzeVoiceTest;
export const getLevelTestProgress = getUserLevelTests;

// 추가 유틸리티 함수들
export const restartLevelTest = async (language = 'en') => {
  try {
    const response = await api.post(`${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/restart`, {
      targetLanguage: language
    });
    return response.data;
  } catch (error) {
    console.error('Restart level test error:', error);
    throw error;
  }
};

export const getLevelTestSettings = async () => {
  try {
    const response = await api.get(`${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/settings`);
    return response.data;
  } catch (error) {
    console.error('Get level test settings error:', error);
    throw error;
  }
};

export const getLevelTestStats = async () => {
  try {
    const response = await api.get(`${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/stats`);
    return response.data;
  } catch (error) {
    console.error('Get level test stats error:', error);
    throw error;
  }
};

// 기본 내보내기
export default {
  // 주요 함수들
  startLevelTest,
  getLevelTestQuestions,
  submitAnswer,
  submitVoiceAnswer,
  completeLevelTest,
  getLevelTestResult,
  getUserLevelTests,
  getLevelTestSummary,
  
  // 음성 테스트
  startVoiceTest,
  analyzeVoiceTest,
  
  // 유틸리티
  restartLevelTest,
  getLevelTestSettings,
  getLevelTestStats
};