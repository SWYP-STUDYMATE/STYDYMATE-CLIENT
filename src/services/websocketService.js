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
    this.connectionTimeout = null; // 연결 타임아웃 타이머
    this.connectionTimeoutMs = 30000; // 연결 타임아웃 시간 (30초)
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
      console.log("[WebSocketService] 연결 시도 중 - 기존 Promise 반환", {
        promiseExists: !!this.connectPromise,
        isConnecting: this.isConnecting,
        isConnected: this.isConnected
      });
      return this.connectPromise;
    }

    console.log("[WebSocketService] 새 연결 시작", {
      isConnecting: this.isConnecting,
      isConnected: this.isConnected,
      hasClient: !!this.client
    });

    const {
      endpoint = "/ws/chat",
      headers = {},
      debug = false
    } = options;

    this.isConnecting = true;

    const token = getToken("accessToken");

    if (!token) {
      const errorMsg = "액세스 토큰이 없습니다. 로그인이 필요합니다.";
      console.error("[WebSocketService]", errorMsg);
      this.isConnecting = false;
      this.connectPromise = null;
      return Promise.reject(new Error(errorMsg));
    }

    // WebSocket URL 우선순위: WORKERS_WS_URL > WS_URL > WORKERS_API_URL > API_URL
    const wsUrl = import.meta.env.VITE_WORKERS_WS_URL
      || import.meta.env.VITE_WS_URL
      || import.meta.env.VITE_WORKERS_API_URL
      || import.meta.env.VITE_API_URL
      || "https://api.languagemate.kr";

    // HTTP(S) -> WS(S) 프로토콜 변환
    let baseUrl = wsUrl;
    if (wsUrl.startsWith('https://')) {
      baseUrl = 'wss://' + wsUrl.substring(8);
    } else if (wsUrl.startsWith('http://')) {
      baseUrl = 'ws://' + wsUrl.substring(7);
    } else if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      // 프로토콜이 없는 경우 기본값 추가
      baseUrl = 'wss://' + wsUrl;
    }

    const socketUrl = `${baseUrl}${endpoint}`;

    console.log("[WebSocketService] WebSocket 연결 시작", {
      socketUrl,
      baseUrl,
      endpoint,
      hasToken: !!token,
      tokenPreview: token.substring(0, 20) + '...',
      envVars: {
        VITE_WORKERS_WS_URL: import.meta.env.VITE_WORKERS_WS_URL || 'undefined',
        VITE_WS_URL: import.meta.env.VITE_WS_URL || 'undefined'
      }
    });

    // 새로운 연결 Promise 생성 및 저장
    this.connectPromise = new Promise((resolve, reject) => {
      // 연결 타임아웃 설정
      this.connectionTimeout = setTimeout(() => {
        console.error("[WebSocketService] ❌ 연결 타임아웃", {
          socketUrl,
          timeoutMs: this.connectionTimeoutMs
        });

        this.isConnecting = false;
        this.isConnected = false;
        this.connectPromise = null;

        // 클라이언트 정리
        if (this.client) {
          try {
            this.client.deactivate();
          } catch (e) {
            console.error("[WebSocketService] 타임아웃 중 클라이언트 정리 실패:", e);
          }
        }

        // 에러 리스너 호출
        this.errorListeners.forEach(listener => {
          try {
            listener('connection_timeout', { timeout: this.connectionTimeoutMs });
          } catch (error) {
            console.error("[WebSocketService] Error listener error:", error);
          }
        });

        const error = new Error(`WebSocket 연결 타임아웃 (${this.connectionTimeoutMs}ms)`);
        reject(error);
        this.handleReconnection();
      }, this.connectionTimeoutMs);

      try {
        this.client = new Client({
          webSocketFactory: () => new WebSocket(socketUrl),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
            ...headers
          },
          debug: (str) => {
            if (debug) {
              console.log("STOMP Debug:", str);
            }
          },

          onConnect: (frame) => {
            console.log("[WebSocketService] ✅ WebSocket CONNECTED", {
              frame,
              socketUrl,
              messageQueueLength: this.messageQueue.length,
              subscriptionsCount: this.subscriptions.size
            });

            // 타임아웃 타이머 클리어
            if (this.connectionTimeout) {
              clearTimeout(this.connectionTimeout);
              this.connectionTimeout = null;
            }

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
            console.error("[WebSocketService] ❌ STOMP Error", {
              frame,
              message: frame.headers?.message,
              socketUrl
            });

            // 타임아웃 타이머 클리어
            if (this.connectionTimeout) {
              clearTimeout(this.connectionTimeout);
              this.connectionTimeout = null;
            }

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
            console.log("[WebSocketService] 🔌 WebSocket Closed", {
              code: event.code,
              reason: event.reason,
              wasClean: event.wasClean,
              socketUrl
            });

            // 타임아웃 타이머 클리어
            if (this.connectionTimeout) {
              clearTimeout(this.connectionTimeout);
              this.connectionTimeout = null;
            }

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
            console.error("[WebSocketService] ❌ WebSocket Error", {
              error,
              errorMessage: error?.message,
              socketUrl
            });

            // 타임아웃 타이머 클리어
            if (this.connectionTimeout) {
              clearTimeout(this.connectionTimeout);
              this.connectionTimeout = null;
            }

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

        console.log("[WebSocketService] 🚀 STOMP 클라이언트 활성화 시작");
        this.client.activate();
        console.log("[WebSocketService] 🚀 STOMP 클라이언트 활성화 완료 - 연결 대기 중");
      } catch (error) {
        // 타임아웃 타이머 클리어
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        this.isConnecting = false;
        this.isConnected = false;
        this.connectPromise = null; // 에러 시 Promise 정리
        console.error("[WebSocketService] ❌ WebSocket 클라이언트 생성 실패:", error);
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
      console.error("[WebSocketService] 최대 재연결 시도 횟수 초과", {
        attempts: this.reconnectAttempts,
        max: this.maxReconnectAttempts
      });
      // 모든 에러 리스너에 최종 실패 알림
      this.errorListeners.forEach(listener => {
        try {
          listener('max_reconnect_failed', { attempts: this.reconnectAttempts });
        } catch (error) {
          console.error("[WebSocketService] Error listener failed:", error);
        }
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(
      `[WebSocketService] 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts} (${delay}ms 후)`
    );

    // 연결 리스너에 재연결 시도 알림
    this.connectionListeners.forEach(listener => {
      try {
        listener('reconnecting', { attempt: this.reconnectAttempts, delay });
      } catch (error) {
        console.error("[WebSocketService] Connection listener error:", error);
      }
    });

    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        console.log(`[WebSocketService] 재연결 실행 중... (시도 ${this.reconnectAttempts})`);
        this.connect().catch(error => {
          console.error("[WebSocketService] 재연결 실패:", error);
        });
      } else {
        console.log("[WebSocketService] 재연결 취소 (이미 연결됨 또는 연결 시도 중)");
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
    // 타임아웃 타이머 클리어
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

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
    this.connectPromise = null;
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
