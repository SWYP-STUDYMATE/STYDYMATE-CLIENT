# STUDYMATE 라우팅 구조 가이드

## 📋 개요

STUDYMATE 프론트엔드의 라우팅 구조와 React Router DOM을 활용한 네비게이션 구현을 설명합니다.

## 🛣️ 라우팅 아키텍처

### 기술 스택
- **라우팅 라이브러리**: React Router DOM 7.6.3
- **코드 스플리팅**: React.lazy + Suspense
- **권한 관리**: Protected Route 컴포넌트
- **상태 관리**: Zustand와 연동

### 라우팅 구조 원칙
1. **계층적 구조**: 논리적 그룹별 경로 구성
2. **RESTful 디자인**: 직관적이고 예측 가능한 URL 패턴
3. **상태 보존**: 브라우저 히스토리와 상태 동기화
4. **성능 최적화**: 지연 로딩과 프리페치 활용

## 🗂️ 전체 라우트 맵

### 루트 구조
```
STUDYMATE-CLIENT Routes
├── / (Login)                           # 로그인 페이지
├── /login/oauth2/code/naver           # OAuth 콜백
├── /agreement                         # 약관 동의
├── /signup-complete                   # 회원가입 완료
├── /onboarding-info/:step            # 온보딩 (1-4단계)
├── /main                             # 메인 대시보드
├── /level-test/*                     # 레벨 테스트 플로우
├── /matching                         # 매칭 시스템
├── /chat/*                           # 채팅 시스템
├── /session/*                        # 세션 관리
├── /profile                          # 프로필 관리
└── /settings                         # 설정
```

### 상세 라우트 정의
```typescript
// src/router/routes.ts
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  onboardingRequired?: boolean;
  preload?: boolean;
  children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
  // 인증 관련 라우트
  {
    path: '/',
    element: LoginPage,
    protected: false
  },
  {
    path: '/login/oauth2/code/naver',
    element: NaverCallback,
    protected: false
  },
  {
    path: '/agreement',
    element: AgreementPage,
    protected: true,
    onboardingRequired: false
  },
  {
    path: '/signup-complete',
    element: SignupCompletePage,
    protected: true,
    onboardingRequired: false
  },
  
  // 온보딩 플로우
  {
    path: '/onboarding-info/:step',
    element: OnboardingLayout,
    protected: true,
    onboardingRequired: false,
    children: [
      { path: '1', element: ObInfo },
      { path: '2', element: ObLang },
      { path: '3', element: ObInt },
      { path: '4', element: ObPartner },
      { path: '5', element: ObSchedule },
      { path: '6', element: ObComplete }
    ]
  },
  
  // 메인 애플리케이션
  {
    path: '/main',
    element: MainPage,
    protected: true,
    onboardingRequired: true,
    preload: true
  },
  
  // 레벨 테스트 플로우
  {
    path: '/level-test',
    element: LevelTestLayout,
    protected: true,
    onboardingRequired: true,
    children: [
      { path: '/', element: LevelTestIntro },
      { path: '/connection-check', element: ConnectionCheck },
      { path: '/test/:questionId', element: TestQuestion },
      { path: '/result', element: TestResult }
    ]
  },
  
  // 매칭 시스템
  {
    path: '/matching',
    element: MatchingPage,
    protected: true,
    onboardingRequired: true,
    preload: true
  },
  
  // 채팅 시스템
  {
    path: '/chat',
    element: ChatLayout,
    protected: true,
    onboardingRequired: true,
    children: [
      { path: '/', element: ChatList },
      { path: '/:roomId', element: ChatRoom }
    ]
  },
  
  // 세션 관리
  {
    path: '/session',
    element: SessionLayout,
    protected: true,
    onboardingRequired: true,
    children: [
      { path: '/', element: SessionList },
      { path: '/audio-check', element: AudioConnectionCheck },
      { path: '/audio/:roomId', element: AudioSession },
      { path: '/video-check', element: VideoConnectionCheck },
      { path: '/video/:roomId', element: VideoSession }
    ]
  },
  
  // 프로필 및 설정
  {
    path: '/profile',
    element: ProfilePage,
    protected: true,
    onboardingRequired: true
  },
  {
    path: '/settings',
    element: SettingsPage,
    protected: true,
    onboardingRequired: true
  }
];
```

