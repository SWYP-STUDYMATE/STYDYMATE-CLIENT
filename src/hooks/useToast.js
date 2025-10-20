import { useState, useCallback } from 'react';

/**
 * Toast 알림을 관리하는 커스텀 훅
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();

    setToasts(prev => [...prev, {
      id,
      message,
      type,
      duration
    }]);

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration || 5000);
  }, [showToast]);

  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration || 3000);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration || 4000);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    return showToast(message, 'info', duration || 3000);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    error,
    success,
    warning,
    info
  };
}
