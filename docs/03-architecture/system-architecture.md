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
│                    Spring Boot Backend                       │
│                  https://api.languagemate.kr                 │
│  ┌─────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │  Auth   │   User   │ Matching │   Chat   │  Session │   │
│  │ Service │ Service  │ Service  │ Service  │ Service  │   │
│  └─────────┴──────────┴──────────┴──────────┴──────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    MySQL     │  │    Redis     │  │ Object Store │
│   Database   │  │    Cache     │  │   (Images)   │
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

### 2. Backend (STUDYMATE-SERVER)

#### 기술 스택
- **Framework**: Spring Boot 3.3.5
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Security**: Spring Security + JWT
- **WebSocket**: Spring WebSocket

#### 레이어드 아키텍처
```
com.studymate/
├── domain/
│   ├── user/           # 사용자 도메인
│   ├── auth/           # 인증 도메인
│   ├── matching/       # 매칭 도메인
│   ├── chat/           # 채팅 도메인
│   ├── session/        # 세션 도메인
│   ├── leveltest/      # 레벨테스트 도메인
│   └── ai/             # AI 연동 도메인
├── global/
│   ├── config/         # 설정
│   ├── exception/      # 예외 처리
│   ├── security/       # 보안 설정
│   └── util/           # 유틸리티
└── infrastructure/
    ├── persistence/    # DB 연동
    └── external/       # 외부 API
```

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
- Spring Security Filter Chain

### 2. API 보안
- HTTPS 전용
- CORS 설정
- Rate Limiting (Cloudflare)

### 3. 데이터 보호
- 비밀번호: BCrypt 해싱
- 민감 정보: AES 암호화
- 세션: Redis TTL 관리

## 📊 확장성 고려사항

### 1. 수평 확장
- Stateless 서버 설계
- 세션 외부 저장 (Redis)
- 로드 밸런싱 가능

### 2. 성능 최적화
- CDN 활용 (Cloudflare)
- 이미지 최적화 (WebP)
- 캐싱 전략 (Redis)
- DB 인덱싱

### 3. 모니터링
- Application: Spring Actuator
- Infrastructure: Cloudflare Analytics
- Error Tracking: 로그 수집

## 🚀 배포 아키텍처

### 1. Frontend
- **Platform**: Cloudflare Pages
- **CI/CD**: GitHub Actions
- **Domain**: languagemate.kr

### 2. Backend
- **Platform**: Naver Cloud Platform
- **Container**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions

### 3. Workers
- **Platform**: Cloudflare Workers
- **Deployment**: Wrangler CLI
- **Domain**: workers.languagemate.kr

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