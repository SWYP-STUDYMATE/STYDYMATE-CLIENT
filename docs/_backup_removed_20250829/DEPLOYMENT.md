# STUDYMATE 배포 가이드

## 🌐 Cloudflare Pages 배포

### 환경 구성

#### Production (main 브랜치)
- URL: https://languagemate.kr
- API: https://api.languagemate.kr
- Workers: https://workers.languagemate.kr

#### Staging (develop 브랜치)
- URL: https://preview.languagemate.kr
- API: https://api-staging.languagemate.kr
- Workers: https://workers-staging.languagemate.kr

#### Preview (PR 브랜치)
- URL: https://[branch-name].studymate-client.pages.dev
- API: Staging API 사용
- Workers: Staging Workers 사용

### 초기 설정

#### 1. Cloudflare Pages 프로젝트 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 접속
2. Pages > Create a project > Connect to Git
3. GitHub 저장소 연결: `SWYP-STUDYMATE/STYDYMATE-CLIENT`
4. 빌드 설정:
   - Framework preset: `None`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
   - Environment variables: 아래 참조

#### 2. 환경 변수 설정

Cloudflare Pages Dashboard > Settings > Environment variables에서 설정:

##### Production 환경 변수
```bash
VITE_API_URL=https://api.languagemate.kr
VITE_WS_URL=wss://api.languagemate.kr/ws
VITE_WORKERS_API_URL=https://workers.languagemate.kr
VITE_WORKERS_WS_URL=wss://workers.languagemate.kr/ws
VITE_NAVER_CLIENT_ID=[Naver OAuth Client ID]
VITE_NAVER_REDIRECT_URI=https://languagemate.kr/login/oauth2/code/naver
VITE_ENABLE_LEVEL_TEST=true
VITE_ENABLE_VIDEO_CALL=true
VITE_ENABLE_GROUP_CALL=true
```

##### Preview 환경 변수
```bash
VITE_API_URL=https://api-staging.languagemate.kr
VITE_WS_URL=wss://api-staging.languagemate.kr/ws
VITE_WORKERS_API_URL=https://workers-staging.languagemate.kr
VITE_WORKERS_WS_URL=wss://workers-staging.languagemate.kr/ws
VITE_NAVER_CLIENT_ID=[Naver OAuth Client ID]
VITE_NAVER_REDIRECT_URI=https://preview.languagemate.kr/login/oauth2/code/naver
VITE_ENABLE_LEVEL_TEST=true
VITE_ENABLE_VIDEO_CALL=true
VITE_ENABLE_GROUP_CALL=true
```

#### 3. 커스텀 도메인 설정

1. Cloudflare Pages > Custom domains
2. 도메인 추가:
   - Production: `languagemate.kr`, `www.languagemate.kr`
   - Staging: `preview.languagemate.kr`

#### 4. GitHub Secrets 설정

GitHub Repository > Settings > Secrets and variables > Actions에서 추가:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API 토큰
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 계정 ID
- `VITE_NAVER_CLIENT_ID`: Naver OAuth Client ID

### 배포 프로세스

#### 자동 배포 (GitHub Actions)

1. **Production 배포**: `main` 브랜치에 push/merge
2. **Staging 배포**: `develop` 브랜치에 push/merge
3. **Preview 배포**: PR 생성 시 자동 배포

#### 수동 배포 (Wrangler CLI)

```bash
# Wrangler 설치
npm install -g wrangler

# 로그인
wrangler login

# 빌드
npm run build

# Production 배포
wrangler pages deploy dist --project-name=studymate-client --branch=main

# Staging 배포
wrangler pages deploy dist --project-name=studymate-client --branch=preview
```

## 🔧 Cloudflare Workers 배포

### Workers 프로젝트 설정

```bash
cd workers

# 로컬 개발
npm run dev

# Staging 배포
npm run deploy:staging

# Production 배포
npm run deploy:production
```

### Workers 환경 변수

wrangler.toml에서 관리:

```toml
[env.production]
workers_dev = false
route = "workers.languagemate.kr/*"

[env.staging]
workers_dev = false
route = "workers-staging.languagemate.kr/*"
```

## 📊 모니터링

### Cloudflare Analytics

1. Pages > Analytics에서 트래픽 확인
2. Web Analytics 태그 추가 (선택사항)

### Workers Analytics

1. Workers > Analytics에서 API 사용량 확인
2. Logs > Real-time logs로 실시간 로그 확인

## 🆘 트러블슈팅

### 빌드 오류

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어
npm run build -- --clear-cache
```

### 배포 실패

1. GitHub Actions 로그 확인
2. Cloudflare Pages 빌드 로그 확인
3. 환경 변수 확인

### CORS 이슈

1. `_headers` 파일 확인
2. API 서버 CORS 설정 확인
3. Workers CORS 미들웨어 확인

## 📋 체크리스트

### 배포 전
- [ ] 환경 변수 확인
- [ ] 빌드 테스트 (`npm run build`)
- [ ] 린트 통과 (`npm run lint`)
- [ ] 로컬 테스트 (`npm run preview`)

### 배포 후
- [ ] 배포 URL 접근 테스트
- [ ] API 연결 테스트
- [ ] OAuth 로그인 테스트
- [ ] WebSocket 연결 테스트
- [ ] Workers API 테스트