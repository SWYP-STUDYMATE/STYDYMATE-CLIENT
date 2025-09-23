import type { Env } from '../index';
import type { OnboardingSummary } from '../types';
import { query, transaction } from '../utils/db';
import { updateUserProfile } from './user';

export async function listLanguageOptions(env: Env) {
  return query<{
    language_id: number;
    language_name: string;
    language_code: string;
  }>(
    env.DB,
    'SELECT language_id, language_name, language_code FROM languages WHERE is_active IS NULL OR is_active = 1 ORDER BY language_name'
  );
}

export async function listLanguageLevelTypes(env: Env, category: string) {
  return query<{
    lang_level_id: number;
    lang_level_name: string;
    description: string | null;
    category: string | null;
    level_order: number | null;
  }>(
    env.DB,
    'SELECT lang_level_id, lang_level_name, description, category, level_order FROM lang_level_type WHERE UPPER(category) = UPPER(?) ORDER BY level_order, lang_level_id',
    [category]
  );
}

export async function listTopicOptions(env: Env) {
  return query<{
    topic_id: number;
    topic_name: string;
    description: string | null;
  }>(env.DB, 'SELECT topic_id, topic_name, description FROM topic WHERE is_active IS NULL OR is_active = 1 ORDER BY topic_name');
}

export async function listPartnerOptions(env: Env) {
  return query<{
    partner_personality_id: number;
    partner_personality: string;
    description: string | null;
  }>(
    env.DB,
    'SELECT partner_personality_id, partner_personality, description FROM partner_personality ORDER BY partner_personality'
  );
}

export async function listScheduleOptions(env: Env) {
  return query<{
    schedule_id: number;
    day_of_week: string;
    schedule_name: string | null;
    time_slot: string | null;
  }>(env.DB, 'SELECT schedule_id, day_of_week, schedule_name, time_slot FROM schedule ORDER BY schedule_id');
}

export async function listMotivationOptions(env: Env) {
  return query<{
    motivation_id: number;
    motivation_name: string;
    description: string | null;
  }>(
    env.DB,
    'SELECT motivation_id, motivation_name, description FROM motivation WHERE is_active IS NULL OR is_active = 1 ORDER BY motivation_name'
  );
}

