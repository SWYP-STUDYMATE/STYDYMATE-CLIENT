# 프론트엔드 개발 가이드

**최종 업데이트**: 2025-01-18

## 📋 개요

STUDYMATE-CLIENT 프로젝트의 프론트엔드 개발 가이드입니다. 디자인 시스템, 컴포넌트 구조, 라우팅, 상태 관리, API 연동 방법을 정의합니다.

## 🎨 디자인 시스템

### 색상 팔레트

**⚠️ 중요: 모든 UI 구현 시 반드시 이 색상만 사용할 것**

#### Green 계열 (Primary Brand Color)
```css
--green-50: #E6F9F1;
--green-500: #00C471;  /* 메인 브랜드 컬러 */
--green-600: #00B267;
```

#### Black 계열 (Text & UI)
```css
--black-50: #E7E7E7;   /* 테두리 */
--black-200: #929292;  /* 보조 텍스트 */
--black-500: #111111;  /* 메인 텍스트 */
```

#### 기타 필수 색상
```css
--white: #FFFFFF;          /* 카드 배경 */
--background: #FAFAFA;     /* 페이지 배경 */
--naver: #03C75A;          /* 네이버 로그인 */
--red: #EA4335;            /* 에러/경고 */
--blue: #4285F4;           /* 정보/링크 */
--gray-border: #CED4DA;    /* 기본 테두리 */
```

### 타이포그래피
- **Font Family**: Pretendard
- **Letter Spacing**: `-0.025em` (전역)
- **제목**: H1 (32px, bold, 42px line-height)
- **본문**: Large (18px, bold, 28px), Medium (16px, medium, 24px), Small (14px)

### 간격 시스템
- **페이지 여백**: 24px (좌우)
- **섹션 간격**: 32px, 40px
- **컴포넌트 간격**: 12px, 16px, 20px, 24px
- **내부 패딩**: 14px, 16px

### 버튼 스타일
- **높이**: 56px (기본)
- **Border Radius**: 6px
- **Font**: 18px, bold
- **Variants**:
  - Primary: 검정 배경 → hover 시 회색
  - Success: 연두 배경 → hover 시 진한 초록
  - Complete: 초록 배경 → hover 시 진한 초록
  - Secondary: 회색 배경 → hover 시 검정
  - Disabled: `bg-[#F1F3F5]`, `text-[#929292]`

### 입력 필드 스타일
- **높이**: 56px
- **Border**: 1px solid #CED4DA, focus 시 #111111
- **Padding**: 0 16px
- **Font**: 16px, medium

## 🏗️ 프로젝트 구조

```
src/
├── api/           # API 통신 레이어
│   ├── index.js   # Axios 인스턴스 및 인터셉터
│   ├── user.js
│   ├── onboarding.js
│   ├── sessions.js
│   └── ...
├── components/    # 재사용 컴포넌트
│   ├── common/    # 공통 컴포넌트
│   │   ├── CommonButton.jsx
│   │   ├── Modal.jsx
│   │   └── ...
│   ├── layout/    # 레이아웃 컴포넌트
│   │   ├── MainHeader.jsx
│   │   ├── BottomNav.jsx
│   │   └── ...
│   └── ...
├── hooks/         # 커스텀 훅
│   ├── useAuth.js
│   ├── useModal.js
│   └── ...
├── pages/         # 페이지 컴포넌트
│   ├── Login.jsx
│   ├── Main.jsx
│   ├── Profile.jsx
│   └── ...
├── store/         # 상태 관리 (Zustand)
│   ├── userStore.js
│   ├── profileStore.js
│   ├── notificationStore.js
│   └── ...
├── utils/         # 유틸리티 함수
│   ├── validation.js
│   ├── format.js
│   └── ...
└── services/      # 비즈니스 로직
    ├── websocket.js
    └── ...
```

## 🚦 라우팅 구조

**총 86+ 라우트** | 라우트 타입: `PUBLIC` (인증 불필요), `AUTH` (로그인만 필요), `PROTECTED` (로그인 + 온보딩 완료 필요)

### PUBLIC 라우트 (5개)
```javascript
'/' - Login (exact)
'/login/oauth2/code/naver' - Navercallback (네이버 OAuth)
'/login/oauth2/code/google' - GoogleCallback (구글 OAuth)
'/agreement' - Agreement (약관 동의)
'/signup-complete' - SignupComplete (회원가입 완료)
```

### AUTH 라우트 (5개 - 온보딩)
```javascript
'/onboarding-info/:step' - OnboardingInfoRouter (1-4단계)
'/onboarding-lang/:step' - ObLangRouter (학습 언어 설정)
'/onboarding-int/:step' - ObIntRouter (관심사 선택)
'/onboarding-partner/:step' - ObPartnerRouter (파트너 선호도)
'/onboarding-schedule/:step' - ObScheduleRouter (스케줄 설정)
```

### PROTECTED 라우트 (76개)

#### 레벨 테스트 (7개, Layout 없음)
```javascript
'/level-test' - LevelTestStart
'/level-test/check' - LevelTestCheck
'/level-test/recording' - LevelTestRecording
'/level-test/connection' - LevelTestCheck
'/level-test/question/:id' - LevelTestRecording
'/level-test/complete' - LevelTestComplete
'/level-test/result' - LevelTestResult
```

#### 세션 (7개, Layout 없음)
```javascript
'/session/audio-check' - AudioConnectionCheck
'/session/video/:roomId' - VideoSessionRoom
'/session/video-check' - VideoConnectionCheck
'/session/audio/:roomId' - AudioSessionRoom
'/session/video-controls-demo' - VideoControlsDemo
'/sessions' - SessionList (Layout 포함)
'/session' - SessionList (Layout 포함)
```

#### 세션 관리 (4개, Layout 포함)
```javascript
'/sessions/create' - SessionCreate
'/sessions/calendar' - SessionCalendar
'/session/schedule/new' - SessionScheduleNew
'/sessions/:sessionId' - SessionDetails (동적)
```

#### 메인 앱 (6개, Layout 포함)
```javascript
'/main' - Main
'/chat' - ChatPage
'/schedule' - Schedule
'/profile' - ProfilePage
'/analytics' - AnalyticsPage
'/mates' - MatesPage
```

#### 매칭 (4개, Layout 포함)
```javascript
'/matching' - MatchingMain
'/matching/requests/received' - MatchingMain
'/matching/requests/sent' - MatchingMain
'/matching/profile/:userId' - MatchingProfile
```

#### Settings (9개, Layout 포함)
```javascript
'/settings' - SettingsMain
'/settings/account' - AccountSettings
'/settings/notifications' - NotificationSettings
'/settings/privacy' - PrivacySettings
'/settings/security' - SecuritySettings
'/settings/language' - LanguageSettings
'/settings/data' - DataSettings
'/settings/login-history' - LoginHistory
'/settings/delete-account' - DeleteAccount
```

#### Notifications (2개, Layout 포함)
```javascript
'/notifications' - NotificationList
'/notifications/center' - NotificationCenter
```

#### Achievements (1개, Layout 포함)
```javascript
'/achievements' - AchievementsPage
```

### 라우트 설정 구조

```javascript
// src/config/routes.js
export const ROUTE_TYPES = {
  PUBLIC: 'public',        // 인증 불필요
  AUTH: 'auth',            // 로그인만 필요 (온보딩 미완료 허용)
  PROTECTED: 'protected',  // 로그인 + 온보딩 완료 필요
};

export const routes = [
  {
    path: '/main',
    component: Main,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,  // MainHeader + BottomNav 포함
  },
  // ... 86+ 라우트
];
```

### 라우트 보호 및 리다이렉션

```javascript
// OnboardingProtectedRoute.jsx
// - 미로그인 사용자 → '/' 리다이렉션
// - 온보딩 미완료 → '/onboarding-info/1' 리다이렉션
// - 온보딩 완료 → PROTECTED 라우트 접근 가능

// 로그인 사용자 온보딩 플로우:
1. 로그인 성공 → 온보딩 상태 확인
2. 온보딩 미완료 → /onboarding-info/1
3. 모든 단계 완료 → /main
4. 이후 PROTECTED 라우트 자유 접근
```

## 🗂️ 상태 관리 (Zustand)

**총 13개 Store** | 모두 `persist` 미들웨어 사용

### ⚠️ CRITICAL: Zustand 무한 루프 방지 패턴

```javascript
// ✅ 올바른 방법: 각 값을 개별적으로 선택
const unreadCount = useNotificationStore((state) => state.unreadCount);
const loading = useNotificationStore((state) => state.loading);
const loadUnreadCount = useNotificationStore((state) => state.loadUnreadCount);

// ❌ 절대 사용 금지: 객체 selector + shallow
// const { unreadCount, loading } = useNotificationStore(
//   (state) => ({ unreadCount: state.unreadCount, loading: state.loading }),
//   shallow
// );
// → 매 렌더링마다 새 객체 생성 → 무한 루프
// 참고: docs/99-logs/failure-patterns/2025-01-13-zustand-infinite-loop.md
```

### Store 목록 및 상태 구조

#### 1. `themeStore.js` - 다크모드 테마 관리
```javascript
{
  isDarkMode: false,           // 다크모드 활성화 여부
  systemTheme: false,          // 시스템 테마 설정

  // Actions
  toggleTheme() - 테마 전환
  setTheme(isDark) - 테마 직접 설정
  useSystemTheme() - 시스템 테마 따르기
  initializeTheme() - 초기화 + 시스템 변경 감지
}

// 사용 예시
const isDarkMode = useThemeStore((state) => state.isDarkMode);
const toggleTheme = useThemeStore((state) => state.toggleTheme);

// persist: 'theme-storage'
// onRehydrate: DOM 클래스 자동 적용
```

#### 2. `notificationStore.js` - 실시간 알림 관리 (⭐ 324줄, WebSocket 통합)
```javascript
{
  notifications: [],           // 알림 목록
  unreadCount: 0,             // 읽지 않은 알림 수
  loading: false,             // 로딩 상태
  error: null,                // 에러
  filter: {                   // 필터 설정
    type: null,               // 알림 타입
    isRead: null              // 읽음 상태
  },
  pagination: {               // 페이지네이션
    page: 1,
    size: 20,
    totalPages: 1,
    hasMore: false
  },
  realtimeSettings: {         // 실시간 설정
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: false
  },

  // Actions
  loadNotifications(params) - 알림 목록 로드
  loadUnreadCount() - 읽지 않은 수 조회
  markAsRead(id) - 읽음 처리
  markAllAsRead() - 전체 읽음
  deleteNotification(id) - 알림 삭제
  addNotification(notification) - 실시간 알림 추가 (WebSocket)
  updateNotification(id, updates) - 알림 업데이트
  setFilter(filter) - 필터 설정
  getGroupedNotifications() - 그룹화된 알림 조회
}

// 사용 예시 (⚠️ 반드시 개별 selector 사용)
const unreadCount = useNotificationStore((state) => state.unreadCount);
const loading = useNotificationStore((state) => state.loading);
const loadNotifications = useNotificationStore((state) => state.loadNotifications);

// persist: 'notification-storage'
// WebSocket 연동: addNotification()으로 실시간 알림 추가
```

#### 3. `sessionStore.js` - 세션 + 캘린더 통합 (⭐ 297줄)
```javascript
{
  sessions: [],               // 세션 목록
  upcomingSessions: [],       // 예정된 세션
  currentSession: null,       // 현재 세션
  calendar: {                 // 캘린더 데이터
    events: [],               // 이벤트 목록
    slots: []                 // 사용 가능한 시간 슬롯
  },
  loading: false,
  error: null,

  // Actions
  loadCalendar(year, month) - 캘린더 로드
  loadSessions() - 세션 목록 로드
  loadUpcomingSessions() - 예정 세션 로드
  startSession(sessionId) - 세션 시작
  endSession(sessionId) - 세션 종료
  updateSession(sessionId, updates) - 세션 업데이트
  clearSessions() - 세션 초기화
}

// 사용 예시
const sessions = useSessionStore((state) => state.sessions);
const calendar = useSessionStore((state) => state.calendar);
const loadCalendar = useSessionStore((state) => state.loadCalendar);

// persist: 'session-storage'
// Calendar API 연동
```

#### 4. `matchingStore.js` - 매칭 시스템 (⭐ 457줄, 복잡한 로직)
```javascript
{
  partners: [],               // 추천 파트너 목록
  sentRequests: [],           // 보낸 매칭 요청
  receivedRequests: [],       // 받은 매칭 요청
  matches: [],                // 매칭 완료 목록
  filters: {                  // 필터
    languages: [],
    levels: [],
    interests: [],
    availability: null
  },
  isMatching: false,          // 매칭 진행 중
  loading: false,
  error: null,

  // Actions
  startMatching() - 매칭 시작
  sendMatchRequest(userId) - 매칭 요청 보내기
  acceptMatch(matchId) - 매칭 수락
  rejectMatch(matchId) - 매칭 거절
  fetchRecommendedPartners(filters) - 추천 파트너 조회
  searchPartners(query) - 파트너 검색
  updateFilters(filters) - 필터 업데이트
  analyzePartnerCompatibility(partnerId) - 호환성 분석
  clearMatching() - 매칭 상태 초기화
}

// 사용 예시
const partners = useMatchingStore((state) => state.partners);
const sentRequests = useMatchingStore((state) => state.sentRequests);
const sendMatchRequest = useMatchingStore((state) => state.sendMatchRequest);

// persist: 'matching-storage'
// 중복 요청 방지 로직 포함
```

#### 5. `achievementStore.js` - 업적 시스템
```javascript
{
  achievements: [],           // 전체 업적 목록
  myAchievements: [],         // 내 업적
  completedAchievements: [], // 완료한 업적
  inProgressAchievements: [], // 진행 중 업적
  stats: {                    // 통계
    totalAchievements: 0,
    completedCount: 0,
    inProgressCount: 0,
    points: 0
  },
  loading: false,
  error: null,

  // Actions
  loadAchievements() - 업적 목록 로드
  loadMyAchievements() - 내 업적 로드
  updateProgress(id, progress) - 진행도 업데이트
  claimReward(id) - 보상 수령
  trackEvent(event) - 이벤트 추적
}

// persist: 'achievement-storage'
```

#### 6. `toastStore.js` - 토스트 알림
```javascript
{
  toasts: [],                 // 토스트 목록 (자동 제거)
  maxToasts: 3,               // 최대 표시 개수

  // Actions
  addToast(toast) - 토스트 추가
  removeToast(id) - 토스트 제거
  clearToasts() - 전체 제거
}

// toast 구조
{
  id: string,
  type: 'success' | 'error' | 'info' | 'warning',
  message: string,
  duration: number (ms, 기본 3000)
}

// persist: 'toast-storage'
```

#### 7. `profileStore.js` - 프로필
```javascript
{
  englishName: '',
  residence: '',
  profileImage: null,
  intro: '',

  // Actions
  setEnglishName(name)
  setResidence(residence)
  setProfileImage(image)
  setIntro(intro)
  clearProfile()
}

// persist: 'profile-storage'
```

#### 8. `levelTestStore.js` - 레벨 테스트
```javascript
{
  currentQuestion: null,
  answers: [],
  testId: null,
  result: null,
  loading: false,

  // Actions
  startTest()
  submitAnswer(answer)
  finishTest()
  loadResult()
  clearTest()
}

// persist: 'level-test-storage'
```

#### 9. `langInfoStore.js` - 언어 정보
```javascript
{
  nativeLanguage: '',
  learningLanguage: '',
  proficiencyLevel: '',

  // Actions
  setNativeLanguage(lang)
  setLearningLanguage(lang)
  setProficiencyLevel(level)
  clearLanguageInfo()
}

// persist: 'lang-info-storage'
```

#### 10. `motivationStore.js` - 동기부여
```javascript
{
  goals: [],
  motivations: [],
  dailyStreak: 0,
  weeklyGoal: null,

  // Actions
  addGoal(goal)
  updateGoal(id, updates)
  incrementStreak()
  setWeeklyGoal(goal)
}

// persist: 'motivation-storage'
```

