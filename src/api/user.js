// @ts-check
import api from './index';

// 완전한 사용자 프로필 조회 (Spring Boot API 연동)
export const getUserCompleteProfile = async () => {
  try {
    const response = await api.get('/user/complete-profile');
    return response.data;
  } catch (error) {
    console.error('Get user complete profile error:', error);
    throw error;
  }
};

// getCompleteProfile 별칭 (기존 호환성)
export const getCompleteProfile = getUserCompleteProfile;

// 완전한 사용자 프로필 업데이트 (Spring Boot API 연동)
export const updateUserCompleteProfile = async (profileData) => {
  try {
    await api.put('/user/complete-profile', profileData);
  } catch (error) {
    console.error('Update user complete profile error:', error);
    throw error;
  }
};

// updateCompleteProfile 별칭 (기존 호환성)
export const updateCompleteProfile = updateUserCompleteProfile;

// 레거시 프로필 조회
export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

// 레거시 프로필 업데이트 (기존 유지)
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

// 사용자 이름 조회
export const getUserName = async () => {
  try {
    const response = await api.get('/user/name');
    return response.data;
  } catch (error) {
    console.error('Get user name error:', error);
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

// 온보딩 상태 조회 (Spring Boot API 연동)
export const getOnboardingStatus = async () => {
  try {
    const response = await api.get('/user/onboarding-status');
    return response.data;
  } catch (error) {
    console.error('Get onboarding status error:', error);
    throw error;
  }
};

// 온보딩 완료 처리 (Spring Boot API 연동)
export const completeOnboarding = async (onboardingData) => {
  try {
    await api.post('/user/complete-onboarding', onboardingData || {});
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

// 사용자 설정 조회 (Spring Boot API 연동)
export const getUserSettings = async () => {
  try {
    const response = await api.get('/user/settings');
    return response.data;
  } catch (error) {
    console.error('Get user settings error:', error);
    throw error;
  }
};

// 사용자 설정 업데이트 (Spring Boot API 연동)
export const updateUserSettings = async (settings) => {
  try {
    await api.put('/user/settings', settings);
  } catch (error) {
    console.error('Update user settings error:', error);
    throw error;
  }
};

// 프로필 이미지 업로드 (Spring Boot API 연동)
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.post('/user/profile-image', formData, {
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

// saveProfileImage 별칭 (기존 호환성)
export const saveProfileImage = uploadProfileImage;

// 프로필 이미지 URL 조회
export const getProfileImageUrl = async () => {
  try {
    const response = await api.get('/user/profile-image');
    return response.data;
  } catch (error) {
    console.error('Get profile image URL error:', error);
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

// 사용자 기본 정보 저장 함수들
export const saveEnglishName = async (englishName) => {
  try {
    const requestData = { englishName };
    await api.post('/user/english-name', requestData);
  } catch (error) {
    console.error('Save english name error:', error);
    throw error;
  }
};

export const saveBirthYear = async (birthYear) => {
  try {
    const requestData = { birthYear };
    await api.post('/user/birthyear', requestData);
  } catch (error) {
    console.error('Save birth year error:', error);
    throw error;
  }
};

export const saveBirthDay = async (birthday) => {
  try {
    const requestData = { birthday };
    await api.post('/user/birthday', requestData);
  } catch (error) {
    console.error('Save birthday error:', error);
    throw error;
  }
};

export const saveUserGender = async (genderTypeId) => {
  try {
    const requestData = { genderTypeId };
    await api.post('/user/gender', requestData);
  } catch (error) {
    console.error('Save user gender error:', error);
    throw error;
  }
};

export const saveSelfBio = async (selfBio) => {
  try {
    const requestData = { selfBio };
    await api.post('/user/self-bio', requestData);
  } catch (error) {
    console.error('Save self bio error:', error);
    throw error;
  }
};

export const saveLocation = async (locationId) => {
  try {
    const requestData = { locationId };
    await api.post('/user/location', requestData);
  } catch (error) {
    console.error('Save location error:', error);
    throw error;
  }
};

// 옵션 조회 함수들
export const getAllLocation = async () => {
  try {
    const response = await api.get('/user/locations');
    return response.data;
  } catch (error) {
    console.error('Get all location error:', error);
    throw error;
  }
};

export const getAllUserGender = async () => {
  try {
    const response = await api.get('/user/gender-type');
    return response.data;
  } catch (error) {
    console.error('Get all user gender error:', error);
    throw error;
  }
};