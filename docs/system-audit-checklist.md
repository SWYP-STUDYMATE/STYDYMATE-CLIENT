# 시스템 전수 점검 체크리스트

본 문서는 STUDYMATE 프로젝트의 전체 코드를 대상으로 기능 구현 여부, 중복 구현 여부, 프런트/백엔드/데이터베이스 정합성을 체계적으로 검증하기 위한 체크리스트입니다. 각 섹션은 실제 확인 결과와 추가 조치가 필요한 항목을 함께 기록하는 용도로 사용합니다.

## 1. 기능 구현 상태 확인

| 확인 항목 | 세부 내용 | 데이터 소스/명령 | 상태 | 비고 |
|-----------|-----------|-------------------|-------|------|
| 레벨 테스트 | `/api/v1/level-test/*`, 레벨 테스트 스토어 연동 | `workers/src/routes/levelTest.ts`, `src/api/levelTest.js`, `src/store/levelTestStore.js` | ☑ (2025-10-07) | 라우트/스토어/서비스 일치 확인 |
| 그룹 세션 AI | `/api/v1/group-sessions/ai/*`, 진척도 기록 | `workers/src/routes/groupSessions.ts`, `workers/src/services/groupSessionsAI.ts`, `src/api/groupSessionAI.js` | ☑ (2025-10-07) | 신규 라우트 및 KV 연동 확인 |
| 그룹 세션 기본 기능 | 세션 생성/참여/취소/조회 | `workers/src/routes/groupSessions.ts`, `src/api/groupSession.js` | ☑ (2025-10-07) | GET `/group-sessions`, `/my`, `/hosted` 등 매핑 |
| 매칭 | 매칭 요청/수락/거절, 설정 | `workers/src/routes/matching.ts`, `src/api/matching.js` | ☑ (2025-10-07) | 라우트와 API 함수 매칭 확인 |
| 알림 | 목록/읽음/설정/푸시 토큰 | `workers/src/routes/notifications.ts`, `src/api/notifications.js` | ☑ (2025-10-07) | 주요 엔드포인트 대응 확인 |
| 사용자 프로필 | 기본/온보딩/설정 | `workers/src/routes/users.ts`, `workers/src/routes/settings.ts`, `src/api/user.js`, `src/api/settings.js` | ☑ (2025-10-07) | `/users/*`, `/settings/*` 매핑 확인 |
| 온보딩 | 6단계 온보딩 데이터/옵션/완료 처리 | `workers/src/routes/onboarding.ts`, `workers/src/services/onboarding.ts`, `src/api/onboarding.js`, `src/api/onboard.js` | ☑ (2025-10-07) | 단계별 저장/조회 라우트 일치 확인 |
| 세션(1:1) | `/api/v1/sessions/*` | `workers/src/routes/sessions.ts`, `src/api/session.js` | ☑ (2025-10-07) | GET/POST/PUT 경로 존재 확인 |
| 채팅 | `/api/v1/chat/*` | `workers/src/routes/chat.ts`, `src/api/chat.js` | ☑ (2025-10-07) | DO 라우트 및 API 함수 일치 |
| 인증 | `/api/v1/auth/*` | `workers/src/routes/auth.ts`, `src/api/auth.js` | ☑ (2025-10-07) | `/auth/me`, `/auth/verify` 등 확인 |
| 업적 | `/api/v1/achievements/*` | `workers/src/routes/achievements.ts`, `src/api/achievement.js` | ☑ (2025-10-07) | |
| 분석 | `/api/v1/analytics/*` | `workers/src/routes/analytics.ts`, `src/api/analytics.js` | ☑ (2025-10-07) | |

**확인 방법:**
1. 라우트와 API 레이어의 엔드포인트가 일치하는지 확인한다.
2. 기능별 주요 서비스/스토어에서 사용되는 비즈니스 로직이 존재하는지 코드 수준에서 검토한다.
3. 필요 시 프런트 단 테스트/수동 호출로 실제 응답을 확인한다.

## 2. 중복 구현/죽은 코드 감지