#### 11. `partnerStore.js` - 파트너 선호도
```javascript
{
  preferredGender: '',
  preferredAge: { min: 18, max: 100 },
  preferredCountries: [],
  preferredInterests: [],

  // Actions
  setPreferredGender(gender)
  setPreferredAge(ageRange)
  setPreferredCountries(countries)
  setPreferredInterests(interests)
  clearPartnerPreferences()
}

// persist: 'partner-storage'
```

#### 12. `createStore.js` - Store 생성 유틸리티
```javascript
// Zustand store 생성 헬퍼 함수
// 반복되는 persist 설정 자동화
```

#### 13. `index.js` - Store Export Aggregator
```javascript
// 모든 Store를 중앙에서 export
export { default as useThemeStore } from './themeStore';
export { default as useNotificationStore } from './notificationStore';
// ... 나머지 Store들
```

### Store 사용 Best Practices

#### 1. 개별 Selector 패턴 (필수)
```javascript
// ✅ CORRECT
const unreadCount = useNotificationStore((state) => state.unreadCount);
const loading = useNotificationStore((state) => state.loading);

// ❌ NEVER USE
const { unreadCount, loading } = useNotificationStore(
  (state) => ({ unreadCount: state.unreadCount, loading: state.loading })
);
```

#### 2. Actions는 함수 참조로
```javascript
// ✅ CORRECT
const loadNotifications = useNotificationStore((state) => state.loadNotifications);

useEffect(() => {
  loadNotifications();
}, [loadNotifications]); // 함수 참조는 안정적
```

#### 3. Persist 활용
```javascript
// 모든 Store는 localStorage에 자동 저장
// 페이지 새로고침 후에도 상태 유지
// Storage Key: '{store-name}-storage'
```

#### 4. WebSocket 연동 (notificationStore)
```javascript
// WebSocket에서 실시간 알림 수신 시
const addNotification = useNotificationStore((state) => state.addNotification);

socket.on('notification', (notification) => {
  addNotification(notification);
});
```

### Store 간 통신

#### 방법 1: 직접 호출
```javascript
import { useSessionStore } from '../store';
import { useNotificationStore } from '../store';

const handleSessionComplete = () => {
  // Session Store 업데이트
  useSessionStore.getState().endSession(sessionId);

  // Notification Store에 알림 추가
  useNotificationStore.getState().addNotification({
    type: 'success',
    message: '세션이 완료되었습니다'
  });
};
```

#### 방법 2: Custom Hook
```javascript
const useSessionCompletion = () => {
  const endSession = useSessionStore((state) => state.endSession);
  const addNotification = useNotificationStore((state) => state.addNotification);

  return (sessionId) => {
    endSession(sessionId);
    addNotification({
      type: 'success',
      message: '세션이 완료되었습니다'
    });
  };
};
```

## 🔌 API 연동

**총 19개 API 모듈** | Workers 백엔드 `https://api.languagemate.kr`와 통신

### Axios 인스턴스 설정
```javascript
// src/api/index.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.languagemate.kr';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터 (JWT 토큰 자동 추가 + 검증)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    // JWT 만료 체크
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        // 토큰 만료 - 새로고침 필요
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('JWT decode error:', error);
    }
  }
  return config;
});

// Response 인터셉터 (토큰 자동 갱신 + WebSocket 재연결)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refreshToken
          });
          localStorage.setItem('accessToken', data.accessToken);

          // WebSocket 재연결 이벤트 발행
          window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
            detail: { token: data.accessToken }
          }));

          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API 모듈 목록 및 주요 함수

#### 1. `auth.js` - 인증
```javascript
// 로그인 & 회원가입
naverLogin() - 네이버 OAuth 로그인
googleLogin() - 구글 OAuth 로그인
logout() - 로그아웃
refreshToken(refreshToken) - 토큰 갱신
```

#### 2. `user.js` - 사용자 관리
```javascript
getProfile() - 사용자 프로필 조회
updateProfile(profileData) - 프로필 업데이트
uploadProfileImage(file) - 프로필 이미지 업로드
getMyInfo() - 내 정보 조회
```

#### 3. `onboarding.js` - 온보딩
```javascript
saveOnboardingStep(step, data) - 온보딩 단계 저장
getOnboardingStatus() - 온보딩 진행 상태 조회
completeOnboarding() - 온보딩 완료 처리
```

#### 4. `analytics.js` - 분석 (⭐ 12개 함수)
```javascript
getDashboardData() - 대시보드 전체 데이터
getStudyStats(params) - 학습 통계
getSessionActivity(params) - 세션 활동 내역
getLevelTestHistory() - 레벨 테스트 기록
getMatchingStats() - 매칭 통계
getAIUsageStats() - AI 사용 통계
getPerformanceStats() - 성능 통계
sendAnalyticsEvents(events) - 분석 이벤트 전송
connectToMetricsStream() - 실시간 메트릭 스트림 (WebSocket)
getLearningPattern() - 학습 패턴 분석
getProgressSummary() - 진도 요약
getLearningRecommendations() - 학습 추천
```

#### 5. `settings.js` - 설정 (⭐ 15개 함수)
```javascript
// 계정 설정
getAccountSettings() - 계정 설정 조회
updateAccountSettings(data) - 계정 설정 업데이트

// 알림 설정
getNotificationSettings() - 알림 설정 조회
updateNotificationSettings(data) - 알림 설정 업데이트

// 프라이버시 설정
getPrivacySettings() - 프라이버시 설정 조회
updatePrivacySettings(data) - 프라이버시 설정 업데이트

// 언어 설정
getLanguageSettings() - 언어 설정 조회
updateLanguageSettings(data) - 언어 설정 업데이트

// 보안
changePassword(oldPassword, newPassword) - 비밀번호 변경
getTwoFactorSettings() - 2FA 설정 조회
enableTwoFactor() - 2FA 활성화
disableTwoFactor() - 2FA 비활성화

// 데이터
exportUserData() - 사용자 데이터 내보내기
getLoginHistory() - 로그인 기록
deleteAccount() - 계정 삭제
```

#### 6. `achievement.js` - 업적 (⭐ 12개 함수)
```javascript
// 조회
getAllAchievements() - 전체 업적 목록
getAchievementsByCategory(category) - 카테고리별 업적
getMyAchievements() - 내 업적
getMyCompletedAchievements() - 완료한 업적
getMyInProgressAchievements() - 진행 중 업적
getMyAchievementStats() - 업적 통계

// 진행 관리
updateAchievementProgress(id, progress) - 진행도 업데이트
incrementAchievementProgress(id, amount) - 진행도 증가
claimAchievementReward(id) - 보상 수령

// 시스템
initializeAchievements() - 업적 초기화
checkAchievementCompletion(id) - 완료 여부 확인
trackAchievementEvent(event) - 이벤트 추적

// Achievement Categories: STUDY, SOCIAL, MILESTONE, SPECIAL, STREAK
```

#### 7. `groupSession.js` - 그룹 세션 (⭐ 14개 함수)
```javascript
// 생성 & 참가
createGroupSession(sessionData) - 그룹 세션 생성
joinGroupSession(sessionId) - 세션 참가
joinGroupSessionByCode(code) - 코드로 참가
leaveGroupSession(sessionId) - 세션 나가기

// 관리
startGroupSession(sessionId) - 세션 시작
endGroupSession(sessionId) - 세션 종료
cancelGroupSession(sessionId) - 세션 취소
updateGroupSession(sessionId, data) - 세션 정보 업데이트
kickParticipant(sessionId, userId) - 참가자 강퇴

// 조회
getGroupSessionDetails(sessionId) - 세션 상세 조회
getPublicGroupSessions(filters) - 공개 세션 목록
getMyGroupSessions() - 내 세션 목록
getUpcomingGroupSessions() - 예정된 세션
getOngoingGroupSessions() - 진행 중 세션

// 피드백
submitSessionFeedback(sessionId, feedback) - 피드백 제출

// Session Types: VIDEO, AUDIO, TEXT
// Session Status: SCHEDULED, ONGOING, COMPLETED, CANCELLED
```

#### 8. `notifications.js` - 알림
```javascript
getNotifications(params) - 알림 목록 조회 (페이지네이션)
getUnreadNotificationCount() - 읽지 않은 알림 수
markNotificationAsRead(notificationId) - 읽음 처리
markAllNotificationsAsRead() - 전체 읽음 처리
deleteNotification(notificationId) - 알림 삭제
```

#### 9. `matching.js` - 매칭
```javascript
getRecommendedPartners(filters) - 추천 파트너 조회
sendMatchRequest(userId) - 매칭 요청
acceptMatch(matchId) - 매칭 수락
rejectMatch(matchId) - 매칭 거절
getMyMatches() - 내 매칭 목록
getMatchRequests() - 받은 매칭 요청
```

#### 10. `session.js` - 1:1 세션
```javascript
createSession(sessionData) - 세션 생성
joinSession(sessionId) - 세션 참가
getSessionDetails(sessionId) - 세션 상세
getUpcomingSessions() - 예정된 세션
getSessionHistory() - 세션 기록
```

#### 11. `levelTest.js` - 레벨 테스트
```javascript
startLevelTest() - 레벨 테스트 시작
submitLevelTest(answers) - 답안 제출
getLevelTestResult() - 결과 조회
getLevelTestHistory() - 기록 조회
```

#### 12. `chat.js` - 채팅
```javascript
getChatRooms() - 채팅방 목록
getChatMessages(roomId) - 메시지 조회
sendMessage(roomId, message) - 메시지 전송
createChatRoom(userData) - 채팅방 생성
```

#### 13. `profile.js` - 프로필 확장
```javascript
getPublicProfile(userId) - 공개 프로필 조회
updateLanguageProfile(data) - 언어 프로필 업데이트
updateInterests(interests) - 관심사 업데이트
```

#### 14. `pronunciation.js` - 발음 평가
```javascript
evaluatePronunciation(audioBlob) - 발음 평가 (Whisper AI)
getPronunciationHistory() - 평가 기록
```

#### 15. `webrtc.js` - WebRTC 시그널링
```javascript
createOffer(sessionId) - Offer 생성
createAnswer(sessionId, offer) - Answer 생성
addIceCandidate(sessionId, candidate) - ICE 후보 추가
```

#### 16. `groupSessionAI.js` - AI 그룹 세션
```javascript
generateSessionSummary(sessionId) - AI 세션 요약 (Llama)
getAIRecommendations(sessionId) - AI 추천사항
```

#### 17. `config.js` - 설정 조회
```javascript
getAppConfig() - 앱 설정 조회
```

#### 18. `onboard.js` (deprecated, onboarding.js 사용)
```javascript
// onboarding.js와 중복, 마이그레이션 필요
```

#### 19. `index.js` - Axios 인스턴스
```javascript
// 메인 API 인스턴스 (위 참조)
```

### API 사용 예제

#### Analytics Dashboard
```javascript
import { getDashboardData, getStudyStats } from '../api/analytics';

// 대시보드 데이터 로드
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      }
    };
    loadDashboard();
  }, []);

  // ...
};
```

#### Settings Management
```javascript
import { getNotificationSettings, updateNotificationSettings } from '../api/settings';

const NotificationSettings = () => {
  const [settings, setSettings] = useState(null);

  const loadSettings = async () => {
    const data = await getNotificationSettings();
    setSettings(data);
  };

  const saveSettings = async (newSettings) => {
    await updateNotificationSettings(newSettings);
    loadSettings(); // 재로드
  };
};
```

#### Achievement Tracking
```javascript
import { trackAchievementEvent, incrementAchievementProgress } from '../api/achievement';

// 세션 완료 시 업적 진행도 업데이트
const handleSessionComplete = async () => {
  await trackAchievementEvent({
    type: 'SESSION_COMPLETED',
    sessionId: session.id
  });

  await incrementAchievementProgress('first-10-sessions', 1);
};
```

## 🎭 공통 컴포넌트

### CommonButton
```jsx
// src/components/common/CommonButton.jsx
const CommonButton = ({ variant, children, onClick, loading, ...props }) => {
  const baseClasses = "h-14 rounded-md px-6 text-lg font-bold transition-colors duration-200";

  const variantClasses = {
    primary: "bg-[#111111] text-white hover:bg-[#414141]",
    success: "bg-[#E6F9F1] text-[#111111] hover:bg-[#B0EDD3]",
    complete: "bg-[#00C471] text-white hover:bg-[#00B267]",
    secondary: "bg-[#E7E7E7] text-[#111111] hover:bg-[#111111] hover:text-white",
    disabled: "bg-[#F1F3F5] text-[#929292] cursor-not-allowed"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={variant === 'disabled' || loading}
      {...props}
    >
      {loading && <span className="mr-2">⏳</span>}
      {children}
    </button>
  );
};

