# STUDYMATE 용어사전

## 📚 개요

STUDYMATE 프로젝트에서 사용되는 핵심 용어들의 정의와 설명을 제공합니다.

## 🎯 프로젝트 핵심 용어

### STUDYMATE
**정의**: Study + Mate의 합성어로, 언어 교환 학습 플랫폼의 브랜드명  
**설명**: AI 기반 레벨 테스트와 실시간 화상/음성 통화를 통한 글로벌 언어 교환 서비스

### Language Exchange (언어 교환)
**정의**: 서로 다른 언어를 구사하는 사용자들이 상호 교육하는 학습 방식  
**예시**: 한국어 원어민이 영어를 배우고, 영어 원어민이 한국어를 배우는 형태

### CEFR (Common European Framework of Reference)
**정의**: 유럽 공통 언어 평가 기준  
**레벨**: A1(입문) → A2(초급) → B1(중급) → B2(중상급) → C1(고급) → C2(최고급)  
**용도**: STUDYMATE의 레벨 테스트 표준 기준

## 👥 사용자 관리 용어

### User (사용자)
**정의**: STUDYMATE 플랫폼을 이용하는 모든 개인  
**속성**: 프로필, 언어 설정, 레벨, 관심사, 스케줄

### Profile (프로필)
**구성 요소**:
- **Basic Info**: 이름, 나이, 성별, 거주지
- **Language Info**: 가르치는 언어, 학습 언어, 레벨
- **Interests**: 관심사 태그 목록
- **Schedule**: 학습 가능 시간대

### Partner (파트너)
**정의**: 매칭된 언어 교환 상대방  
**유형**:
- **Casual Partner**: 일회성 세션 파트너
- **Regular Mate**: 정기적으로 세션하는 고정 파트너

### Compatibility Score (호환성 점수)
**정의**: 두 사용자 간의 매칭 적합도를 나타내는 수치 (0-100점)  
**계산 요소**: 언어 매칭, 레벨 차이, 관심사 겹침, 시간대 호환성

## 🎓 학습 시스템 용어

### Level Test (레벨 테스트)
**정의**: AI 기반 언어 능력 평가 시스템  
**구성**: 4개 음성 질문 + AI 분석 + CEFR 레벨 산정  
**평가 영역**: 발음, 문법, 유창성, 어휘력, 이해력, 상호작용

### Assessment Areas (평가 영역)
1. **Pronunciation (발음)**: 정확한 발음 및 억양
2. **Grammar (문법)**: 문법 정확성 및 복잡성
3. **Fluency (유창성)**: 말하기 속도 및 자연스러움
4. **Vocabulary (어휘력)**: 어휘 다양성 및 정확성
5. **Comprehension (이해력)**: 질문 이해 및 적절한 응답
6. **Interaction (상호작용)**: 의사소통 효과성

### Radar Chart (레이더 차트)
**정의**: 6개 평가 영역의 점수를 시각화한 육각형 차트  
**용도**: 사용자의 언어 능력 프로필 표시

### Achievement Badge (성취 배지)
**정의**: 특정 목표 달성 시 부여되는 디지털 배지  
**예시**: "첫 번째 세션 완료", "연속 7일 학습", "레벨업 달성"

## 💬 세션 및 통신 용어

### Session (세션)
**정의**: 사용자들 간의 실시간 언어 교환 활동  
**유형**:
- **Audio Session**: 음성 전용 1:1 세션
- **Video Session**: 화상 1:1 세션
- **Group Session**: 최대 4명 참여 그룹 세션

### WebRTC (Web Real-Time Communication)
**정의**: 웹 브라우저 간 실시간 통신 기술  
**용도**: STUDYMATE의 음성/화상 통화 기능 구현

### Room (룸)
**정의**: 세션이 진행되는 가상 공간  
**구성 요소**: Room ID, 참가자 목록, 연결 상태, 세션 설정

