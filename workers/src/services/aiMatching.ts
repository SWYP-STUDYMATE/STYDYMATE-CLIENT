// AI 기반 매칭 시스템
// LLM 임베딩 및 의미론적 유사도 기반 파트너 매칭

import { generateEmbedding, generateChatCompletion, sanitizeJsonResponse, type ChatMessage } from './ai';
import { log } from '../utils/logger';

export interface UserProfile {
  userId: string;
  name: string;

  // 언어 정보
  nativeLanguage: string;
  targetLanguage: string;
  currentLevel: string;  // CEFR level

  // 학습 스타일
  learningStyle: string[];  // 'visual', 'auditory', 'kinesthetic', 'reading'
  studyGoals: string[];    // 'conversation', 'business', 'academic', 'travel'
  preferredTopics: string[]; // 'technology', 'culture', 'sports', 'arts', etc.

  // 가용 시간
  availableHours: {
    timezone: string;
    weekdaySlots: string[];  // '09:00-12:00', '18:00-21:00'
    weekendSlots: string[];
  };

  // 선호도
  preferredSessionType: string[];  // 'video', 'audio', 'text'
  preferredGroupSize: number;  // 1 (1:1), 2-4 (small group), 5+ (large group)

  // 성격 및 커뮤니케이션 스타일
  personalityTraits: string[];  // 'introverted', 'extroverted', 'patient', 'energetic'
  communicationStyle: string;  // 'formal', 'casual', 'mixed'

  // 이전 매칭 데이터
  previousPartners: string[];  // 이전 파트너 ID 목록
  averageSessionRating: number;  // 0-5
  totalSessionCount: number;
}

export interface MatchingPreferences {
  minLevelDifference?: number;  // CEFR 레벨 차이 (0-5)
  maxLevelDifference?: number;
  preferSameLearningStyle?: boolean;
  requireOverlappingTime?: boolean;
  topicOverlapWeight?: number;  // 0-1, 주제 중복 중요도
  personalityCompatibilityWeight?: number;  // 0-1
}

export interface MatchScore {
  userId: string;
  overallScore: number;  // 0-100
  breakdown: {
    languageCompatibility: number;  // 언어 상호 보완성
    levelCompatibility: number;     // 레벨 적합성
    semanticSimilarity: number;     // 의미론적 유사도 (임베딩 기반)
    scheduleCompatibility: number;  // 일정 호환성
    goalAlignment: number;          // 학습 목표 일치도
    personalityMatch: number;       // 성격 매칭
    topicOverlap: number;          // 관심사 중복도
  };
  aiReasons: string[];  // AI가 생성한 매칭 이유
  suggestedTopics: string[];  // 추천 대화 주제
  compatibilityInsights: string;  // AI 분석 인사이트
}

/**
 * 사용자 프로필을 텍스트 설명으로 변환
 */
function profileToText(profile: UserProfile): string {
  return `
User Profile:
- Native Language: ${profile.nativeLanguage}
- Target Language: ${profile.targetLanguage}
- Current Level: ${profile.currentLevel}
- Learning Style: ${profile.learningStyle.join(', ')}
- Study Goals: ${profile.studyGoals.join(', ')}
- Interests: ${profile.preferredTopics.join(', ')}
- Personality: ${profile.personalityTraits.join(', ')}
- Communication Style: ${profile.communicationStyle}
- Preferred Sessions: ${profile.preferredSessionType.join(', ')}
  `.trim();
}

/**
 * 코사인 유사도 계산
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}

/**
 * CEFR 레벨을 숫자로 변환
 */
function cefrToNumber(level: string): number {
  const mapping: Record<string, number> = {
    'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
  };
  return mapping[level.toUpperCase()] || 3;
}

/**
 * 언어 호환성 계산
 * 서로의 native/target 언어가 매칭되면 100점
 */
