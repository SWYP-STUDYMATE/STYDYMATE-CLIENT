import { sign } from 'hono/jwt';
import type { Env } from '../index';
import type { AuthUser } from '../types';
import { assertEnvVar, generateState, hashSha256 } from '../utils/security';
import { queryFirst, execute, transaction } from '../utils/db';

interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

type OAuthProvider = 'naver' | 'google';

interface StatePayload {
  provider: OAuthProvider;
  redirectUri: string;
  callbackUrl?: string;
  createdAt: string;
}

interface DbUserRow {
  user_id: string;
  user_identity: string;
  email: string | null;
  name: string | null;
  english_name: string | null;
  profile_image: string | null;
  self_bio: string | null;
  gender: string | null;
}

interface IssueTokenOptions {
  env: Env;
  userId: string;
  email?: string | null;
  role?: string | null;
  permissions?: string[];
  userAgent?: string;
  ipAddress?: string;
  replaceTokenId?: string;
}

export interface OAuthCallbackResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  redirectUri: string;
  callbackUrl?: string;
}

const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 24 * 60 * 60; // 24시간
const DEFAULT_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7일

function resolveNumericEnv(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return fallback;
}

function getAccessTokenTtl(env: Env): number {
  return resolveNumericEnv(env.ACCESS_TOKEN_TTL_SECONDS, DEFAULT_ACCESS_TOKEN_TTL_SECONDS);
}

function getRefreshTokenTtl(env: Env): number {
  return resolveNumericEnv(env.REFRESH_TOKEN_TTL_SECONDS, DEFAULT_REFRESH_TOKEN_TTL_SECONDS);
}

function getJwtIssuer(env: Env): string {
  return env.JWT_ISSUER ?? env.API_BASE_URL ?? 'https://api.languagemate.kr';
}

const NAVER_AUTHORIZE_URL = 'https://nid.naver.com/oauth2.0/authorize';
const NAVER_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token';
const NAVER_USERINFO_URL = 'https://openapi.naver.com/v1/nid/me';

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

