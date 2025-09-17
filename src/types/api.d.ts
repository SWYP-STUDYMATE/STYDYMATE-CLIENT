// 서버 ApiResponse와 동일한 구조로 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// 공통 응답 타입들
export interface UserNameResponse {
  englishName: string;
  userName?: string;
}

export interface ProfileImageUrlResponse {
  imageUrl: string;
  fileName?: string;
}

export interface LanguageResponse {
  id: number;
  name: string;
  code: string;
  flag?: string;
}

export interface LangLevelTypeResponse {
  id: number;
  name: string;
  description?: string;
  level: number;
}

export interface LocationResponse {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
}

export interface UserGenderTypeResponse {
  id: number;
  name: string;
  code: string;
}

// 온보딩 관련 응답 타입
export interface OnboardingProgressResponse {
  step: number;
  completed: boolean;
  totalSteps: number;
}

export interface OnboardingDataResponse {
  currentStep: number;
  completedSteps: string[];
  userData: {
    englishName?: string;
    profileImageUrl?: string;
    location?: LocationResponse;
    nativeLanguage?: LanguageResponse;
    targetLanguages?: Array<{
      language: LanguageResponse;
      currentLevel: LangLevelTypeResponse;
      targetLevel: LangLevelTypeResponse;
    }>;
  };
}

// 사용자 프로필 관련 응답 타입
export interface UserProfileResponse {
  id: string;
  englishName: string;
  profileImageUrl?: string;
  selfBio?: string;
  location?: LocationResponse;
  nativeLanguage?: LanguageResponse;
  targetLanguages?: LanguageResponse[];
  birthYear?: number;
  birthday?: string;
  gender?: UserGenderTypeResponse;
  createdAt: string;
  updatedAt: string;
}

export interface UserCompleteProfileResponse extends UserProfileResponse {
  onboardingCompleted: boolean;
  profileCompleteness: number;
}

export interface OnboardingStatusResponse {
  basicInfoCompleted: boolean;
  languageInfoCompleted: boolean;
  interestInfoCompleted: boolean;
  partnerInfoCompleted: boolean;
  scheduleInfoCompleted: boolean;
  onboardingCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
  isCompleted: boolean;
  completedSteps?: number[];
  nextStep?: number;
}

export interface UserSettingsResponse {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showOnlineStatus: boolean;
    allowMessages: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

// 요청 타입들
export interface NativeLanguageRequest {
  languageId: number;
}

export interface LanguageLevelRequest {
  languages: Array<{
    languageId: number;
    currentLevelId: number;
    targetLevelId: number;
  }>;
}

export interface EnglishNameRequest {
  englishName: string;
}

export interface BirthyearRequest {
  birthYear: number;
}

export interface BirthdayRequest {
  birthday: string;
}

export interface UserGenderTypeRequest {
  genderTypeId: number;
}

export interface SelfBioRequest {
  selfBio: string;
}

export interface LocationRequest {
  locationId: number;
}

export interface CompleteOnboardingRequest {
  step: number;
  data: Record<string, any>;
}

export interface UserCompleteProfileRequest {
  englishName?: string;
  selfBio?: string;
  locationId?: number;
  genderTypeId?: number;
  birthYear?: number;
  birthday?: string;
}

export interface UserSettingsRequest {
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profilePublic?: boolean;
    showOnlineStatus?: boolean;
    allowMessages?: boolean;
  };
  preferences?: {
    language?: string;
    timezone?: string;
    theme?: 'light' | 'dark' | 'auto';
  };
}
