// 고도화된 레벨 테스트 AI 평가 시스템
// CEFR (A1-C2) 상세 평가 및 발음 정밀 분석

import { generateChatCompletion, sanitizeJsonResponse, type ChatMessage } from './ai';
import { log } from '../utils/logger';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type CEFRSubLevel = 'low' | 'mid' | 'high';

// CEFR 레벨별 기준 점수 (유럽언어공통참조기준 기반)
const CEFR_THRESHOLDS = {
  A1: { min: 0, max: 40 },
  A2: { min: 40, max: 55 },
  B1: { min: 55, max: 70 },
  B2: { min: 70, max: 80 },
  C1: { min: 80, max: 90 },
  C2: { min: 90, max: 100 }
};

// 6개 평가 영역 (CEFR 공식 기준)
export interface DetailedScores {
  pronunciation: number;  // 발음 명확성
  fluency: number;       // 유창성 및 속도
  grammar: number;       // 문법 정확성
  vocabulary: number;    // 어휘 범위 및 적절성
  coherence: number;     // 담화 구성력
  interaction: number;   // 과제 수행 능력
}

// 발음 상세 분석
export interface PronunciationAnalysis {
  overallScore: number;
  clarity: number;              // 명확성 (0-100)
  intonation: number;           // 억양 (0-100)
  rhythm: number;               // 리듬 (0-100)
  stress: number;               // 강세 (0-100)
  problematicSounds: {
    sound: string;
    frequency: number;
    suggestion: string;
  }[];
  nativelikeness: number;       // 원어민 유사도 (0-100)
}

// 문법 상세 분석
export interface GrammarAnalysis {
  overallScore: number;
  accuracy: number;             // 정확성 (0-100)
  complexity: number;           // 복잡도 (0-100)
  range: number;                // 다양성 (0-100)
  commonErrors: {
    type: string;
    example: string;
    correction: string;
    frequency: number;
  }[];
  strengths: string[];
}

// 어휘 상세 분석
export interface VocabularyAnalysis {
  overallScore: number;
  range: number;                // 범위 (0-100)
  appropriateness: number;      // 적절성 (0-100)
  sophistication: number;       // 고급도 (0-100)
  academicLevel: string;        // 학술 수준 (basic/intermediate/advanced)
  keyVocabulary: string[];
  collocations: string[];       // 연어
  idiomsUsed: string[];        // 관용구
}

// 유창성 상세 분석
export interface FluencyAnalysis {
  overallScore: number;
  speed: number;                // 속도 (0-100)
  pauses: number;               // 휴지 처리 (0-100)
  repetition: number;           // 반복 최소화 (0-100)
  selfCorrection: number;       // 자가 수정 능력 (0-100)
  hesitation: number;           // 주저 최소화 (0-100)
}

// 담화 구성력 상세 분석
export interface CoherenceAnalysis {
  overallScore: number;
  organization: number;         // 조직화 (0-100)
  cohesion: number;            // 응집성 (0-100)
  logicalFlow: number;         // 논리적 흐름 (0-100)
  topicDevelopment: number;    // 주제 전개 (0-100)
  linkingDevices: string[];    // 사용된 연결사
}

// 종합 평가 결과
export interface ComprehensiveEvaluation {
  overallLevel: CEFRLevel;
  subLevel: CEFRSubLevel;
  confidenceScore: number;      // 평가 신뢰도 (0-100)
  detailedScores: DetailedScores;

  // 영역별 상세 분석
  pronunciationAnalysis: PronunciationAnalysis;
  grammarAnalysis: GrammarAnalysis;
  vocabularyAnalysis: VocabularyAnalysis;
  fluencyAnalysis: FluencyAnalysis;
  coherenceAnalysis: CoherenceAnalysis;

  // 종합 피드백
  strengths: string[];
  weaknesses: string[];
  priorityImprovements: {
    area: string;
    currentLevel: number;
    targetLevel: number;
    actionItems: string[];
  }[];

