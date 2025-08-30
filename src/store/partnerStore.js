import { create } from "zustand";
import { persist } from "zustand/middleware";

// 서버 API와 동기화된 파트너 선호도 상태 관리
const usePartnerStore = create(
  persist(
    (set, get) => ({
      selectedPartnerGender: null,
      selectedPartnerStyles: [],
      selectedGroupSizes: [],
      
      // 서버에서 파트너 선호도 정보 로드
      loadPartnerInfo: async () => {
        try {
          const { getUserInfo } = await import('../api/user.js');
          const userInfo = await getUserInfo();
          
          if (userInfo.partnerInfo) {
            set({
              selectedPartnerGender: userInfo.partnerInfo.gender || null,
              selectedPartnerStyles: userInfo.partnerInfo.styles || [],
              selectedGroupSizes: userInfo.partnerInfo.groupSizes || []
            });
          }
        } catch (error) {
          console.error('Failed to load partner info:', error);
        }
      },
      
      // 파트너 성별 설정 (서버 동기화)
      setSelectedPartnerGender: async (gender) => {
        try {
          const { savePartnerInfo } = await import('../api/onboarding.js');
          const state = get();
          await savePartnerInfo({
            partnerPersonalityIds: state.selectedPartnerStyles,
            groupSizeIds: state.selectedGroupSizes,
            partnerGender: gender
          });
          set({ selectedPartnerGender: gender });
        } catch (error) {
          console.error('Failed to save partner gender:', error);
          // 로컬에만 저장 (fallback)
          set({ selectedPartnerGender: gender });
        }
      },
      
      // 파트너 스타일 설정 (서버 동기화)
      setSelectedPartnerStyles: async (styles) => {
        try {
          const { savePartnerInfo } = await import('../api/onboarding.js');
          const state = get();
          await savePartnerInfo({
            partnerPersonalityIds: styles,
            groupSizeIds: state.selectedGroupSizes,
            partnerGender: state.selectedPartnerGender
          });
          set({ selectedPartnerStyles: styles });
        } catch (error) {
          console.error('Failed to save partner styles:', error);
          // 로컬에만 저장 (fallback)
          set({ selectedPartnerStyles: styles });
        }
      },
      
      // 그룹 크기 설정 (서버 동기화)
      setSelectedGroupSizes: async (sizes) => {
        try {
          const { savePartnerInfo } = await import('../api/onboarding.js');
          const state = get();
          await savePartnerInfo({
            partnerPersonalityIds: state.selectedPartnerStyles,
            groupSizeIds: sizes,
            partnerGender: state.selectedPartnerGender
          });
          set({ selectedGroupSizes: sizes });
        } catch (error) {
          console.error('Failed to save group sizes:', error);
          // 로컬에만 저장 (fallback)
          set({ selectedGroupSizes: sizes });
        }
      },
      
      // 파트너 선호도 초기화
      clearPartnerInfo: () => set({
        selectedPartnerGender: null,
        selectedPartnerStyles: [],
        selectedGroupSizes: []
      }),
    }),
    { name: "partner-storage" }
  )
);

export default usePartnerStore; 