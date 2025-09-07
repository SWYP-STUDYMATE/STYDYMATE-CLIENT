import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 이미지 지연 로딩 훅
 * @param {Object} options
 * @param {string} options.src - 실제 이미지 URL
 * @param {string} options.placeholder - 플레이스홀더 이미지 URL
 * @param {number} options.rootMargin - 뷰포트 확장 여백 (기본: 100px)
 * @param {number} options.threshold - 가시성 임계값 (기본: 0.1)
 * @param {boolean} options.eager - 즉시 로딩 여부 (기본: false)
 */
export const useLazyImage = ({
  src,
  placeholder = '',
  rootMargin = 100,
  threshold = 0.1,
  eager = false
}) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // 이미지 로딩 함수
  const loadImage = useCallback(() => {
    if (!src || isLoaded || isLoading) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      // 에러 시 플레이스홀더 유지 또는 기본 이미지 설정
      if (placeholder) {
        setCurrentSrc(placeholder);
      }
    };
    
    img.src = src;
  }, [src, placeholder, isLoaded, isLoading]);

  // Intersection Observer 설정
  useEffect(() => {
    if (eager) {
      loadImage();
      return;
    }

    const element = imgRef.current;
    if (!element) return;

    // Intersection Observer 생성
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadImage();
          observerRef.current?.unobserve(element);
        }
      },
      {
        rootMargin: `${rootMargin}px`,
        threshold: threshold
      }
    );

    // 요소 관찰 시작
    observerRef.current.observe(element);

    // 정리
    return () => {
      observerRef.current?.unobserve(element);
      observerRef.current?.disconnect();
    };
  }, [loadImage, rootMargin, threshold, eager]);

  return {
    ref: imgRef,
    src: currentSrc,
    isLoading,
    isLoaded,
    hasError,
    retry: loadImage
  };
};

/**
 * 지연 로딩 리스트 훅
 * @param {Array} items - 로딩할 아이템 배열
 * @param {number} initialCount - 초기 로딩 개수 (기본: 10)
 * @param {number} loadMoreCount - 추가 로딩 개수 (기본: 5)
 * @param {number} threshold - 로딩 트리거 임계값 (기본: 0.1)
 */
export const useLazyList = ({
  items = [],
  initialCount = 10,
  loadMoreCount = 5,
  threshold = 0.1
}) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // 더 많은 아이템 로딩
  const loadMore = useCallback(() => {
    if (isLoading || visibleCount >= items.length) return;

    setIsLoading(true);
    
    // 실제 환경에서는 네트워크 지연 시뮬레이션
    setTimeout(() => {
      setVisibleCount(prev => 
        Math.min(prev + loadMoreCount, items.length)
      );
      setIsLoading(false);
    }, 300);
  }, [isLoading, visibleCount, items.length, loadMoreCount]);

  // Intersection Observer 설정
  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { threshold }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loadMore, threshold]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return {
    visibleItems,
    hasMore,
    isLoading,
    sentinelRef,
    loadMore
  };
};

/**
 * 컨텐츠 지연 로딩 훅 (무한 스크롤)
 * @param {Function} fetchMore - 추가 데이터를 가져오는 함수
 * @param {Object} options
 * @param {boolean} options.hasNextPage - 다음 페이지 존재 여부
 * @param {boolean} options.isFetchingNextPage - 다음 페이지 로딩 중 여부
 * @param {number} options.threshold - 트리거 임계값
 */
export const useInfiniteScroll = (
  fetchMore,
  { hasNextPage = false, isFetchingNextPage = false, threshold = 0.1 } = {}
) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchMore();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [fetchMore, hasNextPage, isFetchingNextPage, threshold]);

  return { sentinelRef };
};

export default useLazyImage;