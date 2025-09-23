import type { Env } from '../index';
import type {
  AchievementResponseType,
  AchievementStatsResponseType,
  UserAchievementResponseType
} from '../types';
import { query, queryFirst, execute, transaction } from '../utils/db';
import { AppError } from '../utils/errors';

interface AchievementRow {
  achievement_id: number;
  achievement_key: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  tier: string;
  target_value: number | null;
  target_unit: string | null;
  xp_reward: number | null;
  badge_icon_url: string | null;
  badge_color: string | null;
  is_active: number;
  is_hidden: number;
  sort_order: number | null;
  prerequisite_achievement_id: number | null;
  created_at: string;
  updated_at: string;
}

interface UserAchievementRow {
  user_achievement_id: number;
  user_id: string;
  achievement_id: number;
  current_progress: number;
  is_completed: number;
  completed_at: string | null;
  is_reward_claimed: number;
  reward_claimed_at: string | null;
  achievement_key: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  tier: string;
  target_value: number | null;
  target_unit: string | null;
  xp_reward: number | null;
  badge_icon_url: string | null;
  badge_color: string | null;
  is_active: number;
  is_hidden: number;
  sort_order: number | null;
  prerequisite_achievement_id: number | null;
}

interface StatsRow {
  key: string;
  count: number;
}

const CATEGORY_ALIAS: Record<string, string> = {
  LEARNING: 'STUDY',
  SKILL: 'STUDY',
  SOCIAL: 'SOCIAL',
  ENGAGEMENT: 'ENGAGEMENT',
  TIME: 'STREAK',
  MILESTONE: 'MILESTONE',
  SPECIAL: 'SPECIAL'
};

