# STUDYMATE API 가이드

**최종 업데이트**: 2025-01-13

## 📋 개요

STUDYMATE 프로젝트의 API 통합 가이드입니다. Cloudflare Workers 기반 백엔드 API와 프론트엔드 통합 방법을 설명합니다.

### 시스템 아키텍처
```
Frontend (React) → Cloudflare Workers API → D1/KV/R2 → Workers AI
```

### 주요 API 구성
- **Backend API**: REST API (Cloudflare Workers)
- **WebSocket**: 실시간 통신 (채팅, 세션)
- **Workers AI**: 음성 인식 및 평가 (Whisper, Llama)
- **Storage**: R2 (미디어), D1 (데이터), KV (캐시)

### 관련 파일
- **OpenAPI 명세**: `level-test-openapi.yml` - 표준 API 스펙
- **개선된 클라이언트**: `improved-api-client.js` - 에러 처리 포함

---

## 📡 기본 정보

### Base URLs
- **Backend API**: `https://api.languagemate.kr/api/v1`
- **WebSocket**: `wss://api.languagemate.kr/ws`
- **Workers AI**: Cloudflare AI Workers 통합

### 인증 방식
- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer {token}`
- **Access Token**: 1시간 유효
- **Refresh Token**: 7일 유효, 자동 갱신

### 표준 응답 형식
```json
{
  "success": true,
  "data": { ... },
  "message": "Success"
}
```

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}
```

---

## 🏗️ API 엔드포인트 명세

### 1. 인증 (Authentication)

| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/auth/callback/naver` | GET | 네이버 OAuth 콜백 | ✅ |
| `/api/v1/auth/callback/google` | GET | 구글 OAuth 콜백 | ✅ |
| `/api/v1/auth/refresh` | POST | 토큰 갱신 | ✅ |
| `/api/v1/auth/logout` | POST | 로그아웃 | ✅ |

#### 토큰 갱신 예시
```javascript
// Request
POST /api/v1/auth/refresh
{
  "refreshToken": "string"
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

### 2. 사용자 (User)

| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/user/name` | GET | 사용자 이름 조회 | ✅ |
| `/api/v1/user/profile` | GET | 기본 프로필 조회 | ✅ |
| `/api/v1/user/profile-image` | GET/PATCH | 프로필 이미지 관리 | ✅ |
| `/api/v1/user/gender-type` | GET | 성별 타입 목록 | ✅ |
| `/api/v1/user/locations` | GET | 지역 목록 조회 | ✅ |
| `/api/v1/user/english-name` | PATCH | 영어 이름 저장 | ✅ |
| `/api/v1/user/birthyear` | PATCH | 생년 저장 | ✅ |
| `/api/v1/user/birthday` | PATCH | 생일 저장 | ✅ |
| `/api/v1/user/location` | PATCH | 거주지 저장 | ✅ |
| `/api/v1/user/self-bio` | PATCH | 자기소개 저장 | ✅ |
| `/api/v1/user/gender` | PATCH | 성별 저장 | ✅ |

### 3. 온보딩 (Onboarding)

#### 언어 설정
| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/onboarding/language/languages` | GET | 언어 목록 | ✅ |
| `/api/v1/onboarding/language/levels` | GET | 레벨 목록 | ✅ |
| `/api/v1/onboarding/language/native-language` | GET/POST | 모국어 관리 | ✅ |
| `/api/v1/onboarding/language/learning-language` | GET/POST | 학습 언어 관리 | ✅ |
| `/api/v1/onboarding/language/language-level` | POST | 언어 레벨 설정 | ✅ |

#### 관심사 설정
| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/onboarding/interest/motivations` | GET | 동기 목록 | ✅ |
| `/api/v1/onboarding/interest/topics` | GET | 주제 목록 | ✅ |
| `/api/v1/onboarding/interest/learning-styles` | GET | 학습 스타일 목록 | ✅ |
| `/api/v1/onboarding/interest/communication-methods` | GET | 소통 방법 목록 | ✅ |
| `/api/v1/onboarding/interest/motivation` | POST | 동기 저장 | ✅ |
| `/api/v1/onboarding/interest/topic` | POST | 주제 저장 | ✅ |
| `/api/v1/onboarding/interest/learning-style` | POST | 학습 스타일 저장 | ✅ |

#### 파트너 선호도
| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/onboarding/partner/personality` | GET/POST | 성격 유형 관리 | ✅ |
| `/api/v1/onboarding/partner/gender` | GET/POST | 선호 성별 관리 | ✅ |
| `/api/v1/onboarding/partner/group-size` | GET/POST | 그룹 크기 관리 | ✅ |

#### 스케줄 설정
| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/onboarding/schedule/day-of-week` | GET | 요일 목록 | ✅ |
| `/api/v1/onboarding/schedule/time-zones` | GET | 시간대 목록 | ✅ |
| `/api/v1/onboarding/schedule/schedule` | GET/POST/DELETE | 스케줄 관리 | ✅ |
| `/api/v1/onboarding/schedule/communication-methods` | GET | 소통 방식 목록 | ✅ |
| `/api/v1/onboarding/schedule/communication-method` | POST | 소통 방식 저장 | ✅ |

### 4. 매칭 (Matching)

| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/matching/list` | GET | 매칭 목록 조회 | ✅ |
| `/api/v1/matching/filter` | POST | 필터링된 매칭 | ✅ |
| `/api/v1/matching/profile/:userId` | GET | 유저 상세 프로필 | ✅ |
| `/api/v1/matching/request` | POST | 매칭 요청 | ✅ |
| `/api/v1/matching/accept` | POST | 매칭 수락 | ✅ |
| `/api/v1/matching/reject` | POST | 매칭 거절 | ✅ |

### 5. 채팅 (Chat)

#### REST API
| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/chat/rooms` | GET | 채팅방 목록 | ✅ |
| `/api/v1/chat/room/:roomId` | GET | 채팅방 정보 | ✅ |
| `/api/v1/chat/room/:roomId/messages` | GET | 메시지 히스토리 | ✅ |
| `/api/v1/chat/room/create` | POST | 채팅방 생성 | ✅ |

#### WebSocket Events
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `CONNECT` | Client→Server | WebSocket 연결 |
| `SUBSCRIBE` | Client→Server | 채팅방 구독 |
| `SEND_MESSAGE` | Client→Server | 메시지 전송 |
| `MESSAGE` | Server→Client | 메시지 수신 |
| `TYPING` | Bidirectional | 타이핑 상태 |
| `READ` | Client→Server | 읽음 확인 |

### 6. 레벨 테스트 (Level Test)

| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/leveltest/questions` | GET | 테스트 질문 조회 | ✅ |
| `/api/v1/leveltest/voice/transcribe` | POST | 음성→텍스트 변환 | ✅ |
| `/api/v1/leveltest/evaluate` | POST | AI 레벨 평가 | ✅ |
| `/api/v1/leveltest/result` | GET | 결과 조회 | ✅ |
| `/api/v1/leveltest/save` | POST | 결과 저장 | ✅ |

#### 레벨 평가 예시
```javascript
// Request
POST /api/v1/leveltest/evaluate
{
  "userId": "string",
  "responses": [
    {
      "questionId": 1,
      "audioUrl": "string",
      "transcript": "string",
      "duration": 180
    }
  ]
}

// Response
{
  "success": true,
  "data": {
    "overallLevel": "B2",
    "scores": {
      "pronunciation": 85,
      "fluency": 78,
      "vocabulary": 82,
      "grammar": 75,
      "coherence": 80
    },
    "feedback": "string"
  }
}
```

### 7. 세션 (Session)

#### REST API
| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/session/list` | GET | 세션 목록 | ✅ |
| `/api/v1/session/create` | POST | 세션 생성 | ✅ |
| `/api/v1/session/:sessionId` | GET | 세션 정보 | ✅ |
| `/api/v1/session/:sessionId/join` | POST | 세션 참가 | ✅ |
| `/api/v1/session/:sessionId/leave` | POST | 세션 나가기 | ✅ |
| `/api/v1/session/schedule` | GET/POST | 세션 스케줄 | ✅ |

#### WebRTC Signaling
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `offer` | Client→Server | SDP Offer |
| `answer` | Client→Server | SDP Answer |
| `ice-candidate` | Bidirectional | ICE Candidate |
| `peer-joined` | Server→Client | 참가자 입장 |
| `peer-left` | Server→Client | 참가자 퇴장 |

### 8. 알림 (Notification)

| 엔드포인트 | 메서드 | 설명 | 상태 |
|-----------|-------|------|------|
| `/api/v1/notification/list` | GET | 알림 목록 | ✅ |
| `/api/v1/notification/:id/read` | PATCH | 읽음 처리 | ✅ |
| `/api/v1/notification/settings` | GET/PATCH | 알림 설정 | ✅ |
| `/api/v1/notification/subscribe` | POST | 푸시 구독 | ✅ |

### 9. 분석 (Analytics)

#### 대시보드 & 통계

| 엔드포인트 | 메서드 | 설명 | 파라미터 | 상태 |
|-----------|-------|------|---------|------|
| `/api/v1/analytics/dashboard` | GET | 대시보드 종합 데이터 | - | ✅ |
| `/api/v1/sessions/stats` | GET | 사용자 학습 통계 | `period`: week/month/year | ✅ |
| `/api/v1/analytics/metrics` | GET | 세션 활동 메트릭 | `start`, `end`, `groupBy`, `interval` | ✅ |
| `/api/v1/analytics/ai-usage` | GET | AI 사용량 통계 | `start`, `end` | ✅ |
| `/api/v1/analytics/performance` | GET | 성능 통계 | `start`, `end`, `groupBy` | ✅ |

#### AI 학습 분석

| 엔드포인트 | 메서드 | 설명 | 파라미터 | 상태 |
|-----------|-------|------|---------|------|
| `/api/v1/analytics/learning-pattern` | GET | 학습 패턴 분석 | `monthsBack`: 1-12 (기본: 3) | ✅ |
| `/api/v1/analytics/progress-summary` | GET | 학습 진행 상황 요약 | - | ✅ |
| `/api/v1/analytics/recommendations` | GET | 맞춤형 학습 추천 | - | ✅ |

#### 이벤트 & 실시간

| 엔드포인트 | 메서드 | 설명 | Body/파라미터 | 상태 |
|-----------|-------|------|--------------|------|
| `/api/v1/analytics/events` | POST | 클라이언트 이벤트 전송 | `{ events: Array }` | ✅ |
| `/api/v1/analytics/stream` | WebSocket | 실시간 메트릭 스트림 | auth token 필요 | ✅ |

#### 대시보드 데이터 조회 예시

```javascript
// Request
GET /api/v1/analytics/dashboard

// Response
{
  "success": true,
  "data": {
    "totalSessions": 150,
    "totalHours": 75.5,
    "currentStreak": 7,
    "levelTests": [
      {
        "id": "test-1",
        "date": "2025-01-10",
        "level": "B2",
        "scores": {
          "pronunciation": 85,
          "fluency": 78,
          "vocabulary": 82,
          "grammar": 75,
          "coherence": 80
        }
      }
    ],
    "matchingEvents": [
      {
        "partnerId": "user-123",
        "status": "accepted",
        "date": "2025-01-12"
      }
    ],
    "recentActivity": [
      {
        "type": "session",
        "date": "2025-01-13",
        "duration": 30
      }
    ]
  }
}
```

#### 학습 통계 조회 예시

```javascript
// Request
GET /api/v1/sessions/stats?period=month

// Response
{
  "success": true,
  "data": {
    "period": "month",
    "totalSessions": 24,
    "totalMinutes": 720,
    "averageSessionLength": 30,
    "sessionsByWeek": [
      { "week": 1, "count": 6, "minutes": 180 },
      { "week": 2, "count": 7, "minutes": 210 },
      { "week": 3, "count": 5, "minutes": 150 },
      { "week": 4, "count": 6, "minutes": 180 }
    ],
    "sessionsByType": {
      "video": 15,
      "audio": 9
    },
    "partnerCount": 5
  }
}
```

#### 세션 활동 메트릭 예시

```javascript
// Request
GET /api/v1/analytics/metrics?start=2025-01-01T00:00:00Z&end=2025-01-13T23:59:59Z&groupBy=path&interval=1d

// Response
{
  "success": true,
  "data": {
    "metrics": [
      {
        "date": "2025-01-01",
        "sessions": 3,
        "uniqueUsers": 2,
        "averageDuration": 28
      },
      {
        "date": "2025-01-02",
        "sessions": 5,
        "uniqueUsers": 3,
        "averageDuration": 32
      }
    ],
    "summary": {
      "totalSessions": 42,
      "totalUniqueUsers": 8,
      "averageDuration": 30
    }
  }
}
```

#### AI 사용량 통계 예시

```javascript
// Request
GET /api/v1/analytics/ai-usage?start=2025-01-01T00:00:00Z&end=2025-01-13T23:59:59Z

// Response
{
  "success": true,
  "data": {
    "whisperUsage": {
      "totalRequests": 150,
      "totalSeconds": 1800,
      "averageLatency": 2500
    },
    "llamaUsage": {
      "totalRequests": 50,
      "totalTokens": 125000,
      "averageLatency": 1200
    },
    "translationUsage": {
      "totalRequests": 30,
      "totalCharacters": 15000
    },
    "costEstimate": {
      "whisper": 0.54,
      "llama": 0.25,
      "translation": 0.12,
      "total": 0.91,
      "currency": "USD"
    }
  }
}
```

#### 성능 통계 예시

```javascript
// Request
GET /api/v1/analytics/performance?start=2025-01-01T00:00:00Z&end=2025-01-13T23:59:59Z&groupBy=path

// Response
{
  "success": true,
  "data": {
    "byPath": [
      {
        "path": "/session/video",
        "avgResponseTime": 150,
        "p95ResponseTime": 280,
        "errorRate": 0.02,
        "requestCount": 420
      },
      {
        "path": "/chat/messages",
        "avgResponseTime": 50,
        "p95ResponseTime": 120,
        "errorRate": 0.01,
        "requestCount": 8500
      }
    ],
    "overall": {
      "avgResponseTime": 180,
      "p95ResponseTime": 350,
      "p99ResponseTime": 500,
      "errorRate": 0.015,
      "totalRequests": 15000
    }
  }
}
```

#### 학습 패턴 분석 예시

```javascript
// Request
GET /api/v1/analytics/learning-pattern?monthsBack=3

// Response
{
  "success": true,
  "data": {
    "preferredTimes": [
      { "hour": 19, "frequency": 25 },
      { "hour": 20, "frequency": 30 },
      { "hour": 21, "frequency": 22 }
    ],
    "preferredDays": [
      { "day": "Monday", "frequency": 18 },
      { "day": "Wednesday", "frequency": 22 },
      { "day": "Saturday", "frequency": 15 }
    ],
    "sessionDurationPattern": {
      "avg": 30,
      "median": 28,
      "mode": 30,
      "distribution": {
        "15-20": 5,
        "20-30": 45,
        "30-45": 35,
        "45-60": 15
      }
    },
    "consistency": {
      "weeklyAverage": 5.2,
      "missedWeeks": 1,
      "longestStreak": 4
    },
    "insights": [
      "가장 활발한 시간대: 저녁 8시 (20:00)",
      "선호하는 요일: 수요일",
      "평균 세션 길이: 30분",
      "주 5회 이상 학습 중"
    ]
  }
}
```

#### 학습 진행 상황 요약 예시

```javascript
// Request
GET /api/v1/analytics/progress-summary

// Response
{
  "success": true,
  "data": {
    "currentLevel": "B2",
    "startingLevel": "A2",
    "levelProgress": {
      "current": "B2",
      "nextMilestone": "C1",
      "progressPercentage": 65
    },
    "skills": [
      {
        "name": "pronunciation",
        "current": 85,
        "target": 90,
        "improvement": 15
      },
      {
        "name": "fluency",
        "current": 78,
        "target": 85,
        "improvement": 12
      },
      {
        "name": "vocabulary",
        "current": 82,
        "target": 88,
        "improvement": 18
      }
    ],
    "milestones": [
      {
        "date": "2024-12-01",
        "achievement": "레벨 A2 도달"
      },
      {
        "date": "2025-01-05",
        "achievement": "레벨 B2 도달"
      }
    ],
    "totalHours": 75.5,
    "totalSessions": 150
  }
}
```

#### 학습 추천사항 조회 예시

```javascript
// Request
GET /api/v1/analytics/recommendations

// Response
{
  "success": true,
  "data": {
    "focusAreas": [
      {
        "skill": "grammar",
        "currentScore": 75,
        "reason": "다른 영역 대비 상대적으로 낮은 점수",
        "priority": "high"
      },
      {
        "skill": "fluency",
        "currentScore": 78,
        "reason": "최근 2주간 진전이 없음",
        "priority": "medium"
      }
    ],
    "suggestedActivities": [
      {
        "type": "grammar_practice",
        "title": "문법 연습 세션",
        "description": "시제와 관사 사용에 집중",
        "estimatedDuration": 30
      },
      {
        "type": "conversation",
        "title": "자유 대화 세션",
        "description": "유창성 향상을 위한 실전 대화",
        "estimatedDuration": 45
      }
    ],
    "partnerRecommendations": [
      {
        "userId": "user-456",
        "name": "John Smith",
        "compatibilityScore": 92,
        "reason": "비슷한 관심사 및 학습 스타일"
      }
    ],
    "studySchedule": {
      "recommendedFrequency": "주 5-6회",
      "recommendedDuration": "30-45분",
      "bestTimes": ["19:00-21:00"]
    }
  }
}
```

#### 이벤트 전송 예시

```javascript
// Request
POST /api/v1/analytics/events
{
  "events": [
    {
      "type": "page_view",
      "path": "/session/video/room-123",
      "timestamp": "2025-01-13T14:30:00Z",
      "metadata": {
        "referrer": "/main",
        "sessionDuration": 1800
      }
    },
    {
      "type": "feature_usage",
      "feature": "real_time_transcription",
      "timestamp": "2025-01-13T14:35:00Z",
      "metadata": {
        "language": "en",
        "duration": 120
      }
    }
  ]
}

// Response
{
  "success": true,
  "data": {
    "processed": 2,
    "failed": 0
  }
}
```

#### 실시간 메트릭 스트림 (WebSocket)

```javascript
// 연결 설정
import { connectToMetricsStream } from '@/api/analytics';

const ws = connectToMetricsStream(
  (data) => {
    // 실시간 메트릭 수신
    console.log('Realtime metrics:', data);
  },
  (error) => {
    console.error('Stream error:', error);
  }
);

// WebSocket 메시지 예시
{
  "type": "session_started",
  "sessionId": "session-789",
  "userId": "user-123",
  "timestamp": "2025-01-13T15:00:00Z"
}

{
  "type": "metric_update",
  "metric": "active_users",
  "value": 42,
  "timestamp": "2025-01-13T15:01:00Z"
}

// 연결 종료
ws.close();
```

---

## ⚙️ Settings API

사용자 설정 관리를 위한 API 엔드포인트 (총 15개).

### 계정 관리 (Account Management)

#### 1. 계정 설정 조회

```http
GET /settings/account
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "email": "user@example.com",
    "username": "johndoe",
    "displayName": "John Doe",
    "englishName": "John",
    "residence": "Seoul, South Korea",
    "profileImage": "https://r2.languagemate.kr/profiles/user123.jpg",
    "bio": "Language learning enthusiast",
    "phoneNumber": "+821012345678",
    "verified": true,
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

#### 2. 계정 설정 업데이트

```http
PATCH /settings/account
```

**Request:**
```json
{
  "displayName": "John Smith",
  "englishName": "John",
  "residence": "Busan, South Korea",
  "bio": "Passionate about learning Korean and teaching English",
  "phoneNumber": "+821098765432"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "displayName": "John Smith",
    "englishName": "John",
    "residence": "Busan, South Korea",
    "bio": "Passionate about learning Korean and teaching English",
    "phoneNumber": "+821098765432",
    "updatedAt": "2025-01-18T10:30:00.000Z"
  }
}
```

#### 3. 계정 삭제

```http
DELETE /settings/account
```

**Request:**
```json
{
  "password": "current_password_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "계정이 성공적으로 삭제되었습니다.",
  "deletedAt": "2025-01-18T10:45:00.000Z"
}
```

**참고:**
- 계정 삭제는 즉시 처리되며 복구 불가능
- 모든 세션 데이터, 채팅 기록, 매칭 정보가 함께 삭제됨
- 비밀번호 확인 필수

#### 4. 비밀번호 변경

```http
PATCH /settings/password
```

**Request:**
```json
{
  "currentPassword": "old_password_123",
  "newPassword": "new_secure_password_456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "비밀번호가 성공적으로 변경되었습니다.",
  "changedAt": "2025-01-18T11:00:00.000Z"
}
```

**검증:**
- 현재 비밀번호가 일치해야 함
- 신규 비밀번호는 최소 8자 이상, 영문/숫자/특수문자 조합
- 최근 3개 비밀번호와 중복 불가

---

### 사용자 선호 설정 (User Preferences)

#### 5. 알림 설정 조회

```http
GET /settings/notifications
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pushEnabled": true,
    "emailEnabled": true,
    "matchingNotifications": true,
    "sessionReminders": true,
    "chatMessages": true,
    "systemAnnouncements": false,
    "achievementUpdates": true,
    "weeklyReport": true,
    "soundEnabled": true,
    "vibrationEnabled": true
  }
}
```

#### 6. 알림 설정 업데이트

```http
PATCH /settings/notifications
```

**Request:**
```json
{
  "pushEnabled": true,
  "emailEnabled": false,
  "matchingNotifications": true,
  "sessionReminders": true,
  "chatMessages": true,
  "systemAnnouncements": true,
  "soundEnabled": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pushEnabled": true,
    "emailEnabled": false,
    "matchingNotifications": true,
    "sessionReminders": true,
    "chatMessages": true,
    "systemAnnouncements": true,
    "achievementUpdates": true,
    "weeklyReport": true,
    "soundEnabled": false,
    "vibrationEnabled": true,
    "updatedAt": "2025-01-18T11:15:00.000Z"
  }
}
```

#### 7. 개인정보 설정 조회

```http
GET /settings/privacy
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profileVisibility": "public",
    "showEmail": false,
    "showPhoneNumber": false,
    "showLastSeen": true,
    "allowMatching": true,
    "allowGroupInvites": true,
    "blockList": ["user_456", "user_789"],
    "dataSharing": {
      "analytics": true,
      "thirdParty": false
    }
  }
}
```

**profileVisibility 옵션:**
- `public`: 모든 사용자에게 공개
- `friends`: 매칭된 파트너만
- `private`: 나만 보기

#### 8. 개인정보 설정 업데이트

```http
PATCH /settings/privacy
```

**Request:**
```json
{
  "profileVisibility": "friends",
  "showEmail": false,
  "showLastSeen": false,
  "allowMatching": true,
  "dataSharing": {
    "analytics": true,
    "thirdParty": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profileVisibility": "friends",
    "showEmail": false,
    "showPhoneNumber": false,
    "showLastSeen": false,
    "allowMatching": true,
    "allowGroupInvites": true,
    "blockList": ["user_456", "user_789"],
    "dataSharing": {
      "analytics": true,
      "thirdParty": false
    },
    "updatedAt": "2025-01-18T11:20:00.000Z"
  }
}
```

#### 9. 언어 설정 조회

```http
GET /settings/language
```

**Response:**
```json
{
  "success": true,
  "data": {
    "interfaceLanguage": "ko",
    "nativeLanguage": "ko",
    "learningLanguages": ["en", "ja"],
    "translationEnabled": true,
    "autoDetectLanguage": true,
    "preferredVoice": "ko-KR-Wavenet-A",
    "speechSpeed": 1.0
  }
}
```

**지원 언어 코드:**
- `ko`: 한국어
- `en`: 영어
- `ja`: 일본어
- `zh`: 중국어
- `es`: 스페인어
- `fr`: 프랑스어

#### 10. 언어 설정 업데이트

```http
PATCH /settings/language
```

**Request:**
```json
{
  "interfaceLanguage": "en",
  "nativeLanguage": "ko",
  "learningLanguages": ["en", "ja", "zh"],
  "translationEnabled": true,
  "speechSpeed": 1.2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "interfaceLanguage": "en",
    "nativeLanguage": "ko",
    "learningLanguages": ["en", "ja", "zh"],
    "translationEnabled": true,
    "autoDetectLanguage": true,
    "preferredVoice": "en-US-Wavenet-D",
    "speechSpeed": 1.2,
    "updatedAt": "2025-01-18T11:25:00.000Z"
  }
}
```

---

### 보안 설정 (Security Settings)

#### 11. 2단계 인증 설정 조회

```http
GET /settings/two-factor
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": false,
    "method": null,
    "backupCodesRemaining": 0,
    "lastUsedAt": null
  }
}
```

**활성화된 경우:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "method": "totp",
    "backupCodesRemaining": 8,
    "lastUsedAt": "2025-01-18T08:30:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 12. 2단계 인증 활성화

```http
POST /settings/two-factor/enable
```

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "backupCodes": [
      "12345678",
      "23456789",
      "34567890",
      "45678901",
      "56789012",
      "67890123",
      "78901234",
      "89012345",
      "90123456",
      "01234567"
    ],
    "manualEntryKey": "JBSW Y3DP EHPK 3PXP"
  }
}
```

**사용 방법:**
1. QR 코드를 Google Authenticator 또는 Authy 앱으로 스캔
2. 또는 `manualEntryKey`를 수동 입력
3. 앱에서 생성된 6자리 코드로 활성화 확인
4. 백업 코드를 안전한 곳에 보관

#### 13. 2단계 인증 비활성화

```http
POST /settings/two-factor/disable
```

**Request:**
```json
{
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "2단계 인증이 비활성화되었습니다.",
  "disabledAt": "2025-01-18T11:30:00.000Z"
}
```

**검증:**
- 현재 TOTP 코드 또는 백업 코드 필요
- 비활성화 후 백업 코드는 모두 무효화됨

#### 14. 로그인 기록 조회

```http
GET /settings/login-history
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "login_001",
      "timestamp": "2025-01-18T11:00:00.000Z",
      "ipAddress": "123.456.789.012",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "device": "Desktop - macOS",
      "browser": "Chrome 120.0.0",
      "location": "Seoul, South Korea",
      "status": "success",
      "method": "oauth_google"
    },
    {
      "id": "login_002",
      "timestamp": "2025-01-17T14:30:00.000Z",
      "ipAddress": "234.567.890.123",
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)",
      "device": "Mobile - iOS",
      "browser": "Safari 17.2",
      "location": "Busan, South Korea",
      "status": "success",
      "method": "oauth_naver"
    },
    {
      "id": "login_003",
      "timestamp": "2025-01-16T09:15:00.000Z",
      "ipAddress": "345.678.901.234",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "device": "Desktop - Windows",
      "browser": "Edge 120.0.0",
      "location": "Unknown",
      "status": "failed",
      "method": "password",
      "failureReason": "Invalid password"
    }
  ]
}
```

**필드 설명:**
- `status`: `success` | `failed`
- `method`: `password` | `oauth_google` | `oauth_naver` | `oauth_kakao`
- `location`: GeoIP 기반 위치 추정 (정확하지 않을 수 있음)
- Workers 백엔드에서 최근 30일 기록만 저장 (D1 자동 정리)

---

### 데이터 관리 (Data Management)

#### 15. 데이터 내보내기

```http
POST /settings/export
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exportId": "export_abc123",
    "status": "processing",
    "requestedAt": "2025-01-18T11:35:00.000Z",
    "estimatedCompletionTime": "2025-01-18T11:40:00.000Z",
    "email": "user@example.com",
    "message": "데이터 추출이 시작되었습니다. 완료되면 이메일로 다운로드 링크를 전송합니다."
  }
}
```

**내보내기 완료 후 이메일:**
```
제목: [STUDYMATE] 데이터 내보내기 완료

