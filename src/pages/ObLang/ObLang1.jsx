import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import Select from "react-select";
import useLangInfoStore from "../../store/langInfoStore";
import { useNavigate } from "react-router-dom";
import commonSelectStyles from "../../components/SelectStyles";
import { saveOnboardingStep2 } from "../../api/onboarding";
import { saveLanguageInfo } from "../../api/onboarding";

import api from "../../api";

export default function ObLang1() {
  // 언어 옵션 상태
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const setNativeLanguage = useLangInfoStore((state) => state.setNativeLanguage); // zustand에 저장
  const navigate = useNavigate();

  // 언어 리스트 불러오기 (API)
  useEffect(() => {
    api.get("/onboard/language/languages")
      .then(res => {
        // [{ languageId, languageName }, ...] -> [{ value, label }, ...]
        const options = (res.data || []).map(lang => ({
          value: lang.languageId,
          label: lang.languageName
        }));
        setLanguageOptions(options);
      })
      .catch(err => {
        alert("언어 리스트를 불러오지 못했습니다.");
        console.error(err);
      });
  }, []);

  const isButtonEnabled = !!selected;

  const handleNext = async () => {
    if (window.confirm(`선택한 언어가 "${selected?.label}" 맞습니까?`)) {
      try {
        await saveLanguageInfo({
          nativeLanguageId: selected.value,
          
        });
        setNativeLanguage(selected?.label || ""); // zustand에 모국어 저장
        navigate("/onboarding-lang/2"); // 다음 단계로 이동 (라우팅 구조에 맞게 수정)
      } catch (e) {
        alert("모국어 저장에 실패했습니다.");
        console.error(e);
      }
    }
  };
     
  return (
    <div className="bg-[#FFFFFF] h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={4} value={1} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] max-w-[720px] w-full">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          모국어를 선택해주세요.
        </h1>
      </div>
      <div className="mx-auto mt-[32px] max-w-[720px] w-full">
        <label className="block text-[16px] font-medium leading-[24px] text-[#343a40] mb-[8px]">
          모국어 선택
        </label>
        <Select
          options={languageOptions}
          value={selected}
          onChange={setSelected}
          placeholder="모국어를 선택해주세요"
          className="mb-[576px]"
          styles={commonSelectStyles}
          isSearchable={false}
        />
        <CommonButton text="다음" disabled={!isButtonEnabled} onClick={handleNext} />
      </div>
    </div>
  );
}
