# AI 모델 응답 캐싱 가이드

## 개요

AI 모델 API 호출 비용을 절감하고 응답 속도를 개선하기 위한 KV 기반 캐싱 시스템입니다.

## 주요 기능

### 1. 자동 캐시 관리
- KV 기반 분산 캐시 저장
- TTL(Time To Live) 자동 관리
- LRU(Least Recently Used) 기반 정리

### 2. 메트릭 추적
- 캐시 히트/미스 통계
- 모델별 캐시 사용량
- 히트율 자동 계산

### 3. 유연한 캐시 전략
- 모델별 TTL 설정
- 캐시 무효화 전략
- 강제 갱신 옵션

## 사용 방법

### 기본 사용

```typescript
import { CachedAIService } from '../services/cachedAI';

// 환경 변수에서 KV 네임스페이스 가져오기
const cachedAI = new CachedAIService(env.AI_CACHE);

// 번역 (자동 캐싱)
const translated = await cachedAI.translateText(
  'Hello, world!',
  'en',
  'ko'
);

// 레벨 테스트 평가 (자동 캐싱)
const evaluation = await cachedAI.evaluateLevelTest(answers);

// 발음 평가 (자동 캐싱)
const pronunciationScore = await cachedAI.evaluatePronunciation(
  audioUrl,
  'Hello'
);
```

### 캐시 옵션 사용

```typescript
// 캐시 비활성화
const result = await cachedAI.translateText('text', 'en', 'ko', {
  enableCache: false,
});

// 강제 갱신 (캐시 무시하고 새로 호출)
const freshResult = await cachedAI.translateText('text', 'en', 'ko', {
  forceRefresh: true,
});

// 커스텀 TTL 설정
const result = await cachedAI.translateText('text', 'en', 'ko', {
  ttl: 7200, // 2시간
});
```

## 캐시 전략

### TTL 프리셋

```typescript
import { CacheTTL } from '../utils/aiCache';

CacheTTL.SHORT       // 5분 - 실시간성 중요
CacheTTL.MEDIUM      // 30분 - 일반적인 경우
CacheTTL.LONG        // 1시간 - 자주 변경되지 않음
CacheTTL.VERY_LONG   // 24시간 - 거의 변경되지 않음
```

### 모델별 권장 전략

| 모델 | TTL | 이유 |
|------|-----|------|
| 번역 | 30분 | 같은 문장이 자주 번역됨 |
| 레벨 테스트 | 1시간 | 답변이 같으면 결과 동일 |
| 매칭 추천 | 5분 | 실시간 사용자 상태 반영 |
| 발음 평가 | 30분 | 동일 음성 재평가 가능 |
| 학습 분석 | 24시간 | 히스토리 기반 분석 |
| 대화 요약 | 24시간 | 대화 내용 불변 |

## 캐시 키 생성

캐시 키는 다음 요소로 자동 생성됩니다:

```
{namespace}:{model}:{hash}
```

- **namespace**: 캐시 구분 (기본값: `ai_cache`)
- **model**: AI 모델 이름
- **hash**: SHA-256 해시 (prompt + parameters)

### 예시

```
ai_cache:translation:a3b5c7d9e1f2...
ai_cache:level-test:f9e8d7c6b5a4...
```

## 직접 캐시 관리

### AICacheManager 사용

```typescript
import { AICacheManager, CacheTTL } from '../utils/aiCache';

const cacheManager = new AICacheManager(env.AI_CACHE);

// 캐시 조회
const cached = await cacheManager.get<string>(
  'translation',
  'Translate: Hello',
  { lang: 'ko' }
);

// 캐시 저장
await cacheManager.set(
  'translation',
  'Translate: Hello',
  '안녕하세요',
  { lang: 'ko' },
  CacheTTL.MEDIUM
);

// 특정 모델 캐시 무효화
await cacheManager.invalidateModel('translation');

// 패턴 기반 무효화
await cacheManager.invalidatePattern('translation', /user-123/);

// 모든 캐시 삭제
await cacheManager.clear();

// 메트릭 조회
const metrics = await cacheManager.getMetrics();
console.log(`히트율: ${metrics.hitRate * 100}%`);

// 통계 조회
const stats = await cacheManager.getStats();
console.log(`총 엔트리: ${stats.entryCount}`);

// LRU 기반 정리
await cacheManager.cleanup(1000); // 최대 1000개 유지
```

## 관리자 API

### 캐시 메트릭 조회

```bash
GET /admin/cache/metrics

Response:
{
  "success": true,
  "data": {
    "totalHits": 1250,
    "totalMisses": 350,
    "hitRate": 0.78125,
    "totalSize": 524288,
    "entryCount": 150
  }
}
```

### 캐시 통계 조회

```bash
GET /admin/cache/stats

Response:
{
  "success": true,
  "data": {
    "entryCount": 150,
    "totalSize": 524288,
    "models": {
      "translation": 80,
      "level-test": 30,
      "pronunciation": 25,
      "matching": 15
    }
  }
}
```

### 모델별 캐시 무효화

```bash
DELETE /admin/cache/model/translation

Response:
{
  "success": true,
  "message": "Cache invalidated for model: translation"
}
```

### 전체 캐시 삭제

```bash
DELETE /admin/cache/all

Response:
{
  "success": true,
  "message": "All cache cleared"
}
```

### 캐시 정리 (LRU)

