import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class NotificationWebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.wsBase = import.meta.env.VITE_WS_URL || "https://api.languagemate.kr";
  }

  // WebSocket 연결 초기화
  connect() {
    if (this.client && this.isConnected) {
      console.log("Notification WebSocket already connected");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        reject(new Error("No access token found"));
        return;
      }

      const socketUrl = `${this.wsBase}/ws/notifications?token=${token}`;

      this.client = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          console.log("Notification STOMP Debug:", str);
        },
        onConnect: (frame) => {
          console.log("Notification WebSocket connected:", frame);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.setupDefaultSubscriptions();
          resolve(frame);
        },
        onStompError: (frame) => {
          console.error("Notification STOMP Error:", frame);
          this.isConnected = false;
          this.handleReconnection();
          reject(new Error(`STOMP Error: ${frame.headers.message}`));
        },
        onWebSocketClose: () => {
          console.log("Notification WebSocket connection closed");
          this.isConnected = false;
          this.handleReconnection();
        },
        onDisconnect: () => {
          console.log("Notification WebSocket disconnected");
          this.isConnected = false;
        }
      });

      this.client.activate();
    });
  }

  // 기본 구독 설정
  setupDefaultSubscriptions() {
    if (!this.client || !this.isConnected) {
      console.warn("Cannot setup subscriptions: client not connected");
      return;
    }

    // 개인 알림 구독
    this.subscribe('/user/queue/notifications', this.handlePersonalNotification.bind(this));
    
    // 시스템 알림 구독
    this.subscribe('/sub/system-notifications', this.handleSystemNotification.bind(this));
    
    // 긴급 알림 구독
    this.subscribe('/sub/urgent-notifications', this.handleUrgentNotification.bind(this));
    
    // 매칭 관련 알림 구독
    this.subscribe('/user/queue/matching-notifications', this.handleMatchingNotification.bind(this));
    
    // 세션 관련 알림 구독
    this.subscribe('/user/queue/session-notifications', this.handleSessionNotification.bind(this));
    
    // 채팅 관련 알림 구독 (채팅방 외부에서)
    this.subscribe('/user/queue/chat-notifications', this.handleChatNotification.bind(this));
  }

  // 구독 추가
  subscribe(destination, callback) {
    if (!this.client || !this.isConnected) {
      console.warn(`Cannot subscribe to ${destination}: client not connected`);
      return null;
    }

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error(`Error parsing message from ${destination}:`, error);
        }
      });

      this.subscriptions.set(destination, subscription);
      console.log(`Subscribed to: ${destination}`);
      return subscription;
    } catch (error) {
      console.error(`Failed to subscribe to ${destination}:`, error);
      return null;
    }
  }

  // 구독 해제
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`Unsubscribed from: ${destination}`);
    }
  }

  // 메시지 핸들러 등록
  registerMessageHandler(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  // 메시지 핸들러 제거
  unregisterMessageHandler(type) {
    this.messageHandlers.delete(type);
  }

  // 개인 알림 처리
  handlePersonalNotification(data) {
    console.log("Personal notification received:", data);
    this.processNotification(data, 'personal');
  }

  // 시스템 알림 처리
  handleSystemNotification(data) {
    console.log("System notification received:", data);
    this.processNotification(data, 'system');
  }

  // 긴급 알림 처리
  handleUrgentNotification(data) {
    console.log("Urgent notification received:", data);
    this.processNotification(data, 'urgent');
  }

  // 매칭 알림 처리
  handleMatchingNotification(data) {
    console.log("Matching notification received:", data);
    this.processNotification(data, 'matching');
  }

  // 세션 알림 처리
  handleSessionNotification(data) {
    console.log("Session notification received:", data);
    this.processNotification(data, 'session');
  }

  // 채팅 알림 처리
  handleChatNotification(data) {
    console.log("Chat notification received:", data);
    this.processNotification(data, 'chat');
  }

  // 알림 처리 공통 로직
  processNotification(data, type) {
    // 커스텀 핸들러가 등록되어 있다면 실행
    const customHandler = this.messageHandlers.get(type);
    if (customHandler) {
      customHandler(data);
    }

    // 전역 이벤트 발생
    const event = new CustomEvent('notification-received', {
      detail: {
        type,
        data,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);

    // 브라우저 알림 표시 (권한이 있는 경우)
    this.showBrowserNotification(data, type);
  }

  // 브라우저 알림 표시
  showBrowserNotification(data, type) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const title = data.title || '새로운 알림';
    const options = {
      body: data.message || data.content,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: `notification-${data.id || Date.now()}`,
      requireInteraction: type === 'urgent',
      data: {
        type,
        notificationId: data.id,
        url: data.clickUrl || '/'
      }
    };

    const notification = new Notification(title, options);
    
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      // 클릭 시 해당 URL로 이동
      if (options.data.url) {
        window.location.href = options.data.url;
      }
      
      notification.close();
    };

    // 일정 시간 후 자동으로 닫기 (긴급 알림은 제외)
    if (type !== 'urgent') {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  // 재연결 처리
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached for notification WebSocket");
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect notification WebSocket... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // 연결 해제
  disconnect() {
    if (this.client) {
      console.log("Disconnecting notification WebSocket");
      
      // 모든 구독 해제
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // 연결 상태 확인
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptionsCount: this.subscriptions.size,
      handlersCount: this.messageHandlers.size
    };
  }

  // 수동으로 알림 읽음 처리 메시지 전송
  markAsRead(notificationId) {
    if (!this.client || !this.isConnected) {
      console.warn("Cannot send read notification: client not connected");
      return;
    }

    this.client.publish({
      destination: '/pub/notifications/mark-read',
      body: JSON.stringify({ notificationId })
    });
  }

  // 알림 설정 업데이트 메시지 전송
  updateNotificationSettings(settings) {
    if (!this.client || !this.isConnected) {
      console.warn("Cannot update notification settings: client not connected");
      return;
    }

    this.client.publish({
      destination: '/pub/notifications/update-settings',
      body: JSON.stringify(settings)
    });
  }
}

// 전역 인스턴스
const notificationWebSocketService = new NotificationWebSocketService();

// 초기화 함수
export const initializeNotificationWebSocket = async () => {
  try {
    await notificationWebSocketService.connect();
    console.log("Notification WebSocket initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize notification WebSocket:", error);
    return false;
  }
};

// 연결 해제
export const disconnectNotificationWebSocket = () => {
  notificationWebSocketService.disconnect();
};

// 메시지 핸들러 등록
export const registerNotificationHandler = (type, handler) => {
  notificationWebSocketService.registerMessageHandler(type, handler);
};

// 메시지 핸들러 제거
export const unregisterNotificationHandler = (type) => {
  notificationWebSocketService.unregisterMessageHandler(type);
};

// 연결 상태 확인
export const getNotificationWebSocketStatus = () => {
  return notificationWebSocketService.getConnectionStatus();
};

// 알림 읽음 처리
export const markNotificationAsReadViaWebSocket = (notificationId) => {
  notificationWebSocketService.markAsRead(notificationId);
};

// 알림 설정 업데이트
export const updateNotificationSettingsViaWebSocket = (settings) => {
  notificationWebSocketService.updateNotificationSettings(settings);
};

export default notificationWebSocketService;