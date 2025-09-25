import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toDataArray } from "../../utils/apiResponse";

export default function ObSchadule3() {
  const [selected, setSelected] = useState(null);
  const [dailyMethods, setDailyMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDailyMethods = async () => {
      try {
        setLoading(true);
        const response = await api.get("/onboarding/schedule/daily-methods");
        const raw = toDataArray(response);
        const normalized = raw
          .map((item) => {
            const code = typeof item.name === "string" && /^[A-Z_]+$/u.test(item.name)
              ? item.name
              : item.id ?? item.code ?? item.value ?? item.dailyMethod ?? item.name ?? null;
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
        setDailyMethods(normalized);
        setLoading(false);
      } catch (error) {
        console.error("하루 공부 시간 데이터를 불러오지 못했습니다:", error);
        alert("하루 공부 시간 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };

    fetchDailyMethods();
  }, []);

  const handleSelect = (name) => {
    setSelected(name);
  };

  const handleNext = async () => {
    if (!selected) return;

    const requestData = {
        dailyMinutesType: selected
    };

    try {
      await api.post("/onboarding/schedule/daily-minute", requestData);
      console.log("하루 공부 시간 데이터 전송 성공");
      navigate("/onboarding-schedule/4");
    } catch (error) {
      console.error("하루 공부 시간 데이터 전송 실패:", error);
      alert("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={3} className="mt-[19px]" />
      <div className="max-w-[720px] w-full mx-auto mt-[19px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111] mb-[24px]">
          하루에 공부하고 싶은 시간을 선택해 주세요.
        </h1>
        <div className="mb-[12px] text-[16px] font-medium text-[#343a40] leading-[24px]">
          (복수 선택 불가)
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-[16px] text-[#6c757d]">로딩 중...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {dailyMethods.map((item) => (
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
          className="w-full mt-[304px]"
          disabled={!selected || loading}
          onClick={handleNext}
        />
      </div>
    </div>
  );
} 
