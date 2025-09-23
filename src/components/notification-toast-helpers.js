const dispatchToastEvent = (notification) => {
  const event = new CustomEvent('notification-received', {
    detail: {
      type: notification.type || 'personal',
      data: notification
    }
  });

  window.dispatchEvent(event);
};

export const showToast = (notification) => {
  dispatchToastEvent(notification);
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
