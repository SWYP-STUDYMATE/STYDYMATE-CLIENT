# STUDYMATE 통합 아키텍처 문서

## 📌 문서 개요
- **작성일**: 2025년 8월 8일
- **버전**: 1.0.0
- **목적**: 스크린샷 분석 기반 전체 시스템 아키텍처 정의

## 🏗️ 시스템 아키텍처 개요

### 3-Tier Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│              Cloudflare Pages / CDN                      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Edge Layer                             │
│        Cloudflare Workers + Durable Objects              │
│   (WebRTC, AI Processing, Image Optimization)            │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend Layer                           │
│        Cloudflare Workers (Hono + Durable Objects)       │
│        D1 + KV + R2 (Data & State Persistence)           │
└─────────────────────────────────────────────────────────┘
```

## 📂 Frontend 폴더 구조

```
src/
├── api/                          # API 통신 레이어
│   ├── auth.js                  # 인증 관련 API
│   ├── user.js                  # 사용자 프로필 API
│   ├── chat.js                  # 채팅 API (WebSocket 포함)
│   ├── session.js               # 세션 API (NEW)
│   ├── levelTest.js             # 레벨테스트 API (NEW)
│   ├── matching.js              # 매칭 API (NEW)
│   └── webrtc.js                # WebRTC 관련 API (NEW)
│
├── components/
│   ├── common/                  # 공통 컴포넌트
│   │   ├── CommonButton.jsx     
│   │   ├── CommonInput.jsx      
│   │   ├── CommonSelect.jsx     
│   │   ├── Modal.jsx            
│   │   ├── Toast.jsx            
│   │   └── Loading.jsx          
│   │
│   ├── layout/                  # 레이아웃 컴포넌트
│   │   ├── MainHeader.jsx       
│   │   ├── Sidebar.jsx          
│   │   ├── Navigation.jsx       
│   │   └── BottomNav.jsx        
│   │
│   ├── auth/                    # 인증 관련
│   │   ├── LoginForm.jsx        
│   │   ├── OAuthButtons.jsx     
│   │   └── AgreementForm.jsx    
│   │
│   ├── onboarding/              # 온보딩
│   │   ├── ProfileSetup.jsx     
│   │   ├── LanguageSelect.jsx   
│   │   ├── InterestSelect.jsx   
│   │   └── ScheduleSetup.jsx    
│   │
│   ├── levelTest/               # 레벨테스트 (NEW)
│   │   ├── TestIntro.jsx        
│   │   ├── TestQuestion.jsx     
│   │   ├── VoiceRecorder.jsx    
│   │   ├── TestProgress.jsx     
│   │   ├── TestResult.jsx       
│   │   └── LevelChart.jsx       
│   │
│   ├── matching/                # 매칭 (NEW)
│   │   ├── PartnerList.jsx      
│   │   ├── PartnerCard.jsx      
│   │   ├── FilterPanel.jsx      
│   │   ├── MatchingStatus.jsx   
│   │   └── CompatibilityScore.jsx
│   │
│   ├── chat/                    # 채팅
│   │   ├── ChatContainer.jsx    ✓
│   │   ├── ChatRoomList.jsx     
│   │   ├── ChatWindow.jsx       
│   │   ├── MessageBubble.jsx    
│   │   ├── MessageInput.jsx     
│   │   └── EmojiPicker.jsx      
│   │
│   ├── session/                 # 세션 (NEW)
│   │   ├── SessionList.jsx      
│   │   ├── SessionCard.jsx      
│   │   ├── SessionRoom.jsx      
│   │   ├── SessionTimer.jsx     
│   │   ├── LanguageToggle.jsx   
│   │   ├── ParticipantList.jsx  
│   │   ├── AudioControls.jsx    
│   │   ├── VideoControls.jsx    
│   │   ├── ScreenShare.jsx      
│   │   └── SessionStats.jsx     
│   │
│   ├── profile/                 # 프로필 (ENHANCED)
│   │   ├── ProfileView.jsx      
│   │   ├── ProfileEdit.jsx      
│   │   ├── ProfileStats.jsx     
│   │   ├── LanguageSkills.jsx   
│   │   ├── AchievementBadges.jsx
│   │   └── LearningHistory.jsx  
│   │
│   └── notification/            # 알림 (NEW)
│       ├── NotificationBell.jsx 
│       ├── NotificationList.jsx 
│       └── NotificationItem.jsx 
│
├── pages/                       # 페이지 컴포넌트
│   ├── Login/                   
│   ├── Main/                    
│   ├── Onboarding/              
│   ├── LevelTest/               # NEW
│   ├── Matching/                # NEW
│   ├── Chat/                    
│   ├── Session/                 # NEW
│   └── Profile/                 
│
├── stores/                      # Zustand 상태 관리
│   ├── authStore.js             
│   ├── profileStore.js          
│   ├── chatStore.js             
│   ├── sessionStore.js          # NEW
│   ├── levelTestStore.js        # NEW
│   ├── matchingStore.js         # NEW
│   └── notificationStore.js     # NEW
│
├── hooks/                       # 커스텀 훅
│   ├── useAuth.js               
│   ├── useWebSocket.js          
│   ├── useWebRTC.js             # NEW
│   ├── useMediaStream.js        # NEW
│   ├── useTimer.js              # NEW
│   └── useNotification.js       # NEW
│
├── utils/                       # 유틸리티
│   ├── constants.js             
│   ├── validation.js            
│   ├── dateFormatter.js         
│   ├── mediaRecorder.js         # NEW
│   ├── webrtcHelper.js          # NEW
│   └── languageDetector.js      # NEW
│
└── styles/                      # 스타일
    ├── globals.css              
    └── tailwind.css             
