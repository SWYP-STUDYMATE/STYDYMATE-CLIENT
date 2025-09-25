# API 상세 명세서

## 📌 문서 정보
- **작성일**: 2025년 8월 8일
- **버전**: 1.0.0
- **대상**: Frontend/Backend 개발자

## 🔷 Cloudflare Workers API (확장 필요)

### 1. 매칭 시스템 API (NEW)

#### GET /api/v1/matching/partners
파트너 목록 조회
```javascript
// Request
GET /api/v1/matching/partners?page=0&size=20&targetLanguage=en&minLevel=B1

// Response
{
  "content": [
    {
      "userId": 123,
      "englishName": "John",
      "profileImage": "https://...",
      "nativeLanguage": "en",
      "targetLanguage": "ko",
      "level": "B2",
      "interests": ["Technology", "Travel"],
      "compatibilityScore": 85,
      "lastActive": "2025-08-08T10:00:00Z",
      "studyGoals": "Business English",
      "timezone": "America/New_York"
    }
  ],
  "totalElements": 45,
  "totalPages": 3,
  "currentPage": 0
}
```

#### POST /api/v1/matching/request
매칭 요청 보내기
```javascript
// Request
{
  "targetUserId": 123,
  "message": "Hi! I'd love to practice Korean with you."
}

// Response
{
  "requestId": 456,
  "status": "pending",
  "createdAt": "2025-08-08T10:00:00Z"
}
```

#### POST /api/v1/matching/respond/{requestId}
매칭 요청 응답
```javascript
// Request
{
  "accept": true,
  "message": "Great! Let's start learning together."
}

// Response
{
  "requestId": 456,
  "status": "accepted",
  "chatRoomId": 789,
  "respondedAt": "2025-08-08T10:05:00Z"
}
```

### 2. 세션 관리 API (NEW)

#### GET /api/v1/sessions
세션 목록 조회
```javascript
// Response
{
  "upcoming": [
    {
      "sessionId": "ses_123",
      "title": "English Conversation Practice",
      "hostName": "Sarah",
      "type": "video",
      "scheduledAt": "2025-08-08T14:00:00Z",
      "duration": 30,
      "participants": 3,
      "maxParticipants": 4,
      "languages": ["en", "ko"],
      "level": "B1-B2"
    }
  ],
  "ongoing": [],
  "completed": []
}
```

#### POST /api/v1/sessions
세션 생성
```javascript
// Request
{
  "title": "Korean Practice Session",
  "type": "audio",
  "scheduledAt": "2025-08-08T15:00:00Z",
  "duration": 30,
  "maxParticipants": 4,
  "languages": ["ko", "en"],
  "languageRotation": {
    "ko": 15,
    "en": 15
  },
  "levelRange": ["A2", "B1"],
  "description": "Casual conversation practice"
}

// Response
{
  "sessionId": "ses_124",
  "joinUrl": "https://app.languagemate.kr/sessions/ses_124",
  "status": "scheduled"
}
```

### 3. 알림 API (NEW)

#### GET /api/v1/notifications
알림 목록 조회
```javascript
// Response
{
  "unreadCount": 3,
  "notifications": [
    {
      "id": 1,
      "type": "matching_request",
      "title": "New matching request",
      "message": "John wants to be your language partner",
      "data": {
        "userId": 123,
        "requestId": 456
      },
      "read": false,
      "createdAt": "2025-08-08T09:00:00Z"
    },
    {
      "id": 2,
      "type": "session_reminder",
      "title": "Session starting soon",
      "message": "Your session starts in 15 minutes",
      "data": {
        "sessionId": "ses_123"
      },
      "read": false,
      "createdAt": "2025-08-08T09:45:00Z"
    }
  ]
}
```

#### POST /api/v1/notifications/read
알림 읽음 처리
```javascript
// Request
{
  "notificationIds": [1, 2, 3]
}

// Response
{
  "updated": 3
}
```

## 🔶 Cloudflare Workers API (신규)

### 1. 레벨테스트 API

#### POST /edge/api/v1/level-test/start
레벨테스트 시작
```javascript
// Request
{
  "userId": 123,
  "testType": "full" // full | speaking | quick
}

// Response
{
  "testId": "test_abc123",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "category": "grammar",
      "question": "Choose the correct form:",
      "text": "I ___ to the store yesterday.",
      "options": ["go", "went", "gone", "going"],
      "timeLimit": 30
    },
    {
      "id": 2,
      "type": "speaking",
      "category": "pronunciation",
      "prompt": "Read the following sentence aloud:",
      "text": "The weather is particularly beautiful today.",
      "recordingTime": 20
    }
  ],
  "totalQuestions": 4,  // quick 테스트: 4개, full 테스트: 20개
  "estimatedTime": 15
}
```

#### POST /edge/api/v1/level-test/submit-answer
답변 제출
```javascript
// Request
{
  "testId": "test_abc123",
  "questionId": 1,
  "answer": "went",
  "timeSpent": 12
}

// Response
{
  "correct": true,
  "nextQuestion": 2
}
```

