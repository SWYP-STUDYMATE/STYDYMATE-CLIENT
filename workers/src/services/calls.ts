// Cloudflare Calls 서비스
// WebRTC 및 매칭 관련 기능

import { Env } from '../index';

export interface CallSession {
  id: string;
  roomId: string;
  participants: string[];
  startedAt: string;
  endedAt?: string;
  type: 'audio' | 'video';
  maxParticipants: number;
}

export interface MatchingRequest {
  userId: string;
  userLevel: string;
  targetLanguage: string;
  nativeLanguage: string;
  interests: string[];
  availability: string[];
  preferredCallType: 'audio' | 'video' | 'both';
}

export interface MatchResult {
  matchId: string;
  userId: string;
  partnerId: string;
  score: number;
  commonInterests: string[];
  suggestedTopics: string[];
}

// Create a new call session
export async function createCallSession(
  env: Env,
  roomId: string,
  type: 'audio' | 'video',
  maxParticipants: number = 2
): Promise<CallSession> {
  const session: CallSession = {
    id: crypto.randomUUID(),
    roomId,
    participants: [],
    startedAt: new Date().toISOString(),
    type,
    maxParticipants
  };

  // Store session in KV
  await env.CACHE.put(
    `call:${session.id}`,
    JSON.stringify(session),
    { expirationTtl: 7200 } // 2 hours
  );

  return session;
}

// Add participant to call
export async function addParticipant(
  env: Env,
  sessionId: string,
  userId: string
): Promise<boolean> {
  const sessionData = await env.CACHE.get(`call:${sessionId}`);
  if (!sessionData) return false;

  const session: CallSession = JSON.parse(sessionData);
  
  if (session.participants.length >= session.maxParticipants) {
    return false;
  }

  if (!session.participants.includes(userId)) {
    session.participants.push(userId);
    await env.CACHE.put(
      `call:${sessionId}`,
      JSON.stringify(session),
      { expirationTtl: 7200 }
    );
  }

  return true;
}

// Remove participant from call
export async function removeParticipant(
  env: Env,
  sessionId: string,
  userId: string
): Promise<void> {
  const sessionData = await env.CACHE.get(`call:${sessionId}`);
  if (!sessionData) return;

  const session: CallSession = JSON.parse(sessionData);
  session.participants = session.participants.filter(id => id !== userId);

  if (session.participants.length === 0) {
    // End session if no participants
    session.endedAt = new Date().toISOString();
    await env.CACHE.put(
      `call:${sessionId}:ended`,
      JSON.stringify(session),
      { expirationTtl: 86400 } // Keep ended sessions for 24 hours
    );
    await env.CACHE.delete(`call:${sessionId}`);
  } else {
    await env.CACHE.put(
      `call:${sessionId}`,
      JSON.stringify(session),
      { expirationTtl: 7200 }
    );
  }
}

// Find matching partners
export async function findMatches(
  env: Env,
  request: MatchingRequest
): Promise<MatchResult[]> {
  try {
    // Get all pending match requests from KV
    const pendingMatches = await env.CACHE.list({ prefix: 'match:pending:' });
    const matches: MatchResult[] = [];

    for (const key of pendingMatches.keys) {
      if (key.name.includes(request.userId)) continue; // Skip own requests

      const partnerData = await env.CACHE.get(key.name);
      if (!partnerData) continue;

      const partner: MatchingRequest = JSON.parse(partnerData);
      
      // Calculate match score
      const score = calculateMatchScore(request, partner);
      
      if (score > 60) { // Minimum 60% match
        const commonInterests = request.interests.filter(i => 
          partner.interests.includes(i)
        );

        matches.push({
          matchId: crypto.randomUUID(),
          userId: request.userId,
          partnerId: partner.userId,
          score,
          commonInterests,
          suggestedTopics: generateTopics(commonInterests, request.targetLanguage)
        });
      }
    }

    // Sort by score
    matches.sort((a, b) => b.score - a.score);
    
    // Return top 10 matches
    return matches.slice(0, 10);
  } catch (error) {
    console.error('Matching error:', error);
    return [];
  }
}

// Calculate match score between two users
function calculateMatchScore(
  user1: MatchingRequest,
  user2: MatchingRequest
): number {
  let score = 0;
  const weights = {
    languageMatch: 30,
    levelCompatibility: 25,
    interests: 20,
    availability: 15,
    callTypeMatch: 10
  };

  // Language match (user1 wants to learn user2's native language and vice versa)
  if (user1.targetLanguage === user2.nativeLanguage &&
      user2.targetLanguage === user1.nativeLanguage) {
    score += weights.languageMatch;
  }

  // Level compatibility (within 1 level difference)
  const levelDiff = Math.abs(
    getLevelNumber(user1.userLevel) - getLevelNumber(user2.userLevel)
  );
  if (levelDiff <= 1) {
    score += weights.levelCompatibility * (1 - levelDiff * 0.5);
  }

  // Common interests
  const commonInterests = user1.interests.filter(i => 
    user2.interests.includes(i)
  );
  const interestRatio = commonInterests.length / 
    Math.max(user1.interests.length, user2.interests.length);
  score += weights.interests * interestRatio;

  // Availability overlap
  const commonSlots = user1.availability.filter(slot => 
    user2.availability.includes(slot)
  );
  if (commonSlots.length > 0) {
    score += weights.availability;
  }

  // Call type compatibility
  if (user1.preferredCallType === user2.preferredCallType ||
      user1.preferredCallType === 'both' ||
      user2.preferredCallType === 'both') {
    score += weights.callTypeMatch;
  }

  return Math.round(score);
}

// Convert CEFR level to number
function getLevelNumber(level: string): number {
  const levels: Record<string, number> = {
    'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
  };
  return levels[level] || 3;
}

// Generate conversation topics
function generateTopics(
  interests: string[],
  language: string
): string[] {
  const baseTopics = [
    'Daily routines',
    'Hobbies and interests',
    'Travel experiences',
    'Cultural differences',
    'Food and cooking'
  ];

  // Add interest-specific topics
  const interestTopics = interests.map(interest => {
    switch (interest.toLowerCase()) {
      case 'technology':
        return 'Latest tech trends';
      case 'sports':
        return 'Favorite sports and teams';
      case 'music':
        return 'Music preferences and concerts';
      case 'movies':
        return 'Recent movies and TV shows';
      case 'books':
        return 'Book recommendations';
      default:
        return `Discussing ${interest}`;
    }
  });

  return [...new Set([...interestTopics, ...baseTopics])].slice(0, 5);
}

// Store matching request
export async function storeMatchRequest(
  env: Env,
  request: MatchingRequest
): Promise<void> {
  await env.CACHE.put(
    `match:pending:${request.userId}`,
    JSON.stringify(request),
    { expirationTtl: 3600 } // 1 hour
  );
}

// Remove matching request
export async function removeMatchRequest(
  env: Env,
  userId: string
): Promise<void> {
  await env.CACHE.delete(`match:pending:${userId}`);
}

// Get call statistics
export async function getCallStats(
  env: Env,
  userId: string
): Promise<any> {
  try {
    const stats = {
      totalCalls: 0,
      totalDuration: 0,
      averageDuration: 0,
      callTypes: { audio: 0, video: 0 },
      recentCalls: []
    };

    // 데이터베이스에서 실제 통계를 조회해야 함
    // 현재는 KV 캐시에서 통계 데이터 반환
    const cachedStats = await env.CACHE.get(`stats:${userId}`);
    if (cachedStats) {
      return JSON.parse(cachedStats);
    }

    return stats;
  } catch (error) {
    console.error('Stats error:', error);
    return null;
  }
}