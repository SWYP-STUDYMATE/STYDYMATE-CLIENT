import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import commonSelectStyles from "../../components/SelectStyles";
import useLangInfoStore from "../../store/langInfoStore";
import api from "../../api";
import { useAlert } from "../../hooks/useAlert.jsx";

export default function ObLang2() {
  const navigate = useNavigate();
  const { showError } = useAlert();
  const setOtherLanguages = useLangInfoStore((state) => state.setOtherLanguages);
  const [pairs, setPairs] = useState([{ language: null, level: null }]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [loadingLang, setLoadingLang] = useState(true);
  const [loadingLevel, setLoadingLevel] = useState(true);

  useEffect(() => {
    setLoadingLang(true);
    api.get("/onboard/language/languages")
      .then(res => {
        const options = (res.data || []).map(lang => ({
          value: lang.languageId,
          label: lang.languageName
        }));
        setLanguageOptions(options);
        setLoadingLang(false);
      })
      .catch(err => {
        showError("언어 리스트를 불러오지 못했습니다.");
        setLoadingLang(false);
        console.error(err);
      });
    setLoadingLevel(true);
    api.get("/onboard/language/level-types-language")
      .then(res => {
        const options = (res.data || []).map(level => ({
          value: level.langLevelId,
          label: level.LangLevelName
        }));
        setLevelOptions(options);
        setLoadingLevel(false);
      })
      .catch(err => {
        showError("레벨 리스트를 불러오지 못했습니다.");
        setLoadingLevel(false);
        console.error(err);
      });
  }, []);

  const validPairs = pairs.filter((p) => p.language && p.level);
  const isButtonEnabled = validPairs.length > 0;

  const handleChange = (idx, field, value) => {
    const newPairs = pairs.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    if (
      idx === pairs.length - 1 &&
      field === "level" &&
      value &&
      newPairs[idx].language
    ) {
      newPairs.push({ language: null, level: null });
    }
    setPairs(newPairs);
  };

  const handleNext = async () => {
    // API 호출을 위한 데이터 준비
    const requestData = {
      languages: validPairs.map(pair => ({
        languageId: pair.language.value,
        currentLevelId: pair.level.value,
        targetLevelId: pair.level.value // 현재 레벨과 동일하게 설정
      }))
    };

    console.log("🔍 [ObLang2] API 요청 데이터:", requestData);
    console.log("🔍 [ObLang2] 유효한 페어:", validPairs);

    try {
      console.log("🔍 [ObLang2] 언어 레벨 API 호출 시작");
      const response = await api.post("/onboard/language/language-level", requestData);
      console.log("🔍 [ObLang2] API 응답 성공:", response.data);

      // 로컬 상태만 업데이트 (서버 호출 없이)
      setOtherLanguages(validPairs.map(pair => ({
        id: pair.language.value,
        name: pair.language.label,
        level: pair.level.label
      })));

      navigate("/onboarding-lang/3");
    } catch (error) {
      console.error("🔍 [ObLang2] ❌ 언어 레벨 데이터 전송 실패:", error);
      console.error("🔍 [ObLang2] Error status:", error.response?.status);
      console.error("🔍 [ObLang2] Error data:", error.response?.data);
      console.error("🔍 [ObLang2] Request config:", error.config);

      let errorMessage = "데이터 전송에 실패했습니다. 다시 시도해주세요.";
      if (error.response?.status === 400) {
        const serverError = error.response?.data;
        if (serverError?.message) {
          errorMessage = `입력 오류: ${serverError.message}`;
        } else {
          errorMessage = "입력한 데이터를 확인해주세요. (400 Bad Request)";
        }
      } else if (error.response?.status === 401) {
        errorMessage = "로그인이 필요합니다.";
      } else if (error.response?.status === 403) {
        errorMessage = "권한이 없습니다.";
      } else if (error.response?.status >= 500) {
        errorMessage = "서버 오류입니다. 잠시 후 다시 시도해주세요.";
      }

      showError(errorMessage);
    }
  };

  return (
    <div className="relative bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={2} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] max-w-[720px] w-full">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          모국어 외에 할 줄 아는 언어와 레벨을 선택해 주세요.
        </h1>
      </div>
      <div className="mx-auto mt-[32px] max-w-[720px] w-full flex flex-col gap-4 min-h-[620px] pb-[80px]">
        <div className="flex gap-4">
          <label className="block text-[16px] font-medium leading-[24px] text-[#343a40] mb-[8px] w-[300px]">
            사용하는 언어 (복수 선택 가능)
          </label>
          <label className="block text-[16px] font-medium leading-[24px] text-[#343a40] mb-[8px] w-[400px]">
            레벨
          </label>
        </div>
        {pairs.map((pair, idx) => (
          <div key={idx} className="flex gap-4 items-end">
            <div className="w-[300px]">
              <Select
                options={languageOptions}
                value={pair.language}
                onChange={(val) => handleChange(idx, "language", val)}
                placeholder={loadingLang ? "로딩 중..." : "언어를 선택해주세요"}
                styles={commonSelectStyles}
                isMulti={false}
                isDisabled={loadingLang}
              />
            </div>
            <div className="w-[400px]">
              <Select
                options={levelOptions}
                value={pair.level}
                onChange={(val) => handleChange(idx, "level", val)}
                placeholder={loadingLevel ? "로딩 중..." : "현재 본인의 레벨을 선택해 주세요"}
                styles={commonSelectStyles}
                isMulti={false}
                isDisabled={loadingLevel || !pair.language}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-[720px] w-full mt-10">
        <CommonButton text="다음" disabled={!isButtonEnabled} onClick={handleNext} />
      </div>
    </div>
  );
} 