export async function upsertOnboardingLanguages(
  env: Env,
  userId: string,
  payload: Array<{ languageId: number; currentLevelId?: number; targetLevelId?: number }>
) {
  await transaction(
    env.DB,
    [
      { sql: 'DELETE FROM onboarding_lang_level WHERE user_id = ?', params: [userId] },
      ...payload.map((item) => ({
        sql: `INSERT INTO onboarding_lang_level (user_id, language_id, current_level_id, target_level_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)` ,
        params: [
          userId,
          item.languageId,
          item.currentLevelId ?? null,
          item.targetLevelId ?? null,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      }))
    ]
  );
}

export async function upsertOnboardingTopics(
  env: Env,
  userId: string,
  topicIds: number[]
) {
  await transaction(
    env.DB,
    [
      { sql: 'DELETE FROM onboarding_topic WHERE user_id = ?', params: [userId] },
      ...topicIds.map((topicId) => ({
        sql: 'INSERT INTO onboarding_topic (user_id, topic_id, created_at) VALUES (?, ?, ?)',
        params: [userId, topicId, new Date().toISOString()]
      }))
    ]
  );
}

export async function upsertOnboardingPartner(
  env: Env,
  userId: string,
  preferences: Array<{ partnerPersonalityId: number; partnerGender?: string }>
) {
  await transaction(
    env.DB,
    [
      { sql: 'DELETE FROM onboarding_partner WHERE user_id = ?', params: [userId] },
      ...preferences.map((pref) => ({
        sql: 'INSERT INTO onboarding_partner (user_id, partner_personality_id, partner_gender, created_at) VALUES (?, ?, ?, ?)',
        params: [userId, pref.partnerPersonalityId, pref.partnerGender ?? null, new Date().toISOString()]
      }))
    ]
  );
}

export async function upsertOnboardingSchedules(
  env: Env,
  userId: string,
  schedules: Array<{ scheduleId: number; dayOfWeek: string; classTime?: string }>
) {
  await transaction(
    env.DB,
    [
      { sql: 'DELETE FROM onboarding_schedule WHERE user_id = ?', params: [userId] },
      ...schedules.map((item) => ({
        sql: `INSERT INTO onboarding_schedule (user_id, schedule_id, day_of_week, class_time, is_available, created_at)
              VALUES (?, ?, ?, ?, 1, ?)` ,
        params: [userId, item.scheduleId, item.dayOfWeek, item.classTime ?? null, new Date().toISOString()]
      }))
    ]
  );
}

export async function upsertOnboardingMotivations(
  env: Env,
  userId: string,
  motivations: Array<{ motivationId: number; priority?: number }>
) {
  await transaction(
    env.DB,
    [
      { sql: 'DELETE FROM onboarding_motivation WHERE user_id = ?', params: [userId] },
      ...motivations.map((item) => ({
        sql: 'INSERT INTO onboarding_motivation (user_id, motivation_id, priority, created_at) VALUES (?, ?, ?, ?)',
        params: [userId, item.motivationId, item.priority ?? null, new Date().toISOString()]
      }))
    ]
  );
}

export async function loadOnboardingSummary(env: Env, userId: string): Promise<OnboardingSummary> {
  const languages = await query<{
    language_id: number;
    current_level_id: number | null;
    target_level_id: number | null;
  }>(
    env.DB,
    'SELECT language_id, current_level_id, target_level_id FROM onboarding_lang_level WHERE user_id = ?',
    [userId]
  );

  const topics = await query<{ topic_id: number }>(
    env.DB,
    'SELECT topic_id FROM onboarding_topic WHERE user_id = ?',
    [userId]
  );

  const motivations = await query<{ motivation_id: number; priority: number | null }>(
    env.DB,
    'SELECT motivation_id, priority FROM onboarding_motivation WHERE user_id = ?',
    [userId]
  );

  const learningStyles = await query<{ learning_style_id: number }>(
    env.DB,
    'SELECT learning_style_id FROM onboarding_learning_style WHERE user_id = ?',
    [userId]
  );

  const groupSizes = await query<{ group_size_id: number }>(
    env.DB,
    'SELECT group_size_id FROM onboarding_group_size WHERE user_id = ?',
    [userId]
  );

  const partners = await query<{ partner_personality_id: number; partner_gender: string | null }>(
    env.DB,
    'SELECT partner_personality_id, partner_gender FROM onboarding_partner WHERE user_id = ?',
    [userId]
  );

  const scheduleRows = await query<{ schedule_id: number; day_of_week: string; class_time: string | null }>(
    env.DB,
    'SELECT schedule_id, day_of_week, class_time FROM onboarding_schedule WHERE user_id = ?',
    [userId]
  );

  return {
    languages: languages.map((item) => ({
      languageId: item.language_id,
      currentLevelId: item.current_level_id ?? undefined,
      targetLevelId: item.target_level_id ?? undefined
    })),
    topics: topics.map((item) => item.topic_id),
    motivations: motivations.map((item) => ({
      motivationId: item.motivation_id,
      priority: item.priority ?? undefined
    })),
    learningStyles: learningStyles.map((item) => item.learning_style_id),
    groupSizes: groupSizes.map((item) => item.group_size_id),
    partnerPreferences: partners.map((item) => ({
      partnerPersonalityId: item.partner_personality_id,
      partnerGender: item.partner_gender ?? undefined
    })),
    schedules: scheduleRows.map((item) => ({
      scheduleId: item.schedule_id,
      dayOfWeek: item.day_of_week,
      classTime: item.class_time ?? undefined
    }))
  };
}

export async function completeOnboarding(
  env: Env,
  userId: string,
  payload: {
    nativeLanguageId?: number | null;
    targetLanguages?: Array<{ languageId: number; currentLevelId?: number; targetLevelId?: number }>;
    motivationIds?: number[];
    topicIds?: number[];
    learningStyleIds?: number[];
    learningExpectationIds?: number[];
    partnerPersonalityIds?: Array<{ partnerPersonalityId: number; partnerGender?: string } | number>;
    groupSizeIds?: number[];
    scheduleIds?: Array<{ scheduleId: number; dayOfWeek: string; classTime?: string } | number>;
  } = {}
) {
  if (payload.targetLanguages) {
    await upsertOnboardingLanguages(env, userId, payload.targetLanguages);
  }

  if (payload.topicIds) {
    await upsertOnboardingTopics(env, userId, payload.topicIds);
  }

  if (payload.motivationIds) {
    await upsertOnboardingMotivations(
      env,
      userId,
      payload.motivationIds.map((id, index) => ({ motivationId: id, priority: index + 1 }))
    );
  }

  if (payload.partnerPersonalityIds) {
    const preferences = payload.partnerPersonalityIds.map((item) =>
      typeof item === 'number' ? { partnerPersonalityId: item } : item
    );
    await upsertOnboardingPartner(env, userId, preferences);
  }

  if (payload.groupSizeIds) {
    await transaction(
      env.DB,
      [
        { sql: 'DELETE FROM onboarding_group_size WHERE user_id = ?', params: [userId] },
        ...payload.groupSizeIds.map((id) => ({
          sql: 'INSERT INTO onboarding_group_size (user_id, group_size_id, created_at) VALUES (?, ?, ?)',
          params: [userId, id, new Date().toISOString()]
        }))
      ]
    );
  }

  if (payload.scheduleIds) {
    const schedules = payload.scheduleIds.map((item) =>
      typeof item === 'number'
        ? { scheduleId: item, dayOfWeek: 'UNKNOWN', classTime: null }
        : item
    );
    await upsertOnboardingSchedules(env, userId, schedules as Array<{ scheduleId: number; dayOfWeek: string; classTime?: string }>);
  }

  if (payload.learningStyleIds) {
    await transaction(
      env.DB,
      [
        { sql: 'DELETE FROM onboarding_learning_style WHERE user_id = ?', params: [userId] },
        ...payload.learningStyleIds.map((id) => ({
          sql: 'INSERT INTO onboarding_learning_style (user_id, learning_style_id, created_at) VALUES (?, ?, ?)',
          params: [userId, id, new Date().toISOString()]
        }))
      ]
    );
  }

  if (payload.learningExpectationIds) {
    await transaction(
      env.DB,
      [
        { sql: 'DELETE FROM onboarding_learning_expectation WHERE user_id = ?', params: [userId] },
        ...payload.learningExpectationIds.map((id, index) => ({
          sql: 'INSERT INTO onboarding_learning_expectation (user_id, learning_expectation_id, priority, created_at) VALUES (?, ?, ?, ?)',
          params: [userId, id, index + 1, new Date().toISOString()]
        }))
      ]
    );
  }

  await updateUserProfile(env, userId, {
    nativeLanguageId: payload.nativeLanguageId ?? null,
    onboardingCompleted: true
  });
}
