# STUDYMATE 아키텍처 개요

이 문서는 STUDYMATE의 코드 구조, 폴더 구조, 인프라 구조를 요약합니다. 배포/운영 관련 절차는 [DEPLOYMENT.md](mdc:docs/DEPLOYMENT.md), 성능 전략은 [PERFORMANCE.md](mdc:docs/PERFORMANCE.md)를 참고하세요.

---

## 1) 코드베이스 전반

- 프런트엔드: Vite + React 기반 SPA
  - 라우팅: `react-router-dom`
  - 상태관리: `zustand`
  - 스타일: Tailwind (`src/styles/`), 커스텀 CSS
  - PWA: `public/manifest.json`, `public/sw.js`
  - E2E 테스트: Playwright (`e2e/`, `tests/e2e/`)
- 백엔드: Cloudflare Workers + Hono
  - API 라우팅/미들웨어: `workers/src/`
  - Realtime: Durable Objects(WebRTC 룸), KV, R2, Workers AI
  - 관측성: Analytics Engine, 미들웨어 기반 로깅/에러 처리

---

## 2) 폴더 구조 (요약)

- 루트
  - `src/` 프런트엔드 소스
    - `api/` API 호출 래퍼 (채팅, 프로필, 레벨테스트, WebRTC)
    - `components/` UI 컴포넌트
    - `hooks/` 커스텀 훅 (LLM, Whisper, WebRTC 등)
    - `pages/` 페이지 라우팅 단위 (Login, Main, Chat, Session, Profile 등)
    - `store/` Zustand 스토어
    - `styles/` Tailwind/CSS
    - `utils/` 유틸 (성능, 이미지 최적화, 서비스워커 등)
  - `public/` 정적 리소스 및 PWA 파일
  - `e2e/`, `tests/` E2E 테스트/픽스처
  - `workers/` Cloudflare Workers 백엔드
    - `src/index.ts` 엔트리, 라우트 마운트/헬스체크/CORS
    - `src/routes/` 기능별 API (`llm`, `whisper`, `images`, `levelTest`, `webrtc`, `transcribe`, `translate`, `analytics`, `cache`)
    - `src/middleware/` 공통 미들웨어 (`auth`, `logger`, `security`, `error-handler`, `analytics` 등)
    - `src/durable/WebRTCRoom.ts` Durable Object (WebRTC 룸 상태 관리)
    - `src/services/` 서브서비스 (AI, 이미지, 캐시, 스토리지, Calls)
    - `src/utils/` 공통 유틸 (응답 헬퍼, 에러, CORS)
    - `wrangler.toml`, `wrangler.staging.toml` 배포/바인딩 설정
  - 기타
    - `_headers`, `_redirects` (Pages 헤더/CSP/SPA 라우팅)
    - `vite.config*.js`, `playwright.config.*` 빌드/테스트 설정

---

## 3) 주요 프런트엔드 구성

- 라우팅: `src/App.jsx` → `src/pages/*`
- API 연동: `src/api/`에서 `axios` 기반 호출, 환경 변수 `VITE_*` 사용
- 실시간/미디어: `src/services/webrtc.js`, 관련 훅/컴포넌트로 제어
- 성능/UX: 코드 스플리팅(`src/utils/lazyLoad.jsx`), 이미지 최적화(`src/components/OptimizedImage.jsx`), Web Vitals 수집
- 테스트: `npm run test:e2e` (Playwright)

---

## 4) Workers(API) 구성

- 프레임워크: Hono
- 엔트리: [workers/src/index.ts](mdc:workers/src/index.ts)
  - 공통 미들웨어 적용, CORS, Analytics/에러 트래킹, `/health` 제공
  - 버전드 그룹 `/api/v1`로 라우트 마운트
- 라우트 (예시)
  - `POST /api/v1/llm/generate`, `GET /api/v1/llm/models`
  - `POST /api/v1/whisper/*`, `POST /api/v1/transcribe`
  - `POST /api/v1/images/upload`, `GET /api/v1/images/:id`
  - `POST /api/v1/room/create|join` (Durable Objects)
  - `POST /api/v1/level-test/*`, `GET /api/v1/cache/*`, `POST /api/v1/translate`

- 스토리지/런타임 바인딩 (환경별 [workers/wrangler.toml](mdc:workers/wrangler.toml))
  - `AI`(Workers AI), `ROOM`(Durable Objects), `STORAGE`(R2), `CACHE`(KV), `ANALYTICS`(Analytics Engine)
  - Vars: `CORS_ORIGIN`, `ENVIRONMENT`, `LOG_LEVEL`, `API_VERSION`

---

## 5) 인프라 구조

- 프런트엔드: Cloudflare Pages
  - 커스텀 도메인: `languagemate.kr`, 프리뷰 `preview.languagemate.kr`
  - 빌드: `npm run build` → `dist/` 배포
  - 헤더/리다이렉트: [`_headers`](mdc:_headers) (CSP/보안/캐시), [`_redirects`](mdc:_redirects) (SPA fallback)
- 백엔드: Cloudflare Workers
  - 프로덕션: `api.languagemate.kr`
  - 스테이징: `api-staging.languagemate.kr`
  - Durable Objects, KV, R2, Workers AI 바인딩 및 라우팅은 [workers/wrangler.toml](mdc:workers/wrangler.toml)에 정의
- 모니터링
  - Cloudflare Analytics (Pages/Workers)
  - `wrangler tail`, 배포 리스트/검증 스크립트

---

## 6) 환경 변수 / 시크릿

- Pages (프런트)
  - `VITE_API_URL`, `VITE_WS_URL`, `VITE_WORKERS_API_URL`, `VITE_WORKERS_WS_URL`
  - OAuth/기능 플래그: `VITE_NAVER_CLIENT_ID`, `VITE_ENABLE_*`
- Workers (백엔드)
  - Vars: `ENVIRONMENT`, `CORS_ORIGIN`, `LOG_LEVEL`, `API_VERSION`
  - Secrets: `JWT_SECRET`, `INTERNAL_SECRET`, `CF_IMAGES_API_TOKEN`, `CF_ACCOUNT_HASH` 등 (`wrangler secret put`)

---

## 7) 배포 파이프라인 (요약)

- Pages: GitHub Actions 연동(브랜치별 자동), 또는 `wrangler pages deploy`
- Workers: GitHub Actions 자동 배포, 또는 `wrangler deploy --env <env>`
- 상세: [docs/DEPLOYMENT.md](mdc:docs/DEPLOYMENT.md) 참고

---

## 8) 운영 체크리스트

- 사전: 린트/빌드 통과, 환경 변수 확인, 로컬 프리뷰
- 배포 후: URL 접근, API 상태, OAuth, WebSocket, Workers API 확인
- 트러블슈팅: CORS, 라우트, 시크릿/바인딩 검증 (`wrangler tail`, `wrangler deployments list`)

---

## 9) 로컬 개발

- 프런트: 루트에서 `npm run dev` → `http://localhost:5173`
- Workers: `cd workers && npm run dev` → `http://localhost:8787`

---

## 10) 보안/정책

- CSP/보안 헤더: [`_headers`](mdc:_headers) 참고 (X-Frame-Options, CSP, Permissions-Policy 등)
- CORS: Workers에서 `CORS_ORIGIN` 기반 허용 오리진 관리
- 비밀정보: 코드에 하드코딩 금지, Workers 시크릿/Pages 환경변수로 주입