const DEFAULT_ACHIEVEMENTS = [
  {
    achievementKey: 'first_session',
    title: '첫 세션 완료',
    description: '첫 번째 화상 세션을 완료했습니다!',
    category: 'LEARNING',
    type: 'COUNT',
    tier: 'BRONZE',
    targetValue: 1,
    targetUnit: '세션',
    xpReward: 100,
    badgeColor: '#CD7F32',
    sortOrder: 1
  },
  {
    achievementKey: 'session_10',
    title: '세션 마스터',
    description: '10번의 화상 세션을 완료했습니다!',
    category: 'LEARNING',
    type: 'COUNT',
    tier: 'SILVER',
    targetValue: 10,
    targetUnit: '세션',
    xpReward: 500,
    badgeColor: '#C0C0C0',
    sortOrder: 2
  },
  {
    achievementKey: 'session_50',
    title: '세션 전문가',
    description: '50번의 화상 세션을 완료했습니다!',
    category: 'LEARNING',
    type: 'COUNT',
    tier: 'GOLD',
    targetValue: 50,
    targetUnit: '세션',
    xpReward: 2000,
    badgeColor: '#FFD700',
    sortOrder: 3
  },
  {
    achievementKey: 'streak_7',
    title: '일주일 연속',
    description: '7일 연속으로 세션에 참여했습니다!',
    category: 'ENGAGEMENT',
    type: 'STREAK',
    tier: 'SILVER',
    targetValue: 7,
    targetUnit: '일',
    xpReward: 750,
    badgeColor: '#C0C0C0',
    sortOrder: 4
  },
  {
    achievementKey: 'streak_30',
    title: '한 달 연속',
    description: '30일 연속으로 세션에 참여했습니다!',
    category: 'ENGAGEMENT',
    type: 'STREAK',
    tier: 'GOLD',
    targetValue: 30,
    targetUnit: '일',
    xpReward: 3000,
    badgeColor: '#FFD700',
    sortOrder: 5
  },
  {
    achievementKey: 'first_friend',
    title: '첫 친구',
    description: '첫 번째 학습 친구를 만들었습니다!',
    category: 'SOCIAL',
    type: 'COUNT',
    tier: 'BRONZE',
    targetValue: 1,
    targetUnit: '친구',
    xpReward: 200,
    badgeColor: '#CD7F32',
    sortOrder: 6
  },
  {
    achievementKey: 'friends_5',
    title: '인기쟁이',
    description: '5명의 학습 친구를 만들었습니다!',
    category: 'SOCIAL',
    type: 'COUNT',
    tier: 'SILVER',
    targetValue: 5,
    targetUnit: '친구',
    xpReward: 1000,
    badgeColor: '#C0C0C0',
    sortOrder: 7
  },
  {
    achievementKey: 'study_hours_10',
    title: '10시간 달성',
    description: '총 10시간의 학습을 완료했습니다!',
    category: 'TIME',
    type: 'ACCUMULATE',
    tier: 'BRONZE',
    targetValue: 600,
    targetUnit: '분',
    xpReward: 500,
    badgeColor: '#CD7F32',
    sortOrder: 8
  },
  {
    achievementKey: 'study_hours_50',
    title: '50시간 달성',
    description: '총 50시간의 학습을 완료했습니다!',
    category: 'TIME',
    type: 'ACCUMULATE',
    tier: 'SILVER',
    targetValue: 3000,
    targetUnit: '분',
    xpReward: 2500,
    badgeColor: '#C0C0C0',
    sortOrder: 9
  },
  {
    achievementKey: 'study_hours_100',
    title: '100시간 달성',
    description: '총 100시간의 학습을 완료했습니다!',
    category: 'TIME',
    type: 'ACCUMULATE',
    tier: 'GOLD',
    targetValue: 6000,
    targetUnit: '분',
    xpReward: 5000,
    badgeColor: '#FFD700',
    sortOrder: 10
  },
  {
    achievementKey: 'level_up_first',
    title: '첫 레벨업',
    description: '처음으로 레벨이 올랐습니다!',
    category: 'SKILL',
    type: 'THRESHOLD',
    tier: 'BRONZE',
    targetValue: 2,
    targetUnit: '레벨',
    xpReward: 300,
    badgeColor: '#CD7F32',
    sortOrder: 11
  },
  {
    achievementKey: 'level_5',
    title: '중급자',
    description: '레벨 5에 도달했습니다!',
    category: 'SKILL',
    type: 'THRESHOLD',
    tier: 'SILVER',
    targetValue: 5,
    targetUnit: '레벨',
    xpReward: 1500,
    badgeColor: '#C0C0C0',
    sortOrder: 12
  },
  {
    achievementKey: 'level_10',
    title: '고급자',
    description: '레벨 10에 도달했습니다!',
    category: 'SKILL',
    type: 'THRESHOLD',
    tier: 'GOLD',
    targetValue: 10,
    targetUnit: '레벨',
    xpReward: 5000,
    badgeColor: '#FFD700',
    sortOrder: 13
  },
  {
    achievementKey: 'early_adopter',
    title: '얼리 어답터',
    description: '서비스 오픈 첫 달에 가입했습니다!',
    category: 'SPECIAL',
    type: 'MILESTONE',
    tier: 'LEGENDARY',
    xpReward: 1000,
    badgeColor: '#9932CC',
    isHidden: true,
    sortOrder: 14
  },
  {
    achievementKey: 'perfect_week',
    title: '완벽한 한 주',
    description: '일주일 동안 매일 세션에 참여했습니다!',
    category: 'ENGAGEMENT',
    type: 'COMBINATION',
    tier: 'PLATINUM',
    targetValue: 7,
    targetUnit: '일',
    xpReward: 2000,
    badgeColor: '#E5E4E2',
    sortOrder: 15
  }
];

function toBoolean(value: number | boolean | null | undefined): boolean {
  return value === 1 || value === true;
}

function aliasCategory(original: string | null): string {
  if (!original) return 'GENERAL';
  return CATEGORY_ALIAS[original] ?? original;
}

function mapAchievementRow(row: AchievementRow): AchievementResponseType {
  return {
    id: row.achievement_id,
    achievementKey: row.achievement_key,
    title: row.title,
    description: row.description ?? undefined,
    category: aliasCategory(row.category),
    originalCategory: row.category,
    type: row.type,
    tier: row.tier,
    targetValue: row.target_value ?? undefined,
    targetUnit: row.target_unit ?? undefined,
    xpReward: row.xp_reward ?? undefined,
    badgeIconUrl: row.badge_icon_url ?? undefined,
    badgeColor: row.badge_color ?? undefined,
    isActive: toBoolean(row.is_active),
    isHidden: toBoolean(row.is_hidden),
    sortOrder: row.sort_order ?? undefined,
    prerequisiteAchievementId: row.prerequisite_achievement_id ?? undefined
  };
}

