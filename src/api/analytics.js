import api from './index';
import { log } from '../utils/logger';

/**
 * Analytics API Service
 * Workers analytics API와 연동하는 서비스
 */

// Workers API 기본 URL 설정
const WORKERS_API_BASE = import.meta.env.VITE_WORKERS_API_URL || 'https://api.languagemate.kr';

/**
 * 대시보드 데이터 조회
 * @returns {Promise<Object>} 대시보드 통계 데이터
 */
export const getDashboardData = async () => {
  try {
    log.info('대시보드 데이터 조회 시작', null, 'ANALYTICS');
    
    const response = await api.get(`${WORKERS_API_BASE}/api/v1/analytics/dashboard`);
    
    log.info('대시보드 데이터 조회 성공', response.data, 'ANALYTICS');
    return response.data;
  } catch (error) {
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
    
    const response = await api.get(`${WORKERS_API_BASE}/api/v1/analytics/metrics?${params}`);
    
    log.info('학습 통계 조회 성공', response.data, 'ANALYTICS');
    return response.data;
  } catch (error) {
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
    
    const response = await api.get(`${WORKERS_API_BASE}/api/v1/analytics/metrics?${params}`);
    
    log.info('세션 활동 데이터 조회 성공', response.data, 'ANALYTICS');
    return response.data;
  } catch (error) {
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
    
    // 레벨 테스트 관련 이벤트 조회
    const params = new URLSearchParams({
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년
      end: new Date().toISOString(),
      groupBy: 'path'
    });
    
    const response = await api.get(`${WORKERS_API_BASE}/api/v1/analytics/events?${params}`);
    
    // 레벨 테스트 관련 이벤트만 필터링
    const levelTestData = response.data?.events?.filter(event => 
      event.event === 'level_test_complete' || 
      event.properties?.page?.includes('level-test')
    ) || [];
    
    log.info('레벨 테스트 히스토리 조회 성공', levelTestData, 'ANALYTICS');
    return { levelTests: levelTestData };
  } catch (error) {
    log.error('레벨 테스트 히스토리 조회 실패', error, 'ANALYTICS');
    throw error;
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
      end: end.toISOString(),
      groupBy: 'status'
    });
    
    const response = await api.get(`${WORKERS_API_BASE}/api/v1/analytics/events?${params}`);
    
    // 매칭 관련 이벤트만 필터링
    const matchingData = response.data?.events?.filter(event => 
      event.event === 'matching_request' || 
      event.event === 'matching_success' || 
      event.event === 'matching_failed'
    ) || [];
    
    log.info('매칭 통계 조회 성공', matchingData, 'ANALYTICS');
    return { matchingEvents: matchingData };
  } catch (error) {
    log.error('매칭 통계 조회 실패', error, 'ANALYTICS');
    throw error;
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
    
    const response = await api.get(`${WORKERS_API_BASE}/api/v1/analytics/ai-usage?${params}`);
    
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
    
    const response = await api.get(`${WORKERS_API_BASE}/api/v1/analytics/performance?${params}`);
    
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
    
    const response = await api.post(`${WORKERS_API_BASE}/api/v1/analytics/events`, {
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

/**
 * Mock 데이터 생성 (개발/테스트용)
 */
export const generateMockAnalyticsData = () => {
  const now = new Date();
  const weekData = [];
  
  // 주간 데이터 생성
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    weekData.push({
      date: date.toISOString().split('T')[0],
      sessions: Math.floor(Math.random() * 5) + 1,
      minutes: Math.floor(Math.random() * 120) + 30,
      partners: Math.floor(Math.random() * 3) + 1,
      levelTests: Math.random() > 0.8 ? 1 : 0
    });
  }
  
  return {
    overview: {
      totalSessions: weekData.reduce((sum, day) => sum + day.sessions, 0),
      totalMinutes: weekData.reduce((sum, day) => sum + day.minutes, 0),
      weeklyGrowth: (Math.random() * 20 - 5).toFixed(1), // -5% ~ +15%
      currentStreak: Math.floor(Math.random() * 10) + 1,
      averageSessionTime: Math.round(weekData.reduce((sum, day) => sum + day.minutes, 0) / weekData.reduce((sum, day) => sum + day.sessions, 0)),
      partnersCount: new Set(weekData.flatMap(day => Array.from({length: day.partners}, (_, i) => `partner-${i}`))).size
    },
    sessionStats: weekData,
    languageProgress: [
      { language: 'English', level: 'Intermediate', progress: Math.floor(Math.random() * 30) + 60, sessions: Math.floor(Math.random() * 20) + 10 },
      { language: 'Japanese', level: 'Beginner', progress: Math.floor(Math.random() * 40) + 20, sessions: Math.floor(Math.random() * 15) + 5 },
      { language: 'Chinese', level: 'Beginner', progress: Math.floor(Math.random() * 25) + 10, sessions: Math.floor(Math.random() * 10) + 2 }
    ],
    sessionTypes: [
      { name: '1:1 대화', value: 65, color: '#00C471' },
      { name: '그룹 세션', value: 25, color: '#4285F4' },
      { name: '텍스트 채팅', value: 10, color: '#FFB800' }
    ],
    weeklyGoals: {
      current: Math.floor(Math.random() * 7) + 1,
      target: 7,
      streak: Math.floor(Math.random() * 15) + 1
    },
    topPartners: [
      { name: 'Sarah Kim', sessions: Math.floor(Math.random() * 10) + 5, rating: (Math.random() * 0.3 + 4.7).toFixed(1), flag: '🇺🇸' },
      { name: 'Yuki Tanaka', sessions: Math.floor(Math.random() * 8) + 3, rating: (Math.random() * 0.3 + 4.6).toFixed(1), flag: '🇯🇵' },
      { name: 'Li Wei', sessions: Math.floor(Math.random() * 6) + 2, rating: (Math.random() * 0.3 + 4.5).toFixed(1), flag: '🇨🇳' }
    ]
  };
};