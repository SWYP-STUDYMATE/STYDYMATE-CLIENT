import React from 'react';

export default function GreetingCard({ userName = "Alison", age = null, level = null }) {
  const hasAge = typeof age === 'number' && !Number.isNaN(age);
  const displayAge = hasAge ? `${age}살` : null;
  const displayLevel = level || '레벨 정보 없음';

  return (
    <section
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-[#E6F9F1] rounded-[10px] p-4 sm:p-5 lg:pl-14 lg:pr-9 space-y-3 sm:space-y-0"
      role="banner"
      aria-labelledby="greeting-title"
      data-testid="greeting-card"
    >
      <h1
        id="greeting-title"
        className="text-[#111111] font-bold text-2xl sm:text-3xl lg:text-[42px] leading-tight sm:leading-[36px] lg:leading-[42px]"
      >
        Hi {userName}!
      </h1>
      <div
        className='w-full sm:w-fit sm:min-w-[300px] lg:min-w-[392px] h-[56px] lg:h-[67px] bg-[#E6F9F1] rounded-[95px] flex items-center justify-between'
        role="group"
        aria-label="사용자 정보"
      >
        <div className='w-fit min-w-[140px] sm:min-w-[160px] lg:min-w-[192px] h-[44px] lg:h-[56px] bg-[#00C471] rounded-[95px] ml-[6px] lg:ml-[10px] px-4 lg:px-6 flex items-center justify-center'>
          <p
            className='text-base sm:text-lg lg:text-[20px] font-bold text-white leading-[24px] lg:leading-[30px] whitespace-nowrap'
            aria-label={hasAge ? `사용자 이름과 나이: ${userName}, ${displayAge}` : `사용자 이름: ${userName}`}
          >
            {userName}
            {hasAge ? `, ${displayAge}` : ''}
          </p>
        </div>
        <div className='w-fit min-w-[120px] sm:min-w-[140px] lg:min-w-[163px] flex gap-0 items-center justify-center mr-4 lg:mr-6 px-2 lg:px-4'>
          <p
            className='text-[#00C471] text-base sm:text-lg lg:text-[20px] font-bold leading-[24px] lg:leading-[30px] whitespace-nowrap'
            aria-label={`영어 수준: ${displayLevel}`}
          >
            {displayLevel}
          </p>
        </div>
      </div>
    </section>
  );
}
