import { create } from "zustand";
import { persist } from "zustand/middleware";

// 서버 API와 동기화된 학습 동기/관심사 상태 관리
const useMotivationStore = create(
  persist(
    (set) => ({
      selectedMotivations: [],
      selectedTopics: [],
      selectedLearningStyles: [],
      selectedGoal: null,
      
      // 서버에서 관심사 정보 로드
      loadInterestInfo: async () => {
        try {
          const { getUserInfo } = await import('../api/user.js');
          const userInfo = await getUserInfo();
          
          if (userInfo.interestInfo) {
            set({
              selectedMotivations: userInfo.interestInfo.motivations || [],
              selectedTopics: userInfo.interestInfo.topics || [],
              selectedLearningStyles: userInfo.interestInfo.learningStyles || [],
              selectedGoal: userInfo.interestInfo.goal || null
            });
          }
        } catch (error) {
          console.error('Failed to load interest info:', error);
        }
      },
      
      // 동기 선택 상태 저장 (서버 연동은 각 화면에서 처리)
      setSelectedMotivations: (ids) => {
        set({ selectedMotivations: Array.isArray(ids) ? ids : [] });
      },
      
      clearMotivations: () => set({ selectedMotivations: [] }),
      
      // 주제 선택 상태 저장 (서버 연동은 각 화면에서 처리)
      setSelectedTopics: (ids) => {
        set({ selectedTopics: Array.isArray(ids) ? ids : [] });
      },
      
      clearTopics: () => set({ selectedTopics: [] }),
      
      // 학습 스타일 선택 상태 저장 (서버 연동은 각 화면에서 처리)
      setSelectedLearningStyles: (ids) => {
        if (!Array.isArray(ids)) {
          set({ selectedLearningStyles: [] });
          return;
        }

        const uniqueSorted = Array.from(new Set(ids.map((value) => Number(value))))
          .filter((value) => !Number.isNaN(value))
          .sort((a, b) => a - b);

        set({ selectedLearningStyles: uniqueSorted });
      },
      
      // 학습 목표 설정
      setSelectedGoal: (goal) => set({ selectedGoal: goal }),
      
      // 모든 관심사 정보 초기화
      clearAllInterests: () => set({
        selectedMotivations: [],
        selectedTopics: [],
        selectedLearningStyles: [],
        selectedGoal: null
      }),
    }),
    { name: "motivation-storage" }
  )
);

export default useMotivationStore; 
