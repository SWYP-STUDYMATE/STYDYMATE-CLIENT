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
import { Env } from '../index';
import { Variables } from '../types';

import { errorHandler } from './error-handler';
import { logger, performanceMonitor } from './logger';
import { securityHeaders, rateLimit } from './security';

/**
 * 기본 미들웨어 설정
 */
export function setupMiddleware(app: Hono<{ Bindings: Env; Variables: Variables }>) {
    // 요청 ID 생성
    app.use('*', requestId());

    // 에러 핸들링 (가장 먼저)
    app.use('*', errorHandler);

    // 로깅
    app.use('*', logger);

    // 보안 헤더
    app.use('*', securityHeaders);

    // 타임아웃 (30초)
    app.use('*', timeout(30000));

    // 응답 압축
    app.use('*', compress());

    // ETag
    app.use('*', etag());

    // 개발 환경에서만 pretty JSON 사용
    app.use('*', async (c, next) => {
        if (c.env.ENVIRONMENT === 'development') {
            return prettyJSON()(c, next);
        }
        return next();
    });

    // 성능 모니터링 (3초 이상 걸리는 요청 감지)
    app.use('*', performanceMonitor(3000));

    // API 경로에 대한 Rate Limiting
    app.use('/api/*', rateLimit({
        windowMs: 15 * 60 * 1000, // 15분
        max: 100, // 최대 100개 요청
        skipSuccessfulRequests: false,
        skipFailedRequests: true
    }));

    return app;
}