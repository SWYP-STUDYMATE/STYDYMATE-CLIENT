import api from './index.js';

// 온보딩 데이터 조회 (Spring Boot API 연동)
export const getOnboardingData = async () => {
  try {
    const response = await api.get('/onboarding/data');
    return response.data;
  } catch (error) {
    console.error('Get onboarding data error:', error);
    throw error;
  }
};

// 온보딩 진행 상태 조회 (Spring Boot API 연동)
export const getOnboardingProgress = async () => {
  try {
    const response = await api.get('/onboarding/progress');
    return response.data;
  } catch (error) {
    console.error('Get onboarding progress error:', error);
    throw error;
  }
};

// 전체 온보딩 완료 처리 (Spring Boot API 연동)
export const completeAllOnboarding = async (onboardingData) => {
  try {
    const response = await api.post('/onboarding/complete', onboardingData);
    return response.data;
  } catch (error) {
    console.error('Complete all onboarding error:', error);
    throw error;
  }
};

// 현재 온보딩 단계 조회 (새로운 API)
export const getCurrentOnboardingStep = async () => {
  try {
    const response = await api.get('/onboarding/steps/current');
    return response.data;
  } catch (error) {
    console.error('Get current onboarding step error:', error);
    throw error;
  }
};

// 온보딩 단계 건너뛰기
export const skipOnboardingStep = async (stepNumber, reason = '') => {
  try {
    const response = await api.post(`/onboarding/steps/${stepNumber}/skip`, null, {
      params: { reason }
    });
    return response.data;
  } catch (error) {
    console.error(`Skip onboarding step ${stepNumber} error:`, error);
    throw error;
  }
};

// 단계별 온보딩 저장 함수들 (새로운 서버 API에 맞게 수정)

// 1단계: 개인정보 저장
export const saveOnboardingStep1 = async (personalData) => {
  try {
    // 영어 이름만 저장하는 API 호출
    const response = await api.post('/user/english-name', {
      englishName: personalData.englishName
    });
    return response.data;
  } catch (error) {
    console.error('Save onboarding step1 error:', error);
    throw error;
  }
};

// 2단계: 프로필 정보 저장
export const saveOnboardingStep2 = async (profileData) => {
  try {
    const response = await api.post('/onboarding/steps/2/save', profileData);
    return response.data;
  } catch (error) {
    console.error('Save onboarding step2 error:', error);
    throw error;
  }
};

// 3단계: 학습 정보 저장
export const saveOnboardingStep3 = async (learningData) => {
  try {
    const response = await api.post('/onboarding/steps/3/save', learningData);
    return response.data;
  } catch (error) {
    console.error('Save onboarding step3 error:', error);
    throw error;
  }
};

// 4단계: 선호도 저장
export const saveOnboardingStep4 = async (preferenceData) => {
  try {
    const response = await api.post('/onboarding/steps/4/save', preferenceData);
    return response.data;
  } catch (error) {
    console.error('Save onboarding step4 error:', error);
    throw error;
  }
};

