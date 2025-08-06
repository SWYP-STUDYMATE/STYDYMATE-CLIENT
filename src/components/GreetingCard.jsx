import React from 'react';

export default function GreetingCard({ userName = "Alison" }) {

  const age = 24;
  const level = "Intermediate - H";
  return (
    <div className="flex justify-between items-center bg-white border border-[#e6f9f1] rounded-[10px] pl-14 pr-9.5 py-5">
      <h1 className="text-[#111111] font-bold text-[42px] leading-[42px] ">
        Hi {userName}!
      </h1>
      <div className='w-fit min-w-[392px] h-[67px] bg-[#E6F9F1] rounded-[95px] flex items-center justify-between'>
        <div className='w-fit min-w-[192px] h-[56px] bg-[#00C471] rounded-[95px] ml-[10px] px-6 flex items-center justify-center'>
          <p className='text-[20px] font-bold text-[#FFFFFF] leading-[30px] whitespace-nowrap'>
            {userName}, {age}살
          </p>
        </div>
          <div className='w-fit min-w-[163px] flex gap-0 items-center justify-center mr-[24px] px-4'>
           <p className='text-[#00C471] text-[20px] font-bold leading-[30px] whitespace-nowrap'>
             {level}
           </p>
         </div>
      </div>
    </div>
  );
} 