안녕하세요, John님!

요청하신 데이터 내보내기가 완료되었습니다.

다운로드 링크: https://r2.languagemate.kr/exports/export_abc123.zip
유효기간: 7일 (2025-01-25까지)
파일 크기: 15.3 MB

포함된 데이터:
- 프로필 정보
- 세션 기록 (1:1, 그룹)
- 채팅 메시지
- 학습 분석 데이터
- 업적 및 통계
- 설정 정보

※ 보안을 위해 비밀번호는 포함되지 않습니다.
```

**내보내기 데이터 구조 (ZIP):**
```
user_data_export/
├── profile.json           # 프로필 정보
├── sessions/
│   ├── one_on_one.json   # 1:1 세션 기록
│   └── group.json        # 그룹 세션 기록
├── chats/
│   ├── room_001.json
│   ├── room_002.json
│   └── ...
├── analytics/
│   ├── learning_stats.json
│   ├── ai_usage.json
│   └── achievements.json
└── settings/
    ├── preferences.json
    └── privacy.json
```

**처리 시간:**
- 소량 데이터 (< 1GB): 2-5분
- 대량 데이터 (> 1GB): 10-30분
- Workers Queues를 통한 비동기 처리
- R2 임시 저장소 사용 (7일 후 자동 삭제)

**제약사항:**
- 30일에 1회만 요청 가능
- 최대 파일 크기: 5GB
- 개인정보 보호법(GDPR/PIPA) 준수

---

## 🏆 Achievement API

사용자 업적 시스템 관리를 위한 API 엔드포인트 (총 11개).

### 업적 조회 (Achievement Query)

#### 1. 모든 활성화된 업적 조회

```http
GET /achievements
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ach_001",
      "key": "first_session",
      "name": "첫 세션 완료",
      "description": "첫 번째 학습 세션을 완료하세요",
      "category": "STUDY",
      "icon": "🎓",
      "requiredProgress": 1,
      "reward": {
        "type": "points",
        "amount": 50
      },
      "tier": "bronze",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "ach_002",
      "key": "session_master",
      "name": "세션 마스터",
      "description": "총 100개의 세션을 완료하세요",
      "category": "MILESTONE",
      "icon": "🏅",
      "requiredProgress": 100,
      "reward": {
        "type": "points",
        "amount": 500
      },
      "tier": "gold",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**업적 카테고리:**
