# STUDYMATE CLIENT

실시간 언어 교환 학습 플랫폼의 프론트엔드 애플리케이션입니다.

## 🚀 주요 기능

### 사용자 인증 및 온보딩
- 구글/네이버 소셜 로그인
- 단계별 온보딩 프로세스 (기본정보, 언어설정, 관심사, 파트너 선호도, 스케줄)
- 프로필 관리

### AI 레벨 테스트
- 음성 기반 영어 레벨 평가
- CEFR 기준 레벨 산정 (A1~C2)
- 실시간 음성 인식 및 분석
- 상세한 피드백 제공

### 실시간 화상/음성 통화
- 1:1 비디오/오디오 세션
- WebRTC 기반 P2P 연결
- 화면 공유 기능
- 실시간 연결 품질 모니터링

### 채팅 시스템
- 실시간 메시징
- 이미지 업로드
- 음성 메시지
- 읽음 확인

### 학습 관리
- 세션 스케줄링 및 캘린더
- **학습 통계 대시보드** (Recharts 시각화, 실시간 메트릭)
- **성취 배지 시스템** (9개 카테고리, 6개 티어, XP 보상)
- 언어 교환 파트너 매칭 및 호환성 분석

### 설정 및 개인화
- **7개 설정 카테고리** (Account, Notifications, Privacy, Language, Security, Data, Login History)
- **2FA 인증** (QR 코드, TOTP 6자리)
- **다크 모드** (준비 단계 - 미활성화, 시스템 테마 감지)
- GDPR/PIPA 준수 데이터 관리
- 3단계 계정 삭제 프로세스

## 🛠 기술 스택

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **State Management**: Zustand 5.0.6 (13개 Store, 5분 캐시 TTL)
- **Routing**: React Router DOM 7.6.3
- **HTTP Client**: Axios 1.10.0
- **WebSocket**: SockJS Client 1.6.1 + StompJS 2.3.3
- **Charts**: Recharts 2.x (LineChart, BarChart, PieChart, AreaChart)
- **UI Icons**: Lucide React
- **WebRTC**: Native WebRTC API
- **Font**: Pretendard

### Backend (Cloudflare Workers)
- **Runtime**: Cloudflare Workers
- **Framework**: Hono 4.x
- **Database**: Cloudflare D1 (SQLite)
- **Durable Objects**: WebRTC Room, UserPresence, ChatHub
- **Storage**: R2 (파일/미디어), KV (캐싱/세션)
- **AI**: Workers AI (Whisper, Llama 3.1 8B)
- **Analytics**: Cloudflare Analytics Engine

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치
```bash
# 의존성 설치
npm install

# Workers 의존성 설치 (백엔드)
cd workers && npm install
```

### 환경 설정
```bash
# .env 파일 생성
cp .env.example .env

# 필요한 환경 변수 설정
VITE_API_URL=http://localhost:8787
VITE_FIREBASE_API_KEY=your-firebase-api-key
# ... 기타 환경 변수
```

### 개발 서버 실행
```bash
# Frontend 개발 서버
npm run dev

# Workers 개발 서버 (별도 터미널)
cd workers && npm run dev
```

### 빌드
```bash
# Production 빌드
npm run build

# Workers 빌드
cd workers && npm run build
```

## 🚀 배포

### Frontend (Cloudflare Pages)
```bash
# 자동 배포 (GitHub Actions)
git push origin main

# 수동 배포
npm run build
npx wrangler pages deploy dist
```

### Backend (Cloudflare Workers)
```bash
cd workers

# Staging 배포
npm run deploy:staging

# Production 배포
npm run deploy:production
```

## 📁 프로젝트 구조

