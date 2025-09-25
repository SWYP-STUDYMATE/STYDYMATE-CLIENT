# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 프로젝트 개요

**STUDYMATE-CLIENT**는 언어 교환 학습 플랫폼의 웹 클라이언트입니다. React와 Vite를 기반으로 한 SPA(Single Page Application)로 사용자 인터페이스를 제공합니다.

### 담당 개발자
- **프론트엔드 개발자**: React/UI 개발 담당

### 관련 프로젝트
- **STUDYMATE-API**: Cloudflare Workers 기반 백엔드 (https://api.languagemate.kr)

## 📦 기술 스택

### Core Technologies
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11
- **State Management**: Zustand 5.0.6
- **Routing**: React Router DOM 7.6.3
- **HTTP Client**: Axios 1.10.0
- **WebSocket**: SockJS Client 1.6.1 + StompJS 2.3.3
- **Font**: Pretendard
- **UI Components**: React Select, Emoji Picker React, Lucide React
- **JWT Handling**: jwt-decode 4.0.0

## 🚀 개발 명령어

### 개발 및 빌드
```bash
# 개발 서버 실행 (포트 3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 코드 린팅
npm run lint
```

## 📁 프로젝트 구조

### 라우팅 구조
```
/ - 로그인 페이지
/login/oauth2/code/naver - 네이버 OAuth 콜백
/agreement - 약관 동의
/signup-complete - 회원가입 완료
/main - 메인 페이지
/onboarding-info/:step - 온보딩 (1-4단계)
/chat - 채팅 페이지
/chat/:roomId - 채팅방
/profile - 프로필 페이지
/matching - 매칭 페이지
```

## 🔗 API 엔드포인트 구조

### 백엔드 서버 통신 (STUDYMATE-SERVER)
```javascript
// 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.languagemate.kr';

// 주요 엔드포인트
const endpoints = {
  // 인증
  auth: {
    login: 'POST /api/v1/auth/login',
    refresh: 'POST /api/v1/auth/refresh',
    logout: 'POST /api/v1/auth/logout',
    naverCallback: 'GET /login/oauth2/code/naver'
  },
  
  // 사용자
  user: {
    profile: 'GET /api/v1/users/profile',
    updateProfile: 'PATCH /api/v1/users/profile',
    uploadImage: 'POST /api/v1/users/profile/image'
  },
  
  // 온보딩
  onboarding: {
    saveStep: 'POST /api/v1/onboarding/step/{step}',
    getStatus: 'GET /api/v1/onboarding/status',
    complete: 'POST /api/v1/onboarding/complete'
  },
  
  // 매칭
  matching: {
    findPartners: 'GET /api/v1/matching/partners',
    requestMatch: 'POST /api/v1/matching/request',
    acceptMatch: 'POST /api/v1/matching/accept/{matchId}',
    rejectMatch: 'POST /api/v1/matching/reject/{matchId}'
  },
  
  // 채팅
  chat: {
    getRooms: 'GET /api/v1/chat/rooms',
    getMessages: 'GET /api/v1/chat/rooms/{roomId}/messages',
    createRoom: 'POST /api/v1/chat/rooms'
  }
};

// WebSocket 연결
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://api.languagemate.kr/ws';
```


## 🔐 인증 및 토큰 관리

### JWT 토큰 처리
```javascript
// api/index.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response 인터셉터 (토큰 갱신)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refreshToken
          });
          localStorage.setItem('accessToken', data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios.request(error.config);
        } catch {
          // 토큰 갱신 실패 - 로그인 페이지로
          localStorage.clear();
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

## 💬 WebSocket 연결 설정

```javascript
// services/websocket.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  connect(token) {
    const socket = new SockJS(`${API_BASE_URL}/ws`);
    this.stompClient = Stomp.over(socket);
    
    this.stompClient.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        // 연결 성공
        this.subscribeToChannels();
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      }
    );
  }
  
  subscribeToChannels() {
    // 개인 메시지
    this.stompClient.subscribe('/user/queue/messages', (message) => {
      // 메시지 처리
    });
    
    // 채팅방 메시지
    this.stompClient.subscribe('/topic/chat/{roomId}', (message) => {
      // 채팅 메시지 처리
    });
  }
  
  sendMessage(destination, message) {
    this.stompClient.send(destination, {}, JSON.stringify(message));
  }
}
```

## 🗂️ 상태 관리 (Zustand)

### Store 구조
```javascript
// stores/profileStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useProfileStore = create(
  persist(
    (set) => ({
      englishName: '',
      residence: '',
      profileImage: null,
      intro: '',
      setEnglishName: (name) => set({ englishName: name }),
      setResidence: (residence) => set({ residence }),
      setProfileImage: (image) => set({ profileImage: image }),
      setIntro: (intro) => set({ intro }),
      clearProfile: () => set({
        englishName: '',
        residence: '',
        profileImage: null,
        intro: ''
      })
    }),
    {
      name: 'profile-storage',
    }
  )
);
```

## 📐 디자인 시스템 원칙

### 🎨 색상 팔레트 (공식 스타일 가이드) - 필수 준수
**⚠️ 중요: 모든 UI 구현 시 반드시 이 색상만 사용할 것**

#### Green 계열 (Primary Brand Color)
- `#E6F9F1` (green-50) - 가장 연한 배경
- `#B0EDD3` (green-100)
- `#8AE4BE` (green-200)
- `#54D7A0` (green-300)
- `#33D08D` (green-400)
- **`#00C471` (green-500)** - 메인 브랜드 컬러
- `#00B267` (green-600)
- `#008B50` (green-700)
- `#006C3E` (green-800)
- `#00522F` (green-900)

