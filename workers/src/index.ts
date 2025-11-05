import { Hono, type MiddlewareHandler } from 'hono';
import type { D1Database, ExportedHandler } from '@cloudflare/workers-types';
import { cors } from 'hono/cors';
import { timing } from 'hono/timing';
import { levelTestRoutes } from './routes/levelTest';
import { webrtcRoutes } from './routes/webrtc';
import { uploadRoutes } from './routes/upload';
import whisperRoutes from './routes/whisper';
import llmRoutes from './routes/llm';
import imagesRoutes from './routes/images';
import transcribeRoutes from './routes/transcribe';
import cacheRoutes from './routes/cache';
import translateRoutes from './routes/translate';
import { analyticsRoutes } from './routes/analytics';
import internalRoutes from './routes/internal';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import onboardingRoutes from './routes/onboarding';
import sessionsRoutes from './routes/sessions';
import notificationsRoutes from './routes/notifications';
import groupSessionsRoutes from './routes/groupSessions';
import groupSessionsAIRoutes from './routes/groupSessionsAI';
import presenceRoutes from './routes/presence';
import matchingRoutes from './routes/matching';
import achievementsRoutes from './routes/achievements';
import chatRoutes from './routes/chat';
import settingsRoutes from './routes/settings';
import pronunciationRoutes from './routes/pronunciation';
import { WebRTCRoom } from './durable/WebRTCRoom';
import { UserPresence } from './durable/UserPresence';
import { ChatHub } from './durable/ChatHub';
import { errorHandler, notFoundHandler } from './middleware';
import { analyticsMiddleware, errorTrackingMiddleware } from './middleware/analytics';
import { successResponse } from './utils/response';
import { Variables } from './types';
import { setInactiveUsersOffline } from './services/userStatus';
import {
  processScheduledNotifications,
  createStudyReminderNotifications,
  createGoalProgressNotifications
} from './services/notifications';
import { handleNotificationWebSocket } from './websocket/notificationSocket';

// Export Durable Object
export { WebRTCRoom, UserPresence, ChatHub };

// Type definitions for bindings
export interface AppBindings {
  AI: Ai;
  ROOM: DurableObjectNamespace;
  USER_PRESENCE: DurableObjectNamespace;
  CHAT_HUB: DurableObjectNamespace;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  ANALYTICS?: AnalyticsEngineDataset;
  ENVIRONMENT: string;
  CORS_ORIGIN: string;
  JWT_SECRET?: string;
  API_KEYS?: string;
  INTERNAL_SECRET?: string;
  INTERNAL_API_KEY?: string;
  API_VERSION?: string;
  DB: D1Database;
  API_BASE_URL?: string;
  NAVER_CLIENT_ID?: string;
  NAVER_CLIENT_SECRET?: string;
  NAVER_REDIRECT_URI?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
  ACCESS_TOKEN_TTL_SECONDS?: string;
  REFRESH_TOKEN_TTL_SECONDS?: string;
  JWT_ISSUER?: string;
}

// Export Env type for other modules
export type Env = AppBindings;

