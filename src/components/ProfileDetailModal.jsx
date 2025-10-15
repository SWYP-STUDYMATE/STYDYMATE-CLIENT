import { useState } from 'react';
import { 
    X, 
    Globe, 
    Clock, 
    Target, 
    Calendar, 
    MessageCircle, 
    Video, 
    CheckCircle, 
    XCircle,
    Star,
    UserPlus,
    Heart
} from 'lucide-react';
import CommonButton from './CommonButton';
import OptimizedImage from './OptimizedImage';
import { DEFAULT_PROFILE_IMAGE } from '../utils/imageUtils';
import useMatchingStore from '../store/matchingStore';
import { useAlert } from '../hooks/useAlert';

export default function ProfileDetailModal({ user, isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { sendMatchRequest } = useMatchingStore();
    const { showError, showSuccess } = useAlert();

    if (!isOpen || !user) return null;

    // 백엔드 필드명 매핑 (Workers API → 프론트엔드 표시)
    const mappedUser = {
        ...user,
        name: user.englishName || user.name,
        bio: user.selfBio || user.bio || user.intro,
        profileImage: user.profileImageUrl || user.profileImage,
        nationality: user.location || user.country || user.nationality,
        // targetLanguages 배열을 단일 learningLanguage로 변환 (첫 번째 언어)
        learningLanguage: user.targetLanguages?.[0]?.languageName || user.learningLanguage,
        level: user.targetLanguages?.[0]?.currentLevel || user.level || user.proficiencyLevel,
        // 페르소나 정보를 interests로 표시 (기존 interests가 없을 경우)
        interests: user.interests?.length > 0
            ? user.interests
            : (user.partnerPersonalities?.length > 0 ? user.partnerPersonalities : []),
        // 매칭 점수
        matchScore: user.compatibilityScore || user.matchScore,
        // 온라인 상태
        isOnline: user.onlineStatus === 'ONLINE' || user.isOnline,
    };

    const handleSendRequest = async () => {
        if (!message.trim()) {
            showError('메시지를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            await sendMatchRequest(user.id, message);
            showSuccess('매칭 요청을 보냈습니다!');
            setMessage('');
            onClose();
        } catch (error) {
            console.error('매칭 요청 실패:', error);
            showError('매칭 요청을 보내는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // 온라인 상태에 따른 색상
    const getStatusColor = () => {
        if (mappedUser.isOnline) return 'bg-[#00C471]';
        return 'bg-[#929292]';
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white rounded-[20px] w-full max-w-md max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#E7E7E7]">
                    <h2 className="text-[18px] font-bold text-[#111111]">파트너 프로필</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-[#929292]" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Profile Header */}
                    <div className="p-6 border-b border-[#E7E7E7]">
                        <div className="flex items-start space-x-4 mb-4">
                            <div className="relative">
                                <OptimizedImage
                                    src={mappedUser.profileImage || DEFAULT_PROFILE_IMAGE}
                                    alt={mappedUser.name}
                                    className="w-20 h-20 rounded-full object-cover"
                                    width={80}
                                    height={80}
                                />
                                <div
                                    className={`absolute bottom-0 right-0 w-5 h-5 ${getStatusColor()}
                                    border-2 border-white rounded-full`}
                                />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="text-[18px] font-bold text-[#111111]">{mappedUser.name}</h3>
                                    {mappedUser.matchScore && (
                                        <span className="px-2 py-1 bg-[#00C471] text-white text-[12px]
                                        font-medium rounded-full">
                                            매칭 {mappedUser.matchScore}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-[14px] text-[#606060] mb-2">
                                    {mappedUser.age ? `${mappedUser.age}세` : '나이 미공개'} • {mappedUser.nationality || '국가 미공개'}
                                </p>
                                <div className="flex items-center space-x-4 text-[14px] text-[#929292]">
                                    <span className="flex items-center space-x-1">
                                        <Globe className="w-4 h-4" />
                                        <span>{mappedUser.nativeLanguage || '모국어'} → {mappedUser.learningLanguage || '학습 언어'}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <Target className="w-4 h-4" />
                                        <span>{mappedUser.level || '레벨 미공개'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-[18px] font-bold text-[#111111]">
                                    {mappedUser.completedSessions || 0}
                                </p>
                                <p className="text-[12px] text-[#929292]">완료 세션</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[18px] font-bold text-[#111111]">
                                    {mappedUser.rating || '5.0'}
                                </p>
                                <p className="text-[12px] text-[#929292]">평점</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[18px] font-bold text-[#111111]">
                                    {mappedUser.responseRate || '100'}%
                                </p>
                                <p className="text-[12px] text-[#929292]">응답률</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#E7E7E7]">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
                                activeTab === 'profile'
                                    ? 'text-[#00C471] border-[#00C471]'
                                    : 'text-[#929292] border-transparent'
                            }`}
                        >
                            프로필
                        </button>
                        <button
                            onClick={() => setActiveTab('request')}
                            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
                                activeTab === 'request'
                                    ? 'text-[#00C471] border-[#00C471]'
                                    : 'text-[#929292] border-transparent'
                            }`}
                        >
                            매칭 요청
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'profile' ? (
                            <div className="space-y-6">
                                {/* Bio */}
                                <div>
                                    <h4 className="text-[16px] font-bold text-[#111111] mb-3">자기소개</h4>
                                    <p className="text-[14px] text-[#606060] leading-relaxed">
                                        {mappedUser.bio || '아직 자기소개를 작성하지 않았습니다.'}
                                    </p>
                                </div>

                                {/* Interests & Personalities */}
                                {mappedUser.interests && mappedUser.interests.length > 0 && (
                                    <div>
                                        <h4 className="text-[16px] font-bold text-[#111111] mb-3">
                                            {user.partnerPersonalities?.length > 0 && !user.interests?.length ? '성격 특성' : '관심사'}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {mappedUser.interests.map((interest, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 bg-[#E7E7E7] text-[#606060]
                                                    text-[14px] rounded-full"
                                                >
                                                    #{interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Target Languages (여러 학습 언어 표시) */}
                                {user.targetLanguages && user.targetLanguages.length > 0 && (
                                    <div>
                                        <h4 className="text-[16px] font-bold text-[#111111] mb-3">학습 중인 언어</h4>
                                        <div className="space-y-2">
                                            {user.targetLanguages.map((lang, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-[#E6F9F1] rounded-lg">
                                                    <span className="text-[14px] font-medium text-[#111111]">
                                                        {lang.languageName}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        {lang.currentLevel && (
                                                            <span className="px-2 py-1 bg-[#00C471] text-white text-[12px] rounded-full">
                                                                현재: {lang.currentLevel}
                                                            </span>
                                                        )}
                                                        {lang.targetLevel && (
                                                            <span className="px-2 py-1 bg-[#929292] text-white text-[12px] rounded-full">
                                                                목표: {lang.targetLevel}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Learning Goals */}
                                {mappedUser.learningGoals && mappedUser.learningGoals.length > 0 && (
                                    <div>
                                        <h4 className="text-[16px] font-bold text-[#111111] mb-3">학습 목표</h4>
                                        <ul className="space-y-2">
                                            {mappedUser.learningGoals.map((goal, index) => (
                                                <li key={index} className="flex items-start space-x-2">
                                                    <CheckCircle className="w-5 h-5 text-[#00C471] flex-shrink-0 mt-0.5" />
                                                    <span className="text-[14px] text-[#606060]">{goal}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Availability */}
                                {mappedUser.availability && mappedUser.availability.length > 0 && (
                                    <div>
                                        <h4 className="text-[16px] font-bold text-[#111111] mb-3">가능한 시간</h4>
                                        <div className="space-y-2">
                                            {mappedUser.availability.map((slot, index) => (
                                                <div key={index} className="flex items-center justify-between">
                                                    <span className="text-[14px] font-medium text-[#111111]">
                                                        {slot.day}
                                                    </span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {slot.times.map((time, timeIndex) => (
                                                            <span
                                                                key={timeIndex}
                                                                className="px-2 py-1 bg-[#E7E7E7] text-[#606060]
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
                        ) : (
                            /* Request Tab */
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[16px] font-bold text-[#111111] mb-3">매칭 요청 메시지</h4>
                                    <p className="text-[14px] text-[#929292] mb-3">
                                        {mappedUser.name}님에게 보낼 메시지를 작성해주세요.
                                    </p>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={`안녕하세요! ${mappedUser.name}님과 언어 교환을 하고 싶습니다. 저는...`}
                                        className="w-full h-32 p-4 border border-[#E7E7E7] rounded-lg resize-none
                                        focus:border-[#00C471] focus:outline-none text-[14px]"
                                        maxLength={500}
                                    />
                                    <div className="text-right mt-2">
                                        <span className="text-[12px] text-[#929292]">
                                            {message.length}/500
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-[#E7E7E7]">
                    {activeTab === 'profile' ? (
                        <div className="flex gap-3">
                            <CommonButton
                                onClick={onClose}
                                variant="secondary"
                                className="flex-1"
                            >
                                닫기
                            </CommonButton>
                            <CommonButton
                                onClick={() => setActiveTab('request')}
                                variant="success"
                                className="flex-1"
                                icon={<UserPlus />}
                            >
                                매칭 요청
                            </CommonButton>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <CommonButton
                                onClick={() => setActiveTab('profile')}
                                variant="secondary"
                                className="flex-1"
                            >
                                뒤로
                            </CommonButton>
                            <CommonButton
                                onClick={handleSendRequest}
                                variant="success"
                                className="flex-1"
                                disabled={isLoading || !message.trim()}
                                loading={isLoading}
                                icon={!isLoading ? <Heart /> : undefined}
                            >
                                {isLoading ? '전송 중...' : '요청 보내기'}
                            </CommonButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
