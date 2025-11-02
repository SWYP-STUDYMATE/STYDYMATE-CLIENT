/**
 * React 19 안전 렌더링 유틸리티
 * React Error #185 (Objects are not valid as a React child) 방지
 */

/**
 * 값을 안전하게 문자열로 변환
 * @param {*} value - 변환할 값
 * @param {string} fallback - 기본값
 * @returns {string} 안전한 문자열
 */
export const toSafeString = (value, fallback = '') => {
  // null 또는 undefined
  if (value == null) return fallback;

  // 이미 문자열
  if (typeof value === 'string') return value;

  // 숫자, 불리언
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // 배열
  if (Array.isArray(value)) {
    return fallback;
  }

  // 객체 (Date 제외)
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return value.toLocaleDateString('ko-KR');
    }
    return fallback;
  }

  // 기타 (함수, Symbol 등)
  return fallback;
};

/**
 * 숫자 값을 안전하게 렌더링
 * @param {*} value - 변환할 값
 * @param {number} fallback - 기본값
 * @returns {number|string} 안전한 숫자 또는 기본값
 */
export const toSafeNumber = (value, fallback = 0) => {
  if (value == null) return fallback;

  const num = Number(value);
  if (Number.isNaN(num)) return fallback;

  return num;
};

/**
 * 객체 속성을 안전하게 접근하고 렌더링
 * @param {object} obj - 객체
 * @param {string} path - 속성 경로 (예: 'user.profile.name')
 * @param {string} fallback - 기본값
 * @returns {string} 안전한 문자열
 */
export const safeGet = (obj, path, fallback = '') => {
  if (!obj || typeof obj !== 'object') return fallback;

  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return fallback;
    }
    result = result[key];
  }

  return toSafeString(result, fallback);
};

/**
 * 배열이 비어있지 않은지 안전하게 확인
 * @param {*} arr - 확인할 값
 * @returns {boolean}
 */
export const hasItems = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * 조건부 렌더링을 위한 안전한 값 체크
 * @param {*} value - 확인할 값
 * @returns {boolean} 렌더링 가능한 값인지
 */
export const isRenderable = (value) => {
  // null, undefined는 React가 렌더링하지 않음 (안전)
  if (value == null) return false;

  // 문자열, 숫자, 불리언은 안전
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return true;
  }

  // 배열, 객체는 위험 (직접 렌더링 불가)
  return false;
};

/**
 * React 컴포넌트에서 안전하게 사용할 수 있는 값으로 변환
 * @param {*} value - 변환할 값
 * @param {*} fallback - 기본값
 * @returns {string|number|null} 안전한 값
 */
export const toReactSafe = (value, fallback = null) => {
  if (value == null) return fallback;

  const type = typeof value;

  // 이미 안전한 타입
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return value;
  }

  // Date 객체는 문자열로 변환
  if (value instanceof Date) {
    return value.toLocaleDateString('ko-KR');
  }

  // 나머지는 fallback 반환
  return fallback;
};

/**
 * 여러 값 중 첫 번째로 렌더링 가능한 값 반환
 * @param {...*} values - 확인할 값들
 * @returns {string|number|null} 첫 번째로 안전한 값
 */
export const coalesce = (...values) => {
  for (const value of values) {
    const safe = toReactSafe(value);
    if (safe != null && safe !== '') {
      return safe;
    }
  }
  return null;
};
