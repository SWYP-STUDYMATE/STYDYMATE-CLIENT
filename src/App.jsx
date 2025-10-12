import { Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastManager } from './components/toast-manager.jsx';
// import NotificationToastManager from './components/NotificationToastManager';
import ServerStatusIndicator from './components/ServerStatusIndicator';
import { AlertProvider, useAlert, setupGlobalAlert } from './hooks/useAlert.jsx';
import { initializeNotificationWebSocket } from './services/notificationWebSocket';
import { initializePushNotifications } from './services/pushNotificationService';
import { useEffect } from 'react';
import { getToken, isAutoLoginEnabled, clearTokens } from './utils/tokenStorage';
import RouteRenderer from './components/RouteRenderer';

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
        const accessToken = getToken('accessToken');
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

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isAutoLoginEnabled()) {
        clearTokens();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <ErrorBoundary>
      <ServerStatusIndicator />
      <ToastManager />
      {/* <NotificationToastManager /> */}
      <Routes>
        <RouteRenderer />
      </Routes>
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
