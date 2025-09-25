import React, { useState, useEffect } from "react";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import useMotivationStore from "../../store/motivationStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { saveInterestInfo } from "../../api/onboarding";
import { toDataArray } from "../../utils/apiResponse";

export default function ObInt4() {
  const [selectedId, setSelectedId] = useState(null);
  const [learningExpectations, setLearningExpectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const selectedMotivations = useMotivationStore((state) => state.selectedMotivations);
  const selectedTopics = useMotivationStore((state) => state.selectedTopics);
  const selectedLearningStyles = useMotivationStore((state) => state.selectedLearningStyles);
  const selectedGoal = useMotivationStore((state) => state.selectedGoal);
  const setSelectedGoal = useMotivationStore((state) => state.setSelectedGoal);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearningExpectations = async () => {
      try {
        setLoading(true);
        const response = await api.get("/onboarding/interest/learning-expectations");
        const raw = toDataArray(response);
        const normalized = raw
          .map((item) => {
            const learningExpectationId = Number(item.learningExpectationId ?? item.learning_expectation_id ?? item.id);
            const learningExpectationName = item.learningExpectationName ?? item.learning_expectation_name ?? item.name ?? item.label ?? null;

            if (!Number.isFinite(learningExpectationId) || !learningExpectationName) {
              return null;
            }

            return {
              ...item,
              learningExpectationId,
              learningExpectationName
            };
          })
          .filter((value) => value !== null);
        setLearningExpectations(normalized);
        setLoading(false);
      } catch (error) {
        console.error("학습 기대 데이터를 불러오지 못했습니다:", error);
        alert("학습 기대 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };

    fetchLearningExpectations();
  }, []);

  useEffect(() => {
    setSelectedId(selectedGoal ?? null);
  }, [selectedGoal]);

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleNext = async () => {
    if (!selectedId) {
      return;
    }

    setSaving(true);
    try {
      await saveInterestInfo({
        motivationIds: selectedMotivations,
        topicIds: selectedTopics,
        learningStyleIds: selectedLearningStyles,
        learningExpectationIds: [selectedId],
      });

      setSelectedGoal(selectedId);
      console.log("학습 관심사 데이터 전송 성공");
      navigate("/onboarding-int/complete");
    } catch (error) {
      console.error("학습 관심사 데이터 전송 실패:", error);
      alert(
        error?.response?.data?.error?.message ||
          "데이터 전송에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={4} className="mt-[19px]" />
      <div className="max-w-[720px] w-full mx-auto mt-[19px] px-6">
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
                key={item.learningExpectationId}
                label={item.learningExpectationName}
                checked={selectedId === item.learningExpectationId}
                onChange={() => handleSelect(item.learningExpectationId)}
                type="radio"
              />
            ))}
          </div>
        )}
        <CommonButton
          text="다음"
          className="w-full mt-[372px]"
          disabled={!selectedId || loading || saving}
          onClick={handleNext}
          loading={saving}
        />
      </div>
    </div>
  );
} 
