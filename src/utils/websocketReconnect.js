/**
 * WebSocket 재연결 유틸리티
 * - 지수 백오프(Exponential Backoff) 재연결 전략
 * - 연결 상태 추적
 * - 자동 재연결 관리
 */

export class WebSocketReconnectManager {
  constructor(options = {}) {
    this.ws = null;
    this.url = null;
    this.protocols = null;

    // 재연결 설정
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectAttempt = 0;
    this.reconnectDelay = options.reconnectDelay || 1000; // 초기 지연 시간 (ms)
    this.maxReconnectDelay = options.maxReconnectDelay || 30000; // 최대 지연 시간 (ms)
    this.reconnectTimeout = null;

    // 연결 상태
    this.isConnecting = false;
    this.shouldReconnect = true;
    this.manualClose = false;

    // 이벤트 핸들러
    this.listeners = {
      open: [],
      message: [],
      close: [],
      error: [],
      reconnect: [],
      reconnectFailed: [],
    };

    // 연결 품질 모니터링
    this.lastPingTime = Date.now();
    this.pingInterval = options.pingInterval || 30000; // 30초
    this.pongTimeout = options.pongTimeout || 10000; // 10초
    this.pingTimer = null;
    this.pongTimer = null;
  }

  /**
   * WebSocket 연결
   * @param {string} url - WebSocket URL
   * @param {string|string[]} protocols - WebSocket protocols
   */
  connect(url, protocols) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.warn('WebSocket is already connecting or connected');
      return;
    }

    this.url = url;
    this.protocols = protocols;
    this.isConnecting = true;
    this.manualClose = false;

    try {
      this.ws = new WebSocket(url, protocols);
      this.setupWebSocketHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * WebSocket 이벤트 핸들러 설정
   */
  setupWebSocketHandlers() {
    this.ws.onopen = (event) => {
      console.log('[WebSocket] Connected successfully');
      this.isConnecting = false;
      this.reconnectAttempt = 0; // 재연결 카운터 리셋

      // Ping/Pong 시작
      this.startHeartbeat();

      // Open 이벤트 전파
      this.emit('open', event);
    };

    this.ws.onmessage = (event) => {
      // Pong 응답 처리
      if (event.data === 'pong') {
        this.handlePong();
        return;
      }

      // Message 이벤트 전파
      this.emit('message', event);
    };

    this.ws.onclose = (event) => {
      console.log('[WebSocket] Connection closed', event);
      this.isConnecting = false;

      // Heartbeat 중지
      this.stopHeartbeat();

      // Close 이벤트 전파
      this.emit('close', event);

      // 수동으로 닫힌 경우가 아니면 재연결 시도
      if (!this.manualClose && this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error occurred:', error);

      // Error 이벤트 전파
      this.emit('error', error);
    };
  }

  /**
   * 재연결 스케줄링 (지수 백오프)
   */
  scheduleReconnect() {
    // 최대 재연결 시도 횟수 초과
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      this.emit('reconnectFailed', {
        attempt: this.reconnectAttempt,
        maxAttempts: this.maxReconnectAttempts,
      });
      return;
    }

    // 재연결 지연 시간 계산 (지수 백오프 + jitter)
    const baseDelay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempt),
      this.maxReconnectDelay
    );

    // Jitter 추가 (0-30% 랜덤)
    const jitter = baseDelay * (Math.random() * 0.3);
    const delay = baseDelay + jitter;

    this.reconnectAttempt++;
    console.log(`[WebSocket] Scheduling reconnect attempt ${this.reconnectAttempt} in ${Math.round(delay)}ms`);

    // 재연결 이벤트 전파
    this.emit('reconnect', {
      attempt: this.reconnectAttempt,
      maxAttempts: this.maxReconnectAttempts,
      delay: Math.round(delay),
    });

    // 재연결 타이머 설정
    this.reconnectTimeout = setTimeout(() => {
      console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempt}/${this.maxReconnectAttempts})`);
      this.connect(this.url, this.protocols);
    }, delay);
  }

  /**
   * Heartbeat (Ping/Pong) 시작
   */
  startHeartbeat() {
    this.stopHeartbeat();

    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendPing();
      }
    }, this.pingInterval);
  }

  /**
   * Heartbeat 중지
   */
  stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }

    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  /**
   * Ping 전송
   */
  sendPing() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    try {
      this.ws.send('ping');
      this.lastPingTime = Date.now();

      // Pong 응답 대기 타이머
      this.pongTimer = setTimeout(() => {
        console.warn('[WebSocket] Pong timeout - connection may be dead');

        // 연결이 죽은 것으로 간주하고 재연결
        if (this.ws) {
          this.ws.close();
        }
      }, this.pongTimeout);
    } catch (error) {
      console.error('[WebSocket] Failed to send ping:', error);
    }
  }

  /**
   * Pong 응답 처리
   */
  handlePong() {
    const latency = Date.now() - this.lastPingTime;
    console.log(`[WebSocket] Pong received (latency: ${latency}ms)`);

    // Pong 타이머 클리어
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  /**
   * 메시지 전송
   * @param {string|Object} data - 전송할 데이터
   */
  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send message - not connected');
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
      return true;
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error);
      return false;
    }
  }

  /**
   * 연결 닫기
   * @param {number} code - Close code
   * @param {string} reason - Close reason
   */
  close(code = 1000, reason = 'Normal closure') {
    this.manualClose = true;
    this.shouldReconnect = false;

    // 재연결 타이머 취소
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Heartbeat 중지
    this.stopHeartbeat();

    // WebSocket 닫기
    if (this.ws) {
      try {
        this.ws.close(code, reason);
      } catch (error) {
        console.error('[WebSocket] Error closing connection:', error);
      }
      this.ws = null;
    }
  }

  /**
   * 재연결 활성화
   */
  enableReconnect() {
    this.shouldReconnect = true;
    this.manualClose = false;
  }

  /**
   * 재연결 비활성화
   */
  disableReconnect() {
    this.shouldReconnect = false;
  }

  /**
   * 이벤트 리스너 등록
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    } else {
      console.warn(`[WebSocket] Unknown event: ${event}`);
    }
  }

  /**
   * 이벤트 리스너 제거
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * 이벤트 발생
   * @param {string} event - 이벤트 이름
   * @param {*} data - 이벤트 데이터
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * 연결 상태 확인
   * @returns {boolean} 연결 여부
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 현재 재연결 시도 횟수
   * @returns {number} 재연결 시도 횟수
   */
  getReconnectAttempt() {
    return this.reconnectAttempt;
  }

  /**
   * 최대 재연결 시도 횟수 설정
   * @param {number} max - 최대 재연결 시도 횟수
   */
  setMaxReconnectAttempts(max) {
    this.maxReconnectAttempts = max;
  }

  /**
   * 재연결 카운터 리셋
   */
  resetReconnectAttempt() {
    this.reconnectAttempt = 0;
  }
}

/**
 * 기본 WebSocket 재연결 인스턴스 생성 헬퍼
 * @param {string} url - WebSocket URL
 * @param {Object} options - 옵션
 * @returns {WebSocketReconnectManager} WebSocket 재연결 매니저
 */
export function createWebSocketWithReconnect(url, options = {}) {
  const manager = new WebSocketReconnectManager(options);
  manager.connect(url, options.protocols);
  return manager;
}
