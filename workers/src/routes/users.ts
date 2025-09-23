import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';
import {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  saveProfileImage,
  deleteProfileImage,
  listLocations
} from '../services/user';
import {
  loadOnboardingSummary,
  listLanguageOptions,
  listMotivationOptions,
  listTopicOptions,
  upsertOnboardingLanguages,
  upsertOnboardingMotivations,
  upsertOnboardingPartner,
  upsertOnboardingSchedules,
  completeOnboarding
} from '../services/onboarding';

type ProfileUpdateBody = Record<string, unknown>;

function toUpdatePayload(body: ProfileUpdateBody) {
  const payload: any = {};

  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (typeof body.englishName === 'string') payload.englishName = body.englishName.trim();
  if (typeof body.selfBio === 'string') payload.selfBio = body.selfBio.trim();
  if (typeof body.gender === 'string') payload.gender = body.gender;
  if (typeof body.birthday === 'string') payload.birthday = body.birthday;
  if (typeof body.birthyear === 'string') payload.birthyear = body.birthyear;
  if (typeof body.communicationMethod === 'string') payload.communicationMethod = body.communicationMethod;
  if (typeof body.dailyMinute === 'string') payload.dailyMinute = body.dailyMinute;
  if (typeof body.partnerGender === 'string') payload.partnerGender = body.partnerGender;
  if (typeof body.learningExpectation === 'string') payload.learningExpectation = body.learningExpectation;
  if (typeof body.onboardingCompleted === 'boolean') payload.onboardingCompleted = body.onboardingCompleted;

  const locationId = typeof body.locationId === 'number'
    ? body.locationId
    : typeof body.location === 'object' && body.location !== null && typeof (body.location as any).id === 'number'
      ? (body.location as any).id
      : undefined;
  if (locationId !== undefined) payload.locationId = locationId;

  const nativeLanguageId = typeof body.nativeLanguageId === 'number'
    ? body.nativeLanguageId
    : typeof body.nativeLanguage === 'object' && body.nativeLanguage !== null && typeof (body.nativeLanguage as any).id === 'number'
      ? (body.nativeLanguage as any).id
      : undefined;
  if (nativeLanguageId !== undefined) payload.nativeLanguageId = nativeLanguageId;

  return payload;
}

async function processProfileImageUpload(c: any, userId: string): Promise<string> {
  const contentType = c.req.header('Content-Type');
  if (!contentType?.startsWith('multipart/form-data')) {
    throw new AppError('multipart/form-data required', 400, 'INVALID_CONTENT_TYPE');
  }

  const formData = await c.req.formData();
  const fileEntry = formData.get('file') ?? formData.get('image');
  if (!fileEntry || typeof fileEntry === 'string') {
    throw new AppError('image field required', 400, 'INVALID_FORM_DATA');
  }

  const uploadFile = fileEntry as unknown as {
    name: string;
    type: string;
    arrayBuffer: () => Promise<ArrayBuffer>;
  };

  const arrayBuffer = await uploadFile.arrayBuffer();
  return saveProfileImage(
    c.env,
    userId,
    uploadFile.name,
    uploadFile.type || 'application/octet-stream',
    arrayBuffer
  );
}

const usersRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

const requireAuth = authMiddleware();

const wrapError = (error: unknown, feature: string): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  const message = error instanceof Error ? error.message : `${feature} failed`;
  return new AppError(message, 500, 'USER_OPERATION_FAILED');
};

