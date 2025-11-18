# STUDYMATE 백엔드 개발 가이드

**최종 업데이트**: 2025-01-13

## 📋 개요

STUDYMATE 프로젝트의 백엔드 개발 가이드입니다. Cloudflare Workers 기반 백엔드의 핵심 기능과 Best Practices를 다룹니다.

### 주요 내용
- **AI 캐싱 시스템**: KV 기반 AI 응답 캐싱
- **입력 검증**: Zod를 사용한 타입 안전 검증
- **WebSocket 통합**: 실시간 통신 아키텍처
- **Best Practices**: 백엔드 개발 모범 사례

---

## 🤖 AI 캐싱 시스템

AI 모델 API 호출 비용을 절감하고 응답 속도를 개선하기 위한 KV 기반 캐싱 시스템입니다.

### 주요 기능

#### 1. 자동 캐시 관리
- KV 기반 분산 캐시 저장
- TTL(Time To Live) 자동 관리
- LRU(Least Recently Used) 기반 정리

#### 2. 메트릭 추적
- 캐시 히트/미스 통계
- 모델별 캐시 사용량
- 히트율 자동 계산

#### 3. 유연한 캐시 전략
- 모델별 TTL 설정
- 캐시 무효화 전략
- 강제 갱신 옵션

### 기본 사용법

```typescript
import { CachedAIService } from '../services/cachedAI';

// 환경 변수에서 KV 네임스페이스 가져오기
const cachedAI = new CachedAIService(env.AI_CACHE);

// 번역 (자동 캐싱)
const translated = await cachedAI.translateText(
  'Hello, world!',
  'en',
  'ko'
);

// 레벨 테스트 평가 (자동 캐싱)
const evaluation = await cachedAI.evaluateLevelTest(answers);

// 발음 평가 (자동 캐싱)
const pronunciationScore = await cachedAI.evaluatePronunciation(
  audioUrl,
  'Hello'
);
```

### 캐시 옵션

```typescript
// 캐시 비활성화
const result = await cachedAI.translateText('text', 'en', 'ko', {
  enableCache: false,
});

// 강제 갱신 (캐시 무시하고 새로 호출)
const freshResult = await cachedAI.translateText('text', 'en', 'ko', {
  forceRefresh: true,
});

// 커스텀 TTL 설정
const result = await cachedAI.translateText('text', 'en', 'ko', {
  ttl: 7200, // 2시간
});
```

### TTL 프리셋

```typescript
import { CacheTTL } from '../utils/aiCache';

CacheTTL.SHORT       // 5분 - 실시간성 중요
CacheTTL.MEDIUM      // 30분 - 일반적인 경우
CacheTTL.LONG        // 1시간 - 자주 변경되지 않음
CacheTTL.VERY_LONG   // 24시간 - 거의 변경되지 않음
```

### 모델별 권장 전략

| 모델 | TTL | 이유 |
|------|-----|------|
| 번역 | 30분 | 같은 문장이 자주 번역됨 |
| 레벨 테스트 | 1시간 | 답변이 같으면 결과 동일 |
| 매칭 추천 | 5분 | 실시간 사용자 상태 반영 |
| 발음 평가 | 30분 | 동일 음성 재평가 가능 |
| 학습 분석 | 24시간 | 히스토리 기반 분석 |
| 대화 요약 | 24시간 | 대화 내용 불변 |

### 캐시 키 생성

캐시 키는 다음 요소로 자동 생성됩니다:

```
{namespace}:{model}:{hash}
```

- **namespace**: 캐시 구분 (기본값: `ai_cache`)
- **model**: AI 모델 이름
- **hash**: SHA-256 해시 (prompt + parameters)

예시:
```
ai_cache:translation:a3b5c7d9e1f2...
ai_cache:level-test:f9e8d7c6b5a4...
```

### AICacheManager 직접 사용

