import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';
import {
  listLanguageOptions,
  listLanguageLevelTypes,
  listTopicOptions,
  listPartnerOptions,
  listScheduleOptions,
  listMotivationOptions,
  upsertOnboardingLanguages,
  upsertOnboardingTopics,
  upsertOnboardingPartner,
  upsertOnboardingSchedules,
  upsertOnboardingMotivations,
  loadOnboardingSummary,
  completeOnboarding
} from '../services/onboarding';
import {
  clearOnboardingState,
  getOnboardingProgress,
  getOnboardingSessionDraft,
  getOnboardingStep,
  resetOnboardingProgress,
  saveOnboardingSessionDraft,
  saveOnboardingStep
} from '../services/onboardingState';
import { getUserProfile, updateUserProfile } from '../services/user';

const onboardingRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

const requireAuth = authMiddleware();
const TOTAL_ONBOARDING_STEPS = 8;

const wrapError = (error: unknown, fallback: string): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  const message = error instanceof Error ? error.message : fallback;
  return new AppError(message, 500, 'ONBOARDING_ERROR');
};

function normalizeStepPayload(raw: Record<string, unknown>): Record<string, unknown> {
  if (raw && typeof (raw as any).stepData === 'object' && (raw as any).stepData !== null) {
    return (raw as any).stepData as Record<string, unknown>;
  }
  return raw;
}

async function getStepPayload(env: Env, userId: string, step: number) {
  const record = await getOnboardingStep(env, userId, step);
  return record?.payload ?? null;
}

async function buildOnboardingData(env: Env, userId: string) {
  const [profile, step1, step2, step3, step4, progress, languages, motivations, topics] = await Promise.all([
    getUserProfile(env, userId),
    getStepPayload(env, userId, 1),
    getStepPayload(env, userId, 2),
    getStepPayload(env, userId, 3),
    getStepPayload(env, userId, 4),
    getOnboardingProgress(env, userId, TOTAL_ONBOARDING_STEPS),
    listLanguageOptions(env),
    listMotivationOptions(env),
    listTopicOptions(env)
  ]);

  const step1Payload = (step1 as Record<string, unknown>) ?? {};
  const step2Payload = (step2 as Record<string, unknown>) ?? {};
  const step3Payload = (step3 as Record<string, unknown>) ?? {};
  const step4Payload = (step4 as Record<string, unknown>) ?? {};

  const userOnboardingData: Record<string, unknown> = {
    englishName: (step1Payload?.englishName as string | undefined) ?? profile?.englishName ?? profile?.name,
    profileImageUrl: (step1Payload?.profileImage as string | undefined) ?? profile?.profileImage,
    residence: step1Payload?.residence ?? profile?.location?.country ?? null,
    intro: step1Payload?.intro ?? profile?.selfBio ?? '',
    nativeLanguageId:
      (step2Payload?.nativeLanguageId as number | undefined) ??
      (step2Payload?.languageId as number | undefined) ??
      profile?.nativeLanguage?.id ?? null,
    targetLanguages: step2Payload?.targetLanguages ?? [],
    motivationIds: step3Payload?.motivationIds ?? step3Payload?.motivations ?? [],
    topicIds: step4Payload?.topicIds ?? step3Payload?.topicIds ?? [],
    learningStyleIds: step4Payload?.learningStyleIds ?? [],
    learningExpectationIds: step4Payload?.learningExpectationIds ?? [],
    completed: progress.completed
  };

  return {
    userOnboardingData,
    availableOptions: {
      languages,
      motivations,
      topics,
      learningStyles: [],
      learningExpectations: []
    }
  };
}

onboardingRoutes.get('/languages', async (c) => {
  try {
    const data = await listLanguageOptions(c.env);
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load language options');
  }
});

onboardingRoutes.get('/language/languages', async (c) => {
  try {
    const data = await listLanguageOptions(c.env);
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load language options');
  }
});

onboardingRoutes.get('/language/level-types-language', async (c) => {
  try {
    const rows = await listLanguageLevelTypes(c.env, 'LANGUAGE');
    const data = rows.map((row) => ({
      id: row.lang_level_id,
      name: row.lang_level_name,
      description: row.description ?? undefined,
      category: row.category ?? undefined,
      order: row.level_order ?? undefined
    }));
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load language level types');
  }
});

onboardingRoutes.get('/language/level-types-partner', async (c) => {
  try {
    const rows = await listLanguageLevelTypes(c.env, 'PARTNER');
    const data = rows.map((row) => ({
      id: row.lang_level_id,
      name: row.lang_level_name,
      description: row.description ?? undefined,
      category: row.category ?? undefined,
      order: row.level_order ?? undefined
    }));
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load partner level types');
  }
});

onboardingRoutes.get('/interests', async (c) => {
  try {
    const data = await listTopicOptions(c.env);
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load interests');
  }
});

