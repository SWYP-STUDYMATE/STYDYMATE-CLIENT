# 📚 SERVER-CLIENT 문서 연동 가이드

## 📅 작성일: 2025년 1월 10일

## 🎯 목적
STUDYMATE-CLIENT 문서 작업 시 반드시 STUDYMATE-SERVER/docs를 참조하여 일관성과 정합성을 유지하기 위한 가이드

## 📁 STUDYMATE-SERVER 문서 구조

```
/Users/minhan/Desktop/public-repo/STUDYMATE-SERVER/docs/
├── 01-overview/
│   ├── project-overview.md         # 프로젝트 전체 개요
│   └── goals-and-objectives.md     # 목표 및 목적
├── 02-requirements/
│   └── functional-requirements.md   # 기능 요구사항 (서버 관점)
├── 03-architecture/
│   ├── system-architecture.md      # 시스템 아키텍처
│   ├── system-architecture-integrated.md  # 통합 아키텍처
│   └── frontend-backend-integration.md    # ⭐ 프론트-백엔드 통합
├── 04-api/
│   ├── api-reference.md            # ⭐ API 레퍼런스 (필수 참조)
│   ├── client-server-integration.md # ⭐ 클라이언트-서버 통합 가이드
│   ├── analytics-achievement-api.md # 분석/업적 API
│   └── matching-api.md             # 매칭 API
├── 05-database/
│   ├── database-schema.md          # DB 스키마
│   ├── database-schema-v2.md       # DB 스키마 v2
│   ├── entity-details.md           # 엔티티 상세
│   ├── entity-schema-analysis.md   # 엔티티 분석
│   ├── redis-cache-strategy.md     # Redis 캐시 전략
│   └── updated-database-schema.md  # 업데이트된 스키마
├── 06-frontend/                    # ⚠️ 서버 저장소의 프론트 가이드
│   ├── component-guide.md          # 컴포넌트 가이드
│   └── style-guide.md              # 스타일 가이드
├── 07-backend/
│   ├── services-overview.md        # 서비스 개요
│   └── error-handling.md           # ⭐ 에러 처리 (클라이언트 참조 필수)
├── 08-infrastructure/
│   ├── deployment-guide.md         # 배포 가이드
│   └── ncp-infrastructure.md       # NCP 인프라
├── 09-processes/
│   ├── client-integration-guide.md # ⭐ 클라이언트 통합 가이드
│   └── development-workflow.md     # 개발 워크플로우
├── 10-decisions/
│   ├── tech-stack-decisions.md     # 기술 스택 결정
│   └── performance-monitoring.md   # 성능 모니터링
└── 99-logs/
    ├── work-sessions/              # 작업 세션 로그
    └── failure-patterns/           # 실패 패턴
```

## 🔗 필수 참조 문서 매핑

### CLIENT 문서 작성 시 SERVER 참조 맵

| CLIENT 문서 | 반드시 참조해야 할 SERVER 문서 | 참조 이유 |
|------------|--------------------------------|----------|
| `04-api/api-specification.md` | `SERVER/04-api/api-reference.md` | API 엔드포인트 정확성 |
| `04-api/frontend-integration-guide.md` | `SERVER/04-api/client-server-integration.md` | 통합 방법 일치 |
| `05-database/erd.md` | `SERVER/05-database/database-schema.md` | DB 구조 동기화 |
| `05-database/schema.md` | `SERVER/05-database/entity-details.md` | 엔티티 정의 일치 |
| `06-frontend/api-integration.md` | `SERVER/03-architecture/frontend-backend-integration.md` | 통합 아키텍처 |
| `07-backend/error-handling.md` | `SERVER/07-backend/error-handling.md` | 에러 코드 일치 |
| `08-infrastructure/deployment-guide.md` | `SERVER/08-infrastructure/deployment-guide.md` | 배포 프로세스 |

## ✅ 상호 참조 체크리스트

### API 문서 작성 시
- [ ] **엔드포인트 URL**: `SERVER/04-api/api-reference.md` 확인
- [ ] **요청/응답 형식**: `SERVER/04-api/*.md` DTO 확인  
- [ ] **에러 코드**: `SERVER/07-backend/error-handling.md` 확인
- [ ] **인증 방식**: `SERVER/03-architecture/frontend-backend-integration.md` 확인

### 데이터베이스 문서 작성 시
- [ ] **테이블 구조**: `SERVER/05-database/database-schema.md` 확인
- [ ] **엔티티 관계**: `SERVER/05-database/entity-details.md` 확인
- [ ] **캐시 전략**: `SERVER/05-database/redis-cache-strategy.md` 확인