async function buildLanguageInfo(env: Env, userId: string) {
  const [profile, summary, languageOptions] = await Promise.all([
    getUserProfile(env, userId),
    loadOnboardingSummary(env, userId),
    listLanguageOptions(env)
  ]);

  const languageMap = new Map<number, { language_id: number; language_name: string; language_code: string }>(
    languageOptions.map((item) => [item.language_id, item])
  );

  const nativeLanguageId = profile?.nativeLanguage?.id
    ?? (summary.languages.length > 0 ? summary.languages[0].languageId : undefined);

  const nativeLanguage = nativeLanguageId
    ? {
        languageId: nativeLanguageId,
        languageName: languageMap.get(nativeLanguageId)?.language_name ?? null,
        languageCode: languageMap.get(nativeLanguageId)?.language_code ?? null
      }
    : null;

  const targetLanguages = summary.languages
    .filter((item) => item.languageId !== nativeLanguageId)
    .map((item) => ({
      languageId: item.languageId,
      languageName: languageMap.get(item.languageId)?.language_name ?? null,
      currentLevelId: item.currentLevelId ?? undefined,
      targetLevelId: item.targetLevelId ?? undefined
    }));

  return {
    nativeLanguage,
    targetLanguages
  };
}

async function buildMotivationInfo(env: Env, userId: string) {
  const [summary, motivationOptions, topicOptions] = await Promise.all([
    loadOnboardingSummary(env, userId),
    listMotivationOptions(env),
    listTopicOptions(env)
  ]);

  const motivationMap = new Map(motivationOptions.map((item) => [item.motivation_id, item.motivation_name]));
  const topicMap = new Map(topicOptions.map((item) => [item.topic_id, item.topic_name]));

  return {
    motivations: summary.motivations.map((item) => ({
      motivationId: item.motivationId,
      priority: item.priority,
      name: motivationMap.get(item.motivationId) ?? null
    })),
    topics: summary.topics.map((id: number) => ({
      topicId: id,
      name: topicMap.get(id) ?? null
    }))
  };
}

async function buildPartnerInfo(env: Env, userId: string) {
  const summary = await loadOnboardingSummary(env, userId);
  return {
    partners: summary.partnerPreferences,
    groupSizes: summary.groupSizes
  };
}

async function buildScheduleInfo(env: Env, userId: string) {
  const summary = await loadOnboardingSummary(env, userId);
  return {
    schedules: summary.schedules
  };
}

usersRoutes.use('*', requireAuth);

usersRoutes.get('/me/profile', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  try {
    const profile = await getUserProfile(c.env, userId);
    if (!profile) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return successResponse(c, profile);
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/users/me/profile');
  }
});

usersRoutes.get('/profile', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  try {
    const profile = await getUserProfile(c.env, userId);
    if (!profile) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return successResponse(c, profile);
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/user/profile');
  }
});

usersRoutes.put('/me/profile', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  const body = await c.req.json();
  const payload = toUpdatePayload(body);

  try {
    const profile = await updateUserProfile(c.env, userId, payload);
    return successResponse(c, profile);
  } catch (error) {
    throw wrapError(error, 'PUT /api/v1/users/me/profile');
  }
});

usersRoutes.patch('/profile', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  const body = await c.req.json();
  const payload = toUpdatePayload(body);
  try {
    const profile = await updateUserProfile(c.env, userId, payload);
    return successResponse(c, profile);
  } catch (error) {
    throw wrapError(error, 'PATCH /api/v1/user/profile');
  }
});

usersRoutes.get('/complete-profile', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const profile = await getUserProfile(c.env, userId);
    return successResponse(c, profile);
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/user/complete-profile');
  }
});

usersRoutes.put('/complete-profile', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  const body = await c.req.json();
  const payload = toUpdatePayload(body);
  try {
    const profile = await updateUserProfile(c.env, userId, payload);
    return successResponse(c, profile);
  } catch (error) {
    throw wrapError(error, 'PUT /api/v1/user/complete-profile');
  }
});

usersRoutes.get('/me/settings', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  try {
    const settings = await getUserSettings(c.env, userId);
    return successResponse(c, settings);
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/users/me/settings');
  }
});

usersRoutes.get('/settings', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  try {
    const settings = await getUserSettings(c.env, userId);
    return successResponse(c, settings);
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/user/settings');
  }
});

