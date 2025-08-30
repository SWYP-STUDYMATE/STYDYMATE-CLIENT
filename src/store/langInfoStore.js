import { create } from "zustand";
import { persist } from "zustand/middleware";

// 서버 API와 동기화된 언어 정보 상태 관리
const useLangInfoStore = create(
  persist(
    (set, get) => ({
      nativeLanguage: "", // 모국어
      otherLanguages: [], // [{ language, level }]
      wantedLanguages: [], // [{ language, level }]
      
      // 서버에서 언어 정보 로드
      loadLanguageInfo: async () => {
        try {
          const { getUserInfo } = await import('../api/user.js');
          const userInfo = await getUserInfo();
          
          if (userInfo.languageInfo) {
            set({
              nativeLanguage: userInfo.languageInfo.nativeLanguage || "",
              otherLanguages: userInfo.languageInfo.otherLanguages || [],
              wantedLanguages: userInfo.languageInfo.wantedLanguages || []
            });
          }
        } catch (error) {
          console.error('Failed to load language info:', error);
        }
      },
      
      // 모국어 설정 (서버 동기화)
      setNativeLanguage: async (language) => {
        try {
          const { saveLanguageInfo } = await import('../api/onboarding.js');
          await saveLanguageInfo({ 
            nativeLanguageId: language,
            targetLanguages: get().wantedLanguages 
          });
          set({ nativeLanguage: language });
        } catch (error) {
          console.error('Failed to save native language:', error);
          // 로컬에만 저장 (fallback)
          set({ nativeLanguage: language });
        }
      },
      
      // 기타 언어 설정
      setOtherLanguages: (languages) => set({ otherLanguages: languages }),
      
      // 목표 언어 설정 (서버 동기화)
      setWantedLanguages: async (languages) => {
        try {
          const { saveLanguageInfo } = await import('../api/onboarding.js');
          await saveLanguageInfo({
            nativeLanguageId: get().nativeLanguage,
            targetLanguages: languages
          });
          set({ wantedLanguages: languages });
        } catch (error) {
          console.error('Failed to save wanted languages:', error);
          // 로컬에만 저장 (fallback)
          set({ wantedLanguages: languages });
        }
      },
      
      // 언어 정보 초기화
      clearLanguageInfo: () => set({
        nativeLanguage: "",
        otherLanguages: [],
        wantedLanguages: []
      }),
    }),
    { name: "lang-info-storage" }
  )
);

export default useLangInfoStore; 