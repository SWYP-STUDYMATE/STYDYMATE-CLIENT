import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';
import { auth } from '../middleware/auth';
import { getUserProfile } from '../services/user';
import {
  generateLoginUrl,
  handleOAuthCallback,
  refreshTokens,
  logoutUser
} from '../services/auth';
import { endpointRateLimit } from '../middleware/rateLimit';

const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Auth 엔드포인트에 Rate Limiting 적용
authRoutes.use('*', endpointRateLimit('auth'));

const wrapAuthError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  const message = error instanceof Error ? error.message : 'Authentication failure';
  return new AppError(message, 500, 'AUTH_OPERATION_FAILED');
};

// OAuth 로그인 URL 생성 - /auth/login/:provider와 /login/:provider 모두 지원
authRoutes.get('/login/:provider', async (c) => {
  const provider = c.req.param('provider');
  const target = c.req.query('target') || c.req.query('redirect_uri') || undefined;

  try {
    const result = await generateLoginUrl(c.env, provider, target);
    // 브라우저에서 직접 접근한 경우 OAuth URL로 리다이렉트
    const acceptHeader = c.req.header('Accept') || '';
    if (!acceptHeader.includes('application/json') && result.url) {
      return c.redirect(result.url);
    }
    return successResponse(c, result);
  } catch (error) {
    throw wrapAuthError(error);
  }
});

// 직접 OAuth 경로 지원 (/naver, /google 등) - 브라우저에서 직접 접근시 리다이렉트
authRoutes.get('/naver', async (c) => {
  const target = c.req.query('target') || undefined;
  try {
    const result = await generateLoginUrl(c.env, 'naver', target);
    // 브라우저에서 직접 접근한 경우 OAuth URL로 리다이렉트
    if (result.url) {
      return c.redirect(result.url);
    }
    return successResponse(c, result);
  } catch (error) {
    throw wrapAuthError(error);
  }
});

authRoutes.get('/google', async (c) => {
  const target = c.req.query('target') || undefined;
  try {
    const result = await generateLoginUrl(c.env, 'google', target);
    // 브라우저에서 직접 접근한 경우 OAuth URL로 리다이렉트
    if (result.url) {
      return c.redirect(result.url);
    }
    return successResponse(c, result);
  } catch (error) {
    throw wrapAuthError(error);
  }
});

// OAuth 콜백 처리 - /auth/callback/:provider
authRoutes.get('/callback/:provider', async (c) => {
  const provider = c.req.param('provider');
  const code = c.req.query('code');
  const state = c.req.query('state') || undefined;

  if (!code) {
    throw new AppError('Missing OAuth code', 400, 'INVALID_OAUTH_CALLBACK');
  }

  try {
    const result = await handleOAuthCallback(
      c.env,
      provider,
      { code, state },
      {
        userAgent: c.req.header('User-Agent') || undefined,
        ipAddress:
          c.req.header('CF-Connecting-IP') ||
          c.req.header('X-Forwarded-For') ||
          c.req.header('X-Real-IP') ||
          undefined
      }
    );
    const acceptsJson = (c.req.header('Accept') || '').includes('application/json');
    if (!acceptsJson) {
      const redirectTarget = result.callbackUrl || result.redirectUri;
      if (!redirectTarget) {
        return successResponse(c, result);
      }
      const redirectUrl = new URL(redirectTarget);
      redirectUrl.searchParams.set('accessToken', result.accessToken);
      redirectUrl.searchParams.set('refreshToken', result.refreshToken);
      redirectUrl.searchParams.set('provider', provider);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }
      if (result.redirectUri && result.redirectUri !== redirectTarget) {
        redirectUrl.searchParams.set('redirect', result.redirectUri);
      }
      return c.redirect(redirectUrl.toString());
    }
    return successResponse(c, result);
  } catch (error) {
    throw wrapAuthError(error);
  }
});

authRoutes.post('/refresh', async (c) => {
  const authorization = c.req.header('Authorization');
  if (!authorization) {
    throw new AppError('Authorization header required', 400, 'MISSING_AUTH_HEADER');
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new AppError('Invalid Authorization format', 400, 'INVALID_AUTH_HEADER');
  }

  const refreshToken = match[1];

  try {
    const result = await refreshTokens(
      c.env,
      refreshToken,
      {
        userAgent: c.req.header('User-Agent') || undefined,
        ipAddress:
          c.req.header('CF-Connecting-IP') ||
          c.req.header('X-Forwarded-For') ||
          c.req.header('X-Real-IP') ||
          undefined
      }
    );
    return successResponse(c, result);
  } catch (error) {
    throw wrapAuthError(error);
  }
});

authRoutes.post('/logout', async (c) => {
  const authorization = c.req.header('Authorization');
  if (!authorization) {
    throw new AppError('Authorization header required', 400, 'MISSING_AUTH_HEADER');
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new AppError('Invalid Authorization format', 400, 'INVALID_AUTH_HEADER');
  }

  const accessToken = match[1];
  const refreshToken = c.req.header('X-Refresh-Token') || undefined;

  try {
    await logoutUser(c.env, accessToken, refreshToken);
    return successResponse(c, { success: true });
  } catch (error) {
    throw wrapAuthError(error);
  }
});

authRoutes.get('/me', auth(), async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User context missing', 500, 'CONTEXT_MISSING_USER');
  }

  try {
    const profile = await getUserProfile(c.env, userId);
    if (!profile) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return successResponse(c, {
      id: profile.id,
      email: profile.email,
      name: profile.name ?? profile.englishName,
      englishName: profile.englishName,
      onboardingCompleted: profile.onboardingCompleted,
    });
  } catch (error) {
    throw wrapAuthError(error);
  }
});

authRoutes.get('/verify', auth(), async (c) => {
  const user = c.get('user');
  return successResponse(c, {
    valid: true,
    user: user ?? null
  });
});

export default authRoutes;
