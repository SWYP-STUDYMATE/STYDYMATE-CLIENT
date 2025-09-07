import { useEffect, useCallback, useRef } from 'react';

/**
 * 컴포넌트 프리로딩 훅
 * @param {Function} importFn - 프리로드할 컴포넌트의 import 함수
 * @param {Object} options
 * @param {boolean} options.preloadOnMount - 마운트 시 즉시 프리로드
 * @param {boolean} options.preloadOnIdle - 브라우저 유휴 시간에 프리로드
 * @param {boolean} options.preloadOnHover - 호버 시 프리로드
 * @param {number} options.delay - 지연 시간 (ms)
 */
export const usePreload = (
  importFn,
  {
    preloadOnMount = false,
    preloadOnIdle = false,
    preloadOnHover = false,
    delay = 0
  } = {}
) => {
  const moduleRef = useRef(null);
  const isPreloadingRef = useRef(false);

  const preload = useCallback(async () => {
    if (moduleRef.current || isPreloadingRef.current) return;
    
    isPreloadingRef.current = true;
    
    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const module = await importFn();
      moduleRef.current = module;
    } catch (error) {
      console.warn('Preload failed:', error);
    } finally {
      isPreloadingRef.current = false;
    }
  }, [importFn, delay]);

  useEffect(() => {
    if (preloadOnMount) {
      preload();
    }
  }, [preload, preloadOnMount]);

  useEffect(() => {
    if (preloadOnIdle) {
      if ('requestIdleCallback' in window) {
        const idleCallback = window.requestIdleCallback(() => {
          preload();
        });
        
        return () => window.cancelIdleCallback(idleCallback);
      } else {
        const timeoutId = setTimeout(() => {
          preload();
        }, 2000);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [preload, preloadOnIdle]);

  const preloadOnHoverProps = preloadOnHover ? {
    onMouseEnter: preload,
    onFocus: preload
  } : {};

  return {
    preload,
    isPreloaded: !!moduleRef.current,
    isPreloading: isPreloadingRef.current,
    ...preloadOnHoverProps
  };
};

/**
 * 라우트 프리로딩 훅
 * @param {Array} routes - 프리로드할 라우트 배열
 */
export const useRoutePreload = (routes = []) => {
  const preloadedRoutesRef = useRef(new Set());

  const preloadRoute = useCallback(async (routePath) => {
    if (preloadedRoutesRef.current.has(routePath)) return;

    const route = routes.find(r => r.path === routePath);
    if (!route || !route.component) return;

    try {
      await route.component();
      preloadedRoutesRef.current.add(routePath);
    } catch (error) {
      console.warn(`Failed to preload route ${routePath}:`, error);
    }
  }, [routes]);

  const preloadCriticalRoutes = useCallback(async () => {
    const criticalRoutes = routes
      .filter(route => route.critical)
      .map(route => route.path);

    await Promise.allSettled(
      criticalRoutes.map(path => preloadRoute(path))
    );
  }, [routes, preloadRoute]);

  const preloadRouteOnHover = useCallback((routePath) => {
    return {
      onMouseEnter: () => preloadRoute(routePath),
      onFocus: () => preloadRoute(routePath)
    };
  }, [preloadRoute]);

  return {
    preloadRoute,
    preloadCriticalRoutes,
    preloadRouteOnHover,
    preloadedRoutes: Array.from(preloadedRoutesRef.current)
  };
};

/**
 * 이미지 프리로딩 훅
 * @param {Array} imageUrls - 프리로드할 이미지 URL 배열
 * @param {Object} options
 */
export const useImagePreload = (imageUrls = [], { eager = false } = {}) => {
  const preloadedImagesRef = useRef(new Set());
  const preloadingImagesRef = useRef(new Set());

  const preloadImage = useCallback((url) => {
    return new Promise((resolve, reject) => {
      if (preloadedImagesRef.current.has(url)) {
        resolve(url);
        return;
      }

      if (preloadingImagesRef.current.has(url)) {
        return;
      }

      preloadingImagesRef.current.add(url);

      const img = new Image();
      
      img.onload = () => {
        preloadedImagesRef.current.add(url);
        preloadingImagesRef.current.delete(url);
        resolve(url);
      };
      
      img.onerror = () => {
        preloadingImagesRef.current.delete(url);
        reject(new Error(`Failed to preload image: ${url}`));
      };
      
      img.src = url;
    });
  }, []);

  const preloadImages = useCallback(async (urls = imageUrls) => {
    const results = await Promise.allSettled(
      urls.map(url => preloadImage(url))
    );
    
    return {
      successful: results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value),
      failed: results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason)
    };
  }, [imageUrls, preloadImage]);

  useEffect(() => {
    if (eager && imageUrls.length > 0) {
      preloadImages();
    }
  }, [eager, imageUrls, preloadImages]);

  return {
    preloadImage,
    preloadImages,
    preloadedImages: Array.from(preloadedImagesRef.current),
    preloadingImages: Array.from(preloadingImagesRef.current)
  };
};

/**
 * 리소스 프리로딩 훅 (스타일시트, 스크립트 등)
 */
export const useResourcePreload = () => {
  const preloadedResourcesRef = useRef(new Set());

  const preloadResource = useCallback((href, as = 'script', crossorigin = null) => {
    if (preloadedResourcesRef.current.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }

    document.head.appendChild(link);
    preloadedResourcesRef.current.add(href);
  }, []);

  const preloadStylesheet = useCallback((href) => {
    preloadResource(href, 'style');
  }, [preloadResource]);

  const preloadScript = useCallback((href) => {
    preloadResource(href, 'script');
  }, [preloadResource]);

  const preloadFont = useCallback((href) => {
    preloadResource(href, 'font', 'anonymous');
  }, [preloadResource]);

  return {
    preloadResource,
    preloadStylesheet,
    preloadScript,
    preloadFont,
    preloadedResources: Array.from(preloadedResourcesRef.current)
  };
};

/**
 * 사용자 인터랙션 기반 프리로딩 훅
 */
export const useInteractionPreload = () => {
  const userHasInteractedRef = useRef(false);
  const preloadQueueRef = useRef([]);

  const addToPreloadQueue = useCallback((importFn, priority = 'normal') => {
    preloadQueueRef.current.push({ importFn, priority });
    preloadQueueRef.current.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, []);

  const executePreloadQueue = useCallback(async () => {
    if (preloadQueueRef.current.length === 0) return;

    const queue = [...preloadQueueRef.current];
    preloadQueueRef.current = [];

    for (const { importFn } of queue) {
      try {
        await importFn();
        // 다음 프리로드 전에 잠깐 대기 (메인 스레드 블로킹 방지)
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.warn('Interaction preload failed:', error);
      }
    }
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (userHasInteractedRef.current) return;
      
      userHasInteractedRef.current = true;
      executePreloadQueue();
      
      // 이벤트 리스너 제거
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction, { passive: true });
    document.addEventListener('keydown', handleFirstInteraction, { passive: true });
    document.addEventListener('touchstart', handleFirstInteraction, { passive: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [executePreloadQueue]);

  return {
    addToPreloadQueue,
    userHasInteracted: userHasInteractedRef.current,
    queueLength: preloadQueueRef.current.length
  };
};

export default usePreload;