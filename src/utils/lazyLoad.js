import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#00C471] mx-auto mb-4" />
      <p className="text-[16px] text-[#666666]">Loading...</p>
    </div>
  </div>
);

/**
 * Create a lazy loaded component with loading fallback
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} fallback - Optional custom fallback component
 * @returns {React.Component} - Wrapped component with Suspense
 */
export function lazyLoad(importFunc, fallback = <LoadingFallback />) {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Pre-configured lazy loaded routes
export const LazyRoutes = {
  // Onboarding
  ObInfoRouter: lazyLoad(() => import('../pages/ObInfo/ObInfoRouter')),
  ObIntRouter: lazyLoad(() => import('../pages/ObInt/ObIntRouter')),
  ObLangRouter: lazyLoad(() => import('../pages/ObLang/ObLangRouter')),
  ObPartnerRouter: lazyLoad(() => import('../pages/ObPartner/ObPartnerRouter')),
  ObSchaduleRouter: lazyLoad(() => import('../pages/ObSchadule/ObSchaduleRouter')),
  
  // Level Test
  LevelTestStart: lazyLoad(() => import('../pages/LevelTest/LevelTestStart')),
  LevelTestCheck: lazyLoad(() => import('../pages/LevelTest/ConnectionCheck')),
  LevelTestRecording: lazyLoad(() => import('../pages/LevelTest/LevelTestRecording')),
  LevelTestResult: lazyLoad(() => import('../pages/LevelTest/LevelTestResult')),
  
  // Session
  AudioConnectionCheck: lazyLoad(() => import('../pages/Session/AudioConnectionCheck')),
  VideoSessionCheck: lazyLoad(() => import('../pages/Session/VideoSessionCheck')),
  AudioSessionRoom: lazyLoad(() => import('../pages/Session/AudioSessionRoom')),
  VideoSessionRoom: lazyLoad(() => import('../pages/Session/VideoSessionRoom')),
  VideoControlsDemo: lazyLoad(() => import('../pages/Session/VideoControlsDemo')),
  
  // Main
  Main: lazyLoad(() => import('../pages/Main')),
  Schedule: lazyLoad(() => import('../pages/Schedule/Schedule')),
  ChatPage: lazyLoad(() => import('../pages/Chat/ChatPage')),
};