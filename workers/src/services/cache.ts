// Workers KV 캐싱 서비스

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for bulk invalidation
  priority?: 'low' | 'normal' | 'high';
}

export interface CacheEntry<T = any> {
  data: T;
  createdAt: number;
  expiresAt: number;
  tags?: string[];
  version?: string;
}

export class CacheService {
  private kv: KVNamespace;
  private prefix: string;
  private defaultTTL: number;

  constructor(kv: KVNamespace, prefix = 'cache', defaultTTL = 3600) {
    this.kv = kv;
    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
  }

  // 캐시 키 생성
  private makeKey(...parts: string[]): string {
    return [this.prefix, ...parts].join(':');
  }

  // 캐시 저장
  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    const ttl = options.ttl || this.defaultTTL;
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      data,
      createdAt: now,
      expiresAt: now + (ttl * 1000),
      tags: options.tags,
      version: '1.0'
    };

    await this.kv.put(
      this.makeKey(key),
      JSON.stringify(entry),
      {
        expirationTtl: ttl,
        metadata: {
          tags: options.tags,
          priority: options.priority || 'normal'
        }
      }
    );

    // 태그 인덱스 업데이트
    if (options.tags && options.tags.length > 0) {
      await this.updateTagIndex(key, options.tags);
    }
  }

  // 캐시 조회
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.makeKey(key);
    const cached = await this.kv.get(fullKey, { type: 'json' }) as CacheEntry<T> | null;

    if (!cached) {
      return null;
    }

    // 만료 확인
    if (cached.expiresAt < Date.now()) {
      await this.kv.delete(fullKey);
      return null;
    }

    return cached.data;
  }

  // 캐시 존재 확인
  async has(key: string): Promise<boolean> {
    const result = await this.get(key);
    return result !== null;
  }

  // 캐시 삭제
  async delete(key: string): Promise<void> {
    const fullKey = this.makeKey(key);
    await this.kv.delete(fullKey);
  }

  // 태그로 캐시 삭제
  async deleteByTag(tag: string): Promise<void> {
    const tagKey = this.makeKey('tags', tag);
    const keys = await this.kv.get<string[]>(tagKey, { type: 'json' });

    if (keys && keys.length > 0) {
      await Promise.all(keys.map(key => this.kv.delete(this.makeKey(key))));
      await this.kv.delete(tagKey);
    }
  }

  // 패턴으로 캐시 삭제
  async deleteByPrefix(prefix: string): Promise<void> {
    const fullPrefix = this.makeKey(prefix);
    const list = await this.kv.list({ prefix: fullPrefix });

    await Promise.all(
      list.keys.map(key => this.kv.delete(key.name))
    );
  }

  // 태그 인덱스 업데이트
  private async updateTagIndex(key: string, tags: string[]): Promise<void> {
    await Promise.all(
      tags.map(async tag => {
        const tagKey = this.makeKey('tags', tag);
        const existing = await this.kv.get<string[]>(tagKey, { type: 'json' }) || [];
        
        if (!existing.includes(key)) {
          existing.push(key);
          await this.kv.put(tagKey, JSON.stringify(existing), {
            expirationTtl: 86400 * 7 // 7일
          });
        }
      })
    );
  }

  // 캐시 통계
  async getStats(): Promise<{
    totalKeys: number;
    estimatedSize: number;
    oldestKey?: string;
  }> {
    const list = await this.kv.list({ prefix: this.prefix });
    
    return {
      totalKeys: list.keys.length,
      estimatedSize: list.keys.reduce((sum, key) => sum + ((key.metadata as any)?.size || 0), 0),
      oldestKey: list.keys[0]?.name
    };
  }
}

// 세션 캐싱 전용 서비스
export class SessionCache {
  private cache: CacheService;

  constructor(kv: KVNamespace) {
    this.cache = new CacheService(kv, 'session', 3600); // 1시간 기본 TTL
  }

  // 세션 저장
  async setSession(sessionId: string, data: any, ttl = 3600): Promise<void> {
    await this.cache.set(sessionId, data, {
      ttl,
      tags: ['session', `user:${data.userId}`]
    });
  }

