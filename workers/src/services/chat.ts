import type { Env } from '../index';
import type {
  ChatRoomSummary,
  ChatParticipant,
  ChatMessageResponseType,
  ChatFileResponseType,
  ChatMessageType
} from '../types';
import { query, queryFirst, execute, transaction } from '../utils/db';
import { AppError } from '../utils/errors';
import { saveToR2, generateUniqueFileName } from './storage';
import { createNotification } from './notifications';

function nowIso(): string {
  return new Date().toISOString();
}

interface ChatRoomRow {
  room_id: number;
  room_name: string;
  room_type: string;
  is_public: number;
  max_participants: number | null;
  created_at: string;
  updated_at: string;
}

interface ParticipantRow {
  room_id: number;
  user_id: string;
  joined_at: string;
  name: string | null;
  profile_image: string | null;
}

interface MessageRow {
  message_id: number;
  room_id: number;
  user_id: string;
  message: string | null;
  audio_url: string | null;
  created_at: string;
  name: string | null;
  profile_image: string | null;
}

export interface ChatMessageCreatePayload {
  roomId: number;
  message?: string;
  imageUrls?: string[];
  audioData?: string;
  audioUrl?: string;
  messageType?: ChatMessageType;
}

interface ImageRow {
  message_id: number;
  image_url: string;
}

interface FileRow {
  file_id: number;
  message_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_url: string | null;
  file_size: number;
  content_type: string | null;
  file_type: string;
  thumbnail_url: string | null;
  duration: number | null;
  is_deleted: number;
  created_at: string;
}

function toBoolean(value: number | boolean | null | undefined): boolean {
  return value === 1 || value === true;
}

function mapParticipant(row: ParticipantRow): ChatParticipant {
  return {
    userId: row.user_id,
    name: row.name ?? undefined,
    profileImage: row.profile_image ?? undefined
  };
}

async function fetchParticipants(env: Env, roomId: number): Promise<ChatParticipant[]> {
  const rows = await query<ParticipantRow>(
    env.DB,
    `SELECT p.room_id, p.user_id, p.joined_at, u.name, u.profile_image
       FROM chat_room_participant p
       LEFT JOIN users u ON u.user_id = p.user_id
      WHERE p.room_id = ?
      ORDER BY p.joined_at ASC`,
    [roomId]
  );
  return rows.map(mapParticipant);
}

function computeMessageType(row: MessageRow, images: ImageRow[], files: ChatFileResponseType[]): ChatMessageType {
  const hasText = Boolean(row.message && row.message.trim().length > 0);
  const hasImages = images.length > 0;
  const hasAudio = Boolean(row.audio_url);
  const hasFiles = files.length > 0;

  if (hasAudio && !hasImages && !hasText && !hasFiles) return 'AUDIO';
  if (hasImages && !hasAudio && !hasText && !hasFiles) return 'IMAGE';
  if (hasFiles && !hasAudio && !hasImages && !hasText) return 'FILE';
  if (hasText && !hasAudio && !hasImages && !hasFiles) return 'TEXT';
  return 'MIXED';
}

function mapFile(row: FileRow): ChatFileResponseType {
  return {
    fileId: row.file_id,
    originalFilename: row.original_filename,
    fileUrl: row.file_url ?? `/api/v1/upload/file/${row.file_path}`,
    fileType: row.file_type,
    contentType: row.content_type ?? undefined,
    fileSize: row.file_size ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    duration: row.duration ?? undefined,
    createdAt: row.created_at
  };
}

function mapMessage(
  row: MessageRow,
  images: ImageRow[],
  files: ChatFileResponseType[]
): ChatMessageResponseType {
  const participant: ChatParticipant = {
    userId: row.user_id,
    name: row.name ?? undefined,
    profileImage: row.profile_image ?? undefined
  };

  return {
    messageId: row.message_id,
    roomId: row.room_id,
    sender: participant,
    message: row.message ?? undefined,
    imageUrls: images.map((img) => img.image_url),
    audioUrl: row.audio_url ?? undefined,
    audioDuration: undefined,
    files,
    messageType: computeMessageType(row, images, files),
    sentAt: row.created_at
  };
}