usersRoutes.put('/me/settings', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  const body = await c.req.json();

  try {
    const settings = await updateUserSettings(c.env, userId, body);
    return successResponse(c, settings);
  } catch (error) {
    throw wrapError(error, 'PUT /api/v1/users/me/settings');
  }
});

usersRoutes.put('/settings', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  const body = await c.req.json();

  try {
    const settings = await updateUserSettings(c.env, userId, body);
    return successResponse(c, settings);
  } catch (error) {
    throw wrapError(error, 'PUT /api/v1/user/settings');
  }
});

usersRoutes.post('/me/profile-image', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const location = await processProfileImageUpload(c, userId);
    return successResponse(c, { url: location });
  } catch (error) {
    throw wrapError(error, 'POST /api/v1/users/me/profile-image');
  }
});

usersRoutes.get('/language-info', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const info = await buildLanguageInfo(c.env, userId);
    return successResponse(c, info);
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/user/language-info');
  }
});

usersRoutes.patch('/language-info', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  const body = await c.req.json();
  const languages = Array.isArray((body as any)?.languages) ? (body as any).languages : [];
  const languagePayload: Array<{ languageId: number; currentLevelId?: number; targetLevelId?: number }> = [];
  for (const raw of languages as any[]) {
    const languageId = Number(raw.languageId ?? raw.language_id);
    if (!Number.isFinite(languageId)) {
      continue;
    }
    languagePayload.push({
      languageId,
      currentLevelId: raw.currentLevelId ?? raw.current_level_id ?? undefined,
      targetLevelId: raw.targetLevelId ?? raw.target_level_id ?? undefined
    });
  }
  await upsertOnboardingLanguages(c.env, userId, languagePayload);
  if (Number.isFinite(body?.nativeLanguageId)) {
    await updateUserProfile(c.env, userId, { nativeLanguageId: Number(body.nativeLanguageId) });
  }
  const info = await buildLanguageInfo(c.env, userId);
  return successResponse(c, info);
});

usersRoutes.get('/motivation-info', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const info = await buildMotivationInfo(c.env, userId);
    return successResponse(c, info);
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/user/motivation-info');
  }
});

usersRoutes.patch('/motivation-info', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  const body = await c.req.json();
  const motivationIds = Array.isArray((body as any)?.motivationIds)
    ? (body as any).motivationIds
    : [];
  const motivationPayload: Array<{ motivationId: number; priority?: number }> = [];
  (motivationIds as any[]).forEach((raw, index) => {
    const motivationId = Number(raw);
    if (!Number.isFinite(motivationId)) {
      return;
    }
    motivationPayload.push({
      motivationId,
      priority: index + 1
    });
  });
  await upsertOnboardingMotivations(c.env, userId, motivationPayload);
  const info = await buildMotivationInfo(c.env, userId);
  return successResponse(c, info);
});

usersRoutes.get('/partner-info', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const info = await buildPartnerInfo(c.env, userId);
    return successResponse(c, info);
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/user/partner-info');
  }
});

usersRoutes.patch('/partner-info', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  const body = await c.req.json();
  const preferences = Array.isArray((body as any)?.partnerPreferences)
    ? (body as any).partnerPreferences
    : [];
  const partnerPayload: Array<{ partnerPersonalityId: number; partnerGender?: string }> = [];
  (preferences as any[]).forEach((raw) => {
    const partnerPersonalityId = Number(raw.partnerPersonalityId ?? raw.partner_personality_id ?? raw);
    if (!Number.isFinite(partnerPersonalityId)) {
      return;
    }
    partnerPayload.push({
      partnerPersonalityId,
      partnerGender: raw.partnerGender ?? raw.partner_gender ?? undefined
    });
  });
  await upsertOnboardingPartner(c.env, userId, partnerPayload);
  const info = await buildPartnerInfo(c.env, userId);
  return successResponse(c, info);
});

