# STUDYMATE Workers API Reference (v1)

이 문서는 Cloudflare Workers 기반 백엔드 API 전체를 초심자도 이해할 수 있도록 상세히 설명합니다. 각 엔드포인트별로 요청 방법, 필요한 헤더/바디, 실제 예시(curl), 성공/에러 응답, 그리고 프론트엔드에서 어디서 사용하는지까지 포함합니다.

- 프로덕션 도메인: `https://api.languagemate.kr`
- API 베이스 경로: `/api/v1`
- 헬스체크: `GET https://api.languagemate.kr/health`

## 공통 규칙

- 인증
  - Bearer JWT 필요: 업로드(`/upload/*`), 일부 전사(REST `/transcribe`), 애널리틱스(`/analytics/*`)
    - 요청 헤더: `Authorization: Bearer <JWT>`
  - 내부 관리 키: 캐시(`/cache/*`)
    - 요청 헤더: `X-API-Key: <INTERNAL_SECRET>` (또는 `x-api-key`)
- 콘텐츠 타입
  - JSON: `Content-Type: application/json`
  - 파일 업로드: `multipart/form-data`
  - WebSocket: `Upgrade: websocket`
- CORS
  - 프로덕션: `CORS_ORIGIN = https://languagemate.kr,https://www.languagemate.kr`
  - 로컬 개발: `http://localhost:3000`
- 표준 응답 형태
  - 성공
    {
      "success": true,
      "data": {},
      "meta": { "timestamp": "2025-01-01T00:00:00.000Z", "requestId": "..." }
    }
  - 에러
    {
      "success": false,
      "error": { "message": "설명", "code": "ERROR_CODE", "details": {} },
      "meta": { "timestamp": "2025-01-01T00:00:00.000Z", "requestId": "..." }
    }

---

## 0) 시스템/메타

### GET /health
- 설명: 런타임 상태 확인
- 인증: 불필요
- 요청 예시
  curl -s https://api.languagemate.kr/health
- 성공 응답 예시
  {
    "success": true,
    "data": {
      "status": "healthy",
      "environment": "production",
      "version": "v1",
      "services": {
        "ai": "operational",
        "storage": "operational",
        "cache": "operational",
        "durableObjects": "operational"
      }
    },
    "meta": { "timestamp": "...", "requestId": "..." }
  }
- 프론트 사용 위치: 상태 점검/배포 확인용(전용 페이지 없음)

---

## 1) 레벨 테스트 Level Test
- 베이스: `/api/v1/level-test`
- 프론트 사용: `src/pages/LevelTest/*` (특히 `LevelTestRecording.jsx`, `LevelTestComplete.jsx`), API 헬퍼 `src/api/levelTest.js`

### GET /questions
- 설명: 질문 목록 조회
- 인증: 불필요
- 응답 예시(요약)
  {
    "success": true,
    "data": {
      "questions": [
        { "id": 1, "text": "Introduce yourself.", "korean": "자기소개...", "duration": 60, "difficulty": "A1-A2" }
      ]
    }
  }

### POST /submit
- 설명: 단일 질문 오디오 업로드 및 전사(권장 플로우)
- 인증: 불필요
- Content-Type: `multipart/form-data`
- 폼 필드: `audio`(File), `questionNumber`(1..N), `userId`
- 요청 예시
  curl -X POST https://api.languagemate.kr/api/v1/level-test/submit \
    -F "audio=@answer.webm" -F "questionNumber=1" -F "userId=user123"
- 성공 응답 예시
  {
    "success": true,
    "data": { "questionNumber": 1, "transcription": "My name is...", "saved": true },
    "meta": { "timestamp": "...", "requestId": "..." }
  }

### POST /complete
- 설명: 제출한 답변들을 종합해 레벨 평가/피드백 생성
- 인증: 불필요
- Body(JSON): `{ "userId": "user123" }`
- 요청 예시
  curl -X POST https://api.languagemate.kr/api/v1/level-test/complete \
    -H 'Content-Type: application/json' \
    -d '{"userId":"user123"}'
- 성공 응답 예시(요약)
  {
    "success": true,
    "data": {
      "userId": "user123",
      "level": "B1",
      "overallScore": 68,
      "scores": {"grammar":70,"vocabulary":65,"fluency":68,"pronunciation":66,"coherence":67,"interaction":70},
      "feedback": "...",
      "evaluations": [
        { "questionNumber": 1, "question": "...", "transcription": "...", "evaluation": { "scores": {"grammar":70}, "suggestions": ["..."] } }
      ],
      "timestamp": "..."
    }
  }

### 기타
- GET `/progress/:userId`, GET `/result/:userId`, GET `/audio/:userId/:questionId` 제공
- (레거시) POST `/audio`, POST `/submit-all`, POST `/analyze` 존재 — 신규 플로우에서는 `/submit` + `/complete` 권장
- 에러 예시
  { "success": false, "error": { "message": "Missing required fields", "code": "VALIDATION_ERROR" } }

---

## 2) Whisper(비실시간 전사)
- 베이스: `/api/v1/whisper`
- 프론트 사용: 업로드 기반 전사(개발/운영 도구)

