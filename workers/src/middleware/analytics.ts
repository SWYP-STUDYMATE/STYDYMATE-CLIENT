import type { Context, MiddlewareHandler } from 'hono';
import type { AppBindings as Env } from '../index';

// 메트릭 타입 정의
interface RequestMetrics {
    // 기본 메트릭
    method: string;
    path: string;
    status: number;
    duration: number;
    cpuTime: number;

    // 추가 메트릭
    userAgent?: string;
    country?: string;
    city?: string;
    colo?: string;
    tlsVersion?: string;
    httpProtocol?: string;

    // 에러 정보
    error?: string;
    errorType?: string;

    // AI 메트릭
    aiModel?: string;
    aiTokensUsed?: number;
    aiDuration?: number;

    // 캐시 메트릭
    cacheStatus?: string;
    cacheHit?: boolean;
}

// 분석 이벤트 타입
interface AnalyticsEvent {
    timestamp: number;
    type: 'api_request' | 'ai_usage' | 'error' | 'performance';
    metrics: RequestMetrics;
    metadata?: Record<string, any>;
}

// 성능 임계값
const PERFORMANCE_THRESHOLDS = {
    duration: {
        good: 100,     // 100ms 이하
        warning: 500,  // 500ms 이하
        critical: 1000 // 1초 이상
    },
    cpuTime: {
        good: 50,      // 50ms 이하
        warning: 200,  // 200ms 이하
        critical: 500  // 500ms 이상
    }
};

// 분석 미들웨어
export const analyticsMiddleware: MiddlewareHandler = async (c, next) => {
    const startTime = Date.now();
    const startCpu = (c.executionCtx as any).cpuTime || 0;

    // 요청 정보 수집
    const request = c.req.raw;
    const url = new URL(request.url);
    const cf = request.cf as any;

    try {
        // 다음 미들웨어/핸들러 실행
        await next();

        // 응답 후 메트릭 수집
        const duration = Date.now() - startTime;
        const cpuTime = ((c.executionCtx as any).cpuTime || 0) - startCpu;
        const status = c.res.status;

        // 기본 메트릭
        const metrics: RequestMetrics = {
            method: request.method,
            path: url.pathname,
            status,
            duration,
            cpuTime,
            userAgent: request.headers.get('user-agent') || undefined,
            country: cf?.country,
            city: cf?.city,
            colo: cf?.colo,
            tlsVersion: cf?.tlsVersion,
            httpProtocol: cf?.httpProtocol,
            cacheStatus: c.res.headers.get('cf-cache-status') || undefined,
            cacheHit: c.res.headers.get('cf-cache-status') === 'HIT'
        };

        // AI 메트릭 추가 (있는 경우)
        const aiMetrics = c.get('aiMetrics');
        if (aiMetrics) {
            metrics.aiModel = aiMetrics.model;
            metrics.aiTokensUsed = aiMetrics.tokensUsed;
            metrics.aiDuration = aiMetrics.duration;
        }

        // 에러 정보 추가 (있는 경우)
        if (status >= 400) {
            const error = c.get('error');
            if (error) {
                metrics.error = error.message;
                metrics.errorType = error.type || 'unknown';
            }
        }

        // Analytics Engine에 전송
        await sendToAnalyticsEngine(c.env, {
            timestamp: Date.now(),
            type: 'api_request',
            metrics,
            metadata: {
                environment: c.env.ENVIRONMENT,
                version: c.env.API_VERSION
            }
        });

        // 성능 경고 체크
        checkPerformanceThresholds(metrics, c.env);

        // 응답 헤더에 서버 타이밍 추가
        c.res.headers.set('Server-Timing', [
            `cpu;dur=${cpuTime.toFixed(2)}`,
            `total;dur=${duration.toFixed(2)}`,
            cf?.colo ? `colo;desc="${cf.colo}"` : null
        ].filter(Boolean).join(', '));

    } catch (error) {
        console.error('Analytics middleware error:', error);
        // 분석 오류가 요청을 실패시키지 않도록 함
    }
};