usersRoutes.get('/schedule-info', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const info = await buildScheduleInfo(c.env, userId);
    return successResponse(c, info);
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/user/schedule-info');
  }
});

usersRoutes.patch('/schedule-info', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  const body = await c.req.json();
  const schedules = Array.isArray((body as any)?.schedules)
    ? (body as any).schedules
    : [];
  const normalized: Array<{ scheduleId: number; dayOfWeek: string; classTime?: string }> = [];
  (schedules as any[]).forEach((raw) => {
    const scheduleId = Number(raw.scheduleId ?? raw.schedule_id);
    if (!Number.isFinite(scheduleId)) {
      return;
    }
    normalized.push({
      scheduleId,
      dayOfWeek: raw.dayOfWeek ?? raw.day_of_week ?? 'UNKNOWN',
      classTime: raw.classTime ?? raw.class_time ?? undefined
    });
  });
  await upsertOnboardingSchedules(c.env, userId, normalized);
  const info = await buildScheduleInfo(c.env, userId);
  return successResponse(c, info);
});

usersRoutes.get('/me/profile-image', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  try {
    const profile = await getUserProfile(c.env, userId);
    if (!profile) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return successResponse(c, { profileImage: profile.profileImage });
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/users/me/profile-image');
  }
});

usersRoutes.post('/profile-image', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const location = await processProfileImageUpload(c, userId);
    return successResponse(c, { url: location });
  } catch (error) {
    throw wrapError(error, 'POST /api/v1/user/profile-image');
  }
});

usersRoutes.post('/profile/image', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const location = await processProfileImageUpload(c, userId);
    return successResponse(c, { url: location });
  } catch (error) {
    throw wrapError(error, 'POST /api/v1/users/profile/image');
  }
});

usersRoutes.delete('/profile-image', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    await deleteProfileImage(c.env, userId);
    return successResponse(c, { success: true });
  } catch (error) {
    throw wrapError(error, 'DELETE /api/v1/user/profile-image');
  }
});

usersRoutes.delete('/profile/image', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    await deleteProfileImage(c.env, userId);
    return successResponse(c, { success: true });
  } catch (error) {
    throw wrapError(error, 'DELETE /api/v1/users/profile/image');
  }
});

usersRoutes.get('/profile-image', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  try {
    const profile = await getUserProfile(c.env, userId);
    if (!profile) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return successResponse(c, { profileImage: profile.profileImage });
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/user/profile-image');
  }
});

usersRoutes.get('/me/name', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  try {
    const profile = await getUserProfile(c.env, userId);
    if (!profile) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return successResponse(c, { name: profile.name });
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/users/me/name');
  }
});

usersRoutes.get('/info', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const profile = await getUserProfile(c.env, userId);
    if (!profile) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return successResponse(c, {
      id: profile.id,
      email: profile.email,
      englishName: profile.englishName,
      name: profile.name,
      onboardingCompleted: profile.onboardingCompleted
    });
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/user/info');
  }
});

usersRoutes.get('/name', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const profile = await getUserProfile(c.env, userId);
    if (!profile) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return successResponse(c, { name: profile.name ?? profile.englishName });
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/user/name');
  }
});

usersRoutes.get('/me/onboarding-status', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }

  try {
    const profile = await getUserProfile(c.env, userId);
    if (!profile) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return successResponse(c, { completed: profile.onboardingCompleted });
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/users/me/onboarding-status');
  }
});

usersRoutes.get('/onboarding-status', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  const profile = await getUserProfile(c.env, userId);
  if (!profile) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return successResponse(c, { completed: profile.onboardingCompleted });
});

usersRoutes.post('/complete-onboarding', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  const body = await c.req.json().catch(() => ({}));
  await completeOnboarding(c.env, userId, body ?? {});
  return successResponse(c, { completed: true });
});

