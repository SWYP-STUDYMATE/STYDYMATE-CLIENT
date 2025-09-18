import React from 'react';
import { useNavigate } from 'react-router-dom';

const LanguageProfile = ({ showEditButton = true, profileData = null, loading = false, emptyMessage = '등록된 언어 정보가 없습니다.' }) => {
  const navigate = useNavigate();

  const hasTeachable = profileData?.teachableLanguages?.length;
  const hasLearning = profileData?.learningLanguages?.length;
  const hasInterests = profileData?.interests?.length;
  const hasAnyData = hasTeachable || hasLearning || hasInterests;

  const LanguageTag = ({ language, level }) => (
    <div className="inline-flex items-center px-4 py-3 bg-[#f7fcfc] border border-[#e6f9f1] rounded-full mr-3 mb-3">
      <span className="text-base font-semibold text-[#212529] leading-[26px]">
        {language} ({level})
      </span>
    </div>
  );

  const InterestTag = ({ interest }) => (
    <div className="inline-flex items-center px-4 py-3 bg-[#f7fcfc] border border-[#e6f9f1] rounded-full mr-3 mb-3">
      <span className="text-base font-semibold text-[#212529] leading-[26px]">
        {interest}
      </span>
    </div>
  );

  const handleEdit = () => {
    // 프로필 편집 페이지로 이동
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#e6f9f1] rounded-[10px] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#e5e5e5] rounded w-1/3"></div>
          <div className="h-10 bg-[#e5e5e5] rounded w-full"></div>
          <div className="h-6 bg-[#e5e5e5] rounded w-1/4"></div>
          <div className="h-10 bg-[#e5e5e5] rounded w-full"></div>
          <div className="h-6 bg-[#e5e5e5] rounded w-1/4"></div>
          <div className="h-10 bg-[#e5e5e5] rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e6f9f1] rounded-[10px] p-6 relative">
      {/* 수정하기 버튼 - showEditButton prop에 따라 표시 */}
      {showEditButton && (
        <button
          onClick={handleEdit}
          className="absolute top-[34px] right-[32px] text-[15px] leading-[22px] text-[#E5E5E5] font-medium cursor-pointer"
        >
          수정하기
        </button>
      )}

      {/* 사용 가능한 언어 */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-[#212529] mb-4 leading-[26px] tracking-[-0.6px]">
          사용 가능한 언어 (가르칠 수 있는 언어)
        </h3>
        {hasTeachable ? (
          <div className="flex flex-wrap">
            {profileData.teachableLanguages.map((item, index) => (
              <LanguageTag 
                key={`${item.language}-${item.level}-${index}`}
                language={item.language} 
                level={item.level} 
              />
            ))}
          </div>
        ) : (
          <p className="text-base text-[#767676]">가르칠 수 있는 언어 정보가 없습니다.</p>
        )}
      </div>

      {/* 학습하고 싶은 언어 */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-[#212529] mb-4 leading-[26px] tracking-[-0.6px]">
          학습하고 싶은 언어
        </h3>
        {hasLearning ? (
          <div className="flex flex-wrap">
            {profileData.learningLanguages.map((item, index) => (
              <LanguageTag 
                key={`${item.language}-${item.level}-${index}`}
                language={item.language} 
                level={item.level} 
              />
            ))}
          </div>
        ) : (
          <p className="text-base text-[#767676]">학습하려는 언어가 아직 등록되지 않았습니다.</p>
        )}
      </div>

      {/* 학습 목적 & 관심사 */}
      <div>
        <h3 className="text-2xl font-bold text-[#212529] mb-4 leading-[26px] tracking-[-0.6px]">
          학습 목적 & 관심사
        </h3>
        {hasInterests ? (
          <div className="flex flex-wrap">
            {profileData.interests.map((interest, index) => (
              <InterestTag 
                key={`${interest}-${index}`}
                interest={interest} 
              />
            ))}
          </div>
        ) : (
          <p className="text-base text-[#767676]">관심사가 아직 등록되지 않았습니다.</p>
        )}
      </div>

      {!hasAnyData && (
        <div className="mt-6 text-base text-[#767676]">{emptyMessage}</div>
      )}
    </div>
  );
};

export default LanguageProfile; 
