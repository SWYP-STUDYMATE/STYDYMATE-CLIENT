import React, { useState, useEffect } from "react";
import CommonChecklistItem from "../../components/CommonChecklist";
import CommonButton from "../../components/CommonButton";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import usePartnerStore from "../../store/partnerStore";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toDataArray } from "../../utils/apiResponse";

export default function ObPartner1() {
  const [selected, setSelected] = useState(null);
  const [genders, setGenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const setSelectedPartnerGender = usePartnerStore((state) => state.setSelectedPartnerGender);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/onboarding/partner/gender-type");
        const raw = toDataArray(response);
        const normalized = raw
          .map((item) => {
            const code = typeof item.name === "string" && /^[A-Z_]+$/u.test(item.name)
              ? item.name
              : item.id ?? item.code ?? item.genderType ?? item.value ?? null;
            const display = item.description
              ?? item.label
              ?? item.displayName
              ?? (code && item.name && item.name !== code ? item.name : item.description)
              ?? item.name
              ?? code;

            if (!code) {
              return null;
            }

            return {
              ...item,
              id: code,
              name: code,
              description: display ?? code
            };
          })
          .filter((value) => value !== null);
        setGenders(normalized);
        setLoading(false);
      } catch (error) {
        console.error("성별 데이터를 불러오지 못했습니다:", error);
        alert("성별 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    };

    fetchGenders();
  }, []);

  const handleSelect = (name) => {
    setSelected(name);
  };

  const handleNext = async () => {
    setSelectedPartnerGender(selected);

    // API 호출을 위한 데이터 준비
    const requestData = {
      partnerGenderType: selected
    };

    try {
      await api.post("/onboarding/partner/gender", requestData);
      console.log("파트너 성별 데이터 전송 성공");
      navigate("/onboarding-partner/2");
    } catch (error) {
      console.error("파트너 성별 데이터 전송 실패:", error);
      alert("데이터 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={3} value={1} className="mt-[19px]" />
      <div className="max-w-[720px] w-full mx-auto mt-[19px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111] mb-[24px]">
          원하는 파트너 성별을 선택해 주세요.
        </h1>
        <div className="mb-[12px] text-[16px] font-medium text-[#343a40] leading-[24px]">파트너 성별</div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-[16px] text-[#6c757d]">로딩 중...</div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {genders.map((item) => (
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
        <CommonButton text="다음" className="w-full mt-[440px]" disabled={!selected || loading} onClick={handleNext} />
      </div>
    </div>
  );
}
