/**
 * Store 통합 관리 파일
 * 모든 Store를 중앙에서 export하고 타입을 정의
 */

// Store 생성 헬퍼
export { createStore, combineStores, selectStore, useStoreActions } from './createStore';

// 개별 Store들
export { default as useProfileStore } from './profileStore';
export { default as useNotificationStore } from './notificationStore';
export { default as useSessionStore } from './sessionStore';
export { default as useMatchingStore } from './matchingStore';
export { default as useLevelTestStore } from './levelTestStore';
export { default as useAchievementStore } from './achievementStore';
export { default as useThemeStore } from './themeStore';
export { default as useLangInfoStore } from './langInfoStore';
export { default as useMotivationStore } from './motivationStore';
export { default as usePartnerStore } from './partnerStore';

/**
 * Store 타입 정의 (JSDoc)
 * TypeScript 마이그레이션 시 활용 가능
 */

/**
 * @typedef {Object} ProfileState
 * @property {string} englishName
 * @property {string} name
 * @property {string} residence
 * @property {string|null} profileImage
 * @property {string} intro
 * @property {number|null} birthYear
 * @property {string|null} languageLevel
 * @property {string|null} targetLanguage
 */

/**
 * @typedef {Object} NotificationState
 * @property {Array} notifications
 * @property {number} unreadCount
 * @property {boolean} loading
 * @property {string|null} error
 */

/**
 * @typedef {Object} SessionState
 * @property {Array} sessions
 * @property {Object|null} currentSession
 * @property {boolean} loading
 */

/**
 * @typedef {Object} MatchingState
 * @property {Array} partners
 * @property {Array} matches
 * @property {boolean} loading
 * @property {string|null} currentMatchId
 */

/**
 * @typedef {Object} LevelTestState
 * @property {string|null} currentTestId
 * @property {Array} questions
 * @property {number} currentQuestionIndex
 * @property {Object} testResult
 * @property {boolean} isTestActive
 */

/**
 * Store 상태 리셋 유틸리티
 * 로그아웃 시 모든 Store 초기화
 */
export const resetAllStores = () => {
  // localStorage 클리어
  const keysToRemove = [
    'profile-storage',
    'notification-storage',
    'session-storage',
    'matching-storage',
    'level-test-storage',
    'achievement-storage',
    'theme-storage',
    'lang-info-storage',
    'motivation-storage',
    'partner-storage',
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  // 페이지 새로고침으로 Store 초기화
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

/**
 * Store 디버깅 헬퍼
 * 개발 환경에서만 작동
 */
export const debugStores = () => {
  if (import.meta.env.DEV) {
    console.group('🗂️ Store States');

    // 각 Store의 현재 상태 출력
    const stores = {
      profile: useProfileStore.getState(),
      notification: useNotificationStore.getState(),
      session: useSessionStore.getState(),
      matching: useMatchingStore.getState(),
      levelTest: useLevelTestStore.getState(),
      achievement: useAchievementStore.getState(),
      theme: useThemeStore.getState(),
      langInfo: useLangInfoStore.getState(),
      motivation: useMotivationStore.getState(),
      partner: usePartnerStore.getState(),
    };

    Object.entries(stores).forEach(([name, state]) => {
      console.log(`📦 ${name}:`, state);
    });

    console.groupEnd();

    return stores;
  }
};

/**
 * Store 상태 검증 헬퍼
 * 필수 상태가 올바르게 설정되었는지 확인
 */
export const validateStoreStates = () => {
  const profile = useProfileStore.getState();
  const notifications = useNotificationStore.getState();

  const validation = {
    profile: {
      hasEnglishName: !!profile.englishName,
      hasProfileImage: !!profile.profileImage,
      isComplete: !!profile.englishName && !!profile.residence,
    },
    notifications: {
      isInitialized: Array.isArray(notifications.notifications),
      unreadCountValid: typeof notifications.unreadCount === 'number',
    },
  };

  return validation;
};

/**
 * Store 초기화 상태 확인
 */
export const isStoresReady = () => {
  try {
    const profile = useProfileStore.getState();
    const notifications = useNotificationStore.getState();

    return {
      profile: profile !== undefined,
      notifications: notifications !== undefined,
      allReady: profile !== undefined && notifications !== undefined,
    };
  } catch (error) {
    console.error('Failed to check store readiness:', error);
    return {
      profile: false,
      notifications: false,
      allReady: false,
    };
  }
};

/**
 * 조합된 Store Hook 예시
 * 여러 Store를 동시에 사용할 때 편리
 */
export const useAppStores = () => {
  const profile = useProfileStore();
  const notifications = useNotificationStore();
  const session = useSessionStore();

  return {
    profile,
    notifications,
    session,
  };
};

/**
 * Store 액션만 추출하는 Hook
 * 상태 변경 시 리렌더링 방지
 */
export const useProfileActions = () => {
  return useProfileStore((state) => ({
    setEnglishName: state.setEnglishName,
    setResidence: state.setResidence,
    setProfileImage: state.setProfileImage,
    setIntro: state.setIntro,
    clearProfile: state.clearProfile,
    loadProfileFromServer: state.loadProfileFromServer,
    saveProfileToServer: state.saveProfileToServer,
  }));
};

export const useNotificationActions = () => {
  return useNotificationStore((state) => ({
    loadNotifications: state.loadNotifications,
    loadUnreadCount: state.loadUnreadCount,
    markAsRead: state.markAsRead,
    markAllAsRead: state.markAllAsRead,
    deleteNotification: state.deleteNotification,
    addNotification: state.addNotification,
  }));
};
