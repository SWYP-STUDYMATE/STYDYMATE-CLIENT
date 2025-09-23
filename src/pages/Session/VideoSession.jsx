import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Minimize2, Maximize2 } from 'lucide-react';
import VideoControls from '../../components/VideoControls';
import useSessionStore from '../../store/sessionStore';
import useProfileStore from '../../store/profileStore';
import useWebRTC from '../../hooks/useWebRTC';
import RealtimeSubtitles from '../../components/RealtimeSubtitles';
import TranslatedSubtitles from '../../components/TranslatedSubtitles';
import AIFeedback from '../../components/AIFeedback';

export default function VideoSession() {
    const navigate = useNavigate();
    const { sessionId } = useParams();

    // UI 상태
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [isPiPMode, setIsPiPMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);
    const [currentTranscript, setCurrentTranscript] = useState(null);
    const [showAIFeedback, setShowAIFeedback] = useState(true);
    const [userLevel, setUserLevel] = useState('B1'); // 사용자 레벨 (프로필에서 가져오기)

    const timerRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const containerRef = useRef(null);

    const {
        activeSession,
        sessionStatus,
        startSession,
        endSession,
        switchLanguage,
        sessionSettings
    } = useSessionStore();

    const { name: userName, profileImage: userProfileImage } = useProfileStore();

    // WebRTC Hook 사용
    const {
        connectionState,
        localStream,
        remoteStreams,
        isAudioEnabled,
        isVideoEnabled,
        error,
        stats,
        toggleAudio,
        toggleVideo,
        disconnect: disconnectWebRTC,
        getUserMedia
    } = useWebRTC(sessionId, userName);

    // 더미 파트너 데이터 (실제로는 activeSession에서 가져와야 함)
    const partner = {
        name: "Emma Wilson",
        profileImage: "/assets/basicProfilePic.png",
        level: "Intermediate",
        nativeLanguage: "English",
        learningLanguage: "Korean"
    };

    useEffect(() => {
        // 세션 시작
        if (sessionId && !activeSession) {
            startSession(sessionId);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [sessionId, startSession, activeSession]);

    // 로컬 스트림을 비디오 요소에 연결
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // 리모트 스트림을 비디오 요소에 연결 (첫 번째 스트림)
    useEffect(() => {
        if (remoteStreams.size > 0 && remoteVideoRef.current) {
            const firstRemoteStream = remoteStreams.values().next().value;
            remoteVideoRef.current.srcObject = firstRemoteStream;
        }
    }, [remoteStreams]);

    useEffect(() => {
        // 통화 시간 타이머
        if (connectionState === 'connected' && !timerRef.current) {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else if (connectionState !== 'connected' && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [connectionState]);

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggleMute = () => {
        toggleAudio();
    };

    const handleToggleVideo = () => {
        toggleVideo();
    };

    const handleToggleScreenShare = () => {
        setIsScreenSharing(!isScreenSharing);
        // 실제 화면 공유 로직 구현 필요
    };

    const handleToggleLanguage = () => {
        const newLang = currentLanguage === 'en' ? 'ko' : 'en';
        setCurrentLanguage(newLang);
        switchLanguage();
    };

    const handleEndCall = () => {
        if (window.confirm('통화를 종료하시겠습니까?')) {
            disconnectWebRTC();
            endSession();
            navigate('/sessions');
        }
    };

    const handleTogglePiP = () => {
        setIsPiPMode(!isPiPMode);
    };

    const handleToggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleOpenSettings = () => {
        // 설정 모달 열기
        console.log('Open settings');
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-[var(--black-700)] text-white flex flex-col relative">
            {/* 실시간 자막/번역 */}
            {showSubtitles && localStream && (
                <div className="absolute top-4 left-4 z-40 w-80">
                    <RealtimeSubtitles
                        stream={localStream}
                        language={currentLanguage === 'en' ? 'en' : 'ko'}
                        onTranscript={setCurrentTranscript}
                        className="bg-black/80 backdrop-blur-sm"
                    />
                </div>
            )}

            {showTranslation && currentTranscript && (
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-40 w-96">
                    <TranslatedSubtitles
                        transcript={currentTranscript}
                        sourceLanguage={currentLanguage === 'en' ? 'en' : 'ko'}
                        targetLanguage={currentLanguage === 'en' ? 'ko' : 'en'}
                        onTranslation={(translation) => {
                            console.log('Translation:', translation);
                        }}
                        className="shadow-2xl"
                    />
                </div>
            )}

            {/* Header */}
            <div className="bg-[var(--black-600)] border-b border-[var(--black-400)] px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-[18px] font-bold">1:1 비디오 세션</h1>
                        {connectionState === 'connected' && (
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-[var(--green-500)] rounded-full animate-pulse" />
                                <span className="text-[14px] text-[var(--green-500)]">연결됨</span>
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-[var(--danger-red)] rounded-full" />
                                <span className="text-[14px] text-[var(--danger-red)]">{error}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-[18px] font-mono">
                            {formatDuration(callDuration)}
                        </div>
                        <div className="text-[14px] text-[#929292]">
                            {currentLanguage === 'en' ? 'English' : '한국어'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Remote Video (Full Screen) */}
                <div className="absolute inset-0">
                    <video
                        ref={remoteVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                    />
                    {/* Partner Info Overlay */}
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                            <img
                                src={partner.profileImage}
                                alt={partner.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <p className="text-[14px] font-semibold">{partner.name}</p>
                                <p className="text-[12px] text-[#929292]">{partner.level}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Local Video (PiP) */}
                <div className={`absolute ${isPiPMode ? 'bottom-4 right-4' : 'top-4 right-4'
                    } w-64 h-48 bg-[var(--black-600)] rounded-lg overflow-hidden shadow-2xl 
        transition-all duration-300 ${isVideoEnabled ? '' : 'opacity-50'}`}>
                    <video
                        ref={localVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />
                    {!isVideoEnabled && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--black-600)]">
                            <img
                                src={userProfileImage || "/assets/basicProfilePic.png"}
                                alt={userName}
                                className="w-20 h-20 rounded-full object-cover"
                            />
                        </div>
                    )}
                    {/* PiP Controls */}
                    <button
                        onClick={handleTogglePiP}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 
            rounded-full transition-colors duration-200"
                    >
                        {isPiPMode ? (
                            <Maximize2 className="w-4 h-4" />
                        ) : (
                            <Minimize2 className="w-4 h-4" />
                        )}
                    </button>
                    {/* User Name */}
                    <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                        <p className="text-[12px]">{userName || "나"}</p>
                    </div>
                </div>

                {/* Screen Share Indicator */}
                {isScreenSharing && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
          bg-[var(--green-500)] text-white px-4 py-2 rounded-full flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-[14px] font-medium">화면 공유 중</span>
                    </div>
                )}

                {/* Connection Status */}
                {connectionState === 'connecting' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-center">
                            <div className="inline-flex items-center space-x-2 mb-4">
                                <div className="w-3 h-3 bg-[var(--warning-yellow)] rounded-full animate-pulse" />
                                <p className="text-[18px] text-[var(--warning-yellow)]">연결 중...</p>
                            </div>
                            <p className="text-[14px] text-[var(--black-200)]">
                                화상 통화를 준비하고 있습니다
                            </p>
                            {stats && (
                                <div className="mt-4 text-[12px] text-[var(--black-300)]">
                                    품질: {stats.quality} | 대기시간: {stats.latency}ms
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AI Feedback Component */}
                {showAIFeedback && connectionState === 'connected' && (
                    <AIFeedback 
                        transcript={currentTranscript}
                        userLevel={userLevel}
                        isEnabled={showAIFeedback}
                    />
                )}
            </div>

            {/* Control Bar */}
            <div className="bg-[var(--black-600)] border-t border-[var(--black-400)] p-6 flex-shrink-0">
                <VideoControls
                    isMuted={!isAudioEnabled}
                    isVideoOn={isVideoEnabled}
                    isScreenSharing={isScreenSharing}
                    currentLanguage={currentLanguage}
                    onToggleMute={handleToggleMute}
                    onToggleVideo={handleToggleVideo}
                    onToggleScreenShare={handleToggleScreenShare}
                    onToggleLanguage={handleToggleLanguage}
                    onEndCall={handleEndCall}
                    onOpenSettings={handleOpenSettings}
                    onToggleFullscreen={handleToggleFullscreen}
                    showVideo={true}
                    showScreenShare={true}
                    showLanguageToggle={true}
                    showSettings={true}
                    showFullscreen={true}
                    variant="dark"
                />
                
                {/* Connection Stats */}
                {stats && connectionState === 'connected' && (
                    <div className="mt-4 flex justify-center">
                        <div className="flex items-center space-x-6 text-[12px] text-[var(--black-300)]">
                            <span>대역폭: {stats.bitrate} kbps</span>
                            <span>패킷 손실: {stats.packetLoss}%</span>
                            <span>지연: {stats.latency}ms</span>
                            <span className={`px-2 py-1 rounded ${
                                stats.quality === 'good' ? 'bg-green-500/20 text-green-400' :
                                stats.quality === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                                {stats.quality === 'good' ? '양호' : stats.quality === 'fair' ? '보통' : '불량'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