  // 학습 로드맵
  studyPlan: {
    shortTerm: string[];        // 1-2주 목표
    mediumTerm: string[];       // 1-3개월 목표
    longTerm: string[];         // 3-6개월 목표
  };

  // 다음 레벨 달성 전략
  nextLevelStrategy: {
    targetLevel: CEFRLevel;
    estimatedTimeMonths: number;
    keyMilestones: string[];
    recommendedResources: string[];
  };
}

/**
 * 음성 전사 텍스트의 발음 패턴 분석
 */
async function analyzePronunciation(
  ai: Ai,
  transcription: string,
  audioQuality: string
): Promise<PronunciationAnalysis> {
  try {
    const prompt = `Analyze the pronunciation quality based on the audio transcription and quality assessment.

Transcription: "${transcription}"
Audio Quality Note: "${audioQuality}"

Evaluate pronunciation across these dimensions (0-100 each):
1. Clarity - How clear and understandable is the speech?
2. Intonation - Natural rise and fall of voice?
3. Rhythm - Proper pacing and timing?
4. Stress - Correct word and sentence stress?
5. Nativelikeness - How close to native speaker pronunciation?

Also identify:
- 3-5 problematic sounds with suggestions (e.g., /th/, /r/, /l/)
- Overall pronunciation score

Respond in JSON format:
{
  "clarity": number,
  "intonation": number,
  "rhythm": number,
  "stress": number,
  "nativelikeness": number,
  "problematicSounds": [
    {
      "sound": "string",
      "frequency": "high|medium|low",
      "suggestion": "string"
    }
  ],
  "overallScore": number
}`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are an expert phonetics and pronunciation assessor with extensive training in CEFR-aligned evaluation.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const sanitized = sanitizeJsonResponse(response.text);
    const parsed = JSON.parse(sanitized);

    // Frequency를 숫자로 변환
    const problematicSounds = (parsed.problematicSounds || []).map((item: any) => ({
      sound: item.sound || '',
      frequency: item.frequency === 'high' ? 3 : item.frequency === 'medium' ? 2 : 1,
      suggestion: item.suggestion || ''
    }));

    return {
      overallScore: parsed.overallScore || 70,
      clarity: parsed.clarity || 70,
      intonation: parsed.intonation || 70,
      rhythm: parsed.rhythm || 70,
      stress: parsed.stress || 70,
      nativelikeness: parsed.nativelikeness || 65,
      problematicSounds
    };
  } catch (error) {
    log.error('Pronunciation analysis error', error as Error, { component: 'ADVANCED_EVAL' });
    // Fallback
    return {
      overallScore: 70,
      clarity: 70,
      intonation: 70,
      rhythm: 70,
      stress: 70,
      nativelikeness: 65,
      problematicSounds: []
    };
  }
}

/**
 * 문법 정밀 분석
 */
async function analyzeGrammar(
  ai: Ai,
  transcription: string,
  questionContext: string
): Promise<GrammarAnalysis> {
  try {
    const prompt = `Perform a detailed grammar analysis of this English response.

Question: "${questionContext}"
Response: "${transcription}"

Evaluate:
1. Accuracy - Correctness of grammar structures (0-100)
2. Complexity - Use of complex structures (0-100)
3. Range - Variety of grammar patterns (0-100)

Identify:
- 3-5 common grammar errors with corrections
- 2-3 grammar strengths

Respond in JSON format:
{
  "accuracy": number,
  "complexity": number,
  "range": number,
  "commonErrors": [
    {
      "type": "string (e.g., 'Subject-verb agreement')",
      "example": "string (original text)",
      "correction": "string (corrected version)",
      "frequency": number (1-5)
    }
  ],
  "strengths": ["string", "string"],
  "overallScore": number
}`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are an expert English grammar assessor. Provide detailed, constructive feedback aligned with CEFR standards.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const sanitized = sanitizeJsonResponse(response.text);
    const parsed = JSON.parse(sanitized);

    return {
      overallScore: parsed.overallScore || 70,
      accuracy: parsed.accuracy || 70,
      complexity: parsed.complexity || 65,
      range: parsed.range || 68,
      commonErrors: parsed.commonErrors || [],
      strengths: parsed.strengths || []
    };
  } catch (error) {
    log.error('Grammar analysis error', error as Error, { component: 'ADVANCED_EVAL' });
    return {
      overallScore: 70,
      accuracy: 70,
      complexity: 65,
      range: 68,
      commonErrors: [],
      strengths: ['Attempted response', 'Basic structure maintained']
    };
  }
}

