# 작업 계획서: High/Low 이슈 해결

**작성일**: 2025-01-17
**완료일**: 2025-01-17
**상태**: ✅ 완료
**목표**: TypeScript 오류 해결 + 라이브러리 중복 제거 + WebRTC 검증

---

## 🎉 완료 결과 요약

| 항목 | Before | After | 상태 |
|-----|--------|-------|------|
| TypeScript errors | 77+ | **0** | ✅ |
| ESLint errors | 6 | **0** | ✅ |
| lodash/lodash-es | 설치됨 | **제거됨** | ✅ |
| chart.js/react-chartjs-2 | 설치됨 | **제거됨** | ✅ |
| RadarChart | chart.js 사용 | **recharts 사용** | ✅ |
| WebRTC Durable Object | setWebSocketAutoResponse 누락 | **추가됨** | ✅ |
| Frontend 빌드 | - | **성공** | ✅ |
| Workers 빌드 | - | **성공** | ✅ |

### 주요 변경 파일
- `src/components/RadarChart.jsx` - recharts로 마이그레이션
- `src/services/webrtc.js` - ESLint case block 오류 수정
- `workers/src/durable/WebRTCRoom.ts` - setWebSocketAutoResponse 추가

---

## 1. 현황 분석

### 1.1 TypeScript 오류 현황 (77+ errors)

| 파일 | 오류 수 | 주요 원인 |
|-----|--------|----------|
| `src/services/aiMatching.ts` | 36 | LogContext 타입, MatchingPartner 속성 부재 |
| `src/services/pronunciationEvaluation.ts` | 12 | LLMResponse vs string 타입 불일치 |
| `src/routes/levelTest.ts` | 12 | 분석 결과 타입 속성 부재 |
| `src/routes/matching.ts` | 10 | LogContext 타입, AppError.code 부재 |
| `src/utils/durableObjectPersistence.ts` | 9 | 타입 정의 누락 |
| `src/services/learningAnalytics.ts` | 8 | LLMResponse 타입 불일치 |
| 기타 | 5+ | 다양한 타입 이슈 |

### 1.2 라이브러리 중복 현황

| 라이브러리 | 사용 현황 | 권장 조치 |
|-----------|----------|----------|
| `lodash` + `lodash-es` | **미사용** (프로젝트 내 import 없음) | 둘 다 제거 |
| `chart.js` + `react-chartjs-2` | RadarChart.jsx에서만 사용 | recharts로 마이그레이션 |
| `recharts` | 4개 컴포넌트에서 사용 (주력) | 유지 |

### 1.3 WebRTC/화상통화 현황

| 영역 | 파일 | 상태 |
|-----|-----|------|
| Frontend Service | `src/services/webrtc.js` | ✅ 구현 완료 |
| Frontend Hook | `src/hooks/useWebRTC.js` | ✅ 구현 완료 |
| Frontend API | `src/api/webrtc.js` | ✅ 구현 완료 |
| Video Session | `src/pages/Session/VideoSessionRoom.jsx` | ✅ 구현 완료 |
| Audio Session | `src/pages/Session/AudioSessionRoom.jsx` | ✅ 구현 완료 |
| Backend DO | `workers/src/durable/WebRTCRoom.ts` | ✅ 구현 완료 |
| Backend Routes | `workers/src/routes/webrtc.ts` | ✅ 구현 완료 |

---

## 2. 작업 계획

### Phase 1: TypeScript 타입 정의 확장 (중복 코드 방지 우선)

**목표**: 타입 정의만 확장하여 77+ 오류 해결

#### Task 1.1: LogContext 타입 확장
**파일**: `workers/src/utils/logger.ts`
**변경 내용**:
```typescript
export interface LogContext {
    // 기존 필드
    requestId?: string;
    userId?: string;
    method?: string;
    path?: string;
    ip?: string;
    userAgent?: string;
    duration?: number;
    status?: number;
    component?: string;
    operation?: string;

    // 확장 필드 (기존 코드 지원)
    [key: string]: unknown;  // Index signature 추가
}
```
**효과**: 36+ 오류 해결 (aiMatching.ts, matching.ts 등)

#### Task 1.2: MatchingPartner 타입 확장
**파일**: `workers/src/types/index.ts`
**변경 내용**:
```typescript
export interface MatchingPartner {
    // 기존 필드 유지...

    // 추가 필드 (aiMatching.ts 호환)
    name?: string;
    birthyear?: string;
    communicationMethod?: string;
    dailyMinute?: string;
    learningExpectation?: string;
    locationCountry?: string;
    locationCity?: string;
}
```
**효과**: 10+ 오류 해결

#### Task 1.3: LLMResponse 타입 수정
**파일**: `workers/src/services/llm.ts` (또는 types)
**변경 내용**:
```typescript
// LLMResponse가 string으로 변환 가능하도록
export type LLMResponse = string | { text: string; [key: string]: unknown };

// 또는 extractLLMText 헬퍼 함수 추가
export function extractLLMText(response: LLMResponse): string {
    return typeof response === 'string' ? response : response.text;
}
```
**효과**: 12+ 오류 해결 (pronunciationEvaluation, learningAnalytics 등)

