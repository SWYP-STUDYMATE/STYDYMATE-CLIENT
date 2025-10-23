import { useCallback, useEffect } from 'react';
import { shallow } from 'zustand/shallow';
import useAchievementStore from '../store/achievementStore';

const selectAchievementOverview = (state) => ({
  achievements: state.achievements,
  stats: state.stats,
  loading: state.loading,
  error: state.error,
  fetchAchievements: state.fetchAchievements,
  _hasHydrated: state._hasHydrated
});

export const useAchievementOverview = () => {
  const {
    achievements: rawAchievements,
    stats,
    loading,
    error,
    fetchAchievements,
    _hasHydrated
  } = useAchievementStore(selectAchievementOverview, shallow);

  // 안전한 배열 반환 보장 (무한 재렌더링 방지)
  const achievements = Array.isArray(rawAchievements) ? rawAchievements : [];

  useEffect(() => {
    // Hydration이 완료된 후에만 fetchAchievements 호출
    if (!_hasHydrated) return;

    if (typeof fetchAchievements !== 'function') {
      console.warn('[useAchievementOverview] fetchAchievements is not available');
      return;
    }

    fetchAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]); // Hydration 완료 시 한 번만 실행

  const refresh = useCallback((options = {}) => {
    if (typeof fetchAchievements !== 'function') {
      console.warn('[useAchievementOverview] refresh skipped: fetchAchievements is not a function');
      return Promise.resolve(null);
    }

    return fetchAchievements({ force: true, ...options });
  }, [fetchAchievements]);

  return {
    achievements,
    stats,
    loading,
    error,
    refresh
  };
};

export default useAchievementOverview;
