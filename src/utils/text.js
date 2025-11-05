const candidateKeys = [
  'displayName',
  'name',
  'title',
  'label',
  'text',
  'value',
  'description',
  'bio',
  'summary',
  'message'
];

const toLocationString = (value) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const { city, region, state, country } = value;
  const parts = [city, region ?? state, country]
    .filter((part) => typeof part === 'string' && part.trim() !== '');

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return null;
};

export const toDisplayText = (value, fallback = null) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const normalizedItems = value
      .map((item) => toDisplayText(item))
      .filter((item) => typeof item === 'string' && item.trim() !== '');
    
    if (normalizedItems.length > 0) {
      return normalizedItems.join(', ');
    }

    return fallback;
  }

  if (typeof value === 'object') {
    // 재귀적으로 문자열을 추출하되, 최대 깊이 제한
    const extractString = (obj, depth = 0) => {
      if (depth > 3) return null; // 최대 깊이 제한
      
      // 에러 객체 처리: message, error, reason 등을 우선 확인
      if (obj.message && typeof obj.message === 'string' && obj.message.trim() !== '') {
        return obj.message;
      }
      if (obj.error && typeof obj.error === 'string' && obj.error.trim() !== '') {
        return obj.error;
      }
      if (obj.reason && typeof obj.reason === 'string' && obj.reason.trim() !== '') {
        return obj.reason;
      }
      
      for (const key of candidateKeys) {
        const candidate = obj[key];
        if (typeof candidate === 'string' && candidate.trim() !== '') {
          return candidate;
        }
        if (typeof candidate === 'object' && candidate !== null && depth < 2) {
          const nested = extractString(candidate, depth + 1);
          if (typeof nested === 'string') return nested;
        }
      }

      const locationString = toLocationString(obj);
      if (locationString) {
        return locationString;
      }

      // 객체의 모든 값 중에서 문자열 찾기 (재귀 깊이 제한)
      const stringValues = Object.values(obj)
        .filter((item) => typeof item === 'string' && item.trim() !== '')
        .map((item) => String(item));
      
      if (stringValues.length > 0) {
        return stringValues.join(', ');
      }

      return null;
    };

    const result = extractString(value);
    // 결과가 문자열이 아니면 fallback 반환
    if (typeof result === 'string') {
      return result;
    }
    return fallback;
  }

  // 최종적으로 문자열로 변환 시도
  try {
    const str = String(value);
    // "[object Object]" 같은 의미 없는 문자열은 fallback 반환
    if (str === '[object Object]' || str === '[object Array]') {
      return fallback;
    }
    return str;
  } catch {
    return fallback;
  }
};

export default toDisplayText;