```typescript
import { AICacheManager, CacheTTL } from '../utils/aiCache';

const cacheManager = new AICacheManager(env.AI_CACHE);

// 캐시 조회
const cached = await cacheManager.get<string>(
  'translation',
  'Translate: Hello',
  { lang: 'ko' }
);

// 캐시 저장
await cacheManager.set(
  'translation',
  'Translate: Hello',
  '안녕하세요',
  { lang: 'ko' },
  CacheTTL.MEDIUM
);

// 특정 모델 캐시 무효화
await cacheManager.invalidateModel('translation');

// 패턴 기반 무효화
await cacheManager.invalidatePattern('translation', /user-123/);

// 모든 캐시 삭제
await cacheManager.clear();

// 메트릭 조회
const metrics = await cacheManager.getMetrics();
console.log(`히트율: ${metrics.hitRate * 100}%`);

// 통계 조회
const stats = await cacheManager.getStats();
console.log(`총 엔트리: ${stats.entryCount}`);

// LRU 기반 정리
await cacheManager.cleanup(1000); // 최대 1000개 유지
```

### 관리자 API

#### 캐시 메트릭 조회
```bash
GET /admin/cache/metrics

Response:
{
  "success": true,
  "data": {
    "totalHits": 1250,
    "totalMisses": 350,
    "hitRate": 0.78125,
    "totalSize": 524288,
    "entryCount": 150
  }
}
```

#### 모델별 캐시 무효화
```bash
DELETE /admin/cache/model/translation

Response:
{
  "success": true,
  "message": "Cache invalidated for model: translation"
}
```

#### 전체 캐시 삭제
```bash
DELETE /admin/cache/all

Response:
{
  "success": true,
  "message": "All cache cleared"
}
```

### 환경 설정

#### wrangler.toml
```toml
[[kv_namespaces]]
binding = "AI_CACHE"
id = "your-kv-namespace-id"
```

#### Workers 환경 변수
```typescript
interface Env {
  AI_CACHE: KVNamespace;
}
```

### 성능 최적화

#### TTL 튜닝
```typescript
// 자주 변경되는 데이터: 짧은 TTL
await cachedAI.getMatchingRecommendations(userId, preferences, {
  ttl: CacheTTL.SHORT, // 5분
});

// 거의 변경되지 않는 데이터: 긴 TTL
await cachedAI.summarizeConversation(messages, {
  ttl: CacheTTL.VERY_LONG, // 24시간
});
```

#### 캐시 워밍
```typescript
// 자주 사용되는 번역 미리 캐싱
const commonPhrases = [
  'Hello',
  'Thank you',
  'Good morning',
];

for (const phrase of commonPhrases) {
  await cachedAI.translateText(phrase, 'en', 'ko');
}
```

#### 주기적 정리
```typescript
// Cron Trigger로 주기적 정리
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    const cacheManager = new AICacheManager(env.AI_CACHE);
    await cacheManager.cleanup(1000);
  },
};
```

---

## ✅ 입력 검증 (Zod)

Zod를 사용하여 타입 안전한 입력 검증을 제공합니다.

### 주요 기능

#### 1. 타입 안전성
- TypeScript와 완벽한 통합
- 런타임 검증 + 컴파일 타임 타입 체크
- 자동 타입 추론

#### 2. 선언적 스키마
- 명확하고 읽기 쉬운 검증 규칙
- 재사용 가능한 스키마 정의
- 복잡한 검증 로직 표현 가능

#### 3. 상세한 에러 메시지
- 필드별 에러 메시지
- 사용자 친화적 에러 포맷
- 다국어 에러 메시지 지원

### 스키마 정의

#### 기본 스키마
```typescript
// src/schemas/user.ts
import { z } from 'zod';

export const userProfileSchema = z.object({
  englishName: z.string().min(1, 'Name is required').max(50),
  email: z.string().email('Invalid email format'),
  age: z.number().int().min(13, 'Must be at least 13 years old'),
  residence: z.string().optional(),
});

// 타입 추출
export type UserProfile = z.infer<typeof userProfileSchema>;
```

#### 중첩 객체
```typescript
export const updateProfileSchema = z.object({
  profile: z.object({
    name: z.string().min(1),
    bio: z.string().max(500),
  }),
  preferences: z.object({
    language: z.enum(['ko', 'en', 'ja']),
    theme: z.enum(['light', 'dark']).optional(),
  }),
});
```

#### 배열 검증
```typescript
export const interestsSchema = z.object({
  interests: z
    .array(z.string())
    .min(1, 'Select at least one interest')
    .max(10, 'Maximum 10 interests allowed'),
});
```

