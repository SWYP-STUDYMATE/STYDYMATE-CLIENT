/**
 * Whisper 모델 관련 상수 정의
 */

// Whisper 모델 이름
export const WHISPER_MODELS = {
  ENGLISH_ONLY: '@cf/openai/whisper-tiny-en',  // 영어 전용 (빠름)
  MULTILINGUAL: '@cf/openai/whisper'           // 다국어 지원
} as const;

// 영어 전용 모델을 사용할 언어 코드
export const ENGLISH_LANGUAGE_CODES = [
  'en',      // 기본 영어
  'en-US',   // 미국 영어
  'en-GB',   // 영국 영어
  'en-AU',   // 호주 영어
  'en-CA',   // 캐나다 영어
  'en-NZ',   // 뉴질랜드 영어
  'en-IE',   // 아일랜드 영어
  'en-ZA'    // 남아공 영어
] as const;

// 주요 지원 언어 (디버깅 및 로깅용)
export const MAJOR_SUPPORTED_LANGUAGES = {
  // 아시아 언어
  ko: '한국어',
  ja: '일본어',
  zh: '중국어',
  vi: '베트남어',
  th: '태국어',
  id: '인도네시아어',

  // 유럽 언어
  es: '스페인어',
  fr: '프랑스어',
  de: '독일어',
  it: '이탈리아어',
  pt: '포르투갈어',
  ru: '러시아어',
  nl: '네덜란드어',
  pl: '폴란드어',
  sv: '스웨덴어',

  // 중동/아프리카/남아시아
  ar: '아랍어',
  tr: '터키어',
  hi: '힌디어',
  he: '히브리어',
  fa: '페르시아어'
} as const;

// 파일 크기 제한
export const WHISPER_FILE_LIMITS = {
  MAX_SIZE: 25 * 1024 * 1024,        // 25MB (절대 최대)
  RECOMMENDED_SIZE: 4 * 1024 * 1024,  // 4MB (권장)
  OPTIMAL_DURATION: 30                // 30초 (최적)
} as const;

/**
 * 언어 코드에 따른 적절한 Whisper 모델 선택
 */
export function selectWhisperModel(language?: string): {
  model: string;
  isEnglishOnly: boolean;
  languageName?: string;
} {
  const lang = language || 'auto';

  // 영어 체크
  if (ENGLISH_LANGUAGE_CODES.includes(lang as any)) {
    return {
      model: WHISPER_MODELS.ENGLISH_ONLY,
      isEnglishOnly: true,
      languageName: 'English'
    };
  }

  // 다국어 모델 사용
  const languageName = MAJOR_SUPPORTED_LANGUAGES[lang as keyof typeof MAJOR_SUPPORTED_LANGUAGES];

  return {
    model: WHISPER_MODELS.MULTILINGUAL,
    isEnglishOnly: false,
    languageName: languageName || `Language: ${lang}`
  };
}

/**
 * 오디오 파일 크기 검증
 */
export function validateAudioSize(sizeInBytes: number): {
  isValid: boolean;
  isOptimal: boolean;
  message?: string;
} {
  if (sizeInBytes > WHISPER_FILE_LIMITS.MAX_SIZE) {
    return {
      isValid: false,
      isOptimal: false,
      message: `File too large: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB (max: 25MB)`
    };
  }

  if (sizeInBytes > WHISPER_FILE_LIMITS.RECOMMENDED_SIZE) {
    return {
      isValid: true,
      isOptimal: false,
      message: `File is large: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB (recommended: <4MB)`
    };
  }

  return {
    isValid: true,
    isOptimal: true
  };
}