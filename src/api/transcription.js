const API_BASE_URL = import.meta.env.VITE_WORKERS_URL || 'http://localhost:8787';

// 실시간 음성 전사
export async function transcribeAudio(audioBlob, options = {}) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('language', options.language || 'en');
    formData.append('userId', localStorage.getItem('userId') || 'guest');
    
    if (options.sessionId) {
      formData.append('sessionId', options.sessionId);
    }

    const response = await fetch(`${API_BASE_URL}/transcription/audio`, {
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
    console.error('Transcribe audio error:', error);
    throw error;
  }
}

// 텍스트 번역
export async function translateText(text, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/translation/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        text,
        sourceLang: options.sourceLang || 'auto',
        targetLang: options.targetLang || 'en',
        userId: localStorage.getItem('userId') || 'guest',
        sessionId: options.sessionId || null
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Translate text error:', error);
    throw error;
  }
}

// 실시간 스트리밍 전사 시작
export async function startStreamingTranscription(sessionId, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/transcription/stream/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        sessionId,
        language: options.language || 'en',
        userId: localStorage.getItem('userId') || 'guest',
        config: {
          interim_results: options.interimResults || true,
          enable_automatic_punctuation: options.enablePunctuation || true,
          enable_speaker_diarization: options.enableSpeakerDiarization || false,
          model: options.model || 'latest_long'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Start streaming transcription error:', error);
    throw error;
  }
}

// 실시간 스트리밍 전사 종료
export async function stopStreamingTranscription(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/transcription/stream/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        sessionId,
        userId: localStorage.getItem('userId') || 'guest'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Stop streaming transcription error:', error);
    throw error;
  }
}

// 스트리밍 오디오 데이터 전송
export async function sendAudioChunk(sessionId, audioChunk) {
  try {
    const response = await fetch(`${API_BASE_URL}/transcription/stream/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'X-Session-Id': sessionId,
        'X-User-Id': localStorage.getItem('userId') || 'guest'
      },
      body: audioChunk,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Send audio chunk error:', error);
    throw error;
  }
}

// WebSocket을 통한 실시간 전사 연결
export function connectTranscriptionWebSocket(sessionId, options = {}) {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const apiHost = new URL(API_BASE_URL).host;
  const accessToken = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId') || 'guest';
  
  const wsUrl = `${wsProtocol}//${apiHost}/transcription/ws?sessionId=${sessionId}&userId=${userId}&token=${accessToken}`;
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('Transcription WebSocket connected');
    
    // Send configuration
    ws.send(JSON.stringify({
      type: 'config',
      config: {
        language: options.language || 'en',
        interim_results: options.interimResults !== false,
        enable_automatic_punctuation: options.enablePunctuation !== false,
        translation_target: options.translationTarget || null
      }
    }));
  };
  
  return ws;
}

// 언어 감지
export async function detectLanguage(text) {
  try {
    const response = await fetch(`${API_BASE_URL}/translation/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({
        text,
        userId: localStorage.getItem('userId') || 'guest'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Detect language error:', error);
    throw error;
  }
}

// 지원되는 언어 목록 조회
export async function getSupportedLanguages() {
  try {
    const response = await fetch(`${API_BASE_URL}/translation/languages`, {
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
    console.error('Get supported languages error:', error);
    throw error;
  }
}