// Analytics Engine에 이벤트 전송
async function sendToAnalyticsEngine(env: Env, event: AnalyticsEvent) {
    if (!env.ANALYTICS) return;

    try {
        const statusIndex = event.metrics.status != null
            ? event.metrics.status.toString()
            : 'unknown';

        await (env.ANALYTICS as any).writeDataPoint({
            blobs: [
                event.type,
                event.metrics.method,
                event.metrics.path,
                event.metrics.error || '',
                event.metrics.aiModel || '',
                event.metrics.country || '',
                event.metrics.cacheStatus || '',
                event.metadata?.environment || '',
                event.metadata?.version || ''
            ],
            doubles: [
                event.metrics.duration,
                event.metrics.cpuTime,
                event.metrics.aiTokensUsed || 0,
                event.metrics.aiDuration || 0,
                event.metrics.cacheHit ? 1 : 0
            ],
            indexes: [statusIndex]
        });
    } catch (error) {
        console.error('Failed to write to Analytics Engine:', error);
    }
}

// 성능 임계값 체크 및 경고
function checkPerformanceThresholds(metrics: RequestMetrics, env: Env) {
    const { duration, cpuTime } = metrics;

    // Duration 체크
    let durationLevel: 'good' | 'warning' | 'critical' = 'good';
    if (duration > PERFORMANCE_THRESHOLDS.duration.critical) {
        durationLevel = 'critical';
    } else if (duration > PERFORMANCE_THRESHOLDS.duration.warning) {
        durationLevel = 'warning';
    }

    // CPU Time 체크
    let cpuLevel: 'good' | 'warning' | 'critical' = 'good';
    if (cpuTime > PERFORMANCE_THRESHOLDS.cpuTime.critical) {
        cpuLevel = 'critical';
    } else if (cpuTime > PERFORMANCE_THRESHOLDS.cpuTime.warning) {
        cpuLevel = 'warning';
    }

    // 경고 로깅
    if (durationLevel !== 'good' || cpuLevel !== 'good') {
        console.warn('Performance threshold exceeded:', {
            path: metrics.path,
            duration: `${duration}ms (${durationLevel})`,
            cpuTime: `${cpuTime}ms (${cpuLevel})`,
            status: metrics.status
        });
    }
}

// 에러 추적 미들웨어
export const errorTrackingMiddleware: MiddlewareHandler = async (c, next) => {
    try {
        await next();
    } catch (error: any) {
        // 에러 정보 저장
        c.set('error', {
            message: error.message,
            type: error.constructor.name,
            stack: error.stack
        });

        // 에러 이벤트 전송
        await sendToAnalyticsEngine(c.env, {
            timestamp: Date.now(),
            type: 'error',
            metrics: {
                method: c.req.method,
                path: new URL(c.req.url).pathname,
                status: 500,
                duration: 0,
                cpuTime: 0,
                error: error.message,
                errorType: error.constructor.name
            },
            metadata: {
                stack: error.stack,
                environment: c.env.ENVIRONMENT
            }
        });

        // 에러 재발생
        throw error;
    }
};

// 메트릭 집계 함수
export async function getAggregatedMetrics(
    env: Env,
    timeRange: { start: Date; end: Date },
    groupBy?: 'path' | 'status' | 'country'
): Promise<any> {
    if (!env.ANALYTICS) return null;
    try {
        const result = await (env.ANALYTICS as any)?.query?.({
            timeRange: [timeRange.start, timeRange.end],
            filter: { blob1: 'api_request' },
            aggregations: {
                count: { count: {} },
                avgDuration: { avg: { field: 'double1' } },
                avgCpuTime: { avg: { field: 'double2' } },
                p95Duration: { quantile: { field: 'double1', quantile: 0.95 } },
                p95CpuTime: { quantile: { field: 'double2', quantile: 0.95 } }
            },
            groupBy: groupBy ? [`blob${getFieldIndex(groupBy)}`] : undefined
        });
        return result ?? null;
    } catch (error) {
        console.error('Failed to query Analytics Engine:', error);
        return null;
    }
}

// 필드 인덱스 매핑
function getFieldIndex(field: string): number {
    const fieldMap: Record<string, number> = {
        'path': 3,
        'status': 1,
        'country': 2
    };
    return fieldMap[field] || 1;
}

// 실시간 메트릭 스트림 (WebSocket)
export async function streamMetrics(ws: WebSocket, env: Env) {
    const interval = setInterval(async () => {
        try {
            // 최근 1분간의 메트릭 조회
            const metrics = await getAggregatedMetrics(env, {
                start: new Date(Date.now() - 60000),
                end: new Date()
            });

            if (metrics && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'metrics_update',
                    timestamp: Date.now(),
                    data: metrics
                }));
            }
        } catch (error) {
            console.error('Failed to stream metrics:', error);
        }
    }, 5000); // 5초마다 업데이트

    // WebSocket 종료 시 정리
    ws.addEventListener('close', () => {
        clearInterval(interval);
    });
}
