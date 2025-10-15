# 📋 Workers Backend 문서 참조 체크리스트

## 📅 작성일: 2025년 1월 10일

## 🎯 목적
STUDYMATE-CLIENT 개발 및 문서 작성 시 Cloudflare Workers 백엔드 문서를 체계적으로 참조하기 위한 체크리스트

---

## 🔍 API 개발 체크리스트

### 새로운 API 연동 시
- [ ] `workers/src/routes/` 라우트 정의 확인
- [ ] `workers/src/handlers/` 실제 핸들러 구현 확인
- [ ] Workers API 요청/응답 스키마 확인
- [ ] `workers/docs/error-codes.md` 에러 코드 확인

### API 수정 시
- [ ] Workers 백엔드 최신 변경사항 확인
- [ ] API 엔드포인트 문서 확인
- [ ] Postman 컬렉션 업데이트 확인

### 예시 체크
```typescript
// CLIENT 코드 작성 전 확인
// 1. workers/src/routes/user.ts
// 2. workers/src/handlers/user.ts
// 3. API 응답 스키마 확인

interface UserResponse {
  id: number;
  email: string;
  englishName: string;
  // ... Workers API 응답과 일치하는지 확인
}
```

---

## 💾 데이터베이스 체크리스트

### 새로운 기능 개발 시
- [ ] `workers/schema/` D1 데이터베이스 스키마 확인
- [ ] Workers KV 스토리지 사용 계획 확인
- [ ] Durable Objects 상태 관리 확인
- [ ] R2 Storage 사용 계획 확인

### 상태 관리 설계 시
- [ ] Workers 데이터 구조와 CLIENT 상태 구조 매핑
- [ ] 필수 필드와 옵셔널 필드 확인
- [ ] 연관 관계 확인

---

## 🏗️ 아키텍처 체크리스트

### 시스템 설계 시
- [ ] `workers/src/` 전체 구조 이해
- [ ] Hono 프레임워크 라우팅 구조 확인
- [ ] Durable Objects 아키텍처 확인

### WebSocket 구현 시
- [ ] `workers/src/durable-objects/` Durable Objects 설정 확인
- [ ] WebSocket 핸들러 구현 확인
- [ ] 실시간 통신 경로 확인

---

## 🔐 인증/인가 체크리스트

### OAuth 구현 시
- [ ] `workers/src/handlers/auth.ts` OAuth 로직 확인
- [ ] Workers 환경 변수 설정 확인
- [ ] OAuth 이슈 히스토리 확인

### JWT 토큰 처리 시
- [ ] `workers/src/utils/jwt.ts` JWT 유틸 확인
- [ ] 토큰 만료 시간 확인
- [ ] Refresh Token 로직 확인
- [ ] 토큰 관련 이슈 확인

---

## ⚠️ 에러 처리 체크리스트

### 에러 핸들링 구현 시
- [ ] `workers/src/middleware/error-handler.ts` 에러 핸들러 확인
- [ ] Workers 에러 응답 형식 확인
- [ ] 에러 코드 정의 확인

### 에러 코드 매핑
```javascript
// Workers 에러 코드와 동기화
const ERROR_CODES = {
  // AUTH Errors
  'AUTH_001': '인증 실패',
  'AUTH_002': '토큰 만료',
  'AUTH_003': '권한 없음',

  // USER Errors
  'USER_001': '사용자를 찾을 수 없음',
  'USER_002': '중복된 이메일',

  // MATCHING Errors
  'MATCH_001': '매칭 실패',
  'MATCH_002': '이미 매칭됨',
};
```

---

## 🚀 배포 체크리스트

### 배포 준비 시
- [ ] Cloudflare Workers 배포 프로세스 확인
- [ ] Wrangler 설정 확인 (`wrangler.toml`)
- [ ] Workers 환경 변수 설정 확인
- [ ] Cloudflare Pages 배포 설정 확인

### 환경별 설정
- [ ] 개발 환경: `http://localhost:8787`
- [ ] 스테이징 환경: Cloudflare Workers 스테이징
- [ ] 프로덕션 환경: `https://api.languagemate.kr`

---

## 📊 성능 모니터링 체크리스트

### 성능 최적화 시
- [ ] Cloudflare Analytics 확인
- [ ] Workers KV 캐시 전략 확인
- [ ] API 응답 시간 목표 확인 (< 200ms)
- [ ] 페이지 로드 시간 목표 확인 (< 3s)

---

## 🐛 디버깅 체크리스트

### 이슈 발생 시
- [ ] `docs/99-logs/failure-patterns/` 유사 이슈 확인
- [ ] `docs/99-logs/work-sessions/` 작업 로그 확인
- [ ] Cloudflare Workers 로그 확인
- [ ] CLIENT 콘솔 에러와 Workers 에러 로그 대조

### 주요 이슈 히스토리
- [ ] OAuth 처리 이슈 확인
- [ ] 토큰 무한 루프: 작업 세션 로그 확인
- [ ] API 통합 이슈: 통합 리포트 확인

---

## 📝 문서 동기화 체크리스트

### 주간 체크
- [ ] Workers API 문서 변경사항 확인
- [ ] 새로운 엔드포인트 추가 여부
- [ ] 에러 코드 추가/변경 여부
- [ ] 데이터 스키마 변경 여부

### 월간 체크
- [ ] 아키텍처 변경사항 반영
- [ ] 기술 스택 업데이트 확인
- [ ] 프로세스 가이드 변경사항
- [ ] 성능 목표 변경사항

---

## 🔧 개발 프로세스 체크리스트

### 기능 개발 시작 전
- [ ] Workers 개발 워크플로우 확인
- [ ] API 통합 가이드 확인
- [ ] Workers API 스펙 확인
- [ ] Mockup 데이터 구조 Workers 응답과 일치 확인

### PR 생성 전
- [ ] API 연동 테스트 완료
- [ ] 에러 처리 시나리오 테스트
- [ ] Workers 문서 참조 링크 포함
- [ ] 변경사항이 Workers 백엔드와 호환되는지 확인

---

## 📌 빠른 참조 링크

### 핵심 Workers 문서
```bash
# 라우트 확인
ls workers/src/routes/

# 핸들러 확인
ls workers/src/handlers/

# Durable Objects 확인
ls workers/src/durable-objects/

# 미들웨어 확인
ls workers/src/middleware/
```

### 실제 구현 확인
```bash
# 라우트 정의
cat workers/src/index.ts

# API 핸들러
ls workers/src/handlers/

# 스키마 확인
ls workers/schema/
```

---

## ✅ 체크리스트 사용법

1. **새 기능 개발 시**: 관련 섹션의 모든 항목 체크
2. **버그 수정 시**: 디버깅 체크리스트 활용
3. **API 변경 시**: API 개발 체크리스트 필수 확인
4. **배포 전**: 배포 체크리스트 전체 검토

---

*이 체크리스트는 STUDYMATE-CLIENT 개발 시 Cloudflare Workers 백엔드를 효과적으로 참조하기 위한 가이드입니다.*
*최종 업데이트: 2025년 10월 14일*