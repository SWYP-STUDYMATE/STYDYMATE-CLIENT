import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, MessageSquare, Users, Calendar, Award, AlertCircle, Info } from 'lucide-react';

// 토스트 타입별 아이콘 맵핑
const typeIcons = {
  chat: MessageSquare,
  matching: Users,
  session: Calendar,
  achievement: Award,
  system: Info,
  urgent: AlertCircle,
  personal: Bell
};

// 토스트 타입별 색상 맵핑
const typeColors = {
  chat: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
  matching: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' },
  session: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600' },
  achievement: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-600' },
  system: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', icon: 'text-gray-600' },
  urgent: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' },
  personal: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', icon: 'text-indigo-600' }
};

const NotificationToast = ({ 
  notification, 
  onClose, 
  onAction, 
  autoClose = true, 
  duration = 5000,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  const type = notification.type || 'personal';
  const Icon = typeIcons[type] || Bell;
  const colors = typeColors[type] || typeColors.personal;

  useEffect(() => {
    // 애니메이션을 위한 지연
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    
    // 자동 닫기
    let autoCloseTimer;
    if (autoClose && type !== 'urgent') {
      autoCloseTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(showTimer);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [autoClose, duration, type]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = () => {
    if (notification.clickUrl) {
      window.location.href = notification.clickUrl;
    } else if (onAction) {
      onAction(notification);
    }
    handleClose();
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

  const getAnimationClasses = () => {
    const isTopPosition = position.includes('top');
    const baseClasses = `transform transition-all duration-300 ease-out`;
    
    if (!isVisible || isExiting) {
      if (position.includes('right')) {
        return `${baseClasses} translate-x-full opacity-0`;
      } else if (position.includes('left')) {
        return `${baseClasses} -translate-x-full opacity-0`;
      } else if (isTopPosition) {
        return `${baseClasses} -translate-y-full opacity-0`;
      } else {
        return `${baseClasses} translate-y-full opacity-0`;
      }
    }
    
    return `${baseClasses} translate-x-0 translate-y-0 opacity-100`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return createPortal(
    <div
      className={`fixed z-50 ${getPositionClasses()} ${getAnimationClasses()}`}
      style={{ maxWidth: '400px', minWidth: '320px' }}
    >
      <div
        className={`
          ${colors.bg} ${colors.border} border-2 rounded-lg p-4 shadow-lg backdrop-blur-sm
          ${notification.clickUrl || onAction ? 'cursor-pointer hover:shadow-xl' : ''}
          relative overflow-hidden
        `}
        onClick={handleClick}
        role={notification.clickUrl || onAction ? 'button' : 'alert'}
        tabIndex={notification.clickUrl || onAction ? 0 : undefined}
      >
        {/* 우선순위 표시 바 */}
        {type === 'urgent' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        )}
        
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0`} />
            <span className={`font-medium ${colors.text} text-sm`}>
              {notification.category || '알림'}
            </span>
            {notification.createdAt && (
              <span className="text-xs text-gray-500">
                {formatTime(notification.createdAt)}
              </span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className={`${colors.icon} hover:bg-gray-200 rounded-full p-1 transition-colors flex-shrink-0`}
            aria-label="알림 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* 제목 */}
        {notification.title && (
          <h3 className={`font-semibold ${colors.text} text-sm mb-1 leading-tight`}>
            {notification.title}
          </h3>
        )}
        
        {/* 내용 */}
        <p className={`${colors.text} text-sm leading-relaxed mb-2 opacity-90`}>
          {notification.message || notification.content}
        </p>
        
        {/* 액션 버튼들 */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex space-x-2 mt-3">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  if (action.handler) {
                    action.handler(notification);
                  }
                  if (action.closeAfter !== false) {
                    handleClose();
                  }
                }}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${action.primary 
                    ? `bg-[#00C471] text-white hover:bg-[#00B267]`
                    : `${colors.text} bg-white hover:bg-gray-50 border border-gray-200`
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        
        {/* 진행 바 (자동 닫기 시) */}
        {autoClose && type !== 'urgent' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div
              className={`h-full ${colors.icon.replace('text-', 'bg-')} transition-all ease-linear`}
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear`
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default NotificationToast;