import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';

export default function VoiceRecorder({ onSend, onCancel }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [waveformLevels, setWaveformLevels] = useState(Array(20).fill(0.2));

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null);
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        return () => {
            // Cleanup
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Set up audio analysis
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;
            source.connect(analyserRef.current);

            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/ogg;codecs=opus',
                'audio/webm',
                'audio/mp4'
            ];

            const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

            if (!supportedType) {
                alert('브라우저가 음성 녹음을 지원하지 않습니다.');
                return;
            }

            const recorder = new MediaRecorder(stream, { mimeType: supportedType });
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: supportedType });
                setAudioBlob(blob);

                // Stop visualizer
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };

            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            // Start visualizer
            visualizeAudio();
        } catch (err) {
            console.error('녹음 시작 실패:', err);
            alert('마이크 권한을 허용해주세요.');
        }
    };

    const visualizeAudio = () => {
        if (!analyserRef.current || !isRecording) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Convert frequency data to waveform levels
        const levels = [];
        const chunkSize = Math.floor(dataArray.length / 20);

        for (let i = 0; i < 20; i++) {
            let sum = 0;
            for (let j = 0; j < chunkSize; j++) {
                sum += dataArray[i * chunkSize + j];
            }
            const average = sum / chunkSize / 255;
            levels.push(Math.max(0.2, average));
        }

        setWaveformLevels(levels);
        animationRef.current = requestAnimationFrame(visualizeAudio);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            // Stop stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    };

    const handleSend = () => {
        if (audioBlob) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onSend(reader.result);
            };
            reader.readAsDataURL(audioBlob);
        }
    };

    const handleCancel = () => {
        if (isRecording) {
            stopRecording();
        }
        setAudioBlob(null);
        setRecordingTime(0);
        setWaveformLevels(Array(20).fill(0.2));
        onCancel();
    };

    const playRecording = () => {
        if (audioBlob && audioRef.current) {
            const url = URL.createObjectURL(audioBlob);
            audioRef.current.src = url;
            audioRef.current.play();
            setIsPlaying(true);

            audioRef.current.onended = () => {
                setIsPlaying(false);
            };
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--black-50)] p-4 z-50">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-[var(--black-500)]">음성 메시지</h3>
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-[var(--neutral-100)] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-[var(--black-200)]" />
                    </button>
                </div>

                {/* Waveform Visualizer */}
                <div className="bg-[var(--neutral-100)] rounded-lg p-6 mb-4">
                    <div className="flex items-center justify-center gap-1 h-16">
                        {waveformLevels.map((level, index) => (
                            <div
                                key={index}
                                className={`w-1 bg-gradient-to-t rounded-full transition-all duration-150 ${isRecording
                                    ? 'from-[var(--red-500)] to-[var(--red-400)]'
                                    : audioBlob
                                        ? 'from-[var(--green-500)] to-[var(--green-700)]'
                                        : 'from-[var(--black-300)] to-[var(--black-200)]'
                                    }`}
                                style={{
                                    height: `${level * 100}%`,
                                    minHeight: '20%'
                                }}
                            />
                        ))}
                    </div>

                    {/* Time Display */}
                    <div className="text-center mt-2">
                        <span className={`text-2xl font-mono ${isRecording ? 'text-[var(--red-500)]' : 'text-[var(--black-500)]'
                            }`}>
                            {formatTime(recordingTime)}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                    {!isRecording && !audioBlob && (
                        <button
                            onClick={startRecording}
                            className="flex items-center gap-2 px-6 py-3 bg-[var(--red-500)] hover:bg-[var(--red-600)] text-white rounded-full transition-colors"
                        >
                            <Mic className="w-5 h-5" />
                            <span>녹음 시작</span>
                        </button>
                    )}

                    {isRecording && (
                        <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 px-6 py-3 bg-[var(--black-800)] hover:bg-[var(--black-900)] text-white rounded-full transition-colors"
                        >
                            <Square className="w-5 h-5" />
                            <span>녹음 중지</span>
                        </button>
                    )}

                    {audioBlob && !isRecording && (
                        <>
                            <button
                                onClick={startRecording}
                                className="p-3 bg-[var(--neutral-100)] hover:bg-[var(--black-100)] rounded-full transition-colors"
                                title="다시 녹음"
                            >
                                <Mic className="w-5 h-5 text-[var(--black-300)]" />
                            </button>

                            <button
                                onClick={playRecording}
                                className="px-6 py-3 bg-[var(--neutral-100)] hover:bg-[var(--black-100)] text-[var(--black-300)] rounded-full transition-colors"
                            >
                                {isPlaying ? '재생 중...' : '미리 듣기'}
                            </button>

                            <button
                                onClick={handleSend}
                                className="flex items-center gap-2 px-6 py-3 bg-[var(--green-500)] hover:bg-[var(--green-600)] text-white rounded-full transition-colors"
                            >
                                <Send className="w-5 h-5" />
                                <span>전송</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Hidden audio element for playback */}
                <audio ref={audioRef} />
            </div>
        </div>
    );
}