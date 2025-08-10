# STUDYMATE Workers API

Cloudflare Workers로 구축된 STUDYMATE 백엔드 API 서비스입니다.

## 기능

- **레벨 테스트**: Whisper AI를 사용한 음성 인식 및 LLM 기반 언어 능력 평가
- **LLM 텍스트 생성**: 다양한 LLM 모델을 사용한 텍스트 생성 및 채팅
- **WebRTC**: Durable Objects를 사용한 실시간 화상/음성 통화
- **파일 업로드**: R2 스토리지를 사용한 파일 저장
- **이미지 처리**: Cloudflare Images를 사용한 이미지 최적화 및 변환

## API 엔드포인트

### 레벨 테스트 API

#### 오디오 제출
```http
POST /api/level-test/audio
Content-Type: multipart/form-data

Form Data:
- audio: File (webm/wav)
- questionId: string
- userId: string
```

#### 결과 분석
```http
POST /api/level-test/analyze
Content-Type: application/json

{
  "userId": "string",
  "responses": [
    {
      "questionId": "string"
    }
  ]
}
```

#### 결과 조회
```http
GET /api/level-test/result/:userId
```

### LLM API

#### 텍스트 생성
```http
POST /api/llm/generate
Content-Type: application/json

{
  "prompt": "string",
  "model": "string (optional)",
  "maxTokens": number (optional),
  "temperature": number (optional),
  "stream": boolean (optional)
}
```

#### 채팅 완성
```http
POST /api/llm/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "system|user|assistant",
      "content": "string"
    }
  ],
  "model": "string (optional)",
  "maxTokens": number (optional),
  "temperature": number (optional)",
  "stream": boolean (optional)
}
```

#### 사용 가능한 모델 목록
```http
GET /api/llm/models
```

#### 배치 처리
```http
POST /api/llm/batch
Content-Type: application/json

{
  "prompts": ["string", "string", ...],
  "model": "string (optional)",
  "maxTokens": number (optional)",
  "temperature": number (optional)"
}
```

### 이미지 API (Cloudflare Images)

#### 이미지 업로드
```http
POST /api/images/upload
Content-Type: multipart/form-data

Form Data:
- image: File (이미지 파일)
- metadata: JSON string (optional)
- requireSignedURLs: boolean (optional)
```

또는 Base64 형식:
```http
POST /api/images/upload
Content-Type: application/json

{
  "image": "base64_string",
  "filename": "image.png",
  "metadata": {},
  "requireSignedURLs": false
}
```

#### 직접 업로드 URL 생성
```http
POST /api/images/direct-upload
Content-Type: application/json

{
  "expiry": "2024-12-31T23:59:59Z" (optional),
  "metadata": {} (optional),
  "requireSignedURLs": false (optional)
}
```

#### 이미지 목록 조회
```http
GET /api/images/list?page=1&per_page=20
```

#### 이미지 상세 정보
```http
GET /api/images/:imageId
```

#### Signed URL 생성
```http
POST /api/images/:imageId/signed-url
Content-Type: application/json

{
  "variant": "public" (optional),
  "expiry": 3600 (optional, seconds)
}
```

#### 이미지 삭제
```http
DELETE /api/images/:imageId
```

#### 프로필 이미지 업로드
```http
POST /api/images/profile/upload
Content-Type: multipart/form-data
X-User-Id: user123

Form Data:
- image: File (이미지 파일)
```

#### 외부 이미지 변환 프록시
```http
GET /api/images/transform?url=https://example.com/image.jpg&w=800&h=600&q=85&f=webp

Parameters:
- url: 원본 이미지 URL (required)
- w: 너비 (optional)
- h: 높이 (optional)
- fit: scale-down|contain|cover|crop|pad (optional)
- q: 품질 0-100 (optional)
- f: 포맷 auto|avif|webp (optional)
```

### WebRTC API

#### 룸 생성
```http
POST /api/room/create
Content-Type: application/json

{
  "roomId": "string",
  "userId": "string"
}
```

#### 룸 참가
```http
POST /api/room/join
Content-Type: application/json

{
  "roomId": "string",
  "userId": "string"
}
```

## 사용 가능한 AI 모델

### LLM 모델
- `@cf/meta/llama-3-8b-instruct` (기본값)
- `@cf/meta/llama-2-7b-chat-int8`
- `@cf/mistral/mistral-7b-instruct-v0.1`
- `@cf/meta/codellama-7b-instruct-awq`

### 음성 인식 모델
- `@cf/openai/whisper-large-v3-turbo`

### 임베딩 모델
- `@cf/baai/bge-base-en-v1.5`

## 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- Wrangler CLI
- Cloudflare 계정

### 설치
```bash
npm install
```

### 환경 변수 설정

#### Secret 설정 (Cloudflare Images)
```bash
# Cloudflare Images API 사용을 위한 시크릿 설정
wrangler secret put CF_ACCOUNT_ID
wrangler secret put CF_IMAGES_API_TOKEN  
wrangler secret put CF_ACCOUNT_HASH
```

#### wrangler.toml 설정
`wrangler.toml` 파일에서 다음 설정을 확인하세요:

