import React from 'react';

const StudyStats = () => {
  const stats = [
    {
      value: "87시간",
      label: "전체 학습 시간"
    },
    {
      value: "0시간",
      label: "이번 달 학습 시간"
    },
    {
      value: "0일",
      label: "연속 학습일"
    },
    {
      value: "4명",
      label: "고정 메이트"
    }
  ];

  const isZeroValue = (value) => {
    return value.includes('0시간') || value.includes('0일') || value.includes('0명');
  };

  return (
    <div className="flex gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex-1 bg-white border border-[#e6f9f1] rounded-[10px] p-4 flex flex-col items-center justify-center min-h-[150px]"
        >
          <div className="text-center">
            <div 
              className={`text-3xl font-bold mb-2 leading-[26px]  ${
                isZeroValue(stat.value) ? 'text-[#e5e5e5]' : 'text-[#111111]'
              }`}
            >
              {stat.value}
            </div>
            <div 
              className="text-xl text-[#212529] font-normal leading-[26px] "
            >
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudyStats; 