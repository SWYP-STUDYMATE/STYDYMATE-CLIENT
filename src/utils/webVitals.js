// Web Vitals measurement utilities

export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
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