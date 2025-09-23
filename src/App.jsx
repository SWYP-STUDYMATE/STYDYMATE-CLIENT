import { Routes, Route } from 'react-router-dom';
import { lazyLoad } from './utils/lazyLoad';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { ToastManager } from './components/toast-manager.jsx';
// import NotificationToastManager from './components/NotificationToastManager';
import ServerStatusIndicator from './components/ServerStatusIndicator';
import { AlertProvider, useAlert, setupGlobalAlert } from './hooks/useAlert.jsx';
import { initializeNotificationWebSocket } from './services/notificationWebSocket';
import { initializePushNotifications } from './services/pushNotificationService';
import { useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingProtectedRoute from './components/OnboardingProtectedRoute';

// 즉시 로드가 필요한 컴포넌트들 (로그인, 메인)
import Login from './pages/Login/Login';
import Main from './pages/Main';

// 레이지 로드 컴포넌트들
const Navercallback = lazyLoad(() => import('./pages/Login/Navercallback'));
const GoogleCallback = lazyLoad(() => import('./pages/Login/GoogleCallback'));
const Agreement = lazyLoad(() => import('./pages/Login/Agreement'));
const SignupComplete = lazyLoad(() => import('./pages/Login/SignupComplete'));
const OnboardingInfoRouter = lazyLoad(() => import('./pages/ObInfo/ObInfoRouter'));
const ObLangRouter = lazyLoad(() => import('./pages/ObLang/ObLangRouter'));
const ObIntRouter = lazyLoad(() => import('./pages/ObInt/ObIntRouter'));
const ObPartnerRouter = lazyLoad(() => import('./pages/ObPartner/ObPartnerRouter'));
const ObScheduleRouter = lazyLoad(() => import('./pages/ObSchadule/ObSchaduleRouter'));
const ChatPage = lazyLoad(() => import('./pages/Chat/ChatPage'));
const LevelTestStart = lazyLoad(() => import('./pages/LevelTest/LevelTestStart'));
const LevelTestCheck = lazyLoad(() => import('./pages/LevelTest/LevelTestCheck'));
const LevelTestRecording = lazyLoad(() => import('./pages/LevelTest/LevelTestRecording'));
const LevelTestComplete = lazyLoad(() => import('./pages/LevelTest/LevelTestComplete'));
const LevelTestResult = lazyLoad(() => import('./pages/LevelTest/LevelTestResult'));
const Schedule = lazyLoad(() => import('./pages/Schedule/Schedule'));
const AudioConnectionCheck = lazyLoad(() => import('./pages/Session/AudioConnectionCheck'));
const AnalyticsPage = lazyLoad(() => import('./pages/Analytics/AnalyticsPage'));
const VideoSessionRoom = lazyLoad(() => import('./pages/Session/VideoSessionRoom'));
const VideoConnectionCheck = lazyLoad(() => import('./pages/Session/VideoSessionCheck'));
const AudioSessionRoom = lazyLoad(() => import('./pages/Session/AudioSessionRoom'));
const ProfilePage = lazyLoad(() => import('./pages/Profile/ProfilePage'));
const VideoControlsDemo = lazyLoad(() => import('./pages/Session/VideoControlsDemo'));
const SessionList = lazyLoad(() => import('./pages/Session/SessionList'));
const SessionCreate = lazyLoad(() => import('./pages/Session/SessionCreate'));
const SessionCalendar = lazyLoad(() => import('./pages/Session/SessionCalendar'));
const SessionScheduleNew = lazyLoad(() => import('./pages/Session/SessionScheduleNew'));
const MatchingMain = lazyLoad(() => import('./pages/Matching/MatchingMain'));
const MatchingProfile = lazyLoad(() => import('./pages/Matching/MatchingProfile'));

// Settings pages
const SettingsMain = lazyLoad(() => import('./pages/Settings/SettingsMain'));
const AccountSettings = lazyLoad(() => import('./pages/Settings/AccountSettings'));
const NotificationSettings = lazyLoad(() => import('./pages/Settings/NotificationSettings'));
const PrivacySettings = lazyLoad(() => import('./pages/Settings/PrivacySettings'));
const SecuritySettings = lazyLoad(() => import('./pages/Settings/SecuritySettings'));
const LanguageSettings = lazyLoad(() => import('./pages/Settings/LanguageSettings'));
const DataSettings = lazyLoad(() => import('./pages/Settings/DataSettings'));
const LoginHistory = lazyLoad(() => import('./pages/Settings/LoginHistory'));
const DeleteAccount = lazyLoad(() => import('./pages/Settings/DeleteAccount'));

// Notification pages
const NotificationCenter = lazyLoad(() => import('./pages/Notifications/NotificationCenter'));
const NotificationList = lazyLoad(() => import('./pages/Notifications/NotificationList'));

// Achievement pages
const AchievementsPage = lazyLoad(() => import('./pages/Achievements/AchievementsPage'));

// Mates pages
const MatesPage = lazyLoad(() => import('./pages/Mates/MatesPage'));

// AlertProvider를 포함한 AppContent 컴포넌트
function AppContent() {
  const alertHook = useAlert();


  // 전역 alert 함수 설정
  useEffect(() => {
    setupGlobalAlert(alertHook);
  }, [alertHook]);

  // 알림 시스템 초기화
  useEffect(() => {
    const initializeNotificationServices = async () => {
      try {
        // 로그인된 사용자인 경우에만 초기화
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          // WebSocket 알림 서비스 초기화
          await initializeNotificationWebSocket();
          console.log('Notification WebSocket initialized');

          // 푸시 알림 서비스 초기화
          await initializePushNotifications();
          console.log('Push notification service initialized');
        }
      } catch (error) {
        console.error('Failed to initialize notification services:', error);
      }
    };

    initializeNotificationServices();
  }, []);

  return (
    <ErrorBoundary>
      <ServerStatusIndicator />
      <ToastManager />
      {/* <NotificationToastManager /> */}
      <Layout>
        <Routes>
        {/* 공개 라우트 (로그인 불필요) */}
        <Route path='/' element={<Login />} />
        <Route path='/login/oauth2/code/naver' element={<Navercallback />} />
        <Route path='/login/oauth2/code/google' element={<GoogleCallback />} />
        <Route path='/agreement' element={<Agreement />} />
        <Route path='/signup-complete' element={<SignupComplete />} />

        {/* 보호된 라우트 - 온보딩 관련 (로그인만 필요) */}
        <Route path='/onboarding-info/:step' element={<OnboardingInfoRouter />} />
        <Route path='/onboarding-lang/:step' element={<ObLangRouter />} />
        <Route path='/onboarding-int/:step' element={<ObIntRouter />} />
        <Route path='/onboarding-partner/:step' element={<ObPartnerRouter />} />
        <Route path='/onboarding-schedule/:step' element={<ObScheduleRouter />} />

        {/* 보호된 라우트 - 온보딩 완료 필요 */}
        <Route path='/main' element={<OnboardingProtectedRoute><Main /></OnboardingProtectedRoute>} />
        <Route path="/chat" element={<OnboardingProtectedRoute><ChatPage /></OnboardingProtectedRoute>} />
        <Route path='/level-test' element={<OnboardingProtectedRoute><LevelTestStart /></OnboardingProtectedRoute>} />
        <Route path='/level-test/check' element={<OnboardingProtectedRoute><LevelTestCheck /></OnboardingProtectedRoute>} />
        <Route path='/level-test/recording' element={<OnboardingProtectedRoute><LevelTestRecording /></OnboardingProtectedRoute>} />
        {/* Alias routes for documentation compatibility */}
        <Route path='/level-test/connection' element={<OnboardingProtectedRoute><LevelTestCheck /></OnboardingProtectedRoute>} />
        <Route path='/level-test/question/:id' element={<OnboardingProtectedRoute><LevelTestRecording /></OnboardingProtectedRoute>} />
        <Route path='/level-test/complete' element={<OnboardingProtectedRoute><LevelTestComplete /></OnboardingProtectedRoute>} />
        <Route path='/level-test/result' element={<OnboardingProtectedRoute><LevelTestResult /></OnboardingProtectedRoute>} />
        <Route path='/schedule' element={<OnboardingProtectedRoute><Schedule /></OnboardingProtectedRoute>} />
        <Route path='/session' element={<OnboardingProtectedRoute><SessionList /></OnboardingProtectedRoute>} />
        <Route path='/session/audio-check' element={<OnboardingProtectedRoute><AudioConnectionCheck /></OnboardingProtectedRoute>} />
        <Route path='/session/video/:roomId' element={<OnboardingProtectedRoute><VideoSessionRoom /></OnboardingProtectedRoute>} />
        <Route path='/session/video-check' element={<OnboardingProtectedRoute><VideoConnectionCheck /></OnboardingProtectedRoute>} />
        <Route path='/session/audio/:roomId' element={<OnboardingProtectedRoute><AudioSessionRoom /></OnboardingProtectedRoute>} />
        <Route path='/session/video-controls-demo' element={<OnboardingProtectedRoute><VideoControlsDemo /></OnboardingProtectedRoute>} />
        <Route path='/profile' element={<OnboardingProtectedRoute><ProfilePage /></OnboardingProtectedRoute>} />
        <Route path='/sessions' element={<OnboardingProtectedRoute><SessionList /></OnboardingProtectedRoute>} />
        <Route path='/sessions/create' element={<OnboardingProtectedRoute><SessionCreate /></OnboardingProtectedRoute>} />
        <Route path='/sessions/calendar' element={<OnboardingProtectedRoute><SessionCalendar /></OnboardingProtectedRoute>} />
        <Route path='/session/schedule/new' element={<OnboardingProtectedRoute><SessionScheduleNew /></OnboardingProtectedRoute>} />
        <Route path='/matching' element={<OnboardingProtectedRoute><MatchingMain /></OnboardingProtectedRoute>} />
        <Route path='/matching/profile/:userId' element={<OnboardingProtectedRoute><MatchingProfile /></OnboardingProtectedRoute>} />
        <Route path='/analytics' element={<OnboardingProtectedRoute><AnalyticsPage /></OnboardingProtectedRoute>} />

        {/* Settings Routes - 온보딩 완료 필요 */}
        <Route path='/settings' element={<OnboardingProtectedRoute><SettingsMain /></OnboardingProtectedRoute>} />
        <Route path='/settings/account' element={<OnboardingProtectedRoute><AccountSettings /></OnboardingProtectedRoute>} />
        <Route path='/settings/notifications' element={<OnboardingProtectedRoute><NotificationSettings /></OnboardingProtectedRoute>} />
        <Route path='/settings/privacy' element={<OnboardingProtectedRoute><PrivacySettings /></OnboardingProtectedRoute>} />
        <Route path='/settings/security' element={<OnboardingProtectedRoute><SecuritySettings /></OnboardingProtectedRoute>} />
        <Route path='/settings/language' element={<OnboardingProtectedRoute><LanguageSettings /></OnboardingProtectedRoute>} />
        <Route path='/settings/data' element={<OnboardingProtectedRoute><DataSettings /></OnboardingProtectedRoute>} />
        <Route path='/settings/login-history' element={<OnboardingProtectedRoute><LoginHistory /></OnboardingProtectedRoute>} />
        <Route path='/settings/delete-account' element={<OnboardingProtectedRoute><DeleteAccount /></OnboardingProtectedRoute>} />

        {/* Notification Routes - 온보딩 완료 필요 */}
        <Route path='/notifications' element={<OnboardingProtectedRoute><NotificationList /></OnboardingProtectedRoute>} />
        <Route path='/notifications/center' element={<OnboardingProtectedRoute><NotificationCenter /></OnboardingProtectedRoute>} />

        {/* Achievement Routes - 온보딩 완료 필요 */}
        <Route path='/achievements' element={<OnboardingProtectedRoute><AchievementsPage /></OnboardingProtectedRoute>} />

        {/* Mates Routes - 온보딩 완료 필요 */}
        <Route path='/mates' element={<OnboardingProtectedRoute><MatesPage /></OnboardingProtectedRoute>} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

// 메인 App 컴포넌트 - AlertProvider로 래핑
export default function App() {
  return (
    <AlertProvider>
      <AppContent />
    </AlertProvider>
  );
}