```toml
name = "studymate-workers"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[ai]]
binding = "AI"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "studymate-storage"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[[durable_objects.bindings]]
name = "ROOM"
class_name = "WebRTCRoom"

[vars]
ENVIRONMENT = "development"
CORS_ORIGIN = "http://localhost:3000"
```

### 개발 서버 실행
```bash
npm run dev
```

### 배포
```bash
npm run deploy
```

## 기술 스택

- **Cloudflare Workers**: 서버리스 엣지 컴퓨팅
- **Workers AI**: LLM, Whisper, 임베딩 모델
- **Durable Objects**: WebRTC 상태 관리
- **R2 Storage**: 파일 저장
- **KV Storage**: 캐싱 및 세션 데이터
- **Hono**: 경량 웹 프레임워크
- **TypeScript**: 타입 안정성

## 라이선스

MIT License

## API Reference (v1)

- 베이스 URL: `https://workers.languagemate.kr/api/v1`
- 헬스체크: `GET https://workers.languagemate.kr/health`

### 레벨 테스트 `/level-test`
- `GET /questions` 질문 목록
- `POST /audio` 단일 질문 업로드 전사
  - form: `audio`(File), `questionId`, `userId`
- `POST /submit` 단일 질문 제출(권장)
  - form: `audio`(File), `questionNumber`(1..N), `userId`
- `POST /complete` 완료/평가 `{ userId }`
- `GET /result/:userId` 결과 조회
- `GET /audio/:userId/:questionId` 오디오 다운로드
- `GET /progress/:userId` 진행 상황

예시
```bash
curl -X POST https://workers.languagemate.kr/api/v1/level-test/submit \
  -F "audio=@answer.webm" -F "questionNumber=1" -F "userId=user123"
```

### Whisper STT `/whisper`
- `POST /transcribe` 오디오 전사 (multipart/JSON/raw 지원)
- `GET /languages` 지원 언어
- `GET /models` 모델 정보

예시
```bash
curl -X POST https://workers.languagemate.kr/api/v1/whisper/transcribe \
  -F "audio=@speech.mp3" -F "language=auto" -F "task=transcribe"
```

### 실시간 전사 `/transcribe`
- `GET /stream` WebSocket 스트림 (초기 설정 메시지 후 PCM 바이너리 전송)
- `POST /` 일반 전사(JSON)

초기 설정 메시지
```json
{ "type": "config", "language": "en", "model": "whisper-large-v3-turbo", "enableTranslation": true, "targetLanguages": ["ko","ja"] }
```

### 번역 `/translate`
- `POST /translate` 단건 번역 `{ text, target, source? }`
- `POST /translate/batch` 다건 번역(최대 10개)
- `POST /translate/subtitle` 자막 번역(문맥 포함)
- `GET /languages` 지원 언어

예시
```bash
curl -X POST https://workers.languagemate.kr/api/v1/translate/translate \
  -H 'Content-Type: application/json' -d '{"text":"안녕하세요","target":"en"}'
```

### LLM `/llm`
- `POST /generate` 프롬프트/메시지 기반 생성(스트리밍 지원)
- `POST /evaluate-english` 영어 평가(JSON)
- `POST /check-grammar` 문법 체크(JSON)
- `POST /conversation-feedback` 대화 피드백(JSON)
- `GET /models` 사용 가능한 모델

예시
```bash
curl -X POST https://workers.languagemate.kr/api/v1/llm/generate \
  -H 'Content-Type: application/json' -d '{"prompt":"Write a haiku about learning English."}'
```

### WebRTC 룸 `/room`
- `POST /create` 룸 생성 → 응답에 `websocketUrl`/`joinUrl`
- `POST /:roomId/join` 참가 `{ userId, userName }`
- `POST /:roomId/leave` 퇴장 `{ userId }`
- `GET /:roomId/ws` 시그널 WebSocket (쿼리 `userId`,`userName`)
- `PATCH /:roomId/settings` 설정 변경
- `GET /:roomId/info` 룸 정보
- `GET /list` 목록(관리자)

### 업로드(R2) `/upload` (인증: Bearer)
- `POST /audio` 오디오 업로드 (form `file`, `folder?`)
- `POST /image` 이미지 업로드 (form `file`, `type?=profile|chat|general`)
- `POST /video` 비디오 업로드 (form `file`)
- `GET /file/*` 파일 제공 (`?download=true` 지원)
- `DELETE /file/*` 파일 삭제
- `POST /presigned-url` 프리사인드 업로드 정보(placeholder)

예시
```bash
curl -X POST https://workers.languagemate.kr/api/v1/upload/image \
  -H 'Authorization: Bearer <JWT>' \
  -F 'file=@avatar.png' -F 'type=profile'
```

### 이미지 유틸 `/images`
- `POST /upload`, `GET /transform/*`, `GET /serve/*`, `DELETE /:fileName`,
  `GET /list/:userId`, `GET /info/:fileName`

### 캐시 관리 `/cache` (내부/관리)
- `GET /stats`, `POST /invalidate`, `POST /warm`, `GET /get/:key`, `POST /set`, `POST /session/refresh`

### 애널리틱스 `/analytics` (보호됨: Bearer)
- `GET /metrics`, `GET /dashboard`, `GET /stream`(WS), `GET /errors`, `GET /ai-usage`, `GET /performance`