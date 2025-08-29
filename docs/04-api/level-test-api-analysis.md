# 레벨 테스트 API 설계 검토 및 최적화 방안

## 📊 현재 API 구조 분석

### Cloudflare Workers API 엔드포인트

#### 기본 정보
- **Base URL**: Workers 환경
- **인증**: JWT Bearer Token
- **파일 스토리지**: Cloudflare R2
- **캐싱**: Cloudflare KV Store
- **음성 인식**: Cloudflare AI (Whisper)
- **언어 평가**: Cloudflare AI (LLM)

#### 현재 엔드포인트 목록

```typescript
// 1. 질문 목록 조회
GET /level-test/questions
Response: { questions: Array<Question> }

// 2. 개별 음성 제출 (권장)
POST /level-test/submit
Body: FormData { audio: File, questionNumber: string, userId: string }
Response: { questionNumber, transcription, saved }

// 3. 테스트 완료 및 평가
POST /level-test/complete
Body: { userId: string }
Response: { level, scores, feedback, evaluations }

// 4. 결과 조회
GET /level-test/result/:userId
Response: { level, scores, feedback, timestamp }

// 5. 진행 상황 조회
GET /level-test/progress/:userId
Response: { completedQuestions, totalQuestions, answers }

// 6. 음성 파일 다운로드
GET /level-test/audio/:userId/:questionId
Response: Audio file stream

// 7. 음성 업로드 (직접)
POST /level-test/audio
Body: FormData { audio: File, questionId: string, userId: string }
Response: { questionId, transcription, audioUrl }

// 8. 전체 테스트 제출 (백업용)
POST /level-test/submit-all
Body: FormData with multiple audio files
Response: Complete evaluation result
```

### 프론트엔드 API 클라이언트 현황

```javascript
// 현재 구현된 함수들
- getLevelTestQuestions()     // 질문 목록 조회
- submitLevelTest()          // 개별 음성 제출
- completeLevelTest()        // 테스트 완료
- getLevelTestResult()       // 결과 조회
- getLevelTestProgress()     // 진행 상황 조회
```

## 🎯 현재 API 구조의 장단점 분석

### ✅ 장점

1. **단계별 처리 구조**
   - 질문별 개별 제출로 사용자 경험 향상
   - 진행 상황 추적 가능
   - 실시간 피드백 제공

2. **확장성**
   - Cloudflare Workers의 글로벌 분산 처리
   - R2 스토리지로 대용량 오디오 파일 처리
   - KV Store 캐싱으로 빠른 응답

3. **신뢰성**
   - 개별 질문별 저장으로 데이터 손실 최소화
   - 진행 상황 캐싱으로 세션 복구 가능
   - 백업 엔드포인트 제공

4. **AI 통합**
   - Whisper를 통한 정확한 음성 인식
   - LLM을 통한 상세한 언어 평가
   - 다중 평가 항목 (발음, 유창성, 문법, 어휘, 일관성, 상호작용)

### ⚠️ 단점 및 개선점

1. **API 일관성 문제**
   - 엔드포인트 URL 패턴 불일치 (`/level-test/` vs `/api/level-test/`)
   - 프론트엔드에서 잘못된 엔드포인트 호출 (POST로 GET 엔드포인트 호출)

2. **에러 처리 부족**
   - 일관된 에러 응답 구조 없음
   - HTTP 상태 코드 표준화 필요
   - 클라이언트 에러 처리 개선 필요

3. **인증 처리 불일치**
   - 토큰 키 불일치 (`accessToken` vs `token`)
   - 일부 엔드포인트에서 인증 누락

4. **상태 관리 복잡성**
   - 프론트엔드 스토어와 API 상태 동기화 문제
   - 캐싱 전략 불명확

## 🚀 최적화 방안 제시

### 1. API 구조 표준화

#### 통일된 URL 패턴
```typescript
Base: /api/v1/level-test

GET    /api/v1/level-test/questions           // 질문 목록
POST   /api/v1/level-test/sessions            // 테스트 세션 시작
POST   /api/v1/level-test/submissions         // 음성 제출
POST   /api/v1/level-test/sessions/:id/complete // 테스트 완료
GET    /api/v1/level-test/sessions/:id/progress // 진행 상황
GET    /api/v1/level-test/results/:userId     // 결과 조회
GET    /api/v1/level-test/audio/:userId/:questionId // 오디오 파일
DELETE /api/v1/level-test/sessions/:id        // 세션 삭제
```

#### 표준 응답 구조
```typescript
// 성공 응답
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

// 에러 응답
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
  meta: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

// 페이지네이션 응답
interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### 2. 향상된 세션 관리

#### 세션 기반 아키텍처
```typescript
// 테스트 세션 생성
POST /api/v1/level-test/sessions
Body: { userId: string, testType?: 'full' | 'quick' }
Response: {
  sessionId: string,
  questions: Question[],
  expiresAt: string,
  settings: TestSettings
}

// 세션 상태 조회
GET /api/v1/level-test/sessions/:sessionId
Response: {
  sessionId: string,
  status: 'active' | 'completed' | 'expired',
  progress: SessionProgress,
  submissions: Submission[]
}
```

### 3. 개선된 에러 처리 전략

#### 표준 에러 코드
```typescript
enum LevelTestErrorCodes {
  // 일반 에러
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // 파일 관련 에러
  INVALID_AUDIO_FORMAT = 'INVALID_AUDIO_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  
  // 처리 관련 에러
  TRANSCRIPTION_FAILED = 'TRANSCRIPTION_FAILED',
  EVALUATION_FAILED = 'EVALUATION_FAILED',
  ANALYSIS_IN_PROGRESS = 'ANALYSIS_IN_PROGRESS',
  
