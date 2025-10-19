import { Client } from "@stomp/stompjs";
import { getToken } from "../utils/tokenStorage";

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnecting = false;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 시작 지연 시간 (밀리초)
    this.maxReconnectDelay = 30000; // 최대 지연 시간
    this.subscriptions = new Map();
    this.messageQueue = [];
    this.connectionListeners = new Set();
    this.errorListeners = new Set();
    this.connectPromise = null; // 현재 진행 중인 연결 Promise 저장
  }

  /**
   * WebSocket 연결 설정
   * @param {Object} options - 연결 옵션
   * @param {string} options.endpoint - WebSocket 엔드포인트
   * @param {Object} options.headers - 연결 헤더
   * @param {boolean} options.debug - 디버그 모드
   */
  connect(options = {}) {
    // 이미 연결되어 있으면 즉시 반환
    if (this.isConnected) {
      console.log("[WebSocketService] 이미 연결됨");
      return Promise.resolve();
    }

    // 연결 시도 중이면 기존 Promise 반환
    if (this.isConnecting && this.connectPromise) {
      console.log("[WebSocketService] 연결 시도 중 - 기존 Promise 반환");
      return this.connectPromise;
    }

    const {
      endpoint = "/ws/chat",
      headers = {},
      debug = false
    } = options;

    this.isConnecting = true;

    const token = getToken("accessToken");
    // WebSocket URL 우선순위: WORKERS_WS_URL > WS_URL > WORKERS_API_URL > API_URL
    const wsUrl = import.meta.env.VITE_WORKERS_WS_URL
      || import.meta.env.VITE_WS_URL
      || import.meta.env.VITE_WORKERS_API_URL
      || import.meta.env.VITE_API_URL
      || "https://api.languagemate.kr";

    // HTTP(S) -> WS(S) 프로토콜 변환
    const baseUrl = wsUrl.startsWith('http')
      ? wsUrl.replace(/^http/i, wsUrl.startsWith('https') ? 'wss' : 'ws')
      : wsUrl;

    const socketUrl = `${baseUrl}${endpoint}`;

    console.log("[WebSocketService] WebSocket 연결 시작", {
      socketUrl,
      hasToken: !!token,
      token: token ? token.substring(0, 20) + '...' : 'null'
    });

    // 새로운 연결 Promise 생성 및 저장
    this.connectPromise = new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          webSocketFactory: () => new WebSocket(socketUrl),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
            ...headers
          },
          debug: debug ? (str) => console.log("STOMP Debug:", str) : undefined,
          
          onConnect: (frame) => {
            console.log("WebSocket Connected:", frame);
            this.isConnecting = false;
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.connectPromise = null; // 연결 완료 후 Promise 정리

            // 대기 중인 메시지 전송
            this.flushMessageQueue();

            // 기존 구독 재설정
            this.reestablishSubscriptions();

            // 연결 리스너 호출
            this.connectionListeners.forEach(listener => {
              try {
                listener('connected', frame);
              } catch (error) {
                console.error("Connection listener error:", error);
              }
            });

            resolve();
          },
          
          onStompError: (frame) => {
            console.error("STOMP Error:", frame);
            this.isConnecting = false;
            this.isConnected = false;
            this.connectPromise = null; // 에러 시 Promise 정리

            // 에러 리스너 호출
            this.errorListeners.forEach(listener => {
              try {
                listener('stomp_error', frame);
              } catch (error) {
                console.error("Error listener error:", error);
              }
            });

            this.handleReconnection();
            reject(new Error(`STOMP Error: ${frame.headers.message}`));
          },
          
          onWebSocketClose: (event) => {
            console.log("WebSocket Closed:", event);
            this.isConnecting = false;
            this.isConnected = false;
            
            // 연결 리스너 호출
            this.connectionListeners.forEach(listener => {
              try {
                listener('disconnected', event);
              } catch (error) {
                console.error("Connection listener error:", error);
              }
            });
            
            // 정상 종료가 아닌 경우 재연결 시도
            if (!event.wasClean) {
              this.handleReconnection();
            }
          },
          
          onWebSocketError: (error) => {
            console.error("WebSocket Error:", error);
            this.isConnecting = false;
            this.isConnected = false;
            this.connectPromise = null; // 에러 시 Promise 정리

            // 에러 리스너 호출
            this.errorListeners.forEach(listener => {
              try {
                listener('websocket_error', error);
              } catch (error) {
                console.error("Error listener error:", error);
              }
            });

            this.handleReconnection();
            reject(error);
          }
        });

        this.client.activate();
      } catch (error) {
        this.isConnecting = false;
        this.isConnected = false;
        this.connectPromise = null; // 에러 시 Promise 정리
        console.error("Failed to create WebSocket client:", error);
        reject(error);
      }
    });

    return this.connectPromise;
  }

  /**
   * 재연결 처리
   */
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(
      `Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        this.connect().catch(error => {
          console.error("Reconnection failed:", error);
        });
      }
    }, delay);
  }

  /**
   * 구독 추가
   * @param {string} destination - 구독할 목적지
   * @param {Function} callback - 메시지 콜백
   * @param {Object} headers - 구독 헤더
   * @returns {string} 구독 ID
   */
  subscribe(destination, callback, headers = {}) {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscriptionInfo = {
      destination,
      callback,
      headers,
      subscription: null
    };

    this.subscriptions.set(subscriptionId, subscriptionInfo);

    if (this.isConnected && this.client) {
      try {
        subscriptionInfo.subscription = this.client.subscribe(
          destination,
          (message) => {
            try {
              const parsedMessage = JSON.parse(message.body);
              callback(parsedMessage, message);
            } catch (error) {
              console.error("Error parsing message:", error);
              callback(message.body, message);
            }
          },
          headers
        );
      } catch (error) {
        console.error("Failed to subscribe:", error);
      }
    }

    return subscriptionId;
  }

  /**
   * 구독 해제
   * @param {string} subscriptionId - 구독 ID
   */
  unsubscribe(subscriptionId) {
    const subscriptionInfo = this.subscriptions.get(subscriptionId);
    if (subscriptionInfo && subscriptionInfo.subscription) {
      try {
        subscriptionInfo.subscription.unsubscribe();
      } catch (error) {
        console.error("Failed to unsubscribe:", error);
      }
    }
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * 기존 구독 재설정 (재연결 시 사용)
   */
  reestablishSubscriptions() {
    this.subscriptions.forEach((subscriptionInfo, subscriptionId) => {
      if (!subscriptionInfo.subscription && this.client) {
        try {
          subscriptionInfo.subscription = this.client.subscribe(
            subscriptionInfo.destination,
            (message) => {
              try {
                const parsedMessage = JSON.parse(message.body);
                subscriptionInfo.callback(parsedMessage, message);
              } catch (error) {
                console.error("Error parsing message:", error);
                subscriptionInfo.callback(message.body, message);
              }
            },
            subscriptionInfo.headers
          );
        } catch (error) {
          console.error("Failed to reestablish subscription:", error);
        }
      }
    });
  }

  /**
   * 메시지 전송
   * @param {string} destination - 전송 목적지
   * @param {Object} message - 전송할 메시지
   * @param {Object} headers - 전송 헤더
   */
  send(destination, message, headers = {}) {
    console.log("[WebSocketService] send 호출", {
      destination,
      isConnected: this.isConnected,
      hasClient: !!this.client,
      messagePreview: JSON.stringify(message).substring(0, 100)
    });

    if (this.isConnected && this.client) {
      try {
        this.client.publish({
          destination,
          body: JSON.stringify(message),
          headers
        });
        console.log("[WebSocketService] 메시지 전송 성공");
      } catch (error) {
        console.error("[WebSocketService] 메시지 전송 실패:", error);
        // 연결이 끊어진 경우 큐에 추가
        this.messageQueue.push({ destination, message, headers });
      }
    } else {
      console.warn("[WebSocketService] WebSocket 연결 안 됨. 메시지 큐에 추가");
      // 연결되지 않은 경우 메시지 큐에 추가
      this.messageQueue.push({ destination, message, headers });

      // 연결되지 않은 경우 연결 시도
      if (!this.isConnecting) {
        console.log("[WebSocketService] 재연결 시도");
        this.connect().catch(error => {
          console.error("[WebSocketService] 재연결 실패:", error);
        });
      }
    }
  }

  /**
   * 대기 중인 메시지 전송
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const { destination, message, headers } = this.messageQueue.shift();
      this.send(destination, message, headers);
    }
  }

  /**
   * 연결 상태 리스너 추가
   * @param {Function} listener - 연결 상태 콜백 (status, data)
   */
  addConnectionListener(listener) {
    this.connectionListeners.add(listener);
  }

  /**
   * 연결 상태 리스너 제거
   * @param {Function} listener - 제거할 리스너
   */
  removeConnectionListener(listener) {
    this.connectionListeners.delete(listener);
  }

  /**
   * 에러 리스너 추가
   * @param {Function} listener - 에러 콜백 (type, error)
   */
  addErrorListener(listener) {
    this.errorListeners.add(listener);
  }

  /**
   * 에러 리스너 제거
   * @param {Function} listener - 제거할 리스너
   */
  removeErrorListener(listener) {
    this.errorListeners.delete(listener);
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect() {
    if (this.client) {
      try {
        // 모든 구독 해제
        this.subscriptions.forEach((subscriptionInfo) => {
          if (subscriptionInfo.subscription) {
            subscriptionInfo.subscription.unsubscribe();
          }
        });
        this.subscriptions.clear();
        
        // 클라이언트 비활성화
        this.client.deactivate();
      } catch (error) {
        console.error("Error during disconnect:", error);
      }
    }
    
    this.client = null;
    this.isConnecting = false;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
    this.connectionListeners.clear();
    this.errorListeners.clear();
  }

  /**
   * 연결 상태 확인
   * @returns {boolean} 연결 상태
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// 싱글톤 인스턴스
const websocketService = new WebSocketService();

export default websocketService;
