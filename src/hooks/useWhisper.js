import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../api/config.js';

const WHISPER_BASE_URL = API_ENDPOINTS.WORKERS.WHISPER;

export function useWhisper() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [progress, setProgress] = useState(0);

  const transcribeAudio = useCallback(async (audioInput, options = {}) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      let formData;
      
      if (audioInput instanceof File || audioInput instanceof Blob) {
        // 파일 또는 Blob 입력
        formData = new FormData();
        formData.append('audio', audioInput);
        
        // 옵션 추가
        if (options.language) formData.append('language', options.language);
        if (options.task) formData.append('task', options.task);
        if (options.vadFilter !== undefined) formData.append('vad_filter', options.vadFilter.toString());
        if (options.initialPrompt) formData.append('initial_prompt', options.initialPrompt);
        if (options.prefix) formData.append('prefix', options.prefix);
      } else if (typeof audioInput === 'string') {
        // Base64 문자열 입력
        const response = await fetch(`${WHISPER_BASE_URL}/transcribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            audio: audioInput,
            options: {
              language: options.language || 'auto',
              task: options.task || 'transcribe',
              vad_filter: options.vadFilter !== false,
              initial_prompt: options.initialPrompt,
              prefix: options.prefix
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setTranscription(result);
        setProgress(100);
        return result;
      } else {
        throw new Error('Invalid audio input type');
      }

      // FormData 전송
      const response = await fetch(`${WHISPER_BASE_URL}/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTranscription(result);
      setProgress(100);
      return result;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const transcribeFromURL = useCallback(async (audioUrl, options = {}) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // URL에서 오디오 파일 가져오기
      setProgress(10);
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      setProgress(30);
      const blob = await response.blob();
      
      // Blob을 사용하여 transcribe
      setProgress(50);
      return await transcribeAudio(blob, options);

    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [transcribeAudio]);

  const translateAudio = useCallback(async (audioInput, options = {}) => {
    return transcribeAudio(audioInput, {
      ...options,
      task: 'translate' // 영어로 번역
    });
  }, [transcribeAudio]);

  const getSupportedLanguages = useCallback(async () => {
    try {
      const response = await fetch(`${WHISPER_BASE_URL}/languages`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getAvailableModels = useCallback(async () => {
    try {
      const response = await fetch(`${WHISPER_BASE_URL}/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setTranscription(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    // State
    loading,
    error,
    transcription,
    progress,
    
    // Methods
    transcribeAudio,
    transcribeFromURL,
    translateAudio,
    getSupportedLanguages,
    getAvailableModels,
    reset
  };
}

// 언어 코드 헬퍼
export const WHISPER_LANGUAGES = {
  AUTO: 'auto',
  ENGLISH: 'en',
  KOREAN: 'ko',
  JAPANESE: 'ja',
  CHINESE: 'zh',
  SPANISH: 'es',
  FRENCH: 'fr',
  GERMAN: 'de',
  RUSSIAN: 'ru',
  PORTUGUESE: 'pt',
  ITALIAN: 'it',
  DUTCH: 'nl',
  POLISH: 'pl',
  TURKISH: 'tr',
  SWEDISH: 'sv',
  NORWEGIAN: 'no',
  DANISH: 'da',
  FINNISH: 'fi',
  GREEK: 'el',
  ARABIC: 'ar',
  HEBREW: 'he',
  HINDI: 'hi',
  THAI: 'th',
  VIETNAMESE: 'vi',
  INDONESIAN: 'id',
  MALAY: 'ms'
};
