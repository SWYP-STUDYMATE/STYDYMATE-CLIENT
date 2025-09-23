import { useState, useEffect } from 'react';
import { Languages, Loader2, ChevronDown } from 'lucide-react';
import { useRealtimeTranscription } from '../hooks/useRealtimeTranscription';
import { useRealtimeTranslation, useTranslation as useTextTranslation } from '../hooks/useTranslation';
import { DualSubtitleOverlay } from './SubtitleOverlay';

const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

export default function TranslatedSubtitles({
  localStream,
  remoteStream,
  sourceLanguage = 'auto',
  defaultTargetLanguage = 'ko',
  showOriginal = true,
  showTranslation = true,
  className = ''
}) {
  const [targetLanguage, setTargetLanguage] = useState(defaultTargetLanguage);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [localSubtitle, setLocalSubtitle] = useState(null);
  const [remoteSubtitle, setRemoteSubtitle] = useState(null);
  const [translatedLocalSubtitle, setTranslatedLocalSubtitle] = useState(null);
  const [translatedRemoteSubtitle, setTranslatedRemoteSubtitle] = useState(null);

  // 로컬 스트림 전사
  const {
    isTranscribing: isLocalTranscribing,
    toggleTranscription: toggleLocalTranscription,
    error: localError
  } = useRealtimeTranscription({
    language: sourceLanguage,
    onTranscript: (transcript) => {
      setLocalSubtitle({
        text: transcript.text,
        speaker: 'local',
        language: transcript.language
      });
    }
  });

  // 리모트 스트림 전사
  const {
    isTranscribing: isRemoteTranscribing,
    toggleTranscription: toggleRemoteTranscription,
    error: remoteError
  } = useRealtimeTranscription({
    language: sourceLanguage,
    onTranscript: (transcript) => {
      setRemoteSubtitle({
        text: transcript.text,
        speaker: 'remote',
        language: transcript.language
      });
    }
  });

  // 실시간 번역
  const {
    translateAndStore: translateLocal
  } = useRealtimeTranslation({
    sourceLanguage,
    targetLanguage,
    enabled: showTranslation
  });

  const {
    translateAndStore: translateRemote
  } = useRealtimeTranslation({
    sourceLanguage,
    targetLanguage,
    enabled: showTranslation
  });

  // 로컬 자막 번역
  useEffect(() => {
    if (localSubtitle && showTranslation) {
      translateLocal(localSubtitle).then(translation => {
        if (translation) {
          setTranslatedLocalSubtitle({
            text: translation.translated,
            speaker: 'local',
            language: targetLanguage
          });
        }
      });
    }
  }, [localSubtitle, showTranslation, translateLocal, targetLanguage]);

  // 리모트 자막 번역
  useEffect(() => {
    if (remoteSubtitle && showTranslation) {
      translateRemote(remoteSubtitle).then(translation => {
        if (translation) {
          setTranslatedRemoteSubtitle({
            text: translation.translated,
            speaker: 'remote',
            language: targetLanguage
          });
        }
      });
    }
  }, [remoteSubtitle, showTranslation, translateRemote, targetLanguage]);

  // 스트림 변경 시 자동 시작
  useEffect(() => {
    if (localStream && !isLocalTranscribing) {
      toggleLocalTranscription(localStream);
    }
  }, [localStream, isLocalTranscribing, toggleLocalTranscription]);

  useEffect(() => {
    if (remoteStream && !isRemoteTranscribing) {
      toggleRemoteTranscription(remoteStream);
    }
  }, [remoteStream, isRemoteTranscribing, toggleRemoteTranscription]);

  // 표시할 자막 결정
  const displayLocalSubtitle = showTranslation ? translatedLocalSubtitle : localSubtitle;
  const displayRemoteSubtitle = showTranslation ? translatedRemoteSubtitle : remoteSubtitle;

  return (
    <>
      {/* 언어 선택 UI */}
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Languages className="w-4 h-4" />
            <span className="text-sm font-medium">
              {showTranslation ? '번역 중' : '원본'}
            </span>
            <span className="text-xs text-gray-500">
              {SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.flag}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showLanguageMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${!showTranslation ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                >
                  원본 언어로 보기
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setTargetLanguage(lang.code);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${targetLanguage === lang.code && showTranslation ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                  >
                    <span>{lang.name}</span>
                    <span>{lang.flag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 자막 오버레이 */}
      <DualSubtitleOverlay
        localSubtitle={showOriginal ? localSubtitle : displayLocalSubtitle}
        remoteSubtitle={showOriginal ? remoteSubtitle : displayRemoteSubtitle}
        localLabel={showOriginal && showTranslation ? '원본' : '나'}
        remoteLabel={showOriginal && showTranslation ? '번역' : '상대방'}
      />

      {/* 번역된 자막 (원본과 함께 표시 시) */}
      {showOriginal && showTranslation && (
        <DualSubtitleOverlay
          localSubtitle={translatedLocalSubtitle}
          remoteSubtitle={translatedRemoteSubtitle}
          localLabel="번역"
          remoteLabel="번역"
        />
      )}

      {/* 로딩 인디케이터 */}
      {(isLocalTranscribing || isRemoteTranscribing) && (
        <div className="fixed top-4 left-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
            <span className="text-sm">자막 생성 중...</span>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {(localError || remoteError) && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg px-4 py-2 text-sm">
            {localError || remoteError}
          </div>
        </div>
      )}
    </>
  );
}

// 간단한 번역 자막 컴포넌트
export function SimpleTranslatedSubtitle({
  subtitle,
  targetLanguage = 'ko',
  className = ''
}) {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const { translateText } = useTextTranslation({ targetLanguage });

  useEffect(() => {
    if (subtitle?.text) {
      setLoading(true);
      translateText(subtitle.text, { target: targetLanguage })
        .then(result => {
          setTranslated(result);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [subtitle, targetLanguage, translateText]);

  if (!subtitle?.text) return null;

  return (
    <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div className="bg-black/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-2xl">
        <p className="text-lg font-medium text-center">{subtitle.text}</p>
        {loading ? (
          <div className="flex items-center justify-center mt-2">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : translated && (
          <p className="text-sm text-gray-300 text-center mt-2">
            {translated}
          </p>
        )}
      </div>
    </div>
  );
}
