import React, { useState, useEffect } from "react";
import Header from "./Header";
import ProgressBar from "./PrograssBar";
import CommonButton from "./CommonButton";
import { getUserName } from "../api";

export default function CompleteOnboarding({
  userName: propUserName = "회원",
  onboarding = "언어 설정",
  subText = "두 번째 단계",
  step = 2,
  totalSteps = 5,
  onNext,
}) {
  const [userName, setUserName] = useState(propUserName);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userData = await getUserName();
        setUserName(userData.name || "회원");
      } catch (error) {
        console.error("사용자 이름 조회 실패:", error);
        setUserName("회원");
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  if (loading) {
    return (
      <div className="bg-white h-screen max-w-[768px] w-full mx-auto">
        <Header />
        <div className="flex items-center justify-center h-full">
          <div className="text-[16px] text-[var(--black-300)]">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <div className="mx-auto mt-[52px] max-w-[720px] w-full">
        <h1 className="text-[32px] font-bold leading-[42px] text-[var(--black-500)]">
          {userName}님, {onboarding}이 완료되었어요! ({step}/{totalSteps})
        </h1>
        <p className="text-[16px] font-medium text-[var(--black-300)] mt-[12px] leading-[24px]">
          {userName}님, Language Mate를 찾기위한 {subText}를 완료하셨어요!
        </p>
      </div>
      <div className="mx-auto mt-[100px] max-w-[720px] w-full flex justify-center">
        <div
          className="max-w-[720px] w-full h-[405px] bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: "url('/assets/party3.png')" }}
        />
      </div>
      <div className="mx-auto mt-[151px] max-w-[720px] w-full flex justify-center">
        <CommonButton text="다음 단계" onClick={onNext} variant="complete" className="max-w-[720px] w-full" />
      </div>
    </div>
  );
}
