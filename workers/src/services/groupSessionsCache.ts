import type { Env } from '../index';
import type { GroupSessionRecord, GroupSessionParticipant } from '../types';
import { CacheService } from './cache';

const CACHE_PREFIX = 'group-session';
const DEFAULT_TTL_SECONDS = 60 * 5; // 5 minutes

function getCache(env: Env): CacheService {
  return new CacheService(env.CACHE, CACHE_PREFIX, DEFAULT_TTL_SECONDS);
}

function cloneParticipants(
  participants?: GroupSessionParticipant[]
): GroupSessionParticipant[] | undefined {
  return participants ? participants.map((participant) => ({ ...participant })) : undefined;
}

function sanitizeRecord(record: GroupSessionRecord): GroupSessionRecord {
  return {
    ...record,
    canJoin: false,
    participants: cloneParticipants(record.participants)
  };
}

export async function setCachedGroupSession(
  env: Env,
  record: GroupSessionRecord
): Promise<void> {
  const cache = getCache(env);
  await cache.set(record.id, sanitizeRecord(record), {
    ttl: DEFAULT_TTL_SECONDS,
    tags: [`session:${record.id}`]
  });
}

export async function getCachedGroupSession(
  env: Env,
  sessionId: string
): Promise<GroupSessionRecord | null> {
  const cache = getCache(env);
  const cached = await cache.get<GroupSessionRecord>(sessionId);
  if (!cached) {
    return null;
  }
  return {
    ...cached,
    participants: cloneParticipants(cached.participants)
  };
}

export async function invalidateGroupSessionCache(env: Env, sessionId: string): Promise<void> {
  const cache = getCache(env);
  await cache.delete(sessionId);
}
