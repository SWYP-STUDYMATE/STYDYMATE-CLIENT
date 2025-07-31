import React, { useState, useEffect } from "react";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import useMotivationStore from "../../store/motivationStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function ObInt4() {
  const [selected, setSelected] = useState(null);
  const [learningExpectations, setLearningExpectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const setSelectedGoal = useMotivationStore((state) => state.setSelectedGoal);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearningExpectations = async () => {
      try {
        setLoading(true);
        const response = await api.get("/onboard/interest/learning-expectations");
        setLearningExpectations(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("학습 기대 데이터를 불러오지 못했습니다:", error);
        alert("학습 기대 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };

    fetchLearningExpectations();
  }, []);

  const handleSelect = (name) => {
    setSelected(name);
  };

  const handleNext = async () => {
    setSelectedGoal(selected);
    
    // API 호출을 위한 데이터 준비
    const requestData = {
      learningExpectionType: selected
    };

    try {
      await api.post("/onboard/interest//learning-expectation", requestData);
      console.log("학습 기대 데이터 전송 성공");
      navigate("/onboarding-int/complete");
    } catch (error) {
      console.error("학습 기대 데이터 전송 실패:", error);
      alert("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen w-[768px] mx-auto">
      <Header />
      <ProgressBar total={5} value={4} className="mt-[19px]" />
      <div className="w-full max-w-[720px] mx-auto mt-[19px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111] mb-[24px]">
          언어 학습에서 가장 바라는 점을 선택해 주세요.
        </h1>
        <div className="mb-[12px] text-[16px] font-medium text-[#343a40] leading-[24px]">학습 목표 (단일 선택)</div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-[16px] text-[#6c757d]">로딩 중...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {learningExpectations.map((item) => (
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
        <CommonButton text="다음" className="w-full mt-[372px]" disabled={!selected || loading} onClick={handleNext} />
      </div>
    </div>
  );
} 