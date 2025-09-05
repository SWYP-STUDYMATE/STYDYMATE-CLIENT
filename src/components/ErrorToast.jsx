import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const ErrorToast = ({ 
  type = 'error', 
  message, 
  isVisible, 
  onClose, 
  duration = 5000,
  position = 'top-right'
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      if (duration > 0) {
        const timer = setTimeout(() => {
          setShow(false);
          setTimeout(onClose, 300); // 애니메이션 완료 후 제거
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'error':
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'error':
      default:
        return 'border-red-200 bg-red-50 text-red-800';
    }
  };

  const getPositionStyles = () => {
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

  return (
    <div
      className={`fixed z-50 ${getPositionStyles()} transform transition-all duration-300 ease-in-out ${
        show 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-2 opacity-0 scale-95'
      }`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div
        className={`
          min-w-[300px] max-w-[400px] p-4 rounded-lg border shadow-lg
          ${getTypeStyles()}
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5">
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setShow(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 p-1 -m-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
            aria-label="토스트 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// // 토스트 관리 Hook
// export const useToast = () => {
//   const [toasts, setToasts] = useState([]);

//   const showToast = (message, type = 'info', duration = 5000, position = 'top-right') => {
//     const id = Math.random().toString(36).substr(2, 9);
//     const newToast = { id, message, type, duration, position, isVisible: true };
    
//     setToasts(prev => [...prev, newToast]);
//   };

//   const hideToast = (id) => {
//     setToasts(prev => prev.filter(toast => toast.id !== id));
//   };

//   const ToastContainer = () => (
//     <>
//       {toasts.map(toast => (
//         <ErrorToast
//           key={toast.id}
//           {...toast}
//           onClose={() => hideToast(toast.id)}
//         />
//       ))}
//     </>
//   );

//   return {
//     showToast,
//     ToastContainer,
//     showSuccess: (message, duration, position) => showToast(message, 'success', duration, position),
//     showError: (message, duration, position) => showToast(message, 'error', duration, position),
//     showWarning: (message, duration, position) => showToast(message, 'warning', duration, position),
//     showInfo: (message, duration, position) => showToast(message, 'info', duration, position)
//   };
// };

export default ErrorToast;