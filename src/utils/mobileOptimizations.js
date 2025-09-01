/**
 * 모바일 최적화 유틸리티 함수들
 * Mobile Safari 특화 이슈 해결 및 모바일 UX 개선
 */

/**
 * 디바이스 및 브라우저 감지
 */
export const deviceDetection = {
  // iOS 감지
  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  // Safari 감지
  isSafari: () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },

  // Mobile Safari 감지
  isMobileSafari: () => {
    return deviceDetection.isIOS() && deviceDetection.isSafari();
  },

  // 안드로이드 감지
  isAndroid: () => {
    return /Android/.test(navigator.userAgent);
  },

  // 모바일 감지
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // 화면 크기 기반 모바일 감지
  isMobileScreen: () => {
    return window.innerWidth <= 768;
  },

  // 터치 디바이스 감지
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
};

/**
 * iOS/Safari 특화 최적화
 */
export const iosOptimizations = {
  // iOS 100vh 이슈 해결
  fixViewportHeight: () => {
    if (!deviceDetection.isIOS()) return;

    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100);
    });

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  },

  // iOS input zoom 방지
  preventInputZoom: () => {
    if (!deviceDetection.isIOS()) return;

    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input.style.fontSize === '' || parseInt(input.style.fontSize) < 16) {
        input.style.fontSize = '16px';
      }
    });
  },

  // iOS 스크롤 부드럽게
  enableSmoothScrolling: () => {
    if (!deviceDetection.isIOS()) return;

    document.body.style.webkitOverflowScrolling = 'touch';
    
    // 스크롤 가능한 모든 요소에 적용
    const scrollableElements = document.querySelectorAll('[data-scrollable], .overflow-y-auto, .overflow-scroll');
    scrollableElements.forEach(element => {
      element.style.webkitOverflowScrolling = 'touch';
    });
  },

  // Safe Area 패딩 적용
  applySafeAreaPadding: () => {
    if (!deviceDetection.isIOS()) return;

    const safeAreaCSS = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top);
        --safe-area-inset-right: env(safe-area-inset-right);
        --safe-area-inset-bottom: env(safe-area-inset-bottom);
        --safe-area-inset-left: env(safe-area-inset-left);
      }
    `;

    const style = document.createElement('style');
    style.textContent = safeAreaCSS;
    document.head.appendChild(style);
  }
};

/**
 * 터치 이벤트 최적화
 */
export const touchOptimizations = {
  // 300ms 지연 제거 (modern browsers에서는 불필요하지만 안전장치)
  removeTapDelay: () => {
    if (!deviceDetection.isTouchDevice()) return;

    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, user-scalable=no';
    
    const existingMeta = document.querySelector('meta[name="viewport"]');
    if (existingMeta) {
      existingMeta.content = meta.content;
    } else {
      document.head.appendChild(meta);
    }
  },

  // 터치 피드백 개선
  enhanceTouchFeedback: () => {
    const style = document.createElement('style');
    style.textContent = `
      /* 터치 하이라이트 색상 설정 */
      * {
        -webkit-tap-highlight-color: rgba(0, 196, 113, 0.2);
        -webkit-touch-callout: none;
      }

      /* 버튼 터치 피드백 */
      button, [role="button"], .btn {
        -webkit-tap-highlight-color: rgba(0, 196, 113, 0.3);
        -webkit-user-select: none;
        user-select: none;
      }

      /* 입력 필드 터치 피드백 */
      input, textarea, select {
        -webkit-tap-highlight-color: rgba(0, 196, 113, 0.1);
      }

      /* 링크 터치 피드백 */
      a {
        -webkit-tap-highlight-color: rgba(0, 196, 113, 0.2);
      }

      /* 스크롤 개선 */
      .scroll-smooth {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
  },

  // 드래그 방지 (이미지, 텍스트)
  preventUnwantedDrag: () => {
    const style = document.createElement('style');
    style.textContent = `
      img {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        pointer-events: none;
      }
      
      /* 텍스트 선택 방지 (필요한 경우) */
      .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }
};

/**
 * 성능 최적화
 */
export const performanceOptimizations = {
  // 이미지 지연 로딩
  enableLazyLoading: () => {
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.loading = 'lazy';
      });
    } else {
      // IntersectionObserver 폴백
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  },

  // 중요하지 않은 리소스 지연 로딩
  deferNonCriticalResources: () => {
    // 페이지 로드 후 비필수 스크립트 로드
    window.addEventListener('load', () => {
      const deferredScripts = document.querySelectorAll('script[data-defer]');
      deferredScripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.dataset.defer;
        script.parentNode.replaceChild(newScript, script);
      });
    });
  },

  // 메모리 사용량 모니터링 (개발 환경)
  monitorMemoryUsage: () => {
    if (!import.meta.env.DEV) return;
    if (!performance.memory) return;

    const logMemoryUsage = () => {
      const memory = performance.memory;
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      });
    };

    // 5초마다 메모리 사용량 로그
    setInterval(logMemoryUsage, 5000);
  }
};

/**
 * 접근성 개선
 */
export const accessibilityEnhancements = {
  // 포커스 관리 개선
  enhanceFocusManagement: () => {
    // 키보드 사용자를 위한 포커스 아웃라인
    let isUsingMouse = false;

    document.addEventListener('mousedown', () => {
      isUsingMouse = true;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        isUsingMouse = false;
      }
    });

    const style = document.createElement('style');
    style.textContent = `
      .focus-visible-only:focus {
        outline: ${isUsingMouse ? 'none' : '2px solid #00C471'};
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  },

  // ARIA 라이브 영역 추가
  addAriaLiveRegions: () => {
    // 전역 알림 영역
    if (!document.getElementById('aria-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
  },

  // 동적 메시지 알림
  announceToScreenReader: (message) => {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }
};

/**
 * 전체 모바일 최적화 초기화
 */
export const initializeMobileOptimizations = () => {
  try {
    // iOS 특화 최적화
    iosOptimizations.fixViewportHeight();
    iosOptimizations.preventInputZoom();
    iosOptimizations.enableSmoothScrolling();
    iosOptimizations.applySafeAreaPadding();

    // 터치 최적화
    touchOptimizations.removeTapDelay();
    touchOptimizations.enhanceTouchFeedback();
    touchOptimizations.preventUnwantedDrag();

    // 성능 최적화
    performanceOptimizations.enableLazyLoading();
    performanceOptimizations.deferNonCriticalResources();
    performanceOptimizations.monitorMemoryUsage();

    // 접근성 개선
    accessibilityEnhancements.enhanceFocusManagement();
    accessibilityEnhancements.addAriaLiveRegions();

    console.log('🚀 모바일 최적화 초기화 완료');
  } catch (error) {
    console.error('❌ 모바일 최적화 초기화 실패:', error);
  }
};

/**
 * 모바일 디버깅 도구
 */
export const mobileDebugTools = {
  // 모바일 디바이스 정보 출력
  logDeviceInfo: () => {
    console.log('📱 디바이스 정보:', {
      userAgent: navigator.userAgent,
      isIOS: deviceDetection.isIOS(),
      isMobileSafari: deviceDetection.isMobileSafari(),
      isAndroid: deviceDetection.isAndroid(),
      isMobile: deviceDetection.isMobile(),
      isTouchDevice: deviceDetection.isTouchDevice(),
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: window.devicePixelRatio
    });
  },

  // 터치 이벤트 로깅
  logTouchEvents: () => {
    if (!import.meta.env.DEV) return;

    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        console.log(`👆 ${eventType}:`, {
          touches: e.touches.length,
          changedTouches: e.changedTouches.length,
          target: e.target.tagName
        });
      });
    });
  }
};

export default {
  deviceDetection,
  iosOptimizations,
  touchOptimizations,
  performanceOptimizations,
  accessibilityEnhancements,
  initializeMobileOptimizations,
  mobileDebugTools
};