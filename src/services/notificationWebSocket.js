import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import useNotificationStore from "../store/notificationStore";
import { getToken } from "../utils/tokenStorage";

class NotificationWebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelayBase = 2000; // 초기 재연결 지연 시간 (2초)
    this.reconnectDelayMax = 60000; // 최대 재연결 지연 시간 (60초)
    this.reconnectTimeout = null; // 재연결 타임아웃 관리
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.fallbackInterval = null;
    this.fallbackPollInterval = 30000;
    const origin = import.meta.env.VITE_WS_URL
      || import.meta.env.VITE_API_URL
      || import.meta.env.VITE_WORKERS_API_URL
      || "https://api.languagemate.kr";

    this.wsBase = this.normalizeWebSocketBase(origin);

    // 🔄 토큰 갱신 이벤트 리스너 등록
    if (typeof window !== 'undefined') {
      window.addEventListener('token-refreshed', this.handleTokenRefresh.bind(this));
      console.log("🔄 WebSocket: token-refreshed event listener registered");
    }
  }

  // 🔄 토큰 갱신 시 WebSocket 재연결
  handleTokenRefresh() {
    console.log("🔄 WebSocket: Token refreshed, reconnecting...");

    // 기존 연결이 있다면 정리
    if (this.client && this.isConnected) {
      console.log("🔄 WebSocket: Disconnecting old connection");
      this.disconnect();
    }

    // 재연결 시도 카운트 초기화
    this.reconnectAttempts = 0;

    // 새 토큰으로 재연결
    this.connect().catch((error) => {
      console.error("🔄 WebSocket: Failed to reconnect after token refresh", error);
    });
  }

  normalizeWebSocketBase(origin) {
    if (!origin) return "";

    try {
      const baseUrl = new URL(origin, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      if (baseUrl.protocol === 'http:') {
        baseUrl.protocol = 'ws:';
      } else if (baseUrl.protocol === 'https:') {
        baseUrl.protocol = 'wss:';
      }
      return baseUrl.href.replace(/\/?$/, '');
    } catch (error) {
      console.warn('Failed to normalize WebSocket base, falling back to string replace', { origin, error });
      return origin
        .replace(/^https?:\/\//i, (match) => (match.toLowerCase() === 'https://' ? 'wss://' : 'ws://'))
        .replace(/\/?$/, '');
    }
  }

  // WebSocket 연결 초기화
  connect() {
    if (this.client && this.isConnected) {
      console.log("Notification WebSocket already connected");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // 토큰은 webSocketFactory 내부에서 매번 동적으로 가져옴
      this.client = new Client({
        webSocketFactory: () => {
          // 매 연결 시마다 최신 토큰으로 URL 생성
          const token = getToken("accessToken");
          if (!token) {
            throw new Error("No access token found");
          }
          const socketUrl = this.buildSocketUrl(token);
          console.log("🔄 Creating WebSocket with fresh token");
          return this.createTransport(socketUrl);
        },
        connectHeaders: {
          get Authorization() {
            // 연결 헤더도 동적으로 토큰 가져옴
            const token = getToken("accessToken");
            return token ? `Bearer ${token}` : "";
          }
        },
        debug: (str) => {
          console.log("Notification STOMP Debug:", str);
        },
        onConnect: (frame) => {
          console.log("Notification WebSocket connected:", frame);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.stopFallbackPolling();
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

  buildSocketUrl(token) {
    const rawBase = this.wsBase || '';
    // 환경 변수에 잘못 /ws가 포함된 경우 제거
    const trimmedBase = rawBase.replace(/\/$/, '').replace(/\/ws\/?$/, '');
    // 항상 /ws/notifications로 통일
    const url = `${trimmedBase}/ws/notifications`;
    return url.includes('?') ? `${url}&token=${token}` : `${url}?token=${token}`;
  }

  createTransport(url) {
    try {
      if (url.startsWith('ws://') || url.startsWith('wss://')) {
        return new WebSocket(url);
      }
      return new SockJS(url);
    } catch (error) {
      console.error('Failed to create WebSocket transport:', error);
      throw error;
    }
  }

  // 기본 구독 설정
  setupDefaultSubscriptions() {
    if (!this.client || !this.isConnected) {
      console.warn("Cannot setup subscriptions: client not connected");
      return;
    }

    // STOMP 클라이언트가 완전히 활성화될 때까지 대기
    if (!this.client.connected) {
      console.warn("STOMP client not fully connected, retrying in 100ms");
      setTimeout(() => this.setupDefaultSubscriptions(), 100);
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

  // 재연결 처리 - 지수 백오프(Exponential Backoff) 적용
  handleReconnection() {
    // 이미 재연결 시도 중이면 무시
    if (this.reconnectTimeout) {
      console.log("Reconnection already in progress, skipping...");
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached for notification WebSocket");
      this.startFallbackPolling();
      return;
    }

    this.reconnectAttempts++;

    // 지수 백오프: delay = min(base * 2^attempts, max)
    const exponentialDelay = Math.min(
      this.reconnectDelayBase * Math.pow(2, this.reconnectAttempts - 1),
      this.reconnectDelayMax
    );

    console.log(
      `Attempting to reconnect notification WebSocket in ${exponentialDelay / 1000}s... ` +
      `(${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, exponentialDelay);
  }

  // 연결 해제
  disconnect() {
    // 재연결 타임아웃 취소
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

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

    this.stopFallbackPolling();
  }

  startFallbackPolling() {
    if (this.fallbackInterval) {
      return;
    }

    console.warn("Starting notification fallback polling mode");
    const store = useNotificationStore.getState();

    const poll = async () => {
      try {
        await store.loadUnreadCount();
      } catch (error) {
        console.error("Fallback polling failed:", error);
      }
    };

    poll();
    this.fallbackInterval = setInterval(poll, this.fallbackPollInterval);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-fallback-started'));
    }
  }

  stopFallbackPolling() {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification-fallback-stopped'));
      }
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
