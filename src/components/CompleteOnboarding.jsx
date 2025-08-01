import React from "react";
import Header from "./Header";
import ProgressBar from "./PrograssBar";
import CommonButton from "./CommonButton";

export default function CompleteOnboarding({
  userName = "회원",
  onboarding = "언어 설정",
  subText = "두 번째 단계",
  step = 2,
  totalSteps = 5,
  onNext,
}) {
  return (
    <div className="bg-[#FFFFFF] h-screen w-[768px] mx-auto">
      <Header />
      <div className="mx-auto mt-[52px] w-[720px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          {userName}님, {onboarding}이 완료되었어요! ({step}/{totalSteps})
        </h1>
        <p className="text-[16px] font-medium text-[#767676] mt-[12px] leading-[24px]">    
          {userName}님, Language Mate를 찾기위한 {subText}를 완료하셨어요!
        </p>
      </div>
      <div className="mx-auto mt-[100px] w-[720px] flex justify-center">
        <div
          className="w-[720px] h-[405px] bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: "url('/assets/party3.png')" }}
        />
      </div>
      <div className="mx-auto mt-[151px] w-[720px] flex justify-center">
        <CommonButton text="다음 단계" onClick={onNext} variant="complete" className="w-full max-w-[720px]" />
      </div>
    </div>
  );
}
