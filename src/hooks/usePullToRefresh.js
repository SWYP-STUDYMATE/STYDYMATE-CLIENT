import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * 풀 투 리프레시 제스처 감지 훅
 * @param {Object} options
 * @param {Function} options.onRefresh - 새로고침 콜백 함수
 * @param {number} options.threshold - 새로고침 트리거 임계값 (기본: 80px)
 * @param {number} options.maxPullDistance - 최대 당김 거리 (기본: 120px)
 * @param {boolean} options.disabled - 비활성화 여부 (기본: false)
 */
const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  disabled = false
}) => {
  const elementRef = useRef(null);
  const touchStartRef = useRef({ y: 0, scrollTop: 0 });
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = useCallback((e) => {
    if (disabled || isRefreshing) return;
    
    const element = elementRef.current;
    if (!element) return;
    
    // 스크롤이 최상단에 있을 때만 작동
    if (element.scrollTop === 0) {
      const touch = e.touches[0];
      touchStartRef.current = {
        y: touch.clientY,
        scrollTop: element.scrollTop
      };
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e) => {
    if (disabled || isRefreshing) return;
    
    const element = elementRef.current;
    if (!element) return;
    
    // 스크롤이 최상단에 있고 아래로 당기는 경우에만 작동
    if (element.scrollTop === 0 && touchStartRef.current.y > 0) {
      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;
      
      if (deltaY > 0) {
        e.preventDefault(); // 기본 스크롤 방지
        
        // 당김 거리 계산 (저항 효과 적용)
        const resistance = Math.min(deltaY / 2.5, maxPullDistance);
        setPullDistance(resistance);
        setIsPulling(true);
      }
    }
  }, [disabled, isRefreshing, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh?.();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      } finally {
        // 애니메이션을 위한 딜레이
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      // 임계값에 도달하지 않으면 원래 위치로 복원
      setPullDistance(0);
    }
    
    touchStartRef.current = { y: 0, scrollTop: 0 };
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 패시브 터치 이벤트 등록
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: elementRef,
    pullDistance,
    isRefreshing,
    isPulling,
    canRefresh: pullDistance >= threshold
  };
};

export default usePullToRefresh;