#### POST /edge/api/v1/level-test/analyze-speech
음성 분석
```javascript
// Request (multipart/form-data)
{
  "testId": "test_abc123",
  "questionId": 2,
  "audio": <audio_blob>
}

// Response
{
  "transcription": "The weather is particularly beautiful today",
  "scores": {
    "pronunciation": 85,
    "fluency": 78,
    "accuracy": 92,
    "intonation": 80
  },
  "feedback": "Good pronunciation! Work on connecting words more smoothly.",
  "issues": [
    {
      "word": "particularly",
      "issue": "stress pattern",
      "suggestion": "par-TIC-u-lar-ly"
    }
  ]
}
```

#### GET /edge/api/v1/level-test/result/{testId}
테스트 결과 조회
```javascript
// Response
{
  "testId": "test_abc123",
  "completedAt": "2025-08-08T10:30:00Z",
  "overallLevel": "B1",
  "cefr": "B1",
  "scores": {
    "speaking": {
      "score": 72,
      "level": "B1",
      "strengths": ["clear pronunciation", "good vocabulary"],
      "improvements": ["fluency", "complex sentences"]
    },
    "listening": {
      "score": 78,
      "level": "B2"
    },
    "reading": {
      "score": 80,
      "level": "B2"
    },
    "writing": {
      "score": 68,
      "level": "B1"
    }
  },
  "recommendations": [
    "Focus on speaking practice with native speakers",
    "Study phrasal verbs and idioms",
    "Practice writing essays on various topics"
  ],
  "suggestedPartners": [
    {
      "userId": 456,
      "name": "Emma",
      "matchReason": "Similar level, complementary schedule"
    }
  ]
}
```

### 2. WebRTC 시그널링 API

#### POST /edge/api/v1/webrtc/room/create
WebRTC 룸 생성
```javascript
// Request
{
  "sessionId": "ses_123",
  "type": "video", // video | audio
  "maxParticipants": 4
}

// Response
{
  "roomId": "room_xyz789",
  "signalUrl": "wss://edge.languagemate.kr/signal/room_xyz789",
  "turnServers": [
    {
      "urls": ["turn:turn.cloudflare.com:3478"],
      "username": "temp_user",
      "credential": "temp_pass"
    }
  ]
}
```

#### WebSocket /signal/room_{roomId}
WebRTC 시그널링 (WebSocket)
```javascript
// Client -> Server: Join
{
  "type": "join",
  "userId": 123,
  "userName": "John"
}

// Server -> Client: Joined
{
  "type": "joined",
  "participants": [
    {
      "userId": 123,
      "userName": "John",
      "peerId": "peer_123"
    }
  ]
}

// Client -> Server: Offer
{
  "type": "offer",
  "to": "peer_456",
  "sdp": "v=0\r\no=- ..."
}

// Server -> Client: Answer
{
  "type": "answer",
  "from": "peer_456",
  "sdp": "v=0\r\no=- ..."
}

// Client -> Server: ICE Candidate
{
  "type": "ice-candidate",
  "to": "peer_456",
  "candidate": {
    "candidate": "candidate:...",
    "sdpMLineIndex": 0,
    "sdpMid": "0"
  }
}
```

### 3. AI 처리 API

#### POST /edge/api/v1/ai/conversation-analysis
대화 분석
```javascript
// Request
{
  "sessionId": "ses_123",
  "transcript": [
    {
      "speaker": "user_123",
      "text": "Hello, how are you today?",
      "timestamp": "00:00:01",
      "language": "en"
    },
    {
      "speaker": "user_456",
      "text": "I'm fine, thank you. And you?",
      "timestamp": "00:00:04",
      "language": "en"
    }
  ]
}

// Response
{
  "analysis": {
    "user_123": {
      "grammarScore": 100,
      "vocabularyLevel": "A2",
      "fluencyScore": 85,
      "mistakes": [],
      "suggestions": ["Try using more varied greetings"]
    },
    "user_456": {
      "grammarScore": 100,
      "vocabularyLevel": "A2",
      "fluencyScore": 90,
      "mistakes": [],
      "suggestions": []
    }
  },
  "conversation": {
    "naturalness": 85,
    "topicVariety": "low",
    "engagement": "high",
    "suggestions": [
      "Try discussing hobbies or interests",
      "Ask follow-up questions"
    ]
  }
}
```

