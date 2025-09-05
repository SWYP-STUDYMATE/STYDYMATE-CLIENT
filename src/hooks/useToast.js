import React, { useState } from 'react';
import ErrorToast from '../components/ErrorToast';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 5000, position = 'top-right') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, duration, position, isVisible: true };
    setToasts(prev => [...prev, newToast]);
  };

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <ErrorToast
          key={toast.id}
          {...toast}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </>
  );

  return {
    showToast,
    ToastContainer,
    showSuccess: (message, duration, position) => showToast(message, 'success', duration, position),
    showError: (message, duration, position) => showToast(message, 'error', duration, position),
    showWarning: (message, duration, position) => showToast(message, 'warning', duration, position),
    showInfo: (message, duration, position) => showToast(message, 'info', duration, position),
  };
}
