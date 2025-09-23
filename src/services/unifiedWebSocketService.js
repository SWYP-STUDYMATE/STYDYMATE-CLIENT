import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

/**
 * 통합 WebSocket 서비스
 * STOMP over SockJS를 사용하여 모든 WebSocket 통신을 관리
 */
class UnifiedWebSocketService {
  constructor() {
    this.client = null;
    this.isConnecting = false;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    
    // 채널별 구독 관리
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    
    // 메시지 큐 (연결 끊김 시 버퍼링)
    this.messageQueue = [];
    
    // 이벤트 리스너
    this.connectionListeners = new Set();
    this.errorListeners = new Set();
    
    // 환경 설정
    const fallback = import.meta.env.VITE_API_URL || import.meta.env.VITE_WORKERS_API_URL || 'https://workers.languagemate.kr';
    const wsOrigin = import.meta.env.VITE_WS_URL
      || (fallback.startsWith('https://') ? fallback.replace('https://', 'wss://')
        : fallback.startsWith('http://') ? fallback.replace('http://', 'ws://')
        : 'wss://workers.languagemate.kr');
    this.wsBase = wsOrigin;
  }

  /**
   * WebSocket 연결 초기화
   */
  connect(options = {}) {
    if (this.isConnecting || this.isConnected) {
      console.log("[WS] Already connecting or connected");
      return Promise.resolve();
    }

    const {
      endpoint = "/ws",
      headers = {},
      debug = false
    } = options;

    this.isConnecting = true;
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      this.isConnecting = false;
      return Promise.reject(new Error("No access token found"));
    }

