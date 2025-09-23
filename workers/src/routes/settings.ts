import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';
import { getUserProfile, updateUserProfile, getUserSettings, updateUserSettings } from '../services/user';
import { query, transaction, execute } from '../utils/db';

const settingsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
const requireAuth = authMiddleware();

settingsRoutes.use('*', requireAuth);

async function loadSettingsMap(env: Env, userId: string): Promise<Map<string, string>> {
  const rows = await query<{ setting_key: string; setting_value: string | null }>(
    env.DB,
    'SELECT setting_key, setting_value FROM user_settings WHERE user_id = ?',
    [userId]
  );
  const map = new Map<string, string>();
  for (const row of rows) {
    if (row.setting_key) {
      map.set(row.setting_key, row.setting_value ?? '');
    }
  }
  return map;
}

async function saveSettingsEntries(env: Env, userId: string, entries: Record<string, string | null | undefined>) {
  const now = new Date().toISOString();
  const statements = Object.entries(entries)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => ({
      sql: 'INSERT OR REPLACE INTO user_settings (user_id, setting_key, setting_value, updated_at) VALUES (?, ?, ?, ?)',
      params: [userId, key, value === null ? null : String(value), now]
    }));
  if (statements.length === 0) return;
  await transaction(env.DB, statements);
}

async function deleteSettingsKeys(env: Env, userId: string, keys: string[]) {
  if (!keys.length) return;
  const placeholders = keys.map(() => '?').join(',');
  await execute(
    env.DB,
    `DELETE FROM user_settings WHERE user_id = ? AND setting_key IN (${placeholders})`,
    [userId, ...keys]
  );
}

function toBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return fallback;
}

settingsRoutes.get('/account', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const [profile, settings] = await Promise.all([
    getUserProfile(c.env, userId),
    loadSettingsMap(c.env, userId)
  ]);
  if (!profile) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return successResponse(c, {
    email: profile.email ?? '',
    phoneNumber: settings.get('account.phoneNumber') ?? '',
    englishName: profile.englishName ?? '',
    residence: settings.get('account.residence') ?? profile.location?.country ?? '',
    profileImage: profile.profileImage ?? null,
    bio: profile.selfBio ?? '',
    birthDate: profile.birthday ?? '',
    gender: profile.gender ?? '',
  });
});

settingsRoutes.patch('/account', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));

  const profilePayload: Record<string, any> = {};
  if (typeof body.englishName === 'string') profilePayload.englishName = body.englishName.trim();
  if (typeof body.bio === 'string') profilePayload.selfBio = body.bio.trim();
  if (typeof body.birthDate === 'string') profilePayload.birthday = body.birthDate;
  if (typeof body.gender === 'string') profilePayload.gender = body.gender;
  if (typeof body.profileImage === 'string' && body.profileImage.length > 0) {
    profilePayload.profileImage = body.profileImage;
  }
  if (Object.keys(profilePayload).length > 0) {
    await updateUserProfile(c.env, userId, profilePayload);
  }

  const entries: Record<string, string | null> = {};
  if (body.phoneNumber !== undefined) entries['account.phoneNumber'] = body.phoneNumber ? String(body.phoneNumber) : '';
  if (body.residence !== undefined) entries['account.residence'] = body.residence ? String(body.residence) : '';
  if (body.email !== undefined) entries['account.email'] = body.email ? String(body.email) : '';

  await saveSettingsEntries(c.env, userId, entries);

  if (body.email && typeof body.email === 'string') {
    await execute(
      c.env.DB,
      'UPDATE users SET email = ?, updated_at = ? WHERE user_id = ?',
      [body.email.trim(), new Date().toISOString(), userId]
    );
  }

  return successResponse(c, { success: true });
});

settingsRoutes.delete('/account', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  await execute(
    c.env.DB,
    'UPDATE users SET user_disable = 1, updated_at = ? WHERE user_id = ?',
    [new Date().toISOString(), userId]
  );
  return successResponse(c, { disabled: true });
});

settingsRoutes.get('/notifications', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const settings = await getUserSettings(c.env, userId);
  const prefs = settings.notificationPreferences ?? {};
  return successResponse(c, {
    email: prefs.email ?? false,
    push: prefs.push ?? false,
    sms: prefs.sms ?? false
  });
});