function mapUserAchievementRow(row: UserAchievementRow): UserAchievementResponseType {
  const achievement = mapAchievementRow({
    achievement_id: row.achievement_id,
    achievement_key: row.achievement_key,
    title: row.title,
    description: row.description,
    category: row.category,
    type: row.type,
    tier: row.tier,
    target_value: row.target_value,
    target_unit: row.target_unit,
    xp_reward: row.xp_reward,
    badge_icon_url: row.badge_icon_url,
    badge_color: row.badge_color,
    is_active: row.is_active,
    is_hidden: row.is_hidden,
    sort_order: row.sort_order,
    prerequisite_achievement_id: row.prerequisite_achievement_id,
    created_at: '',
    updated_at: ''
  });

  const targetValue = row.target_value ?? 0;
  const current = row.current_progress ?? 0;
  const progressPercentage = targetValue > 0 ? Math.min(100, (current / targetValue) * 100) : (toBoolean(row.is_completed) ? 100 : 0);

  return {
    id: row.user_achievement_id,
    achievement,
    currentProgress: current,
    isCompleted: toBoolean(row.is_completed),
    completedAt: row.completed_at ?? undefined,
    isRewardClaimed: toBoolean(row.is_reward_claimed),
    rewardClaimedAt: row.reward_claimed_at ?? undefined,
    progressPercentage
  };
}

async function seedDefaultAchievements(env: Env): Promise<void> {
  const countRow = await queryFirst<{ count: number }>(
    env.DB,
    'SELECT COUNT(*) as count FROM achievements'
  );
  if ((countRow?.count ?? 0) > 0) {
    return;
  }

  const now = new Date().toISOString();
  await transaction(
    env.DB,
    DEFAULT_ACHIEVEMENTS.map((item) => ({
      sql: `INSERT INTO achievements (
              achievement_key,
              title,
              description,
              category,
              type,
              tier,
              target_value,
              target_unit,
              xp_reward,
              badge_icon_url,
              badge_color,
              is_active,
              is_hidden,
              sort_order,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 1, ?, ?, ?, ?)`,
      params: [
        item.achievementKey,
        item.title,
        item.description ?? null,
        item.category,
        item.type,
        item.tier,
        item.targetValue ?? null,
        item.targetUnit ?? null,
        item.xpReward ?? null,
        item.badgeColor ?? null,
        item.isHidden ? 1 : 0,
        item.sortOrder ?? null,
        now,
        now
      ]
    }))
  );
}

async function fetchAchievementByKey(env: Env, achievementKey: string): Promise<AchievementRow> {
  const row = await queryFirst<AchievementRow>(
    env.DB,
    'SELECT * FROM achievements WHERE achievement_key = ? AND is_active = 1 LIMIT 1',
    [achievementKey]
  );
  if (!row) {
    throw new AppError('존재하지 않는 업적입니다.', 404, 'ACHIEVEMENT_NOT_FOUND');
  }
  return row;
}

async function ensureUserAchievement(
  env: Env,
  userId: string,
  achievementId: number
): Promise<UserAchievementRow> {
  const existing = await queryFirst<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.achievement_id = ?
      LIMIT 1`,
    [userId, achievementId]
  );
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  await execute(
    env.DB,
    `INSERT INTO user_achievements (
        user_id,
        achievement_id,
        current_progress,
        is_completed,
        completed_at,
        is_reward_claimed,
        reward_claimed_at,
        created_at,
        updated_at
      ) VALUES (?, ?, 0, 0, NULL, 0, NULL, ?, ?)`,
    [userId, achievementId, now, now]
  );

  const inserted = await queryFirst<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.achievement_id = ?
      LIMIT 1`,
    [userId, achievementId]
  );

  if (!inserted) {
    throw new AppError('업적 정보를 초기화할 수 없습니다.', 500, 'ACHIEVEMENT_INIT_FAILED');
  }
  return inserted;
}

