import { useState, useCallback, useRef, useEffect } from 'react';
import { log } from '../utils/logger';

const API_URL = import.meta.env.VITE_WORKERS_API_URL || 'https://api.languagemate.kr';

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

      const response = await fetch(`${API_URL}/api/v1/whisper/transcribe`, {
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
    // 스트림 검증
    if (!stream || !(stream instanceof MediaStream)) {
      throw new Error('유효한 미디어 스트림이 제공되지 않았습니다.');
    }

    // 오디오 트랙만 추출
    const audioTracks = stream.getAudioTracks();
    
    // 오디오 트랙이 없거나 모든 트랙이 비활성화된 경우
    if (audioTracks.length === 0) {
      throw new Error('스트림에 오디오 트랙이 없습니다.');
    }

    // 활성화된 오디오 트랙이 있는지 확인
    const enabledTracks = audioTracks.filter(track => track.enabled && track.readyState === 'live');
    
    // 활성화된 트랙이 없으면 에러 발생 (자동 활성화하지 않음)
    // 사용자가 의도적으로 오디오를 껐을 수 있으므로 자동으로 켜지 않음
    if (enabledTracks.length === 0) {
      throw new Error('오디오 트랙이 모두 비활성화되어 있습니다. 오디오를 켜주세요.');
    }

    const audioStream = new MediaStream();
    enabledTracks.forEach(track => {
      audioStream.addTrack(track);
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

    recorder.onerror = () => {
      const errorMessage = '녹음 중 오류가 발생했습니다.';
      setError(errorMessage);
      if (onError) {
        onError(new Error(errorMessage));
      }
    };

    return recorder;
  }, [processAudioChunk, onError]);

  // 전사 시작
  const startTranscription = useCallback(async (stream) => {
    if (!stream) {
      const errorMessage = '오디오 스트림이 없습니다.';
      setError(errorMessage);
      return;
    }

    try {
      // 오디오 트랙 상태 사전 확인
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        const errorMessage = '스트림에 오디오 트랙이 없습니다.';
        setError(errorMessage);
        log.error('전사 시작 실패', new Error(errorMessage), 'TRANSCRIPTION');
        return;
      }

      const enabledTracks = audioTracks.filter(track => track.enabled && track.readyState === 'live');
      if (enabledTracks.length === 0) {
        const errorMessage = '오디오 트랙이 모두 비활성화되어 있습니다. 오디오를 켜주세요.';
        setError(errorMessage);
        log.error('전사 시작 실패', new Error(errorMessage), 'TRANSCRIPTION');
        return;
      }

      setError(null);
      streamRef.current = stream;
      
      // 레코더 초기화
      const recorder = await initializeRecorder(stream);
      mediaRecorderRef.current = recorder;

      // 녹음 시작
      recorder.start(250); // 250ms마다 데이터 수집

      // 주기적으로 청크 처리 (더 빈번한 처리로 지연시간 감소)
      chunkIntervalRef.current = setInterval(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          recorder.start(250);
        }
      }, chunkDuration);

      setIsTranscribing(true);
      log.info('실시간 전사 시작', { language, chunkDuration }, 'TRANSCRIPTION');

    } catch (err) {
      const errorMessage = err.message || '전사를 시작할 수 없습니다.';
      setError(errorMessage);
      log.error('전사 시작 실패', err, 'TRANSCRIPTION');
      if (onError) {
        onError(err);
      }
    }
  }, [chunkDuration, initializeRecorder, onError, language]);

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
      // 전사 시작 전에 오디오 트랙 상태 확인
      if (stream) {
        const audioTracks = stream.getAudioTracks();
        const hasEnabledAudio = audioTracks.some(track => track.enabled && track.readyState === 'live');
        
        if (!hasEnabledAudio) {
          const errorMessage = '오디오 트랙이 모두 비활성화되어 있습니다. 오디오를 켜주세요.';
          setError(errorMessage);
          log.error('전사 시작 실패', new Error(errorMessage), 'TRANSCRIPTION');
          return;
        }
      }
      
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