```

## 🛣️ 라우팅 구조

```javascript
const routes = {
  // 인증 관련
  '/': 'LoginPage',
  '/login/oauth2/code/:provider': 'OAuthCallback',
  '/agreement': 'AgreementPage',
  '/signup-complete': 'SignupCompletePage',
  
  // 온보딩
  '/onboarding-info/:step': 'OnboardingInfo',
  '/onboarding-lang/:step': 'OnboardingLanguage',
  '/onboarding-int/:step': 'OnboardingInterest',
  '/onboarding-partner/:step': 'OnboardingPartner',
  '/onboarding-schedule/:step': 'OnboardingSchedule',
  
  // 레벨테스트 (NEW)
  '/level-test': 'LevelTestIntro',
  '/level-test/question/:id': 'LevelTestQuestion',
  '/level-test/speaking': 'LevelTestSpeaking',
  '/level-test/result': 'LevelTestResult',
  
  // 메인
  '/main': 'MainPage',
  
  // 매칭 (NEW)
  '/matching': 'MatchingList',
  '/matching/profile/:userId': 'PartnerProfile',
  
  // 채팅
  '/chat': 'ChatPage',
  '/chat/:roomId': 'ChatRoom',
  
  // 세션 (NEW)
  '/sessions': 'SessionList',
  '/sessions/create': 'CreateSession',
  '/sessions/:sessionId': 'SessionRoom',
  '/sessions/:sessionId/waiting': 'SessionWaiting',
  
  // 프로필
  '/profile': 'ProfilePage',
  '/profile/edit': 'ProfileEdit',
  '/profile/stats': 'ProfileStats',
  
  // 알림 (NEW)
  '/notifications': 'NotificationCenter'
};
```

## 🔌 Backend API 구조

### Cloudflare Workers API
```
https://api.languagemate.kr

├── /api/v1/auth/
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh
│   └── GET /oauth2/authorize/{provider}
│
├── /api/v1/users/
│   ├── GET /profile
│   ├── PATCH /profile
│   ├── POST /profile/image
│   └── DELETE /account
│
├── /api/v1/onboarding/
│   ├── POST /step/{step}
│   ├── GET /status
│   └── POST /complete
│
├── /api/v1/chat/
│   ├── GET /rooms
│   ├── POST /rooms
│   ├── GET /rooms/{roomId}/messages
│   └── DELETE /rooms/{roomId}
│
└── /ws (WebSocket - STOMP)
    ├── /topic/chat/{roomId}
    └── /user/queue/messages
```

### 신규 Cloudflare Workers API
```
https://api.languagemate.kr/edge

