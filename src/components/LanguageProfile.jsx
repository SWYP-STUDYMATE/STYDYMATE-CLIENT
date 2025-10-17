import React from 'react';
import { useNavigate } from 'react-router-dom';

const LanguageProfile = ({ showEditButton = true, profileData = null, loading = false, emptyMessage = '등록된 언어 정보가 없습니다.' }) => {
  const navigate = useNavigate();

  const hasTeachable = profileData?.teachableLanguages?.length;
  const hasLearning = profileData?.learningLanguages?.length;
  const hasInterests = profileData?.interests?.length;
  const hasAnyData = hasTeachable || hasLearning || hasInterests;

  const LanguageTag = ({ language, level }) => (
    <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-3 bg-[#F7FCFC] border border-[#E6F9F1] rounded-full mr-2 sm:mr-3 mb-2 sm:mb-3">
      <span className="text-sm sm:text-base font-semibold text-[#111111] leading-[20px] sm:leading-[26px]">
        {language} ({level})
      </span>
    </div>
  );

  const InterestTag = ({ interest }) => (
    <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-3 bg-[#F7FCFC] border border-[#E6F9F1] rounded-full mr-2 sm:mr-3 mb-2 sm:mb-3">
      <span className="text-sm sm:text-base font-semibold text-[#111111] leading-[20px] sm:leading-[26px]">
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
      <div className="bg-white border border-[#E6F9F1] rounded-[10px] p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 sm:h-6 bg-[#E7E7E7] rounded w-1/2 sm:w-1/3"></div>
          <div className="h-8 sm:h-10 bg-[#E7E7E7] rounded w-full"></div>
          <div className="h-5 sm:h-6 bg-[#E7E7E7] rounded w-1/3 sm:w-1/4"></div>
          <div className="h-8 sm:h-10 bg-[#E7E7E7] rounded w-full"></div>
          <div className="h-5 sm:h-6 bg-[#E7E7E7] rounded w-1/3 sm:w-1/4"></div>
          <div className="h-8 sm:h-10 bg-[#E7E7E7] rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E6F9F1] rounded-[10px] p-4 sm:p-6 relative">
      {/* 수정하기 버튼 - showEditButton prop에 따라 표시 */}
      {showEditButton && (
        <button
          onClick={handleEdit}
          className="absolute top-4 right-4 sm:top-[34px] sm:right-[32px] text-sm sm:text-[15px] leading-[20px] sm:leading-[22px] text-[#E7E7E7] hover:text-[#929292] font-medium cursor-pointer transition-colors"
        >
          수정하기
        </button>
      )}

      {/* 사용 가능한 언어 */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#111111] mb-3 sm:mb-4 leading-[24px] sm:leading-[26px] tracking-[-0.025em]">
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
          <p className="text-sm sm:text-base text-[#929292]">가르칠 수 있는 언어 정보가 없습니다.</p>
        )}
      </div>

      {/* 학습하고 싶은 언어 */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#111111] mb-3 sm:mb-4 leading-[24px] sm:leading-[26px] tracking-[-0.025em]">
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
          <p className="text-sm sm:text-base text-[#929292]">학습하려는 언어가 아직 등록되지 않았습니다.</p>
        )}
      </div>

      {/* 학습 목적 & 관심사 */}
      <div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#111111] mb-3 sm:mb-4 leading-[24px] sm:leading-[26px] tracking-[-0.025em]">
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
          <p className="text-sm sm:text-base text-[#929292]">관심사가 아직 등록되지 않았습니다.</p>
        )}
      </div>

      {!hasAnyData && (
        <div className="mt-4 sm:mt-6 text-sm sm:text-base text-[#929292]">{emptyMessage}</div>
      )}
    </div>
  );
};

export default LanguageProfile; 
