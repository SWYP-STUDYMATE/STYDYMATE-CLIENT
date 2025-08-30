// Web Vitals measurement utilities

export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      try {
        onCLS(onPerfEntry);
        onINP(onPerfEntry); // FID는 v5.0에서 제거됨, INP로 대체
        onFCP(onPerfEntry);
        onLCP(onPerfEntry);
        onTTFB(onPerfEntry);
      } catch (error) {
        console.warn('Web Vitals measurement error:', error);
      }
    }).catch(error => {
      console.warn('Web Vitals import error:', error);
    });
  }
}

export function measurePerformance() {
  const navigation = performance.getEntriesByType('navigation')[0];
  
  if (!navigation) return null;

  return {
    // DNS lookup time
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    // TCP connection time
    tcp: navigation.connectEnd - navigation.connectStart,
    // Request time
    request: navigation.responseStart - navigation.requestStart,
    // Response time
    response: navigation.responseEnd - navigation.responseStart,
    // DOM processing time
    domProcessing: navigation.domComplete - navigation.domLoading,
    // Total load time
    loadTime: navigation.loadEventEnd - navigation.fetchStart,
  };
}

// Log performance marks
export function logPerformanceMark(markName) {
  if ('performance' in window && 'mark' in window.performance) {
    performance.mark(markName);
  }
}

// Measure between two marks
export function measureBetweenMarks(startMark, endMark, measureName) {
  if ('performance' in window && 'measure' in window.performance) {
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      console.log(`${measureName}: ${measure.duration}ms`);
      return measure.duration;
    } catch (error) {
      console.error('Performance measurement error:', error);
    }
  }
  return null;
}