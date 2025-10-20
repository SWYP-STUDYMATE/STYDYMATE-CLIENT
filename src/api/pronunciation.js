import { API_CONFIG } from './config.js';
import api from './index.js';

const unwrap = (resp) => (resp?.data?.data ?? resp?.data ?? resp);

// ===== 발음 평가 API =====

/**
 * 음성 파일 기반 발음 평가
 * @param {Blob} audioBlob - 음성 파일
 * @param {string} targetLanguage - 목표 언어 (기본: 'English')
 * @param {string} expectedText - 읽은 텍스트 (선택)
 * @returns {Promise<Object>} 발음 평가 결과
 */
export const evaluatePronunciation = async (audioBlob, targetLanguage = 'English', expectedText = null) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'pronunciation.webm');
    formData.append('targetLanguage', targetLanguage);
    if (expectedText) {
      formData.append('text', expectedText);
    }

    const response = await api.post(
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/pronunciation/evaluate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return unwrap(response);
  } catch (error) {
    console.error('Evaluate pronunciation error:', error);
    throw error;
  }
};

/**
 * 텍스트 전사 기반 발음 평가 (테스트용)
 * @param {string} transcription - 음성 전사 텍스트
 * @param {string} targetLanguage - 목표 언어 (기본: 'English')
 * @returns {Promise<Object>} 발음 평가 결과
 */
export const evaluatePronunciationFromText = async (transcription, targetLanguage = 'English') => {
  try {
    const response = await api.post(
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/pronunciation/evaluate-text`,
      {
        transcription,
        targetLanguage
      }
    );
    return unwrap(response);
  } catch (error) {
    console.error('Evaluate pronunciation from text error:', error);
    throw error;
  }
};

/**
 * 특정 언어의 음소 가이드 조회
 * @param {string} language - 언어 (예: 'english', 'korean')
 * @returns {Promise<Object>} 음소 목록 및 연습 가이드
 */
export const getPhonemeGuide = async (language = 'english') => {
  try {
    const response = await api.get(
      `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/pronunciation/phonemes/${language.toLowerCase()}`
    );
    return unwrap(response);
  } catch (error) {
    console.error('Get phoneme guide error:', error);
    throw error;
  }
};

// 기본 내보내기
export default {
  evaluatePronunciation,
  evaluatePronunciationFromText,
  getPhonemeGuide
};
