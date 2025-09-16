import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function ObSchadule2() {
  const [selected, setSelected] = useState([]);
  const [groupSizes, setGroupSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupSizes = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출
        const response = await api.get("/onboarding/schedule/group-sizes");
        console.log("그룹 크기 데이터 응답:", response.data);
        
        // API 응답 데이터 구조에 맞게 설정
        setGroupSizes(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("그룹 규모 데이터를 불러오지 못했습니다:", error);
        setLoading(false);
      }
    };

    fetchGroupSizes();
  }, []);

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (selected.length === 0) return;

    const requestData = {
      groupSizeIds: selected.sort((a, b) => a - b)
    };

    try {
      // 실제 API 호출
      await api.post("/onboarding/schedule/group-size", requestData);
      console.log("그룹 규모 데이터 전송 성공:", requestData);
      navigate("/onboarding-schedule/3");
    } catch (error) {
      console.error("그룹 규모 데이터 전송 실패:", error);
      alert("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={2} className="mt-[19px]" />
      <div className="max-w-[720px] w-full mx-auto mt-[19px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111] mb-[24px]">
          선호하는 그룹 규모 선택해주세요.
        </h1>
        <div className="mb-[12px] text-[16px] font-medium text-[#343a40] leading-[24px]">
          그룹 규모 (복수 선택 가능)
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-[16px] text-[#6c757d]">로딩 중...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {groupSizes.map((item) => (
              <CommonChecklistItem
                key={item.groupSizeId}
                label={item.groupSize}
                checked={selected.includes(item.groupSizeId)}
                onChange={() => handleSelect(item.groupSizeId)}
                type="checkbox"
              />
            ))}
          </div>
        )}
        <CommonButton
          text="다음"
          className="w-full mt-[372px]"
          disabled={selected.length === 0 || loading}
          onClick={handleNext}
        />
      </div>
    </div>
  );
}
