const API_BASE_URL = import.meta.env.VITE_WORKERS_URL || 'http://localhost:8787';

// 매칭 파트너 검색
export async function findMatchingPartners(preferences) {
  try {
    const response = await fetch(`${API_BASE_URL}/matching/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        userId: localStorage.getItem('userId') || 'guest',
        preferences: {
          targetLanguage: preferences.targetLanguage || 'en',
          nativeLanguage: preferences.nativeLanguage || 'ko',
          proficiencyLevel: preferences.proficiencyLevel,
          sessionType: preferences.sessionType || '1on1',
          timezone: preferences.timezone || 'Asia/Seoul',
          availability: preferences.availability || [],
          interests: preferences.interests || [],
          learningGoals: preferences.learningGoals || []
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Find matching partners error:', error);
    throw error;
  }
}

// 매칭 승인
export async function acceptMatch(matchId, partnerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/matching/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        userId: localStorage.getItem('userId') || 'guest',
        matchId,
        partnerId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Accept match error:', error);
    throw error;
  }
}

// 매칭 거절
export async function rejectMatch(matchId, partnerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/matching/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        userId: localStorage.getItem('userId') || 'guest',
        matchId,
        partnerId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Reject match error:', error);
    throw error;
  }
}

// 매칭 상태 확인
export async function getMatchingStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/matching/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get matching status error:', error);
    throw error;
  }
}

// 매칭 히스토리 조회
export async function getMatchingHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/matching/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get matching history error:', error);
    throw error;
  }
}

// 추천 파트너 조회
export async function getRecommendedPartners() {
  try {
    const response = await fetch(`${API_BASE_URL}/matching/recommended`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get recommended partners error:', error);
    throw error;
  }
}

// 매칭 알고리즘 분석
export async function analyzeCompatibility(partnerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/matching/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        userId: localStorage.getItem('userId') || 'guest',
        partnerId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Analyze compatibility error:', error);
    throw error;
  }
}

// ===== Spring Boot API 연동 함수들 =====

import api from './index.js';

// Spring Boot: 추천 파트너 조회
export const getSpringBootRecommendedPartners = async (preferences = {}, page = 1, size = 20) => {
  try {
    const response = await api.get('/matching/recommendations', {
      params: {
        page,
        size,
        ageRange: preferences.ageRange,
        gender: preferences.gender,
        nationalities: preferences.nationalities?.join(','),
        targetLanguage: preferences.targetLanguage,
        proficiencyLevel: preferences.proficiencyLevel,
        sessionType: preferences.sessionType,
        interests: preferences.interests?.join(',')
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get spring boot recommended partners error:', error);
    throw error;
  }
};

// Spring Boot: 파트너 검색
export const searchSpringBootPartners = async (searchQuery, filters = {}, page = 1, size = 20) => {
  try {
    const response = await api.get('/matching/search', {
      params: {
        query: searchQuery,
        page,
        size,
        ageRange: filters.ageRange,
        gender: filters.gender,
        nationality: filters.nationality,
        targetLanguage: filters.targetLanguage,
        proficiencyLevel: filters.proficiencyLevel,
        interests: filters.interests?.join(','),
        availability: filters.availability,
        sortBy: filters.sortBy || 'relevance'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Search spring boot partners error:', error);
    throw error;
  }
};

// Spring Boot: 매칭 요청 보내기
export const sendSpringBootMatchRequest = async (partnerId, message = '') => {
  try {
    const response = await api.post('/matching/requests', {
      partnerId,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Send spring boot match request error:', error);
    throw error;
  }
};

// Spring Boot: 매칭 요청 수락
export const acceptSpringBootMatchRequest = async (requestId) => {
  try {
    const response = await api.post(`/matching/requests/${requestId}/accept`);
    return response.data;
  } catch (error) {
    console.error('Accept spring boot match request error:', error);
    throw error;
  }
};

// Spring Boot: 매칭 요청 거절
export const rejectSpringBootMatchRequest = async (requestId, reason = '') => {
  try {
    const response = await api.post(`/matching/requests/${requestId}/reject`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Reject spring boot match request error:', error);
    throw error;
  }
};

// Spring Boot: 받은 매칭 요청 목록 조회
export const getSpringBootReceivedMatchRequests = async (status = 'pending', page = 1, size = 20) => {
  try {
    const response = await api.get('/matching/requests/received', {
      params: { status, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Get spring boot received match requests error:', error);
    throw error;
  }
};

// Spring Boot: 보낸 매칭 요청 목록 조회
export const getSpringBootSentMatchRequests = async (status = 'pending', page = 1, size = 20) => {
  try {
    const response = await api.get('/matching/requests/sent', {
      params: { status, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Get spring boot sent match requests error:', error);
    throw error;
  }
};

// Spring Boot: 매칭된 파트너 목록 조회
export const getSpringBootMatches = async (page = 1, size = 20) => {
  try {
    const response = await api.get('/matching/matches', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Get spring boot matches error:', error);
    throw error;
  }
};

// Spring Boot: 매칭 설정 조회
export const getSpringBootMatchingSettings = async () => {
  try {
    const response = await api.get('/matching/settings');
    return response.data;
  } catch (error) {
    console.error('Get spring boot matching settings error:', error);
    throw error;
  }
};

// Spring Boot: 매칭 설정 업데이트
export const updateSpringBootMatchingSettings = async (settings) => {
  try {
    const response = await api.patch('/matching/settings', {
      autoAcceptMatches: settings.autoAcceptMatches,
      showOnlineStatus: settings.showOnlineStatus,
      allowMatchRequests: settings.allowMatchRequests,
      preferredAgeRange: settings.preferredAgeRange,
      preferredGenders: settings.preferredGenders,
      preferredNationalities: settings.preferredNationalities,
      preferredLanguages: settings.preferredLanguages,
      maxDistance: settings.maxDistance,
      notificationSettings: settings.notificationSettings
    });
    return response.data;
  } catch (error) {
    console.error('Update spring boot matching settings error:', error);
    throw error;
  }
};