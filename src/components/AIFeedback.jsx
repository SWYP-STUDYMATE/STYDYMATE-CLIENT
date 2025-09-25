import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Lightbulb, Check, X, Volume2 } from 'lucide-react';

export default function AIFeedback({ transcript, userLevel = 'B1', isEnabled = true }) {
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showFeedback, setShowFeedback] = useState(true);
    const [recentCorrections, setRecentCorrections] = useState([]);
    const [fluencyScore, setFluencyScore] = useState(0);

    // Workers AI를 통한 실시간 피드백 요청
    const requestFeedback = useCallback(async (text) => {
        if (!text || text.length < 10 || !isEnabled) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_WORKERS_API_URL || 'https://api.languagemate.kr'}/api/v1/feedback/realtime`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transcript: text,
                    context: 'conversation',
                    userLevel,
                    previousMessages: recentCorrections.slice(-3)
                })
            });

            if (response.ok) {
                const data = await response.json();
                setFeedback(data.feedback);
                setFluencyScore(data.feedback?.fluencyScore || 0);
                
                // 교정 내역 저장
                if (data.feedback?.corrections?.length > 0) {
                    setRecentCorrections(prev => [
                        ...prev,
                        ...data.feedback.corrections
                    ].slice(-10));
                }
            }
        } catch (error) {
            console.error('Failed to get AI feedback:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userLevel, isEnabled, recentCorrections]);

    // 음성 인식 텍스트가 변경될 때마다 피드백 요청
    useEffect(() => {
        if (transcript && transcript.length > 20) {
            const timer = setTimeout(() => {
                requestFeedback(transcript);
            }, 2000); // 2초 디바운스

            return () => clearTimeout(timer);
        }
    }, [transcript, requestFeedback]);

    if (!isEnabled || !showFeedback) {
        return (
            <button
                onClick={() => setShowFeedback(true)}
                className="fixed bottom-24 right-4 bg-[#00C471] text-white p-3 rounded-full shadow-lg hover:bg-[#00B267] transition-colors"
                aria-label="Show AI Feedback"
            >
                <Lightbulb className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-24 right-4 w-80 bg-white rounded-lg shadow-xl border border-[#E7E7E7] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00C471] to-[#00B267] text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-medium text-sm">AI Learning Assistant</span>
                </div>
                <button
                    onClick={() => setShowFeedback(false)}
                    className="hover:bg-white/20 p-1 rounded"
                    aria-label="Minimize feedback"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Fluency Score */}
            {fluencyScore > 0 && (
                <div className="px-4 py-2 bg-[#E6F9F1] border-b border-[#B0EDD3]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[#606060]">Fluency Score</span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-[#00C471] to-[#00B267] transition-all duration-500"
                                    style={{ width: `${fluencyScore}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-[#00C471]">{fluencyScore}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C471]"></div>
                    </div>
                ) : feedback ? (
                    <div className="space-y-3">
                        {/* Corrections */}
                        {feedback.corrections?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-[#606060] uppercase tracking-wide">Corrections</h4>
                                {feedback.corrections.map((correction, idx) => (
                                    <div key={idx} className="bg-red-50 border border-red-200 rounded-md p-2">
                                        <div className="flex items-start gap-2">
                                            <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs line-through text-red-600">{correction.original}</p>
                                                <p className="text-xs text-green-600 font-medium">{correction.corrected}</p>
                                                {correction.explanation && (
                                                    <p className="text-xs text-[#606060] mt-1">{correction.explanation}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Suggestions */}
                        {feedback.suggestions?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-[#606060] uppercase tracking-wide">Suggestions</h4>
                                {feedback.suggestions.map((suggestion, idx) => (
                                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded-md p-2">
                                        <div className="flex items-start gap-2">
                                            <MessageCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-[#111111]">{suggestion}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pronunciation Tips */}
                        {feedback.pronunciation?.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-[#606060] uppercase tracking-wide">Pronunciation</h4>
                                {feedback.pronunciation.map((item, idx) => (
                                    <div key={idx} className="bg-purple-50 border border-purple-200 rounded-md p-2">
                                        <div className="flex items-start gap-2">
                                            <Volume2 className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-purple-700">{item.word}</p>
                                                <p className="text-xs text-[#606060]">{item.tip}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Encouragement */}
                        {feedback.encouragement && (
                            <div className="bg-gradient-to-r from-[#E6F9F1] to-[#B0EDD3] rounded-md p-3">
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-[#00C471] mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-[#111111] font-medium">{feedback.encouragement}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <MessageCircle className="w-8 h-8 text-[#B5B5B5] mx-auto mb-2" />
                        <p className="text-sm text-[#606060]">Start speaking to receive AI feedback</p>
                        <p className="text-xs text-[#929292] mt-1">Your level: {userLevel}</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="border-t border-[#E7E7E7] p-2 flex gap-2">
                <button
                    onClick={() => setRecentCorrections([])}
                    className="flex-1 text-xs text-[#606060] hover:text-[#111111] py-1 hover:bg-[#FAFAFA] rounded transition-colors"
                >
                    Clear History
                </button>
                <button
                    onClick={() => requestFeedback(transcript)}
                    disabled={!transcript || isLoading}
                    className="flex-1 text-xs text-[#00C471] hover:text-[#00B267] py-1 hover:bg-[#E6F9F1] rounded transition-colors disabled:opacity-50"
                >
                    Refresh
                </button>
            </div>
        </div>
    );
}
