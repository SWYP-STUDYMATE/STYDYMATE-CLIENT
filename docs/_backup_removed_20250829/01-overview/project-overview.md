# STUDYMATE 프로젝트 개요

## 📖 프로젝트 소개

**STUDYMATE**는 언어 교환 학습 플랫폼으로, 사용자들이 서로 다른 언어를 배우고 가르치며 소통할 수 있는 웹 서비스입니다. AI 기반 언어 교정 기능과 실시간 채팅을 통해 효과적인 언어 학습 경험을 제공합니다.

## 🎯 프로젝트 목표

### 주요 목표
- **언어 교환 매칭**: 학습 목표와 스타일이 맞는 파트너 매칭
- **실시간 소통**: WebSocket 기반 실시간 채팅 시스템
- **AI 언어 교정**: Clova Studio API를 활용한 영어 교정 서비스
- **개인화된 학습**: 온보딩을 통한 맞춤형 학습 환경 제공

### 비즈니스 가치
- 언어 학습의 접근성 향상
- 글로벌 커뮤니케이션 능력 증진
- AI 기술을 활용한 학습 효율성 극대화

## 🏗️ 시스템 구성

### 애플리케이션 아키텍처
```
[사용자] ↔ [STUDYMATE-CLIENT] ↔ [STUDYMATE-SERVER] ↔ [Database/Cache]
                                         ↓
                              [외부 API: Naver OAuth, Clova Studio]
```

### 프로젝트 구성
- **STUDYMATE-CLIENT**: React 기반 프론트엔드 웹 애플리케이션
- **STUDYMATE-SERVER**: Spring Boot 기반 백엔드 API 서버

## 👥 팀 구성

### 역할 분담
- **프론트엔드 개발자**: React/UI 개발 담당
- **백엔드 개발자**: Spring Boot/API 개발 담당  
- **인프라/DevOps**: NCP 인프라 및 배포 담당

## 🛠️ 기술 스택

### 프론트엔드 (STUDYMATE-CLIENT)
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **State Management**: Zustand 5.0.6
- **HTTP Client**: Axios 1.10.0
- **WebSocket**: SockJS Client + StompJS
- **Deployment**: Cloudflare Pages

### 백엔드 (STUDYMATE-SERVER)
- **Framework**: Spring Boot 3.5.3 (Java 17)
- **Database**: MySQL 8.0 (NCP Cloud DB)
- **Cache**: Redis 7 (NCP Cloud DB)
- **Storage**: NCP Object Storage
- **Authentication**: JWT + Spring Security
- **WebSocket**: STOMP Protocol
- **External APIs**: Naver OAuth, Clova Studio
- **Deployment**: NCP (Docker + Load Balancer)

## 🌐 서비스 도메인

### 도메인 구조
- **Production**: 
  - Frontend: `languagemate.kr` (Cloudflare Pages)
  - Backend: `api.languagemate.kr` (NCP)
- **Preview/Staging**: 
  - Frontend: `preview.languagemate.kr`
  - Backend: `api-staging.languagemate.kr`

## 🔄 개발 워크플로우

### Git 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치  
- `feature/*`: 기능 개발 브랜치
- `bugfix/*`: 버그 수정 브랜치

### 배포 파이프라인
- **Frontend**: GitHub Actions → Cloudflare Pages
- **Backend**: GitHub Actions → NCP Server (Docker)

## 📈 주요 기능

### 1. 사용자 관리
- Naver OAuth 소셜 로그인
- 사용자 프로필 관리 (영어명, 거주지, 자기소개, 프로필 이미지)
- JWT 기반 인증 시스템

### 2. 온보딩 시스템
- 4단계 온보딩 프로세스
- 언어 학습 목표 및 수준 설정
- 학습 스타일 및 선호도 설정
- 파트너 선호 조건 설정
- 학습 스케줄 관리

### 3. 매칭 시스템
- 학습 목표 기반 파트너 매칭
- 학습 스타일 및 선호도 고려
- 매칭 요청/수락/거절 기능

### 4. 실시간 채팅
- WebSocket 기반 실시간 채팅
- 채팅방 생성 및 관리
- 이미지 업로드 지원
- 메시지 히스토리 저장

### 5. AI 언어 교정
- Clova Studio API 연동
- 영어 문법 및 표현 교정
- 교정 내용 상세 설명 제공

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Green 계열 (#00C471)
- **Text**: Black 계열 (#111111)
- **Background**: White (#FFFFFF), Light Gray (#FAFAFA)
- **Accent**: Naver Green (#03C75A)

### UI/UX 원칙
- 모바일 우선 반응형 디자인 (최대 768px)
- 일관된 간격 시스템 (4px 배수)
- Pretendard 폰트 사용
- 직관적인 네비게이션 및 사용자 흐름

## 🔒 보안 및 규정 준수

### 보안 조치
- JWT 토큰 기반 Stateless 인증
- HTTPS 강제 적용 (SSL/TLS)
- CORS 정책 적용
- API Rate Limiting
- 입력 데이터 검증 및 SQL Injection 방지

### 개인정보 처리
- 최소한의 개인정보 수집
- 사용자 동의 기반 데이터 처리
- 안전한 데이터 저장 및 전송

## 📊 성능 및 확장성

### 성능 최적화
- CDN을 통한 정적 자산 배포 (Cloudflare)
- Redis 캐싱 시스템
- 이미지 최적화 및 Lazy Loading
- Code Splitting 및 Bundle 최적화

### 확장성 고려사항
- Microservice 아키텍처 대비
- Auto-scaling 설정 (NCP)
- Load Balancing 적용
- Database Connection Pooling

## 📈 모니터링 및 분석

### 서버 모니터링
- NCP Cloud Monitoring
- 애플리케이션 로그 수집
- 에러 추적 및 알림 시스템

### 사용자 분석
- 사용자 행동 분석 (예정)
- 성능 메트릭 수집
- A/B 테스트 지원 (예정)

## 🚀 향후 계획

### 단기 로드맵 (3개월)
- 기본 매칭 시스템 완성
- 실시간 채팅 안정화
- AI 교정 기능 고도화
- 모바일 앱 개발 시작

### 중기 로드맵 (6개월)
- 그룹 스터디 기능 추가
- 학습 진도 추적 시스템
- 게임화 요소 도입
- 다국어 지원 확장

### 장기 로드맵 (1년)
- 음성 채팅 기능
- 화상 통화 지원
- 학습 콘텐츠 마켓플레이스
- 기업 교육 솔루션

## 📝 참고 자료

### 기술 문서
- [API 문서](../04-api/api-specification.md)
- [아키텍처 가이드](../03-architecture/system-architecture.md)
- [프론트엔드 가이드](../06-frontend/style-guide.md)
- [인프라 가이드](../08-infrastructure/deployment-guide.md)

### 외부 링크
- [Swagger API 문서](https://api.languagemate.kr/swagger-ui/index.html)
- [프로덕션 사이트](https://languagemate.kr)
- [백엔드 저장소](https://github.com/organization/STUDYMATE-SERVER)
- [프론트엔드 저장소](https://github.com/organization/STUDYMATE-CLIENT)