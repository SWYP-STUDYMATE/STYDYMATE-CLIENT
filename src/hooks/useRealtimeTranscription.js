import { useState, useCallback, useRef, useEffect } from 'react';
import { log } from '../utils/logger';

const API_URL = import.meta.env.VITE_WORKERS_API_URL || 'https://api.languagemate.kr';

export function useRealtimeTranscription({
  language = 'auto',
  chunkDuration = 3000, // ✅ 3초마다 처리 (안정성 향상)
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
    if (audioChunksRef.current.length === 0 || processingRef.current) {
      if (audioChunksRef.current.length === 0) {
        console.log('⏭️ [useRealtimeTranscription] 오디오 청크가 없어 처리 건너뜀');
      }
      return;
    }

    processingRef.current = true;
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const blobSize = audioBlob.size;
    audioChunksRef.current = [];

    // ✅ 최소 청크 크기 체크 (5KB 미만 무시 - 너무 작은 오디오)
    if (blobSize < 5120) {
      console.warn('⚠️ [useRealtimeTranscription] 청크가 너무 작아 무시', {
        blobSize,
        blobSizeKB: Math.round(blobSize / 1024),
        minSizeKB: 5
      });
      processingRef.current = false;
      return;
    }

    console.log('📤 [useRealtimeTranscription] 오디오 청크 전송 시작', {
      blobSize,
      language,
      apiUrl: `${API_URL}/api/v1/whisper/transcribe`
    });

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

      console.log('📥 [useRealtimeTranscription] API 응답 수신', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
        } catch {
          errorDetails = await response.text();
        }

        console.error('❌ [useRealtimeTranscription] API 응답 실패', {
          status: response.status,
          statusText: response.statusText,
          errorDetails,
          headers: Object.fromEntries(response.headers.entries())
        });

        const errorMessage = typeof errorDetails === 'object'
          ? (errorDetails.message || errorDetails.error || response.statusText)
          : errorDetails;

        throw new Error(`Transcription failed: ${errorMessage}`);
      }

      const result = await response.json();

      // API 응답 형식 확인: transcription 또는 text 필드 사용
      const transcriptText = result.transcription || result.text || result.transcript || '';

      console.log('✅ [useRealtimeTranscription] 전사 결과 수신', {
        hasText: !!transcriptText,
        textLength: transcriptText?.length,
        language: result.language,
        confidence: result.confidence,
        fullResult: result // 전체 응답 확인
      });

      // ✅ 에러 메시지 필터링 (Workers AI 에러 응답 무시)
      const errorPatterns = [
        '[Error transcribing chunk]',
        '🔄',
        '[청크 전사 오류]',
        '[부분 전사 오류]',
        'Error transcribing',
        'transcription failed'
      ];

      const isErrorMessage = errorPatterns.some(pattern =>
        transcriptText?.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isErrorMessage) {
        console.warn('⚠️ [useRealtimeTranscription] 에러 메시지 감지 - 무시', {
          text: transcriptText
        });
        return; // 에러 메시지는 자막으로 표시하지 않음
      }

      // ✅ 의미 있는 텍스트만 처리 (최소 3글자 이상, 공백 제외)
      const trimmedText = transcriptText?.trim() || '';
      const meaningfulText = trimmedText.replace(/\s+/g, ''); // 공백 제거

      if (trimmedText && meaningfulText.length >= 3) {
        const transcript = {
          id: `transcript-${Date.now()}`,
          text: trimmedText,
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
      } else if (trimmedText) {
        console.log('⏭️ [useRealtimeTranscription] 의미 없는 텍스트 무시', {
          text: trimmedText,
          meaningfulLength: meaningfulText.length
        });
      }
    } catch (err) {
      console.error('❌ [useRealtimeTranscription] 청크 처리 중 예외 발생', {
        errorName: err?.name,
        errorMessage: err?.message,
        errorStack: err?.stack,
        blobSize,
        language
      });

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
      audioBitsPerSecond: 64000 // ✅ 16 kbps → 64 kbps (Whisper 권장 비트레이트)
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
    console.log('🎙️ [useRealtimeTranscription] startTranscription 호출됨', {
      hasStream: !!stream,
      streamId: stream?.id
    });

    if (!stream) {
      console.warn('⚠️ [useRealtimeTranscription] 스트림이 없어 전사를 시작할 수 없습니다.');
      return;
    }

    // 오디오 트랙 상태 사전 확인
    const audioTracks = stream.getAudioTracks();
    console.log('🎵 [useRealtimeTranscription] 오디오 트랙 확인', {
      totalTracks: audioTracks.length,
      enabledTracks: audioTracks.filter(t => t.enabled && t.readyState === 'live').length,
      tracks: audioTracks.map(t => ({
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState,
        muted: t.muted
      }))
    });

    if (audioTracks.length === 0) {
      console.warn('⚠️ [useRealtimeTranscription] 오디오 트랙이 없어 전사를 시작할 수 없습니다.');
      return;
    }

    const enabledTracks = audioTracks.filter(track => track.enabled && track.readyState === 'live');
    if (enabledTracks.length === 0) {
      console.warn('⚠️ [useRealtimeTranscription] 활성화된 오디오 트랙이 없어 전사를 시작할 수 없습니다. 오디오를 켜주세요.');
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

      // 주기적으로 청크 처리 (더 빈번한 처리로 지연시간 감소)
      chunkIntervalRef.current = setInterval(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          recorder.start(250);
        }
      }, chunkDuration);

      setIsTranscribing(true);
      log.info('실시간 전사 시작', { language, chunkDuration }, 'TRANSCRIPTION');
      console.log('✅ [useRealtimeTranscription] 전사 시작 성공', {
        recorderState: recorder.state,
        language,
        chunkDuration
      });

    } catch (err) {
      // initializeRecorder에서 발생한 에러만 로깅 (오디오 트랙 관련 에러는 이미 위에서 처리됨)
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
          // 오디오 트랙이 없으면 조용히 반환 (에러 로그 없음)
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