function getProviderConfig(env: Env, provider: OAuthProvider): ProviderConfig {
  switch (provider) {
    case 'naver':
      return {
        clientId: assertEnvVar(env.NAVER_CLIENT_ID, 'NAVER_CLIENT_ID'),
        clientSecret: assertEnvVar(env.NAVER_CLIENT_SECRET, 'NAVER_CLIENT_SECRET'),
        redirectUri: assertEnvVar(env.NAVER_REDIRECT_URI, 'NAVER_REDIRECT_URI')
      };
    case 'google':
      return {
        clientId: assertEnvVar(env.GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_ID'),
        clientSecret: assertEnvVar(env.GOOGLE_CLIENT_SECRET, 'GOOGLE_CLIENT_SECRET'),
        redirectUri: assertEnvVar(env.GOOGLE_REDIRECT_URI, 'GOOGLE_REDIRECT_URI')
      };
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

function normalizeProvider(provider: string): OAuthProvider {
  const value = provider.toLowerCase();
  if (value !== 'naver' && value !== 'google') {
    throw new Error(`Invalid OAuth provider: ${provider}`);
  }
  return value;
}

async function upsertOAuthUser(
  env: Env,
  identity: string,
  provider: OAuthProvider,
  payload: { name?: string | null; email?: string | null; profileImage?: string | null }
): Promise<DbUserRow> {
  const existing = await queryFirst<DbUserRow>(
    env.DB,
    'SELECT user_id, user_identity, email, name, english_name, profile_image, self_bio, gender FROM users WHERE user_identity = ? LIMIT 1',
    [identity]
  );

  const nowIso = new Date().toISOString();

  if (existing) {
    const updates: string[] = [];
    const params: (string | null)[] = [];

    if (payload.name) {
      updates.push('name = ?');
      params.push(payload.name);
    }
    if (payload.email) {
      updates.push('email = ?');
      params.push(payload.email);
    }
    if (payload.profileImage) {
      updates.push('profile_image = ?');
      params.push(payload.profileImage);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(nowIso);
      params.push(existing.user_id);
      await execute(env.DB, `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params);
    }

    return {
      ...existing,
      email: payload.email ?? existing.email,
      name: payload.name ?? existing.name,
      profile_image: payload.profileImage ?? existing.profile_image
    };
  }

  const userId = crypto.randomUUID();
  await execute(
    env.DB,
    `INSERT INTO users (
        user_id,
        user_identity,
        email,
        name,
        profile_image,
        user_disable,
        is_onboarding_completed,
        user_identity_type,
        user_created_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?)
    `,
    [
      userId,
      identity,
      payload.email ?? null,
      payload.name ?? null,
      payload.profileImage ?? null,
      provider.toUpperCase(),
      nowIso,
      nowIso,
      nowIso
    ]
  );

  return {
    user_id: userId,
    user_identity: identity,
    email: payload.email ?? null,
    name: payload.name ?? null,
    english_name: null,
    profile_image: payload.profileImage ?? null,
    self_bio: null,
    gender: null
  };
}

async function issueTokens(options: IssueTokenOptions): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const {
    env,
    userId,
    email,
    role = 'USER',
    permissions = [],
    userAgent,
    ipAddress,
    replaceTokenId
  } = options;

  const secret = assertEnvVar(env.JWT_SECRET, 'JWT_SECRET');
  const accessTokenTtl = getAccessTokenTtl(env);
  const refreshTokenTtl = getRefreshTokenTtl(env);
  const issuer = getJwtIssuer(env);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAtSeconds = nowSeconds + accessTokenTtl;

  const payload = {
    sub: userId,
    email,
    role,
    permissions,
    iat: nowSeconds,
    exp: expiresAtSeconds,
    iss: issuer
  } as Record<string, unknown>;

  const accessToken = await sign(payload, secret, 'HS512');

  const refreshId = crypto.randomUUID();
  const refreshPayload = {
    jti: refreshId,
    sub: userId,
    type: 'refresh',
    iat: nowSeconds,
    exp: nowSeconds + refreshTokenTtl,
    iss: issuer
  } as Record<string, unknown>;
  const refreshToken = await sign(refreshPayload, secret, 'HS512');
  const refreshHash = await hashSha256(refreshToken);
  const issuedAtIso = new Date(nowSeconds * 1000).toISOString();
  const refreshExpiresAtIso = new Date((nowSeconds + refreshTokenTtl) * 1000).toISOString();

  await transaction(env.DB, [
    ...(replaceTokenId
      ? [
          {
            sql: 'UPDATE refresh_tokens SET revoked_at = ? WHERE token_id = ?',
            params: [issuedAtIso, replaceTokenId]
          }
        ]
      : []),
    {
      sql: `INSERT INTO refresh_tokens (
              token_id,
              user_id,
              token_hash,
              issued_at,
              expires_at,
              user_agent,
              ip_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      params: [refreshId, userId, refreshHash, issuedAtIso, refreshExpiresAtIso, userAgent ?? null, ipAddress ?? null]
    }
  ]);

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTokenTtl
  };
}

async function getUserById(env: Env, userId: string): Promise<DbUserRow | null> {
  return queryFirst<DbUserRow>(
    env.DB,
    'SELECT user_id, user_identity, email, name, english_name, profile_image, self_bio, gender FROM users WHERE user_id = ? LIMIT 1',
    [userId]
  );
}

function mapDbUserToAuthUser(row: DbUserRow): AuthUser {
  return {
    id: row.user_id,
    email: row.email ?? undefined,
    role: 'USER',
    permissions: []
  };
}

async function consumeState(env: Env, state?: string): Promise<StatePayload | null> {
  if (!state) {
    return null;
  }
  const key = `oauth:state:${state}`;
  const value = await env.CACHE.get(key, { type: 'json' });
  if (value) {
    await env.CACHE.delete(key);
  }
  return value as StatePayload | null;
}

export async function generateLoginUrl(
  env: Env,
  providerName: string,
  redirectUri?: string
): Promise<{ url: string; state: string }> {
  const provider = normalizeProvider(providerName);
  const config = getProviderConfig(env, provider);
  const state = generateState(provider);

  // redirectUri는 로그인 완료 후 프론트엔드로 리다이렉트할 URL (target)
  // OAuth redirect_uri는 항상 config.redirectUri 사용 (네이버/구글에 등록된 것)
  const baseRedirect = redirectUri || 'https://languagemate.kr';
  const callbackUrl = (() => {
    try {
      return new URL(`/login/oauth2/code/${provider}`, baseRedirect).toString();
    } catch {
      return `https://languagemate.kr/login/oauth2/code/${provider}`;
    }
  })();

  const statePayload: StatePayload = {
    provider,
    redirectUri: baseRedirect,  // 최종 리다이렉트 목적지
    callbackUrl,
    createdAt: new Date().toISOString()
  };

  await env.CACHE.put(`oauth:state:${state}`, JSON.stringify(statePayload), {
    expirationTtl: 300
  });

  const authorizeUrl = new URL(provider === 'naver' ? NAVER_AUTHORIZE_URL : GOOGLE_AUTHORIZE_URL);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', config.clientId);
  authorizeUrl.searchParams.set('redirect_uri', config.redirectUri);  // 항상 OAuth 앱에 등록된 URL 사용
  authorizeUrl.searchParams.set('state', state);

  if (provider === 'google') {
    authorizeUrl.searchParams.set('scope', 'openid email profile');
    authorizeUrl.searchParams.set('access_type', 'offline');
    authorizeUrl.searchParams.set('prompt', 'consent');
  }

  return {
    url: authorizeUrl.toString(),
    state
  };
}

export async function handleOAuthCallback(
  env: Env,
  providerName: string,
  params: { code: string; state?: string },
  metadata: { userAgent?: string; ipAddress?: string } = {}
): Promise<OAuthCallbackResult> {
  const provider = normalizeProvider(providerName);
  const config = getProviderConfig(env, provider);
  const statePayload = await consumeState(env, params.state);

  // redirectUri는 최종 프론트엔드 리다이렉트 목적지
  const finalRedirectUri = statePayload?.redirectUri ?? 'https://languagemate.kr';
  const callbackUrl = statePayload?.callbackUrl ?? (() => {
    try {
      return new URL(`/login/oauth2/code/${provider}`, finalRedirectUri).toString();
    } catch {
      return `https://languagemate.kr/login/oauth2/code/${provider}`;
    }
  })();

  if (statePayload && statePayload.provider !== provider) {
    throw new Error('OAuth provider mismatch for provided state');
  }

  // OAuth 토큰 교환에는 config.redirectUri 사용 (OAuth 앱에 등록된 것)
  const result = provider === 'naver'
    ? await handleNaverCallback(env, config, params.code, params.state, config.redirectUri, metadata)
    : await handleGoogleCallback(env, config, params.code, config.redirectUri, metadata);

  return {
    ...result,
    redirectUri: finalRedirectUri,
    callbackUrl
  };
}

async function handleNaverCallback(
  env: Env,
  config: ProviderConfig,
  code: string,
  state: string | undefined,
  redirectUri: string,
  metadata: { userAgent?: string; ipAddress?: string }
): Promise<OAuthCallbackResult> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    state: state ?? '',
    redirect_uri: redirectUri
  });

  const tokenRes = await fetch(NAVER_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!tokenRes.ok) {
    throw new Error(`Naver token exchange failed: ${tokenRes.status}`);
  }

  const tokenJson = await tokenRes.json() as { access_token?: string };
  const accessToken = tokenJson.access_token;
  if (!accessToken) {
    throw new Error('Naver token exchange response missing access_token');
  }

  const profileRes = await fetch(NAVER_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!profileRes.ok) {
    throw new Error(`Naver userinfo request failed: ${profileRes.status}`);
  }

  const profileJson = await profileRes.json() as { response?: Record<string, any> };
  const response = profileJson.response ?? {};
  const identity = response.id as string;

  if (!identity) {
    throw new Error('Naver userinfo did not include id');
  }

  const userRow = await upsertOAuthUser(env, identity, 'naver', {
    name: response.name ?? response.nickname ?? null,
    email: response.email ?? null,
    profileImage: response.profile_image ?? null
  });

  const tokens = await issueTokens({
    env,
    userId: userRow.user_id,
    email: userRow.email,
    role: 'USER',
    permissions: [],
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress
  });

  return {
    user: mapDbUserToAuthUser(userRow),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    redirectUri
  };
}