/**
 * 어휘 정밀 분석
 */
async function analyzeVocabulary(
  ai: Ai,
  transcription: string
): Promise<VocabularyAnalysis> {
  try {
    const prompt = `Analyze the vocabulary usage in this English text.

Text: "${transcription}"

Evaluate:
1. Range - Breadth of vocabulary (0-100)
2. Appropriateness - Context-appropriate word choice (0-100)
3. Sophistication - Use of advanced vocabulary (0-100)
4. Academic Level - basic/intermediate/advanced

Identify:
- 5-10 key vocabulary items used
- 2-4 collocations (word combinations)
- Any idioms or phrasal verbs

Respond in JSON format:
{
  "range": number,
  "appropriateness": number,
  "sophistication": number,
  "academicLevel": "basic|intermediate|advanced",
  "keyVocabulary": ["word1", "word2", ...],
  "collocations": ["make decision", "take time", ...],
  "idiomsUsed": ["string", ...],
  "overallScore": number
}`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are an expert lexicographer and vocabulary assessor with deep knowledge of academic and everyday English.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.25,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const sanitized = sanitizeJsonResponse(response.text);
    const parsed = JSON.parse(sanitized);

    return {
      overallScore: parsed.overallScore || 70,
      range: parsed.range || 68,
      appropriateness: parsed.appropriateness || 72,
      sophistication: parsed.sophistication || 60,
      academicLevel: parsed.academicLevel || 'intermediate',
      keyVocabulary: parsed.keyVocabulary || [],
      collocations: parsed.collocations || [],
      idiomsUsed: parsed.idiomsUsed || []
    };
  } catch (error) {
    log.error('Vocabulary analysis error', error as Error, { component: 'ADVANCED_EVAL' });
    return {
      overallScore: 70,
      range: 68,
      appropriateness: 72,
      sophistication: 60,
      academicLevel: 'intermediate',
      keyVocabulary: [],
      collocations: [],
      idiomsUsed: []
    };
  }
}

/**
 * 유창성 분석
 */
async function analyzeFluency(
  ai: Ai,
  transcription: string,
  responseTime: number,
  wordCount: number
): Promise<FluencyAnalysis> {
  try {
    const wordsPerMinute = wordCount / (responseTime / 60);

    const prompt = `Analyze the fluency of this English response.

Text: "${transcription}"
Response time: ${responseTime} seconds
Word count: ${wordCount}
Speed: ${Math.round(wordsPerMinute)} words/minute

Evaluate (0-100 each):
1. Speed - Appropriate speaking pace
2. Pauses - Effective use of pauses
3. Repetition - Minimal unnecessary repetition
4. SelfCorrection - Ability to self-correct naturally
5. Hesitation - Minimal hesitation markers (um, uh, like)

Respond in JSON format:
{
  "speed": number,
  "pauses": number,
  "repetition": number,
  "selfCorrection": number,
  "hesitation": number,
  "overallScore": number
}`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are an expert in analyzing spoken language fluency and prosody.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const sanitized = sanitizeJsonResponse(response.text);
    const parsed = JSON.parse(sanitized);

    return {
      overallScore: parsed.overallScore || 70,
      speed: parsed.speed || 70,
      pauses: parsed.pauses || 68,
      repetition: parsed.repetition || 72,
      selfCorrection: parsed.selfCorrection || 65,
      hesitation: parsed.hesitation || 68
    };
  } catch (error) {
    log.error('Fluency analysis error', error as Error, { component: 'ADVANCED_EVAL' });
    return {
      overallScore: 70,
      speed: 70,
      pauses: 68,
      repetition: 72,
      selfCorrection: 65,
      hesitation: 68
    };
  }
}

