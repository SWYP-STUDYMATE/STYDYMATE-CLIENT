import React, { useState, useEffect } from "react";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import useMotivationStore from "../../store/motivationStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toDataArray } from "../../utils/apiResponse";

export default function ObInt1() {
  const [selected, setSelected] = useState([]);
  const [motivations, setMotivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const setZustandSelected = useMotivationStore((state) => state.setSelectedMotivations);
  const storedMotivations = useMotivationStore((state) => state.selectedMotivations);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMotivations = async () => {
      try {
        setLoading(true);
        const response = await api.get("/onboarding/interest/motivations");
        const raw = toDataArray(response);
        const normalized = raw
          .map((item) => {
            const motivationId = Number(item.motivationId ?? item.motivation_id ?? item.id);
            const motivationName = item.motivationName ?? item.motivation_name ?? item.name ?? item.label ?? null;

            if (!Number.isFinite(motivationId) || !motivationName) {
              return null;
            }

            return {
              ...item,
              motivationId,
              motivationName
            };
          })
          .filter((value) => value !== null);

        setMotivations(normalized);
        setLoading(false);
      } catch (error) {
        console.error("동기 데이터를 불러오지 못했습니다:", error);
        alert("동기 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };

    fetchMotivations();
  }, []);

  useEffect(() => {
    if (Array.isArray(storedMotivations)) {
      setSelected(storedMotivations);
    }
  }, [storedMotivations]);

  const handleToggle = (id) => {
    setSelected((prev) => {
      const newSelected = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];
      return newSelected.sort((a, b) => a - b);
    });
  };

  const handleNext = async () => {
    const sortedMotivations = [...selected].sort((a, b) => a - b);
    setSelected(sortedMotivations);
    setZustandSelected(sortedMotivations);
    navigate("/onboarding-int/2");
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-full sm:max-w-[768px] w-full mx-auto overflow-y-auto">
        <Header />
        <ProgressBar total={5} value={1} className="mt-[12px] sm:mt-[19px]" />

      <div className="max-w-full sm:max-w-[720px] w-full mx-auto mt-[12px] sm:mt-[19px] px-4 sm:px-6">
        <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold leading-[1.3] sm:leading-[1.35] md:leading-[42px] text-[#111111] mb-[16px] sm:mb-[20px] md:mb-[24px] break-words">
          학습 동기·목적을 모두 선택해 주세요.
        </h1>
        <div className="mb-[10px] sm:mb-[12px] text-[14px] sm:text-[15px] md:text-[16px] font-medium text-[#343a40] leading-[20px] sm:leading-[22px] md:leading-[24px] break-words">학습 동기·목적 (복수 선택 가능)</div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-[14px] sm:text-[15px] md:text-[16px] text-[#6c757d] break-words">로딩 중...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[10px] sm:gap-[12px]">
            {motivations.map((item) => (
              <CommonChecklistItem
                key={item.motivationId}
                label={item.motivationName}
                checked={selected.includes(item.motivationId)}
                onChange={() => handleToggle(item.motivationId)}
                type="checkbox"
              />
            ))}
          </div>
        )}
        <CommonButton text="다음" className="w-full mt-[24px] sm:mt-[28px] md:mt-[32px]" disabled={selected.length === 0 || loading} onClick={handleNext} />
      </div>
    </div>
  );
} 
