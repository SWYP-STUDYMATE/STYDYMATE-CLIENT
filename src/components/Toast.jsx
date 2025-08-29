import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ 
  id,
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  position = 'top-right',
  onClose,
  actions = []
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (!isVisible) return null;

  return createPortal(
    <div
      className={`fixed z-50 max-w-sm w-full ${getPositionClasses()} ${
        isLeaving ? 'animate-slide-out' : 'animate-slide-in'
      }`}
    >
      <div className={`rounded-lg border p-4 shadow-lg ${getBgColor()}`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {title}
              </h4>
            )}
            {message && (
              <p className="text-sm text-gray-700">{message}</p>
            )}
            
            {actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      handleClose();
                    }}
                    className="text-xs font-medium px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Toast Manager 컴포넌트
let toastId = 0;

export const ToastManager = () => {
  const [toasts, setToasts] = useState([]);

  // 전역 toast 함수들을 window에 등록
  useEffect(() => {
    window.addToast = (toastData) => {
      const id = ++toastId;
      const toast = { id, ...toastData };
      setToasts(prev => [...prev, toast]);
      return id;
    };

    window.removeToast = (id) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    window.clearAllToasts = () => {
      setToasts([]);
    };

    return () => {
      delete window.addToast;
      delete window.removeToast;
      delete window.clearAllToasts;
    };
  }, []);

  const handleToastClose = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={handleToastClose}
        />
      ))}
    </>
  );
};

// 편의 함수들
export const toast = {
  success: (title, message, options = {}) => {
    return window.addToast?.({ type: 'success', title, message, ...options });
  },
  error: (title, message, options = {}) => {
    return window.addToast?.({ type: 'error', title, message, ...options });
  },
  warning: (title, message, options = {}) => {
    return window.addToast?.({ type: 'warning', title, message, ...options });
  },
  info: (title, message, options = {}) => {
    return window.addToast?.({ type: 'info', title, message, ...options });
  },
  custom: (options) => {
    return window.addToast?.(options);
  }
};

export default Toast;