  // 세션 조회
  async getSession(sessionId: string): Promise<any> {
    return this.cache.get(sessionId);
  }

  // 세션 갱신
  async refreshSession(sessionId: string, ttl = 3600): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;

    await this.setSession(sessionId, session, ttl);
    return true;
  }

  // 사용자별 세션 삭제
  async deleteUserSessions(userId: string): Promise<void> {
    await this.cache.deleteByTag(`user:${userId}`);
  }

  // 모든 세션 삭제
  async deleteAllSessions(): Promise<void> {
    await this.cache.deleteByTag('session');
  }
}

// API 응답 캐싱 서비스
export class APICache {
  private cache: CacheService;

  constructor(kv: KVNamespace) {
    this.cache = new CacheService(kv, 'api', 300); // 5분 기본 TTL
  }

  // API 응답 캐시 키 생성
  private makeAPIKey(method: string, url: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramString}`;
  }

  // API 응답 캐싱
  async cacheResponse(
    method: string,
    url: string,
    response: any,
    params?: any,
    ttl = 300
  ): Promise<void> {
    const key = this.makeAPIKey(method, url, params);
    await this.cache.set(key, response, { ttl, tags: ['api', method] });
  }

  // 캐시된 응답 조회
  async getCachedResponse(
    method: string,
    url: string,
    params?: any
  ): Promise<any> {
    const key = this.makeAPIKey(method, url, params);
    return this.cache.get(key);
  }

  // 특정 메서드의 모든 캐시 삭제
  async invalidateMethod(method: string): Promise<void> {
    await this.cache.deleteByTag(method);
  }

  // 모든 API 캐시 삭제
  async invalidateAll(): Promise<void> {
    await this.cache.deleteByTag('api');
  }
}

// 사용자 프로필 캐싱 서비스
export class UserCache {
  private cache: CacheService;

  constructor(kv: KVNamespace) {
    this.cache = new CacheService(kv, 'user', 86400); // 24시간 기본 TTL
  }

  // 사용자 프로필 캐싱
  async setUser(userId: string, profile: any): Promise<void> {
    await this.cache.set(`profile:${userId}`, profile, {
      ttl: 86400,
      tags: ['user-profile']
    });
  }

  // 사용자 프로필 조회
  async getUser(userId: string): Promise<any> {
    return this.cache.get(`profile:${userId}`);
  }

  // 사용자 설정 캐싱
  async setUserSettings(userId: string, settings: any): Promise<void> {
    await this.cache.set(`settings:${userId}`, settings, {
      ttl: 86400 * 7, // 7일
      tags: ['user-settings']
    });
  }

  // 사용자 설정 조회
  async getUserSettings(userId: string): Promise<any> {
    return this.cache.get(`settings:${userId}`);
  }

  // 사용자 관련 모든 캐시 삭제
  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.cache.delete(`profile:${userId}`),
      this.cache.delete(`settings:${userId}`)
    ]);
  }
}

// 캐시 미들웨어
export function cacheMiddleware(kv: KVNamespace, ttl = 300) {
  const apiCache = new APICache(kv);

  return async (c: any, next: any) => {
    // GET 요청만 캐싱
    if (c.req.method !== 'GET') {
      return next();
    }

    // 캐시 우회 헤더 확인
    if (c.req.header('cache-control') === 'no-cache') {
      return next();
    }

    const url = new URL(c.req.url);
    const cacheKey = `${url.pathname}${url.search}`;

    // 캐시 조회
    const cached = await apiCache.getCachedResponse('GET', cacheKey);
    if (cached) {
      return c.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${ttl}`
        }
      });
    }

    // 다음 핸들러 실행
    await next();

    // 성공 응답만 캐싱
    if (c.res.status === 200) {
      const response = await c.res.json();
      await apiCache.cacheResponse('GET', cacheKey, response, null, ttl);
      
      // 캐시 미스 헤더 추가
      c.res.headers.set('X-Cache', 'MISS');
      c.res.headers.set('Cache-Control', `public, max-age=${ttl}`);
    }
  };
}