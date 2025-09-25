import type { Env } from '../index';
import type { OnboardingSummary } from '../types';
import { query, transaction } from '../utils/db';
import { getUserProfile, updateUserProfile } from './user';

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
  const normalizedCategory = (category ?? '').trim().toUpperCase();

  return query<{
    lang_level_id: number;
    lang_level_name: string;
    description: string | null;
    category: string | null;
    level_order: number | null;
  }>(
    env.DB,
    `SELECT
        lang_level_id,
        lang_level_name,
        description,
        category,
        level_order
      FROM lang_level_type
      WHERE (
        category IS NOT NULL AND UPPER(category) = ?
      ) OR (
        category IS NULL AND (
          (? = 'LANGUAGE' AND lang_level_id BETWEEN 100 AND 199) OR
          (? = 'PARTNER' AND lang_level_id BETWEEN 200 AND 299)
        )
      )
      ORDER BY
        CASE WHEN level_order IS NULL THEN 1 ELSE 0 END,
        level_order,
        lang_level_id`,
    [normalizedCategory, normalizedCategory, normalizedCategory]
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

export async function listGroupSizeOptions(env: Env) {
  return query<{
    group_size_id: number;
    group_size: string;
  }>(
    env.DB,
    'SELECT group_size_id, group_size FROM group_size ORDER BY group_size_id'
  );
}

type CommunicationMethodOption = {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  sortOrder: number;
};

const DEFAULT_COMMUNICATION_METHODS: CommunicationMethodOption[] = [
  {
    id: 1,
    code: 'TEXT',
    displayName: '텍스트 중심',
    description: '채팅을 위주로 학습합니다.',
    sortOrder: 1
  },
  {
    id: 2,
    code: 'VOICE',
    displayName: '음성 중심',
    description: '음성 통화를 중심으로 연습합니다.',
    sortOrder: 2
  },
  {
    id: 3,
    code: 'VIDEO',
    displayName: '영상 통화',
    description: '영상 통화로 실시간 대화를 진행합니다.',
    sortOrder: 3
  },
  {
    id: 4,
    code: 'HYBRID',
    displayName: '상황에 맞게',
    description: '상황에 따라 텍스트와 음성을 혼합합니다.',
    sortOrder: 4
  }
];

function normalizeCommunicationMethods(
  rows: Array<{
    communication_method_id: number | null;
    method_code: string | null;
    display_name: string | null;
    description: string | null;
    sort_order: number | null;
  }>
): CommunicationMethodOption[] {
  if (!rows.length) {
    return DEFAULT_COMMUNICATION_METHODS.map((item) => ({ ...item }));
  }

  return rows
    .map((row, index) => {
      const code = (row.method_code ?? '').trim().toUpperCase();
      if (!code) {
        return null;
      }

      return {
        id: row.communication_method_id ?? index + 1,
        code,
        displayName: row.display_name?.trim() || code,
        description: row.description ?? null,
        sortOrder: row.sort_order ?? index + 1
      } satisfies CommunicationMethodOption;
    })
    .filter((item): item is CommunicationMethodOption => item !== null)
    .sort((a, b) => {
      if (a.sortOrder === b.sortOrder) {
        return a.id - b.id;
      }
      return a.sortOrder - b.sortOrder;
    });
}

export async function listCommunicationMethodOptions(env: Env): Promise<CommunicationMethodOption[]> {
  try {
    const rows = await query<{
      communication_method_id: number;
      method_code: string;
      display_name: string | null;
      description: string | null;
      sort_order: number | null;
      is_active: number | null;
    }>(
      env.DB,
      `SELECT communication_method_id, method_code, display_name, description, sort_order, is_active
       FROM communication_method
       WHERE is_active IS NULL OR is_active = 1
       ORDER BY
         CASE WHEN sort_order IS NULL THEN 1 ELSE 0 END,
         sort_order,
         communication_method_id`
    );

    return normalizeCommunicationMethods(rows);
  } catch (error) {
    console.warn('[onboarding] communication_method table unavailable, falling back to defaults', error);
    return DEFAULT_COMMUNICATION_METHODS.map((item) => ({ ...item }));
  }
}

type DailyMinuteOption = {
  code: string;
  displayName: string;
  minutes: number;
  description: string | null;
  sortOrder: number;
};

const DEFAULT_DAILY_MINUTE_OPTIONS: DailyMinuteOption[] = [
  {
    code: 'MINUTES_10',
    displayName: '10분',
    minutes: 10,
    description: '하루 10분 학습',
    sortOrder: 1
  },
  {
    code: 'MINUTES_15',
    displayName: '15분',
    minutes: 15,
    description: '하루 15분 학습',
    sortOrder: 2
  },
  {
    code: 'MINUTES_20',
    displayName: '20분',
    minutes: 20,
    description: '하루 20분 학습',
    sortOrder: 3
  },
  {
    code: 'MINUTES_25',
    displayName: '25분',
    minutes: 25,
    description: '하루 25분 학습',
    sortOrder: 4
  },
  {
    code: 'MINUTES_30',
    displayName: '30분',
    minutes: 30,
    description: '하루 30분 학습',
    sortOrder: 5
  }
];

async function fetchDailyMinuteRows(env: Env) {
  try {
    const table = await query<{ name: string }>(
      env.DB,
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (?, ?)",
      ['daily_minute_option', 'daily_minute']
    );

    if (!table.length) {
      return [];
    }

    const tableName = table[0]?.name ?? 'daily_minute_option';

    try {
      return await query<{
        code: string | null;
        display_name: string | null;
        minutes: number | null;
        description: string | null;
        sort_order: number | null;
      }>(
        env.DB,
        `SELECT
           COALESCE(method_code, code) AS code,
           COALESCE(display_name, name) AS display_name,
           minutes,
           description,
           sort_order
         FROM ${tableName}
         WHERE is_active IS NULL OR is_active = 1
         ORDER BY
           CASE WHEN sort_order IS NULL THEN 1 ELSE 0 END,
           sort_order,
           COALESCE(method_code, code, display_name)`
      );
    } catch (error) {
      console.warn('[onboarding] daily_minute columns unavailable, falling back to defaults', error);
      return [];
    }
  } catch (error) {
    console.warn('[onboarding] daily_minute table unavailable, falling back to defaults', error);
    return [];
  }
}

export async function listDailyMinuteOptions(env: Env): Promise<DailyMinuteOption[]> {
  const rows = await fetchDailyMinuteRows(env);

  if (!rows.length) {
    return DEFAULT_DAILY_MINUTE_OPTIONS.map((item) => ({ ...item }));
  }

  return rows
    .map((row, index) => {
      const code = (row.code ?? '').trim().toUpperCase();
      if (!code) {
        return null;
      }

      return {
        code,
        displayName: row.display_name?.trim() || code,
        minutes: Number.isFinite(row.minutes) ? Number(row.minutes) : DEFAULT_DAILY_MINUTE_OPTIONS[index % DEFAULT_DAILY_MINUTE_OPTIONS.length].minutes,
        description: row.description ?? null,
        sortOrder: row.sort_order ?? index + 1
      } as DailyMinuteOption;
    })
    .filter((item): item is DailyMinuteOption => item !== null)
    .sort((a, b) => {
      if (a.sortOrder === b.sortOrder) {
        return a.minutes - b.minutes;
      }
      return a.sortOrder - b.sortOrder;
    });
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

export async function listLearningStyleOptions(env: Env) {
  return query<{
    learning_style_id: number;
    learning_style_name: string;
    description: string | null;
  }>(
    env.DB,
    'SELECT learning_style_id, learning_style_name, description FROM learning_style WHERE is_active IS NULL OR is_active = 1 ORDER BY learning_style_id'
  );
}

export async function listLearningExpectationOptions(env: Env) {
  return query<{
    learning_expectation_id: number;
    learning_expectation_name: string;
    description: string | null;
  }>(
    env.DB,
    'SELECT learning_expectation_id, learning_expectation_name, description FROM learning_expectation WHERE is_active IS NULL OR is_active = 1 ORDER BY learning_expectation_id'
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

export async function upsertOnboardingGroupSizes(
  env: Env,
  userId: string,
  groupSizeIds: number[]
) {
  const normalized = Array.from(new Set(groupSizeIds.map((value) => Number(value)))).filter((value): value is number => Number.isFinite(value));

  const timestamp = new Date().toISOString();
  const operations = [
    { sql: 'DELETE FROM onboarding_group_size WHERE user_id = ?', params: [userId] },
    ...normalized.map((groupSizeId) => ({
      sql: 'INSERT INTO onboarding_group_size (user_id, group_size_id, created_at) VALUES (?, ?, ?)',
      params: [userId, groupSizeId, timestamp]
    }))
  ];

  await transaction(env.DB, operations);
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

export async function upsertOnboardingLearningStyles(
  env: Env,
  userId: string,
  learningStyleIds: number[]
) {
  const normalized = Array.from(new Set(learningStyleIds.map((value) => Number(value)))).filter((value): value is number => Number.isFinite(value));
  const timestamp = new Date().toISOString();

  const operations = [
    { sql: 'DELETE FROM onboarding_learning_style WHERE user_id = ?', params: [userId] },
    ...normalized.map((learningStyleId) => ({
      sql: 'INSERT INTO onboarding_learning_style (user_id, learning_style_id, created_at) VALUES (?, ?, ?)',
      params: [userId, learningStyleId, timestamp]
    }))
  ];

  await transaction(env.DB, operations);
}

export async function upsertOnboardingLearningExpectations(
  env: Env,
  userId: string,
  learningExpectationIds: number[]
) {
  const normalized = Array.from(new Set(learningExpectationIds.map((value) => Number(value)))).filter((value): value is number => Number.isFinite(value));
  const timestamp = new Date().toISOString();

  const operations = [
    { sql: 'DELETE FROM onboarding_learning_expectation WHERE user_id = ?', params: [userId] },
    ...normalized.map((learningExpectationId, index) => ({
      sql: 'INSERT INTO onboarding_learning_expectation (user_id, learning_expectation_id, priority, created_at) VALUES (?, ?, ?, ?)',
      params: [userId, learningExpectationId, index + 1, timestamp]
    }))
  ];

  await transaction(env.DB, operations);
}

export async function loadOnboardingSummary(env: Env, userId: string): Promise<OnboardingSummary> {
  const [
    languagesResult,
    topicsResult,
    motivationsResult,
    learningStylesResult,
    groupSizesResult,
    partnersResult,
    schedulesResult
  ] = await env.DB.batch([
    env.DB.prepare(
      'SELECT language_id, current_level_id, target_level_id FROM onboarding_lang_level WHERE user_id = ?'
    ).bind(userId),
    env.DB.prepare('SELECT topic_id FROM onboarding_topic WHERE user_id = ?').bind(userId),
    env.DB.prepare('SELECT motivation_id, priority FROM onboarding_motivation WHERE user_id = ?').bind(userId),
    env.DB.prepare('SELECT learning_style_id FROM onboarding_learning_style WHERE user_id = ?').bind(userId),
    env.DB.prepare('SELECT group_size_id FROM onboarding_group_size WHERE user_id = ?').bind(userId),
    env.DB.prepare(
      'SELECT partner_personality_id, partner_gender FROM onboarding_partner WHERE user_id = ?'
    ).bind(userId),
    env.DB.prepare(
      'SELECT schedule_id, day_of_week, class_time FROM onboarding_schedule WHERE user_id = ?'
    ).bind(userId)
  ]);

  const languages = (languagesResult.results ?? []) as Array<{
    language_id: number;
    current_level_id: number | null;
    target_level_id: number | null;
  }>;
  const topics = (topicsResult.results ?? []) as Array<{ topic_id: number }>;
  const motivations = (motivationsResult.results ?? []) as Array<{
    motivation_id: number;
    priority: number | null;
  }>;
  const learningStyles = (learningStylesResult.results ?? []) as Array<{
    learning_style_id: number;
  }>;
  const groupSizes = (groupSizesResult.results ?? []) as Array<{ group_size_id: number }>;
  const partners = (partnersResult.results ?? []) as Array<{
    partner_personality_id: number;
    partner_gender: string | null;
  }>;
  const scheduleRows = (schedulesResult.results ?? []) as Array<{
    schedule_id: number;
    day_of_week: string;
    class_time: string | null;
  }>;

  const profile = await getUserProfile(env, userId);

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
    })),
    communicationMethod: profile?.communicationMethod ?? undefined
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
    communicationMethod?: string | null;
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
    await upsertOnboardingGroupSizes(env, userId, payload.groupSizeIds);
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
    await upsertOnboardingLearningStyles(env, userId, payload.learningStyleIds);
  }

  if (payload.learningExpectationIds) {
    await upsertOnboardingLearningExpectations(env, userId, payload.learningExpectationIds);
  }

  const profileUpdates: Parameters<typeof updateUserProfile>[2] = {
    nativeLanguageId: payload.nativeLanguageId ?? null,
    onboardingCompleted: true
  };

  if (typeof payload.communicationMethod === 'string' && payload.communicationMethod.trim()) {
    profileUpdates.communicationMethod = payload.communicationMethod.trim().toUpperCase();
  }

  await updateUserProfile(env, userId, profileUpdates);
}
