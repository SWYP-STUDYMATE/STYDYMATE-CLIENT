import { Hono } from 'hono';
import { z } from 'zod';
import type { AppBindings as Env } from '../index';
import { authMiddleware } from '../utils/auth';
import { getAggregatedMetrics } from '../middleware/analytics';
import { successResponse, errorResponse } from '../utils/response';

const app = new Hono<{ Bindings: Env }>();

// 메트릭 조회 스키마
const metricsQuerySchema = z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
    groupBy: z.enum(['path', 'status', 'country']).optional(),
    interval: z.enum(['1m', '5m', '1h', '1d']).optional()
});

// 메트릭 조회
app.get('/metrics', authMiddleware as any, async (c) => {
    try {
        const query = metricsQuerySchema.parse(c.req.query());

        // 시간 범위 설정 (기본: 최근 24시간)
        const end = query.end ? new Date(query.end) : new Date();
        const start = query.start ? new Date(query.start) : new Date(end.getTime() - 24 * 60 * 60 * 1000);

        // 메트릭 조회
        const metrics = await getAggregatedMetrics(
            c.env,
            { start, end },
            query.groupBy
        );

        if (!metrics) {
            return successResponse(c, {
                timeRange: { start, end },
                groupBy: query.groupBy ?? null,
                fallback: true,
                metrics: {
                    count: 0,
                    avgDuration: 0,
                    avgCpuTime: 0,
                    p95Duration: 0,
                    p95CpuTime: 0,
                    buckets: []
                }
            }, {
                note: 'analytics_fallback'
            });
        }

        return successResponse(c, {
            timeRange: { start, end },
            groupBy: query.groupBy,
            metrics
        });
    } catch (error) {
        console.error('Metrics query error:', error);
        return successResponse(c, {
            timeRange: {
                start: new Date(Date.now() - 24 * 60 * 60 * 1000),
                end: new Date()
            },
            groupBy: null,
            fallback: true,
            metrics: {
                count: 0,
                avgDuration: 0,
                avgCpuTime: 0,
                p95Duration: 0,
                p95CpuTime: 0,
                buckets: []
            }
        }, {
            note: 'analytics_error_fallback'
        });
    }
});