onboardingRoutes.get('/interest/motivations', async (c) => {
  try {
    const data = await listMotivationOptions(c.env);
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load motivation options');
  }
});

onboardingRoutes.get('/interest/topics', async (c) => {
  try {
    const data = await listTopicOptions(c.env);
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load interests');
  }
});

onboardingRoutes.get('/interest/learning-styles', async (c) => {
  return successResponse(c, []);
});

onboardingRoutes.get('/interest/learning-expectations', async (c) => {
  return successResponse(c, []);
});

onboardingRoutes.get('/partner-preferences', async (c) => {
  try {
    const data = await listPartnerOptions(c.env);
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load partner preferences');
  }
});

onboardingRoutes.get('/schedule-options', async (c) => {
  try {
    const data = await listScheduleOptions(c.env);
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load schedule options');
  }
});

onboardingRoutes.get('/motivation-options', async (c) => {
  try {
    const data = await listMotivationOptions(c.env);
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load motivation options');
  }
});

onboardingRoutes.use('/*', requireAuth);
onboardingRoutes.use('/steps/*', requireAuth);
onboardingRoutes.use('/steps', requireAuth);

const STATIC_STEP_NUMBERS = [1, 2, 3, 4];

for (const staticStep of STATIC_STEP_NUMBERS) {
  onboardingRoutes.post(`/steps/${staticStep}/save`, async (c) => {
    const userId = c.get('userId');
    if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
    const payload = normalizeStepPayload(await c.req.json().catch(() => ({})) as Record<string, unknown>);
    await saveOnboardingStep(c.env, userId, staticStep, payload, TOTAL_ONBOARDING_STEPS);
    const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    return successResponse(c, { saved: true, progress });
  });
}

onboardingRoutes.post('/steps/:step/save', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const step = Number(c.req.param('step'));
  if (!Number.isInteger(step) || step < 1 || step > TOTAL_ONBOARDING_STEPS) {
    throw new AppError('Invalid onboarding step', 400, 'INVALID_PATH_PARAM');
  }
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const payload = normalizeStepPayload(body);
  await saveOnboardingStep(c.env, userId, step, payload, TOTAL_ONBOARDING_STEPS);
  const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
  return successResponse(c, { saved: true, progress });
});

onboardingRoutes.post('/steps/:step/skip', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const step = Number(c.req.param('step'));
  if (!Number.isInteger(step) || step < 1 || step > TOTAL_ONBOARDING_STEPS) {
    throw new AppError('Invalid onboarding step', 400, 'INVALID_PATH_PARAM');
  }
  await saveOnboardingStep(c.env, userId, step, { skipped: true }, TOTAL_ONBOARDING_STEPS);
  const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
  return successResponse(c, { skipped: true, progress });
});

onboardingRoutes.post('/state/:step', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const step = Number(c.req.param('step'));
  if (!Number.isInteger(step) || step < 1 || step > TOTAL_ONBOARDING_STEPS) {
    throw new AppError('Invalid onboarding step', 400, 'INVALID_PATH_PARAM');
  }
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    await saveOnboardingStep(c.env, userId, step, body, TOTAL_ONBOARDING_STEPS);
    const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    return successResponse(c, { saved: true, progress });
  } catch (error) {
    throw wrapError(error, 'Failed to save onboarding step');
  }
});

onboardingRoutes.get('/state/:step', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const step = Number(c.req.param('step'));
  if (!Number.isInteger(step) || step < 1 || step > TOTAL_ONBOARDING_STEPS) {
    throw new AppError('Invalid onboarding step', 400, 'INVALID_PATH_PARAM');
  }
  try {
    const state = await getOnboardingStep(c.env, userId, step);
    return successResponse(c, state ?? {});
  } catch (error) {
    throw wrapError(error, 'Failed to load onboarding step');
  }
});

onboardingRoutes.get('/steps/current', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
  return successResponse(c, {
    currentStep: progress.currentStep,
    progress
  });
});

onboardingRoutes.get('/progress', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
  return successResponse(c, progress);
});

onboardingRoutes.get('/data', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  try {
    const data = await buildOnboardingData(c.env, userId);
    return successResponse(c, data);
  } catch (error) {
    throw wrapError(error, 'Failed to load onboarding data');
  }
});

onboardingRoutes.get('/state/progress', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  try {
    const progress = await getOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    return successResponse(c, progress);
  } catch (error) {
    throw wrapError(error, 'Failed to load onboarding progress');
  }
});

onboardingRoutes.post('/state/session', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    await saveOnboardingSessionDraft(c.env, userId, body);
    return successResponse(c, { saved: true });
  } catch (error) {
    throw wrapError(error, 'Failed to save onboarding session');
  }
});

