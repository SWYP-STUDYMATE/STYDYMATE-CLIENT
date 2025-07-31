import { create } from "zustand";
import { persist } from "zustand/middleware";

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