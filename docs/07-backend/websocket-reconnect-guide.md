# WebSocket 재연결 가이드

## 개요

WebSocket 재연결 유틸리티는 안정적인 실시간 통신을 위한 자동 재연결 및 연결 모니터링 기능을 제공합니다.

## 주요 기능

### 1. 자동 재연결
- **지수 백오프(Exponential Backoff)**: 재연결 시도 간격이 점진적으로 증가
- **Jitter**: 랜덤 지연 추가로 서버 과부하 방지
- **최대 재연결 시도**: 설정 가능한 최대 재연결 횟수

### 2. 연결 품질 모니터링
- **Ping/Pong Heartbeat**: 주기적 연결 확인
- **연결 타임아웃 감지**: 응답 없는 연결 자동 감지 및 재연결
- **Latency 측정**: 연결 품질 실시간 측정

### 3. 이벤트 기반 아키텍처
- 연결 상태 변화 이벤트
- 재연결 이벤트
- 에러 이벤트

## 사용 방법

### 기본 사용

```javascript
import { createWebSocketWithReconnect } from '@/utils/websocketReconnect';

// WebSocket 연결 생성
const ws = createWebSocketWithReconnect('wss://api.languagemate.kr/ws', {
  maxReconnectAttempts: 10,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  pingInterval: 30000,
  pongTimeout: 10000,
});

// 이벤트 리스너 등록
ws.on('open', () => {
  console.log('WebSocket connected');
});

ws.on('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
});

ws.on('close', () => {
  console.log('WebSocket disconnected');
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('reconnect', ({ attempt, maxAttempts, delay }) => {
  console.log(`Reconnecting... (${attempt}/${maxAttempts}) in ${delay}ms`);
});

ws.on('reconnectFailed', ({ attempt, maxAttempts }) => {
  console.error(`Failed to reconnect after ${attempt} attempts`);
});

// 메시지 전송
ws.send({ type: 'chat', message: 'Hello!' });

// 연결 종료
ws.close();
```

### 고급 사용 (WebSocketReconnectManager 클래스)

```javascript
import { WebSocketReconnectManager } from '@/utils/websocketReconnect';

class ChatService {
  constructor() {
    this.ws = new WebSocketReconnectManager({
      maxReconnectAttempts: 10,
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
      pingInterval: 30000,
      pongTimeout: 10000,
    });

    this.setupListeners();
  }

  connect(roomId, userId) {
    const url = `wss://api.languagemate.kr/ws/chat/${roomId}?userId=${userId}`;
    this.ws.connect(url);
  }

  setupListeners() {
    this.ws.on('open', () => {
      this.onConnected();
    });

    this.ws.on('message', (event) => {
      this.handleMessage(event);
    });

    this.ws.on('reconnect', (info) => {
      this.showReconnectNotification(info);
    });

    this.ws.on('reconnectFailed', () => {
      this.showErrorNotification('연결 실패');
    });
  }

  send(message) {
    if (this.ws.isConnected()) {
      this.ws.send(message);
    } else {
      console.warn('WebSocket not connected');
    }
  }

  disconnect() {
    this.ws.close();
  }
}
```

## 재연결 옵션

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxReconnectAttempts` | `number` | `10` | 최대 재연결 시도 횟수 |
| `reconnectDelay` | `number` | `1000` | 초기 재연결 지연 시간 (ms) |
| `maxReconnectDelay` | `number` | `30000` | 최대 재연결 지연 시간 (ms) |
| `pingInterval` | `number` | `30000` | Ping 전송 간격 (ms) |
| `pongTimeout` | `number` | `10000` | Pong 응답 대기 시간 (ms) |
| `protocols` | `string\|string[]` | `undefined` | WebSocket 프로토콜 |

## 재연결 전략

### 지수 백오프 (Exponential Backoff)

재연결 시도 간격이 점진적으로 증가합니다:

```
Attempt 1: 1000ms + jitter
Attempt 2: 2000ms + jitter
Attempt 3: 4000ms + jitter
Attempt 4: 8000ms + jitter
Attempt 5: 16000ms + jitter
Attempt 6: 30000ms (max) + jitter
...
```

### Jitter

각 재연결 시도에 0-30% 랜덤 지연을 추가하여 서버 과부하를 방지합니다:

```javascript
const baseDelay = Math.min(
  reconnectDelay * Math.pow(2, reconnectAttempt),
  maxReconnectDelay
);

const jitter = baseDelay * (Math.random() * 0.3);
const finalDelay = baseDelay + jitter;
```

## Heartbeat (Ping/Pong)

### 작동 원리

1. **Ping 전송**: 주기적으로 (기본 30초) "ping" 메시지 전송
2. **Pong 대기**: 서버로부터 "pong" 응답 대기 (기본 10초)
3. **타임아웃 처리**: Pong이 도착하지 않으면 연결이 죽은 것으로 간주하고 재연결

### 서버 측 구현

서버는 "ping" 메시지를 받으면 "pong"으로 응답해야 합니다:

```typescript
// Cloudflare Workers 예시
ws.on('message', (message) => {
  if (message === 'ping') {
    ws.send('pong');
    return;
  }

  // 일반 메시지 처리
  handleMessage(message);
});
```

## 이벤트

### open
연결이 성공적으로 열렸을 때 발생합니다.

```javascript
ws.on('open', (event) => {
  console.log('Connected');
});
```

### message
메시지를 수신했을 때 발생합니다.

