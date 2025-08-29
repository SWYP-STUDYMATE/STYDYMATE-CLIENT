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
import type { Variables } from '../types';

import { errorHandler } from './error-handler';
import { logger, performanceMonitor } from './logger';
import { securityHeaders, rateLimit } from './security';

/**
 * 기본 미들웨어 설정
 */
export function setupMiddleware(app: Hono) {
    // 최소한의 미들웨어만 활성화 (디버깅용)
    
    // 요청 ID 생성
    app.use('*', requestId());

    // 에러 핸들링만 유지
    app.use('*', errorHandler);

    // 로깅만 유지  
    app.use('*', logger);

    return app;
}