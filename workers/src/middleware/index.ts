export * from './auth';
export * from './error-handler';
export * from './logger';
export * from './security';

import { compress } from 'hono/compress';
import { etag } from 'hono/etag';
import { timeout } from 'hono/timeout';
import { requestId } from 'hono/request-id';
import { prettyJSON } from 'hono/pretty-json';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Variables } from '../types';

import { errorHandler } from './error-handler';
import { logger, performanceMonitor } from './logger';
import { securityHeaders, rateLimit } from './security';

/**
 * 기본 미들웨어 설정
 */
export function setupMiddleware(app: Hono) {
    // CORS 설정 (가장 먼저 적용)
    app.use('*', cors({
        origin: (origin) => {
            // 허용된 오리진 목록
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:5173',
                'https://languagemate.kr',
                'https://www.languagemate.kr',
                'https://workers.languagemate.kr'
            ];

            // 오리진이 없거나 허용된 목록에 있으면 허용
            if (!origin || allowedOrigins.includes(origin)) {
                return origin || '*';
            }

            // Cloudflare 개발 환경 허용
            if (origin.includes('.pages.dev') || origin.includes('.workers.dev')) {
                return origin;
            }

            return null;
        },
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-API-Key',
            'X-Internal-Secret',
            'X-Trace-ID'
        ],
        exposeHeaders: [
            'Content-Length',
            'X-Request-ID'
        ],
        credentials: true,
        maxAge: 86400 // 24시간
    }));

    // 요청 ID 생성
    app.use('*', requestId());

    // 에러 핸들링
    app.use('*', errorHandler);

    // 로깅
    app.use('*', logger);

    // 보안 헤더 (CORS 이후에 적용)
    app.use('*', securityHeaders);

    return app;
}