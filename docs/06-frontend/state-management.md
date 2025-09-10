# STUDYMATE 상태 관리 가이드

## 📋 개요

STUDYMATE 프론트엔드의 상태 관리 아키텍처와 Zustand를 활용한 구현 패턴을 설명합니다.

## 🏗️ 상태 관리 아키텍처

### 기술 스택
- **상태 관리**: Zustand 5.0.6
- **지속성**: Zustand Persist Middleware
- **개발 도구**: Zustand Devtools
- **타입 안전성**: TypeScript 지원

### 아키텍처 원칙
1. **도메인별 스토어 분리**: 기능별로 독립된 스토어 관리
2. **단순성 우선**: 복잡한 보일러플레이트 코드 최소화
3. **타입 안전성**: TypeScript로 타입 안전한 상태 관리
4. **성능 최적화**: 선택적 상태 구독으로 불필요한 리렌더링 방지

## 🗂️ 스토어 구조

### 전체 스토어 맵
```typescript
// src/stores/index.ts
export interface RootState {
  auth: AuthState;
  profile: ProfileState;
  chat: ChatState;
  session: SessionState;
  levelTest: LevelTestState;
  matching: MatchingState;
  notification: NotificationState;
  ui: UIState;
}
```

### 도메인별 스토어 구성
```
stores/
├── authStore.ts           # 인증 및 사용자 세션
├── profileStore.ts        # 사용자 프로필 및 온보딩
├── chatStore.ts          # 채팅 메시지 및 룸 관리
├── sessionStore.ts       # 학습 세션 및 WebRTC
├── levelTestStore.ts     # 레벨 테스트 진행 상태
├── matchingStore.ts      # 매칭 파트너 및 요청
├── notificationStore.ts  # 알림 및 푸시
├── uiStore.ts           # UI 상태 및 모달
└── index.ts             # 스토어 통합 및 타입 정의
```

## 🔐 AuthStore - 인증 관리

### 상태 정의
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  // 인증 상태
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshAccessToken: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      error: null,
      
      // Actions 구현
      setTokens: (accessToken, refreshToken) => set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        error: null
      }),
      
      setUser: (user) => set({ user }),
      
      clearAuth: () => set({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        user: null,
        error: null
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken: newAccessToken } = response.data;
          
          set({ 
            accessToken: newAccessToken,
            isLoading: false,
            error: null 
          });
          return true;
        } catch (error) {
          get().clearAuth();
          return false;
        }
      },
      
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      }
    }),
    {
      name: 'auth-storage',
      // 민감한 정보는 sessionStorage에 저장
      storage: {
        getItem: (name) => sessionStorage.getItem(name),
        setItem: (name, value) => sessionStorage.setItem(name, value),
        removeItem: (name) => sessionStorage.removeItem(name)
      }
    }
  )
);
```

### 사용 예시
```typescript
// 컴포넌트에서 사용
function LoginPage() {
  const { setTokens, setUser, isLoading, error } = useAuthStore();
  
  const handleLogin = async (credentials) => {
    try {
      const response = await login(credentials);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      navigate('/main');
    } catch (error) {
      // 에러 처리
    }
  };
  
  return (
    // JSX...
  );
}

// 선택적 구독으로 성능 최적화
function UserProfile() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) return <LoginPrompt />;
  
  return <ProfileCard user={user} />;
}
```

## 👤 ProfileStore - 프로필 관리

### 상태 정의
```typescript
// src/stores/profileStore.ts
interface ProfileState {
  // 온보딩 상태
  onboardingStep: number;
  isOnboardingComplete: boolean;
  
  // 프로필 정보
  englishName: string;
  residence: string;
  profileImage: string | null;
  intro: string;
  
  // 언어 정보
  nativeLanguages: Language[];
  teachingLanguages: Language[];
  learningLanguages: Language[];
  
  // 관심사 및 선호도
  interests: string[];
  partnerPreferences: PartnerPreferences;
  schedule: Schedule;
  
