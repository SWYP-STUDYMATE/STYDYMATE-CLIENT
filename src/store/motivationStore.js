import { create } from "zustand";
import { persist } from "zustand/middleware";

// 서버 API와 동기화된 학습 동기/관심사 상태 관리
const useMotivationStore = create(
  persist(
    (set, get) => ({
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
      
      // 동기 설정 (서버 동기화)
      setSelectedMotivations: async (ids) => {
        try {
          const { saveInterestInfo } = await import('../api/onboarding.js');
          const state = get();
          await saveInterestInfo({
            motivationIds: ids,
            topicIds: state.selectedTopics,
            learningStyleIds: state.selectedLearningStyles,
            learningExpectationIds: state.selectedGoal ? [state.selectedGoal] : []
          });
          set({ selectedMotivations: ids });
        } catch (error) {
          console.error('Failed to save motivations:', error);
          // 로컬에만 저장 (fallback)
          set({ selectedMotivations: ids });
        }
      },
      
      clearMotivations: () => set({ selectedMotivations: [] }),
      
      // 주제 설정 (서버 동기화)
      setSelectedTopics: async (ids) => {
        try {
          const { saveInterestInfo } = await import('../api/onboarding.js');
          const state = get();
          await saveInterestInfo({
            motivationIds: state.selectedMotivations,
            topicIds: ids,
            learningStyleIds: state.selectedLearningStyles,
            learningExpectationIds: state.selectedGoal ? [state.selectedGoal] : []
          });
          set({ selectedTopics: ids });
        } catch (error) {
          console.error('Failed to save topics:', error);
          // 로컬에만 저장 (fallback)
          set({ selectedTopics: ids });
        }
      },
      
      clearTopics: () => set({ selectedTopics: [] }),
      
      // 학습 스타일 설정 (서버 동기화)
      setSelectedLearningStyles: async (ids) => {
        try {
          const { saveInterestInfo } = await import('../api/onboarding.js');
          const state = get();
          await saveInterestInfo({
            motivationIds: state.selectedMotivations,
            topicIds: state.selectedTopics,
            learningStyleIds: ids,
            learningExpectationIds: state.selectedGoal ? [state.selectedGoal] : []
          });
          set({ selectedLearningStyles: ids });
        } catch (error) {
          console.error('Failed to save learning styles:', error);
          // 로컬에만 저장 (fallback)
          set({ selectedLearningStyles: ids });
        }
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