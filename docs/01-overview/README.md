# 📚 STUDYMATE 프로젝트 개요

## 🎯 프로젝트 비전
**STUDYMATE**는 AI 기반 언어 교환 학습 플랫폼으로, 전 세계 사용자들이 서로의 모국어를 교환하며 학습할 수 있는 혁신적인 서비스입니다.

## 🏗️ 프로젝트 구성

### 1. STUDYMATE-CLIENT (프론트엔드)
- **기술 스택**: React 19, Vite, Tailwind CSS
- **배포**: Cloudflare Pages
- **URL**: https://languagemate.kr (예정)
- **저장소**: https://github.com/SWYP-STUDYMATE/STYDYMATE-CLIENT

### 2. STUDYMATE-API (백엔드)
- **기술 스택**: Cloudflare Workers (Hono), D1, KV, R2, Durable Objects
- **배포**: Cloudflare Workers
- **API URL**: https://api.languagemate.kr
- **저장소**: https://github.com/SWYP-STUDYMATE/STYDYMATE-CLIENT (`workers/` 디렉터리)

### 3. AI & Realtime Services
- **기술 스택**: Cloudflare Workers AI, WebRTC, STOMP over WebSocket
- **AI 모델**: Llama 3.1 8B, Whisper
- **배포**: Cloudflare Workers
- **URL**: https://studymate-workers.wjstks3474.workers.dev

## 🚀 핵심 기능

### 1. 사용자 인증 및 온보딩
- OAuth 2.0 (네이버, 구글) 소셜 로그인
- JWT 기반 인증
- 4단계 온보딩 프로세스
  - 영어 이름 설정
  - 거주지/시간대 선택
  - 프로필 이미지 업로드
  - 자기소개 작성

### 2. 언어 학습 기능
- **레벨 테스트**: AI 기반 CEFR 레벨 평가
- **실시간 피드백**: 대화 중 문법/발음 교정
- **학습 추천**: 개인화된 학습 콘텐츠 제공

### 3. 매칭 시스템
- 언어 레벨 기반 파트너 매칭
- 관심사 및 학습 스타일 매칭
- 시간대 고려 스케줄 매칭

### 4. 커뮤니케이션
- **채팅**: 실시간 텍스트/이미지 메시징
- **화상 통화**: WebRTC 기반 비디오/오디오 통화
- **AI 지원**: 실시간 번역 및 문법 교정

### 5. 학습 관리
- 학습 진도 추적
- 성취도 분석 대시보드
- 학습 일정 관리

## 📊 현재 상태 (2025년 9월)

### ✅ 완료된 기능
- 소셜 로그인 (네이버, 구글)
- 기본 온보딩 플로우
- 채팅 시스템
- WebRTC 화상 통화
- AI 레벨 테스트
- 프로필 관리

### 🚧 진행 중
- Cloudflare Workers AI 통합
- 실시간 피드백 시스템
- 매칭 알고리즘 고도화

### 📋 예정 기능
- 그룹 학습 세션
- 학습 커뮤니티
- 게이미피케이션
- 모바일 앱

## 👥 팀 구성
- **프론트엔드**: 1명
- **백엔드**: 1명
- **기획/디자인**: 2명

## 🔗 관련 링크
- [API 문서](../04-api/README.md)
- [아키텍처 설계](../03-architecture/README.md)
- [데이터베이스 스키마](../05-database/README.md)
- [배포 가이드](../08-infrastructure/README.md)

## 📝 업데이트 이력
- 2025.09.02: Cloudflare Workers AI 통합
- 2025.09.02: 모달 UX 개선
- 2025.09.02: API 엔드포인트 정리
