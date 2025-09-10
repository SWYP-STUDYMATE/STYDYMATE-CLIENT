# 📋 SERVER 문서 참조 체크리스트

## 📅 작성일: 2025년 1월 10일

## 🎯 목적
STUDYMATE-CLIENT 개발 및 문서 작성 시 STUDYMATE-SERVER 문서를 체계적으로 참조하기 위한 체크리스트

---

## 🔍 API 개발 체크리스트

### 새로운 API 연동 시
- [ ] `STUDYMATE-SERVER/docs/04-api/api-reference.md` 에서 엔드포인트 확인
- [ ] `STUDYMATE-SERVER/src/main/java/*/controller/` 실제 컨트롤러 구현 확인
- [ ] `STUDYMATE-SERVER/src/main/java/*/dto/request/` Request DTO 확인
- [ ] `STUDYMATE-SERVER/src/main/java/*/dto/response/` Response DTO 확인
- [ ] `STUDYMATE-SERVER/docs/07-backend/error-handling.md` 에러 코드 확인

### API 수정 시
- [ ] SERVER 브랜치에서 최신 변경사항 pull
- [ ] `STUDYMATE-SERVER/docs/04-api/client-server-integration.md` 통합 가이드 확인
- [ ] Swagger UI 확인: `https://api.languagemate.kr/swagger-ui/index.html`
- [ ] Postman 컬렉션 업데이트 확인

### 예시 체크
```typescript
// CLIENT 코드 작성 전 확인
// 1. SERVER/docs/04-api/api-reference.md#user-endpoints
// 2. SERVER/src/main/java/com/studymate/controller/UserController.java
// 3. SERVER/src/main/java/com/studymate/dto/response/UserResponse.java

interface UserResponse {
  id: number;
  email: string;
  englishName: string;
  // ... SERVER DTO와 일치하는지 확인
}
```

---

## 💾 데이터베이스 체크리스트

### 새로운 기능 개발 시
- [ ] `STUDYMATE-SERVER/docs/05-database/database-schema.md` 테이블 구조 확인
- [ ] `STUDYMATE-SERVER/docs/05-database/entity-details.md` 엔티티 관계 확인
- [ ] `STUDYMATE-SERVER/src/main/java/*/entity/` JPA 엔티티 확인
- [ ] `STUDYMATE-SERVER/docs/05-database/redis-cache-strategy.md` 캐시 전략 확인

### 상태 관리 설계 시
- [ ] SERVER 엔티티와 CLIENT 상태 구조 매핑
- [ ] 필수 필드와 옵셔널 필드 확인
- [ ] 연관 관계 (1:N, N:M) 확인

---

## 🏗️ 아키텍처 체크리스트

### 시스템 설계 시
- [ ] `STUDYMATE-SERVER/docs/03-architecture/system-architecture.md` 전체 구조 이해
- [ ] `STUDYMATE-SERVER/docs/03-architecture/frontend-backend-integration.md` 통합 방식 확인
- [ ] `STUDYMATE-SERVER/docs/03-architecture/system-architecture-integrated.md` 통합 아키텍처 확인

### WebSocket 구현 시
- [ ] `STUDYMATE-SERVER/src/main/java/*/config/WebSocketConfig.java` 설정 확인
- [ ] `STUDYMATE-SERVER/src/main/java/*/controller/ChatController.java` 핸들러 확인
- [ ] STOMP 엔드포인트 및 구독 경로 확인

---

## 🔐 인증/인가 체크리스트

### OAuth 구현 시
- [ ] `STUDYMATE-SERVER/src/main/java/*/config/SecurityConfig.java` 보안 설정 확인
- [ ] `STUDYMATE-SERVER/src/main/java/*/service/OAuth2Service.java` OAuth 로직 확인
- [ ] `STUDYMATE-SERVER/docs/99-logs/work-sessions/*oauth*.md` OAuth 이슈 히스토리 확인

### JWT 토큰 처리 시
- [ ] `STUDYMATE-SERVER/src/main/java/*/util/JwtUtil.java` JWT 유틸 확인
- [ ] 토큰 만료 시간 확인
- [ ] Refresh Token 로직 확인
- [ ] `STUDYMATE-SERVER/docs/99-logs/work-sessions/*token*.md` 토큰 관련 이슈 확인

---

## ⚠️ 에러 처리 체크리스트

### 에러 핸들링 구현 시
- [ ] `STUDYMATE-SERVER/docs/07-backend/error-handling.md` 에러 코드 목록 확인
- [ ] `STUDYMATE-SERVER/src/main/java/*/exception/` 커스텀 예외 확인
- [ ] `STUDYMATE-SERVER/src/main/java/*/handler/GlobalExceptionHandler.java` 전역 핸들러 확인

