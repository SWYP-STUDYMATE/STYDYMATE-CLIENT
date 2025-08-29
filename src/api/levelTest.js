const API_BASE_URL = import.meta.env.VITE_WORKERS_URL || 'http://localhost:8787';

// 레벨 테스트 질문 조회
export async function getLevelTestQuestions() {
  try {
    const response = await fetch(`${API_BASE_URL}/level-test/questions`, {
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
    console.error('Get level test questions error:', error);
    throw error;
  }
}

// 레벨 테스트 결과 제출
export async function submitLevelTest(audioBlob, questionNumber) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, `question_${questionNumber}.webm`);
    formData.append('questionNumber', questionNumber.toString());
    formData.append('userId', localStorage.getItem('userId') || 'guest');

    const response = await fetch(`${API_BASE_URL}/level-test/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Level test submission error:', error);
    throw error;
  }
}

// 레벨 테스트 완료 및 평가 요청
export async function completeLevelTest(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/level-test/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Level test completion error:', error);
    throw error;
  }
}

// 레벨 테스트 결과 조회
export async function getLevelTestResult(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/level-test/result/${userId}`, {
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
    console.error('Get level test result error:', error);
    throw error;
  }
}

// 레벨 테스트 진행 상태 조회
export async function getLevelTestProgress(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/level-test/progress/${userId}`, {
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
    console.error('Get level test progress error:', error);
    throw error;
  }
}