## 🔐 라우터 설정 및 가드

### 메인 라우터 설정
```typescript
// src/router/Router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProtectedRoute } from './ProtectedRoute';
import { routes } from './routes';

// 지연 로딩된 컴포넌트들
const LoginPage = lazy(() => import('../pages/Login/LoginPage'));
const MainPage = lazy(() => import('../pages/Main/MainPage'));
const OnboardingLayout = lazy(() => import('../layouts/OnboardingLayout'));
// ... 기타 컴포넌트들

// 라우트 생성 헬퍼 함수
const createRouteElement = (config: RouteConfig) => {
  const Component = config.element;
  
  let element = (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
  
  // 보호된 라우트인 경우 ProtectedRoute로 감싸기
  if (config.protected) {
    element = (
      <ProtectedRoute 
        onboardingRequired={config.onboardingRequired}
        preload={config.preload}
      >
        {element}
      </ProtectedRoute>
    );
  }
  
  return element;
};

// 라우터 생성
const router = createBrowserRouter(
  routes.map(route => ({
    path: route.path,
    element: createRouteElement(route),
    children: route.children?.map(child => ({
      path: child.path,
      element: createRouteElement(child)
    }))
  }))
);

export function Router() {
  return <RouterProvider router={router} />;
}
```

### 보호된 라우트 구현
```typescript
// src/router/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onboardingRequired?: boolean;
  preload?: boolean;
}

export function ProtectedRoute({ 
  children, 
  onboardingRequired = true,
  preload = false 
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { isOnboardingComplete } = useProfileStore();
  
  // 프리로드가 필요한 경우 미리 데이터 로드
  useEffect(() => {
    if (preload && isAuthenticated) {
      // 필요한 데이터 프리로드
      preloadData();
    }
  }, [preload, isAuthenticated]);
  
  // 인증되지 않은 경우 로그인 페이지로
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // 온보딩이 필요하지만 완료되지 않은 경우
  if (onboardingRequired && !isOnboardingComplete) {
    return <Navigate to="/onboarding-info/1" replace />;
  }
  
  // 온보딩이 완료되었는데 온보딩 페이지에 있는 경우
  if (isOnboardingComplete && location.pathname.startsWith('/onboarding-info')) {
    return <Navigate to="/main" replace />;
  }
  
  return <>{children}</>;
}

// 데이터 프리로드 함수
async function preloadData() {
  try {
    // 주요 데이터들을 병렬로 프리로드
    await Promise.all([
      import('../stores/chatStore').then(module => 
        module.useChatStore.getState().loadInitialData?.()
      ),
      import('../stores/matchingStore').then(module => 
        module.useMatchingStore.getState().loadPartners?.()
      ),
      import('../stores/notificationStore').then(module => 
        module.useNotificationStore.getState().loadNotifications?.()
      )
    ]);
  } catch (error) {
    console.warn('Failed to preload data:', error);
  }
}
```

## 🎯 특화된 라우트 구현

### 1. 온보딩 라우트 관리

```typescript
// src/router/OnboardingGuard.tsx
import { Navigate, useParams } from 'react-router-dom';
import { useProfileStore } from '../stores/profileStore';

const ONBOARDING_STEPS = [1, 2, 3, 4, 5, 6] as const;
const STEP_DEPENDENCIES: Record<number, number[]> = {
  2: [1],
  3: [1, 2],
  4: [1, 2, 3],
  5: [1, 2, 3, 4],
  6: [1, 2, 3, 4, 5]
};

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { step } = useParams();
  const { onboardingStep, completedSteps } = useProfileStore();
  
  const currentStep = parseInt(step || '1', 10);
  
  // 유효하지 않은 단계
  if (!ONBOARDING_STEPS.includes(currentStep as any)) {
    return <Navigate to="/onboarding-info/1" replace />;
  }
  
  // 이전 단계가 완료되지 않은 경우
  const dependencies = STEP_DEPENDENCIES[currentStep] || [];
  const missingDependencies = dependencies.filter(dep => 
    !completedSteps.includes(dep)
  );
  
  if (missingDependencies.length > 0) {
    const nextRequiredStep = Math.min(...missingDependencies);
    return <Navigate to={`/onboarding-info/${nextRequiredStep}`} replace />;
  }
  
  return <>{children}</>;
}
```

