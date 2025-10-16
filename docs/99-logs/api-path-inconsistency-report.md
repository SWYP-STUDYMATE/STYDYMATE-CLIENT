# API 경로 일관성 분석 보고서

**날짜**: 2025-10-16
**분석자**: Claude
**목적**: 클라이언트와 백엔드 간 API 경로 일관성 검증

## 📋 요약

클라이언트와 백엔드 간 API 경로 명명 규칙에 **일부 일관성 부족**이 발견되었습니다.

### 주요 발견 사항
1. ✅ **대부분의 경로는 일치**: 90% 이상의 경로가 올바르게 매핑됨
2. ⚠️ **복수형/단수형 혼용**: `/user` vs `/users`, `/session` vs `/sessions`
3. ⚠️ **동의어 사용**: `/webrtc` vs `/room` (수정 완료)
4. ⚠️ **kebab-case 불일치**: `/level-test` vs `/leveltest`

## 🔍 상세 분석

### 1. 복수형/단수형 혼용 (중복 라우팅)

#### 백엔드 중복 마운트
```typescript
// workers/src/index.ts
v1.route('/users', userRoutes);      // 복수형
v1.route('/user', userRoutes);       // 단수형 (중복)

v1.route('/sessions', sessionsRoutes);  // 복수형
v1.route('/session', sessionsRoutes);   // 단수형 (중복)
```

#### 클라이언트 사용 현황
```javascript
// 복수형 사용 (대부분)
api.get('/users/profile');
api.get('/sessions/my-sessions');

// 단수형 사용 (일부)
api.get('/user/name');
api.post('/user/english-name');
```

**문제점:**
- 같은 기능에 대해 두 가지 경로 존재
- 개발자 혼란 유발
- API 문서화 복잡도 증가

**권장 방안:**
- **복수형으로 통일** (REST API 표준)
- 단수형 라우트 제거 또는 복수형으로 리다이렉트
- 클라이언트 코드 일괄 수정

### 2. WebRTC 경로 불일치 (✅ 수정 완료)

#### 수정 전
```javascript
// 클라이언트
api.get('/webrtc/active');  // ❌ 존재하지 않음

// 백엔드
v1.route('/room', webrtcRoutes);  // 실제 경로
```

#### 수정 후
```javascript
// 클라이언트
api.get('/room/active');  // ✅ 수정됨

// 백엔드
v1.route('/room', webrtcRoutes);
```

### 3. Level Test 경로 중복

```typescript
// 백엔드
v1.route('/level-test', levelTestRoutes);  // kebab-case
v1.route('/leveltest', levelTestRoutes);   // 연결형 (중복)
```

**클라이언트 사용:**
```javascript
// level-test 사용
api.get(`${API_CONFIG.API_VERSION}/level-test/settings`);

// leveltest는 사용 안 됨
```

**권장 방안:**
- kebab-case (`/level-test`)로 통일
- `/leveltest` 라우트 제거

## 📊 경로 매핑 테이블

### 인증 (Auth)
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/auth/me` | `/auth` → authRoutes | ✅ 일치 |
| `/auth/verify` | `/auth` → authRoutes | ✅ 일치 |
| `/auth/logout` | `/auth` → authRoutes | ✅ 일치 |
| `/auth/oauth/naver` | `/auth` → authRoutes | ✅ 일치 |
| `/auth/oauth/google` | `/auth` → authRoutes | ✅ 일치 |

### 사용자 (User/Users)
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/users/profile` | `/users` → userRoutes | ✅ 일치 |
| `/users/settings` | `/users` → userRoutes | ✅ 일치 |
| `/user/name` | `/user` → userRoutes | ⚠️ 단수형 |
| `/user/locations` | `/user` → userRoutes | ⚠️ 단수형 |
| `/user/english-name` | `/user` → userRoutes | ⚠️ 단수형 |

**권장 수정:**
```diff
- api.get('/user/name');
+ api.get('/users/name');

- api.post('/user/english-name', { englishName });
+ api.post('/users/english-name', { englishName });
```

### 세션 (Session/Sessions)
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/sessions/my-sessions` | `/sessions` → sessionsRoutes | ✅ 일치 |
| `/sessions/upcoming` | `/sessions` → sessionsRoutes | ✅ 일치 |
| `/sessions/{id}/start` | `/sessions` → sessionsRoutes | ✅ 일치 |

### WebRTC/Room
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/room/active` | `/room` → webrtcRoutes | ✅ 수정됨 |
| ~~`/webrtc/active`~~ | ❌ 존재하지 않음 | ✅ 제거됨 |

### 온보딩 (Onboarding)
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/onboarding/steps/current` | `/onboarding` → onboardingRoutes | ✅ 일치 |
| `/onboarding/complete` | `/onboarding` → onboardingRoutes | ✅ 일치 |
| `/onboarding/language/languages` | `/onboarding` → onboardingRoutes | ✅ 일치 |

### 매칭 (Matching)
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/matching/partners` | `/matching` → matchingRoutes | ✅ 일치 |
| `/matching/request` | `/matching` → matchingRoutes | ✅ 일치 |
| `/matching/accept/{id}` | `/matching` → matchingRoutes | ✅ 일치 |

### 채팅 (Chat)
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/chat/rooms` | `/chat` → chatRoutes | ✅ 일치 |
| `/chat/rooms/{id}/messages` | `/chat` → chatRoutes | ✅ 일치 |
| `/chat/upload/image` | `/chat` → chatRoutes | ✅ 일치 |

### 알림 (Notifications)
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/notifications` | `/notifications` → notificationsRoutes | ✅ 일치 |
| `/notifications/unread-count` | `/notifications` → notificationsRoutes | ✅ 일치 |
| `/notifications/{id}/read` | `/notifications` → notificationsRoutes | ✅ 일치 |

