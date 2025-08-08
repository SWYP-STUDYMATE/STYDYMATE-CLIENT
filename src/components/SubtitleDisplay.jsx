import { useState, useEffect, useRef } from 'react';
import { Subtitles, X } from 'lucide-react';

export default function SubtitleDisplay({ 
  transcripts = [],
  isVisible = true,
  position = 'bottom', // 'bottom' | 'top' | 'overlay'
  maxLines = 2,
  className = ''
}) {
  const [visibleTranscripts, setVisibleTranscripts] = useState([]);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // 새 전사 추가
    if (transcripts.length > 0) {
      const latestTranscript = transcripts[transcripts.length - 1];
      
      setVisibleTranscripts(prev => {
        const updated = [...prev];
        
        // 같은 타임스탬프의 임시 전사 업데이트
        const existingIndex = updated.findIndex(
          t => t.timestamp === latestTranscript.timestamp && !t.isFinal
        );
        
        if (existingIndex >= 0) {
          updated[existingIndex] = latestTranscript;
        } else {
          updated.push(latestTranscript);
        }
        
        // 최대 라인 수 유지
        if (updated.length > maxLines) {
          return updated.slice(-maxLines);
        }
        
        return updated;
      });

      // 오래된 자막 자동 제거
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setVisibleTranscripts(prev => prev.slice(-1));
      }, 5000);
    }
  }, [transcripts, maxLines]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isVisible || visibleTranscripts.length === 0) {
    return null;
  }

  const positionClasses = {
    bottom: 'bottom-20 left-1/2 transform -translate-x-1/2',
    top: 'top-20 left-1/2 transform -translate-x-1/2',
    overlay: 'bottom-4 left-4 right-4'
  };

  return (
    <div 
      ref={containerRef}
      className={`
        fixed z-50 pointer-events-none
        ${positionClasses[position]}
        ${className}
      `}
    >
      <div className="bg-black/80 backdrop-blur-sm rounded-lg px-6 py-3 max-w-2xl">
        {/* 자막 아이콘 */}
        <div className="flex items-center gap-2 mb-2">
          <Subtitles className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/60">실시간 자막</span>
        </div>

        {/* 자막 텍스트 */}
        <div className="space-y-1">
          {visibleTranscripts.map((transcript, index) => (
            <p 
              key={`${transcript.timestamp}-${index}`}
              className={`
                text-center text-white leading-relaxed
                transition-all duration-300
                ${transcript.isFinal ? 'text-lg' : 'text-base opacity-70'}
                ${index === visibleTranscripts.length - 1 ? 'animate-fade-in' : ''}
              `}
            >
              {transcript.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// 자막 컨트롤러 컴포넌트
export function SubtitleController({ 
  isEnabled,
  onToggle,
  position,
  onPositionChange,
  className = ''
}) {
  const positions = [
    { value: 'bottom', label: '하단' },
    { value: 'top', label: '상단' },
    { value: 'overlay', label: '오버레이' }
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* 자막 토글 */}
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all
          ${isEnabled 
            ? 'bg-blue-500 text-white' 
            : 'bg-[#2A2A2A] text-[#929292] hover:bg-[#3A3A3A]'
          }
        `}
      >
        <Subtitles className="w-4 h-4" />
        <span className="text-sm">자막</span>
      </button>

      {/* 위치 선택 */}
      {isEnabled && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#929292]">위치:</span>
          <div className="flex gap-1">
            {positions.map(pos => (
              <button
                key={pos.value}
                onClick={() => onPositionChange(pos.value)}
                className={`
                  px-2 py-1 text-xs rounded transition-all
                  ${position === pos.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2A2A2A] text-[#929292] hover:bg-[#3A3A3A]'
                  }
                `}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}