### 2. 동적 라우팅과 매개변수

```typescript
// src/pages/Chat/ChatRoom.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';

export function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { setCurrentRoom, rooms, loadMessages } = useChatStore();
  
  useEffect(() => {
    if (!roomId) {
      navigate('/chat', { replace: true });
      return;
    }
    
    // 채팅방 존재 확인
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      console.error(`Room ${roomId} not found`);
      navigate('/chat', { replace: true });
      return;
    }
    
    // 현재 룸 설정 및 메시지 로드
    setCurrentRoom(roomId);
    loadMessages(roomId);
    
    // 컴포넌트 언마운트 시 현재 룸 클리어
    return () => {
      setCurrentRoom(null);
    };
  }, [roomId, rooms, setCurrentRoom, loadMessages, navigate]);
  
  if (!roomId) return null;
  
  return (
    <div className="chat-room">
      {/* 채팅룸 UI */}
    </div>
  );
}
```

### 3. 중첩 라우팅 구현

```typescript
// src/layouts/SessionLayout.tsx
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';

export function SessionLayout() {
  const location = useLocation();
  const { activeSessions } = useSessionStore();
  
  const isSessionActive = activeSessions.length > 0;
  
  return (
    <div className="session-layout">
      <div className="session-header">
        <nav className="session-nav">
          <Link 
            to="/session" 
            className={location.pathname === '/session' ? 'active' : ''}
          >
            세션 목록
          </Link>
          {isSessionActive && (
            <Link 
              to="/session/current" 
              className={location.pathname.includes('/session/current') ? 'active' : ''}
            >
              진행 중인 세션
            </Link>
          )}
        </nav>
      </div>
      
      <main className="session-content">
        <Outlet /> {/* 자식 라우트가 렌더링되는 곳 */}
      </main>
    </div>
  );
}
```

## 🔄 네비게이션 패턴

### 1. 프로그래매틱 네비게이션

```typescript
// src/hooks/useNavigation.ts
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const goToMain = useCallback(() => {
    navigate('/main');
  }, [navigate]);
  
  const goToChat = useCallback((roomId?: string) => {
    if (roomId) {
      navigate(`/chat/${roomId}`);
    } else {
      navigate('/chat');
    }
  }, [navigate]);
  
  const goToSession = useCallback((sessionId?: string, type?: 'audio' | 'video') => {
    if (sessionId && type) {
      navigate(`/session/${type}/${sessionId}`);
    } else {
      navigate('/session');
    }
  }, [navigate]);
  
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/main');
    }
  }, [navigate]);
  
  const goToOnboarding = useCallback((step: number = 1) => {
    navigate(`/onboarding-info/${step}`);
  }, [navigate]);
  
  const goToLevelTest = useCallback((questionId?: string) => {
    if (questionId) {
      navigate(`/level-test/test/${questionId}`);
    } else {
      navigate('/level-test');
    }
  }, [navigate]);
  
  return {
    goToMain,
    goToChat,
    goToSession,
    goBack,
    goToOnboarding,
    goToLevelTest,
    currentPath: location.pathname,
    currentSearch: location.search
  };
}

// 컴포넌트에서 사용
function MyComponent() {
  const { goToChat, goToSession } = useNavigation();
  
  const handleChatClick = (roomId: string) => {
    goToChat(roomId);
  };
  
  const handleSessionStart = (sessionId: string) => {
    goToSession(sessionId, 'video');
  };
  
  return (
    // JSX...
  );
}
```

### 2. 조건부 네비게이션

