import { Context, Next } from 'hono';
import type { AppBindings as Env } from '../index';
import { Variables } from '../types';
import { APICache } from '../services/cache';

interface CacheConfig {
  ttl?: number;
  keyGenerator?: (c: Context) => string;
  shouldCache?: (c: Context) => boolean;
  tags?: string[];
}

// 기본 캐시 설정
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 300, // 5분
  shouldCache: (c) => c.req.method === 'GET' && c.res?.status === 200
};

// 캐시 미들웨어 팩토리
export function cache(config: CacheConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
    // POST, PUT, DELETE 등은 캐싱하지 않음
    if (c.req.method !== 'GET') {
      return next();
    }

    // 캐시 무시 헤더 확인
    const cacheControl = c.req.header('cache-control');
    if (cacheControl === 'no-cache' || cacheControl === 'no-store') {
      return next();
    }

    // 캐시 서비스 초기화
    const apiCache = new APICache(c.env.CACHE);

    // 캐시 키 생성
    const url = new URL(c.req.url);
    const cacheKey = finalConfig.keyGenerator 
      ? finalConfig.keyGenerator(c)
      : `${url.pathname}${url.search}`;

    // 캐시 조회
    try {
      const cached = await apiCache.getCachedResponse('GET', cacheKey);
      if (cached) {
        // 캐시 히트
        c.header('X-Cache', 'HIT');
        c.header('X-Cache-Key', cacheKey);
        c.header('Cache-Control', `public, max-age=${finalConfig.ttl}`);
        
        return c.json(cached);
      }
    } catch (error) {
      console.error('Cache retrieval error:', error);
      // 캐시 오류 시 요청 계속 진행
    }

    // 원본 응답 처리
    await next();

    // 응답 캐싱
    if (finalConfig.shouldCache && finalConfig.shouldCache(c)) {
      try {
        // 응답 본문 읽기
        const responseClone = c.res.clone();
        const responseBody = await responseClone.json();

        // 캐시 저장
        await apiCache.cacheResponse(
          'GET',
          cacheKey,
          responseBody,
          null,
          finalConfig.ttl
        );

        // 캐시 미스 헤더 추가
        c.header('X-Cache', 'MISS');
        c.header('X-Cache-Key', cacheKey);
        c.header('Cache-Control', `public, max-age=${finalConfig.ttl}`);
      } catch (error) {
        console.error('Cache storage error:', error);
        // 캐시 저장 실패 시에도 응답은 정상 반환
      }
    }
  };
}

// 사용자별 캐시 미들웨어
export function userCache(config: CacheConfig = {}) {
  return cache({
    ...config,
    keyGenerator: (c) => {
      const userId = c.req.header('x-user-id') || 'anonymous';
      const url = new URL(c.req.url);
      return `user:${userId}:${url.pathname}${url.search}`;
    }
  });
}

// 세션별 캐시 미들웨어
export function sessionCache(config: CacheConfig = {}) {
  return cache({
    ...config,
    keyGenerator: (c) => {
      const cookies = (c.req as any).cookie ? (c.req as any).cookie() : undefined;
      const sessionCookie = typeof cookies === 'object' ? cookies['session_id'] : undefined;
      const sessionId = c.req.header('x-session-id') || sessionCookie || 'no-session';
      const url = new URL(c.req.url);
      return `session:${sessionId}:${url.pathname}${url.search}`;
    }
  });
}

// 캐시 무효화 헬퍼
export async function invalidateCache(
  kv: KVNamespace,
  patterns: string[]
): Promise<void> {
  const apiCache = new APICache(kv);
  
  await Promise.all(
    patterns.map(pattern => {
      if (pattern === '*') {
        return apiCache.invalidateAll();
      }
      return apiCache.invalidateMethod(pattern);
    })
  );
}

// 캐시 워머 - 미리 캐시를 채워넣는 함수
export async function warmCache(
  env: Env,
  endpoints: Array<{ url: string; ttl?: number }>
): Promise<void> {
  const apiCache = new APICache(env.CACHE);
  
  await Promise.all(
    endpoints.map(async ({ url, ttl = 3600 }) => {
      try {
        // 실제 엔드포인트 호출
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const urlObj = new URL(url);
          const cacheKey = `${urlObj.pathname}${urlObj.search}`;
          
          await apiCache.cacheResponse('GET', cacheKey, data, null, ttl);
        }
      } catch (error) {
        console.error(`Failed to warm cache for ${url}:`, error);
      }
    })
  );
}

// 캐시 상태 확인 엔드포인트를 위한 헬퍼
export async function getCacheStats(kv: KVNamespace): Promise<{
  totalKeys: number;
  estimatedSize: number;
  cacheTypes: Record<string, number>;
}> {
  const list = await kv.list({ limit: 1000 });
  
  const cacheTypes: Record<string, number> = {};
  
  for (const key of list.keys) {
    const [prefix] = key.name.split(':');
    cacheTypes[prefix] = (cacheTypes[prefix] || 0) + 1;
  }
  
  return {
    totalKeys: list.keys.length,
    estimatedSize: list.keys.reduce((sum, key: any) => sum + (key.metadata?.size || 0), 0),
    cacheTypes
  };
}