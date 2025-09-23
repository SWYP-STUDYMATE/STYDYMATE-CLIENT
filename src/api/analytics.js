import axios from 'axios';
import { log } from '../utils/logger';

/**
 * Analytics API Service
 * Workers analytics API와 연동하는 서비스
 */

// Workers API 기본 URL 설정
const WORKERS_API_BASE =
  import.meta.env.VITE_WORKERS_API_URL ||
  import.meta.env.VITE_API_URL ||
  'https://workers.languagemate.kr';

// Workers API 전용 axios 인스턴스 생성
const workersApi = axios.create({
  baseURL: import.meta.env.DEV 
    ? '/workers'  // 개발환경: Vite proxy 사용
    : WORKERS_API_BASE, // 프로덕션: 직접 접근
  headers: {
    'Content-Type': 'application/json',
  },
});

// Workers API 인터셉터 설정
workersApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 대시보드 데이터 조회
 * @returns {Promise<Object>} 대시보드 통계 데이터
 */
export const getDashboardData = async () => {
  try {
    log.info('대시보드 데이터 조회 시작', null, 'ANALYTICS');
    
    const response = await workersApi.get('/api/v1/analytics/dashboard');
    
    log.info('대시보드 데이터 조회 성공', response.data, 'ANALYTICS');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status && [401, 403, 404].includes(status)) {
        log.warn('대시보드 데이터 조회가 권한 문제로 건너뛰어졌습니다.', { status }, 'ANALYTICS');
        return null;
      }
    }
    log.error('대시보드 데이터 조회 실패', error, 'ANALYTICS');
    throw error;
  }
};

/**
 * 사용자 학습 통계 조회
 * @param {string} timeRange - 시간 범위 (day, week, month, year)
 * @param {string} userId - 사용자 ID (선택사항)
 * @returns {Promise<Object>} 학습 통계 데이터
 */
export const getStudyStats = async (timeRange = 'week', userId = null) => {
  try {
    log.info('학습 통계 조회 시작', { timeRange, userId }, 'ANALYTICS');
    
    const params = new URLSearchParams();
    
    // 시간 범위 계산
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 7);
    }
    
    params.append('start', start.toISOString());
    params.append('end', end.toISOString());
    
    if (userId) {
      params.append('userId', userId);
    }
    
    const response = await workersApi.get(`/api/v1/analytics/metrics?${params}`);
    
    log.info('학습 통계 조회 성공', response.data, 'ANALYTICS');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status && [401, 403, 404].includes(status)) {
        log.warn('학습 통계 조회를 기본값으로 대체합니다.', { status, timeRange, userId }, 'ANALYTICS');
        return null;
      }
    }
    log.error('학습 통계 조회 실패', error, 'ANALYTICS');
    throw error;
  }
};

/**
 * 세션 활동 데이터 조회
 * @param {string} timeRange - 시간 범위
 * @returns {Promise<Object>} 세션 활동 데이터
 */
export const getSessionActivity = async (timeRange = 'week') => {
  try {
    log.info('세션 활동 데이터 조회 시작', { timeRange }, 'ANALYTICS');
    
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 7);
    }
    
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
      groupBy: 'path',
      interval: timeRange === 'day' ? '1h' : timeRange === 'week' ? '1d' : '1d'
    });
    
    const response = await workersApi.get(`/api/v1/analytics/metrics?${params}`);
    
    log.info('세션 활동 데이터 조회 성공', response.data, 'ANALYTICS');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status && [401, 403, 404].includes(status)) {
        log.warn('세션 활동 데이터 조회를 기본값으로 대체합니다.', { status, timeRange }, 'ANALYTICS');
        return null;
      }
    }
    log.error('세션 활동 데이터 조회 실패', error, 'ANALYTICS');
    throw error;
  }
};

/**
 * 레벨 테스트 결과 히스토리 조회
 * @returns {Promise<Object>} 레벨 테스트 결과 데이터
 */
export const getLevelTestHistory = async () => {
  try {
    log.info('레벨 테스트 히스토리 조회 시작', null, 'ANALYTICS');

    const response = await workersApi.get('/api/v1/analytics/dashboard');
    const levelTests = Array.isArray(response.data?.levelTests)
      ? response.data.levelTests
      : [];

    log.info('레벨 테스트 히스토리 조회 성공', levelTests, 'ANALYTICS');
    return { levelTests };
  } catch (error) {
    log.error('레벨 테스트 히스토리 조회 실패', error, 'ANALYTICS');
    return { levelTests: [] };
  }
};