  // Actions
  setOnboardingStep: (step: number) => void;
  updateProfile: (profile: Partial<ProfileInfo>) => void;
  addLanguage: (language: Language, type: LanguageType) => void;
  removeLanguage: (languageCode: string, type: LanguageType) => void;
  setInterests: (interests: string[]) => void;
  updatePreferences: (preferences: Partial<PartnerPreferences>) => void;
  updateSchedule: (schedule: Partial<Schedule>) => void;
  completeOnboarding: () => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      onboardingStep: 1,
      isOnboardingComplete: false,
      englishName: '',
      residence: '',
      profileImage: null,
      intro: '',
      nativeLanguages: [],
      teachingLanguages: [],
      learningLanguages: [],
      interests: [],
      partnerPreferences: {},
      schedule: {},
      
      // Actions 구현
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      
      updateProfile: (profile) => set(state => ({
        ...state,
        ...profile
      })),
      
      addLanguage: (language, type) => set(state => {
        const key = `${type}Languages` as keyof ProfileState;
        const currentLanguages = state[key] as Language[];
        return {
          ...state,
          [key]: [...currentLanguages, language]
        };
      }),
      
      removeLanguage: (languageCode, type) => set(state => {
        const key = `${type}Languages` as keyof ProfileState;
        const currentLanguages = state[key] as Language[];
        return {
          ...state,
          [key]: currentLanguages.filter(lang => lang.code !== languageCode)
        };
      }),
      
      setInterests: (interests) => set({ interests }),
      
      updatePreferences: (preferences) => set(state => ({
        partnerPreferences: { ...state.partnerPreferences, ...preferences }
      })),
      
      updateSchedule: (schedule) => set(state => ({
        schedule: { ...state.schedule, ...schedule }
      })),
      
      completeOnboarding: () => set({ 
        isOnboardingComplete: true,
        onboardingStep: 7 // 완료 상태
      }),
      
      clearProfile: () => set({
        onboardingStep: 1,
        isOnboardingComplete: false,
        englishName: '',
        residence: '',
        profileImage: null,
        intro: '',
        nativeLanguages: [],
        teachingLanguages: [],
        learningLanguages: [],
        interests: [],
        partnerPreferences: {},
        schedule: {}
      })
    }),
    {
      name: 'profile-storage'
    }
  )
);
```

## 💬 ChatStore - 채팅 관리

### 상태 정의
```typescript
// src/stores/chatStore.ts
interface ChatState {
  // 채팅방 목록
  rooms: ChatRoom[];
  currentRoomId: string | null;
  
  // 메시지 관리
  messagesByRoom: Record<string, Message[]>;
  unreadCounts: Record<string, number>;
  
  // WebSocket 연결
  isConnected: boolean;
  connectionError: string | null;
  
  // UI 상태
  isTyping: Record<string, string[]>; // roomId -> userIds
  
  // Actions
  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  setCurrentRoom: (roomId: string | null) => void;
  addMessage: (roomId: string, message: Message) => void;
  addMessages: (roomId: string, messages: Message[]) => void;
  markAsRead: (roomId: string) => void;
  setTyping: (roomId: string, userId: string, isTyping: boolean) => void;
  setConnectionStatus: (connected: boolean, error?: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // 초기 상태
  rooms: [],
  currentRoomId: null,
  messagesByRoom: {},
  unreadCounts: {},
  isConnected: false,
  connectionError: null,
  isTyping: {},
  
  // Actions
  setRooms: (rooms) => set({ rooms }),
  
  addRoom: (room) => set(state => ({
    rooms: [room, ...state.rooms.filter(r => r.id !== room.id)]
  })),
  
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),
  
