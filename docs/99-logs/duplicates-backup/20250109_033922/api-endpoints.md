# API 엔드포인트 명세

## Base URLs
- **Production**: `https://api.languagemate.kr/api/v1`
- **Workers AI**: `https://workers.languagemate.kr/api/v1`
- **WebSocket**: `wss://api.languagemate.kr/ws`

## 🔐 인증 API

### 소셜 로그인
```http
GET /login/oauth2/code/naver
GET /login/oauth2/code/google
```

### 토큰 관리
```http
POST /auth/refresh
Body: {
  "refreshToken": "string"
}
Response: {
  "accessToken": "string",
  "refreshToken": "string"
}
```

## 👤 사용자 API

### 사용자 정보
```http
POST /user/english-name
Body: {
  "englishName": "string"
}

POST /user/birthyear
Body: {
  "birthYear": number
}

POST /user/birthday
Body: {
  "birthDay": "MM-DD"
}

POST /user/location
Body: {
  "locationId": number
}

GET /user/locations
Response: [{
  "locationId": number,
  "country": "string",
  "city": "string",
  "timezone": "string"
}]

POST /user/profile-image
Content-Type: multipart/form-data
Body: file

POST /user/introduction
Body: {
  "intro": "string"
}

GET /user/complete-profile
Response: {
  "userId": "uuid",
  "englishName": "string",
  "profileImage": "string",
  "intro": "string",
  "location": {...}
}
```

## 🎯 온보딩 API

### 언어 설정
```http
GET /onboard/language/languages
Response: [{
  "languageId": number,
  "name": "string",
  "code": "string"
}]

POST /onboard/language/native-language
Body: {
  "nativeLanguageId": number
}

POST /onboard/language/language-level
Body: {
  "languageId": number,
  "currentLevelId": number,
  "targetLevelId": number
}

GET /onboard/language/level-types-language
GET /onboard/language/level-types-partner
```

### 관심사 설정
```http
GET /onboard/interest/motivations
GET /onboard/interest/topics
GET /onboard/interest/learning-styles
GET /onboard/interest/learning-expectations

POST /onboard/interest/motivation
Body: { "motivationId": number }

POST /onboard/interest/topic
Body: { "topicId": number }

POST /onboard/interest/learning-style
Body: { "learningStyleId": number }

POST /onboard/interest/learning-expectation
Body: { "learningExpectationId": number }
```

### 파트너 선호도
```http
GET /onboard/partner/personalities
GET /onboard/partner/group-sizes

POST /onboard/partner/personality
Body: { "partnerPersonalityId": number }

POST /onboard/partner/group-size
Body: { "groupSizeId": number }
```

### 스케줄 설정
```http
GET /onboard/schedule/schedules

POST /onboard/schedule/schedule
Body: { "scheduleId": number }
```

## 🎤 레벨 테스트 API

### 레벨 테스트 (Workers AI)
```http
POST /leveltest/voice/transcribe
Content-Type: multipart/form-data
Body: audio file
Response: {
  "transcript": "string"
}

POST /leveltest/evaluate
Body: {
  "transcript": "string",
  "language": "string",
  "questions": {}
}
Response: {
  "evaluation": {
    "cefrLevel": "A1-C2",
    "overallScore": number,
    "pronunciation": number,
    "fluency": number,
    "grammar": number,
    "vocabulary": number,
    "strengths": [],
    "weaknesses": [],
    "recommendations": []
  }
}
```

## 🤝 매칭 API

### 파트너 찾기
```http
GET /matching/partners
Query: {
  "page": number,
  "size": number,
  "language": "string",
  "level": "string"
}

POST /matching/request
Body: {
  "targetUserId": "uuid",
  "message": "string"
}

POST /matching/accept/{matchId}
POST /matching/reject/{matchId}
```

## 💬 채팅 API

### 채팅방 관리
```http
GET /chat/rooms
Response: [{
  "roomId": "string",
  "roomName": "string",
  "participants": [],
  "lastMessage": {},
  "unreadCount": number
}]

POST /chat/rooms
Body: {
  "roomName": "string",
  "roomType": "DIRECT|GROUP",
  "participantIds": []
}

GET /chat/rooms/{roomId}/messages
Query: {
  "page": number,
  "size": number
}
```

### 메시지 전송 (WebSocket)
```javascript
// STOMP 연결
CONNECT /ws

// 구독
SUBSCRIBE /user/queue/messages
SUBSCRIBE /topic/chat/{roomId}

// 전송
SEND /app/chat/send
{
  "roomId": "string",
  "content": "string",
  "type": "TEXT|IMAGE"
}
```

## 📹 화상 통화 API

### 세션 관리
```http
POST /session/create
Body: {
  "partnerId": "uuid",
  "sessionType": "VIDEO|AUDIO",
  "scheduledAt": "ISO-8601"
}

GET /session/list
Query: {
  "status": "SCHEDULED|ONGOING|COMPLETED"
}

POST /session/{sessionId}/start
POST /session/{sessionId}/end
```

### WebRTC 시그널링 (WebSocket)
```javascript
// ICE Candidate
SEND /app/webrtc/ice
{
  "sessionId": "string",
  "candidate": {...}
}

// Offer/Answer
SEND /app/webrtc/offer
SEND /app/webrtc/answer
{
  "sessionId": "string",
  "sdp": {...}
}
```

## 🤖 AI 피드백 API (Workers)

### 실시간 피드백
```http
POST /feedback/realtime
Body: {
  "transcript": "string",
  "context": "string",
  "userLevel": "string"
}
Response: {
  "feedback": {
    "corrections": [],
    "suggestions": [],
    "encouragement": "string",
    "fluencyScore": number
  }
}
```

### 학습 추천
```http
POST /recommendations/generate
Body: {
  "userLevel": "string",
  "weaknesses": {}
}
Response: {
  "recommendedContents": [],
  "practiceExercises": [],
  "estimatedTimePerDay": "string",
  "focusAreas": []
}
```

## 📊 분석 API

### 학습 통계
```http
GET /analytics/summary
Response: {
  "totalSessions": number,
  "totalHours": number,
  "currentStreak": number,
  "levelProgress": {}
}

GET /analytics/weekly
Response: {
  "weekData": [{
    "date": "string",
    "minutes": number,
    "sessions": number
  }]
}
```

## 🔔 알림 API

### 알림 관리
```http
GET /notifications
Query: {
  "unreadOnly": boolean
}

POST /notifications/{id}/read
POST /notifications/read-all
```

## ⚙️ 설정 API

### 계정 설정
```http
GET /settings/account
PUT /settings/account

GET /settings/privacy
PUT /settings/privacy

GET /settings/notifications
PUT /settings/notifications

DELETE /account
Body: {
  "password": "string",
  "reason": "string"
}
```

## 📝 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "ISO-8601"
}
```

## 🔑 인증 헤더
```http
Authorization: Bearer {accessToken}
```

## 📄 페이지네이션
```json
{
  "content": [],
  "page": {
    "size": 20,
    "number": 0,
    "totalElements": 100,
    "totalPages": 5
  }
}
```