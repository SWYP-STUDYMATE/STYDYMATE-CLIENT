import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';
import {
  listUserChatRooms,
  listPublicChatRooms,
  createChatRoom,
  joinChatRoom,
  leaveChatRoom,
  listRoomMessages,
  searchRoomMessages,
  uploadChatImages,
  uploadChatAudio,
  listMyChatFiles,
  deleteChatFile,
  markRoomMessagesAsRead,
  getUnreadCountForRoom,
  getTotalUnreadCount
} from '../services/chat';

const chatRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
const requireAuth = authMiddleware();

function requireUserId(userId: string | undefined): string {
  if (!userId) {
    throw new AppError('인증 정보가 필요합니다.', 401, 'UNAUTHORIZED');
  }
  return userId;
}

function parseRoomId(raw: string | undefined): number {
  const roomId = Number(raw);
  if (!Number.isFinite(roomId)) {
    throw new AppError('유효하지 않은 roomId 입니다.', 400, 'INVALID_ROOM_ID');
  }
  return roomId;
}

chatRoutes.use('*', requireAuth);

chatRoutes.get('/rooms', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const rooms = await listUserChatRooms(c.env, userId);
  return successResponse(c, rooms);
});

chatRoutes.get('/rooms/public', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const rooms = await listPublicChatRooms(c.env, userId);
  return successResponse(c, rooms);
});

chatRoutes.post('/rooms', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const body = await c.req.json().catch(() => ({}));
  const roomName = typeof body?.roomName === 'string' ? body.roomName : '';
  const participantIds = Array.isArray(body?.participantIds)
    ? body.participantIds.filter((id: unknown): id is string => typeof id === 'string')
    : [];
  const isPublic = Boolean(body?.isPublic);
  const roomType = typeof body?.roomType === 'string' ? body.roomType : undefined;
  const maxParticipants =
    typeof body?.maxParticipants === 'number' ? Number(body.maxParticipants) : undefined;

  const room = await createChatRoom(c.env, userId, roomName, participantIds, {
    isPublic,
    roomType,
    maxParticipants
  });
  try {
    const hubId = c.env.CHAT_HUB.idFromName('global');
    const hubStub = c.env.CHAT_HUB.get(hubId);
    const publish = (destination: string, payload: unknown, targetUserId?: string) =>
      hubStub.fetch('https://chat-hub/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, payload, userId: targetUserId })
      });

    if (room.isPublic) {
      await publish('/sub/chat/public-rooms', room);
    }

    if (Array.isArray(room.participants)) {
      await Promise.all(
        room.participants
          .filter((participant) => participant.userId)
          .map((participant) => publish('/user/queue/rooms', room, participant.userId))
      );
    }
  } catch (error) {
    console.error('[chatRoutes] Failed to publish room creation event', error);
  }
  return successResponse(c, room);
});

chatRoutes.post('/rooms/:roomId/join', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const roomId = parseRoomId(c.req.param('roomId'));
  const room = await joinChatRoom(c.env, roomId, userId);
  return successResponse(c, room);
});

chatRoutes.post('/rooms/:roomId/leave', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const roomId = parseRoomId(c.req.param('roomId'));
  await leaveChatRoom(c.env, roomId, userId);
  return successResponse(c, { success: true });
});

chatRoutes.get('/rooms/:roomId/messages', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const roomId = parseRoomId(c.req.param('roomId'));
  const page = Number(c.req.query('page') ?? '0');
  const size = Number(c.req.query('size') ?? '50');
  if (!Number.isFinite(page) || page < 0) {
    throw new AppError('page 값이 올바르지 않습니다.', 400, 'INVALID_PAGE_PARAM');
  }
  const perPage = Number.isFinite(size) && size > 0 ? Math.min(size, 200) : 50;
  const messages = await listRoomMessages(c.env, roomId, page, perPage);
  return successResponse(c, messages);
});

chatRoutes.get('/rooms/:roomId/messages/search', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const roomId = parseRoomId(c.req.param('roomId'));
  const keyword = c.req.query('keyword') ?? '';
  const page = Number(c.req.query('page') ?? '0');
  const size = Number(c.req.query('size') ?? '20');
  const perPage = Number.isFinite(size) && size > 0 ? Math.min(size, 100) : 20;
  const messages = await searchRoomMessages(c.env, roomId, keyword, page, perPage);
  return successResponse(c, messages);
});

chatRoutes.post('/rooms/:roomId/images', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const roomId = parseRoomId(c.req.param('roomId'));
  const formData = await c.req.formData();
  const entries = formData.getAll('files');
  const files = entries
    .filter((value) => typeof value === 'object' && value !== null && 'arrayBuffer' in (value as any))
    .map((value) => value as File);
  if (!files.length) {
    return successResponse(c, []);
  }
  const urls = await uploadChatImages(c.env, roomId, userId, files);
  return successResponse(c, urls);
});

chatRoutes.post('/upload/image', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const formData = await c.req.formData();
  const roomIdValue = formData.get('roomId');
  const roomId = typeof roomIdValue === 'string' ? Number(roomIdValue) : Number(roomIdValue);
  if (!Number.isFinite(roomId)) {
    throw new AppError('roomId가 필요합니다.', 400, 'INVALID_ROOM_ID');
  }
  const fileEntry = formData.get('image') ?? formData.get('file');
  if (!fileEntry || typeof fileEntry !== 'object' || !('arrayBuffer' in (fileEntry as any))) {
    throw new AppError('이미지 파일이 필요합니다.', 400, 'IMAGE_FILE_REQUIRED');
  }
  const file = fileEntry as File;
  const urls = await uploadChatImages(c.env, roomId, userId, [file]);
  const primary = urls.length > 0 ? urls[0] : null;
  return successResponse(c, { url: primary, urls });
});

chatRoutes.post('/rooms/:roomId/audio', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const roomId = parseRoomId(c.req.param('roomId'));
  const formData = await c.req.formData();
  const entry = formData.get('file');
  if (!entry || typeof entry !== 'object' || !('arrayBuffer' in (entry as any))) {
    throw new AppError('오디오 파일이 필요합니다.', 400, 'AUDIO_FILE_REQUIRED');
  }
  const file = entry as File;
  const url = await uploadChatAudio(c.env, roomId, userId, file);
  return successResponse(c, url);
});

chatRoutes.get('/files/my-files', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const files = await listMyChatFiles(c.env, userId);
  return successResponse(c, files);
});

chatRoutes.delete('/files/:fileId', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const fileId = Number(c.req.param('fileId'));
  if (!Number.isFinite(fileId)) {
    throw new AppError('파일 ID가 올바르지 않습니다.', 400, 'INVALID_FILE_ID');
  }
  await deleteChatFile(c.env, userId, fileId);
  return successResponse(c, { success: true });
});

chatRoutes.post('/read-status/rooms/:roomId/read-all', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const roomId = parseRoomId(c.req.param('roomId'));
  await markRoomMessagesAsRead(c.env, roomId, userId);
  return successResponse(c, { success: true });
});

chatRoutes.get('/read-status/rooms/:roomId/unread-count', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const roomId = parseRoomId(c.req.param('roomId'));
  const count = await getUnreadCountForRoom(c.env, roomId, userId);
  return successResponse(c, count);
});

chatRoutes.get('/read-status/total-unread-count', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const count = await getTotalUnreadCount(c.env, userId);
  return successResponse(c, count);
});

export default chatRoutes;
