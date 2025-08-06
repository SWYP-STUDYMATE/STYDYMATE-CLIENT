import { create } from "zustand";
import { persist } from "zustand/middleware";

// TODO: API 구현 완료 후 getUserLanguageInfo() API로 대체 예정
// 현재는 클라이언트 상태로 관리, 서버 DB와 동기화 필요
const useLangInfoStore = create(
  persist(
    (set) => ({
      nativeLanguage: "", // 모국어
      setNativeLanguage: (language) => set({ nativeLanguage: language }),
      otherLanguages: [], // [{ language, level }]
      setOtherLanguages: (languages) => set({ otherLanguages: languages }),
      wantedLanguages: [], // [{ language, level }]
      setWantedLanguages: (languages) => set({ wantedLanguages: languages }),
    }),
    { name: "lang-info-storage" }
  )
);

export default useLangInfoStore; 