#### Black 계열 (Text & UI)
- `#E7E7E7` (black-50) - 테두리
- `#B5B5B5` (black-100)
- `#929292` (black-200) - 보조 텍스트
- `#606060` (black-300)
- `#414141` (black-400)
- **`#111111` (black-500)** - 메인 텍스트
- `#0F0F0F` (black-600)
- `#0C0C0C` (black-700)
- `#090909` (black-800)
- `#070707` (black-900)

#### 기타 필수 색상
- `#FFFFFF` (white) - 카드 배경
- `#FAFAFA` (background) - 페이지 배경
- `#03C75A` (naver) - 네이버 로그인
- `#EA4335` (red) - 에러/경고
- `#4285F4` (blue) - 정보/링크

### 📏 간격 시스템
- **페이지 여백**: `24px` (좌우)
- **섹션 간격**: `32px`, `40px`
- **컴포넌트 간격**: `12px`, `16px`, `20px`, `24px`
- **내부 패딩**: `14px`, `16px`

### 🔤 타이포그래피
- **Font Family**: Pretendard
- **Letter Spacing**: `-0.025em` (전역)
- **제목**: 
  - H1: `32px`, `font-bold`, `leading-[42px]`
- **본문**:
  - Large: `18px`, `font-bold`, `leading-[28px]`
  - Medium: `16px`, `font-medium`, `leading-[24px]`
  - Small: `14px`

### 🔘 버튼 스타일
- **높이**: `56px` (기본)
- **Border Radius**: `6px`
- **Font**: `18px`, `font-bold`
- **Variants**:
  - Primary: 검정 배경 → hover 시 회색
  - Success: 연두 배경 → hover 시 진한 초록
  - Secondary: 회색 배경 → hover 시 검정
  - Complete: 초록 배경 → hover 시 진한 초록
- **Disabled**: `bg-[#F1F3F5]`, `text-[#929292]`

### 📦 컴포넌트 패턴
- **Container Width**: `768px` (페이지), `720px` (내부 콘텐츠)
- **Input Height**: `56px`
- **Input Border**: `1px solid #CED4DA`, focus 시 `#111111`
- **Card Border Radius**: `6px`, `10px`, `20px` (용도별)
- **Transition**: `transition-colors duration-200`

### ✅ 체크박스 스타일
- **크기**: `20px × 20px`
- **Border Radius**: `4px` (사각형), `full` (원형)
- **Checked**: `bg-[#00C471]`, `border-[#00C471]`
- **Unchecked**: `bg-white`, `border-[#CED4DA]`

### 📱 레이아웃 원칙
- **중앙 정렬**: `mx-auto`
- **모바일 우선**: 최대 너비 768px
- **Flexbox 활용**: 정렬과 간격 관리
- **일관된 여백**: 좌우 24px 패딩

### 🎯 디자인 일관성 체크리스트
- [ ] 새 컴포넌트는 CommonButton 활용
- [ ] 색상은 정의된 팔레트만 사용  
- [ ] 간격은 4px 배수 시스템 준수
- [ ] 입력 필드는 56px 높이 유지
- [ ] Hover 효과는 transition 적용
- [ ] 텍스트는 Pretendard 폰트 사용

## 🌐 배포 아키텍처 (Cloudflare Pages & Workers)

### 배포된 서비스
- **Frontend (Pages)**: https://75931264.studymate-client.pages.dev
- **Backend (Workers)**: https://api.languagemate.kr
- **메인 도메인**: languagemate.kr (예정)

### 도메인 설정 (Cloudflare DNS)
```
languagemate.kr → Cloudflare Pages (프로덕션)
api.languagemate.kr → Cloudflare Workers (API)
preview.languagemate.kr → Cloudflare Pages (프리뷰/스테이징)
```

### 환경 변수 설정
```bash
# Production (.env.production)
VITE_API_URL=https://api.languagemate.kr
VITE_WS_URL=wss://api.languagemate.kr/ws

# Preview/Staging (.env.staging)
VITE_API_URL=https://api-staging.languagemate.kr
VITE_WS_URL=wss://api-staging.languagemate.kr/ws

# Development (.env.local)
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
```

