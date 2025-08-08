import { useNavigate } from 'react-router-dom';
import { Clock, Globe, MessageCircle, Star } from 'lucide-react';

export default function MatchingProfileCard({ user, onClick }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick(user);
        } else {
            navigate(`/matching/profile/${user.id}`);
        }
    };

    // 온라인 상태에 따른 색상
    const getStatusColor = () => {
        if (user.isOnline) return 'bg-green-500';
        return 'bg-gray-300';
    };

    // 레벨에 따른 배경색
    const getLevelBgColor = (level) => {
        const levelColors = {
            'Beginner': 'bg-[#F3F4F6]',
            'Elementary': 'bg-[#E0F2FE]',
            'Intermediate': 'bg-[#FEF3C7]',
            'Upper Intermediate': 'bg-[#FED7AA]',
            'Advanced': 'bg-[#E9D5FF]',
            'Native': 'bg-[#F3E8FF]'
        };
        return levelColors[level] || 'bg-[#F3F4F6]';
    };

    // 레벨에 따른 텍스트 색상
    const getLevelTextColor = (level) => {
        const levelColors = {
            'Beginner': 'text-[#6B7280]',
            'Elementary': 'text-[#0369A1]',
            'Intermediate': 'text-[#D97706]',
            'Upper Intermediate': 'text-[#EA580C]',
            'Advanced': 'text-[#7C3AED]',
            'Native': 'text-[#6B21A8]'
        };
        return levelColors[level] || 'text-[#6B7280]';
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-[20px] p-5 border border-[#E7E7E7] cursor-pointer 
                 hover:shadow-md transition-shadow duration-200"
        >
            {/* 상단 정보 영역 */}
            <div className="flex items-start gap-4 mb-4">
                {/* 프로필 이미지 */}
                <div className="relative">
                    <img
                        src={user.profileImage || '/assets/basicProfilePic.png'}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
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
                        <div className="text-[24px] font-bold text-[#4338CA]">
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
                            className="px-3 py-1 bg-[#F3F4F6] text-[#606060] rounded-full text-[12px]"
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
            <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6]">
                {/* 활동 정보 */}
                <div className="flex items-center gap-4">
                    {/* 마지막 활동 시간 */}
                    {user.lastActive && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#9CA3AF]" />
                            <span className="text-[12px] text-[#9CA3AF]">{user.lastActive}</span>
                        </div>
                    )}

                    {/* 완료된 세션 수 */}
                    {user.completedSessions !== undefined && (
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-[#9CA3AF]" />
                            <span className="text-[12px] text-[#9CA3AF]">
                                {user.completedSessions}회
                            </span>
                        </div>
                    )}

                    {/* 평점 */}
                    {user.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#FCD34D] fill-current" />
                            <span className="text-[12px] text-[#9CA3AF]">{user.rating}</span>
                        </div>
                    )}
                </div>

                {/* 응답률 */}
                {user.responseRate && (
                    <div className="text-[12px] text-[#9CA3AF]">
                        응답률 {user.responseRate}%
                    </div>
                )}
            </div>
        </div>
    );
}