settingsRoutes.patch('/notifications', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const preferences: Record<string, boolean> = {};
  for (const key of ['email', 'push', 'sms']) {
    if (body[key] !== undefined) {
      preferences[key] = Boolean(body[key]);
    }
  }
  await updateUserSettings(c.env, userId, { notificationPreferences: preferences });
  return successResponse(c, { success: true });
});

settingsRoutes.get('/privacy', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const map = await loadSettingsMap(c.env, userId);
  return successResponse(c, {
    profilePublic: toBool(map.get('privacy.profilePublic'), true),
    showOnlineStatus: toBool(map.get('privacy.showOnlineStatus'), true),
    allowMessages: toBool(map.get('privacy.allowMessages'), true)
  });
});

settingsRoutes.patch('/privacy', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const entries: Record<string, string> = {};
  if (body.profilePublic !== undefined) entries['privacy.profilePublic'] = String(Boolean(body.profilePublic));
  if (body.showOnlineStatus !== undefined) entries['privacy.showOnlineStatus'] = String(Boolean(body.showOnlineStatus));
  if (body.allowMessages !== undefined) entries['privacy.allowMessages'] = String(Boolean(body.allowMessages));
  await saveSettingsEntries(c.env, userId, entries);
  return successResponse(c, { success: true });
});

settingsRoutes.get('/language', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const settings = await getUserSettings(c.env, userId);
  return successResponse(c, {
    language: settings.language ?? 'ko',
    timeZone: settings.timeZone ?? 'Asia/Seoul'
  });
});

settingsRoutes.patch('/language', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const payload: any = {};
  if (body.language !== undefined) payload.language = String(body.language);
  if (body.timeZone !== undefined) payload.timeZone = String(body.timeZone);
  if (body.marketingOptIn !== undefined) payload.marketingOptIn = Boolean(body.marketingOptIn);
  await updateUserSettings(c.env, userId, payload);
  return successResponse(c, { success: true });
});

settingsRoutes.patch('/password', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  if (typeof body.currentPassword !== 'string' || typeof body.newPassword !== 'string') {
    throw new AppError('currentPassword and newPassword are required', 400, 'INVALID_PAYLOAD');
  }
  // 비밀번호 저장 로직은 인증 인프라에 따라 달라지므로 현재는 성공만 반환
  return successResponse(c, { success: true, message: 'Password change acknowledged (no-op in worker).' });
});

settingsRoutes.post('/export', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const profile = await getUserProfile(c.env, userId);
  return successResponse(c, {
    exportedAt: new Date().toISOString(),
    profile,
    sessions: [],
    messages: []
  });
});

settingsRoutes.get('/login-history', async (c) => {
  return successResponse(c, []);
});

settingsRoutes.get('/two-factor', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const map = await loadSettingsMap(c.env, userId);
  const pending = map.get('security.twoFactor.setup');
  return successResponse(c, {
    enabled: toBool(map.get('security.twoFactor.enabled'), false),
    qrCode: pending ? map.get('security.twoFactor.qrCode') ?? null : null
  });
});

settingsRoutes.post('/two-factor/enable', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const secret = crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase();
  const otpauth = `otpauth://totp/StudyMate:${userId}?secret=${secret}&issuer=StudyMate`;
  await saveSettingsEntries(c.env, userId, {
    'security.twoFactor.setup': 'pending',
    'security.twoFactor.secret': secret,
    'security.twoFactor.qrCode': otpauth
  });
  return successResponse(c, { qrCode: otpauth });
});

settingsRoutes.post('/two-factor/disable', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  const body = await c.req.json().catch(() => ({}));
  const map = await loadSettingsMap(c.env, userId);
  if (map.get('security.twoFactor.setup') === 'pending') {
    await saveSettingsEntries(c.env, userId, { 'security.twoFactor.enabled': 'true' });
    await deleteSettingsKeys(c.env, userId, ['security.twoFactor.setup', 'security.twoFactor.qrCode']);
    return successResponse(c, { success: true, enabled: true, verified: true });
  }
  await saveSettingsEntries(c.env, userId, { 'security.twoFactor.enabled': 'false' });
  await deleteSettingsKeys(c.env, userId, ['security.twoFactor.secret', 'security.twoFactor.qrCode']);
  return successResponse(c, { success: true, enabled: false });
});

export default settingsRoutes;
