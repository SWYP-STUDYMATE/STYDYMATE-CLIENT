import { z } from 'zod';

/**
 * Chat 관련 Zod 스키마
 */

// 채팅 메시지 스키마
export const chatMessageSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  roomId: z.string(),
  senderUserId: z.string(),
  messageType: z.enum(['text', 'image', 'audio', 'file']),
  content: z.string().optional(),
  translatedContent: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().int().min(0).optional(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
});

// 채팅방 스키마
export const chatRoomSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  roomType: z.enum(['direct', 'group']),
  roomName: z.string().optional(),
  participantIds: z.array(z.string()),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastMessageAt: z.string().datetime().optional().nullable(),
});

// 메시지 전송 요청
export const sendMessageSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
  content: z.string().min(1, 'Message content is required').max(5000, 'Message too long'),
  messageType: z.enum(['text', 'image', 'audio', 'file']).default('text'),
  fileUrl: z.string().url().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().int().min(0).optional(),
});

// 메시지 수정 요청
export const editMessageSchema = z.object({
  messageId: z.string().uuid('Invalid message ID'),
  content: z.string().min(1).max(5000),
});

// 메시지 삭제 요청
export const deleteMessageSchema = z.object({
  messageId: z.string().uuid('Invalid message ID'),
});

// 채팅방 생성 요청
export const createRoomSchema = z.object({
  roomType: z.enum(['direct', 'group']),
  roomName: z.string().min(1).max(100).optional(),
  participantIds: z
    .array(z.string().uuid())
    .min(1, 'At least one participant is required')
    .max(50, 'Maximum 50 participants allowed'),
});

// 채팅방 조회 필터
export const getRoomsFilterSchema = z.object({
  roomType: z.enum(['direct', 'group']).optional(),
  isActive: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

// 메시지 조회 필터
export const getMessagesFilterSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  before: z.string().datetime().optional(),
  after: z.string().datetime().optional(),
});

// 번역 요청
export const translateMessageSchema = z.object({
  messageId: z.string().uuid('Invalid message ID'),
  targetLanguage: z.string().min(2).max(10),
});

// Type exports
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRoom = z.infer<typeof chatRoomSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type GetRoomsFilter = z.infer<typeof getRoomsFilterSchema>;
export type GetMessagesFilter = z.infer<typeof getMessagesFilterSchema>;
export type TranslateMessageInput = z.infer<typeof translateMessageSchema>;