#### POST /edge/api/v1/ai/topic-suggestion
대화 주제 추천
```javascript
// Request
{
  "participants": [
    {
      "userId": 123,
      "level": "B1",
      "interests": ["technology", "travel"]
    },
    {
      "userId": 456,
      "level": "B2",
      "interests": ["music", "travel"]
    }
  ],
  "previousTopics": ["introductions", "weather"]
}

// Response
{
  "topics": [
    {
      "title": "Travel Experiences",
      "level": "B1-B2",
      "questions": [
        "What was your most memorable trip?",
        "Which country would you like to visit next?",
        "Do you prefer traveling alone or with others?"
      ],
      "vocabulary": ["destination", "itinerary", "accommodation", "sightseeing"]
    },
    {
      "title": "Technology in Daily Life",
      "level": "B1-B2",
      "questions": [
        "How has technology changed your daily routine?",
        "What's your favorite app and why?",
        "Do you think we rely too much on technology?"
      ],
      "vocabulary": ["device", "application", "digital", "innovation"]
    }
  ]
}
```

#### POST /edge/api/v1/ai/grammar-correction
문법 교정
```javascript
// Request
{
  "text": "I have went to the store yesterday and buyed some foods.",
  "level": "B1"
}

// Response
{
  "original": "I have went to the store yesterday and buyed some foods.",
  "corrected": "I went to the store yesterday and bought some food.",
  "corrections": [
    {
      "error": "have went",
      "correction": "went",
      "type": "verb_tense",
      "explanation": "Use simple past tense for completed actions with 'yesterday'"
    },
    {
      "error": "buyed",
      "correction": "bought",
      "type": "irregular_verb",
      "explanation": "'Buy' is an irregular verb: buy-bought-bought"
    },
    {
      "error": "foods",
      "correction": "food",
      "type": "uncountable_noun",
      "explanation": "'Food' is generally uncountable unless referring to types of food"
    }
  ],
  "score": 60,
  "level": "A2"
}
```

## 🔄 WebSocket 이벤트

### 채팅 WebSocket (기존)
```javascript
// STOMP over WebSocket
const stompClient = Stomp.over(new SockJS('/ws'));

// 구독
stompClient.subscribe('/topic/chat/room_123', (message) => {
  const data = JSON.parse(message.body);
  // 메시지 처리
});

// 전송
stompClient.send('/app/chat/send', {}, JSON.stringify({
  roomId: 'room_123',
  message: 'Hello!',
  type: 'text'
}));
```

### 세션 WebSocket (신규)
```javascript
// 세션 상태 업데이트
stompClient.subscribe('/topic/session/ses_123', (message) => {
  const data = JSON.parse(message.body);
  switch(data.type) {
    case 'language_change':
      // 언어 전환
      break;
    case 'participant_joined':
      // 참가자 입장
      break;
    case 'timer_update':
      // 타이머 업데이트
      break;
  }
});
```

## 📊 에러 코드 정의

### HTTP 상태 코드
```javascript
const errorCodes = {
  // 4xx Client Errors
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  
  // 5xx Server Errors
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
};
```

### 커스텀 에러 코드
```javascript
const customErrors = {
  // Auth
  'AUTH001': 'Invalid token',
  'AUTH002': 'Token expired',
  'AUTH003': 'Insufficient permissions',
  
  // Level Test
  'TEST001': 'Test already completed',
  'TEST002': 'Invalid test ID',
  'TEST003': 'Audio file too large',
  
  // Session
  'SES001': 'Session full',
  'SES002': 'Session already started',
  'SES003': 'Not a participant',
  
  // WebRTC
  'RTC001': 'Connection failed',
  'RTC002': 'Media permissions denied',
  'RTC003': 'Peer disconnected',
  
  // Matching
  'MATCH001': 'Already matched',
  'MATCH002': 'Request expired',
  'MATCH003': 'User blocked'
};
```

## 🔐 인증 헤더

### JWT 토큰 형식
```javascript
// Request Header
{
  "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// JWT Payload
{
  "sub": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "exp": 1723123200,
  "iat": 1723119600,
  "roles": ["USER", "PREMIUM"]
}
```

### API Key (Cloudflare Workers)
```javascript
// Request Header
{
  "X-API-Key": "cf_key_abc123xyz",
  "X-User-Token": "jwt_token_here"
}
```

## 📈 Rate Limiting

### API 제한
```javascript
const rateLimits = {
  // 일반 API
  'GET': '100 requests/minute',
  'POST': '50 requests/minute',
  
  // 특수 엔드포인트
  '/api/v1/level-test/analyze-speech': '10 requests/minute',
  '/api/v1/ai/*': '30 requests/hour',
  '/api/v1/webrtc/*': '20 requests/minute',
  
  // WebSocket
  'websocket_messages': '100 messages/minute',
  'websocket_connections': '5 concurrent connections'
};
```

## 🧪 테스트 환경

### Development
```
API: http://localhost:8080
WebSocket: ws://localhost:8080/ws
Edge API: http://localhost:8787
```

### Staging
```
API: https://api-staging.languagemate.kr
WebSocket: wss://api-staging.languagemate.kr/ws
Edge API: https://edge-staging.languagemate.kr
```

### Production
```
API: https://api.languagemate.kr
WebSocket: wss://api.languagemate.kr/ws
Edge API: https://edge.languagemate.kr
```