function calculateLanguageCompatibility(user: UserProfile, candidate: UserProfile): number {
  const userNative = user.nativeLanguage.toLowerCase();
  const userTarget = user.targetLanguage.toLowerCase();
  const candidateNative = candidate.nativeLanguage.toLowerCase();
  const candidateTarget = candidate.targetLanguage.toLowerCase();

  // 완벽한 언어 교환 (서로의 native/target이 일치)
  if (userNative === candidateTarget && userTarget === candidateNative) {
    return 100;
  }

  // 같은 target language를 공부하는 경우
  if (userTarget === candidateTarget) {
    return 70;
  }

  // 같은 native language인 경우 (같이 공부할 수는 있지만 교환은 아님)
  if (userNative === candidateNative) {
    return 50;
  }

  // 매칭 없음
  return 20;
}

/**
 * 레벨 호환성 계산
 */
function calculateLevelCompatibility(
  user: UserProfile,
  candidate: UserProfile,
  preferences: MatchingPreferences
): number {
  const userLevel = cefrToNumber(user.currentLevel);
  const candidateLevel = cefrToNumber(candidate.currentLevel);
  const difference = Math.abs(userLevel - candidateLevel);

  const minDiff = preferences.minLevelDifference || 0;
  const maxDiff = preferences.maxLevelDifference || 2;

  // 범위 밖이면 낮은 점수
  if (difference < minDiff || difference > maxDiff) {
    return 30;
  }

  // 같은 레벨이면 최고점
  if (difference === 0) {
    return 100;
  }

  // 1단계 차이면 90점
  if (difference === 1) {
    return 90;
  }

  // 2단계 차이면 75점
  return 75;
}

/**
 * 일정 호환성 계산
 */
function calculateScheduleCompatibility(user: UserProfile, candidate: UserProfile): number {
  const userSlots = new Set([...user.availableHours.weekdaySlots, ...user.availableHours.weekendSlots]);
  const candidateSlots = new Set([...candidate.availableHours.weekdaySlots, ...candidate.availableHours.weekendSlots]);

  // 공통 시간대 찾기
  const commonSlots = [...userSlots].filter(slot => candidateSlots.has(slot));

  if (commonSlots.length === 0) {
    return 20;  // 공통 시간대 없음
  }

  const totalSlots = userSlots.size + candidateSlots.size - commonSlots.length;
  const overlapRatio = commonSlots.length / totalSlots;

  return Math.min(100, 40 + overlapRatio * 60);
}

/**
 * 학습 목표 일치도 계산
 */
function calculateGoalAlignment(user: UserProfile, candidate: UserProfile): number {
  const userGoals = new Set(user.studyGoals);
  const candidateGoals = new Set(candidate.studyGoals);

  const commonGoals = [...userGoals].filter(goal => candidateGoals.has(goal));

  if (commonGoals.length === 0) {
    return 40;
  }

  const totalGoals = userGoals.size + candidateGoals.size - commonGoals.length;
  const overlapRatio = commonGoals.length / totalGoals;

  return 50 + overlapRatio * 50;
}

/**
 * 주제 중복도 계산
 */
function calculateTopicOverlap(user: UserProfile, candidate: UserProfile): number {
  const userTopics = new Set(user.preferredTopics);
  const candidateTopics = new Set(candidate.preferredTopics);

  const commonTopics = [...userTopics].filter(topic => candidateTopics.has(topic));

  if (commonTopics.length === 0) {
    return 30;
  }

  const totalTopics = userTopics.size + candidateTopics.size - commonTopics.length;
  const overlapRatio = commonTopics.length / totalTopics;

  return 40 + overlapRatio * 60;
}

/**
 * 성격 매칭 계산 (AI 기반)
 */
async function calculatePersonalityMatch(
  ai: Ai,
  user: UserProfile,
  candidate: UserProfile
): Promise<number> {
  try {
    const prompt = `Evaluate personality compatibility for language learning partners.

User A:
- Traits: ${user.personalityTraits.join(', ')}
- Communication Style: ${user.communicationStyle}
- Preferred Sessions: ${user.preferredSessionType.join(', ')}

User B:
- Traits: ${candidate.personalityTraits.join(', ')}
- Communication Style: ${candidate.communicationStyle}
- Preferred Sessions: ${candidate.preferredSessionType.join(', ')}

Provide a compatibility score (0-100) based on how well these personalities would work together for language exchange.
Consider complementary vs similar traits and communication styles.

Respond in JSON format:
{
  "score": number (0-100),
  "reason": "brief explanation"
}`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are an expert in personality psychology and team dynamics for language learning.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const sanitized = sanitizeJsonResponse(response.text);
    const parsed = JSON.parse(sanitized);

    return Math.min(100, Math.max(0, parsed.score || 70));
  } catch (error) {
    log.error('Personality match calculation error', error as Error, { component: 'AI_MATCHING' });
    return 70;  // 기본값
  }
}

