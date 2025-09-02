/**
 * 통합 에러 처리 유틸리티
 * API 에러를 일관되게 처리하고 사용자 친화적인 메시지를 제공
 */

import { APIError } from '../api/config.js';

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
  ONBOARDING: 'ONBOARDING_ERROR',
  MATCHING: 'MATCHING_ERROR',
  CHAT: 'CHAT_ERROR',
  GENERAL: 'GENERAL_ERROR'
};

// 에러 메시지 맵핑
const ERROR_MESSAGES = {
  // 네트워크 에러
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  
  // 인증 에러
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  TOKEN_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
  
  // 서버 에러
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  SERVICE_UNAVAILABLE: '서비스를 일시적으로 사용할 수 없습니다.',
  
  // 클라이언트 에러
  BAD_REQUEST: '잘못된 요청입니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력한 정보를 확인해주세요.',
  DUPLICATE_ERROR: '이미 존재하는 데이터입니다.',
  
  // 기본 메시지
  DEFAULT: '오류가 발생했습니다. 다시 시도해주세요.'
};

// API 응답 에러 처리 (개선된 버전)
export const handleApiError = (error, context = '') => {
  console.error(`API Error in ${context}:`, error);

  // APIError 인스턴스인 경우
  if (error instanceof APIError) {
    throw new AppError(
      error.message,
      ERROR_TYPES.API,
      error.status,
      { context, code: error.code, originalError: error }
    );
  }

  // Axios 에러 처리
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || data?.error || ERROR_MESSAGES.SERVER_ERROR;
    const code = data?.code;

    let errorType = ERROR_TYPES.API;
    switch (status) {
      case 400:
        errorType = ERROR_TYPES.VALIDATION;
        break;
      case 401:
        errorType = ERROR_TYPES.AUTH;
        break;
      case 403:
        errorType = ERROR_TYPES.PERMISSION;
        break;
    }

    throw new AppError(
      message,
      errorType,
      status,
      { context, code, originalError: error }
    );
  } else if (error.request) {
    throw new AppError(
      ERROR_MESSAGES.NETWORK_ERROR,
      ERROR_TYPES.NETWORK,
      0,
      { context, originalError: error }
    );
  } else {
    throw new AppError(
      error.message || ERROR_MESSAGES.DEFAULT,
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
  // APIError 인스턴스 처리
  if (error instanceof APIError) {
    if (error.message && !error.message.includes('HTTP')) {
      return error.message;
    }
    return ERROR_MESSAGES[error.code] || ERROR_MESSAGES.DEFAULT;
  }

  // AppError 인스턴스 처리
  if (!(error instanceof AppError)) {
    return ERROR_MESSAGES.DEFAULT;
  }

  switch (error.type) {
    case ERROR_TYPES.NETWORK:
      return ERROR_MESSAGES.NETWORK_ERROR;

    case ERROR_TYPES.AUTH:
      return ERROR_MESSAGES.TOKEN_EXPIRED;

    case ERROR_TYPES.PERMISSION:
      return ERROR_MESSAGES.FORBIDDEN;

    case ERROR_TYPES.VALIDATION:
      return error.message || ERROR_MESSAGES.VALIDATION_ERROR;

    case ERROR_TYPES.LEVEL_TEST:
      return '레벨테스트 처리 중 문제가 발생했습니다. 다시 시도해주세요.';

    case ERROR_TYPES.WEBRTC:
      return '통화 연결에 문제가 발생했습니다. 새로고침 후 다시 시도해주세요.';

    case ERROR_TYPES.FILE_UPLOAD:
      return error.message || '파일 업로드에 실패했습니다.';
      
    case ERROR_TYPES.ONBOARDING:
      return error.message || '온보딩 처리 중 문제가 발생했습니다.';
      
    case ERROR_TYPES.MATCHING:
      return error.message || '매칭 처리 중 문제가 발생했습니다.';
      
    case ERROR_TYPES.CHAT:
      return error.message || '채팅 처리 중 문제가 발생했습니다.';

    case ERROR_TYPES.API:
    default:
      return error.message || ERROR_MESSAGES.DEFAULT;
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

// 재시도 로직을 포함한 API 호출 래퍼 (개선된 버전)
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // 재시도하지 않을 에러들
      const nonRetryableStatuses = [400, 401, 403, 404, 409, 422];
      const status = error.status || error.statusCode || error.response?.status;
      
      if (status && nonRetryableStatuses.includes(status)) {
        throw error;
      }
      
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
        delay *= Math.min(2, 1.5); // 지수적 백오프 (최대 2배)
      }
    }
  }

  // 모든 재시도 실패
  throw lastError;
};

// 온보딩 에러 처리 추가
export const handleOnboardingError = (error, step) => {
  console.error(`Onboarding Error at Step ${step}:`, error);
  
  if (error.response?.data?.code === 'ONBOARDING_ALREADY_COMPLETED') {
    throw new AppError(
      '온보딩이 이미 완료되었습니다.',
      ERROR_TYPES.ONBOARDING,
      400,
      { step, originalError: error }
    );
  }
  
  if (error.response?.data?.code === 'INVALID_STEP_ORDER') {
    throw new AppError(
      '이전 단계를 먼저 완료해주세요.',
      ERROR_TYPES.ONBOARDING,
      400,
      { step, originalError: error }
    );
  }
  
  return handleApiError(error, `Onboarding Step ${step}`);
};

// 매칭 에러 처리 추가
export const handleMatchingError = (error, context) => {
  console.error(`Matching Error:`, error);
  
  if (error.response?.data?.code === 'NO_MATCHING_PARTNERS') {
    throw new AppError(
      '현재 매칭 가능한 파트너가 없습니다.',
      ERROR_TYPES.MATCHING,
      404,
      { context, originalError: error }
    );
  }
  
  if (error.response?.data?.code === 'ALREADY_MATCHED') {
    throw new AppError(
      '이미 매칭된 파트너가 있습니다.',
      ERROR_TYPES.MATCHING,
      409,
      { context, originalError: error }
    );
  }
  
  return handleApiError(error, `Matching - ${context}`);
};

// 채팅 에러 처리 추가
export const handleChatError = (error, context) => {
  console.error(`Chat Error:`, error);
  
  if (error.response?.data?.code === 'ROOM_NOT_FOUND') {
    throw new AppError(
      '채팅방을 찾을 수 없습니다.',
      ERROR_TYPES.CHAT,
      404,
      { context, originalError: error }
    );
  }
  
  if (error.response?.data?.code === 'NOT_ROOM_MEMBER') {
    throw new AppError(
      '이 채팅방의 멤버가 아닙니다.',
      ERROR_TYPES.CHAT,
      403,
      { context, originalError: error }
    );
  }
  
  return handleApiError(error, `Chat - ${context}`);
};