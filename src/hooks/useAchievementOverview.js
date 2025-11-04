import { useCallback, useEffect, useMemo, useRef } from 'react';
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
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // 이미 초기화되었거나 로딩 중이면 스킵
    if (hasInitializedRef.current || loading) return;

    // 캐시된 데이터가 있으면 fetch하지 않음 (hydration으로 이미 복원됨)
    // achievements 배열이 있고, lastFetchedAt이 설정되어 있으면 캐시된 것으로 간주
    if (rawAchievements && rawAchievements.length > 0 && lastFetchedAt && lastFetchedAt > 0) {
      hasInitializedRef.current = true;
      return;
    }

    if (typeof fetchAchievements !== 'function') {
      console.warn('[useAchievementOverview] fetchAchievements is not available');
      return;
    }

    // 초기화 플래그 설정하여 중복 호출 방지
    hasInitializedRef.current = true;
    
    // 비동기로 fetch 실행 (렌더링 완료 후)
    Promise.resolve().then(() => {
      fetchAchievements().catch((err) => {
        console.error('[useAchievementOverview] Failed to fetch achievements:', err);
        // 에러 발생 시 플래그 재설정하여 재시도 가능하도록
        hasInitializedRef.current = false;
      });
    });
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
