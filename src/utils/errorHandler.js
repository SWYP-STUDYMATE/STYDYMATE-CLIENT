// 통합 에러 처리 유틸리티

export class AppError extends Error {
  constructor(message, type = 'GENERAL', statusCode = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// 에러 타입 정의
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  API: 'API_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  LEVEL_TEST: 'LEVEL_TEST_ERROR',
  WEBRTC: 'WEBRTC_ERROR',
  FILE_UPLOAD: 'FILE_UPLOAD_ERROR',
  GENERAL: 'GENERAL_ERROR'
};

// API 응답 에러 처리
export const handleApiError = (error, context = '') => {
  console.error(`API Error in ${context}:`, error);

  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || data?.error || '서버 오류가 발생했습니다.';

    switch (status) {
      case 400:
        throw new AppError(
          message || '잘못된 요청입니다.',
          ERROR_TYPES.VALIDATION,
          400,
          { context, originalError: error }
        );

      case 401:
        throw new AppError(
          '로그인이 필요합니다.',
          ERROR_TYPES.AUTH,
          401,
          { context, originalError: error }
        );

      case 403:
        throw new AppError(
          '접근 권한이 없습니다.',
          ERROR_TYPES.PERMISSION,
          403,
          { context, originalError: error }
        );

      case 404:
        throw new AppError(
          '요청한 리소스를 찾을 수 없습니다.',
          ERROR_TYPES.API,
          404,
          { context, originalError: error }
        );

      case 429:
        throw new AppError(
          '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          ERROR_TYPES.API,
          429,
          { context, originalError: error }
        );

      case 500:
      default:
        throw new AppError(
          message || '서버 내부 오류가 발생했습니다.',
          ERROR_TYPES.API,
          status,
          { context, originalError: error }
        );
    }
  } else if (error.request) {
    throw new AppError(
      '네트워크 연결을 확인해주세요.',
      ERROR_TYPES.NETWORK,
      0,
      { context, originalError: error }
    );
  } else {
    throw new AppError(
      error.message || '알 수 없는 오류가 발생했습니다.',
      ERROR_TYPES.GENERAL,
      500,
      { context, originalError: error }
    );
  }
};

// 레벨테스트 전용 에러 처리
export const handleLevelTestError = (error, phase = 'unknown') => {
  console.error(`Level Test Error in ${phase}:`, error);

  if (error instanceof AppError) {
    throw error;
  }

  const message = error.message || '레벨테스트 처리 중 오류가 발생했습니다.';

  throw new AppError(
    message,
    ERROR_TYPES.LEVEL_TEST,
    error.statusCode || 500,
    { phase, originalError: error }
  );
};

// WebRTC 전용 에러 처리
export const handleWebRTCError = (error, operation = 'unknown') => {
  console.error(`WebRTC Error in ${operation}:`, error);

  if (error instanceof AppError) {
    throw error;
  }

  const message = error.message || 'WebRTC 연결 중 오류가 발생했습니다.';

  throw new AppError(
    message,
    ERROR_TYPES.WEBRTC,
    error.statusCode || 500,
    { operation, originalError: error }
  );
};

// 파일 업로드 전용 에러 처리
export const handleFileUploadError = (error, fileType = 'file') => {
  console.error(`File Upload Error for ${fileType}:`, error);

  if (error instanceof AppError) {
    throw error;
  }

  let message = `${fileType} 업로드 중 오류가 발생했습니다.`;

  if (error.name === 'FileTooLargeError') {
    message = '파일 크기가 너무 큽니다.';
  } else if (error.name === 'InvalidFileTypeError') {
    message = '지원하지 않는 파일 형식입니다.';
  }

  throw new AppError(
    message,
    ERROR_TYPES.FILE_UPLOAD,
    error.statusCode || 400,
    { fileType, originalError: error }
  );
};

// 사용자 친화적 에러 메시지 변환
export const getUserFriendlyMessage = (error) => {
  if (!(error instanceof AppError)) {
    return '알 수 없는 오류가 발생했습니다.';
  }

  switch (error.type) {
    case ERROR_TYPES.NETWORK:
      return '네트워크 연결을 확인하고 다시 시도해주세요.';

    case ERROR_TYPES.AUTH:
      return '로그인이 만료되었습니다. 다시 로그인해주세요.';

    case ERROR_TYPES.PERMISSION:
      return '이 기능을 사용할 권한이 없습니다.';

    case ERROR_TYPES.VALIDATION:
      return error.message || '입력한 정보를 확인해주세요.';

    case ERROR_TYPES.LEVEL_TEST:
      return '레벨테스트 처리 중 문제가 발생했습니다. 다시 시도해주세요.';

    case ERROR_TYPES.WEBRTC:
      return '통화 연결에 문제가 발생했습니다. 새로고침 후 다시 시도해주세요.';

    case ERROR_TYPES.FILE_UPLOAD:
      return error.message || '파일 업로드에 실패했습니다.';

    case ERROR_TYPES.API:
    default:
      return error.message || '서비스 이용 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
};

// 에러 리포팅 (선택적)
export const reportError = (error, additionalInfo = {}) => {
  if (import.meta.env.DEV) {
    console.group('🚨 Error Report');
    console.error('Error:', error);
    console.log('Additional Info:', additionalInfo);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }

  // 프로덕션에서는 외부 에러 트래킹 서비스로 전송
  // 예: Sentry, LogRocket 등
};

// 재시도 로직을 포함한 API 호출 래퍼
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // 재시도하지 않을 에러들
      if (
        error instanceof AppError &&
        [ERROR_TYPES.AUTH, ERROR_TYPES.PERMISSION, ERROR_TYPES.VALIDATION].includes(error.type)
      ) {
        throw error;
      }

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < maxRetries) {
        console.warn(`API call failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // 지수적 백오프
      }
    }
  }

  // 모든 재시도 실패
  throw lastError;
};