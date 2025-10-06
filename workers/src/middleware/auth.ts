import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { AuthUser, Variables } from '../types';
import { authError, forbiddenError } from './error-handler';
import type { AppBindings as Env } from '../index';
import { assertEnvVar } from '../utils/security';

interface AuthOptions {
    optional?: boolean; // 인증이 선택적인지
    roles?: string[];   // 허용된 역할
    permissions?: string[]; // 필요한 권한
}

/**
 * JWT 토큰에서 사용자 정보 추출
 */
async function extractUser(token: string, env: Env): Promise<AuthUser | null> {
    try {
        const secret = assertEnvVar(env.JWT_SECRET, 'JWT_SECRET');
        const verifyOptions: {
            alg: 'HS512';
            iss?: string;
        } = { alg: 'HS512' };
        const issuer = env.JWT_ISSUER ?? env.API_BASE_URL;
        if (issuer) {
            verifyOptions.iss = issuer;
        }
        const payload = await verify(token, secret, verifyOptions);
        return {
            id: payload.sub as string,
            email: payload.email as string,
            role: payload.role as string,
            permissions: payload.permissions as string[]
        };
    } catch (error) {
        return null;
    }
}

/**
 * Bearer 토큰 인증 미들웨어
 */
export function auth(options: AuthOptions = {}) {
    return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
        const authHeader = c.req.header('Authorization');

        if (!authHeader) {
            if (options.optional) {
                return next();
            }

            return c.json({
                success: false,
                error: {
                    message: 'Authorization header required',
                    code: 'AUTH_ERROR'
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: c.get('requestId')
                }
            }, 401);
        }

        const match = authHeader.match(/^Bearer (.+)$/);
        if (!match) {
            return c.json({
                success: false,
                error: {
                    message: 'Invalid authorization format. Use: Bearer <token>',
                    code: 'AUTH_ERROR'
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: c.get('requestId')
                }
            }, 401);
        }

        const token = match[1];
        const user = await extractUser(token, c.env);

        if (!user) {
            return c.json({
                success: false,
                error: {
                    message: 'Invalid or expired token',
                    code: 'AUTH_ERROR'
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: c.get('requestId')
                }
            }, 401);
        }

        // 역할 확인
        if (options.roles && options.roles.length > 0) {
            if (!user.role || !options.roles.includes(user.role)) {
                throw forbiddenError('Insufficient role');
            }
        }

        // 권한 확인
        if (options.permissions && options.permissions.length > 0) {
            const hasPermission = options.permissions.some(
                permission => user.permissions?.includes(permission)
            );
            if (!hasPermission) {
                throw forbiddenError('Insufficient permissions');
            }
        }

        // 사용자 정보 저장
        c.set('userId', user.id);
        c.set('user', user as unknown as any);

        await next();
    };
}

/**
 * API 키 인증 미들웨어
 */
export function apiKey(headerName: string = 'X-API-Key') {
    return async (c: Context<{ Bindings: Env }>, next: Next) => {
        const key = c.req.header(headerName);

        if (!key) {
            throw authError(`${headerName} header required`);
        }

        const validKeys = c.env.API_KEYS?.split(',') || [];
        if (!validKeys.includes(key)) {
            throw authError('Invalid API key');
        }

        await next();
    };
}

/**
 * 내부 서비스 간 인증 미들웨어
 */
export function internalAuth(secret?: string) {
    return async (c: Context<{ Bindings: Env }>, next: Next) => {
        const authSecret = c.req.header('X-Internal-Secret');
        const expectedSecret = secret || c.env.INTERNAL_SECRET;

        if (!authSecret || authSecret !== expectedSecret) {
            throw authError('Invalid internal authentication');
        }

        await next();
    };
}

/**
 * 현재 인증된 사용자 가져오기 헬퍼
 */
export function getCurrentUser(c: Context): AuthUser | null {
    return c.get('user') || null;
}

/**
 * 인증 필수 확인 헬퍼
 */
export function requireAuth(c: Context): AuthUser {
    const user = getCurrentUser(c);
    if (!user) {
        throw authError('Authentication required');
    }
    return user;
}
