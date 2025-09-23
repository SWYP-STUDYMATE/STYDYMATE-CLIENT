import React, { useState, useEffect, useCallback } from 'react';
import NotificationToast from './NotificationToast';
import useNotificationStore from '../store/notificationStore';

const NotificationToastManager = ({ maxToasts = 5, position = 'top-right' }) => {
  const [toasts, setToasts] = useState([]);
  const { realtimeSettings } = useNotificationStore();

  // 알림 사운드 재생
  const playNotificationSound = useCallback((type) => {
    try {
      let audioFile = '/sounds/notification-default.mp3';

      switch (type) {
        case 'urgent':
          audioFile = '/sounds/notification-urgent.mp3';
          break;
        case 'chat':
          audioFile = '/sounds/notification-chat.mp3';
          break;
        case 'matching':
          audioFile = '/sounds/notification-matching.mp3';
          break;
        case 'session':
          audioFile = '/sounds/notification-session.mp3';
          break;
        case 'achievement':
          audioFile = '/sounds/notification-achievement.mp3';
          break;
      }

      const audio = new Audio(audioFile);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // 오디오 재생 실패 시 기본 사운드로 대체
        const fallbackAudio = new Audio('/sounds/notification-default.mp3');
        fallbackAudio.volume = 0.3;
        fallbackAudio.play().catch(() => {
          // 모든 사운드 재생 실패 - 무시
          console.warn('Could not play notification sound');
        });
      });
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }, []);

  // 토스트 추가
  const addToast = useCallback((notification) => {
    const toastId = `toast-${notification.id || Date.now()}-${Math.random()}`;
    const newToast = {
      id: toastId,
      ...notification,
      timestamp: Date.now()
    };

    setToasts(prev => {
      // 중복 방지 - 같은 알림 ID가 이미 있으면 추가하지 않음
      if (notification.id && prev.some(toast => toast.id === notification.id)) {
        return prev;
      }

      // 최대 개수 제한
      const updated = [newToast, ...prev.slice(0, maxToasts - 1)];
      return updated;
    });

    // 사운드 재생
    if (realtimeSettings.sound) {
      playNotificationSound(notification.type);
    }

    return toastId;
  }, [maxToasts, realtimeSettings.sound, playNotificationSound]);

  // 토스트 제거
  const removeToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  // 모든 토스트 제거
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 특정 타입의 토스트들 제거
  const clearToastsByType = useCallback((type) => {
    setToasts(prev => prev.filter(toast => toast.type !== type));
  }, []);

  // WebSocket에서 받은 알림 처리
  useEffect(() => {
    const handleNotificationReceived = (event) => {
      const { type, data } = event.detail;
      
      // 데스크탑 토스트 설정이 비활성화된 경우 무시
      if (!realtimeSettings.desktopToast) {
        return;
      }

      // 우선순위가 높은 알림은 항상 표시
      if (type === 'urgent' || data.priority === 'high') {
        addToast(data);
        return;
      }

      // 일반 알림은 설정에 따라 처리
      if (realtimeSettings.browserNotifications) {
        addToast(data);
      }
    };

    window.addEventListener('notification-received', handleNotificationReceived);
    
    return () => {
      window.removeEventListener('notification-received', handleNotificationReceived);
    };
  }, [addToast, realtimeSettings]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + Shift + C: 모든 토스트 닫기
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        clearAllToasts();
      }
      
      // Escape: 가장 최근 토스트 닫기
      if (event.key === 'Escape' && toasts.length > 0) {
        removeToast(toasts[0].id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toasts, clearAllToasts, removeToast]);

  // 토스트 액션 핸들러
  const handleToastAction = useCallback((notification) => {
    if (notification.clickUrl) {
      window.location.href = notification.clickUrl;
    } else if (notification.onAction) {
      notification.onAction(notification);
    }
  }, []);

  // 위치에 따른 토스트 스택 순서 조정
  const orderedToasts = position.includes('bottom') ? [...toasts].reverse() : toasts;
  
  // 위치에 따른 간격 계산
  const getToastOffset = (index) => {
    const spacing = 16; // 16px 간격
    const toastHeight = 100; // 예상 토스트 높이
    return (toastHeight + spacing) * index;
  };

  return (
    <>
      {orderedToasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            [position.includes('bottom') ? 'bottom' : 'top']: 
              `${16 + getToastOffset(index)}px`,
            [position.includes('left') ? 'left' : 'right']: '16px',
            ...(position.includes('center') && {
              left: '50%',
              transform: 'translateX(-50%)'
            })
          }}
          className="fixed z-50"
        >
          <NotificationToast
            notification={toast}
            onClose={() => removeToast(toast.id)}
            onAction={handleToastAction}
            autoClose={toast.type !== 'urgent'}
            duration={toast.type === 'urgent' ? 0 : 5000}
            position="relative" // 개별 토스트는 이미 위치가 설정됨
          />
        </div>
      ))}
      
      {/* 토스트가 너무 많을 때 "모두 닫기" 버튼 표시 */}
      {toasts.length >= 3 && (
        <div
          className={`fixed z-50 ${
            position.includes('right') ? 'right-4' : 
            position.includes('left') ? 'left-4' : 
            'left-1/2 transform -translate-x-1/2'
          } ${
            position.includes('bottom') 
              ? `bottom-${16 + getToastOffset(toasts.length)}px`
              : `top-${16 + getToastOffset(toasts.length)}px`
          }`}
        >
          <button
            onClick={clearAllToasts}
            className="bg-gray-800 text-white text-xs px-3 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          >
            모든 알림 닫기 ({toasts.length})
          </button>
        </div>
      )}
    </>
  );
};

// 수동으로 토스트 추가하는 유틸리티 함수들
export const showToast = (notification) => {
  const event = new CustomEvent('notification-received', {
    detail: {
      type: notification.type || 'personal',
      data: notification
    }
  });
  window.dispatchEvent(event);
};

export const showSuccessToast = (message, title = '성공') => {
  showToast({
    type: 'system',
    title,
    message,
    category: '시스템',
    priority: 'normal'
  });
};

export const showErrorToast = (message, title = '오류') => {
  showToast({
    type: 'urgent',
    title,
    message,
    category: '오류',
    priority: 'high'
  });
};

export const showInfoToast = (message, title = '정보') => {
  showToast({
    type: 'system',
    title,
    message,
    category: '정보',
    priority: 'normal'
  });
};

export const showMatchingToast = (message, title = '매칭', actions = []) => {
  showToast({
    type: 'matching',
    title,
    message,
    category: '매칭',
    priority: 'normal',
    actions
  });
};

export const showChatToast = (message, title = '채팅', roomId = null) => {
  showToast({
    type: 'chat',
    title,
    message,
    category: '채팅',
    priority: 'normal',
    clickUrl: roomId ? `/chat/${roomId}` : '/chat'
  });
};

export const showSessionToast = (message, title = '세션', sessionId = null) => {
  showToast({
    type: 'session',
    title,
    message,
    category: '세션',
    priority: 'normal',
    clickUrl: sessionId ? `/session/${sessionId}` : '/main'
  });
};

export const showAchievementToast = (message, title = '달성') => {
  showToast({
    type: 'achievement',
    title,
    message,
    category: '성취',
    priority: 'normal',
    clickUrl: '/profile'
  });
};

export default NotificationToastManager;