export const scheduled: ExportedHandler<AppBindings>['scheduled'] = async (controller, env, ctx) => {
  const job = (async () => {
    const currentHour = new Date().getUTCHours();
    const currentDay = new Date().getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

    // 1. 비활성 사용자 오프라인 처리 (매 5분마다)
    try {
      const changed = await setInactiveUsersOffline(env, 15);
      if (changed > 0) {
        console.log(`[presence-cron] Marked ${changed} users offline.`);
      }
    } catch (error) {
      console.error('[presence-cron] Failed to update inactive users', error);
    }

    // 2. 스케줄된 알림 처리 (매 5분마다)
    try {
      const delivered = await processScheduledNotifications(env);
      if (delivered > 0) {
        console.log(`[notifications-cron] Delivered ${delivered} scheduled notifications.`);
      }
    } catch (error) {
      console.error('[notifications-cron] Failed to process scheduled notifications', error);
    }

    // 3. 학습 리마인더 알림 (매일 오후 8시 UTC = 한국시간 오전 5시)
    if (currentHour === 20) {
      try {
        const created = await createStudyReminderNotifications(env);
        if (created > 0) {
          console.log(`[study-reminder-cron] Created ${created} study reminder notifications.`);
        }
      } catch (error) {
        console.error('[study-reminder-cron] Failed to create study reminders', error);
      }
    }

    // 4. 목표 진행률 알림 (매주 일요일 오후 9시 UTC = 한국시간 월요일 오전 6시)
    if (currentDay === 0 && currentHour === 21) {
      try {
        const created = await createGoalProgressNotifications(env);
        if (created > 0) {
          console.log(`[goal-progress-cron] Created ${created} goal progress notifications.`);
        }
      } catch (error) {
        console.error('[goal-progress-cron] Failed to create goal progress notifications', error);
      }
    }
  })();
  ctx.waitUntil(job);
};

// API 버전
const API_VERSION = 'v1';

// Create Hono app with typed context
export const app = new Hono<{ Bindings: AppBindings; Variables: Variables }>();

// 공통 에러 핸들러를 최상단에 등록해 ApiError를 올바른 상태코드로 변환
app.use('*', errorHandler);

// Analytics 및 에러 추적 미들웨어
app.use(errorTrackingMiddleware);
app.use(analyticsMiddleware);

