# STUDYMATE Workers API

Cloudflare Workers로 구축된 STUDYMATE 백엔드 API 서비스입니다.

## 기능

- **레벨 테스트**: Whisper AI를 사용한 음성 인식 및 LLM 기반 언어 능력 평가
- **LLM 텍스트 생성**: 다양한 LLM 모델을 사용한 텍스트 생성 및 채팅
- **WebRTC**: Durable Objects를 사용한 실시간 화상/음성 통화
- **파일 업로드**: R2 스토리지를 사용한 파일 저장

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