/**
 * 담화 구성력 분석
 */
async function analyzeCoherence(
  ai: Ai,
  transcription: string,
  questionContext: string
): Promise<CoherenceAnalysis> {
  try {
    const prompt = `Analyze the coherence and cohesion of this English response.

Question: "${questionContext}"
Response: "${transcription}"

Evaluate (0-100 each):
1. Organization - Logical structure
2. Cohesion - Use of linking words and devices
3. LogicalFlow - Clear progression of ideas
4. TopicDevelopment - Staying on topic and developing ideas

Identify linking devices used (e.g., "however", "therefore", "in addition")

Respond in JSON format:
{
  "organization": number,
  "cohesion": number,
  "logicalFlow": number,
  "topicDevelopment": number,
  "linkingDevices": ["word1", "word2", ...],
  "overallScore": number
}`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are an expert in discourse analysis and text coherence assessment.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.2,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    });

    const sanitized = sanitizeJsonResponse(response.text);
    const parsed = JSON.parse(sanitized);

    return {
      overallScore: parsed.overallScore || 70,
      organization: parsed.organization || 68,
      cohesion: parsed.cohesion || 70,
      logicalFlow: parsed.logicalFlow || 69,
      topicDevelopment: parsed.topicDevelopment || 71,
      linkingDevices: parsed.linkingDevices || []
    };
  } catch (error) {
    log.error('Coherence analysis error', error as Error, { component: 'ADVANCED_EVAL' });
    return {
      overallScore: 70,
      organization: 68,
      cohesion: 70,
      logicalFlow: 69,
      topicDevelopment: 71,
      linkingDevices: []
    };
  }
}

/**
 * CEFR 레벨 및 서브레벨 계산
 */
function calculateCEFRLevel(averageScore: number): { level: CEFRLevel; subLevel: CEFRSubLevel } {
  let level: CEFRLevel = 'A1';

  for (const [cefrLevel, range] of Object.entries(CEFR_THRESHOLDS)) {
    if (averageScore >= range.min && averageScore < range.max) {
      level = cefrLevel as CEFRLevel;
      break;
    }
  }

  if (averageScore >= CEFR_THRESHOLDS.C2.min) {
    level = 'C2';
  }

  // 서브레벨 계산
  const range = CEFR_THRESHOLDS[level];
  const rangeSize = range.max - range.min;
  const position = averageScore - range.min;
  const percentage = (position / rangeSize) * 100;

  let subLevel: CEFRSubLevel = 'low';
  if (percentage >= 66) subLevel = 'high';
  else if (percentage >= 33) subLevel = 'mid';

  return { level, subLevel };
}

/**
 * 종합 평가 수행 (메인 함수)
 */
