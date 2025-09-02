import React, { useState } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import useProfileStore from "../../store/profileStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAlert } from "../../hooks/useAlert.jsx";

export default function OnboardingInfo4() {
  const [intro, setIntro] = useState("");
  const setIntroStore = useProfileStore((state) => state.setIntro);
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();
  const maxLength = 800;

  const handleChange = (e) => {
    if (e.target.value.length <= maxLength) {
      setIntro(e.target.value);
    }
  };

  const handleNext = async () => {
    const trimmedIntro = intro.trim();
    
    if (trimmedIntro.length < 10) {
      showError("자기소개는 최소 10글자 이상 작성해주세요.");
      return;
    }
    
    try {
      await api.post("/user/self-bio", { selfBio: trimmedIntro });
      setIntroStore(trimmedIntro);
      showSuccess("자기소개가 저장되었습니다!");
      console.log(trimmedIntro);
      navigate("/onboarding-info/complete");
    } catch (e) {
      showError("자기소개 저장에 실패했습니다.");
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
        <div className="relative">
          <textarea
            className={`w-full h-[150px] px-[16px] py-[16px] border rounded-[6px] bg-[#ffffff] text-[16px] font-medium text-[#111111] placeholder-[#929292] outline-none transition-colors duration-200 resize-none ${
              intro.trim().length > 0 && intro.trim().length < 10 
                ? 'border-[#FFA500] focus:border-[#FFA500]' 
                : intro.trim().length >= 10
                ? 'border-[#00C471] focus:border-[#00C471]'
                : 'border-[#ced4da] focus:border-[#111111]'
            }`}
            placeholder="안녕하세요! 저는 영어를 내년 8월 어학연수를 위해서 배우려고 합니다. 저의 목표는 자연스러운 회화 실력을 키우는 것입니다. 같이 성장해요!"
            value={intro}
            onChange={handleChange}
            maxLength={maxLength}
          />
        </div>
        
        {/* 글자수 및 상태 표시 */}
        <div className="flex justify-between items-center mt-[12px]">
          <div className="text-[12px] text-[#606060]">
            • 최소 10글자 이상 작성
            • 학습 목표나 동기를 포함하면 더 좋아요
          </div>
          <div className={`text-[14px] font-medium ${
            intro.length < 10 ? 'text-[#FFA500]' : 
            intro.length >= 10 ? 'text-[#00C471]' : 'text-[#929292]'
          }`}>
            {intro.length}/{maxLength}
          </div>
        </div>
        
        {/* 실시간 피드백 */}
        {intro.trim().length > 0 && intro.trim().length < 10 && (
          <div className="flex items-center mt-2 text-[#FFA500] text-[14px]">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            최소 10글자 이상 작성해주세요 (현재 {intro.trim().length}글자)
          </div>
        )}
        
        {intro.trim().length >= 10 && (
          <div className="flex items-center mt-2 text-[#00C471] text-[14px]">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            좋은 자기소개네요!
          </div>
        )}
        
        <div className="mb-[400px]">
          <CommonButton text="다음" onClick={handleNext} disabled={intro.trim().length < 10}/>
        </div>
      </div>
    </div>
  );
}
