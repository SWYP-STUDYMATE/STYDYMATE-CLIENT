import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { levelTestStart } from '../api/levelTest';

const useLevelTestStore = create(
  persist(
    (set, get) => ({
      currentTest: null,
      questions: [],
      resetTest: () => set({ currentTest: null, questions: [] }),
      startNewTest: async (lang = 'en') => {
        const test = await levelTestStart({
          languageCode: lang,
          testType: 'AI',
          testLevel: 'AUTO',
          totalQuestions: 10,
        });
        set({ currentTest: test });
        return test;
      },
      loadQuestions: async () => {
        // TODO: 실제 질문 로딩 API로 교체
        // const qs = await getLevelTestQuestions();
        // set({ questions: qs });
      },
    }),
    { name: 'level-test-storage' }
  )
);

export default useLevelTestStore;
