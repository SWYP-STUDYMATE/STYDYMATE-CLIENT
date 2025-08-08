import { Context, Next } from 'hono';
import { Variables } from '../types';

export interface LogContext {
    requestId: string;
    method: string;
    path: string;
    ip?: string;
    userAgent?: string;
    userId?: string;
    duration?: number;
    status?: number;
    error?: any;
}

/**
 * 구조화된 로그 생성
 */
function createLog(level: 'info' | 'warn' | 'error', message: string, context: LogContext) {
    return JSON.stringify({
        level,
        message,
        timestamp: new Date().toISOString(),
        ...context
    });
}

/**
 * 요청 ID 생성
 */
function generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 로깅 미들웨어
 * 모든 요청/응답을 구조화된 형식으로 로깅
 */
export async function logger(c: Context<{ Variables: Variables }>, next: Next) {
    const requestId = c.req.header('X-Request-ID') || generateRequestId();
    const startTime = Date.now();

    // 변수 설정
    c.set('requestId', requestId);
    c.set('startTime', startTime);

    // 요청 로깅
    const logContext: LogContext = {
        requestId,
        method: c.req.method,
        path: c.req.path,
        ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For'),
        userAgent: c.req.header('User-Agent'),
        userId: c.get('userId')
    };

    console.log(createLog('info', 'Request received', logContext));

    try {
        await next();

        // 응답 로깅
        const duration = Date.now() - startTime;
        console.log(createLog('info', 'Request completed', {
            ...logContext,
            duration,
            status: c.res.status
        }));
    } catch (error) {
        // 에러 로깅
        const duration = Date.now() - startTime;
        console.error(createLog('error', 'Request failed', {
            ...logContext,
            duration,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error
        }));
        throw error;
    }
}

/**
 * 성능 모니터링 미들웨어
 * 느린 요청을 감지하고 경고
 */
export async function performanceMonitor(threshold: number = 3000) {
    return async (c: Context<{ Variables: Variables }>, next: Next) => {
        const startTime = c.get('startTime');

        await next();

        const duration = Date.now() - startTime;
        if (duration > threshold) {
            console.warn(createLog('warn', 'Slow request detected', {
                requestId: c.get('requestId'),
                method: c.req.method,
                path: c.req.path,
                duration,
                status: c.res.status
            }));
        }
    };
}