// 대시보드 데이터
app.get('/dashboard', authMiddleware as any, async (c) => {
    try {
        const now = new Date();
        const ranges = {
            last24h: { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now },
            last7d: { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now },
            last30d: { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now }
        };

        // 병렬로 여러 메트릭 조회
        const [
            overview24h,
            overview7d,
            overview30d,
            topPaths,
            errorsByStatus,
            geoDistribution
        ] = await Promise.all([
            getAggregatedMetrics(c.env, ranges.last24h),
            getAggregatedMetrics(c.env, ranges.last7d),
            getAggregatedMetrics(c.env, ranges.last30d),
            getAggregatedMetrics(c.env, ranges.last24h, 'path'),
            getAggregatedMetrics(c.env, ranges.last24h, 'status'),
            getAggregatedMetrics(c.env, ranges.last24h, 'country')
        ]);

        return successResponse(c, {
            overview: {
                last24h: overview24h,
                last7d: overview7d,
                last30d: overview30d
            },
            topPaths,
            errorsByStatus,
            geoDistribution,
            timestamp: now.toISOString()
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        return c.json({ success: false, error: { message: 'Failed to load dashboard data' } }, { status: 500 });
    }
});

// 실시간 메트릭 WebSocket
app.get('/stream', async (c) => {
    const upgradeHeader = c.req.header('upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return c.json({ error: 'Expected WebSocket' }, 426);
    }

    const webSocketPair = new (globalThis as any).WebSocketPair();
    const [client, server] = Object.values(webSocketPair) as [WebSocket, WebSocket];

    server.accept();

    // 인증 확인
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        server.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
        server.close(1008, 'Unauthorized');
        return new Response(null, { status: 101, webSocket: client });
    }

    // 실시간 메트릭 스트리밍 시작
    const { streamMetrics } = await import('../middleware/analytics');
    streamMetrics(server as WebSocket, c.env);

    return new Response(null, {
        status: 101,
        webSocket: client,
    });
});

// 에러 통계
app.get('/errors', authMiddleware as any, async (c) => {
    try {
        const query = metricsQuerySchema.parse(c.req.query());

        const end = query.end ? new Date(query.end) : new Date();
        const start = query.start ? new Date(query.start) : new Date(end.getTime() - 24 * 60 * 60 * 1000);

        // Analytics Engine에서 에러만 필터링
        const result = await (c.env.ANALYTICS as any)?.query({
            timeRange: [start, end],
            filter: {
                blob1: 'error'
            },
            aggregations: {
                count: { count: {} },
                topErrors: {
                    topK: {
                        field: 'blob4', // error message
                        k: 10
                    }
                },
                errorsByType: {
                    topK: {
                        field: 'blob5', // error type
                        k: 10
                    }
                }
            }
        });

        return successResponse(c, {
            timeRange: { start, end },
            errors: result || null
        });
    } catch (error) {
        console.error('Error stats error:', error);
        return errorResponse(c, 'Failed to query error statistics');
    }
});

// AI 사용량 통계
app.get('/ai-usage', authMiddleware as any, async (c) => {
    try {
        const query = metricsQuerySchema.parse(c.req.query());

        const end = query.end ? new Date(query.end) : new Date();
        const start = query.start ? new Date(query.start) : new Date(end.getTime() - 24 * 60 * 60 * 1000);

        // AI 메트릭 조회
        const result = await (c.env.ANALYTICS as any)?.query({
            timeRange: [start, end],
            filter: {
                blob5: { $ne: '' } // AI model이 있는 요청만
            },
            aggregations: {
                totalTokens: { sum: { field: 'double3' } },
                avgTokensPerRequest: { avg: { field: 'double3' } },
                totalAiDuration: { sum: { field: 'double4' } },
                avgAiDuration: { avg: { field: 'double4' } },
                modelUsage: {
                    topK: {
                        field: 'blob5', // AI model
                        k: 10
                    }
                }
            }
        });

        return successResponse(c, {
            timeRange: { start, end },
            aiUsage: result || null
        });
    } catch (error) {
        console.error('AI usage stats error:', error);
        return errorResponse(c, 'Failed to query AI usage statistics');
    }
});

// 성능 보고서
app.get('/performance', authMiddleware as any, async (c) => {
    try {
        const query = metricsQuerySchema.parse(c.req.query());

        const end = query.end ? new Date(query.end) : new Date();
        const start = query.start ? new Date(query.start) : new Date(end.getTime() - 24 * 60 * 60 * 1000);

        // 성능 메트릭 조회
        const result = await (c.env.ANALYTICS as any)?.query({
            timeRange: [start, end],
            filter: {
                blob1: 'api_request'
            },
            aggregations: {
                p50Duration: { quantile: { field: 'double1', quantile: 0.5 } },
                p75Duration: { quantile: { field: 'double1', quantile: 0.75 } },
                p90Duration: { quantile: { field: 'double1', quantile: 0.9 } },
                p95Duration: { quantile: { field: 'double1', quantile: 0.95 } },
                p99Duration: { quantile: { field: 'double1', quantile: 0.99 } },
                p50CpuTime: { quantile: { field: 'double2', quantile: 0.5 } },
                p75CpuTime: { quantile: { field: 'double2', quantile: 0.75 } },
                p90CpuTime: { quantile: { field: 'double2', quantile: 0.9 } },
                p95CpuTime: { quantile: { field: 'double2', quantile: 0.95 } },
                p99CpuTime: { quantile: { field: 'double2', quantile: 0.99 } }
            },
            groupBy: query.groupBy ? [`blob${getFieldIndex(query.groupBy)}`] : undefined
        });

        return successResponse(c, {
            timeRange: { start, end },
            groupBy: query.groupBy,
            performance: result || null
        });
    } catch (error) {
        console.error('Performance stats error:', error);
        return errorResponse(c, 'Failed to query performance statistics');
    }
});

// 필드 인덱스 매핑 (analytics 미들웨어와 동일)
function getFieldIndex(field: string): number {
    const fieldMap: Record<string, number> = {
        'path': 3,
        'status': 1,
        'country': 2
    };
    return fieldMap[field] || 1;
}

// 이벤트 수집 엔드포인트
app.post('/events', async (c) => {
    try {
        const { events } = await c.req.json();

        if (!Array.isArray(events)) {
            return errorResponse(c, 'Events must be an array', 'INVALID_INPUT', null, 400);
        }

        // Analytics Engine에 이벤트 전송
        for (const event of events) {
            await c.env.ANALYTICS?.writeDataPoint({
                blobs: [
                    'client_event',
                    event.event,
                    event.userId,
                    event.sessionId,
                    event.properties?.page || ''
                ],
                doubles: [
                    event.timestamp,
                    event.properties?.pageLoadTime || 0,
                    event.properties?.duration || 0,
                    0
                ],
                indexes: [
                    event.properties?.sessionType || '',
                    event.properties?.feature || '',
                    event.properties?.variant || ''
                ]
            });
        }

        return successResponse(c, {
            message: 'Events recorded',
            count: events.length
        });
    } catch (error) {
        console.error('Events recording error:', error);
        return errorResponse(c, 'Failed to record events');
    }
});

export { app as analyticsRoutes };
export default app;
