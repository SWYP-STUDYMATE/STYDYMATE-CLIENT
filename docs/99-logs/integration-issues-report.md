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
**최종 업데이트**: 2025-10-16
**다음 리뷰**: matching.js 리팩토링 후

---

## 🔴 중복 매칭 요청 에러 (2025-10-16)

### 문제 발견
- **발생 위치**: `https://languagemate.kr/matching`
- **에러 코드**: `500 Internal Server Error`
- **재현 방법**: 매칭 페이지에서 동일한 사용자에게 매칭 요청을 2회 이상 전송

### 에러 로그
```javascript
POST /matching/request - 500 (335ms)
Internal Server Error
서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
```

### 원인 분석

#### 1. 프론트엔드 검증 부재
**위치**: `MatchingProfileCard.jsx:43-59`

```javascript
const handleSendRequest = async (e) => {
    e.stopPropagation();
    if (useModal) {
        setIsModalOpen(true);
        return;
    }

    try {
        const userId = mappedUser.id || mappedUser.userId;
        await sendMatchRequest(userId, `안녕하세요! ${mappedUser.name}님과 언어 교환을 하고 싶습니다.`);
        showSuccess(`${mappedUser.name}님에게 매칭 요청을 보냈습니다!`);
    } catch (error) {
        console.error('매칭 요청 실패:', error);
        showError('매칭 요청을 보내는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
};
```

**문제점**:
- ❌ 중복 요청 방지 로직 없음
- ❌ 버튼 비활성화 상태 관리 없음
- ❌ 로딩 상태 표시 없음
- ❌ 이미 매칭 요청이 전송된 사용자인지 확인하지 않음

#### 2. 백엔드 검증 불충분
**위치**: `workers/src/routes/matching.ts` (추정)

**문제점**:
- ❌ DB 레벨에서 중복 매칭 요청 허용
- ❌ 유니크 제약 조건 위반 시 500 에러 반환 (400 에러가 적절)
- ❌ 명확한 에러 메시지 없음 ("이미 매칭 요청을 보낸 사용자입니다" 등)

### 해결 방안

#### ✅ 1. 프론트엔드 중복 요청 방지 (우선 적용)

**파일**: `src/components/MatchingProfileCard.jsx`

```javascript
export default function MatchingProfileCard({ user, onClick, showActions = true, useModal = true }) {
    const { sendMatchRequest, sentRequests } = useMatchingStore(); // ⭐ sentRequests 추가
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false); // ⭐ 로딩 상태
    const { showError, showSuccess, ToastContainer } = useToast();

    // ⭐ 중복 요청 여부 확인
    const userId = mappedUser.id || mappedUser.userId;
    const hasRequestSent = sentRequests?.some(req =>
        req.receiverId === userId && req.status === 'pending'
    );

    const handleSendRequest = async (e) => {
        e.stopPropagation();

        // ⭐ 이미 요청을 보낸 경우 경고
        if (hasRequestSent) {
            showError('이미 매칭 요청을 보낸 사용자입니다.');
            return;
        }

        // ⭐ 중복 클릭 방지
        if (isSending) return;

        if (useModal) {
            setIsModalOpen(true);
            return;
        }

        try {
            setIsSending(true); // ⭐ 로딩 시작
            await sendMatchRequest(userId, `안녕하세요! ${mappedUser.name}님과 언어 교환을 하고 싶습니다.`);
            showSuccess(`${mappedUser.name}님에게 매칭 요청을 보냈습니다!`);
        } catch (error) {
            console.error('매칭 요청 실패:', error);

            // ⭐ 에러 메시지 상세화
            if (error.response?.status === 409) {
                showError('이미 매칭 요청을 보낸 사용자입니다.');
            } else if (error.response?.status === 400) {
                showError('잘못된 요청입니다. 다시 시도해주세요.');
            } else {
                showError('매칭 요청을 보내는데 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setIsSending(false); // ⭐ 로딩 종료
        }
    };

    return (
        <div className="...">
            {/* ... */}

            {/* 액션 버튼 */}
            {showActions && (
                <div className="flex gap-2 pt-3 mt-3 border-t border-[#E7E7E7]">
                    <CommonButton
                        onClick={handleViewProfile}
                        variant="secondary"
                        size="small"
                        className="flex-1"
                        icon={<Globe />}
                    >
                        프로필 보기
                    </CommonButton>
                    <CommonButton
                        onClick={handleSendRequest}
                        variant={hasRequestSent ? "secondary" : "success"} // ⭐ 스타일 변경
                        size="small"
                        className="flex-1"
                        icon={hasRequestSent ? <MessageCircle /> : <UserPlus />} // ⭐ 아이콘 변경
                        disabled={isSending || hasRequestSent} // ⭐ 비활성화
                    >
                        {isSending ? '전송 중...' : hasRequestSent ? '요청 완료' : '매칭 요청'}
                    </CommonButton>
                </div>
            )}

            <ToastContainer />
        </div>
    );
}
```