export default CommonButton;
```

## 🧩 UI 컴포넌트 라이브러리

**위치**: `src/components/ui/`

프로젝트 전반에서 사용되는 재사용 가능한 UI 컴포넌트 라이브러리입니다. 접근성, 성능 최적화, UX 개선에 중점을 둔 15개의 컴포넌트를 제공합니다.

> **참고**: 각 컴포넌트의 상세 사용법은 [📄 페이지별 문서화](#-페이지별-문서화) 섹션에서 실제 사용 사례와 함께 설명합니다.

### 📱 Accessibility (접근성)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| **AccessibleButton** | `AccessibleButton.jsx` (132줄) | WCAG 2.1 AA 준수 버튼. 키보드 네비게이션, 스크린 리더, 44px 터치 영역 지원 |
| **AccessibleInput** | `AccessibleInput.jsx` (264줄) | 접근성 향상 입력 필드. 자동 ID 생성, aria-describedby 연결, 에러/도움말 표시 |
| **KeyboardNavigableList** | `KeyboardNavigableList.jsx` (233줄) | 화살표 키로 탐색 가능한 리스트. SimpleTextList, CardList 변형 포함 |

### 🔔 Modals (모달)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| **AlertModal** | `AlertModal.jsx` (98줄) | 단순 알림 모달 (확인 버튼만). info/success/error/warning 타입 지원 |
| **ConfirmModal** | `ConfirmModal.jsx` (113줄) | 확인/취소 모달. confirm/danger/warning 타입, 커스텀 버튼 텍스트 |
| **CustomConfirm** | `CustomConfirm.jsx` (82줄) | 경량 확인 팝업. 이모지 아이콘 (❓⚠️✅) 사용 |

### ⚠️ Error & Feedback (에러 및 피드백)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| **ErrorMessage** | `ErrorMessage.jsx` (250줄) | 4가지 변형: ErrorMessage, ErrorToast, NetworkError, EmptyState. 재시도 버튼 포함 |
| **Toast** | `Toast.jsx` (83줄) | 자동 해제 알림 토스트. 6가지 위치, 3초 기본 지속 시간, role="alert" |

### ⚡ Performance (성능 최적화)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| **LazyBoundary** | `LazyBoundary.jsx` (225줄) | 8가지 전문화 경계: Page, Component, Modal, Chart, Media, Form, List. Suspense + ErrorBoundary |
| **LazyImage** | `LazyImage.jsx` (278줄) | 5가지 변형: LazyImage, LazyAvatar, LazyCardImage, LazyGalleryImage, LazyBackgroundImage. Intersection Observer 기반 |
| **LazyList** | `LazyList.jsx` (260줄) | 3가지 변형: LazyList (점진 로딩), InfiniteScrollList (무한 스크롤), VirtualizedList (가상화) |
| **OptimizedImage** | `OptimizedImage.jsx` (120줄) | WebP/AVIF 자동 변환. srcset 생성 (400w/800w/1200w), 반응형 이미지 |

### 🔄 Loading (로딩 상태)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| **LoadingSpinner** | `LoadingSpinner.jsx` (186줄) | 4가지 변형: LoadingSpinner, InlineSpinner, SkeletonLoader, CardSkeleton. 3가지 크기 |

### 🎯 UX Enhancement (UX 개선)

| 컴포넌트 | 파일 | 설명 |
|---------|------|------|
| **PullToRefresh** | `PullToRefresh.jsx` (158줄) | 3가지 변형: PullToRefresh, SimplePullToRefresh, ListPullToRefresh. 임계값 80px |
| **SwipeNavigation** | `SwipeNavigation.jsx` (273줄) | 3가지 변형: SwipeNavigation, ImageCarousel, SwipeableTabs. 키보드 단축키 지원 |

### 공통 특징

- **접근성**: 모든 컴포넌트 WCAG 2.1 AA 준수, aria-* 속성 완비
- **성능**: Intersection Observer, 가상화, 코드 스플리팅 적극 활용
- **반응형**: 모바일 우선 설계, 터치 최적화 (최소 44px)
- **Custom Hooks**: `src/hooks/` 디렉토리의 전문화된 hook 사용
- **유틸리티**: `src/utils/accessibility` 헬퍼 함수 활용

## 📄 페이지별 문서화

**위치**: `src/pages/`

총 **82개 페이지 컴포넌트**를 기능별로 분류하여 문서화합니다. 각 페이지는 **라우트**, **Store**, **API**, **주요 컴포넌트**를 함께 명시합니다.

> **참고**: UI 컴포넌트의 상세 사용법은 실제 페이지 구현에서 확인할 수 있으며, 대부분 [🧩 UI 컴포넌트 라이브러리](#-ui-컴포넌트-라이브러리)의 컴포넌트들을 조합하여 구성됩니다.

### 📊 페이지 카테고리 개요

| 카테고리 | 페이지 수 | 라우트 타입 | 레이아웃 |
|---------|---------|-----------|---------|
| 로그인/인증 | 6개 | PUBLIC | ❌ |
| 온보딩 | 27개 | AUTH | ❌ |
| 메인 | 1개 | PROTECTED | ✅ |
| 레벨 테스트 | 8개 | PROTECTED | ❌ |
| 세션 | 14개 | PROTECTED | 일부 ✅ |
| 그룹 세션 | 3개 | PROTECTED | ✅ |
| 매칭 | 2개 | PROTECTED | ✅ |
| 채팅 | 1개 | PROTECTED | ✅ |
| 프로필 | 2개 | PROTECTED | ✅ |
| 스케줄 | 1개 | PROTECTED | ✅ |
| 설정 | 9개 | PROTECTED | ✅ |
| 알림 | 3개 | PROTECTED | ✅ |
| 업적 | 2개 | PROTECTED | ✅ |
| 분석 | 2개 | PROTECTED | ✅ |
| 메이트 | 1개 | PROTECTED | ✅ |

---

### 1️⃣ 로그인/인증 (6개)

| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **Login** | `/` | 네이버/구글 OAuth 로그인, 자동 로그인 | - | `auth.js` |
| **Navercallback** | `/login/oauth2/code/naver` | 네이버 OAuth 콜백 처리 | - | `auth.js` |
| **GoogleCallback** | `/login/oauth2/code/google` | 구글 OAuth 콜백 처리 | - | `auth.js` |
| **Agreement** | `/agreement` | 약관 동의 (서비스, 개인정보, 마케팅) | - | - |
| **SignupComplete** | `/signup-complete` | 회원가입 완료 안내 | - | - |
| **ObInfoGoogle** | (OAuth 중) | 구글 OAuth 온보딩 정보 | `profileStore` | `onboarding.js` |

**공통 컴포넌트**: Header, CommonButton
**공통 패턴**: OAuth 리다이렉션, 토큰 저장, 온보딩 상태 확인

---

### 2️⃣ 온보딩 (27개)

#### ObInfo - 기본 정보 (7개)
| 페이지 | 단계 | 입력 내용 | Store | API |
|-------|------|---------|-------|-----|
| **ObInfo1** | 1/4 | 영어 이름 (a-zA-Z만 허용) | `profileStore` | `onboarding.js` |
| **ObInfo2** | 2/4 | 거주 국가 선택 | `profileStore` | `onboarding.js` |
| **ObInfo3** | 3/4 | 프로필 이미지 업로드 | `profileStore` | `user.js` |
| **ObInfo4** | 4/4 | 자기소개 입력 (200자 제한) | `profileStore` | `onboarding.js` |
| **ObInfoComplete** | 완료 | 완료 안내 → ObLang 이동 | - | - |
| **ObInfoRouter** | `/onboarding-info/:step` | 단계별 라우팅 | - | - |
| **OnboardingPageGuard** | (Guard) | 인증 및 단계 순서 검증 | - | - |

#### ObLang - 언어 설정 (5개)
| 페이지 | 단계 | 입력 내용 | Store | API |
|-------|------|---------|-------|-----|
| **ObLang1** | 1/3 | 모국어 선택 | `langInfoStore` | `onboarding.js` |
| **ObLang2** | 2/3 | 학습 언어 선택 | `langInfoStore` | `onboarding.js` |
| **ObLang3** | 3/3 | 언어 숙련도 선택 (Beginner~Advanced) | `langInfoStore` | `onboarding.js` |
| **ObLangComplete** | 완료 | 완료 안내 → ObInt 이동 | - | - |
| **ObLangRouter** | `/onboarding-lang/:step` | 단계별 라우팅 | - | - |

#### ObInt - 관심사 (6개)
| 페이지 | 단계 | 입력 내용 | Store | API |
|-------|------|---------|-------|-----|
| **ObInt1** | 1/4 | 학습 목표 선택 (다중) | `motivationStore` | `onboarding.js` |
| **ObInt2** | 2/4 | 관심 주제 선택 (최소 3개) | `motivationStore` | `onboarding.js` |
| **ObInt3** | 3/4 | 선호 활동 선택 | `motivationStore` | `onboarding.js` |
| **ObInt4** | 4/4 | 학습 동기 선택 | `motivationStore` | `onboarding.js` |
| **ObIntComplete** | 완료 | 완료 안내 → ObPartner 이동 | - | - |
| **ObIntRouter** | `/onboarding-int/:step` | 단계별 라우팅 | - | - |

#### ObPartner - 파트너 선호도 (4개)
| 페이지 | 단계 | 입력 내용 | Store | API |
|-------|------|---------|-------|-----|
| **ObPartner1** | 1/2 | 선호 성별, 나이대 | `partnerStore` | `onboarding.js` |
| **ObPartner2** | 2/2 | 선호 국가, 관심사 | `partnerStore` | `onboarding.js` |
| **ObPartnerComplete** | 완료 | 완료 안내 → ObSchedule 이동 | - | - |
| **ObPartnerRouter** | `/onboarding-partner/:step` | 단계별 라우팅 | - | - |

#### ObSchadule - 스케줄 설정 (6개)
| 페이지 | 단계 | 입력 내용 | Store | API |
|-------|------|---------|-------|-----|
| **ObSchadule1** | 1/4 | 선호 요일 선택 | - | `onboarding.js` |
| **ObSchadule2** | 2/4 | 선호 시간대 선택 | - | `onboarding.js` |
| **ObSchadule3** | 3/4 | 세션 빈도 선택 (주 1-7회) | - | `onboarding.js` |
| **ObSchadule4** | 4/4 | 세션 길이 선택 (30분~2시간) | - | `onboarding.js` |
| **ObSchaduleComplete** | 완료 | 완료 안내 → 레벨 테스트 또는 메인 | - | `onboarding.js` |
| **ObSchaduleRouter** | `/onboarding-schedule/:step` | 단계별 라우팅 | - | - |

**공통 컴포넌트**: Header, ProgressBar, CommonButton
**공통 패턴**: 단계별 진행, Store persist, API 저장, 유효성 검증

---

### 3️⃣ 메인 (1개)

| 페이지 | 라우트 | 주요 기능 | Store | API | 컴포넌트 |
|-------|--------|---------|-------|-----|----------|
| **Main** | `/main` | 대시보드, 빠른 액션, 추천 파트너, 예정 세션 | `userStore`, `sessionStore`, `matchingStore` | `user.js`, `session.js`, `matching.js` | MainHeader, BottomNav, NotificationBadge |

**주요 기능**:
- 사용자 환영 메시지
- 빠른 액션 버튼 (채팅, 레벨 테스트, 세션 생성)
- 추천 파트너 카드
- 예정된 세션 목록
- 학습 진행도 요약

---

### 4️⃣ 레벨 테스트 (8개)

| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **LevelTestStart** | `/level-test` | 테스트 시작 안내, 주의사항 | `levelTestStore` | `levelTest.js` |
| **LevelTestIntro** | (Intro) | 테스트 소개 페이지 | `levelTestStore` | - |
| **LevelTestCheck** | `/level-test/check` | 마이크 권한 확인 | `levelTestStore` | - |
| **ConnectionCheck** | `/level-test/connection` | 연결 상태 확인 | `levelTestStore` | - |
| **LevelTestRecording** | `/level-test/recording`, `/level-test/question/:id` | 음성 녹음 (Whisper AI) | `levelTestStore` | `pronunciation.js` |
| **AudioQuestion** | (Component) | 음성 질문 재생 | `levelTestStore` | - |
| **LevelTestComplete** | `/level-test/complete` | 테스트 완료 안내 | `levelTestStore` | `levelTest.js` |
| **LevelTestResult** | `/level-test/result` | 결과 분석 (CEFR 레벨, 점수, 피드백) | `levelTestStore` | `levelTest.js` |

**사용하는 AI**: Whisper (발음 평가)
**공통 컴포넌트**: CommonButton, LoadingSpinner
**공통 패턴**: 마이크 권한, 녹음 상태, 진행도 표시

---

### 5️⃣ 세션 (14개)

#### 연결 확인 & 설정 (3개)
| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **AudioConnectionCheck** | `/session/audio-check` | 마이크 테스트 | - | - |
| **VideoSessionCheck** | `/session/video-check` | 카메라/마이크 테스트 | - | - |
| **VideoControlsDemo** | `/session/video-controls-demo` | 컨트롤 UI 데모 | - | - |

#### 세션 실행 (4개)
| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **VideoSessionRoom** | `/session/video/:roomId` | 비디오 세션 (WebRTC) | `sessionStore` | `webrtc.js` |
| **AudioSessionRoom** | `/session/audio/:roomId` | 오디오 세션 (WebRTC) | `sessionStore` | `webrtc.js` |
| **VideoSession** | (Component) | 비디오 세션 로직 | `sessionStore` | `webrtc.js` |
| **AudioSession** | (Component) | 오디오 세션 로직 | `sessionStore` | `webrtc.js` |

#### 세션 관리 (5개)
| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **SessionList** | `/sessions`, `/session` | 세션 목록 (예정/완료/활성) | `sessionStore` | `session.js`, `webrtc.js` |
| **SessionCreate** | `/sessions/create` | 세션 생성 (파트너, 시간, 타입 선택) | `sessionStore` | `session.js` |
| **SessionCalendar** | `/sessions/calendar` | 캘린더 뷰 (월간 세션) | `sessionStore` | `session.js` |
| **SessionScheduleNew** | `/session/schedule/new` | 새 일정 예약 | `sessionStore` | `session.js` |
| **SessionDetails** | `/sessions/:sessionId` | 세션 상세 정보 | `sessionStore` | `session.js` |

#### 그룹 세션 (2개 - Session 디렉토리)
| 페이지 | 주요 기능 | Store | API |
|-------|---------|-------|-----|
| **GroupVideoSession** | 그룹 비디오 세션 | `sessionStore` | `groupSession.js` |
| **GroupAudioSession** | 그룹 오디오 세션 | `sessionStore` | `groupSession.js` |

**WebRTC 연결**: SockJS + STOMP, Durable Objects
**공통 컴포넌트**: CommonButton, LoadingSpinner, ErrorMessage
**공통 패턴**: 권한 확인, 연결 상태, 에러 처리

---

### 6️⃣ 그룹 세션 (3개)

| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **GroupSessionPage** | `/group-sessions` | 그룹 세션 목록 (공개/내 세션) | `sessionStore` | `groupSession.js` |
| **GroupSessionDetailPage** | `/group-sessions/:sessionId` | 그룹 세션 상세 (참가자, 설정) | `sessionStore` | `groupSession.js` |
| **GroupSessionRoomPage** | `/group-sessions/:sessionId/room` | 그룹 세션 룸 (다중 사용자 WebRTC) | `sessionStore` | `groupSession.js`, `webrtc.js` |

**주요 기능**: 다중 참가자, 코드 참가, 참가자 관리, AI 요약
**사용하는 AI**: Llama (세션 요약)

---

### 7️⃣ 매칭 (2개)

| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **MatchingMain** | `/matching`, `/matching/requests/received`, `/matching/requests/sent` | 추천 파트너, 요청 관리 (탭) | `matchingStore` | `matching.js` |
| **MatchingProfile** | `/matching/profile/:userId` | 파트너 프로필 상세, 매칭 요청 | `matchingStore` | `matching.js`, `profile.js` |

**필터 기능**: 언어, 레벨, 관심사, 가용 시간
**공통 컴포넌트**: CommonButton, LoadingSpinner, LazyImage (프로필 사진)

---

### 8️⃣ 채팅 (1개)

| 페이지 | 라우트 | 주요 기능 | Store | API | 컴포넌트 |
|-------|--------|---------|-------|-----|----------|
| **ChatPage** | `/chat`, `/chat/:roomId` | 채팅방 목록, 메시지 전송/수신 | - | `chat.js` | Toast (알림) |

**실시간 통신**: WebSocket (STOMP)
**주요 기능**: 메시지 전송, 읽음 표시, 타이핑 인디케이터

---

### 9️⃣ 프로필 (2개)

| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **ProfilePage** | `/profile` | 내 프로필 조회/수정 | `profileStore` | `user.js`, `profile.js` |
| **ProfileTestPage** | (Test) | 프로필 테스트 페이지 | `profileStore` | - |

**편집 항목**: 영어 이름, 프로필 사진, 자기소개, 언어 정보, 관심사

---

### 🔟 스케줄 (1개)

| 페이지 | 라우트 | 주요 기능 | Store | API | 컴포넌트 |
|-------|--------|---------|-------|-----|----------|
| **Schedule** | `/schedule` | 주간/월간 캘린더, 세션 일정 | `sessionStore` | `session.js` | SessionCalendar (내부) |

**주요 기능**: 캘린더 뷰, 일정 추가/수정/삭제, 가용 시간 표시

---

### 1️⃣1️⃣ 설정 (9개)

| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **SettingsMain** | `/settings` | 설정 메뉴 (9개 항목 + 계정 삭제) | - | - |
| **AccountSettings** | `/settings/account` | 이름, 이메일, 프로필 수정 | `profileStore` | `settings.js` |
| **NotificationSettings** | `/settings/notifications` | 푸시, 이메일, 소리 설정 | `notificationStore` | `settings.js` |
| **PrivacySettings** | `/settings/privacy` | 프로필 공개 범위, 데이터 관리 | - | `settings.js` |
| **SecuritySettings** | `/settings/security` | 비밀번호 변경, 2FA | - | `settings.js` |
| **LanguageSettings** | `/settings/language` | 앱 언어, 학습 언어 설정 | `langInfoStore` | `settings.js` |
| **DataSettings** | `/settings/data` | 데이터 내보내기 | - | `settings.js` |
| **LoginHistory** | `/settings/login-history` | 최근 로그인 기록 | - | `settings.js` |
| **DeleteAccount** | `/settings/delete-account` | 계정 삭제 (확인 모달) | - | `settings.js` |

**공통 컴포넌트**: ConfirmModal, AlertModal, CommonButton
**주의사항**: 계정 삭제는 되돌릴 수 없음 (ConfirmModal 사용)

---

### 1️⃣2️⃣ 알림 (3개)

| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **NotificationPage** | (단일 알림) | 개별 알림 상세 | `notificationStore` | `notifications.js` |
| **NotificationList** | `/notifications` | 알림 목록 (페이지네이션) | `notificationStore` | `notifications.js` |
| **NotificationCenter** | `/notifications/center` | 알림 센터 (그룹화, 필터) | `notificationStore` | `notifications.js` |

**실시간 알림**: WebSocket 연동 (`notificationStore.addNotification`)
**필터**: 타입별, 읽음/안 읽음

---

### 1️⃣3️⃣ 업적 (2개)

| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **AchievementPage** | (단일) | 개별 업적 상세, 진행도 | `achievementStore` | `achievement.js` |
| **AchievementsPage** | `/achievements` | 업적 목록 (카테고리별, 진행률) | `achievementStore` | `achievement.js` |

**카테고리**: STUDY, SOCIAL, MILESTONE, SPECIAL, STREAK
**보상**: 포인트, 배지, 칭호

---

### 1️⃣4️⃣ 분석 (2개)

| 페이지 | 라우트 | 주요 기능 | Store | API | 컴포넌트 |
|-------|--------|---------|-------|-----|----------|
| **AnalyticsDashboard** | (대시보드) | 전체 통계 요약 | - | `analytics.js` | 차트 컴포넌트 (LazyBoundary) |
| **AnalyticsPage** | `/analytics` | 상세 분석 (학습 시간, 세션 활동, 진도) | - | `analytics.js` | 차트 컴포넌트 |

**차트 타입**: 선 그래프, 막대 그래프, 파이 차트
**분석 항목**: 학습 시간, 세션 수, 레벨 진행, AI 사용량

---

### 1️⃣5️⃣ 메이트 (1개)

| 페이지 | 라우트 | 주요 기능 | Store | API |
|-------|--------|---------|-------|-----|
| **MatesPage** | `/mates` | 매칭된 파트너 목록, 세션 기록 | `matchingStore` | `matching.js` |

**주요 기능**: 파트너 목록, 최근 세션, 파트너별 통계

---

### 📋 페이지 공통 패턴

#### 1. State Management
```javascript
// ✅ 올바른 Zustand selector 사용
const unreadCount = useNotificationStore((state) => state.unreadCount);
const sessions = useSessionStore((state) => state.sessions);
const loadSessions = useSessionStore((state) => state.loadSessions);
```

#### 2. API 호출 패턴
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const { showError } = useAlert();

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await someAPI();
    // 상태 업데이트
  } catch (err) {
    const message = getUserFriendlyMessage(err);
    showError(message);
    setError(message);
  } finally {
    setLoading(false);
  }
};
```

