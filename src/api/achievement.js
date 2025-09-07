import api from './index.js';

/**
 * 업적 시스템 API
 */

// 모든 활성화된 업적 조회
export const getAllAchievements = async () => {
  try {
    const response = await api.get('/achievements');
    return response.data;
  } catch (error) {
    console.error('Get all achievements error:', error);
    throw error;
  }
};

// 카테고리별 업적 조회
export const getAchievementsByCategory = async (category) => {
  try {
    const response = await api.get(`/achievements/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Get achievements by category error:', error);
    throw error;
  }
};

// 내 업적 현황 조회
export const getMyAchievements = async () => {
  try {
    const response = await api.get('/achievements/my');
    return response.data;
  } catch (error) {
    console.error('Get my achievements error:', error);
    throw error;
  }
};

// 내 완료된 업적 조회
export const getMyCompletedAchievements = async () => {
  try {
    const response = await api.get('/achievements/my/completed');
    return response.data;
  } catch (error) {
    console.error('Get my completed achievements error:', error);
    throw error;
  }
};

// 내 진행 중인 업적 조회
export const getMyInProgressAchievements = async () => {
  try {
    const response = await api.get('/achievements/my/in-progress');
    return response.data;
  } catch (error) {
    console.error('Get my in-progress achievements error:', error);
    throw error;
  }
};

// 내 업적 통계 조회
export const getMyAchievementStats = async () => {
  try {
    const response = await api.get('/achievements/my/stats');
    return response.data;
  } catch (error) {
    console.error('Get my achievement stats error:', error);
    throw error;
  }
};

// 업적 진행도 업데이트
export const updateAchievementProgress = async (achievementKey, progress) => {
  try {
    const response = await api.post('/achievements/progress', {
      achievementKey,
      progress
    });
    return response.data;
  } catch (error) {
    console.error('Update achievement progress error:', error);
    throw error;
  }
};

// 업적 진행도 증가
export const incrementAchievementProgress = async (achievementKey, increment = 1) => {
  try {
    const response = await api.post('/achievements/progress/increment', null, {
      params: {
        achievementKey,
        increment
      }
    });
    return response.data;
  } catch (error) {
    console.error('Increment achievement progress error:', error);
    throw error;
  }
};

// 보상 수령
export const claimAchievementReward = async (userAchievementId) => {
  try {
    const response = await api.post(`/achievements/${userAchievementId}/claim-reward`);
    return response.data;
  } catch (error) {
    console.error('Claim achievement reward error:', error);
    throw error;
  }
};

// 업적 초기화 (새 사용자 등록시)
export const initializeAchievements = async () => {
  try {
    const response = await api.post('/achievements/initialize');
    return response.data;
  } catch (error) {
    console.error('Initialize achievements error:', error);
    throw error;
  }
};

// 업적 완료 확인
export const checkAchievementCompletion = async () => {
  try {
    const response = await api.post('/achievements/check-completion');
    return response.data;
  } catch (error) {
    console.error('Check achievement completion error:', error);
    throw error;
  }
};

// 업적 카테고리 타입
export const ACHIEVEMENT_CATEGORIES = {
  STUDY: 'STUDY',           // 학습 관련
  SOCIAL: 'SOCIAL',         // 소셜 관련
  MILESTONE: 'MILESTONE',   // 마일스톤
  SPECIAL: 'SPECIAL',       // 특별 업적
  STREAK: 'STREAK'          // 연속 학습
};

// 업적 진행 자동 추적 헬퍼 함수
export const trackAchievementEvent = async (eventType, data = {}) => {
  try {
    // 이벤트 타입에 따라 업적 진행도 자동 증가
    const achievementKeys = getAchievementKeysForEvent(eventType);
    
    const promises = achievementKeys.map(key => 
      incrementAchievementProgress(key, data.increment || 1)
    );
    
    await Promise.all(promises);
    
    // 완료 여부 확인
    const completedAchievements = await checkAchievementCompletion();
    
    return completedAchievements;
  } catch (error) {
    console.error('Track achievement event error:', error);
    // 업적 추적 실패가 메인 기능을 방해하지 않도록 에러를 조용히 처리
    return [];
  }
};

// 이벤트 타입별 업적 키 매핑
const getAchievementKeysForEvent = (eventType) => {
  const eventAchievementMap = {
    SESSION_COMPLETE: ['first_session', 'session_master', 'daily_study'],
    MATCH_SUCCESS: ['first_match', 'social_butterfly'],
    LEVEL_TEST_COMPLETE: ['level_up', 'assessment_pro'],
    CHAT_MESSAGE: ['conversation_starter', 'chat_master'],
    PROFILE_COMPLETE: ['profile_complete'],
    DAILY_LOGIN: ['daily_streak', 'weekly_streak', 'monthly_streak'],
    HELP_OTHERS: ['helpful_partner', 'mentor'],
    PERFECT_FEEDBACK: ['perfect_score', 'accuracy_master']
  };
  
  return eventAchievementMap[eventType] || [];
};