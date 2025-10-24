// AI 기반 매칭 시스템
// LLM 임베딩 및 의미론적 유사도 기반 파트너 매칭

import { generateEmbedding, generateChatCompletion, sanitizeJsonResponse, type ChatMessage } from './ai';
import { log } from '../utils/logger';
import type { UserProfile, MatchingPartner } from '../types';
import type { Env } from '../index';
import { query } from '../utils/db';

// Extended profile for AI matching (combines UserProfile with additional data)
export interface ExtendedMatchingProfile {
  userId: string;
  name: string;

  // 언어 정보
  nativeLanguage: string;
  nativeLanguageCode?: string;
  targetLanguages: Array<{
    language: string;
    languageCode?: string;
    currentLevel: string;  // CEFR level
    targetLevel?: string;
  }>;

  // 학습 정보
  studyGoals: string[];
  interests: string[];
  personalities: string[];

  // 프로필 정보
  bio?: string;
  age?: number;
  gender?: string;
  location?: string;

  // 커뮤니케이션 선호도
  communicationMethod?: string;
  dailyMinute?: string;
  learningExpectation?: string;
}

export interface MatchingPreferences {
  languageWeight: number;      // 0-1, 언어 호환성 가중치 (기본 0.25)
  levelWeight: number;          // 0-1, 레벨 호환성 가중치 (기본 0.15)
  semanticWeight: number;       // 0-1, 의미론적 유사도 가중치 (기본 0.15)
  scheduleWeight: number;       // 0-1, 일정 호환성 가중치 (기본 0.15)
  goalsWeight: number;          // 0-1, 목표 일치 가중치 (기본 0.10)
  personalityWeight: number;    // 0-1, 성격 호환성 가중치 (기본 0.10)
  topicsWeight: number;         // 0-1, 주제 중복 가중치 (기본 0.10)
}