### 성취 (Achievements)
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/achievements` | `/achievements` → achievementsRoutes | ✅ 일치 |
| `/achievements/my` | `/achievements` → achievementsRoutes | ✅ 일치 |
| `/achievements/{id}/claim-reward` | `/achievements` → achievementsRoutes | ✅ 일치 |

### 그룹 세션 (Group Sessions)
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/group-sessions` | `/group-sessions` → groupSessionsRoutes | ✅ 일치 |
| `/group-sessions/my` | `/group-sessions` → groupSessionsRoutes | ✅ 일치 |
| `/group-sessions/{id}/join` | `/group-sessions` → groupSessionsRoutes | ✅ 일치 |

### 설정 (Settings)
| 클라이언트 경로 | 백엔드 라우트 | 상태 |
|----------------|--------------|------|
| `/settings/account` | `/settings` → settingsRoutes | ✅ 일치 |
| `/settings/notifications` | `/settings` → settingsRoutes | ✅ 일치 |
| `/settings/privacy` | `/settings` → settingsRoutes | ✅ 일치 |

## 🎯 권장 수정 사항

### 우선순위 1: 단수형/복수형 통일

#### 백엔드 수정
```typescript
// workers/src/index.ts

// 수정 전
v1.route('/users', userRoutes);
v1.route('/user', userRoutes);      // 제거 또는 리다이렉트

v1.route('/sessions', sessionsRoutes);
v1.route('/session', sessionsRoutes); // 제거 또는 리다이렉트

// 수정 후 (복수형만 유지)
v1.route('/users', userRoutes);
v1.route('/sessions', sessionsRoutes);
```

#### 클라이언트 수정
```javascript
// 수정 대상 파일 검색
// grep -r "api\.(get|post|put|patch|delete)('/user/" src/

// 수정 예시
- api.get('/user/name');
+ api.get('/users/name');

- api.post('/user/english-name', { englishName });
+ api.post('/users/english-name', { englishName });
```

### 우선순위 2: kebab-case 중복 제거

```typescript
// workers/src/index.ts

// 수정 전
v1.route('/level-test', levelTestRoutes);
v1.route('/leveltest', levelTestRoutes);  // 제거

// 수정 후
v1.route('/level-test', levelTestRoutes);
```

### 우선순위 3: API 문서 업데이트

**CLAUDE.md 업데이트:**
```markdown
## API 엔드포인트 명명 규칙

1. **복수형 사용**: 리소스는 항상 복수형 (`/users`, `/sessions`)
2. **kebab-case 사용**: 단어 구분은 하이픈 (`/level-test`, `/group-sessions`)
3. **명확한 동작**: POST `/users/profile-image` (업로드 명확)
4. **일관된 경로**: 같은 리소스는 같은 base path 사용

### 잘못된 예
❌ `/user/name` (단수형)
❌ `/leveltest` (하이픈 없음)
❌ `/webrtc/active` (실제 라우트와 불일치)

### 올바른 예
✅ `/users/name` (복수형)
✅ `/level-test` (kebab-case)
✅ `/room/active` (실제 라우트와 일치)
```

## 📝 실행 계획

### 1단계: 백엔드 정리 (Workers)
```bash
# 중복 라우트 제거
# workers/src/index.ts 수정
- v1.route('/user', userRoutes);
- v1.route('/session', sessionsRoutes);
- v1.route('/leveltest', levelTestRoutes);
```

### 2단계: 클라이언트 일괄 수정
```bash
# /user/ → /users/ 일괄 변경
find src -name "*.js" -o -name "*.jsx" | \
  xargs sed -i '' "s|'/user/|'/users/|g"

# 수정 후 수동 검증 필요
```

### 3단계: 테스트
- [ ] 모든 API 호출 정상 작동 확인
- [ ] 404 에러 없음 확인
- [ ] E2E 테스트 통과

### 4단계: 문서화
- [ ] API 명명 규칙 문서 작성
- [ ] CLAUDE.md 업데이트
- [ ] docs/04-api/ 문서 업데이트

## 🔒 하위 호환성 고려사항

만약 기존 클라이언트 버전을 지원해야 한다면:

### 옵션 1: 리다이렉트 유지
```typescript
// 단수형 → 복수형 리다이렉트
v1.route('/user', userRoutes);      // 유지 (deprecated)
v1.route('/users', userRoutes);     // 권장
```

### 옵션 2: 미들웨어로 리다이렉트
```typescript
app.use('/user/*', async (c, next) => {
  const newPath = c.req.path.replace('/user/', '/users/');
  return c.redirect(newPath, 301);  // Permanent redirect
});
```

### 옵션 3: 버전 관리
```typescript
// v1: 레거시 지원
v1.route('/user', userRoutes);
v1.route('/users', userRoutes);

// v2: 정리된 버전
v2.route('/users', userRoutes);  // 복수형만
```

## 📚 참고 자료

- **REST API 명명 규칙**: https://restfulapi.net/resource-naming/
- **Google API Design Guide**: https://cloud.google.com/apis/design/resource_names
- **Microsoft REST API Guidelines**: https://github.com/microsoft/api-guidelines

## 🎯 결론

1. **현재 상태**: 대부분의 경로는 올바르게 매핑됨 (90%+)
2. **주요 문제**: 복수형/단수형 혼용, kebab-case 불일치
3. **영향도**: 낮음 (중복 라우팅으로 현재는 작동 중)
4. **권장 조치**: 점진적 정리 및 표준화

**우선순위:**
1. ✅ WebRTC 경로 수정 (완료)
2. ⚠️ 단수형 → 복수형 통일 (권장)
3. ⚠️ kebab-case 중복 제거 (권장)
4. 📝 API 명명 규칙 문서화 (필수)
