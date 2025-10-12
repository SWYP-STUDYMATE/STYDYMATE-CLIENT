/**
 * 라우트 설정 파일
 * 모든 라우트 정보를 중앙에서 관리
 */

// 즉시 로드가 필요한 컴포넌트들
import Login from '../pages/Login/Login';
import Main from '../pages/Main';

// 레이지 로드 컴포넌트들 import
import { lazyLoad } from '../utils/lazyLoad';

// OAuth 콜백
const Navercallback = lazyLoad(() => import('../pages/Login/Navercallback'));
const GoogleCallback = lazyLoad(() => import('../pages/Login/GoogleCallback'));
const Agreement = lazyLoad(() => import('../pages/Login/Agreement'));
const SignupComplete = lazyLoad(() => import('../pages/Login/SignupComplete'));

// 온보딩
const OnboardingInfoRouter = lazyLoad(() => import('../pages/ObInfo/ObInfoRouter'));
const ObLangRouter = lazyLoad(() => import('../pages/ObLang/ObLangRouter'));
const ObIntRouter = lazyLoad(() => import('../pages/ObInt/ObIntRouter'));
const ObPartnerRouter = lazyLoad(() => import('../pages/ObPartner/ObPartnerRouter'));
const ObScheduleRouter = lazyLoad(() => import('../pages/ObSchadule/ObSchaduleRouter'));

// 레벨 테스트
const LevelTestStart = lazyLoad(() => import('../pages/LevelTest/LevelTestStart'));
const LevelTestCheck = lazyLoad(() => import('../pages/LevelTest/LevelTestCheck'));
const LevelTestRecording = lazyLoad(() => import('../pages/LevelTest/LevelTestRecording'));
const LevelTestComplete = lazyLoad(() => import('../pages/LevelTest/LevelTestComplete'));
const LevelTestResult = lazyLoad(() => import('../pages/LevelTest/LevelTestResult'));

// 세션
const AudioConnectionCheck = lazyLoad(() => import('../pages/Session/AudioConnectionCheck'));
const VideoSessionRoom = lazyLoad(() => import('../pages/Session/VideoSessionRoom'));
const VideoConnectionCheck = lazyLoad(() => import('../pages/Session/VideoSessionCheck'));
const AudioSessionRoom = lazyLoad(() => import('../pages/Session/AudioSessionRoom'));
const VideoControlsDemo = lazyLoad(() => import('../pages/Session/VideoControlsDemo'));
const SessionList = lazyLoad(() => import('../pages/Session/SessionList'));
const SessionCreate = lazyLoad(() => import('../pages/Session/SessionCreate'));
const SessionCalendar = lazyLoad(() => import('../pages/Session/SessionCalendar'));
const SessionScheduleNew = lazyLoad(() => import('../pages/Session/SessionScheduleNew'));

// 메인 앱
const ChatPage = lazyLoad(() => import('../pages/Chat/ChatPage'));
const Schedule = lazyLoad(() => import('../pages/Schedule/Schedule'));
const ProfilePage = lazyLoad(() => import('../pages/Profile/ProfilePage'));
const AnalyticsPage = lazyLoad(() => import('../pages/Analytics/AnalyticsPage'));
const MatchingMain = lazyLoad(() => import('../pages/Matching/MatchingMain'));
const MatchingProfile = lazyLoad(() => import('../pages/Matching/MatchingProfile'));

// 설정
const SettingsMain = lazyLoad(() => import('../pages/Settings/SettingsMain'));
const AccountSettings = lazyLoad(() => import('../pages/Settings/AccountSettings'));
const NotificationSettings = lazyLoad(() => import('../pages/Settings/NotificationSettings'));
const PrivacySettings = lazyLoad(() => import('../pages/Settings/PrivacySettings'));
const SecuritySettings = lazyLoad(() => import('../pages/Settings/SecuritySettings'));
const LanguageSettings = lazyLoad(() => import('../pages/Settings/LanguageSettings'));
const DataSettings = lazyLoad(() => import('../pages/Settings/DataSettings'));
const LoginHistory = lazyLoad(() => import('../pages/Settings/LoginHistory'));
const DeleteAccount = lazyLoad(() => import('../pages/Settings/DeleteAccount'));

// 알림
const NotificationCenter = lazyLoad(() => import('../pages/Notifications/NotificationCenter'));
const NotificationList = lazyLoad(() => import('../pages/Notifications/NotificationList'));

// 기타
const AchievementsPage = lazyLoad(() => import('../pages/Achievements/AchievementsPage'));
const MatesPage = lazyLoad(() => import('../pages/Mates/MatesPage'));

/**
 * 라우트 타입 정의
 * - public: 인증 불필요
 * - auth: 로그인만 필요 (온보딩 미완료 허용)
 * - protected: 로그인 + 온보딩 완료 필요
 */
