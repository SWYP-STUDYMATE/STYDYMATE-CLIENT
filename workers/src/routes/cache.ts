import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from '../index';
import { getCacheStats, invalidateCache, warmCache } from '../middleware/cache';
import { auth } from '../middleware/auth';
import { CacheService, SessionCache, UserCache, APICache } from '../services/cache';

const app = new Hono<{ Bindings: Env }>();

// CORS 설정
app.use('/*', cors());

// 관리자 권한 확인 (실제로는 더 강력한 인증 필요)
app.use('/*', async (c, next) => {
  const apiKey = c.req.header('x-api-key');
  if (apiKey !== c.env.INTERNAL_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

// 캐시 통계 조회
app.get('/stats', async (c) => {
  try {
    const stats = await getCacheStats(c.env.CACHE);
    
    return c.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 캐시 무효화
app.post('/invalidate', async (c) => {
  try {
    const body = await c.req.json<{
      patterns?: string[];
      type?: 'api' | 'session' | 'user' | 'all';
      userId?: string;
      tag?: string;
    }>();

    if (body.type === 'all') {
      // 모든 캐시 삭제
      const cacheService = new CacheService(c.env.CACHE);
      await cacheService.deleteByPrefix('');
      
      return c.json({
        success: true,
        message: 'All cache cleared'
      });
    }

    if (body.type === 'api') {
      const apiCache = new APICache(c.env.CACHE);
      await apiCache.invalidateAll();
      
      return c.json({
        success: true,
        message: 'API cache cleared'
      });
    }

    if (body.type === 'session') {
      const sessionCache = new SessionCache(c.env.CACHE);
      await sessionCache.deleteAllSessions();
      
      return c.json({
        success: true,
        message: 'Session cache cleared'
      });
    }

    if (body.type === 'user' && body.userId) {
      const userCache = new UserCache(c.env.CACHE);
      await userCache.invalidateUser(body.userId);
      
      const sessionCache = new SessionCache(c.env.CACHE);
      await sessionCache.deleteUserSessions(body.userId);
      
      return c.json({
        success: true,
        message: `Cache cleared for user ${body.userId}`
      });
    }

    if (body.patterns) {
      await invalidateCache(c.env.CACHE, body.patterns);
      
      return c.json({
        success: true,
        message: `Cache invalidated for patterns: ${body.patterns.join(', ')}`
      });
    }

    if (body.tag) {
      const cacheService = new CacheService(c.env.CACHE);
      await cacheService.deleteByTag(body.tag);
      
      return c.json({
        success: true,
        message: `Cache cleared for tag: ${body.tag}`
      });
    }

    return c.json({ error: 'No invalidation criteria provided' }, 400);

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 캐시 워밍
app.post('/warm', async (c) => {
  try {
    const body = await c.req.json<{
      endpoints: Array<{ url: string; ttl?: number }>;
    }>();

    if (!body.endpoints || body.endpoints.length === 0) {
      return c.json({ error: 'No endpoints provided' }, 400);
    }

    // 백그라운드에서 캐시 워밍 실행
    c.executionCtx.waitUntil(
      warmCache(c.env, body.endpoints)
    );

    return c.json({
      success: true,
      message: `Warming cache for ${body.endpoints.length} endpoints`,
      endpoints: body.endpoints
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 특정 키 조회
app.get('/get/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const cacheService = new CacheService(c.env.CACHE);
    
    const value = await cacheService.get(key);
    
    if (!value) {
      return c.json({ error: 'Key not found' }, 404);
    }

    return c.json({
      success: true,
      key,
      value,
      exists: true
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 특정 키 설정
app.post('/set', async (c) => {
  try {
    const body = await c.req.json<{
      key: string;
      value: any;
      ttl?: number;
      tags?: string[];
    }>();

    if (!body.key || body.value === undefined) {
      return c.json({ error: 'Key and value are required' }, 400);
    }

    const cacheService = new CacheService(c.env.CACHE);
    await cacheService.set(body.key, body.value, {
      ttl: body.ttl,
      tags: body.tags
    });

    return c.json({
      success: true,
      key: body.key,
      ttl: body.ttl || 3600
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 캐시 키 목록 조회
app.get('/keys', async (c) => {
  try {
    const prefix = c.req.query('prefix') || '';
    const limit = parseInt(c.req.query('limit') || '100');
    
    const list = await c.env.CACHE.list({
      prefix,
      limit: Math.min(limit, 1000)
    });

    return c.json({
      success: true,
      keys: list.keys.map(key => ({
        name: key.name,
        expiration: key.expiration,
        metadata: key.metadata
      })),
      cursor: list.cursor,
      complete: list.list_complete
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 세션 갱신
app.post('/session/refresh', async (c) => {
  try {
    const body = await c.req.json<{
      sessionId: string;
      ttl?: number;
    }>();

    if (!body.sessionId) {
      return c.json({ error: 'Session ID is required' }, 400);
    }

    const sessionCache = new SessionCache(c.env.CACHE);
    const refreshed = await sessionCache.refreshSession(
      body.sessionId,
      body.ttl || 3600
    );

    if (!refreshed) {
      return c.json({ error: 'Session not found' }, 404);
    }

    return c.json({
      success: true,
      sessionId: body.sessionId,
      refreshed: true,
      ttl: body.ttl || 3600
    });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;