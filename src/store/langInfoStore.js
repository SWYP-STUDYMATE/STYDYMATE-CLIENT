import { create } from "zustand";
import { persist } from "zustand/middleware";

// 서버 API와 동기화된 언어 정보 상태 관리
const useLangInfoStore = create(
  persist(
    (set, get) => ({
      nativeLanguage: null, // { id, name } 형태로 저장
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
      
      // 모국어 설정 (로컬 상태만 업데이트, 서버 호출은 컴포넌트에서 처리)
      setNativeLanguage: (language) => {
        set({ nativeLanguage: language });
      },
      
      // 기타 언어 설정
      setOtherLanguages: (languages) => set({ otherLanguages: languages }),
      
      // 목표 언어 설정 (로컬 상태만 업데이트, 서버 호출은 컴포넌트에서 처리)
      setWantedLanguages: (languages) => {
        set({ wantedLanguages: languages });
      },
      
      // 언어 정보 초기화
      clearLanguageInfo: () => set({
        nativeLanguage: null,
        otherLanguages: [],
        wantedLanguages: []
      }),
    }),
    { name: "lang-info-storage" }
  )
);

export default useLangInfoStore; 