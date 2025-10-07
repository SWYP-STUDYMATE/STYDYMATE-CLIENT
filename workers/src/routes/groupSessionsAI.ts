import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';
import {
  recommendSessionTopics,
  analyzeConversationTranscript,
  generateSessionSummary,
  generateIcebreakers,
  generateRoleplayScenario,
  translateExpression,
  recommendSessionMatches
} from '../services/groupSessionsAI';

const aiRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
const requireAuth = authMiddleware();

aiRoutes.use('*', requireAuth);

const recommendSchema = z.object({
  language: z.string().min(1).default('English'),
  level: z.string().min(1).optional(),
  interests: z.array(z.string().min(1)).optional(),
  participantCount: z.number().int().positive().optional()
});

aiRoutes.post('/recommend-topics', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = recommendSchema.parse(payload);
  const result = await recommendSessionTopics(c.env, userId, input);
  return successResponse(c, result);
});

const analysisSchema = z.object({
  transcript: z.string().min(5),
  language: z.string().min(1).optional(),
  participantId: z.string().min(1).optional()
});

aiRoutes.post('/analyze-conversation', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = analysisSchema.parse(payload);
  const result = await analyzeConversationTranscript(c.env, userId, input);
  return successResponse(c, result);
});

const summarySchema = z.object({
  sessionId: z.string().optional(),
  transcript: z.string().min(5),
  duration: z.number().int().positive().optional(),
  language: z.string().min(1).optional(),
  participants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        role: z.string().optional()
      })
    )
    .optional()
});

aiRoutes.post('/generate-summary', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = summarySchema.parse(payload);
  const result = await generateSessionSummary(c.env, userId, input);
  return successResponse(c, result);
});

const icebreakerSchema = z.object({
  language: z.string().optional(),
  level: z.string().optional(),
  topic: z.string().optional()
});

aiRoutes.post('/icebreakers', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = icebreakerSchema.parse(payload);
  const result = await generateIcebreakers(c.env, userId, input);
  return successResponse(c, result);
});

const roleplaySchema = z.object({
  language: z.string().optional(),
  level: z.string().optional(),
  situation: z.string().optional(),
  participantRoles: z.array(z.string()).optional()
});

aiRoutes.post('/roleplay', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = roleplaySchema.parse(payload);
  const result = await generateRoleplayScenario(c.env, userId, input);
  return successResponse(c, result);
});

const translateSchema = z.object({
  text: z.string().min(1),
  fromLanguage: z.string().optional(),
  toLanguage: z.string().min(1)
});

aiRoutes.post('/translate', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = translateSchema.parse(payload);
  const result = await translateExpression(c.env, userId, input);
  return successResponse(c, result);
});

const matchSchema = z.object({
  userId: z.string().min(1),
  userProfile: z.record(z.unknown()).optional(),
  availableSessions: z.array(z.record(z.unknown())).optional()
});

aiRoutes.post('/match-recommendation', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  }
  const payload = await c.req.json().catch(() => ({}));
  const input = matchSchema.parse(payload);
  const result = await recommendSessionMatches(c.env, userId, input);
  return successResponse(c, result);
});

export default aiRoutes;
