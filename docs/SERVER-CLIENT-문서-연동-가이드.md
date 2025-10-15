# 📚 Workers-Client 문서 연동 가이드

## 📅 작성일: 2025년 10월 14일

## 🎯 목적
STUDYMATE-CLIENT 문서 작업 시 반드시 Cloudflare Workers 백엔드를 참조하여 일관성과 정합성을 유지하기 위한 가이드

## 📁 Workers 백엔드 구조

```
/Users/minhan/Desktop/public-repo/studymate/workers/src/
├── routes/                    # API 라우트 정의
│   ├── auth.ts               # 인증 API
│   ├── user.ts               # 사용자 API
│   ├── matching.ts           # 매칭 API
│   ├── chat.ts               # 채팅 API
│   └── sessions.ts           # 세션 API
├── handlers/                  # 비즈니스 로직
│   ├── auth.ts
│   ├── user.ts
│   └── matching.ts
├── durable-objects/          # Durable Objects (상태 관리)
│   ├── WebRTCRoom.ts
│   ├── UserPresence.ts
│   └── ChatHub.ts
├── middleware/               # 미들웨어
│   ├── auth.ts
│   ├── error-handler.ts
│   ├── logger.ts
│   └── security.ts
├── utils/                    # 유틸리티
│   ├── jwt.ts
│   └── validation.ts
└── index.ts                  # 메인 엔트리포인트
```

## 🔗 필수 참조 문서 매핑

### CLIENT 문서 작성 시 Workers 참조 맵

| CLIENT 문서 | 반드시 참조해야 할 Workers 코드 | 참조 이유 |
|------------|--------------------------------|----------|
| `04-api/api-specification.md` | `workers/src/routes/*.ts` | API 엔드포인트 정확성 |
| `04-api/frontend-integration-guide.md` | `workers/src/index.ts` | 라우팅 구조 확인 |
| `05-database/erd.md` | `workers/schema/*.sql` | D1 데이터베이스 스키마 |
| `06-frontend/api-integration.md` | `workers/src/handlers/*.ts` | 핸들러 로직 이해 |
| `07-backend/error-handling.md` | `workers/src/middleware/error-handler.ts` | 에러 코드 일치 |

## ✅ 상호 참조 체크리스트

### API 문서 작성 시
- [ ] **엔드포인트 URL**: `workers/src/routes/*.ts` 확인
- [ ] **요청/응답 형식**: `workers/src/handlers/*.ts` 확인
- [ ] **에러 코드**: `workers/src/middleware/error-handler.ts` 확인
- [ ] **인증 방식**: `workers/src/middleware/auth.ts` 확인

### 데이터베이스 문서 작성 시
- [ ] **D1 스키마**: `workers/schema/*.sql` 확인
- [ ] **KV 스토리지**: Workers KV 사용 패턴 확인
- [ ] **Durable Objects**: 상태 관리 패턴 확인

### 아키텍처 문서 작성 시
- [ ] **라우팅 구조**: `workers/src/index.ts` 확인
- [ ] **미들웨어 체인**: `workers/src/middleware/` 확인
- [ ] **Durable Objects**: `workers/src/durable-objects/` 확인

### 프로세스 문서 작성 시
- [ ] **Wrangler 배포**: `workers/wrangler.toml` 확인
- [ ] **환경 변수**: Workers 환경 설정 확인

## 🚨 주의사항

### 1. 버전 동기화
```yaml
# Workers와 CLIENT의 API 버전이 일치해야 함
Workers: /api/v1/*
CLIENT: /api/v1/*
```

### 2. 에러 코드 일치
```javascript
// workers/src/middleware/error-handler.ts의 에러 코드를
// CLIENT에서 동일하게 처리해야 함
const ERROR_CODES = {
  AUTH_001: '인증 실패',
  AUTH_002: '토큰 만료',
  // ... Workers 코드와 일치
};
```

### 3. 타입 일치
```typescript
// Workers의 응답 형식과 CLIENT의 인터페이스가 일치해야 함
interface UserResponse {
  // workers/src/handlers/user.ts 참조
}
```

### 4. WebSocket/Durable Objects 이벤트
```javascript
// Workers의 Durable Objects 이벤트와 CLIENT 핸들러 일치
// workers/src/durable-objects/ChatHub.ts 참조
```

## 📝 문서 업데이트 프로세스

### CLIENT 문서 수정 시
1. **Workers 코드 확인**: 관련 Workers 코드 최신 버전 확인
2. **변경사항 검토**: API, 스키마, 에러 코드 변경사항 확인
3. **CLIENT 문서 업데이트**: Workers와 일치하도록 수정
4. **상호 참조 추가**: Workers 코드 경로 명시

### 예시: API 문서 업데이트
```markdown
## API 엔드포인트

> 📌 이 문서는 workers/src/routes/auth.ts와 동기화되어 있습니다.
> 최종 동기화: 2025-10-14

### 사용자 인증
- **엔드포인트**: `POST /api/v1/auth/login`
- **Workers 코드**: `workers/src/routes/auth.ts#login`
```

## 🔄 정기 동기화 체크

### 주간 체크리스트
- [ ] API 엔드포인트 변경사항 확인
- [ ] 에러 코드 추가/변경 확인
- [ ] D1 스키마 변경사항 확인
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

echo "=== Workers-Client 문서 동기화 체크 ==="

# Workers 라우트 최종 수정일 확인
WORKERS_ROUTE_DATE=$(stat -f "%Sm" -t "%Y-%m-%d" ../workers/src/routes/auth.ts)
CLIENT_API_DATE=$(stat -f "%Sm" -t "%Y-%m-%d" ./04-api/api-specification.md)

echo "Workers 라우트: $WORKERS_ROUTE_DATE"
echo "CLIENT API 문서: $CLIENT_API_DATE"

if [ "$WORKERS_ROUTE_DATE" \> "$CLIENT_API_DATE" ]; then
  echo "⚠️  Workers 코드가 더 최신입니다. 동기화 필요!"
fi
```

### 상호 참조 검색
```bash
# Workers 코드에서 API 엔드포인트 검색
grep -r "\.get\|\.post\|\.put\|\.delete" ../workers/src/routes/ --include="*.ts"

# CLIENT 문서에서 Workers 참조 검색
grep -r "workers" ./docs/ --include="*.md"
```

## 📋 결론

STUDYMATE 프로젝트의 CLIENT와 Workers 백엔드는 긴밀하게 연결되어 있으며,
특히 API, Durable Objects, 에러 처리 부분에서 완벽한 동기화가 필요합니다.

이 가이드를 통해:
1. ✅ 필수 참조 코드를 빠르게 찾을 수 있습니다
2. ✅ 동기화 체크리스트로 일관성을 유지할 수 있습니다
3. ✅ 정기적인 검토로 문서 정합성을 보장할 수 있습니다

---

*이 문서는 STUDYMATE-CLIENT와 Cloudflare Workers 백엔드 간의 문서 연동을 위한 가이드입니다.*
*최종 업데이트: 2025년 10월 14일*
