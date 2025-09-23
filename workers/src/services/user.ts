import type { Env } from '../index';
import type { UserProfile, UserSettings } from '../types';
import { query, queryFirst, execute, transaction } from '../utils/db';
import { saveToR2, deleteFromR2 } from './storage';
import { sanitizeFileName } from '../utils/security';
import { AppError } from '../utils/errors';

type LocationSummary = { id: number; country: string; city?: string; timeZone?: string };

interface UserProfileUpdatePayload {
  name?: string;
  englishName?: string;
  selfBio?: string;
  gender?: string;
  birthday?: string;
  birthyear?: string;
  locationId?: number | null;
  nativeLanguageId?: number | null;
  communicationMethod?: string;
  dailyMinute?: string;
  partnerGender?: string;
  learningExpectation?: string;
  onboardingCompleted?: boolean;
  profileImage?: string | null;
}

interface DbUserFullRow {
  user_id: string;
  email: string | null;
  name: string | null;
  english_name: string | null;
  birthday: string | null;
  birthyear: string | null;
  gender: string | null;
  profile_image: string | null;
  self_bio: string | null;
  location_id: number | null;
  native_lang_id: number | null;
  communication_method: string | null;
  daily_minute: string | null;
  partner_gender: string | null;
  learning_expectation: string | null;
  is_onboarding_completed: number;
  created_at: string;
  updated_at: string;
  location_country: string | null;
  location_city: string | null;
  location_time_zone: string | null;
  native_language_name: string | null;
  native_language_code: string | null;
}