```javascript
ws.on('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
});
```

### close
연결이 닫혔을 때 발생합니다.

```javascript
ws.on('close', (event) => {
  console.log('Disconnected', event.code, event.reason);
});
```

### error
에러가 발생했을 때 발생합니다.

```javascript
ws.on('error', (error) => {
  console.error('Error:', error);
});
```

### reconnect
재연결을 시도할 때 발생합니다.

```javascript
ws.on('reconnect', ({ attempt, maxAttempts, delay }) => {
  console.log(`Reconnecting... (${attempt}/${maxAttempts}) in ${delay}ms`);
});
```

### reconnectFailed
최대 재연결 시도 횟수를 초과했을 때 발생합니다.

```javascript
ws.on('reconnectFailed', ({ attempt, maxAttempts }) => {
  console.error(`Failed to reconnect after ${attempt} attempts`);
});
```

## 메서드

### connect(url, protocols)
WebSocket 연결을 시작합니다.

```javascript
ws.connect('wss://api.languagemate.kr/ws');
```

### send(data)
메시지를 전송합니다.

```javascript
ws.send({ type: 'chat', message: 'Hello!' });
```

### close(code, reason)
연결을 닫습니다.

```javascript
ws.close(1000, 'Normal closure');
```

### isConnected()
연결 상태를 확인합니다.

```javascript
if (ws.isConnected()) {
  ws.send(message);
}
```

### enableReconnect()
재연결을 활성화합니다.

```javascript
ws.enableReconnect();
```

### disableReconnect()
재연결을 비활성화합니다.

```javascript
ws.disableReconnect();
```

### getReconnectAttempt()
현재 재연결 시도 횟수를 반환합니다.

```javascript
const attempts = ws.getReconnectAttempt();
```

### resetReconnectAttempt()
재연결 카운터를 리셋합니다.

```javascript
ws.resetReconnectAttempt();
```

## UI 통합 예시

### React Hook

```javascript
import { useEffect, useState } from 'react';
import { createWebSocketWithReconnect } from '@/utils/websocketReconnect';

export function useWebSocket(url, options = {}) {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectInfo, setReconnectInfo] = useState(null);

  useEffect(() => {
    const websocket = createWebSocketWithReconnect(url, options);

    websocket.on('open', () => {
      setIsConnected(true);
      setReconnectInfo(null);
    });

    websocket.on('close', () => {
      setIsConnected(false);
    });

    websocket.on('reconnect', (info) => {
      setReconnectInfo(info);
    });

    websocket.on('reconnectFailed', () => {
      setReconnectInfo(null);
      // 에러 알림 표시
    });

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [url]);

  return { ws, isConnected, reconnectInfo };
}
```

### 재연결 알림 UI

```jsx
function ReconnectNotification({ reconnectInfo }) {
  if (!reconnectInfo) return null;

  const { attempt, maxAttempts, delay } = reconnectInfo;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 p-4 rounded-lg">
      <p className="text-yellow-800">
        연결이 끊어졌습니다. 재연결 중... ({attempt}/{maxAttempts})
      </p>
      <p className="text-yellow-600 text-sm">
        {Math.round(delay / 1000)}초 후 재시도
      </p>
    </div>
  );
}
```

## Best Practices

### 1. 적절한 재연결 설정
```javascript
// ✅ 좋은 예: 점진적 백오프
const ws = createWebSocketWithReconnect(url, {
  maxReconnectAttempts: 10,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
});

// ❌ 나쁜 예: 너무 짧은 간격
const ws = createWebSocketWithReconnect(url, {
  reconnectDelay: 100, // 서버 과부하 유발 가능
});
```

### 2. Heartbeat 활용
```javascript
// ✅ 좋은 예: Heartbeat 활성화
const ws = createWebSocketWithReconnect(url, {
  pingInterval: 30000,
  pongTimeout: 10000,
});
```

### 3. 수동 연결 종료 처리
```javascript
// ✅ 좋은 예: 재연결 비활성화 후 종료
ws.disableReconnect();
ws.close();

// ❌ 나쁜 예: 재연결이 계속 시도됨
ws.close();
```

### 4. 메모리 누수 방지
```javascript
// ✅ 좋은 예: 컴포넌트 언마운트 시 정리
useEffect(() => {
  const ws = createWebSocketWithReconnect(url);

  return () => {
    ws.close();
  };
}, []);
```

## 디버깅

### 연결 상태 로깅
```javascript
ws.on('open', () => console.log('[WS] Connected'));
ws.on('close', () => console.log('[WS] Disconnected'));
ws.on('reconnect', (info) => console.log('[WS] Reconnecting...', info));
ws.on('error', (error) => console.error('[WS] Error:', error));
```

### 재연결 카운터 확인
```javascript
setInterval(() => {
  console.log('Reconnect attempts:', ws.getReconnectAttempt());
}, 1000);
```

## 주의사항

1. **서버 지원**: 서버가 Ping/Pong을 지원해야 Heartbeat 기능이 작동합니다
2. **브라우저 제한**: 일부 브라우저는 백그라운드에서 타이머를 제한할 수 있습니다
3. **네트워크 변경**: 네트워크 전환 시 자동 재연결이 트리거됩니다
4. **메모리**: 장시간 연결 시 메모리 누수를 방지하기 위해 리소스 정리가 필요합니다

## 추가 리소스

- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
- [WebSocket Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications)
