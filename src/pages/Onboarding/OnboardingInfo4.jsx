import React, { useState } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import useProfileStore from "../../store/profileStore";
import { useNavigate } from "react-router-dom";

export default function OnboardingInfo4() {
  const [intro, setIntro] = useState("");
  const setIntroStore = useProfileStore((state) => state.setIntro);
  const navigate = useNavigate();
  const maxLength = 800;

  const handleChange = (e) => {
    if (e.target.value.length <= maxLength) {
      setIntro(e.target.value);
    }
  };

  const handleNext = () => {
    setIntroStore(intro);
    // 다음 단계로 이동 (예: 5단계)
    navigate("/onboarding-info/5");
  };

  return (
    <div className="bg-[#FFFFFF] h-screen w-[768px] mx-auto">
      <Header />
      <ProgressBar total={5} value={4} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] w-[720px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          자신에 대해 간단히 소개해 주세요.
        </h1>
        <p className="text-[16px] font-medium text-[#343a40] mt-[24px] leading-[24px]">
          파트너에게 목표나 동기 등을 알려주시면 좋아요.
        </p>
      </div>
      <div className="mx-auto mt-[12px] w-[720px]">
        <textarea
          className="w-full h-[150px] px-[16px] py-[16px] border border-[#ced4da] rounded-[6px] bg-[#ffffff] text-[16px] font-medium text-[#111111] placeholder-[#929292] outline-none focus:border-[#111111] transition-colors duration-200 resize-none"
          placeholder="안녕하세요 현재 영어를 내년 8월 어학연수를 위해서 배우려고 합니다! 같이 성장해요! "
          value={intro}
          onChange={handleChange}
          maxLength={maxLength}
        />
        <div className="flex justify-end text-[#929292] text-[16px] font-medium mt-[12px] mb-[446px]">({intro.length}/{maxLength})</div>
        <CommonButton text="다음" onClick={handleNext} disabled={intro.length === 0}/>
      </div>
    </div>
  );
}
