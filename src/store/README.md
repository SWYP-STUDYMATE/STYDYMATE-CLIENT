# Store 관리 가이드

## 개요

이 프로젝트는 **Zustand**를 사용하여 전역 상태를 관리합니다. 모든 Store는 통합된 헬퍼 함수를 통해 생성되며, 일관된 설정과 DevTools 지원을 제공합니다.

## 파일 구조

```
src/store/
├── index.js                  # 통합 export 및 유틸리티
├── createStore.js            # Store 생성 헬퍼
├── profileStore.js           # 프로필 상태
├── notificationStore.js      # 알림 상태
├── sessionStore.js           # 세션 상태
├── matchingStore.js          # 매칭 상태
├── levelTestStore.js         # 레벨 테스트 상태
├── achievementStore.js       # 업적 상태
├── themeStore.js             # 테마 상태
├── langInfoStore.js          # 언어 정보 상태
├── motivationStore.js        # 동기 부여 상태
└── partnerStore.js           # 파트너 상태
```

## 기본 사용법

### 1. Store Import

```javascript
// 개별 Store import
import { useProfileStore, useNotificationStore } from '@/store';

// 또는 특정 Store만
import useProfileStore from '@/store/profileStore';
```

### 2. 컴포넌트에서 사용

```javascript
import { useProfileStore } from '@/store';

function ProfilePage() {
  // 전체 상태 가져오기
  const profile = useProfileStore();

  // 특정 상태만 선택 (리렌더링 최적화)
  const englishName = useProfileStore((state) => state.englishName);
  const setEnglishName = useProfileStore((state) => state.setEnglishName);

  return (
    <div>
      <h1>{englishName}</h1>
      <button onClick={() => setEnglishName('John')}>Change Name</button>
    </div>
  );
}
```

### 3. 액션만 사용 (최적화)

```javascript
import { useProfileActions } from '@/store';

function ProfileEditor() {
  // 상태 변경은 없고 액션만 필요할 때 (리렌더링 방지)
  const { setEnglishName, setResidence, clearProfile } = useProfileActions();

  const handleSave = () => {
    setEnglishName('Jane');
    setResidence('Seoul');
  };

  return <button onClick={handleSave}>Save</button>;
}
```

## 새로운 Store 생성하기

### 1. 기본 Store

```javascript
// src/store/counterStore.js
import { createStore } from './createStore';

export const useCounterStore = createStore(
  'counter', // Store 이름
  (set, get) => ({
    // 상태
    count: 0,

    // 액션
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),

    // get()으로 현재 상태 접근
    double: () => {
      const currentCount = get().count;
      set({ count: currentCount * 2 });
    },
  })
);
```

### 2. Persist 포함 Store

```javascript
// src/store/authStore.js
import { createStore } from './createStore';

export const useAuthStore = createStore(
  'auth',
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setToken: (token) => set({ token }),
    logout: () => set({ user: null, token: null, isAuthenticated: false }),
  }),
  {
    persist: true, // localStorage 저장 활성화
    persistKey: 'auth-storage', // localStorage 키
    partialize: (state) => ({
      // 저장할 상태만 선택
      token: state.token,
      user: state.user,
    }),
  }
);
```

### 3. 비동기 액션 포함 Store

```javascript
// src/store/todoStore.js
import { createStore } from './createStore';
import { fetchTodos, createTodo } from '@/api/todos';

export const useTodoStore = createStore('todo', (set, get) => ({
  todos: [],
  loading: false,
  error: null,

  // 비동기 액션
  loadTodos: async () => {
    set({ loading: true, error: null });
    try {
      const todos = await fetchTodos();
      set({ todos, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addTodo: async (title) => {
    set({ loading: true });
    try {
      const newTodo = await createTodo({ title });
      set((state) => ({
        todos: [...state.todos, newTodo],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // 낙관적 업데이트 (Optimistic Update)
  toggleTodo: async (id) => {
    // 먼저 UI 업데이트
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));

    try {
      await updateTodo(id, { completed: true });
    } catch (error) {
      // 실패 시 롤백
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
        error: error.message,
      }));
    }
  },
}));
```

## Store 옵션

### `createStore(name, initializer, options)`

