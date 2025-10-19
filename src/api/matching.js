import api from './index.js';

/**
 * 매칭 API - Workers 백엔드와 통신
 *
 * 주요 변경사항:
 * - fetch 기반 → axios 기반 api 인스턴스 사용
 * - matchId → requestId 파라미터명 변경
 * - partnerId → targetUserId 변경
 * - 불필요한 roomType, WORKERS_API_BASE 제거
 */

// ===== 파트너 추천 및 검색 =====

/**
 * 파트너 추천 목록 조회
 * @param {Object} preferences - 검색 필터
 * @param {number} page - 페이지 번호 (기본: 0)
 * @param {number} size - 페이지 크기 (기본: 20)
 * @returns {Promise<Object>} 추천 파트너 목록
 */
export async function getPartnerRecommendations(preferences = {}, page = 0, size = 20) {
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
    console.error('Get partner recommendations error:', error);
    throw error;
  }
}

/**
 * 고급 파트너 검색
 * @param {string} searchQuery - 검색 쿼리
 * @param {Object} filters - 필터 옵션
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} 검색 결과
 */
export async function searchPartners(searchQuery, filters = {}, page = 1, size = 20) {
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
      params: { page, size }
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Search partners error:', error);
    throw error;
  }
}

/**
 * [DEPRECATED] 이전 함수명 - getPartnerRecommendations 사용 권장
 */
export async function findMatchingPartners(preferences) {
  console.warn('findMatchingPartners는 deprecated되었습니다. getPartnerRecommendations를 사용하세요.');
  return getPartnerRecommendations(preferences);
}

// ===== 매칭 요청 관리 =====

/**
 * 매칭 요청 생성
 * @param {string} targetUserId - 매칭 요청 대상 사용자 ID
 * @param {string} message - 매칭 요청 메시지 (선택)
 * @returns {Promise<Object>} 요청 결과
 */
export async function createMatchRequest(targetUserId, message = '') {
  try {
    console.log('[API] Creating match request:', {
      targetUserId,
      hasMessage: !!message,
      messageLength: message?.length
    });

    const response = await api.post('/matching/request', {
      targetUserId,
      message
    });

    console.log('[API] Match request response:', {
      status: response.status,
      data: response.data
    });

    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('[API] Create match request error:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
      headers: error?.response?.headers
    });
    throw error;
  }
}

/**
 * 매칭 요청 수락
 * @param {string} requestId - 매칭 요청 ID
 * @param {string} responseMessage - 응답 메시지 (선택)
 * @returns {Promise<Object>} 수락 결과
 */
export async function acceptMatchRequest(requestId, responseMessage = '') {
  try {
    const response = await api.post(`/matching/accept/${requestId}`, {
      responseMessage
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Accept match request error:', error);
    throw error;
  }
}

/**
 * 매칭 요청 거절
 * @param {string} requestId - 매칭 요청 ID
 * @param {string} responseMessage - 거절 사유 (선택)
 * @returns {Promise<Object>} 거절 결과
 */
export async function rejectMatchRequest(requestId, responseMessage = '') {
  try {
    const response = await api.post(`/matching/reject/${requestId}`, {
      responseMessage
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Reject match request error:', error);
    throw error;
  }
}

/**
 * [DEPRECATED] 이전 함수명 - acceptMatchRequest 사용 권장
 */
export async function acceptMatch(matchId) {
  console.warn('acceptMatch는 deprecated되었습니다. acceptMatchRequest(requestId)를 사용하세요.');
  return acceptMatchRequest(matchId);
}

/**
 * [DEPRECATED] 이전 함수명 - rejectMatchRequest 사용 권장
 */
export async function rejectMatch(matchId) {
  console.warn('rejectMatch는 deprecated되었습니다. rejectMatchRequest(requestId)를 사용하세요.');
  return rejectMatchRequest(matchId);
}

// ===== 매칭 요청 목록 조회 =====

/**
 * 받은 매칭 요청 목록 조회
 * @param {string} status - 요청 상태 (pending, accepted, rejected)
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} 요청 목록
 */
export async function getReceivedMatchRequests(status = 'pending', page = 1, size = 20) {
  try {
    const response = await api.get('/matching/requests/received', {
      params: { page, size, status }
    });
    return response.data;
  } catch (error) {
    console.error('Get received match requests error:', error);
    throw error;
  }
}

/**
 * 보낸 매칭 요청 목록 조회
 * @param {string} status - 요청 상태 (pending, accepted, rejected)
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} 요청 목록
 */
export async function getSentMatchRequests(status = 'pending', page = 1, size = 20) {
  try {
    const response = await api.get('/matching/requests/sent', {
      params: { page, size, status }
    });
    return response.data;
  } catch (error) {
    console.error('Get sent match requests error:', error);
    throw error;
  }
}

// ===== 매칭된 파트너 관리 =====

/**
 * 매칭된 파트너 목록 조회
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} 매칭 목록
 */
export async function getMatches(page = 1, size = 20) {
  try {
    const normalizedPage = Number.isFinite(Number(page)) ? Number(page) : 1;
    const normalizedSize = Number.isFinite(Number(size)) ? Number(size) : 20;

    const response = await api.get('/matching/matches', {
      params: {
        page: Math.max(1, normalizedPage),
        size: Math.max(1, normalizedSize)
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get matches error:', error);
    throw error;
  }
}

/**
 * 매칭 해제
 * @param {string} matchId - 매칭 ID
 * @returns {Promise<Object>} 해제 결과
 */
export async function deleteMatch(matchId) {
  try {
    if (!matchId) {
      throw new Error('matchId is required');
    }

    const response = await api.delete(`/matching/matches/${matchId}`);
    return response.data;
  } catch (error) {
    console.error('Delete match error:', error);
    throw error;
  }
}

/**
 * 매칭 히스토리 조회
 * @returns {Promise<Object>} 히스토리 목록
 */
export async function getMatchingHistory() {
  try {
    const response = await api.get('/matching/history');
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Get matching history error:', error);
    throw error;
  }
}

// ===== 매칭 상태 및 통계 =====

/**
 * 매칭 상태 조회 (통계 포함)
 * @returns {Promise<Object>} 매칭 상태 및 통계
 */
export async function getMatchingStatus() {
  try {
    const response = await api.get('/matching/stats');
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Get matching status error:', error);
    throw error;
  }
}

/**
 * 추천 파트너 조회 (내 매칭 목록)
 * @returns {Promise<Object>} 추천 파트너 목록
 */
export async function getRecommendedPartners() {
  try {
    const response = await api.get('/matching/my-matches');
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Get recommended partners error:', error);
    throw error;
  }
}

/**
 * 호환성 분석
 * @param {string} partnerId - 분석할 파트너 ID
 * @returns {Promise<Object>} 호환성 분석 결과
 */
export async function analyzeCompatibility(partnerId) {
  try {
    const response = await api.get(`/matching/compatibility/${partnerId}`);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Analyze compatibility error:', error);
    throw error;
  }
}

// ===== 매칭 설정 관리 =====

/**
 * 매칭 설정 조회
 * @returns {Promise<Object>} 매칭 설정
 */
export async function getMatchingSettings() {
  try {
    const response = await api.get('/matching/settings');
    return response.data;
  } catch (error) {
    console.error('Get matching settings error:', error);
    throw error;
  }
}

/**
 * 매칭 설정 업데이트
 * @param {Object} settings - 업데이트할 설정
 * @returns {Promise<Object>} 업데이트 결과
 */
export async function updateMatchingSettings(settings) {
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
    console.error('Update matching settings error:', error);
    throw error;
  }
}
