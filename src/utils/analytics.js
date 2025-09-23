// Analytics tracking utilities

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_WORKERS_API_URL ||
  'https://workers.languagemate.kr';

class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = localStorage.getItem('userId');
    this.events = [];
    this.flushInterval = null;
    this.startSession();
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  startSession() {
    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Track page views
    this.trackPageView();

    // Track performance metrics
    this.trackPerformance();
  }

  trackEvent(eventName, properties = {}) {
    const event = {
      event: eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId || 'anonymous',
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      },
    };

    this.events.push(event);

    // Auto flush if we have too many events
    if (this.events.length >= 20) {
      this.flush();
    }
  }

  trackPageView(pageName = null) {
    this.trackEvent('page_view', {
      page: pageName || window.location.pathname,
      title: document.title,
    });
  }

  trackError(error, context = {}) {
    this.trackEvent('error', {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context,
    });
  }

  trackPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
          const firstPaint = performance.getEntriesByType('paint').find(
            entry => entry.name === 'first-contentful-paint'
          );

          this.trackEvent('performance', {
            pageLoadTime,
            domReadyTime,
            firstContentfulPaint: firstPaint ? firstPaint.startTime : null,
          });
        }, 0);
      });
    }
  }

  async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch(`${API_BASE_URL}/api/v1/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          events: eventsToSend,
        }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Put events back if failed
      this.events.unshift(...eventsToSend);
    }
  }

  // Feature-specific tracking methods
  trackLevelTestStart() {
    this.trackEvent('level_test_start');
  }

  trackLevelTestComplete(level, score) {
    this.trackEvent('level_test_complete', { level, score });
  }

  trackSessionStart(sessionType, partnerId) {
    this.trackEvent('session_start', { sessionType, partnerId });
  }

  trackSessionEnd(sessionType, duration) {
    this.trackEvent('session_end', { sessionType, duration });
  }

  trackSignup(method) {
    this.trackEvent('signup', { method });
  }

  trackLogin(method) {
    this.trackEvent('login', { method });
  }

  trackFeatureUsage(featureName, action) {
    this.trackEvent('feature_usage', { feature: featureName, action });
  }

  // A/B Testing
  getVariant(experimentName, variants = ['control', 'variant']) {
    // Simple deterministic variant assignment based on user ID
    const hash = this.hashCode(this.userId || this.sessionId + experimentName);
    const index = Math.abs(hash) % variants.length;
    const variant = variants[index];
    
    this.trackEvent('experiment_exposure', {
      experiment: experimentName,
      variant,
    });
    
    return variant;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Clean up
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export for testing
export default Analytics;
