import { create } from "zustand";
import { persist } from "zustand/middleware";

// TODO: API 구현 완료 후 getUserPartnerInfo() API로 대체 예정
// 현재는 클라이언트 상태로 관리, 서버 DB와 동기화 필요
const usePartnerStore = create(
  persist(
    (set) => ({
      selectedPartnerGender: null,
      setSelectedPartnerGender: (gender) => set({ selectedPartnerGender: gender }),
      // 추가: 파트너 스타일 복수 선택
      selectedPartnerStyles: [],
      setSelectedPartnerStyles: (styles) => set({ selectedPartnerStyles: styles }),
    }),
    { name: "partner-storage" }
  )
);

export default usePartnerStore; 