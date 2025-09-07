import { useRef, useEffect, useCallback } from 'react';

/**
 * 스와이프 제스처 감지 훅
 * @param {Object} options 
 * @param {Function} options.onSwipeLeft - 왼쪽 스와이프 콜백
 * @param {Function} options.onSwipeRight - 오른쪽 스와이프 콜백  
 * @param {Function} options.onSwipeUp - 위쪽 스와이프 콜백
 * @param {Function} options.onSwipeDown - 아래쪽 스와이프 콜백
 * @param {number} options.minDistance - 최소 스와이프 거리 (기본: 50px)
 * @param {number} options.maxTime - 최대 스와이프 시간 (기본: 300ms)
 * @param {boolean} options.preventDefault - 기본 동작 방지 (기본: true)
 */
const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  minDistance = 50,
  maxTime = 300,
  preventDefault = true
}) => {
  const elementRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (preventDefault && e.cancelable) {
      e.preventDefault();
    }
    
    const touch = e.touches[0] || e.changedTouches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    isSwiping.current = true;
  }, [preventDefault]);

  const handleTouchMove = useCallback((e) => {
    if (!isSwiping.current) return;
    
    if (preventDefault && e.cancelable) {
      e.preventDefault();
    }
  }, [preventDefault]);

  const handleTouchEnd = useCallback((e) => {
    if (!isSwiping.current) return;
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    const deltaTime = endTime - touchStartRef.current.time;
    
    // 시간 제한 체크
    if (deltaTime > maxTime) {
      isSwiping.current = false;
      return;
    }
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    // 최소 거리 체크
    if (Math.max(absDeltaX, absDeltaY) < minDistance) {
      isSwiping.current = false;
      return;
    }
    
    // 주 방향 결정 (더 큰 움직임)
    if (absDeltaX > absDeltaY) {
      // 수평 스와이프
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight({ deltaX, deltaY, deltaTime });
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft({ deltaX, deltaY, deltaTime });
      }
    } else {
      // 수직 스와이프
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown({ deltaX, deltaY, deltaTime });
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp({ deltaX, deltaY, deltaTime });
      }
    }
    
    isSwiping.current = false;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minDistance, maxTime]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 터치 이벤트 등록 (passive: false로 preventDefault 허용)
    const touchOptions = { passive: !preventDefault };
    
    element.addEventListener('touchstart', handleTouchStart, touchOptions);
    element.addEventListener('touchmove', handleTouchMove, touchOptions);
    element.addEventListener('touchend', handleTouchEnd, touchOptions);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  return elementRef;
};

export default useSwipeGesture;