import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getUnreadNotificationCount } from '../api/notifications';

const NotificationBadge = ({ 
  className = "",
  size = "md",
  showZero = false,
  onClick,
  refreshInterval = 30000 // 30초마다 업데이트
}) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    
    // 정기적으로 읽지 않은 알림 수 업데이트
    const interval = setInterval(loadUnreadCount, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // 페이지 포커스 시에도 업데이트
  useEffect(() => {
    const handleFocus = () => {
      loadUnreadCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/notifications');
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'w-8 h-8',
          icon: 'w-4 h-4',
          badge: 'w-4 h-4 text-xs',
          badgeOffset: '-top-1 -right-1'
        };
      case 'lg':
        return {
          button: 'w-12 h-12',
          icon: 'w-6 h-6',
          badge: 'w-6 h-6 text-sm',
          badgeOffset: '-top-2 -right-2'
        };
      case 'md':
      default:
        return {
          button: 'w-10 h-10',
          icon: 'w-5 h-5',
          badge: 'w-5 h-5 text-xs',
          badgeOffset: '-top-1.5 -right-1.5'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const shouldShowBadge = unreadCount > 0 || showZero;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleClick}
        className={`${sizeClasses.button} flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors relative`}
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개의 읽지 않은 알림)` : ''}`}
      >
        <Bell className={`${sizeClasses.icon} text-[#111111] ${loading ? 'animate-pulse' : ''}`} />
        
        {shouldShowBadge && (
          <div
            className={`absolute ${sizeClasses.badgeOffset} ${sizeClasses.badge} bg-red-500 text-white rounded-full flex items-center justify-center font-bold leading-none z-10`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
        
        {/* 새로운 알림이 있을 때 애니메이션 효과 */}
        {unreadCount > 0 && (
          <div className={`absolute ${sizeClasses.badgeOffset} ${sizeClasses.badge} bg-red-500 rounded-full animate-ping opacity-75`}></div>
        )}
      </button>
    </div>
  );
};

export default NotificationBadge;