├── /api/v1/level-test/
│   ├── POST /start
│   ├── POST /submit-answer
│   ├── POST /analyze-speech
│   ├── GET /result
│   └── POST /evaluate-with-ai
│
├── /api/v1/sessions/
│   ├── GET /available
│   ├── POST /create
│   ├── POST /join/{sessionId}
│   ├── GET /{sessionId}/status
│   ├── POST /{sessionId}/toggle-language
│   └── DELETE /{sessionId}/leave
│
├── /api/v1/webrtc/
│   ├── POST /offer
│   ├── POST /answer
│   ├── POST /ice-candidate
│   ├── GET /turn-credentials
│   └── POST /signal
│
├── /api/v1/matching/
│   ├── GET /recommendations
│   ├── POST /calculate-compatibility
│   ├── GET /filters
│   └── POST /request
│
└── /api/v1/ai/
    ├── POST /analyze-conversation
    ├── POST /suggest-topics
    ├── POST /translate
    └── POST /correct-grammar
```

## 💾 데이터베이스 스키마

### Cloudflare D1 (SQLite)
```sql
-- 사용자 테이블
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50),
  provider_id VARCHAR(255),
  english_name VARCHAR(100),
  native_language VARCHAR(10),
  target_language VARCHAR(10),
  current_level VARCHAR(10),
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 레벨테스트 결과 (NEW)
CREATE TABLE level_test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  speaking_score INT,
  listening_score INT,
  reading_score INT,
  writing_score INT,
  overall_level VARCHAR(10),
  ai_feedback TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 세션 테이블 (NEW)
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255),
  host_id INTEGER NOT NULL,
  session_type ENUM('audio', 'video'),
  max_participants INT DEFAULT 4,
  scheduled_at TIMESTAMP,
  duration_minutes INT,
  language_rotation JSON,
  status ENUM('waiting', 'active', 'completed'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id)
);

-- 세션 참가자 (NEW)
CREATE TABLE session_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  speaking_time_seconds INT DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 매칭 요청 (NEW)
CREATE TABLE matching_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  compatibility_score FLOAT,
  status ENUM('pending', 'accepted', 'rejected'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP NULL,
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (target_id) REFERENCES users(id)
);
```

### Workers KV 캐시 구조
```javascript
// 사용자 온라인 상태 (Workers KV)
"user:online:{userId}": {
  status: "online|away|offline",
  lastSeen: timestamp
}

// 세션 실시간 정보
"session:active:{sessionId}": {
  participants: [userId1, userId2],
  currentLanguage: "en|ko",
  startedAt: timestamp,
  nextRotation: timestamp
}

// 타이핑 상태
"typing:{roomId}:{userId}": {
  isTyping: boolean,
  timestamp: timestamp
}
```

## 🚀 Cloudflare Workers 구조

### 1. Workers 프로젝트 구조
```
cloudflare-workers/
├── src/
│   ├── handlers/
│   │   ├── levelTest.js       # 레벨테스트 핸들러
│   │   ├── session.js         # 세션 관리
│   │   ├── webrtc.js          # WebRTC 시그널링
│   │   └── ai.js              # AI 처리
│   │
│   ├── durable-objects/
│   │   ├── SessionRoom.js     # 세션룸 상태 관리
│   │   ├── WebRTCSignaling.js # WebRTC 연결 관리
│   │   └── TestSession.js     # 테스트 세션 관리
│   │
│   ├── utils/
│   │   ├── auth.js            # 인증 헬퍼
│   │   ├── ai-client.js       # OpenAI/Claude API
│   │   └── media.js           # 미디어 처리
│   │
│   └── index.js               # 메인 라우터
│
├── wrangler.toml              # Cloudflare 설정
└── package.json
```

### 2. Durable Objects 설계
```javascript
// SessionRoom - 세션 상태 관리
export class SessionRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.participants = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/join':
        return this.handleJoin(request);
      case '/leave':
        return this.handleLeave(request);
      case '/signal':
        return this.handleSignal(request);
      case '/toggle-language':
        return this.handleLanguageToggle(request);
    }
  }

  async handleJoin(request) {
    const { userId, offer } = await request.json();
    // WebRTC 연결 설정
    // 참가자 추가
    // 다른 참가자에게 알림
  }

  async handleLanguageToggle() {
    // 언어 전환 타이머 관리
    // 모든 참가자에게 브로드캐스트
  }
}
```

### 3. AI 통합 (Workers AI)
```javascript
// 레벨테스트 AI 평가
export async function evaluateSpeech(audioBlob, env) {
  // Whisper API로 음성 인식
  const transcription = await env.AI.run(
    '@cf/openai/whisper',
    { audio: audioBlob }
  );

  // GPT로 문법 및 유창성 평가
  const evaluation = await env.AI.run(
    '@cf/meta/llama-2-7b',
    {
      prompt: `Evaluate the following English speech: ${transcription}
      Score the following aspects (0-100):
      - Grammar accuracy
      - Vocabulary usage
      - Pronunciation clarity
      - Fluency`
    }
  );

  return {
    transcription,
    scores: evaluation,
    level: calculateLevel(evaluation)
  };
}
```

## 🔄 WebRTC 구현 전략

### 1. 시그널링 서버 (Cloudflare Durable Objects)
```javascript
// WebRTC 시그널링 플로우
class WebRTCSignaling {
  async handleOffer(peerId, offer) {
    // SDP offer 저장
    await this.state.storage.put(`offer:${peerId}`, offer);
    
    // 타겟 피어에게 전달
    this.broadcast({
      type: 'offer',
      from: peerId,
      offer: offer
    });
  }

