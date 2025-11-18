# 2025-11-18: 채팅방 생성자(created_by) 필드 추가

## 목표
채팅방 생성자를 구분할 수 있도록 `chat_room` 테이블에 `created_by` 필드를 추가하고, 프론트엔드에서 방장 표시 및 권한 관리를 구현한다.

## 문제 분석

### 현재 상태
- **chat_room 테이블**: `created_by` 필드 없음 ❌
- **sessions 테이블**: `host_user_id` 필드 있음 ✅
- **group_sessions 테이블**: `host_user_id` 필드 있음 ✅

### 발견된 문제
```sql
-- 현재 chat_room 테이블 (created_by 없음)
CREATE TABLE chat_room (
  room_id INTEGER PRIMARY KEY,
  room_name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
  -- ⚠️ created_by 필드 누락!
);
```

**백엔드 코드 (workers/src/services/chat.ts:226-264)**:
- `createChatRoom` 함수가 `creatorId`를 받지만 저장하지 않음
- 첫 번째 참여자를 생성자로 추론할 수 없음 (동시 INSERT 가능)

## TODO

### Phase 1: 데이터베이스 마이그레이션 ✅
- [x] DB 마이그레이션 파일 생성 (`0008_add_chat_room_creator.sql`)
- [x] 기존 데이터 마이그레이션 (가장 먼저 참여한 사람을 created_by로 설정)
- [ ] 마이그레이션 테스트 (배포 시 진행)

### Phase 2: 백엔드 수정 ✅
- [x] `workers/src/types/index.ts` - ChatRoomSummary 타입 수정
- [x] `workers/src/services/chat.ts` - ChatRoomRow 인터페이스에 created_by 추가
- [x] `workers/src/services/chat.ts` - createChatRoom INSERT 수정
- [x] `workers/src/services/chat.ts` - mapRoom 함수 수정 (isOwner 추가, currentUserId 매개변수)
- [x] `workers/src/services/chat.ts` - listUserChatRooms/listPublicChatRooms에 userId 전달
- [x] `workers/src/services/chat.ts` - joinChatRoom에 userId 전달
- [x] `workers/src/services/chat.ts` - leaveChatRoom 권한 체크 및 자동 삭제 로직 추가

### Phase 3: 프론트엔드 수정 ✅
- [x] `src/components/chat/ChatRoomList.jsx` - 방장 배지 UI 추가 (초록색 배지)
- [x] `src/components/chat/ChatWindow.jsx` - 나가기 권한 로직 개선 (확인 메시지, 에러 처리)

### Phase 4: 테스트 및 배포 (다음 단계)
- [ ] 로컬 마이그레이션 테스트
- [ ] API 응답 확인
- [ ] 프론트엔드 UI 확인
- [ ] 방장 권한 로직 테스트
- [ ] Workers 배포
- [ ] 프론트엔드 배포

## 진행 상황

### 2025-11-18 완료
- 현재 시스템 분석 완료
- 세션 시스템 확인 완료 (문제 없음 - host_user_id 이미 있음)
- 채팅방 생성자 구분 기능 설계 완료
- DB 마이그레이션 파일 작성 완료
- 백엔드 코드 수정 완료 (타입, 서비스, 권한 로직)
- 프론트엔드 UI 및 로직 개선 완료

## 기술 명세

### 데이터베이스 변경
```sql
-- chat_room 테이블에 created_by 추가
ALTER TABLE chat_room ADD COLUMN created_by TEXT;

-- 기존 데이터 마이그레이션
UPDATE chat_room
SET created_by = (
  SELECT user_id
  FROM chat_room_participant
  WHERE chat_room_participant.room_id = chat_room.room_id
  ORDER BY joined_at ASC
  LIMIT 1
);
```

### API 응답 변경
```typescript
// ChatRoomSummary 타입
interface ChatRoomSummary {
  roomId: number;
  roomName: string;
  roomType: string;
  isPublic: boolean;
  maxParticipants?: number;
  participants: ChatParticipant[];
  createdBy: string;      // 🆕 추가
  isOwner: boolean;       // 🆕 추가 (현재 사용자가 방장인지)
  lastMessage?: string;
  lastMessageAt?: string;
}
```

### UI 변경
- 채팅방 목록에 "방장" 배지 표시
- 방장의 채팅방 나가기 제한:
  - 다른 참여자가 있으면 나갈 수 없음
  - 마지막 참여자일 때만 나갈 수 있음 (채팅방 삭제)

## 참고 문서
- `docs/05-database/database.md` - 데이터베이스 스키마
- `docs/04-api/api.md` - API 명세
- `docs/06-frontend/frontend.md` - 프론트엔드 가이드
- `workers/d1/migrations/0006_extended_domains.sql` - 현재 chat_room 스키마

## 완료
(작업 완료 후 이동: `docs/99-logs/work-sessions/completed/`)
