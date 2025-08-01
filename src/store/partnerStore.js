import { create } from "zustand";
import { persist } from "zustand/middleware";

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