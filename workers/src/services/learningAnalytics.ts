// 학습 패턴 분석 AI 시스템
// 세션 데이터 기반 학습 행동 분석 및 맞춤형 추천

import { generateChatCompletion, sanitizeJsonResponse, type ChatMessage } from './ai';
import { log } from '../utils/logger';
import type { Env } from '../index';
import { query } from '../utils/db';

// 학습 패턴 분석 결과
export interface LearningPattern {
  userId: string;
  analysisDate: string;

  // 학습 행동 패턴
  studyHabits: {
    preferredTimeSlots: string[];        // ['morning', 'evening']
    averageSessionDuration: number;      // 분 단위
    sessionsPerWeek: number;
    consistency: number;                 // 0-100, 학습 일관성
    mostProductiveTime: string;          // 'morning', 'afternoon', 'evening'
  };

  // 진행 상황
  progress: {
    currentLevel: string;                // CEFR level
    startingLevel: string;
    monthsLearning: number;
    improvementRate: number;             // 0-100, 월별 향상도
    projection: {
      nextLevel: string;
      estimatedMonths: number;
      confidence: number;                // 0-100
    };
  };

  // 강점 및 약점
  strengths: {
    area: string;                        // 'pronunciation', 'grammar', 'vocabulary', etc.
    score: number;                       // 0-100
    trend: 'improving' | 'stable' | 'declining';
    details: string;
  }[];

  weaknesses: {
    area: string;
    score: number;
    trend: 'improving' | 'stable' | 'declining';
    details: string;
    recommendations: string[];
  }[];

  // 학습 스타일
  learningStyle: {
    primary: string[];                   // ['visual', 'auditory', 'kinesthetic']
    engagement: {
      videoSessions: number;
      audioSessions: number;
      textSessions: number;
    };
    preferredActivities: string[];       // ['conversation', 'reading', 'listening']
  };

  // 참여도 및 동기
  engagement: {
    overallScore: number;                // 0-100
    activeParticipation: number;         // 0-100
    initiativeLevel: number;             // 0-100
    motivationFactors: string[];
    riskFactors: string[];               // 이탈 위험 요소
  };

  // AI 생성 인사이트
  insights: {
    keyFindings: string[];
    recommendations: string[];
    milestones: Array<{
      title: string;
      description: string;
      targetDate: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };

  // 맞춤형 학습 경로
  personalizedPath: {
    shortTerm: Array<{
      goal: string;
      activities: string[];
      estimatedWeeks: number;
    }>;
    mediumTerm: Array<{
      goal: string;
      activities: string[];
      estimatedMonths: number;
    }>;
    longTerm: Array<{
      goal: string;
      activities: string[];
      estimatedMonths: number;
    }>;
  };
}

// 세션 데이터 요약
interface SessionSummary {
  sessionId: string;
  date: string;
  duration: number;              // 분
  type: string;                  // 'video', 'audio', 'text'
  partnerId?: string;
  scores?: {
    pronunciation?: number;
    fluency?: number;
    grammar?: number;
    vocabulary?: number;
    coherence?: number;
  };
  feedback?: string;
  topics?: string[];
}

/**
 * 사용자의 학습 세션 데이터 수집
 */
async function collectUserSessionData(
  env: Env,
  userId: string,
  monthsBack: number = 3
): Promise<SessionSummary[]> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  // 실제 세션 데이터 조회 (예시 - 실제 DB 스키마에 맞게 조정 필요)
  const sessions = await query<{
    session_id: string;
    created_at: string;
    duration_minutes: number | null;
    session_type: string | null;
    partner_id: string | null;
  }>(
    env.DB,
    `SELECT
      s.session_id,
      s.created_at,
      s.duration_minutes,
      s.session_type,
      s.partner_id
    FROM sessions s
    WHERE s.user_id = ?
      AND s.created_at >= ?
      AND s.status = 'completed'
    ORDER BY s.created_at DESC
    LIMIT 100`,
    [userId, startDate.toISOString()]
  );

