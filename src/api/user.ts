// @ts-check
import api from './index.js';
import type { 
  ApiResponse,
  UserNameResponse,
  UserProfileResponse,
  UserCompleteProfileResponse,
  ProfileImageUrlResponse,
  LocationResponse,
  UserGenderTypeResponse,
  OnboardingStatusResponse,
  UserSettingsResponse,
  EnglishNameRequest,
  BirthyearRequest,
  BirthdayRequest,
  UserGenderTypeRequest,
  SelfBioRequest,
  LocationRequest,
  CompleteOnboardingRequest,
  UserCompleteProfileRequest,
  UserSettingsRequest
} from '../types/api';

// 사용자 기본 정보 조회
export const getUserName = async (): Promise<UserNameResponse> => {
  try {
    const response = await api.get<UserNameResponse>('/user/name');
    return response.data;
  } catch (error) {
    console.error('Get user name error:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  try {
    const response = await api.get<UserProfileResponse>('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

export const getCompleteProfile = async (): Promise<UserCompleteProfileResponse> => {
  try {
    const response = await api.get<UserCompleteProfileResponse>('/user/complete-profile');
    return response.data;
  } catch (error) {
    console.error('Get complete profile error:', error);
    throw error;
  }
};

export const getProfileImageUrl = async (): Promise<ProfileImageUrlResponse> => {
  try {
    const response = await api.get<ProfileImageUrlResponse>('/user/profile-image');
    return response.data;
  } catch (error) {
    console.error('Get profile image URL error:', error);
    throw error;
  }
};

export const getOnboardingStatus = async (): Promise<OnboardingStatusResponse> => {
  try {
    const response = await api.get<OnboardingStatusResponse>('/user/onboarding-status');
    return response.data;
  } catch (error) {
    console.error('Get onboarding status error:', error);
    throw error;
  }
};

export const getUserSettings = async (): Promise<UserSettingsResponse> => {
  try {
    const response = await api.get<UserSettingsResponse>('/user/settings');
    return response.data;
  } catch (error) {
    console.error('Get user settings error:', error);
    throw error;
  }
};

// 사용자 기본 정보 저장
export const saveEnglishName = async (englishName: string): Promise<void> => {
  try {
    const requestData: EnglishNameRequest = { englishName };
    await api.post<ApiResponse<void>>('/user/english-name', requestData);
  } catch (error) {
    console.error('Save english name error:', error);
    throw error;
  }
};

export const saveBirthYear = async (birthYear: number): Promise<void> => {
  try {
    const requestData: BirthyearRequest = { birthYear };
    await api.post<ApiResponse<void>>('/user/birthyear', requestData);
  } catch (error) {
    console.error('Save birth year error:', error);
    throw error;
  }
};

export const saveBirthDay = async (birthday: string): Promise<void> => {
  try {
    const requestData: BirthdayRequest = { birthday };
    await api.post<ApiResponse<void>>('/user/birthday', requestData);
  } catch (error) {
    console.error('Save birthday error:', error);
    throw error;
  }
};

export const saveUserGender = async (genderTypeId: number): Promise<void> => {
  try {
    const requestData: UserGenderTypeRequest = { genderTypeId };
    await api.post<ApiResponse<void>>('/user/gender', requestData);
  } catch (error) {
    console.error('Save user gender error:', error);
    throw error;
  }
};

export const saveSelfBio = async (selfBio: string): Promise<void> => {
  try {
    const requestData: SelfBioRequest = { selfBio };
    await api.post<ApiResponse<void>>('/user/self-bio', requestData);
  } catch (error) {
    console.error('Save self bio error:', error);
    throw error;
  }
};

export const saveLocation = async (locationId: number): Promise<void> => {
  try {
    const requestData: LocationRequest = { locationId };
    await api.post<ApiResponse<void>>('/user/location', requestData);
  } catch (error) {
    console.error('Save location error:', error);
    throw error;
  }
};

export const saveProfileImage = async (file: File): Promise<ProfileImageUrlResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ProfileImageUrlResponse>('/user/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Save profile image error:', error);
    throw error;
  }
};

// 사용자 정보 업데이트
export const updateCompleteProfile = async (profileData: UserCompleteProfileRequest): Promise<void> => {
  try {
    await api.put<ApiResponse<void>>('/user/complete-profile', profileData);
  } catch (error) {
    console.error('Update complete profile error:', error);
    throw error;
  }
};

export const completeOnboarding = async (completionData: CompleteOnboardingRequest): Promise<void> => {
  try {
    await api.post<ApiResponse<void>>('/user/complete-onboarding', completionData);
  } catch (error) {
    console.error('Complete onboarding error:', error);
    throw error;
  }
};

export const updateUserSettings = async (settings: UserSettingsRequest): Promise<void> => {
  try {
    await api.put<ApiResponse<void>>('/user/settings', settings);
  } catch (error) {
    console.error('Update user settings error:', error);
    throw error;
  }
};

// 옵션 조회 함수들
export const getAllLocation = async (): Promise<LocationResponse[]> => {
  try {
    const response = await api.get<LocationResponse[]>('/user/locations');
    return response.data;
  } catch (error) {
    console.error('Get all location error:', error);
    throw error;
  }
};

export const getAllUserGender = async (): Promise<UserGenderTypeResponse[]> => {
  try {
    const response = await api.get<UserGenderTypeResponse[]>('/user/gender-type');
    return response.data;
  } catch (error) {
    console.error('Get all user gender error:', error);
    throw error;
  }
};