### Cloudflare Pages 배포 방법

#### 1. CLI를 통한 배포 (Wrangler)
```bash
# Cloudflare 로그인
npx wrangler login

# 프로덕션 배포
npx wrangler pages deploy dist --project-name=studymate-client --branch=main

# 프리뷰 배포
npx wrangler pages deploy dist --project-name=studymate-client --branch=preview
```

#### 2. GitHub Actions 자동 배포
```yaml
# .github/workflows/deploy.yml
- main 브랜치 푸시 → 프로덕션 배포
- develop 브랜치 푸시 → 프리뷰 배포
- PR 생성 → 프리뷰 URL 생성
```

#### 3. Cloudflare Dashboard 설정
1. Pages 프로젝트 생성
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Build output: `dist`
   - Node version: `18`
4. 환경 변수 설정 (위 Production 변수)
5. 커스텀 도메인 추가: `languagemate.kr`

### 배포 전 체크리스트
- [ ] 환경 변수 확인
- [ ] 빌드 에러 없음 (`npm run build`)
- [ ] 린트 통과 (`npm run lint`)
- [ ] API 엔드포인트 확인
- [ ] CORS 설정 확인

## ⚠️ 개발 시 주의사항

### 📝 필수 상호 참조 규칙
**클라이언트 개발 시 반드시 확인해야 할 서버 관련 사항:**
- **API 엔드포인트**: `../STUDYMATE-SERVER/src/*/controller/` 실제 구현 확인
- **DTO 응답 형식**: `../STUDYMATE-SERVER/src/*/dto/response/` TypeScript 인터페이스와 일치
- **에러 코드**: `../STUDYMATE-SERVER/docs/07-backend/error-handling.md` 에러 처리 로직 동기화
- **WebSocket 이벤트**: 서버 소켓 이벤트와 클라이언트 핸들러 일치

### API 통신 규칙
- **백엔드 API (STUDYMATE-SERVER)**
  - 모든 비즈니스 로직 및 데이터 처리
  - JWT 인증 필수
  - REST API 규격 준수
  - WebSocket을 통한 실시간 통신

### 에러 처리
```javascript
// 통합 에러 처리
const handleApiError = (error) => {
  if (error.response) {
    // 서버 응답 에러
    switch (error.response.status) {
      case 401:
        // 인증 에러 - 인터셉터가 처리
        break;
      case 403:
        alert('권한이 없습니다.');
        break;
      case 404:
        alert('요청한 리소스를 찾을 수 없습니다.');
        break;
      case 500:
        alert('서버 오류가 발생했습니다.');
        break;
      default:
        alert(error.response.data.message || '오류가 발생했습니다.');
    }
  } else if (error.request) {
    // 네트워크 에러
    alert('네트워크 연결을 확인해주세요.');
  }
};
```

## 🔄 Git 워크플로우

### 브랜치 전략
- `main`: 프로덕션 배포
- `develop`: 개발 통합
- `feature/{feature-name}`: 기능 개발
- `bugfix/{bug-name}`: 버그 수정

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
perf: 성능 개선
chore: 빌드 업무, 패키지 설정
```

## 👥 협업 가이드

### API 연동 체크리스트
- [ ] Swagger 문서 확인 (https://api.languagemate.kr/swagger-ui/index.html)
- [ ] 엔드포인트 URL 확인
- [ ] Request/Response 타입 정의
- [ ] 에러 케이스 처리
- [ ] 로딩 상태 관리
- [ ] 토큰 만료 처리

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

## 📋 프로젝트 개발 규칙 (필수 준수사항)

### 스크린샷 기반 개발 워크플로우
1. **스크린샷 수집 단계**
   - 사용자가 제공하는 모든 스크린샷을 먼저 수집
   - 각 스크린샷의 기능과 플로우를 문서화
   - 스크린샷 간의 연결 관계 파악

2. **작업 계획 단계** 
   - 모든 스크린샷이 제공된 후에만 개발 시작
   - Taskmaster MCP를 사용하여 작업을 체계적으로 관리
   - 각 화면별로 세분화된 태스크 생성

3. **개발 실행 단계**
   - 스크린샷과 100% 동일한 UI/UX 구현
   - 기존 디자인 시스템 및 컴포넌트 재사용
   - 라우팅 구조 유지 및 확장

### Taskmaster 작업 관리 규칙
- PRD 작성 → 태스크 파싱 → 개발 실행 순서 준수
- 모든 개발 작업은 Taskmaster 태스크로 관리
- 진행 상황을 실시간으로 업데이트

### 스크린샷 구현 원칙
- 픽셀 퍼펙트 수준의 정확한 구현
- 애니메이션, 인터랙션 포함
- 반응형 디자인 고려
