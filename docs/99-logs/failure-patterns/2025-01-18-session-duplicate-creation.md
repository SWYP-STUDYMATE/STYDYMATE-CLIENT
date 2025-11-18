# 세션 중복 생성 및 목록 누락 문제

**날짜**: 2025-01-18
**보고자**: 사용자
**심각도**: Medium
**상태**: ✅ 해결됨

---

## 📋 문제 설명

### 증상
1. **세션 중복 생성**: 화상 세션 1개만 생성했는데 음성 세션도 함께 생성됨
2. **세션 목록 누락**: 활성 세션이 있음에도 불구하고 화면에 표시되지 않음

### 영향받는 컴포넌트
- `SessionCreate.jsx` (세션 생성 페이지)
- `SessionList.jsx` (세션 목록 페이지)
- Workers API `/room/active` (활성 룸 목록 조회)

---

## 🔍 원인 분석

### 1. 세션 중복 생성 원인

#### 1.1 중복 클릭 (Primary)
```javascript
// ❌ 이전 코드 (문제)
const handleCreateSession = async () => {
  setIsCreating(true);  // ← React 상태 업데이트는 비동기
  // 상태가 true로 변경되기 전에 버튼을 두 번 클릭하면 중복 요청 발생
}
```

**문제점**:
- React 상태 업데이트는 비동기적으로 처리됨
- 네트워크가 느린 경우, `setIsCreating(true)` 실행 후에도 UI가 즉시 업데이트되지 않음
- 사용자가 1초 이내에 버튼을 두 번 클릭하면 두 번의 API 요청 발생

#### 1.2 네트워크 재시도 로직
```javascript
// src/utils/errorHandler.js - withRetry
- API 실패 시 자동 재시도
- 첫 요청이 타임아웃되었지만 실제로는 성공한 경우
- 재시도로 인한 중복 생성 가능
```

#### 1.3 이전 세션 캐시 미정리
```typescript
// WebRTCRoom.ts:561-566 - Durable Object Alarm
async alarm() {
  if (activeParticipants.length === 0) {
    await this.ctx.storage.deleteAll();
    await this.syncActiveRoomCache({ forceRemove: true });  // 1분 후 정리
  }
}
```

**문제점**:
- 빈 방은 생성 후 1분이 지나야 KV 캐시에서 삭제됨
- 빠르게 여러 세션을 생성/삭제하면 KV에 누적됨

### 2. 세션 목록 누락 원인

#### 2.1 네트워크 에러 시 빈 배열 반환
```javascript
// ❌ 이전 코드 (문제)
const loadActiveRooms = async () => {
  try {
    const response = await api.get('/room/active');
    setActiveRooms(rooms);
  } catch (error) {
    setActiveRooms([]);  // ← 모든 에러를 빈 배열로 처리
  }
};
```

**문제점**:
- 실제로는 세션이 있지만 API 요청 실패 시 아무것도 표시 안 됨
- 일시적인 네트워크 에러로 인해 사용자가 세션 목록을 볼 수 없음
- 에러 메시지를 사용자에게 보여주지 않아 원인 파악 불가

#### 2.2 디버깅 로그 부족
- 세션 생성/조회 과정에서 충분한 로그가 없음
- 어느 단계에서 문제가 발생했는지 추적 어려움

---

## ✅ 해결 방안

### 1. SessionCreate.jsx - 중복 클릭 방지 강화