```typescript
// src/components/ConditionalNavigation.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';

interface ConditionalNavigationProps {
  to: string;
  condition: boolean;
  fallbackTo: string;
  state?: any;
}

export function ConditionalNavigation({
  to,
  condition,
  fallbackTo,
  state
}: ConditionalNavigationProps) {
  return (
    <Navigate 
      to={condition ? to : fallbackTo} 
      state={state}
      replace 
    />
  );
}

// 사용 예시
function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const { isOnboardingComplete } = useProfileStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isOnboardingComplete) {
    return <Navigate to="/onboarding-info/1" replace />;
  }
  
  return <Navigate to="/main" replace />;
}
```

### 3. 상태 기반 리다이렉션

```typescript
// src/router/StateBasedRedirect.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';

export function useStateBasedRedirection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { isOnboardingComplete } = useProfileStore();
  
  useEffect(() => {
    // 로그인 상태 변경에 따른 리다이렉션
    if (!isAuthenticated && location.pathname !== '/') {
      navigate('/', { replace: true });
      return;
    }
    
    // 온보딩 완료 상태에 따른 리다이렉션
    if (isAuthenticated && !isOnboardingComplete && 
        !location.pathname.startsWith('/onboarding-info')) {
      navigate('/onboarding-info/1', { replace: true });
      return;
    }
    
    // 온보딩 완료 후 메인 페이지로 리다이렉션
    if (isAuthenticated && isOnboardingComplete && 
        location.pathname.startsWith('/onboarding-info')) {
      navigate('/main', { replace: true });
      return;
    }
  }, [isAuthenticated, isOnboardingComplete, location.pathname, navigate]);
}
```

## 🚀 성능 최적화

### 1. 라우트 기반 코드 스플리팅

```typescript
// src/router/LazyRoutes.tsx
import { lazy } from 'react';

// 페이지별 지연 로딩
export const LazyRoutes = {
  // 인증 관련
  Login: lazy(() => import('../pages/Login/LoginPage')),
  NaverCallback: lazy(() => import('../pages/Auth/NaverCallback')),
  Agreement: lazy(() => import('../pages/Auth/AgreementPage')),
  
  // 온보딩
  OnboardingLayout: lazy(() => import('../layouts/OnboardingLayout')),
  OnboardingSteps: {
    Step1: lazy(() => import('../pages/Onboarding/ObInfo')),
    Step2: lazy(() => import('../pages/Onboarding/ObLang')),
    Step3: lazy(() => import('../pages/Onboarding/ObInt')),
    Step4: lazy(() => import('../pages/Onboarding/ObPartner')),
    Step5: lazy(() => import('../pages/Onboarding/ObSchedule')),
    Step6: lazy(() => import('../pages/Onboarding/ObComplete'))
  },
  
  // 메인 기능들
  Main: lazy(() => import('../pages/Main/MainPage')),
  Matching: lazy(() => import('../pages/Matching/MatchingPage')),
  Chat: {
    Layout: lazy(() => import('../layouts/ChatLayout')),
    List: lazy(() => import('../pages/Chat/ChatList')),
    Room: lazy(() => import('../pages/Chat/ChatRoom'))
  },
  
  // 세션 관련
  Session: {
    Layout: lazy(() => import('../layouts/SessionLayout')),
    List: lazy(() => import('../pages/Session/SessionList')),
    AudioCheck: lazy(() => import('../pages/Session/AudioConnectionCheck')),
    VideoCheck: lazy(() => import('../pages/Session/VideoConnectionCheck')),
    AudioRoom: lazy(() => import('../pages/Session/AudioSession')),
    VideoRoom: lazy(() => import('../pages/Session/VideoSession'))
  },
  
  // 레벨 테스트
  LevelTest: {
    Layout: lazy(() => import('../layouts/LevelTestLayout')),
    Intro: lazy(() => import('../pages/LevelTest/LevelTestIntro')),
    ConnectionCheck: lazy(() => import('../pages/LevelTest/ConnectionCheck')),
    Question: lazy(() => import('../pages/LevelTest/TestQuestion')),
    Result: lazy(() => import('../pages/LevelTest/TestResult'))
  },
  
  // 기타
  Profile: lazy(() => import('../pages/Profile/ProfilePage')),
  Settings: lazy(() => import('../pages/Settings/SettingsPage'))
};
```