```
STUDYMATE-CLIENT/
├── src/
│   ├── api/          # API 클라이언트
│   ├── components/   # 재사용 컴포넌트
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # 페이지 컴포넌트
│   ├── services/     # 비즈니스 로직
│   ├── store/        # Zustand 스토어
│   ├── styles/       # 스타일 파일
│   └── utils/        # 유틸리티 함수
├── workers/
│   ├── src/
│   │   ├── durable/  # Durable Objects
│   │   ├── routes/   # API 라우트
│   │   ├── services/ # 서비스 로직
│   │   └── utils/    # 유틸리티
│   └── wrangler.toml # Workers 설정
├── public/           # 정적 파일
└── docs/            # 문서

```

## 🧪 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:coverage
```

## 📊 모니터링

### Analytics Dashboard
- 실시간 메트릭 모니터링
- 에러 추적
- 성능 분석
- 사용자 행동 분석

### 접속 방법
1. `/analytics` 페이지 접속
2. 관리자 권한 필요

## 🔧 문제 해결

### 일반적인 문제

**마이크/카메라 권한 오류**
- 브라우저 설정에서 권한 확인
- HTTPS 환경에서만 작동

**WebRTC 연결 실패**
- 방화벽/NAT 설정 확인
- STUN/TURN 서버 상태 확인

**API 연결 오류**
- CORS 설정 확인
- API 엔드포인트 확인

## 📝 문서

### 필수 개발 가이드
- **[CLAUDE.md](./CLAUDE.md)** - 프로젝트 전반 개발 가이드 (Task Master, 디자인 시스템, 개발 규칙)

### 📚 통합 문서 (각 폴더당 1개)
- **[Overview](./docs/01-overview/overview.md)** - 프로젝트 비전, 목표, 용어사전
- **[Requirements](./docs/02-requirements/requirements.md)** - 비즈니스 목표, 기능/비기능 요구사항, 사용자 스토리
- **[Architecture](./docs/03-architecture/architecture.md)** ⚡ - 시스템 아키텍처, Zustand 상태 관리, WebSocket 실시간 통신, 캐시 계층
- **[API Specification](./docs/04-api/api.md)** - 모든 REST API 엔드포인트, 세션 타입, LLM 통합
- **[Database](./docs/05-database/database.md)** - D1 테이블 스키마, Workers KV, R2 구조
- **[Frontend Guide](./docs/06-frontend/frontend.md)** ⚠️ - React 컴포넌트, Zustand 무한 루프 패턴, 디자인 시스템
- **[Backend Guide](./docs/07-backend/backend.md)** - AI 캐싱, Zod 검증, WebSocket 아키텍처
- **[Infrastructure](./docs/08-infrastructure/infrastructure.md)** - Cloudflare Pages 배포, CI/CD, 모니터링
- **[Decisions](./docs/10-decisions/decisions.md)** - ADR, 기술 결정 기록

### 🎨 프론트엔드 시스템별 상세 문서
**⚡ 최신 추가 (2025-01-18)**
- **[Settings System](./docs/06-frontend/settings-system.md)** - 7개 카테고리, 2FA, 계정 삭제, GDPR/PIPA 준수
- **[Achievement System](./docs/06-frontend/achievements-system.md)** - 9개 카테고리, 6개 티어, XP 보상, 자동 추적
- **[Theme System](./docs/06-frontend/theme-system.md)** - 다크 모드 (준비 단계), 시스템 테마 감지, 활성화 가이드
- **[Analytics Dashboard](./docs/06-frontend/analytics-dashboard.md)** - Recharts 시각화, WebSocket 실시간 메트릭, 안전한 데이터 추출

### 🔍 로그 및 패턴
- **[Failure Patterns](./docs/99-logs/failure-patterns/)** - 실패 패턴 및 해결 방법
  - [Zustand 무한 루프](./docs/99-logs/failure-patterns/2025-01-13-zustand-infinite-loop.md) ⚠️ **필수 숙지**

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 👥 팀

- Frontend Developer
- Backend Developer
- UI/UX Designer
- Project Manager

## 📞 지원

문제가 있으시면 이슈를 생성하거나 다음으로 연락주세요:
- Email: support@studymate.com
- Discord: [Join our server](https://discord.gg/studymate)

---

Made with ❤️ by STUDYMATE Team