### Signaling Server (시그널링 서버)
**정의**: WebRTC 연결 설정을 위한 중계 서버  
**기능**: Offer/Answer 교환, ICE Candidate 중계

### TURN Server
**정의**: NAT/Firewall 환경에서 미디어 스트림 릴레이  
**제공업체**: Cloudflare TURN 서비스 활용

### Language Toggle (언어 전환)
**정의**: 세션 중 대화 언어를 전환하는 기능  
**예시**: 전반 30분 영어 → 후반 30분 한국어

## 🤖 AI 기술 용어

### OpenAI Whisper
**정의**: 음성을 텍스트로 변환하는 AI 모델  
**용도**: 레벨 테스트 음성 분석, 실시간 자막 생성

### GPT-4
**정의**: 대규모 언어 모델  
**용도**: 텍스트 분석, 문법 평가, 피드백 생성, 표현 제안

### STT (Speech-to-Text)
**정의**: 음성 인식 기술  
**구현**: OpenAI Whisper API 활용

### LLM (Large Language Model)
**정의**: 대규모 언어 모델의 총칭  
**활용**: 텍스트 분석, 레벨 평가, 피드백 생성

## 📱 기술 스택 용어

### Frontend (프론트엔드)
**기술 스택**: React 19.1.0 + Vite 7.0.4 + Tailwind CSS  
**배포**: Cloudflare Pages  
**상태 관리**: Zustand

### Backend API (백엔드 API)
**기술 스택**: Spring Boot (STUDYMATE-SERVER)  
**데이터베이스**: PostgreSQL + Redis  
**인증**: JWT + OAuth2

### Node.js Backend (Node.js 백엔드)
**기술 스택**: Cloudflare Workers + Durable Objects  
**용도**: WebRTC 시그널링, AI 레벨테스트, 파일 처리

### PWA (Progressive Web App)
**정의**: 웹과 네이티브 앱의 장점을 결합한 웹 애플리케이션  
**기능**: 오프라인 지원, 푸시 알림, 홈 화면 설치

## 🏗️ 아키텍처 용어

### Microservices (마이크로서비스)
**정의**: 독립적으로 배포 가능한 작은 서비스들로 구성된 아키텍처  
**STUDYMATE 구성**:
- Frontend (React)
- Backend API (Spring Boot)
- WebRTC Server (Node.js)
- AI Services (Workers)

### Edge Computing (엣지 컴퓨팅)
**정의**: 사용자와 가까운 위치에서 컴퓨팅 처리  
**구현**: Cloudflare Workers를 통한 전 세계 엣지 배포

### CDN (Content Delivery Network)
**정의**: 전 세계 분산된 서버 네트워크  
**제공업체**: Cloudflare CDN

### Durable Objects
**정의**: Cloudflare의 상태 유지 서버리스 객체  
**용도**: WebRTC Room 상태 관리, 실시간 세션 동기화

### Workers KV
**정의**: Cloudflare의 글로벌 키-값 저장소  
**용도**: 세션 메타데이터, 캐시 데이터

## 📊 데이터 및 분석 용어

### Analytics (분석)
**수집 데이터**:
- 사용자 활동 메트릭
- 세션 품질 지표
- 학습 진도 추적
- 매칭 성공률

### Metrics (메트릭)
**주요 지표**:
- **MAU**: Monthly Active Users (월간 활성 사용자)
- **Session Duration**: 평균 세션 시간
- **Retention Rate**: 사용자 유지율
- **NPS**: Net Promoter Score (순 추천 지수)

### Learning Progress (학습 진도)
**측정 요소**:
- 세션 참여 횟수
- 레벨업 달성
- 성취 배지 획득
- 학습 시간 누적

## 🔐 보안 및 인증 용어

### JWT (JSON Web Token)
**정의**: JSON 객체로 정보를 안전하게 전송하는 토큰  
**구성**: Header + Payload + Signature

### OAuth2
**정의**: 제3자 인증 프로토콜  
**지원 제공업체**: Google, Naver