function mapRowToProfile(row: DbUserFullRow): UserProfile {
  return {
    id: row.user_id,
    email: row.email ?? undefined,
    name: row.name ?? undefined,
    englishName: row.english_name ?? undefined,
    birthday: row.birthday ?? undefined,
    birthyear: row.birthyear ?? undefined,
    gender: row.gender ?? undefined,
    profileImage: row.profile_image ?? undefined,
    selfBio: row.self_bio ?? undefined,
    location: row.location_id
      ? {
          id: row.location_id,
          country: row.location_country ?? '',
          city: row.location_city ?? undefined,
          timeZone: row.location_time_zone ?? undefined
        }
      : undefined,
    nativeLanguage: row.native_lang_id
      ? {
          id: row.native_lang_id,
          name: row.native_language_name ?? '',
          code: row.native_language_code ?? ''
        }
      : undefined,
    onboardingCompleted: row.is_onboarding_completed === 1,
    communicationMethod: row.communication_method ?? undefined,
    dailyMinute: row.daily_minute ?? undefined,
    partnerGender: row.partner_gender ?? undefined,
    learningExpectation: row.learning_expectation ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getUserProfile(env: Env, userId: string): Promise<UserProfile | null> {
  const row = await queryFirst<DbUserFullRow>(
    env.DB,
    `SELECT 
        u.user_id,
        u.email,
        u.name,
        u.english_name,
        u.birthday,
        u.birthyear,
        u.gender,
        u.profile_image,
        u.self_bio,
        u.location_id,
        u.native_lang_id,
        u.communication_method,
        u.daily_minute,
        u.partner_gender,
        u.learning_expectation,
        u.is_onboarding_completed,
        u.created_at,
        u.updated_at,
        l.country AS location_country,
        l.city AS location_city,
        l.time_zone AS location_time_zone,
        lang.language_name AS native_language_name,
        lang.language_code AS native_language_code
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.location_id
      LEFT JOIN languages lang ON u.native_lang_id = lang.language_id
      WHERE u.user_id = ?
      LIMIT 1`,
    [userId]
  );

  if (!row) {
    return null;
  }

  return mapRowToProfile(row);
}

export async function updateUserProfile(
  env: Env,
  userId: string,
  payload: UserProfileUpdatePayload
): Promise<UserProfile> {
  const setters: string[] = [];
  const params: (string | number | null)[] = [];

  const map: Record<keyof UserProfileUpdatePayload, string> = {
    name: 'name',
    englishName: 'english_name',
    selfBio: 'self_bio',
    gender: 'gender',
    birthday: 'birthday',
    birthyear: 'birthyear',
    locationId: 'location_id',
    nativeLanguageId: 'native_lang_id',
    communicationMethod: 'communication_method',
    dailyMinute: 'daily_minute',
    partnerGender: 'partner_gender',
    learningExpectation: 'learning_expectation',
    onboardingCompleted: 'is_onboarding_completed',
    profileImage: 'profile_image'
  };

  for (const [key, value] of Object.entries(payload) as [keyof UserProfileUpdatePayload, any][]) {
    if (value === undefined) continue;

    if (key === 'onboardingCompleted') {
      setters.push(`${map[key]} = ?`);
      params.push(value ? 1 : 0);
    } else {
      setters.push(`${map[key]} = ?`);
      params.push(value === null ? null : value);
    }
  }

  if (setters.length > 0) {
    setters.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(userId);
    await execute(env.DB, `UPDATE users SET ${setters.join(', ')} WHERE user_id = ?`, params);
  }

  const profile = await getUserProfile(env, userId);
  if (!profile) {
    throw new Error('User not found after update');
  }
  return profile;
}

export async function getUserSettings(env: Env, userId: string): Promise<UserSettings> {
  const rows = await query<{ setting_key: string; setting_value: string | null }>(
    env.DB,
    'SELECT setting_key, setting_value FROM user_settings WHERE user_id = ? ORDER BY setting_key',
    [userId]
  );

  const result: UserSettings = {};
  const notificationPreferences: Record<string, boolean> = {};

  for (const row of rows) {
    const [section, key] = row.setting_key.split('.');
    if (!key) continue;

    const rawValue = row.setting_value;
    const normalized = rawValue === 'true' ? true : rawValue === 'false' ? false : rawValue ?? undefined;

    switch (section) {
      case 'notifications':
        if (typeof normalized === 'boolean') {
          notificationPreferences[key] = normalized;
        }
        break;
      case 'preferences':
        if (key === 'language' && typeof normalized === 'string') {
          result.language = normalized;
        } else if (key === 'timezone' && typeof normalized === 'string') {
          result.timeZone = normalized;
        } else if (key === 'marketingOptIn' && typeof normalized === 'boolean') {
          result.marketingOptIn = normalized;
        }
        break;
      case 'privacy':
        // 보류: privacy 설정은 타입 정의에 포함되지 않음. 필요 시 확장
        break;
      default:
        break;
    }
  }

  if (Object.keys(notificationPreferences).length > 0) {
    result.notificationPreferences = notificationPreferences;
  }

  return result;
}

export async function updateUserSettings(
  env: Env,
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  const now = new Date().toISOString();
  const entries: Array<[string, string]> = [];

  if (settings.language) {
    entries.push(['preferences.language', settings.language]);
  }
  if (settings.timeZone) {
    entries.push(['preferences.timezone', settings.timeZone]);
  }
  if (settings.marketingOptIn !== undefined) {
    entries.push(['preferences.marketingOptIn', String(settings.marketingOptIn)]);
  }
  if (settings.notificationPreferences) {
    for (const [key, value] of Object.entries(settings.notificationPreferences)) {
      entries.push([`notifications.${key}`, String(value)]);
    }
  }

  await transaction(
    env.DB,
    entries.map(([key, value]) => ({
      sql: 'INSERT OR REPLACE INTO user_settings (user_id, setting_key, setting_value, updated_at) VALUES (?, ?, ?, ?)',
      params: [userId, key, value, now]
    }))
  );

  return getUserSettings(env, userId);
}

export async function saveProfileImage(
  env: Env,
  userId: string,
  fileName: string,
  contentType: string,
  body: ArrayBuffer
): Promise<string> {
  const safeName = sanitizeFileName(fileName) || 'profile-image';
  const key = `users/${userId}/profile/${Date.now()}-${safeName}`;

  await saveToR2(env.STORAGE, key, body, contentType, {
    userId,
    type: 'profile-image'
  });

  await updateUserProfile(env, userId, { profileImage: key });

  return `/api/v1/upload/file/${key}`;
}

export async function deleteProfileImage(env: Env, userId: string): Promise<void> {
  const row = await queryFirst<{ profile_image: string | null }>(
    env.DB,
    'SELECT profile_image FROM users WHERE user_id = ? LIMIT 1',
    [userId]
  );

  if (!row) {
    throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
  }

  const currentKey = row.profile_image ?? undefined;

  if (currentKey) {
    try {
      await deleteFromR2(env.STORAGE, currentKey);
    } catch (error) {
      console.warn('[user] Failed to delete profile image from R2', error);
    }
  }

  await updateUserProfile(env, userId, { profileImage: null });
}

export async function listLocations(env: Env): Promise<LocationSummary[]> {
  const rows = await query<{
    location_id: number;
    country: string;
    city: string | null;
    time_zone: string | null;
  }>(
    env.DB,
    'SELECT location_id, country, city, time_zone FROM locations ORDER BY country, city'
  );

  return rows.map((row) => ({
    id: row.location_id,
    country: row.country,
    city: row.city ?? undefined,
    timeZone: row.time_zone ?? undefined
  }));
}
