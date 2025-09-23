import { useCallback, useEffect } from 'react';
import { shallow } from 'zustand/shallow';
import useAchievementStore from '../store/achievementStore';

const selectAchievementOverview = (state) => ({
  achievements: state.achievements,
  stats: state.stats,
  loading: state.loading,
  error: state.error,
  fetchAchievements: state.fetchAchievements
});

export const useAchievementOverview = () => {
  const {
    achievements,
    stats,
    loading,
    error,
    fetchAchievements
  } = useAchievementStore(selectAchievementOverview, shallow);

  useEffect(() => {
    if (typeof fetchAchievements !== 'function') {
      console.warn('[useAchievementOverview] fetchAchievements is not available');
      return;
    }

    fetchAchievements();
  }, [fetchAchievements]);

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