async function updateUserAchievementProgress(
  env: Env,
  userId: string,
  achievement: AchievementRow,
  progress: number,
  incrementMode: boolean
): Promise<UserAchievementRow> {
  const targetValue = achievement.target_value ?? undefined;
  const now = new Date().toISOString();

  const row = await ensureUserAchievement(env, userId, achievement.achievement_id);
  const current = incrementMode ? Math.max(0, (row.current_progress ?? 0) + progress) : Math.max(0, progress);

  let isCompleted = row.is_completed;
  let completedAt = row.completed_at;
  if (typeof targetValue === 'number' && current >= targetValue && !toBoolean(row.is_completed)) {
    isCompleted = 1;
    completedAt = now;
  }

  await execute(
    env.DB,
    `UPDATE user_achievements
        SET current_progress = ?,
            is_completed = ?,
            completed_at = ?,
            updated_at = ?
      WHERE user_id = ? AND achievement_id = ?`,
    [current, isCompleted, completedAt, now, userId, achievement.achievement_id]
  );

  const updated = await queryFirst<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.achievement_id = ?
      LIMIT 1`,
    [userId, achievement.achievement_id]
  );

  if (!updated) {
    throw new AppError('업적 진행도를 갱신할 수 없습니다.', 500, 'ACHIEVEMENT_UPDATE_FAILED');
  }

  return updated;
}

export async function getAllAchievements(env: Env): Promise<AchievementResponseType[]> {
  await seedDefaultAchievements(env);
  const rows = await query<AchievementRow>(
    env.DB,
    `SELECT * FROM achievements
      WHERE is_active = 1
      ORDER BY COALESCE(sort_order, 9999), title`
  );
  return rows.map(mapAchievementRow);
}

export async function getAchievementsByCategory(
  env: Env,
  category: string
): Promise<AchievementResponseType[]> {
  await seedDefaultAchievements(env);
  const normalized = category.toUpperCase();
  const rows = await query<AchievementRow>(
    env.DB,
    `SELECT * FROM achievements
      WHERE is_active = 1 AND UPPER(category) = ?
      ORDER BY COALESCE(sort_order, 9999), title`,
    [normalized]
  );
  return rows.map(mapAchievementRow);
}

export async function getUserAchievements(
  env: Env,
  userId: string
): Promise<UserAchievementResponseType[]> {
  await seedDefaultAchievements(env);
  const rows = await query<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ?
      ORDER BY ua.is_completed DESC, ua.completed_at DESC, COALESCE(a.sort_order, 9999)`,
    [userId]
  );
  return rows.map(mapUserAchievementRow);
}

export async function getCompletedAchievements(
  env: Env,
  userId: string
): Promise<UserAchievementResponseType[]> {
  const rows = await query<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 1
      ORDER BY ua.completed_at DESC`,
    [userId]
  );
  return rows.map(mapUserAchievementRow);
}

export async function getInProgressAchievements(
  env: Env,
  userId: string
): Promise<UserAchievementResponseType[]> {
  const rows = await query<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 0
      ORDER BY ua.current_progress DESC, COALESCE(a.sort_order, 9999)`,
    [userId]
  );
  return rows.map(mapUserAchievementRow);
}

