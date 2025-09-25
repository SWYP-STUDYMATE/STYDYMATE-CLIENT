# Cloudflare 리소스 정리 계획

## 현재 상황
Cloudflare에 중복된 Workers/Pages 프로젝트가 존재하여 혼란스러운 상태

## 정리 대상 및 실행 명령어

### 1단계: 즉시 삭제 가능한 리소스

#### studymate-workers (Pages 프로젝트 - 배포 안됨)
```bash
npx wrangler pages project delete studymate-workers
```

#### studymate-workers (Workers - 19일 전 수정, 미사용)
```bash
npx wrangler delete --name studymate-workers
```

#### studymate-workers-production (Workers - 14일 전 수정, 미사용)
```bash
npx wrangler delete --name studymate-workers-production
```

### 2단계: 확인 후 처리

#### studymate-api (Workers - 개발환경?)
- **확인 필요**: 로컬 개발에 사용 중인지 확인
- 미사용 시: `npx wrangler delete --name studymate-api`
- 사용 중이면: 유지 (dev 환경으로 활용)

### 3단계: 최종 구조 확인

정리 후 남아야 할 리소스:
1. **studymate-client** (Pages)
   - 도메인: `languagemate.kr`
   - 용도: 프론트엔드 호스팅

2. **studymate-api-production** (Workers)
   - 도메인: `api.languagemate.kr`
   - 용도: API 서버
   - 바인딩: AI, R2, KV, D1, Durable Objects

3. **studymate-api** (Workers) - 선택적
   - 용도: 개발/스테이징 환경
   - 유지 여부 결정 필요

## 리소스 정리 체크리스트

- [ ] studymate-workers (Pages) 삭제
- [ ] studymate-workers (Workers) 삭제
- [ ] studymate-workers-production 삭제
- [ ] studymate-api 유지/삭제 결정
- [ ] Cloudflare Dashboard에서 삭제 확인
- [ ] 남은 리소스 동작 테스트

## 주의사항

⚠️ 삭제 전 확인:
- 각 프로젝트의 마지막 배포 로그 확인
- 실제 트래픽이 없는지 확인 (Dashboard에서 요청 수 체크)
- 삭제는 되돌릴 수 없으므로 신중히 진행

## 정리 후 이점

1. **명확한 구조**: Frontend(Pages) + API(Workers) 2개만 유지
2. **비용 절감**: 불필요한 리소스 제거
3. **관리 용이**: 혼동 없는 명확한 네이밍
4. **배포 단순화**: 타겟이 명확해짐