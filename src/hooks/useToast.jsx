import { useState, useCallback, useMemo } from 'react';
import ErrorToast from '../components/ErrorToast.jsx';

const createToast = (overrides = {}) => ({
  id: Math.random().toString(36).slice(2, 11),
  type: 'info',
  duration: 5000,
  position: 'top-right',
  isVisible: true,
  ...overrides,
});

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 5000, position = 'top-right') => {
    setToasts((prev) => [
      ...prev,
      createToast({ message, type, duration, position }),
    ]);
  }, []);

  const ToastContainer = useCallback(() => (
    <>
      {toasts.map((toast) => (
        <ErrorToast
          key={toast.id}
          {...toast}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </>
  ), [toasts, hideToast]);

  const helpers = useMemo(() => ({
    showSuccess: (message, duration, position) => showToast(message, 'success', duration, position),
    showError: (message, duration, position) => showToast(message, 'error', duration, position),
    showWarning: (message, duration, position) => showToast(message, 'warning', duration, position),
    showInfo: (message, duration, position) => showToast(message, 'info', duration, position),
  }), [showToast]);

  return {
    showToast,
    ToastContainer,
    ...helpers,
  };
}