/**
 * 매칭 성공률 통계 조회
 * @param {string} timeRange - 시간 범위
 * @returns {Promise<Object>} 매칭 통계 데이터
 */
export const getMatchingStats = async (timeRange = 'month') => {
  try {
    log.info('매칭 통계 조회 시작', { timeRange }, 'ANALYTICS');

    const response = await workersApi.get('/api/v1/analytics/dashboard');
    const matchingEvents = Array.isArray(response.data?.matchingEvents)
      ? response.data.matchingEvents
      : [];

    log.info('매칭 통계 조회 성공', matchingEvents, 'ANALYTICS');
    return { matchingEvents };
  } catch (error) {
    log.error('매칭 통계 조회 실패', error, 'ANALYTICS');
    return { matchingEvents: [] };
  }
};

/**
 * AI 사용량 통계 조회
 * @param {string} timeRange - 시간 범위
 * @returns {Promise<Object>} AI 사용량 데이터
 */
export const getAIUsageStats = async (timeRange = 'month') => {
  try {
    log.info('AI 사용량 통계 조회 시작', { timeRange }, 'ANALYTICS');
    
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setMonth(end.getMonth() - 1);
    }
    
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString()
    });
    
    const response = await workersApi.get(`/api/v1/analytics/ai-usage?${params}`);
    
    log.info('AI 사용량 통계 조회 성공', response.data, 'ANALYTICS');
    return response.data;
  } catch (error) {
    log.error('AI 사용량 통계 조회 실패', error, 'ANALYTICS');
    throw error;
  }
};

/**
 * 성능 통계 조회
 * @param {string} timeRange - 시간 범위
 * @returns {Promise<Object>} 성능 통계 데이터
 */
export const getPerformanceStats = async (timeRange = 'week') => {
  try {
    log.info('성능 통계 조회 시작', { timeRange }, 'ANALYTICS');
    
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      default:
        start.setDate(end.getDate() - 7);
    }
    
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
      groupBy: 'path'
    });
    
    const response = await workersApi.get(`/api/v1/analytics/performance?${params}`);
    
    log.info('성능 통계 조회 성공', response.data, 'ANALYTICS');
    return response.data;
  } catch (error) {
    log.error('성능 통계 조회 실패', error, 'ANALYTICS');
    throw error;
  }
};

/**
 * 클라이언트 이벤트 전송
 * @param {Array} events - 전송할 이벤트 배열
 * @returns {Promise<Object>} 전송 결과
 */
export const sendAnalyticsEvents = async (events) => {
  try {
    log.info('분석 이벤트 전송 시작', { count: events.length }, 'ANALYTICS');
    
    const response = await workersApi.post('/api/v1/analytics/events', {
      events
    });
    
    log.info('분석 이벤트 전송 성공', response.data, 'ANALYTICS');
    return response.data;
  } catch (error) {
    log.error('분석 이벤트 전송 실패', error, 'ANALYTICS');
    throw error;
  }
};

/**
 * 실시간 메트릭 WebSocket 연결 생성
 * @param {Function} onMessage - 메시지 수신 콜백
 * @param {Function} onError - 에러 콜백
 * @returns {WebSocket} WebSocket 연결
 */
export const connectToMetricsStream = (onMessage, onError) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('인증 토큰이 없습니다');
    }
    
    const wsUrl = `${WORKERS_API_BASE.replace('https://', 'wss://').replace('http://', 'ws://')}/api/v1/analytics/stream`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      log.info('실시간 메트릭 스트림 연결 성공', null, 'ANALYTICS');
      // 인증 토큰 전송
      ws.send(JSON.stringify({ 
        type: 'auth', 
        token 
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        log.debug('실시간 메트릭 수신', data, 'ANALYTICS');
        onMessage(data);
      } catch (error) {
        log.error('실시간 메트릭 파싱 실패', error, 'ANALYTICS');
      }
    };
    
    ws.onerror = (error) => {
      log.error('실시간 메트릭 스트림 오류', error, 'ANALYTICS');
      if (onError) onError(error);
    };
    
    ws.onclose = (event) => {
      log.info('실시간 메트릭 스트림 연결 종료', { code: event.code }, 'ANALYTICS');
    };
    
    return ws;
  } catch (error) {
    log.error('실시간 메트릭 스트림 연결 실패', error, 'ANALYTICS');
    throw error;
  }
};
