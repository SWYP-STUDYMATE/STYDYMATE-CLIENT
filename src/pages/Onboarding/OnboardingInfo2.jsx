import React, { useState, useMemo } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import Select from "react-select";
import useProfileStore from "../../store/profileStore";
import { useNavigate } from "react-router-dom";

export default function OnboardingInfo2() {
  const residenceOptions = useMemo(() => [
    { value: "seoul", label: "서울, 대한민국 (GMT+9:00)" },
    { value: "beijing", label: "베이징, 중국 (GMT+8:00)" },
    { value: "tokyo", label: "도쿄, 일본 (GMT+9:00)" },
    { value: "berlin", label: "베를린, 독일 (GMT+1:00)" },
    { value: "london", label: "런던, 영국 (GMT+0:00)" },
    { value: "paris", label: "파리, 프랑스 (GMT+1:00)" },
    { value: "newyork", label: "뉴욕, 미국 (GMT-5:00)" },
    { value: "bangkok", label: "방콕, 태국 (GMT+7:00)" },
    { value: "losangeles", label: "로스앤젤레스, 미국 (GMT-8:00)" },
    { value: "sydney", label: "시드니, 호주 (GMT+10:00)" },
    { value: "dubai", label: "두바이, 아랍에미리트 (GMT+4:00)" },
  ], []);

  const styles = useMemo(() => ({
    control: (base, state) => ({
      ...base,
      minHeight: 56,
      borderRadius: 6,
      borderColor: state.isFocused ? "#111111" : "#ced4da",
      boxShadow: "none",
      paddingLeft: 8,
      fontSize: 16,
      fontWeight: 500,
      transition: "border-color 0.2s",
      "&:hover": {
        borderColor: "#00C471",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#929292",
      fontWeight: 500,
    }),
    singleValue: (base) => ({
      ...base,
      color: "#111111",
      fontWeight: 500,
    }),
    option: (base, state) => ({
      ...base,
      color: "#111111",
      backgroundColor: state.isSelected
        ? "#E7E7E7"
        : state.isFocused
        ? "#E6F9F1"
        : "#fff",
      fontWeight: 500,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#212529",
      paddingRight: 18,
    }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: (base) => ({
      ...base,
      marginTop: 10,
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)",
    }),
    menuList: (base) => ({
      ...base,
    }),
  }), []);
  const [selected, setSelected] = useState(null);
  const setResidence = useProfileStore((state) => state.setResidence);
  const navigate = useNavigate();

  const isButtonEnabled = !!selected;

  const handleNext = () => {
    if (window.confirm(`선택한 거주지/시간대가 "${selected?.label}" 맞습니까?`)) {
      setResidence(selected?.value || "");
      navigate("/onboarding-info/3"); // 3페이지로 이동
    }
    // 아니요를 누르면 아무 동작 없이 입력창으로 돌아감
  };

  return (
    <div className="bg-[#FFFFFF] h-screen w-[768px] mx-auto">
      <Header />
      <ProgressBar total={5} value={2} className="mt-[19px]" />
      <div className="mx-auto mt-[19px] w-[720px]">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          현재 거주지와 시간대를 선택해주세요.
        </h1>
      </div>
      <div className="mx-auto mt-[32px] w-[720px]">
        <label className="block text-[16px] font-medium leading-[24px] text-[#343a40] mb-[8px]">
          거주지 & 시간대
        </label>
        <Select
          options={residenceOptions}
          value={selected}
          onChange={setSelected}
          placeholder="거주지&시간대를 선택해주세요"
          className="mb-[576px]"
          styles={styles}
          isSearchable={false}
        />
        <CommonButton text="다음" disabled={!isButtonEnabled} onClick={handleNext} />
      </div>
    </div>
  );
}
