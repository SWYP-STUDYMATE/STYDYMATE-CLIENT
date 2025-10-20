/**
 * Rate Limiting Middleware for Cloudflare Workers
 * KV 기반 요청 제한 미들웨어
 */

import { Context } from 'hono';
import { AppBindings } from '../index';

interface RateLimitOptions {
  windowMs: number;      // 시간 윈도우 (밀리초)
  maxRequests: number;   // 최대 요청 수
  keyPrefix?: string;    // KV 키 접두사
  skipSuccessfulRequests?: boolean;  // 성공 요청만 카운트
  skipFailedRequests?: boolean;      // 실패 요청 제외
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

/**
 * Rate Limiter 클래스
 */
export class RateLimiter {
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      keyPrefix: 'ratelimit',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options
    };
  }

  /**
   * KV 키 생성
   */
  private getKey(identifier: string, endpoint: string): string {
    const { keyPrefix } = this.options;
    return `${keyPrefix}:${identifier}:${endpoint}`;
  }

  /**
   * 현재 윈도우 시작 시간 계산
   */
  private getWindowStart(): number {
    const now = Date.now();
    return now - (now % this.options.windowMs);
  }

  /**
   * Rate limit 체크 및 업데이트
   */
  async check(
    kv: KVNamespace,
    identifier: string,
    endpoint: string
  ): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const key = this.getKey(identifier, endpoint);
    const windowStart = this.getWindowStart();
    const resetTime = windowStart + this.options.windowMs;

    // KV에서 현재 카운트 조회
    const stored = await kv.get(key, 'json') as RateLimitInfo | null;

    let count = 0;

    if (stored && stored.resetTime === resetTime) {
      // 같은 윈도우 내의 요청
      count = stored.count;
    }

    // 요청 수 증가
    count++;

    // 제한 체크
    const allowed = count <= this.options.maxRequests;

    // KV 업데이트
    const newInfo: RateLimitInfo = { count, resetTime };
    const ttl = Math.ceil(this.options.windowMs / 1000);
    await kv.put(key, JSON.stringify(newInfo), { expirationTtl: ttl });

    return { allowed, info: newInfo };
  }

  /**
   * Rate limit 정보 조회 (카운트 증가 없이)
   */
  async getInfo(
    kv: KVNamespace,
    identifier: string,
    endpoint: string
  ): Promise<RateLimitInfo | null> {
    const key = this.getKey(identifier, endpoint);
    return await kv.get(key, 'json') as RateLimitInfo | null;
  }

  /**
   * Rate limit 리셋
   */
  async reset(
    kv: KVNamespace,
    identifier: string,
    endpoint: string
  ): Promise<void> {
    const key = this.getKey(identifier, endpoint);
    await kv.delete(key);
  }
}

/**
 * Rate Limit 미들웨어 생성
 */
export function rateLimitMiddleware(options: RateLimitOptions) {
  const limiter = new RateLimiter(options);

  return async (c: Context<{ Bindings: AppBindings }>, next: () => Promise<void>) => {
    const kv = c.env.CACHE;

    if (!kv) {
      console.warn('KV namespace not available, skipping rate limit');
      return next();
    }

    // 식별자 결정 (사용자 ID 또는 IP)
    const userId = c.get('userId');
    const ip = c.req.header('CF-Connecting-IP') ||
               c.req.header('X-Forwarded-For') ||
               c.req.header('X-Real-IP') ||
               'unknown';

    const identifier = userId || ip;
    const endpoint = c.req.path;

    // Rate limit 체크
    const { allowed, info } = await limiter.check(kv, identifier, endpoint);

    // 헤더 추가
    c.header('X-RateLimit-Limit', options.maxRequests.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, options.maxRequests - info.count).toString());
    c.header('X-RateLimit-Reset', info.resetTime.toString());

    if (!allowed) {
      const retryAfter = Math.ceil((info.resetTime - Date.now()) / 1000);
      c.header('Retry-After', retryAfter.toString());

      return c.json({
        success: false,
        error: {
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          code: 'TOO_MANY_REQUESTS',
          retryAfter
        }
      }, 429);
    }

    await next();
  };
}

/**
 * 엔드포인트별 Rate Limit 설정
 */
export const RateLimitPresets = {
  // 일반 API (분당 60회)
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 60
  },

  // 인증 API (분당 5회)
  auth: {
    windowMs: 60 * 1000,
    maxRequests: 5
  },

  // 업로드 API (분당 10회)
  upload: {
    windowMs: 60 * 1000,
    maxRequests: 10
  },

  // AI API (분당 20회)
  ai: {
    windowMs: 60 * 1000,
    maxRequests: 20
  },

  // WebRTC API (분당 30회)
  webrtc: {
    windowMs: 60 * 1000,
    maxRequests: 30
  },

  // 채팅 API (초당 10회)
  chat: {
    windowMs: 1000,
    maxRequests: 10
  },

  // 검색 API (분당 30회)
  search: {
    windowMs: 60 * 1000,
    maxRequests: 30
  }
};

/**
 * IP 기반 Rate Limit (글로벌)
 */
export function globalRateLimit() {
  return rateLimitMiddleware({
    windowMs: 60 * 1000,      // 1분
    maxRequests: 100,          // 100회
    keyPrefix: 'global'
  });
}

/**
 * 사용자별 Rate Limit
 */
export function userRateLimit(maxRequests: number = 60) {
  return rateLimitMiddleware({
    windowMs: 60 * 1000,
    maxRequests,
    keyPrefix: 'user'
  });
}

/**
 * 엔드포인트별 Rate Limit
 */
export function endpointRateLimit(preset: keyof typeof RateLimitPresets) {
  const options = RateLimitPresets[preset];
  return rateLimitMiddleware({
    ...options,
    keyPrefix: `endpoint:${preset}`
  });
}