// 언어 정보 저장
export const saveLanguageInfo = async (languageData) => {
  try {
    const response = await api.post('/onboard/language/native-language', {
      nativeLanguageId: languageData.nativeLanguageId
    });
    
    // 목표 언어들 저장
    if (languageData.targetLanguages && languageData.targetLanguages.length > 0) {
      for (const targetLang of languageData.targetLanguages) {
        await api.post('/onboard/language/language-level', {
          languageId: targetLang.languageId,
          currentLevelId: targetLang.currentLevelId,
          targetLevelId: targetLang.targetLevelId
        });
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Save language info error:', error);
    throw error;
  }
};

// 관심사 정보 저장
export const saveInterestInfo = async (interestData) => {
  try {
    const requests = [];
    
    // 동기 저장
    if (interestData.motivationIds && interestData.motivationIds.length > 0) {
      for (const motivationId of interestData.motivationIds) {
        requests.push(
          api.post('/onboard/interest/motivation', { motivationId })
        );
      }
    }
    
    // 주제 저장
    if (interestData.topicIds && interestData.topicIds.length > 0) {
      for (const topicId of interestData.topicIds) {
        requests.push(
          api.post('/onboard/interest/topic', { topicId })
        );
      }
    }
    
    // 학습 스타일 저장
    if (interestData.learningStyleIds && interestData.learningStyleIds.length > 0) {
      for (const learningStyleId of interestData.learningStyleIds) {
        requests.push(
          api.post('/onboard/interest/learning-style', { learningStyleId })
        );
      }
    }
    
    // 학습 기대 저장
    if (interestData.learningExpectationIds && interestData.learningExpectationIds.length > 0) {
      for (const learningExpectationId of interestData.learningExpectationIds) {
        requests.push(
          api.post('/onboard/interest/learning-expectation', { learningExpectationId })
        );
      }
    }
    
    await Promise.all(requests);
    return { success: true };
  } catch (error) {
    console.error('Save interest info error:', error);
    throw error;
  }
};

// 파트너 선호도 저장
export const savePartnerInfo = async (partnerData) => {
  try {
    const requests = [];
    
    // 파트너 성격 저장
    if (partnerData.partnerPersonalityIds && partnerData.partnerPersonalityIds.length > 0) {
      for (const personalityId of partnerData.partnerPersonalityIds) {
        requests.push(
          api.post('/onboard/partner/personality', { partnerPersonalityId: personalityId })
        );
      }
    }
    
    // 그룹 크기 저장
    if (partnerData.groupSizeIds && partnerData.groupSizeIds.length > 0) {
      for (const groupSizeId of partnerData.groupSizeIds) {
        requests.push(
          api.post('/onboard/partner/group-size', { groupSizeId })
        );
      }
    }
    
    await Promise.all(requests);
    return { success: true };
  } catch (error) {
    console.error('Save partner info error:', error);
    throw error;
  }
};

// 스케줄 정보 저장
export const saveScheduleInfo = async (scheduleData) => {
  try {
    const requests = [];
    
    if (scheduleData.scheduleIds && scheduleData.scheduleIds.length > 0) {
      for (const scheduleId of scheduleData.scheduleIds) {
        requests.push(
          api.post('/onboard/schedule/schedule', { scheduleId })
        );
      }
    }
    
    await Promise.all(requests);
    return { success: true };
  } catch (error) {
    console.error('Save schedule info error:', error);
    throw error;
  }
};

// 온보딩 옵션 조회 함수들 (기존 API 활용)

// 언어 목록 조회
export const getLanguages = async () => {
  try {
    const response = await api.get('/onboard/language/languages');
    return response.data;
  } catch (error) {
    console.error('Get languages error:', error);
    throw error;
  }
};

// 언어 레벨 타입 조회
export const getLanguageLevelTypes = async () => {
  try {
    const response = await api.get('/onboard/language/level-types-language');
    return response.data;
  } catch (error) {
    console.error('Get language level types error:', error);
    throw error;
  }
};

// 파트너 레벨 타입 조회
export const getPartnerLevelTypes = async () => {
  try {
    const response = await api.get('/onboard/language/level-types-partner');
    return response.data;
  } catch (error) {
    console.error('Get partner level types error:', error);
    throw error;
  }
};

// 동기 목록 조회
export const getMotivations = async () => {
  try {
    const response = await api.get('/onboard/interest/motivations');
    return response.data;
  } catch (error) {
    console.error('Get motivations error:', error);
    throw error;
  }
};

// 주제 목록 조회
export const getTopics = async () => {
  try {
    const response = await api.get('/onboard/interest/topics');
    return response.data;
  } catch (error) {
    console.error('Get topics error:', error);
    throw error;
  }
};

// 학습 스타일 목록 조회
export const getLearningStyles = async () => {
  try {
    const response = await api.get('/onboard/interest/learning-styles');
    return response.data;
  } catch (error) {
    console.error('Get learning styles error:', error);
    throw error;
  }
};

// 학습 기대 목록 조회
export const getLearningExpectations = async () => {
  try {
    const response = await api.get('/onboard/interest/learning-expectations');
    return response.data;
  } catch (error) {
    console.error('Get learning expectations error:', error);
    throw error;
  }
};