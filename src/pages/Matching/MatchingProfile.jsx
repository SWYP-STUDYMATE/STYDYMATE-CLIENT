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
    XCircle,
    Loader2
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useMatchingStore from '../../store/matchingStore';
import useSessionStore from '../../store/sessionStore';
import { useAlert } from '../../hooks/useAlert';
import { getUserProfile } from '../../api/profile';
import { DEFAULT_PROFILE_IMAGE } from '../../utils/imageUtils';

export default function MatchingProfile() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { showError } = useAlert();

    const [activeTab, setActiveTab] = useState('profile');
    const [isScheduling, setIsScheduling] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const {
        matchedUsers,
        selectPartner,
        acceptMatch,
        rejectMatch
    } = useMatchingStore();

    const { scheduleSession } = useSessionStore();

    // userId로 프로필 정보 가져오기
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) {
                setError('사용자 ID가 없습니다.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // 먼저 matchedUsers에서 찾아보기
                const matchedUser = matchedUsers.find(u => u.id === userId || u.userId === userId);
                
                if (matchedUser) {
                    // 이미 matchedUsers에 있으면 사용
                    const mappedUser = mapUserData(matchedUser);
                    setUser(mappedUser);
                    setIsLoading(false);
                    return;
                }

                // matchedUsers에 없으면 API 호출
                const profileData = await getUserProfile(userId);
                const mappedUser = mapUserData(profileData);
                setUser(mappedUser);
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
                setError('프로필 정보를 불러오는 중 오류가 발생했습니다.');
                showError('프로필 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId, matchedUsers, showError]);

    // 백엔드 필드명을 프론트엔드 표시 형식으로 매핑
    // UserProfile 타입에 맞게 매핑 (workers/src/types/index.ts 참고)
    const mapUserData = (userData) => {
        if (!userData) return null;

        // 프로필 이미지 URL 변환 (DB에 저장된 키를 실제 URL로 변환)
        let profileImageUrl = DEFAULT_PROFILE_IMAGE;
        if (userData.profileImageUrl) {
            profileImageUrl = userData.profileImageUrl;
        } else if (userData.profileImage) {
            // profileImage가 키인 경우 URL로 변환
            if (userData.profileImage.startsWith('http://') || userData.profileImage.startsWith('https://') || userData.profileImage.startsWith('/')) {
                profileImageUrl = userData.profileImage;
            } else {
                profileImageUrl = `/api/v1/upload/file/${userData.profileImage}`;
            }
        }

        return {
            ...userData,
            id: userData.id || userData.userId,
            name: userData.englishName || userData.name || '이름 없음',
            profileImage: profileImageUrl,
            nationality: userData.location?.country || userData.nationality || '미지정',
            nativeLanguage: userData.nativeLanguage?.name || userData.nativeLanguage || '미지정',
            learningLanguage: userData.targetLanguages?.[0]?.languageName || userData.learningLanguage || '미지정',
            level: userData.targetLanguages?.[0]?.currentLevel || userData.level || userData.proficiencyLevel || '미지정',
            bio: userData.selfBio || userData.bio || userData.intro || '자기소개가 없습니다.',
            interests: userData.interests || [],
            learningGoals: userData.learningGoals || userData.goals || [],
            availability: userData.availability || userData.schedule || [],
            timezone: userData.location?.timeZone || userData.timezone || '미지정',
            sessionPreference: userData.sessionPreference || userData.sessionType || '1on1',
            isOnline: userData.onlineStatus === 'ONLINE' || userData.isOnline || false,
            lastActive: userData.lastActiveTime || userData.lastActive || '알 수 없음',
            matchScore: userData.compatibilityScore || userData.matchScore || 0,
            completedSessions: userData.completedSessions || userData.totalSessions || 0,
            rating: userData.rating || userData.averageRating || 0,
            responseRate: userData.responseRate || 0,
            // UserProfile 타입의 추가 필드들
            age: userData.age || (userData.birthyear ? new Date().getFullYear() - parseInt(userData.birthyear) : undefined),
            gender: userData.gender,
            email: userData.email,
            birthday: userData.birthday,
            birthyear: userData.birthyear,
            onboardingCompleted: userData.onboardingCompleted
        };
    };

    const handleAcceptMatch = async () => {
        if (!user) return;
        try {
            await acceptMatch(user.id);
            setIsScheduling(true);
        } catch (error) {
            console.error('Failed to accept match:', error);
            showError('매칭 수락 중 오류가 발생했습니다.');
        }
    };

    const handleRejectMatch = async () => {
        if (!user) return;
        if (window.confirm('이 매칭을 거절하시겠습니까?')) {
            try {
                await rejectMatch(user.id);
                navigate('/matching');
            } catch (error) {
                console.error('Failed to reject match:', error);
                showError('매칭 거절 중 오류가 발생했습니다.');
            }
        }
    };

    const handleScheduleSession = () => {
        if (!user) return;
        // 세션 예약 로직
        navigate(`/schedule/new?partnerId=${user.id}`);
    };

    const handleStartChat = () => {
        if (!user) return;
        navigate(`/chat/${user.id}`);
    };

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00C471] mx-auto mb-4" />
                    <p className="text-[#606060] text-sm">프로필 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 상태 또는 사용자 정보 없음
    if (error || !user) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] overflow-y-auto">
                <div className="bg-white border-b border-[#E7E7E7] px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 touch-manipulation"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111]" />
                        </button>
                        <h1 className="text-[16px] sm:text-[18px] font-bold text-[#111111] break-words">매칭 프로필</h1>
                        <div className="w-8 sm:w-10" />
                    </div>
                </div>
                <div className="flex items-center justify-center min-h-[60vh] px-4">
                    <div className="text-center">
                        <XCircle className="w-12 h-12 text-[#929292] mx-auto mb-4" />
                        <p className="text-[#606060] text-sm mb-2">
                            {error || '프로필 정보를 불러올 수 없습니다.'}
                        </p>
                        <CommonButton
                            onClick={() => navigate(-1)}
                            variant="secondary"
                            size="small"
                        >
                            돌아가기
                        </CommonButton>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-[#E7E7E7] px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 touch-manipulation"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111]" />
                    </button>
                    <h1 className="text-[16px] sm:text-[18px] font-bold text-[#111111] break-words">매칭 프로필</h1>
                    <div className="w-8 sm:w-10" />
                </div>
            </div>

            {/* Profile Header */}
            <div className="bg-white p-4 sm:p-6 border-b border-[#E7E7E7]">
                <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="relative flex-shrink-0">
                        <img
                            src={user.profileImage}
                            alt={user.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                        />
                        {user.isOnline && (
                            <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-[#00C471] border-2 border-white rounded-full" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#111111] break-words">{user.name}</h2>
                            <span className="px-2 py-1 bg-[#00C471] text-white text-[11px] sm:text-[12px] font-medium rounded-full whitespace-nowrap">
                                매칭 {user.matchScore}%
                            </span>
                        </div>
                        <p className="text-[13px] sm:text-[14px] text-[#606060] mb-2 break-words">
                            {user.age ? `${user.age}세 • ` : ''}{user.nationality}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[12px] sm:text-[13px] md:text-[14px] text-[#929292]">
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="break-words">{user.nativeLanguage} → {user.learningLanguage}</span>
                            </span>
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="break-words">{user.level}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                    <div className="text-center">
                        <p className="text-[18px] sm:text-[20px] font-bold text-[#111111] break-words">{user.completedSessions}</p>
                        <p className="text-[11px] sm:text-[12px] text-[#929292] break-words">완료 세션</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[18px] sm:text-[20px] font-bold text-[#111111] break-words">{user.rating}</p>
                        <p className="text-[11px] sm:text-[12px] text-[#929292] break-words">평점</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[18px] sm:text-[20px] font-bold text-[#111111] break-words">{user.responseRate}%</p>
                        <p className="text-[11px] sm:text-[12px] text-[#929292] break-words">응답률</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-[#E7E7E7] overflow-x-auto">
                <div className="flex min-w-full">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 text-[12px] sm:text-[13px] md:text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap touch-manipulation ${activeTab === 'profile'
                                ? 'text-[#00C471] border-[#00C471]'
                                : 'text-[#929292] border-transparent'
                            }`}
                    >
                        프로필
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex-1 py-3 text-[12px] sm:text-[13px] md:text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap touch-manipulation ${activeTab === 'schedule'
                                ? 'text-[#00C471] border-[#00C471]'
                                : 'text-[#929292] border-transparent'
                            }`}
                    >
                        스케줄
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {activeTab === 'profile' ? (
                    <>
                        {/* Bio */}
                        <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7]">
                            <h3 className="text-[15px] sm:text-[16px] font-bold text-[#111111] mb-2 sm:mb-3 break-words">자기소개</h3>
                            <p className="text-[13px] sm:text-[14px] text-[#606060] leading-relaxed break-words">
                                {user.bio}
                            </p>
                        </div>

                        {/* Interests */}
                        {user.interests && user.interests.length > 0 && (
                            <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7]">
                                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#111111] mb-2 sm:mb-3 break-words">관심사</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.interests.map((interest, index) => (
                                        <span
                                            key={index}
                                            className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#F1F3F5] text-[#606060] text-[12px] sm:text-[13px] md:text-[14px] rounded-full whitespace-nowrap break-words"
                                        >
                                            #{interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Learning Goals */}
                        {user.learningGoals && user.learningGoals.length > 0 && (
                            <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7]">
                                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#111111] mb-2 sm:mb-3 break-words">학습 목표</h3>
                                <ul className="space-y-2">
                                    {user.learningGoals.map((goal, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C471] flex-shrink-0 mt-0.5" />
                                            <span className="text-[13px] sm:text-[14px] text-[#606060] break-words">{goal}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    /* Schedule Tab */
                    <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7]">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                            <h3 className="text-[15px] sm:text-[16px] font-bold text-[#111111] break-words">가능한 시간</h3>
                            <span className="text-[11px] sm:text-[12px] text-[#929292] break-words">{user.timezone}</span>
                        </div>
                        {user.availability && user.availability.length > 0 ? (
                            <div className="space-y-2 sm:space-y-3">
                                {user.availability.map((slot, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                        <span className="text-[13px] sm:text-[14px] font-medium text-[#111111] break-words whitespace-nowrap">
                                            {slot.day}
                                        </span>
                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                            {slot.times && slot.times.map((time, timeIndex) => (
                                                <span
                                                    key={timeIndex}
                                                    className="px-2.5 sm:px-3 py-1 bg-[#F1F3F5] text-[#606060] text-[11px] sm:text-[12px] rounded-lg whitespace-nowrap break-words"
                                                >
                                                    {time}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[#929292] text-sm">등록된 스케줄이 없습니다.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7E7E7] p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6">
                {!isScheduling ? (
                    <div className="flex space-x-2 sm:space-x-3">
                        <CommonButton
                            onClick={handleRejectMatch}
                            variant="secondary"
                            className="flex-1 text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                        >
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            거절
                        </CommonButton>
                        <CommonButton
                            onClick={handleAcceptMatch}
                            variant="primary"
                            className="flex-1 text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                        >
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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