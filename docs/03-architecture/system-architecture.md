# 시스템 아키텍처

## 🏗️ 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         사용자 (Web/Mobile)                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN/Pages                      │
│                  (Static Assets & Frontend)                  │
│                   https://languagemate.kr                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┬────────────────┐
        ▼                    ▼                ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   REST API   │   │  WebSocket   │   │  Workers AI  │
│   (HTTPS)    │   │    (WSS)     │   │   (HTTPS)    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                   │
       ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                Cloudflare Workers API Layer                 │
│                  https://api.languagemate.kr                │
│  ┌─────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │  Auth   │   User   │ Matching │   Chat   │ Sessions │   │
│  │ Routes  │ Routes   │ Routes   │ Routes   │ Routes   │   │
│  └─────────┴──────────┴──────────┴──────────┴──────────┘   │
│        ▲ Durable Objects (WebRTC / Presence / Chat Hub)     │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│      D1      │  │  Workers KV  │  │      R2      │
│  Relational  │  │   Cache &    │  │  Assets &    │
│   Storage    │  │ Configuration│  │   Media      │
└──────────────┘  └──────────────┘  └──────────────┘
```

## 📦 컴포넌트 상세

### 1. Frontend (STUDYMATE-CLIENT)

#### 기술 스택
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **State Management**: Zustand 5.0.6
- **Routing**: React Router DOM 7.6.3
- **HTTP Client**: Axios 1.10.0
- **WebSocket**: SockJS + StompJS

#### 주요 디렉토리
```
src/
├── api/           # API 통신 레이어
├── components/    # 재사용 컴포넌트
├── hooks/         # 커스텀 훅
├── pages/         # 페이지 컴포넌트
├── store/         # 상태 관리
├── utils/         # 유틸리티 함수
└── services/      # 비즈니스 로직
```

### 2. Backend (Cloudflare Workers)

#### 기술 스택
- **Framework**: Hono 4.x
- **Language**: TypeScript (Service Worker 런타임)
- **Data Stores**: Cloudflare D1, Workers KV, R2
- **Stateful Components**: Durable Objects (WebRTC Room, UserPresence, ChatHub)
- **Authentication**: JWT + OAuth2 Callback Routes
- **Observability**: Cloudflare Analytics, Wrangler Tail, Workers Logs

#### 디렉토리 구조
```
workers/src/
├── routes/        # REST / WebSocket 핸들러 집합
│   ├── auth.ts
│   ├── users.ts
│   ├── matching.ts
│   ├── onboarding.ts
│   ├── notifications.ts
│   └── ...
├── services/      # 비즈니스 로직 및 데이터 접근
├── middleware/    # 인증, 로깅, 에러 처리 미들웨어
├── durable/       # Durable Object 구현 (WebRTCRoom, UserPresence, ChatHub)
├── utils/         # 공용 유틸리티
└── types/         # 타입 선언 및 바인딩 정의
```

#### 데이터 계층
- **D1**: 사용자, 매칭, 알림, 레벨 테스트 등 관계형 데이터 관리
- **Workers KV**: 매칭 설정, 캐시된 메타데이터, 속도 민감 키-값 데이터
- **R2**: 음성/이미지 업로드 등 대용량 객체 저장
- **Durable Objects**: 실시간 세션 상태 및 Presence 관리

### 3. AI Service (STUDYMATE-WORKERS)

#### 기술 스택
- **Platform**: Cloudflare Workers
- **Language**: JavaScript
- **AI Models**: 
  - Llama 3.1 8B (텍스트 평가)
  - Whisper (음성 인식)
- **Storage**: 
  - KV (세션 저장)
  - D1 (평가 결과)

#### API 엔드포인트
```
/api/v1/leveltest/
├── voice/transcribe    # 음성→텍스트 변환
├── evaluate            # 레벨 평가
└── feedback/realtime   # 실시간 피드백
```

## 🔄 데이터 플로우

### 1. 인증 플로우
```
사용자 → OAuth Provider → Backend → JWT 발급 → Frontend
```

### 2. 레벨 테스트 플로우
```
음성 녹음 → Workers AI (Whisper) → 텍스트 변환
→ Workers AI (Llama) → CEFR 평가 → Backend 저장
```

### 3. 실시간 통신 플로우
```
WebRTC (P2P) + WebSocket (시그널링)
→ STUN/TURN 서버 → 피어 연결
```

## 🔐 보안 아키텍처

### 1. 인증/인가
- JWT Access Token (15분)
- Refresh Token (7일)
- Hono 기반 JWT 미들웨어 + 내부 토큰 검증 유틸

### 2. API 보안
- HTTPS 전용
- CORS 설정
- Rate Limiting (Cloudflare)

### 3. 데이터 보호
- 비밀번호: BCrypt 해싱
- 민감 정보: AES 암호화 (D1 컬럼 레벨)
- 세션 상태: Durable Objects + JWT 조합

## 📊 확장성 고려사항

### 1. 수평 확장
- Workers 글로벌 배포 (자동 확장)
- Durable Objects를 통한 세션/Presence 공유
- Edge 캐싱으로 응답 지연 최소화

### 2. 성능 최적화
- CDN 활용 (Cloudflare)
- 이미지 최적화 (WebP)
- 캐싱 전략 (Workers KV, Cache API)
- D1 인덱스 및 읽기 분리 설계

### 3. 모니터링
- Workers 로그 + wrangler tail
- Cloudflare Analytics / Request Tracing
- Sentry (프런트) & Durable Objects logging

## 🚀 배포 아키텍처

### 1. Frontend
- **Platform**: Cloudflare Pages
- **CI/CD**: GitHub Actions
- **Domain**: languagemate.kr

### 2. Backend
- **Platform**: Cloudflare Workers
- **Deployment**: Wrangler CLI (`npm run deploy:*`)
- **Environments**: production / staging
- **CI/CD**: GitHub Actions (wrangler publish)

### 3. Workers
- **Platform**: Cloudflare Workers
- **Deployment**: Wrangler CLI
- **Domain**: api.languagemate.kr

## 📈 향후 계획

### Phase 1 (현재)
- [x] 기본 인증/온보딩
- [x] 1:1 채팅/화상통화
- [x] AI 레벨 테스트

### Phase 2
- [ ] 그룹 세션
- [ ] 고급 매칭 알고리즘
- [ ] 학습 분석 대시보드

### Phase 3
- [ ] 모바일 앱
- [ ] 오프라인 모드
- [ ] 다국어 지원