### 2. 라우트 프리페칭

```typescript
// src/router/RoutePrefetch.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PREFETCH_ROUTES = {
  '/main': ['/matching', '/chat', '/session'],
  '/matching': ['/chat'],
  '/chat': ['/session'],
  '/onboarding-info/1': ['/onboarding-info/2'],
  '/onboarding-info/2': ['/onboarding-info/3'],
  // ...
};

export function useRoutePrefetch() {
  const location = useLocation();
  
  useEffect(() => {
    const routesToPrefetch = PREFETCH_ROUTES[location.pathname];
    if (!routesToPrefetch) return;
    
    // 100ms 후에 프리페치 시작 (현재 페이지 로딩을 방해하지 않도록)
    const timer = setTimeout(() => {
      routesToPrefetch.forEach(route => {
        // 라우트에 해당하는 컴포넌트를 미리 로드
        prefetchRoute(route);
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
}

async function prefetchRoute(route: string) {
  try {
    // 라우트별 컴포넌트 매핑
    const routeComponentMap = {
      '/matching': () => import('../pages/Matching/MatchingPage'),
      '/chat': () => import('../pages/Chat/ChatList'),
      '/session': () => import('../pages/Session/SessionList'),
      // ...
    };
    
    const importFn = routeComponentMap[route];
    if (importFn) {
      await importFn();
      console.log(`Prefetched route: ${route}`);
    }
  } catch (error) {
    console.warn(`Failed to prefetch route ${route}:`, error);
  }
}
```

### 3. 브라우저 히스토리 최적화

```typescript
// src/router/HistoryManager.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface HistoryState {
  scrollPosition?: number;
  formData?: any;
  timestamp?: number;
}

export function useHistoryManager() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // 스크롤 위치 저장/복원
  useEffect(() => {
    // 페이지 진입 시 스크롤 위치 복원
    const state = location.state as HistoryState;
    if (state?.scrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, state.scrollPosition);
      }, 0);
    }
    
    // 페이지 떠날 때 스크롤 위치 저장
    return () => {
      const scrollPosition = window.scrollY;
      const newState: HistoryState = {
        ...location.state,
        scrollPosition,
        timestamp: Date.now()
      };
      
      // history API를 사용해 현재 상태 업데이트
      window.history.replaceState(newState, '');
    };
  }, [location.pathname]);
  
  // 인증 상태 변경 시 히스토리 정리
  useEffect(() => {
    if (!isAuthenticated) {
      // 로그아웃 시 민감한 정보가 포함된 히스토리 항목 제거
      window.history.replaceState(null, '', '/');
    }
  }, [isAuthenticated]);
  
  const navigateWithState = (to: string, state?: any) => {
    navigate(to, {
      state: {
        ...state,
        timestamp: Date.now()
      }
    });
  };
  
  return { navigateWithState };
}
```

## 🧪 라우팅 테스트

### 라우트 테스트
```typescript
// __tests__/routing.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Router } from '../router/Router';
import { useAuthStore } from '../stores/authStore';

// 모킹
jest.mock('../stores/authStore');

describe('Routing', () => {
  beforeEach(() => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null
    });
  });
  
  it('should redirect to login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/main']}>
        <Router />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
  
  it('should navigate to onboarding when authenticated but not completed', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User' }
    });
    
    render(
      <MemoryRouter initialEntries={['/main']}>
        <Router />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('onboarding-page')).toBeInTheDocument();
  });
  
  it('should handle invalid chat room ID', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User' }
    });
    
    render(
      <MemoryRouter initialEntries={['/chat/invalid-room-id']}>
        <Router />
      </MemoryRouter>
    );
    
    // 채팅 목록으로 리다이렉션되어야 함
    expect(screen.getByTestId('chat-list')).toBeInTheDocument();
  });
});
```

---

*이 라우팅 구조 가이드는 STUDYMATE의 네비게이션 시스템을 정의하며, 사용자 경험과 성능을 최적화하는 패턴을 제시합니다.*