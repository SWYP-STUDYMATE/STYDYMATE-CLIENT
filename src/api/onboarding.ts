// @ts-check
import api from './index.js';
import type { 
  ApiResponse,
  OnboardingDataResponse,
  OnboardingProgressResponse,
  LanguageResponse,
  LangLevelTypeResponse,
  NativeLanguageRequest,
  LanguageLevelRequest 
} from '../types/api';

// 온보딩 데이터 조회 (Spring Boot API 연동)
export const getOnboardingData = async (): Promise<OnboardingDataResponse> => {
  try {
    const response = await api.get<ApiResponse<OnboardingDataResponse>>('/onboarding/data');
    return response.data.data!;
  } catch (error) {
    console.error('Get onboarding data error:', error);
    throw error;
  }
};

// 온보딩 진행 상태 조회 (Spring Boot API 연동)
export const getOnboardingProgress = async (): Promise<OnboardingProgressResponse> => {
  try {
    const response = await api.get<ApiResponse<OnboardingProgressResponse>>('/onboarding/progress');
    return response.data.data!;
  } catch (error) {
    console.error('Get onboarding progress error:', error);
    throw error;
  }
};

// 전체 온보딩 완료 처리 (Spring Boot API 연동)
export const completeAllOnboarding = async (onboardingData: any): Promise<void> => {
  try {
    const response = await api.post<ApiResponse<void>>('/onboarding/complete', onboardingData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Onboarding completion failed');
    }
  } catch (error) {
    console.error('Complete onboarding error:', error);
    throw error;
  }
};

// 언어 정보 저장 (모국어 + 목표 언어들)
export const saveLanguageInfo = async (languageData: {
  nativeLanguageId: number;
  targetLanguages: Array<{
    languageId: number;
    currentLevelId: number;
    targetLevelId: number;
  }>;
}): Promise<void> => {
  try {
    console.log("🔍 언어 정보 저장 시작:", languageData);
    
    // 모국어 저장
    const requestBody: NativeLanguageRequest = {
      languageId: languageData.nativeLanguageId
    };
    console.log("🔍 API 요청 본문:", requestBody);
    
    const response = await api.post<ApiResponse<void>>('/onboard/language/native-language', requestBody);
    
    // 목표 언어들 저장 (배치로 처리)
    if (languageData.targetLanguages && languageData.targetLanguages.length > 0) {
      const levelRequest: LanguageLevelRequest = {
        languages: languageData.targetLanguages.map(targetLang => ({
          languageId: targetLang.languageId,
          currentLevelId: targetLang.currentLevelId,
          targetLevelId: targetLang.targetLevelId
        }))
      };

      await api.post<ApiResponse<void>>('/onboard/language/language-level', levelRequest);
    }
    
    console.log("✅ 언어 정보 저장 완료");
  } catch (error) {
    console.error('Save language info error:', error);
    throw error;
  }
};

// 온보딩 옵션 조회 함수들 (기존 API 활용)

// 언어 목록 조회
export const getLanguages = async (): Promise<LanguageResponse[]> => {
  try {
    const response = await api.get<LanguageResponse[]>('/onboard/language/languages');
    return response.data;
  } catch (error) {
    console.error('Get languages error:', error);
    throw error;
  }
};

// 언어 레벨 타입 조회
export const getLanguageLevelTypes = async (): Promise<LangLevelTypeResponse[]> => {
  try {
    const response = await api.get<LangLevelTypeResponse[]>('/onboard/language/level-types-language');
    return response.data;
  } catch (error) {
    console.error('Get language level types error:', error);
    throw error;
  }
};

// 파트너 레벨 타입 조회
export const getPartnerLevelTypes = async (): Promise<LangLevelTypeResponse[]> => {
  try {
    const response = await api.get<LangLevelTypeResponse[]>('/onboard/language/level-types-partner');
    return response.data;
  } catch (error) {
    console.error('Get partner level types error:', error);
    throw error;
  }
};

// 온보딩 단계별 저장 함수들 (기존 기능 유지)
export const saveStep1 = async (step1Data: { englishName: string; locationId: number }): Promise<void> => {
  try {
    console.log('🔍 Step1 데이터 저장:', step1Data);
    
    // 영어 이름 저장
    await api.post<ApiResponse<void>>('/user/english-name', { englishName: step1Data.englishName });
    
    // 거주지 저장
    await api.post<ApiResponse<void>>('/user/location', { locationId: step1Data.locationId });
    
    console.log('✅ Step1 데이터 저장 완료');
  } catch (error) {
    console.error('Save step1 error:', error);
    throw error;
  }
};

export const saveStep2 = async (step2Data: { profileImage?: File }): Promise<void> => {
  try {
    console.log('🔍 Step2 데이터 저장:', step2Data);
    
    if (step2Data.profileImage) {
      const formData = new FormData();
      formData.append('file', step2Data.profileImage);
      
      await api.post<ApiResponse<any>>('/user/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    
    console.log('✅ Step2 데이터 저장 완료');
  } catch (error) {
    console.error('Save step2 error:', error);
    throw error;
  }
};

export const saveStep3 = async (step3Data: { selfBio: string }): Promise<void> => {
  try {
    console.log('🔍 Step3 데이터 저장:', step3Data);
    
    await api.post<ApiResponse<void>>('/user/self-bio', { selfBio: step3Data.selfBio });
    
    console.log('✅ Step3 데이터 저장 완료');
  } catch (error) {
    console.error('Save step3 error:', error);
    throw error;
  }
};

export const saveStep4 = async (step4Data: any): Promise<void> => {
  try {
    console.log('🔍 Step4 데이터 저장 (언어 정보):', step4Data);
    
    await saveLanguageInfo(step4Data);
    
    console.log('✅ Step4 데이터 저장 완료');
  } catch (error) {
    console.error('Save step4 error:', error);
    throw error;
  }
};