  addMessage: (roomId, message) => set(state => {
    const roomMessages = state.messagesByRoom[roomId] || [];
    return {
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: [...roomMessages, message]
      },
      // 현재 보고 있지 않은 룸의 메시지면 읽지 않음 카운트 증가
      unreadCounts: {
        ...state.unreadCounts,
        [roomId]: state.currentRoomId === roomId 
          ? 0 
          : (state.unreadCounts[roomId] || 0) + 1
      }
    };
  }),
  
  addMessages: (roomId, messages) => set(state => {
    const existingMessages = state.messagesByRoom[roomId] || [];
    const newMessages = messages.filter(
      msg => !existingMessages.some(existing => existing.id === msg.id)
    );
    
    return {
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: [...existingMessages, ...newMessages].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      }
    };
  }),
  
  markAsRead: (roomId) => set(state => ({
    unreadCounts: {
      ...state.unreadCounts,
      [roomId]: 0
    }
  })),
  
  setTyping: (roomId, userId, isTyping) => set(state => {
    const currentTyping = state.isTyping[roomId] || [];
    const newTyping = isTyping 
      ? [...currentTyping.filter(id => id !== userId), userId]
      : currentTyping.filter(id => id !== userId);
    
    return {
      isTyping: {
        ...state.isTyping,
        [roomId]: newTyping
      }
    };
  }),
  
  setConnectionStatus: (connected, error) => set({
    isConnected: connected,
    connectionError: error || null
  }),
  
  clearChat: () => set({
    rooms: [],
    currentRoomId: null,
    messagesByRoom: {},
    unreadCounts: {},
    isConnected: false,
    connectionError: null,
    isTyping: {}
  })
}));
```

## 🎯 LevelTestStore - 레벨 테스트 관리

### 상태 정의
```typescript
// src/stores/levelTestStore.ts
interface LevelTestState {
  // 테스트 진행 상태
  currentStep: number;
  totalSteps: number;
  isInProgress: boolean;
  isCompleted: boolean;
  
  // 테스트 데이터
  testId: string | null;
  language: string;
  questions: TestQuestion[];
  responses: TestResponse[];
  
  // 결과
  results: TestResults | null;
  
  // 기술적 상태
  isRecording: boolean;
  recordingError: string | null;
  isSubmitting: boolean;
  