    const socketUrl = `${this.wsBase}${endpoint}`;

    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          webSocketFactory: () => new SockJS(socketUrl),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
            ...headers
          },
          debug: debug ? (str) => console.log("[STOMP Debug]", str) : undefined,
          
          // 하트비트 설정
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          
          // 재연결 설정
          reconnectDelay: this.reconnectDelay,
          
          onConnect: (frame) => {
            console.log("[WS] Connected:", frame);
            this.isConnecting = false;
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // 기본 구독 설정
            this.setupDefaultSubscriptions();
            
            // 대기 중인 메시지 전송
            this.flushMessageQueue();
            
            // 연결 리스너 호출
            this.notifyConnectionListeners('connected', frame);
            
            resolve(frame);
          },
          
          onStompError: (frame) => {
            console.error("[WS] STOMP Error:", frame);
            this.isConnecting = false;
            this.isConnected = false;
            
            // 에러 리스너 호출
            this.notifyErrorListeners('stomp_error', frame);
            
            this.handleReconnection();
            reject(new Error(`STOMP Error: ${frame.headers.message}`));
          },
          
          onWebSocketClose: (event) => {
            console.log("[WS] Closed:", event);
            this.isConnecting = false;
            this.isConnected = false;
            
            // 연결 리스너 호출
            this.notifyConnectionListeners('disconnected', event);
            
            this.handleReconnection();
          },
          
          onDisconnect: (frame) => {
            console.log("[WS] Disconnected:", frame);
            this.isConnected = false;
          }
        });

        this.client.activate();
      } catch (error) {
        console.error("[WS] Connection error:", error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * 기본 구독 채널 설정
   */
  setupDefaultSubscriptions() {
    // 개인 메시지 채널
    this.subscribe('/user/queue/messages', this.handlePersonalMessage.bind(this));
    
    // 알림 채널
    this.subscribe('/user/queue/notifications', this.handleNotification.bind(this));
    
    // 매칭 알림
    this.subscribe('/user/queue/matching', this.handleMatchingUpdate.bind(this));
    
    // 세션 알림
    this.subscribe('/user/queue/session', this.handleSessionUpdate.bind(this));
    
    // 시스템 공지
    this.subscribe('/topic/system', this.handleSystemMessage.bind(this));
  }

  /**
   * 채널 구독
   */
  subscribe(destination, callback, headers = {}) {
    if (!this.client || !this.isConnected) {
      console.warn(`[WS] Cannot subscribe to ${destination}: not connected`);
      // 재연결 후 구독을 위해 저장
      this.messageHandlers.set(destination, callback);
      return null;
    }

    try {
      const subscription = this.client.subscribe(
        destination,
        (message) => {
          try {
            const body = JSON.parse(message.body);
            callback(body, message.headers);
          } catch (error) {
            console.error(`[WS] Error processing message from ${destination}:`, error);
            callback(message.body, message.headers);
          }
        },
        headers
      );

      this.subscriptions.set(destination, subscription);
      this.messageHandlers.set(destination, callback);
      
      console.log(`[WS] Subscribed to ${destination}`);
      return subscription;
    } catch (error) {
      console.error(`[WS] Failed to subscribe to ${destination}:`, error);
      return null;
    }
  }

  /**
   * 구독 취소
   */
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      this.messageHandlers.delete(destination);
      console.log(`[WS] Unsubscribed from ${destination}`);
    }
  }

  /**
   * 메시지 전송
   */
  send(destination, body, headers = {}) {
    if (!this.client || !this.isConnected) {
      console.warn(`[WS] Cannot send to ${destination}: not connected, queuing message`);
      this.messageQueue.push({ destination, body, headers });
      return;
    }

    try {
      this.client.publish({
        destination,
        body: typeof body === 'string' ? body : JSON.stringify(body),
        headers
      });
      console.log(`[WS] Sent message to ${destination}`);
    } catch (error) {
      console.error(`[WS] Failed to send message to ${destination}:`, error);
      this.messageQueue.push({ destination, body, headers });
    }
  }

  /**
   * 대기 중인 메시지 전송
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const { destination, body, headers } = this.messageQueue.shift();
      this.send(destination, body, headers);
    }
  }

  /**
   * 재연결 처리
   */
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WS] Max reconnection attempts reached");
      this.notifyErrorListeners('max_reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        this.connect();
      }
    }, delay);
  }

  /**
   * 연결 리스너 등록
   */
  onConnectionChange(listener) {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  /**
   * 에러 리스너 등록
   */
  onError(listener) {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * 연결 리스너 알림
   */
  notifyConnectionListeners(status, data) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(status, data);
      } catch (error) {
        console.error("[WS] Connection listener error:", error);
      }
    });
  }

  /**
   * 에러 리스너 알림
   */
  notifyErrorListeners(type, error) {
    this.errorListeners.forEach(listener => {
      try {
        listener(type, error);
      } catch (error) {
        console.error("[WS] Error listener error:", error);
      }
    });
  }

  /**
   * 메시지 핸들러들
   */
  handlePersonalMessage(message) {
    console.log("[WS] Personal message:", message);
    // 메시지 처리 로직
    window.dispatchEvent(new CustomEvent('ws:personal-message', { detail: message }));
  }

  handleNotification(notification) {
    console.log("[WS] Notification:", notification);
    window.dispatchEvent(new CustomEvent('ws:notification', { detail: notification }));
  }

  handleMatchingUpdate(update) {
    console.log("[WS] Matching update:", update);
    window.dispatchEvent(new CustomEvent('ws:matching-update', { detail: update }));
  }

  handleSessionUpdate(update) {
    console.log("[WS] Session update:", update);
    window.dispatchEvent(new CustomEvent('ws:session-update', { detail: update }));
  }

  handleSystemMessage(message) {
    console.log("[WS] System message:", message);
    window.dispatchEvent(new CustomEvent('ws:system-message', { detail: message }));
  }

  /**
   * 채팅방 입장
   */
  joinChatRoom(roomId) {
    const destination = `/topic/chat/${roomId}`;
    return this.subscribe(destination, (message) => {
      window.dispatchEvent(new CustomEvent('ws:chat-message', { 
        detail: { roomId, message } 
      }));
    });
  }

  /**
   * 채팅방 퇴장
   */
  leaveChatRoom(roomId) {
    const destination = `/topic/chat/${roomId}`;
    this.unsubscribe(destination);
  }

  /**
   * 채팅 메시지 전송
   */
  sendChatMessage(roomId, message) {
    this.send(`/app/chat/${roomId}/send`, message);
  }

  /**
   * 연결 해제
   */
  disconnect() {
    if (this.client) {
      // 모든 구독 해제
      this.subscriptions.forEach((subscription, destination) => {
        subscription.unsubscribe();
        console.log(`[WS] Unsubscribed from ${destination}`);
      });
      this.subscriptions.clear();
      
      // 클라이언트 비활성화
      this.client.deactivate();
      this.client = null;
      
      this.isConnected = false;
      this.isConnecting = false;
      
      console.log("[WS] Disconnected");
    }
  }

  /**
   * 연결 상태 확인
   */
  getConnectionState() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// 싱글톤 인스턴스
const unifiedWebSocketService = new UnifiedWebSocketService();

export default unifiedWebSocketService;
