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