import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ApiError, ApiResponse } from '../types';

/**
 * 전역 에러 핸들링 미들웨어
 * 모든 예외를 캐치하여 일관된 형식으로 응답
 */
export async function errorHandler(c: Context, next: Next) {
    try {
        await next();
    } catch (error) {
        console.error('[Error]', {
            requestId: c.get('requestId'),
            path: c.req.path,
            method: c.req.method,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error
        });

        // API 에러 처리
        if (error instanceof ApiError) {
            return c.json<ApiResponse>({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                    details: error.details
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: c.get('requestId')
                }
            }, {
                status: error.statusCode
            });
        }

        // Hono HTTP 예외 처리
        if (error instanceof HTTPException) {
            return c.json<ApiResponse>({
                success: false,
                error: {
                    message: error.message,
                    code: 'HTTP_EXCEPTION'
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: c.get('requestId')
                }
            }, { status: error.status });
        }

        // 예상치 못한 에러
        const isDevelopment = c.env.ENVIRONMENT === 'development';
        return c.json<ApiResponse>({
            success: false,
            error: {
                message: isDevelopment ? (error as Error).message : 'Internal Server Error',
                code: 'INTERNAL_ERROR',
                details: isDevelopment ? (error as Error).stack : undefined
            },
            meta: {
                timestamp: new Date().toISOString(),
                requestId: c.get('requestId')
            }
        }, { status: 500 });
    }
}

/**
 * 404 핸들러
 */
export function notFoundHandler(c: Context): Response {
    return c.json<ApiResponse>({
        success: false,
        error: {
            message: `Route not found: ${c.req.method} ${c.req.path}`,
            code: 'NOT_FOUND'
        },
        meta: {
            timestamp: new Date().toISOString(),
            requestId: c.get('requestId')
        }
    }, { status: 404 });
}

/**
 * 유효성 검사 에러 생성 헬퍼
 */
export function validationError(message: string, details?: any): ApiError {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
}

/**
 * 인증 에러 생성 헬퍼
 */
export function authError(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, 'AUTH_ERROR', message);
}

/**
 * 권한 에러 생성 헬퍼
 */
export function forbiddenError(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
}

/**
 * 리소스 없음 에러 생성 헬퍼
 */
export function notFoundError(resource: string): ApiError {
    return new ApiError(404, 'NOT_FOUND', `${resource} not found`);
}

/**
 * 충돌 에러 생성 헬퍼
 */
export function conflictError(message: string): ApiError {
    return new ApiError(409, 'CONFLICT', message);
}