import { create } from "zustand";
import { persist } from "zustand/middleware";

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