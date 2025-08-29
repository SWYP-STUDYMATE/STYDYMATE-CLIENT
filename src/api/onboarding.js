import api from './index.js';

// 온보딩 상태 조회
export const getOnboardingStatus = async () => {
  try {
    const response = await api.get('/onboarding/status');
    return response.data;
  } catch (error) {
    console.error('Get onboarding status error:', error);
    throw error;
  }
};

// 온보딩 1단계 데이터 저장 (기본 정보)
export const saveOnboardingStep1 = async (data) => {
  try {
    const response = await api.post('/onboarding/step/1', {
      englishName: data.englishName,
      residence: data.residence,
      profileImage: data.profileImage,
      intro: data.intro
    });
    return response.data;
  } catch (error) {
    console.error('Save onboarding step 1 error:', error);
    throw error;
  }
};

// 온보딩 2단계 데이터 저장 (언어 정보)
export const saveOnboardingStep2 = async (data) => {
  try {
    const response = await api.post('/onboarding/step/2', {
      nativeLanguage: data.nativeLanguage,
      targetLanguage: data.targetLanguage,
      proficiencyLevel: data.proficiencyLevel,
      hasLevelTest: data.hasLevelTest
    });
    return response.data;
  } catch (error) {
    console.error('Save onboarding step 2 error:', error);
    throw error;
  }
};

// 온보딩 3단계 데이터 저장 (관심사 및 목표)
export const saveOnboardingStep3 = async (data) => {
  try {
    const response = await api.post('/onboarding/step/3', {
      interests: data.interests,
      learningGoals: data.learningGoals,
      motivation: data.motivation,
      preferredTopics: data.preferredTopics
    });
    return response.data;
  } catch (error) {
    console.error('Save onboarding step 3 error:', error);
    throw error;
  }
};

// 온보딩 4단계 데이터 저장 (파트너 선호도)
export const saveOnboardingStep4 = async (data) => {
  try {
    const response = await api.post('/onboarding/step/4', {
      preferredAge: data.preferredAge,
      preferredGender: data.preferredGender,
      preferredNationalities: data.preferredNationalities,
      sessionType: data.sessionType,
      partnerLevel: data.partnerLevel
    });
    return response.data;
  } catch (error) {
    console.error('Save onboarding step 4 error:', error);
    throw error;
  }
};

// 온보딩 5단계 데이터 저장 (스케줄 정보)
export const saveOnboardingStep5 = async (data) => {
  try {
    const response = await api.post('/onboarding/step/5', {
      timezone: data.timezone,
      availability: data.availability,
      preferredDuration: data.preferredDuration,
      flexibleSchedule: data.flexibleSchedule
    });
    return response.data;
  } catch (error) {
    console.error('Save onboarding step 5 error:', error);
    throw error;
  }
};

// 온보딩 완료 처리
export const completeOnboarding = async () => {
  try {
    const response = await api.post('/onboarding/complete');
    return response.data;
  } catch (error) {
    console.error('Complete onboarding error:', error);
    throw error;
  }
};

// 온보딩 진행률 조회
export const getOnboardingProgress = async () => {
  try {
    const response = await api.get('/onboarding/progress');
    return response.data;
  } catch (error) {
    console.error('Get onboarding progress error:', error);
    throw error;
  }
};

// 특정 단계 데이터 조회
export const getOnboardingStepData = async (step) => {
  try {
    const response = await api.get(`/onboarding/step/${step}`);
    return response.data;
  } catch (error) {
    console.error(`Get onboarding step ${step} error:`, error);
    throw error;
  }
};

// 온보딩 데이터 재설정 (다시 온보딩)
export const resetOnboarding = async () => {
  try {
    const response = await api.post('/onboarding/reset');
    return response.data;
  } catch (error) {
    console.error('Reset onboarding error:', error);
    throw error;
  }
};