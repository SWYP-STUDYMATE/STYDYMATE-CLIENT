import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import commonSelectStyles from "../../components/SelectStyles";
import useLangInfoStore from "../../store/langInfoStore";
import api from "../../api";

export default function ObLang3() {
  const navigate = useNavigate();
  const setWantedLanguages = useLangInfoStore((state) => state.setWantedLanguages);
  const [pairs, setPairs] = useState([{ language: null, level: null }]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [loadingLang, setLoadingLang] = useState(true);
  const [loadingLevel, setLoadingLevel] = useState(true);

  useEffect(() => {
    setLoadingLang(true);
    api.get("/onboarding/language/languages")
      .then(res => {
        const options = (res.data || []).map(lang => ({
          value: lang.id ?? lang.languageId,
          label: lang.name ?? lang.languageName
        }));
        setLanguageOptions(options);
        setLoadingLang(false);
      })
      .catch(err => {
        alert("언어 리스트를 불러오지 못했습니다.");
        setLoadingLang(false);
        console.error(err);
      });
    setLoadingLevel(true);
    api.get("/onboarding/language/level-types-partner")
      .then(res => {
        const options = (res.data || []).map(level => ({
          value: level.langLevelId,
          label: level.LangLevelName
        }));
        setLevelOptions(options);
        setLoadingLevel(false);
      })
      .catch(err => {
        alert("파트너 레벨 리스트를 불러오지 못했습니다.");
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
    // 목표 언어 저장 (배우고 싶은 언어) - API 호출
    const requestData = {
      languages: validPairs.map(pair => ({
        languageId: pair.language.value,
        currentLevelId: 201, // 초급 레벨로 설정 (배우고 싶은 언어이므로)
        targetLevelId: pair.level.value // 원하는 파트너 레벨
      }))
    };

    try {
      await api.post("/onboarding/language/language-level", requestData);
      console.log("목표 언어 데이터 전송 성공");
      
      // 로컬 상태만 업데이트 (서버 호출 없이)
      if (setWantedLanguages) {
        setWantedLanguages(validPairs.map(pair => ({
          id: pair.language.value,
          name: pair.language.label,
          level: pair.level.label
        })));
      }
      
      navigate("/onboarding-lang/complete");
    } catch (error) {
      console.error("목표 언어 데이터 전송 실패:", error);
      alert("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="relative bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={3} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] max-w-[720px] w-full">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          배우고 싶은 언어와 원하는 파트너 레벨을 선택해 주세요.
        </h1>
      </div>
      <div className="mx-auto mt-[32px] max-w-[720px] w-full flex flex-col gap-4 min-h-[620px] pb-[80px]">
        <div className="flex gap-4">
          <label className="block text-[16px] font-medium leading-[24px] text-[#343a40] mb-[8px] w-[300px]">
            배우고 싶은 언어 (복수 선택 가능)
          </label>
          <label className="block text-[16px] font-medium leading-[24px] text-[#343a40] mb-[8px] w-[400px]">
            파트너 레벨
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
                placeholder={loadingLevel ? "로딩 중..." : "파트너 레벨을 선택해주세요"}
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