### 아키텍처 문서 작성 시
- [ ] **시스템 구조**: `SERVER/03-architecture/system-architecture.md` 확인
- [ ] **통합 방식**: `SERVER/03-architecture/frontend-backend-integration.md` 확인
- [ ] **기술 스택**: `SERVER/10-decisions/tech-stack-decisions.md` 확인

### 프로세스 문서 작성 시
- [ ] **개발 워크플로우**: `SERVER/09-processes/development-workflow.md` 확인
- [ ] **통합 가이드**: `SERVER/09-processes/client-integration-guide.md` 확인

## 🚨 주의사항

### 1. 버전 동기화
```yaml
# SERVER와 CLIENT의 API 버전이 일치해야 함
SERVER: /api/v1/*
CLIENT: /api/v1/*
```

### 2. 에러 코드 일치
```javascript
// SERVER/07-backend/error-handling.md의 에러 코드를
// CLIENT에서 동일하게 처리해야 함
const ERROR_CODES = {
  AUTH_001: '인증 실패',
  AUTH_002: '토큰 만료',
  // ... SERVER 문서와 일치
};
```

### 3. DTO 타입 일치
```typescript
// SERVER의 Response DTO와 CLIENT의 인터페이스가 일치해야 함
interface UserResponse {
  // SERVER/src/main/java/*/dto/response/UserResponse.java 참조
}
```

### 4. WebSocket 이벤트
```javascript
// SERVER의 WebSocket 이벤트와 CLIENT 핸들러 일치
// SERVER/04-api/client-server-integration.md 참조
STOMP.subscribe('/topic/chat/{roomId}', handler);
```

## 📝 문서 업데이트 프로세스

### CLIENT 문서 수정 시
1. **SERVER 문서 확인**: 관련 SERVER 문서 최신 버전 확인
2. **변경사항 검토**: API, DB, 에러 코드 변경사항 확인
3. **CLIENT 문서 업데이트**: SERVER와 일치하도록 수정
4. **상호 참조 추가**: SERVER 문서 경로 명시

### 예시: API 문서 업데이트
```markdown
## API 엔드포인트

> 📌 이 문서는 STUDYMATE-SERVER/docs/04-api/api-reference.md와 동기화되어 있습니다.
> 최종 동기화: 2025-01-10

### 사용자 인증
- **엔드포인트**: `POST /api/v1/auth/login`
- **서버 문서**: `../STUDYMATE-SERVER/docs/04-api/api-reference.md#authentication`
```

## 🔄 정기 동기화 체크

### 주간 체크리스트
- [ ] API 엔드포인트 변경사항 확인
- [ ] 에러 코드 추가/변경 확인
- [ ] DB 스키마 변경사항 확인
- [ ] 새로운 기능 요구사항 확인

### 월간 체크리스트
- [ ] 전체 문서 구조 비교
- [ ] 아키텍처 변경사항 반영
- [ ] 프로세스 가이드 업데이트
- [ ] 기술 결정사항 동기화

## 🛠️ 도구 및 스크립트

### 문서 동기화 확인 스크립트
```bash
#!/bin/bash
# check-sync.sh

echo "=== SERVER-CLIENT 문서 동기화 체크 ==="

# API 문서 최종 수정일 비교
SERVER_API_DATE=$(stat -f "%Sm" -t "%Y-%m-%d" ../STUDYMATE-SERVER/docs/04-api/api-reference.md)
CLIENT_API_DATE=$(stat -f "%Sm" -t "%Y-%m-%d" ./04-api/api-specification.md)

echo "SERVER API 문서: $SERVER_API_DATE"
echo "CLIENT API 문서: $CLIENT_API_DATE"

if [ "$SERVER_API_DATE" \> "$CLIENT_API_DATE" ]; then
  echo "⚠️  SERVER API 문서가 더 최신입니다. 동기화 필요!"
fi
```

### 상호 참조 검색
```bash
# SERVER 문서에서 CLIENT 관련 내용 검색
grep -r "client" ../STUDYMATE-SERVER/docs/ --include="*.md"

# CLIENT 문서에서 SERVER 참조 검색  
grep -r "STUDYMATE-SERVER" ./docs/ --include="*.md"
```

## 📋 결론

STUDYMATE 프로젝트의 CLIENT와 SERVER 문서는 긴밀하게 연결되어 있으며, 
특히 API, 데이터베이스, 에러 처리 부분에서 완벽한 동기화가 필요합니다.

이 가이드를 통해:
1. ✅ 필수 참조 문서를 빠르게 찾을 수 있습니다
2. ✅ 동기화 체크리스트로 일관성을 유지할 수 있습니다
3. ✅ 정기적인 검토로 문서 정합성을 보장할 수 있습니다

---

*이 문서는 STUDYMATE-CLIENT와 STUDYMATE-SERVER 간의 문서 연동을 위한 가이드입니다.*
*최종 업데이트: 2025년 1월 10일*