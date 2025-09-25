import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Mic, MicOff, Languages, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_WORKERS_API_URL || 'https://api.languagemate.kr';

export default function RealtimeSubtitles({ 
  stream, 
  language = 'en',
  onTranscript,
  className = '' 
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState(null);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const transcriptContainerRef = useRef(null);
  const processingRef = useRef(false);
  const chunkIntervalRef = useRef(null);

  // 오디오 청크 처리 및 전송
  const processAudioChunk = useCallback(async () => {
    if (audioChunksRef.current.length === 0 || processingRef.current) return;
    
    processingRef.current = true;
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', language);
      formData.append('task', 'transcribe');
      formData.append('vad_filter', 'true'); // Voice Activity Detection

      const response = await fetch(`${API_URL}/api/v1/whisper/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.text && result.text.trim()) {
          const newTranscript = {
            id: Date.now(),
            text: result.text.trim(),
            timestamp: new Date().toISOString(),
            language: result.language || language,
            confidence: result.confidence
          };
          
          setCurrentTranscript(result.text.trim());
          setTranscripts(prev => [...prev, newTranscript]);
          
          // 콜백으로 전달
          if (onTranscript) {
            onTranscript(newTranscript);
          }
          
          // 3초 후 현재 자막 제거
          setTimeout(() => {
            setCurrentTranscript('');
          }, 3000);
        }
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('자막 생성 중 오류가 발생했습니다.');
    } finally {
      processingRef.current = false;
    }
  }, [language, onTranscript]);

  // 미디어 레코더 설정
  const setupMediaRecorder = useCallback(async () => {
    if (!stream) return;

    try {
      // 오디오 트랙만 추출
      const audioStream = new MediaStream();
      stream.getAudioTracks().forEach(track => {
        audioStream.addTrack(track);
      });

      const options = {
        mimeType: 'audio/webm;codecs=opus'
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }

      mediaRecorderRef.current = new MediaRecorder(audioStream, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        processAudioChunk();
      };

      // 250ms마다 데이터 수집
      mediaRecorderRef.current.start(250);

      // 2초마다 청크 처리
      chunkIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.start(250);
        }
      }, 2000);

      setIsListening(true);
      setError(null);

    } catch (err) {
      console.error('Media recorder setup error:', err);
      setError('마이크 접근 권한이 필요합니다.');
    }
  }, [stream, processAudioChunk]);

  // 자막 시작/중지
  const toggleListening = useCallback(() => {
    if (isListening) {
      // 중지
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = null;
      }
      setIsListening(false);
    } else {
      // 시작
      setupMediaRecorder();
    }
  }, [isListening, setupMediaRecorder]);

  // 스트림 변경 시 자동 설정
  useEffect(() => {
    if (stream && !isListening) {
      setupMediaRecorder();
    }

    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
      }
    };
  }, [stream, isListening, setupMediaRecorder]);

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll && transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts, autoScroll]);

  // 자막 다운로드
  const downloadTranscripts = () => {
    const content = transcripts.map(t => 
      `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.text}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">실시간 자막</h3>
          {isListening && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              활성화
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400' 
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200 dark:bg-primary-900/20 dark:text-primary-400'
            }`}
            title={isListening ? '자막 중지' : '자막 시작'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
            title={showSubtitles ? '자막 숨기기' : '자막 보기'}
          >
            {showSubtitles ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded-lg transition-colors ${
              autoScroll 
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
            title="자동 스크롤"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5 5 5-5m-5 5V3" />
            </svg>
          </button>
        </div>
      </div>

      {/* 현재 자막 */}
      {showSubtitles && currentTranscript && (
        <div className="p-4 bg-black/80 text-white text-center">
          <p className="text-lg font-medium">{currentTranscript}</p>
        </div>
      )}

      {/* 자막 기록 */}
      {showSubtitles && (
        <div 
          ref={transcriptContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 max-h-60"
        >
          {transcripts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {isListening ? '음성을 기다리는 중...' : '자막을 시작하려면 마이크 버튼을 클릭하세요'}
            </p>
          ) : (
            transcripts.map((transcript) => (
              <div 
                key={transcript.id} 
                className="flex items-start gap-2 animate-fadeIn"
              >
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {new Date(transcript.timestamp).toLocaleTimeString()}
                </span>
                <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                  {transcript.text}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* 푸터 */}
      {showSubtitles && transcripts.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {transcripts.length}개의 자막
            </span>
            <button
              onClick={downloadTranscripts}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              다운로드
            </button>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
