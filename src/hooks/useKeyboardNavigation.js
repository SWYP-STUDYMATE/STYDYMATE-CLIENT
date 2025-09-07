import { useEffect, useCallback, useRef } from 'react';

/**
 * 키보드 네비게이션 훅
 * @param {Object} options
 * @param {Function} options.onArrowUp - 위쪽 화살표 키 핸들러
 * @param {Function} options.onArrowDown - 아래쪽 화살표 키 핸들러
 * @param {Function} options.onArrowLeft - 왼쪽 화살표 키 핸들러
 * @param {Function} options.onArrowRight - 오른쪽 화살표 키 핸들러
 * @param {Function} options.onEnter - Enter 키 핸들러
 * @param {Function} options.onSpace - Space 키 핸들러
 * @param {Function} options.onEscape - Escape 키 핸들러
 * @param {Function} options.onTab - Tab 키 핸들러
 * @param {boolean} options.disabled - 비활성화 여부
 * @param {boolean} options.preventDefault - 기본 동작 방지 여부
 */
const useKeyboardNavigation = ({
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onSpace,
  onEscape,
  onTab,
  disabled = false,
  preventDefault = true
}) => {
  const elementRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    const { key, ctrlKey, altKey, shiftKey, metaKey } = e;

    // 수정키(Ctrl, Alt, Shift, Meta)와 함께 눌린 경우 무시
    if (ctrlKey || altKey || metaKey) return;

    let handled = false;

    switch (key) {
      case 'ArrowUp':
        if (onArrowUp) {
          onArrowUp(e);
          handled = true;
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          onArrowDown(e);
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          onArrowLeft(e);
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          onArrowRight(e);
          handled = true;
        }
        break;
      case 'Enter':
        if (onEnter) {
          onEnter(e);
          handled = true;
        }
        break;
      case ' ':
      case 'Space':
        if (onSpace) {
          onSpace(e);
          handled = true;
        }
        break;
      case 'Escape':
        if (onEscape) {
          onEscape(e);
          handled = true;
        }
        break;
      case 'Tab':
        if (onTab) {
          onTab(e, shiftKey);
          handled = true;
        }
        break;
    }

    if (handled && preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [
    onArrowUp, onArrowDown, onArrowLeft, onArrowRight,
    onEnter, onSpace, onEscape, onTab,
    disabled, preventDefault
  ]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return elementRef;
};

/**
 * 포커스 관리 훅
 * @param {Object} options
 * @param {Array} options.focusableElements - 포커스 가능한 요소들의 ref 배열
 * @param {number} options.initialIndex - 초기 포커스 인덱스
 * @param {boolean} options.loop - 순환 네비게이션 여부
 * @param {boolean} options.autoFocus - 자동 포커스 여부
 */
export const useFocusManagement = ({
  focusableElements = [],
  initialIndex = 0,
  loop = true,
  autoFocus = false
}) => {
  const currentIndexRef = useRef(initialIndex);

  // 다음 요소로 포커스 이동
  const focusNext = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1;
    
    if (nextIndex < focusableElements.length) {
      currentIndexRef.current = nextIndex;
    } else if (loop) {
      currentIndexRef.current = 0;
    }
    
    const elementToFocus = focusableElements[currentIndexRef.current]?.current;
    elementToFocus?.focus();
  }, [focusableElements, loop]);

  // 이전 요소로 포커스 이동
  const focusPrevious = useCallback(() => {
    const prevIndex = currentIndexRef.current - 1;
    
    if (prevIndex >= 0) {
      currentIndexRef.current = prevIndex;
    } else if (loop) {
      currentIndexRef.current = focusableElements.length - 1;
    }
    
    const elementToFocus = focusableElements[currentIndexRef.current]?.current;
    elementToFocus?.focus();
  }, [focusableElements, loop]);

  // 특정 인덱스로 포커스 이동
  const focusIndex = useCallback((index) => {
    if (index >= 0 && index < focusableElements.length) {
      currentIndexRef.current = index;
      const elementToFocus = focusableElements[index]?.current;
      elementToFocus?.focus();
    }
  }, [focusableElements]);

  // 첫 번째 요소로 포커스 이동
  const focusFirst = useCallback(() => {
    focusIndex(0);
  }, [focusIndex]);

  // 마지막 요소로 포커스 이동
  const focusLast = useCallback(() => {
    focusIndex(focusableElements.length - 1);
  }, [focusIndex, focusableElements.length]);

  // 초기 포커스 설정
  useEffect(() => {
    if (autoFocus && focusableElements.length > 0) {
      focusIndex(initialIndex);
    }
  }, [autoFocus, focusableElements, initialIndex, focusIndex]);

  return {
    focusNext,
    focusPrevious,
    focusIndex,
    focusFirst,
    focusLast,
    currentIndex: currentIndexRef.current
  };
};

/**
 * 모달 포커스 트랩 훅
 * @param {Object} options
 * @param {boolean} options.isOpen - 모달 열림 상태
 * @param {Function} options.onClose - 모달 닫기 함수
 */
export const useFocusTrap = ({ isOpen = false, onClose }) => {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(containerRef.current.querySelectorAll(focusableSelectors));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab (역방향)
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (정방향)
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  }, [isOpen, getFocusableElements, onClose]);

  useEffect(() => {
    if (isOpen) {
      // 현재 포커스된 요소 저장
      previousFocusRef.current = document.activeElement;
      
      // 첫 번째 포커스 가능한 요소로 포커스 이동
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
      
      // 키보드 이벤트 리스너 추가
      document.addEventListener('keydown', handleKeyDown);
    } else {
      // 이전에 포커스된 요소로 복원
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      
      // 키보드 이벤트 리스너 제거
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, getFocusableElements, handleKeyDown]);

  return containerRef;
};

export default useKeyboardNavigation;