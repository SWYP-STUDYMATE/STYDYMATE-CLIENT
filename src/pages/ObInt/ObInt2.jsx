import React, { useState, useEffect } from "react";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import useMotivationStore from "../../store/motivationStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toDataArray } from "../../utils/apiResponse";

export default function ObInt2() {
  const [selected, setSelected] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const setSelectedTopics = useMotivationStore((state) => state.setSelectedTopics);
  const storedTopics = useMotivationStore((state) => state.selectedTopics);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await api.get("/onboarding/interest/topics");
        const raw = toDataArray(response);
        const normalized = raw
          .map((item) => {
            const topicId = Number(item.topicId ?? item.topic_id ?? item.id);
            const topicName = item.topicName ?? item.topic_name ?? item.name ?? item.label ?? null;

            if (!Number.isFinite(topicId) || !topicName) {
              return null;
            }

            return {
              ...item,
              topicId,
              topicName
            };
          })
          .filter((value) => value !== null);

        setTopics(normalized);
        setLoading(false);
      } catch (error) {
        console.error("주제 데이터를 불러오지 못했습니다:", error);
        alert("주제 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  useEffect(() => {
    if (Array.isArray(storedTopics)) {
      setSelected(storedTopics);
    }
  }, [storedTopics]);

  const handleToggle = (id) => {
    setSelected((prev) => {
      const newSelected = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];
      return newSelected.sort((a, b) => a - b);
    });
  };

  const handleNext = async () => {
    const sortedTopics = [...selected].sort((a, b) => a - b);
    setSelected(sortedTopics);
    setSelectedTopics(sortedTopics);
    navigate("/onboarding-int/3");
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={2} className="mt-[19px]" />
      <div className="max-w-[720px] w-full mx-auto mt-[19px] px-6">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111] mb-[24px]">
          관심 있는 주제를 모두 선택해 주세요.
        </h1>
        <div className="mb-[12px] text-[16px] font-medium text-[#343a40] leading-[24px]">관심 주제 (복수 선택 가능)</div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-[16px] text-[#6c757d]">로딩 중...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {topics.map((item) => (
              <CommonChecklistItem
                key={item.topicId}
                label={item.topicName}
                checked={selected.includes(item.topicId)}
                onChange={() => handleToggle(item.topicId)}
                type="checkbox"
              />
            ))}
          </div>
        )}
        <CommonButton text="다음" className="w-full mt-[32px]" disabled={selected.length === 0 || loading} onClick={handleNext} />
      </div>
    </div>
  );
} 
