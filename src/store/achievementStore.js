import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMyAchievements, getMyAchievementStats } from '../api/achievement';

const ACHIEVEMENT_CACHE_TTL = 5 * 60 * 1000; // 5분

const resolveAchievements = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.achievements)) return payload.achievements;
  if (Array.isArray(payload)) return payload;
  return [];
};

const resolveOptionalArray = (payload, key, fallback) => {
  if (payload && Array.isArray(payload[key])) {
    return payload[key];
  }
  return fallback;
};

const resolveNumber = (payload, key, fallback) => {
  if (payload && typeof payload[key] === 'number') {
    return payload[key];
  }
  return fallback;
};

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
      stats: null,
      lastFetchedAt: 0,

      // 상태 메타
      loading: false,
      error: null,

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
        const achievement = state.achievements.find((item) => item.id === achievementId);
        if (!achievement) return state;

        return {
          userAchievements: [
            ...state.userAchievements,
            {
              ...achievement,
              completedAt: new Date().toISOString()
            }
          ],
          totalPoints: state.totalPoints + (achievement.points || 0),
          recentAchievements: [
            {
              ...achievement,
              completedAt: new Date().toISOString()
            },
            ...state.recentAchievements
          ].slice(0, 10)
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
        return state.achievements.filter((item) => item.category === category);
      },

      // Achievement 달성 여부 확인
      isAchievementCompleted: (achievementId) => {
        const state = get();
        return state.userAchievements.some((item) => item.id === achievementId);
      },

      // 업적 데이터 로드
      fetchAchievements: async ({ force = false } = {}) => {
        const state = get();
        console.log('[achievementStore] fetchAchievements called', {
          loading: state.loading,
          achievementsLength: state.achievements.length,
          force
        });

        if (state.loading) {
          return {
            achievements: state.achievements,
            stats: state.stats
          };
        }

        const now = Date.now();
        const shouldUseCache =
          !force &&
          state.achievements.length > 0 &&
          state.lastFetchedAt &&
          now - state.lastFetchedAt < ACHIEVEMENT_CACHE_TTL;

        if (shouldUseCache) {
          return {
            achievements: state.achievements,
            stats: state.stats
          };
        }

        set({ loading: true, error: null });
        console.log('[achievementStore] set loading true');

        try {
          const [achievementsResponse, statsResponse] = await Promise.all([
            getMyAchievements().catch((error) => {
              console.error('Failed to load achievements:', error);
              throw error;
            }),
            getMyAchievementStats().catch((error) => {
              console.error('Failed to load achievement stats:', error);
              // 통계 API 실패는 전체 렌더링을 막지 않음
              return null;
            })
          ]);

          const basePayload = achievementsResponse?.data ?? achievementsResponse;
          const normalizedAchievements = resolveAchievements(basePayload);
          const stats = statsResponse?.data ?? statsResponse ?? null;

          const nextState = {
            achievements: normalizedAchievements,
            userAchievements: resolveOptionalArray(basePayload, 'userAchievements', state.userAchievements),
            totalPoints: resolveNumber(basePayload, 'totalPoints', resolveNumber(stats, 'totalPoints', state.totalPoints)),
            currentLevel: resolveNumber(basePayload, 'currentLevel', state.currentLevel),
            unlockedBadges: resolveOptionalArray(basePayload, 'unlockedBadges', state.unlockedBadges),
            recentAchievements: resolveOptionalArray(basePayload, 'recentAchievements', state.recentAchievements),
            stats,
            lastFetchedAt: now,
            loading: false,
            error: null
          };

          set(nextState);
          console.log('[achievementStore] set next state', {
            achievementsLength: nextState.achievements.length,
            loading: nextState.loading,
            lastFetchedAt: nextState.lastFetchedAt
          });

          return {
            achievements: nextState.achievements,
            stats: nextState.stats
          };
        } catch (error) {
          const message = error?.message || '업적 정보를 불러오지 못했습니다.';
          set({
            achievements: [],
            stats: null,
            error: message,
            loading: false,
            lastFetchedAt: now
          });
          console.log('[achievementStore] set error state', { message });

          return null;
        }
      },

      // 전체 초기화
      reset: () => set({
        achievements: [],
        userAchievements: [],
        totalPoints: 0,
        currentLevel: 1,
        unlockedBadges: [],
        recentAchievements: [],
        stats: null,
        lastFetchedAt: 0,
        loading: false,
        error: null
      })
    }),
    {
      name: 'achievement-storage',
      partialize: (state) => ({
        achievements: state.achievements,
        userAchievements: state.userAchievements,
        totalPoints: state.totalPoints,
        currentLevel: state.currentLevel,
        unlockedBadges: state.unlockedBadges,
        recentAchievements: state.recentAchievements,
        stats: state.stats,
        lastFetchedAt: state.lastFetchedAt
      })
    }
  )
);

export default useAchievementStore;