  return sessions.map(s => ({
    sessionId: s.session_id,
    date: s.created_at,
    duration: s.duration_minutes || 30,
    type: s.session_type || 'video',
    partnerId: s.partner_id || undefined
  }));
}

/**
 * 학습 습관 분석
 */
async function analyzeStudyHabits(
  ai: Ai,
  sessions: SessionSummary[]
): Promise<LearningPattern['studyHabits']> {
  if (sessions.length === 0) {
    return {
      preferredTimeSlots: [],
      averageSessionDuration: 0,
      sessionsPerWeek: 0,
      consistency: 0,
      mostProductiveTime: 'morning'
    };
  }

  // 기본 통계 계산
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const averageSessionDuration = Math.round(totalDuration / sessions.length);

  // 주별 세션 수 계산
  const weeks = Math.ceil((Date.now() - new Date(sessions[sessions.length - 1].date).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const sessionsPerWeek = Math.round(sessions.length / Math.max(weeks, 1) * 10) / 10;

  // AI로 패턴 분석
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a learning analytics expert. Analyze study session patterns and provide insights.

Respond in JSON format:
{
  "preferredTimeSlots": ["morning", "evening"],
  "consistency": 75,
  "mostProductiveTime": "morning"
}`
    },
    {
      role: 'user',
      content: `Analyze these study session patterns:

Sessions: ${sessions.length} sessions over ${weeks} weeks
Average duration: ${averageSessionDuration} minutes
Sessions per week: ${sessionsPerWeek}

Session dates: ${sessions.slice(0, 20).map(s => s.date).join(', ')}

Determine:
- Preferred time slots (morning/afternoon/evening)
- Study consistency (0-100)
- Most productive time of day`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.3,
      max_tokens: 500
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    return {
      preferredTimeSlots: Array.isArray(parsed.preferredTimeSlots) ? parsed.preferredTimeSlots : [],
      averageSessionDuration,
      sessionsPerWeek,
      consistency: typeof parsed.consistency === 'number' ? parsed.consistency : 50,
      mostProductiveTime: parsed.mostProductiveTime || 'morning'
    };
  } catch (error) {
    log.error('Failed to analyze study habits:', error);
    return {
      preferredTimeSlots: ['morning'],
      averageSessionDuration,
      sessionsPerWeek,
      consistency: 50,
      mostProductiveTime: 'morning'
    };
  }
}

/**
 * 진행 상황 및 향상도 분석
 */
async function analyzeProgress(
  ai: Ai,
  userId: string,
  sessions: SessionSummary[],
  env: Env
): Promise<LearningPattern['progress']> {
  // 현재 레벨 조회 (레벨 테스트 결과에서)
  const levelTests = await query<{
    overall_level: string | null;
    created_at: string;
  }>(
    env.DB,
    `SELECT overall_level, created_at
    FROM level_test_results
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10`,
    [userId]
  );

  const currentLevel = levelTests[0]?.overall_level || 'A1';
  const startingLevel = levelTests[levelTests.length - 1]?.overall_level || currentLevel;

  // 학습 기간 계산
  const firstSession = sessions[sessions.length - 1];
  const monthsLearning = firstSession
    ? Math.ceil((Date.now() - new Date(firstSession.date).getTime()) / (30 * 24 * 60 * 60 * 1000))
    : 1;

  // AI로 향상도 및 예측 분석
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a language learning progress analyst. Analyze improvement and predict future progress.

Respond in JSON format:
{
  "improvementRate": 75,
  "projection": {
    "nextLevel": "B1",
    "estimatedMonths": 4,
    "confidence": 80
  }
}`
    },
    {
      role: 'user',
      content: `Analyze learning progress:

Current Level: ${currentLevel}
Starting Level: ${startingLevel}
Months Learning: ${monthsLearning}
Total Sessions: ${sessions.length}
Sessions per Week: ${(sessions.length / (monthsLearning * 4.33)).toFixed(1)}

Level progression: ${levelTests.map(t => `${t.overall_level} (${t.created_at})`).join(', ')}

Calculate:
- Improvement rate (0-100)
- Next level prediction
- Estimated months to next level
- Confidence in prediction (0-100)`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.3,
      max_tokens: 500
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    return {
      currentLevel,
      startingLevel,
      monthsLearning,
      improvementRate: typeof parsed.improvementRate === 'number' ? parsed.improvementRate : 50,
      projection: {
        nextLevel: parsed.projection?.nextLevel || 'B1',
        estimatedMonths: parsed.projection?.estimatedMonths || 6,
        confidence: parsed.projection?.confidence || 50
      }
    };
  } catch (error) {
    log.error('Failed to analyze progress:', error);
    return {
      currentLevel,
      startingLevel,
      monthsLearning,
      improvementRate: 50,
      projection: {
        nextLevel: 'B1',
        estimatedMonths: 6,
        confidence: 50
      }
    };
  }
}

/**
 * 강점 및 약점 분석
 */
async function analyzeStrengthsWeaknesses(
  ai: Ai,
  sessions: SessionSummary[]
): Promise<{ strengths: LearningPattern['strengths']; weaknesses: LearningPattern['weaknesses'] }> {
  // 세션에서 점수 데이터 추출
  const sessionsWithScores = sessions.filter(s => s.scores);

  if (sessionsWithScores.length === 0) {
    return { strengths: [], weaknesses: [] };
  }

  // 영역별 평균 점수 계산
  const areas = ['pronunciation', 'fluency', 'grammar', 'vocabulary', 'coherence'] as const;
  const averages: Record<string, number> = {};

  areas.forEach(area => {
    const scores = sessionsWithScores
      .map(s => s.scores?.[area])
      .filter((score): score is number => score !== undefined);

    if (scores.length > 0) {
      averages[area] = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    }
  });

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a language learning analyst. Identify strengths and weaknesses from performance data.

Respond in JSON format:
{
  "strengths": [
    {
      "area": "pronunciation",
      "score": 85,
      "trend": "improving",
      "details": "Consistently strong in consonant sounds"
    }
  ],
  "weaknesses": [
    {
      "area": "grammar",
      "score": 55,
      "trend": "stable",
      "details": "Struggles with verb tenses",
      "recommendations": ["Focus on past tense practice", "Use grammar exercises"]
    }
  ]
}`
    },
    {
      role: 'user',
      content: `Analyze performance across areas:

${Object.entries(averages).map(([area, score]) => `${area}: ${score}/100`).join('\n')}

Total sessions analyzed: ${sessionsWithScores.length}

Identify:
- Top 3 strengths (score >= 70)
- Top 3 weaknesses (score < 70)
- Trends for each area
- Specific recommendations for weaknesses`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.3,
      max_tokens: 1200
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    return {
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : []
    };
  } catch (error) {
    log.error('Failed to analyze strengths/weaknesses:', error);
    return { strengths: [], weaknesses: [] };
  }
}

/**
 * AI 인사이트 및 맞춤형 학습 경로 생성
 */
async function generateInsightsAndPath(
  ai: Ai,
  pattern: Partial<LearningPattern>
): Promise<{ insights: LearningPattern['insights']; personalizedPath: LearningPattern['personalizedPath'] }> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a personalized learning coach. Generate actionable insights and a customized learning path.

Respond in JSON format:
{
  "insights": {
    "keyFindings": ["Finding 1", "Finding 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"],
    "milestones": [
      {
        "title": "Milestone 1",
        "description": "Description",
        "targetDate": "2025-12-01",
        "priority": "high"
      }
    ]
  },
  "personalizedPath": {
    "shortTerm": [
      {
        "goal": "Improve grammar accuracy",
        "activities": ["Daily grammar exercises", "Practice with partner"],
        "estimatedWeeks": 4
      }
    ],
    "mediumTerm": [],
    "longTerm": []
  }
}`
    },
    {
      role: 'user',
      content: `Generate personalized learning insights and path:

Current Level: ${pattern.progress?.currentLevel}
Study Frequency: ${pattern.studyHabits?.sessionsPerWeek} sessions/week
Consistency: ${pattern.studyHabits?.consistency}/100

Strengths: ${pattern.strengths?.map(s => s.area).join(', ') || 'None identified'}
Weaknesses: ${pattern.weaknesses?.map(w => w.area).join(', ') || 'None identified'}

Next Level Goal: ${pattern.progress?.projection?.nextLevel} in ${pattern.progress?.projection?.estimatedMonths} months

Create:
- 3-5 key findings
- 3-5 actionable recommendations
- 2-3 milestones with dates
- Short-term (1-2 months), medium-term (3-6 months), long-term (6-12 months) learning goals`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.7,
      max_tokens: 2000
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    return {
      insights: {
        keyFindings: Array.isArray(parsed.insights?.keyFindings) ? parsed.insights.keyFindings : [],
        recommendations: Array.isArray(parsed.insights?.recommendations) ? parsed.insights.recommendations : [],
        milestones: Array.isArray(parsed.insights?.milestones) ? parsed.insights.milestones : []
      },
      personalizedPath: {
        shortTerm: Array.isArray(parsed.personalizedPath?.shortTerm) ? parsed.personalizedPath.shortTerm : [],
        mediumTerm: Array.isArray(parsed.personalizedPath?.mediumTerm) ? parsed.personalizedPath.mediumTerm : [],
        longTerm: Array.isArray(parsed.personalizedPath?.longTerm) ? parsed.personalizedPath.longTerm : []
      }
    };
  } catch (error) {
    log.error('Failed to generate insights and path:', error);
    return {
      insights: { keyFindings: [], recommendations: [], milestones: [] },
      personalizedPath: { shortTerm: [], mediumTerm: [], longTerm: [] }
    };
  }
}

