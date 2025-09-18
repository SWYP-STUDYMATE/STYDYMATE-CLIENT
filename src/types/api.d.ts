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

export interface PaginationMeta {
  page: number; // 0-based index
  size: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  empty: boolean;
}

export interface SortOrder {
  property: string;
  direction: 'ASC' | 'DESC';
  ignoreCase: boolean;
  nullHandling: 'NATIVE' | 'NULLS_FIRST' | 'NULLS_LAST';
}

export interface SortInfo {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
  orders: SortOrder[];
}

export interface PageResponse<T> {
  content: T[];
  pagination: PaginationMeta;
  sort: SortInfo;
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

// 캘린더 응답 타입
export interface CalendarEventResponse {
  sessionId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  eventType: string; // SESSION, BOOKING 등
  status: string;
  isHost: boolean;
  color?: string;
}

export interface CalendarAvailableSlotResponse {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CalendarResponse {
  events: CalendarEventResponse[];
  availableSlots: CalendarAvailableSlotResponse[];
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
