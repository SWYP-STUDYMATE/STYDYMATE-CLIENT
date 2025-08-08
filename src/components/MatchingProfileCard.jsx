import { useNavigate } from 'react-router-dom';
import { Clock, Globe, MessageCircle, Star } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { DEFAULT_PROFILE_IMAGE } from '../utils/imageUtils';

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
            'Beginner': 'bg-[var(--green-100)]',
            'Elementary': 'bg-[var(--green-100)]',
            'Intermediate': 'bg-[var(--green-50)]',
            'Upper Intermediate': 'bg-[var(--green-50)]',
            'Advanced': 'bg-[var(--green-200)]',
            'Native': 'bg-[var(--green-300)]'
        };
        return levelColors[level] || 'bg-[var(--green-50)]';
    };

    // 레벨에 따른 텍스트 색상
    const getLevelTextColor = (level) => {
        const levelColors = {
            'Beginner': 'text-[var(--black-300)]',
            'Elementary': 'text-[var(--black-300)]',
            'Intermediate': 'text-[var(--green-700)]',
            'Upper Intermediate': 'text-[var(--green-700)]',
            'Advanced': 'text-[var(--green-800)]',
            'Native': 'text-[var(--green-900)]'
        };
        return levelColors[level] || 'text-[var(--black-300)]';
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-[20px] p-5 border border-[var(--black-50)] cursor-pointer 
                 hover:shadow-md transition-shadow duration-200"
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
                        <h3 className="text-[16px] font-bold text-[var(--black-500)]">{user.name}</h3>
                        {user.age && (
                            <span className="text-[14px] text-[var(--black-300)]">{user.age}세</span>
                        )}
                    </div>

                    {/* 언어 정보 */}
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-[var(--black-300)]" />
                        <span className="text-[14px] text-[var(--black-300)]">
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
                        <div className="text-[24px] font-bold text-[var(--green-800)]">
                            {user.matchScore}%
                        </div>
                        <div className="text-[12px] text-[var(--black-300)]">매칭</div>
                    </div>
                )}
            </div>

            {/* 소개 */}
            {user.bio && (
                <p className="text-[14px] text-[var(--black-300)] mb-3 line-clamp-2">
                    {user.bio}
                </p>
            )}

            {/* 관심사 태그 */}
            {user.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {user.interests.slice(0, 3).map((interest, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-[var(--black-50)] text-[var(--black-300)] rounded-full text-[12px]"
                        >
                            #{interest}
                        </span>
                    ))}
                    {user.interests.length > 3 && (
                        <span className="px-3 py-1 text-[var(--black-300)] text-[12px]">
                            +{user.interests.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* 하단 정보 */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--black-50)]">
                {/* 활동 정보 */}
                <div className="flex items-center gap-4">
                    {/* 마지막 활동 시간 */}
                    {user.lastActive && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[var(--black-200)]" />
                            <span className="text-[12px] text-[var(--black-200)]">{user.lastActive}</span>
                        </div>
                    )}

                    {/* 완료된 세션 수 */}
                    {user.completedSessions !== undefined && (
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-[var(--black-200)]" />
                            <span className="text-[12px] text-[var(--black-200)]">
                                {user.completedSessions}회
                            </span>
                        </div>
                    )}

                    {/* 평점 */}
                    {user.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[var(--warning-yellow)] fill-current" />
                            <span className="text-[12px] text-[var(--black-200)]">{user.rating}</span>
                        </div>
                    )}
                </div>

                {/* 응답률 */}
                {user.responseRate && (
                    <div className="text-[12px] text-[var(--black-200)]">
                        응답률 {user.responseRate}%
                    </div>
                )}
            </div>
        </div>
    );
}