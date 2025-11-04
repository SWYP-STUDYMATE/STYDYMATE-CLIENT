import { useCallback, useMemo, useRef, useEffect } from 'react';
import { shallow } from 'zustand/shallow';
import useAchievementStore from '../store/achievementStore';

const EMPTY_ARRAY = []; // 상수로 정의하여 참조 안정성 보장

const selectAchievementOverview = (state) => ({
  achievements: state.achievements,
  stats: state.stats,
  loading: state.loading,
  error: state.error,
  fetchAchievements: state.fetchAchievements,
  lastFetchedAt: state.lastFetchedAt
});

export const useAchievementOverview = () => {
  const {
    achievements: rawAchievements,
    stats,
    loading,
    error,
    fetchAchievements,
    lastFetchedAt
  } = useAchievementStore(selectAchievementOverview, shallow);

  // 안전한 배열 반환 보장 (참조 안정성 보장)
  const achievements = useMemo(() => {
    return Array.isArray(rawAchievements) ? rawAchievements : EMPTY_ARRAY;
  }, [rawAchievements]);

  // 초기 fetch 추적을 위한 ref (무한 루프 방지)
  const initializedRef = useRef(false);

  // 초기화: 마운트 시 한 번만 실행되도록 보장
  useEffect(() => {
    // 이미 초기화되었으면 스킵
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    // 캐시된 데이터가 없으면 fetch 실행
    const hasCachedData = rawAchievements && rawAchievements.length > 0 && lastFetchedAt && lastFetchedAt > 0;
    
    if (!hasCachedData && typeof fetchAchievements === 'function') {
      // 다음 틱에서 실행하여 렌더링 완료 후 보장
      const timeoutId = setTimeout(() => {
        if (typeof fetchAchievements === 'function') {
          fetchAchievements().catch((err) => {
            console.error('[useAchievementOverview] Failed to fetch achievements:', err);
          });
        }
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 실행

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