#### 3. Navigation 패턴
```javascript
const navigate = useNavigate();

// 뒤로 가기
navigate(-1);

// 라우트 이동
navigate('/main', { replace: true });

// 동적 라우트
navigate(`/matching/profile/${userId}`);
```

#### 4. 로딩/에러 UI
```javascript
{loading && <LoadingSpinner size="medium" />}
{error && <ErrorMessage type="error" message={error} />}
{!loading && !error && (
  // 실제 콘텐츠
)}
```

---

## 🎣 Custom Hooks

STUDYMATE는 20개의 custom hooks를 제공하여 재사용 가능한 로직을 캡슐화합니다.

### Hooks 카테고리 개요

| 카테고리 | Hooks 수 | 주요 용도 |
|---------|---------|----------|
| UI/Feedback | 5 | 알림, 토스트, 확인 대화상자, 이미지 프리로드 |
| Upload | 3 | 파일/이미지/오디오 업로드 (진행률 추적) |
| Performance | 10 | Lazy loading, 프리로딩, Intersection Observer |
| Accessibility | 3 | 키보드 네비게이션, 포커스 관리, 포커스 트랩 |
| Mobile | 2 | Pull-to-refresh, 스와이프 제스처 |
| AI/ML | 5 | LLM, Whisper 음성인식, 실시간 전사, 번역 |
| WebRTC | 1 | 비디오/오디오 세션 (Polite Peer 패턴) |
| Session | 1 | 세션 시간 제어 및 자동 종료 |
| Store | 1 | Zustand store selector 최적화 |

### 1. UI/Feedback Hooks

#### useAlert (Context API 기반)
```javascript
// src/hooks/useAlert.jsx
import { useAlert } from '../hooks/useAlert';

function MyComponent() {
  const {
    showAlert,      // 일반 알림
    showSuccess,    // 성공 메시지
    showError,      // 에러 메시지
    showWarning,    // 경고 메시지
    showInfo,       // 정보 메시지
    showConfirm,    // 확인/취소 대화상자
    confirmDelete,  // 삭제 확인
    confirmAction   // 일반 작업 확인
  } = useAlert();

  const handleDelete = async () => {
    const confirmed = await confirmDelete('사용자');
    if (confirmed) {
      // 삭제 로직
    }
  };

  const handleSave = async () => {
    const confirmed = await showConfirm({
      title: '저장 확인',
      message: '변경사항을 저장하시겠습니까?',
      confirmText: '저장',
      cancelText: '취소',
      type: 'warning'
    });
    if (confirmed) {
      // 저장 로직
    }
  };

  return (
    <button onClick={() => showSuccess('저장되었습니다!')}>
      저장
    </button>
  );
}

// App.jsx에서 Provider 설정 필요
import { AlertProvider } from './hooks/useAlert';

function App() {
  return (
    <AlertProvider>
      {/* 앱 컴포넌트 */}
    </AlertProvider>
  );
}
```

**Parameters:**
- `showAlert(message)` 또는 `showAlert({ title, message, type, confirmText })`
- `showConfirm({ title, message, confirmText, cancelText, type })` → Promise\<boolean\>
- `confirmDelete(itemName, customMessage?)` → Promise\<boolean\>
- `confirmAction(actionName, message?)` → Promise\<boolean\>

**Types:** `'info' | 'success' | 'error' | 'warning'`

#### useCustomConfirm
```javascript
// src/hooks/useCustomConfirm.js
import useCustomConfirm from '../hooks/useCustomConfirm';

const { confirm } = useCustomConfirm();

const isConfirmed = await confirm({
  title: '정말 삭제하시겠습니까?',
  message: '이 작업은 되돌릴 수 없습니다.'
});

if (isConfirmed) {
  // 삭제 로직
}
```

**Returns:** Promise\<boolean\> - 확인 시 true, 취소 시 false

#### useToast (Simple)
```javascript
// src/hooks/useToast.js
import useToast from '../hooks/useToast';

const toast = useToast();

toast.showToast('메시지', 'success', 3000);
toast.success('성공!');
toast.error('오류 발생');
toast.warning('경고');
toast.info('정보');
```

**Methods:**
- `showToast(message, type, duration)` - 기본 토스트
- `success(message)` - 성공 토스트 (3초)
- `error(message)` - 에러 토스트 (3초)
- `warning(message)` - 경고 토스트 (3초)
- `info(message)` - 정보 토스트 (3초)

#### useToast (Component-based)
```javascript
// src/hooks/useToast.jsx (별도 구현)
import useToast from '../hooks/useToast';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo, ToastContainer } = useToast();

  return (
    <>
      <button onClick={() => showSuccess('저장 완료!')}>저장</button>
      <ToastContainer />
    </>
  );
}
```

#### useImagePreload
```javascript
// src/hooks/useImagePreload.js
import { useImagePreload, PRELOAD_IMAGES } from '../hooks/useImagePreload';

function MyComponent() {
  const { isLoading, error } = useImagePreload([
    '/assets/logo.png',
    '/assets/hero.jpg',
    ...PRELOAD_IMAGES  // 공통 이미지 목록
  ]);

  if (isLoading) return <LoadingSpinner />;
  return <div>이미지 로드 완료!</div>;
}
```

**PRELOAD_IMAGES:** `/assets/image286.png`, `/assets/image287.png` 등 공통 이미지

---

### 2. Upload Hooks

#### useFileUpload
```javascript
// src/hooks/useFileUpload.js
import { useFileUpload } from '../hooks/useFileUpload';

const {
  uploadProgress,    // 0-100 진행률
  isUploading,       // 업로드 중 여부
  error,            // 에러 메시지
  upload,           // 단일 파일 업로드
  uploadMultiple,   // 다중 파일 업로드
  resetState        // 상태 초기화
} = useFileUpload({
  onSuccess: (result) => console.log('업로드 성공', result),
  onError: (error) => console.error('업로드 실패', error)
});

// 단일 파일 업로드
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const result = await upload('/api/v1/upload', formData);
    console.log('업로드 완료:', result);
  } catch (err) {
    console.error('업로드 실패:', err);
  }
};

// 진행률 표시
{isUploading && <ProgressBar progress={uploadProgress} />}
```

**Features:**
- XMLHttpRequest 기반 (실제 진행률 추적 가능)
- Authorization 헤더 자동 추가
- 에러 핸들링 및 재시도 로직

#### useImageUpload
```javascript
// src/hooks/useImageUpload.js
import { useImageUpload } from '../hooks/useImageUpload';

const {
  uploadImage,      // 이미지 업로드
  deleteImage,      // 이미지 삭제
  getImageUrl,      // 이미지 URL 조회
  listUserImages,   // 사용자 이미지 목록
  createImagePreview, // 로컬 미리보기
  compressImage     // 이미지 압축
} = useImageUpload({
  onSuccess: (result) => console.log('업로드 성공', result)
});

// 이미지 업로드 (타입별)
const handleProfileUpload = async (file) => {
  // 파일 검증 (10MB 제한, JPEG/PNG/WebP/GIF만 허용)
  const result = await uploadImage(file, 'profile', {
    userId: currentUserId,
    quality: 0.9
  });
  console.log('업로드 URL:', result.url);
};

// 로컬 미리보기 생성
const preview = await createImagePreview(file);
setPreviewUrl(preview);

// 이미지 압축
const compressed = await compressImage(file, { maxWidth: 1200, quality: 0.8 });
```

**Image Types:** `'profile' | 'post' | 'avatar' | 'general'`
**Formats:** JPEG, PNG, WebP, GIF (10MB 제한)

#### useAudioUpload
```javascript
// useFileUpload.js에서 export됨
import { useAudioUpload } from '../hooks/useFileUpload';

const { uploadAudio } = useAudioUpload();

const handleAudioUpload = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const result = await uploadAudio(formData);
  console.log('오디오 URL:', result.url);
};
```

---

### 3. Performance Hooks

#### useIntersectionObserver
```javascript
// src/hooks/useIntersectionObserver.js
import useIntersectionObserver from '../hooks/useIntersectionObserver';

function LazyComponent() {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,      // 10% 보이면 감지
    rootMargin: '50px'   // 50px 전에 미리 로드
  });

  return (
    <div ref={ref}>
      {isIntersecting ? <HeavyComponent /> : <Placeholder />}
    </div>
  );
}
```

#### useLazyImage
```javascript
// src/hooks/useLazyLoading.js
import { useLazyImage } from '../hooks/useLazyLoading';

function ImageComponent({ src, alt }) {
  const { ref, imageSrc, isLoaded } = useLazyImage(src, {
    placeholder: '/assets/placeholder.png',
    rootMargin: '100px'
  });

  return (
    <img
      ref={ref}
      src={imageSrc}
      alt={alt}
      className={isLoaded ? 'loaded' : 'loading'}
    />
  );
}
```

#### useLazyList
```javascript
// src/hooks/useLazyLoading.js
import { useLazyList } from '../hooks/useLazyLoading';

function InfiniteList({ items }) {
  const { visibleItems, lastItemRef } = useLazyList(items, {
    initialCount: 20,
    incrementCount: 10
  });

  return (
    <div>
      {visibleItems.map((item, index) => (
        <div
          key={item.id}
          ref={index === visibleItems.length - 1 ? lastItemRef : null}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

#### useInfiniteScroll
```javascript
// src/hooks/useLazyLoading.js
import { useInfiniteScroll } from '../hooks/useLazyLoading';

function Feed() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);

  const loadMore = async () => {
    const newItems = await fetchItems(page);
    setItems(prev => [...prev, ...newItems]);
    setPage(p => p + 1);
  };

  const { lastItemRef, isLoading } = useInfiniteScroll(loadMore, {
    threshold: 0.5,
    rootMargin: '200px'
  });

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={index === items.length - 1 ? lastItemRef : null}
        >
          {item.content}
        </div>
      ))}
      {isLoading && <LoadingSpinner />}
    </div>
  );
}
```

#### usePreload (Component Preloading)
```javascript
// src/hooks/usePreload.js
import { usePreload } from '../hooks/usePreload';

function NavLink() {
  const { preload, isPreloaded, isPreloading, ...hoverProps } = usePreload(
    () => import('../pages/Dashboard'),
    {
      preloadOnMount: false,    // 마운트 시 프리로드
      preloadOnIdle: true,      // 유휴 시 프리로드
      preloadOnHover: true,     // 호버 시 프리로드
      delay: 0                  // 지연 시간 (ms)
    }
  );

  return (
    <Link to="/dashboard" {...hoverProps}>
      Dashboard {isPreloading && '⏳'}
    </Link>
  );
}
```

#### useRoutePreload
```javascript
// src/hooks/usePreload.js
import { useRoutePreload } from '../hooks/usePreload';

// App.jsx에서 critical 라우트 프리로드
function App() {
  useRoutePreload([
    { path: '/main', component: () => import('./pages/Main') },
    { path: '/chat', component: () => import('./pages/Chat') },
    { path: '/profile', component: () => import('./pages/Profile') }
  ], {
    strategy: 'idle',  // 'idle' | 'interaction' | 'eager'
    delay: 2000
  });

  return <Routes>...</Routes>;
}
```

**Strategies:**
- `eager`: 즉시 프리로드
- `idle`: requestIdleCallback 사용 (유휴 시)
- `interaction`: 첫 사용자 인터랙션 후

#### useImagePreload (Batch)
```javascript
// src/hooks/usePreload.js
import { useImagePreload } from '../hooks/usePreload';