export async function getAchievementStats(
  env: Env,
  userId: string
): Promise<AchievementStatsResponseType> {
  await seedDefaultAchievements(env);

  const [totalRow, completedRow, inProgressRow, totalXpRow, unclaimedRow] = await Promise.all([
    queryFirst<{ count: number }>(env.DB, 'SELECT COUNT(*) as count FROM achievements WHERE is_active = 1'),
    queryFirst<{ count: number }>(
      env.DB,
      'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ? AND is_completed = 1',
      [userId]
    ),
    queryFirst<{ count: number }>(
      env.DB,
      'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ? AND is_completed = 0 AND current_progress > 0',
      [userId]
    ),
    queryFirst<{ total: number }>(
      env.DB,
      `SELECT COALESCE(SUM(a.xp_reward), 0) as total
         FROM user_achievements ua
         JOIN achievements a ON a.achievement_id = ua.achievement_id
        WHERE ua.user_id = ? AND ua.is_reward_claimed = 1`,
      [userId]
    ),
    queryFirst<{ count: number }>(
      env.DB,
      'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ? AND is_completed = 1 AND is_reward_claimed = 0',
      [userId]
    )
  ]);

  const achievementsByCategoryRows = await query<StatsRow>(
    env.DB,
    `SELECT a.category as key, COUNT(*) as count
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 1
      GROUP BY a.category`,
    [userId]
  );

  const achievementsByTierRows = await query<StatsRow>(
    env.DB,
    `SELECT a.tier as key, COUNT(*) as count
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 1
      GROUP BY a.tier`,
    [userId]
  );

  const recentRows = await query<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 1
      ORDER BY ua.completed_at DESC
      LIMIT 5`,
    [userId]
  );

  const nearCompletionRows = await query<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ?
        AND ua.is_completed = 0
        AND a.target_value IS NOT NULL
        AND a.target_value > 0
        AND (ua.current_progress * 100.0 / a.target_value) >= 80
      ORDER BY (ua.current_progress * 100.0 / a.target_value) DESC
      LIMIT 5`,
    [userId]
  );

  const totalAchievements = totalRow?.count ?? 0;
  const completedAchievements = completedRow?.count ?? 0;
  const completionRate = totalAchievements > 0 ? (completedAchievements / totalAchievements) * 100 : 0;

  const achievementsByCategory: Record<string, number> = {};
  for (const row of achievementsByCategoryRows) {
    achievementsByCategory[aliasCategory(row.key)] = row.count;
  }

  const achievementsByTier: Record<string, number> = {};
  for (const row of achievementsByTierRows) {
    achievementsByTier[row.key ?? 'UNKNOWN'] = row.count;
  }

  return {
    totalAchievements,
    completedAchievements,
    inProgressAchievements: inProgressRow?.count ?? 0,
    totalXpEarned: totalXpRow?.total ?? 0,
    unclaimedRewards: unclaimedRow?.count ?? 0,
    completionRate,
    achievementsByCategory,
    achievementsByTier,
    recentCompletions: recentRows.map(mapUserAchievementRow),
    nearCompletion: nearCompletionRows.map(mapUserAchievementRow)
  };
}

export async function updateAchievementProgress(
  env: Env,
  userId: string,
  achievementKey: string,
  progress: number
): Promise<UserAchievementResponseType> {
  if (!achievementKey) {
    throw new AppError('achievementKey는 필수입니다.', 400, 'INVALID_ACHIEVEMENT_KEY');
  }
  if (!Number.isFinite(progress) || progress < 0) {
    throw new AppError('progress는 0 이상의 숫자여야 합니다.', 400, 'INVALID_PROGRESS');
  }
  const achievement = await fetchAchievementByKey(env, achievementKey);
  const updated = await updateUserAchievementProgress(env, userId, achievement, progress, false);
  return mapUserAchievementRow(updated);
}

export async function incrementAchievementProgress(
  env: Env,
  userId: string,
  achievementKey: string,
  increment: number
): Promise<UserAchievementResponseType> {
  if (!achievementKey) {
    throw new AppError('achievementKey는 필수입니다.', 400, 'INVALID_ACHIEVEMENT_KEY');
  }
  if (!Number.isFinite(increment) || increment <= 0) {
    throw new AppError('increment는 1 이상의 숫자여야 합니다.', 400, 'INVALID_INCREMENT');
  }
  const achievement = await fetchAchievementByKey(env, achievementKey);
  const updated = await updateUserAchievementProgress(env, userId, achievement, increment, true);
  return mapUserAchievementRow(updated);
}

