import React from 'react';

export default function GreetingCard({ userName = "Alison", age = null, level = null }) {
  const hasAge = typeof age === 'number' && !Number.isNaN(age);
  const displayAge = hasAge ? `${age}살` : null;
  const displayLevel = level || '레벨 정보 없음';

  return (
    <section 
      className="flex justify-between items-center bg-white border border-[#e6f9f1] rounded-[10px] pl-14 pr-9.5 py-5"
      role="banner"
      aria-labelledby="greeting-title"
      data-testid="greeting-card"
    >
      <h1 
        id="greeting-title"
        className="text-[#111111] font-bold text-[42px] leading-[42px]"
      >
        Hi {userName}!
      </h1>
      <div 
        className='w-fit min-w-[392px] h-[67px] bg-[#E6F9F1] rounded-[95px] flex items-center justify-between'
        role="group"
        aria-label="사용자 정보"
      >
        <div className='w-fit min-w-[192px] h-[56px] bg-[#00C471] rounded-[95px] ml-[10px] px-6 flex items-center justify-center'>
          <p 
            className='text-[20px] font-bold text-[#FFFFFF] leading-[30px] whitespace-nowrap'
            aria-label={hasAge ? `사용자 이름과 나이: ${userName}, ${displayAge}` : `사용자 이름: ${userName}`}
          >
            {userName}
            {hasAge ? `, ${displayAge}` : ''}
          </p>
        </div>
        <div className='w-fit min-w-[163px] flex gap-0 items-center justify-center mr-[24px] px-4'>
          <p 
            className='text-[#00C471] text-[20px] font-bold leading-[30px] whitespace-nowrap'
            aria-label={`영어 수준: ${displayLevel}`}
          >
            {displayLevel}
          </p>
        </div>
      </div>
    </section>
  );
}