  // Actions
  startTest: (language: string, questions: TestQuestion[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  startRecording: (questionId: string) => void;
  stopRecording: (audioBlob: Blob) => void;
  submitResponse: (response: TestResponse) => Promise<void>;
  completeTest: () => Promise<void>;
  setResults: (results: TestResults) => void;
  resetTest: () => void;
  setError: (error: string | null) => void;
}

export const useLevelTestStore = create<LevelTestState>((set, get) => ({
  // 초기 상태
  currentStep: 0,
  totalSteps: 4,
  isInProgress: false,
  isCompleted: false,
  testId: null,
  language: '',
  questions: [],
  responses: [],
  results: null,
  isRecording: false,
  recordingError: null,
  isSubmitting: false,
  
  // Actions
  startTest: (language, questions) => set({
    language,
    questions,
    isInProgress: true,
    currentStep: 0,
    responses: [],
    results: null,
    isCompleted: false
  }),
  
  nextStep: () => set(state => ({
    currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1)
  })),
  
  previousStep: () => set(state => ({
    currentStep: Math.max(state.currentStep - 1, 0)
  })),
  
  startRecording: (questionId) => set({
    isRecording: true,
    recordingError: null
  }),
  
  stopRecording: (audioBlob) => set({
    isRecording: false
  }),
  
  submitResponse: async (response) => {
    set({ isSubmitting: true });
    try {
      // API 호출하여 응답 제출
      await submitTestResponse(response);
      
      set(state => ({
        responses: [...state.responses, response],
        isSubmitting: false
      }));
      
      // 자동으로 다음 단계로
      get().nextStep();
    } catch (error) {
      set({ 
        isSubmitting: false,
        recordingError: error.message 
      });
    }
  },
  
  completeTest: async () => {
    try {
      set({ isSubmitting: true });
      const results = await completeTestSubmission(get().testId);
      set({
        results,
        isCompleted: true,
        isInProgress: false,
        isSubmitting: false
      });
    } catch (error) {
      set({ 
        isSubmitting: false,
        recordingError: error.message 
      });
    }
  },
  
  setResults: (results) => set({ results }),
  
  resetTest: () => set({
    currentStep: 0,
    isInProgress: false,
    isCompleted: false,
    testId: null,
    language: '',
    questions: [],
    responses: [],
    results: null,
    isRecording: false,
    recordingError: null,
    isSubmitting: false
  }),
  
  setError: (error) => set({ recordingError: error })
}));
```

## 🔄 상태 관리 패턴

### 1. 컴포넌트에서의 사용 패턴

```typescript
// 전체 상태 구독 (지양)
function MyComponent() {
  const state = useMyStore(); // ❌ 전체 상태 구독
  
  return <div>{state.someValue}</div>;
}

// 선택적 구독 (권장)
function MyComponent() {
  const someValue = useMyStore(state => state.someValue); // ✅ 필요한 값만 구독
  const setSomeValue = useMyStore(state => state.setSomeValue);
  
  return <div>{someValue}</div>;
}

// 여러 값 구독 시
function MyComponent() {
  const { value1, value2, action1 } = useMyStore(
    state => ({ 
      value1: state.value1, 
      value2: state.value2, 
      action1: state.action1 
    }),
    shallow // shallow comparison으로 성능 최적화
  );
  
  return <div>{value1} - {value2}</div>;
}
```

### 2. 비동기 액션 패턴

```typescript
// 스토어에서 비동기 액션 처리
const useMyStore = create<MyState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  
  fetchData: async () => {
    set({ loading: true, error: null });
    
    try {
      const data = await api.getData();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  // 낙관적 업데이트 패턴
  updateDataOptimistic: async (id, newData) => {
    const { data } = get();
    const optimisticData = data.map(item => 
      item.id === id ? { ...item, ...newData } : item
    );
    
    // 즉시 UI 업데이트
    set({ data: optimisticData });
    
    try {
      const updatedItem = await api.updateItem(id, newData);
      // 서버 응답으로 교체
      set(state => ({
        data: state.data.map(item => 
          item.id === id ? updatedItem : item
        )
      }));
    } catch (error) {
      // 실패 시 롤백
      set({ data });
      throw error;
    }
  }
}));
```

### 3. 상태 동기화 패턴

```typescript
// 여러 스토어 간 상태 동기화
export const useSyncStores = () => {
  const clearAuth = useAuthStore(state => state.clearAuth);
  const clearProfile = useProfileStore(state => state.clearProfile);
  const clearChat = useChatStore(state => state.clearChat);
  
  const logoutAllStores = useCallback(() => {
    clearAuth();
    clearProfile();
    clearChat();
  }, [clearAuth, clearProfile, clearChat]);
  
  return { logoutAllStores };
};

// WebSocket 이벤트와 상태 동기화
export const useWebSocketSync = () => {
  const addMessage = useChatStore(state => state.addMessage);
  const addNotification = useNotificationStore(state => state.addNotification);
  
  useEffect(() => {
    const handleMessage = (data) => {
      addMessage(data.roomId, data.message);
    };
    
    const handleNotification = (data) => {
      addNotification(data);
    };
    
    websocket.on('message', handleMessage);
    websocket.on('notification', handleNotification);
    
    return () => {
      websocket.off('message', handleMessage);
      websocket.off('notification', handleNotification);
    };
  }, [addMessage, addNotification]);
};
```

### 4. 데이터 정규화 패턴

```typescript
// 정규화된 상태 구조
interface NormalizedState<T> {
  byId: Record<string, T>;
  allIds: string[];
}

// 정규화 헬퍼 함수
const normalizeArray = <T extends { id: string }>(array: T[]): NormalizedState<T> => ({
  byId: array.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}),
  allIds: array.map(item => item.id)
});

// 스토어에서 사용
const useNormalizedStore = create<{
  users: NormalizedState<User>;
  setUsers: (users: User[]) => void;
  getUserById: (id: string) => User | undefined;
}>((set, get) => ({
  users: { byId: {}, allIds: [] },
  
  setUsers: (users) => set({
    users: normalizeArray(users)
  }),
  
  getUserById: (id) => get().users.byId[id]
}));
```

## 🔧 개발 도구 및 디버깅

### Zustand DevTools 설정
```typescript
import { devtools } from 'zustand/middleware';