usersRoutes.post('/me/english-name', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  if (typeof body.englishName !== 'string' || !body.englishName.trim()) {
    throw new AppError('englishName is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { englishName: body.englishName.trim() });
  return successResponse(c, { englishName: body.englishName.trim() });
});

usersRoutes.post('/english-name', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  if (typeof body.englishName !== 'string' || !body.englishName.trim()) {
    throw new AppError('englishName is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { englishName: body.englishName.trim() });
  return successResponse(c, { englishName: body.englishName.trim() });
});

usersRoutes.post('/me/birthyear', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  if (typeof body.birthyear !== 'string' || !body.birthyear.trim()) {
    throw new AppError('birthyear is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { birthyear: body.birthyear.trim() });
  return successResponse(c, { birthyear: body.birthyear.trim() });
});

usersRoutes.post('/birthyear', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  if (typeof body.birthYear !== 'string' && typeof body.birthyear !== 'string') {
    throw new AppError('birthyear is required', 400, 'INVALID_PAYLOAD');
  }
  const value = (body.birthYear ?? body.birthyear).toString().trim();
  if (!value) {
    throw new AppError('birthyear is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { birthyear: value });
  return successResponse(c, { birthyear: value });
});

usersRoutes.post('/me/birthday', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  if (typeof body.birthday !== 'string' || !body.birthday.trim()) {
    throw new AppError('birthday is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { birthday: body.birthday.trim() });
  return successResponse(c, { birthday: body.birthday.trim() });
});

usersRoutes.post('/birthday', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const value = typeof body.birthday === 'string' ? body.birthday.trim() : '';
  if (!value) {
    throw new AppError('birthday is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { birthday: value });
  return successResponse(c, { birthday: value });
});

usersRoutes.post('/me/gender', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  if (typeof body.gender !== 'string' || !body.gender.trim()) {
    throw new AppError('gender is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { gender: body.gender.trim() });
  return successResponse(c, { gender: body.gender.trim() });
});

usersRoutes.post('/gender', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const gender = (body.gender ?? body.genderType)?.toString().trim();
  if (!gender) {
    throw new AppError('gender is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { gender });
  return successResponse(c, { gender });
});

usersRoutes.post('/me/self-bio', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  if (typeof body.selfBio !== 'string') {
    throw new AppError('selfBio is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { selfBio: body.selfBio });
  return successResponse(c, { selfBio: body.selfBio });
});

usersRoutes.post('/self-bio', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const selfBio = typeof body.selfBio === 'string' ? body.selfBio : '';
  await updateUserProfile(c.env, userId, { selfBio });
  return successResponse(c, { selfBio });
});

usersRoutes.post('/me/location', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const locationId = typeof body.locationId === 'number' ? body.locationId : undefined;
  if (locationId === undefined) {
    throw new AppError('locationId is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { locationId });
  return successResponse(c, { locationId });
});

usersRoutes.post('/location', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json();
  const locationId = Number(body.locationId ?? body.location_id);
  if (!Number.isFinite(locationId)) {
    throw new AppError('locationId is required', 400, 'INVALID_PAYLOAD');
  }
  await updateUserProfile(c.env, userId, { locationId });
  return successResponse(c, { locationId });
});

usersRoutes.get('/stats', async (c) => {
  return successResponse(c, {
    sessionsThisWeek: 0,
    totalSessions: 0,
    totalMinutes: 0
  });
});

usersRoutes.delete('/account', async (c) => {
  return successResponse(c, {
    success: false,
    message: 'Account deletion is not supported on the Workers API yet.'
  });
});

usersRoutes.get('/gender-type', async (c) => {
  return successResponse(c, [
    { id: 'MALE', name: '남성' },
    { id: 'FEMALE', name: '여성' },
    { id: 'OTHER', name: '기타' }
  ]);
});

usersRoutes.get('/locations', async (c) => {
  try {
    const locations = await listLocations(c.env);
    return successResponse(c, locations);
  } catch (error) {
    throw wrapError(error, 'GET /api/v1/users/locations');
  }
});

export default usersRoutes;