#### 변경사항
```javascript
// ✅ 수정 후
import { useRef } from 'react';

// useRef를 사용한 즉시 차단
const isCreatingRef = useRef(false);
const creationTimestamp = useRef(null);

const handleCreateSession = async () => {
  const now = Date.now();

  // 1차 방어: 이미 생성 중인 경우 차단
  if (isCreatingRef.current) {
    log.warn('세션 생성 중복 요청 차단', { timestamp: now }, 'SESSION');
    return;
  }

  // 2차 방어: 1초 이내 재클릭 차단 (디바운싱)
  if (creationTimestamp.current && (now - creationTimestamp.current) < 1000) {
    log.warn('세션 생성 디바운스 차단', {
      lastAttempt: creationTimestamp.current,
      currentAttempt: now,
      difference: now - creationTimestamp.current
    }, 'SESSION');
    return;
  }

  // 플래그 설정 (React 상태보다 먼저)
  isCreatingRef.current = true;
  creationTimestamp.current = now;
  setIsCreating(true);

  try {
    // ... 세션 생성 로직
  } catch (err) {
    isCreatingRef.current = false;  // 에러 시 플래그 해제
  }
};
```

**개선 효과**:
- `useRef`는 동기적으로 업데이트되므로 즉시 차단 가능
- 1초 이내 재클릭 완전 차단
- 네트워크 타임아웃 시에도 중복 요청 방지

#### 추가 로깅
```javascript
log.info('세션 생성 시작', {
  roomType: sessionConfig.roomType,
  title: sessionConfig.title,
  timestamp: now
}, 'SESSION');

log.info('세션이 성공적으로 생성되었습니다', {
  roomId: roomData.roomId,
  roomType: sessionConfig.roomType,
  duration: Date.now() - now
}, 'SESSION');
```

### 2. SessionList.jsx - 에러 처리 개선

#### 변경사항
```javascript
// ✅ 수정 후
const [roomsError, setRoomsError] = useState(null);
const [lastLoadAttempt, setLastLoadAttempt] = useState(null);

const loadActiveRooms = async (isRetry = false) => {
  try {
    setRoomsError(null);
    setLastLoadAttempt(Date.now());

    const response = await api.get('/room/active');
    const validRooms = Array.isArray(rooms) ? rooms : [];

    setActiveRooms(validRooms);
    log.info('활성 룸 목록 조회 완료', {
      count: validRooms.length,
      rooms: validRooms.map(r => ({
        roomId: r.roomId,
        type: r.roomType,
        participants: `${r.currentParticipants}/${r.maxParticipants}`
      }))
    }, 'SESSION_LIST');

  } catch (error) {
    if (error.response?.status === 404) {
      setActiveRooms([]);
      setRoomsError(null);
    } else {
      const errorMessage = error.response?.data?.message || error.message;

      setRoomsError({
        message: errorMessage,
        status: error.response?.status,
        canRetry: error.response?.status !== 403 && error.response?.status !== 401
      });

      // 이전 데이터 유지 (있는 경우)
      if (!isRetry && activeRooms.length > 0) {
        log.info('이전 세션 목록 유지', { count: activeRooms.length }, 'SESSION_LIST');
      } else {
        setActiveRooms([]);
      }
    }
  }
};
```

**개선 효과**:
- 에러 발생 시 사용자에게 명확한 메시지 표시
- 재시도 가능 여부 판단 (403, 401은 재시도 불가)
- 이전에 로드한 세션 목록 유지 (캐싱)
- 상세한 에러 정보 로깅

#### UI 에러 표시
```jsx
{roomsError && !loadingRooms && (
  <div className="bg-[rgba(234,67,53,0.1)] border border-[var(--red)] rounded-lg p-4 mb-4">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-[var(--red)]" />
      <div className="flex-1">
        <p className="text-[var(--red)] text-[14px] font-medium">
          세션 목록을 불러올 수 없습니다
        </p>
        <p className="text-[var(--black-300)] text-[12px]">
          {roomsError.message} (에러 코드: {roomsError.status})
        </p>
        {roomsError.canRetry && (
          <CommonButton onClick={() => loadActiveRooms(true)}>
            다시 시도
          </CommonButton>
        )}
      </div>
    </div>
  </div>
)}
```

---

## 🎯 적용된 패턴

