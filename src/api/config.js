/**
 * API 설정 파일
 * 모든 API 엔드포인트와 설정을 중앙에서 관리
 */

// 환경변수에서 API URL 가져오기
export const API_CONFIG = {
  // Spring Boot 메인 서버
  MAIN_SERVER: import.meta.env.VITE_API_URL || "https://api.languagemate.kr",

  // Cloudflare Workers API (음성 처리용)
  WORKERS_API:
    import.meta.env.VITE_WORKERS_API_URL || "https://workers.languagemate.kr",

  // WebSocket URL
  WS_URL: import.meta.env.VITE_WS_URL || "https://api.languagemate.kr",

  // API 버전
  API_VERSION: "/api/v1",

  // 타임아웃 설정
  TIMEOUT: 30000, // 30초

  // 재시도 설정
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1초
    BACKOFF_MULTIPLIER: 2,
  },
};

// 도메인별 API 엔드포인트
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/auth`,
    LOGIN: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/login`,
    LOGOUT: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/auth/logout`,
    REFRESH: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/auth/refresh`,
    OAUTH: {
      NAVER: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/login/oauth2/code/naver`,
      GOOGLE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/login/oauth2/code/google`,
    },
  },

  // 사용자 관련
  USER: {
    BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/users`,
    PROFILE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/users/profile`,
    UPDATE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/users/update`,
    DELETE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/users/delete`,
  },

  // 온보딩 관련
  ONBOARDING: {
    BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding`,
    STEP: (stepNumber) =>
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/steps/${stepNumber}/save`,
    CURRENT: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/steps/current`,
    SKIP: (stepNumber) =>
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/steps/${stepNumber}/skip`,
    COMPLETE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/complete`,
    PROGRESS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/progress`,
    DATA: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/data`,
  },

  // 온보드 (세부 설정) 관련
  ONBOARD: {
    LANGUAGE: {
      BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/language`,
      LANGUAGES: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/language/languages`,
      NATIVE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/language/native-language`,
      LEVEL: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/language/language-level`,
      LEVEL_TYPES_LANGUAGE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/language/level-types-language`,
      LEVEL_TYPES_PARTNER: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/language/level-types-partner`,
    },
    INTEREST: {
      BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/interest`,
      MOTIVATIONS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/interest/motivations`,
      TOPICS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/interest/topics`,
      LEARNING_STYLES: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/interest/learning-styles`,
      LEARNING_EXPECTATIONS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/interest/learning-expectations`,
      MOTIVATION: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/interest/motivation`,
      TOPIC: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/interest/topic`,
      LEARNING_STYLE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/interest/learning-style`,
      LEARNING_EXPECTATION: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/interest/learning-expectation`,
    },
    PARTNER: {
      BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/partner`,
      PERSONALITY: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/partner/personality`,
      GROUP_SIZE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/partner/group-size`,
    },
    SCHEDULE: {
      BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/schedule`,
      SCHEDULE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/onboarding/schedule/schedule`,
    },
  },

  // 레벨 테스트 관련 (Spring Boot 서버 사용)
  LEVEL_TEST: {
    BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test`,
    START: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/start`,
    SUBMIT: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/submit`,
    COMPLETE: (testId) =>
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/${testId}/complete`,
    GET: (testId) =>
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/${testId}`,
    MY_TESTS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/my-tests`,
    SUMMARY: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/summary`,
    // 음성 테스트
    VOICE: {
      START: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/voice/start`,
      UPLOAD: (testId) =>
        `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/voice/${testId}/upload`,
      ANALYZE: (testId) =>
        `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/voice/${testId}/analyze`,
      RESULT: (testId) =>
        `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/level-test/voice/${testId}/result`,
    },
  },

  // Workers API (음성 처리 및 WebRTC)
  WORKERS: {
    // 음성 처리
    WHISPER: `${API_CONFIG.WORKERS_API}/api/whisper`,
    TTS: `${API_CONFIG.WORKERS_API}/api/tts`,
    AUDIO_PROCESS: `${API_CONFIG.WORKERS_API}/api/audio/process`,

    // WebRTC 화상 통화
    WEBRTC: {
      CREATE_ROOM: `${API_CONFIG.WORKERS_API}/api/v1/room/create`,
      JOIN_ROOM: (roomId) => `${API_CONFIG.WORKERS_API}/webrtc/${roomId}/join`,
      LEAVE_ROOM: (roomId) =>
        `${API_CONFIG.WORKERS_API}/webrtc/${roomId}/leave`,
      GET_ROOM_INFO: (roomId) =>
        `${API_CONFIG.WORKERS_API}/webrtc/${roomId}/info`,
      GET_ICE_SERVERS: (roomId) =>
        `${API_CONFIG.WORKERS_API}/webrtc/${roomId}/ice-servers`,
      WEBSOCKET: (roomId, userId, userName) =>
        `${API_CONFIG.WORKERS_API.replace(
          "https",
          "wss"
        )}/webrtc/${roomId}/ws?userId=${userId}&userName=${encodeURIComponent(
          userName
        )}`,
    },
  },

  // 매칭 관련
  MATCHING: {
    BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching`,
    PARTNERS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/partners`,
    REQUEST: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/request`,
    ACCEPT: (matchId) =>
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/accept/${matchId}`,
    REJECT: (matchId) =>
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/reject/${matchId}`,
    STATUS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/status`,
  },

  // 채팅 관련
  CHAT: {
    BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/chat`,
    ROOMS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/chat/rooms`,
    MESSAGES: (roomId) =>
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/chat/rooms/${roomId}/messages`,
    SEND: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/chat/send`,
    LEAVE: (roomId) =>
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/chat/rooms/${roomId}/leave`,
    UPLOAD_IMAGE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/chat/upload/image`,
  },

  // 세션 관련
  SESSION: {
    BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/sessions`,
    CREATE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/sessions/create`,
    JOIN: (sessionId) =>
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/sessions/${sessionId}/join`,
    LEAVE: (sessionId) =>
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/sessions/${sessionId}/leave`,
    LIST: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/sessions/list`,
  },

  // 설정 관련
  SETTINGS: {
    BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/settings`,
    ACCOUNT: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/settings/account`,
    PRIVACY: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/settings/privacy`,
    NOTIFICATION: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/settings/notification`,
    LANGUAGE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/settings/language`,
    SECURITY: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/settings/security`,
  },
};

// WebSocket 엔드포인트
export const WS_ENDPOINTS = {
  CONNECT: `${API_CONFIG.WS_URL}/ws`,
  CHAT: "/topic/chat",
  NOTIFICATION: "/topic/notification",
  USER: "/user/queue/messages",
};

// 헤더 설정
export const getHeaders = (isFormData = false) => {
  const headers = {
    Accept: "application/json",
  };

  // FormData가 아닌 경우에만 Content-Type 설정
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // 인증 토큰 추가
  const token = localStorage.getItem("accessToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// API 호출 유틸리티
export const apiCall = async (url, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...getHeaders(options.body instanceof FormData),
      ...options.headers,
    },
    timeout: API_CONFIG.TIMEOUT,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        error.message || `HTTP ${response.status}`,
        error.code || "HTTP_ERROR",
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error.message || "Network error", "NETWORK_ERROR", 0);
  }
};

// 표준화된 에러 클래스
export class APIError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = "APIError";
    this.code = code;
    this.status = status;
  }
}

export default {
  API_CONFIG,
  API_ENDPOINTS,
  WS_ENDPOINTS,
  getHeaders,
  apiCall,
  APIError,
};
