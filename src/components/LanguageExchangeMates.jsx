import React from 'react';

const LanguageExchangeMates = () => {
  // 현재 달의 첫날과 마지막 날 계산
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 0부터 시작하므로 +1
    
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}월 ${day}일`;
    };
    
    return `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
  };

  const mates = [
    {
      name: "Dana Lee",
      nationality: "Korean",
      languageExchange: "영어 ←> 한국어"
    },
    {
      name: "Jason Park", 
      nationality: "American",
      languageExchange: "영어 ←> 한국어"
    },
    {
      name: "Edwin Simonis",
      nationality: "British", 
      languageExchange: "영어 ←> 한국어"
    },
    {
      name: "Andrew Tate",
      nationality: "American",
      languageExchange: "영어 ←> 한국어"
    }
  ];

  const MateCard = ({ mate }) => (
    <div className="bg-white rounded-[20px] p-4 mb-4 flex items-center">
      {/* 프로필 사진 (회색 동그라미) */}
      <div className="w-[70px] h-[70px] bg-gray-300 rounded-full mr-4 flex-shrink-0"></div>
      
      {/* 메이트 정보 */}
      <div className="flex-1">
        <div className="text-lg font-semibold text-[#111111] leading-[21px] mb-1">
          {mate.name} ({mate.nationality})
        </div>
        <div className="text-lg font-normal text-[#111111] leading-[21px]">
          {mate.languageExchange}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-[#e6f9f1] rounded-lg p-6 w-[540px] h-full">
      {/* 제목과 기간 */}
      <div className="text-center mb-6">
        <h2 className="text-[34px] font-extrabold text-[#111111] leading-[42px] mb-2">
          🏆 언어교환 메이트
        </h2>
        <div className="text-base font-normal text-[#343a40] leading-[24px]">
          {getCurrentMonthRange()}
        </div>
      </div>

      {/* 메이트 목록 */}
      <div className="space-y-4 flex-1">
        {mates.map((mate, index) => (
          <MateCard key={index} mate={mate} />
        ))}
      </div>
    </div>
  );
};

export default LanguageExchangeMates; 