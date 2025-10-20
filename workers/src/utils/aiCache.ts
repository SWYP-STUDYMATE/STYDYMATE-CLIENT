/**
 * AI 모델 응답 캐싱 시스템
 * - KV 기반 캐시 저장
 * - TTL 관리
 * - 캐시 무효화
 * - 메트릭 추적
 */

import { sha256 } from './hash';

export interface AICacheOptions {
  ttl?: number; // TTL (초)
  namespace?: string; // 캐시 네임스페이스
  enableMetrics?: boolean; // 메트릭 추적 활성화
  compressionThreshold?: number; // 압축 임계값 (바이트)
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  model: string;
  promptHash: string;
}

export interface CacheMetrics {
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  totalSize: number;
  entryCount: number;
}

/**
 * AI 응답 캐시 관리 클래스
 */
export class AICacheManager {
  private kv: KVNamespace;
  private options: Required<AICacheOptions>;
  private readonly METRICS_KEY = 'ai_cache_metrics';
  private readonly DEFAULT_TTL = 3600; // 1시간

  constructor(kv: KVNamespace, options: AICacheOptions = {}) {
    this.kv = kv;
    this.options = {
      ttl: options.ttl || this.DEFAULT_TTL,
      namespace: options.namespace || 'ai_cache',
      enableMetrics: options.enableMetrics !== false,
      compressionThreshold: options.compressionThreshold || 1024, // 1KB
    };
  }

  /**
   * 캐시 키 생성
   * @param model - AI 모델 이름
   * @param prompt - 프롬프트
   * @param parameters - 추가 파라미터
   * @returns 캐시 키
   */
  private async generateCacheKey(
    model: string,
    prompt: string,
    parameters?: Record<string, any>
  ): Promise<string> {
    const content = JSON.stringify({
      model,
      prompt,
      parameters: parameters || {},
    });

    const hash = await sha256(content);
    return `${this.options.namespace}:${model}:${hash}`;
  }

  /**
   * 캐시 조회
   * @param model - AI 모델 이름
   * @param prompt - 프롬프트
   * @param parameters - 추가 파라미터
   * @returns 캐시된 응답 (없으면 null)
   */
  async get<T = any>(
    model: string,
    prompt: string,
    parameters?: Record<string, any>
  ): Promise<T | null> {
    try {
      const key = await this.generateCacheKey(model, prompt, parameters);
      const cached = await this.kv.get<CacheEntry<T>>(key, 'json');

      if (!cached) {
        await this.incrementMetric('misses');
        return null;
      }

      // TTL 확인
      const now = Date.now();
      const elapsed = (now - cached.timestamp) / 1000;

      if (elapsed > cached.ttl) {
        // 만료된 캐시 삭제
        await this.kv.delete(key);
        await this.incrementMetric('misses');
        return null;
      }

      // 히트 카운트 증가
      cached.hits += 1;
      await this.kv.put(key, JSON.stringify(cached), {
        expirationTtl: cached.ttl - Math.floor(elapsed),
      });

      await this.incrementMetric('hits');
      console.log(`[AI Cache] Hit for model ${model} (${cached.hits} hits)`);

      return cached.data;
    } catch (error) {
      console.error('[AI Cache] Get error:', error);
      return null;
    }
  }

