import React from 'react';
import Toast from './ui/Toast';
import useToastStore from '../store/toastStore';

/**
 * Toast 컨테이너 - 모든 Toast를 렌더링
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="animate-slide-in-right"
          style={{
            animationDelay: `${index * 50}ms`
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