async function handleGoogleCallback(
  env: Env,
  config: ProviderConfig,
  code: string,
  redirectUri: string,
  metadata: { userAgent?: string; ipAddress?: string }
): Promise<OAuthCallbackResult> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: redirectUri
  });

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!tokenRes.ok) {
    throw new Error(`Google token exchange failed: ${tokenRes.status}`);
  }

  const tokenJson = await tokenRes.json() as { access_token?: string };
  const accessToken = tokenJson.access_token;

  if (!accessToken) {
    throw new Error('Google token exchange response missing access_token');
  }

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!profileRes.ok) {
    throw new Error(`Google userinfo request failed: ${profileRes.status}`);
  }

  const profileJson = await profileRes.json() as { id?: string; email?: string; name?: string; picture?: string };
  if (!profileJson.id) {
    throw new Error('Google userinfo did not include id');
  }

  const userRow = await upsertOAuthUser(env, profileJson.id, 'google', {
    name: profileJson.name ?? null,
    email: profileJson.email ?? null,
    profileImage: profileJson.picture ?? null
  });

  const tokens = await issueTokens({
    env,
    userId: userRow.user_id,
    email: userRow.email,
    role: 'USER',
    permissions: [],
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress
  });

  return {
    user: mapDbUserToAuthUser(userRow),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    redirectUri
  };
}

export async function refreshTokens(
  env: Env,
  refreshToken: string,
  metadata: { userAgent?: string; ipAddress?: string } = {}
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const refreshHash = await hashSha256(refreshToken);
  const row = await queryFirst<{
    token_id: string;
    user_id: string;
    expires_at: string;
    revoked_at: string | null;
  }>(
    env.DB,
    'SELECT token_id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
    [refreshHash]
  );

  if (!row) {
    throw new Error('Invalid refresh token');
  }

  if (row.revoked_at) {
    throw new Error('Refresh token revoked');
  }

  if (Date.parse(row.expires_at) < Date.now()) {
    throw new Error('Refresh token expired');
  }

  const user = await getUserById(env, row.user_id);
  if (!user) {
    throw new Error('User not found for refresh token');
  }

  return issueTokens({
    env,
    userId: user.user_id,
    email: user.email,
    role: 'USER',
    permissions: [],
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
    replaceTokenId: row.token_id
  });
}

export async function logoutUser(
  env: Env,
  _accessToken: string,
  refreshToken?: string
): Promise<void> {
  if (!refreshToken) {
    return;
  }

  const refreshHash = await hashSha256(refreshToken);
  await execute(
    env.DB,
    'UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ?',
    [new Date().toISOString(), refreshHash]
  );
}
