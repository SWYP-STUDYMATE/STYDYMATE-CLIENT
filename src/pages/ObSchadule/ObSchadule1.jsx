import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAlert } from "../../hooks/useAlert";

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
        const response = await api.get("/onboard/schedule/communication-methods");
        setCommunicationMethods(response.data || []);
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
      await api.post("/onboard/schedule/communication-method", requestData);
      console.log("소통 방식 데이터 전송 성공");
      navigate("/onboarding-schedule/2");
    } catch (error) {
      console.error("소통 방식 데이터 전송 실패:", error);
      showError("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={1} className="mt-[19px]" />
      <div className="max-w-[720px] w-full mx-auto mt-[19px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111] mb-[24px]">
          선호하는 소통 방식을 선택해 주세요.
        </h1>
        <div className="mb-[12px] text-[16px] font-medium text-[#343a40] leading-[24px]">
          소통 방식
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-[16px] text-[#6c757d]">로딩 중...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
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
          className="w-full mt-[440px]"
          disabled={!selected || loading}
          onClick={handleNext}
        />
      </div>
    </div>
  );
}