- `STUDY`: 학습 관련 업적
- `SOCIAL`: 소셜 활동 업적
- `MILESTONE`: 마일스톤 업적
- `SPECIAL`: 특별 업적
- `STREAK`: 연속 학습 업적

**업적 등급 (Tier):**
- `bronze`: 브론즈 (기본)
- `silver`: 실버 (중급)
- `gold`: 골드 (상급)
- `platinum`: 플래티넘 (최상급)

#### 2. 카테고리별 업적 조회

```http
GET /achievements/category/{category}
```

**Parameters:**
- `category`: `STUDY` | `SOCIAL` | `MILESTONE` | `SPECIAL` | `STREAK`

**Example:**
```http
GET /achievements/category/STUDY
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ach_001",
      "key": "first_session",
      "name": "첫 세션 완료",
      "category": "STUDY",
      "icon": "🎓",
      "requiredProgress": 1,
      "reward": { "type": "points", "amount": 50 },
      "tier": "bronze"
    },
    {
      "id": "ach_003",
      "key": "daily_study",
      "name": "매일 학습",
      "category": "STUDY",
      "icon": "📚",
      "requiredProgress": 30,
      "reward": { "type": "points", "amount": 200 },
      "tier": "silver"
    }
  ]
}
```

#### 3. 내 업적 현황 조회

```http
GET /achievements/my
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userAchievementId": "user_ach_001",
      "achievement": {
        "id": "ach_001",
        "key": "first_session",
        "name": "첫 세션 완료",
        "description": "첫 번째 학습 세션을 완료하세요",
        "category": "STUDY",
        "icon": "🎓",
        "requiredProgress": 1,
        "reward": { "type": "points", "amount": 50 },
        "tier": "bronze"
      },
      "currentProgress": 1,
      "completed": true,
      "completedAt": "2025-01-15T10:30:00.000Z",
      "rewardClaimed": true,
      "claimedAt": "2025-01-15T10:35:00.000Z"
    },
    {
      "userAchievementId": "user_ach_002",
      "achievement": {
        "id": "ach_002",
        "key": "session_master",
        "name": "세션 마스터",
        "description": "총 100개의 세션을 완료하세요",
        "category": "MILESTONE",
        "icon": "🏅",
        "requiredProgress": 100,
        "reward": { "type": "points", "amount": 500 },
        "tier": "gold"
      },
      "currentProgress": 47,
      "completed": false,
      "completedAt": null,
      "rewardClaimed": false,
      "claimedAt": null
    }
  ]
}
```

#### 4. 내 완료된 업적 조회

```http
GET /achievements/my/completed
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userAchievementId": "user_ach_001",
      "achievement": {
        "key": "first_session",
        "name": "첫 세션 완료",
        "icon": "🎓",
        "tier": "bronze"
      },
      "currentProgress": 1,
      "requiredProgress": 1,
      "completedAt": "2025-01-15T10:30:00.000Z",
      "rewardClaimed": true,
      "claimedAt": "2025-01-15T10:35:00.000Z",
      "reward": { "type": "points", "amount": 50 }
    },
    {
      "userAchievementId": "user_ach_005",
      "achievement": {
        "key": "profile_complete",
        "name": "프로필 완성",
        "icon": "✨",
        "tier": "bronze"
      },
      "currentProgress": 1,
      "requiredProgress": 1,
      "completedAt": "2025-01-14T15:20:00.000Z",
      "rewardClaimed": false,
      "claimedAt": null,
      "reward": { "type": "points", "amount": 30 }
    }
  ],
  "total": 2,
  "totalPoints": 80
}
```

#### 5. 내 진행 중인 업적 조회

```http
GET /achievements/my/in-progress
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userAchievementId": "user_ach_002",
      "achievement": {
        "key": "session_master",
        "name": "세션 마스터",
        "description": "총 100개의 세션을 완료하세요",
        "icon": "🏅",
        "tier": "gold"
      },
      "currentProgress": 47,
      "requiredProgress": 100,
      "progressPercentage": 47,
      "remainingProgress": 53,
      "estimatedCompletionDays": 23,
      "lastUpdatedAt": "2025-01-18T09:15:00.000Z"
    },
    {
      "userAchievementId": "user_ach_007",
      "achievement": {
        "key": "daily_streak",
        "name": "연속 학습 스트릭",
        "description": "7일 연속 학습하세요",
        "icon": "🔥",
        "tier": "silver"
      },
      "currentProgress": 4,
      "requiredProgress": 7,
      "progressPercentage": 57,
      "remainingProgress": 3,
      "estimatedCompletionDays": 3,
      "lastUpdatedAt": "2025-01-18T08:00:00.000Z"
    }
  ],
  "total": 2
}
```

#### 6. 내 업적 통계 조회

```http
GET /achievements/my/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAchievements": 45,
    "completedAchievements": 12,
    "inProgressAchievements": 18,
    "notStartedAchievements": 15,
    "completionRate": 26.67,
    "totalPointsEarned": 1250,
    "totalPointsAvailable": 5000,
    "categoriesProgress": {
      "STUDY": {
        "total": 15,
        "completed": 5,
        "completionRate": 33.33
      },
      "SOCIAL": {
        "total": 10,
        "completed": 3,
        "completionRate": 30.00
      },
      "MILESTONE": {
        "total": 8,
        "completed": 2,
        "completionRate": 25.00
      },
      "SPECIAL": {
        "total": 7,
        "completed": 1,
        "completionRate": 14.29
      },
      "STREAK": {
        "total": 5,
        "completed": 1,
        "completionRate": 20.00
      }
    },
    "tiersProgress": {
      "bronze": { "total": 20, "completed": 8 },
      "silver": { "total": 15, "completed": 3 },
      "gold": { "total": 8, "completed": 1 },
      "platinum": { "total": 2, "completed": 0 }
    },
    "recentCompletions": [
      {
        "achievementKey": "first_session",
        "name": "첫 세션 완료",
        "completedAt": "2025-01-15T10:30:00.000Z"
      },
      {
        "achievementKey": "profile_complete",
        "name": "프로필 완성",
        "completedAt": "2025-01-14T15:20:00.000Z"
      }
    ],
    "nearCompletion": [
      {
        "achievementKey": "daily_streak",
        "name": "연속 학습 스트릭",
        "currentProgress": 4,
        "requiredProgress": 7,
        "progressPercentage": 57
      }
    ]
  }
}
```

---

### 업적 진행도 관리 (Progress Management)

#### 7. 업적 진행도 업데이트

```http
POST /achievements/progress
```

**Request:**
```json
{
  "achievementKey": "session_master",
  "progress": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userAchievementId": "user_ach_002",
    "achievementKey": "session_master",
    "previousProgress": 47,
    "currentProgress": 50,
    "requiredProgress": 100,
    "progressPercentage": 50,
    "completed": false,
    "updatedAt": "2025-01-18T11:00:00.000Z"
  }
}
```

**자동 완료 처리:**
```json
{
  "success": true,
  "data": {
    "userAchievementId": "user_ach_007",
    "achievementKey": "daily_streak",
    "previousProgress": 6,
    "currentProgress": 7,
    "requiredProgress": 7,
    "progressPercentage": 100,
    "completed": true,
    "completedAt": "2025-01-18T11:00:00.000Z",
    "reward": {
      "type": "points",
      "amount": 100
    }
  },
  "message": "축하합니다! '연속 학습 스트릭' 업적을 달성했습니다!"
}
```

#### 8. 업적 진행도 증가

```http
POST /achievements/progress/increment?achievementKey={key}&increment={value}
```

**Parameters:**
- `achievementKey`: 업적 키 (필수)
- `increment`: 증가량 (기본값: 1)

**Example:**
```http
POST /achievements/progress/increment?achievementKey=chat_master&increment=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userAchievementId": "user_ach_010",
    "achievementKey": "chat_master",
    "previousProgress": 249,
    "currentProgress": 250,
    "requiredProgress": 1000,
    "progressPercentage": 25,
    "incrementAmount": 1,
    "updatedAt": "2025-01-18T11:05:00.000Z"
  }
}
```

**대량 증가 예제:**
```http
POST /achievements/progress/increment?achievementKey=helpful_partner&increment=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userAchievementId": "user_ach_015",
    "achievementKey": "helpful_partner",
    "previousProgress": 8,
    "currentProgress": 13,
    "requiredProgress": 50,
    "progressPercentage": 26,
    "incrementAmount": 5,
    "updatedAt": "2025-01-18T11:05:00.000Z"
  }
}
```

---

### 보상 및 시스템 관리 (Rewards & System)

#### 9. 보상 수령

```http
POST /achievements/{userAchievementId}/claim-reward
```

**Example:**
```http
POST /achievements/user_ach_001/claim-reward
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userAchievementId": "user_ach_001",
    "achievementKey": "first_session",
    "achievementName": "첫 세션 완료",
    "reward": {
      "type": "points",
      "amount": 50
    },
    "claimed": true,
    "claimedAt": "2025-01-18T11:10:00.000Z",
    "newTotalPoints": 1300
  },
  "message": "50 포인트를 획득했습니다!"
}
```

**이미 수령한 경우:**
```json
{
  "success": false,
  "error": "REWARD_ALREADY_CLAIMED",
  "message": "이미 보상을 수령한 업적입니다.",
  "claimedAt": "2025-01-15T10:35:00.000Z"
}
```

**미완료 업적:**
```json
{
  "success": false,
  "error": "ACHIEVEMENT_NOT_COMPLETED",
  "message": "업적을 먼저 완료해야 보상을 받을 수 있습니다.",
  "currentProgress": 47,
  "requiredProgress": 100
}
```

#### 10. 업적 초기화

```http
POST /achievements/initialize
```

