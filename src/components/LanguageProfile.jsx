import React from 'react';
import { useNavigate } from 'react-router-dom';

const LanguageProfile = () => {
  const navigate = useNavigate();

  const profileData = {
    teachableLanguages: [
      { language: "영어", level: "Native" },
      { language: "스페인어", level: "Advanced Low" }
    ],
    learningLanguages: [
      { language: "한국어", level: "Intermediate Low" },
      { language: "프랑스어", level: "Intermediate Mid" }
    ],
    interests: [
      "자기 개발",
      "이직 준비", 
      "실전 회화/친구 사귀기",
      "여행",
      "비지니스",
      "문화",
      "드라마/영화"
    ]
  };

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
    // 임시: 온보딩인포 1페이지로 이동
    navigate('/onboarding-info/1');
  };

  return (
    <div className="bg-white border border-[#e6f9f1] rounded-[10px] p-6 relative">
      {/* 수정하기 버튼 */}
      <button
        onClick={handleEdit}
        className="absolute top-[34px] right-[32px] text-[15px] leading-[22px] text-[#E5E5E5] font-medium cursor-pointer"
      >
        수정하기
      </button>

      {/* 사용 가능한 언어 */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-[#212529] mb-4 leading-[26px] tracking-[-0.6px]">
          사용 가능한 언어 (가르칠 수 있는 언어)
        </h3>
        <div className="flex flex-wrap">
          {profileData.teachableLanguages.map((item, index) => (
            <LanguageTag 
              key={index}
              language={item.language} 
              level={item.level} 
            />
          ))}
        </div>
      </div>

      {/* 학습하고 싶은 언어 */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-[#212529] mb-4 leading-[26px] tracking-[-0.6px]">
          학습하고 싶은 언어
        </h3>
        <div className="flex flex-wrap">
          {profileData.learningLanguages.map((item, index) => (
            <LanguageTag 
              key={index}
              language={item.language} 
              level={item.level} 
            />
          ))}
        </div>
      </div>

      {/* 학습 목적 & 관심사 */}
      <div>
        <h3 className="text-2xl font-bold text-[#212529] mb-4 leading-[26px] tracking-[-0.6px]">
          학습 목적 & 관심사
        </h3>
        <div className="flex flex-wrap">
          {profileData.interests.map((interest, index) => (
            <InterestTag 
              key={index}
              interest={interest} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageProfile; 