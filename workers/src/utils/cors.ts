// CORS configuration and middleware

import { Context } from 'hono';
import { cors } from 'hono/cors';

// CORS configuration
export const corsConfig = cors({
  origin: (origin) => {
    // Allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://languagemate.kr',
      'https://www.languagemate.kr',
      'https://preview.languagemate.kr'
    ];

    // Allow requests from allowed origins or no origin (e.g., mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      return origin || '*';
    }

    // Check for dynamic preview URLs (e.g., Cloudflare Pages previews)
    if (origin.includes('.pages.dev') || origin.includes('.workers.dev')) {
      return origin;
    }

    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-Trace-ID'
  ],
  exposeHeaders: [
    'Content-Length',
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
});

// Simple CORS for public endpoints
export const publicCors = cors({
  origin: '*',
  allowMethods: ['GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400
});

// Preflight handler
export function handlePreflight(c: Context) {
  return c.text('', 204 as any);
}

// Security headers middleware
export async function securityHeaders(
  c: Context,
  next: () => Promise<void>
) {
  await next();

  // Add security headers to response
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  
  // Add request ID for tracing
  const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();
  c.header('X-Request-ID', requestId);
}

// Content Security Policy for different contexts
export function getCSP(context: 'api' | 'websocket' | 'media' = 'api'): string {
  const policies = {
    api: [
      "default-src 'none'",
      "script-src 'none'",
      "style-src 'none'",
      "img-src 'none'",
      "font-src 'none'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "form-action 'none'"
    ],
    websocket: [
      "default-src 'none'",
      "connect-src 'self' wss: ws:",
      "frame-ancestors 'none'"
    ],
    media: [
      "default-src 'none'",
      "img-src 'self' data: blob:",
      "media-src 'self' blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ]
  };

  return policies[context].join('; ');
}

// Apply CSP header
export function applyCSP(c: Context, context: 'api' | 'websocket' | 'media' = 'api') {
  c.header('Content-Security-Policy', getCSP(context));
}