// CORS middleware
app.use('*', async (c, next) => {
  // CORS_ORIGIN이 콤마로 구분된 여러 도메인일 수 있음
  const corsOrigin = c.env?.CORS_ORIGIN || 'http://localhost:3000';
  const allowedOrigins = corsOrigin.split(',').map(o => o.trim());

  const corsMiddleware = cors({
    origin: (origin) => {
      // origin이 없는 경우 (예: 동일 출처 요청)도 허용
      if (!origin) return corsOrigin;
      // 허용된 origin 목록에 있는지 확인
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        return origin;
      }
      // 기본값 반환
      return allowedOrigins[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-API-Key'],
    exposeHeaders: ['Content-Length', 'X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

app.get('/ws/chat', (c) => {
  const id = c.env.CHAT_HUB.idFromName('global');
  const stub = c.env.CHAT_HUB.get(id);
  return stub.fetch(c.req.raw);
});

app.get('/ws/notifications', (c) => handleNotificationWebSocket(c));

// API 정보 엔드포인트
app.get('/', (c) => {
  return successResponse(c, {
    name: 'STUDYMATE API',
    version: API_VERSION,
    status: 'operational',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      levelTest: `/api/${API_VERSION}/level-test`,
      webrtc: `/api/${API_VERSION}/room`,
      upload: `/api/${API_VERSION}/upload`,
      whisper: `/api/${API_VERSION}/whisper`,
      llm: `/api/${API_VERSION}/llm`,
      images: `/api/${API_VERSION}/images`,
      cache: `/api/${API_VERSION}/cache`,
      transcribe: `/api/${API_VERSION}/transcribe`,
      analytics: `/api/${API_VERSION}/analytics`,
      translate: `/api/${API_VERSION}/translate`
    }
  });
});

// Health check
app.get('/health', (c) => {
  return successResponse(c, {
    status: 'healthy',
    environment: c.env?.ENVIRONMENT,
    version: API_VERSION,
    services: {
      ai: 'operational',
      storage: 'operational',
      cache: 'operational',
      durableObjects: 'operational'
    }
  });
});

// 메트릭스 엔드포인트
app.get('/metrics', (c) => {
  // 실제 구현에서는 Prometheus 형식으로 메트릭 노출
  return c.text(`# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",endpoint="/health"} 1
`);
});

// API v1 라우트 그룹
const v1 = new Hono<{ Bindings: AppBindings; Variables: Variables }>();

// v1 API 라우트 등록 (복수형 & kebab-case 표준)
v1.route('/auth', authRoutes);
v1.route('/login', authRoutes);  // OAuth login 경로 추가
v1.route('/users', userRoutes);
v1.route('/onboarding', onboardingRoutes);
v1.route('/sessions', sessionsRoutes);
v1.route('/notifications', notificationsRoutes);
v1.route('/group-sessions', groupSessionsRoutes);
v1.route('/group-sessions/ai', groupSessionsAIRoutes);
v1.route('/presence', presenceRoutes);
v1.route('/matching', matchingRoutes);
v1.route('/achievements', achievementsRoutes);
v1.route('/chat', chatRoutes);
v1.route('/settings', settingsRoutes);
v1.route('/pronunciation', pronunciationRoutes);
v1.route('/level-test', levelTestRoutes);
v1.route('/room', webrtcRoutes);
v1.route('/upload', uploadRoutes);
v1.route('/whisper', whisperRoutes);
v1.route('/llm', llmRoutes);
v1.route('/images', imagesRoutes);
v1.route('/cache', cacheRoutes);
v1.route('/transcribe', transcribeRoutes);
v1.route('/translate', translateRoutes);
v1.route('/analytics', analyticsRoutes);

// 내부 서비스 API (레거시 연동)
v1.route('/internal', internalRoutes);

// API 버전 라우팅
app.route(`/api/${API_VERSION}`, v1);

// /api/v1/health 엔드포인트 (프론트엔드 호환성)
app.get(`/api/${API_VERSION}/health`, (c) => {
  return successResponse(c, {
    status: 'healthy',
    environment: c.env?.ENVIRONMENT,
    version: API_VERSION,
    services: {
      ai: 'operational',
      storage: 'operational',
      cache: 'operational',
      durableObjects: 'operational'
    }
  });
});

// OAuth 콜백을 위한 직접 라우팅 (네이버/구글에 등록된 redirect_uri)
// /login/oauth2/code/naver와 /login/oauth2/code/google을 직접 처리
app.get('/login/oauth2/code/:provider', async (c) => {
  const provider = c.req.param('provider');
  const code = c.req.query('code');
  const state = c.req.query('state') || undefined;

  if (!code) {
    return c.json({
      success: false,
      error: {
        message: 'Missing OAuth code',
        code: 'INVALID_OAUTH_CALLBACK'
      }
    }, 400);
  }

  // handleOAuthCallback 직접 임포트
  const { handleOAuthCallback } = await import('./services/auth');
  const { AppError } = await import('./utils/errors');

  try {
    const result = await handleOAuthCallback(
      c.env,
      provider,
      { code, state },
      {
        userAgent: c.req.header('User-Agent') || undefined,
        ipAddress:
          c.req.header('CF-Connecting-IP') ||
          c.req.header('X-Forwarded-For') ||
          c.req.header('X-Real-IP') ||
          undefined
      }
    );
    const acceptsJson = (c.req.header('Accept') || '').includes('application/json');
    if (!acceptsJson) {
      const redirectTarget = result.callbackUrl || result.redirectUri;
      if (!redirectTarget) {
        return successResponse(c, result);
      }
      const redirectUrl = new URL(redirectTarget);
      redirectUrl.searchParams.set('accessToken', result.accessToken);
      redirectUrl.searchParams.set('refreshToken', result.refreshToken);
      redirectUrl.searchParams.set('provider', provider);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }
      if (result.redirectUri && result.redirectUri !== redirectTarget) {
        redirectUrl.searchParams.set('redirect', result.redirectUri);
      }
      return c.redirect(redirectUrl.toString());
    }
    return successResponse(c, result);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Authentication failure';
    throw new AppError(message, 500, 'AUTH_OPERATION_FAILED');
  }
});

// 404 handler
app.notFound(notFoundHandler);

// Global error handler는 middleware에서 처리

const fetchHandler: ExportedHandler<AppBindings>['fetch'] = (request, env, ctx) =>
  app.fetch(request, env, ctx);

const worker: ExportedHandler<AppBindings> = {
  fetch: fetchHandler,
  scheduled,
};

export default worker;
