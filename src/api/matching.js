import api from './index.js';

const WORKERS_API_BASE = import.meta.env.VITE_WORKERS_API_URL || 'http://localhost:8787';

const buildAuthHeaders = (options = { json: false }) => {
  const token = localStorage.getItem('accessToken');
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.json) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const sanitizePayload = (payload) => Object.fromEntries(
  Object.entries(payload)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
);

const buildWorkerMatchingRequest = (preferences = {}) => {
  const body = {
    userLevel: preferences.proficiencyLevel,
    targetLanguage: preferences.targetLanguage,
    nativeLanguage: preferences.nativeLanguage,
    interests: preferences.interests || [],
    availability: preferences.availability || [],
    preferredCallType: preferences.sessionType || 'both'
  };

  return {
    ...sanitizePayload(body),
    interests: body.interests,
    availability: body.availability
  };
};

// 매칭 파트너 검색
export async function findMatchingPartners(preferences) {
  try {
    const requestBody = buildWorkerMatchingRequest(preferences);

    const response = await fetch(`${WORKERS_API_BASE}/matching/request`, {
      method: 'POST',
      headers: buildAuthHeaders({ json: true }),
      body: JSON.stringify(requestBody),
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
    const response = await fetch(`${WORKERS_API_BASE}/matching/accept/${matchId}`, {
      method: 'POST',
      headers: buildAuthHeaders({ json: true }),
      body: JSON.stringify({
        partnerId,
        roomType: 'audio'
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
    const response = await fetch(`${WORKERS_API_BASE}/matching/reject/${matchId}`, {
      method: 'POST',
      headers: buildAuthHeaders({ json: true }),
      body: JSON.stringify({ partnerId })
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
    const response = await fetch(`${WORKERS_API_BASE}/matching/stats`, {
      method: 'GET',
      headers: buildAuthHeaders(),
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
    const response = await api.get('/matching/history');
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Get matching history error:', error);
    throw error;
  }
}

// 추천 파트너 조회
export async function getRecommendedPartners() {
  try {
    const response = await fetch(`${WORKERS_API_BASE}/matching/my-matches`, {
      method: 'GET',
      headers: buildAuthHeaders(),
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
    const response = await api.get(`/matching/compatibility/${partnerId}`);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Analyze compatibility error:', error);
    throw error;
  }
}

// ===== Spring Boot API 연동 함수들 =====

// Spring Boot: 추천 파트너 조회
export const getSpringBootRecommendedPartners = async (preferences = {}, page = 0, size = 20) => {
  try {
    const response = await api.get('/matching/partners', {
      params: {
        page,
        size,
        nativeLanguage: preferences.nativeLanguage,
        targetLanguage: preferences.targetLanguage,
        languageLevel: preferences.proficiencyLevel,
        minAge: preferences.minAge,
        maxAge: preferences.maxAge
      }
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Get spring boot recommended partners error:', error);
    throw error;
  }
};

// Spring Boot: 파트너 검색
export const searchSpringBootPartners = async (searchQuery, filters = {}, page = 1, size = 20) => {
  try {
    const response = await api.post('/matching/partners/advanced', {
      query: searchQuery,
      ageRange: filters.ageRange,
      gender: filters.gender,
      nationalities: filters.nationalities,
      targetLanguage: filters.targetLanguage,
      proficiencyLevel: filters.proficiencyLevel,
      interests: filters.interests,
      availability: filters.availability,
      sessionType: filters.sessionType,
      location: filters.location
    }, {
      params: {
        page,
        size
      }
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Search spring boot partners error:', error);
    throw error;
  }
};

// Spring Boot: 매칭 요청 보내기
export const sendSpringBootMatchRequest = async (partnerId, message = '') => {
  try {
    const response = await api.post('/matching/request', {
      targetUserId: partnerId,
      message
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Send spring boot match request error:', error);
    throw error;
  }
};

// Spring Boot: 매칭 요청 수락
export const acceptSpringBootMatchRequest = async (requestId) => {
  try {
    const response = await api.post(`/matching/accept/${requestId}`);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Accept spring boot match request error:', error);
    throw error;
  }
};

// Spring Boot: 매칭 요청 거절
export const rejectSpringBootMatchRequest = async (requestId, reason = '') => {
  try {
    const payload = reason ? { reason } : undefined;
    const response = await api.post(`/matching/reject/${requestId}`, payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Reject spring boot match request error:', error);
    throw error;
  }
};

// Spring Boot: 받은 매칭 요청 목록 조회
export const getSpringBootReceivedMatchRequests = async (status = 'pending', page = 1, size = 20) => {
  try {
    const response = await api.get('/matching/requests/received', {
      params: { page, size, status }
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
      params: { page, size, status }
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