/**
 * AI가 매칭 이유 생성
 */
async function generateMatchingReasons(
  ai: Ai,
  user: UserProfile,
  candidate: UserProfile,
  breakdown: MatchScore['breakdown']
): Promise<{ reasons: string[]; insights: string }> {
  try {
    const prompt = `Generate personalized reasons why these two language learners are a good match.

User A:
${profileToText(user)}

User B:
${profileToText(candidate)}

Match Scores:
${JSON.stringify(breakdown, null, 2)}

Provide:
- 3-4 specific reasons why this is a good match
- A brief compatibility insight (2-3 sentences)

Respond in JSON format:
{
  "reasons": ["reason1", "reason2", "reason3"],
  "insights": "string"
}`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are an expert language learning matchmaker. Provide encouraging and specific matching reasons.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const sanitized = sanitizeJsonResponse(response.text);
    const parsed = JSON.parse(sanitized);

    return {
      reasons: parsed.reasons || ['Compatible language goals', 'Similar proficiency levels', 'Overlapping interests'],
      insights: parsed.insights || 'This pairing shows good potential for mutual language exchange and learning.'
    };
  } catch (error) {
    log.error('Matching reasons generation error', error as Error, { component: 'AI_MATCHING' });
    return {
      reasons: ['Complementary language skills', 'Matching availability', 'Shared learning interests'],
      insights: 'Good compatibility across multiple dimensions.'
    };
  }
}

/**
 * 추천 대화 주제 생성
 */
async function generateSuggestedTopics(
  ai: Ai,
  user: UserProfile,
  candidate: UserProfile
): Promise<string[]> {
  try {
    const commonInterests = user.preferredTopics.filter(topic =>
      candidate.preferredTopics.includes(topic)
    );

    const prompt = `Generate 5 conversation topics for these language exchange partners.

User A Interests: ${user.preferredTopics.join(', ')}
User B Interests: ${candidate.preferredTopics.join(', ')}
Common Interests: ${commonInterests.join(', ') || 'None'}

Level: ${user.currentLevel}

Topics should:
- Be engaging for both partners
- Match their proficiency level
- Build on common interests when available
- Encourage natural conversation

Respond with ONLY a JSON array of 5 topic strings.`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are an expert conversation facilitator for language learners.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.6,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const sanitized = sanitizeJsonResponse(response.text);
    const parsed = JSON.parse(sanitized);

    if (Array.isArray(parsed.topics)) {
      return parsed.topics.slice(0, 5);
    }

    // Fallback
    return [
      'Daily routines and habits',
      'Cultural differences and similarities',
      'Favorite hobbies and activities',
      'Travel experiences and dream destinations',
      'Food and cooking traditions'
    ];
  } catch (error) {
    log.error('Topic suggestion error', error as Error, { component: 'AI_MATCHING' });
    return ['General life', 'Culture', 'Hobbies', 'Travel', 'Food'];
  }
}

/**
 * AI 기반 종합 매칭 스코어 계산
 */