function Gallery() {
  const { preloadImages, allLoaded, progress } = useImagePreload([
    '/gallery/img1.jpg',
    '/gallery/img2.jpg',
    '/gallery/img3.jpg'
  ]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  return (
    <div>
      {!allLoaded && <ProgressBar value={progress} />}
      {allLoaded && <ImageGallery />}
    </div>
  );
}
```

#### useResourcePreload
```javascript
// src/hooks/usePreload.js
import { useResourcePreload } from '../hooks/usePreload';

function App() {
  const { preloadStylesheet, preloadScript, preloadFont } = useResourcePreload();

  useEffect(() => {
    // 폰트 프리로드
    preloadFont('/fonts/pretendard.woff2', 'font/woff2');

    // 스타일시트 프리로드
    preloadStylesheet('/critical.css');

    // 스크립트 프리로드
    preloadScript('/analytics.js');
  }, []);

  return <App />;
}
```

#### useInteractionPreload
```javascript
// src/hooks/usePreload.js
import { useInteractionPreload } from '../hooks/usePreload';

function App() {
  useInteractionPreload([
    () => import('./pages/Session'),
    () => import('./pages/Matching')
  ]);

  return <App />;
}
```

**첫 사용자 인터랙션 후 프리로드 (click, keydown, scroll, touchstart)**

---

### 4. Accessibility Hooks

#### useKeyboardNavigation
```javascript
// src/hooks/useKeyboardNavigation.js
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

function Dropdown({ items, onSelect }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const ref = useKeyboardNavigation({
    onArrowUp: (e) => setSelectedIndex(i => Math.max(0, i - 1)),
    onArrowDown: (e) => setSelectedIndex(i => Math.min(items.length - 1, i + 1)),
    onEnter: (e) => onSelect(items[selectedIndex]),
    onEscape: (e) => closeDropdown(),
    onTab: (e, shiftKey) => {
      // Tab 네비게이션 로직
    },
    disabled: false,
    preventDefault: true
  });

  return (
    <div ref={ref} tabIndex={0}>
      {items.map((item, index) => (
        <div key={index} className={index === selectedIndex ? 'selected' : ''}>
          {item}
        </div>
      ))}
    </div>
  );
}
```

**Supported Keys:** ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Enter, Space, Escape, Tab

#### useFocusManagement
```javascript
// src/hooks/useKeyboardNavigation.js
import { useFocusManagement } from '../hooks/useKeyboardNavigation';

function Menu() {
  const { containerRef, focusFirst, focusLast, focusNext, focusPrevious } = useFocusManagement({
    selector: 'button, a, input',  // 포커스 가능한 요소
    loop: true,                    // 끝에서 처음으로 순환
    autoFocus: true               // 마운트 시 첫 요소 포커스
  });

  return (
    <div ref={containerRef}>
      <button onClick={focusNext}>다음</button>
      <button onClick={focusPrevious}>이전</button>
      <button onClick={focusFirst}>첫 번째</button>
      <button onClick={focusLast}>마지막</button>
    </div>
  );
}
```

#### useFocusTrap
```javascript
// src/hooks/useKeyboardNavigation.js
import { useFocusTrap } from '../hooks/useKeyboardNavigation';

function Modal({ isOpen, onClose }) {
  const ref = useFocusTrap({
    isOpen,
    onClose,  // Escape 키로 닫기
  });

  if (!isOpen) return null;

  return (
    <div ref={ref} role="dialog" aria-modal="true">
      <h2>모달 제목</h2>
      <input type="text" />
      <button>확인</button>
      <button onClick={onClose}>취소</button>
    </div>
  );
}
```

**Features:**
- 모달 열릴 때 첫 포커스 가능한 요소에 포커스
- Tab 키로 모달 내부만 순환
- Escape 키로 닫기
- 닫힐 때 이전 포커스 복원

---

### 5. Mobile Hooks

#### usePullToRefresh
```javascript
// src/hooks/usePullToRefresh.js
import usePullToRefresh from '../hooks/usePullToRefresh';

function Feed() {
  const [items, setItems] = useState([]);

  const handleRefresh = async () => {
    const newItems = await fetchLatestItems();
    setItems(newItems);
  };

  const { containerRef, pullDistance, isRefreshing } = usePullToRefresh(handleRefresh, {
    threshold: 80,          // 80px 당기면 새로고침
    maxPullDistance: 120,   // 최대 당김 거리
    resistance: 0.5         // 저항 계수
  });

  return (
    <div ref={containerRef}>
      {isRefreshing && <LoadingSpinner />}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {items.map(item => <Item key={item.id} {...item} />)}
      </div>
    </div>
  );
}
```

#### useSwipeGesture
```javascript
// src/hooks/useSwipeGesture.js
import useSwipeGesture from '../hooks/useSwipeGesture';

function SwipeableCard() {
  const handleSwipe = (direction) => {
    if (direction === 'left') {
      // 왼쪽 스와이프 액션
    } else if (direction === 'right') {
      // 오른쪽 스와이프 액션
    }
  };

  const ref = useSwipeGesture(handleSwipe, {
    minDistance: 50,     // 최소 스와이프 거리 (px)
    maxTime: 300,        // 최대 스와이프 시간 (ms)
    preventDefault: true // 기본 동작 방지
  });

  return <div ref={ref}>스와이프 가능한 카드</div>;
}
```

**Directions:** `'left' | 'right' | 'up' | 'down'`

---

### 6. AI/ML Hooks

#### useLLM (Cloudflare Workers AI)
```javascript
// src/hooks/useLLM.js
import { useLLM } from '../hooks/useLLM';

function ChatBot() {
  const {
    loading,
    error,
    generateText,              // 일반 텍스트 생성
    generateChatCompletion,    // 채팅 대화 생성
    generateLevelFeedback,     // 레벨 테스트 피드백
    generateConversationTopics, // 대화 주제 생성
    generateSessionSummary,    // 세션 요약 생성
    generateTextStream         // 스트리밍 생성
  } = useLLM();

  const handleGenerate = async () => {
    // 일반 텍스트 생성
    const text = await generateText('안녕하세요를 영어로 번역해주세요');

    // 채팅 대화 생성
    const response = await generateChatCompletion([
      { role: 'user', content: 'Hello, how are you?' },
      { role: 'assistant', content: 'I am fine, thank you!' },
      { role: 'user', content: 'What is your name?' }
    ]);

    // 스트리밍 생성
    await generateTextStream('긴 이야기를 들려주세요', {}, (chunk, fullText) => {
      console.log('새 청크:', chunk);
      setDisplayText(fullText);
    });
  };

  return (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}
      <button onClick={handleGenerate}>생성</button>
    </div>
  );
}
```

**Model:** `llama-3.2-3b-instruct` (Cloudflare Workers AI)

#### useWhisper (음성 인식 API)
```javascript
// src/hooks/useWhisper.js
import { useWhisper, WHISPER_LANGUAGES } from '../hooks/useWhisper';

function VoiceRecorder() {
  const {
    loading,
    error,
    transcribeAudio,        // 오디오 전사
    transcribeFromURL,      // URL에서 전사
    translateAudio,         // 오디오 번역 (영어로)
    getSupportedLanguages,  // 지원 언어 목록
    getAvailableModels      // 사용 가능한 모델
  } = useWhisper();

  const handleTranscribe = async (audioFile) => {
    // File, Blob, base64 문자열 모두 지원
    const result = await transcribeAudio(audioFile, {
      language: 'ko',           // 'auto' 또는 언어 코드
      model: 'whisper-large-v3',
      task: 'transcribe',       // 'transcribe' | 'translate'
      temperature: 0.0,
      vad_filter: true
    });

    console.log('전사 결과:', result.text);
    console.log('감지된 언어:', result.language);
    console.log('신뢰도:', result.confidence);
  };

  const handleTranslate = async (audioFile) => {
    // 모든 언어 → 영어 번역
    const result = await translateAudio(audioFile);
    console.log('번역 결과:', result.text);
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={(e) => handleTranscribe(e.target.files[0])} />
      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

// 지원 언어 (26개)
console.log(WHISPER_LANGUAGES);
// ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de', 'it', 'pt', 'ru', ...]
```

**Supported Models:** `whisper-large-v3`, `whisper-medium`, `whisper-small`

#### useRealtimeTranscription
```javascript
// src/hooks/useRealtimeTranscription.js
import { useRealtimeTranscription } from '../hooks/useRealtimeTranscription';

function LiveTranscription() {
  const [stream, setStream] = useState(null);

  const {
    isTranscribing,
    transcripts,           // 전체 전사 기록
    currentTranscript,     // 현재 자막
    error,
    startTranscription,
    stopTranscription,
    toggleTranscription,
    clearTranscripts,
    exportTranscripts,     // 'text' | 'srt' | 'json'
    stats                  // { totalTranscripts, totalWords, duration }
  } = useRealtimeTranscription({
    language: 'auto',      // 'auto' 또는 언어 코드
    chunkDuration: 2000,   // 2초마다 처리
    onTranscript: (transcript) => {
      console.log('새 자막:', transcript.text);
    },
    onError: (error) => {
      console.error('전사 오류:', error);
    }
  });

  useEffect(() => {
    // 마이크 스트림 가져오기
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(mediaStream => {
        setStream(mediaStream);
        startTranscription(mediaStream);
      });

    return () => {
      stopTranscription();
    };
  }, []);

  const handleExport = () => {
    // SRT 자막 파일 내보내기
    const srtContent = exportTranscripts('srt');
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcripts.srt';
    a.click();
  };

  return (
    <div>
      <button onClick={() => toggleTranscription(stream)}>
        {isTranscribing ? '중지' : '시작'}
      </button>
      <button onClick={handleExport}>내보내기</button>
      <button onClick={clearTranscripts}>초기화</button>

      {/* 현재 자막 */}
      {currentTranscript && (
        <div className="live-subtitle">
          {currentTranscript.text}
        </div>
      )}

      {/* 전체 기록 */}
      <div className="transcript-history">
        {transcripts.map(t => (
          <p key={t.id}>
            [{new Date(t.timestamp).toLocaleTimeString()}] {t.text}
          </p>
        ))}
      </div>

      {/* 통계 */}
      <div>
        전사: {stats.totalTranscripts}개 | 단어: {stats.totalWords}개 | 시간: {stats.duration}초
      </div>
    </div>
  );
}
```

**Features:**
- MediaRecorder 사용 (250ms 청크)
- 2초마다 Whisper API 호출
- 자막 4초 표시 후 자동 제거
- Export 형식: text, srt, json

#### useWebSocketTranscription
```javascript
// src/hooks/useWebSocketTranscription.js
import { useWebSocketTranscription } from '../hooks/useWebSocketTranscription';

function RealtimeTranscription() {
  const {
    isConnected,
    isTranscribing,
    transcripts,
    currentTranscript,
    connectionQuality,     // 'good' | 'poor' | 'disconnected'
    error,
    connect,
    disconnect,
    startTranscription,
    stopTranscription,
    updateLanguage
  } = useWebSocketTranscription({
    language: 'ko',
    onTranscript: (transcript) => console.log(transcript),
    onError: (error) => console.error(error)
  });

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  const handleStart = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    startTranscription(stream);
  };

  return (
    <div>
      <div>연결 상태: {isConnected ? '연결됨' : '연결 안됨'}</div>
      <div>품질: {connectionQuality}</div>
      <button onClick={handleStart}>시작</button>
      <button onClick={stopTranscription}>중지</button>
      <select onChange={(e) => updateLanguage(e.target.value)}>
        <option value="ko">한국어</option>
        <option value="en">English</option>
      </select>

      {currentTranscript && <p>{currentTranscript.text}</p>}
    </div>
  );
}
```

**Features:**
- WebSocket 기반 실시간 전사
- AudioContext/AudioWorklet 사용
- 자동 재연결 (exponential backoff)
- 연결 품질 모니터링

#### useTranslation
```javascript
// src/hooks/useTranslation.js
import { useTranslation, useRealtimeTranslation } from '../hooks/useTranslation';

// 일반 번역
function TranslateText() {
  const {
    translate,           // 단일 번역
    translateBatch,      // 배치 번역
    translateSubtitle,   // 자막 번역 (타임스탬프 포함)
    exportTranslations,  // 'text' | 'json' | 'csv'
    clearCache,
    loading,
    error
  } = useTranslation({
    sourceLang: 'en',
    targetLang: 'ko',
    onTranslate: (result) => console.log(result),
    cacheResults: true,
    maxCacheSize: 100
  });

  const handleTranslate = async () => {
    const result = await translate('Hello, world!');
    console.log('번역:', result.translatedText);

    // 배치 번역
    const batch = await translateBatch(['Hello', 'Goodbye', 'Thank you']);
    console.log('배치 결과:', batch);

    // 자막 번역
    const subtitle = await translateSubtitle({
      text: 'Hello',
      timestamp: '00:00:01,000 --> 00:00:03,000'
    });
  };

  return <button onClick={handleTranslate}>번역</button>;
}

// 실시간 번역
function RealtimeTranslate() {
  const {
    translateRealtime,
    currentTranslation,
    translationHistory,
    isTranslating
  } = useRealtimeTranslation({
    sourceLang: 'en',
    targetLang: 'ko',
    context: '일상 대화'  // 번역 컨텍스트
  });

  useEffect(() => {
    // 실시간 자막 번역
    const transcript = { text: 'Hello, how are you?', timestamp: Date.now() };
    translateRealtime(transcript);
  }, []);

  return (
    <div>
      {currentTranslation && <p>{currentTranslation.translatedText}</p>}
    </div>
  );
}
```

---

### 7. WebRTC Hook

#### useWebRTC (Polite Peer Pattern)
```javascript
// src/hooks/useWebRTC.js
import { useWebRTC } from '../hooks/useWebRTC';

function VideoSession({ roomId, userId, peerId }) {
  const {
    localStream,
    remoteStreams,         // Map<peerId, MediaStream>
    isConnected,
    connectionState,       // Map<peerId, RTCPeerConnectionState>
    iceConnectionState,    // Map<peerId, RTCIceConnectionState>
    stats,                 // Map<peerId, { bitrate, packetLoss, latency, connectionType }>
    error,
    getUserMedia,
    toggleAudio,
    toggleVideo,
    disconnect
  } = useWebRTC({
    roomId,
    userId,
    onRemoteStream: (peerId, stream) => {
      console.log('원격 스트림 수신:', peerId);
    },
    onConnectionStateChange: (peerId, state) => {
      console.log(`연결 상태 변경 (${peerId}):`, state);
    },
    onStatsUpdate: (peerId, stats) => {
      console.log(`통계 업데이트 (${peerId}):`, stats);
      // stats: { bitrate, packetLoss, latency, connectionType: 'direct' | 'relay' }
    }
  });

  useEffect(() => {
    // 로컬 미디어 가져오기
    getUserMedia({ audio: true, video: true });

    return () => {
      disconnect();
    };
  }, []);

  return (
    <div>
      {/* 로컬 비디오 */}
      <video
        ref={ref => ref && (ref.srcObject = localStream)}
        autoPlay
        muted
        playsInline
      />

      {/* 원격 비디오들 */}
      {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
        <div key={peerId}>
          <video
            ref={ref => ref && (ref.srcObject = stream)}
            autoPlay
            playsInline
          />
          <div>
            상태: {connectionState.get(peerId)}
            ICE: {iceConnectionState.get(peerId)}
          </div>
          {stats.get(peerId) && (
            <div>
              비트레이트: {stats.get(peerId).bitrate} kbps
              패킷 손실: {stats.get(peerId).packetLoss}%
              지연시간: {stats.get(peerId).latency} ms
              연결 타입: {stats.get(peerId).connectionType}
            </div>
          )}
        </div>
      ))}

      {/* 컨트롤 */}
      <button onClick={toggleAudio}>오디오 토글</button>
      <button onClick={toggleVideo}>비디오 토글</button>
      <button onClick={disconnect}>연결 종료</button>
    </div>
  );
}
```

**Features:**
- **Polite Peer Pattern**: Offer collision 해결
- **Dynamic ICE Servers**: 백엔드에서 TURN 서버 동적 설정
- **Auto Quality Adjustment**: TURN relay 사용 시 자동으로 500kbps로 품질 감소 (비용 절감)
- **ICE Candidate Queuing**: Race condition 방지
- **Stats Monitoring**: 1초마다 연결 통계 수집
- **Connection Types**:
  - `direct`: P2P 직접 연결 (1.5Mbps)
  - `relay`: TURN 서버 경유 (500kbps 자동 제한)

---

### 8. Session Hook

#### useSessionTimeControl
```javascript
// src/hooks/useSessionTimeControl.js
import { useSessionTimeControl } from '../hooks/useSessionTimeControl';

function SessionRoom({ sessionMetadata, roomId }) {
  const {
    remainingMinutes,    // 남은 시간 (분)
    showEndWarning,      // 종료 경고 표시 여부
    sessionAccessInfo,   // { canJoin, status, message }
    dismissWarning       // 경고 닫기
  } = useSessionTimeControl(sessionMetadata, roomId);

  // sessionMetadata: { scheduledStartTime, scheduledEndTime }

  return (
    <div>
      {/* 세션 접근 불가 시 */}
      {sessionAccessInfo && !sessionAccessInfo.canJoin && (
        <div className="access-denied">
          {sessionAccessInfo.message}
          {/* 2초 후 /sessions로 자동 리다이렉트 */}
        </div>
      )}

      {/* 남은 시간 표시 */}
      {remainingMinutes !== null && (
        <div className="time-remaining">
          남은 시간: {remainingMinutes}분
        </div>
      )}

      {/* 종료 경고 (5분 전, 1분 전) */}
      {showEndWarning && (
        <div className="warning-modal">
          <p>세션이 곧 종료됩니다. (남은 시간: {remainingMinutes}분)</p>
          <button onClick={dismissWarning}>확인</button>
        </div>
      )}

      {/* 세션 콘텐츠 */}
      <div>세션 진행 중...</div>
    </div>
  );
}
```

**Features:**
- 세션 시작 전 접근 차단
- 세션 종료 후 자동 종료
- 5분 전, 1분 전 경고
- 30초마다 남은 시간 폴링
- 자동 리다이렉트 (`/sessions`)

**Access Status:**
- `always_available`: 시간 제한 없음
- `not_started`: 아직 시작 전
- `in_progress`: 진행 중
- `ended`: 종료됨

---

### 9. Store Hook

#### useAchievementOverview
```javascript
// src/hooks/useAchievementOverview.js
import { useAchievementOverview } from '../hooks/useAchievementOverview';

