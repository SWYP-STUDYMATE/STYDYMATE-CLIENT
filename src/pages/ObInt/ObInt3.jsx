import React, { useEffect, useState } from "react";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import useMotivationStore from "../../store/motivationStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function ObInt3() {
  const [learningStyles, setLearningStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectedLearningStyles = useMotivationStore((state) => state.selectedLearningStyles);
  const setSelectedLearningStyles = useMotivationStore((state) => state.setSelectedLearningStyles);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearningStyles = async () => {
      try {
        setLoading(true);
        const response = await api.get("/onboarding/interest/learning-styles");
        setLearningStyles(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("학습 스타일 데이터를 불러오지 못했습니다:", error);
        // 다른 페이지와 동일한 에러 처리
        alert("학습 스타일 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };

    fetchLearningStyles();
  }, []);

  const handleToggle = (id) => {
    const current = Array.isArray(selectedLearningStyles)
      ? selectedLearningStyles
      : [];

    const exists = current.includes(id);
    const nextValues = exists
      ? current.filter((value) => value !== id)
      : [...current, id];

    setSelectedLearningStyles(nextValues);
  };

  const handleNext = async () => {
    navigate("/onboarding-int/4");
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={3} className="mt-[19px]" />
      <div className="max-w-[720px] w-full mx-auto mt-[19px] px-6">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111] mb-[24px]">
          당신의 학습 스타일을 선택해 주세요.
        </h1>
        <div className="mb-[12px] text-[16px] font-medium text-[#343a40] leading-[24px]">학습 스타일 (복수 선택 가능)</div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-[16px] text-[#6c757d]">로딩 중...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {learningStyles.map((item) => (
              <CommonChecklistItem
                key={item.learningStyleId}
                label={item.learningStyleName}
                checked={
                  Array.isArray(selectedLearningStyles) &&
                  selectedLearningStyles.includes(item.learningStyleId)
                }
                onChange={() => handleToggle(item.learningStyleId)}
                type="checkbox"
              />
            ))}
          </div>
        )}
        <CommonButton
          text="다음"
          className="w-full mt-[440px]"
          disabled={
            loading ||
            !Array.isArray(selectedLearningStyles) ||
            selectedLearningStyles.length === 0
          }
          onClick={handleNext}
        />
      </div>
    </div>
  );
} 
