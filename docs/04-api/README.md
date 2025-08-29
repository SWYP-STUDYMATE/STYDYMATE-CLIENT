# STUDYMATE API 문서

## 📚 문서 목록

### 레벨 테스트 API
- 📄 **[API 설계 검토 및 최적화 방안](./level-test-api-analysis.md)** - 현재 API 구조 분석과 개선 방안
- 📋 **[OpenAPI 명세서](./level-test-openapi.yml)** - 표준 API 스펙 문서
- 🔧 **[개선된 API 클라이언트](./improved-api-client.js)** - 에러 처리와 재시도 로직이 포함된 클라이언트
- 📱 **[프론트엔드 통합 가이드](./frontend-integration-guide.md)** - 컴포넌트별 구현 가이드

## 🎯 주요 개선사항

### 1. 현재 문제점 해결
- ✅ API 엔드포인트 URL 표준화
- ✅ 일관된 에러 응답 구조
- ✅ 인증 토큰 키 통일 (`accessToken`)
- ✅ HTTP 메서드 올바른 사용

### 2. 사용자 경험 개선
- 🔄 재시도 로직 구현
- 📡 네트워크 상태 감지
- ⏳ 로딩 상태 표준화
- 🚨 사용자 친화적 에러 메시지

### 3. 개발자 경험 개선
- 📝 TypeScript 지원
- 🧪 테스트 가능한 구조
- 📚 상세한 문서화
- 🔧 디버깅 도구

## 🚀 빠른 시작

### 현재 API 클라이언트 수정
```javascript
// 기존 문제가 있는 코드 수정
import { 
  getLevelTestQuestions,
  submitLevelTest,
  completeLevelTest,
  getLevelTestResult,
  getLevelTestProgress 
} from '../api/levelTest';
```

### 개선된 API 클라이언트 사용
```javascript
// 새로운 개선된 클라이언트
import levelTestAPI, { APIError, ValidationError } from '../api/levelTestAPI';

try {
  const questions = await levelTestAPI.getQuestions();
  const result = await levelTestAPI.submitAnswer(audioBlob, 1);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('입력 오류:', error.message);
  } else if (error instanceof APIError) {
    console.error('API 오류:', error.code, error.message);
  }
}
```

## 📋 체크리스트

### 즉시 적용 가능한 수정
- [ ] `src/api/levelTest.js` 엔드포인트 URL 수정
- [ ] 인증 토큰 키 `accessToken`으로 통일
- [ ] GET 메서드로 질문 조회 수정
- [ ] 진행상황 조회 엔드포인트 수정

### 단계별 개선 적용
- [ ] 개선된 에러 처리 로직 적용
- [ ] 로딩 상태 컴포넌트 구현
- [ ] 재시도 로직 구현
- [ ] 네트워크 상태 감지 추가

### 장기 개선 계획
- [ ] WebSocket 실시간 통신 구현
- [ ] 오프라인 지원 추가
- [ ] 성능 모니터링 도구 통합
- [ ] 테스트 커버리지 확대

## 🔗 관련 문서

### 프로젝트 문서
- [프로젝트 개요](../01-overview/)
- [시스템 아키텍처](../03-architecture/)
- [프론트엔드 가이드](../06-frontend/)
- [인프라 구성](../08-infrastructure/)

### 외부 API 문서
- [Cloudflare Workers API](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 Storage](https://developers.cloudflare.com/r2/)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)

## 📞 지원

### 개발 중 문제 발생 시
1. **API 문제**: OpenAPI 명세서와 실제 구현 비교
2. **인증 문제**: 토큰 형식과 만료 시간 확인
3. **네트워크 문제**: 브라우저 개발자 도구 Network 탭 확인
4. **파일 업로드 문제**: 파일 크기와 형식 제한 확인

### 디버깅 도구
```javascript
// API 요청 로깅 활성화
localStorage.setItem('DEBUG_API', 'true');

// 네트워크 상태 확인
console.log('Network status:', navigator.onLine);
console.log('Connection type:', navigator.connection?.effectiveType);
```

## 🔄 업데이트 내역

### v1.0.0 (2025-01-15)
- ✅ 레벨 테스트 API 설계 검토 완료
- ✅ OpenAPI 3.0 명세서 생성
- ✅ 개선된 API 클라이언트 구현
- ✅ 프론트엔드 통합 가이드 작성
- ✅ 에러 처리 및 재시도 로직 구현

### 다음 버전 계획
- 🔄 WebSocket 실시간 통신 API
- 🔄 매칭 시스템 API 문서화
- 🔄 채팅 API 최적화
- 🔄 파일 업로드 API 개선