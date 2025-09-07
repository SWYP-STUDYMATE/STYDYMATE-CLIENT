import { lazy } from 'react';

/**
 * 지연 로딩 컴포넌트 래퍼
 * @param {Function} importFn - dynamic import 함수
 * @param {Object} options - 옵션
 * @param {number} options.delay - 최소 로딩 지연 시간 (ms)
 * @param {Function} options.fallback - 에러 발생시 폴백 컴포넌트
 */
export const createLazyComponent = (importFn, { delay = 0, fallback = null } = {}) => {
  const LazyComponent = lazy(() => {
    return Promise.all([
      importFn(),
      // 최소 지연 시간 보장 (로딩 스피너가 너무 빨리 사라지는 것 방지)
      delay > 0 ? new Promise(resolve => setTimeout(resolve, delay)) : Promise.resolve()
    ]).then(([moduleExports]) => moduleExports);
  });

  // 에러 경계가 있는 경우 폴백 컴포넌트 적용
  if (fallback) {
    LazyComponent.fallback = fallback;
  }

  return LazyComponent;
};

/**
 * 페이지 컴포넌트들의 지연 로딩
 */
// 메인 페이지들
export const LazyMainPage = createLazyComponent(
  () => import('../pages/Main'), 
  { delay: 200 }
);

export const LazyLoginPage = createLazyComponent(
  () => import('../pages/Login/Login')
);

export const LazyChatPage = createLazyComponent(
  () => import('../pages/Chat/ChatPage'),
  { delay: 100 }
);

export const LazyProfilePage = createLazyComponent(
  () => import('../pages/Profile/ProfilePage')
);

export const LazyAnalyticsPage = createLazyComponent(
  () => import('../pages/Analytics/AnalyticsPage'),
  { delay: 150 }
);

export const LazyNotificationCenter = createLazyComponent(
  () => import('../pages/Notifications/NotificationCenter')
);

// 온보딩 관련 페이지들
export const LazyOnboardingPage = createLazyComponent(
  () => import('../pages/Onboarding/OnboardingPage')
);

export const LazyAgreementPage = createLazyComponent(
  () => import('../pages/Agreement/AgreementPage')
);

export const LazySignupCompletePage = createLazyComponent(
  () => import('../pages/SignupComplete/SignupCompletePage')
);

// 기능별 컴포넌트들
export const LazyMatchingPage = createLazyComponent(
  () => import('../pages/Matching/MatchingPage')
);

export const LazyAchievementPage = createLazyComponent(
  () => import('../pages/Achievement/AchievementPage')
);

export const LazyGroupSessionPage = createLazyComponent(
  () => import('../pages/GroupSession/GroupSessionPage')
);

/**
 * 큰 컴포넌트들의 지연 로딩
 */
export const LazyWebRTCComponent = createLazyComponent(
  () => import('../components/webrtc/WebRTCComponent'),
  { delay: 200 }
);

export const LazyRealtimeSubtitles = createLazyComponent(
  () => import('../components/RealtimeSubtitles')
);

export const LazyAnalyticsCharts = createLazyComponent(
  () => import('../components/analytics/AnalyticsCharts'),
  { delay: 300 }
);

export const LazyChatSidebar = createLazyComponent(
  () => import('../components/chat/Sidebar')
);

/**
 * 유틸리티 라이브러리들의 지연 로딩
 */
export const loadEmojiPicker = () => 
  import('emoji-picker-react').then(module => module.default);

export const loadChartLibrary = () =>
  import('recharts').then(module => ({
    LineChart: module.LineChart,
    BarChart: module.BarChart,
    PieChart: module.PieChart,
    XAxis: module.XAxis,
    YAxis: module.YAxis,
    CartesianGrid: module.CartesianGrid,
    Tooltip: module.Tooltip,
    Legend: module.Legend,
    ResponsiveContainer: module.ResponsiveContainer
  }));

export const loadDateLibrary = () =>
  import('date-fns').then(module => ({
    format: module.format,
    formatDistance: module.formatDistance,
    isToday: module.isToday,
    isYesterday: module.isYesterday,
    parseISO: module.parseISO
  }));

/**
 * 기능별 청크 분리
 */
export const loadTranslationModule = () =>
  import('../modules/translation').catch(() => ({
    translate: (text) => Promise.resolve(text),
    detectLanguage: (text) => Promise.resolve('en')
  }));

export const loadAudioModule = () =>
  import('../modules/audio').catch(() => ({
    startRecording: () => Promise.reject('Audio module not available'),
    stopRecording: () => Promise.reject('Audio module not available')
  }));

export const loadVideoModule = () =>
  import('../modules/video').catch(() => ({
    startVideo: () => Promise.reject('Video module not available'),
    stopVideo: () => Promise.reject('Video module not available')
  }));

/**
 * 조건부 로딩을 위한 헬퍼 함수들
 */
export const loadComponentIf = (condition, importFn) => {
  if (!condition) {
    return Promise.resolve({ default: () => null });
  }
  return importFn();
};

export const loadModuleOnUserAction = (importFn) => {
  let modulePromise = null;
  
  return () => {
    if (!modulePromise) {
      modulePromise = importFn();
    }
    return modulePromise;
  };
};

/**
 * 프리로딩을 위한 함수들
 */
export const preloadCriticalPages = () => {
  // 중요한 페이지들을 미리 로드
  const criticalPages = [
    () => import('../pages/Main'),
    () => import('../pages/Chat/ChatPage'),
    () => import('../pages/Profile/ProfilePage')
  ];

  return Promise.allSettled(criticalPages.map(importFn => importFn()));
};

export const preloadOnIdle = (importFn) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn().catch(() => {
        // 프리로딩 실패는 무시
      });
    });
  } else {
    // requestIdleCallback이 없는 브라우저에서는 setTimeout 사용
    setTimeout(() => {
      importFn().catch(() => {
        // 프리로딩 실패는 무시
      });
    }, 2000);
  }
};

/**
 * 번들 분석을 위한 메타데이터
 */
export const chunkMetadata = {
  pages: {
    main: { size: 'large', priority: 'high' },
    chat: { size: 'large', priority: 'high' },
    profile: { size: 'medium', priority: 'medium' },
    analytics: { size: 'large', priority: 'low' },
    onboarding: { size: 'small', priority: 'medium' }
  },
  components: {
    webrtc: { size: 'large', priority: 'low' },
    charts: { size: 'large', priority: 'low' },
    subtitles: { size: 'medium', priority: 'low' }
  },
  libraries: {
    emoji: { size: 'medium', priority: 'low' },
    charts: { size: 'large', priority: 'low' },
    dates: { size: 'small', priority: 'medium' }
  }
};