/**
 * 종합 학습 패턴 분석 수행
 */
export async function analyzeLearningPattern(
  env: Env,
  userId: string,
  monthsBack: number = 3
): Promise<LearningPattern> {
  // 세션 데이터 수집
  const sessions = await collectUserSessionData(env, userId, monthsBack);

  // 병렬 분석 수행
  const [studyHabits, progress, { strengths, weaknesses }] = await Promise.all([
    analyzeStudyHabits(env.AI, sessions),
    analyzeProgress(env.AI, userId, sessions, env),
    analyzeStrengthsWeaknesses(env.AI, sessions)
  ]);

  // 학습 스타일 분석 (간단한 버전)
  const videoSessions = sessions.filter(s => s.type === 'video').length;
  const audioSessions = sessions.filter(s => s.type === 'audio').length;
  const textSessions = sessions.filter(s => s.type === 'text').length;

  const learningStyle: LearningPattern['learningStyle'] = {
    primary: videoSessions > audioSessions && videoSessions > textSessions ? ['visual'] :
             audioSessions > textSessions ? ['auditory'] : ['reading'],
    engagement: { videoSessions, audioSessions, textSessions },
    preferredActivities: ['conversation']  // 기본값
  };

  // 참여도 분석 (간단한 버전)
  const engagement: LearningPattern['engagement'] = {
    overallScore: Math.min(studyHabits.consistency, 100),
    activeParticipation: Math.min(studyHabits.sessionsPerWeek * 10, 100),
    initiativeLevel: 70,  // 기본값
    motivationFactors: ['language exchange', 'career'],
    riskFactors: studyHabits.consistency < 50 ? ['low consistency'] : []
  };

  // 부분 패턴으로 인사이트 및 경로 생성
  const partialPattern: Partial<LearningPattern> = {
    studyHabits,
    progress,
    strengths,
    weaknesses
  };

  const { insights, personalizedPath } = await generateInsightsAndPath(env.AI, partialPattern);

  return {
    userId,
    analysisDate: new Date().toISOString(),
    studyHabits,
    progress,
    strengths,
    weaknesses,
    learningStyle,
    engagement,
    insights,
    personalizedPath
  };
}
