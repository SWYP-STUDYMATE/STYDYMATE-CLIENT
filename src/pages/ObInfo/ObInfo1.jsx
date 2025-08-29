import React, { useState } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import { saveOnboardingStep1 } from "../../api/onboarding";
import CommonButton from "../../components/CommonButton";
import useProfileStore from "../../store/profileStore";
import { useNavigate } from "react-router-dom";

export default function OnboardingInfo() {
  const setEnglishName = useProfileStore((state) => state.setEnglishName);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  // 영어만 입력 허용
  const handleChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z]*$/.test(value)) {
      setInputValue(value);
    }
  };

  // 영어 1자 이상 입력 시 버튼 활성화
  const isButtonEnabled = inputValue.length > 0;

  // 버튼 클릭 시만 저장
  const handleNext = async () => {
    if (window.confirm(`입력한 이름이 "${inputValue}" 맞습니까?`)) {
      try {
        await saveOnboardingStep1({
          englishName: inputValue,
          residence: '',
          profileImage: null,
          intro: ''
        });
        setEnglishName(inputValue);
        navigate("/onboarding-info/2");
        console.log("온보딩 1단계 저장 완료:", inputValue);
      } catch (e) {
        alert("영어 이름 저장에 실패했습니다.");
        console.error(e);
      }
    }
    // 아니요를 누르면 아무 동작 없이 입력창으로 돌아감
  };

  return (
    <div className="bg-[#FFFFFF] h-screen w-[768px] mx-auto">
      <Header />
      <ProgressBar total={5} value={1} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] w-[720px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          파트너가 편하게 부를 수 있는 이름을 입력해주세요!
        </h1>
      </div>
      {/* Figma nickname input section */}
      <div className="mx-auto mt-[32px] w-[720px]">
        <label className="block text-[16px] font-medium leading-[24px] text-[#343a40] mb-[8px]">
          영어 이름
        </label>
        <input
          type="text"
          placeholder="닉네임을 입력해주세요"
          value={inputValue}
          onChange={handleChange}
          className="w-full h-[56px] px-[16px] mb-[576px] border border-[#ced4da] rounded-[6px] bg-[#ffffff] text-[16px] font-medium text-[#111111] placeholder-[#929292] outline-none focus:border-[#111111] transition-colors duration-200"
        />
        <CommonButton text="다음" disabled={!isButtonEnabled} onClick={handleNext} />
      </div>
    </div>
  );
} 