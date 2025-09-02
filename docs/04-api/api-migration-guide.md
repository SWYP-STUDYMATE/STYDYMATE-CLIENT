# API 마이그레이션 가이드

## 📋 개요
이 문서는 Cloudflare Workers API에서 Spring Boot API로의 마이그레이션 가이드입니다.

## 🔄 주요 변경사항

### 1. API 베이스 URL 변경
```javascript
// 이전 (Workers API)
const API_BASE_URL = import.meta.env.VITE_WORKERS_API_URL || 'http://localhost:8787';

// 현재 (Spring Boot)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.languagemate.kr';
```

### 2. 레벨 테스트 API 통합

#### 이전 방식 (Workers API)
```javascript
// 질문 조회
const questions = await getLevelTestQuestions();

// 개별 제출
const result = await submitLevelTest(audioBlob, questionNumber);

// 완료
const finalResult = await completeLevelTest(userId);
```

#### 새로운 방식 (Spring Boot)
```javascript
// 1. 테스트 시작 (필수)
const testData = await startLevelTest('en');
const testId = testData.testId;

// 2. 질문 조회
const questions = await getLevelTestQuestions(testId);

// 3. 음성 답변 제출
const result = await submitVoiceAnswer(testId, questionId, audioBlob);

// 4. 테스트 완료
const finalResult = await completeLevelTest(testId);

// 5. 결과 조회
const testResult = await getLevelTestResult(testId);
```

### 3. 인증 토큰 통일
```javascript
// 모든 API 호출에서 동일한 토큰 키 사용
headers: {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
}
```

## 📝 API 엔드포인트 매핑

### 레벨 테스트
| 기능 | Workers API | Spring Boot API |
|------|------------|----------------|
| 테스트 시작 | - | POST `/api/v1/level-test/start` |
| 질문 조회 | GET `/api/v1/level-test/questions` | GET `/api/v1/level-test/{testId}` |
| 음성 제출 | POST `/api/v1/level-test/submit` | POST `/api/v1/level-test/{testId}/audio-answer` |
| 테스트 완료 | POST `/api/v1/level-test/complete` | POST `/api/v1/level-test/{testId}/complete` |
| 결과 조회 | GET `/api/v1/level-test/result/{userId}` | GET `/api/v1/level-test/{testId}` |
| 음성 테스트 시작 | - | POST `/api/v1/level-test/voice/start` |
| 음성 분석 | - | POST `/api/v1/level-test/voice/{testId}/analyze` |

### 온보딩
| 기능 | 이전 | 현재 |
|------|------|------|
| 단계 저장 | POST `/api/v1/onboarding/step1` | POST `/api/v1/onboarding/steps/1/save` |
| 현재 단계 조회 | - | GET `/api/v1/onboarding/steps/current` |
| 단계 건너뛰기 | - | POST `/api/v1/onboarding/steps/{stepNumber}/skip` |
| 완료 | POST `/api/v1/onboarding/complete` | POST `/api/v1/onboarding/complete` |

## 🔧 에러 처리 표준화

### 통합 에러 처리
```javascript
import { handleApiError, getUserFriendlyMessage } from '../utils/errorHandler';
import { useAlert } from '../hooks/useAlert';

// 컴포넌트에서 사용
const { showError, showSuccess } = useAlert();

try {
  const result = await apiCall();
  showSuccess('작업이 완료되었습니다.');
} catch (error) {
  const message = getUserFriendlyMessage(error);
  showError(message);
}
```

### 도메인별 에러 처리
```javascript
// 온보딩 에러
import { handleOnboardingError } from '../utils/errorHandler';

try {
  await saveOnboardingStep(1, data);
} catch (error) {
  handleOnboardingError(error, 1);
}

// 레벨 테스트 에러
import { handleLevelTestError } from '../utils/errorHandler';

try {
  await startLevelTest('en');
} catch (error) {
  handleLevelTestError(error, 'start');
}
```

## 🚀 마이그레이션 체크리스트

### 즉시 적용 필요
- [x] API 베이스 URL 환경변수 수정
- [x] 인증 토큰 키 통일 (`accessToken`)
- [x] 온보딩 엔드포인트 경로 수정
- [x] 레벨 테스트 API 함수 교체

### 점진적 개선
- [x] 에러 처리 표준화
- [x] 재시도 로직 구현
- [ ] 로딩 상태 관리 개선
- [ ] 캐싱 전략 구현

## 📚 관련 파일

### 수정된 파일
- `/src/api/config.js` - API 설정 중앙화
- `/src/api/levelTest.js` - Spring Boot API 전환
- `/src/api/onboarding.js` - 엔드포인트 수정
- `/src/utils/errorHandler.js` - 통합 에러 처리
- `/src/store/levelTestStore.js` - Spring Boot API 적용

### 새로 생성된 파일
- `/src/api/config.js` - 통합 API 설정
- `/docs/04-api/api-migration-guide.md` - 이 문서

## 🔍 테스트 방법

### 1. 레벨 테스트 플로우
```bash
# 개발 서버 실행
npm run dev

# 테스트 경로
1. /level-test/start 접속
2. 테스트 시작 버튼 클릭
3. 마이크 권한 허용
4. 각 질문에 답변 녹음
5. 결과 확인
```

### 2. API 호출 모니터링
```javascript
// 브라우저 콘솔에서
localStorage.setItem('DEBUG_API', 'true');

// Network 탭에서 확인할 사항
- Request URL이 올바른지
- Authorization 헤더가 있는지
- Response 형식이 예상과 일치하는지
```

## ⚠️ 주의사항

1. **테스트 ID 관리**: Spring Boot API는 모든 레벨 테스트 작업에 testId가 필요합니다.
2. **순차적 호출**: 테스트 시작 → 질문 조회 → 답변 제출 → 완료 순서를 지켜야 합니다.
3. **토큰 만료**: 401 에러 시 자동으로 토큰 갱신이 시도됩니다.
4. **파일 업로드**: FormData 사용 시 Content-Type 헤더를 설정하지 마세요.

## 📞 문제 해결

### 404 에러
- 엔드포인트 URL 확인
- API 버전 경로 확인 (`/api/v1/`)
- 서버 배포 상태 확인

### CORS 에러
- 서버의 CORS 설정 확인
- 프록시 설정 확인 (개발 환경)

### 인증 에러
- 토큰 존재 여부 확인
- 토큰 형식 확인 (`Bearer` 접두사)
- 토큰 만료 시간 확인

## 🎯 완료 상태

### 완료된 작업 (2025-01-19)
- ✅ API 설정 파일 통합
- ✅ 레벨 테스트 API Spring Boot 전환
- ✅ 에러 처리 표준화
- ✅ 온보딩 API 경로 수정
- ✅ Store 파일 업데이트

### 남은 작업
- ⏳ 전체 테스트 및 검증
- ⏳ 성능 모니터링 구현
- ⏳ 에러 트래킹 서비스 연동