import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';
import {
  getAllAchievements,
  getAchievementsByCategory,
  getUserAchievements,
  getCompletedAchievements,
  getInProgressAchievements,
  getAchievementStats,
  updateAchievementProgress,
  incrementAchievementProgress,
  claimAchievementReward,
  initializeUserAchievements,
  checkAndCompleteAchievements
} from '../services/achievement';

const achievementsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
const requireAuth = authMiddleware();

function requireUserId(userId: string | undefined): string {
  if (!userId) {
    throw new AppError('인증 정보가 필요합니다.', 401, 'UNAUTHORIZED');
  }
  return userId;
}

achievementsRoutes.use('*', requireAuth);

achievementsRoutes.get('/', async (c) => {
  const achievements = await getAllAchievements(c.env);
  return successResponse(c, achievements);
});

achievementsRoutes.get('/category/:category', async (c) => {
  const category = c.req.param('category');
  if (!category) {
    throw new AppError('카테고리가 필요합니다.', 400, 'INVALID_CATEGORY');
  }
  const achievements = await getAchievementsByCategory(c.env, category);
  return successResponse(c, achievements);
});

achievementsRoutes.get('/my', async (c) => {
  const userId = requireUserId(c.get('userId'));
  await initializeUserAchievements(c.env, userId);
  const achievements = await getUserAchievements(c.env, userId);
  return successResponse(c, achievements);
});

achievementsRoutes.get('/my/completed', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const achievements = await getCompletedAchievements(c.env, userId);
  return successResponse(c, achievements);
});

achievementsRoutes.get('/my/in-progress', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const achievements = await getInProgressAchievements(c.env, userId);
  return successResponse(c, achievements);
});

achievementsRoutes.get('/my/stats', async (c) => {
  const userId = requireUserId(c.get('userId'));
  await initializeUserAchievements(c.env, userId);
  const stats = await getAchievementStats(c.env, userId);
  return successResponse(c, stats);
});

achievementsRoutes.post('/progress', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const body = await c.req.json().catch(() => ({}));
  const achievementKey = typeof body?.achievementKey === 'string' ? body.achievementKey.trim() : '';
  const progress = typeof body?.progress === 'number' ? body.progress : Number(body?.progress);
  if (!achievementKey) {
    throw new AppError('achievementKey는 필수입니다.', 400, 'INVALID_ACHIEVEMENT_KEY');
  }
  if (!Number.isFinite(progress)) {
    throw new AppError('progress는 숫자여야 합니다.', 400, 'INVALID_PROGRESS');
  }
  const updated = await updateAchievementProgress(c.env, userId, achievementKey, progress);
  return successResponse(c, updated);
});

achievementsRoutes.post('/progress/increment', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const achievementKey = (c.req.query('achievementKey') || '').trim();
  const incrementRaw = c.req.query('increment');
  const increment = incrementRaw ? Number(incrementRaw) : 1;
  if (!achievementKey) {
    throw new AppError('achievementKey는 필수입니다.', 400, 'INVALID_ACHIEVEMENT_KEY');
  }
  if (!Number.isFinite(increment)) {
    throw new AppError('increment는 숫자여야 합니다.', 400, 'INVALID_INCREMENT');
  }
  const updated = await incrementAchievementProgress(c.env, userId, achievementKey, increment);
  return successResponse(c, updated);
});

achievementsRoutes.post('/:userAchievementId/claim-reward', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const idRaw = c.req.param('userAchievementId');
  const userAchievementId = Number(idRaw);
  if (!Number.isFinite(userAchievementId)) {
    throw new AppError('userAchievementId가 유효하지 않습니다.', 400, 'INVALID_PATH_PARAM');
  }
  const result = await claimAchievementReward(c.env, userId, userAchievementId);
  return successResponse(c, result);
});

achievementsRoutes.post('/initialize', async (c) => {
  const userId = requireUserId(c.get('userId'));
  await initializeUserAchievements(c.env, userId);
  return successResponse(c, { initialized: true });
});

achievementsRoutes.post('/check-completion', async (c) => {
  const userId = requireUserId(c.get('userId'));
  const completed = await checkAndCompleteAchievements(c.env, userId);
  return successResponse(c, completed);
});

export default achievementsRoutes;
