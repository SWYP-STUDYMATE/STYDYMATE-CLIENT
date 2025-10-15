# 프론트엔드-백엔드 통합 문제점 리포트

> 생성일: 2025-10-12
> 작성자: Claude Code
> 분석 대상: STUDYMATE-CLIENT ↔ Workers 백엔드

## 📋 목차

1. [개요](#개요)
2. [아키텍처 개선 사항](#아키텍처-개선-사항)
3. [API 엔드포인트 불일치](#api-엔드포인트-불일치)
4. [인증 및 토큰 처리](#인증-및-토큰-처리)
5. [매칭 시스템](#매칭-시스템)
6. [권장사항](#권장사항)

---

## 개요

### 현재 상황
- **백엔드**: Cloudflare Workers 기반 서버리스 아키텍처 (`/workers` 디렉토리)
- **프론트엔드**: React + Vite 기반 SPA
- **마이그레이션 완료**: Workers로 완전 이전 완료

### 주요 발견 사항
**문서 정비 완료**: CLAUDE.md 및 모든 문서를 Workers 기반으로 업데이트 완료

---

## 아키텍처 개선 사항

### ✅ 성공적으로 마이그레이션된 부분

1. **Workers 백엔드 구조** (`/workers/src/`)
   - ✅ Hono 프레임워크 기반 라우팅
   - ✅ Durable Objects (WebRTCRoom, UserPresence, ChatHub)
   - ✅ D1 Database, KV, R2 Storage 통합
   - ✅ 미들웨어 체계 (auth, error-handler, logger, security, analytics)

2. **라우팅 체계**
   ```
   /api/v1/auth          → authRoutes
   /api/v1/users         → userRoutes
   /api/v1/onboarding    → onboardingRoutes
   /api/v1/matching      → matchingRoutes
   /api/v1/chat          → chatRoutes
   /api/v1/sessions      → sessionsRoutes
   /api/v1/notifications → notificationsRoutes
   ...
   ```

3. **OAuth 콜백 처리**
   - ✅ `/login/oauth2/code/:provider` 직접 라우팅 (index.ts:244)
   - ✅ `/api/v1/auth/callback/:provider` 라우팅 (auth.ts:73)
   - ✅ 브라우저 리다이렉트 및 JSON 응답 모두 지원

---

## API 엔드포인트 불일치

### 1. 인증 (Auth) API

#### ✅ 올바른 엔드포인트
| 클라이언트 (config.js) | Workers (auth.ts) | 상태 |
|------------------------|-------------------|------|
| `POST /api/v1/auth/refresh` | `POST /api/v1/auth/refresh` | ✅ 일치 |
| `POST /api/v1/auth/logout` | `POST /api/v1/auth/logout` | ✅ 일치 |
| `GET /api/v1/auth/verify` | `GET /api/v1/auth/verify` | ✅ 일치 |
| `GET /api/v1/auth/me` | `GET /api/v1/auth/me` | ✅ 일치 |
| `GET /login/oauth2/code/naver` | `GET /login/oauth2/code/:provider` | ✅ 일치 |

---

### 2. 매칭 (Matching) API

#### ⚠️ 경로 및 요청 형식 불일치

**클라이언트 (matching.js)**
```javascript
// 1. 매칭 파트너 검색
const response = await fetch(`${WORKERS_API_BASE}/matching/request`, {
  method: 'POST',
  body: JSON.stringify({
    userLevel, targetLanguage, nativeLanguage,
    interests, availability, preferredCallType
  })
});

// 2. 매칭 승인
const response = await fetch(`${WORKERS_API_BASE}/matching/accept/${matchId}`, {
  method: 'POST',
  body: JSON.stringify({ partnerId, roomType: 'audio' })
});

// 3. 상태 확인
const response = await fetch(`${WORKERS_API_BASE}/matching/stats`, {
  method: 'GET'
});
```

**Workers (matching.ts)**
```typescript
// 1. 파트너 추천 (GET /matching/partners)
matchingRoutes.get('/partners', async (c) => {
  const result = await recommendPartners(c.env, userId, {
    nativeLanguage, targetLanguage, languageLevel, minAge, maxAge, page, size
  });
  return paginatedResponse(c, result.data, ...);
});

// 2. 매칭 요청 생성 (POST /matching/request)
matchingRoutes.post('/request', async (c) => {
  const body = await c.req.json();
  await createMatchingRequest(c.env, {
    senderId: userId,
    receiverId: body.targetUserId, // ❌ partnerId가 아닌 targetUserId
    message
  });
});

// 3. 매칭 승인 (POST /matching/accept/:requestId)
matchingRoutes.post('/accept/:requestId', async (c) => {
  const requestId = c.req.param('requestId'); // ❌ matchId가 아닌 requestId
  await acceptMatchingRequest(c.env, { requestId, receiverId: userId, responseMessage });
});

// 4. 통계 (GET /matching/stats)
matchingRoutes.get('/stats', async (c) => {
  const matches = await listMatches(c.env, userId, 1, 20);
  const queueStatus = await getMatchingQueueStatus(c.env, userId);
  return successResponse(c, { totalMatches, recentMatches, activeRequest, queueStatus });
});
```

#### 🔴 **문제점**

1. **`POST /matching/request` 의도 불일치**
   - **클라이언트**: 파트너 검색 요청으로 사용
   - **Workers**: 특정 사용자에게 매칭 요청 생성 (`receiverId` 필요)
   - **해결방법**: 클라이언트는 `GET /matching/partners` 사용해야 함

2. **`POST /matching/accept/:matchId` 파라미터 불일치**
   - **클라이언트**: `matchId` + `partnerId` + `roomType` 전송
   - **Workers**: `requestId` + `responseMessage` 수신
   - **해결방법**:
     - 클라이언트는 `requestId` 사용
     - `partnerId`와 `roomType`은 불필요 (서버가 자동 처리)

3. **`GET /matching/stats` vs `/matching/status`**
   - **클라이언트**: `getMatchingStatus()` → `GET /matching/stats`
   - **config.js**: `GET /matching/status` 정의
   - **해결방법**: 둘 중 하나로 통일

---

### 3. 프로필 (Profile) API

#### ⚠️ 이미지 업로드 엔드포인트 확인 필요

**클라이언트 (profile.js)**
```javascript
export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/users/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

**Workers 확인 필요**
- `userRoutes.ts` 또는 `uploadRoutes.ts`에 해당 엔드포인트 구현 확인 필요
- FormData 처리 로직 확인 필요

---

## 인증 및 토큰 처리

### ✅ 올바르게 구현된 부분

1. **JWT 토큰 검증** (클라이언트 `api/index.js`)
   ```javascript
   const isValidJWT = (token) => {
     if (!token || typeof token !== 'string') return false;
     const parts = token.split('.');
     return parts.length === 3 && parts.every(part => part.length > 0);
   };
   ```

2. **토큰 갱신 로직** (401 에러 자동 처리)
   ```javascript
   // Request Interceptor: Authorization 헤더 자동 추가
   api.interceptors.request.use((config) => {
     const token = getToken("accessToken");
     if (token && isValidJWT(token)) {
       config.headers["Authorization"] = `Bearer ${token}`;
     }
   });

   // Response Interceptor: 401/403 시 토큰 재발급
   api.interceptors.response.use(null, async (error) => {
     if (error.response?.status === 401 && !originalRequest._retry) {
       const refreshToken = getToken("refreshToken");
       const res = await refreshApi.post("/auth/refresh", null, {
         headers: { Authorization: `Bearer ${refreshToken}` }
       });
       setToken("accessToken", newAccessToken);
       return api(originalRequest);
     }
   });
   ```

3. **Workers 토큰 갱신 엔드포인트** (auth.ts:120)
   ```typescript
   authRoutes.post('/refresh', async (c) => {
     const authorization = c.req.header('Authorization');
     const refreshToken = match[1]; // Bearer 토큰 추출
     const result = await refreshTokens(c.env, refreshToken, metadata);
     return successResponse(c, result);
   });
   ```

### ✅ 일치 확인
- 클라이언트와 Workers 모두 `Bearer` 토큰 형식 사용
- 403 Forbidden 오류도 토큰 재발급 시도 (클라이언트 index.js:111-189)
- 토큰 형식 검증 로직 탑재

---

## 매칭 시스템

### 🔴 **주요 문제점**

#### 1. 클라이언트 `matching.js`의 잘못된 API 호출

```javascript
// ❌ 잘못된 사용
export async function findMatchingPartners(preferences) {
  const response = await fetch(`${WORKERS_API_BASE}/matching/request`, {
    method: 'POST',
    body: JSON.stringify({
      userLevel: preferences.proficiencyLevel,
      targetLanguage: preferences.targetLanguage,
      // ...
    })
  });
}

// ✅ 올바른 사용
export async function findMatchingPartners(preferences) {
  const response = await api.get('/matching/partners', {
    params: {
      nativeLanguage: preferences.nativeLanguage,
      targetLanguage: preferences.targetLanguage,
      languageLevel: preferences.proficiencyLevel,
      minAge: preferences.minAge,
      maxAge: preferences.maxAge,
      page: 0,
      size: 20
    }
  });
  return response.data;
}
```

#### 2. `acceptMatch` 함수 수정 필요

```javascript
// ❌ 현재 코드
export async function acceptMatch(matchId, partnerId) {
  const response = await fetch(`${WORKERS_API_BASE}/matching/accept/${matchId}`, {
    method: 'POST',
    body: JSON.stringify({ partnerId, roomType: 'audio' })
  });
}

// ✅ 수정 필요
export async function acceptMatch(requestId) {
  const response = await api.post(`/matching/accept/${requestId}`, {
    responseMessage: '' // optional
  });
  return response.data;
}
```

#### 3. `rejectMatch` 함수 수정 필요

```javascript
// ❌ 현재 코드
export async function rejectMatch(matchId, partnerId) {
  const response = await fetch(`${WORKERS_API_BASE}/matching/reject/${matchId}`, {
    method: 'POST',
    body: JSON.stringify({ partnerId })
  });
}

// ✅ 수정 필요
export async function rejectMatch(requestId, reason) {
  const response = await api.post(`/matching/reject/${requestId}`, {
    responseMessage: reason // optional
  });
  return response.data;
}
```

---

## 권장사항

### 🎯 즉시 수정이 필요한 항목

#### 1. **matching.js 전면 수정**

**파일**: `/src/api/matching.js`

```javascript
import api from './index.js';

// 파트너 추천 조회 (올바른 엔드포인트 사용)
export const getPartnerRecommendations = async (preferences = {}, page = 0, size = 20) => {
  const response = await api.get('/matching/partners', {
    params: {
      page,
      size,
      nativeLanguage: preferences.nativeLanguage,
      targetLanguage: preferences.targetLanguage,
      languageLevel: preferences.proficiencyLevel,
      minAge: preferences.minAge,
      maxAge: preferences.maxAge
    }
  });
  return response.data;
};

// 매칭 요청 생성 (targetUserId 필수)
export const createMatchRequest = async (targetUserId, message = '') => {
  const response = await api.post('/matching/request', {
    targetUserId, // ⭐ partnerId가 아닌 targetUserId
    message
  });
  return response.data;
};

// 매칭 요청 수락 (requestId 사용)
export const acceptMatchRequest = async (requestId, responseMessage = '') => {
  const response = await api.post(`/matching/accept/${requestId}`, {
    responseMessage // optional
  });
  return response.data;
};

// 매칭 요청 거절 (requestId 사용)
export const rejectMatchRequest = async (requestId, responseMessage = '') => {
  const response = await api.post(`/matching/reject/${requestId}`, {
    responseMessage // optional
  });
  return response.data;
};

// 매칭 상태 확인 (올바른 엔드포인트)
export const getMatchingStatus = async () => {
  const response = await api.get('/matching/stats');
  return response.data;
};

// 매칭된 파트너 목록
export const getMatches = async (page = 1, size = 20) => {
  const response = await api.get('/matching/matches', {
    params: { page, size }
  });
  return response.data;
};

// 매칭 해제
export const deleteMatch = async (matchId) => {
  const response = await api.delete(`/matching/matches/${matchId}`);
  return response.data;
};
```

#### 2. **config.js 정리**

```javascript
// /src/api/config.js

export const API_ENDPOINTS = {
  // ... 기존 코드

  // 매칭 관련 (정확한 엔드포인트로 수정)
  MATCHING: {
    BASE: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching`,
    PARTNERS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/partners`,
    PARTNERS_ADVANCED: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/partners/advanced`,
    REQUEST: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/request`,
    REQUESTS_SENT: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/requests/sent`,
    REQUESTS_RECEIVED: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/requests/received`,
    ACCEPT: (requestId) => `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/accept/${requestId}`,
    REJECT: (requestId) => `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/reject/${requestId}`,
    MATCHES: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/matches`,
    DELETE_MATCH: (matchId) => `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/matches/${matchId}`,
    STATS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/stats`,
    SETTINGS: `${API_CONFIG.MAIN_SERVER}${API_CONFIG.API_VERSION}/matching/settings`,
  },
};
```

#### 3. **사용하지 않는 fetch 기반 함수 제거**

`matching.js`에서 다음 함수들 제거 또는 수정:
- `findMatchingPartners()` → `getPartnerRecommendations()` 사용
- `acceptMatch()` → `acceptMatchRequest()` 사용
- `rejectMatch()` → `rejectMatchRequest()` 사용
- `getMatchingStatus()` → `/matching/stats` 엔드포인트 사용

---

### 🔍 확인이 필요한 항목

1. **이미지 업로드 엔드포인트**
   - [ ] `POST /users/profile/image` Workers 구현 확인
   - [ ] `POST /chat/upload/image` Workers 구현 확인
   - [ ] FormData 처리 로직 확인

2. **WebSocket 엔드포인트**
   - [ ] `/ws/chat` Durable Object 연결 확인
   - [ ] `/ws/notifications` 알림 WebSocket 확인
   - [ ] 클라이언트 WebSocket 연결 로직과 일치 여부

3. **온보딩 API**
   - [ ] `/api/v1/onboarding/steps/:step/save` Workers 구현 확인
   - [ ] 클라이언트 온보딩 플로우와 서버 응답 형식 일치 확인

---

## 결론

### ✅ 전반적으로 양호한 구조
- Workers 백엔드는 잘 설계되어 있음
- 인증 시스템은 올바르게 동작
- 대부분의 API는 정상 작동 예상

### 🔴 즉시 수정 필요
1. **matching.js 전면 리팩토링** (가장 중요)
   - `POST /matching/request` 잘못된 사용 → `GET /matching/partners` 사용
   - `matchId` → `requestId` 파라미터명 변경
   - `partnerId` 불필요 제거

2. **WORKERS_API_BASE 사용 제거**
   - `matching.js`의 모든 fetch 호출을 `api` 인스턴스로 변경
   - 통일된 에러 처리 및 토큰 관리 활용

3. **config.js 정리**
   - 사용하지 않는 엔드포인트 제거
   - 정확한 경로로 업데이트

---

## 다음 단계

1. ✅ **CLAUDE.md 업데이트 완료** - Workers 경로 정정 완료
2. 🔄 **matching.js 리팩토링** - 위의 권장사항 적용
3. 🔍 **이미지 업로드 확인** - Workers 구현 검증
4. 🔍 **WebSocket 통합 테스트** - 실제 연결 확인
5. 📝 **API 문서 작성** - 클라이언트-Workers 통합 가이드

---

**작성 완료**: 2025-10-12
**다음 리뷰**: matching.js 리팩토링 후
