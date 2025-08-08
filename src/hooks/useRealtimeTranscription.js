import { useState, useCallback, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_WORKERS_URL || 'https://studymate-api.wjstks3474.workers.dev';

export function useRealtimeTranscription({
  language = 'auto',
  chunkDuration = 2000, // 2초마다 처리
  onTranscript,
  onError
} = {}) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState(null);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const processingRef = useRef(false);
  const chunkIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // 오디오 청크 처리
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
      formData.append('vad_filter', 'true');
      formData.append('initial_prompt', 'This is a conversation between two people learning languages.');

      const response = await fetch(`${API_URL}/api/whisper/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.text && result.text.trim()) {
        const transcript = {
          id: `transcript-${Date.now()}`,
          text: result.text.trim(),
          timestamp: new Date().toISOString(),
          language: result.language || language,
          confidence: result.confidence,
          duration: result.duration,
          words: result.words
        };
        
        setCurrentTranscript(transcript);
        setTranscripts(prev => [...prev, transcript]);
        
        // 콜백 호출
        if (onTranscript) {
          onTranscript(transcript);
        }
        
        // 일정 시간 후 현재 자막 제거
        setTimeout(() => {
          setCurrentTranscript(prev => 
            prev?.id === transcript.id ? null : prev
          );
        }, 4000);
      }
    } catch (err) {
      const errorMessage = err.message || '자막 생성 중 오류가 발생했습니다.';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
    } finally {
      processingRef.current = false;
    }
  }, [language, onTranscript, onError]);

  // 미디어 레코더 초기화
  const initializeRecorder = useCallback(async (stream) => {
    try {
      // 오디오 트랙만 추출
      const audioStream = new MediaStream();
      stream.getAudioTracks().forEach(track => {
        if (track.enabled) {
          audioStream.addTrack(track);
        }
      });

      if (audioStream.getAudioTracks().length === 0) {
        throw new Error('오디오 트랙을 찾을 수 없습니다.');
      }

      // MediaRecorder 옵션 설정
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      };

      // 지원되는 MIME 타입 확인
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          throw new Error('브라우저가 오디오 녹음을 지원하지 않습니다.');
        }
      }

      const recorder = new MediaRecorder(audioStream, options);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        processAudioChunk();
      };

      recorder.onerror = (event) => {
        const errorMessage = '녹음 중 오류가 발생했습니다.';
        setError(errorMessage);
        if (onError) {
          onError(new Error(errorMessage));
        }
      };

      return recorder;
    } catch (err) {
      throw err;
    }
  }, [processAudioChunk, onError]);

  // 전사 시작
  const startTranscription = useCallback(async (stream) => {
    if (!stream) {
      setError('오디오 스트림이 없습니다.');
      return;
    }

    try {
      setError(null);
      streamRef.current = stream;
      
      // 레코더 초기화
      const recorder = await initializeRecorder(stream);
      mediaRecorderRef.current = recorder;

      // 녹음 시작
      recorder.start(250); // 250ms마다 데이터 수집

      // 주기적으로 청크 처리
      chunkIntervalRef.current = setInterval(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          recorder.start(250);
        }
      }, chunkDuration);

      setIsTranscribing(true);

    } catch (err) {
      const errorMessage = err.message || '전사를 시작할 수 없습니다.';
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
    }
  }, [chunkDuration, initializeRecorder, onError]);

  // 전사 중지
  const stopTranscription = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = null;
    }

    mediaRecorderRef.current = null;
    streamRef.current = null;
    audioChunksRef.current = [];
    processingRef.current = false;
    
    setIsTranscribing(false);
    setCurrentTranscript(null);
  }, []);

  // 전사 토글
  const toggleTranscription = useCallback(async (stream) => {
    if (isTranscribing) {
      stopTranscription();
    } else {
      await startTranscription(stream);
    }
  }, [isTranscribing, startTranscription, stopTranscription]);

  // 전사 기록 초기화
  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
    setCurrentTranscript(null);
  }, []);

  // 전사 기록 내보내기
  const exportTranscripts = useCallback((format = 'text') => {
    if (transcripts.length === 0) return null;

    if (format === 'text') {
      return transcripts.map(t => 
        `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.text}`
      ).join('\n');
    }

    if (format === 'srt') {
      return transcripts.map((t, index) => {
        const startTime = new Date(t.timestamp);
        const endTime = new Date(startTime.getTime() + 4000);
        
        const formatTime = (date) => {
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          const ms = String(date.getMilliseconds()).padStart(3, '0');
          return `${hours}:${minutes}:${seconds},${ms}`;
        };

        return `${index + 1}\n${formatTime(startTime)} --> ${formatTime(endTime)}\n${t.text}\n`;
      }).join('\n');
    }

    if (format === 'json') {
      return JSON.stringify(transcripts, null, 2);
    }

    return transcripts;
  }, [transcripts]);

  // 클린업
  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, [stopTranscription]);

  return {
    // 상태
    isTranscribing,
    transcripts,
    currentTranscript,
    error,
    
    // 메서드
    startTranscription,
    stopTranscription,
    toggleTranscription,
    clearTranscripts,
    exportTranscripts,
    
    // 통계
    stats: {
      totalTranscripts: transcripts.length,
      totalWords: transcripts.reduce((sum, t) => 
        sum + (t.text.split(' ').length || 0), 0
      ),
      duration: transcripts.reduce((sum, t) => 
        sum + (t.duration || 0), 0
      )
    }
  };
}