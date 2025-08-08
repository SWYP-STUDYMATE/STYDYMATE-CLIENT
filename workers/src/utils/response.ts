import { Context } from 'hono';
import { ApiResponse, PaginatedResponse } from '../types';

/**
 * 성공 응답 생성
 */
export function successResponse<T>(
    c: Context,
    data: T,
    meta?: Partial<ApiResponse['meta']>
): Response {
    const response: ApiResponse<T> = {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: c.get('requestId'),
            ...meta
        }
    };
    return c.json(response, 200);
}

/**
 * 생성 성공 응답 (201)
 */
export function createdResponse<T>(
    c: Context,
    data: T,
    location?: string
): Response {
    const response: ApiResponse<T> = {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: c.get('requestId')
        }
    };

    if (location) {
        c.header('Location', location);
    }

    return c.json(response, 201);
}

/**
 * 삭제 성공 응답 (204)
 */
export function noContentResponse(c: Context): Response {
    return c.body(null, 204);
}

/**
 * 페이지네이션 응답 생성
 */
export function paginatedResponse<T>(
    c: Context,
    data: T[],
    pagination: {
        page: number;
        limit: number;
        total: number;
    }
): Response {
    const response: PaginatedResponse<T> = {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            requestId: c.get('requestId'),
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit)
        }
    };
    return c.json(response, 200);
}

/**
 * 캐시 헤더 설정
 */
export function setCacheHeaders(
    c: Context,
    options: {
        maxAge?: number;      // 초 단위
        sMaxAge?: number;     // CDN 캐시 시간
        mustRevalidate?: boolean;
        private?: boolean;
        noCache?: boolean;
        noStore?: boolean;
    } = {}
): void {
    const directives: string[] = [];

    if (options.noStore) {
        directives.push('no-store');
    } else if (options.noCache) {
        directives.push('no-cache');
    } else {
        if (options.private) {
            directives.push('private');
        } else {
            directives.push('public');
        }

        if (options.maxAge !== undefined) {
            directives.push(`max-age=${options.maxAge}`);
        }

        if (options.sMaxAge !== undefined) {
            directives.push(`s-maxage=${options.sMaxAge}`);
        }

        if (options.mustRevalidate) {
            directives.push('must-revalidate');
        }
    }

    c.header('Cache-Control', directives.join(', '));
}

/**
 * ETag 생성 및 검증
 */
export async function handleETag(
    c: Context,
    data: any,
    weak: boolean = false
): Promise<boolean> {
    const content = JSON.stringify(data);
    const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(content)
    );
    const etag = `${weak ? 'W/' : ''}"${btoa(String.fromCharCode(...new Uint8Array(hash)))}"`;

    c.header('ETag', etag);

    const ifNoneMatch = c.req.header('If-None-Match');
    if (ifNoneMatch === etag) {
        c.status(304);
        return true; // Not Modified
    }

    return false;
}

/**
 * 응답 압축 확인
 */
export function shouldCompress(c: Context): boolean {
    const acceptEncoding = c.req.header('Accept-Encoding') || '';
    return acceptEncoding.includes('gzip') || acceptEncoding.includes('br');
}

/**
 * CORS 프리플라이트 응답
 */
export function preflightResponse(c: Context): Response {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': c.req.header('Origin') || '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Allow-Credentials': 'true'
        }
    });
}