### POST /transcribe
- 설명: 업로드된 오디오를 전사
- 인증: 불필요
- 방식 A: `multipart/form-data`
  - 필수: `audio`(File)
  - 선택: `language`(en/ko/auto), `task`(transcribe|translate)
- 방식 B: JSON (Base64)
  - `{ "audio": "<base64>", "options": { "language": "auto", "task": "transcribe" } }`
- 성공 응답 예시
  {
    "success": true,
    "transcription": "Hello this is a test...",
    "word_count": 7,
    "words": [{"word":"Hello","start":0.0,"end":0.5}],
    "chunks_processed": 1,
    "language": "auto",
    "task": "transcribe"
  }

### GET /languages, GET /models
- 설명: 지원 언어/모델 목록

---

## 3) 실시간 전사(WS/REST)
- 베이스: `/api/v1/transcribe`
- 프론트 사용: `src/components/LiveTranscription.jsx`, `src/pages/Session/VideoSessionRoom.jsx`

### GET /stream (WebSocket)
- 설명: 16-bit PCM 오디오 청크 실시간 전송 → 전사(및 선택 번역) 메시지 수신
- 인증: 불필요
- 초기 설정 메시지(JSON 문자열)
  { "type": "config", "language": "en", "model": "whisper-large-v3-turbo", "enableTranslation": true, "targetLanguages": ["ko","ja"] }
- 서버가 보내는 메시지 예시
  {
    "type": "transcription",
    "text": "Nice to meet you",
    "language": "en",
    "words": [{"word":"Nice","start":0.0,"end":0.3}],
    "translations": {"ko":"반가워요"},
    "is_final": true,
    "timestamp": 1736200000000,
    "confidence": 0.95
  }

### POST /
- 설명: (REST) 파일/URL/베이스64 기반 전사
- 인증: 필요 (Bearer)
- Body(JSON) 예시
  { "audio_url": "https://.../sample.mp3", "language": "auto", "task": "transcribe", "word_timestamps": true }
- 성공 응답 예시
  { "success": true, "transcription": { "text": "...", "words": [], "chunks": 1 } }

---

## 4) 번역
- 베이스: `/api/v1/translate`
- 프론트 사용: 자막 번역/텍스트 번역 (`SubtitleDisplay.jsx` 등)

### POST /translate
- 설명: 단건 텍스트 번역
- 인증: 불필요
- Body(JSON): `{ "text": "안녕하세요", "target": "en", "source": "ko" }` (`source` 생략 시 자동감지)
- 요청 예시
  curl -X POST https://api.languagemate.kr/api/v1/translate/translate \
    -H 'Content-Type: application/json' \
    -d '{"text":"안녕하세요","target":"en"}'
- 성공 응답 예시
  {
    "success": true,
    "originalText": "안녕하세요",
    "translatedText": "Hello",
    "sourceLanguage": "ko",
    "targetLanguage": "en",
    "model": "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
  }

### POST /translate/batch
- 설명: 최대 10개 텍스트 일괄 번역
- Body(JSON): `{ "texts": ["문장1","문장2"], "target": "en" }`

### POST /translate/subtitle
- 설명: 실시간 자막/문맥 포함 번역
- Body(JSON): `{ "subtitle": { "text": "...", "language": "ko" }, "targetLanguage": "en", "context": ["이전 문장"] }`

### GET /languages
- 설명: 지원 언어 목록 (코드/표기/원어명)

---

## 5) LLM (생성/분석)
- 베이스: `/api/v1/llm`
- 프론트 사용: AI 보조 기능(문법, 피드백 등)

### POST /generate
- 설명: 프롬프트/대화 기반 텍스트 생성 (SSE 스트리밍 지원)
- Body(JSON): `prompt?` 또는 `messages?`(role/content 배열), `model?`, `temperature?`, `max_tokens?`, `stream?`
- 요청 예시
  curl -X POST https://api.languagemate.kr/api/v1/llm/generate \
    -H 'Content-Type: application/json' \
    -d '{"prompt":"Write a haiku about learning English."}'
- 성공 응답 예시
  {
    "success": true,
    "data": {
      "response": "...",
      "usage": {"prompt_tokens":12,"completion_tokens":256,"total_tokens":268},
      "model": "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
    }
  }

### POST /evaluate-english, /check-grammar, /conversation-feedback
- 설명: 영어 평가/문법 체크/대화 피드백을 JSON으로 반환

### GET /models
- 설명: 사용 가능한 모델/기능 목록

---

## 6) WebRTC 룸/시그널링
- 베이스: `/api/v1/room`
- 프론트 사용: `src/pages/Session/VideoSessionRoom.jsx`

### POST /create
- 설명: 룸 생성
- Body(JSON): `{ roomType?: "audio"|"video", maxParticipants?: number, metadata?: object }`
- 성공 응답(요약)
  {
    "success": true,
    "data": {
      "roomId": "...",
      "websocketUrl": "/api/v1/room/<id>/ws",
      "joinUrl": "/api/v1/room/<id>/join",
      "createdAt": "..."
    }
  }

