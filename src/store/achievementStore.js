import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAchievementStore = create(
  persist(
    (set, get) => ({
      // Achievement 상태
      achievements: [],
      userAchievements: [],
      totalPoints: 0,
      currentLevel: 1,
      unlockedBadges: [],
      recentAchievements: [],

      // Achievement 목록 설정
      setAchievements: (achievements) => set({ achievements }),

      // 사용자 Achievement 설정
      setUserAchievements: (userAchievements) => set({ userAchievements }),

      // 포인트 업데이트
      updateTotalPoints: (points) => set({ totalPoints: points }),
      addPoints: (points) => set((state) => ({
        totalPoints: state.totalPoints + points
      })),

      // 레벨 업데이트
      updateLevel: (level) => set({ currentLevel: level }),

      // 배지 잠금 해제
      unlockBadge: (badgeId) => set((state) => ({
        unlockedBadges: [...state.unlockedBadges, badgeId]
      })),

      // 최근 Achievement 추가
      addRecentAchievement: (achievement) => set((state) => ({
        recentAchievements: [achievement, ...state.recentAchievements].slice(0, 10)
      })),

      // Achievement 완료 처리
      completeAchievement: (achievementId) => set((state) => {
        const achievement = state.achievements.find(a => a.id === achievementId);
        if (!achievement) return state;

        return {
          userAchievements: [...state.userAchievements, {
            ...achievement,
            completedAt: new Date().toISOString()
          }],
          totalPoints: state.totalPoints + (achievement.points || 0),
          recentAchievements: [{
            ...achievement,
            completedAt: new Date().toISOString()
          }, ...state.recentAchievements].slice(0, 10)
        };
      }),

      // Achievement 진행도 계산
      getAchievementProgress: () => {
        const state = get();
        const total = state.achievements.length;
        const completed = state.userAchievements.length;
        return total > 0 ? (completed / total) * 100 : 0;
      },

      // 카테고리별 Achievement 필터
      getAchievementsByCategory: (category) => {
        const state = get();
        return state.achievements.filter(a => a.category === category);
      },

      // Achievement 달성 여부 확인
      isAchievementCompleted: (achievementId) => {
        const state = get();
        return state.userAchievements.some(a => a.id === achievementId);
      },

      // 전체 초기화
      reset: () => set({
        achievements: [],
        userAchievements: [],
        totalPoints: 0,
        currentLevel: 1,
        unlockedBadges: [],
        recentAchievements: []
      })
    }),
    {
      name: 'achievement-storage',
      partialize: (state) => ({
        userAchievements: state.userAchievements,
        totalPoints: state.totalPoints,
        currentLevel: state.currentLevel,
        unlockedBadges: state.unlockedBadges,
        recentAchievements: state.recentAchievements
      })
    }
  )
);

export default useAchievementStore;