| 옵션             | 타입       | 기본값        | 설명                                          |
| ---------------- | ---------- | ------------- | --------------------------------------------- |
| `persist`        | `boolean`  | `false`       | localStorage 저장 여부                        |
| `persistKey`     | `string`   | `${name}-storage` | localStorage 키                      |
| `partialize`     | `function` | `undefined`   | 저장할 상태 선택 함수                         |
| `merge`          | `function` | `undefined`   | 복원 시 상태 병합 함수                        |
| `devtools`       | `boolean`  | `DEV 환경`    | Redux DevTools 사용 여부                      |
| `devtoolsName`   | `string`   | `name`        | DevTools에 표시될 이름                        |

## 고급 패턴

### 1. 여러 Store 조합

```javascript
import { combineStores } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';

function UserDashboard() {
  // 여러 Store를 한 번에 사용
  const combined = combineStores([useAuthStore, useProfileStore]);

  return (
    <div>
      <p>User: {combined.user?.name}</p>
      <p>Profile: {combined.englishName}</p>
    </div>
  );
}
```

### 2. Selector 패턴 (리렌더링 최적화)

```javascript
// 나쁜 예: 전체 상태 구독 (불필요한 리렌더링)
const todos = useTodoStore();
const firstTodo = todos.todos[0];

// 좋은 예: 필요한 부분만 선택
const firstTodo = useTodoStore((state) => state.todos[0]);

// 더 좋은 예: shallow equality check
import shallow from 'zustand/shallow';
const { todos, addTodo } = useTodoStore(
  (state) => ({ todos: state.todos, addTodo: state.addTodo }),
  shallow
);
```

### 3. Computed Values (파생 상태)

```javascript
export const useTodoStore = createStore('todo', (set, get) => ({
  todos: [],

  // Computed value (getter처럼 사용)
  get completedTodos() {
    return get().todos.filter((todo) => todo.completed);
  },

  get incompleteTodos() {
    return get().todos.filter((todo) => !todo.completed);
  },

  get completionRate() {
    const todos = get().todos;
    if (todos.length === 0) return 0;
    const completed = todos.filter((t) => t.completed).length;
    return (completed / todos.length) * 100;
  },
}));

// 사용
const completionRate = useTodoStore((state) => state.completionRate);
```

### 4. Store 간 통신

```javascript
// authStore.js
export const useAuthStore = createStore('auth', (set) => ({
  user: null,

  logout: () => {
    set({ user: null });

    // 다른 Store 초기화
    useProfileStore.getState().clearProfile();
    useNotificationStore.getState().resetStore();
  },
}));
```

## 디버깅

### 1. Redux DevTools 사용

```javascript
// 개발 환경에서 자동으로 활성화됨
// Chrome Extension: Redux DevTools 설치 필요
```

### 2. Store 상태 확인

```javascript
import { debugStores } from '@/store';

// 콘솔에서 실행
debugStores(); // 모든 Store 상태 출력
```

### 3. Store 검증

```javascript
import { validateStoreStates } from '@/store';

const validation = validateStoreStates();
console.log(validation);
// {
//   profile: { hasEnglishName: true, hasProfileImage: false, isComplete: true },
//   notifications: { isInitialized: true, unreadCountValid: true }
// }
```

## 마이그레이션 가이드

### 기존 Store → createStore 헬퍼

**기존 코드:**

```javascript
// 기존
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMyStore = create(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: 'my-storage' }
  )
);
```

**새로운 코드:**

```javascript
// 개선
import { createStore } from './createStore';

const useMyStore = createStore(
  'my',
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }),
  {
    persist: true,
    persistKey: 'my-storage',
  }
);
```

## 주의사항

1. **Store 외부에서 상태 직접 수정 금지**

```javascript
// ❌ 나쁜 예
const state = useMyStore.getState();
state.count = 10; // 직접 수정하면 React가 감지 못함

// ✅ 좋은 예
useMyStore.getState().setCount(10);
```

2. **비동기 액션에서 에러 처리 필수**

```javascript
// ❌ 나쁜 예
loadData: async () => {
  const data = await fetchData(); // 에러 시 앱 크래시
  set({ data });
}

// ✅ 좋은 예
loadData: async () => {
  set({ loading: true, error: null });
  try {
    const data = await fetchData();
    set({ data, loading: false });
  } catch (error) {
    set({ error: error.message, loading: false });
  }
}
```

3. **Persist 사용 시 partialize 권장**

```javascript
// 민감한 정보나 임시 상태는 저장하지 않기
{
  persist: true,
  partialize: (state) => ({
    user: state.user,
    // password나 token 같은 민감 정보 제외
    // loading, error 같은 임시 상태 제외
  })
}
```

## 참고 자료

- [Zustand 공식 문서](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zustand 베스트 프랙티스](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
