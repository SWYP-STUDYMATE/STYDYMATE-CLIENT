import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { levelTestRoutes } from './routes/levelTest';
import { webrtcRoutes } from './routes/webrtc';
import { uploadRoutes } from './routes/upload';
import { WebRTCRoom } from './durable/WebRTCRoom';

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
}

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.CORS_ORIGIN || 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.route('/api/level-test', levelTestRoutes);
app.route('/api/room', webrtcRoutes);
app.route('/api/upload', uploadRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err.stack);
  return c.json(
    { 
      error: 'Internal Server Error',
      message: c.env.ENVIRONMENT === 'development' ? err.message : undefined
    }, 
    500
  );
});

export default app;