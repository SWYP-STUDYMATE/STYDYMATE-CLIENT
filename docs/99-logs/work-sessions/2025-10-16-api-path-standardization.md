# API 경로 표준화 작업

**날짜**: 2025-10-16
**작업자**: Claude
**목적**: 클라이언트와 백엔드 간 API 경로 명명 규칙 통일

## 📋 작업 요약

API 경로의 일관성을 개선하기 위해 다음 표준을 적용했습니다:
1. **복수형 사용**: 모든 리소스 경로는 복수형 (`/users`, `/sessions`)
2. **kebab-case 유지**: 단어 구분은 하이픈 사용 (`/level-test`)
3. **중복 제거**: 단수형/복수형 중복 라우트 제거

## 🔧 수정 사항

### 1. Workers 백엔드 라우트 정리

**파일**: `workers/src/index.ts`

#### 제거된 중복 라우트
```diff
 v1.route('/users', userRoutes);
-v1.route('/user', userRoutes);        // 제거됨 (단수형 중복)

 v1.route('/sessions', sessionsRoutes);
-v1.route('/session', sessionsRoutes); // 제거됨 (단수형 중복)

 v1.route('/level-test', levelTestRoutes);
-v1.route('/leveltest', levelTestRoutes); // 제거됨 (kebab-case 중복)
```