export async function claimAchievementReward(
  env: Env,
  userId: string,
  userAchievementId: number
): Promise<UserAchievementResponseType> {
  const row = await queryFirst<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_achievement_id = ?
      LIMIT 1`,
    [userAchievementId]
  );

  if (!row) {
    throw new AppError('존재하지 않는 사용자 업적입니다.', 404, 'USER_ACHIEVEMENT_NOT_FOUND');
  }
  if (row.user_id !== userId) {
    throw new AppError('본인의 업적만 보상을 받을 수 있습니다.', 403, 'FORBIDDEN');
  }
  if (!toBoolean(row.is_completed)) {
    throw new AppError('완료되지 않은 업적입니다.', 400, 'ACHIEVEMENT_NOT_COMPLETED');
  }
  if (toBoolean(row.is_reward_claimed)) {
    throw new AppError('이미 보상을 수령했습니다.', 400, 'ACHIEVEMENT_REWARD_ALREADY_CLAIMED');
  }

  const now = new Date().toISOString();
  await execute(
    env.DB,
    `UPDATE user_achievements
        SET is_reward_claimed = 1,
            reward_claimed_at = ?,
            updated_at = ?
      WHERE user_achievement_id = ?`,
    [now, now, userAchievementId]
  );

  const updated = await queryFirst<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_achievement_id = ?
      LIMIT 1`,
    [userAchievementId]
  );

  if (!updated) {
    throw new AppError('업적 보상 정보를 갱신할 수 없습니다.', 500, 'ACHIEVEMENT_REWARD_FAILED');
  }

  return mapUserAchievementRow(updated);
}

export async function initializeUserAchievements(
  env: Env,
  userId: string
): Promise<void> {
  await seedDefaultAchievements(env);
  const achievementIds = await query<{ achievement_id: number }>(
    env.DB,
    'SELECT achievement_id FROM achievements WHERE is_active = 1'
  );

  const statements = achievementIds.map(({ achievement_id }) => ({
    sql: `INSERT OR IGNORE INTO user_achievements (
            user_id,
            achievement_id,
            current_progress,
            is_completed,
            completed_at,
            is_reward_claimed,
            reward_claimed_at,
            created_at,
            updated_at
          ) VALUES (?, ?, 0, 0, NULL, 0, NULL, ?, ?)`
    ,
    params: [userId, achievement_id, new Date().toISOString(), new Date().toISOString()]
  }));

  if (statements.length) {
    await transaction(env.DB, statements);
  }
}

export async function checkAndCompleteAchievements(
  env: Env,
  userId: string
): Promise<UserAchievementResponseType[]> {
  await seedDefaultAchievements(env);
  const candidates = await query<UserAchievementRow>(
    env.DB,
    `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
            a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
            a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
       FROM user_achievements ua
       JOIN achievements a ON a.achievement_id = ua.achievement_id
      WHERE ua.user_id = ? AND ua.is_completed = 0
      ORDER BY ua.current_progress DESC`,
    [userId]
  );

  const completed: UserAchievementResponseType[] = [];
  const now = new Date().toISOString();

  for (const candidate of candidates) {
    const targetValue = candidate.target_value ?? null;
    if (typeof targetValue !== 'number' || candidate.current_progress < targetValue) {
      continue;
    }

    if (candidate.prerequisite_achievement_id) {
      const prereq = await queryFirst<{ is_completed: number }>(
        env.DB,
        `SELECT is_completed FROM user_achievements
          WHERE user_id = ? AND achievement_id = ?
          LIMIT 1`,
        [userId, candidate.prerequisite_achievement_id]
      );
      if (!prereq || !toBoolean(prereq.is_completed)) {
        continue;
      }
    }

    await execute(
      env.DB,
      `UPDATE user_achievements
          SET is_completed = 1,
              completed_at = COALESCE(completed_at, ?),
              updated_at = ?
        WHERE user_achievement_id = ?`,
      [now, now, candidate.user_achievement_id]
    );

    const updated = await queryFirst<UserAchievementRow>(
      env.DB,
      `SELECT ua.*, a.achievement_key, a.title, a.description, a.category, a.type, a.tier,
              a.target_value, a.target_unit, a.xp_reward, a.badge_icon_url, a.badge_color,
              a.is_active, a.is_hidden, a.sort_order, a.prerequisite_achievement_id
         FROM user_achievements ua
         JOIN achievements a ON a.achievement_id = ua.achievement_id
        WHERE ua.user_achievement_id = ?
        LIMIT 1`,
      [candidate.user_achievement_id]
    );

    if (updated) {
      completed.push(mapUserAchievementRow(updated));
    }
  }

  return completed;
}