#### 조건부 검증 (refine)
```typescript
export const ageRangeSchema = z
  .object({
    minAge: z.number().int().min(13),
    maxAge: z.number().int().max(100),
  })
  .refine((data) => data.minAge <= data.maxAge, {
    message: 'Min age must be less than or equal to max age',
    path: ['minAge'], // 에러를 표시할 필드
  });
```

### 미들웨어 사용

#### Body 검증
```typescript
import { Hono } from 'hono';
import { validateBody, getValidatedBody } from '../middleware/validate';
import { updateProfileSchema, type UpdateProfileInput } from '../schemas/user';

const app = new Hono();

app.post('/profile', validateBody(updateProfileSchema), async (c) => {
  // 타입 안전하게 검증된 데이터 가져오기
  const data = getValidatedBody<UpdateProfileInput>(c);

  // data는 UpdateProfileInput 타입으로 추론됨
  console.log(data.englishName); // ✅ Type-safe

  return c.json({ success: true });
});
```

#### Query Parameters 검증
```typescript
import { validateQuery, getValidatedQuery } from '../middleware/validate';
import { z } from 'zod';

const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)),
  search: z.string().optional(),
});

app.get('/users', validateQuery(querySchema), async (c) => {
  const query = getValidatedQuery<z.infer<typeof querySchema>>(c);

  console.log(query.page); // number 타입
  console.log(query.limit); // number 타입

  return c.json({ success: true });
});
```

#### 복합 검증
```typescript
import { validateAll } from '../middleware/validate';
import { z } from 'zod';

const bodySchema = z.object({ name: z.string() });
const querySchema = z.object({ page: z.string() });
const paramsSchema = z.object({ id: z.string().uuid() });

app.post(
  '/users/:id',
  validateAll({
    body: bodySchema,
    query: querySchema,
    params: paramsSchema,
  }),
  async (c) => {
    const body = getValidatedBody(c);
    const query = getValidatedQuery(c);
    const params = getValidatedParams(c);

    return c.json({ success: true });
  }
);
```

### 스키마 예시

#### Auth 스키마
```typescript
// src/schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

#### Chat 스키마
```typescript
// src/schemas/chat.ts
import { z } from 'zod';

export const sendMessageSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  messageType: z.enum(['text', 'image', 'audio', 'file']).default('text'),
  fileUrl: z.string().url().optional(),
});

export const createRoomSchema = z.object({
  roomType: z.enum(['direct', 'group']),
  roomName: z.string().min(1).max(100).optional(),
  participantIds: z
    .array(z.string().uuid())
    .min(1)
    .max(50),
});
```

#### Matching 스키마
```typescript
// src/schemas/matching.ts
import { z } from 'zod';

export const matchFilterSchema = z.object({
  gender: z.enum(['any', 'male', 'female']).optional(),
  ageMin: z.number().int().min(13).optional(),
  ageMax: z.number().int().max(100).optional(),
  languages: z.array(z.string()).optional(),
  online: z.boolean().optional(),
});

export const createMatchRequestSchema = z.object({
  targetUserId: z.string().uuid(),
  message: z.string().max(200).optional(),
});
```

### 에러 처리

#### 에러 응답 형식
검증 실패 시 다음과 같은 형식으로 응답됩니다:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "email": ["Invalid email format"],
      "password": [
        "Password must be at least 8 characters",
        "Password must contain uppercase, lowercase, and number"
      ]
    }
  }
}
```

#### 커스텀 에러 메시지
```typescript
const schema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  age: z.number().min(18, '만 18세 이상만 가입 가능합니다'),
});
```

#### 에러 핸들러
```typescript
import { AppError } from '../utils/errors';

try {
  const data = schema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    const formattedErrors = formatZodErrors(error);
    throw new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }
}
```

### 고급 기능

#### Transform
```typescript
const schema = z.object({
  age: z.string().transform((val) => parseInt(val, 10)),
  email: z.string().toLowerCase().email(),
  createdAt: z.string().transform((val) => new Date(val)),
});
```

#### Partial & Pick
```typescript
// 모든 필드 optional
const partialSchema = userSchema.partial();

// 특정 필드만 선택
const pickSchema = userSchema.pick({ name: true, email: true });

// 특정 필드 제외
const omitSchema = userSchema.omit({ password: true });
```

---

## 🌐 WebSocket 통합

실시간 통신을 위한 WebSocket 아키텍처입니다.

### 현재 상태