export async function calculateAIMatchScore(
  ai: Ai,
  user: UserProfile,
  candidate: UserProfile,
  preferences: MatchingPreferences = {}
): Promise<MatchScore> {
  try {
    // 기본 호환성 계산
    const languageCompatibility = calculateLanguageCompatibility(user, candidate);
    const levelCompatibility = calculateLevelCompatibility(user, candidate, preferences);
    const scheduleCompatibility = calculateScheduleCompatibility(user, candidate);
    const goalAlignment = calculateGoalAlignment(user, candidate);
    const topicOverlap = calculateTopicOverlap(user, candidate);

    // AI 기반 계산 (병렬 처리)
    const [personalityMatch, userEmbedding, candidateEmbedding] = await Promise.all([
      calculatePersonalityMatch(ai, user, candidate),
      generateEmbedding(ai, profileToText(user)),
      generateEmbedding(ai, profileToText(candidate))
    ]);

    // 의미론적 유사도 (임베딩 기반)
    const semanticSimilarity = cosineSimilarity(userEmbedding, candidateEmbedding) * 100;

    const breakdown: MatchScore['breakdown'] = {
      languageCompatibility,
      levelCompatibility,
      semanticSimilarity,
      scheduleCompatibility,
      goalAlignment,
      personalityMatch,
      topicOverlap
    };

    // 가중 평균 계산
    const weights = {
      languageCompatibility: 0.25,  // 가장 중요
      levelCompatibility: 0.15,
      semanticSimilarity: 0.15,
      scheduleCompatibility: 0.15,
      goalAlignment: 0.10,
      personalityMatch: preferences.personalityCompatibilityWeight || 0.10,
      topicOverlap: preferences.topicOverlapWeight || 0.10
    };

    const overallScore = Object.entries(breakdown).reduce(
      (sum, [key, value]) => sum + value * weights[key as keyof typeof weights],
      0
    );

    // AI가 생성한 매칭 이유 및 인사이트
    const { reasons, insights } = await generateMatchingReasons(ai, user, candidate, breakdown);
    const suggestedTopics = await generateSuggestedTopics(ai, user, candidate);

    return {
      userId: candidate.userId,
      overallScore: Math.round(overallScore),
      breakdown,
      aiReasons: reasons,
      suggestedTopics,
      compatibilityInsights: insights
    };
  } catch (error) {
    log.error('AI match score calculation error', error as Error, { component: 'AI_MATCHING' });
    throw new Error('Failed to calculate AI match score');
  }
}

/**
 * 여러 후보자에 대한 매칭 스코어 계산 및 정렬
 */
export async function findBestMatches(
  ai: Ai,
  user: UserProfile,
  candidates: UserProfile[],
  preferences: MatchingPreferences = {},
  limit: number = 10
): Promise<MatchScore[]> {
  try {
    // 이미 매칭된 파트너 필터링
    const filteredCandidates = candidates.filter(
      c => !user.previousPartners.includes(c.userId)
    );

    // 필수 조건 체크 (언어 호환성)
    const viableCandidates = filteredCandidates.filter(c => {
      const langCompat = calculateLanguageCompatibility(user, c);
      return langCompat >= 50;  // 최소 50점 이상
    });

    if (viableCandidates.length === 0) {
      return [];
    }

    // 모든 후보에 대해 매칭 스코어 계산 (병렬)
    const matchScores = await Promise.all(
      viableCandidates.map(candidate =>
        calculateAIMatchScore(ai, user, candidate, preferences)
      )
    );

    // 점수 기준 정렬 및 상위 N개 반환
    return matchScores
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);
  } catch (error) {
    log.error('Best matches finding error', error as Error, { component: 'AI_MATCHING' });
    throw new Error('Failed to find best matches');
  }
}

/**
 * 매칭 설명 생성 (사용자에게 보여줄 텍스트)
 */
export async function generateMatchExplanation(
  ai: Ai,
  matchScore: MatchScore,
  candidateProfile: UserProfile
): Promise<string> {
  try {
    const prompt = `Create a friendly, encouraging explanation of why this language partner is a great match.

Match Score: ${matchScore.overallScore}/100
Candidate Name: ${candidateProfile.name}
Reasons: ${matchScore.aiReasons.join(', ')}
Insights: ${matchScore.compatibilityInsights}
Suggested Topics: ${matchScore.suggestedTopics.join(', ')}

Write 2-3 sentences that:
- Highlight the key compatibility strengths
- Sound personal and encouraging
- Mention 1-2 specific shared interests or goals

Keep the tone friendly and motivating.`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are a friendly language learning matchmaker. Write warm, personal explanations.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.6,
      max_tokens: 200
    });

    return response.text.trim();
  } catch (error) {
    log.error('Match explanation generation error', error as Error, { component: 'AI_MATCHING' });
    return `${candidateProfile.name} is a great match with a compatibility score of ${matchScore.overallScore}%! ${matchScore.compatibilityInsights}`;
  }
}
