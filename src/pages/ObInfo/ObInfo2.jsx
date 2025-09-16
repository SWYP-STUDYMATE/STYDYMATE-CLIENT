import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import ProgressBar from "../../components/PrograssBar";
import CommonButton from "../../components/CommonButton";
import Select from "react-select";
import useProfileStore from "../../store/profileStore";
import { data, useNavigate } from "react-router-dom";
import commonSelectStyles from "../../components/SelectStyles";
import api from "../../api";
import { useAlert } from "../../hooks/useAlert.jsx";

export default function OnboardingInfo2() {
  const { showError } = useAlert();
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const setResidence = useProfileStore((state) => state.setResidence);
  const navigate = useNavigate();

  useEffect(() => {
    // 거주지 데이터를 로드하는 함수
    const loadLocations = async () => {
      try {
        console.log("🔍 [ObInfo2] Loading locations...");
        console.log("🔍 [ObInfo2] API Base URL:", api.defaults.baseURL);
        console.log("🔍 [ObInfo2] Environment:", import.meta.env.MODE);
        console.log("🔍 [ObInfo2] VITE_API_URL:", import.meta.env.VITE_API_URL);

        const response = await api.get("/user/locations");
        console.log("🔍 [ObInfo2] Raw API Response:", response);
        console.log("🔍 [ObInfo2] Response status:", response.status);
        console.log("🔍 [ObInfo2] Response headers:", response.headers);
        console.log("🔍 [ObInfo2] Response data:", response.data);

        // 서버 응답 구조 확인
        let locationData = [];

        // 응답이 HTML 형태인지 확인 (에러 페이지일 수 있음)
        if (typeof response.data === 'string' && response.data.includes('<html>')) {
          console.error("🔍 [ObInfo2] ❌ Received HTML instead of JSON - likely server error");
          throw new Error("서버에서 HTML 응답을 받았습니다. API 엔드포인트를 확인하세요.");
        }

        // 정상적인 JSON 응답 처리
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          // 새로운 응답 구조: { success: true, data: [...], message: null }
          locationData = response.data.data;
          console.log("🔍 [ObInfo2] ✅ Using nested response structure");
        } else if (Array.isArray(response.data)) {
          // 기존 응답 구조: [...]
          locationData = response.data;
          console.log("🔍 [ObInfo2] ✅ Using direct array structure");
        } else {
          console.warn("🔍 [ObInfo2] ⚠️ Unexpected response structure:", response.data);
          locationData = [];
        }

        setLocations(locationData);
        console.log("🔍 [ObInfo2] ✅ Processed locations:", locationData.length, "items");

        // 첫 번째 아이템 로그 (디버깅용)
        if (locationData.length > 0) {
          console.log("🔍 [ObInfo2] Sample location:", locationData[0]);
        }

      } catch (err) {
        console.error("🔍 [ObInfo2] ❌ API Error:", err);
        console.error("🔍 [ObInfo2] Error message:", err.message);
        console.error("🔍 [ObInfo2] Error response status:", err.response?.status);
        console.error("🔍 [ObInfo2] Error response data:", err.response?.data);
        console.error("🔍 [ObInfo2] Request URL:", err.config?.url);
        console.error("🔍 [ObInfo2] Full request config:", err.config);

        // 더 상세한 에러 메시지 제공
        let errorMessage = "거주지 리스트를 불러오지 못했습니다.";
        if (err.response?.status === 404) {
          errorMessage = "거주지 API를 찾을 수 없습니다. (404)";
        } else if (err.response?.status === 500) {
          errorMessage = "서버 내부 오류입니다. (500)";
        } else if (err.message.includes('Network Error')) {
          errorMessage = "네트워크 연결을 확인해주세요.";
        } else if (err.message.includes('HTML')) {
          errorMessage = "서버 설정 오류입니다. 관리자에게 문의하세요.";
        }

        showError(errorMessage);
        setLocations([]);
      }
    };

    loadLocations();
  }, [showError]);

  // API 데이터를 react-select 옵션으로 변환
  const residenceOptions = useMemo(() => {
    // locations가 배열인지 다시 한번 확인
    if (!Array.isArray(locations)) {
      console.warn("Locations is not an array:", locations);
      return [];
    }
    
    return locations.map(loc => ({
      value: loc.locationId,
      label: `${loc.city}, ${loc.country} (${loc.timezone})`
    }));
  }, [locations]);

  const isButtonEnabled = !!selected;

  const handleNext = async () => {
    try {
      await api.post("/user/location", { locationId: selected.value });
      setResidence(selected.value);
      navigate("/onboarding-info/3");
    } catch (e) {
      showError("거주지 저장에 실패했습니다.");
      console.error(e);
    }
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
