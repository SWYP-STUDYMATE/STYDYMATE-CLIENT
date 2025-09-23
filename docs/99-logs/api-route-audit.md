# API 경로 감사 보고서

## 감사 일시: 2025-09-22

## 1. Workers 라우팅 구조 (src/index.ts)

### Workers에서 지원하는 경로 (모두 /api/v1 prefix)
```typescript
// 169-170행: 특별히 주목할 부분
v1.route('/users', userRoutes);     // 정식 경로
v1.route('/user', userRoutes);      // 호환성을 위한 별칭

// 기타 경로들
v1.route('/auth', authRoutes);
v1.route('/onboarding', onboardingRoutes);
v1.route('/sessions', sessionsRoutes);
v1.route('/session', sessionsRoutes);  // 호환성 별칭
v1.route('/notifications', notificationsRoutes);
v1.route('/group-sessions', groupSessionsRoutes);
v1.route('/presence', presenceRoutes);
v1.route('/matching', matchingRoutes);
v1.route('/achievements', achievementsRoutes);
v1.route('/chat', chatRoutes);
v1.route('/settings', settingsRoutes);
v1.route('/level-test', levelTestRoutes);
v1.route('/room', webrtcRoutes);
v1.route('/upload', uploadRoutes);
v1.route('/whisper', whisperRoutes);
v1.route('/llm', llmRoutes);
v1.route('/images', imagesRoutes);
v1.route('/cache', cacheRoutes);
v1.route('/transcribe', transcribeRoutes);
v1.route('/translate', translateRoutes);
v1.route('/analytics', analyticsRoutes);
v1.route('/internal', internalRoutes);
```

## 2. 프론트엔드 API 호출 패턴

### 현재 수정 완료된 파일들
1. **src/api/user.js** - ✅ 모든 경로 `/user/` → `/users/`로 수정 완료
2. **src/api/index.js** - ✅ getUserName 경로 수정 완료
3. **src/pages/Login/ObInfoGoogle.jsx** - ✅ OAuth 관련 경로 수정 완료

### 프론트엔드에서 사용하는 API 경로 패턴
- `/achievements/*` - ✅ Workers 지원
- `/auth/*` - ✅ Workers 지원  
- `/chat/*` - ✅ Workers 지원
- `/group-sessions/*` - ✅ Workers 지원
- `/matching/*` - ✅ Workers 지원
- `/notifications/*` - ✅ Workers 지원
- `/onboarding/*` - ✅ Workers 지원
- `/sessions/*` - ✅ Workers 지원
- `/settings/*` - ✅ Workers 지원
- `/users/*` - ✅ Workers 지원 (user와 users 둘 다)

## 3. 발견된 문제점 및 수정사항

### 이미 수정 완료
1. **user vs users 경로 불일치**
   - 문제: 프론트엔드는 `/user/`, Workers는 `/users/` 사용
   - 해결: Workers에서 둘 다 지원하도록 별칭 추가됨
   - 프론트엔드도 `/users/`로 통일 완료

### 추가 확인 필요 사항
1. **API 버전 prefix**
   - 일부 프론트엔드 코드에서 `/api/v1/` 직접 사용
   - api/index.js의 baseURL 설정 확인 필요

2. **레거시 경로**
   - Workers index.ts 198행부터 레거시 경로 지원 코드 존재
   - Deprecation 경고와 함께 하위 호환성 유지

## 4. 권장 사항

1. **경로 일관성**
   - 모든 API 호출은 api/index.js를 통해 수행
   - baseURL 설정으로 버전 관리

2. **별칭 사용 최소화**
   - `/user` → `/users` 마이그레이션 완료 후 별칭 제거 고려
   - `/session` → `/sessions` 동일

3. **모니터링**
   - 404 에러 모니터링으로 누락된 경로 확인
   - Deprecation 경고 로그 확인

## 5. 결론

현재까지 발견된 주요 API 경로 불일치 문제는 모두 해결되었습니다:
- `/user/` vs `/users/` 문제 해결
- Workers에서 호환성 별칭 제공
- 프론트엔드 코드 수정 완료

추가적인 문제는 실제 사용 중 404 에러 모니터링을 통해 발견 가능합니다.

## 6. 2025-09-22 재점검 결과 업데이트

프런트엔드 `src/api/**/*` 호출과 Workers `src/routes/**/*`를 다시 스캔한 결과, 기존 누락 항목 24개를 이번 작업에서 모두 보강했습니다.

| 도메인 | 경로 | 조치 |
| --- | --- | --- |
| Notifications | `/notifications/batch`, `/categories`, `/history`, `/scheduled`, `/settings`, `/read-all`, `/schedule`, `/subscribe`, `/unsubscribe`, `/test`, `/urgent` | 라우트 및 서비스 구현, D1 스키마 확장(0008)으로 데이터 보관 지원 |
| Chat | `/chat/upload/image` | 단일 이미지 업로드 라우트 추가 |
| Group Sessions | `/group-sessions/available`, `/group-sessions/my-sessions` | 호환 alias 라우트 추가 |
| Onboarding | `/language/level-types-language`, `/language/level-types-partner`, `/partner/personality`, `/steps/1~4/save` | 정적 옵션 조회 및 다단계 저장 alias 구현 |
| Users | `/users/profile/image` (POST/DELETE) | 프로필 이미지 업로드/삭제 alias와 R2 정리 로직 추가 |

자동 스크립트는 템플릿 문자열을 사용하는 `/steps/{n}/save` alias(221~232행)를 감지하지 못해 4건을 경고하지만, 실제 라우트는 존재하며 수동 검증을 완료했습니다.
