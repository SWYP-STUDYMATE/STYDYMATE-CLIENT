import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialState = {
  nativeLanguage: null,
  otherLanguages: [],
  wantedLanguages: [],
};

const useLangInfoStore = create(
  persist(
    (set) => ({
      ...initialState,
      setNativeLanguage: (language) => set({ nativeLanguage: language ?? null }),
      setOtherLanguages: (languages) => set({ otherLanguages: Array.isArray(languages) ? languages : [] }),
      setWantedLanguages: (languages) => set({ wantedLanguages: Array.isArray(languages) ? languages : [] }),
      resetLangInfo: () => set({ ...initialState }),
    }),
    {
      name: 'lang-info-storage',
      partialize: (state) => ({
        nativeLanguage: state.nativeLanguage,
        otherLanguages: state.otherLanguages,
        wantedLanguages: state.wantedLanguages,
      }),
    }
  )
);

export default useLangInfoStore;