export const useDebugStore = create<State>()(
  devtools(
    (set, get) => ({
      // 스토어 구현
    }),
    {
      name: 'my-store', // DevTools에서 표시될 이름
      serialize: true   // 상태 직렬화 활성화
    }
  )
);
```

### 타임 트래블 디버깅
```typescript
// 상태 히스토리 추적
const useHistoryStore = create<{
  history: State[];
  currentIndex: number;
  addToHistory: (state: State) => void;
  undo: () => void;
  redo: () => void;
}>((set, get) => ({
  history: [],
  currentIndex: -1,
  
  addToHistory: (state) => set(current => {
    const newHistory = current.history.slice(0, current.currentIndex + 1);
    return {
      history: [...newHistory, state],
      currentIndex: newHistory.length
    };
  }),
  
  undo: () => set(current => ({
    currentIndex: Math.max(0, current.currentIndex - 1)
  })),
  
  redo: () => set(current => ({
    currentIndex: Math.min(current.history.length - 1, current.currentIndex + 1)
  }))
}));
```

## 📊 성능 최적화

### 1. 선택적 구독으로 리렌더링 최소화
```typescript
// 잘못된 패턴 - 전체 스토어 구독
const Component = () => {
  const store = useMyStore(); // 모든 상태 변화에 리렌더링
  return <div>{store.specificValue}</div>;
};

// 올바른 패턴 - 필요한 값만 구독
const Component = () => {
  const specificValue = useMyStore(state => state.specificValue);
  return <div>{specificValue}</div>;
};
```

### 2. 계산된 값 메모이제이션
```typescript
const useMyStore = create<State>((set, get) => ({
  items: [],
  filter: '',
  
  // 계산된 값을 getter로 제공
  get filteredItems() {
    const { items, filter } = get();
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }
}));

// 컴포넌트에서 useMemo로 메모이제이션
const Component = () => {
  const filteredItems = useMyStore(
    state => state.filteredItems,
    // 의존성 기반 비교
    (prev, next) => prev.length === next.length && 
                   prev.every((item, index) => item.id === next[index].id)
  );
  
  return <List items={filteredItems} />;
};
```

### 3. 배치 업데이트 패턴
```typescript
const useMyStore = create<State>((set) => ({
  data: [],
  loading: false,
  error: null,
  
  // 여러 상태를 한 번에 업데이트
  batchUpdate: (updates: Partial<State>) => set(state => ({
    ...state,
    ...updates
  })),
  
  // 복잡한 업데이트 로직을 하나의 액션으로
  complexUpdate: async () => {
    set({ loading: true, error: null });
    
    try {
      const results = await Promise.all([
        fetchData1(),
        fetchData2(),
        fetchData3()
      ]);
      
      // 모든 결과를 한 번에 업데이트
      set({
        data1: results[0],
        data2: results[1],
        data3: results[2],
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
```

## 🧪 테스트 전략

### 스토어 단위 테스트
```typescript
// __tests__/authStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    useAuthStore.getState().clearAuth();
  });
  
  it('should set tokens correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setTokens('access-token', 'refresh-token');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.accessToken).toBe('access-token');
  });
  
  it('should handle logout correctly', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    // 초기 인증 설정
    act(() => {
      result.current.setTokens('access-token', 'refresh-token');
    });
    
    // 로그아웃 실행
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
  });
});
```

### 통합 테스트
```typescript
// __tests__/storeIntegration.test.tsx
import { render, screen } from '@testing-library/react';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';

function TestComponent() {
  const { isAuthenticated } = useAuthStore();
  const { englishName } = useProfileStore();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-name">{englishName}</div>
    </div>
  );
}

describe('Store Integration', () => {
  it('should sync auth and profile states', () => {
    render(<TestComponent />);
    
    // 초기 상태 확인
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    
    // 인증 상태 변경
    act(() => {
      useAuthStore.getState().setTokens('token', 'refresh');
      useProfileStore.getState().updateProfile({ englishName: 'John Doe' });
    });
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
  });
});
```

---

*이 상태 관리 가이드는 STUDYMATE의 프론트엔드 아키텍처를 정의하며, 새로운 기능 추가 시 참고해야 할 패턴과 원칙을 제시합니다.*