### Access Token / Refresh Token
**정의**: 
- **Access Token**: API 접근용 단기 토큰 (15분)
- **Refresh Token**: Access Token 갱신용 장기 토큰 (7일)

### CORS (Cross-Origin Resource Sharing)
**정의**: 다른 도메인 간 리소스 공유 허용 정책  
**설정**: 프론트엔드 ↔ 백엔드 통신 허용

## 🎨 UI/UX 용어

### Design System (디자인 시스템)
**구성 요소**:
- Color Palette (색상 팔레트)
- Typography (타이포그래피)
- Component Library (컴포넌트 라이브러리)
- Spacing System (간격 시스템)

### Color Palette (색상 팔레트)
**Primary**: Green 계열 (#00C471 기준)  
**Secondary**: Black 계열 (#111111 기준)  
**Accent**: Naver Green (#03C75A), Red (#EA4335), Blue (#4285F4)

### Component Library (컴포넌트 라이브러리)
**Common Components**:
- CommonButton, CommonInput, CommonSelect
- Modal, Toast, Loading
- MainHeader, Sidebar, BottomNav

### Responsive Design (반응형 디자인)
**브레이크포인트**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 배포 및 운영 용어

### CI/CD (Continuous Integration/Continuous Deployment)
**정의**: 지속적 통합 및 배포  
**구현**: GitHub Actions

### Environment (환경)
**종류**:
- **Development**: 개발 환경 (localhost)
- **Staging**: 스테이징 환경 (preview.languagemate.kr)
- **Production**: 프로덕션 환경 (languagemate.kr)

### Zero Downtime Deployment (무중단 배포)
**정의**: 서비스 중단 없이 새 버전 배포  
**구현**: Cloudflare의 Blue-Green 배포

### Monitoring (모니터링)
**도구**: Cloudflare Analytics, Sentry  
**메트릭**: 응답 시간, 에러율, 트래픽, 사용량

## ⚠️ 에러 및 예외 상황 용어

### Error Codes (에러 코드)
**HTTP 상태 코드**:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

### Fallback (폴백)
**정의**: 기본 기능 실패 시 대체 방안  
**예시**: WebRTC 연결 실패 → TURN 서버 사용

### Retry Logic (재시도 로직)
**정의**: 일시적 오류 시 자동 재시도 메커니즘  
**적용**: API 호출, WebRTC 연결, 파일 업로드

### Circuit Breaker (회로 차단기)
**정의**: 연속적 실패 시 일시적으로 요청 차단하는 패턴  
**용도**: 외부 서비스 장애로부터 시스템 보호

## 📱 플랫폼별 용어

### Cross-Platform (크로스 플랫폼)
**지원 플랫폼**: Web, iOS (PWA), Android (PWA)

### Native App vs Web App
**Native App**: 각 플랫폼 전용 앱 (미래 계획)  
**Web App**: 브라우저 기반 앱 (현재 구현)

### Service Worker
**정의**: 백그라운드에서 실행되는 스크립트  
**기능**: 오프라인 지원, 캐싱, 푸시 알림

## 🔍 테스트 및 품질 보증 용어

### Mock Data (목 데이터)
**정의**: 실제 데이터를 대신하는 가상 데이터  
**용도**: 개발 및 테스트 환경에서 API 시뮬레이션

### E2E Testing (End-to-End Testing)
**정의**: 전체 사용자 플로우를 검증하는 테스트  
**도구**: Playwright

### Performance Testing (성능 테스트)
**메트릭**: Lighthouse 점수, Core Web Vitals  
**목표**: 성능 점수 90+ 유지

### A/B Testing
**정의**: 두 가지 버전을 비교하는 실험  
**용도**: UI/UX 개선, 기능 최적화

---

*이 용어사전은 STUDYMATE 프로젝트의 이해도 향상과 팀 내 원활한 소통을 위해 지속적으로 업데이트됩니다.*