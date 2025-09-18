import { useCallback, useEffect, useState } from 'react';
import { getMyAchievements, getMyAchievementStats } from '../api/achievement';

const normalizeAchievements = (raw) => {
  const list = raw?.data ?? raw ?? [];
  if (!Array.isArray(list)) return [];

  return list.map((item) => {
    const achievement = item.achievement || {};
    const targetValue = achievement.targetValue ?? 0;
    const progress = item.currentProgress ?? 0;
    const calculatedProgress = targetValue > 0 ? Math.min(100, Math.round((progress / targetValue) * 100)) : item.progressPercentage ?? 0;

    return {
      id: item.id ?? achievement.id,
      isCompleted: Boolean(item.isCompleted),
      completedAt: item.completedAt,
      isRewardClaimed: Boolean(item.isRewardClaimed),
      rewardClaimedAt: item.rewardClaimedAt,
      progressPercentage: item.progressPercentage ?? calculatedProgress,
      currentProgress: progress,
      targetValue,
      achievement: {
        id: achievement.id,
        key: achievement.achievementKey || achievement.key,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        tier: achievement.tier,
        xpReward: achievement.xpReward,
        badgeIconUrl: achievement.badgeIconUrl,
        badgeColor: achievement.badgeColor,
        targetUnit: achievement.targetUnit,
        isActive: achievement.isActive
      }
    };
  });
};

const normalizeStats = (raw) => {
  if (!raw) return null;
  return raw.data ?? raw;
};

export const useAchievementOverview = () => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [achievementResult, statsResult] = await Promise.allSettled([
        getMyAchievements(),
        getMyAchievementStats()
      ]);

      if (achievementResult.status === 'fulfilled') {
        setAchievements(normalizeAchievements(achievementResult.value));
      } else {
        setAchievements([]);
        setError(achievementResult.reason || new Error('업적 데이터를 불러오지 못했습니다.'));
      }

      if (statsResult.status === 'fulfilled') {
        setStats(normalizeStats(statsResult.value));
      } else {
        setStats(null);
        setError((prev) => prev ?? statsResult.reason ?? new Error('업적 통계를 불러오지 못했습니다.'));
      }
    } catch (err) {
      console.error('업적 정보를 불러오는 중 오류 발생', err);
      setAchievements([]);
      setStats(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    achievements,
    stats,
    loading,
    error,
    refresh: fetchData
  };
};

export default useAchievementOverview;
