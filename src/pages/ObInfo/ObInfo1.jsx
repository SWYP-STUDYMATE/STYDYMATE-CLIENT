import React, { useState } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import { saveOnboardingStep1 } from "../../api/onboarding";
import CommonButton from "../../components/CommonButton";
import useProfileStore from "../../store/profileStore";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../hooks/useAlert.jsx";

export default function OnboardingInfo() {
  const setEnglishName = useProfileStore((state) => state.setEnglishName);
  const [inputValue, setInputValue] = useState("");
  const [hasInvalidInput, setHasInvalidInput] = useState(false);
  const navigate = useNavigate();
  const { showError } = useAlert();

  // 영어만 입력 허용 (공백 포함)
  const handleChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setInputValue(value);
      setHasInvalidInput(false);
    } else {
      // 유효하지 않은 문자 입력 시 경고 표시
      setHasInvalidInput(true);
      setTimeout(() => setHasInvalidInput(false), 2000); // 2초 후 자동 사라짐
    }
  };

  // 영어 1자 이상 입력 시 버튼 활성화 (공백 제거 후 체크)
  const isButtonEnabled = inputValue.trim().length > 0;

  // 버튼 클릭 시만 저장
  const handleNext = async () => {
    const trimmedName = inputValue.trim();
    
    // 추가 유효성 검사
    if (trimmedName.length < 2) {
      showError("이름은 최소 2글자 이상 입력해주세요.");
      return;
    }
    
    if (trimmedName.length > 50) {
      showError("이름은 50글자를 초과할 수 없습니다.");
      return;
    }

    try {
      await saveOnboardingStep1({
        englishName: trimmedName,
        residence: '',
        profileImage: null,
        intro: ''
      });
      setEnglishName(trimmedName);
      navigate("/onboarding-info/2");
      console.log("온보딩 1단계 저장 완료:", trimmedName);
    } catch (e) {
      showError("영어 이름 저장에 실패했습니다.");
      console.error(e);
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={1} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] max-w-[720px] w-full px-6">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          파트너가 편하게 부를 수 있는 이름을 입력해주세요!
        </h1>
      </div>
      {/* Figma nickname input section */}
      <div className="mx-auto mt-[32px] max-w-[720px] w-full px-6">
        <label className="block text-[16px] font-medium leading-[24px] text-[#343a40] mb-[8px]">
          영어 이름
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="예: John, Sarah, Alex"
            value={inputValue}
            onChange={handleChange}
            maxLength={50}
            className={`w-full h-[56px] px-[16px] border rounded-[6px] bg-[#ffffff] text-[16px] font-medium text-[#111111] placeholder-[#929292] outline-none transition-colors duration-200 ${
              hasInvalidInput 
                ? 'border-[#EA4335] focus:border-[#EA4335]' 
                : 'border-[#ced4da] focus:border-[#111111]'
            }`}
          />
          {/* 글자수 표시 */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[12px] text-[#929292]">
            {inputValue.length}/50
          </div>
        </div>
        
        {/* 실시간 피드백 메시지 */}
        {hasInvalidInput && (
          <div className="flex items-center mt-2 text-[#EA4335] text-[14px]">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            영어 알파벳과 공백만 입력 가능합니다
          </div>
        )}
        
        {/* 입력 가이드 */}
        <div className="mt-2 text-[12px] text-[#606060]">
          • 영어 알파벳과 공백만 사용 가능
          • 최소 2글자 이상, 최대 50글자
          • 예시: John, Sarah Kim, Alex Johnson
        </div>
        
        {/* 글자수 부족 경고 */}
        {inputValue.trim().length > 0 && inputValue.trim().length < 2 && (
          <div className="flex items-center mt-2 text-[#FFA500] text-[14px]">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            최소 2글자 이상 입력해주세요
          </div>
        )}
        
        <div className="mb-[500px]">
          <CommonButton text="다음" disabled={!isButtonEnabled} onClick={handleNext} />
        </div>
      </div>
    </div>
  );
} 