onboardingRoutes.get('/state/session', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  try {
    const draft = await getOnboardingSessionDraft(c.env, userId);
    return successResponse(c, draft ?? {});
  } catch (error) {
    throw wrapError(error, 'Failed to load onboarding session');
  }
});

onboardingRoutes.post('/state/reset', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  try {
    await clearOnboardingState(c.env, userId);
    await resetOnboardingProgress(c.env, userId, TOTAL_ONBOARDING_STEPS);
    return successResponse(c, { reset: true });
  } catch (error) {
    throw wrapError(error, 'Failed to reset onboarding state');
  }
});

onboardingRoutes.post('/languages', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');

  const body = await c.req.json();
  if (!Array.isArray(body)) {
    throw new AppError('Expected array payload', 400, 'INVALID_PAYLOAD');
  }

  const payload = body
    .map((item) => ({
      languageId: Number(item.languageId ?? item.language_id),
      currentLevelId: item.currentLevelId ?? item.current_level_id ?? undefined,
      targetLevelId: item.targetLevelId ?? item.target_level_id ?? undefined
    }))
    .filter((item) => Number.isFinite(item.languageId));

  try {
    await upsertOnboardingLanguages(c.env, userId, payload);
    return successResponse(c, { count: payload.length });
  } catch (error) {
    throw wrapError(error, 'Failed to save language selections');
  }
});

onboardingRoutes.post('/language/native-language', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const languageId = Number(body.languageId ?? body.nativeLanguageId);
  if (!Number.isFinite(languageId)) {
    throw new AppError('languageId is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { nativeLanguageId: languageId });
  return successResponse(c, { languageId });
});

onboardingRoutes.post('/language/language-level', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const languages = Array.isArray(body?.languages) ? (body.languages as any[]) : [];
  const payload: Array<{ languageId: number; currentLevelId?: number; targetLevelId?: number }> = [];
  for (const raw of languages) {
    const languageId = Number(raw.languageId ?? raw.language_id);
    if (!Number.isFinite(languageId)) {
      continue;
    }
    payload.push({
      languageId,
      currentLevelId: raw.currentLevelId ?? raw.current_level_id ?? undefined,
      targetLevelId: raw.targetLevelId ?? raw.target_level_id ?? undefined
    });
  }
  await upsertOnboardingLanguages(c.env, userId, payload);
  return successResponse(c, { count: payload.length });
});

onboardingRoutes.post('/interests', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const topicIds = Array.isArray(body) ? body : body?.topicIds;
  if (!Array.isArray(topicIds)) {
    throw new AppError('topicIds array required', 400, 'INVALID_PAYLOAD');
  }
  const casted = topicIds.map(Number).filter((id) => Number.isFinite(id));
  try {
    await upsertOnboardingTopics(c.env, userId, casted);
    return successResponse(c, { count: casted.length });
  } catch (error) {
    throw wrapError(error, 'Failed to save interests');
  }
});

onboardingRoutes.post('/interest/motivation', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const motivationIds = Array.isArray((body as any)?.motivationIds)
    ? (body as any).motivationIds
    : Array.isArray(body)
      ? body
      : [];
  const normalized: Array<{ motivationId: number; priority: number }> = [];
  motivationIds.forEach((value: unknown, index: number) => {
    const motivationId = Number(value);
    if (!Number.isFinite(motivationId)) {
      return;
    }
    normalized.push({
      motivationId,
      priority: index + 1
    });
  });
  await upsertOnboardingMotivations(c.env, userId, normalized);
  return successResponse(c, { count: normalized.length });
});

onboardingRoutes.post('/interest/topic', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const topicIds = Array.isArray((body as any)?.topicIds)
    ? (body as any).topicIds
    : Array.isArray(body)
      ? body
      : [];
  const normalized = topicIds
    .map((value: unknown) => Number(value))
    .filter((id: number): id is number => Number.isFinite(id));
  await upsertOnboardingTopics(c.env, userId, normalized);
  return successResponse(c, { count: normalized.length });
});

onboardingRoutes.post('/interest/learning-style', async (c) => {
  return successResponse(c, { success: true });
});

onboardingRoutes.post('/interest/learning-expectation', async (c) => {
  return successResponse(c, { success: true });
});

onboardingRoutes.post('/partner-preferences', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const preferences = Array.isArray(body) ? body : body?.partnerPreferences;
  if (!Array.isArray(preferences)) {
    throw new AppError('partner preferences array required', 400, 'INVALID_PAYLOAD');
  }
  const normalized = preferences
    .map((item: any) =>
      typeof item === 'number'
        ? { partnerPersonalityId: item }
        : {
            partnerPersonalityId: Number(item.partnerPersonalityId ?? item.partner_personality_id),
            partnerGender: item.partnerGender ?? item.partner_gender
          }
    )
    .filter((item): item is { partnerPersonalityId: number; partnerGender?: string } => Number.isFinite(item.partnerPersonalityId));
  try {
    await upsertOnboardingPartner(c.env, userId, normalized);
    return successResponse(c, { count: normalized.length });
  } catch (error) {
    throw wrapError(error, 'Failed to save partner preferences');
  }
});

