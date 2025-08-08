import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    Globe,
    Clock,
    Target,
    Calendar,
    MessageCircle,
    Video,
    CheckCircle,
    XCircle
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useMatchingStore from '../../store/matchingStore';
import useSessionStore from '../../store/sessionStore';

export default function MatchingProfile() {
    const navigate = useNavigate();
    const { userId } = useParams();

    const [activeTab, setActiveTab] = useState('profile');
    const [isScheduling, setIsScheduling] = useState(false);

    const {
        matchedUsers,
        selectPartner,
        acceptMatch,
        rejectMatch
    } = useMatchingStore();

    const { scheduleSession } = useSessionStore();

    // 실제로는 userId로 사용자 정보를 가져와야 함
    const user = matchedUsers.find(u => u.id === userId) || {
        id: userId,
        name: "Emma Wilson",
        englishName: "Emma",
        profileImage: "/assets/basicProfilePic.png",
        age: 28,
        nationality: "United States",
        nativeLanguage: "English",
        learningLanguage: "Korean",
        level: "Intermediate",
        bio: "Hi! I'm Emma from California. I've been learning Korean for 2 years and I'm really excited to practice with native speakers. I love K-dramas and K-pop!",
        interests: ["K-pop", "Travel", "Cooking", "Photography", "Movies"],
        learningGoals: ["일상 대화 능력 향상", "한국 문화 이해", "비즈니스 한국어"],
        availability: [
            { day: "Monday", times: ["19:00-21:00"] },
            { day: "Wednesday", times: ["19:00-21:00"] },
            { day: "Friday", times: ["19:00-21:00"] },
            { day: "Saturday", times: ["10:00-12:00", "14:00-16:00"] }
        ],
        timezone: "PST (UTC-8)",
        sessionPreference: "1on1",
        isOnline: true,
        lastActive: "2분 전",
        matchScore: 92,
        completedSessions: 45,
        rating: 4.8,
        responseRate: 95
    };

    const handleAcceptMatch = () => {
        acceptMatch(user.id);
        setIsScheduling(true);
    };

    const handleRejectMatch = () => {
        if (window.confirm('이 매칭을 거절하시겠습니까?')) {
            rejectMatch(user.id);
            navigate('/matching');
        }
    };

    const handleScheduleSession = () => {
        // 세션 예약 로직
        navigate(`/schedule/new?partnerId=${user.id}`);
    };

    const handleStartChat = () => {
        navigate(`/chat/${user.id}`);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2"
                    >
                        <ChevronLeft className="w-6 h-6 text-[#111111]" />
                    </button>
                    <h1 className="text-[18px] font-bold text-[#111111]">매칭 프로필</h1>
                    <div className="w-10" />
                </div>
            </div>

            {/* Profile Header */}
            <div className="bg-white p-6 border-b border-[#E7E7E7]">
                <div className="flex items-start space-x-4">
                    <div className="relative">
                        <img
                            src={user.profileImage}
                            alt={user.name}
                            className="w-24 h-24 rounded-full object-cover"
                        />
                        {user.isOnline && (
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#00C471] 
              border-2 border-white rounded-full" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <h2 className="text-[20px] font-bold text-[#111111]">{user.name}</h2>
                            <span className="px-2 py-1 bg-[#00C471] text-white text-[12px] 
              font-medium rounded-full">
                                매칭 {user.matchScore}%
                            </span>
                        </div>
                        <p className="text-[14px] text-[#606060] mb-2">
                            {user.age}세 • {user.nationality}
                        </p>
                        <div className="flex items-center space-x-4 text-[14px] text-[#929292]">
                            <span className="flex items-center space-x-1">
                                <Globe className="w-4 h-4" />
                                <span>{user.nativeLanguage} → {user.learningLanguage}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <Target className="w-4 h-4" />
                                <span>{user.level}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                        <p className="text-[20px] font-bold text-[#111111]">{user.completedSessions}</p>
                        <p className="text-[12px] text-[#929292]">완료 세션</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[20px] font-bold text-[#111111]">{user.rating}</p>
                        <p className="text-[12px] text-[#929292]">평점</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[20px] font-bold text-[#111111]">{user.responseRate}%</p>
                        <p className="text-[12px] text-[#929292]">응답률</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-[#E7E7E7]">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'profile'
                                ? 'text-[#00C471] border-[#00C471]'
                                : 'text-[#929292] border-transparent'
                            }`}
                    >
                        프로필
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'schedule'
                                ? 'text-[#00C471] border-[#00C471]'
                                : 'text-[#929292] border-transparent'
                            }`}
                    >
                        스케줄
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {activeTab === 'profile' ? (
                    <>
                        {/* Bio */}
                        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                            <h3 className="text-[16px] font-bold text-[#111111] mb-3">자기소개</h3>
                            <p className="text-[14px] text-[#606060] leading-relaxed">
                                {user.bio}
                            </p>
                        </div>

                        {/* Interests */}
                        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                            <h3 className="text-[16px] font-bold text-[#111111] mb-3">관심사</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.interests.map((interest, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-[#F1F3F5] text-[#606060] 
                    text-[14px] rounded-full"
                                    >
                                        #{interest}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Learning Goals */}
                        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                            <h3 className="text-[16px] font-bold text-[#111111] mb-3">학습 목표</h3>
                            <ul className="space-y-2">
                                {user.learningGoals.map((goal, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <CheckCircle className="w-5 h-5 text-[#00C471] flex-shrink-0 mt-0.5" />
                                        <span className="text-[14px] text-[#606060]">{goal}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    /* Schedule Tab */
                    <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[16px] font-bold text-[#111111]">가능한 시간</h3>
                            <span className="text-[12px] text-[#929292]">{user.timezone}</span>
                        </div>
                        <div className="space-y-3">
                            {user.availability.map((slot, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-[14px] font-medium text-[#111111]">
                                        {slot.day}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {slot.times.map((time, timeIndex) => (
                                            <span
                                                key={timeIndex}
                                                className="px-3 py-1 bg-[#F1F3F5] text-[#606060] 
                        text-[12px] rounded-lg"
                                            >
                                                {time}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7E7E7] p-6">
                {!isScheduling ? (
                    <div className="flex space-x-3">
                        <CommonButton
                            onClick={handleRejectMatch}
                            variant="secondary"
                            className="flex-1"
                        >
                            <XCircle className="w-5 h-5 mr-2" />
                            거절
                        </CommonButton>
                        <CommonButton
                            onClick={handleAcceptMatch}
                            variant="primary"
                            className="flex-1"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            수락
                        </CommonButton>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <CommonButton
                            onClick={handleScheduleSession}
                            variant="primary"
                            className="w-full"
                        >
                            <Calendar className="w-5 h-5 mr-2" />
                            세션 예약하기
                        </CommonButton>
                        <CommonButton
                            onClick={handleStartChat}
                            variant="secondary"
                            className="w-full"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            채팅 시작하기
                        </CommonButton>
                    </div>
                )}
            </div>
        </div>
    );
}