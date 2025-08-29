/**
 * 개선된 레벨 테스트 API 클라이언트
 * 
 * 주요 개선사항:
 * 1. 표준 에러 처리
 * 2. 일관된 응답 형식
 * 3. 재시도 로직
 * 4. 타입 안정성
 * 5. 로딩 상태 관리
 */

const API_BASE_URL = import.meta.env.VITE_WORKERS_URL || 'http://localhost:8787';

// 커스텀 에러 클래스들
class APIError extends Error {
  constructor(code, message, details = null, status = 500) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

class ValidationError extends APIError {
  constructor(message, field = null, details = null) {
    super('VALIDATION_ERROR', message, details, 400);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class NetworkError extends APIError {
  constructor(message = 'Network connection failed') {
    super('NETWORK_ERROR', message, null, 0);
    this.name = 'NetworkError';
  }
}

// API 클라이언트 클래스
class LevelTestAPIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  // 인증 헤더 생성
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new APIError('UNAUTHORIZED', 'Access token required', null, 401);
    }
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // HTTP 요청 래퍼
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(),
        ...options.headers
      },
      ...options
    };

    // Content-Type이 multipart/form-data인 경우 제거
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError || error.message.includes('Failed to fetch')) {
        throw new NetworkError('네트워크 연결을 확인해주세요');
      }
      throw error;
    }
  }

  // 응답 처리
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    // 바이너리 응답 (오디오 파일 등)
    if (contentType && !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new APIError('HTTP_ERROR', `HTTP ${response.status}`, null, response.status);
      }
      return response;
    }

    // JSON 응답 파싱
    let data;
    try {
      data = await response.json();
    } catch (error) {
      if (!response.ok) {
        throw new APIError('HTTP_ERROR', `HTTP ${response.status}`, null, response.status);
      }
      throw new APIError('PARSE_ERROR', 'Invalid JSON response');
    }

    // 성공 응답
    if (response.ok) {
      // 표준 응답 형식인 경우
      if (data.success !== undefined) {
        return data.success ? data.data : data;
      }
      // 레거시 응답 형식
      return data;
    }

    // 에러 응답 처리
    if (data.error) {
      const { code, message, details, field } = data.error;
      
      switch (code) {
        case 'VALIDATION_ERROR':
          throw new ValidationError(message, field, details);
        case 'UNAUTHORIZED':
        case 'INVALID_TOKEN':
          // 토큰 만료 시 자동 로그아웃
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
          throw new APIError(code, message, details, 401);
        default:
          throw new APIError(code, message, details, response.status);
      }
    }

    // 표준 에러 형식이 아닌 경우
    throw new APIError('HTTP_ERROR', `HTTP ${response.status}`, null, response.status);
  }

  // 재시도 로직이 포함된 요청
  async requestWithRetry(endpoint, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.request(endpoint, options);
      } catch (error) {
        lastError = error;
        
        // 재시도하지 않을 에러들
        if (error instanceof ValidationError || 
            error.status === 401 || 
            error.status === 403 || 
            error.status === 404) {
          throw error;
        }
        
        // 마지막 시도인 경우
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 지수 백오프로 대기
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.warn(`Request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`, error);
      }
    }
    
    throw lastError;
  }

  // === 레벨 테스트 API 메서드들 ===

  /**
   * 레벨 테스트 질문 목록 조회
   * @returns {Promise<Array>} 질문 목록
   */
  async getQuestions() {
    try {
      const response = await this.request('/level-test/questions');
      return response.questions || response;
    } catch (error) {
      console.error('Get level test questions error:', error);
      throw error;
    }
  }

  /**
   * 개별 질문 음성 답변 제출
   * @param {Blob} audioBlob - 음성 파일
   * @param {number} questionNumber - 질문 번호 (1-4)
   * @returns {Promise<Object>} 제출 결과
   */
  async submitAnswer(audioBlob, questionNumber) {
    if (!audioBlob || !(audioBlob instanceof Blob)) {
      throw new ValidationError('유효한 음성 파일이 필요합니다', 'audio');
    }
    
    if (!questionNumber || questionNumber < 1 || questionNumber > 4) {
      throw new ValidationError('유효한 질문 번호가 필요합니다 (1-4)', 'questionNumber');
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, `question_${questionNumber}.webm`);
    formData.append('questionNumber', questionNumber.toString());
    formData.append('userId', localStorage.getItem('userId') || 'guest');

    try {
      const response = await this.requestWithRetry('/level-test/submit', {
        method: 'POST',
        body: formData
      });

      return response;
    } catch (error) {
      console.error('Level test submission error:', error);
      
      // 사용자 친화적 에러 메시지
      if (error.status === 413) {
        throw new APIError('FILE_TOO_LARGE', '음성 파일 크기가 너무 큽니다. 다시 녹음해주세요.');
      } else if (error.status === 415) {
        throw new APIError('UNSUPPORTED_FORMAT', '지원하지 않는 파일 형식입니다.');
      }
      
      throw error;
    }
  }

  /**
   * 테스트 완료 및 평가 요청
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 평가 결과
   */
  async completeTest(userId) {
    if (!userId) {
      throw new ValidationError('사용자 ID가 필요합니다', 'userId');
    }

    try {
      const response = await this.requestWithRetry('/level-test/complete', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });

      return response;
    } catch (error) {
      console.error('Level test completion error:', error);
      
      // 비즈니스 로직 에러 처리
      if (error.code === 'INSUFFICIENT_SUBMISSIONS') {
        throw new APIError('INSUFFICIENT_SUBMISSIONS', '평가를 위해 최소 2개 이상의 답변이 필요합니다.');
      } else if (error.code === 'TEST_ALREADY_COMPLETED') {
        throw new APIError('TEST_ALREADY_COMPLETED', '이미 완료된 테스트입니다.');
      }
      
      throw error;
    }
  }

  /**
   * 레벨 테스트 결과 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 테스트 결과
   */
  async getResult(userId) {
    if (!userId) {
      throw new ValidationError('사용자 ID가 필요합니다', 'userId');
    }

    try {
      const response = await this.request(`/level-test/result/${userId}`);
      return response;
    } catch (error) {
      console.error('Get level test result error:', error);
      
      if (error.status === 404) {
        throw new APIError('RESULT_NOT_FOUND', '테스트 결과를 찾을 수 없습니다. 먼저 테스트를 완료해주세요.');
      }
      
      throw error;
    }
  }

  /**
   * 테스트 진행 상황 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 진행 상황
   */
  async getProgress(userId) {
    if (!userId) {
      throw new ValidationError('사용자 ID가 필요합니다', 'userId');
    }

    try {
      const response = await this.request(`/level-test/progress/${userId}`);
      return response;
    } catch (error) {
      console.error('Get level test progress error:', error);
      throw error;
    }
  }

  /**
   * 음성 파일 다운로드 URL 생성
   * @param {string} userId - 사용자 ID
   * @param {string} questionId - 질문 ID
   * @returns {string} 다운로드 URL
   */
  getAudioURL(userId, questionId) {
    if (!userId || !questionId) {
      throw new ValidationError('사용자 ID와 질문 ID가 필요합니다');
    }
    
    return `${this.baseURL}/level-test/audio/${userId}/${questionId}`;
  }

  /**
   * 음성 파일 스트림 다운로드
   * @param {string} userId - 사용자 ID
   * @param {string} questionId - 질문 ID
   * @returns {Promise<Response>} 음성 파일 응답
   */
  async downloadAudio(userId, questionId) {
    if (!userId || !questionId) {
      throw new ValidationError('사용자 ID와 질문 ID가 필요합니다');
    }

    try {
      const response = await this.request(`/level-test/audio/${userId}/${questionId}`);
      return response; // Response 객체 반환
    } catch (error) {
      console.error('Audio download error:', error);
      
      if (error.status === 404) {
        throw new APIError('AUDIO_NOT_FOUND', '음성 파일을 찾을 수 없습니다.');
      }
      
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const levelTestAPI = new LevelTestAPIClient();

// 레거시 호환성을 위한 함수 익스포트
export const getLevelTestQuestions = () => levelTestAPI.getQuestions();
export const submitLevelTest = (audioBlob, questionNumber) => levelTestAPI.submitAnswer(audioBlob, questionNumber);
export const completeLevelTest = (userId) => levelTestAPI.completeTest(userId);
export const getLevelTestResult = (userId) => levelTestAPI.getResult(userId);
export const getLevelTestProgress = (userId) => levelTestAPI.getProgress(userId);

// 새로운 API 클라이언트 익스포트
export { levelTestAPI, APIError, ValidationError, NetworkError };
export default levelTestAPI;