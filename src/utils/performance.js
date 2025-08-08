// 성능 측정 유틸리티

// Web Vitals 측정
export const measureWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry); // Cumulative Layout Shift
      getFID(onPerfEntry); // First Input Delay
      getFCP(onPerfEntry); // First Contentful Paint
      getLCP(onPerfEntry); // Largest Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
    });
  }
};

// 리소스 프리로드
export const preloadResource = (url, as, type) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
};

// 중요 리소스 프리로드
export const preloadCriticalResources = () => {
  // 폰트 프리로드
  preloadResource('/fonts/Pretendard-Regular.woff2', 'font', 'font/woff2');
  preloadResource('/fonts/Pretendard-Bold.woff2', 'font', 'font/woff2');
  
  // 중요 이미지 프리로드
  preloadResource('/assets/logo.png', 'image');
};

// 이미지 프리페치
export const prefetchImages = (imageUrls) => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

// 라우트 프리페치
export const prefetchRoute = (routePath) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = routePath;
  document.head.appendChild(link);
};

// 디바운스
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 쓰로틀
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 메모이제이션
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// 컴포넌트 렌더링 최적화
export const shouldComponentUpdate = (prevProps, nextProps, keys = []) => {
  if (keys.length === 0) {
    return JSON.stringify(prevProps) !== JSON.stringify(nextProps);
  }
  
  return keys.some(key => prevProps[key] !== nextProps[key]);
};

// 무한 스크롤 옵저버
export const createInfiniteScrollObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback();
      }
    });
  }, defaultOptions);
};

// 성능 모니터링
export const performanceMonitor = {
  marks: new Map(),
  
  start(name) {
    performance.mark(`${name}-start`);
    this.marks.set(name, performance.now());
  },
  
  end(name) {
    if (!this.marks.has(name)) return;
    
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    const duration = measure.duration;
    
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    // 정리
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);
    this.marks.delete(name);
    
    return duration;
  }
};

// 번들 사이즈 체크 (개발 환경에서만)
export const checkBundleSize = async () => {
  if (import.meta.env.DEV) {
    const stats = await fetch('/dist/stats.html').catch(() => null);
    if (stats) {
      console.log('Bundle stats available at: /dist/stats.html');
    }
  }
};