async function ensureRoomExists(env: Env, roomId: number): Promise<ChatRoomRow> {
  const row = await queryFirst<ChatRoomRow>(
    env.DB,
    'SELECT * FROM chat_room WHERE room_id = ? LIMIT 1',
    [roomId]
  );
  if (!row) {
    throw new AppError('채팅방을 찾을 수 없습니다.', 404, 'CHAT_ROOM_NOT_FOUND');
  }
  return row;
}

async function mapRoom(env: Env, room: ChatRoomRow): Promise<ChatRoomSummary> {
  const participants = await fetchParticipants(env, room.room_id);
  const lastMessageRow = await queryFirst<{ message: string | null; created_at: string | null }>(
    env.DB,
    `SELECT m.message, m.created_at
       FROM chat_message m
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT 1`,
    [room.room_id]
  );

  return {
    roomId: room.room_id,
    roomName: room.room_name,
    roomType: room.room_type,
    isPublic: toBoolean(room.is_public),
    maxParticipants: room.max_participants ?? undefined,
    participants,
    lastMessage: lastMessageRow?.message ?? undefined,
    lastMessageAt: lastMessageRow?.created_at ?? undefined
  };
}

export async function listUserChatRooms(env: Env, userId: string): Promise<ChatRoomSummary[]> {
  const rows = await query<ChatRoomRow>(
    env.DB,
    `SELECT r.*
       FROM chat_room r
       JOIN chat_room_participant p ON p.room_id = r.room_id
      WHERE p.user_id = ?
      ORDER BY r.updated_at DESC, r.created_at DESC`,
    [userId]
  );

  const summaries: ChatRoomSummary[] = [];
  for (const row of rows) {
    summaries.push(await mapRoom(env, row));
  }
  return summaries;
}

export async function listPublicChatRooms(env: Env, userId: string): Promise<ChatRoomSummary[]> {
  const rows = await query<ChatRoomRow>(
    env.DB,
    `SELECT r.*
       FROM chat_room r
      WHERE r.is_public = 1
        AND r.room_id NOT IN (SELECT room_id FROM chat_room_participant WHERE user_id = ?)
      ORDER BY r.created_at DESC`,
    [userId]
  );

  const summaries: ChatRoomSummary[] = [];
  for (const row of rows) {
    summaries.push(await mapRoom(env, row));
  }
  return summaries;
}

