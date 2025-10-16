# 채팅 기능 디버깅 가이드

## 🐛 문제 상황
채팅창은 열리지만 메시지를 보내도 화면에 아무것도 표시되지 않는 문제

## 🔍 디버깅 로그 추가 완료

다음 파일들에 상세한 디버깅 로그가 추가되었습니다:

### 1. ChatWindow.jsx
- WebSocket 클라이언트 초기화 로그
- 메시지 전송 로그
- 채팅 히스토리 로드 로그
- 새 메시지 수신 로그

### 2. websocketService.js
- WebSocket 연결 시작 로그
- 메시지 전송 로그
- 연결 상태 확인 로그

## 📋 디버깅 체크리스트

배포된 사이트 (https://languagemate.kr/chat)에서 다음을 확인하세요:

### 1단계: 브라우저 개발자 도구 열기
```
F12 또는 우클릭 → 검사
Console 탭으로 이동
```

### 2단계: 채팅방 생성/참여
1. "새 채팅방" 버튼 클릭
2. 채팅방 생성
3. Console에서 다음 로그 확인:

**기대되는 로그 순서:**
```
[ChatWindow] 채팅방 초기화 시작 <roomId>
[ChatWindow] 채팅 히스토리 로드 완료 <count>
[ChatWindow] WebSocket 클라이언트 초기화 시작
[WebSocketService] WebSocket 연결 시작
[WebSocketService] 이미 연결 중이거나 연결됨  (또는 새 연결)
[ChatWindow] WebSocket 클라이언트 초기화 완료 <client object>
```

### 3단계: 메시지 전송 시도
1. 입력창에 "테스트" 입력
2. Enter 키 또는 전송 버튼 클릭
3. Console에서 다음 로그 확인:

**기대되는 로그:**
```
[ChatWindow] sendMessage 호출됨 {text: "테스트", images: Array(0), audioData: null}
[WebSocketService] send 호출 {destination: "/pub/chat/message", isConnected: true, ...}
[WebSocketService] 메시지 전송 성공
[ChatWindow] 메시지 전송 완료
[ChatWindow] 새 메시지 수신 <message object>
```

## ⚠️ 가능한 에러 시나리오

### 시나리오 1: WebSocket 연결 실패
**증상:**
```
[WebSocketService] WebSocket 연결 안 됨. 메시지 큐에 추가
```

**원인:**
- Workers 백엔드 WebSocket 엔드포인트 문제
- CORS 설정 문제
- JWT 토큰 만료

**해결:**
1. https://api.languagemate.kr/health 확인
2. localStorage에서 accessToken 확인
3. 페이지 새로고침 (토큰 갱신)

### 시나리오 2: 클라이언트가 null
**증상:**
```
[ChatWindow] WebSocket 클라이언트가 없습니다
```

**원인:**
- initStompClient가 실패하여 clientRef.current가 null
- useEffect가 제대로 실행되지 않음

**해결:**
1. Network 탭에서 WebSocket 연결 확인
2. Console에서 에러 메시지 확인
3. 페이지 새로고침

### 시나리오 3: 메시지는 전송되지만 화면에 표시 안 됨
**증상:**
```
[WebSocketService] 메시지 전송 성공
[ChatWindow] 메시지 전송 완료
(하지만 "새 메시지 수신" 로그 없음)
```

**원인:**
- WebSocket 구독이 제대로 안 됨
- 백엔드에서 메시지 브로드캐스트 실패

**해결:**
1. Network 탭 → WS 탭에서 WebSocket 프레임 확인
2. 구독 메시지 확인:
   ```
   SUBSCRIBE
   destination:/sub/chat/room/<roomId>
   id:<subscription-id>
   ```
3. Workers 로그 확인 필요

## 🔧 수동 테스트 방법

### Console에서 직접 WebSocket 상태 확인
```javascript
// WebSocket 연결 상태
console.log('localStorage:', {
  accessToken: localStorage.getItem('accessToken')?.substring(0, 20) + '...',
  userId: localStorage.getItem('userId')
});

// 현재 채팅방 상태 (ChatWindow가 마운트된 상태에서)
// React DevTools에서 ChatWindow 컴포넌트의 ref 확인
```

### Network 탭에서 WebSocket 확인
1. Network 탭 열기
2. WS (WebSocket) 필터 선택
3. `wss://api.languagemate.kr/ws/chat` 연결 확인
4. Messages 하위 탭에서 프레임 확인:
   - CONNECT 프레임 (초록색 ↑)
   - CONNECTED 프레임 (초록색 ↓)
   - SUBSCRIBE 프레임 (초록색 ↑)
   - SEND 프레임 (초록색 ↑)
   - MESSAGE 프레임 (초록색 ↓)

## 📤 다음 단계

위의 로그를 확인한 후, 다음 정보를 제공해주세요:

1. **Console에 출력된 모든 로그** (스크린샷 또는 복사)
2. **에러 메시지** (빨간색으로 표시된 것들)
3. **Network 탭의 WS 연결 상태**
4. **메시지 전송 시도 시 나타나는 로그**

이 정보를 바탕으로 정확한 문제를 파악하고 해결할 수 있습니다.

## 🚀 배포 방법

디버깅 로그가 포함된 버전을 배포하려면:

```bash
npm run build
# Cloudflare Pages에 배포
```

배포 후 https://languagemate.kr/chat 에서 F12를 눌러 Console을 확인하세요.