### 1. useRef를 활용한 즉시 차단 패턴
```javascript
// React 19 안전 패턴
const isProcessingRef = useRef(false);

const handleAction = async () => {
  if (isProcessingRef.current) return;  // 즉시 차단
  isProcessingRef.current = true;

  try {
    await doSomething();
  } finally {
    isProcessingRef.current = false;
  }
};
```

### 2. 디바운싱 패턴
```javascript
const lastAttemptRef = useRef(null);
const DEBOUNCE_MS = 1000;

if (lastAttemptRef.current && (now - lastAttemptRef.current) < DEBOUNCE_MS) {
  return;  // 디바운스 차단
}
lastAttemptRef.current = now;
```

### 3. 에러 복구 패턴
```javascript
catch (error) {
  setError(error);
  // 이전 데이터 유지 (있는 경우)
  if (!isRetry && previousData.length > 0) {
    // 데이터를 비우지 않고 유지
  }
}
```

### 4. 상세 로깅 패턴
```javascript
log.info('작업 시작', { params, timestamp: Date.now() }, 'CATEGORY');
// ... 작업 수행
log.info('작업 완료', { result, duration: Date.now() - start }, 'CATEGORY');
```

---

## 📊 테스트 시나리오

### 1. 중복 클릭 방지 테스트
- [x] 세션 생성 버튼을 빠르게 두 번 클릭
- [x] 네트워크가 느린 상황에서 버튼 클릭
- [x] 로그에서 "중복 요청 차단" 메시지 확인

### 2. 에러 처리 테스트
- [x] Wi-Fi 끊고 세션 목록 조회
- [x] 에러 메시지 표시 확인
- [x] "다시 시도" 버튼 작동 확인
- [x] 이전 데이터 유지 확인

### 3. 로깅 테스트
- [x] 개발자 콘솔에서 로그 확인
- [x] 세션 생성 전체 과정 추적 가능 확인
- [x] 에러 발생 시 상세 정보 기록 확인

---

## 📝 배운 점

### 1. React 상태 업데이트는 비동기
- `setState`는 즉시 실행되지 않음
- 중요한 플래그는 `useRef` 사용 권장
- `isCreating` 상태는 UI 표시용으로만 사용

### 2. 에러는 사용자에게 보여줘야 함
- 빈 화면보다 에러 메시지가 낫다
- 재시도 옵션 제공으로 UX 개선
- 이전 데이터 유지로 사용자 경험 보존

### 3. 로깅은 필수
- 문제 재현이 어려운 경우 로그가 유일한 단서
- timestamp, duration 등 정량적 데이터 포함
- 성공/실패 모두 로깅

### 4. 방어적 프로그래밍
- 중복 클릭, 네트워크 에러 등 예외 상황 대비
- 여러 레벨의 방어막 구축 (useRef + 디바운싱)
- graceful degradation (이전 데이터 유지)

---

## 🔗 관련 파일

- `src/pages/Session/SessionCreate.jsx` (292-427줄)
- `src/pages/Session/SessionList.jsx` (61-116줄, 492-523줄)
- `workers/src/routes/webrtc.ts` (13-63줄)
- `workers/src/durable/WebRTCRoom.ts` (639-669줄)
- `workers/src/utils/activeRooms.ts`

---

## 🚀 추가 개선 사항 (향후)

1. **Idempotency Key 추가**
   - 세션 생성 요청에 고유 키 추가
   - 백엔드에서 중복 요청 필터링

2. **세션 캐시 TTL 단축**
   - 현재: 빈 방 1분 후 정리
   - 제안: 30초로 단축

3. **WebSocket을 통한 실시간 목록 업데이트**
   - 새 세션 생성 시 실시간으로 목록에 추가
   - 세션 종료 시 자동으로 목록에서 제거

4. **Optimistic UI 적용**
   - 세션 생성 즉시 UI에 표시
   - API 응답 대기 없이 빠른 피드백

---

**작성자**: Claude Code
**검토자**: 개발 팀
**마지막 업데이트**: 2025-01-18
