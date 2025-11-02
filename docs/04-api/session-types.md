# 세션 타입 가이드

## 개요

STUDYMATE는 다양한 학습 시나리오를 위해 **3가지 주요 세션 타입**을 제공합니다. 각 세션 타입은 명확한 목적과 사용 사례를 가지고 있으며, **독립적인 API 엔드포인트**로 관리됩니다.

## 🎯 세션 타입 비교

| 세션 타입 | 목적 | 최대 인원 | 생성 방식 | API 경로 | DB 저장 |
|----------|------|----------|----------|----------|---------|
| **1:1 세션** | 매칭된 파트너와의 정기 학습 | 2명 | 사용자 직접 생성 또는 매칭 자동 생성 | `/sessions` | ✅ D1 |
| **그룹 세션** | 공개/비공개 그룹 학습 | 최대 6명 | 호스트가 생성, 참가자 초대/참여 | `/group-sessions` | ✅ D1 |
| **레벨 테스트 세션** | AI 레벨 평가 전용 | 1명 | 시스템 자동 생성 (테스트 시작 시) | `/level-test/*` | ❌ KV (임시) |

---

## 1️⃣ 1:1 세션 (Session)

### 📌 개념
매칭된 언어 파트너와의 **1대1 학습 세션**. 정기적인 학습 스케줄을 위해 설계되었습니다.

### 🔑 주요 특징
- **partnerId 필수**: 매칭된 파트너 ID 필요
- **매칭 컨텍스트**: 매칭 시스템과 강하게 연결
- **Private**: 두 사용자만 참여 가능
- **예약 시스템**: 일정 예약 및 리마인더 지원

### 📋 데이터 구조

#### 생성 요청 (POST /sessions)
```javascript
{
  partnerId: string,           // 필수: 매칭된 파트너 ID
  type: 'audio' | 'video',     // 세션 타입
  scheduledAt: string,         // ISO 8601 시간 (필수)
  duration: number,            // 분 단위 (기본: 30)
  topic: string,               // 학습 주제
  description: string,         // 세션 설명
  language: string,            // 학습 언어
  targetLanguage: string,      // 목표 언어
  webRtcRoomId: string,        // WebRTC 룸 ID (선택)
  webRtcRoomType: string       // WebRTC 룸 타입 (선택)
}
```

#### 백엔드 정규화 (normalizeCreatePayload)
```typescript
{
  title: string,               // topic 또는 기본값
  sessionType: 'VIDEO' | 'AUDIO',  // 대문자 변환
  languageCode: string,        // language 필드
  scheduledAt: string,         // ISO 8601
  durationMinutes: number,     // duration → durationMinutes
  partnerId: string,           // 그대로 전달
  ...
}
```

### 🔗 라이프사이클
```
매칭 요청 → 매칭 수락 → 채팅 → 세션 예약 → 세션 시작 → 세션 종료 → 피드백
```

### 📡 주요 API
- `POST /sessions` - 세션 생성
- `GET /sessions` - 세션 목록
- `GET /sessions/:id` - 세션 상세
- `POST /sessions/:id/join` - 세션 참가
- `POST /sessions/:id/start` - 세션 시작
- `POST /sessions/:id/end` - 세션 종료
- `POST /sessions/:id/cancel` - 세션 취소

---

## 2️⃣ 그룹 세션 (Group Session)

### 📌 개념
여러 학습자가 함께 참여하는 **그룹 학습 세션**. 공개 모집 또는 초대 방식으로 운영됩니다.

### 🔑 주요 특징
- **공개/비공개 설정**: `isPublic` 플래그로 제어
- **초대 코드**: `joinCode`로 참가 가능
- **호스트 권한**: 세션 생성자가 관리 권한 보유
- **참가자 관리**: 최대 인원 제한, 강퇴 기능
- **태그 시스템**: 주제별 분류 및 검색

### 📋 데이터 구조

#### 생성 요청 (POST /group-sessions)
```javascript
{
  title: string,                // 필수: 세션 제목
  description: string,          // 필수: 세션 설명
  topicCategory: string,        // 필수: 주제 카테고리 (예: "비즈니스 영어")
  targetLanguage: string,       // 필수: 학습 언어
  languageLevel: string,        // 필수: 대상 레벨 (예: "B1-B2")
  maxParticipants: number,      // 필수: 최대 인원 (기본: 6)
  scheduledAt: string,          // 필수: ISO 8601 시간
  sessionDuration: number,      // 필수: 분 단위 (기본: 60)
  isPublic: boolean,            // 필수: 공개 여부
  sessionTags: string[]         // 선택: 태그 배열
}
```

#### 클라이언트 필드명 매핑 (normalizeSessionRecord)
```javascript
// 백엔드 → 클라이언트
{
  hostUserId → hostId,
  hostUserName → hostName,
  targetLanguage → language,
  languageLevel → targetLevel,
  scheduledAt → scheduledStartTime,
  sessionDuration → durationMinutes,
  topicCategory → topic,
  sessionTags → tags
}
```

### 🔗 라이프사이클
```
생성 → 공개 → 참가자 모집 → 세션 시작 → 진행 → 종료 → 평가
```

