# Cloudflare Workers 마이그레이션 가이드

## 현재 상태
- **레거시 서버**: `api.languagemate.kr` (운영 중)
- **Workers**: `api.languagemate.kr` (배포 예정)

## Phase 1: 병행 운영 및 테스트

### 1. Cloudflare D1 Database ID 설정
```bash
# wrangler.toml의 REPLACE_WITH_PROD_D1_ID를 실제 ID로 변경
# Cloudflare Dashboard → Workers & Pages → D1 → studymate-prod 확인
```

### 2. 시크릿 설정 (필요시)
```bash
# 프로덕션 시크릿 설정
npx wrangler secret put JWT_SECRET --env production
npx wrangler secret put INTERNAL_SECRET --env production
```

### 3. Workers 배포
```bash
# 프로덕션 빌드
npm run build

# api.languagemate.kr로 배포
npx wrangler deploy --env production
```

### 4. 테스트 (api.languagemate.kr)
```bash
# Health Check
curl https://api.languagemate.kr/health

# API 테스트 (예: 로그인)
curl -X POST https://api.languagemate.kr/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

## Phase 2: 클라이언트 설정 변경 (선택적 테스트)

### 테스트용 클라이언트 환경변수 변경
```bash
# .env.production
VITE_API_URL=https://api.languagemate.kr
VITE_WS_URL=wss://api.languagemate.kr/ws
```

### 일부 사용자 대상 카나리 테스트
- Cloudflare Load Balancing 또는 Workers Routes 활용
- 트래픽의 10%만 Workers로 라우팅

## Phase 3: 완전 전환 (검증 후)

### 1. DNS 레코드 변경
Cloudflare Dashboard에서:
1. `api.languagemate.kr` A/CNAME 레코드 삭제
2. Workers Route 추가: `api.languagemate.kr/*` → Workers

### 2. wrangler.toml 업데이트
```toml
[[env.production.routes]]
pattern = "api.languagemate.kr/*"
zone_name = "languagemate.kr"
```

### 3. 재배포
```bash
npx wrangler deploy --env production
```

### 4. 레거시 서버 종료
- 모든 기능 검증 후 레거시 서버 중지
- EC2/ECS 인스턴스 종료로 비용 절감

## 롤백 계획

문제 발생 시:
1. Cloudflare Dashboard에서 Workers Route 제거
2. 원래 DNS 레코드 복원 (레거시 서버로)
3. 5분 내 정상 서비스 복구

## 체크리스트

### Phase 1 (현재)
- [ ] D1 Database ID 확인 및 설정
- [ ] R2 버킷 생성 확인
- [ ] KV Namespace 생성 확인
- [ ] api.languagemate.kr DNS 설정
- [ ] Workers 배포
- [ ] 기본 API 테스트

### Phase 2 (테스트)
- [ ] 온보딩 플로우 테스트
- [ ] 매칭 기능 테스트
- [ ] 채팅/WebSocket 테스트
- [ ] OAuth 로그인 테스트
- [ ] 파일 업로드 테스트

### Phase 3 (전환)
- [ ] 성능 벤치마크
- [ ] 에러율 모니터링
- [ ] DNS 전환
- [ ] 레거시 서버 종료

## 모니터링

### Cloudflare Analytics
- Workers 대시보드에서 실시간 모니터링
- 요청 수, 에러율, 응답 시간 확인

### 로그 확인
```bash
# 실시간 로그 스트리밍
npx wrangler tail --env production
```

## 비용 최적화

### 예상 비용 절감
- **제거**: EC2/ECS, RDS, ALB 비용
- **추가**: Workers 요청 비용 (매우 저렴)
- **예상 절감률**: 70-90%

### Workers 무료 티어
- 일 100,000 요청 무료
- 초과 시 $0.50/백만 요청