function AchievementsPage() {
  const {
    achievements,        // 업적 목록
    stats,              // 통계
    loading,
    error,
    refresh            // 강제 새로고침
  } = useAchievementOverview();

  return (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}

      <div>
        <p>총 업적: {stats?.total}</p>
        <p>달성: {stats?.completed}</p>
        <p>진행률: {stats?.progress}%</p>
      </div>

      {achievements.map(achievement => (
        <AchievementCard key={achievement.id} {...achievement} />
      ))}

      <button onClick={() => refresh(true)}>새로고침</button>
    </div>
  );
}
```

**Features:**
- **Shallow Comparison**: Zustand selector 최적화
- **Infinite Loop Prevention**: `useRef`로 초기화 제어
- **Auto-fetch**: 마운트 시 자동 데이터 로드
- **Cache Check**: 캐시 데이터 있으면 스킵
- **Force Refresh**: `refresh(true)`로 강제 새로고침

**⚠️ CRITICAL Pattern:**
```javascript
// ✅ CORRECT: shallow comparison + useRef
const selectAchievementOverview = (state) => ({
  achievements: state.achievements,
  stats: state.stats,
  loading: state.loading,
  error: state.error,
  fetchAchievements: state.fetchAchievements,
  lastFetchedAt: state.lastFetchedAt
});

const data = useAchievementStore(selectAchievementOverview, shallow);

const initializedRef = useRef(false);
useEffect(() => {
  if (initializedRef.current) return;  // 무한 루프 방지
  initializedRef.current = true;
  // 초기화 로직
}, []);
```

---

### Common Patterns

#### 1. Cleanup in useEffect
```javascript
useEffect(() => {
  // 설정
  const subscription = subscribe();

  // 클린업
  return () => {
    subscription.unsubscribe();
  };
}, [dependency]);
```

#### 2. useCallback for Memoization
```javascript
const handleClick = useCallback(() => {
  // 로직
}, [dependency]);
```

#### 3. Error Handling
```javascript
const [error, setError] = useState(null);

try {
  const result = await apiCall();
  setError(null);
} catch (err) {
  setError(err.message);
  console.error('에러:', err);
}
```

#### 4. Loading States
```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.get('/data');
    return data;
  } finally {
    setLoading(false);
  }
};
```

#### 5. Ref-based State (No Re-render)
```javascript
const processingRef = useRef(false);

