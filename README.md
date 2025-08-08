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
- 세션 스케줄링
- 학습 통계 대시보드
- 성취 배지 시스템
- 언어 교환 파트너 매칭

## 🛠 기술 스택

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **UI Icons**: Lucide React
- **WebRTC**: Native WebRTC API

### Backend (Cloudflare Workers)
- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Durable Objects
- **Storage**: R2 (파일), KV (캐싱)
- **AI**: Workers AI (Whisper, LLM)
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

- [배포 가이드](./docs/DEPLOYMENT.md)
- [아키텍처 문서](./docs/ARCHITECTURE.md)
- [QA 체크리스트](./docs/QA_CHECKLIST.md)
- [Workers 배포](./workers/DEPLOYMENT.md)

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