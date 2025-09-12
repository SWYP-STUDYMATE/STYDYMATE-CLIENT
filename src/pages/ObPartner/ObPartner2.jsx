import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import usePartnerStore from "../../store/partnerStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function ObPartner2() {
  const [selected, setSelected] = useState([]); // id 배열
  const [partnerPersonalities, setPartnerPersonalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const setSelectedPartnerStyles = usePartnerStore((state) => state.setSelectedPartnerStyles);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartnerPersonalities = async () => {
      try {
        setLoading(true);
        const response = await api.get("/onboard/partner/personalities");
        setPartnerPersonalities(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("파트너 성격 데이터를 불러오지 못했습니다:", error);
        alert("파트너 성격 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };

    fetchPartnerPersonalities();
  }, []);

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    // id 배열을 personality 객체 배열로 변환하여 저장
    const selectedStyles = partnerPersonalities.filter((item) => selected.includes(item.partnerPersonalityId));
    setSelectedPartnerStyles(selectedStyles);
    
    // API 호출을 위한 데이터 준비
    const requestData = {
      personalPartnerIds:  [...selected].sort((a, b) => a - b)
    };

    try {
      console.log('/onboard/partner/personality', requestData);
      await api.post("/onboard/partner/personality", requestData);
      console.log("파트너 성격 데이터 전송 성공");
      navigate("/onboarding-partner/complete");
    } catch (error) {
      console.error("파트너 성격 데이터 전송 실패:", error);
      alert("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={3} value={2} className="mt-[19px]" />
      <div className="max-w-[720px] w-full mx-auto mt-[19px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111] mb-[24px]">
          원하는 파트너 성격을 선택해 주세요.
        </h1>
        <div className="mb-[12px] text-[16px] font-medium text-[#343a40] leading-[24px]">
          파트너 스타일 (복수 선택 가능)
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-[16px] text-[#6c757d]">로딩 중...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {partnerPersonalities.map((item) => (
              <CommonChecklistItem
                key={item.partnerPersonalityId}
                label={item.partnerPersonality}
                checked={selected.includes(item.partnerPersonalityId)}
                onChange={() => handleSelect(item.partnerPersonalityId)}
                type="checkbox"
              />
            ))}
          </div>
        )}
        <CommonButton
          text="다음"
          className="w-full mt-[304px]"
          disabled={selected.length === 0 || loading}
          onClick={handleNext}
        />
      </div>
    </div>
  );
} 