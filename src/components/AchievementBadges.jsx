import React from 'react';

const AchievementBadges = () => {
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
    
    const daysInMonth = lastDay.getDate();
    
    return `${formatDate(firstDay)} - ${formatDate(lastDay)} (${daysInMonth}일)`;
  };

  const badges = [
    {
      title: "첫 스터디 시작!",
      imageSrc: "/assets/target.png",
      imageAlt: "타겟 이미지",
      isActive: true
    },
    {
      title: "연속 학습자",
      imageSrc: "/assets/calender.png",
      imageAlt: "달력 이미지",
      isActive: false
    },
    {
      title: "시간 지킴이",
      imageSrc: "/assets/time.png",
      imageAlt: "시간 이미지",
      isActive: false
    },
    {
      title: "대화의 달인",
      imageSrc: "/assets/dialog.png",
      imageAlt: "대화 이미지",
      isActive: false
    }
  ];

  const BadgeCard = ({ badge }) => (
    <div className="bg-white rounded-[10px] p-4 w-[250px] h-[250px] flex flex-col items-center justify-center flex-shrink-0 relative">
      <div className="w-[180px] h-[188px] flex flex-col items-center">
        {/* 이미지 영역 */}
        <div className="w-[150px] h-[84px] rounded mb-4 flex items-center justify-center overflow-hidden">
          <img 
            src={badge.imageSrc} 
            alt={badge.imageAlt}
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* 배지 제목 */}
        <div className="text-2xl font-bold text-[#111111] leading-[31px] text-center">
          {badge.title}
        </div>
      </div>
      
      {/* 비활성화 오버레이 */}
      {!badge.isActive && (
        <div className="absolute inset-0 bg-white/60 rounded-[10px] flex items-center justify-center">
          
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#00A398]/[0.03] rounded-lg p-6 w-full ">
      {/* 제목과 기간 */}
      <div className="text-center mb-6">
        <h2 className="text-[34px] font-extrabold text-[#111111] leading-[42px] mb-2">
          🏆 성취 배지
        </h2>
        <div className="text-base font-normal text-[#343a40] leading-[24px]">
          {getCurrentMonthRange()}
        </div>
      </div>

      {/* 배지 목록 */}
      <div className="flex justify-center space-x-4">
        {badges.map((badge, index) => (
          <BadgeCard key={index} badge={badge} />
        ))}
      </div>
    </div>
  );
};

export default AchievementBadges; 