**사용 시점:**
- 새 사용자 회원가입 직후
- 온보딩 완료 시
- 시스템에서 자동 호출

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "totalAchievementsInitialized": 45,
    "categories": {
      "STUDY": 15,
      "SOCIAL": 10,
      "MILESTONE": 8,
      "SPECIAL": 7,
      "STREAK": 5
    },
    "initializedAt": "2025-01-18T11:15:00.000Z"
  },
  "message": "업적 시스템이 성공적으로 초기화되었습니다."
}
```

**참고:**
- 이미 초기화된 경우 중복 생성되지 않음
- 기존 진행도 유지
- 새로 추가된 업적만 초기화

#### 11. 업적 완료 확인

```http
POST /achievements/check-completion
```

**사용 시점:**
- 세션 완료 후
- 이벤트 발생 후
- 주기적인 시스템 체크 (Workers Cron)

**Response:**
```json
{
  "success": true,
  "data": {
    "newlyCompleted": [
      {
        "userAchievementId": "user_ach_007",
        "achievement": {
          "key": "daily_streak",
          "name": "연속 학습 스트릭",
          "icon": "🔥",
          "tier": "silver"
        },
        "completedAt": "2025-01-18T11:20:00.000Z",
        "reward": {
          "type": "points",
          "amount": 100
        },
        "autoClaimReward": true
      }
    ],
    "totalNewlyCompleted": 1,
    "totalPointsEarned": 100
  },
  "message": "1개의 업적을 새로 달성했습니다!"
}
```

**완료된 업적이 없는 경우:**
```json
{
  "success": true,
  "data": {
    "newlyCompleted": [],
    "totalNewlyCompleted": 0,
    "totalPointsEarned": 0
  },
  "message": "완료된 업적이 없습니다."
}
```

---

### 업적 자동 추적 이벤트

**클라이언트에서 자동 추적되는 이벤트:**

```javascript
// src/api/achievement.js의 trackAchievementEvent 사용
import { trackAchievementEvent } from '@/api/achievement';

// 세션 완료 시
await trackAchievementEvent('SESSION_COMPLETE', { increment: 1 });
// → first_session, session_master, daily_study 자동 증가

// 매칭 성공 시
await trackAchievementEvent('MATCH_SUCCESS', { increment: 1 });
// → first_match, social_butterfly 자동 증가

// 레벨 테스트 완료 시
await trackAchievementEvent('LEVEL_TEST_COMPLETE', { increment: 1 });
// → level_up, assessment_pro 자동 증가

// 채팅 메시지 전송 시
await trackAchievementEvent('CHAT_MESSAGE', { increment: 1 });
// → conversation_starter, chat_master 자동 증가

// 프로필 완성 시
await trackAchievementEvent('PROFILE_COMPLETE', { increment: 1 });
// → profile_complete 자동 증가

// 일일 로그인 시
await trackAchievementEvent('DAILY_LOGIN', { increment: 1 });
// → daily_streak, weekly_streak, monthly_streak 자동 증가

// 다른 사용자 도움 시
await trackAchievementEvent('HELP_OTHERS', { increment: 1 });
// → helpful_partner, mentor 자동 증가

// 완벽한 피드백 받음
await trackAchievementEvent('PERFECT_FEEDBACK', { increment: 1 });
// → perfect_score, accuracy_master 자동 증가
```

**이벤트 추적 패턴:**
```javascript
// 예제: 세션 완료 시 자동 업적 추적
async function completeSession(sessionId) {
  try {
    // 1. 세션 완료 처리
    await sessionApi.completeSession(sessionId);

    // 2. 업적 자동 추적 (에러가 발생해도 메인 기능에 영향 없음)
    const completedAchievements = await trackAchievementEvent('SESSION_COMPLETE');

    // 3. 새로 완료된 업적이 있으면 알림 표시
    if (completedAchievements.length > 0) {
      completedAchievements.forEach(ach => {
        showAchievementNotification(ach);
      });
    }
  } catch (error) {
    console.error('Session completion error:', error);
  }
}
```

**주의사항:**
- `trackAchievementEvent`는 자동으로 `incrementAchievementProgress` 및 `checkAchievementCompletion` 호출
- 에러 발생 시 메인 기능을 방해하지 않도록 조용히 처리 (빈 배열 반환)
- Workers 백엔드에서 중복 방지 로직 처리
- D1 Database 트랜잭션으로 데이터 일관성 보장

---

## 👥 Group Session API

그룹 학습 세션 관리를 위한 API 엔드포인트 (총 21개: 기본 13개 + AI 8개).

### 세션 생명주기 관리 (Lifecycle Management)

#### 1. 그룹 세션 생성

```http
POST /group-sessions
```

**Request:**
```json
{
  "title": "English Conversation Practice",
  "description": "Let's practice daily English conversations!",
  "type": "VIDEO",
  "language": "en",
  "level": "INTERMEDIATE",
  "maxParticipants": 6,
  "scheduledAt": "2025-01-20T15:00:00.000Z",
  "duration": 60,
  "isPublic": true,
  "tags": ["conversation", "daily-life", "beginners-friendly"],
  "topic": "Daily Routines and Small Talk"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "title": "English Conversation Practice",
    "description": "Let's practice daily English conversations!",
    "type": "VIDEO",
    "status": "SCHEDULED",
    "language": "en",
    "level": "INTERMEDIATE",
    "hostId": "user_123",
    "hostName": "John Doe",
    "maxParticipants": 6,
    "currentParticipants": 1,
    "scheduledAt": "2025-01-20T15:00:00.000Z",
    "duration": 60,
    "isPublic": true,
    "joinCode": "ABC123",
    "tags": ["conversation", "daily-life", "beginners-friendly"],
    "topic": "Daily Routines and Small Talk",
    "createdAt": "2025-01-18T12:00:00.000Z"
  }
}
```

**세션 타입:**
- `VIDEO`: 화상 세션
- `AUDIO`: 음성 세션
- `TEXT`: 텍스트 채팅 세션

**레벨:**
- `BEGINNER`: 초급 (CEFR A1-A2)
- `INTERMEDIATE`: 중급 (CEFR B1-B2)
- `ADVANCED`: 고급 (CEFR C1-C2)

#### 2. 세션 ID로 그룹 세션 참가

```http
POST /group-sessions/{sessionId}/join
```

**Request:**
```json
{
  "message": "안녕하세요! 영어 배우고 싶습니다.",
  "micEnabled": true,
  "cameraEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "participantId": "part_456",
    "userId": "user_456",
    "userName": "Alice Kim",
    "role": "PARTICIPANT",
    "joinedAt": "2025-01-20T14:55:00.000Z",
    "micEnabled": true,
    "cameraEnabled": true,
    "message": "안녕하세요! 영어 배우고 싶습니다."
  },
  "session": {
    "title": "English Conversation Practice",
    "hostId": "user_123",
    "currentParticipants": 2,
    "maxParticipants": 6,
    "status": "SCHEDULED"
  }
}
```

**참가 제한:**
- 최대 인원 초과 시 참가 불가
- 호스트에 의해 강퇴당한 사용자는 재참가 불가
- 취소된 세션은 참가 불가

#### 3. 참가 코드로 그룹 세션 참가

```http
POST /group-sessions/join/{joinCode}
```

**Example:**
```http
POST /group-sessions/join/ABC123
```

**Request:**
```json
{
  "message": "I'd like to join!",
  "micEnabled": true,
  "cameraEnabled": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "participantId": "part_789",
    "userId": "user_789",
    "userName": "Bob Lee",
    "role": "PARTICIPANT",
    "joinedAt": "2025-01-20T14:57:00.000Z",
    "micEnabled": true,
    "cameraEnabled": false
  },
  "session": {
    "title": "English Conversation Practice",
    "joinCode": "ABC123",
    "currentParticipants": 3,
    "maxParticipants": 6
  }
}
```

**잘못된 참가 코드:**
```json
{
  "success": false,
  "error": "INVALID_JOIN_CODE",
  "message": "유효하지 않은 참가 코드입니다."
}
```

#### 4. 그룹 세션 나가기

```http
POST /group-sessions/{sessionId}/leave
```

**Response:**
```json
{
  "success": true,
  "message": "세션에서 나갔습니다.",
  "sessionId": "gsess_001",
  "userId": "user_456",
  "leftAt": "2025-01-20T15:30:00.000Z",
  "sessionDuration": 35,
  "remainingParticipants": 2
}
```

**호스트가 나가는 경우:**
```json
{
  "success": true,
  "message": "호스트가 세션에서 나갔습니다. 세션이 종료됩니다.",
  "sessionId": "gsess_001",
  "hostId": "user_123",
  "leftAt": "2025-01-20T15:30:00.000Z",
  "sessionEnded": true,
  "reason": "HOST_LEFT"
}
```

#### 5. 세션 시작 (호스트 전용)

```http
POST /group-sessions/{sessionId}/start
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "status": "ONGOING",
    "startedAt": "2025-01-20T15:00:00.000Z",
    "hostId": "user_123",
    "participants": [
      {
        "userId": "user_123",
        "userName": "John Doe",
        "role": "HOST",
        "micEnabled": true,
        "cameraEnabled": true
      },
      {
        "userId": "user_456",
        "userName": "Alice Kim",
        "role": "PARTICIPANT",
        "micEnabled": true,
        "cameraEnabled": true
      },
      {
        "userId": "user_789",
        "userName": "Bob Lee",
        "role": "PARTICIPANT",
        "micEnabled": true,
        "cameraEnabled": false
      }
    ],
    "totalParticipants": 3
  }
}
```

**권한 없음:**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "호스트만 세션을 시작할 수 있습니다."
}
```

#### 6. 세션 종료 (호스트 전용)

```http
POST /group-sessions/{sessionId}/end
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "status": "COMPLETED",
    "startedAt": "2025-01-20T15:00:00.000Z",
    "endedAt": "2025-01-20T16:05:00.000Z",
    "duration": 65,
    "participants": 3,
    "statistics": {
      "totalSpeakingTime": 195,
      "averageSpeakingTime": 65,
      "messagesExchanged": 47,
      "aiInteractions": 12
    }
  },
  "message": "세션이 성공적으로 종료되었습니다."
}
```

#### 7. 세션 취소 (호스트 전용)

```http
POST /group-sessions/{sessionId}/cancel?reason={reason}
```

**Example:**
```http
POST /group-sessions/gsess_001/cancel?reason=Not enough participants
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "status": "CANCELLED",
    "cancelledAt": "2025-01-20T14:50:00.000Z",
    "cancelledBy": "user_123",
    "reason": "Not enough participants",
    "scheduledAt": "2025-01-20T15:00:00.000Z",
    "notifiedParticipants": 2
  },
  "message": "세션이 취소되었습니다. 참가 신청자들에게 알림이 전송되었습니다."
}
```

---

### 세션 조회 (Session Query)

#### 8. 세션 상세 정보 조회

