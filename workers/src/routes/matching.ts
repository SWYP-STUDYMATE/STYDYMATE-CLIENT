import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse, paginatedResponse } from '../utils/response';
import {
  recommendPartners,
  createMatchingRequest,
  listSentRequests,
  listReceivedRequests,
  acceptMatchingRequest,
  rejectMatchingRequest,
  listMatches,
  removeMatch,
  addToMatchingQueue,
  removeFromMatchingQueue,
  getMatchingQueueStatus,
  recordFeedback,
  calculateCompatibilityAnalysis
} from '../services/matching';
import {
  findBestMatches,
  calculateAIMatchScore,
  type MatchingPreferences
} from '../services/aiMatching';
import { getUserProfile } from '../services/user';

const matchingRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

const requireAuth = authMiddleware();

function getPaginationParams(c: any) {
  const page = Math.max(Number(c.req.query('page') ?? '1'), 1);
  const size = Math.max(Math.min(Number(c.req.query('size') ?? '20'), 50), 1);
  return { page, size };
}

matchingRoutes.use('*', requireAuth);

async function getMatchingSettings(env: Env, userId: string) {
  const key = `matching:settings:${userId}`;
  const stored = await env.CACHE.get(key, { type: 'json' }) as Record<string, unknown> | null;
  if (stored) {
    return stored;
  }
  return {
    autoAcceptMatches: false,
    showOnlineStatus: true,
    allowMatchRequests: true,
    preferredAgeRange: null,
    preferredGenders: [],
    preferredNationalities: [],
    preferredLanguages: [],
    maxDistance: null,
    notificationSettings: {
      matchFound: true,
      requestReceived: true
    }
  };
}

matchingRoutes.get('/partners', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');

  const { page, size } = getPaginationParams(c);
  try {
    const result = await recommendPartners(c.env, userId, {
      nativeLanguage: c.req.query('nativeLanguage') || undefined,
      targetLanguage: c.req.query('targetLanguage') || undefined,
      languageLevel: c.req.query('languageLevel') || undefined,
      minAge: c.req.query('minAge') ? Number(c.req.query('minAge')) : undefined,
      maxAge: c.req.query('maxAge') ? Number(c.req.query('maxAge')) : undefined,
      page,
      size
    });
    return paginatedResponse(c, result.data, {
      page: result.page,
      limit: result.size,
      total: result.total
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error instanceof Error ? error.message : 'Failed to load partners',
      500,
      'MATCHING_PARTNERS_FAILED'
    );
  }
});

matchingRoutes.post('/partners/advanced', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');

  const filters = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const { page, size } = getPaginationParams(c);

  try {
    const result = await recommendPartners(c.env, userId, {
      nativeLanguage: typeof filters.nativeLanguage === 'string' ? filters.nativeLanguage : undefined,
      targetLanguage: typeof filters.targetLanguage === 'string' ? filters.targetLanguage : undefined,
      languageLevel: typeof filters.proficiencyLevel === 'string' ? filters.proficiencyLevel : undefined,
      minAge: typeof filters.minAge === 'number' ? filters.minAge : undefined,
      maxAge: typeof filters.maxAge === 'number' ? filters.maxAge : undefined,
      page,
      size
    });
    return paginatedResponse(c, result.data, {
      page: result.page,
      limit: result.size,
      total: result.total
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error instanceof Error ? error.message : 'Failed to search partners',
      500,
      'MATCHING_SEARCH_FAILED'
    );
  }
});

matchingRoutes.post('/request', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    console.error('[POST /matching/request] User ID not found in context');
    throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch (parseError) {
    console.error('[POST /matching/request] JSON parse error:', parseError);
    throw new AppError('Invalid request body', 400, 'INVALID_JSON');
  }

  console.log('[POST /matching/request] Request details:', JSON.stringify({
    targetUserId: body.targetUserId,
    hasMessage: !!body.message,
    messageLength: body.message?.length,
    userId
  }));

  if (typeof body.targetUserId !== 'string' || !body.targetUserId.trim()) {
    throw new AppError('targetUserId is required and must be a valid string', 400, 'INVALID_PAYLOAD');
  }

  try {
    const result = await createMatchingRequest(c.env, {
      senderId: userId,
      receiverId: body.targetUserId.trim(),
      message: typeof body.message === 'string' ? body.message.trim() : undefined
    });

    console.log('[POST /matching/request] Success:', {
      requestId: result.requestId,
      senderId: userId,
      receiverId: body.targetUserId
    });

    return successResponse(c, {
      success: true,
      requestId: result.requestId
    });
  } catch (error) {
    console.error('[POST /matching/request] Error caught:', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      isAppError: error instanceof AppError,
      statusCode: error instanceof AppError ? error.statusCode : undefined,
      errorCode: error instanceof AppError ? error.code : undefined,
      userId,
      targetUserId: body.targetUserId
    });

    // AppError는 그대로 throw (적절한 status code와 함께)
    if (error instanceof AppError) {
      throw error;
    }

    // 기타 에러는 500으로 래핑 (예상치 못한 에러이므로)
    throw new AppError(
      error instanceof Error ? error.message : 'Failed to send matching request',
      500,
      'MATCHING_REQUEST_FAILED'
    );
  }
});

