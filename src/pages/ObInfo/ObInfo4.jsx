import React, { useState } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import useProfileStore from "../../store/profileStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";

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

  const handleNext = async () => {
    try {
      await api.post("/user/self-bio", { selfBio: intro });
      setIntroStore(intro);
      console.log(intro);
      navigate("/onboarding-info/complete");
    } catch (e) {
      alert("자기소개 저장에 실패했습니다.");
      console.error(e);
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={4} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] max-w-[720px] w-full px-6">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          자신에 대해 간단히 소개해 주세요.
        </h1>
        <p className="text-[16px] font-medium text-[#343a40] mt-[24px] leading-[24px]">
          파트너에게 목표나 동기 등을 알려주시면 좋아요.
        </p>
      </div>
      <div className="mx-auto mt-[12px] max-w-[720px] w-full px-6">
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