#### 사용 중인 라이브러리
- **SockJS Client** (`sockjs-client`) - 실제 사용 중
- **STOMP.js** (`@stomp/stompjs`) - 실제 사용 중

#### 통합 WebSocket 서비스
`src/services/unifiedWebSocketService.js`

### 주요 기능

#### 1. 단일 연결 관리
- 하나의 STOMP 클라이언트로 모든 실시간 통신 처리
- 자동 재연결 및 하트비트

#### 2. 통합 구독 관리
- 채널별 구독/구독취소
- 메시지 핸들러 중앙 관리

#### 3. 메시지 큐잉
- 연결 끊김 시 메시지 버퍼링
- 재연결 시 자동 전송

#### 4. 이벤트 기반 아키텍처
- CustomEvent를 통한 컴포넌트 통신
- 리스너 패턴 구현

### 사용 방법

#### 연결 초기화
```javascript
import unifiedWebSocketService from './services/unifiedWebSocketService';

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

#### 구독 관리
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

#### 이벤트 리스너
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

### API 예시

#### 채팅
```javascript
// 채팅방 참가
unifiedWebSocketService.joinChatRoom(roomId);

// 메시지 전송
unifiedWebSocketService.sendChatMessage(roomId, message);
```

#### 알림
```javascript
// 자동으로 구독됨, 이벤트로 수신
window.addEventListener('ws:notification', (e) => {
  const notification = e.detail;
  // 알림 처리
});
```

#### 연결 상태
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

### WebSocket 재연결

#### 주요 기능

**1. 자동 재연결**
- 지수 백오프(Exponential Backoff): 재연결 시도 간격이 점진적으로 증가
- Jitter: 랜덤 지연 추가로 서버 과부하 방지
- 최대 재연결 시도: 설정 가능한 최대 재연결 횟수

**2. 연결 품질 모니터링**
- Ping/Pong Heartbeat: 주기적 연결 확인
- 연결 타임아웃 감지: 응답 없는 연결 자동 감지 및 재연결
- Latency 측정: 연결 품질 실시간 측정

**3. 이벤트 기반 아키텍처**
- 연결 상태 변화 이벤트
- 재연결 이벤트
- 에러 이벤트

#### 기본 사용
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

#### 재연결 옵션

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxReconnectAttempts` | `number` | `10` | 최대 재연결 시도 횟수 |
| `reconnectDelay` | `number` | `1000` | 초기 재연결 지연 시간 (ms) |
| `maxReconnectDelay` | `number` | `30000` | 최대 재연결 지연 시간 (ms) |
| `pingInterval` | `number` | `30000` | Ping 전송 간격 (ms) |
| `pongTimeout` | `number` | `10000` | Pong 응답 대기 시간 (ms) |

#### 재연결 전략 (Exponential Backoff)

재연결 시도 간격이 점진적으로 증가합니다:

```
Attempt 1: 1000ms + jitter
Attempt 2: 2000ms + jitter
Attempt 3: 4000ms + jitter
Attempt 4: 8000ms + jitter
Attempt 5: 16000ms + jitter
Attempt 6: 30000ms (max) + jitter
```

#### Heartbeat (Ping/Pong)

**작동 원리**:
1. Ping 전송: 주기적으로 (기본 30초) "ping" 메시지 전송
2. Pong 대기: 서버로부터 "pong" 응답 대기 (기본 10초)
3. 타임아웃 처리: Pong이 도착하지 않으면 연결이 죽은 것으로 간주하고 재연결

**서버 측 구현**:
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

#### React Hook 예시
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

#### 재연결 알림 UI
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

### WebRTC 시그널링

WebRTC는 별도의 네이티브 WebSocket을 계속 사용합니다:
- P2P 연결을 위한 저지연 시그널링 필요
- Cloudflare Workers를 통한 엣지 처리
- STOMP 프로토콜 오버헤드 없이 직접 통신

### 성능 최적화

#### 연결 풀링
- 단일 WebSocket 연결로 모든 채널 관리
- 하트비트로 연결 유지

#### 메시지 배칭
- 짧은 시간 내 여러 메시지를 배치로 전송
- 네트워크 요청 최소화

#### 자동 재연결
- 지수 백오프 알고리즘
- 최대 재연결 횟수 제한

---

## 🎯 Best Practices

### AI 캐싱

