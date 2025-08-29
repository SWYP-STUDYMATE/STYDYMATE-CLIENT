import { registerPushToken, unregisterPushToken } from '../api/notifications';

class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Service Worker 등록
  async registerServiceWorker() {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // 알림 권한 요청
  async requestPermission() {
    if (!this.isSupported) {
      return 'unsupported';
    }

    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return 'unsupported';
  }

  // 현재 권한 상태 확인
  getPermissionStatus() {
    if (!this.isSupported) {
      return 'unsupported';
    }

    return Notification.permission;
  }

  // 푸시 구독 생성
  async subscribeToPush() {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Push notification permission denied');
    }

    try {
      // VAPID 공개 키 (실제 서비스에서는 환경변수로 관리)
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 
        'BEl62iUYgUivxIkv69yViEuiBIa40HI9stpCmHYWFiOqGdALABdJDgMAuWr6z-xIgXm6Z96hMkgp3XOKx5yHNO4';

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      // 서버에 구독 정보 전송
      await this.sendSubscriptionToServer();

      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // 푸시 구독 해제
  async unsubscribeFromPush() {
    if (!this.subscription) {
      return;
    }

    try {
      // 서버에서 구독 정보 제거
      await this.removeSubscriptionFromServer();

      // 브라우저에서 구독 해제
      await this.subscription.unsubscribe();
      this.subscription = null;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  // 서버에 구독 정보 전송
  async sendSubscriptionToServer() {
    if (!this.subscription) {
      throw new Error('No subscription available');
    }

    try {
      const subscriptionObject = this.subscription.toJSON();
      await registerPushToken(subscriptionObject, 'web');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  // 서버에서 구독 정보 제거
  async removeSubscriptionFromServer() {
    if (!this.subscription) {
      return;
    }

    try {
      const subscriptionObject = this.subscription.toJSON();
      await unregisterPushToken(subscriptionObject);
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      throw error;
    }
  }

  // 기존 구독 상태 확인
  async getExistingSubscription() {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    this.subscription = await this.registration.pushManager.getSubscription();
    return this.subscription;
  }

  // 로컬 알림 표시 (테스트용)
  showNotification(title, options = {}) {
    if (!this.isSupported || Notification.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted');
      return;
    }

    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'studymate-notification',
      renotify: true,
      requireInteraction: false,
      ...options
    };

    return this.registration.showNotification(title, defaultOptions);
  }

  // VAPID 키 변환 유틸리티
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // 알림 상태 정보
  getStatus() {
    return {
      isSupported: this.isSupported,
      permission: this.getPermissionStatus(),
      isSubscribed: !!this.subscription,
      hasServiceWorker: !!this.registration
    };
  }
}

// 전역 인스턴스
const pushNotificationService = new PushNotificationService();

// 초기화 함수
export const initializePushNotifications = async () => {
  try {
    if (pushNotificationService.isSupported) {
      await pushNotificationService.getExistingSubscription();
      
      // 이미 구독되어 있다면 서버에 토큰 갱신
      if (pushNotificationService.subscription) {
        await pushNotificationService.sendSubscriptionToServer();
      }
    }
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
};

// 푸시 알림 활성화
export const enablePushNotifications = async () => {
  try {
    await pushNotificationService.subscribeToPush();
    return { success: true, message: '푸시 알림이 활성화되었습니다.' };
  } catch (error) {
    console.error('Failed to enable push notifications:', error);
    return { 
      success: false, 
      message: error.message || '푸시 알림 활성화에 실패했습니다.' 
    };
  }
};

// 푸시 알림 비활성화
export const disablePushNotifications = async () => {
  try {
    await pushNotificationService.unsubscribeFromPush();
    return { success: true, message: '푸시 알림이 비활성화되었습니다.' };
  } catch (error) {
    console.error('Failed to disable push notifications:', error);
    return { 
      success: false, 
      message: error.message || '푸시 알림 비활성화에 실패했습니다.' 
    };
  }
};

// 푸시 알림 상태 확인
export const getPushNotificationStatus = () => {
  return pushNotificationService.getStatus();
};

// 테스트 알림 표시
export const showTestNotification = (title = '테스트 알림', message = 'STUDYMATE 알림이 정상적으로 작동합니다.') => {
  return pushNotificationService.showNotification(title, {
    body: message,
    icon: '/icon-192x192.png',
    tag: 'test-notification',
    data: {
      type: 'test',
      url: '/'
    }
  });
};

export default pushNotificationService;