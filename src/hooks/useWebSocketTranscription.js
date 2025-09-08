import { useState, useRef, useCallback, useEffect } from 'react';
import { log } from '../utils/logger';

const WS_URL = import.meta.env.VITE_WORKERS_WS_URL || 'wss://workers.languagemate.kr/ws';

export function useWebSocketTranscription({
  language = 'auto',
  targetLanguage = 'ko',
  enableTranslation = true,
  onTranscript,
  onError,
  reconnectAttempts = 3,
  reconnectDelay = 2000
} = {}) {
  // 상태 관리
  const [isConnected, setIsConnected] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState(null);
  const [error, setError] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('good');

  // 레퍼런스 관리
  const wsRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const lastTranscriptTimeRef = useRef(Date.now());

  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${WS_URL}/api/transcribe/stream`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          log.info('WebSocket 전사 연결 성공', { wsUrl }, 'WS_TRANSCRIPTION');
          setIsConnected(true);
          setError(null);
          reconnectCountRef.current = 0;

          // 초기 설정 전송
          ws.send(JSON.stringify({
            type: 'config',
            config: {
              language,
              targetLanguage,
              enableTranslation,
              model: 'whisper-large-v3-turbo',
              responseFormat: 'verbose_json',
              temperature: 0.1,
              vadFilter: true,
              initialPrompt: 'This is a conversation between language learners.'
            }
          }));

          resolve(ws);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
          } catch (err) {
            log.error('WebSocket 메시지 파싱 오류', err, 'WS_TRANSCRIPTION');
          }
        };

        ws.onerror = (error) => {
          log.error('WebSocket 연결 오류', error, 'WS_TRANSCRIPTION');
          setError('실시간 전사 연결에 오류가 발생했습니다.');
          setConnectionQuality('poor');
          reject(error);
        };

        ws.onclose = (event) => {
          log.info('WebSocket 연결 종료', { code: event.code, reason: event.reason }, 'WS_TRANSCRIPTION');
          setIsConnected(false);
          
          // 자동 재연결 시도
          if (isTranscribing && reconnectCountRef.current < reconnectAttempts) {
            scheduleReconnect();
          }
        };

        wsRef.current = ws;

      } catch (err) {
        log.error('WebSocket 연결 실패', err, 'WS_TRANSCRIPTION');
        setError('실시간 전사 서비스에 연결할 수 없습니다.');
        reject(err);
      }
    });
  }, [language, targetLanguage, enableTranslation, isTranscribing, reconnectAttempts]);

  // WebSocket 메시지 처리
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'transcription': {
        const transcript = {
          id: `transcript-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: data.text,
          language: data.language || language,
          confidence: data.confidence || 1.0,
          isFinal: data.is_final || false,
          timestamp: new Date().toISOString(),
          duration: data.duration || 0,
          words: data.words || []
        };

        if (data.translations && enableTranslation) {
          transcript.translations = data.translations;
        }

        setCurrentTranscript(transcript);
        lastTranscriptTimeRef.current = Date.now();

        if (onTranscript) {
          onTranscript(transcript);
        }

        // 연결 품질 업데이트
        setConnectionQuality('good');
        break;
      }

      case 'translation':
        // 번역 결과 처리
        if (onTranscript) {
          onTranscript({
            id: `translation-${Date.now()}`,
            text: data.translatedText,
            originalText: data.originalText,
            sourceLanguage: data.sourceLanguage,
            targetLanguage: data.targetLanguage,
            timestamp: new Date().toISOString(),
            isTranslation: true
          });
        }
        break;

      case 'error': {
        const errorMessage = data.message || '전사 처리 중 오류가 발생했습니다.';
        setError(errorMessage);
        setConnectionQuality('poor');
        if (onError) {
          onError(new Error(errorMessage));
        }
        break;
      }

      case 'status':
        log.info('WebSocket 상태 업데이트', data, 'WS_TRANSCRIPTION');
        break;

      default:
        log.warn('알 수 없는 메시지 타입', data, 'WS_TRANSCRIPTION');
    }
  }, [language, enableTranslation, onTranscript, onError]);

  // 재연결 스케줄링
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectCountRef.current++;
    const delay = reconnectDelay * Math.pow(2, reconnectCountRef.current - 1);

    log.info(`WebSocket 재연결 시도 예정`, { 
      attempt: reconnectCountRef.current, 
      delay,
      maxAttempts: reconnectAttempts 
    }, 'WS_TRANSCRIPTION');

    reconnectTimeoutRef.current = setTimeout(async () => {
      try {
        await connectWebSocket();
        if (mediaStreamRef.current) {
          await startAudioCapture(mediaStreamRef.current);
        }
      } catch (err) {
        log.error('재연결 실패', err, 'WS_TRANSCRIPTION');
        if (reconnectCountRef.current >= reconnectAttempts) {
          setError(`연결을 ${reconnectAttempts}회 시도했지만 실패했습니다.`);
        }
      }
    }, delay);
  }, [connectWebSocket, reconnectDelay, reconnectAttempts]);

  // 오디오 캡처 시작
  const startAudioCapture = useCallback(async (stream) => {
    try {
      // 오디오 컨텍스트 생성
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      // 소스 생성
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // ScriptProcessorNode 생성 (AudioWorklet이 지원되지 않는 경우)
      if (audioContextRef.current.audioWorklet) {
        try {
          await audioContextRef.current.audioWorklet.addModule('/audioProcessor.js');
          processorRef.current = new AudioWorkletNode(audioContextRef.current, 'pcm-processor');
        } catch {
          // AudioWorklet 실패 시 ScriptProcessorNode 사용
          processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        }
      } else {
        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      }

      // 오디오 데이터 처리
      if (processorRef.current.port) {
        // AudioWorkletNode
        processorRef.current.port.onmessage = (event) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(event.data.audioData);
          }
        };
      } else {
        // ScriptProcessorNode
        processorRef.current.onaudioprocess = (event) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const inputBuffer = event.inputBuffer;
            const channelData = inputBuffer.getChannelData(0);
            const audioData = new Float32Array(channelData);
            wsRef.current.send(audioData.buffer);
          }
        };
      }

      // 연결
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      log.info('오디오 캡처 시작', { sampleRate: audioContextRef.current.sampleRate }, 'WS_TRANSCRIPTION');

    } catch (err) {
      log.error('오디오 캡처 초기화 실패', err, 'WS_TRANSCRIPTION');
      setError('마이크 접근에 실패했습니다.');
      throw err;
    }
  }, []);

  // 전사 시작
  const startTranscription = useCallback(async (stream) => {
    if (!stream) {
      setError('오디오 스트림이 제공되지 않았습니다.');
      return;
    }

    try {
      setError(null);
      setIsTranscribing(true);
      mediaStreamRef.current = stream;

      // WebSocket 연결
      await connectWebSocket();
      
      // 오디오 캡처 시작
      await startAudioCapture(stream);

      log.info('실시간 전사 시작', { language, targetLanguage, enableTranslation }, 'WS_TRANSCRIPTION');

    } catch (err) {
      log.error('전사 시작 실패', err, 'WS_TRANSCRIPTION');
      setIsTranscribing(false);
      setError(err.message || '전사를 시작할 수 없습니다.');
      if (onError) {
        onError(err);
      }
    }
  }, [connectWebSocket, startAudioCapture, language, targetLanguage, enableTranslation, onError]);

  // 전사 중지
  const stopTranscription = useCallback(() => {
    log.info('실시간 전사 중지', null, 'WS_TRANSCRIPTION');

    setIsTranscribing(false);
    
    // WebSocket 연결 종료
    if (wsRef.current) {
      wsRef.current.close(1000, 'User requested stop');
      wsRef.current = null;
    }

    // 오디오 리소스 정리
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // 재연결 타이머 정리
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setCurrentTranscript(null);
    setError(null);
    reconnectCountRef.current = 0;
  }, []);

  // 전사 토글
  const toggleTranscription = useCallback(async (stream) => {
    if (isTranscribing) {
      stopTranscription();
    } else if (stream) {
      await startTranscription(stream);
    } else {
      setError('오디오 스트림이 필요합니다.');
    }
  }, [isTranscribing, startTranscription, stopTranscription]);

  // 언어 설정 업데이트
  const updateLanguage = useCallback((newLanguage, newTargetLanguage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'config',
        config: {
          language: newLanguage,
          targetLanguage: newTargetLanguage,
          enableTranslation
        }
      }));
    }
  }, [enableTranslation]);

  // 연결 상태 모니터링
  useEffect(() => {
    if (!isTranscribing) return;

    const interval = setInterval(() => {
      const timeSinceLastTranscript = Date.now() - lastTranscriptTimeRef.current;
      
      // 10초 이상 응답이 없으면 연결 품질을 'poor'로 설정
      if (timeSinceLastTranscript > 10000) {
        setConnectionQuality('poor');
      } else if (timeSinceLastTranscript > 5000) {
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('good');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isTranscribing]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, [stopTranscription]);

  return {
    // 상태
    isConnected,
    isTranscribing,
    currentTranscript,
    error,
    connectionQuality,
    
    // 메서드
    startTranscription,
    stopTranscription,
    toggleTranscription,
    updateLanguage,
    
    // 연결 정보
    reconnectCount: reconnectCountRef.current,
    maxReconnectAttempts: reconnectAttempts
  };
}