const process = async () => {
  if (processingRef.current) return;  // 중복 실행 방지
  processingRef.current = true;

  try {
    await heavyOperation();
  } finally {
    processingRef.current = false;
  }
};
```

#### 6. Promise-based APIs
```javascript
const confirm = useCallback((options) => {
  return new Promise((resolve) => {
    setConfirmDialog({
      ...options,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
}, []);
```

---

## 🔧 Service Layer

Service Layer는 비즈니스 로직과 외부 서비스 연동을 담당하는 핵심 계층입니다.

### 📋 Service Layer 개요

| 카테고리 | 서비스 | 파일 | 주요 기능 |
|---------|-------|------|----------|
| **WebSocket Services** | Notification WebSocket | `notificationWebSocket.js` | 알림 전용 WebSocket, 토큰 갱신 처리, 폴백 폴링 |
| | Unified WebSocket | `unifiedWebSocketService.js` | 통합 WebSocket, 이벤트 기반 아키텍처 |
| | Generic WebSocket | `websocketService.js` | 범용 WebSocket 래퍼, 구독 관리 |
| **Real-time Communication** | WebRTC Manager | `webrtc.js` | Polite Peer 패턴, 동적 ICE, 품질 자동 조정 |
| **Push Notifications** | Push Notification | `pushNotificationService.js` | Service Worker, Web Push API, VAPID |

---

### 🌐 WebSocket Services

#### 1. Notification WebSocket Service

**파일**: `src/services/notificationWebSocket.js` (508 lines)

**목적**: 알림 전용 WebSocket 연결 관리, 토큰 갱신 자동 처리, 폴백 폴링 지원

**클래스**: `NotificationWebSocketService` (싱글톤 패턴)

**주요 기능**:
- **Exponential Backoff**: 2초 → 60초 (최대 5회 재시도)
- **6개 구독 채널**: personal, system, urgent, matching, session, chat
- **토큰 갱신 이벤트 리스너**: `window.addEventListener('token-refreshed', ...)`
- **폴백 폴링**: WebSocket 실패 시 30초마다 HTTP 폴링
- **브라우저 알림**: Web Notification API 통합

**핵심 메서드**:

```javascript
class NotificationWebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelayBase = 2000;      // 2초 시작
    this.reconnectDelayMax = 60000;       // 60초 최대
    this.fallbackPollInterval = 30000;    // 30초 폴링

    // 토큰 갱신 리스너 등록
    if (typeof window !== 'undefined') {
      window.addEventListener('token-refreshed', this.handleTokenRefresh.bind(this));
    }
  }

  // 토큰 갱신 시 자동 재연결
  handleTokenRefresh() {
    console.log("🔄 WebSocket: Token refreshed, reconnecting...");
    if (this.client && this.isConnected) {
      this.disconnect();
    }
    this.reconnectAttempts = 0;
    this.connect().catch((error) => {
      console.error("🔄 WebSocket: Failed to reconnect after token refresh", error);
    });
  }

  // Exponential backoff 계산
  getReconnectDelay() {
    const delay = Math.min(
      this.reconnectDelayBase * Math.pow(2, this.reconnectAttempts),
      this.reconnectDelayMax
    );
    return delay + Math.random() * 1000; // Jitter 추가
  }

  // 6개 채널 자동 구독
  setupDefaultSubscriptions() {
    this.subscribe('/user/queue/notifications', this.handlePersonalNotification.bind(this));
    this.subscribe('/sub/system-notifications', this.handleSystemNotification.bind(this));
    this.subscribe('/sub/urgent-notifications', this.handleUrgentNotification.bind(this));
    this.subscribe('/user/queue/matching-notifications', this.handleMatchingNotification.bind(this));
    this.subscribe('/user/queue/session-notifications', this.handleSessionNotification.bind(this));
    this.subscribe('/user/queue/chat-notifications', this.handleChatNotification.bind(this));
  }

  // 폴백 폴링 시작 (WebSocket 실패 시)
  startFallbackPolling() {
    if (this.fallbackPollTimer) {
      clearInterval(this.fallbackPollTimer);
    }

    this.fallbackPollTimer = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/notifications/unread`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const notifications = await response.json();

        notifications.forEach(notification => {
          this.handlePersonalNotification({ body: JSON.stringify(notification) });
        });
      } catch (error) {
        console.error('❌ [Fallback Polling] Failed:', error);
      }
    }, this.fallbackPollInterval);
  }

  // 브라우저 알림 표시
  showBrowserNotification(title, body, data = {}) {
    if (!('Notification' in window)) {
      console.warn('⚠️ 이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/assets/image286.png',
        badge: '/assets/badge-icon.png',
        data,
        requireInteraction: data.urgent || false
      });
    }
  }
}

// 싱글톤 인스턴스 내보내기
export default new NotificationWebSocketService();
```

**사용 예시**:

```javascript
import notificationWS from '@/services/notificationWebSocket';

// 연결
await notificationWS.connect();

// 커스텀 핸들러 등록
notificationWS.on('notification', (notification) => {
  console.log('New notification:', notification);
});

// 연결 해제
notificationWS.disconnect();
```

**특징**:
- ✅ 토큰 갱신 자동 처리 (인증 만료 방지)
- ✅ 폴백 폴링으로 안정성 보장
- ✅ Exponential backoff로 서버 부하 감소
- ✅ 브라우저 알림 통합

---

#### 2. Unified WebSocket Service

**파일**: `src/services/unifiedWebSocketService.js` (402 lines)

**목적**: 모든 비-알림 채널을 통합 관리하는 WebSocket 서비스

**클래스**: `UnifiedWebSocketService` (싱글톤 패턴)

**주요 기능**:
- **이벤트 기반 아키텍처**: `CustomEvent`로 메시지 브로드캐스트
- **채팅방 관리**: 동적 채팅방 구독/해제
- **메시지 큐잉**: 연결 해제 시 메시지 큐에 저장, 재연결 시 전송
- **Heartbeat**: 10초 인입/출력

**핵심 메서드**:

```javascript
class UnifiedWebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.messageQueue = [];
    this.subscriptions = new Map();
    this.chatRooms = new Set();

    // STOMP 설정
    this.heartbeatIncoming = 10000;  // 10초
    this.heartbeatOutgoing = 10000;  // 10초
  }

  // 기본 채널 구독
  setupDefaultSubscriptions() {
    this.subscribe('/user/queue/messages', this.handlePersonalMessage.bind(this));
    this.subscribe('/user/queue/notifications', this.handleNotification.bind(this));
    this.subscribe('/user/queue/matching', this.handleMatchingUpdate.bind(this));
    this.subscribe('/user/queue/session', this.handleSessionUpdate.bind(this));
    this.subscribe('/topic/system', this.handleSystemMessage.bind(this));
  }

  // CustomEvent로 메시지 브로드캐스트
  handlePersonalMessage(message) {
    const data = JSON.parse(message.body);
    window.dispatchEvent(new CustomEvent('ws:personal-message', {
      detail: data
    }));
  }

  handleMatchingUpdate(message) {
    const data = JSON.parse(message.body);
    window.dispatchEvent(new CustomEvent('ws:matching-update', {
      detail: data
    }));
  }

  // 채팅방 동적 구독
  joinChatRoom(roomId) {
    if (this.chatRooms.has(roomId)) {
      console.warn(`⚠️ Already joined chat room: ${roomId}`);
      return;
    }

    const destination = `/topic/chat/${roomId}`;
    this.subscribe(destination, (message) => {
      const data = JSON.parse(message.body);
      window.dispatchEvent(new CustomEvent('ws:chat-message', {
        detail: { roomId, message: data }
      }));
    });

    this.chatRooms.add(roomId);
    console.log(`✅ Joined chat room: ${roomId}`);
  }

  leaveChatRoom(roomId) {
    const destination = `/topic/chat/${roomId}`;
    this.unsubscribe(destination);
    this.chatRooms.delete(roomId);
    console.log(`👋 Left chat room: ${roomId}`);
  }

  // 메시지 큐잉 (연결 해제 시)
  sendMessage(destination, message) {
    if (this.isConnected && this.client) {
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
    } else {
      console.warn('⚠️ WebSocket not connected, queuing message');
      this.messageQueue.push({ destination, message });
    }
  }

  // 재연결 시 큐 플러시
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { destination, message } = this.messageQueue.shift();
      this.sendMessage(destination, message);
    }
  }
}

export default new UnifiedWebSocketService();
```

**사용 예시**:

```javascript
import unifiedWS from '@/services/unifiedWebSocketService';

// 연결
await unifiedWS.connect();

// 채팅방 입장
unifiedWS.joinChatRoom('room-123');

// 이벤트 리스너 등록
window.addEventListener('ws:chat-message', (event) => {
  const { roomId, message } = event.detail;
  console.log(`Message from ${roomId}:`, message);
});

// 메시지 전송
unifiedWS.sendMessage('/app/chat/room-123', {
  text: 'Hello!',
  timestamp: Date.now()
});

// 채팅방 퇴장
unifiedWS.leaveChatRoom('room-123');
```

**특징**:
- ✅ 이벤트 기반으로 컴포넌트 간 느슨한 결합
- ✅ 채팅방 동적 관리로 메모리 효율성
- ✅ 메시지 큐잉으로 데이터 손실 방지
- ✅ Heartbeat로 연결 상태 유지

---

#### 3. Generic WebSocket Service

**파일**: `src/services/websocketService.js` (579 lines)

**목적**: 범용 WebSocket STOMP 클라이언트 래퍼

**클래스**: `WebSocketService` (싱글톤 패턴)

**주요 기능**:
- **연결 타임아웃**: 30초
- **Exponential Backoff**: 1초 → 30초
- **구독 재설정**: 재연결 시 모든 구독 자동 복구
- **메시지 큐**: 연결 해제 시 자동 저장

**핵심 메서드**:

```javascript
class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.connectionTimeout = null;
    this.connectionTimeoutMs = 30000;    // 30초 타임아웃
    this.reconnectDelay = 1000;          // 1초 시작
    this.maxReconnectDelay = 30000;      // 30초 최대
    this.messageQueue = [];
    this.activeSubscriptions = new Map();
  }

  // 연결 타임아웃 처리
  connect(options = {}) {
    return new Promise((resolve, reject) => {
      this.isConnecting = true;

      // 타임아웃 설정
      this.connectionTimeout = setTimeout(() => {
        console.error("[WebSocketService] ❌ 연결 타임아웃");
        this.isConnecting = false;
        this.isConnected = false;

        const error = new Error(`WebSocket 연결 타임아웃 (${this.connectionTimeoutMs}ms)`);
        reject(error);
        this.handleReconnection();
      }, this.connectionTimeoutMs);

      const token = localStorage.getItem('accessToken');
      const socketUrl = `${API_BASE_URL}/ws`;

      this.client = new Client({
        webSocketFactory: () => new WebSocket(socketUrl),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
          ...options.headers
        },
        debug: (str) => {
          if (options.debug) console.log(str);
        },
        onConnect: (frame) => {
          // 타임아웃 클리어
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }

          this.isConnecting = false;
          this.isConnected = true;
          this.reconnectDelay = 1000; // 리셋

          console.log('[WebSocketService] ✅ 연결 성공');

          this.flushMessageQueue();
          this.reestablishSubscriptions();

          if (options.onConnect) {
            options.onConnect(frame);
          }
          resolve();
        },
        onStompError: (frame) => {
          console.error('[WebSocketService] ❌ STOMP 에러:', frame);
          this.isConnecting = false;
          this.isConnected = false;

          if (options.onError) {
            options.onError(frame);
          }
          this.handleReconnection();
        },
        onWebSocketClose: () => {
          console.warn('[WebSocketService] ⚠️ WebSocket 연결 종료');
          this.isConnected = false;
          this.handleReconnection();
        }
      });

      this.client.activate();
    });
  }

  // 구독 재설정 (재연결 시)
  reestablishSubscriptions() {
    console.log(`[WebSocketService] 🔄 ${this.activeSubscriptions.size}개 구독 재설정 중...`);

    const subscriptionsCopy = new Map(this.activeSubscriptions);
    this.activeSubscriptions.clear();

    subscriptionsCopy.forEach((callback, destination) => {
      this.subscribe(destination, callback);
    });

    console.log('[WebSocketService] ✅ 구독 재설정 완료');
  }

  // 메시지 큐 플러시
  flushMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(`[WebSocketService] 📤 ${this.messageQueue.length}개 큐 메시지 전송 중...`);

    while (this.messageQueue.length > 0) {
      const { destination, body, headers } = this.messageQueue.shift();
      this.send(destination, body, headers);
    }
  }

  // Exponential backoff
  handleReconnection() {
    if (this.isConnecting || this.isConnected) return;

    const delay = Math.min(this.reconnectDelay, this.maxReconnectDelay);
    console.log(`[WebSocketService] 🔄 ${delay}ms 후 재연결 시도...`);

    setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      this.connect().catch(error => {
        console.error('[WebSocketService] ❌ 재연결 실패:', error);
      });
    }, delay);
  }

  // 구독 관리
  subscribe(destination, callback) {
    if (!this.isConnected || !this.client) {
      console.warn('[WebSocketService] ⚠️ Not connected, subscription deferred');
      this.activeSubscriptions.set(destination, callback);
      return null;
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('[WebSocketService] ❌ Message parse error:', error);
        callback(message.body);
      }
    });

    this.activeSubscriptions.set(destination, callback);
    console.log(`[WebSocketService] ✅ Subscribed to: ${destination}`);

    return subscription;
  }

  unsubscribe(destination) {
    this.activeSubscriptions.delete(destination);
    console.log(`[WebSocketService] 👋 Unsubscribed from: ${destination}`);
  }

  // 메시지 전송
  send(destination, body, headers = {}) {
    if (!this.isConnected || !this.client) {
      console.warn('[WebSocketService] ⚠️ Not connected, message queued');
      this.messageQueue.push({ destination, body, headers });
      return;
    }

    this.client.publish({
      destination,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers
    });
  }

  disconnect() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.activeSubscriptions.clear();
    this.messageQueue = [];

    console.log('[WebSocketService] 👋 연결 종료');
  }
}

export default new WebSocketService();
```

**사용 예시**:

```javascript
import wsService from '@/services/websocketService';

// 연결 (타임아웃 30초)
try {
  await wsService.connect({
    debug: true,
    onConnect: (frame) => {
      console.log('Connected:', frame);
    },
    onError: (error) => {
      console.error('Connection error:', error);
    }
  });
} catch (error) {
  console.error('Connection timeout:', error);
}

// 구독
wsService.subscribe('/user/queue/messages', (message) => {
  console.log('Received:', message);
});

// 메시지 전송
wsService.send('/app/chat', { text: 'Hello' });

// 연결 해제
wsService.disconnect();
```

**특징**:
- ✅ 30초 연결 타임아웃으로 무한 대기 방지
- ✅ 구독 자동 재설정으로 재연결 시 끊김 없음
- ✅ 메시지 큐잉으로 전송 실패 방지
- ✅ Exponential backoff로 서버 부하 최소화

---

### 📡 Real-time Communication

#### WebRTC Connection Manager

**파일**: `src/services/webrtc.js` (1909 lines) - **가장 복잡한 서비스**

**목적**: WebRTC P2P 연결 관리, 비디오/오디오 세션 지원

**클래스**: `WebRTCConnectionManager` (싱글톤 패턴)

**주요 기능**:
- **Polite Peer 패턴**: Offer 충돌 자동 해결 (userId 비교)
- **동적 ICE 서버**: 백엔드에서 STUN/TURN 서버 목록 동적 로드
- **ICE 서버 정규화**: URL 형식 자동 수정 (Cloudflare STUN/TURN 호환)
- **자동 품질 조정**: TURN 릴레이 500kbps, 직접 연결 1.5Mbps
- **연결 건강 모니터링**: 5초마다 연결 상태 확인
- **통계 모니터링**: RTT, 패킷 손실, 비트레이트 추적

**핵심 메서드**:

```javascript
class WebRTCConnectionManager {
  constructor() {
    this.peerConnections = new Map();
    this.localStream = null;
    this.remoteStreams = new Map();
    this.pendingCandidates = new Map();
    this.makingOffer = new Map();
    this.ignoreOffer = new Map();
    this.isSettingRemoteAnswerPending = new Map();

    // 기본 RTC 설정
    this.rtcConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };

    this.userId = null;
    this.signalingChannel = null;

    // 연결 건강 모니터링 (5초마다)
    this.healthCheckInterval = null;
  }

  // 동적 ICE 서버 로드
  async loadDynamicIceServers() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/v1/webrtc/ice-servers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn('⚠️ [WebRTC] ICE 서버 로드 실패, 기본값 사용');
        return;
      }

      const data = await response.json();
      const iceServers = data.iceServers || data;

      // ICE 서버 정규화
      const normalized = this.normalizeIceServers(iceServers);

      this.rtcConfiguration.iceServers = normalized;
      console.log('✅ [WebRTC] 동적 ICE 서버 로드 완료:', normalized);
    } catch (error) {
      console.error('❌ [WebRTC] ICE 서버 로드 중 에러:', error);
    }
  }

  // ICE 서버 URL 정규화
  normalizeIceServers(iceServers) {
    if (!Array.isArray(iceServers)) {
      console.warn('⚠️ [WebRTC] ICE 서버가 배열이 아닙니다:', iceServers);
      return this.rtcConfiguration.iceServers;
    }

    const normalized = iceServers.map((server, index) => {
      const urls = Array.isArray(server.urls) ? server.urls : [server.urls];

      const normalizedUrls = urls.map(url => {
        if (typeof url !== 'string') return url;

        // 이미 올바른 형식
        if (url.match(/^(stun|turn|turns):/i)) {
          return url;
        }

        // STUN 서버 감지
        const isCloudflare = url.includes('cloudflare');
        const isStunPattern = url.match(/^(stun[0-9]?\.|.*\.stun\.)/i);
        const hasStunButNotTurn = url.includes('stun') && !url.includes('turn');

        if (isCloudflare || isStunPattern || hasStunButNotTurn) {
          // STUN URL 생성
          if (!url.includes(':')) {
            return `stun:${url}:3478`;
          }
          return `stun:${url}`;
        }

        // TURN 서버 감지
        if (server.username || server.credential) {
          if (url.includes(':')) {
            const port = url.split(':').pop();
            const isTLS = port === '5349' || port === '443' || url.includes('tls');
            const protocol = isTLS ? 'turns' : 'turn';
            return `${protocol}:${url}`;
          }
          return `turn:${url}:3478`;
        }

        // 기본: STUN으로 처리
        return `stun:${url}`;
      });

      return {
        ...server,
        urls: normalizedUrls.length === 1 ? normalizedUrls[0] : normalizedUrls
      };
    });

    console.log('🔧 [WebRTC] ICE 서버 정규화 완료:', normalized);
    return normalized;
  }

  // Polite Peer 패턴
  isPolite(peerId) {
    return this.userId < peerId;
  }

  // Offer 충돌 처리
  async handleOffer(fromId, offer) {
    const pc = this.peerConnections.get(fromId) || await this.createPeerConnection(fromId, false);

    // Offer 충돌 감지
    const offerCollision =
      pc.signalingState !== 'stable' ||
      this.makingOffer.get(fromId);

    // Impolite peer는 충돌 무시
    const shouldIgnore = !this.isPolite(fromId) && offerCollision;
    this.ignoreOffer.set(fromId, shouldIgnore);

    if (shouldIgnore) {
      console.log('🚫 [Impolite Peer] Ignoring offer collision from:', fromId);
      return;
    }

    // Polite peer는 롤백 후 수락
    if (offerCollision) {
      console.log('🔄 [Polite Peer] Rolling back to stable state');
      await Promise.all([
        pc.setLocalDescription({ type: 'rollback' }),
        pc.setRemoteDescription(new RTCSessionDescription(offer))
      ]);
    } else {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
    }

    // Pending ICE candidates 처리
    const pendingCandidates = this.pendingCandidates.get(fromId) || [];
    for (const candidate of pendingCandidates) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    this.pendingCandidates.set(fromId, []);

    // Answer 생성
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.signalingChannel.send({
      type: 'answer',
      to: fromId,
      from: this.userId,
      answer: pc.localDescription
    });
  }

  // ICE Candidate 처리 (Race condition 방지)
  async handleIceCandidate(fromId, candidate) {
    const pc = this.peerConnections.get(fromId);

    if (!pc) {
      console.warn('⚠️ [WebRTC] PeerConnection not found, queuing candidate');
      const queue = this.pendingCandidates.get(fromId) || [];
      queue.push(candidate);
      this.pendingCandidates.set(fromId, queue);
      return;
    }

    if (!pc.remoteDescription) {
      console.log('⏳ [WebRTC] Remote description not set, queuing candidate');
      const queue = this.pendingCandidates.get(fromId) || [];
      queue.push(candidate);
      this.pendingCandidates.set(fromId, queue);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ [WebRTC] ICE candidate added');
    } catch (error) {
      console.error('❌ [WebRTC] Failed to add ICE candidate:', error);
    }
  }

  // 자동 품질 조정 (TURN vs Direct)
  async adjustVideoQualityForRelay(pc, usingRelay) {
    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
    if (!sender) return;

    const params = sender.getParameters();
    if (!params.encodings || params.encodings.length === 0) {
      params.encodings = [{}];
    }

    if (usingRelay) {
      // TURN 릴레이: 500kbps (비용 절감)
      params.encodings[0].maxBitrate = 500000;
      params.encodings[0].scaleResolutionDownBy = 1.5;
      params.encodings[0].maxFramerate = 24;
      console.log('📉 [비용 절감] TURN 사용으로 인해 비디오 품질 자동 감소');
    } else {
      // 직접 연결: 1.5Mbps (고품질)
      params.encodings[0].maxBitrate = 1500000;
      params.encodings[0].scaleResolutionDownBy = 1.0;
      params.encodings[0].maxFramerate = 30;
      console.log('📈 [품질 복원] 직접 연결로 비디오 품질 자동 증가');
    }

    await sender.setParameters(params);
  }

  // 연결 건강 모니터링 (5초마다)
  startHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 5000);
  }

  async checkConnectionHealth() {
    for (const [peerId, pc] of this.peerConnections) {
      const connectionState = pc.connectionState;
      const iceConnectionState = pc.iceConnectionState;

      // 연결 실패 시 복구 시도
      if (
        connectionState === 'failed' ||
        connectionState === 'disconnected' ||
        iceConnectionState === 'failed' ||
        iceConnectionState === 'disconnected'
      ) {
        console.warn(`⚠️ [Health Check] Connection issue with ${peerId}, attempting recovery`);
        await this.recoverPeerConnection(peerId);
      }

      // 통계 수집
      if (connectionState === 'connected') {
        const stats = await this.getConnectionStats(pc);
        this.logConnectionStats(peerId, stats);
      }
    }
  }

  // 연결 통계 수집
  async getConnectionStats(pc) {
    const stats = await pc.getStats();
    const result = {
      rtt: null,
      packetLoss: null,
      bitrate: null,
      usingRelay: false
    };

    stats.forEach(report => {
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        result.rtt = report.currentRoundTripTime * 1000; // ms

        // TURN 릴레이 사용 여부
        if (report.localCandidateId && report.remoteCandidateId) {
          const localCandidate = stats.get(report.localCandidateId);
          const remoteCandidate = stats.get(report.remoteCandidateId);

          if (localCandidate?.candidateType === 'relay' ||
              remoteCandidate?.candidateType === 'relay') {
            result.usingRelay = true;
          }
        }
      }

      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        result.packetLoss = report.packetsLost || 0;
        result.bitrate = report.bytesReceived || 0;
      }
    });

    return result;
  }

  logConnectionStats(peerId, stats) {
    console.log(`📊 [WebRTC Stats] ${peerId}:`, {
      RTT: stats.rtt ? `${stats.rtt.toFixed(1)}ms` : 'N/A',
      PacketLoss: stats.packetLoss,
      Bitrate: stats.bitrate ? `${(stats.bitrate / 1000).toFixed(1)} kbps` : 'N/A',
      UsingRelay: stats.usingRelay ? 'TURN' : 'Direct'
    });
  }

  // 연결 복구
  async recoverPeerConnection(peerId) {
    console.log(`🔧 [WebRTC] Attempting to recover connection with ${peerId}`);

    const pc = this.peerConnections.get(peerId);
    if (!pc) return;

    try {
      // ICE 재시작
      if (this.isPolite(peerId)) {
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);

        this.signalingChannel.send({
          type: 'offer',
          to: peerId,
          from: this.userId,
          offer: pc.localDescription
        });

        console.log('🔄 [WebRTC] ICE restart offer sent');
      }
    } catch (error) {
      console.error('❌ [WebRTC] Recovery failed:', error);
      this.closePeerConnection(peerId);
    }
  }

  // 미디어 녹화 지원
  async startRecording(peerId, options = {}) {
    const stream = this.remoteStreams.get(peerId);
    if (!stream) {
      throw new Error(`No remote stream found for ${peerId}`);
    }

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: options.mimeType || 'video/webm;codecs=vp9',
      videoBitsPerSecond: options.videoBitsPerSecond || 2500000
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
      if (options.onComplete) {
        options.onComplete(blob);
      }
    };

    mediaRecorder.start(options.timeslice || 1000);

    return mediaRecorder;
  }

  // 정리
  cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    for (const [peerId, pc] of this.peerConnections) {
      this.closePeerConnection(peerId);
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.peerConnections.clear();
    this.remoteStreams.clear();
    this.pendingCandidates.clear();
  }
}

export default new WebRTCConnectionManager();
```

**사용 예시**:

```javascript
import webrtcManager from '@/services/webrtc';

// 초기화
await webrtcManager.initialize(currentUserId, signalingChannel);

// 동적 ICE 서버 로드
await webrtcManager.loadDynamicIceServers();

// 로컬 미디어 시작
const stream = await webrtcManager.startLocalMedia({
  video: { width: 1280, height: 720 },
  audio: true
});

// Peer 연결 생성
const pc = await webrtcManager.createPeerConnection(remotePeerId, true);

// Offer/Answer 처리
await webrtcManager.handleOffer(remotePeerId, offer);
await webrtcManager.handleAnswer(remotePeerId, answer);
await webrtcManager.handleIceCandidate(remotePeerId, candidate);

// 연결 건강 모니터링 시작
webrtcManager.startHealthMonitoring();

// 녹화 시작
const recorder = await webrtcManager.startRecording(remotePeerId, {
  mimeType: 'video/webm;codecs=vp9',
  onComplete: (blob) => {
    const url = URL.createObjectURL(blob);
    console.log('Recording saved:', url);
  }
});

// 정리
webrtcManager.cleanup();
```

**특징**:
- ✅ **Polite Peer 패턴**으로 Offer 충돌 자동 해결
- ✅ **동적 ICE 서버**로 STUN/TURN 서버 유연성
- ✅ **ICE 서버 정규화**로 Cloudflare 호환성 보장
- ✅ **자동 품질 조정**으로 비용 절감 (TURN 500kbps)
- ✅ **연결 건강 모니터링**으로 안정성 향상
- ✅ **통계 모니터링**으로 품질 추적
- ✅ **ICE 재시작**으로 연결 복구
- ✅ **미디어 녹화** 지원

---

### 🔔 Push Notifications

#### Push Notification Service

**파일**: `src/services/pushNotificationService.js` (250 lines)

**목적**: Service Worker 기반 푸시 알림 관리

**클래스**: `PushNotificationService` (싱글톤 패턴)

**주요 기능**:
- **Service Worker 등록**: `/sw.js` 자동 등록
- **Web Push API**: VAPID 키 기반 구독
- **권한 관리**: Notification API 권한 요청
- **서버 연동**: 구독 토큰 등록/해제

**핵심 메서드**:

```javascript
class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY ||
      'BEl62iUYgUivxIkv69yViEuiBIa40HI9stpCmHYWFiOqGdALABdJDgMAuWr6z-xIgXm6Z96hMkgp3XOKx5yHNO4';
  }

  // Service Worker 등록
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker를 지원하지 않는 브라우저입니다.');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ [Push] Service Worker 등록 완료:', this.registration.scope);

      // Service Worker 활성화 대기
      await navigator.serviceWorker.ready;
      console.log('✅ [Push] Service Worker 활성화 완료');

      return this.registration;
    } catch (error) {
      console.error('❌ [Push] Service Worker 등록 실패:', error);
      throw error;
    }
  }

  // 알림 권한 요청
  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('브라우저가 알림을 지원하지 않습니다.');
    }

    const permission = await Notification.requestPermission();
    console.log(`🔔 [Push] 알림 권한: ${permission}`);

    return permission;
  }

  // VAPID 공개키 변환
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // 푸시 구독
  async subscribeToPush() {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('푸시 알림 권한이 거부되었습니다.');
    }

    try {
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('✅ [Push] 푸시 구독 완료:', this.subscription.endpoint);

      // 서버에 구독 정보 전송
      await this.sendSubscriptionToServer();

      return this.subscription;
    } catch (error) {
      console.error('❌ [Push] 푸시 구독 실패:', error);
      throw error;
    }
  }

  // 서버에 구독 정보 전송
  async sendSubscriptionToServer() {
    if (!this.subscription) {
      throw new Error('구독 정보가 없습니다.');
    }

    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: this.subscription.toJSON(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        })
      });

      if (!response.ok) {
        throw new Error('서버에 구독 정보 전송 실패');
      }

      console.log('✅ [Push] 서버에 구독 정보 전송 완료');
    } catch (error) {
      console.error('❌ [Push] 서버 전송 실패:', error);
      throw error;
    }
  }

  // 푸시 구독 해제
  async unsubscribeFromPush() {
    if (!this.subscription) {
      console.warn('⚠️ [Push] 구독 정보가 없습니다.');
      return;
    }

    try {
      // 클라이언트 구독 해제
      await this.subscription.unsubscribe();
      console.log('✅ [Push] 푸시 구독 해제 완료');

      // 서버에 구독 해제 알림
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/api/v1/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          endpoint: this.subscription.endpoint
        })
      });

      this.subscription = null;
      console.log('✅ [Push] 서버 구독 해제 완료');
    } catch (error) {
      console.error('❌ [Push] 구독 해제 실패:', error);
      throw error;
    }
  }

  // 현재 구독 상태 확인
  async getSubscription() {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    this.subscription = await this.registration.pushManager.getSubscription();
    return this.subscription;
  }

  // 알림 권한 상태 확인
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }
}

export default new PushNotificationService();
```

**사용 예시**:

```javascript
import pushService from '@/services/pushNotificationService';

// Service Worker 등록
await pushService.registerServiceWorker();

// 권한 확인
const permission = pushService.getPermissionStatus();
console.log('Current permission:', permission);

// 푸시 구독
if (permission === 'default') {
  try {
    const subscription = await pushService.subscribeToPush();
    console.log('Subscribed:', subscription);
  } catch (error) {
    console.error('Subscription failed:', error);
  }
}

// 구독 상태 확인
const currentSub = await pushService.getSubscription();
if (currentSub) {
  console.log('Already subscribed:', currentSub.endpoint);
}

// 구독 해제
await pushService.unsubscribeFromPush();
```

**특징**:
- ✅ Service Worker 자동 등록
- ✅ VAPID 키 기반 보안 구독
- ✅ 서버 연동으로 중앙 관리
- ✅ 권한 상태 추적

---

### 🔄 Common Patterns

#### 1. Exponential Backoff 패턴

모든 WebSocket 서비스에서 사용하는 재연결 전략:

```javascript
class ExponentialBackoffExample {
  constructor() {
    this.reconnectAttempts = 0;
    this.reconnectDelayBase = 1000;   // 시작 지연
    this.reconnectDelayMax = 30000;   // 최대 지연
  }

  getReconnectDelay() {
    const delay = Math.min(
      this.reconnectDelayBase * Math.pow(2, this.reconnectAttempts),
      this.reconnectDelayMax
    );

    // Jitter 추가 (서버 부하 분산)
    return delay + Math.random() * 1000;
  }

  async reconnect() {
    this.reconnectAttempts++;
    const delay = this.getReconnectDelay();

    console.log(`🔄 ${delay}ms 후 재연결 시도... (${this.reconnectAttempts}회)`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('재연결 실패:', error);
        this.reconnect(); // 재귀 호출
      });
    }, delay);
  }
}
```

**진행 예시**:
- 1회: 1초 + 랜덤
- 2회: 2초 + 랜덤
- 3회: 4초 + 랜덤
- 4회: 8초 + 랜덤
- 5회: 16초 + 랜덤
- 6회: 30초 (최대)

---

#### 2. 메시지 큐잉 패턴

연결 해제 시 메시지 손실 방지:

```javascript
class MessageQueueExample {
  constructor() {
    this.messageQueue = [];
    this.isConnected = false;
  }

  send(destination, message) {
    if (this.isConnected && this.client) {
      // 즉시 전송
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
    } else {
      // 큐에 저장
      console.warn('⚠️ Not connected, message queued');
      this.messageQueue.push({ destination, message });
    }
  }

  onConnect() {
    this.isConnected = true;
    this.flushMessageQueue();
  }

  flushMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(`📤 ${this.messageQueue.length}개 큐 메시지 전송 중...`);

    while (this.messageQueue.length > 0) {
      const { destination, message } = this.messageQueue.shift();
      this.send(destination, message);
    }
  }
}
```

---

#### 3. 구독 재설정 패턴

재연결 시 모든 구독 자동 복구:

```javascript
class SubscriptionManagementExample {
  constructor() {
    this.activeSubscriptions = new Map();
  }

  subscribe(destination, callback) {
    // 구독 저장
    this.activeSubscriptions.set(destination, callback);

    if (this.isConnected && this.client) {
      const subscription = this.client.subscribe(destination, callback);
      return subscription;
    }
  }

  onConnect() {
    this.reestablishSubscriptions();
  }

  reestablishSubscriptions() {
    console.log(`🔄 ${this.activeSubscriptions.size}개 구독 재설정 중...`);

    this.activeSubscriptions.forEach((callback, destination) => {
      this.client.subscribe(destination, callback);
    });

    console.log('✅ 구독 재설정 완료');
  }
}
```

---

#### 4. 토큰 갱신 처리 패턴

인증 토큰 갱신 시 WebSocket 재연결:

```javascript
// 토큰 갱신 이벤트 발생 (API 인터셉터에서)
window.dispatchEvent(new Event('token-refreshed'));

// Service에서 리스너 등록
class TokenRefreshExample {
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('token-refreshed', this.handleTokenRefresh.bind(this));
    }
  }

  handleTokenRefresh() {
    console.log("🔄 Token refreshed, reconnecting...");

    if (this.client && this.isConnected) {
      this.disconnect();
    }

    this.reconnectAttempts = 0;
    this.connect().catch((error) => {
      console.error("Failed to reconnect after token refresh", error);
    });
  }
}
```

---

#### 5. Polite Peer 패턴 (WebRTC)

Offer 충돌 자동 해결:

```javascript
class PolitePeerExample {
  // userId 비교로 Polite/Impolite 결정
  isPolite(peerId) {
    return this.userId < peerId;
  }

  async handleOffer(fromId, offer) {
    const pc = this.peerConnections.get(fromId);

    // Offer 충돌 감지
    const offerCollision =
      pc.signalingState !== 'stable' ||
      this.makingOffer.get(fromId);

    // Impolite peer는 충돌 무시
    if (!this.isPolite(fromId) && offerCollision) {
      console.log('🚫 [Impolite] Ignoring collision');
      return;
    }

    // Polite peer는 롤백 후 수락
    if (this.isPolite(fromId) && offerCollision) {
      console.log('🔄 [Polite] Rolling back');
      await pc.setLocalDescription({ type: 'rollback' });
    }

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.sendAnswer(fromId, answer);
  }
}
```

---

#### 6. ICE Candidate 큐잉 패턴

remoteDescription 설정 전 candidate 손실 방지:

```javascript
class IceCandidateQueueExample {
  constructor() {
    this.pendingCandidates = new Map();
  }

  async handleIceCandidate(peerId, candidate) {
    const pc = this.peerConnections.get(peerId);

    if (!pc || !pc.remoteDescription) {
      // 큐에 저장
      console.log('⏳ Remote description not set, queuing candidate');
      const queue = this.pendingCandidates.get(peerId) || [];
      queue.push(candidate);
      this.pendingCandidates.set(peerId, queue);
      return;
    }

    // 즉시 추가
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  async setRemoteDescription(peerId, description) {
    const pc = this.peerConnections.get(peerId);
    await pc.setRemoteDescription(description);

    // Pending candidates 처리
    const pendingCandidates = this.pendingCandidates.get(peerId) || [];
    for (const candidate of pendingCandidates) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    this.pendingCandidates.set(peerId, []);
  }
}
```

---

## 🌐 WebSocket 연결

```javascript
// src/services/websocket.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  connect(token) {
    const socket = new SockJS(`${API_BASE_URL}/ws`);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log('WebSocket 연결 성공');
        this.subscribeToChannels();
      },
      (error) => {
        console.error('WebSocket 연결 실패:', error);
      }
    );
  }

  subscribeToChannels() {
    // 개인 메시지 구독
    this.stompClient.subscribe('/user/queue/messages', (message) => {
      const data = JSON.parse(message.body);
      // 메시지 처리
    });

    // 채팅방 메시지 구독
    this.stompClient.subscribe('/topic/chat/{roomId}', (message) => {
      const data = JSON.parse(message.body);
      // 채팅 메시지 처리
    });
  }

  sendMessage(destination, message) {
    this.stompClient.send(destination, {}, JSON.stringify(message));
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }
}

export default new WebSocketService();
```

## ⚠️ 주의사항 및 Best Practices

### 1. Zustand Selector 패턴 (CRITICAL)
- **절대 사용 금지**: 객체를 반환하는 selector
- **올바른 방법**: 각 값을 개별 selector로 선택
- **참조**: `docs/99-logs/failure-patterns/2025-01-13-zustand-infinite-loop.md`

### 2. API 통신
- JWT 토큰은 인터셉터가 자동 처리
- 에러 처리는 통합 에러 핸들러 사용
- 로딩 상태는 로컬 state로 관리

### 3. 스타일링
- 정의된 색상 팔레트만 사용
- 간격은 4px 배수 시스템 준수
- CommonButton 등 공통 컴포넌트 재사용
- Tailwind CSS 유틸리티 클래스 활용

### 4. 성능 최적화
- 이미지는 WebP 사용, 자동 리사이징
- Lazy loading 적용
- 불필요한 리렌더링 방지 (React.memo, useMemo, useCallback)
- 번들 크기 최적화

### 5. 중복 요청 방지 패턴 (2025-01-18 추가)

#### 5.1 useRef를 활용한 즉시 차단
```javascript
// ✅ CORRECT: useRef로 즉시 차단
import { useRef } from 'react';

const isProcessingRef = useRef(false);

const handleAction = async () => {
  // 1차 방어: 이미 처리 중인 경우 즉시 차단
  if (isProcessingRef.current) {
    log.warn('중복 요청 차단', null, 'CATEGORY');
    return;
  }

  isProcessingRef.current = true;  // 동기적으로 플래그 설정
  setIsProcessing(true);           // UI 표시용

  try {
    await doSomething();
  } catch (err) {
    isProcessingRef.current = false;  // 에러 시 플래그 해제
    throw err;
  }
};

// ❌ WRONG: useState만 사용 (비동기 업데이트로 중복 차단 실패)
const [isProcessing, setIsProcessing] = useState(false);

const handleAction = async () => {
  setIsProcessing(true);  // 비동기 업데이트 - 중복 클릭 차단 실패
  await doSomething();
};
```

#### 5.2 디바운싱 패턴
```javascript
const lastAttemptRef = useRef(null);
const DEBOUNCE_MS = 1000;

const handleAction = async () => {
  const now = Date.now();

  // 2차 방어: 짧은 시간 내 재요청 차단
  if (lastAttemptRef.current && (now - lastAttemptRef.current) < DEBOUNCE_MS) {
    log.warn('디바운스 차단', {
      lastAttempt: lastAttemptRef.current,
      currentAttempt: now,
      difference: now - lastAttemptRef.current
    }, 'CATEGORY');
    return;
  }

  lastAttemptRef.current = now;
  await doSomething();
};
```

#### 5.3 적용 예시 (SessionCreate.jsx)
```javascript
// 세션 생성 중복 방지 패턴
const isCreatingRef = useRef(false);
const creationTimestamp = useRef(null);

const handleCreateSession = async () => {
  const now = Date.now();

  // 1차: 생성 중 차단
  if (isCreatingRef.current) return;

  // 2차: 1초 이내 재클릭 차단
  if (creationTimestamp.current && (now - creationTimestamp.current) < 1000) {
    return;
  }

  isCreatingRef.current = true;
  creationTimestamp.current = now;
  setIsCreating(true);

  try {
    const roomData = await webrtcAPI.createRoom({...});
    setCreatedRoom(roomData);
  } catch (err) {
    isCreatingRef.current = false;  // 에러 시에만 플래그 해제
    setError(err.message);
  } finally {
    setIsCreating(false);
  }
};
```

#### 5.4 적용 대상
- 세션 생성 버튼
- 결제 요청 버튼
- 폼 제출 버튼
- API POST 요청
- 데이터 저장 액션
- **참조**: `docs/99-logs/failure-patterns/2025-01-18-session-duplicate-creation.md`

### 6. 에러 처리 Best Practice (2025-01-18 추가)

#### 6.1 사용자 친화적 에러 메시지
```javascript
// ✅ CORRECT: 상세한 에러 정보 + 복구 옵션
const [error, setError] = useState(null);

try {
  await fetchData();
} catch (err) {
  setError({
    message: err.response?.data?.message || err.message || '알 수 없는 오류',
    status: err.response?.status,
    canRetry: err.response?.status !== 403 && err.response?.status !== 401
  });

  // 이전 데이터 유지 (있는 경우)
  if (previousData.length > 0) {
    log.info('이전 데이터 유지', { count: previousData.length }, 'CATEGORY');
  }
}

// UI에 표시
{error && (
  <div className="error-banner">
    <AlertCircle />
    <div>
      <p>{error.message}</p>
      {error.status && <p>에러 코드: {error.status}</p>}
      {error.canRetry && (
        <button onClick={retry}>다시 시도</button>
      )}
    </div>
  </div>
)}

// ❌ WRONG: 에러 무시 또는 빈 화면
catch (err) {
  setData([]);  // 사용자에게 아무것도 보여주지 않음
}
```

#### 6.2 이전 데이터 유지 전략
```javascript
// 네트워크 에러 시에도 이전 데이터 유지
const [data, setData] = useState([]);
const [error, setError] = useState(null);

const loadData = async (isRetry = false) => {
  setError(null);

  try {
    const result = await fetchData();
    setData(result);
  } catch (err) {
    setError(err);

    // 이전 데이터 유지 (재시도가 아니고 데이터가 있는 경우)
    if (!isRetry && data.length > 0) {
      log.info('이전 데이터 유지', { count: data.length });
    } else {
      setData([]);
    }
  }
};
```

#### 6.3 상세 로깅
```javascript
// 작업 시작/완료 로깅
log.info('작업 시작', {
  params: { roomType, title },
  timestamp: Date.now()
}, 'CATEGORY');

try {
  const result = await doSomething();

  log.info('작업 완료', {
    result: { id: result.id, type: result.type },
    duration: Date.now() - start
  }, 'CATEGORY');

} catch (err) {
  log.error('작업 실패', err, 'CATEGORY', {
    params: { roomType, title },
    errorMessage: err.message,
    errorStatus: err.response?.status,
    duration: Date.now() - start
  });
}
```

## ✅ 개발 체크리스트

### 새 컴포넌트 개발 시
- [ ] 정의된 색상 팔레트만 사용
- [ ] 간격 시스템(4px 배수) 준수
- [ ] CommonButton 등 공통 컴포넌트 재사용
- [ ] Zustand selector는 개별 선택 패턴 사용
- [ ] 56px 버튼/입력 필드 높이
- [ ] 6px 기본 border-radius
- [ ] transition 효과 적용
- [ ] 반응형 디자인 고려
- [ ] 로딩/에러 상태 처리

### API 연동 시
- [ ] API 모듈 사용 (직접 axios 호출 금지)
- [ ] 에러 처리 구현
- [ ] 로딩 상태 관리
- [ ] 토큰 만료 처리 (인터셉터가 자동 처리)

---

*이 가이드는 STUDYMATE 프론트엔드 개발의 표준을 정의하며, 모든 개발자는 이 가이드를 준수해야 합니다. 문의사항은 프론트엔드 팀에게 연락하세요.*
