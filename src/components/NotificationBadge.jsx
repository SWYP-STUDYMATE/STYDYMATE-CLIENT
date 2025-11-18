import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import useNotificationStore from '../store/notificationStore';

const NotificationBadge = ({
  className = "",
  size = "md",
  showZero = false,
  onClick,
  refreshInterval = 30000 // 30초마다 업데이트
}) => {
  console.count('[NotificationBadge] render');
  const navigate = useNavigate();

  // ⚠️ CRITICAL: Zustand selector 무한 루프 방지 패턴
  //
  // ❌ 절대 사용 금지:
  // const { unreadCount, loading } = useNotificationStore(
  //   (state) => ({ unreadCount: state.unreadCount, loading: state.loading }),
  //   shallow
  // );
  // → 매 렌더링마다 새 객체 생성 → shallow 비교 무의미 → 무한 루프
  //
  // ✅ 올바른 방법: 각 값을 개별적으로 선택
  // → Primitive 값 반환 → 참조 안정적 → 값 변경 시에만 리렌더링
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const loading = useNotificationStore((state) => state.loading);
  const loadUnreadCount = useNotificationStore((state) => state.loadUnreadCount);

  useEffect(() => {
    const invoke = () => {
      const loader = useNotificationStore.getState().loadUnreadCount;
      if (typeof loader === 'function') {
        loader();
      } else {
        console.warn('[NotificationBadge] loadUnreadCount is not available when invoked');
      }
    };

    invoke();

    const interval = setInterval(invoke, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // 페이지 포커스 시에도 업데이트
  useEffect(() => {
    const handleFocus = () => {
      const loader = useNotificationStore.getState().loadUnreadCount;
      if (typeof loader === 'function') {
        loader();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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