```http
GET /group-sessions/{sessionId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "title": "English Conversation Practice",
    "description": "Let's practice daily English conversations!",
    "type": "VIDEO",
    "status": "ONGOING",
    "language": "en",
    "level": "INTERMEDIATE",
    "host": {
      "userId": "user_123",
      "userName": "John Doe",
      "profileImage": "https://r2.languagemate.kr/profiles/user123.jpg",
      "level": "ADVANCED",
      "rating": 4.8
    },
    "participants": [
      {
        "userId": "user_456",
        "userName": "Alice Kim",
        "role": "PARTICIPANT",
        "joinedAt": "2025-01-20T14:55:00.000Z",
        "micEnabled": true,
        "cameraEnabled": true
      },
      {
        "userId": "user_789",
        "userName": "Bob Lee",
        "role": "PARTICIPANT",
        "joinedAt": "2025-01-20T14:57:00.000Z",
        "micEnabled": true,
        "cameraEnabled": false
      }
    ],
    "maxParticipants": 6,
    "currentParticipants": 3,
    "scheduledAt": "2025-01-20T15:00:00.000Z",
    "startedAt": "2025-01-20T15:00:00.000Z",
    "duration": 60,
    "isPublic": true,
    "joinCode": "ABC123",
    "tags": ["conversation", "daily-life", "beginners-friendly"],
    "topic": "Daily Routines and Small Talk",
    "createdAt": "2025-01-18T12:00:00.000Z"
  }
}
```

#### 9. 공개 세션 목록 조회

```http
GET /group-sessions?page={page}&size={size}&language={lang}&level={level}
```

**Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `size`: 페이지 크기 (기본값: 20)
- `language`: 언어 필터 (예: `en`, `ko`, `ja`)
- `level`: 레벨 필터 (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`)
- `category`: 카테고리 필터
- `tags`: 태그 필터 (쉼표로 구분)

**Example:**
```http
GET /group-sessions?page=1&size=10&language=en&level=INTERMEDIATE
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "gsess_001",
      "title": "English Conversation Practice",
      "language": "en",
      "level": "INTERMEDIATE",
      "type": "VIDEO",
      "status": "SCHEDULED",
      "hostName": "John Doe",
      "currentParticipants": 3,
      "maxParticipants": 6,
      "scheduledAt": "2025-01-20T15:00:00.000Z",
      "tags": ["conversation", "daily-life"],
      "isPublic": true
    },
    {
      "sessionId": "gsess_002",
      "title": "Business English Workshop",
      "language": "en",
      "level": "ADVANCED",
      "type": "VIDEO",
      "status": "SCHEDULED",
      "hostName": "Sarah Park",
      "currentParticipants": 2,
      "maxParticipants": 4,
      "scheduledAt": "2025-01-21T10:00:00.000Z",
      "tags": ["business", "professional"],
      "isPublic": true
    }
  ],
  "pagination": {
    "page": 1,
    "size": 10,
    "totalPages": 5,
    "totalItems": 47
  }
}
```

#### 10. 내가 참가한 세션 목록 조회

```http
GET /group-sessions/my?page={page}&size={size}&status={status}&role={role}
```

**Parameters:**
- `page`: 페이지 번호
- `size`: 페이지 크기
- `status`: 상태 필터 (`SCHEDULED`, `ONGOING`, `COMPLETED`, `CANCELLED`)
- `role`: 역할 필터 (`HOST`, `PARTICIPANT`)

**Example:**
```http
GET /group-sessions/my?page=1&size=20&status=SCHEDULED&role=PARTICIPANT
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "gsess_001",
      "title": "English Conversation Practice",
      "myRole": "PARTICIPANT",
      "status": "SCHEDULED",
      "hostName": "John Doe",
      "currentParticipants": 3,
      "maxParticipants": 6,
      "scheduledAt": "2025-01-20T15:00:00.000Z",
      "joinedAt": "2025-01-20T14:55:00.000Z"
    },
    {
      "sessionId": "gsess_005",
      "title": "Korean Language Exchange",
      "myRole": "HOST",
      "status": "SCHEDULED",
      "hostName": "Alice Kim",
      "currentParticipants": 4,
      "maxParticipants": 6,
      "scheduledAt": "2025-01-22T18:00:00.000Z",
      "joinedAt": "2025-01-19T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "totalPages": 2,
    "totalItems": 23
  }
}
```

---

### 참가자 관리 (Participant Management)

#### 11. 참가자 강퇴 (호스트 전용)

```http
POST /group-sessions/{sessionId}/kick/{participantUserId}?reason={reason}
```

**Example:**
```http
POST /group-sessions/gsess_001/kick/user_999?reason=Inappropriate behavior
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "kickedUserId": "user_999",
    "kickedUserName": "Troublemaker",
    "kickedBy": "user_123",
    "kickedAt": "2025-01-20T15:25:00.000Z",
    "reason": "Inappropriate behavior",
    "bannedFromSession": true
  },
  "message": "참가자가 세션에서 강퇴되었습니다."
}
```

**권한 없음:**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "호스트만 참가자를 강퇴할 수 있습니다."
}
```

#### 12. 세션 정보 수정 (호스트 전용)

```http
PUT /group-sessions/{sessionId}
```

**Request:**
```json
{
  "title": "Advanced English Conversation",
  "description": "Updated description with new focus",
  "maxParticipants": 8,
  "scheduledAt": "2025-01-20T16:00:00.000Z",
  "tags": ["conversation", "advanced", "fluency"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "title": "Advanced English Conversation",
    "description": "Updated description with new focus",
    "maxParticipants": 8,
    "scheduledAt": "2025-01-20T16:00:00.000Z",
    "tags": ["conversation", "advanced", "fluency"],
    "updatedAt": "2025-01-20T14:00:00.000Z",
    "updatedBy": "user_123"
  },
  "message": "세션 정보가 업데이트되었습니다. 참가자들에게 알림이 전송되었습니다."
}
```

**수정 불가 필드:**
- `sessionId`: 세션 ID (변경 불가)
- `hostId`: 호스트 ID (변경 불가)
- `status`: 상태 (생명주기 API로만 변경)
- `createdAt`: 생성 시간 (변경 불가)

#### 13. 세션 피드백 제출

```http
POST /group-sessions/{sessionId}/rate?rating={rating}&feedback={comment}
```

**Example:**
```http
POST /group-sessions/gsess_001/rate?rating=5&feedback=Great session! Very helpful host.
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "userId": "user_456",
    "rating": 5,
    "feedback": "Great session! Very helpful host.",
    "submittedAt": "2025-01-20T16:10:00.000Z"
  },
  "message": "피드백이 제출되었습니다. 감사합니다!"
}
```

**평점 범위:** 1-5점

---

### AI 기능 (AI Features)

#### 14. 세션 주제 추천

```http
POST /api/v1/group-sessions/ai/recommend-topics
```

**Request:**
```json
{
  "language": "en",
  "level": "INTERMEDIATE",
  "interests": ["travel", "food", "culture"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "topics": [
      {
        "title": "Travel Experiences Around the World",
        "description": "Share and discuss memorable travel stories",
        "difficulty": "INTERMEDIATE",
        "estimatedDuration": 45,
        "tags": ["travel", "storytelling", "culture"],
        "icebreakers": [
          "What's the most interesting place you've ever visited?",
          "If you could travel anywhere right now, where would you go?"
        ]
      },
      {
        "title": "Food and Culinary Adventures",
        "description": "Explore different cuisines and cooking experiences",
        "difficulty": "INTERMEDIATE",
        "estimatedDuration": 40,
        "tags": ["food", "culture", "experiences"],
        "icebreakers": [
          "What's your favorite dish from your country?",
          "Have you tried cooking a foreign cuisine?"
        ]
      }
    ],
    "generatedAt": "2025-01-18T12:30:00.000Z",
    "model": "llama-3.2-3b-instruct"
  }
}
```

#### 15. 대화 분석 및 피드백

```http
POST /api/v1/group-sessions/ai/analyze-conversation
```

**Request:**
```json
{
  "transcript": "Alice: Hi, how are you today?\nBob: I'm good, thank you! How about you?\nAlice: I'm doing great. Did you watch the movie yesterday?\nBob: Yes, I did. It was amazing!",
  "language": "en",
  "participantId": "user_456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "participantId": "user_456",
    "analysis": {
      "grammarScore": 85,
      "vocabularyScore": 78,
      "fluencyScore": 90,
      "pronunciationScore": 82,
      "overallScore": 84
    },
    "strengths": [
      "Natural conversation flow",
      "Good use of common expressions",
      "Clear pronunciation"
    ],
    "improvements": [
      "Try using more advanced vocabulary",
      "Practice past tense forms",
      "Expand on your answers with more details"
    ],
    "suggestions": [
      "Instead of 'good', try 'excellent', 'fantastic', or 'wonderful'",
      "Add more context: 'I did. It was amazing because...'",
      "Practice question forms to maintain conversation"
    ],
    "analyzedAt": "2025-01-20T16:15:00.000Z"
  }
}
```

#### 16. 세션 요약 생성

```http
POST /api/v1/group-sessions/ai/generate-summary
```

**Request:**
```json
{
  "sessionId": "gsess_001",
  "transcript": "Full session transcript...",
  "duration": 65,
  "participants": ["John Doe", "Alice Kim", "Bob Lee"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "summary": {
      "overview": "The session focused on daily routines and small talk. Participants practiced greeting each other, discussing their daily schedules, and sharing weekend plans.",
      "keyTopics": [
        "Greetings and introductions",
        "Daily routines vocabulary",
        "Weekend activities",
        "Making plans"
      ],
      "learningPoints": [
        "Practiced present simple tense for routines",
        "Learned new vocabulary: 'get up', 'commute', 'grab lunch'",
        "Improved question formation skills"
      ],
      "participantContributions": [
        {
          "name": "John Doe",
          "role": "HOST",
          "contribution": "Facilitated discussion, provided vocabulary explanations"
        },
        {
          "name": "Alice Kim",
          "contribution": "Actively participated, asked clarifying questions"
        },
        {
          "name": "Bob Lee",
          "contribution": "Shared personal experiences, practiced new phrases"
        }
      ],
      "nextSteps": [
        "Review vocabulary from today's session",
        "Practice daily routine conversations with a partner",
        "Prepare to discuss hobbies in the next session"
      ]
    },
    "generatedAt": "2025-01-20T16:20:00.000Z"
  }
}
```