export async function createChatRoom(
  env: Env,
  creatorId: string,
  roomName: string,
  participantIds: string[] = [],
  options?: { isPublic?: boolean; roomType?: string; maxParticipants?: number }
): Promise<ChatRoomSummary> {
  if (!roomName?.trim()) {
    throw new AppError('채팅방 이름은 필수입니다.', 400, 'INVALID_ROOM_NAME');
  }

  const now = new Date().toISOString();
  const isPublic = options?.isPublic ? 1 : 0;
  const roomType = options?.roomType ?? 'GROUP';
  const maxParticipants = options?.maxParticipants ?? null;

  await execute(
    env.DB,
    `INSERT INTO chat_room (room_name, room_type, is_public, max_participants, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
    [roomName.trim(), roomType, isPublic, maxParticipants, now, now]
  );

  const roomIdRow = await queryFirst<{ id: number }>(env.DB, 'SELECT last_insert_rowid() as id');
  const roomId = Number(roomIdRow?.id ?? 0);
  if (!roomId) {
    throw new AppError('채팅방을 생성할 수 없습니다.', 500, 'CHAT_ROOM_CREATE_FAILED');
  }

  const uniqueIds = new Set<string>([creatorId, ...participantIds]);
  const statements = Array.from(uniqueIds).map((id) => ({
    sql: `INSERT OR IGNORE INTO chat_room_participant (room_id, user_id, joined_at)
            VALUES (?, ?, ?)`,
    params: [roomId, id, now]
  }));
  await transaction(env.DB, statements);

  const room = await ensureRoomExists(env, roomId);
  return mapRoom(env, room);
}

export async function joinChatRoom(env: Env, roomId: number, userId: string): Promise<ChatRoomSummary> {
  const room = await ensureRoomExists(env, roomId);
  const now = new Date().toISOString();
  await execute(
    env.DB,
    `INSERT OR IGNORE INTO chat_room_participant (room_id, user_id, joined_at)
      VALUES (?, ?, ?)`,
    [roomId, userId, now]
  );
  return mapRoom(env, room);
}

export async function leaveChatRoom(env: Env, roomId: number, userId: string): Promise<void> {
  await ensureRoomExists(env, roomId);
  await execute(
    env.DB,
    'DELETE FROM chat_room_participant WHERE room_id = ? AND user_id = ?',
    [roomId, userId]
  );
}

export async function listRoomMessages(
  env: Env,
  roomId: number,
  page: number,
  size: number
): Promise<ChatMessageResponseType[]> {
  await ensureRoomExists(env, roomId);
  const offset = Math.max(page, 0) * size;

  const messageRows = await query<MessageRow>(
    env.DB,
    `SELECT m.*, u.name, u.profile_image
       FROM chat_message m
       LEFT JOIN users u ON u.user_id = m.user_id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?`,
    [roomId, size, offset]
  );

  const messageIds = messageRows.map((row) => row.message_id);
  if (messageIds.length === 0) {
    return [];
  }

  const imageRows = await query<ImageRow>(
    env.DB,
    `SELECT message_id, image_url
       FROM chat_image
      WHERE message_id IN (${messageIds.map(() => '?').join(',')})`,
    messageIds
  );

  const fileRows = await query<FileRow>(
    env.DB,
    `SELECT f.*
       FROM chat_files f
      WHERE f.message_id IN (${messageIds.map(() => '?').join(',')})
        AND f.is_deleted = 0`,
    messageIds
  );

  const imageMap = new Map<number, ImageRow[]>();
  for (const img of imageRows) {
    const list = imageMap.get(img.message_id) ?? [];
    list.push(img);
    imageMap.set(img.message_id, list);
  }

  const fileMap = new Map<number, ChatFileResponseType[]>();
  for (const file of fileRows) {
    const mapped = mapFile(file);
    const list = fileMap.get(file.message_id) ?? [];
    list.push(mapped);
    fileMap.set(file.message_id, list);
  }

  const messages = messageRows
    .map((row) => {
      const images = imageMap.get(row.message_id) ?? [];
      const files = fileMap.get(row.message_id) ?? [];
      return mapMessage(row, images, files);
    })
    .reverse();

  return messages;
}

export async function searchRoomMessages(
  env: Env,
  roomId: number,
  keyword: string,
  page: number,
  size: number
): Promise<ChatMessageResponseType[]> {
  await ensureRoomExists(env, roomId);
  if (!keyword?.trim()) {
    return [];
  }

  const offset = Math.max(page, 0) * size;
  const messageRows = await query<MessageRow>(
    env.DB,
    `SELECT m.*, u.name, u.profile_image
       FROM chat_message m
       LEFT JOIN users u ON u.user_id = m.user_id
      WHERE m.room_id = ? AND m.message LIKE ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?`,
    [roomId, `%${keyword}%`, size, offset]
  );

  const messageIds = messageRows.map((row) => row.message_id);
  if (messageIds.length === 0) {
    return [];
  }

  const imageRows = await query<ImageRow>(
    env.DB,
    `SELECT message_id, image_url
       FROM chat_image
      WHERE message_id IN (${messageIds.map(() => '?').join(',')})`,
    messageIds
  );

  const fileRows = await query<FileRow>(
    env.DB,
    `SELECT f.*
       FROM chat_files f
      WHERE f.message_id IN (${messageIds.map(() => '?').join(',')})
        AND f.is_deleted = 0`,
    messageIds
  );

  const imageMap = new Map<number, ImageRow[]>();
  for (const img of imageRows) {
    const list = imageMap.get(img.message_id) ?? [];
    list.push(img);
    imageMap.set(img.message_id, list);
  }

  const fileMap = new Map<number, ChatFileResponseType[]>();
  for (const file of fileRows) {
    const mapped = mapFile(file);
    const list = fileMap.get(file.message_id) ?? [];
    list.push(mapped);
    fileMap.set(file.message_id, list);
  }

  return messageRows
    .map((row) => mapMessage(row, imageMap.get(row.message_id) ?? [], fileMap.get(row.message_id) ?? []))
    .reverse();
}

export async function uploadChatImages(
  env: Env,
  roomId: number,
  userId: string,
  files: File[]
): Promise<string[]> {
  await ensureRoomExists(env, roomId);
  const participant = await queryFirst(
    env.DB,
    'SELECT 1 FROM chat_room_participant WHERE room_id = ? AND user_id = ? LIMIT 1',
    [roomId, userId]
  );
  if (!participant) {
    throw new AppError('채팅방에 참여하지 않은 사용자입니다.', 403, 'CHAT_ROOM_FORBIDDEN');
  }

  if (!files.length) {
    return [];
  }

  const urls: string[] = [];
  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const key = `chat/${roomId}/images/${generateUniqueFileName(file.name, userId)}`;
    await saveToR2(env.STORAGE, key, buffer, file.type, {
      roomId: String(roomId),
      uploader: userId,
      fileName: file.name
    });
    const url = `/api/v1/upload/file/${key}`;
    urls.push(url);
  }

  return urls;
}

export async function uploadChatAudio(
  env: Env,
  roomId: number,
  userId: string,
  file: File
): Promise<string> {
  await ensureRoomExists(env, roomId);
  const participant = await queryFirst(
    env.DB,
    'SELECT 1 FROM chat_room_participant WHERE room_id = ? AND user_id = ? LIMIT 1',
    [roomId, userId]
  );
  if (!participant) {
    throw new AppError('채팅방에 참여하지 않은 사용자입니다.', 403, 'CHAT_ROOM_FORBIDDEN');
  }

  const buffer = await file.arrayBuffer();
  const key = `chat/${roomId}/audio/${generateUniqueFileName(file.name, userId)}`;
  await saveToR2(env.STORAGE, key, buffer, file.type, {
    roomId: String(roomId),
    uploader: userId,
    fileName: file.name
  });
  return `/api/v1/upload/file/${key}`;
}

export async function listMyChatFiles(env: Env, userId: string): Promise<ChatFileResponseType[]> {
  const rows = await query<FileRow>(
    env.DB,
    `SELECT f.*
       FROM chat_files f
       JOIN chat_message m ON m.message_id = f.message_id
      WHERE m.user_id = ? AND f.is_deleted = 0
      ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows.map(mapFile);
}

export async function deleteChatFile(env: Env, userId: string, fileId: number): Promise<void> {
  const row = await queryFirst<FileRow>(
    env.DB,
    `SELECT f.*
       FROM chat_files f
       JOIN chat_message m ON m.message_id = f.message_id
      WHERE f.file_id = ?
      LIMIT 1`,
    [fileId]
  );
  if (!row) {
    throw new AppError('파일을 찾을 수 없습니다.', 404, 'CHAT_FILE_NOT_FOUND');
  }
  const messageOwner = await queryFirst<{ user_id: string }>(
    env.DB,
    'SELECT user_id FROM chat_message WHERE message_id = ? LIMIT 1',
    [row.message_id]
  );
  if (messageOwner?.user_id !== userId) {
    throw new AppError('본인이 업로드한 파일만 삭제할 수 있습니다.', 403, 'CHAT_FILE_FORBIDDEN');
  }
  await execute(
    env.DB,
    'UPDATE chat_files SET is_deleted = 1, updated_at = ? WHERE file_id = ?',
    [new Date().toISOString(), fileId]
  );
}

function parseDataUrl(base64DataUrl: string): { contentType: string; buffer: ArrayBuffer } {
  const match = base64DataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    throw new AppError('잘못된 오디오 데이터입니다.', 400, 'INVALID_AUDIO_DATA');
  }
  const contentType = match[1];
  const base64 = match[2];
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return { contentType, buffer: bytes.buffer };
}