export async function performComprehensiveEvaluation(
  ai: Ai,
  transcription: string,
  questionText: string,
  audioQuality: string,
  responseTime: number
): Promise<ComprehensiveEvaluation> {
  try {
    const wordCount = transcription.split(/\s+/).length;

    // 병렬로 모든 분석 수행
    const [
      pronunciationAnalysis,
      grammarAnalysis,
      vocabularyAnalysis,
      fluencyAnalysis,
      coherenceAnalysis
    ] = await Promise.all([
      analyzePronunciation(ai, transcription, audioQuality),
      analyzeGrammar(ai, transcription, questionText),
      analyzeVocabulary(ai, transcription),
      analyzeFluency(ai, transcription, responseTime, wordCount),
      analyzeCoherence(ai, transcription, questionText)
    ]);

    // Interaction 점수는 질문 관련성 및 과제 수행도로 평가
    const interactionScore = (coherenceAnalysis.topicDevelopment + grammarAnalysis.accuracy) / 2;

    const detailedScores: DetailedScores = {
      pronunciation: pronunciationAnalysis.overallScore,
      fluency: fluencyAnalysis.overallScore,
      grammar: grammarAnalysis.overallScore,
      vocabulary: vocabularyAnalysis.overallScore,
      coherence: coherenceAnalysis.overallScore,
      interaction: interactionScore
    };

    // 종합 평균 계산
    const averageScore = Object.values(detailedScores).reduce((sum, score) => sum + score, 0) / 6;
    const { level: overallLevel, subLevel } = calculateCEFRLevel(averageScore);

    // 신뢰도 점수 (일관성 기반)
    const scores = Object.values(detailedScores);
    const standardDeviation = Math.sqrt(
      scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length
    );
    const confidenceScore = Math.max(0, 100 - (standardDeviation * 2));

    // 강점 및 약점 식별
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const priorityImprovements: ComprehensiveEvaluation['priorityImprovements'] = [];

    Object.entries(detailedScores).forEach(([area, score]) => {
      if (score >= 75) {
        strengths.push(`Strong ${area} skills (${Math.round(score)}/100)`);
      } else if (score < 60) {
        weaknesses.push(`${area.charAt(0).toUpperCase() + area.slice(1)} needs improvement (${Math.round(score)}/100)`);
        priorityImprovements.push({
          area,
          currentLevel: Math.round(score),
          targetLevel: Math.round(score) + 20,
          actionItems: getImprovementActions(area, score)
        });
      }
    });

    // 학습 로드맵 생성
    const studyPlan = await generateStudyPlan(ai, overallLevel, detailedScores, priorityImprovements);

    // 다음 레벨 전략
    const nextLevelStrategy = await generateNextLevelStrategy(ai, overallLevel, detailedScores);

    return {
      overallLevel,
      subLevel,
      confidenceScore: Math.round(confidenceScore),
      detailedScores,
      pronunciationAnalysis,
      grammarAnalysis,
      vocabularyAnalysis,
      fluencyAnalysis,
      coherenceAnalysis,
      strengths,
      weaknesses,
      priorityImprovements,
      studyPlan,
      nextLevelStrategy
    };
  } catch (error) {
    log.error('Comprehensive evaluation error', error as Error, { component: 'ADVANCED_EVAL' });
    throw new Error('Failed to perform comprehensive evaluation');
  }
}

/**
 * 영역별 개선 액션 아이템
 */
function getImprovementActions(area: string, currentScore: number): string[] {
  const actions: Record<string, string[]> = {
    pronunciation: [
      'Practice shadowing native speakers daily (15-20 minutes)',
      'Record yourself and compare with native pronunciation',
      'Focus on problematic sounds identified in the analysis',
      'Use pronunciation apps like ELSA or Speechling'
    ],
    fluency: [
      'Practice speaking on topics for 2-3 minutes without stopping',
      'Reduce filler words (um, uh, like) through conscious practice',
      'Join conversation clubs or language exchange',
      'Read aloud daily to improve flow and rhythm'
    ],
    grammar: [
      'Review and practice specific grammar structures identified as weak',
      'Complete grammar exercises targeting your error patterns',
      'Write daily journal entries and self-correct',
      'Use grammar checking tools with explanations'
    ],
    vocabulary: [
      'Learn 10 new words daily with context examples',
      'Practice using academic word lists (AWL)',
      'Read extensively in your areas of interest',
      'Use spaced repetition apps like Anki or Memrise'
    ],
    coherence: [
      'Practice organizing ideas before speaking',
      'Learn and use discourse markers (however, therefore, moreover)',
      'Outline your thoughts using mind maps',
      'Practice presenting structured 2-3 minute talks'
    ],
    interaction: [
      'Practice responding to various question types',
      'Work on directly addressing the question asked',
      'Develop ideas fully with examples and details',
      'Practice active listening and appropriate responses'
    ]
  };

  return actions[area] || ['Practice regularly', 'Seek feedback from teachers', 'Use targeted learning resources'];
}

/**
 * 개인화된 학습 계획 생성
 */
