# STUDYMATE Workers Backend

Cloudflare Workers 기반 백엔드 서비스

## 주요 기능

### 1. AI 서비스
- **Whisper 음성인식**: 레벨 테스트 음성 분석
- **LLM 텍스트 생성**: 언어 레벨 평가 및 피드백
- **텍스트 임베딩**: 유사도 계산

### 2. WebRTC 통화
- **Cloudflare Calls**: 화상/음성 통화 인프라
- **Durable Objects**: 룸 상태 관리
- **최대 4명 지원**: 1:1 및 그룹 통화

### 3. 파일 저장
- **R2 Storage**: 오디오/비디오 파일 저장
- **Cloudflare Images**: 프로필 이미지 처리
- **KV Storage**: 세션 데이터 캐싱

## 설치 및 실행

```bash
# 의존성 설치
cd workers
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 배포
npm run deploy

# 스테이징 배포
npm run deploy:staging
```

## 환경 설정

1. Cloudflare 계정 생성
2. `wrangler.toml`에 account_id 설정
3. 필요한 서비스 활성화:
   - Workers AI
   - R2 Storage
   - Durable Objects
   - KV Namespace

## API 엔드포인트

### 레벨 테스트
- `POST /api/level-test/audio` - 음성 파일 제출
- `POST /api/level-test/analyze` - AI 분석
- `GET /api/level-test/result/:id` - 결과 조회

### WebRTC 시그널링
- `POST /api/room/create` - 룸 생성
- `POST /api/room/:id/join` - 룸 참가
- `POST /api/room/:id/signal` - 시그널링

### 파일 업로드
- `POST /api/upload/audio` - 오디오 업로드
- `POST /api/upload/image` - 이미지 업로드

## 아키텍처

```
├── src/
│   ├── index.ts           # 메인 엔트리
│   ├── routes/           
│   │   ├── levelTest.ts   # 레벨 테스트 API
│   │   ├── webrtc.ts      # WebRTC 시그널링
│   │   └── upload.ts      # 파일 업로드
│   ├── services/
│   │   ├── ai.ts          # Workers AI 서비스
│   │   ├── storage.ts     # R2/KV 스토리지
│   │   └── calls.ts       # Cloudflare Calls
│   ├── durable/
│   │   └── WebRTCRoom.ts  # Durable Object
│   └── utils/
│       ├── cors.ts        # CORS 설정
│       └── auth.ts        # 인증 헬퍼
```