matchingRoutes.get('/requests/sent', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const { page, size } = getPaginationParams(c);
  const result = await listSentRequests(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

matchingRoutes.get('/requests/received', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const { page, size } = getPaginationParams(c);
  const result = await listReceivedRequests(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

matchingRoutes.post('/accept/:requestId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const requestId = c.req.param('requestId');
  const body = (await c.req.json().catch(() => ({}))) as { responseMessage?: string };
  try {
    await acceptMatchingRequest(c.env, {
      requestId,
      receiverId: userId,
      responseMessage: body.responseMessage
    });
    return successResponse(c, { success: true });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error instanceof Error ? error.message : 'Failed to accept matching request',
      400,
      'MATCHING_ACCEPT_FAILED'
    );
  }
});

matchingRoutes.post('/reject/:requestId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const requestId = c.req.param('requestId');
  const body = (await c.req.json().catch(() => ({}))) as { responseMessage?: string };
  try {
    await rejectMatchingRequest(c.env, {
      requestId,
      receiverId: userId,
      responseMessage: body.responseMessage
    });
    return successResponse(c, { success: true });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error instanceof Error ? error.message : 'Failed to reject matching request',
      400,
      'MATCHING_REJECT_FAILED'
    );
  }
});

matchingRoutes.get('/matches', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const { page, size } = getPaginationParams(c);
  const result = await listMatches(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

matchingRoutes.delete('/matches/:matchId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const matchId = c.req.param('matchId');
  await removeMatch(c.env, { matchId, userId });
  return successResponse(c, { success: true });
});

matchingRoutes.post('/queue', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const sessionType = typeof body.sessionType === 'string' ? body.sessionType : 'ANY';
  await addToMatchingQueue(c.env, userId, sessionType);
  return successResponse(c, { success: true });
});

matchingRoutes.delete('/queue', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  await removeFromMatchingQueue(c.env, userId);
  return successResponse(c, { success: true });
});

matchingRoutes.get('/queue/status', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const status = await getMatchingQueueStatus(c.env, userId);
  return successResponse(c, status ?? {});
});

matchingRoutes.get('/history', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const { page, size } = getPaginationParams(c);
  const result = await listMatches(c.env, userId, page, size);
  return paginatedResponse(c, result.data, {
    page: result.page,
    limit: result.size,
    total: result.total
  });
});

matchingRoutes.post('/feedback', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  if (typeof body.partnerId !== 'string' || typeof body.matchId !== 'string' || typeof body.overallRating !== 'number') {
    throw new AppError('partnerId, matchId, overallRating are required', 400, 'INVALID_PAYLOAD');
  }
  await recordFeedback(c.env, {
    reviewerId: userId,
    partnerId: body.partnerId,
    matchId: body.matchId,
    overallRating: body.overallRating,
    writtenFeedback: typeof body.writtenFeedback === 'string' ? body.writtenFeedback : undefined,
    wouldMatchAgain: typeof body.wouldMatchAgain === 'boolean' ? body.wouldMatchAgain : undefined
  });
  return successResponse(c, { success: true });
});

matchingRoutes.get('/my-matches', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const result = await listMatches(c.env, userId, 1, 50);
  return successResponse(c, result.data);
});

matchingRoutes.get('/stats', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const matches = await listMatches(c.env, userId, 1, 20);
  const queueStatus = await getMatchingQueueStatus(c.env, userId);
  const activeRequest = (queueStatus as any)?.queue_status === 'WAITING';
  return successResponse(c, {
    totalMatches: matches.total,
    recentMatches: matches.data.slice(0, 5),
    activeRequest,
    queueStatus
  });
});

matchingRoutes.get('/compatibility/:partnerId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const partnerId = c.req.param('partnerId');
  const analysis = await calculateCompatibilityAnalysis(c.env, userId, partnerId);
  return successResponse(c, {
    partnerId,
    ...analysis
  });
});

