import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Languages, 
  Eye, 
  EyeOff, 
  Download,
  Settings,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useRealtimeTranscription } from '../hooks/useRealtimeTranscription';
import { useTranslation } from '../hooks/useTranslation';

const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: '자동 감지', flag: '🌐' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export default function RealtimeSubtitlePanel({
  localStream,
  remoteStream,
  className = '',
  onTranscriptUpdate
}) {
  // UI 상태
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // 자막 설정
  const [subtitleEnabled, setSubtitleEnabled] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('ko');
  
  // 전사 결과
  const [transcripts, setTranscripts] = useState([]);
  const [translations, setTranslations] = useState([]);
  
  const transcriptContainerRef = useRef(null);

  // 로컬 스트림 전사
  const {
    isTranscribing: isLocalTranscribing,
    toggleTranscription: toggleLocalTranscription,
    error: localError
  } = useRealtimeTranscription({
    language: sourceLanguage,
    onTranscript: handleLocalTranscript
  });

  // 리모트 스트림 전사
  const {
    isTranscribing: isRemoteTranscribing,
    toggleTranscription: toggleRemoteTranscription,
    error: remoteError
  } = useRealtimeTranscription({
    language: sourceLanguage,
    onTranscript: handleRemoteTranscript
  });

  // 번역 훅
  const { translateText, loading: translationLoading } = useTranslation({
    targetLanguage,
    cacheTranslations: true
  });

  // 전사 결과 처리
  function handleLocalTranscript(transcript) {
    const newTranscript = {
      ...transcript,
      speaker: 'local',
      id: `local-${transcript.id || Date.now()}`
    };
    
    setTranscripts(prev => [...prev, newTranscript]);
    onTranscriptUpdate?.(newTranscript);
    
    // 번역 처리
    if (translationEnabled && transcript.text) {
      translateAndStore(newTranscript);
    }
  }

  function handleRemoteTranscript(transcript) {
    const newTranscript = {
      ...transcript,
      speaker: 'remote',
      id: `remote-${transcript.id || Date.now()}`
    };
    
    setTranscripts(prev => [...prev, newTranscript]);
    onTranscriptUpdate?.(newTranscript);
    
    // 번역 처리
    if (translationEnabled && transcript.text) {
      translateAndStore(newTranscript);
    }
  }

  // 번역 처리
  const translateAndStore = useCallback(async (transcript) => {
    if (!translationEnabled || sourceLanguage === targetLanguage) return;

    try {
      const translated = await translateText(transcript.text, {
        source: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        target: targetLanguage
      });

      if (translated) {
        const translationEntry = {
          id: `trans-${transcript.id}`,
          originalId: transcript.id,
          text: translated,
          speaker: transcript.speaker,
          timestamp: transcript.timestamp,
          sourceLanguage: transcript.language || sourceLanguage,
          targetLanguage
        };

        setTranslations(prev => [...prev, translationEntry]);
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [translationEnabled, translateText, sourceLanguage, targetLanguage]);

  // 자막 토글
  const handleToggleSubtitles = useCallback(async () => {
    const newState = !subtitleEnabled;
    setSubtitleEnabled(newState);

    if (newState) {
      // 자막 시작 전에 오디오 트랙 상태 확인
      let canStartLocal = false;
      let canStartRemote = false;

      if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        const hasEnabledAudio = audioTracks.some(track => track.enabled && track.readyState === 'live');
        canStartLocal = hasEnabledAudio;
        
        if (!hasEnabledAudio) {
          console.warn('⚠️ [RealtimeSubtitlePanel] 로컬 오디오가 꺼져 있어 로컬 전사를 시작할 수 없습니다.');
        }
      }

      if (remoteStream) {
        const audioTracks = remoteStream.getAudioTracks();
        const hasEnabledAudio = audioTracks.some(track => track.enabled && track.readyState === 'live');
        canStartRemote = hasEnabledAudio;
        
        if (!hasEnabledAudio) {
          console.warn('⚠️ [RealtimeSubtitlePanel] 원격 오디오가 꺼져 있어 원격 전사를 시작할 수 없습니다.');
        }
      }

      // 오디오가 하나라도 켜져 있으면 전사 시작
      if (canStartLocal && localStream) {
        try {
          await toggleLocalTranscription(localStream);
        } catch (error) {
          console.error('로컬 전사 시작 실패:', error);
          // 에러는 useRealtimeTranscription 훅에서 자동으로 처리됨
        }
      }
      
      if (canStartRemote && remoteStream) {
        try {
          await toggleRemoteTranscription(remoteStream);
        } catch (error) {
          console.error('원격 전사 시작 실패:', error);
          // 원격 전사 실패는 에러로 표시하지 않음 (로컬만 가능해도 OK)
        }
      }

      // 둘 다 시작할 수 없으면 자막을 다시 끄기
      if (!canStartLocal && !canStartRemote) {
        setSubtitleEnabled(false);
        console.warn('⚠️ [RealtimeSubtitlePanel] 오디오가 켜져 있지 않아 자막을 시작할 수 없습니다.');
        return;
      }
    } else {
      // 자막 중지
      if (isLocalTranscribing) {
        toggleLocalTranscription();
      }
      if (isRemoteTranscribing) {
        toggleRemoteTranscription();
      }
    }
  }, [
    subtitleEnabled,
    localStream,
    remoteStream,
    toggleLocalTranscription,
    toggleRemoteTranscription,
    isLocalTranscribing,
    isRemoteTranscribing
  ]);

  // 스트림 변경 시 자동 처리
  useEffect(() => {
    if (subtitleEnabled) {
      // 오디오 트랙 상태 확인 후 전사 시작
      if (localStream && !isLocalTranscribing) {
        const audioTracks = localStream.getAudioTracks();
        const hasEnabledAudio = audioTracks.some(track => track.enabled && track.readyState === 'live');
        
        if (hasEnabledAudio) {
          toggleLocalTranscription(localStream);
        } else {
          console.warn('⚠️ [RealtimeSubtitlePanel] 로컬 오디오가 꺼져 있어 전사를 시작하지 않습니다.');
        }
      }
      
      if (remoteStream && !isRemoteTranscribing) {
        const audioTracks = remoteStream.getAudioTracks();
        const hasEnabledAudio = audioTracks.some(track => track.enabled && track.readyState === 'live');
        
        if (hasEnabledAudio) {
          toggleRemoteTranscription(remoteStream);
        } else {
          console.warn('⚠️ [RealtimeSubtitlePanel] 원격 오디오가 꺼져 있어 전사를 시작하지 않습니다.');
        }
      }
    }
  }, [
    localStream,
    remoteStream,
    subtitleEnabled,
    isLocalTranscribing,
    isRemoteTranscribing,
    toggleLocalTranscription,
    toggleRemoteTranscription
  ]);

  // 오디오 트랙 상태 모니터링 (오디오가 꺼지면 전사 중지)
  useEffect(() => {
    if (!localStream || !isLocalTranscribing) return;

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const checkAudioState = () => {
      const hasEnabledAudio = audioTracks.some(track => track.enabled && track.readyState === 'live');
      
      if (!hasEnabledAudio && isLocalTranscribing) {
        console.log('🔇 [RealtimeSubtitlePanel] 오디오가 꺼져서 로컬 전사를 중지합니다.');
        toggleLocalTranscription();
      }
    };

    // 초기 체크
    checkAudioState();

    // 트랙 상태 변경 감지
    const handleTrackEnded = () => {
      checkAudioState();
    };

    audioTracks.forEach(track => {
      track.addEventListener('ended', handleTrackEnded);
    });

    // 주기적으로 체크 (트랙 enabled 상태 변경 감지)
    const checkInterval = setInterval(checkAudioState, 1000);

    return () => {
      audioTracks.forEach(track => {
        track.removeEventListener('ended', handleTrackEnded);
      });
      clearInterval(checkInterval);
    };
  }, [localStream, isLocalTranscribing, toggleLocalTranscription]);

  // 원격 오디오 트랙 상태 모니터링
  useEffect(() => {
    if (!remoteStream || !isRemoteTranscribing) return;

    const audioTracks = remoteStream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const checkAudioState = () => {
      const hasEnabledAudio = audioTracks.some(track => track.enabled && track.readyState === 'live');
      
      if (!hasEnabledAudio && isRemoteTranscribing) {
        console.log('🔇 [RealtimeSubtitlePanel] 원격 오디오가 꺼져서 원격 전사를 중지합니다.');
        toggleRemoteTranscription();
      }
    };

    // 초기 체크
    checkAudioState();

    // 트랙 상태 변경 감지
    const handleTrackEnded = () => {
      checkAudioState();
    };

    audioTracks.forEach(track => {
      track.addEventListener('ended', handleTrackEnded);
    });

    // 주기적으로 체크
    const checkInterval = setInterval(checkAudioState, 1000);

    return () => {
      audioTracks.forEach(track => {
        track.removeEventListener('ended', handleTrackEnded);
      });
      clearInterval(checkInterval);
    };
  }, [remoteStream, isRemoteTranscribing, toggleRemoteTranscription]);

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll && transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts, autoScroll]);

  // 전사 기록 다운로드
  const handleDownload = useCallback(() => {
    const content = transcripts.map(t => {
      const timestamp = new Date(t.timestamp).toLocaleTimeString();
      const speaker = t.speaker === 'local' ? '나' : '상대방';
      const translation = translations.find(tr => tr.originalId === t.id);
      
      let line = `[${timestamp}] ${speaker}: ${t.text}`;
      if (translation && translationEnabled) {
        line += `\n         번역: ${translation.text}`;
      }
      return line;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcripts, translations, translationEnabled]);

  // 기록 초기화
  const handleClear = useCallback(() => {
    setTranscripts([]);
    setTranslations([]);
  }, []);

  const getLanguageFlag = (code) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.flag || '🌐';
  };

  const isActive = subtitleEnabled && (isLocalTranscribing || isRemoteTranscribing);
  const hasError = localError || remoteError;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <MessageSquare className="w-5 h-5 text-[#00C471]" />
            <span className="font-medium">실시간 자막</span>
            {isActive && (
              <div className="flex items-center gap-1 text-xs text-[#00C471]">
                <div className="w-2 h-2 bg-[#00C471] rounded-full animate-pulse" />
                <span>활성</span>
              </div>
            )}
          </button>

          {hasError && (
            <div className="flex items-center gap-1 text-red-500 text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>오류</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 자막 토글 */}
          <button
            onClick={handleToggleSubtitles}
            className={`p-2 rounded-lg transition-colors ${
              subtitleEnabled 
                ? 'bg-[#00C471] text-white hover:bg-[#00B267]' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
            }`}
            title={subtitleEnabled ? '자막 끄기' : '자막 켜기'}
          >
            {isLocalTranscribing || isRemoteTranscribing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : subtitleEnabled ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </button>

          {/* 번역 토글 */}
          {subtitleEnabled && (
            <button
              onClick={() => setTranslationEnabled(!translationEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                translationEnabled 
                  ? 'bg-[#00C471] text-white hover:bg-[#00B267]' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
              title={translationEnabled ? '번역 끄기' : '번역 켜기'}
            >
              <Languages className="w-4 h-4" />
            </button>
          )}

          {/* 설정 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
            title="설정"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* 확장/축소 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
            title={isExpanded ? '접기' : '펼치기'}
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 설정 패널 */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-2 gap-4">
            {/* 소스 언어 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                소스 언어
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 번역 언어 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                번역 언어
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={!translationEnabled}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm disabled:opacity-50"
              >
                {SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">자동 스크롤</span>
            </label>

            <div className="text-xs text-gray-500">
              {getLanguageFlag(sourceLanguage)} → {getLanguageFlag(targetLanguage)}
            </div>
          </div>
        </div>
      )}

      {/* 자막 콘텐츠 */}
      {isExpanded && (
        <div className="flex flex-col h-80">
          {/* 자막 목록 */}
          <div 
            ref={transcriptContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {transcripts.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                {subtitleEnabled ? '음성을 기다리는 중...' : '자막을 켜려면 마이크 버튼을 클릭하세요'}
              </div>
            ) : (
              transcripts.map((transcript) => {
                const translation = translations.find(tr => tr.originalId === transcript.id);
                
                return (
                  <div 
                    key={transcript.id} 
                    className="animate-fadeIn border-l-4 border-gray-200 dark:border-gray-600 pl-3"
                    style={{
                      borderLeftColor: transcript.speaker === 'local' ? '#00C471' : '#6B7280'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        {transcript.speaker === 'local' ? (
                          <Volume2 className="w-3 h-3 text-[#00C471]" />
                        ) : (
                          <VolumeX className="w-3 h-3 text-gray-500" />
                        )}
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {transcript.speaker === 'local' ? '나' : '상대방'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(transcript.timestamp).toLocaleTimeString()}
                      </span>
                      {transcript.confidence && (
                        <span className="text-xs text-gray-400">
                          {Math.round(transcript.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    
                    {/* 원문 */}
                    <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                      {transcript.text}
                    </p>
                    
                    {/* 번역문 */}
                    {translationEnabled && translation && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                        🔄 {translation.text}
                      </p>
                    )}

                    {/* 번역 로딩 */}
                    {translationEnabled && translationLoading && !translation && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>번역 중...</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 푸터 */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                총 {transcripts.length}개 자막
                {translationEnabled && translations.length > 0 && (
                  <span> · {translations.length}개 번역</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {transcripts.length > 0 && (
                  <>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#00C471] hover:text-[#00B267] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>다운로드</span>
                    </button>
                    
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>초기화</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 에러 메시지 */}
            {hasError && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {localError || remoteError}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
