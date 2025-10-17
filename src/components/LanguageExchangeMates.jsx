import React from 'react';

const LanguageExchangeMates = ({ mates = [], loading = false, emptyMessage = '최근 매칭된 메이트가 없습니다.' }) => {
  // 현재 달의 첫날과 마지막 날 계산
  const getCurrentMonthRange = () => {
    const now = new Date();
    const month = now.getMonth() + 1; // 0부터 시작하므로 +1

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}월 ${day}일`;
    };

    return `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
  };

  const MateCard = ({ mate }) => (
    <div className="bg-white rounded-[20px] p-3 sm:p-4 mb-3 sm:mb-4 flex items-center">
      <div className="w-14 h-14 sm:w-[70px] sm:h-[70px] bg-[#F1F3F5] rounded-full mr-3 sm:mr-4 flex-shrink-0 overflow-hidden">
        {mate.profileImage ? (
          <img src={mate.profileImage} alt={`${mate.name} 프로필`} className="w-full h-full object-cover" />
        ) : null}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-base sm:text-lg font-semibold text-[#111111] leading-[20px] sm:leading-[21px] mb-1 truncate">
          {mate.name}
          {mate.location ? <span className="text-xs sm:text-sm text-[#929292] ml-1">({mate.location})</span> : null}
        </div>
        <div className="text-xs sm:text-sm text-[#606060] leading-[18px] sm:leading-[20px] mb-1">
          {mate.nativeLanguage ? `모국어: ${mate.nativeLanguage}` : ''}
        </div>
        {mate.languageExchange ? (
          <div className="text-sm sm:text-base font-normal text-[#111111] leading-[18px] sm:leading-[21px] line-clamp-2">
            {mate.languageExchange}
          </div>
        ) : null}
        {mate.lastActive ? (
          <div className="text-xs text-[#929292] mt-1">최근 활동: {mate.lastActive}</div>
        ) : null}
      </div>

      {typeof mate.compatibilityScore === 'number' && (
        <div className="flex flex-col items-end ml-2 sm:ml-4 flex-shrink-0">
          <span className="text-xs sm:text-sm text-[#929292]">호환도</span>
          <span className="text-base sm:text-lg font-bold text-[#00C471]">{Math.round(mate.compatibilityScore)}%</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white border border-[#E6F9F1] rounded-[10px] p-4 sm:p-6 w-full h-full">
        <div className="text-center mb-4 sm:mb-6">
          <div className="h-6 sm:h-8 bg-[#E7E7E7] rounded w-2/3 mx-auto animate-pulse" />
        </div>
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-[20px] p-3 sm:p-4 flex items-center border border-[#F1F3F5] animate-pulse">
              <div className="w-14 h-14 sm:w-[70px] sm:h-[70px] bg-[#E7E7E7] rounded-full mr-3 sm:mr-4" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#E7E7E7] rounded w-1/2" />
                <div className="h-3 bg-[#E7E7E7] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E6F9F1] rounded-[10px] p-4 sm:p-6 w-full h-full">
      {/* 제목과 기간 */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#111111] leading-[32px] sm:leading-[38px] lg:leading-[42px] mb-2">
          🏆 언어교환 메이트
        </h2>
        <div className="text-sm sm:text-base font-normal text-[#606060] leading-[20px] sm:leading-[24px]">
          {getCurrentMonthRange()}
        </div>
      </div>

      {/* 메이트 목록 */}
      {mates.length > 0 ? (
        <div className="space-y-3 sm:space-y-4 flex-1">
          {mates.map((mate, index) => (
            <MateCard key={`${mate.matchId || mate.name}-${index}`} mate={mate} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[#929292] text-sm sm:text-base py-8">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default LanguageExchangeMates; 
