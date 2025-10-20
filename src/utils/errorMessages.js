/**
 * 에러 메시지 매핑 및 사용자 친화적 메시지 변환
 */

// 에러 코드별 한글 메시지
export const ERROR_MESSAGES = {
  // 인증 관련
  UNAUTHORIZED: '로그인이 필요한 서비스입니다.',
  TOKEN_EXPIRED: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
  INVALID_TOKEN: '인증 정보가 올바르지 않습니다.',
  INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',

  // 권한 관련
  FORBIDDEN: '접근 권한이 없습니다.',
  PERMISSION_DENIED: '해당 작업을 수행할 권한이 없습니다.',

  // 리소스 관련
  NOT_FOUND: '요청한 정보를 찾을 수 없습니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  ROOM_NOT_FOUND: '채팅방을 찾을 수 없습니다.',
  SESSION_NOT_FOUND: '세션을 찾을 수 없습니다.',

  // 데이터 유효성
  INVALID_INPUT: '입력한 정보가 올바르지 않습니다.',
  VALIDATION_ERROR: '입력 형식을 확인해주세요.',
  MISSING_REQUIRED_FIELD: '필수 항목을 입력해주세요.',

  // 중복 관련
  DUPLICATE_ENTRY: '이미 존재하는 정보입니다.',
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다.',
  USERNAME_ALREADY_EXISTS: '이미 사용 중인 닉네임입니다.',

  // 파일 업로드
  FILE_TOO_LARGE: '파일 크기가 너무 큽니다. (최대 10MB)',
  INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다.',
  UPLOAD_FAILED: '파일 업로드에 실패했습니다.',

  // 네트워크
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  TIMEOUT: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  SERVER_ERROR: '서버에 일시적인 문제가 발생했습니다.',

  // WebRTC
  MEDIA_PERMISSION_DENIED: '마이크/카메라 권한을 허용해주세요.',
  WEBRTC_CONNECTION_FAILED: '통화 연결에 실패했습니다.',
  PEER_CONNECTION_ERROR: '상대방과의 연결이 끊어졌습니다.',

  // Rate Limiting
  TOO_MANY_REQUESTS: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  RATE_LIMIT_EXCEEDED: '일일 사용 한도를 초과했습니다.',

  // 기타
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  MAINTENANCE: '서비스 점검 중입니다. 잠시 후 이용해주세요.',
};

/**
 * HTTP 상태 코드별 기본 메시지
 */
export const HTTP_STATUS_MESSAGES = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 정보를 찾을 수 없습니다.',
  408: '요청 시간이 초과되었습니다.',
  409: '중복된 요청입니다.',
  413: '요청 크기가 너무 큽니다.',
  429: '요청이 너무 많습니다.',
  500: '서버 오류가 발생했습니다.',
  502: '서버 연결에 실패했습니다.',
  503: '서비스를 사용할 수 없습니다.',
  504: '서버 응답 시간이 초과되었습니다.',
};

/**
 * 에러를 사용자 친화적 메시지로 변환
 * @param {Error|Object} error - 에러 객체
 * @returns {string} 사용자에게 표시할 메시지
 */
export function getUserFriendlyErrorMessage(error) {
  // 에러 코드가 있는 경우
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // 응답 에러인 경우
  if (error?.response) {
    const { status, data } = error.response;

    // 서버에서 제공한 메시지 우선
    if (data?.error?.message) {
      return data.error.message;
    }

    if (data?.message) {
      return data.message;
    }

    // 에러 코드 확인
    if (data?.error?.code && ERROR_MESSAGES[data.error.code]) {
      return ERROR_MESSAGES[data.error.code];
    }

    // HTTP 상태 코드 기반 메시지
    if (HTTP_STATUS_MESSAGES[status]) {
      return HTTP_STATUS_MESSAGES[status];
    }
  }

  // 네트워크 에러
  if (error?.request && !error?.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // 에러 메시지가 있는 경우
  if (error?.message) {
    // 특정 메시지 패턴 매칭
    const message = error.message.toLowerCase();

    if (message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT;
    }

    if (message.includes('network')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    if (message.includes('permission') || message.includes('denied')) {
      return ERROR_MESSAGES.MEDIA_PERMISSION_DENIED;
    }
  }

  // 기본 메시지
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * 에러 심각도 결정
 * @param {Error|Object} error - 에러 객체
 * @returns {'error'|'warning'|'info'} 심각도 레벨
 */
export function getErrorSeverity(error) {
  const status = error?.response?.status;

  if (status >= 500) return 'error';
  if (status === 429) return 'warning';
  if (status >= 400 && status < 500) return 'warning';

  return 'info';
}

/**
 * 에러 로깅 여부 결정
 * @param {Error|Object} error - 에러 객체
 * @returns {boolean} 로깅 필요 여부
 */
export function shouldLogError(error) {
  const status = error?.response?.status;

  // 4xx 에러는 클라이언트 문제이므로 로깅 생략 가능
  if (status >= 400 && status < 500) {
    return false;
  }

  // 5xx 에러는 반드시 로깅
  if (status >= 500) {
    return true;
  }

  // 네트워크 에러는 로깅
  if (error?.request && !error?.response) {
    return true;
  }

  return true;
}

/**
 * 재시도 가능 여부 결정
 * @param {Error|Object} error - 에러 객체
 * @returns {boolean} 재시도 가능 여부
 */
export function isRetryableError(error) {
  const status = error?.response?.status;

  // 네트워크 에러는 재시도 가능
  if (error?.request && !error?.response) {
    return true;
  }

  // 429, 502, 503, 504는 재시도 가능
  return [429, 502, 503, 504].includes(status);
}