### POST /:roomId/join
- 설명: 룸 참가
- Body(JSON): `{ userId, userName, userMetadata? }`
- 성공 응답: 시그널링 WS 접속용 `websocketUrl` 포함

### POST /:roomId/leave
- 설명: 퇴장 `{ userId }`

### GET /:roomId/ws (WebSocket)
- 설명: 시그널링 채널 (쿼리 `userId`, `userName` 필수)

### PATCH /:roomId/settings, GET /:roomId/info, GET /list(관리자)
- 에러 예시(정원 초과)
  { "success": false, "error": { "message": "Room is full", "code": "CONFLICT" } }

### [Internal] PATCH /api/v1/internal/webrtc/rooms/:roomId/metadata
- 설명: 레거시 서버가 세션 정보(title, scheduledAt, host 등)를 Workers 룸 메타데이터에 병합
- 인증: `X-Internal-Secret`
- Body 예시
  ```json
  {
    "sessionId": 123,
    "title": "Advanced Grammar Workshop",
    "scheduledAt": "2025-01-15T10:00:00",
    "durationMinutes": 45,
    "language": "en",
    "sessionStatus": "SCHEDULED",
    "hostName": "Jane",
    "sessionType": "video"
  }
  ```

---

## 7) 파일 업로드(R2)
- 베이스: `/api/v1/upload`
- 프론트 사용: 프로필/세션 업로드 UI 등

### 공통
- 인증: 필요 (Bearer JWT)
- 업로드는 모두 `multipart/form-data`로 `file` 필드 사용

### POST /audio
- form: `file`, `folder?`
- 성공 응답: `{ key, url, size, type, metadata? }`

### POST /image
- form: `file`, `type?=profile|chat|general`, `metadata?`
- 프로필 타입일 경우 썸네일/중간/대용량 `variants` URL 제공

### POST /video
- form: `file`

### GET /file/*
- 설명: 저장 파일 제공 (인라인/다운로드)
- 쿼리: `download=true` 시 첨부 다운로드

### DELETE /file/*
- 설명: 파일 삭제(소유자/관리자만)

### POST /presigned-url
- 설명: 프리사인드 업로드 정보(placeholder 응답)

- 요청 예시(이미지 업로드)
  curl -X POST https://api.languagemate.kr/api/v1/upload/image \
    -H 'Authorization: Bearer <JWT>' \
    -F 'file=@avatar.png' -F 'type=profile'

---

## 8) 이미지 유틸
- 베이스: `/api/v1/images`

- POST /upload (form: `image`, `userId`, `type?`)
- GET /transform/* (샘플 변환)
- GET /serve/* (원본/변환 제공)
- DELETE /:fileName (삭제)
- GET /list/:userId (사용자 이미지 목록)
- GET /info/:fileName (메타 조회)

---

## 9) 캐시 관리 (내부)
- 베이스: `/api/v1/cache`

- 인증: 내부 키 필요 `X-API-Key: <INTERNAL_SECRET>`
- GET /stats → 캐시 통계
- POST /invalidate → 패턴/범위 무효화
- POST /warm → 백그라운드 워밍
- GET /get/:key, POST /set → 단건 조회/설정
- POST /session/refresh → 세션 TTL 갱신

---

## 10) 애널리틱스 (보호됨)
- 베이스: `/api/v1/analytics`

- 인증: Bearer JWT 필요
- GET /metrics → 메트릭 집계
- GET /dashboard → 대시보드 데이터(요약/분포)
- GET /stream → 실시간 메트릭(WebSocket)
- GET /errors → 에러 통계
- GET /ai-usage → AI 사용량
- GET /performance → P50~P99 등 성능 요약

---

## 프론트엔드 페이지 매핑 요약
- 레벨 테스트 전 과정: `src/pages/LevelTest/*`, API 헬퍼 `src/api/levelTest.js`
- 실시간 세션/자막: `src/pages/Session/VideoSessionRoom.jsx`, `src/components/LiveTranscription.jsx`, `src/components/SubtitleDisplay.jsx`
- 업로드: 프로필/세션 관련 업로더(각 페이지 폼 → `/api/v1/upload/*`)
- 애널리틱스 대시보드: `src/components/AnalyticsDashboard.jsx` → `/api/v1/analytics/*`

## 자주 발생하는 에러
- 400 VALIDATION_ERROR: 필수 필드 누락 → 필드 확인
- 401 AUTH_ERROR: 인증 누락/만료 → Bearer 토큰 추가/갱신
- 403 FORBIDDEN: 권한 부족 → 역할/권한 확인
- 404 NOT_FOUND: 리소스 없음 → 식별자 확인
- 429 RATE_LIMIT_EXCEEDED: 너무 많은 요청 → 재시도 지연
- 500 INTERNAL_ERROR: 서버 오류 → 재시도, 지속 시 로그 확인

## 빠른 점검 명령 모음
curl -s https://api.languagemate.kr/health
curl -s https://api.languagemate.kr/api/v1/llm/models
curl -s https://api.languagemate.kr/api/v1/whisper/languages