onboardingRoutes.post('/partner/personality', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const raw = Array.isArray((body as any).personalPartnerIds)
    ? (body as any).personalPartnerIds
    : Array.isArray((body as any).partnerPersonalityIds)
      ? (body as any).partnerPersonalityIds
      : Array.isArray(body)
        ? body
        : [];
  if (!Array.isArray(raw) || raw.length === 0) {
    await upsertOnboardingPartner(c.env, userId, []);
    return successResponse(c, { count: 0 });
  }
  const normalized = raw
    .map((item: any) =>
      typeof item === 'number'
        ? { partnerPersonalityId: item }
        : {
            partnerPersonalityId: Number(item.partnerPersonalityId ?? item.partner_personality_id ?? item.id),
            partnerGender: item.partnerGender ?? item.partner_gender ?? undefined
          }
    )
    .filter((item) => Number.isFinite(item.partnerPersonalityId)) as Array<{ partnerPersonalityId: number; partnerGender?: string }>;

  try {
    await upsertOnboardingPartner(c.env, userId, normalized);
    return successResponse(c, { count: normalized.length });
  } catch (error) {
    throw wrapError(error, 'Failed to save partner personalities');
  }
});

onboardingRoutes.post('/schedules', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const schedules = Array.isArray(body) ? body : body?.schedules;
  if (!Array.isArray(schedules)) {
    throw new AppError('schedules array required', 400, 'INVALID_PAYLOAD');
  }
  const normalized: Array<{ scheduleId: number; dayOfWeek: string; classTime?: string }> = [];
  for (const raw of schedules as any[]) {
    const scheduleId = Number(raw.scheduleId ?? raw.schedule_id);
    if (!Number.isFinite(scheduleId)) {
      continue;
    }
    normalized.push({
      scheduleId,
      dayOfWeek: raw.dayOfWeek ?? raw.day_of_week ?? 'UNKNOWN',
      classTime: raw.classTime ?? raw.class_time ?? undefined
    });
  }
  try {
    await upsertOnboardingSchedules(c.env, userId, normalized);
    return successResponse(c, { count: normalized.length });
  } catch (error) {
    throw wrapError(error, 'Failed to save schedules');
  }
});

onboardingRoutes.post('/schedule', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const schedules = Array.isArray((body as any)?.schedules) ? (body as any).schedules : [];
  const normalized: Array<{ scheduleId: number; dayOfWeek: string; classTime?: string }> = [];
  for (const raw of schedules as any[]) {
    const scheduleId = Number(raw.scheduleId ?? raw.schedule_id);
    if (!Number.isFinite(scheduleId)) {
      continue;
    }
    normalized.push({
      scheduleId,
      dayOfWeek: raw.dayOfWeek ?? raw.day_of_week ?? 'UNKNOWN',
      classTime: raw.classTime ?? raw.class_time ?? undefined
    });
  }
  await upsertOnboardingSchedules(c.env, userId, normalized);
  return successResponse(c, { count: normalized.length });
});

onboardingRoutes.post('/motivations', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const motivations = Array.isArray(body) ? body : body?.motivationIds;
  if (!Array.isArray(motivations)) {
    throw new AppError('motivationIds array required', 400, 'INVALID_PAYLOAD');
  }
  const normalized: Array<{ motivationId: number; priority?: number }> = [];
  (motivations as any[]).forEach((raw, index) => {
    const motivationId = typeof raw === 'number'
      ? raw
      : Number(raw.motivationId ?? raw.motivation_id);
    if (!Number.isFinite(motivationId)) {
      return;
    }
    normalized.push({
      motivationId,
      priority: raw?.priority ?? index + 1
    });
  });
  try {
    await upsertOnboardingMotivations(c.env, userId, normalized);
    return successResponse(c, { count: normalized.length });
  } catch (error) {
    throw wrapError(error, 'Failed to save motivations');
  }
});
onboardingRoutes.get('/summary', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  try {
    const summary = await loadOnboardingSummary(c.env, userId);
    return successResponse(c, summary);
  } catch (error) {
    throw wrapError(error, 'Failed to load onboarding summary');
  }
});

onboardingRoutes.post('/complete', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  try {
    await completeOnboarding(c.env, userId, body ?? {});
    await clearOnboardingState(c.env, userId);
    return successResponse(c, { completed: true });
  } catch (error) {
    throw wrapError(error, 'Failed to complete onboarding');
  }
});

export default onboardingRoutes;
