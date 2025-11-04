import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Phone, PhoneOff, Globe, Volume2, VolumeX } from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useSessionStore from '../../store/sessionStore';
import useProfileStore from '../../store/profileStore';
import useWebRTC from '../../hooks/useWebRTC';

export default function AudioSession() {
    const navigate = useNavigate();
    const { sessionId } = useParams();

    const [speakerMuted, setSpeakerMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const timerRef = useRef(null);
    const remoteAudioRef = useRef(null);

    const {
        activeSession,
        sessionStatus,
        startSession,
        endSession,
        switchLanguage,
        sessionSettings
    } = useSessionStore();

    const { name: userName, profileImage: userProfileImage } = useProfileStore();

    // WebRTC Hook 사용 (오디오만)
    const {
        connectionState,
        localStream,
        remoteStreams,
        isAudioEnabled,
        error,
        stats,
        toggleAudio,
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

    useEffect(() => {
        // 통화 시간 타이머
        if (sessionStatus === 'connected' && !timerRef.current) {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else if (sessionStatus !== 'connected' && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [sessionStatus]);

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

    const handleToggleSpeaker = () => {
        setSpeakerMuted(!speakerMuted);
    };

    const handleToggleLanguage = () => {
        const newLang = currentLanguage === 'en' ? 'ko' : 'en';
        setCurrentLanguage(newLang);
        switchLanguage();
    };

    const handleEndCall = () => {
        if (window.confirm('통화를 종료하시겠습니까?')) {
            endSession();
            navigate('/sessions');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--black-700)] text-white flex flex-col">
            {/* Header */}
            <div className="bg-[var(--black-600)] border-b border-[var(--black-400)] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-[18px] font-bold">1:1 음성 세션</h1>
                        {sessionStatus === 'connected' && (
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-[var(--green-500)] rounded-full animate-pulse" />
                                <span className="text-[14px] text-[var(--green-500)]">연결됨</span>
                            </div>
                        )}
                    </div>
                    <div className="text-[18px] font-mono">
                        {formatDuration(callDuration)}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                {/* Participants Grid */}
                <div className="mb-12">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
                        {/* Current User */}
                        <div className="text-center">
                            <div className="relative mb-4">
                                {/* Audio Level Ring Animation */}
                                {isAudioEnabled && (
                                    <div className="absolute inset-0 rounded-full border-4 border-[var(--green-500)] animate-pulse" />
                                )}
                                <img
                                    src={userProfileImage || "/assets/basicProfilePic.png"}
                                    alt={userName}
                                    className={`w-32 h-32 rounded-full object-cover border-4 transition-all duration-300 ${
                                        isAudioEnabled
                                            ? 'border-[var(--green-500)]'
                                            : 'border-[var(--black-400)]'
                                    }`}
                                />
                                {isAudioEnabled && (
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--green-500)] rounded-full flex items-center justify-center shadow-lg">
                                        <Mic className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <h3 className="text-[16px] font-semibold mb-1">{userName || "나"}</h3>
                            <p className="text-[14px] text-[var(--black-200)]">
                                {currentLanguage === 'en' ? 'Speaking English' : 'Speaking Korean'}
                            </p>
                        </div>

                        {/* Partner */}
                        <div className="text-center">
                            <div className="relative mb-4">
                                {/* Audio Level Ring Animation */}
                                {!speakerMuted && sessionStatus === 'connected' && (
                                    <div className="absolute inset-0 rounded-full border-4 border-[var(--blue)] animate-pulse" />
                                )}
                                <img
                                    src={partner.profileImage}
                                    alt={partner.name}
                                    className={`w-32 h-32 rounded-full object-cover border-4 transition-all duration-300 ${
                                        !speakerMuted && sessionStatus === 'connected'
                                            ? 'border-[var(--blue)]'
                                            : 'border-[var(--black-400)]'
                                    }`}
                                />
                                {!speakerMuted && sessionStatus === 'connected' && (
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--blue)] rounded-full flex items-center justify-center shadow-lg">
                                        <Volume2 className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <h3 className="text-[16px] font-semibold mb-1">{partner.name}</h3>
                            <p className="text-[14px] text-[var(--black-200)]">{partner.level}</p>
                        </div>

                        {/* Additional Remote Participants */}
                        {Array.from(remoteStreams.entries()).slice(1).map(([peerId, stream], index) => (
                            <div key={peerId} className="text-center">
                                <div className="relative mb-4">
                                    {/* Audio Level Ring Animation */}
                                    <div className="absolute inset-0 rounded-full border-4 border-[var(--blue)] animate-pulse" />
                                    <div className="w-32 h-32 rounded-full bg-[var(--black-500)] flex items-center justify-center border-4 border-[var(--blue)] transition-all duration-300">
                                        <span className="text-[32px] font-bold text-white">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--blue)] rounded-full flex items-center justify-center shadow-lg">
                                        <Volume2 className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-[16px] font-semibold mb-1">참여자 {index + 2}</h3>
                                <p className="text-[14px] text-[var(--black-200)]">연결됨</p>
                            </div>
                        ))}
                    </div>

                    {/* Total Participants Count */}
                    <div className="mt-6 text-center">
                        <p className="text-[14px] text-[var(--black-200)]">
                            총 <span className="text-[var(--green-500)] font-semibold">{remoteStreams.size + 1}</span>명 참여 중
                        </p>
                    </div>
                </div>

                {/* Language Info */}
                <div className="bg-[var(--black-600)] rounded-[20px] p-6 mb-8 max-w-md w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[14px] text-[var(--black-200)] mb-1">현재 언어</p>
                            <p className="text-[18px] font-semibold">
                                {currentLanguage === 'en' ? 'English' : '한국어'}
                            </p>
                        </div>
                        <button
                            onClick={handleToggleLanguage}
                            className="p-3 bg-[var(--black-400)] hover:bg-[var(--black-300)] rounded-full transition-colors duration-200"
                        >
                            <Globe className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Connection Status */}
                {sessionStatus === 'connecting' && (
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center space-x-2">
                            <div className="w-2 h-2 bg-[var(--warning-yellow)] rounded-full animate-pulse" />
                            <p className="text-[14px] text-[var(--warning-yellow)]">연결 중...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Control Bar */}
            <div className="bg-[var(--black-600)] border-t border-[var(--black-400)] p-6">
                <div className="flex items-center justify-center space-x-4">
                    {/* Mute Button */}
                    <button
                        onClick={handleToggleMute}
                        className={`p-4 rounded-full transition-colors duration-200 ${!isAudioEnabled
                            ? 'bg-[var(--red)] hover:bg-[var(--red-600)]'
                            : 'bg-[var(--black-400)] hover:bg-[var(--black-300)]'
                            }`}
                    >
                        {!isAudioEnabled ? (
                            <MicOff className="w-6 h-6" />
                        ) : (
                            <Mic className="w-6 h-6" />
                        )}
                    </button>

                    {/* Speaker Button */}
                    <button
                        onClick={handleToggleSpeaker}
                        className={`p-4 rounded-full transition-colors duration-200 ${speakerMuted
                            ? 'bg-[var(--red)] hover:bg-[var(--red-600)]'
                            : 'bg-[var(--black-400)] hover:bg-[var(--black-300)]'
                            }`}
                    >
                        {speakerMuted ? (
                            <VolumeX className="w-6 h-6" />
                        ) : (
                            <Volume2 className="w-6 h-6" />
                        )}
                    </button>

                    {/* End Call Button */}
                    <button
                        onClick={handleEndCall}
                        className="p-4 bg-[var(--red)] hover:bg-[var(--red-600)] rounded-full transition-colors duration-200"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}