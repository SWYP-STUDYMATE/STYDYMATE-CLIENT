import React, { useState, useEffect } from "react";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import useMotivationStore from "../../store/motivationStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function ObInt3() {
  const [selected, setSelected] = useState([]);
  const [learningStyles, setLearningStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const setSelectedLearningStyles = useMotivationStore((state) => state.setSelectedLearningStyles);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearningStyles = async () => {
      try {
        setLoading(true);
        const response = await api.get("/onboard/interest/learning-styles");
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
    setSelected((prev) => {
      const newSelected = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];
      return newSelected.sort((a, b) => a - b);
    });
  };

  const handleNext = async () => {
    setSelectedLearningStyles(selected);
    
    // API 호출을 위한 데이터 준비
    const requestData = {
      learningStyleIds: selected.sort((a, b) => a - b)
    };

    try {
      await api.post("/onboard/interest/learning-style", requestData);
      console.log("학습 스타일 데이터 전송 성공");
      navigate("/onboarding-int/4");
    } catch (error) {
      console.error("학습 스타일 데이터 전송 실패:", error);
      alert("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
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
                checked={selected.includes(item.learningStyleId)}
                onChange={() => handleToggle(item.learningStyleId)}
                type="checkbox"
              />
            ))}
          </div>
        )}
        <CommonButton text="다음" className="w-full mt-[440px]" disabled={selected.length === 0 || loading} onClick={handleNext} />
      </div>
    </div>
  );
} 