import { Context, Next } from 'hono';
import { ApiError } from '../types';
import type { AppBindings as Env } from '../index';

/**
 * 보안 헤더 미들웨어
 * OWASP 권장사항에 따른 보안 헤더 설정
 */
export async function securityHeaders(c: Context, next: Next) {
    await next();

    // 보안 헤더 설정
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // CSP는 환경에 따라 다르게 설정
    const isDevelopment = (c as any).env?.ENVIRONMENT === 'development';
    if (!isDevelopment) {
        c.header(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:"
        );
    }

    // HSTS (HTTPS 환경에서만)
    if (c.req.header('X-Forwarded-Proto') === 'https') {
        c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
}

/**
 * Rate Limiting 미들웨어
 * IP 기반 요청 제한
 */
export function rateLimit(options: {
    windowMs?: number;  // 시간 창 (기본: 15분)
    max?: number;       // 최대 요청 수 (기본: 100)
    keyGenerator?: (c: Context) => string; // 키 생성 함수
    skipSuccessfulRequests?: boolean; // 성공한 요청은 제외
    skipFailedRequests?: boolean;     // 실패한 요청은 제외
} = {}) {
    const {
        windowMs = 15 * 60 * 1000, // 15분
        max = 100,
        keyGenerator = (c) => c.req.header('CF-Connecting-IP') || 'unknown',
        skipSuccessfulRequests = false,
        skipFailedRequests = false
    } = options;

    return async (c: Context<{ Bindings: Env }>, next: Next) => {
        const key = `rate-limit:${keyGenerator(c)}`;
        const now = Date.now();
        const windowStart = now - windowMs;

        try {
            // KV에서 현재 요청 기록 가져오기
            const stored = await c.env.CACHE.get(key);
            let requests: number[] = stored ? JSON.parse(stored) : [];

            // 윈도우 밖의 요청 제거
            requests = requests.filter(timestamp => timestamp > windowStart);

            // 제한 확인
            if (requests.length >= max) {
                const retryAfter = Math.ceil((requests[0] + windowMs - now) / 1000);
                c.header('Retry-After', retryAfter.toString());
                c.header('X-RateLimit-Limit', max.toString());
                c.header('X-RateLimit-Remaining', '0');
                c.header('X-RateLimit-Reset', new Date(requests[0] + windowMs).toISOString());

                throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests');
            }

            // 다음 미들웨어 실행
            await next();

            // 요청 기록 (옵션에 따라)
            const shouldSkip =
                (skipSuccessfulRequests && c.res.status < 400) ||
                (skipFailedRequests && c.res.status >= 400);

            if (!shouldSkip) {
                requests.push(now);
                await c.env.CACHE.put(key, JSON.stringify(requests), {
                    expirationTtl: Math.ceil(windowMs / 1000)
                });
            }

            // Rate limit 헤더 설정
            c.header('X-RateLimit-Limit', max.toString());
            c.header('X-RateLimit-Remaining', (max - requests.length).toString());
            c.header('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
        } catch (error) {
            if (error instanceof ApiError && error.statusCode === 429) {
                throw error;
            }
            // KV 에러는 무시하고 계속 진행
            console.error('Rate limit error:', error);
            await next();
        }
    };
}

/**
 * IP 화이트리스트/블랙리스트 미들웨어
 */
export function ipFilter(options: {
    whitelist?: string[];
    blacklist?: string[];
} = {}) {
    return async (c: Context, next: Next) => {
        const clientIp = c.req.header('CF-Connecting-IP') ||
            c.req.header('X-Forwarded-For')?.split(',')[0] ||
            'unknown';

        // 블랙리스트 확인
        if (options.blacklist?.includes(clientIp)) {
            throw new ApiError(403, 'FORBIDDEN', 'Access denied');
        }

        // 화이트리스트 확인 (설정된 경우)
        if (options.whitelist && options.whitelist.length > 0) {
            if (!options.whitelist.includes(clientIp)) {
                throw new ApiError(403, 'FORBIDDEN', 'Access denied');
            }
        }

        await next();
    };
}

/**
 * 요청 크기 제한 미들웨어
 */
export function bodySizeLimit(maxSize: number = 10 * 1024 * 1024) { // 기본 10MB
    return async (c: Context, next: Next) => {
        const contentLength = c.req.header('Content-Length');

        if (contentLength && parseInt(contentLength) > maxSize) {
            throw new ApiError(413, 'PAYLOAD_TOO_LARGE', `Request body too large. Maximum size: ${maxSize} bytes`);
        }

        await next();
    };
}