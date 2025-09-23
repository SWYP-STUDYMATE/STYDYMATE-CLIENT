import { useState } from 'react';
import { useWhisper, WHISPER_LANGUAGES } from '../hooks/useWhisper';
import { Mic, MicOff, Upload, Loader2, Globe, FileAudio } from 'lucide-react';

export default function WhisperTest() {
    const {
        loading,
        error,
        transcription,
        progress,
        transcribeAudio,
        reset
    } = useWhisper();

    const [selectedLanguage, setSelectedLanguage] = useState(WHISPER_LANGUAGES.AUTO);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    // 파일 업로드 처리
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            await transcribeAudio(file, { language: selectedLanguage });
        } catch (err) {
            console.error('Transcription error:', err);
        }
    };

    // 녹음 시작
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                try {
                    await transcribeAudio(audioBlob, { language: selectedLanguage });
                } catch (err) {
                    console.error('Transcription error:', err);
                }
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Recording error:', err);
            alert('마이크 접근 권한이 필요합니다.');
        }
    };

    // 녹음 중지
    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    // 번역 처리
    const handleTranslate = async () => {
        if (!transcription || !transcription.transcription) return;

        try {
            // 원본 텍스트를 오디오로 변환하는 대신, 
            // 실제 구현에서는 원본 오디오를 저장해두고 재사용해야 합니다
            alert('번역 기능은 원본 오디오가 필요합니다. 새로운 오디오를 업로드하고 "Translate" 태스크를 선택해주세요.');
        } catch (err) {
            console.error('Translation error:', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Whisper 음성 인식 테스트
                </h2>

                {/* 언어 선택 */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        언어 선택
                    </label>
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                    >
                        <option value={WHISPER_LANGUAGES.AUTO}>자동 감지</option>
                        <option value={WHISPER_LANGUAGES.KOREAN}>한국어</option>
                        <option value={WHISPER_LANGUAGES.ENGLISH}>English</option>
                        <option value={WHISPER_LANGUAGES.JAPANESE}>日本語</option>
                        <option value={WHISPER_LANGUAGES.CHINESE}>中文</option>
                        <option value={WHISPER_LANGUAGES.SPANISH}>Español</option>
                        <option value={WHISPER_LANGUAGES.FRENCH}>Français</option>
                        <option value={WHISPER_LANGUAGES.GERMAN}>Deutsch</option>
                    </select>
                </div>

                {/* 입력 옵션들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* 파일 업로드 */}
                    <div className="relative">
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            disabled={loading || isRecording}
                            className="hidden"
                            id="audio-upload"
                        />
                        <label
                            htmlFor="audio-upload"
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${loading || isRecording
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                        >
                            <Upload className="w-5 h-5" />
                            <span>파일 업로드</span>
                        </label>
                    </div>

                    {/* 녹음 버튼 */}
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${isRecording
                                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                : loading
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                    >
                        {isRecording ? (
                            <>
                                <MicOff className="w-5 h-5" />
                                <span>녹음 중지</span>
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5" />
                                <span>녹음 시작</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 진행 상태 */}
                {loading && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            <span className="text-sm text-gray-600">처리 중...</span>
                        </div>
                        {progress > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* 결과 표시 */}
                {transcription && (
                    <div className="space-y-4">
                        {/* 전사 결과 */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">전사 결과</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Globe className="w-4 h-4" />
                                        {transcription.language || '자동'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FileAudio className="w-4 h-4" />
                                        {transcription.word_count || 0} 단어
                                    </span>
                                    {transcription.chunks > 1 && (
                                        <span>{transcription.chunks} 청크 처리됨</span>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {transcription.transcription}
                            </p>
                        </div>

                        {/* 단어별 타임스탬프 (있는 경우) */}
                        {transcription.words && transcription.words.length > 0 && (
                            <details className="bg-gray-50 rounded-lg p-6">
                                <summary className="cursor-pointer font-semibold text-gray-900 mb-3">
                                    단어별 타임스탬프 ({transcription.words.length} 단어)
                                </summary>
                                <div className="space-y-1 text-sm">
                                    {transcription.words.map((word, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="text-gray-500 font-mono">
                                                {word.start.toFixed(2)}s - {word.end.toFixed(2)}s
                                            </span>
                                            <span className="text-gray-700">{word.word}</span>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}

                        {/* 액션 버튼들 */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleTranslate}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                            >
                                영어로 번역
                            </button>
                            <button
                                onClick={reset}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                초기화
                            </button>
                        </div>
                    </div>
                )}

                {/* 사용법 */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">사용법</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 오디오 파일을 업로드하거나 마이크로 직접 녹음할 수 있습니다</li>
                        <li>• 지원 형식: MP3, WAV, M4A, FLAC, OGG, WebM</li>
                        <li>• 최대 파일 크기: 25MB (대용량 파일은 자동으로 청크 처리)</li>
                        <li>• 언어를 지정하면 더 정확한 결과를 얻을 수 있습니다</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