async function generateStudyPlan(
  ai: Ai,
  currentLevel: CEFRLevel,
  scores: DetailedScores,
  priorities: ComprehensiveEvaluation['priorityImprovements']
): Promise<ComprehensiveEvaluation['studyPlan']> {
  try {
    const prompt = `Create a personalized study plan for an English learner.

Current Level: ${currentLevel}
Detailed Scores: ${JSON.stringify(scores)}
Priority Areas: ${priorities.map(p => p.area).join(', ')}

Provide:
- Short-term goals (1-2 weeks): 3-4 actionable items
- Medium-term goals (1-3 months): 3-4 objectives
- Long-term goals (3-6 months): 2-3 major milestones

Respond in JSON format:
{
  "shortTerm": ["goal1", "goal2", ...],
  "mediumTerm": ["goal1", "goal2", ...],
  "longTerm": ["goal1", "goal2", ...]
}`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are an expert language learning coach. Create SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound).'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.4,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const sanitized = sanitizeJsonResponse(response.text);
    const parsed = JSON.parse(sanitized);

    return {
      shortTerm: parsed.shortTerm || ['Practice daily pronunciation drills', 'Complete grammar exercises'],
      mediumTerm: parsed.mediumTerm || ['Expand vocabulary by 300 words', 'Improve fluency through conversation practice'],
      longTerm: parsed.longTerm || ['Achieve next CEFR level', 'Maintain consistent practice routine']
    };
  } catch (error) {
    log.error('Study plan generation error', error as Error, { component: 'ADVANCED_EVAL' });
    return {
      shortTerm: ['Practice speaking 15 minutes daily', 'Learn 10 new vocabulary words per day'],
      mediumTerm: ['Complete structured grammar course', 'Join language exchange program'],
      longTerm: ['Reach next CEFR level', 'Achieve fluent conversation ability']
    };
  }
}

/**
 * 다음 레벨 달성 전략 생성
 */
async function generateNextLevelStrategy(
  ai: Ai,
  currentLevel: CEFRLevel,
  scores: DetailedScores
): Promise<ComprehensiveEvaluation['nextLevelStrategy']> {
  const levelOrder: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const targetLevel: CEFRLevel = currentIndex < levelOrder.length - 1
    ? levelOrder[currentIndex + 1]
    : 'C2';

  try {
    const prompt = `Create a strategy to progress from ${currentLevel} to ${targetLevel} in English.

Current Scores: ${JSON.stringify(scores)}

Provide:
- Estimated time in months (realistic estimate)
- 4-5 key milestones to achieve
- 4-5 recommended resources (books, apps, courses, websites)

Respond in JSON format:
{
  "estimatedTimeMonths": number,
  "keyMilestones": ["milestone1", "milestone2", ...],
  "recommendedResources": ["resource1", "resource2", ...]
}`;

    const response = await generateChatCompletion(ai, [
      {
        role: 'system',
        content: 'You are an expert in language learning pathways and CEFR progression strategies.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const sanitized = sanitizeJsonResponse(response.text);
    const parsed = JSON.parse(sanitized);

    return {
      targetLevel,
      estimatedTimeMonths: parsed.estimatedTimeMonths || 6,
      keyMilestones: parsed.keyMilestones || [
        `Master ${targetLevel} grammar structures`,
        `Build ${targetLevel}-appropriate vocabulary (1000+ words)`,
        `Achieve fluent conversation at ${targetLevel} topics`
      ],
      recommendedResources: parsed.recommendedResources || [
        'English Grammar in Use (Cambridge)',
        'IELTS/TOEFL preparation materials',
        'Language exchange platforms (HelloTalk, Tandem)',
        'Listening practice (TED Talks, podcasts)'
      ]
    };
  } catch (error) {
    log.error('Next level strategy error', error as Error, { component: 'ADVANCED_EVAL' });
    return {
      targetLevel,
      estimatedTimeMonths: 6,
      keyMilestones: ['Improve all skill areas', 'Practice consistently', 'Seek feedback regularly'],
      recommendedResources: ['Standard English textbooks', 'Online learning platforms', 'Language exchange apps']
    };
  }
}