  async handleAnswer(peerId, answer) {
    // SDP answer 처리
    await this.state.storage.put(`answer:${peerId}`, answer);
    
    // 연결 완료 처리
    this.notifyPeer(peerId, {
      type: 'answer',
      answer: answer
    });
  }

  async handleIceCandidate(peerId, candidate) {
    // ICE candidate 교환
    this.broadcast({
      type: 'ice-candidate',
      from: peerId,
      candidate: candidate
    });
  }
}
```

### 2. TURN 서버 설정
```javascript
// Cloudflare Calls TURN 크레덴셜
export async function getTurnCredentials(env) {
  const response = await env.CALLS.getTURNCredentials();
  
  return {
    urls: [
      'turn:turn.cloudflare.com:3478',
      'turn:turn.cloudflare.com:3478?transport=tcp'
    ],
    username: response.username,
    credential: response.credential
  };
}
```

## 📊 모니터링 및 분석

### 1. 성능 지표
```javascript
// Web Vitals 추적
const metrics = {
  LCP: 2.5,  // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift
  TTFB: 800  // Time to First Byte
};

// 세션 품질 지표
const sessionMetrics = {
  videoQuality: 'HD|SD|LD',
  audioQuality: 'excellent|good|poor',
  latency: 50, // ms
  packetLoss: 0.1, // %
  jitter: 5 // ms
};
```

### 2. 사용자 행동 분석
```javascript
// 학습 패턴 추적
const learningAnalytics = {
  dailyStudyTime: 45, // minutes
  sessionsCompleted: 12,
  languageProgress: {
    speaking: 75,
    listening: 80,
    reading: 70,
    writing: 65
  },
  partnerInteractions: 28,
  streakDays: 7
};
```

## 🔐 보안 고려사항

### 1. 인증 및 권한
- JWT 기반 인증 (RS256)
- Refresh Token Rotation
- OAuth2.0 (Naver, Google)
- Session-based WebRTC 인증

### 2. 데이터 보호
- E2E 암호화 (WebRTC)
- HTTPS/WSS 전용
- PII 마스킹
- GDPR 준수

### 3. Rate Limiting
```javascript
// Cloudflare Rate Limiting
const rateLimits = {
  api: '100 requests per minute',
  websocket: '1000 messages per minute',
  webrtc: '10 connections per user',
  ai: '50 requests per hour'
};
```

## 📈 확장성 전략

### 1. 수평 확장
- Cloudflare Workers: 자동 스케일링
- Durable Objects: 지역 샤딩 및 세션 파티셔닝
- Workers KV: 글로벌 캐시 분산
- D1 Read Replicas (Preview): 읽기 부하 분산

### 2. 성능 최적화
- CDN 캐싱 (Cloudflare)
- 이미지 최적화 (WebP, AVIF)
- Code Splitting (React)
- Lazy Loading
- Service Worker 캐싱

### 3. 글로벌 배포
```
Regions:
- Primary Data: Cloudflare D1 (asia-northeast)
- Edge: Cloudflare Global Network (275+ PoPs)
- Backup: Durable Object failover (Tokyo, Singapore)
```

## 🎯 다음 단계

1. **즉시 구현 필요** (Priority 1)
   - 레벨테스트 시스템
   - WebRTC 세션 기능
   - AI 평가 엔진

2. **단기 구현** (Priority 2)
   - 매칭 알고리즘
   - 실시간 알림
   - 학습 통계

3. **장기 구현** (Priority 3)
   - 고급 분석
   - 게임화 요소
   - 소셜 기능