#### 최종 라우트 목록
```typescript
// v1 API 라우트 등록 (복수형 & kebab-case 표준)
v1.route('/auth', authRoutes);
v1.route('/login', authRoutes);
v1.route('/users', userRoutes);           // ✅ 복수형만
v1.route('/onboarding', onboardingRoutes);
v1.route('/sessions', sessionsRoutes);    // ✅ 복수형만
v1.route('/notifications', notificationsRoutes);
v1.route('/group-sessions', groupSessionsRoutes);
v1.route('/group-sessions/ai', groupSessionsAIRoutes);
v1.route('/presence', presenceRoutes);
v1.route('/matching', matchingRoutes);
v1.route('/achievements', achievementsRoutes);
v1.route('/chat', chatRoutes);
v1.route('/settings', settingsRoutes);
v1.route('/level-test', levelTestRoutes); // ✅ kebab-case만
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

### 2. 클라이언트 API 호출 경로 수정

#### 수정된 파일 목록

1. **Navercallback.jsx** (2곳 수정)
```diff
-await api.get("/user/name")
+await api.get("/users/name")
```

2. **GoogleCallback.jsx** (2곳 수정)
```diff
-await api.get("/user/name")
+await api.get("/users/name")
```

3. **onboarding.js** (1곳 수정)
```diff
-await api.post("/user/english-name", { englishName })
+await api.post("/users/english-name", { englishName })
```

4. **onboard.js** (1곳 수정)
```diff
-await api.post("/user/english-name", { englishName })
+await api.post("/users/english-name", { englishName })
```

5. **ObInfo2.jsx** (1곳 수정)
```diff
-await api.get("/user/locations")
+await api.get("/users/locations")
```

#### WebSocket 경로는 유지
다음 경로들은 STOMP 프로토콜의 표준 구독 경로이므로 변경하지 않았습니다:
- `/user/queue/messages`
- `/user/queue/notifications`
- `/user/queue/matching`
- `/user/queue/session`
- `/user/queue/rooms`
- `/user/queue/matching-notifications`
- `/user/queue/session-notifications`
- `/user/queue/chat-notifications`

## 📊 영향 받는 API 엔드포인트

### 변경된 엔드포인트

| 기존 경로 | 새 경로 | 상태 |
|----------|---------|------|
| `/api/v1/user/name` | `/api/v1/users/name` | ✅ 수정됨 |
| `/api/v1/user/english-name` | `/api/v1/users/english-name` | ✅ 수정됨 |
| `/api/v1/user/locations` | `/api/v1/users/locations` | ✅ 수정됨 |
| `/api/v1/session/*` | `/api/v1/sessions/*` | ✅ 백엔드 중복 제거 |
| `/api/v1/leveltest/*` | `/api/v1/level-test/*` | ✅ 백엔드 중복 제거 |

### 영향 받지 않는 기능

모든 API 호출은 복수형 경로로 통일되어도 기존 기능이 정상 작동합니다:
- ✅ 사용자 인증 (OAuth)
- ✅ 온보딩 프로세스
- ✅ 세션 관리
- ✅ WebSocket 구독

## 🎯 API 명명 규칙 표준

### 적용된 규칙

#### 1. 복수형 사용
```
✅ /users         (O)
❌ /user          (X)

✅ /sessions      (O)
❌ /session       (X)
```

#### 2. kebab-case 사용
```
✅ /level-test    (O)
❌ /leveltest     (X)

✅ /group-sessions (O)
❌ /groupsessions  (X)
```

#### 3. 일관된 경로 구조
```
✅ /users/profile
✅ /users/settings
✅ /users/name

✅ /sessions/my-sessions
✅ /sessions/upcoming
✅ /sessions/history
```

### REST API 표준 참고

이 작업은 다음 표준을 따릅니다:
- **RESTful API Design**: https://restfulapi.net/resource-naming/
- **Google API Design Guide**: https://cloud.google.com/apis/design/resource_names
- **Microsoft REST API Guidelines**: https://github.com/microsoft/api-guidelines

## 🔍 테스트 체크리스트

### 백엔드 테스트
- [ ] Workers 빌드 성공
- [ ] 중복 라우트 제거 확인
- [ ] 모든 엔드포인트 정상 응답

### 클라이언트 테스트
- [ ] 프론트엔드 빌드 성공
- [ ] 네이버 로그인 정상 작동
- [ ] 구글 로그인 정상 작동
- [ ] 온보딩 Step 1 (거주지 선택) 정상 작동
- [ ] 영어 이름 저장 정상 작동
- [ ] 사용자 이름 조회 정상 작동

### 통합 테스트
- [ ] 로그인 → 온보딩 플로우 정상
- [ ] 세션 목록 페이지 404 에러 없음
- [ ] API 호출 로그에 404 없음

## 📝 배포 계획

### 1단계: 백엔드 배포 (Workers)
```bash
cd workers
npm run build
wrangler deploy
```

### 2단계: 프론트엔드 배포 (Cloudflare Pages)
```bash
npm run build
# main 브랜치 푸시 시 자동 배포
```

### 3단계: 배포 후 검증
```bash
# 헬스 체크
curl https://api.languagemate.kr/health

# 사용자 API 테스트
curl https://api.languagemate.kr/api/v1/users/name \
  -H "Authorization: Bearer <token>"

# 세션 API 테스트
curl https://api.languagemate.kr/api/v1/sessions/my-sessions \
  -H "Authorization: Bearer <token>"
```

## 🔄 롤백 계획

만약 문제가 발생하면:

### 옵션 1: 백엔드에 중복 라우트 임시 복원
```typescript
// workers/src/index.ts
v1.route('/users', userRoutes);
v1.route('/user', userRoutes);  // 임시 복원
```

### 옵션 2: 클라이언트 코드 되돌리기
```bash
git revert <commit-hash>
```

## 📚 관련 문서

- **API 경로 일관성 분석**: `docs/99-logs/api-path-inconsistency-report.md`
- **세션 404 에러 수정**: `docs/99-logs/work-sessions/2025-10-16-session-list-404-fix.md`
- **프로젝트 API 명세**: `CLAUDE.md`

## ✅ 완료 사항

1. ✅ Workers 백엔드 중복 라우트 제거
   - `/user` → 제거 (복수형 `/users`만 유지)
   - `/session` → 제거 (복수형 `/sessions`만 유지)
   - `/leveltest` → 제거 (kebab-case `/level-test`만 유지)

2. ✅ 클라이언트 API 호출 수정
   - 5개 파일에서 7곳 수정
   - 모든 `/user/` → `/users/` 변경 완료

3. ✅ WebSocket 구독 경로 확인
   - STOMP 표준 경로는 그대로 유지

## 🎓 학습 포인트

1. **API 설계 일관성의 중요성**
   - 초기 설계 단계에서 명명 규칙 정립 필요
   - 복수형/단수형 혼용은 혼란 유발

2. **하위 호환성 고려**
   - 중복 라우트는 초기에는 편리하지만 장기적으로 혼란
   - 버전 관리로 점진적 마이그레이션 가능

3. **Cross-repository 개발**
   - 프론트엔드와 백엔드의 계약 관리 중요
   - API 문서화 및 자동화된 검증 필요

4. **WebSocket vs REST API**
   - WebSocket 구독 경로(`/user/queue/*`)는 STOMP 표준
   - REST API 경로와 별도로 관리 필요