  // 비즈니스 로직 에러
  INSUFFICIENT_SUBMISSIONS = 'INSUFFICIENT_SUBMISSIONS',
  TEST_ALREADY_COMPLETED = 'TEST_ALREADY_COMPLETED',
  QUESTION_NOT_FOUND = 'QUESTION_NOT_FOUND'
}
```

#### 클라이언트 에러 처리 개선
```typescript
// API 클라이언트 래퍼
class LevelTestAPIClient {
  private handleError(error: any): never {
    if (error.response?.data?.error) {
      const { code, message, details } = error.response.data.error;
      
      switch (code) {
        case 'SESSION_EXPIRED':
          // 세션 만료 - 새 세션 시작
          this.startNewSession();
          break;
        case 'TRANSCRIPTION_FAILED':
          // 음성 인식 실패 - 재시도 옵션 제공
          throw new TranscriptionError(message, details);
        case 'INVALID_AUDIO_FORMAT':
          // 잘못된 파일 형식
          throw new ValidationError(message, 'audioFile');
        default:
          throw new APIError(code, message, details);
      }
    }
    
    throw error;
  }
}
```

### 4. 실시간 상태 업데이트

#### WebSocket 통합
```typescript
// WebSocket 이벤트
interface LevelTestEvents {
  'transcription:start': { questionId: string };
  'transcription:progress': { questionId: string, progress: number };
  'transcription:complete': { questionId: string, result: TranscriptionResult };
  'evaluation:start': { sessionId: string };
  'evaluation:complete': { sessionId: string, result: EvaluationResult };
  'session:expired': { sessionId: string };
}
```

### 5. 보안 및 인증 강화

#### 인증 표준화
```typescript
// JWT 토큰 검증 미들웨어
const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token required'
      }
    }, 401);
  }
  
  try {
    const payload = await verifyJWT(token);
    c.set('userId', payload.userId);
    c.set('userRole', payload.role);
    await next();
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    }, 401);
  }
};
```

#### 레이트 리미팅
```typescript
// API 레이트 제한
const rateLimiter = {
  'POST /api/v1/level-test/submissions': {
    windowMs: 60000, // 1분
    max: 10,         // 최대 10회
    message: 'Too many submissions'
  },
  'POST /api/v1/level-test/sessions': {
    windowMs: 3600000, // 1시간
    max: 5,            // 최대 5회
    message: 'Too many test sessions'
  }
};
```

### 6. 성능 최적화

#### 지능형 캐싱 전략
```typescript
// 캐시 레이어
const cacheStrategy = {
  questions: {
    key: 'level-test:questions',
    ttl: 86400,     // 24시간
    tags: ['questions']
  },
  transcription: {
    key: 'transcription:{userId}:{questionId}',
    ttl: 3600,      // 1시간
    tags: ['transcription', 'user:{userId}']
  },
  evaluation: {
    key: 'evaluation:{sessionId}',
    ttl: 2592000,   // 30일
    tags: ['evaluation', 'user:{userId}']
  }
};
```

#### 배치 처리 최적화
```typescript
// 병렬 음성 처리
const processBatchSubmissions = async (submissions: AudioSubmission[]) => {
  const results = await Promise.allSettled(
    submissions.map(submission => 
      processAudioWithRetry(submission, { maxRetries: 3 })
    )
  );
  
  return results.map((result, index) => ({
    submissionId: submissions[index].id,
    status: result.status,
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }));
};
```

## 🔧 구현 우선순위

### Phase 1: 기본 구조 정리 (High Priority)
1. ✅ API 엔드포인트 URL 표준화
2. ✅ 일관된 응답 구조 적용
3. ✅ 에러 처리 개선
4. ✅ 인증 토큰 통일

### Phase 2: 사용자 경험 개선 (Medium Priority)
1. 🔄 실시간 상태 업데이트
2. 🔄 진행률 표시 개선
3. 🔄 오프라인 지원
4. 🔄 세션 복구 기능

### Phase 3: 고급 기능 (Low Priority)
1. 📝 WebSocket 실시간 통신
2. 📝 배치 처리 최적화
3. 📝 고급 캐싱 전략
4. 📝 분석 및 모니터링

## 📝 권장사항

### 즉시 적용 가능한 개선사항
1. **프론트엔드 API 클라이언트 수정**
   - 올바른 엔드포인트 URL 사용
   - 일관된 토큰 키 사용 (`accessToken` 통일)
   - 에러 처리 로직 개선

2. **Workers API 응답 표준화**
   - 모든 엔드포인트에서 동일한 응답 구조 사용
   - HTTP 상태 코드 표준화
   - 에러 메시지 일관성 확보

3. **세션 관리 개선**
   - 세션 ID 기반 상태 관리
   - 만료 시간 명확화
   - 진행 상황 실시간 동기화

### 장기적 개선 방향
1. **마이크로서비스 아키텍처 고려**
   - 음성 처리, 평가, 결과 저장 분리
   - 독립적인 스케일링 가능

2. **AI 처리 최적화**
   - 음성 전처리 개선
   - 평가 알고리즘 고도화
   - 개인화된 피드백 제공

3. **글로벌 확장성**
   - 다국어 지원 구조
   - 지역별 최적화
   - 컴플라이언스 준수

이러한 최적화를 통해 사용자 경험을 크게 개선하고 시스템의 안정성과 확장성을 확보할 수 있을 것입니다.