  /**
   * 캐시 저장
   * @param model - AI 모델 이름
   * @param prompt - 프롬프트
   * @param data - 응답 데이터
   * @param parameters - 추가 파라미터
   * @param ttl - TTL (선택사항)
   */
  async set<T = any>(
    model: string,
    prompt: string,
    data: T,
    parameters?: Record<string, any>,
    ttl?: number
  ): Promise<void> {
    try {
      const key = await this.generateCacheKey(model, prompt, parameters);
      const promptHash = key.split(':').pop()!;

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.options.ttl,
        hits: 0,
        model,
        promptHash,
      };

      await this.kv.put(key, JSON.stringify(entry), {
        expirationTtl: entry.ttl,
      });

      console.log(`[AI Cache] Stored for model ${model} (TTL: ${entry.ttl}s)`);
    } catch (error) {
      console.error('[AI Cache] Set error:', error);
      throw error;
    }
  }

  /**
   * 특정 모델의 캐시 무효화
   * @param model - AI 모델 이름
   */
  async invalidateModel(model: string): Promise<void> {
    try {
      const prefix = `${this.options.namespace}:${model}:`;
      const list = await this.kv.list({ prefix });

      const deletePromises = list.keys.map((key) => this.kv.delete(key.name));
      await Promise.all(deletePromises);

      console.log(`[AI Cache] Invalidated ${list.keys.length} entries for model ${model}`);
    } catch (error) {
      console.error('[AI Cache] Invalidate model error:', error);
      throw error;
    }
  }

  /**
   * 특정 프롬프트 패턴의 캐시 무효화
   * @param model - AI 모델 이름
   * @param promptPattern - 프롬프트 패턴 (정규식)
   */
  async invalidatePattern(model: string, promptPattern: RegExp): Promise<void> {
    try {
      const prefix = `${this.options.namespace}:${model}:`;
      const list = await this.kv.list({ prefix });

      let deletedCount = 0;

      for (const key of list.keys) {
        const entry = await this.kv.get<CacheEntry>(key.name, 'json');
        if (entry && promptPattern.test(JSON.stringify(entry))) {
          await this.kv.delete(key.name);
          deletedCount++;
        }
      }

      console.log(`[AI Cache] Invalidated ${deletedCount} entries matching pattern`);
    } catch (error) {
      console.error('[AI Cache] Invalidate pattern error:', error);
      throw error;
    }
  }

  /**
   * 모든 캐시 삭제
   */
  async clear(): Promise<void> {
    try {
      const prefix = `${this.options.namespace}:`;
      const list = await this.kv.list({ prefix });

      const deletePromises = list.keys.map((key) => this.kv.delete(key.name));
      await Promise.all(deletePromises);

      // 메트릭도 초기화
      await this.kv.delete(this.METRICS_KEY);

      console.log(`[AI Cache] Cleared ${list.keys.length} entries`);
    } catch (error) {
      console.error('[AI Cache] Clear error:', error);
      throw error;
    }
  }

  /**
   * 캐시 메트릭 조회
   * @returns 캐시 메트릭
   */
  async getMetrics(): Promise<CacheMetrics> {
    try {
      const metrics = await this.kv.get<CacheMetrics>(this.METRICS_KEY, 'json');

      if (!metrics) {
        return {
          totalHits: 0,
          totalMisses: 0,
          hitRate: 0,
          totalSize: 0,
          entryCount: 0,
        };
      }

      // 히트율 계산
      const total = metrics.totalHits + metrics.totalMisses;
      metrics.hitRate = total > 0 ? metrics.totalHits / total : 0;

      return metrics;
    } catch (error) {
      console.error('[AI Cache] Get metrics error:', error);
      return {
        totalHits: 0,
        totalMisses: 0,
        hitRate: 0,
        totalSize: 0,
        entryCount: 0,
      };
    }
  }

  /**
   * 메트릭 증가
   * @param type - 메트릭 타입 ('hits' | 'misses')
   */
  private async incrementMetric(type: 'hits' | 'misses'): Promise<void> {
    if (!this.options.enableMetrics) {
      return;
    }

    try {
      const metrics = await this.getMetrics();

      if (type === 'hits') {
        metrics.totalHits += 1;
      } else {
        metrics.totalMisses += 1;
      }

      await this.kv.put(this.METRICS_KEY, JSON.stringify(metrics), {
        expirationTtl: 86400, // 24시간
      });
    } catch (error) {
      console.error('[AI Cache] Increment metric error:', error);
    }
  }

  /**
   * 캐시 통계 조회
   * @returns 캐시 통계
   */
  async getStats(): Promise<{
    entryCount: number;
    totalSize: number;
    models: Record<string, number>;
  }> {
    try {
      const prefix = `${this.options.namespace}:`;
      const list = await this.kv.list({ prefix });

      const models: Record<string, number> = {};
      let totalSize = 0;

      for (const key of list.keys) {
        const parts = key.name.split(':');
        if (parts.length >= 2) {
          const model = parts[1];
          models[model] = (models[model] || 0) + 1;
        }

        // 크기 추정 (메타데이터 기반)
        if (key.metadata) {
          totalSize += JSON.stringify(key.metadata).length;
        }
      }

      return {
        entryCount: list.keys.length,
        totalSize,
        models,
      };
    } catch (error) {
      console.error('[AI Cache] Get stats error:', error);
      return {
        entryCount: 0,
        totalSize: 0,
        models: {},
      };
    }
  }

  /**
   * 오래된 캐시 정리 (LRU)
   * @param maxEntries - 최대 엔트리 수
   */
  async cleanup(maxEntries: number = 1000): Promise<void> {
    try {
      const prefix = `${this.options.namespace}:`;
      const list = await this.kv.list({ prefix });

      if (list.keys.length <= maxEntries) {
        return;
      }

      // 모든 엔트리 조회
      const entries: Array<{ key: string; entry: CacheEntry }> = [];

      for (const key of list.keys) {
        const entry = await this.kv.get<CacheEntry>(key.name, 'json');
        if (entry) {
          entries.push({ key: key.name, entry });
        }
      }

      // 히트 수와 시간 기준 정렬 (LRU)
      entries.sort((a, b) => {
        const scoreA = a.entry.hits * 1000 + a.entry.timestamp;
        const scoreB = b.entry.hits * 1000 + b.entry.timestamp;
        return scoreA - scoreB;
      });

      // 오래된 엔트리 삭제
      const toDelete = entries.slice(0, entries.length - maxEntries);
      const deletePromises = toDelete.map((item) => this.kv.delete(item.key));
      await Promise.all(deletePromises);

      console.log(`[AI Cache] Cleaned up ${toDelete.length} old entries`);
    } catch (error) {
      console.error('[AI Cache] Cleanup error:', error);
      throw error;
    }
  }
}

/**
 * TTL 프리셋
 */
export const CacheTTL = {
  SHORT: 300, // 5분
  MEDIUM: 1800, // 30분
  LONG: 3600, // 1시간
  VERY_LONG: 86400, // 24시간
};

/**
 * 캐시 전략 프리셋
 */
export const CacheStrategies = {
  // 번역: 중간 TTL (변경 가능성 있음)
  translation: { ttl: CacheTTL.MEDIUM },

  // 레벨 테스트 평가: 긴 TTL (변경 가능성 낮음)
  levelTest: { ttl: CacheTTL.LONG },

  // 매칭 추천: 짧은 TTL (실시간성 중요)
  matching: { ttl: CacheTTL.SHORT },

  // 발음 평가: 중간 TTL
  pronunciation: { ttl: CacheTTL.MEDIUM },

  // 학습 분석: 긴 TTL
  learningAnalytics: { ttl: CacheTTL.VERY_LONG },

  // 대화 요약: 긴 TTL (변경되지 않음)
  conversationSummary: { ttl: CacheTTL.VERY_LONG },
};
