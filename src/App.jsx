import { Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastManager } from './components/toast-manager.jsx';
// import NotificationToastManager from './components/NotificationToastManager';
import ServerStatusIndicator from './components/ServerStatusIndicator';
import { AlertProvider, useAlert, setupGlobalAlert } from './hooks/useAlert.jsx';
import { initializeNotificationWebSocket } from './services/notificationWebSocket';
import { initializePushNotifications } from './services/pushNotificationService';
import { useEffect, useMemo } from 'react';
import { getToken, isAutoLoginEnabled } from './utils/tokenStorage';
import renderRoutes from './components/RouteRenderer';

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

  // 자동 로그인 비활성화 시 브라우저 탭 종료 시에만 토큰 삭제
  // 주의: beforeunload는 새로고침도 감지하므로 사용하지 않음
  // 대신 sessionStorage는 탭 종료 시 자동으로 삭제됨
  useEffect(() => {
    // 자동 로그인이 활성화되지 않은 경우 sessionStorage 사용
    // sessionStorage는 탭이 닫힐 때 자동으로 삭제되므로 별도 처리 불필요
    if (!isAutoLoginEnabled()) {
      // 이미 tokenStorage.js에서 sessionStorage 사용 중
      console.log('자동 로그인 비활성화: sessionStorage 사용 (탭 종료 시 자동 삭제)');
    }
  }, []);

  // Route elements를 메모이제이션하여 매 렌더마다 재생성 방지
  const routeElements = useMemo(() => renderRoutes(), []);

  return (
    <ErrorBoundary>
      <ServerStatusIndicator />
      <ToastManager />
      {/* <NotificationToastManager /> */}
      <Routes>{routeElements}</Routes>
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
