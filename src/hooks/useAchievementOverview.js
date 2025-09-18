import { useEffect } from 'react';
import useAchievementStore from '../store/achievementStore';

export const useAchievementOverview = () => {
  const {
    achievements,
    stats,
    loading,
    error,
    fetchAchievements
  } = useAchievementStore((state) => ({
    achievements: state.achievements,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    fetchAchievements: state.fetchAchievements
  }));

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const refresh = (options = {}) => fetchAchievements({ force: true, ...options });

  return {
    achievements,
    stats,
    loading,
    error,
    refresh
  };
};

export default useAchievementOverview;