#### 17. 아이스브레이커 질문 생성

```http
POST /api/v1/group-sessions/ai/icebreakers
```

**Request:**
```json
{
  "language": "en",
  "level": "INTERMEDIATE",
  "topic": "Travel and Culture"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question": "If you could visit any country in the world, where would you go and why?",
        "type": "open-ended",
        "difficulty": "INTERMEDIATE",
        "targetGrammar": "Conditional (would)",
        "expectedDuration": 5
      },
      {
        "question": "What's the most interesting cultural difference you've experienced?",
        "type": "experience-sharing",
        "difficulty": "INTERMEDIATE",
        "targetGrammar": "Present perfect",
        "expectedDuration": 5
      },
      {
        "question": "Describe a traditional food from your country. How is it made?",
        "type": "descriptive",
        "difficulty": "INTERMEDIATE",
        "targetGrammar": "Passive voice",
        "expectedDuration": 7
      }
    ],
    "tips": [
      "Encourage everyone to share their answers",
      "Allow time for follow-up questions",
      "Create a welcoming atmosphere for all participants"
    ]
  }
}
```

#### 18. 역할극 시나리오 생성

```http
POST /api/v1/group-sessions/ai/roleplay
```

**Request:**
```json
{
  "language": "en",
  "level": "INTERMEDIATE",
  "situation": "Restaurant ordering"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scenario": {
      "title": "Ordering at a Restaurant",
      "description": "Practice common phrases used when ordering food at a restaurant",
      "difficulty": "INTERMEDIATE",
      "estimatedDuration": 15,
      "participants": 2
    },
    "roles": [
      {
        "role": "Customer",
        "description": "You are a customer who wants to order a meal",
        "objectives": [
          "Greet the waiter",
          "Ask about menu items",
          "Place your order",
          "Request the bill"
        ],
        "keyPhrases": [
          "Could I see the menu, please?",
          "What do you recommend?",
          "I'll have the...",
          "Could we get the bill, please?"
        ]
      },
      {
        "role": "Waiter",
        "description": "You are a waiter taking orders and serving customers",
        "objectives": [
          "Welcome the customer",
          "Explain menu items",
          "Take the order",
          "Bring the bill"
        ],
        "keyPhrases": [
          "Welcome! Are you ready to order?",
          "I'd recommend the...",
          "How would you like that cooked?",
          "Here's your bill. Thank you!"
        ]
      }
    ],
    "vocabulary": [
      "appetizer", "main course", "dessert", "beverage",
      "rare", "medium", "well-done", "vegetarian"
    ],
    "tips": [
      "Focus on natural intonation",
      "Practice polite expressions",
      "Switch roles after completing the scenario"
    ]
  }
}
```

#### 19. 실시간 번역

```http
POST /api/v1/group-sessions/ai/translate
```

**Request:**
```json
{
  "text": "안녕하세요! 오늘 날씨가 정말 좋네요.",
  "fromLanguage": "ko",
  "toLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalText": "안녕하세요! 오늘 날씨가 정말 좋네요.",
    "translatedText": "Hello! The weather is really nice today.",
    "fromLanguage": "ko",
    "toLanguage": "en",
    "confidence": 0.95,
    "alternatives": [
      "Hi! The weather is great today.",
      "Hello! It's such nice weather today."
    ]
  }
}
```

**지원 언어:**
- `ko`: 한국어
- `en`: 영어
- `ja`: 일본어
- `zh`: 중국어
- `es`: 스페인어
- `fr`: 프랑스어

#### 20. 세션 매칭 추천

```http
POST /api/v1/group-sessions/ai/match-recommendation
```

**Request:**
```json
{
  "userId": "user_456",
  "userProfile": {
    "nativeLanguage": "ko",
    "learningLanguages": ["en"],
    "level": "INTERMEDIATE",
    "interests": ["travel", "movies", "technology"],
    "preferredSessionType": "VIDEO",
    "availability": ["weekday-evening", "weekend-afternoon"]
  },
  "availableSessions": [
    {
      "sessionId": "gsess_001",
      "title": "English Conversation",
      "language": "en",
      "level": "INTERMEDIATE",
      "tags": ["conversation", "travel"]
    },
    {
      "sessionId": "gsess_002",
      "title": "Tech Talk in English",
      "language": "en",
      "level": "ADVANCED",
      "tags": ["technology", "business"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "sessionId": "gsess_001",
        "matchScore": 92,
        "reasons": [
          "Matches your language level (INTERMEDIATE)",
          "Includes your interest: travel",
          "Video session type (your preference)",
          "Scheduled at your preferred time"
        ],
        "recommendation": "Highly recommended"
      },
      {
        "sessionId": "gsess_002",
        "matchScore": 68,
        "reasons": [
          "Includes your interest: technology",
          "Slightly above your current level (good for growth)"
        ],
        "recommendation": "Good match, but challenging"
      }
    ],
    "topMatch": {
      "sessionId": "gsess_001",
      "matchScore": 92,
      "message": "This session is an excellent fit for you!"
    }
  }
}
```

#### 21. 학습 진행 상황 추적

```http
POST /api/v1/group-sessions/progress/track
```

**Request:**
```json
{
  "sessionId": "gsess_001",
  "userId": "user_456",
  "metrics": {
    "speakingTime": 12,
    "messagesCount": 15,
    "wordsSpoken": 245,
    "newVocabularyLearned": ["commute", "grab lunch", "run errands"],
    "grammarPointsPracticed": ["present simple", "question formation"],
    "participationScore": 85
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "gsess_001",
    "userId": "user_456",
    "progressRecorded": true,
    "cumulativeStats": {
      "totalSessions": 12,
      "totalSpeakingTime": 145,
      "totalWordsSpoken": 2890,
      "vocabularySize": 156,
      "averageParticipation": 82
    },
    "achievements": [
      {
        "key": "session_master",
        "progress": 12,
        "target": 100,
        "progressPercentage": 12
      }
    ],
    "nextMilestone": {
      "type": "SESSION_COUNT",
      "target": 20,
      "current": 12,
      "remaining": 8
    }
  }
}
```

**Workers KV 저장:**
- 키: `progress:user:{userId}:session:{sessionId}`
- TTL: 90일 (자동 만료)
- 실패 시 로컬 스토리지 폴백

---

## 🎯 세션 타입 상세

STUDYMATE는 3가지 주요 세션 타입을 제공합니다.

### 세션 타입 비교

| 세션 타입 | 목적 | 최대 인원 | API 경로 | DB 저장 |
|----------|------|----------|----------|---------|
| **1:1 세션** | 매칭된 파트너와의 정기 학습 | 2명 | `/sessions` | ✅ D1 |
| **그룹 세션** | 공개/비공개 그룹 학습 | 최대 6명 | `/group-sessions` | ✅ D1 |
| **레벨 테스트 세션** | AI 레벨 평가 전용 | 1명 | `/level-test/*` | ❌ KV (임시) |

### 1:1 세션

#### 특징
- partnerId 필수
- 매칭 시스템과 강하게 연결
- Private (두 사용자만)
- 예약 시스템 지원

#### 생성 요청
```javascript
POST /sessions
{
  partnerId: string,           // 필수: 매칭된 파트너 ID
  type: 'audio' | 'video',     // 세션 타입
  scheduledAt: string,         // ISO 8601 시간
  duration: number,            // 분 단위 (기본: 30)
  topic: string,               // 학습 주제
  description: string,         // 세션 설명
  language: string,            // 학습 언어
  targetLanguage: string       // 목표 언어
}
```

### 그룹 세션

#### 특징
- 공개/비공개 설정 (`isPublic`)
- 초대 코드 (`joinCode`)
- 호스트 권한 (생성자)
- 참가자 관리 (강퇴 기능)
- 태그 시스템

#### 생성 요청
```javascript
POST /group-sessions
{
  title: string,                // 필수: 세션 제목
  description: string,          // 필수: 세션 설명
  topicCategory: string,        // 필수: 주제 카테고리
  targetLanguage: string,       // 필수: 학습 언어
  languageLevel: string,        // 필수: 대상 레벨
  maxParticipants: number,      // 필수: 최대 인원 (기본: 6)
  scheduledAt: string,          // 필수: ISO 8601 시간
  sessionDuration: number,      // 필수: 분 단위 (기본: 60)
  isPublic: boolean,            // 필수: 공개 여부
  sessionTags: string[]         // 선택: 태그 배열
}
```

### 레벨 테스트 세션

#### 특징
- KV 기반 (TTL: 14일)
- 단일 사용자
- AI 평가 (Whisper + Llama 3.1)
- 상태 추적 (진행 중/완료/취소)

#### 데이터 구조
```javascript
{
  testId: string,              // UUID
  userId: string,              // 사용자 ID
  languageCode: string,        // 평가 언어
  testType: string,            // 테스트 타입
  testLevel: string,           // 목표 레벨
  questionCount: number,       // 질문 개수
  mode: 'standard' | 'voice',  // 평가 모드
  status: 'in-progress' | 'completed' | 'cancelled',
  questions: Question[],       // 질문 목록
  answers: Answer[],           // 답변 기록
  result?: LevelTestResult     // 평가 결과
}
```

---

## 🔄 API 마이그레이션 가이드

### 주요 변경사항

#### 1. API 베이스 URL 변경
```javascript
// 이전 (레거시 Java API)
const API_BASE_URL = 'https://api.languagemate.kr';

// 현재 (Cloudflare Workers)
const API_BASE_URL = import.meta.env.VITE_WORKERS_API_URL || 'http://localhost:8787';
```

#### 2. 레벨 테스트 API 통합

**이전 방식 (레거시)**:
```javascript
const questions = await getLevelTestQuestions();
const result = await submitLevelTest(audioBlob, questionNumber);
const finalResult = await completeLevelTest(userId);
```

**새로운 방식 (Workers)**:
```javascript
// 1. 테스트 시작
const testData = await startLevelTest('en');
const testId = testData.testId;

// 2. 질문 조회
const questions = await getLevelTestQuestions(testId);

// 3. 음성 답변 제출
const result = await submitVoiceAnswer(testId, questionId, audioBlob);

// 4. 테스트 완료
const finalResult = await completeLevelTest(testId);

// 5. 결과 조회
const testResult = await getLevelTestResult(testId);
```