### 📡 주요 API
- `POST /group-sessions` - 그룹 세션 생성
- `GET /group-sessions` - 공개 세션 목록
- `GET /group-sessions/my` - 내 참가 세션
- `POST /group-sessions/:id/join` - 세션 참가
- `POST /group-sessions/join/:code` - 코드로 참가
- `POST /group-sessions/:id/start` - 세션 시작 (호스트 전용)
- `POST /group-sessions/:id/end` - 세션 종료 (호스트 전용)
- `POST /group-sessions/:id/kick/:userId` - 참가자 강퇴

---

## 3️⃣ 레벨 테스트 세션 (Level Test Session)

### 📌 개념
AI 기반 언어 레벨 평가를 위한 **임시 세션**. DB에 저장되지 않고 KV에서 관리됩니다.

### 🔑 주요 특징
- **KV 기반**: Cloudflare Workers KV에 임시 저장 (TTL: 14일)
- **단일 사용자**: 1명만 참여
- **AI 평가**: Whisper + Llama 3.1 기반 평가
- **상태 추적**: 진행 중/완료/취소 상태 관리

### 📋 데이터 구조
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

### 🔗 라이프사이클
```
테스트 시작 → KV 세션 생성 → 질문 답변 → AI 평가 → 결과 저장 → KV 세션 삭제
```

### 📡 주요 API
- `POST /level-test/sessions` - 세션 시작
- `GET /level-test/sessions/:id` - 세션 상태 조회
- `POST /level-test/sessions/:id/answer` - 답변 제출
- `POST /level-test/sessions/:id/complete` - 테스트 완료

---

## 🔄 필드명 표준화 가이드

### 일반 원칙
1. **클라이언트 → 백엔드**: `어댑터 함수` 사용 (필드명 변환)
2. **백엔드 → 클라이언트**: `normalizeXXX 함수` 사용 (필드명 역변환)
3. **신규 API**: 통일된 필드명 사용 권장

### 필드명 매핑표

| 개념 | 1:1 세션 (Client) | 1:1 세션 (Backend) | 그룹 세션 (Client) | 그룹 세션 (Backend) | 표준 필드명 |
|------|------------------|-------------------|-------------------|--------------------| ------------|
| 시작 시간 | `scheduledAt` | `scheduledAt` | `scheduledStartTime` | `scheduledAt` | `scheduledAt` ✅ |
| 세션 길이 | `duration` | `durationMinutes` | `durationMinutes` | `sessionDuration` | `durationMinutes` ⚠️ |
| 세션 타입 | `type` | `sessionType` | - | `sessionType` | `sessionType` ⚠️ |
| 언어 코드 | `language` | `languageCode` | `language` | `targetLanguage` | `languageCode` ❌ |
| 주제 | `topic` | `title` | `topic` | `topicCategory` | `topic` ❌ |

**범례:**
- ✅ 완전히 통일됨
- ⚠️ 부분적으로 불일치 (어댑터로 해결 가능)
- ❌ 심각한 불일치 (리팩토링 필요)

---

## 🛠️ 개발 가이드

### 새로운 세션 기능 추가 시

1. **도메인 결정**: 1:1 세션인가? 그룹 세션인가?
2. **API 엔드포인트**: 기존 경로 활용 (`/sessions` vs `/group-sessions`)
3. **필드명 확인**: 위 매핑표 참고하여 일관성 유지
4. **어댑터 사용**: 필드명 변환이 필요한 경우 어댑터 함수 활용

### 클라이언트 코드 예시

```javascript
// 1:1 세션 생성
import { createSession } from '@/api/session';

const session = await createSession({
  partnerId: 'user123',
  type: 'video',
  scheduledAt: '2025-11-03T10:00:00Z',
  duration: 30,
  topic: 'Business English'
});

// 그룹 세션 생성
import { createGroupSession } from '@/api/groupSession';

const groupSession = await createGroupSession({
  title: 'TOEIC Speaking Practice',
  description: '토익 스피킹 스터디',
  topicCategory: 'TOEIC',
  targetLanguage: 'en',
  languageLevel: 'B1-B2',
  maxParticipants: 4,
  scheduledStartTime: '2025-11-03T14:00:00Z',
  durationMinutes: 60,
  isPublic: true,
  tags: ['TOEIC', 'Speaking', 'Study Group']
});
```

---

## ❓ FAQ

### Q1: 왜 1:1 세션과 그룹 세션을 통합하지 않나요?
**A:** 도메인 경계가 명확하고, 비즈니스 로직이 완전히 다릅니다. 통합 시 복잡도만 증가하고 유지보수성이 떨어집니다.

### Q2: 필드명 불일치를 어떻게 해결하나요?
**A:**
1. **단기**: 클라이언트 어댑터 함수 사용 (`normalizeSessionRecord`)
2. **중기**: 새로운 API는 표준 필드명 사용
3. **장기**: Phase 6 마무리 단계에서 전체 리팩토링 고려

### Q3: 새로운 세션 타입이 필요하면?
**A:** 먼저 기존 타입으로 해결 가능한지 검토하세요. 정말 필요한 경우 별도 도메인으로 분리하고 새로운 API 엔드포인트를 생성하세요.

---

## 📚 참고 자료

- [API 명세서](./api-specification.md)
- [데이터베이스 스키마](../05-database/erd.md)
- [시스템 아키텍처](../03-architecture/system-architecture.md)
- [PRD 문서](../../.taskmaster/docs/prd.txt)

---

**최종 업데이트**: 2025-11-02
**작성자**: Claude Code Assistant
