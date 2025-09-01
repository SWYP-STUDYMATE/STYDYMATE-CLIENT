import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Globe, MessageCircle, Star, Heart, UserPlus } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { DEFAULT_PROFILE_IMAGE } from '../utils/imageUtils';
import CommonButton from './CommonButton';
import useMatchingStore from '../store/matchingStore';
import ProfileDetailModal from './ProfileDetailModal';
import { useToast } from './ErrorToast';

export default function MatchingProfileCard({ user, onClick, showActions = true, useModal = true }) {
    const navigate = useNavigate();
    const { sendMatchRequest } = useMatchingStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showError, showSuccess, ToastContainer } = useToast();

    const handleClick = () => {
        if (onClick) {
            onClick(user);
        } else if (useModal) {
            setIsModalOpen(true);
        } else {
            navigate(`/matching/profile/${user.id}`);
        }
    };

    const handleSendRequest = async (e) => {
        e.stopPropagation(); // 부모 클릭 이벤트 방지
        if (useModal) {
            setIsModalOpen(true);
            return;
        }

        try {
            await sendMatchRequest(user.id, `안녕하세요! ${user.name}님과 언어 교환을 하고 싶습니다.`);
            // 성공 메시지 표시
            showSuccess(`${user.name}님에게 매칭 요청을 보냈습니다!`);
        } catch (error) {
            console.error('매칭 요청 실패:', error);
            showError('매칭 요청을 보내는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    const handleViewProfile = (e) => {
        e.stopPropagation();
        if (useModal) {
            setIsModalOpen(true);
        } else {
            navigate(`/matching/profile/${user.id}`);
        }
    };

    // 온라인 상태에 따른 색상 (디자인 시스템 준수)
    const getStatusColor = () => {
        if (user.isOnline) return 'bg-[#00C471]';  // green-500 from design system
        return 'bg-[#929292]';  // black-200 from design system
    };

    // 레벨에 따른 배경색 (디자인 시스템 준수)
    const getLevelBgColor = (level) => {
        const levelColors = {
            'Beginner': 'bg-[#B0EDD3]',        // green-100
            'Elementary': 'bg-[#B0EDD3]',      // green-100
            'Intermediate': 'bg-[#E6F9F1]',    // green-50
            'Upper Intermediate': 'bg-[#E6F9F1]', // green-50
            'Advanced': 'bg-[#8AE4BE]',        // green-200
            'Native': 'bg-[#54D7A0]'           // green-300
        };
        return levelColors[level] || 'bg-[#E6F9F1]';  // default green-50
    };

    // 레벨에 따른 텍스트 색상 (디자인 시스템 준수)
    const getLevelTextColor = (level) => {
        const levelColors = {
            'Beginner': 'text-[#606060]',      // black-300
            'Elementary': 'text-[#606060]',    // black-300
            'Intermediate': 'text-[#008B50]',  // green-700
            'Upper Intermediate': 'text-[#008B50]', // green-700
            'Advanced': 'text-[#006C3E]',      // green-800
            'Native': 'text-[#00522F]'         // green-900
        };
        return levelColors[level] || 'text-[#606060]';  // default black-300
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-[20px] p-5 border border-[#E7E7E7] cursor-pointer 
                 hover:shadow-md transition-all duration-200 hover:border-[#00C471]"
        >
            {/* 상단 정보 영역 */}
            <div className="flex items-start gap-4 mb-4">
                {/* 프로필 이미지 */}
                <div className="relative">
                    <OptimizedImage
                        src={user.profileImage || DEFAULT_PROFILE_IMAGE}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                        width={64}
                        height={64}
                        loading="lazy"
                    />
                    {/* 온라인 상태 표시 */}
                    <div
                        className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor()} 
                        rounded-full border-2 border-white`}
                    />
                </div>

                {/* 기본 정보 */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[16px] font-bold text-[#111111]">{user.name}</h3>
                        {user.age && (
                            <span className="text-[14px] text-[#606060]">{user.age}세</span>
                        )}
                    </div>

                    {/* 언어 정보 */}
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-[#606060]" />
                        <span className="text-[14px] text-[#606060]">
                            {user.nativeLanguage} → {user.learningLanguage}
                        </span>
                    </div>

                    {/* 레벨 표시 */}
                    <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-[12px] font-medium 
                        ${getLevelBgColor(user.level)} ${getLevelTextColor(user.level)}`}
                    >
                        {user.level}
                    </div>
                </div>

                {/* 매칭 점수 */}
                {user.matchScore && (
                    <div className="text-center">
                        <div className="text-[24px] font-bold text-[#006C3E]">
                            {user.matchScore}%
                        </div>
                        <div className="text-[12px] text-[#606060]">매칭</div>
                    </div>
                )}
            </div>

            {/* 소개 */}
            {user.bio && (
                <p className="text-[14px] text-[#606060] mb-3 line-clamp-2">
                    {user.bio}
                </p>
            )}

            {/* 관심사 태그 */}
            {user.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {user.interests.slice(0, 3).map((interest, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-[#E7E7E7] text-[#606060] rounded-full text-[12px]"
                        >
                            #{interest}
                        </span>
                    ))}
                    {user.interests.length > 3 && (
                        <span className="px-3 py-1 text-[#606060] text-[12px]">
                            +{user.interests.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* 하단 정보 */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E7E7E7]">
                {/* 활동 정보 */}
                <div className="flex items-center gap-4">
                    {/* 마지막 활동 시간 */}
                    {user.lastActive && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#929292]" />
                            <span className="text-[12px] text-[#929292]">{user.lastActive}</span>
                        </div>
                    )}

                    {/* 완료된 세션 수 */}
                    {user.completedSessions !== undefined && (
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-[#929292]" />
                            <span className="text-[12px] text-[#929292]">
                                {user.completedSessions}회
                            </span>
                        </div>
                    )}

                    {/* 평점 */}
                    {user.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#FFD700] fill-current" />
                            <span className="text-[12px] text-[#929292]">{user.rating}</span>
                        </div>
                    )}
                </div>

                {/* 응답률 */}
                {user.responseRate && (
                    <div className="text-[12px] text-[#929292]">
                        응답률 {user.responseRate}%
                    </div>
                )}
            </div>

            {/* 액션 버튼 */}
            {showActions && (
                <div className="flex gap-2 pt-3 mt-3 border-t border-[#E7E7E7]">
                    <CommonButton
                        onClick={handleViewProfile}
                        variant="secondary"
                        className="flex-1 text-[14px] font-medium py-2"
                    >
                        <Globe className="w-4 h-4 mr-1" />
                        프로필 보기
                    </CommonButton>
                    <CommonButton
                        onClick={handleSendRequest}
                        variant="primary"
                        className="flex-1 text-[14px] font-medium py-2"
                    >
                        <UserPlus className="w-4 h-4 mr-1" />
                        매칭 요청
                    </CommonButton>
                </div>
            )}

            {/* Profile Detail Modal */}
            <ProfileDetailModal
                user={user}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            
            <ToastContainer />
        </div>
    );
}