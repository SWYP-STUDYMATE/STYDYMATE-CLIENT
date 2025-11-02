import { useState } from 'react';
import { User, MapPin, MessageSquare, Edit3, Camera } from 'lucide-react';
import { getOptimizedImageUrl } from '../api/profile';
import ProfileEditor from './ProfileEditor';
import CommonButton from './CommonButton';
import { toDisplayText } from '../utils/text';

export default function ProfileCard({ 
  profile, 
  isOwner = false, 
  showEditButton = false,
  className = '',
  onProfileUpdate 
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // 프로필 데이터 추출
  const {
    name,
    englishName,
    residence,
    profileImage,
    intro
  } = profile || {};

  const normalizedResidence = toDisplayText(residence, '') || '';

  // 프로필 업데이트 핸들러
  const handleProfileUpdate = (updatedData) => {
    if (onProfileUpdate) {
      onProfileUpdate(updatedData);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-[20px] p-6 border border-[#E7E7E7] ${className}`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#111111]">프로필</h2>
          {showEditButton && (
            <CommonButton
              onClick={() => setIsEditorOpen(true)}
              variant="secondary"
              size="small"
              fullWidth={false}
              icon={<Edit3 className="w-4 h-4" />}
              className="px-3"
            >
              편집
            </CommonButton>
          )}
        </div>

        {/* 프로필 이미지와 기본 정보 */}
        <div className="flex items-start gap-4 mb-6">
          {/* 프로필 이미지 */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F3F4F6] border-2 border-[#E7E7E7]">
              {profileImage ? (
                <img
                  src={getOptimizedImageUrl(profileImage, { width: 64, height: 64 })}
                  alt={`${englishName || name}님의 프로필`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 text-[#929292]" />
                </div>
              )}
            </div>
            {!profileImage && isOwner && (
              <div className="absolute -bottom-1 -right-1 p-1 bg-[#929292] rounded-full">
                <Camera className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* 이름 정보 */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              {englishName && (
                <h3 className="text-[18px] font-bold text-[#111111] truncate">
                  {englishName}
                </h3>
              )}
              {name && name !== englishName && (
                <p className="text-[14px] text-[#606060] truncate">
                  {name}
                </p>
              )}
              {!englishName && !name && (
                <p className="text-[16px] text-[#929292]">이름을 설정해주세요</p>
              )}
            </div>

            {/* 거주지 */}
            <div className="flex items-center gap-2 text-[#606060] mb-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-[14px] truncate">
                {normalizedResidence || '거주지를 입력해주세요'}
              </span>
            </div>
          </div>
        </div>

        {/* 자기소개 */}
        <div className="border-t border-[#E7E7E7] pt-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-[#606060]" />
            <span className="text-[14px] font-medium text-[#111111]">자기소개</span>
          </div>
          
          {intro ? (
            <div className="bg-[#FAFAFA] rounded-[12px] p-4">
              <p className="text-[14px] text-[#111111] leading-relaxed whitespace-pre-wrap">
                {intro}
              </p>
            </div>
          ) : (
            <div className="bg-[#FAFAFA] rounded-[12px] p-4">
              <p className="text-[14px] text-[#929292] italic">
                {isOwner 
                  ? "자신을 소개하는 글을 작성해보세요."
                  : "아직 소개글이 없습니다."
                }
              </p>
            </div>
          )}
        </div>

        {/* 빈 상태일 때 안내 */}
        {isOwner && (!englishName || !normalizedResidence) && (
          <div className="mt-4 p-3 bg-[#FFF7ED] border border-[#FDBA74] rounded-[8px]">
            <p className="text-[12px] text-[#C2410C]">
              💡 프로필을 완성하면 더 많은 사람들과 연결될 수 있어요!
            </p>
          </div>
        )}
      </div>

      {/* 프로필 편집 모달 */}
      {showEditButton && (
        <ProfileEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </>
  );
}

// 컴팩트한 프로필 카드 (리스트용)
export function ProfileCardCompact({ 
  profile, 
  onClick, 
  className = '',
  showOnlineStatus = false 
}) {
  const {
    name,
    englishName,
    residence,
    profileImage,
    isOnline
  } = profile || {};

  const normalizedResidence = toDisplayText(residence, '') || '';

  return (
    <div 
      className={`
        bg-white rounded-[12px] p-4 border border-[#E7E7E7] cursor-pointer
        hover:border-[#00C471] hover:shadow-sm transition-all duration-200
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {/* 프로필 이미지 */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F3F4F6] border border-[#E7E7E7]">
            {profileImage ? (
              <img
                src={getOptimizedImageUrl(profileImage, { width: 48, height: 48 })}
                alt={`${englishName || name}님의 프로필`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-5 h-5 text-[#929292]" />
              </div>
            )}
          </div>
          {showOnlineStatus && (
            <div className={`
              absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
              ${isOnline ? 'bg-[#22C55E]' : 'bg-[#929292]'}
            `} />
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            {englishName && (
              <h4 className="text-[14px] font-bold text-[#111111] truncate">
                {englishName}
              </h4>
            )}
            {name && name !== englishName && (
              <p className="text-[12px] text-[#606060] truncate">
                {name}
              </p>
            )}
          </div>
          
          {normalizedResidence && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#929292]" />
              <span className="text-[12px] text-[#929292] truncate">
                {normalizedResidence}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}