export interface MatchScore {
  userId: string;
  overallScore: number;  // 0-100
  breakdown: {
    languageCompatibility: number;   // 0-100
    levelCompatibility: number;       // 0-100
    semanticSimilarity: number;       // 0-100
    scheduleCompatibility: number;    // 0-100
    goalAlignment: number;            // 0-100
    personalityMatch: number;         // 0-100
    topicOverlap: number;            // 0-100
  };
  aiReasons: string[];  // LLM이 생성한 매칭 이유
  suggestedTopics: string[];  // 대화 추천 주제
  compatibilityInsights: string;  // AI 생성 인사이트
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function getCEFRLevelIndex(level: string): number {
  const idx = CEFR_LEVELS.indexOf(level.toUpperCase());
  return idx === -1 ? 0 : idx;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function calculateLanguageCompatibility(user: ExtendedMatchingProfile, candidate: ExtendedMatchingProfile): number {
  // 언어 교환 가능 여부 체크
  // user의 native = candidate의 target 중 하나 && candidate의 native = user의 target 중 하나

  const userNative = user.nativeLanguageCode || user.nativeLanguage;
  const candidateNative = candidate.nativeLanguageCode || candidate.nativeLanguage;

  const userTargetCodes = user.targetLanguages.map(t => t.languageCode || t.language);
  const candidateTargetCodes = candidate.targetLanguages.map(t => t.languageCode || t.language);

  const userTeachesCandidateLearns = candidateTargetCodes.includes(userNative);
  const candidateTeachesUserLearns = userTargetCodes.includes(candidateNative);

  if (userTeachesCandidateLearns && candidateTeachesUserLearns) {
    return 100;  // 완벽한 언어 교환
  } else if (userTeachesCandidateLearns || candidateTeachesUserLearns) {
    return 60;  // 일방향 언어 교환
  } else {
    // 같은 언어를 배우는 경우
    const overlap = userTargetCodes.filter(lang => candidateTargetCodes.includes(lang));
    return overlap.length > 0 ? 40 : 0;
  }
}

function calculateLevelCompatibility(user: ExtendedMatchingProfile, candidate: ExtendedMatchingProfile): number {
  // 레벨 차이가 적을수록 좋음 (±1 레벨이 이상적)
  if (user.targetLanguages.length === 0 || candidate.targetLanguages.length === 0) {
    return 50;  // 중립
  }

  // 공통 학습 언어 찾기
  const userTargets = user.targetLanguages;
  const candidateTargets = candidate.targetLanguages;

  let totalScore = 0;
  let count = 0;

  for (const userTarget of userTargets) {
    for (const candidateTarget of candidateTargets) {
      if (userTarget.languageCode === candidateTarget.languageCode ||
          userTarget.language === candidateTarget.language) {
        const userLevel = getCEFRLevelIndex(userTarget.currentLevel);
        const candidateLevel = getCEFRLevelIndex(candidateTarget.currentLevel);
        const diff = Math.abs(userLevel - candidateLevel);

        // 레벨 차이에 따른 점수: 0차이=100, 1차이=80, 2차이=60, 3차이=40, 4차이=20, 5차이=0
        const score = Math.max(0, 100 - diff * 20);
        totalScore += score;
        count++;
      }
    }
  }

  return count > 0 ? totalScore / count : 50;
}

function calculateScheduleCompatibility(user: ExtendedMatchingProfile, candidate: ExtendedMatchingProfile): number {
  // 현재는 dailyMinute 기반으로 간단히 계산
  // 나중에 더 정교한 시간대 중복 계산 가능

  if (!user.dailyMinute && !candidate.dailyMinute) {
    return 50;  // 정보 없으면 중립
  }

  if (user.dailyMinute === candidate.dailyMinute) {
    return 100;
  }

  // 일정 정보가 있으면 부분 점수
  return user.dailyMinute && candidate.dailyMinute ? 60 : 30;
}

function calculateGoalAlignment(user: ExtendedMatchingProfile, candidate: ExtendedMatchingProfile): number {
  if (user.studyGoals.length === 0 || candidate.studyGoals.length === 0) {
    return 50;  // 정보 없으면 중립
  }

  const overlap = user.studyGoals.filter(goal =>
    candidate.studyGoals.includes(goal)
  );

  const maxLength = Math.max(user.studyGoals.length, candidate.studyGoals.length);
  return (overlap.length / maxLength) * 100;
}

function calculatePersonalityMatch(user: ExtendedMatchingProfile, candidate: ExtendedMatchingProfile): number {
  if (user.personalities.length === 0 || candidate.personalities.length === 0) {
    return 50;  // 정보 없으면 중립
  }

  // 성격 특성 중복 계산
  const overlap = user.personalities.filter(trait =>
    candidate.personalities.includes(trait)
  );

  const maxLength = Math.max(user.personalities.length, candidate.personalities.length);
  return (overlap.length / maxLength) * 100;
}

function calculateTopicOverlap(user: ExtendedMatchingProfile, candidate: ExtendedMatchingProfile): number {
  if (user.interests.length === 0 || candidate.interests.length === 0) {
    return 50;  // 정보 없으면 중립
  }

  const overlap = user.interests.filter(interest =>
    candidate.interests.includes(interest)
  );

  const maxLength = Math.max(user.interests.length, candidate.interests.length);
  return (overlap.length / maxLength) * 100;
}

/**
 * UserProfile을 ExtendedMatchingProfile로 변환
 */
export async function convertToExtendedProfile(
  env: Env,
  profile: UserProfile | MatchingPartner
): Promise<ExtendedMatchingProfile> {
  const userId = 'id' in profile ? profile.id : profile.userId;

  // 목표 언어 정보 가져오기
  const targetLangs = await query<{
    language_id: number;
    language_code: string;
    language_name: string;
    current_level_name: string | null;
    target_level_name: string | null;
  }>(
    env.DB,
    `SELECT
      l.language_id,
      l.language_code,
      l.language_name,
      curr.lang_level_name as current_level_name,
      tgt.lang_level_name as target_level_name
    FROM onboarding_lang_level oll
    JOIN languages l ON l.language_id = oll.language_id
    LEFT JOIN lang_level_type curr ON curr.lang_level_id = oll.current_level_id
    LEFT JOIN lang_level_type tgt ON tgt.lang_level_id = oll.target_level_id
    WHERE oll.user_id = ?`,
    [userId]
  );

  // 학습 목표 가져오기
  const goals = await query<{ goal_name: string }>(
    env.DB,
    `SELECT g.goal_name
    FROM onboarding_goals og
    JOIN goals g ON g.goal_id = og.goal_id
    WHERE og.user_id = ?`,
    [userId]
  );

  // 관심사 가져오기
  const interests = await query<{ interest_name: string }>(
    env.DB,
    `SELECT i.interest_name
    FROM onboarding_interests oi
    JOIN interests i ON i.interest_id = oi.interest_id
    WHERE oi.user_id = ?`,
    [userId]
  );

  // 성격 특성 가져오기
  const personalities = await query<{ personality_name: string }>(
    env.DB,
    `SELECT p.personality_name
    FROM onboarding_personalities op
    JOIN personalities p ON p.personality_id = op.personality_id
    WHERE op.user_id = ?`,
    [userId]
  );

  const extended: ExtendedMatchingProfile = {
    userId,
    name: profile.englishName || profile.name || 'Unknown',
    nativeLanguage: profile.nativeLanguage?.name || '',
    nativeLanguageCode: profile.nativeLanguage?.code,
    targetLanguages: targetLangs.map(t => ({
      language: t.language_name,
      languageCode: t.language_code,
      currentLevel: t.current_level_name || 'A1',
      targetLevel: t.target_level_name || undefined
    })),
    studyGoals: goals.map(g => g.goal_name),
    interests: interests.map(i => i.interest_name),
    personalities: personalities.map(p => p.personality_name),
    bio: profile.selfBio,
    communicationMethod: profile.communicationMethod,
    dailyMinute: profile.dailyMinute,
    learningExpectation: profile.learningExpectation,
  };

  // 나이 계산 (birthyear가 있는 경우)
  if (profile.birthyear) {
    const currentYear = new Date().getFullYear();
    extended.age = currentYear - parseInt(profile.birthyear);
  }

  // 성별
  if (profile.gender) {
    extended.gender = profile.gender;
  }

  // 위치 (location이 있는 경우)
  if ('location' in profile && profile.location) {
    extended.location = profile.location.country + (profile.location.city ? `, ${profile.location.city}` : '');
  } else if ('locationCountry' in profile && profile.locationCountry) {
    extended.location = profile.locationCountry + (profile.locationCity ? `, ${profile.locationCity}` : '');
  }

  return extended;
}

/**
 * 프로필의 의미론적 임베딩 생성
 */
async function generateProfileEmbedding(ai: Ai, profile: ExtendedMatchingProfile): Promise<number[]> {
  // 프로필 정보를 텍스트로 변환
  const profileText = `
Name: ${profile.name}
Native Language: ${profile.nativeLanguage}
Learning: ${profile.targetLanguages.map(t => `${t.language} (${t.currentLevel})`).join(', ')}
Goals: ${profile.studyGoals.join(', ')}
Interests: ${profile.interests.join(', ')}
Personality: ${profile.personalities.join(', ')}
Bio: ${profile.bio || 'N/A'}
  `.trim();

  const embedding = await generateEmbedding(ai, profileText);
  return embedding;
}

/**
 * AI를 사용하여 매칭 이유 생성
 */
async function generateMatchingReasons(
  ai: Ai,
  user: ExtendedMatchingProfile,
  candidate: ExtendedMatchingProfile,
  score: MatchScore
): Promise<{ reasons: string[]; insights: string; topics: string[] }> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a language learning matchmaking expert. Analyze two user profiles and explain why they would be good language exchange partners. Focus on:
- Language exchange compatibility
- Shared interests and goals
- Personality compatibility
- Conversation topics they could enjoy together

Respond in JSON format:
{
  "reasons": ["reason1", "reason2", "reason3"],
  "insights": "overall compatibility insight",
  "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"]
}`
    },
    {
      role: 'user',
      content: `User 1:
- Name: ${user.name}
- Native: ${user.nativeLanguage}, Learning: ${user.targetLanguages.map(t => t.language).join(', ')}
- Goals: ${user.studyGoals.join(', ')}
- Interests: ${user.interests.join(', ')}
- Personality: ${user.personalities.join(', ')}

User 2:
- Name: ${candidate.name}
- Native: ${candidate.nativeLanguage}, Learning: ${candidate.targetLanguages.map(t => t.language).join(', ')}
- Goals: ${candidate.studyGoals.join(', ')}
- Interests: ${candidate.interests.join(', ')}
- Personality: ${candidate.personalities.join(', ')}

Compatibility Score: ${score.overallScore}/100
Language Match: ${score.breakdown.languageCompatibility}/100
Level Match: ${score.breakdown.levelCompatibility}/100
Goals Alignment: ${score.breakdown.goalAlignment}/100
Topic Overlap: ${score.breakdown.topicOverlap}/100`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.7,
      max_tokens: 800
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    return {
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 5) : [],
      insights: typeof parsed.insights === 'string' ? parsed.insights : '',
      topics: Array.isArray(parsed.topics) ? parsed.topics.slice(0, 5) : []
    };
  } catch (error) {
    log.error('Failed to generate matching reasons:', error);
    return {
      reasons: ['Language exchange compatibility', 'Shared learning goals'],
      insights: 'Compatible language learning partners',
      topics: ['Culture', 'Travel', 'Daily Life']
    };
  }
}

/**
 * 두 사용자 간의 AI 기반 매칭 점수 계산
 */
export async function calculateAIMatchScore(
  ai: Ai,
  user: UserProfile | MatchingPartner,
  candidate: UserProfile | MatchingPartner,
  preferences: MatchingPreferences,
  env: Env
): Promise<MatchScore> {
  const userId = 'id' in user ? user.id : user.userId;
  const candidateId = 'id' in candidate ? candidate.id : candidate.userId;

  try {
    log.info('[CALCULATE_AI_MATCH_SCORE] Starting', { userId, candidateId });

    // 프로필 확장
    log.info('[CALCULATE_AI_MATCH_SCORE] Converting to extended profiles', { userId, candidateId });
    const [userExtended, candidateExtended] = await Promise.all([
      convertToExtendedProfile(env, user),
      convertToExtendedProfile(env, candidate)
    ]);
    log.info('[CALCULATE_AI_MATCH_SCORE] Extended profiles created', { userId, candidateId });

    // 각 차원별 호환성 점수 계산
    log.info('[CALCULATE_AI_MATCH_SCORE] Calculating compatibility scores', { userId, candidateId });
    const languageCompatibility = calculateLanguageCompatibility(userExtended, candidateExtended);
    const levelCompatibility = calculateLevelCompatibility(userExtended, candidateExtended);
    const scheduleCompatibility = calculateScheduleCompatibility(userExtended, candidateExtended);
    const goalAlignment = calculateGoalAlignment(userExtended, candidateExtended);
    const personalityMatch = calculatePersonalityMatch(userExtended, candidateExtended);
    const topicOverlap = calculateTopicOverlap(userExtended, candidateExtended);

    log.info('[CALCULATE_AI_MATCH_SCORE] Compatibility scores calculated', {
      userId,
      candidateId,
      languageCompatibility,
      levelCompatibility,
      scheduleCompatibility,
      goalAlignment,
      personalityMatch,
      topicOverlap
    });

    // 의미론적 유사도 계산 (임베딩 기반)
    let semanticSimilarity = 50;  // 기본값
    try {
      log.info('[CALCULATE_AI_MATCH_SCORE] Generating embeddings', { userId, candidateId });
      const [userEmbedding, candidateEmbedding] = await Promise.all([
        generateProfileEmbedding(ai, userExtended),
        generateProfileEmbedding(ai, candidateExtended)
      ]);

      log.info('[CALCULATE_AI_MATCH_SCORE] Embeddings generated', {
        userId,
        candidateId,
        userEmbeddingLength: userEmbedding.length,
        candidateEmbeddingLength: candidateEmbedding.length
      });

      const similarity = cosineSimilarity(userEmbedding, candidateEmbedding);
      semanticSimilarity = Math.round(similarity * 100);  // 0-1 -> 0-100

      log.info('[CALCULATE_AI_MATCH_SCORE] Semantic similarity calculated', {
        userId,
        candidateId,
        semanticSimilarity
      });
    } catch (error) {
      log.error('[CALCULATE_AI_MATCH_SCORE] Failed to calculate semantic similarity', error as Error, {
        userId,
        candidateId
      });
    }

    // 가중 평균으로 전체 점수 계산
    log.info('[CALCULATE_AI_MATCH_SCORE] Calculating overall score', { userId, candidateId });
    const overallScore = Math.round(
      languageCompatibility * preferences.languageWeight +
      levelCompatibility * preferences.levelWeight +
      semanticSimilarity * preferences.semanticWeight +
      scheduleCompatibility * preferences.scheduleWeight +
      goalAlignment * preferences.goalsWeight +
      personalityMatch * preferences.personalityWeight +
      topicOverlap * preferences.topicsWeight
    );

    const score: MatchScore = {
      userId: candidateExtended.userId,
      overallScore,
      breakdown: {
        languageCompatibility,
        levelCompatibility,
        semanticSimilarity,
        scheduleCompatibility,
        goalAlignment,
        personalityMatch,
        topicOverlap
      },
      aiReasons: [],
      suggestedTopics: [],
      compatibilityInsights: ''
    };

    log.info('[CALCULATE_AI_MATCH_SCORE] Overall score calculated', {
      userId,
      candidateId,
      overallScore
    });

    // AI 생성 매칭 이유 및 주제 추천 (비동기로 생성)
    log.info('[CALCULATE_AI_MATCH_SCORE] Generating AI matching reasons', { userId, candidateId });
    const aiGenerated = await generateMatchingReasons(ai, userExtended, candidateExtended, score);
    score.aiReasons = aiGenerated.reasons;
    score.suggestedTopics = aiGenerated.topics;
    score.compatibilityInsights = aiGenerated.insights;

    log.info('[CALCULATE_AI_MATCH_SCORE] Completed successfully', {
      userId,
      candidateId,
      overallScore,
      hasReasons: aiGenerated.reasons.length > 0,
      hasTopics: aiGenerated.topics.length > 0
    });

    return score;
  } catch (error) {
    log.error('[CALCULATE_AI_MATCH_SCORE] Failed', error as Error, {
      userId,
      candidateId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * 여러 후보 중 최적의 매치 찾기
 */
export async function findBestMatches(
  ai: Ai,
  user: UserProfile | MatchingPartner,
  candidates: (UserProfile | MatchingPartner)[],
  preferences: MatchingPreferences,
  env: Env,
  limit: number = 10
): Promise<MatchScore[]> {
  try {
    log.info('[FIND_BEST_MATCHES] Starting', {
      userId: 'id' in user ? user.id : user.userId,
      candidateCount: candidates.length,
      limit
    });

    // 모든 후보에 대해 매칭 점수 계산
    const scores = await Promise.all(
      candidates.map(async (candidate, index) => {
        try {
          log.info(`[FIND_BEST_MATCHES] Processing candidate ${index + 1}/${candidates.length}`, {
            candidateId: 'id' in candidate ? candidate.id : candidate.userId
          });
          return await calculateAIMatchScore(ai, user, candidate, preferences, env);
        } catch (error) {
          log.error(`[FIND_BEST_MATCHES] Error processing candidate ${index + 1}`, error as Error, {
            candidateId: 'id' in candidate ? candidate.id : candidate.userId,
            errorMessage: error instanceof Error ? error.message : String(error)
          });
          throw error;
        }
      })
    );

    log.info('[FIND_BEST_MATCHES] All candidates processed', {
      scoreCount: scores.length
    });

    // 점수 순으로 정렬하고 상위 limit개 반환
    scores.sort((a, b) => b.overallScore - a.overallScore);

    log.info('[FIND_BEST_MATCHES] Completed successfully', {
      returnedMatches: Math.min(limit, scores.length)
    });

    return scores.slice(0, limit);
  } catch (error) {
    log.error('[FIND_BEST_MATCHES] Failed', error as Error, {
      userId: 'id' in user ? user.id : user.userId,
      candidateCount: candidates.length,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}
