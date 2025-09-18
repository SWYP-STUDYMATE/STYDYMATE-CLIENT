import api from './index.js';

const extractData = (response) => response?.data?.data ?? response?.data;

// 알림 목록 조회
export const getNotifications = async (options = {}) => {
  try {
    const {
      page = 1,
      size = 20,
      category = null,
      type = null,
      isRead = null,
      unreadOnly = false
    } = options;

    const params = { page, size };
    const effectiveCategory = category ?? type;
    if (effectiveCategory) params.category = effectiveCategory;
    if (isRead !== null) params.isRead = isRead;
    if (unreadOnly) params.unreadOnly = true;

    const response = await api.get('/notifications', { params });
    return extractData(response);
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

// 특정 알림 조회
export const getNotification = async (notificationId) => {
  try {
    const response = await api.get(`/notifications/${notificationId}`);
    return extractData(response);
  } catch (error) {
    console.error('Get notification error:', error);
    throw error;
  }
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return extractData(response);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

// 모든 알림 읽음 처리
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch('/notifications/read-all');
    return extractData(response);
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
};

// 알림 삭제
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return extractData(response);
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
};

// 여러 알림 삭제
export const deleteNotifications = async (notificationIds) => {
  try {
    const response = await api.delete('/notifications/batch', {
      data: { notificationIds }
    });
    return extractData(response);
  } catch (error) {
    console.error('Delete notifications error:', error);
    throw error;
  }
};

// 읽지 않은 알림 개수 조회
export const getUnreadNotificationCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return extractData(response);
  } catch (error) {
    console.error('Get unread notification count error:', error);
    throw error;
  }
};

// 알림 설정 조회
export const getNotificationSettings = async () => {
  try {
    const response = await api.get('/notifications/settings');
    return extractData(response);
  } catch (error) {
    console.error('Get notification settings error:', error);
    throw error;
  }
};

// 알림 설정 업데이트
export const updateNotificationSettings = async (settings) => {
  try {
    const response = await api.patch('/notifications/settings', {
      pushNotifications: settings.pushNotifications,
      emailNotifications: settings.emailNotifications,
      smsNotifications: settings.smsNotifications,
      inAppNotifications: settings.inAppNotifications,
      matchRequestNotifications: settings.matchRequestNotifications,
      sessionReminderNotifications: settings.sessionReminderNotifications,
      chatMessageNotifications: settings.chatMessageNotifications,
      systemNotifications: settings.systemNotifications,
      marketingNotifications: settings.marketingNotifications,
      quietHours: settings.quietHours, // { start: "22:00", end: "08:00" }
      notificationSound: settings.notificationSound,
      vibration: settings.vibration
    });
    return extractData(response);
  } catch (error) {
    console.error('Update notification settings error:', error);
    throw error;
  }
};

// 푸시 토큰 등록
export const registerPushToken = async (token, deviceType = 'web') => {
  try {
    const response = await api.post('/notifications/push-token', {
      token,
      deviceType, // 'web', 'ios', 'android'
      userAgent: navigator.userAgent
    });
    return extractData(response);
  } catch (error) {
    console.error('Register push token error:', error);
    throw error;
  }
};

// 푸시 토큰 제거
export const unregisterPushToken = async (token) => {
  try {
    const response = await api.delete('/notifications/push-token', {
      data: { token }
    });
    return extractData(response);
  } catch (error) {
    console.error('Unregister push token error:', error);
    throw error;
  }
};

// 알림 테스트 전송
export const sendTestNotification = async (type = 'test') => {
  try {
    const response = await api.post('/notifications/test', {
      type,
      message: '테스트 알림입니다.'
    });
    return extractData(response);
  } catch (error) {
    console.error('Send test notification error:', error);
    throw error;
  }
};

// 알림 구독 관리
export const subscribeToNotifications = async (topics) => {
  try {
    const response = await api.post('/notifications/subscribe', {
      topics // ['matches', 'sessions', 'chats', 'system']
    });
    return extractData(response);
  } catch (error) {
    console.error('Subscribe to notifications error:', error);
    throw error;
  }
};

// 알림 구독 해제
export const unsubscribeFromNotifications = async (topics) => {
  try {
    const response = await api.post('/notifications/unsubscribe', {
      topics
    });
    return extractData(response);
  } catch (error) {
    console.error('Unsubscribe from notifications error:', error);
    throw error;
  }
};

// 알림 카테고리별 설정 조회
export const getNotificationCategories = async () => {
  try {
    const response = await api.get('/notifications/categories');
    return extractData(response);
  } catch (error) {
    console.error('Get notification categories error:', error);
    throw error;
  }
};

// 알림 히스토리 조회
export const getNotificationHistory = async (page = 1, size = 50) => {
  try {
    const response = await api.get('/notifications/history', {
      params: { page, size }
    });
    return extractData(response);
  } catch (error) {
    console.error('Get notification history error:', error);
    throw error;
  }
};

// 긴급 알림 전송 (관리자용)
export const sendUrgentNotification = async (recipients, notification) => {
  try {
    const response = await api.post('/notifications/urgent', {
      recipients, // ['userId1', 'userId2'] or 'all'
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: 'high',
      expiresAt: notification.expiresAt
    });
    return extractData(response);
  } catch (error) {
    console.error('Send urgent notification error:', error);
    throw error;
  }
};

// 예약 알림 설정
export const scheduleNotification = async (notification, scheduledAt) => {
  try {
    const response = await api.post('/notifications/schedule', {
      title: notification.title,
      message: notification.message,
      type: notification.type,
      data: notification.data,
      scheduledAt,
      recurring: notification.recurring // { type: 'daily', interval: 1, endDate: '2024-12-31' }
    });
    return extractData(response);
  } catch (error) {
    console.error('Schedule notification error:', error);
    throw error;
  }
};

// 예약 알림 취소
export const cancelScheduledNotification = async (scheduledNotificationId) => {
  try {
    const response = await api.delete(`/notifications/scheduled/${scheduledNotificationId}`);
    return extractData(response);
  } catch (error) {
    console.error('Cancel scheduled notification error:', error);
    throw error;
  }
};

// 예약된 알림 목록 조회
export const getScheduledNotifications = async (page = 1, size = 20) => {
  try {
    const response = await api.get('/notifications/scheduled', {
      params: { page, size }
    });
    return extractData(response);
  } catch (error) {
    console.error('Get scheduled notifications error:', error);
    throw error;
  }
};