#### 3. 인증 토큰 통일
```javascript
// 모든 API 호출에서 동일한 토큰 키 사용
headers: {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
}
```

### 마이그레이션 체크리스트

#### 즉시 적용 필요
- [x] API 베이스 URL 환경변수 수정
- [x] 인증 토큰 키 통일 (`accessToken`)
- [x] 온보딩 엔드포인트 경로 수정
- [x] 레벨 테스트 API 함수 교체

#### 점진적 개선
- [x] 에러 처리 표준화
- [x] 재시도 로직 구현
- [ ] 로딩 상태 관리 개선
- [ ] 캐싱 전략 구현

---

## 🤖 LLM 통합 구현

### Cloudflare AI Workers 활용

#### Workers AI 통합 (추천)
```typescript
// workers/src/routes/llm.ts
import { Hono } from 'hono';

const llmRoutes = new Hono();

llmRoutes.post('/chat', async (c) => {
  const body = await c.req.json();

  // Cloudflare AI Workers 사용
  const response = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
    messages: body.messages
  });

  return c.json({ success: true, data: response });
});

export default llmRoutes;
```

#### 레벨 테스트 평가 프롬프트
```javascript
const LEVEL_TEST_EVALUATION_PROMPT = `
You are an expert English language assessor. Evaluate the speaker's English proficiency based on CEFR standards.

Analyze the following aspects:
1. Pronunciation & Accent (0-100)
2. Fluency & Coherence (0-100)
3. Grammar Accuracy (0-100)
4. Vocabulary Range (0-100)
5. Interactive Communication (0-100)

Return a JSON object with:
{
  "cefrLevel": "A1|A2|B1|B2|C1|C2",
  "overallScore": 0-100,
  "pronunciation": 0-100,
  "fluency": 0-100,
  "grammar": 0-100,
  "vocabulary": 0-100,
  "interaction": 0-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
`;
```

### 구현 우선순위

#### Phase 1: 레벨 테스트 LLM 평가 (필수)
1. Cloudflare Workers에 LLM 통합
2. 평가 프롬프트 최적화
3. 결과 구조화 및 D1 저장

#### Phase 2: 실시간 피드백 (선택)
1. Durable Objects를 통한 실시간 전사
2. 문법/발음 오류 감지
3. 실시간 교정 제안

---

## 💻 프론트엔드 통합 가이드

### API 클라이언트 설정

#### Axios 인스턴스
```javascript
// src/api/index.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.languagemate.kr';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터 (JWT 토큰 자동 추가)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response 인터셉터 (토큰 자동 갱신)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refreshToken
          });
          localStorage.setItem('accessToken', data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 에러 처리 패턴

#### 통합 에러 처리
```javascript
// utils/errorHandler.js
export class APIError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends APIError {
  constructor(message = '네트워크 연결을 확인해주세요.') {
    super('NETWORK_ERROR', message);
  }
}

export class ValidationError extends APIError {
  constructor(message, field) {
    super('VALIDATION_ERROR', message);
    this.field = field;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // 서버 응답 에러
    switch (error.response.status) {
      case 401:
        // 인증 에러 - 인터셉터가 처리
        break;
      case 403:
        return new APIError('FORBIDDEN', '권한이 없습니다.');
      case 404:
        return new APIError('NOT_FOUND', '요청한 리소스를 찾을 수 없습니다.');
      case 500:
        return new APIError('SERVER_ERROR', '서버 오류가 발생했습니다.');
      default:
        return new APIError(
          error.response.data?.error?.code || 'UNKNOWN',
          error.response.data?.error?.message || '오류가 발생했습니다.'
        );
    }
  } else if (error.request) {
    // 네트워크 에러
    return new NetworkError();
  }
  return error;
};
```

### 컴포넌트 통합 예시

#### 레벨 테스트 컴포넌트
```javascript
// pages/LevelTest/LevelTestRecording.jsx
import { useState } from 'react';
import levelTestAPI, { APIError, NetworkError } from '../api/levelTestAPI';

export default function LevelTestRecording() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleNext = async () => {
    if (!hasRecording || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const userId = localStorage.getItem('userId') || 'guest';
      const result = await levelTestAPI.submitAnswer(
        currentRecording.blob,
        currentQuestionIndex + 1
      );

      console.log('Submission successful:', result);

      if (currentQuestionIndex < totalQuestions - 1) {
        nextQuestion();
      } else {
        await completeTest();
      }

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error);

      let errorMessage = '알 수 없는 오류가 발생했습니다.';

      if (error instanceof NetworkError) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (error.code === 'FILE_TOO_LARGE') {
        errorMessage = '음성 파일이 너무 큽니다. 다시 녹음해주세요.';
      } else if (error.code === 'TRANSCRIPTION_FAILED') {
        errorMessage = '음성 인식에 실패했습니다. 다시 시도해주세요.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      alert(errorMessage);

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* 에러 표시 */}
      {submitError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 text-sm">{submitError.message}</p>
          {submitError instanceof NetworkError && retryCount < 3 && (
            <button
              onClick={() => handleNext()}
              className="mt-2 text-sm text-red-600 underline"
            >
              다시 시도 ({retryCount + 1}/3)
            </button>
          )}
        </div>
      )}

      {/* 제출 버튼 */}
      <CommonButton
        onClick={handleNext}
        disabled={isSubmitting}
        variant="primary"
      >
        {isSubmitting ? '제출 중...' : '다음 질문'}
      </CommonButton>
    </div>
  );
}
```

### Zustand Store 통합

```javascript
// store/levelTestStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import levelTestAPI from '../api/levelTestAPI';

const useLevelTestStore = create(
  persist(
    (set, get) => ({
      questions: [],
      currentQuestionIndex: 0,
      recordings: [],
      testStatus: 'idle',
      result: null,

      loading: {
        questions: false,
        submission: false,
        completion: false,
        result: false
      },

      errors: {
        questions: null,
        submission: null,
        completion: null,
        result: null
      },

      // 질문 로드
      loadQuestions: async () => {
        try {
          set(state => ({
            loading: { ...state.loading, questions: true }
          }));

          const questions = await levelTestAPI.getQuestions();
          set({ questions });

        } catch (error) {
          set(state => ({
            errors: { ...state.errors, questions: error }
          }));
          throw error;
        } finally {
          set(state => ({
            loading: { ...state.loading, questions: false }
          }));
        }
      },

      // 답변 제출
      submitAnswer: async (audioBlob, questionNumber) => {
        try {
          set(state => ({
            loading: { ...state.loading, submission: true }
          }));

          const result = await levelTestAPI.submitAnswer(audioBlob, questionNumber);

          set(state => ({
            recordings: [
              ...state.recordings.filter(r => r.questionIndex !== questionNumber - 1),
              {
                questionIndex: questionNumber - 1,
                blob: audioBlob,
                transcription: result.transcription,
                timestamp: new Date().toISOString()
              }
            ]
          }));

          return result;

        } catch (error) {
          set(state => ({
            errors: { ...state.errors, submission: error }
          }));
          throw error;
        } finally {
          set(state => ({
            loading: { ...state.loading, submission: false }
          }));
        }
      },

      // 테스트 완료
      completeTest: async (userId) => {
        try {
          set(state => ({
            loading: { ...state.loading, completion: true },
            testStatus: 'processing'
          }));

          const result = await levelTestAPI.completeTest(userId);

          set({
            result,
            testStatus: 'completed'
          });

          return result;

        } catch (error) {
          set(state => ({
            errors: { ...state.errors, completion: error },
            testStatus: 'error'
          }));
          throw error;
        } finally {
          set(state => ({
            loading: { ...state.loading, completion: false }
          }));
        }
      },

      // 리셋
      resetTest: () => set({
        currentQuestionIndex: 0,
        recordings: [],
        testStatus: 'idle',
        result: null,
        errors: {
          questions: null,
          submission: null,
          completion: null,
          result: null
        }
      })
    }),
    {
      name: 'level-test-storage',
      partialize: (state) => ({
        currentQuestionIndex: state.currentQuestionIndex,
        testStatus: state.testStatus
      })
    }
  )
);

export default useLevelTestStore;
```

---

## 🔐 에러 코드

| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| `AUTH_001` | 인증 토큰 없음 | 401 |
| `AUTH_002` | 토큰 만료 | 401 |
| `AUTH_003` | 유효하지 않은 토큰 | 401 |
| `USER_001` | 사용자 없음 | 404 |
| `USER_002` | 권한 없음 | 403 |
| `ONBOARD_001` | 온보딩 미완료 | 400 |
| `MATCH_001` | 매칭 실패 | 400 |
| `CHAT_001` | 채팅방 없음 | 404 |
| `SESSION_001` | 세션 만료 | 410 |
| `SESSION_002` | 세션 정원 초과 | 400 |
| `FILE_TOO_LARGE` | 파일 크기 초과 | 400 |
| `TRANSCRIPTION_FAILED` | 음성 인식 실패 | 500 |
| `EVALUATION_FAILED` | AI 평가 실패 | 500 |

---

## 📊 API 사용 통계

### 호출 빈도 (일일 평균)
1. `/api/v1/auth/refresh` - 10,000+ 호출
2. `/api/v1/chat/room/*/messages` - 8,000+ 호출
3. `/api/v1/matching/list` - 5,000+ 호출
4. `/api/v1/session/*/join` - 3,000+ 호출
5. `/api/v1/leveltest/evaluate` - 500+ 호출

### 응답 시간 목표
- 일반 API: < 200ms
- AI API: < 3000ms
- WebSocket: < 50ms

---

## 🔗 관련 문서

- [프로젝트 개요](../01-overview/overview.md)
- [시스템 아키텍처](../03-architecture/architecture.md)
- [데이터베이스 스키마](../05-database/database.md)
- [프론트엔드 가이드](../06-frontend/frontend.md)
- [백엔드 가이드](../07-backend/)

---

*이 API 가이드는 STUDYMATE 프로젝트의 API 사용 방법을 정의하며, 모든 개발자는 이 가이드를 준수해야 합니다.*
