import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, Loader2, AlertCircle } from 'lucide-react';

export default function LiveTranscription({
    isActive = false,
    onTranscript,
    language = 'en',
    targetLanguages = [],
    enableTranslation = false,
    className = ''
}) {
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);

    const audioContextRef = useRef(null);
    const streamRef = useRef(null);
    const processorRef = useRef(null);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8787';

    // AudioWorklet processor 초기화
    const initializeAudioWorklet = useCallback(async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: 16000 // Whisper 최적 샘플레이트
                });
            }

            // AudioWorklet 모듈 로드
            await audioContextRef.current.audioWorklet.addModule('/audioProcessor.js');

            // 마이크 스트림 가져오기
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            streamRef.current = stream;

            // 오디오 소스와 프로세서 연결
            const source = audioContextRef.current.createMediaStreamSource(stream);
            processorRef.current = new AudioWorkletNode(
                audioContextRef.current,
                'pcm-processor'
            );

            // 오디오 레벨 모니터링
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            source.connect(analyser);
            source.connect(processorRef.current);

            // 오디오 레벨 업데이트
            const updateLevel = () => {
                if (!isTranscribing) return;
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(Math.min(100, average));
                requestAnimationFrame(updateLevel);
            };
            updateLevel();

            // PCM 데이터 처리
            processorRef.current.port.onmessage = (event) => {
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(event.data.audioData);
                }
            };

            return true;
        } catch (err) {
            console.error('Audio initialization error:', err);
            setError(err.message);
            return false;
        }
    }, [isTranscribing]);

    // WebSocket 연결
    const connectWebSocket = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(`${WEBSOCKET_URL}/api/v1/transcribe/stream`);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setError(null);

            // 설정 전송
            ws.send(JSON.stringify({
                type: 'config',
                language,
                model: 'whisper-large-v3-turbo',
                enableTranslation,
                targetLanguages
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'transcription') {
                    onTranscript?.({
                        text: data.text,
                        isFinal: data.is_final,
                        timestamp: data.timestamp,
                        confidence: data.confidence,
                        language: data.language,
                        translations: data.translations || {}
                    });
                } else if (data.type === 'error') {
                    setError(data.message);
                }
            } catch (err) {
                console.error('WebSocket message error:', err);
            }
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
            setError('Connection error');
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            setIsConnected(false);

            // 자동 재연결
            if (isTranscribing && !reconnectTimeoutRef.current) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectTimeoutRef.current = null;
                    connectWebSocket();
                }, 3000);
            }
        };

        socketRef.current = ws;
    }, [language, onTranscript, isTranscribing, WEBSOCKET_URL, enableTranslation, targetLanguages]);

    // 전사 시작/중지
    const toggleTranscription = useCallback(async () => {
        if (isTranscribing) {
            // 중지
            setIsTranscribing(false);

            // WebSocket 종료
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }

            // 오디오 정리
            if (processorRef.current) {
                processorRef.current.disconnect();
                processorRef.current = null;
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            // 재연결 타이머 정리
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            setAudioLevel(0);
        } else {
            // 시작
            setIsTranscribing(true);
            setError(null);

            const audioReady = await initializeAudioWorklet();
            if (audioReady) {
                connectWebSocket();
            } else {
                setIsTranscribing(false);
            }
        }
    }, [isTranscribing, initializeAudioWorklet, connectWebSocket]);

    // 활성 상태 변경 처리
    useEffect(() => {
        if (isActive && !isTranscribing) {
            toggleTranscription();
        } else if (!isActive && isTranscribing) {
            toggleTranscription();
        }
    }, [isActive, isTranscribing, toggleTranscription]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* 전사 버튼 */}
            <button
                onClick={toggleTranscription}
                disabled={!isActive && isTranscribing}
                className={`
          relative p-3 rounded-full transition-all
          ${isTranscribing
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white'
                    }
          ${(!isActive && isTranscribing) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                {isTranscribing ? (
                    <MicOff className="w-5 h-5" />
                ) : (
                    <Mic className="w-5 h-5" />
                )}

                {/* 오디오 레벨 인디케이터 */}
                {isTranscribing && (
                    <div
                        className="absolute inset-0 rounded-full border-2 border-white opacity-30 animate-ping"
                        style={{
                            animationDuration: `${Math.max(0.5, 2 - audioLevel / 50)}s`
                        }}
                    />
                )}
            </button>

            {/* 상태 표시 */}
            <div className="flex items-center gap-2">
                {isTranscribing && (
                    <>
                        {isConnected ? (
                            <div className="flex items-center gap-1">
                                <Volume2 className="w-4 h-4 text-green-500" />
                                <div className="w-20 h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-100"
                                        style={{ width: `${audioLevel}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                        )}
                    </>
                )}

                {error && (
                    <div className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">{error}</span>
                    </div>
                )}
            </div>

            {/* 자막 상태 텍스트 */}
            {isTranscribing && (
                <span className="text-xs text-[#929292]">
                    {isConnected ? '실시간 자막 활성' : '연결 중...'}
                </span>
            )}
        </div>
    );
}
