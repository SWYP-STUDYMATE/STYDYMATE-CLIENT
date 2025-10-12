/**
 * Zustand Store 생성 헬퍼
 * 모든 Store에 일관된 설정을 적용하고 DevTools, Persist 등을 통합 관리
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { log } from '../utils/logger';

/**
 * Store 설정 옵션 타입
 * @typedef {Object} StoreOptions
 * @property {boolean} persist - localStorage 저장 여부 (기본: false)
 * @property {string} [persistKey] - localStorage 키 (persist=true일 때 필수)
 * @property {function} [partialize] - persist할 상태 선택 함수
 * @property {function} [merge] - persist 상태 병합 함수
 * @property {boolean} devtools - Redux DevTools 사용 여부 (기본: DEV 환경에서만)
 * @property {string} [devtoolsName] - DevTools에 표시될 이름
 */

/**
 * Zustand Store 생성 헬퍼 함수
 *
 * @param {string} name - Store 이름 (DevTools 및 로깅용)
 * @param {function} initializer - Store 초기화 함수 (set, get, api) => state
 * @param {StoreOptions} options - Store 설정 옵션
 * @returns {function} - Zustand hook
 *
 * @example
 * // persist 없는 기본 Store
 * export const useCounterStore = createStore(
 *   'counter',
 *   (set) => ({
 *     count: 0,
 *     increment: () => set((state) => ({ count: state.count + 1 }))
 *   })
 * );
 *
 * @example
 * // persist 포함 Store
 * export const useAuthStore = createStore(
 *   'auth',
 *   (set) => ({
 *     user: null,
 *     token: null,
 *     setUser: (user) => set({ user })
 *   }),
 *   {
 *     persist: true,
 *     persistKey: 'auth-storage',
 *     partialize: (state) => ({ token: state.token })
 *   }
 * );
 */
export const createStore = (name, initializer, options = {}) => {
  const {
    persist: shouldPersist = false,
    persistKey = `${name}-storage`,
    partialize,
    merge,
    devtools: shouldUseDevtools = import.meta.env.DEV,
    devtoolsName = name,
  } = options;

  // 초기화 함수 래핑 (에러 처리 및 로깅 추가)
  const wrappedInitializer = (set, get, api) => {
    // set 함수 래핑 (상태 변경 로깅)
    const wrappedSet = (partial, replace) => {
      if (import.meta.env.DEV) {
        const partialState = typeof partial === 'function' ? partial(get()) : partial;
        log.debug(`[Store:${name}] State update`, partialState, 'STORE');
      }
      return set(partial, replace);
    };

    try {
      return initializer(wrappedSet, get, api);
    } catch (error) {
      log.error(`[Store:${name}] Initialization failed`, error, 'STORE');
      throw error;
    }
  };

  // Middleware 조합
  let storeWithMiddleware = wrappedInitializer;

  // 1. Persist Middleware (가장 안쪽)
  if (shouldPersist) {
    const persistOptions = {
      name: persistKey,
    };

    // partialize 함수가 제공되면 적용
    if (partialize) {
      persistOptions.partialize = partialize;
    }

    // merge 함수가 제공되면 적용
    if (merge) {
      persistOptions.merge = merge;
    }

    // persist 에러 처리
    persistOptions.onRehydrateStorage = () => (state, error) => {
      if (error) {
        log.error(`[Store:${name}] Persist rehydration failed`, error, 'STORE');
      } else if (import.meta.env.DEV) {
        log.debug(`[Store:${name}] Persist rehydrated`, state, 'STORE');
      }
    };

    storeWithMiddleware = persist(storeWithMiddleware, persistOptions);
  }

  // 2. DevTools Middleware (가장 바깥쪽)
  if (shouldUseDevtools) {
    storeWithMiddleware = devtools(storeWithMiddleware, {
      name: devtoolsName,
      enabled: import.meta.env.DEV,
    });
  }

  // Store 생성
  const useStore = create(storeWithMiddleware);

  // 개발 환경에서 Store 생성 로깅
  if (import.meta.env.DEV) {
    log.info(
      `[Store:${name}] Created`,
      {
        persist: shouldPersist,
        persistKey: shouldPersist ? persistKey : null,
        devtools: shouldUseDevtools,
      },
      'STORE'
    );
  }

  return useStore;
};

/**
 * 여러 Store를 결합하는 헬퍼 함수
 *
 * @param {Array<function>} stores - 결합할 Store hooks 배열
 * @returns {Object} - 결합된 상태 객체
 *
 * @example
 * const useCombinedStore = () => combineStores([
 *   useAuthStore,
 *   useProfileStore,
 *   useNotificationStore
 * ]);
 *
 * // 사용
 * const combined = useCombinedStore();
 * console.log(combined.user, combined.profile, combined.notifications);
 */
export const combineStores = (stores) => {
  return stores.reduce((acc, useStore) => {
    return { ...acc, ...useStore() };
  }, {});
};

/**
 * Store 상태를 선택하는 헬퍼 함수 (리렌더링 최적화)
 *
 * @param {function} useStore - Store hook
 * @param {function} selector - 상태 선택 함수
 * @returns {any} - 선택된 상태
 *
 * @example
 * // 전체 상태 대신 필요한 부분만 선택
 * const count = selectStore(useCounterStore, (state) => state.count);
 * const increment = selectStore(useCounterStore, (state) => state.increment);
 */
export const selectStore = (useStore, selector) => {
  return useStore(selector);
};

/**
 * Store 액션만 선택하는 헬퍼 (상태 변경 시 리렌더링 방지)
 *
 * @param {function} useStore - Store hook
 * @param {Array<string>} actionNames - 액션 이름 배열
 * @returns {Object} - 액션 객체
 *
 * @example
 * const { increment, decrement, reset } = useStoreActions(
 *   useCounterStore,
 *   ['increment', 'decrement', 'reset']
 * );
 */
export const useStoreActions = (useStore, actionNames) => {
  return useStore((state) => {
    const actions = {};
    actionNames.forEach((name) => {
      actions[name] = state[name];
    });
    return actions;
  }, shallow);
};

// shallow comparison (zustand에서 제공)
const shallow = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => a[key] === b[key]);
};

export default createStore;
