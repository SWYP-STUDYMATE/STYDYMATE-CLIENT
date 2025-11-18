# 2025-01-18: Whisper 실시간 자막 에러 패턴

## 🐛 문제 현상

실시간 자막 기능이 작동하지 않고 `"[Error transcribing chunk]"` 또는 `"🔄 [부분 전사 오류]"` 메시지가 표시됨.

### 로그 증상

```
📤 [useRealtimeTranscription] 오디오 청크 전송 시작 {blobSize: 4153, language: 'auto'}
📥 [useRealtimeTranscription] API 응답 수신 {status: 200, statusText: '', ok: true}
✅ [useRealtimeTranscription] 전사 결과 수신 {hasText: true, textLength: 26}
```

- API 응답은 200 OK
- 하지만 실제 텍스트는 `"[Error transcribing chunk]"` (26글자)
- 화면에 에러 메시지가 자막으로 표시됨

## 🔍 근본 원인

### 1️⃣ Workers AI 서비스 에러 처리 문제

**파일**: `workers/src/services/ai.ts:62`

```typescript
// ❌ 잘못된 패턴
} catch (error) {
    log.error('Whisper chunk processing error', error);
    return { text: '[Error transcribing chunk]', word_count: 0 }; // ❌
}
```

**문제점**:
- Whisper API 호출 실패 시 에러를 throw하지 않고 fallback 텍스트 반환
- HTTP 응답은 200 OK로 반환되어 프론트엔드는 성공으로 인식
- 에러 메시지가 실제 자막으로 화면에 표시됨

### 2️⃣ 오디오 청크 크기 문제

**파일**: `src/hooks/useRealtimeTranscription.js:176-178`

```javascript
// ❌ 문제 있던 설정
const options = {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 16000  // ❌ 너무 낮은 비트레이트
};

// ❌ 너무 짧은 청크 지속 시간
chunkDuration = 2000  // 2초
```

**문제점**:
- 비트레이트: 16 kbps (너무 낮음)
- 2초 오디오 = 4 KB (Whisper가 처리하기엔 너무 작음)
- Whisper 권장: 최소 64 kbps, 1초 이상 오디오

### 3️⃣ 에러 메시지 필터링 부재

프론트엔드에서 에러 메시지를 정상 텍스트로 처리하여 화면에 표시

## ✅ 해결 방법

### 1️⃣ Workers AI 에러 처리 개선

**파일**: `workers/src/services/ai.ts:62`

```typescript
// ✅ 개선된 패턴
} catch (error) {
    console.error('❌ [AI Service] Whisper 청크 처리 실패', { error });
    log.error('Whisper chunk processing error', error as Error, {
        component: 'AI_SERVICE',
        chunkSize: audioChunk.byteLength,
        options
    });
    // ✅ 에러를 상위로 전파하여 HTTP 500 반환
    throw new Error(`Whisper transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
```

**효과**:
- 에러 발생 시 HTTP 500 반환
- 프론트엔드가 에러를 명확히 인식
- 에러 메시지가 자막으로 표시되지 않음

### 2️⃣ 오디오 품질 개선

**파일**: `src/hooks/useRealtimeTranscription.js`

```javascript
// ✅ 개선된 설정
export function useRealtimeTranscription({
  language = 'auto',
  chunkDuration = 3000, // ✅ 2초 → 3초 (안정성 향상)
  onTranscript,
  onError
} = {}) {
  // ...
}

// ✅ 비트레이트 증가
const options = {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 64000 // ✅ 16 kbps → 64 kbps (Whisper 권장)
};

// ✅ 최소 청크 크기 체크
if (blobSize < 5120) {
  console.warn('⚠️ 청크가 너무 작아 무시', { blobSizeKB: Math.round(blobSize / 1024) });
  processingRef.current = false;
  return;
}
```

**효과**:
- 청크 크기: 4 KB → 24 KB (6배 증가)
- 오디오 품질: 16 kbps → 64 kbps (4배 증가)
- 청크 지속 시간: 2초 → 3초
- 너무 작은 청크 자동 필터링

### 3️⃣ 에러 메시지 필터링 추가

**파일**: `src/hooks/useRealtimeTranscription.js:97-116`

```javascript
// ✅ 에러 메시지 필터링
const errorPatterns = [
  '[Error transcribing chunk]',
  '🔄',
  '[청크 전사 오류]',
  '[부분 전사 오류]',
  'Error transcribing',
  'transcription failed'
];

const isErrorMessage = errorPatterns.some(pattern =>
  transcriptText?.toLowerCase().includes(pattern.toLowerCase())
);