#### ✅ 2. Zustand Store 업데이트 필요

**파일**: `src/store/matchingStore.js`

```javascript
const useMatchingStore = create((set, get) => ({
    matchedUsers: [],
    sentRequests: [], // ⭐ 추가
    receivedRequests: [], // ⭐ 추가

    // ⭐ 보낸 요청 목록 가져오기
    fetchSentRequests: async () => {
        try {
            const response = await api.get('/matching/requests/sent');
            set({ sentRequests: response.data });
        } catch (error) {
            console.error('Failed to fetch sent requests:', error);
        }
    },

    // 매칭 요청 전송 후 상태 업데이트
    sendMatchRequest: async (targetUserId, message) => {
        try {
            const response = await api.post('/matching/request', {
                targetUserId,
                message
            });

            // ⭐ sentRequests 업데이트
            const { sentRequests } = get();
            set({
                sentRequests: [...sentRequests, response.data]
            });

            return response.data;
        } catch (error) {
            console.error('Send match request error:', error);
            throw error;
        }
    },
}));
```

#### ✅ 3. 백엔드 수정 권장사항 (Workers)

**위치**: `workers/src/routes/matching.ts`

```typescript
// POST /matching/request
matchingRoutes.post('/request', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { targetUserId, message } = body;

    // ⭐ 중복 요청 검증
    const existingRequest = await c.env.DB.prepare(
        'SELECT id FROM matching_requests WHERE sender_id = ? AND receiver_id = ? AND status = ?'
    ).bind(userId, targetUserId, 'pending').first();

    if (existingRequest) {
        return c.json({
            success: false,
            message: '이미 매칭 요청을 보낸 사용자입니다.'
        }, 409); // ⭐ 409 Conflict
    }

    // ⭐ 자기 자신에게 요청 방지
    if (userId === targetUserId) {
        return c.json({
            success: false,
            message: '자기 자신에게는 매칭 요청을 보낼 수 없습니다.'
        }, 400);
    }

    // 매칭 요청 생성
    await createMatchingRequest(c.env, {
        senderId: userId,
        receiverId: targetUserId,
        message
    });

    return successResponse(c, { message: '매칭 요청이 전송되었습니다.' });
});
```

#### ✅ 4. DB 제약 조건 추가 권장 (Workers)

**파일**: `workers/migrations/xxx_add_unique_constraint_matching_requests.sql`

```sql
-- 중복 매칭 요청 방지 유니크 제약 조건
CREATE UNIQUE INDEX idx_matching_requests_unique
ON matching_requests(sender_id, receiver_id, status)
WHERE status = 'pending';
```

### 적용 우선순위

1. **🔥 즉시 적용**: 프론트엔드 중복 요청 방지 (MatchingProfileCard.jsx)
2. **⚡ 우선 적용**: Zustand Store에 sentRequests 추가
3. **📋 권장 사항**: Workers 백엔드 검증 강화
4. **🔒 선택 사항**: DB 유니크 제약 조건 추가

### 테스트 체크리스트

- [ ] 동일한 사용자에게 매칭 요청 2회 전송 시 경고 메시지 표시
- [ ] 요청 전송 중 버튼 비활성화 확인
- [ ] 이미 요청을 보낸 사용자에게는 "요청 완료" 버튼 표시
- [ ] 백엔드에서 409 에러 발생 시 적절한 메시지 표시
- [ ] 페이지 새로고침 후에도 요청 상태 유지

### 관련 파일

- `src/components/MatchingProfileCard.jsx:43-59`
- `src/store/matchingStore.js`
- `workers/src/routes/matching.ts`
- `workers/src/db/matching.ts`

---
