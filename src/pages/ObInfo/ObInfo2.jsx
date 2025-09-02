import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import Select from "react-select";
import useProfileStore from "../../store/profileStore";
import { useNavigate } from "react-router-dom";
import commonSelectStyles from "../../components/SelectStyles";
import api from "../../api";
import { useAlert } from "../../hooks/useAlert.jsx";

export default function OnboardingInfo2() {
  const { showError, confirmAction } = useAlert();
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const setResidence = useProfileStore((state) => state.setResidence);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/user/locations")
      .then(res => {
        setLocations(res.data);
        console.log(res.data);
      })
      .catch(err => {
        showError("거주지 리스트를 불러오지 못했습니다.");
        console.error(err);
      });
  }, []);

  // API 데이터를 react-select 옵션으로 변환
  const residenceOptions = useMemo(() =>
    locations.map(loc => ({
      value: loc.locationId,
      label: `${loc.city}, ${loc.country} (${loc.timezone})`
    })),
    [locations]
  );

  const isButtonEnabled = !!selected;

  const handleNext = async () => {
    confirmAction(
      `선택한 거주지/시간대가 "${selected?.label}" 맞습니까?`,
      async () => {
        try {
          await api.post("/user/location", { locationId: selected.value });
          setResidence(selected.value);
          navigate("/onboarding-info/3");
        } catch (e) {
          showError("거주지 저장에 실패했습니다.");
          console.error(e);
        }
      },
      "거주지 확인"
    );
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <ProgressBar total={5} value={2} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] max-w-[720px] w-full px-6">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          현재 거주지와 시간대를 선택해주세요.
        </h1>
      </div>
      <div className="mx-auto mt-[32px] max-w-[720px] w-full px-6">
        <label className="block text-[16px] font-medium leading-[24px] text-[#343a40] mb-[8px]">
          거주지 & 시간대
        </label>
        <Select
          options={residenceOptions}
          value={selected}
          onChange={setSelected}
          placeholder="거주지&시간대를 선택해주세요"
          className="mb-[576px]"
          styles={commonSelectStyles}
          isSearchable={false}
        />
        <CommonButton text="다음" disabled={!isButtonEnabled} onClick={handleNext} />
      </div>
    </div>
  );
}