if (isErrorMessage) {
  console.warn('⚠️ [useRealtimeTranscription] 에러 메시지 감지 - 무시', { text: transcriptText });
  return; // 에러 메시지는 자막으로 표시하지 않음
}

// ✅ 의미 있는 텍스트만 처리 (최소 3글자 이상)
const trimmedText = transcriptText?.trim() || '';
const meaningfulText = trimmedText.replace(/\s+/g, '');

if (trimmedText && meaningfulText.length >= 3) {
  // 자막 표시
}
```

**효과**:
- 에러 메시지 자동 필터링
- 빈 텍스트 및 의미 없는 응답 무시
- 최소 3글자 이상 텍스트만 자막으로 표시

## 📊 성능 비교

### 수정 전
- 비트레이트: 16 kbps
- 청크 크기: ~4 KB (2초)
- 에러 발생 시: 에러 메시지 화면 표시
- Whisper 성공률: 낮음

### 수정 후
- 비트레이트: 64 kbps (4배 증가)
- 청크 크기: ~24 KB (3초, 6배 증가)
- 에러 발생 시: HTTP 500 + 에러 메시지 필터링
- Whisper 성공률: 높음 (예상)

## 🧪 테스트 가이드

### 1. 로컬 테스트

```bash
cd /Users/minhan/Desktop/public-repo/studymate/STYDYMATE-CLIENT
npm run dev
```

### 2. VideoSessionRoom 접속

1. 브라우저에서 `http://localhost:3000/session/[roomId]` 접속
2. 카메라/마이크 권한 허용
3. 자막 버튼 클릭 (활성화)
4. 마이크에 대고 말하기

### 3. 로그 확인

**개발자 도구 → Console**:

```
✅ 성공 시:
📤 [useRealtimeTranscription] 오디오 청크 전송 시작 {blobSize: 24000, ...}
📥 [useRealtimeTranscription] API 응답 수신 {status: 200, ok: true}
✅ [useRealtimeTranscription] 전사 결과 수신 {hasText: true, textLength: 50, ...}

⚠️ 청크 너무 작음:
⚠️ [useRealtimeTranscription] 청크가 너무 작아 무시 {blobSizeKB: 3, minSizeKB: 5}

❌ 에러 발생:
❌ [useRealtimeTranscription] API 응답 실패 {status: 500, ...}
```

### 4. 자막 확인

- 화면 하단에 실시간 자막이 표시되어야 함
- `"[Error transcribing chunk]"` 메시지가 **보이지 않아야** 함
- 의미 있는 텍스트만 자막으로 표시

## 🔄 추가 개선 사항 (선택)

### VAD 필터 조정

만약 여전히 문제가 발생한다면, VAD (Voice Activity Detection) 필터 비활성화:

```javascript
// useRealtimeTranscription.js:46
formData.append('vad_filter', 'false'); // true → false
```

### 샘플링 레이트 확인

MediaRecorder가 16 kHz로 녹음하는지 확인:

```javascript
recorder.onstart = () => {
  console.log('🎙️ MediaRecorder 시작', {
    mimeType: recorder.mimeType,
    audioBitsPerSecond: recorder.audioBitsPerSecond,
    state: recorder.state,
    stream: recorder.stream.getAudioTracks()[0].getSettings()
  });
};
```

## 📝 관련 파일

### 수정된 파일
1. `/workers/src/services/ai.ts` - Workers AI 에러 처리
2. `/src/hooks/useRealtimeTranscription.js` - 오디오 품질 및 에러 필터링

### 관련 문서
- `/docs/04-api/api.md` - Whisper API 명세
- `/docs/07-backend/backend.md` - Workers AI 아키텍처

## 🎓 교훈

1. **에러를 숨기지 말 것**: Fallback 텍스트 반환보다 명확한 에러 전파
2. **오디오 품질 중요**: Whisper는 최소 64 kbps, 1초 이상 오디오 권장
3. **프론트엔드 방어 코딩**: 에러 메시지 필터링, 최소 크기 검증
4. **로깅 강화**: 디버깅을 위한 상세한 로그 필수

## ✅ 해결 상태

- [x] Workers AI 에러 처리 개선
- [x] 오디오 비트레이트 증가 (16 kbps → 64 kbps)
- [x] 청크 지속 시간 증가 (2초 → 3초)
- [x] 에러 메시지 필터링 추가
- [x] 최소 청크 크기 검증
- [ ] 실제 환경 테스트 대기

## 🚀 다음 단계

1. Workers 백엔드 배포
2. 프론트엔드 빌드 및 배포
3. 실제 환경에서 테스트
4. 성능 모니터링 (Whisper API 호출 성공률)
5. 필요 시 추가 조정 (VAD 필터, 샘플링 레이트 등)
