import { useCallback, useRef, useEffect } from 'react';
import useAchievementStore from '../store/achievementStore';

const EMPTY_ARRAY = []; // 상수로 정의하여 참조 안정성 보장
const EMPTY_STATS = null; // 기본 stats 값

/**
 * ⚠️ React Error #185 해결:
 * - shallow 비교 대신 개별 selector 사용
 * - 함수는 별도로 가져와서 참조 안정성 보장
 * - useMemo 대신 useRef로 이전 값 추적
 */
export const useAchievementOverview = () => {
  // 개별 selector 사용 - 각 값이 변경될 때만 리렌더링
  const rawAchievements = useAchievementStore((state) => state.achievements);
  const stats = useAchievementStore((state) => state.stats);
  const loading = useAchievementStore((state) => state.loading);
  const error = useAchievementStore((state) => state.error);
  const lastFetchedAt = useAchievementStore((state) => state.lastFetchedAt);

  // 함수는 별도로 가져오기 (안정적인 참조)
  const fetchAchievementsFromStore = useAchievementStore((state) => state.fetchAchievements);

  // 초기 fetch 추적을 위한 ref (무한 루프 방지)
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);

  // 안전한 배열 반환 - useRef로 이전 값 캐싱
  const prevAchievementsRef = useRef(EMPTY_ARRAY);

  // rawAchievements가 유효한 배열이면 업데이트, 아니면 이전 값 유지
  const achievements = (() => {
    if (Array.isArray(rawAchievements) && rawAchievements.length > 0) {
      prevAchievementsRef.current = rawAchievements;
      return rawAchievements;
    }
    if (Array.isArray(rawAchievements)) {
      return rawAchievements; // 빈 배열도 유효
    }
    return prevAchievementsRef.current;
  })();

  // stats 안전 처리
  const safeStats = stats && typeof stats === 'object' && !Array.isArray(stats) ? stats : EMPTY_STATS;

  // 마운트 상태 추적
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 초기화: 마운트 시 한 번만 실행되도록 보장
  useEffect(() => {
    // 이미 초기화되었으면 스킵
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 캐시된 데이터가 있으면 fetch 스킵
    const hasCachedData = Array.isArray(rawAchievements) && rawAchievements.length > 0 && lastFetchedAt && lastFetchedAt > 0;

    if (!hasCachedData && typeof fetchAchievementsFromStore === 'function') {
      // 다음 틱에서 실행하여 렌더링 완료 후 보장
      const timeoutId = setTimeout(() => {
        // 마운트 상태 확인
        if (!mountedRef.current) return;

        if (typeof fetchAchievementsFromStore === 'function') {
          fetchAchievementsFromStore().catch((err) => {
            if (mountedRef.current) {
              console.error('[useAchievementOverview] Failed to fetch achievements:', err);
            }
          });
        }
      }, 100); // 100ms 지연으로 hydration 완료 대기

      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 실행

  // refresh 함수 - useCallback으로 안정적인 참조 유지
  const refresh = useCallback((options = {}) => {
    if (typeof fetchAchievementsFromStore !== 'function') {
      console.warn('[useAchievementOverview] refresh skipped: fetchAchievements is not a function');
      return Promise.resolve(null);
    }

    return fetchAchievementsFromStore({ force: true, ...options });
  }, [fetchAchievementsFromStore]);

  return {
    achievements,
    stats: safeStats,
    loading,
    error,
    refresh
  };
};

export default useAchievementOverview;