export const ROUTE_TYPES = {
  PUBLIC: 'public',
  AUTH: 'auth',
  PROTECTED: 'protected',
};

/**
 * 라우트 설정 배열
 */
export const routes = [
  // ========== 공개 라우트 (로그인 불필요) ==========
  {
    path: '/',
    component: Login,
    type: ROUTE_TYPES.PUBLIC,
    layout: false,
    exact: true,
  },
  {
    path: '/login/oauth2/code/naver',
    component: Navercallback,
    type: ROUTE_TYPES.PUBLIC,
    layout: false,
  },
  {
    path: '/login/oauth2/code/google',
    component: GoogleCallback,
    type: ROUTE_TYPES.PUBLIC,
    layout: false,
  },
  {
    path: '/agreement',
    component: Agreement,
    type: ROUTE_TYPES.PUBLIC,
    layout: false,
  },
  {
    path: '/signup-complete',
    component: SignupComplete,
    type: ROUTE_TYPES.PUBLIC,
    layout: false,
  },

  // ========== 온보딩 라우트 (로그인만 필요) ==========
  {
    path: '/onboarding-info/:step',
    component: OnboardingInfoRouter,
    type: ROUTE_TYPES.AUTH,
    layout: false,
  },
  {
    path: '/onboarding-lang/:step',
    component: ObLangRouter,
    type: ROUTE_TYPES.AUTH,
    layout: false,
  },
  {
    path: '/onboarding-int/:step',
    component: ObIntRouter,
    type: ROUTE_TYPES.AUTH,
    layout: false,
  },
  {
    path: '/onboarding-partner/:step',
    component: ObPartnerRouter,
    type: ROUTE_TYPES.AUTH,
    layout: false,
  },
  {
    path: '/onboarding-schedule/:step',
    component: ObScheduleRouter,
    type: ROUTE_TYPES.AUTH,
    layout: false,
  },

  // ========== 레벨 테스트 (온보딩 완료 필요, Layout 없음) ==========
  {
    path: '/level-test',
    component: LevelTestStart,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },
  {
    path: '/level-test/check',
    component: LevelTestCheck,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },
  {
    path: '/level-test/recording',
    component: LevelTestRecording,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },
  {
    path: '/level-test/connection',
    component: LevelTestCheck,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },
  {
    path: '/level-test/question/:id',
    component: LevelTestRecording,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },
  {
    path: '/level-test/complete',
    component: LevelTestComplete,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },
  {
    path: '/level-test/result',
    component: LevelTestResult,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },

  // ========== 세션 (온보딩 완료 필요, Layout 없음) ==========
  {
    path: '/session/audio-check',
    component: AudioConnectionCheck,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },
  {
    path: '/session/video/:roomId',
    component: VideoSessionRoom,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },
  {
    path: '/session/video-check',
    component: VideoConnectionCheck,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },
  {
    path: '/session/audio/:roomId',
    component: AudioSessionRoom,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },
  {
    path: '/session/video-controls-demo',
    component: VideoControlsDemo,
    type: ROUTE_TYPES.PROTECTED,
    layout: false,
  },

  // ========== 메인 앱 (온보딩 완료 필요, Layout 포함) ==========
  {
    path: '/main',
    component: Main,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/chat',
    component: ChatPage,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/schedule',
    component: Schedule,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/session',
    component: SessionList,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/profile',
    component: ProfilePage,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/sessions',
    component: SessionList,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/sessions/create',
    component: SessionCreate,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/sessions/calendar',
    component: SessionCalendar,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/session/schedule/new',
    component: SessionScheduleNew,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/matching',
    component: MatchingMain,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/matching/profile/:userId',
    component: MatchingProfile,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/analytics',
    component: AnalyticsPage,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },

  // ========== 설정 (온보딩 완료 필요, Layout 포함) ==========
  {
    path: '/settings',
    component: SettingsMain,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/settings/account',
    component: AccountSettings,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/settings/notifications',
    component: NotificationSettings,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/settings/privacy',
    component: PrivacySettings,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/settings/security',
    component: SecuritySettings,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/settings/language',
    component: LanguageSettings,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/settings/data',
    component: DataSettings,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/settings/login-history',
    component: LoginHistory,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/settings/delete-account',
    component: DeleteAccount,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },

  // ========== 알림 (온보딩 완료 필요, Layout 포함) ==========
  {
    path: '/notifications',
    component: NotificationList,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/notifications/center',
    component: NotificationCenter,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },

  // ========== 기타 (온보딩 완료 필요, Layout 포함) ==========
  {
    path: '/achievements',
    component: AchievementsPage,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
  {
    path: '/mates',
    component: MatesPage,
    type: ROUTE_TYPES.PROTECTED,
    layout: true,
  },
];