#### 적절한 TTL 설정
```typescript
// ✅ 좋은 예: 데이터 특성에 맞는 TTL
await cachedAI.translateText('text', 'en', 'ko', {
  ttl: CacheTTL.MEDIUM, // 번역은 자주 변경되지 않음
});

// ❌ 나쁜 예: 모든 데이터에 동일한 TTL
await cachedAI.getMatchingRecommendations(userId, preferences, {
  ttl: CacheTTL.VERY_LONG, // 실시간 데이터인데 24시간 캐싱
});
```

#### 캐시 무효화
```typescript
// ✅ 좋은 예: 데이터 변경 시 즉시 무효화
async function updateUserPreferences(userId: string, preferences: any) {
  await db.updatePreferences(userId, preferences);
  await cacheManager.invalidateModel('matching'); // 관련 캐시 무효화
}

// ❌ 나쁜 예: 무효화하지 않음
async function updateUserPreferences(userId: string, preferences: any) {
  await db.updatePreferences(userId, preferences);
  // 오래된 캐시 데이터가 계속 사용됨
}
```

### 입력 검증

#### 스키마 재사용
```typescript
// ✅ 좋은 예: 기본 스키마 정의 후 확장
const baseUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8),
});

const updateUserSchema = baseUserSchema.partial();
```

#### 명확한 에러 메시지
```typescript
// ✅ 좋은 예: 사용자 친화적 메시지
z.string().min(1, '이름을 입력해주세요');

// ❌ 나쁜 예: 기술적 메시지
z.string().min(1);
```

#### 검증 로직 분리
```typescript
// ✅ 좋은 예: 스키마를 별도 파일로 관리
// src/schemas/user.ts
export const userSchema = z.object({ ... });

// src/routes/user.ts
import { userSchema } from '../schemas/user';
```

### WebSocket

#### 적절한 재연결 설정
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

#### Heartbeat 활용
```javascript
// ✅ 좋은 예: Heartbeat 활성화
const ws = createWebSocketWithReconnect(url, {
  pingInterval: 30000,
  pongTimeout: 10000,
});
```

#### 수동 연결 종료 처리
```javascript
// ✅ 좋은 예: 재연결 비활성화 후 종료
ws.disableReconnect();
ws.close();

// ❌ 나쁜 예: 재연결이 계속 시도됨
ws.close();
```

#### 메모리 누수 방지
```javascript
// ✅ 좋은 예: 컴포넌트 언마운트 시 정리
useEffect(() => {
  const ws = createWebSocketWithReconnect(url);

  return () => {
    ws.close();
  };
}, []);
```

---

## 📌 주의사항

### AI 캐싱
1. **KV 제한**: Cloudflare KV는 초당 1000회 쓰기 제한
2. **키 크기**: 캐시 키는 512바이트 이내
3. **값 크기**: KV 값은 25MB 이내
4. **TTL 최소값**: 60초 이상 권장
5. **비용**: KV 읽기/쓰기 비용 고려

### 입력 검증
1. **성능**: 복잡한 스키마는 검증 시간이 오래 걸릴 수 있음
2. **타입 추론**: 너무 복잡한 스키마는 타입 추론이 느려질 수 있음
3. **에러 메시지**: 다국어 지원 시 메시지 관리 필요
4. **버전 관리**: Zod 버전 업그레이드 시 Breaking Changes 확인

### WebSocket
1. **서버 지원**: 서버가 Ping/Pong을 지원해야 Heartbeat 기능이 작동합니다
2. **브라우저 제한**: 일부 브라우저는 백그라운드에서 타이머를 제한할 수 있습니다
3. **네트워크 변경**: 네트워크 전환 시 자동 재연결이 트리거됩니다
4. **메모리**: 장시간 연결 시 메모리 누수를 방지하기 위해 리소스 정리가 필요합니다

---

## 🔗 관련 문서

- [프로젝트 개요](../01-overview/overview.md)
- [시스템 아키텍처](../03-architecture/architecture.md)
- [API 가이드](../04-api/api.md)
- [데이터베이스](../05-database/database.md)
- [프론트엔드 가이드](../06-frontend/frontend.md)

---

*이 백엔드 가이드는 STUDYMATE 프로젝트의 백엔드 개발 표준을 정의하며, 모든 개발자는 이 가이드를 준수해야 합니다.*
