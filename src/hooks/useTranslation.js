import { useState, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_WORKERS_API_URL || 'https://workers.languagemate.kr';

export function useTranslation({
  targetLanguage = 'en',
  cacheTranslations = true,
  maxCacheSize = 100
} = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());

  // 캐시 키 생성
  const getCacheKey = (text, source, target) => 
    `${source || 'auto'}->${target}:${text}`;

  // 단일 텍스트 번역
  const translateText = useCallback(async (text, options = {}) => {
    if (!text || !text.trim()) return text;

    const source = options.source || 'auto';
    const target = options.target || targetLanguage;

    // 캐시 확인
    if (cacheTranslations) {
      const cacheKey = getCacheKey(text, source, target);
      if (cacheRef.current.has(cacheKey)) {
        return cacheRef.current.get(cacheKey);
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/translate/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          source: source === 'auto' ? undefined : source,
          target,
          preserveFormatting: options.preserveFormatting
        })
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // 캐시 저장
      if (cacheTranslations && result.translatedText) {
        const cacheKey = getCacheKey(text, source, target);
        cacheRef.current.set(cacheKey, result.translatedText);
        
        // 캐시 크기 제한
        if (cacheRef.current.size > maxCacheSize) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
      }

      return result.translatedText;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [targetLanguage, cacheTranslations, maxCacheSize]);

  // 일괄 번역
  const translateBatch = useCallback(async (texts, options = {}) => {
    if (!texts || texts.length === 0) return [];

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/translate/translate/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          texts,
          source: options.source,
          target: options.target || targetLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Batch translation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.translations;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [targetLanguage]);

  // 자막 번역
  const translateSubtitle = useCallback(async (subtitle, options = {}) => {
    if (!subtitle?.text) return subtitle;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/translate/translate/subtitle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subtitle,
          targetLanguage: options.targetLanguage || targetLanguage,
          context: options.context
        })
      });

      if (!response.ok) {
        throw new Error(`Subtitle translation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.translatedSubtitle;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [targetLanguage]);

  // 지원 언어 목록 가져오기
  const getLanguages = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/translate/languages`);
      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }
      const result = await response.json();
      return result.languages;
    } catch (err) {
      console.error('Failed to fetch languages:', err);
      return [];
    }
  }, []);

  // 캐시 초기화
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    // 상태
    loading,
    error,
    
    // 메서드
    translateText,
    translateBatch,
    translateSubtitle,
    getLanguages,
    clearCache,
    
    // 캐시 정보
    cacheSize: cacheRef.current.size
  };
}

// 실시간 번역 훅
export function useRealtimeTranslation({
  sourceLanguage = 'auto',
  targetLanguage = 'en',
  enabled = true
} = {}) {
  const [translations, setTranslations] = useState([]);
  const { translateSubtitle } = useTranslation({ targetLanguage });
  const contextRef = useRef([]);

  // 자막 번역 및 저장
  const translateAndStore = useCallback(async (subtitle) => {
    if (!enabled || !subtitle?.text) return;

    try {
      // 문맥 준비 (최근 5개)
      const context = contextRef.current.slice(-5).map(t => t.text);
      
      // 번역 실행
      const translated = await translateSubtitle(subtitle, {
        targetLanguage,
        context
      });

      if (translated) {
        const translationEntry = {
          id: `trans-${Date.now()}`,
          original: subtitle,
          translated: translated.translatedText,
          sourceLanguage: translated.sourceLanguage || sourceLanguage,
          targetLanguage,
          timestamp: new Date().toISOString()
        };

        // 상태 업데이트
        setTranslations(prev => [...prev, translationEntry]);
        
        // 문맥 업데이트
        contextRef.current.push(subtitle);
        if (contextRef.current.length > 10) {
          contextRef.current.shift();
        }

        return translationEntry;
      }
    } catch (err) {
      console.error('Real-time translation error:', err);
    }
  }, [enabled, sourceLanguage, targetLanguage, translateSubtitle]);

  // 번역 기록 초기화
  const clearTranslations = useCallback(() => {
    setTranslations([]);
    contextRef.current = [];
  }, []);

  // 번역 기록 내보내기
  const exportTranslations = useCallback((format = 'text') => {
    if (translations.length === 0) return null;

    if (format === 'text') {
      return translations.map(t => 
        `[${new Date(t.timestamp).toLocaleTimeString()}]
원문 (${t.sourceLanguage}): ${t.original.text}
번역 (${t.targetLanguage}): ${t.translated}
`
      ).join('\n');
    }

    if (format === 'json') {
      return JSON.stringify(translations, null, 2);
    }

    if (format === 'csv') {
      const header = 'Time,Source Language,Original,Target Language,Translation\n';
      const rows = translations.map(t => 
        `"${new Date(t.timestamp).toLocaleTimeString()}","${t.sourceLanguage}","${t.original.text}","${t.targetLanguage}","${t.translated}"`
      ).join('\n');
      return header + rows;
    }

    return translations;
  }, [translations]);

  return {
    // 상태
    translations,
    latestTranslation: translations[translations.length - 1],
    
    // 메서드
    translateAndStore,
    clearTranslations,
    exportTranslations,
    
    // 통계
    stats: {
      totalTranslations: translations.length,
      languages: [...new Set(translations.map(t => t.sourceLanguage))]
    }
  };
}
