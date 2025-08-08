import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { timing } from 'hono/timing';
import { levelTestRoutes } from './routes/levelTest';
import { webrtcRoutes } from './routes/webrtc';
import { uploadRoutes } from './routes/upload';
import whisperRoutes from './routes/whisper';
import llmRoutes from './routes/llm';
import { WebRTCRoom } from './durable/WebRTCRoom';
import { setupMiddleware, notFoundHandler } from './middleware';
import { Variables } from './types';
import { successResponse } from './utils/response';

// Export Durable Object
export { WebRTCRoom };

// Type definitions for bindings
export interface Env {
  AI: Ai;
  ROOM: DurableObjectNamespace;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  ENVIRONMENT: string;
  CORS_ORIGIN: string;
  JWT_SECRET?: string;
  API_KEYS?: string;
  INTERNAL_SECRET?: string;
}

// API 버전
const API_VERSION = 'v1';

// Create Hono app with typed context
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// 기본 미들웨어 설정
setupMiddleware(app);

// Server timing
app.use('*', timing());

// CORS middleware
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.CORS_ORIGIN || 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-API-Key'],
    exposeHeaders: ['Content-Length', 'X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

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
      llm: `/api/${API_VERSION}/llm`
    }
  });
});

// Health check
app.get('/health', (c) => {
  return successResponse(c, {
    status: 'healthy',
    environment: c.env.ENVIRONMENT,
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
const v1 = new Hono<{ Bindings: Env; Variables: Variables }>();

// v1 API 라우트 등록
v1.route('/level-test', levelTestRoutes);
v1.route('/room', webrtcRoutes);
v1.route('/upload', uploadRoutes);
v1.route('/whisper', whisperRoutes);
v1.route('/llm', llmRoutes);

// API 버전 라우팅
app.route(`/api/${API_VERSION}`, v1);

// 하위 호환성을 위한 레거시 라우트 (deprecation 경고와 함께)
app.use('/api/level-test/*', async (c, next) => {
  c.header('X-Deprecation-Warning', `Please use /api/${API_VERSION}/level-test instead`);
  return v1.fetch(c.req.raw, c.env);
});

app.use('/api/room/*', async (c, next) => {
  c.header('X-Deprecation-Warning', `Please use /api/${API_VERSION}/room instead`);
  return v1.fetch(c.req.raw, c.env);
});

app.use('/api/upload/*', async (c, next) => {
  c.header('X-Deprecation-Warning', `Please use /api/${API_VERSION}/upload instead`);
  return v1.fetch(c.req.raw, c.env);
});

app.use('/api/whisper/*', async (c, next) => {
  c.header('X-Deprecation-Warning', `Please use /api/${API_VERSION}/whisper instead`);
  return v1.fetch(c.req.raw, c.env);
});

app.use('/api/llm/*', async (c, next) => {
  c.header('X-Deprecation-Warning', `Please use /api/${API_VERSION}/llm instead`);
  return v1.fetch(c.req.raw, c.env);
});

// 404 handler
app.notFound(notFoundHandler);

// Global error handler는 middleware에서 처리

export default app;