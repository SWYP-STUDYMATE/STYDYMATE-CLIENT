# 세션 목록 페이지 404 에러 수정

**날짜**: 2025-10-16
**작업자**: Claude
**관련 이슈**: 세션 목록 페이지에서 활성 룸 조회 시 404 에러 발생

## 🐛 문제 상황

세션 목록 페이지(`/sessions`)에서 활성 세션 탭 진입 시 다음 에러 발생:

```
GET /webrtc/active - 404 (Not Found)
활성 룸 목록 조회 실패
```

### 에러 로그
```javascript
[2025-10-16T06:39:07.776Z] ERROR [API]: GET /webrtc/active - 404 (179ms)
[2025-10-16T06:39:07.777Z] ERROR [API_ERROR_HANDLER]: API Error in GET /webrtc/active
Error details: {message: 'Request failed with status code 404', status: 404}
[2025-10-16T06:39:07.777Z] ERROR [SESSION_LIST]: 활성 룸 목록 조회 실패
```

## 🔍 원인 분석

### 1. 클라이언트 API 호출
- **파일**: `src/pages/Session/SessionList.jsx:64`
- **호출 경로**: `GET /webrtc/active`
- **의도**: 활성 WebRTC 룸 목록 조회

```javascript
// SessionList.jsx:64 (수정 전)
const response = await api.get('/webrtc/active');
```

### 2. Workers 백엔드 라우팅
- **파일**: `workers/src/index.ts:211`
- **라우트 마운트**: `/api/v1/room` → `webrtcRoutes`

```typescript
// index.ts:211
v1.route('/room', webrtcRoutes);
```

- **파일**: `workers/src/routes/webrtc.ts:66`
- **실제 엔드포인트**: `GET /api/v1/room/active`

```typescript
// webrtc.ts:66
webrtcRoutes.get('/active', async (c) => {
  const rooms = await getActiveRooms(c.env.CACHE);
  return successResponse(c, rooms);
});
```

### 3. 경로 불일치 확인

| 구분 | 경로 |
|------|------|
| 클라이언트 호출 | `/webrtc/active` → `/api/v1/webrtc/active` (존재하지 않음) |
| 백엔드 실제 경로 | `/api/v1/room/active` |
| **결과** | **404 Not Found** |

## ✅ 수정 사항

### 수정된 파일
- `src/pages/Session/SessionList.jsx`

### 변경 내용
```diff
// SessionList.jsx:64
- const response = await api.get('/webrtc/active');
+ const response = await api.get('/room/active');
```

### 수정 이유
1. Workers 백엔드는 WebRTC 관련 라우트를 `/api/v1/room/*`에 마운트
2. 클라이언트는 API base URL (`/api/v1`)이 자동 추가됨
3. 따라서 `/room/active` 호출 시 → `/api/v1/room/active`로 변환

## 📋 테스트 계획

### 1. 기능 테스트
- [ ] 세션 목록 페이지 접속
- [ ] 활성 세션 탭 클릭
- [ ] 404 에러 없이 정상 로드 확인
- [ ] 활성 룸이 있는 경우 목록 표시 확인
- [ ] 활성 룸이 없는 경우 "현재 활성 세션이 없습니다" 메시지 확인

### 2. API 응답 확인
```bash
# 활성 룸 목록 조회
curl https://api.languagemate.kr/api/v1/room/active \
  -H "Authorization: Bearer <token>"

# 예상 응답 (활성 룸 없음)
{
  "success": true,
  "data": [],
  "meta": { ... }
}

# 예상 응답 (활성 룸 있음)
{
  "success": true,
  "data": [
    {
      "roomId": "uuid",
      "roomType": "video",
      "currentParticipants": 2,
      "maxParticipants": 4,
      "status": "active",
      ...
    }
  ]
}
```

### 3. 에러 처리 검증
- [ ] 404 에러 시 빈 배열로 처리 (코드 69-76행)
- [ ] 기타 에러 시 로그 출력 및 빈 배열 설정
- [ ] 사용자에게 적절한 UI 표시

## 🔄 관련 컴포넌트

### SessionList.jsx의 에러 처리 로직
```javascript
// 현재 구현된 에러 처리 (유지)
try {
  const response = await api.get('/room/active');
  const rooms = response?.data?.data || response?.data || [];
  setActiveRooms(Array.isArray(rooms) ? rooms : []);
} catch (error) {
  // 404는 활성 룸이 없는 정상 케이스로 처리
  if (error.response?.status === 404) {
    log.info('현재 활성 세션이 없습니다', null, 'SESSION_LIST');
    setActiveRooms([]);
  } else {
    log.error('활성 룸 목록 조회 실패', error, 'SESSION_LIST');
    setActiveRooms([]);
  }
}
```

## 📝 추가 확인 사항

### Workers 백엔드 WebRTC 라우트 정리
```typescript
// workers/src/routes/webrtc.ts

POST   /api/v1/room/create              // 새 룸 생성
GET    /api/v1/room/active              // 활성 룸 목록 (수정됨)
POST   /api/v1/room/:roomId/join        // 룸 참여
POST   /api/v1/room/:roomId/leave       // 룸 나가기
GET    /api/v1/room/:roomId/ws          // WebSocket 연결
PATCH  /api/v1/room/:roomId/settings    // 설정 변경
GET    /api/v1/room/:roomId/info        // 룸 정보 조회
GET    /api/v1/room/:roomId/ice-servers // ICE 서버 조회
GET    /api/v1/room/:roomId/metrics     // 메트릭 조회
POST   /api/v1/room/:roomId/recording/upload // 녹화 업로드
GET    /api/v1/room/list                // 룸 목록 (관리자 전용)
```

## 🎯 예상 결과

### 수정 전
- 세션 목록 페이지 로드 시 404 에러
- Console에 에러 로그 출력
- 활성 세션 탭에서 빈 상태만 표시

### 수정 후
- 페이지 로드 시 정상 API 호출
- 활성 룸이 있으면 목록 표시
- 활성 룸이 없으면 안내 메시지 표시
- 404 에러 제거

## 🚀 배포 방법

```bash
# 빌드
npm run build

# Cloudflare Pages 배포 (자동)
# main 브랜치 푸시 시 자동 배포
git add .
git commit -m "fix: 세션 목록 활성 룸 조회 경로 수정 (/webrtc/active → /room/active)"
git push origin main
```

## 📚 참고 문서

- Workers 백엔드 라우팅: `workers/src/index.ts`
- WebRTC 라우트: `workers/src/routes/webrtc.ts`
- Active Rooms 유틸: `workers/src/utils/activeRooms.ts`
- 클라이언트 세션 목록: `src/pages/Session/SessionList.jsx`
- API 설정: `src/api/index.js`

## 🔍 학습 포인트

1. **API 경로 일치 중요성**
   - 클라이언트와 백엔드의 경로가 정확히 일치해야 함
   - base URL 자동 추가를 고려한 경로 설정

2. **Workers 라우팅 구조**
   - Hono 프레임워크의 라우트 마운트 방식
   - `/api/v1`이 기본 prefix로 추가됨

3. **에러 처리 설계**
   - 404를 항상 에러로 처리하지 않음
   - 활성 룸 없음 = 정상 상태로 처리
   - 적절한 로그 레벨 사용 (error vs info)

4. **Cross-repository 개발**
   - 프론트엔드와 백엔드의 계약(Contract) 확인 필수
   - API 문서화 및 엔드포인트 목록 관리 중요