matchingRoutes.get('/settings', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const settings = await getMatchingSettings(c.env, userId);
  return successResponse(c, settings);
});

matchingRoutes.patch('/settings', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const updates = await c.req.json().catch(() => ({}));
  const current = await getMatchingSettings(c.env, userId);
  const merged = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  await c.env.CACHE.put(`matching:settings:${userId}`, JSON.stringify(merged));
  return successResponse(c, merged);
});

// AI-powered matching endpoints
matchingRoutes.post('/ai/best-matches', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');

  try {
    const body = await c.req.json().catch(() => ({}));
    const limit = typeof body.limit === 'number' ? Math.min(body.limit, 50) : 10;

    // Get user's profile
    const userProfile = await getUserProfile(c.env, userId);
    if (!userProfile) {
      throw new AppError('User profile not found', 404, 'USER_NOT_FOUND');
    }

    // Get candidate profiles (from existing recommendPartners logic)
    const candidates = await recommendPartners(c.env, userId, {
      page: 1,
      size: 100 // Get more candidates for AI to analyze
    });

    // Get matching preferences from body or use defaults
    const preferences: MatchingPreferences = {
      languageWeight: typeof body.languageWeight === 'number' ? body.languageWeight : 0.25,
      levelWeight: typeof body.levelWeight === 'number' ? body.levelWeight : 0.15,
      semanticWeight: typeof body.semanticWeight === 'number' ? body.semanticWeight : 0.15,
      scheduleWeight: typeof body.scheduleWeight === 'number' ? body.scheduleWeight : 0.15,
      goalsWeight: typeof body.goalsWeight === 'number' ? body.goalsWeight : 0.10,
      personalityWeight: typeof body.personalityWeight === 'number' ? body.personalityWeight : 0.10,
      topicsWeight: typeof body.topicsWeight === 'number' ? body.topicsWeight : 0.10,
    };

    // Find best matches using AI
    const matches = await findBestMatches(
      c.env.AI,
      userProfile,
      candidates.data,
      preferences,
      c.env,
      limit
    );

    return successResponse(c, {
      matches,
      totalCandidates: candidates.total,
      analyzedCandidates: candidates.data.length,
    });
  } catch (error) {
    // AppError는 그대로 throw (원래 상태 코드 유지)
    if (error instanceof AppError) {
      throw error;
    }

    // 기타 에러는 500으로 래핑
    throw new AppError(
      error instanceof Error ? error.message : 'AI matching failed',
      500,
      'AI_MATCHING_FAILED'
    );
  }
});

matchingRoutes.post('/ai/compatibility/:partnerId', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');
  const partnerId = c.req.param('partnerId');

  try {
    const body = await c.req.json().catch(() => ({}));

    // Get both profiles
    const [userProfile, partnerProfile] = await Promise.all([
      getUserProfile(c.env, userId),
      getUserProfile(c.env, partnerId)
    ]);

    if (!userProfile || !partnerProfile) {
      throw new AppError('User or partner profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    // Get matching preferences
    const preferences: MatchingPreferences = {
      languageWeight: typeof body.languageWeight === 'number' ? body.languageWeight : 0.25,
      levelWeight: typeof body.levelWeight === 'number' ? body.levelWeight : 0.15,
      semanticWeight: typeof body.semanticWeight === 'number' ? body.semanticWeight : 0.15,
      scheduleWeight: typeof body.scheduleWeight === 'number' ? body.scheduleWeight : 0.15,
      goalsWeight: typeof body.goalsWeight === 'number' ? body.goalsWeight : 0.10,
      personalityWeight: typeof body.personalityWeight === 'number' ? body.personalityWeight : 0.10,
      topicsWeight: typeof body.topicsWeight === 'number' ? body.topicsWeight : 0.10,
    };

    // Calculate AI-powered compatibility score
    const compatibility = await calculateAIMatchScore(
      c.env.AI,
      userProfile,
      partnerProfile,
      preferences,
      c.env
    );

    return successResponse(c, {
      partnerId,
      compatibility
    });
  } catch (error) {
    // AppError는 그대로 throw (원래 상태 코드 유지)
    if (error instanceof AppError) {
      throw error;
    }

    // 기타 에러는 500으로 래핑
    throw new AppError(
      error instanceof Error ? error.message : 'AI compatibility calculation failed',
      500,
      'AI_COMPATIBILITY_FAILED'
    );
  }
});

export default matchingRoutes;