| 확인 항목 | 방법 | 자료 | 상태 | 비고 |
|-----------|------|------|-------|------|
| 라우트 중복 | 정규식 스캔으로 동일 경로가 여러 라우터에 정의되어 있는지 확인 | `python` 스크립트 (`workers/src/routes` 대상) | ☑ (2025-10-07) | 중복 없음 확인 |
| 서비스 중복 | 핵심 서비스 함수명/파일명 중복 여부 확인 | `rg "function" workers/src/services` | ☑ (2025-10-07) | 핵심 서비스 단일화 유지 |
| 프런트 단 중복/누락 API | `src/api` 전역에서 동일 기능이 다른 파일에 분산되어 있는지 확인 | 스캔 결과 기록 | ☑ (2025-10-07) | `/users/*`, `/sessions/*`, `/auth/*` 등 전부 백엔드 라우트와 매칭 확인 |
| 죽은 코드 | `eslint --max-warnings=0`, `ts-prune` 등 도구 실행 | CLI 결과 첨부 | ☐ | |

## 3. 프런트-백엔드 정합성

| 확인 항목 | 방법 | 상태 | 비고 |
|-----------|------|-------|------|
| API 엔드포인트 매칭 | `workers` 라우트 vs `src/api` 요청 목록 비교 | ☑ (2025-10-07) | 자동 스캔 결과 false positive (주석/에일리어스) 제외 확인 |
| 응답 스키마 일치 | 주요 API 응답 구조가 프런트에서 기대하는 필드를 포함하는지 확인 | ☑ (2025-10-07) | `successResponse` 래핑과 프런트 해석(`response.data.data`) 일치 확인 (레벨테스트/그룹세션/AI) |
| 실시간(WebSocket/DO) 정합성 | 채팅/세션 관련 이벤트 핸들러 유무 확인 | ☑ (2025-10-07) | DO(WebRTCRoom/ChatHub)와 프런트 핸들러 연결 확인 |

## 4. 데이터베이스 스키마 검증

| 테이블/리소스 | 스키마 위치 | 사용 코드 | 상태 | 비고 |
|---------------|-------------|-----------|-------|------|
| Users | `docs/05-database/schema.sql`, `workers/src/services/user.ts` | ☑ (2025-10-07) | `users` 테이블 컬럼(`0001_auth_users.sql`)과 서비스 필드 매칭 확인 |
| Sessions | `docs/05-database/schema.sql`, `workers/src/services/session.ts` | ☑ (2025-10-07) | `0004_sessions.sql` 기반 컬럼 사용 일치 확인 |
| GroupSessions | `docs/05-database/schema.sql`, `workers/src/services/groupSessions.ts` | ☑ (2025-10-07) | KV/서비스 사용 컬럼 스키마와 일치 |
| Notifications | `docs/05-database/schema.sql`, `workers/src/services/notifications.ts` | ☐ | |
| Matching | `docs/05-database/schema.sql`, `workers/src/services/matching.ts` | ☐ | |
| Analytics | `docs/05-database/schema.sql`, `workers/src/services/analytics.ts` | ☐ | |

**확인 사항:**
- 서비스 코드에서 사용하는 컬럼이 스키마에 존재하는지 확인.
- 새로 추가된 필드가 마이그레이션에 반영되었는지 검토.

## 5. 테스트 및 품질 보증

| 항목 | 작업 | 상태 | 비고 |
|------|------|-------|------|
| Lint | `npm run lint` | ☑ (2025-10-07) | 기존 전역 경고(Ongoing) 외 신규 경고 없음 |
| Type Check | `npm run typecheck` (tsconfig 없을 경우 계획 수립) | ☐ | 현재 tsconfig 미구성 → 구성 및 실행 방안 마련 필요 |
| 유닛/통합 테스트 | `npm run test`, Playwright 등 | ☐ | 테스트 스위트 실행 미실시 (추후 계획 수립) |
| 수동 QA | 핵심 기능 수동 점검 (레벨 테스트, 그룹 세션, 매칭 등) | ☐ | QA 시나리오 정리 및 수행 필요 |

## 6. 로그 및 모니터링

- Cloudflare Analytics, 로그 스트림 설정 확인
- 오류 수집/경고 체계 검토
- 필요한 경우 Alert 정책 문서화

---

### 활용 지침
1. 각 항목을 점검하면서 “상태” 열에 `☑` 또는 `☐`와 함께 날짜/담당자를 기록한다.
2. 문제 발견 시 “비고”에 상세 내용을 남기고, 별도의 이슈로 추적한다.
3. 주기적으로(예: 스프린트 종료 시) 본 문서를 갱신하여 최신 상태를 유지한다.
