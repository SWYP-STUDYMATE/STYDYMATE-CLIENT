import { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare, X, Languages, Volume2 } from 'lucide-react';

export default function SubtitleOverlay({ 
  subtitle,
  position = 'bottom',
  showLanguage = true,
  showSpeaker = false,
  autoHide = true,
  hideDelay = 4000,
  onClose 
}) {
  const [isVisible, setIsVisible] = useState(false);

  const hideTimer = useCallback(() => {
    if (!autoHide) return;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
    return timer;
  }, [autoHide, hideDelay]);

  useEffect(() => {
    if (subtitle) {
      setIsVisible(true);
      const timer = hideTimer();
      return () => timer && clearTimeout(timer);
    }
  }, [subtitle, hideTimer]);

  const positionClasses = useMemo(() => ({
    top: 'top-4 left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-20 left-1/2 transform -translate-x-1/2',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }), []);

  if (!subtitle || !isVisible) return null;

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="bg-black/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-2xl max-w-2xl">
        <div className="flex items-center gap-3">
          {showSpeaker && subtitle.speaker && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Volume2 className="w-3 h-3" />
              <span>{subtitle.speaker}</span>
            </div>
          )}
          {showLanguage && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Languages className="w-3 h-3" />
              <span>{subtitle.language || 'auto'}</span>
            </div>
          )}
          <p className="text-lg font-medium leading-relaxed flex-1">{subtitle.text}</p>
          {subtitle.confidence && (
            <div className="text-xs text-gray-500 ml-2">
              {Math.round(subtitle.confidence * 100)}%
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 멀티 자막 오버레이 (본인 + 상대방)
export function DualSubtitleOverlay({ 
  localSubtitle,
  remoteSubtitle,
  localLabel = '나',
  remoteLabel = '상대방',
  showConfidence = false,
  showTimestamp = false,
  className = ''
}) {
  const [localVisible, setLocalVisible] = useState(false);
  const [remoteVisible, setRemoteVisible] = useState(false);

  useEffect(() => {
    if (localSubtitle) {
      setLocalVisible(true);
      const timer = setTimeout(() => setLocalVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [localSubtitle]);

  useEffect(() => {
    if (remoteSubtitle) {
      setRemoteVisible(true);
      const timer = setTimeout(() => setRemoteVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [remoteSubtitle]);

  return (
    <div className={className}>
      {/* 로컬 자막 (하단 왼쪽) */}
      {localSubtitle && localVisible && (
        <div className="fixed bottom-20 left-4 z-50 transition-all duration-300 animate-fadeIn">
          <div className="bg-[#00C471]/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-green-200 font-medium">{localLabel}</div>
              {showTimestamp && localSubtitle.timestamp && (
                <div className="text-xs text-green-300">
                  {new Date(localSubtitle.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
            <p className="text-sm font-medium leading-relaxed">{localSubtitle.text}</p>
            {showConfidence && localSubtitle.confidence && (
              <div className="text-xs text-green-300 mt-1">
                신뢰도: {Math.round(localSubtitle.confidence * 100)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* 리모트 자막 (하단 오른쪽) */}
      {remoteSubtitle && remoteVisible && (
        <div className="fixed bottom-20 right-4 z-50 transition-all duration-300 animate-fadeIn">
          <div className="bg-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-gray-400 font-medium">{remoteLabel}</div>
              {showTimestamp && remoteSubtitle.timestamp && (
                <div className="text-xs text-gray-500">
                  {new Date(remoteSubtitle.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
            <p className="text-sm font-medium leading-relaxed">{remoteSubtitle.text}</p>
            {showConfidence && remoteSubtitle.confidence && (
              <div className="text-xs text-gray-500 mt-1">
                신뢰도: {Math.round(remoteSubtitle.confidence * 100)}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 자막 히스토리 패널
export function SubtitleHistory({ 
  subtitles = [],
  maxItems = 50,
  onClear,
  onExport 
}) {
  const recentSubtitles = subtitles.slice(-maxItems);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          자막 기록
        </h3>
        <div className="flex items-center gap-2">
          {subtitles.length > 0 && (
            <>
              <button
                onClick={onExport}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                내보내기
              </button>
              <button
                onClick={onClear}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                지우기
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {recentSubtitles.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            아직 자막이 없습니다
          </p>
        ) : (
          recentSubtitles.map((subtitle, index) => (
            <div 
              key={subtitle.id || index}
              className="flex items-start gap-2 text-sm"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 min-w-[60px]">
                {new Date(subtitle.timestamp).toLocaleTimeString()}
              </span>
              <div className="flex-1">
                <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">
                  [{subtitle.speaker || '알 수 없음'}]
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {subtitle.text}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}