### 에러 코드 매핑
```javascript
// SERVER 에러 코드와 동기화
const ERROR_CODES = {
  // AUTH Errors (SERVER/docs/07-backend/error-handling.md#auth-errors)
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
- [ ] `STUDYMATE-SERVER/docs/08-infrastructure/deployment-guide.md` 배포 프로세스 확인
- [ ] `STUDYMATE-SERVER/docs/08-infrastructure/ncp-infrastructure.md` 인프라 구성 확인
- [ ] `STUDYMATE-SERVER/.env.prod.example` 프로덕션 환경변수 확인
- [ ] `STUDYMATE-SERVER/docker-compose.prod.yml` Docker 설정 확인

### 환경별 설정
- [ ] 개발 환경: `http://localhost:8080`
- [ ] 스테이징 환경: 설정 확인 필요
- [ ] 프로덕션 환경: `https://api.languagemate.kr`

---

## 📊 성능 모니터링 체크리스트

### 성능 최적화 시
- [ ] `STUDYMATE-SERVER/docs/10-decisions/performance-monitoring.md` 모니터링 전략 확인
- [ ] `STUDYMATE-SERVER/docs/05-database/redis-cache-strategy.md` 캐시 활용 확인
- [ ] API 응답 시간 목표 확인 (< 200ms)
- [ ] 페이지 로드 시간 목표 확인 (< 3s)

---

## 🐛 디버깅 체크리스트

### 이슈 발생 시
- [ ] `STUDYMATE-SERVER/docs/99-logs/failure-patterns/` 유사 이슈 확인
- [ ] `STUDYMATE-SERVER/docs/99-logs/work-sessions/` 작업 로그 확인
- [ ] `STUDYMATE-SERVER/logs/` 서버 로그 확인
- [ ] CLIENT 콘솔 에러와 SERVER 에러 로그 대조

### 주요 이슈 히스토리
- [ ] Hikari Pool 에러: `failure-patterns/hikari-sealed-pool-error.md`
- [ ] 토큰 무한 루프: `work-sessions/2025-01-02-token-refresh-infinite-loop-fix.md`
- [ ] OAuth 리다이렉트: `work-sessions/2025-01-02-oauth-redirect-uri-fix.md`

---

## 📝 문서 동기화 체크리스트

### 주간 체크
- [ ] SERVER API 문서 변경사항 확인
- [ ] 새로운 엔드포인트 추가 여부
- [ ] 에러 코드 추가/변경 여부
- [ ] DB 스키마 변경 여부

### 월간 체크
- [ ] 아키텍처 변경사항 반영
- [ ] 기술 스택 업데이트 확인
- [ ] 프로세스 가이드 변경사항
- [ ] 성능 목표 변경사항

---

## 🔧 개발 프로세스 체크리스트

### 기능 개발 시작 전
- [ ] `STUDYMATE-SERVER/docs/09-processes/development-workflow.md` 워크플로우 확인
- [ ] `STUDYMATE-SERVER/docs/09-processes/client-integration-guide.md` 통합 가이드 확인
- [ ] SERVER 팀과 API 스펙 협의
- [ ] Mockup 데이터 구조 SERVER DTO와 일치 확인

### PR 생성 전
- [ ] API 연동 테스트 완료
- [ ] 에러 처리 시나리오 테스트
- [ ] SERVER 문서 참조 링크 포함
- [ ] 변경사항이 SERVER와 호환되는지 확인

---

## 📌 빠른 참조 링크

### 핵심 SERVER 문서
```bash
# API 레퍼런스
cat ../STUDYMATE-SERVER/docs/04-api/api-reference.md

# 에러 핸들링
cat ../STUDYMATE-SERVER/docs/07-backend/error-handling.md

# 프론트-백엔드 통합
cat ../STUDYMATE-SERVER/docs/03-architecture/frontend-backend-integration.md

# 클라이언트 통합 가이드
cat ../STUDYMATE-SERVER/docs/09-processes/client-integration-guide.md
```

### 실제 구현 확인
```bash
# 컨트롤러 확인
ls ../STUDYMATE-SERVER/src/main/java/com/studymate/controller/

# DTO 확인
ls ../STUDYMATE-SERVER/src/main/java/com/studymate/dto/

# 엔티티 확인
ls ../STUDYMATE-SERVER/src/main/java/com/studymate/entity/
```

---

## ✅ 체크리스트 사용법

1. **새 기능 개발 시**: 관련 섹션의 모든 항목 체크
2. **버그 수정 시**: 디버깅 체크리스트 활용
3. **API 변경 시**: API 개발 체크리스트 필수 확인
4. **배포 전**: 배포 체크리스트 전체 검토

---

*이 체크리스트는 STUDYMATE-CLIENT 개발 시 SERVER 문서를 효과적으로 참조하기 위한 가이드입니다.*
*최종 업데이트: 2025년 1월 10일*