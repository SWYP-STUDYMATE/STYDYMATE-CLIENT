import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAlert } from "../../hooks/useAlert";
import { toDataArray } from "../../utils/apiResponse";

export default function ObSchadule1() {
  const { showError } = useAlert();
  const [selected, setSelected] = useState(null); // 단일 선택으로 변경
  const [communicationMethods, setCommunicationMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunicationMethods = async () => {
      try {
        setLoading(true);
        const response = await api.get("/onboarding/schedule/communication-methods");
        const raw = toDataArray(response);
        const normalized = raw
          .map((item) => {
            const code = typeof item.name === "string" && /^[A-Z_]+$/u.test(item.name)
              ? item.name
              : item.code ?? item.id ?? item.value ?? item.communicationMethod ?? item.name ?? null;
            const description = item.description ?? item.label ?? item.displayName ?? item.text ?? item.name ?? code;

            if (!code) {
              return null;
            }

            return {
              ...item,
              name: code,
              description
            };
          })
          .filter((value) => value !== null);
        setCommunicationMethods(normalized);
        setLoading(false);
      } catch (error) {
        console.error("소통 방식 데이터를 불러오지 못했습니다:", error);
        showError("소통 방식 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };

    fetchCommunicationMethods();
  }, []);

  const handleSelect = (name) => {
    setSelected(name);
  };

  const handleNext = async () => {
    if (!selected) return;

    const requestData = {
      communicationMethodType: selected
    };

    try {
      await api.post("/onboarding/schedule/communication-method", requestData);
      console.log("소통 방식 데이터 전송 성공");
      navigate("/onboarding-schedule/2");
    } catch (error) {
      console.error("소통 방식 데이터 전송 실패:", error);
      showError("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-full sm:max-w-[768px] w-full mx-auto overflow-y-auto">
      <Header />
      <ProgressBar total={5} value={1} className="mt-[12px] sm:mt-[19px]" />
      <div className="max-w-full sm:max-w-[720px] w-full mx-auto mt-[12px] sm:mt-[19px] px-4 sm:px-6">
        <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold leading-[1.3] sm:leading-[1.35] md:leading-[42px] text-[#111111] mb-[16px] sm:mb-[20px] md:mb-[24px] break-words">
          선호하는 소통 방식을 선택해 주세요.
        </h1>
        <div className="mb-[10px] sm:mb-[12px] text-[14px] sm:text-[15px] md:text-[16px] font-medium text-[#343a40] leading-[20px] sm:leading-[22px] md:leading-[24px] break-words">
          소통 방식
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-[14px] sm:text-[15px] md:text-[16px] text-[#6c757d] break-words">로딩 중...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[10px] sm:gap-[12px]">
            {communicationMethods.map((item) => (
              <CommonChecklistItem
                key={item.name}
                label={item.description}
                checked={selected === item.name}
                onChange={() => handleSelect(item.name)}
                type="radio"
              />
            ))}
          </div>
        )}
        <CommonButton
          text="다음"
          className="w-full mt-[300px] sm:mt-[380px] md:mt-[440px]"
          disabled={!selected || loading}
          onClick={handleNext}
        />
      </div>
    </div>
  );
}
