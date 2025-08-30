// Store용 공통 헬퍼 함수들
import { log } from './logger';
import { toast } from '../components/Toast';

/**
 * API 호출을 위한 공통 래퍼 함수
 * @param {Function} apiCall - 실행할 API 함수
 * @param {string} context - 에러 메시지에 포함될 컨텍스트 정보
 * @param {Object} options - 추가 옵션
 * @param {boolean} options.showToast - 에러 시 Toast 표시 여부 (기본: true)
 * @param {boolean} options.logError - 에러 로깅 여부 (기본: true)
 * @param {string} options.fallbackValue - 실패 시 반환할 기본값
 */
export const safeApiCall = async (apiCall, context = '', options = {}) => {
  const {
    showToast = true,
    logError = true,
    fallbackValue = null
  } = options;

  try {
    log.debug(`API 호출 시작: ${context}`, null, 'STORE');
    const result = await apiCall();
    log.debug(`API 호출 성공: ${context}`, result, 'STORE');
    return result;
  } catch (error) {
    if (logError) {
      log.error(`API 호출 실패: ${context}`, error, 'STORE');
    }

    if (showToast && typeof window !== 'undefined') {
      const errorMessage = getStoreErrorMessage(context, error);
      toast.error('오류 발생', errorMessage);
    }

    if (fallbackValue !== null) {
      log.info(`폴백 값 사용: ${context}`, fallbackValue, 'STORE');
      return fallbackValue;
    }

    throw error;
  }
};

/**
 * Store 에러에 대한 사용자 친화적 메시지 생성
 */
export const getStoreErrorMessage = (context, error) => {
  const contextMessages = {
    'language-info-load': '언어 설정을 불러오는 중 문제가 발생했습니다.',
    'language-info-save': '언어 설정 저장에 실패했습니다.',
    'partner-info-load': '파트너 설정을 불러오는 중 문제가 발생했습니다.',
    'partner-info-save': '파트너 설정 저장에 실패했습니다.',
    'motivation-info-load': '관심사 정보를 불러오는 중 문제가 발생했습니다.',
    'motivation-info-save': '관심사 정보 저장에 실패했습니다.',
    'profile-load': '프로필 정보를 불러오는 중 문제가 발생했습니다.',
    'profile-save': '프로필 저장에 실패했습니다.',
    'level-test-load': '레벨테스트 정보를 불러오는 중 문제가 발생했습니다.',
    'level-test-submit': '레벨테스트 제출에 실패했습니다.',
    'session-load': '세션 정보를 불러오는 중 문제가 발생했습니다.',
    'matching-load': '매칭 정보를 불러오는 중 문제가 발생했습니다.',
    'matching-action': '매칭 처리 중 문제가 발생했습니다.'
  };

  return contextMessages[context] || `${context} 처리 중 문제가 발생했습니다.`;
};

/**
 * Store 액션에 사용자 로깅 추가
 */
export const logUserAction = (action, data = null) => {
  log.user(action, data);
};

/**
 * Store 상태 변경 시 로깅
 */
export const logStateChange = (storeName, stateName, oldValue, newValue) => {
  log.debug(
    `${storeName} 상태 변경: ${stateName}`,
    { oldValue, newValue },
    'STORE-STATE'
  );
};

/**
 * 비동기 Store 액션을 위한 래퍼 (로딩 상태 포함)
 */
export const withLoading = (set) => {
  return async (actionName, asyncAction) => {
    try {
      set({ loading: true, error: null });
      log.debug(`${actionName} 시작`, null, 'STORE');
      
      const result = await asyncAction();
      
      log.debug(`${actionName} 완료`, result, 'STORE');
      set({ loading: false });
      
      return result;
    } catch (error) {
      log.error(`${actionName} 실패`, error, 'STORE');
      set({ loading: false, error: error.message });
      throw error;
    }
  };
};

/**
 * Store 초기화를 위한 헬퍼
 */
export const createStoreInitializer = (storeName, initialData = {}) => {
  return (set, get) => ({
    // 공통 상태
    loading: false,
    error: null,
    
    // 초기 데이터
    ...initialData,

    // 공통 액션들
    setLoading: (loading) => {
      logStateChange(storeName, 'loading', get().loading, loading);
      set({ loading });
    },

    setError: (error) => {
      logStateChange(storeName, 'error', get().error, error);
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    // 상태 리셋
    reset: () => {
      log.info(`${storeName} 상태 리셋`, null, 'STORE');
      set({ ...initialData, loading: false, error: null });
    }
  });
};

export default {
  safeApiCall,
  getStoreErrorMessage,
  logUserAction,
  logStateChange,
  withLoading,
  createStoreInitializer
};