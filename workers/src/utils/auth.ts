// Authentication middleware and utilities

import { Context } from 'hono';
import { verify } from 'hono/jwt';
import type { AppBindings as Env } from '../index';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

// Verify JWT token from STUDYMATE-SERVER with signature verification
export async function verifyToken(token: string, secret: string): Promise<AuthUser | null> {
  try {
    // 서버는 HS512로 서명하므로 동일 알고리즘으로 검증
    const payload: any = await verify(token, secret, 'HS512');
    // Verify expiration (verify already checks exp, but keep explicit guard)
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    return {
      userId: payload.userId || payload.sub,
      email: payload.email,
      role: payload.role || 'user',
      exp: payload.exp
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Auth middleware for Hono
export async function authMiddleware(
  c: Context<{ Bindings: Env; Variables: import('../types').Variables }>,
  next: () => Promise<void>
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  const secret = c.env.JWT_SECRET || 'development-secret-change-in-production';
  const user = await verifyToken(token, secret);

  if (!user) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Store user in context
  c.set('user', user);

  await next();
}

// Optional auth middleware (doesn't fail if no token)
export async function optionalAuthMiddleware(
  c: Context<{ Bindings: Env }>,
  next: () => Promise<void>
) {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const secret = c.env.JWT_SECRET || 'development-secret-change-in-production';
    const user = await verifyToken(token, secret);
    if (user) {
      c.set('user', user);
    }
  }

  await next();
}

// Get user from context
export function getUser(c: Context): AuthUser | null {
  return c.get('user') || null;
}

// Check if user has required role
export function hasRole(c: Context, role: string): boolean {
  const user = getUser(c);
  return user?.role === role || user?.role === 'admin';
}

// Rate limiting helper
export async function checkRateLimit(
  env: Env,
  userId: string,
  action: string,
  limit: number = 10,
  window: number = 60
): Promise<boolean> {
  const key = `rate:${userId}:${action}`;
  const now = Date.now();
  const windowStart = now - (window * 1000);

  // Get current count from KV
  const data = await env.CACHE.get(key);
  let attempts: number[] = [];

  if (data) {
    attempts = JSON.parse(data).filter((t: number) => t > windowStart);
  }

  if (attempts.length >= limit) {
    return false; // Rate limit exceeded
  }

  // Add current attempt
  attempts.push(now);
  await env.CACHE.put(
    key,
    JSON.stringify(attempts),
    { expirationTtl: window }
  );

  return true;
}

// API key validation for service-to-service calls
export async function validateApiKey(
  c: Context<{ Bindings: Env }>,
  next: () => Promise<void>
) {
  const apiKey = c.req.header('X-API-Key');

  if (!apiKey) {
    return c.json({ error: 'API key required' }, 401);
  }

  // Check against environment variable
  const validKey = c.env.INTERNAL_API_KEY || 'default-key';

  if (apiKey !== validKey) {
    return c.json({ error: 'Invalid API key' }, 401);
  }

  await next();
}