#### Task 1.4: 분석 결과 타입 정의 추가
**파일**: `workers/src/types/levelTest.ts` (신규)
**변경 내용**:
```typescript
export interface GrammarAnalysis {
    score: number;
    accuracyScore: number;
    feedback?: string;
}

export interface VocabularyAnalysis {
    score: number;
    rangeScore: number;
    sophisticationLevel: string;
    sophistication?: string;  // 별칭
}

export interface FluencyAnalysis {
    score: number;
    speedLevel: string;
}

export interface PronunciationAnalysis {
    score: number;
    improvementAreas: string[];
}
```
**효과**: 12 오류 해결 (levelTest.ts)

#### Task 1.5: AppError 클래스 확장
**파일**: `workers/src/utils/errors.ts`
**변경 내용**:
```typescript
export class AppError extends Error {
    code?: string;  // 추가
    // 기존 필드...
}
```
**효과**: 2+ 오류 해결

#### Task 1.6: ContextVariableMap 확장
**파일**: `workers/src/types/index.ts`
**변경 내용**:
```typescript
export interface ContextVariableMap {
    user: AuthUser;
    userId: string;  // 추가
}
```
**효과**: 2 오류 해결 (rateLimit.ts)

---

### Phase 2: 라이브러리 중복 제거

#### Task 2.1: lodash + lodash-es 제거
**조건**: 프로젝트 내 import가 없음을 확인 완료
**명령**:
```bash
npm uninstall lodash lodash-es @types/lodash @types/lodash-es
```
**효과**: 번들 크기 ~70KB 감소

#### Task 2.2: RadarChart recharts 마이그레이션

**현재 상태**: `chart.js` + `react-chartjs-2` 사용
**목표**: `recharts`의 `RadarChart` 컴포넌트 사용

**변경 파일**: `src/components/RadarChart.jsx`
**변경 내용**:
```jsx
// 기존: chart.js + react-chartjs-2
import { Radar } from 'react-chartjs-2';

// 변경 후: recharts
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
```

#### Task 2.3: chart.js 관련 패키지 제거
**명령**:
```bash
npm uninstall chart.js react-chartjs-2
```
**효과**: 번들 크기 ~200KB 감소

---

### Phase 3: WebRTC/화상통화 기능 검증

#### Task 3.1: WebRTC 코드 리뷰
**검증 항목**:
- [ ] ICE Server 설정 (STUN/TURN)
- [ ] Peer Connection 생명주기 관리
- [ ] 오디오/비디오 트랙 처리
- [ ] 재연결 로직 (exponential backoff)
- [ ] 에러 핸들링

#### Task 3.2: ESLint 오류 수정 (6개)
**파일**: `src/services/webrtc.js`
**주요 이슈**:
- console.log 사용 → logger 사용으로 변경
- 사용되지 않는 변수 제거
- async 함수 await 누락

#### Task 3.3: Durable Object 검증
**파일**: `workers/src/durable/WebRTCRoom.ts`
**검증 항목**:
- [ ] Hibernation API 사용 여부
- [ ] 참가자 상태 복원 로직
- [ ] WebSocket 메시지 브로드캐스트
- [ ] 타임아웃 처리

---

## 3. 실행 순서 및 의존성

```
Phase 1 (타입 수정) - 순서 중요
    │
    ├── Task 1.1 (LogContext) ─────┐
    ├── Task 1.2 (MatchingPartner) │
    ├── Task 1.3 (LLMResponse) ────┼── 병렬 실행 가능
    ├── Task 1.4 (분석 타입) ──────┤
    ├── Task 1.5 (AppError) ───────┤
    └── Task 1.6 (ContextVariableMap)┘
              │
              ▼
    TypeScript 빌드 검증 (npx tsc --noEmit)
              │
              ▼
Phase 2 (라이브러리 정리)
    │
    ├── Task 2.1 (lodash 제거) ────┐
    │                              │── 순차 실행
    ├── Task 2.2 (RadarChart 변경) │
    │                              │
    └── Task 2.3 (chart.js 제거) ──┘
              │
              ▼
    Frontend 빌드 검증 (npm run build)
              │
              ▼
Phase 3 (WebRTC 검증)
    │
    ├── Task 3.1 (코드 리뷰)
    ├── Task 3.2 (ESLint 수정)
    └── Task 3.3 (DO 검증)
```

---

## 4. 예상 효과

| 항목 | 현재 | 목표 |
|-----|-----|-----|
| TypeScript 오류 | 77+ | 0 |
| 라이브러리 수 | 5개 중복 | 1개 (recharts만) |
| 번들 크기 | - | ~270KB 감소 |
| WebRTC 안정성 | 미검증 | 검증 완료 |

---

## 5. 롤백 전략

모든 변경은 단계별로 커밋되며, 문제 발생 시:
1. `git revert` 으로 개별 커밋 롤백
2. Phase 단위 브랜치 관리로 안전한 머지

---

## 6. 중복 코드 방지 원칙

1. **타입 확장 우선**: 새 타입 정의보다 기존 타입 확장
2. **Index Signature 활용**: `[key: string]: unknown` 으로 유연성 확보
3. **단일 진실 원천**: 타입은 `types/index.ts`에서 중앙 관리
4. **공통 함수 활용**: `extractLLMText` 같은 헬퍼로 중복 변환 방지
