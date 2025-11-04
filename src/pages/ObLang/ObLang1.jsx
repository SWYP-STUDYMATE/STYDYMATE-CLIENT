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
import { toDataArray } from "../../utils/apiResponse";

export default function ObLang1() {
  // 언어 옵션 상태
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const setNativeLanguage = useLangInfoStore((state) => state.setNativeLanguage); // zustand에 저장
  const navigate = useNavigate();

  // 언어 리스트 불러오기 (API)
  useEffect(() => {
    api.get("/onboarding/language/languages")
      .then(res => {
        console.log("🔍 언어 API 응답:", res.data);
        const raw = toDataArray(res);

        const options = raw
          .map(lang => {
            const value = lang.id ?? lang.languageId ?? lang.language_id;
            const label = lang.name ?? lang.languageName ?? lang.language_name;

            if (!value || !label) {
              return null;
            }

            return { value, label };
          })
          .filter((option) => option !== null);

        console.log("🔍 변환된 언어 옵션:", options);
        setLanguageOptions(options);
      })
      .catch(err => {
        alert("언어 리스트를 불러오지 못했습니다.");
        console.error(err);
      });
  }, []);

  const isButtonEnabled = !!selected;

  const handleNext = async () => {
    console.log("🔍 [ObLang1] handleNext 호출됨");
    console.log("🔍 선택된 언어:", selected);
    console.log("🔍 selected.value:", selected?.value);
    console.log("🔍 selected.value 타입:", typeof selected?.value);

    // 🔍 추가 디버깅 로그
    console.log("🔍 LocalStorage 토큰 확인:");
    console.log("🔍 - accessToken:", localStorage.getItem("accessToken") ? "존재" : "없음");
    console.log("🔍 - refreshToken:", localStorage.getItem("refreshToken") ? "존재" : "없음");

    if (!selected || !selected.value || selected.value <= 0) {
      alert("유효한 언어를 선택해주세요.");
      return;
    }

    try {
      console.log("🔍 saveLanguageInfo 호출 시작 - nativeLanguageId:", selected.value);
      const result = await saveLanguageInfo({
        nativeLanguageId: selected.value,
      });
      console.log("🔍 saveLanguageInfo 응답:", result);
      console.log("🔍 saveLanguageInfo 성공");

      // zustand에 언어 ID와 라벨 모두 저장 (서버 호출 없이)
      if (typeof setNativeLanguage === "function") {
        setNativeLanguage({
          id: selected.value,
          name: selected.label
        });
      } else {
        console.warn("setNativeLanguage가 함수가 아니라 직접 상태를 설정합니다.", setNativeLanguage);
        useLangInfoStore.setState({
          nativeLanguage: {
            id: selected.value,
            name: selected.label
          }
        });
      }

      console.log("🔍 페이지 이동 시도: /onboarding-lang/2");
      navigate("/onboarding-lang/2"); // 다음 단계로 이동 (라우팅 구조에 맞게 수정)
    } catch (e) {
      console.log("🔍 ❌ saveLanguageInfo 실패:", e);
      console.log("🔍 ❌ Error response:", e.response);
      console.log("🔍 ❌ Error status:", e.response?.status);
      console.log("🔍 ❌ Error data:", e.response?.data);
      console.error("🔍 모국어 저장 실패:", e);

      // 더 자세한 에러 메시지 표시
      let errorMessage = "모국어 저장에 실패했습니다.";
      if (e.response) {
        if (e.response.status === 401) {
          errorMessage = "로그인이 필요합니다. 다시 로그인해주세요.";
        } else if (e.response.status === 403) {
          errorMessage = "권한이 없습니다. 다시 로그인해주세요.";
        } else if (e.response.status === 400) {
          errorMessage = e.response.data?.message || "잘못된 요청입니다.";
        } else if (e.response.status === 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
      } else if (e.request) {
        errorMessage = "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.";
      }

      alert(errorMessage);
    }
  };
     
  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-full sm:max-w-[768px] w-full mx-auto overflow-y-auto">
      <Header />
      <ProgressBar total={4} value={1} className="mt-[12px] sm:mt-[19px]" />
      <div className="mx-auto mt-[12px] sm:mt-[19px] max-w-full sm:max-w-[720px] w-full px-4 sm:px-6">
        <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold leading-[1.3] sm:leading-[1.35] md:leading-[42px] text-[#111111] break-words">
          모국어를 선택해주세요.
        </h1>
      </div>
      <div className="mx-auto mt-[24px] sm:mt-[32px] max-w-full sm:max-w-[720px] w-full px-4 sm:px-6">
        <label className="block text-[14px] sm:text-[15px] md:text-[16px] font-medium leading-[20px] sm:leading-[22px] md:leading-[24px] text-[#343a40] mb-[6px] sm:mb-[8px] break-words">
          모국어 선택
        </label>
        <Select
          options={languageOptions}
          value={selected}
          onChange={setSelected}
          placeholder="모국어를 선택해주세요"
          className="mb-[400px] sm:mb-[500px] md:mb-[576px]"
          styles={commonSelectStyles}
          isSearchable={false}
        />
        <CommonButton text="다음" disabled={!isButtonEnabled} onClick={handleNext} />
      </div>
    </div>
  );
}
