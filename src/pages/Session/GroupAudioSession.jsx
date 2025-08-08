import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    Globe,
    Volume2,
    VolumeX,
    Users,
    Activity
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useSessionStore from '../../store/sessionStore';
import useProfileStore from '../../store/profileStore';

export default function GroupAudioSession() {
    const navigate = useNavigate();
    const { sessionId } = useParams();

    const [isMuted, setIsMuted] = useState(false);
    const [speakerMuted, setSpeakerMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [activeSpeaker, setActiveSpeaker] = useState(null);
    const [audioLevels, setAudioLevels] = useState({});

    const timerRef = useRef(null);

    const {
        activeSession,
        sessionStatus,
        connectionState,
        startSession,
        endSession,
        toggleAudio,
        switchLanguage
    } = useSessionStore();

    const { name: userName, profileImage: userProfileImage } = useProfileStore();

    // 더미 참가자 데이터 (실제로는 WebRTC에서 가져와야 함)
    const participants = [
        {
            id: 'user1',
            name: userName || "나",
            profileImage: userProfileImage || "/assets/basicProfilePic.png",
            nativeLanguage: "Korean",
            learningLanguage: "English",
            level: "B2",
            isMuted: isMuted,
            isLocal: true
        },
        {
            id: 'user2',
            name: "Emma Wilson",
            profileImage: "/assets/basicProfilePic.png",
            nativeLanguage: "English",
            learningLanguage: "Korean",
            level: "Intermediate",
            isMuted: false,
            isLocal: false
        },
        {
            id: 'user3',
            name: "John Smith",
            profileImage: "/assets/basicProfilePic.png",
            nativeLanguage: "English",
            learningLanguage: "Korean",
            level: "Beginner",
            isMuted: true,
            isLocal: false
        },
        {
            id: 'user4',
            name: "Sarah Johnson",
            profileImage: "/assets/basicProfilePic.png",
            nativeLanguage: "English",
            learningLanguage: "Korean",
            level: "Advanced",
            isMuted: false,
            isLocal: false
        }
    ];

    useEffect(() => {
        // 세션 시작
        if (sessionId && !activeSession) {
            startSession(sessionId);
        }

        // 오디오 레벨 시뮬레이션
        const audioInterval = setInterval(() => {
            const newLevels = {};
            participants.forEach(p => {
                if (!p.isMuted) {
                    newLevels[p.id] = Math.random() * 100;
                } else {
                    newLevels[p.id] = 0;
                }
            });
            setAudioLevels(newLevels);

            // 활성 스피커 결정
            const loudestUser = Object.entries(newLevels)
                .sort(([, a], [, b]) => b - a)[0];
            setActiveSpeaker(loudestUser && loudestUser[1] > 30 ? loudestUser[0] : null);
        }, 200);

        return () => {
            clearInterval(audioInterval);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [sessionId, startSession, activeSession, isMuted]);

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
        setIsMuted(!isMuted);
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

    const ParticipantCard = ({ participant }) => {
        const audioLevel = audioLevels[participant.id] || 0;
        const isSpeaking = activeSpeaker === participant.id;

        return (
            <div className={`bg-white rounded-[20px] p-6 border-2 transition-all duration-200 ${isSpeaking ? 'border-[#00C471] shadow-lg scale-105' : 'border-[#E7E7E7]'
                }`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                        <img
                            src={participant.profileImage}
                            alt={participant.name}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        {/* Speaking Indicator */}
                        {isSpeaking && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00C471] rounded-full animate-pulse" />
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {participant.isMuted ? (
                            <MicOff className="w-5 h-5 text-[#EA4335]" />
                        ) : (
                            <Mic className="w-5 h-5 text-[#606060]" />
                        )}
                    </div>
                </div>

                <h3 className="text-[16px] font-semibold text-[#111111] mb-1">
                    {participant.name}
                    {participant.isLocal && " (나)"}
                </h3>
                <p className="text-[12px] text-[#606060] mb-3">
                    {participant.nativeLanguage} → {participant.learningLanguage}
                </p>

                {/* Audio Level Indicator */}
                <div className="h-2 bg-[#F1F3F5] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#00C471] transition-all duration-200"
                        style={{ width: `${audioLevel}%` }}
                    />
                </div>

                {/* Level Badge */}
                <div className="mt-3 inline-block px-3 py-1 bg-[#F1F3F5] rounded-full">
                    <span className="text-[12px] font-medium text-[#606060]">
                        {participant.level}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-[20px] font-bold text-[#111111]">그룹 오디오 세션</h1>
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-[#929292]" />
                            <span className="text-[14px] text-[#929292]">
                                {participants.length}명 참가 중
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-[18px] font-mono text-[#111111]">
                            {formatDuration(callDuration)}
                        </div>
                        {sessionStatus === 'connected' && (
                            <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-[#00C471]" />
                                <span className="text-[14px] text-[#00C471]">연결됨</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-6">
                {/* Session Info */}
                <div className="bg-white rounded-[20px] p-6 mb-6 border border-[#E7E7E7]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-[18px] font-semibold text-[#111111] mb-2">
                                English Conversation Practice
                            </h2>
                            <p className="text-[14px] text-[#606060]">
                                자유롭게 대화하며 언어를 연습하세요
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Globe className="w-5 h-5 text-[#606060]" />
                            <span className="text-[14px] font-medium text-[#111111]">
                                {currentLanguage === 'en' ? 'English' : '한국어'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Participants Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {participants.map(participant => (
                        <ParticipantCard key={participant.id} participant={participant} />
                    ))}
                </div>

                {/* Control Panel */}
                <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                    <div className="flex items-center justify-center space-x-4">
                        {/* Mute Button */}
                        <button
                            onClick={handleToggleMute}
                            className={`p-4 rounded-full transition-all duration-200 ${isMuted
                                    ? 'bg-[#EA4335] hover:bg-[#D33B2C]'
                                    : 'bg-[#F1F3F5] hover:bg-[#E7E7E7]'
                                }`}
                        >
                            {isMuted ? (
                                <MicOff className="w-6 h-6 text-white" />
                            ) : (
                                <Mic className="w-6 h-6 text-[#111111]" />
                            )}
                        </button>

                        {/* Speaker Button */}
                        <button
                            onClick={handleToggleSpeaker}
                            className={`p-4 rounded-full transition-all duration-200 ${speakerMuted
                                    ? 'bg-[#EA4335] hover:bg-[#D33B2C]'
                                    : 'bg-[#F1F3F5] hover:bg-[#E7E7E7]'
                                }`}
                        >
                            {speakerMuted ? (
                                <VolumeX className="w-6 h-6 text-white" />
                            ) : (
                                <Volume2 className="w-6 h-6 text-[#111111]" />
                            )}
                        </button>

                        {/* Language Toggle */}
                        <button
                            onClick={handleToggleLanguage}
                            className="p-4 bg-[#F1F3F5] hover:bg-[#E7E7E7] rounded-full transition-all duration-200"
                        >
                            <Globe className="w-6 h-6 text-[#111111]" />
                        </button>

                        {/* End Call Button */}
                        <button
                            onClick={handleEndCall}
                            className="p-4 bg-[#EA4335] hover:bg-[#D33B2C] rounded-full transition-all duration-200"
                        >
                            <PhoneOff className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Status Text */}
                    <div className="text-center mt-4">
                        {isMuted && (
                            <p className="text-[14px] text-[#EA4335]">마이크가 음소거되었습니다</p>
                        )}
                        {speakerMuted && (
                            <p className="text-[14px] text-[#EA4335]">스피커가 음소거되었습니다</p>
                        )}
                    </div>
                </div>

                {/* Connection Status */}
                {sessionStatus === 'connecting' && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-[20px] p-8 text-center">
                            <div className="inline-flex items-center space-x-2 mb-4">
                                <div className="w-3 h-3 bg-[#FFA500] rounded-full animate-pulse" />
                                <p className="text-[18px] text-[#FFA500]">연결 중...</p>
                            </div>
                            <p className="text-[14px] text-[#606060]">
                                그룹 통화를 준비하고 있습니다
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}