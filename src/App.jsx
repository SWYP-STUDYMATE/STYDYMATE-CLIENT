import { Routes, Route } from 'react-router-dom';
import { lazyLoad } from './utils/lazyLoad';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { ToastManager } from './components/Toast';
import NotificationToastManager from './components/NotificationToastManager';
import ServerStatusIndicator from './components/ServerStatusIndicator';
import { AlertProvider, useAlert, setupGlobalAlert } from './hooks/useAlert.jsx';
// import { isMockMode, showMockModeBanner } from './api/mockApi';
import { initializeNotificationWebSocket } from './services/notificationWebSocket';
import { initializePushNotifications } from './services/pushNotificationService';
import { useEffect } from 'react';

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

  // Mock 모드 배너를 전역적으로 적용
  // useEffect(() => {
  //   if (isMockMode()) {
  //     showMockModeBanner();
  //   }
  // }, []);

  // Mock 모드 배너: 개발 환경에서만 동적 import (prod 빌드 안전)
useEffect(() => {
  if (!import.meta.env.DEV) return;
  let mounted = true;
  (async () => {
    try {
      const mod = await import('./api/mockApi'); 
      if (!mounted) return;
      const isMockMode = mod?.isMockMode ?? (() => false);
      const showMockModeBanner = mod?.showMockModeBanner ?? (() => {});
      if (isMockMode()) showMockModeBanner();
    } catch (_) {
      
    }
  })();
  return () => { mounted = false; };
}, []);

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
      <NotificationToastManager />
      <Layout>
        <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login/oauth2/code/naver' element={<Navercallback />} />
        <Route path='/login/oauth2/code/google' element={<GoogleCallback />} />
        <Route path='/agreement' element={<Agreement />} />
        <Route path='/signup-complete' element={<SignupComplete />} />
        <Route path='/main' element={<Main />} />
        <Route path='/onboarding-info/:step' element={<OnboardingInfoRouter />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path='/onboarding-lang/:step' element={<ObLangRouter />} />
        <Route path='/onboarding-int/:step' element={<ObIntRouter />} />
        <Route path='/onboarding-partner/:step' element={<ObPartnerRouter />} />
        <Route path='/onboarding-schedule/:step' element={<ObScheduleRouter />} />
        <Route path='/level-test' element={<LevelTestStart />} />
        <Route path='/level-test/check' element={<LevelTestCheck />} />
        <Route path='/level-test/recording' element={<LevelTestRecording />} />
        {/* Alias routes for documentation compatibility */}
        <Route path='/level-test/connection' element={<LevelTestCheck />} />
        <Route path='/level-test/question/:id' element={<LevelTestRecording />} />
        <Route path='/level-test/complete' element={<LevelTestComplete />} />
        <Route path='/level-test/result' element={<LevelTestResult />} />
        <Route path='/schedule' element={<Schedule />} />
        <Route path='/session' element={<SessionList />} />
        <Route path='/session/audio-check' element={<AudioConnectionCheck />} />
        <Route path='/session/video/:roomId' element={<VideoSessionRoom />} />
        <Route path='/session/video-check' element={<VideoConnectionCheck />} />
        <Route path='/session/audio/:roomId' element={<AudioSessionRoom />} />
        <Route path='/session/video-controls-demo' element={<VideoControlsDemo />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/sessions' element={<SessionList />} />
        <Route path='/sessions/create' element={<SessionCreate />} />
        <Route path='/sessions/calendar' element={<SessionCalendar />} />
        <Route path='/session/schedule/new' element={<SessionScheduleNew />} />
        <Route path='/matching' element={<MatchingMain />} />
        <Route path='/matching/profile/:userId' element={<MatchingProfile />} />
        <Route path='/analytics' element={<AnalyticsPage />} />
        
        {/* Settings Routes */}
        <Route path='/settings' element={<SettingsMain />} />
        <Route path='/settings/account' element={<AccountSettings />} />
        <Route path='/settings/notifications' element={<NotificationSettings />} />
        <Route path='/settings/privacy' element={<PrivacySettings />} />
        <Route path='/settings/security' element={<SecuritySettings />} />
        <Route path='/settings/language' element={<LanguageSettings />} />
        <Route path='/settings/data' element={<DataSettings />} />
        <Route path='/settings/login-history' element={<LoginHistory />} />
        <Route path='/settings/delete-account' element={<DeleteAccount />} />
        
        {/* Notification Routes */}
        <Route path='/notifications' element={<NotificationList />} />
        <Route path='/notifications/center' element={<NotificationCenter />} />
        
        {/* Achievement Routes */}
        <Route path='/achievements' element={<AchievementsPage />} />
        
        {/* Mates Routes */}
        <Route path='/mates' element={<MatesPage />} />
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