import { create } from "zustand";
import { persist } from "zustand/middleware";

// TODO: API 구현 완료 후 getUserMotivationInfo() API로 대체 예정
// 현재는 클라이언트 상태로 관리, 서버 DB와 동기화 필요
const useMotivationStore = create(
  persist(
    (set) => ({
      selectedMotivations: [],
      setSelectedMotivations: (ids) => set({ selectedMotivations: ids }),
      clearMotivations: () => set({ selectedMotivations: [] }),
      selectedTopics: [],
      setSelectedTopics: (ids) => set({ selectedTopics: ids }),
      clearTopics: () => set({ selectedTopics: [] }),
      selectedLearningStyles: [],
      setSelectedLearningStyles: (ids) => set({ selectedLearningStyles: ids }),
      selectedGoal: null,
      setSelectedGoal: (goal) => set({ selectedGoal: goal }),
    }),
    { name: "motivation-storage" }
  )
);

export default useMotivationStore; 