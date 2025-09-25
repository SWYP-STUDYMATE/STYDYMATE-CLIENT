// @ts-check
import axios from 'axios';
import api from './index';

// 완전한 사용자 프로필 조회 (Workers API 연동)
export const getUserCompleteProfile = async () => {
  try {
    const response = await api.get('/users/complete-profile');
    return response.data;
  } catch (error) {
    console.error('Get user complete profile error:', error);
    throw error;
  }
};

// getCompleteProfile 별칭 (기존 호환성)
export const getCompleteProfile = getUserCompleteProfile;

// 완전한 사용자 프로필 업데이트 (Workers API 연동)
export const updateUserCompleteProfile = async (profileData) => {
  try {
    await api.put('/users/complete-profile', profileData);
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
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

// 레거시 프로필 업데이트 (기존 유지)
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.patch('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

// 사용자 기본 정보 조회
export const getUserInfo = async () => {
  try {
    const response = await api.get('/users/info');
    return response.data;
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
};

// 사용자 이름 조회
export const getUserName = async () => {
  try {
    const response = await api.get('/users/name');
    return response.data;
  } catch (error) {
    console.error('Get user name error:', error);
    throw error;
  }
};

// 사용자 언어 정보 조회
export const getUserLanguageInfo = async () => {
  try {
    const response = await api.get('/users/language-info');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status && [401, 403, 404].includes(status)) {
        console.warn('User language info endpoint returned no data:', status);
        return null;
      }
    }
    console.error('Get user language info error:', error);
    throw error;
  }
};

// 사용자 언어 정보 업데이트
export const updateUserLanguageInfo = async (languageData) => {
  try {
    const response = await api.patch('/users/language-info', languageData);
    return response.data;
  } catch (error) {
    console.error('Update user language info error:', error);
    throw error;
  }
};

// 사용자 동기/목표 정보 조회
export const getUserMotivationInfo = async () => {
  try {
    const response = await api.get('/users/motivation-info');
    return response.data;
  } catch (error) {
    console.error('Get user motivation info error:', error);
    throw error;
  }
};

// 사용자 동기/목표 정보 업데이트
export const updateUserMotivationInfo = async (motivationData) => {
  try {
    const response = await api.patch('/users/motivation-info', motivationData);
    return response.data;
  } catch (error) {
    console.error('Update user motivation info error:', error);
    throw error;
  }
};

// 사용자 파트너 선호도 정보 조회
export const getUserPartnerInfo = async () => {
  try {
    const response = await api.get('/users/partner-info');
    return response.data;
  } catch (error) {
    console.error('Get user partner info error:', error);
    throw error;
  }
};

// 사용자 파트너 선호도 정보 업데이트
export const updateUserPartnerInfo = async (partnerData) => {
  try {
    const response = await api.patch('/users/partner-info', partnerData);
    return response.data;
  } catch (error) {
    console.error('Update user partner info error:', error);
    throw error;
  }
};

// 사용자 스케줄 정보 조회
export const getUserScheduleInfo = async () => {
  try {
    const response = await api.get('/users/schedule-info');
    return response.data;
  } catch (error) {
    console.error('Get user schedule info error:', error);
    throw error;
  }
};

// 사용자 스케줄 정보 업데이트
export const updateUserScheduleInfo = async (scheduleData) => {
  try {
    const response = await api.patch('/users/schedule-info', scheduleData);
    return response.data;
  } catch (error) {
    console.error('Update user schedule info error:', error);
    throw error;
  }
};

// 온보딩 상태 조회 (Workers API 연동)
export const getOnboardingStatus = async () => {
  try {
    const response = await api.get('/users/onboarding-status');
    const payload = response.data?.data ?? response.data;

    if (!payload || typeof payload !== 'object') {
      return payload;
    }

    const normalizeBoolean = (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value === 1;
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['1', 'true', 'completed', 'yes'].includes(normalized)) return true;
        if (['0', 'false', 'incomplete', 'no'].includes(normalized)) return false;
      }
      return Boolean(value);
    };

    const completedValue = payload.isCompleted ?? payload.completed;
    const isCompleted = normalizeBoolean(completedValue);

    const normalized = {
      ...payload,
      ...(payload.next_step !== undefined && payload.nextStep === undefined
        ? { nextStep: payload.next_step }
        : {}),
      ...(payload.current_step !== undefined && payload.currentStep === undefined
        ? { currentStep: payload.current_step }
        : {}),
      ...(payload.total_steps !== undefined && payload.totalSteps === undefined
        ? { totalSteps: payload.total_steps }
        : {}),
      isCompleted,
      completed: isCompleted,
    };

    return normalized;
  } catch (error) {
    console.error('Get onboarding status error:', error);
    throw error;
  }
};

// 온보딩 완료 처리 (Workers API 연동)
export const completeOnboarding = async (onboardingData) => {
  try {
    await api.post('/users/complete-onboarding', onboardingData || {});
  } catch (error) {
    console.error('Complete onboarding error:', error);
    throw error;
  }
};

// 사용자 통계 조회
export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return response.data;
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
};

// 사용자 설정 조회 (Workers API 연동)
export const getUserSettings = async () => {
  try {
    const response = await api.get('/users/settings');
    return response.data;
  } catch (error) {
    console.error('Get user settings error:', error);
    throw error;
  }
};

// 사용자 설정 업데이트 (Workers API 연동)
export const updateUserSettings = async (settings) => {
  try {
    await api.put('/users/settings', settings);
  } catch (error) {
    console.error('Update user settings error:', error);
    throw error;
  }
};

// 프로필 이미지 업로드 (Workers API 연동)
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.post('/users/profile-image', formData, {
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
    const response = await api.get('/users/profile-image');
    return response.data;
  } catch (error) {
    console.error('Get profile image URL error:', error);
    throw error;
  }
};

// 계정 삭제
export const deleteAccount = async () => {
  try {
    const response = await api.delete('/users/account');
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
    await api.post('/users/english-name', requestData);
  } catch (error) {
    console.error('Save english name error:', error);
    throw error;
  }
};

export const saveBirthYear = async (birthYear) => {
  try {
    const requestData = { birthYear };
    await api.post('/users/birthyear', requestData);
  } catch (error) {
    console.error('Save birth year error:', error);
    throw error;
  }
};

export const saveBirthDay = async (birthday) => {
  try {
    const requestData = { birthday };
    await api.post('/users/birthday', requestData);
  } catch (error) {
    console.error('Save birthday error:', error);
    throw error;
  }
};

export const saveUserGender = async (genderTypeId) => {
  try {
    const requestData = { genderTypeId };
    await api.post('/users/gender', requestData);
  } catch (error) {
    console.error('Save user gender error:', error);
    throw error;
  }
};

export const saveSelfBio = async (selfBio) => {
  try {
    const requestData = { selfBio };
    await api.post('/users/self-bio', requestData);
  } catch (error) {
    console.error('Save self bio error:', error);
    throw error;
  }
};

export const saveLocation = async (locationId) => {
  try {
    const requestData = { locationId };
    await api.post('/users/location', requestData);
  } catch (error) {
    console.error('Save location error:', error);
    throw error;
  }
};

// 옵션 조회 함수들
export const getAllLocation = async () => {
  try {
    const response = await api.get('/users/locations');
    return response.data;
  } catch (error) {
    console.error('Get all location error:', error);
    throw error;
  }
};

export const getAllUserGender = async () => {
  try {
    const response = await api.get('/users/gender-type');
    return response.data;
  } catch (error) {
    console.error('Get all user gender error:', error);
    throw error;
  }
};
