// Web Vitals 측정 및 리포팅
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);  // Cumulative Layout Shift
      getFID(onPerfEntry);  // First Input Delay
      getFCP(onPerfEntry);  // First Contentful Paint
      getLCP(onPerfEntry);  // Largest Contentful Paint
      getTTFB(onPerfEntry); // Time to First Byte
    });
  }
};

// 성능 메트릭 수집
export const measurePerformance = () => {
  const metrics = {};

  // Navigation Timing API
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    metrics.domContentLoaded = timing.domContentLoadedEventEnd - navigationStart;
    metrics.loadComplete = timing.loadEventEnd - navigationStart;
    metrics.domInteractive = timing.domInteractive - navigationStart;
    metrics.firstPaint = timing.domLoading - navigationStart;
  }

  // Resource Timing API
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    
    metrics.totalResources = resources.length;
    metrics.totalResourcesSize = resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    
    // 이미지 로딩 시간
    const images = resources.filter(r => r.initiatorType === 'img');
    metrics.imageLoadTime = images.reduce((total, img) => {
      return total + img.duration;
    }, 0) / images.length || 0;
  }

  return metrics;
};

// 성능 임계값 체크
export const checkPerformanceThresholds = (metrics) => {
  const thresholds = {
    domContentLoaded: 3000,  // 3초
    loadComplete: 5000,      // 5초
    firstPaint: 1000,        // 1초
    imageLoadTime: 500       // 0.5초
  };

  const warnings = [];
  
  Object.entries(thresholds).forEach(([key, threshold]) => {
    if (metrics[key] > threshold) {
      warnings.push({
        metric: key,
        value: metrics[key],
        threshold: threshold,
        severity: metrics[key] > threshold * 2 ? 'high' : 'medium'
      });
    }
  });

  return warnings;
};