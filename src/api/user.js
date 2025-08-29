import api from './index.js';

// 사용자 프로필 조회
export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.patch('/user/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

// 사용자 기본 정보 조회
export const getUserInfo = async () => {
  try {
    const response = await api.get('/user/info');
    return response.data;
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
};

// 사용자 언어 정보 조회
export const getUserLanguageInfo = async () => {
  try {
    const response = await api.get('/user/language-info');
    return response.data;
  } catch (error) {
    console.error('Get user language info error:', error);
    throw error;
  }
};

// 사용자 언어 정보 업데이트
export const updateUserLanguageInfo = async (languageData) => {
  try {
    const response = await api.patch('/user/language-info', languageData);
    return response.data;
  } catch (error) {
    console.error('Update user language info error:', error);
    throw error;
  }
};

// 사용자 동기/목표 정보 조회
export const getUserMotivationInfo = async () => {
  try {
    const response = await api.get('/user/motivation-info');
    return response.data;
  } catch (error) {
    console.error('Get user motivation info error:', error);
    throw error;
  }
};

// 사용자 동기/목표 정보 업데이트
export const updateUserMotivationInfo = async (motivationData) => {
  try {
    const response = await api.patch('/user/motivation-info', motivationData);
    return response.data;
  } catch (error) {
    console.error('Update user motivation info error:', error);
    throw error;
  }
};

// 사용자 파트너 선호도 정보 조회
export const getUserPartnerInfo = async () => {
  try {
    const response = await api.get('/user/partner-info');
    return response.data;
  } catch (error) {
    console.error('Get user partner info error:', error);
    throw error;
  }
};

// 사용자 파트너 선호도 정보 업데이트
export const updateUserPartnerInfo = async (partnerData) => {
  try {
    const response = await api.patch('/user/partner-info', partnerData);
    return response.data;
  } catch (error) {
    console.error('Update user partner info error:', error);
    throw error;
  }
};

// 사용자 스케줄 정보 조회
export const getUserScheduleInfo = async () => {
  try {
    const response = await api.get('/user/schedule-info');
    return response.data;
  } catch (error) {
    console.error('Get user schedule info error:', error);
    throw error;
  }
};

// 사용자 스케줄 정보 업데이트
export const updateUserScheduleInfo = async (scheduleData) => {
  try {
    const response = await api.patch('/user/schedule-info', scheduleData);
    return response.data;
  } catch (error) {
    console.error('Update user schedule info error:', error);
    throw error;
  }
};

// 온보딩 상태 조회
export const getOnboardingStatus = async () => {
  try {
    const response = await api.get('/user/onboarding/status');
    return response.data;
  } catch (error) {
    console.error('Get onboarding status error:', error);
    throw error;
  }
};

// 온보딩 완료 처리
export const completeOnboarding = async () => {
  try {
    const response = await api.post('/user/onboarding/complete');
    return response.data;
  } catch (error) {
    console.error('Complete onboarding error:', error);
    throw error;
  }
};

// 사용자 통계 조회
export const getUserStats = async () => {
  try {
    const response = await api.get('/user/stats');
    return response.data;
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
};

// 사용자 설정 조회
export const getUserSettings = async () => {
  try {
    const response = await api.get('/user/settings');
    return response.data;
  } catch (error) {
    console.error('Get user settings error:', error);
    throw error;
  }
};

// 사용자 설정 업데이트
export const updateUserSettings = async (settings) => {
  try {
    const response = await api.patch('/user/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Update user settings error:', error);
    throw error;
  }
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/user/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload profile image error:', error);
    throw error;
  }
};

// 계정 삭제
export const deleteAccount = async () => {
  try {
    const response = await api.delete('/user/account');
    return response.data;
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};