export async function createChatMessage(
  env: Env,
  userId: string,
  payload: ChatMessageCreatePayload
): Promise<ChatMessageResponseType> {
  const roomId = Number(payload.roomId);
  if (!Number.isFinite(roomId)) {
    throw new AppError('roomId가 필요합니다.', 400, 'INVALID_ROOM_ID');
  }

  const room = await queryFirst<ChatRoomRow>(
    env.DB,
    'SELECT * FROM chat_room WHERE room_id = ? LIMIT 1',
    [roomId]
  );
  if (!room) {
    throw new AppError('채팅방을 찾을 수 없습니다.', 404, 'CHAT_ROOM_NOT_FOUND');
  }

  const participant = await queryFirst(
    env.DB,
    'SELECT 1 FROM chat_room_participant WHERE room_id = ? AND user_id = ? LIMIT 1',
    [roomId, userId]
  );
  if (!participant) {
    throw new AppError('채팅방에 참여하지 않았습니다.', 403, 'CHAT_ROOM_FORBIDDEN');
  }

  const now = nowIso();
  const messageText = typeof payload.message === 'string' && payload.message.trim().length > 0
    ? payload.message.trim()
    : null;
  const imageUrls = Array.isArray(payload.imageUrls)
    ? payload.imageUrls.filter((url): url is string => typeof url === 'string' && url.length > 0)
    : [];

  let audioUrl = payload.audioUrl ?? null;
  if (!audioUrl && typeof payload.audioData === 'string' && payload.audioData.startsWith('data:')) {
    const { contentType, buffer } = parseDataUrl(payload.audioData);
    const key = `chat/${roomId}/audio/${generateUniqueFileName('voice-message.webm', userId)}`;
    await saveToR2(env.STORAGE, key, buffer, contentType, {
      roomId: String(roomId),
      uploader: userId,
      type: 'voice-message'
    });
    audioUrl = `/api/v1/upload/file/${key}`;
  }

  if (!messageText && !imageUrls.length && !audioUrl) {
    throw new AppError('메시지 내용이 없습니다.', 400, 'EMPTY_MESSAGE');
  }

  await execute(
    env.DB,
    `INSERT INTO chat_message (
        room_id,
        user_id,
        message,
        audio_url,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    [roomId, userId, messageText ?? null, audioUrl, now, now]
  );

  const messageIdRow = await queryFirst<{ id: number }>(env.DB, 'SELECT last_insert_rowid() as id');
  const messageId = Number(messageIdRow?.id ?? 0);
  if (!messageId) {
    throw new AppError('메시지를 저장할 수 없습니다.', 500, 'CHAT_MESSAGE_CREATE_FAILED');
  }

  if (imageUrls.length) {
    for (const url of imageUrls) {
      await execute(
        env.DB,
        `INSERT INTO chat_image (message_id, image_url, created_at, updated_at)
          VALUES (?, ?, ?, ?)`,
        [messageId, url, now, now]
      );
    }
  }

  await execute(
    env.DB,
    'UPDATE chat_room SET updated_at = ? WHERE room_id = ?',
    [now, roomId]
  );

  const messageRow = await queryFirst<MessageRow>(
    env.DB,
    `SELECT m.*, u.name, u.profile_image
       FROM chat_message m
       LEFT JOIN users u ON u.user_id = m.user_id
      WHERE m.message_id = ?
      LIMIT 1`,
    [messageId]
  );
  if (!messageRow) {
    throw new AppError('메시지를 조회할 수 없습니다.', 500, 'CHAT_MESSAGE_LOAD_FAILED');
  }

  const images = await query<ImageRow>(
    env.DB,
    'SELECT message_id, image_url FROM chat_image WHERE message_id = ?',
    [messageId]
  );

  const files = await query<FileRow>(
    env.DB,
    'SELECT * FROM chat_files WHERE message_id = ? AND is_deleted = 0',
    [messageId]
  );

  const mappedFiles = files.map(mapFile);
  const chatMessage = mapMessage(messageRow, images, mappedFiles);

  // 채팅방의 다른 참여자들에게 알림 전송
  try {
    console.log('[createChatMessage] Sending notifications to room participants');

    // 발신자 정보 조회
    const senderInfo = await queryFirst<{
      english_name: string | null;
      name: string | null;
    }>(
      env.DB,
      'SELECT english_name, name FROM users WHERE user_id = ? LIMIT 1',
      [userId]
    );

    const senderName = senderInfo?.english_name || senderInfo?.name || '익명의 사용자';

    // 채팅방의 다른 참여자 ID 조회 (발신자 제외)
    const otherParticipants = await query<{ user_id: string }>(
      env.DB,
      'SELECT user_id FROM chat_room_participant WHERE room_id = ? AND user_id != ?',
      [roomId, userId]
    );

    // 메시지 내용 요약 (최대 50자)
    let contentPreview = messageText || '';
    if (!contentPreview && audioUrl) {
      contentPreview = '음성 메시지';
    } else if (!contentPreview && imageUrls.length > 0) {
      contentPreview = '이미지';
    }
    if (contentPreview.length > 50) {
      contentPreview = contentPreview.substring(0, 50) + '...';
    }

    // 각 참여자에게 알림 전송
    for (const participant of otherParticipants) {
      try {
        await createNotification(env, {
          userId: participant.user_id,
          type: 'CHAT_MESSAGE',
          title: `${room.room_name}`,
          content: `${senderName}: ${contentPreview}`,
          category: 'chat',
          priority: 1,
          actionUrl: `/chat/${roomId}`,
          actionData: {
            roomId,
            messageId,
            senderId: userId,
            senderName
          },
          senderUserId: userId
        });
      } catch (notificationError) {
        console.error('[createChatMessage] Failed to send notification to participant:', {
          error: notificationError instanceof Error ? notificationError.message : String(notificationError),
          participantId: participant.user_id
        });
      }
    }

    console.log('[createChatMessage] Notifications sent to', otherParticipants.length, 'participants');
  } catch (notificationError) {
    // 알림 전송 실패는 로깅만 하고 메시지 생성은 성공 처리
    console.error('[createChatMessage] Failed to send notifications:', {
      error: notificationError instanceof Error ? notificationError.message : String(notificationError),
      roomId,
      messageId
    });
  }

  return chatMessage;
}

export async function markRoomMessagesAsRead(env: Env, roomId: number, userId: string): Promise<void> {
  await ensureRoomExists(env, roomId);
  const messageIds = await query<{ message_id: number }>(
    env.DB,
    'SELECT message_id FROM chat_message WHERE room_id = ? AND user_id != ?',
    [roomId, userId]
  );
  if (!messageIds.length) {
    return;
  }
  const now = new Date().toISOString();
  const statements = messageIds.map(({ message_id }) => ({
    sql: `INSERT OR REPLACE INTO message_read_status (message_id, user_id, read_at, is_deleted, created_at, updated_at)
            VALUES (?, ?, ?, 0, ?, ?)`,
    params: [message_id, userId, now, now, now]
  }));
  await transaction(env.DB, statements);
}

export async function getUnreadCountForRoom(env: Env, roomId: number, userId: string): Promise<number> {
  await ensureRoomExists(env, roomId);
  const row = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count
       FROM chat_message m
      WHERE m.room_id = ?
        AND m.user_id != ?
        AND m.message_id NOT IN (
          SELECT message_id FROM message_read_status
           WHERE user_id = ? AND is_deleted = 0
        )`,
    [roomId, userId, userId]
  );
  return row?.count ?? 0;
}

export async function getTotalUnreadCount(env: Env, userId: string): Promise<number> {
  const row = await queryFirst<{ count: number }>(
    env.DB,
    `SELECT COUNT(*) as count
       FROM chat_message m
      WHERE m.user_id != ?
        AND m.message_id NOT IN (
          SELECT message_id FROM message_read_status WHERE user_id = ? AND is_deleted = 0
        )`,
    [userId, userId]
  );
  return row?.count ?? 0;
}
