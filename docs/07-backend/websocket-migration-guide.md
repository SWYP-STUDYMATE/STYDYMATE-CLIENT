# WebSocket 통합 마이그레이션 가이드

## 개요
프로젝트의 WebSocket 구현을 통합하여 일관성 있는 실시간 통신 레이어를 구축합니다.

## 현재 상태 (Before)

### 사용 중인 라이브러리
1. **SockJS Client** (`sockjs-client`) - 실제 사용 중
2. **STOMP.js** (`@stomp/stompjs`) - 실제 사용 중
3. **Socket.IO Client** (`socket.io-client`) - 설치되어 있으나 미사용

### 문제점
- 중복된 WebSocket 서비스 (`websocketService.js`, `notificationWebSocket.js`)
- Socket.IO는 설치만 되어있고 실제로 사용되지 않음
- WebRTC signaling에 네이티브 WebSocket 사용
- 통합되지 않은 구독 관리

## 통합 후 (After)

### 통합 WebSocket 서비스
`src/services/unifiedWebSocketService.js`

#### 주요 기능
1. **단일 연결 관리**
   - 하나의 STOMP 클라이언트로 모든 실시간 통신 처리
   - 자동 재연결 및 하트비트

2. **통합 구독 관리**
   - 채널별 구독/구독취소
   - 메시지 핸들러 중앙 관리

3. **메시지 큐잉**
   - 연결 끊김 시 메시지 버퍼링
   - 재연결 시 자동 전송

4. **이벤트 기반 아키텍처**
   - CustomEvent를 통한 컴포넌트 통신
   - 리스너 패턴 구현

## 마이그레이션 단계

### 1단계: 기존 서비스 통합
```javascript
// Before - 개별 서비스
import websocketService from './services/websocketService';
import notificationWebSocket from './services/notificationWebSocket';

// After - 통합 서비스
import unifiedWebSocketService from './services/unifiedWebSocketService';
```

### 2단계: 연결 초기화
```javascript
// 앱 시작 시 한 번만 연결
useEffect(() => {
  unifiedWebSocketService.connect()
    .then(() => console.log('WebSocket connected'))
    .catch(err => console.error('WebSocket connection failed:', err));
    
  return () => {
    unifiedWebSocketService.disconnect();
  };
}, []);
```

### 3단계: 구독 관리
```javascript
// 컴포넌트에서 구독
useEffect(() => {
  // 구독
  const unsubscribe = unifiedWebSocketService.subscribe(
    '/user/queue/messages',
    (message) => {
      console.log('Received:', message);
    }
  );
  
  // 클린업
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);
```

### 4단계: 이벤트 리스너
```javascript
// 글로벌 이벤트 리스닝
useEffect(() => {
  const handleNotification = (event) => {
    const notification = event.detail;
    // 알림 처리
  };
  
  window.addEventListener('ws:notification', handleNotification);
  
  return () => {
    window.removeEventListener('ws:notification', handleNotification);
  };
}, []);
```

## API 변경사항

### 채팅
```javascript
// Before
websocketService.subscribe(`/topic/chat/${roomId}`, callback);
websocketService.send(`/app/chat.send.${roomId}`, message);

// After
unifiedWebSocketService.joinChatRoom(roomId);
unifiedWebSocketService.sendChatMessage(roomId, message);
```

### 알림
```javascript
// Before
notificationWebSocket.subscribe('/user/queue/notifications', callback);

// After
// 자동으로 구독됨, 이벤트로 수신
window.addEventListener('ws:notification', (e) => {
  const notification = e.detail;
});
```

### 연결 상태
```javascript
// 연결 상태 확인
const state = unifiedWebSocketService.getConnectionState();
console.log(state.isConnected);

// 연결 변경 감지
unifiedWebSocketService.onConnectionChange((status) => {
  if (status === 'connected') {
    // 연결됨
  } else if (status === 'disconnected') {
    // 연결 끊김
  }
});
```

## 제거 대상

### 삭제할 파일
- `src/services/websocketService.js` (통합 후)
- `src/services/notificationWebSocket.js` (통합 후)

### 패키지 정리
```bash
# Socket.IO 제거 (미사용)
npm uninstall socket.io-client

# 필요한 패키지만 유지
# - sockjs-client
# - @stomp/stompjs
```

## WebRTC 시그널링

WebRTC는 별도의 네이티브 WebSocket을 계속 사용합니다:
- P2P 연결을 위한 저지연 시그널링 필요
- Cloudflare Workers를 통한 엣지 처리
- STOMP 프로토콜 오버헤드 없이 직접 통신

## 성능 최적화

### 연결 풀링
- 단일 WebSocket 연결로 모든 채널 관리
- 하트비트로 연결 유지

### 메시지 배칭
- 짧은 시간 내 여러 메시지를 배치로 전송
- 네트워크 요청 최소화

### 자동 재연결
- 지수 백오프 알고리즘
- 최대 재시도 횟수 제한

## 모니터링

### 연결 상태 로깅
```javascript
// 개발 환경에서 디버그 활성화
unifiedWebSocketService.connect({ debug: true });
```

### 메트릭 수집
- 연결 시도/성공/실패 횟수
- 메시지 전송/수신 카운트
- 재연결 빈도

## 테스트 체크리스트

- [ ] WebSocket 연결 성공
- [ ] 자동 재연결 동작
- [ ] 메시지 큐잉 및 재전송
- [ ] 채팅 기능 정상 작동
- [ ] 알림 수신 정상
- [ ] 매칭 업데이트 수신
- [ ] 세션 업데이트 수신
- [ ] 시스템 메시지 수신
- [ ] 메모리 누수 없음
- [ ] 연결 해제 시 정리

## 참고사항

- STOMP 프로토콜 사양: https://stomp.github.io/
- SockJS 폴백 메커니즘 활용
- 기존 STOMP 엔드포인트와 호환성 유지
