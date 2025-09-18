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
    <div className="bg-white rounded-[20px] p-4 mb-4 flex items-center">
      <div className="w-[70px] h-[70px] bg-gray-200 rounded-full mr-4 flex-shrink-0 overflow-hidden">
        {mate.profileImage ? (
          <img src={mate.profileImage} alt={`${mate.name} 프로필`} className="w-full h-full object-cover" />
        ) : null}
      </div>

      <div className="flex-1">
        <div className="text-lg font-semibold text-[var(--black-500)] leading-[21px] mb-1">
          {mate.name}
          {mate.location ? <span className="text-sm text-[#767676] ml-1">({mate.location})</span> : null}
        </div>
        <div className="text-sm text-[var(--black-300)] leading-[20px] mb-1">
          {mate.nativeLanguage ? `모국어: ${mate.nativeLanguage}` : ''}
        </div>
        {mate.languageExchange ? (
          <div className="text-lg font-normal text-[var(--black-500)] leading-[21px]">
            {mate.languageExchange}
          </div>
        ) : null}
        {mate.lastActive ? (
          <div className="text-xs text-[#929292] mt-1">최근 활동: {mate.lastActive}</div>
        ) : null}
      </div>

      {typeof mate.compatibilityScore === 'number' && (
        <div className="flex flex-col items-end ml-4">
          <span className="text-sm text-[#767676]">호환도</span>
          <span className="text-lg font-bold text-[#00C471]">{Math.round(mate.compatibilityScore)}%</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white border border-[var(--green-50)] rounded-lg p-6 w-[540px] h-full">
        <div className="text-center mb-6">
          <div className="h-6 bg-[#e5e5e5] rounded w-2/3 mx-auto animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-[20px] p-4 flex items-center border border-[#f1f3f5] animate-pulse">
              <div className="w-[70px] h-[70px] bg-[#e5e5e5] rounded-full mr-4" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#e5e5e5] rounded w-1/2" />
                <div className="h-3 bg-[#e5e5e5] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--green-50)] rounded-lg p-6 w-[540px] h-full">
      {/* 제목과 기간 */}
      <div className="text-center mb-6">
        <h2 className="text-[34px] font-extrabold text-[var(--black-500)] leading-[42px] mb-2">
          🏆 언어교환 메이트
        </h2>
        <div className="text-base font-normal text-[var(--black-300)] leading-[24px]">
          {getCurrentMonthRange()}
        </div>
      </div>

      {/* 메이트 목록 */}
      {mates.length > 0 ? (
        <div className="space-y-4 flex-1">
          {mates.map((mate, index) => (
            <MateCard key={`${mate.matchId || mate.name}-${index}`} mate={mate} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[#767676] text-base">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default LanguageExchangeMates; 