```bash
POST /admin/cache/cleanup
{
  "maxEntries": 1000
}

Response:
{
  "success": true,
  "message": "Cache cleanup completed (max entries: 1000)"
}
```

### 대시보드 데이터

```bash
GET /admin/cache/dashboard

Response:
{
  "success": true,
  "data": {
    "metrics": {
      "totalHits": 1250,
      "totalMisses": 350,
      "hitRate": 0.78125
    },
    "stats": {
      "entryCount": 150,
      "models": { ... }
    },
    "timestamp": "2025-01-20T10:30:00Z"
  }
}
```

## 환경 설정

### wrangler.toml

```toml
[[kv_namespaces]]
binding = "AI_CACHE"
id = "your-kv-namespace-id"
```

### Workers 환경 변수

```typescript
interface Env {
  AI_CACHE: KVNamespace;
}
```

## 성능 최적화

### 1. TTL 튜닝

```typescript
// 자주 변경되는 데이터: 짧은 TTL
await cachedAI.getMatchingRecommendations(userId, preferences, {
  ttl: CacheTTL.SHORT, // 5분
});

// 거의 변경되지 않는 데이터: 긴 TTL
await cachedAI.summarizeConversation(messages, {
  ttl: CacheTTL.VERY_LONG, // 24시간
});
```

### 2. 캐시 워밍

```typescript
// 자주 사용되는 번역 미리 캐싱
const commonPhrases = [
  'Hello',
  'Thank you',
  'Good morning',
];

for (const phrase of commonPhrases) {
  await cachedAI.translateText(phrase, 'en', 'ko');
}
```

### 3. 주기적 정리

```typescript
// Cron Trigger로 주기적 정리
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    const cacheManager = new AICacheManager(env.AI_CACHE);
    await cacheManager.cleanup(1000);
  },
};
```

## 모니터링

### 히트율 모니터링

```typescript
const metrics = await cacheManager.getMetrics();

if (metrics.hitRate < 0.5) {
  console.warn('캐시 히트율이 낮습니다:', metrics.hitRate);
  // TTL 조정 또는 캐시 전략 재검토 필요
}
```

### 캐시 크기 모니터링

```typescript
const stats = await cacheManager.getStats();

if (stats.entryCount > 10000) {
  console.warn('캐시 엔트리가 너무 많습니다:', stats.entryCount);
  await cacheManager.cleanup(5000); // 절반으로 줄이기
}
```

## Best Practices

### 1. 적절한 TTL 설정

```typescript
// ✅ 좋은 예: 데이터 특성에 맞는 TTL
await cachedAI.translateText('text', 'en', 'ko', {
  ttl: CacheTTL.MEDIUM, // 번역은 자주 변경되지 않음
});

// ❌ 나쁜 예: 모든 데이터에 동일한 TTL
await cachedAI.getMatchingRecommendations(userId, preferences, {
  ttl: CacheTTL.VERY_LONG, // 실시간 데이터인데 24시간 캐싱
});
```

### 2. 캐시 무효화

```typescript
// ✅ 좋은 예: 데이터 변경 시 즉시 무효화
async function updateUserPreferences(userId: string, preferences: any) {
  await db.updatePreferences(userId, preferences);
  await cacheManager.invalidateModel('matching'); // 관련 캐시 무효화
}

// ❌ 나쁜 예: 무효화하지 않음
async function updateUserPreferences(userId: string, preferences: any) {
  await db.updatePreferences(userId, preferences);
  // 오래된 캐시 데이터가 계속 사용됨
}
```

### 3. 캐시 키 설계

```typescript
// ✅ 좋은 예: 충분히 구체적인 파라미터
await cacheManager.get('translation', prompt, {
  sourceLang: 'en',
  targetLang: 'ko',
  userId, // 사용자별 커스터마이징 반영
});

// ❌ 나쁜 예: 파라미터가 너무 단순
await cacheManager.get('translation', prompt, {});
// 다른 언어 쌍도 같은 키 사용됨
```

### 4. 에러 처리

```typescript
// ✅ 좋은 예: 캐시 실패해도 서비스 계속
try {
  const cached = await cacheManager.get(model, prompt, params);
  if (cached) return cached;
} catch (error) {
  console.error('Cache get error:', error);
  // 캐시 실패해도 AI API 호출로 폴백
}

const result = await callAIAPI();
```

## 주의사항

1. **KV 제한**: Cloudflare KV는 초당 1000회 쓰기 제한
2. **키 크기**: 캐시 키는 512바이트 이내
3. **값 크기**: KV 값은 25MB 이내
4. **TTL 최소값**: 60초 이상 권장
5. **비용**: KV 읽기/쓰기 비용 고려

## 문제 해결

### 캐시 히트율이 낮은 경우

1. TTL이 너무 짧지 않은지 확인
2. 캐시 키가 너무 구체적이지 않은지 확인
3. 파라미터 정규화 필요 (순서, 대소문자 등)

### 캐시 크기가 계속 증가하는 경우

1. LRU 정리를 주기적으로 실행
2. TTL을 적절히 설정
3. 불필요한 캐싱 제거

### 캐시가 작동하지 않는 경우

1. KV 네임스페이스 바인딩 확인
2. 환경 변수 설정 확인
3. 캐시 키 생성 로직 확인

## 추가 리소스

- [Cloudflare KV 문서](https://developers.cloudflare.com/kv/)
- [Caching Strategies](https://web.dev/cache-api-quick-guide/)
- [LRU Cache Algorithm](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)
