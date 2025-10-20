/**
 * 관리자용 캐시 관리 엔드포인트
 */

import { Hono } from 'hono';
import { AICacheManager } from '../../utils/aiCache';
import { AppError } from '../../utils/errors';

const cacheAdminRoutes = new Hono<{
  Bindings: {
    AI_CACHE: KVNamespace;
  };
}>();

/**
 * 캐시 메트릭 조회
 * GET /admin/cache/metrics
 */
cacheAdminRoutes.get('/metrics', async (c) => {
  try {
    const cacheManager = new AICacheManager(c.env.AI_CACHE);
    const metrics = await cacheManager.getMetrics();

    return c.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('[Cache Admin] Get metrics error:', error);
    throw new AppError('Failed to get cache metrics', 500, 'CACHE_METRICS_ERROR');
  }
});

/**
 * 캐시 통계 조회
 * GET /admin/cache/stats
 */
cacheAdminRoutes.get('/stats', async (c) => {
  try {
    const cacheManager = new AICacheManager(c.env.AI_CACHE);
    const stats = await cacheManager.getStats();

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[Cache Admin] Get stats error:', error);
    throw new AppError('Failed to get cache stats', 500, 'CACHE_STATS_ERROR');
  }
});

/**
 * 특정 모델 캐시 무효화
 * DELETE /admin/cache/model/:model
 */
cacheAdminRoutes.delete('/model/:model', async (c) => {
  try {
    const model = c.req.param('model');
    const cacheManager = new AICacheManager(c.env.AI_CACHE);

    await cacheManager.invalidateModel(model);

    return c.json({
      success: true,
      message: `Cache invalidated for model: ${model}`,
    });
  } catch (error) {
    console.error('[Cache Admin] Invalidate model error:', error);
    throw new AppError('Failed to invalidate cache', 500, 'CACHE_INVALIDATE_ERROR');
  }
});

/**
 * 모든 캐시 삭제
 * DELETE /admin/cache/all
 */
cacheAdminRoutes.delete('/all', async (c) => {
  try {
    const cacheManager = new AICacheManager(c.env.AI_CACHE);
    await cacheManager.clear();

    return c.json({
      success: true,
      message: 'All cache cleared',
    });
  } catch (error) {
    console.error('[Cache Admin] Clear all error:', error);
    throw new AppError('Failed to clear cache', 500, 'CACHE_CLEAR_ERROR');
  }
});

/**
 * 캐시 정리 (LRU)
 * POST /admin/cache/cleanup
 */
cacheAdminRoutes.post('/cleanup', async (c) => {
  try {
    const body = await c.req.json();
    const maxEntries = body.maxEntries || 1000;

    const cacheManager = new AICacheManager(c.env.AI_CACHE);
    await cacheManager.cleanup(maxEntries);

    return c.json({
      success: true,
      message: `Cache cleanup completed (max entries: ${maxEntries})`,
    });
  } catch (error) {
    console.error('[Cache Admin] Cleanup error:', error);
    throw new AppError('Failed to cleanup cache', 500, 'CACHE_CLEANUP_ERROR');
  }
});

/**
 * 캐시 상태 대시보드 데이터
 * GET /admin/cache/dashboard
 */
cacheAdminRoutes.get('/dashboard', async (c) => {
  try {
    const cacheManager = new AICacheManager(c.env.AI_CACHE);

    const [metrics, stats] = await Promise.all([
      cacheManager.getMetrics(),
      cacheManager.getStats(),
    ]);

    return c.json({
      success: true,
      data: {
        metrics,
        stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Cache Admin] Dashboard error:', error);
    throw new AppError('Failed to get dashboard data', 500, 'CACHE_DASHBOARD_ERROR');
  }
});

export { cacheAdminRoutes };
