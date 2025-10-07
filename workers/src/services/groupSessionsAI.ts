import type { Env } from '../index';
import { log } from '../utils/logger';
import { generateChatCompletion, sanitizeJsonResponse } from './ai';
import type { ChatMessage } from './ai';

export interface TopicRecommendationInput {
  language: string;
  level?: string;
  interests?: string[];
  participantCount?: number;
}

export interface ConversationAnalysisInput {
  transcript: string;
  language?: string;
  participantId?: string;
}

export interface SessionSummaryInput {
  sessionId?: string;
  transcript: string;
  duration?: number;
  participants?: Array<{
    id?: string;
    name?: string;
    role?: string;
  }>;
  language?: string;
}

export interface IcebreakerInput {
  language?: string;
  level?: string;
  topic?: string;
}

export interface RoleplayInput {
  language?: string;
  level?: string;
  situation?: string;
  participantRoles?: string[];
}

export interface TranslateInput {
  text: string;
  fromLanguage?: string;
  toLanguage: string;
}

export interface MatchRecommendationInput {
  userId: string;
  userProfile?: Record<string, unknown>;
  availableSessions?: Array<Record<string, unknown>>;
}

export interface LearningProgressRecord {
  sessionId?: string;
  userId: string;
  metrics?: Record<string, unknown>;
  notes?: string;
  completedAt?: string;
  durationMinutes?: number;
  savedAt: string;
}

const PROGRESS_TTL_SECONDS = 60 * 60 * 24 * 90; // 90일
const PROGRESS_HISTORY_LIMIT = 50;

function parseJsonWithFallback<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    log.warn('Failed to parse AI JSON response', error as Error, {
      component: 'GROUP_SESSION_AI',
      preview: text.slice(0, 240)
    });
    return fallback;
  }
}

async function callStructuredChat<T>(
  env: Env,
  systemPrompt: string,
  userPrompt: string,
  fallback: T,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<T> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const response = await generateChatCompletion(env.AI, messages, {
    temperature: options.temperature ?? 0.6,
    max_tokens: options.maxTokens ?? 900,
    response_format: { type: 'json_object' }
  });

  const sanitized = sanitizeJsonResponse(response.text);
  if (!sanitized) {
    return fallback;
  }
  return parseJsonWithFallback(sanitized, fallback);
}

export async function recommendSessionTopics(
  env: Env,
  userId: string,
  input: TopicRecommendationInput
) {
  const fallback = {
    topics: [
      {
        title: 'Daily Highlights',
        description: 'Share the most interesting part of your day and ask follow-up questions to others.',
        difficulty: input.level || 'INTERMEDIATE',
        culturalTips: [] as string[],
        followUpQuestions: [
          'What made that moment special?',
          'Would you do anything differently next time?'
        ]
      }
    ]
  };

  const interestsText = (input.interests || []).join(', ') || 'general interests';
  const userPrompt = `Recommend three engaging conversation topics for a small group session.

Context:
- Participants' primary learning language: ${input.language || 'English'}
- Average proficiency level: ${input.level || 'Intermediate'}
- Shared interests or focus areas: ${interestsText || 'general conversation'}
- Group size: ${input.participantCount || 4}

Return JSON in the format:
{
  "topics": [
    {
      "title": string,
      "description": string,
      "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      "estimatedDurationMinutes": number,
      "culturalTips": string[],
      "followUpQuestions": string[]
    }
  ]
}`;

  return callStructuredChat(env,
    'You are an expert language tutor who designs conversation prompts that encourage balanced participation and vocabulary growth.',
    userPrompt,
    fallback,
    { temperature: 0.7, maxTokens: 800 }
  );
}

export async function analyzeConversationTranscript(
  env: Env,
  userId: string,
  input: ConversationAnalysisInput
) {
  const fallback = {
    overallScore: 70,
    strengths: ['Clear structure'],
    improvements: ['Use more varied vocabulary'],
    suggestedTopics: ['Cultural experiences'],
    keyPhrases: [] as string[],
    summary: 'Participants engaged in a structured conversation.',
    sentiment: 'neutral'
  };

  const userPrompt = `Analyze this group session transcript for language learning insights.
Provide:
- overallScore (0-100)
- strengths (array of strings)
- improvements (array of strings)
- suggestedTopics (array)
- keyPhrases (array of strings)
- summary (string)
- sentiment (positive/neutral/negative)

Transcript:
${input.transcript}
`;

  return callStructuredChat(env,
    'You are an experienced ESL coach. Focus on constructive, encouraging feedback.',
    userPrompt,
    fallback,
    { temperature: 0.4, maxTokens: 800 }
  );
}

export async function generateSessionSummary(
  env: Env,
  userId: string,
  input: SessionSummaryInput
) {
  const participantsLine = (input.participants || [])
    .map((p) => `${p.name || p.id || 'Participant'}${p.role ? ` (${p.role})` : ''}`)
    .join(', ');

  const fallback = {
    summary: 'Participants discussed the main topic and shared personal experiences.',
    highlights: ['Active participation from all members'],
    actionItems: ['Prepare vocabulary list for next session'],
    followUpQuestions: ['What vocabulary felt challenging?'],
    vocabulary: [] as Array<{ phrase: string; meaning: string }>
  };

  const userPrompt = `Summarize the group session for language learners.
Include summary, 2-3 highlights, actionItems, followUpQuestions, and vocabulary array with phrase/meaning.

Language: ${input.language || 'English'}
Duration (minutes): ${input.duration ?? 'unknown'}
Participants: ${participantsLine || 'Not specified'}
Transcript:
${input.transcript}
`;

  return callStructuredChat(env,
    'You are a language coach who produces concise post-session reports for learners.',
    userPrompt,
    fallback,
    { temperature: 0.5, maxTokens: 900 }
  );
}

export async function generateIcebreakers(
  env: Env,
  userId: string,
  input: IcebreakerInput
) {
  const fallback = {
    icebreakers: [
      'Share one surprising fact about your hometown and ask others to react to it.'
    ]
  };

  const userPrompt = `Provide five creative icebreaker prompts for a group session.
Language: ${input.language || 'English'}
Learner level: ${input.level || 'Intermediate'}
Topic focus: ${input.topic || 'General conversation'}
Return JSON: { "icebreakers": string[] }
`;

  return callStructuredChat(env,
    'You are a facilitator who creates inclusive, culturally sensitive warm-up questions.',
    userPrompt,
    fallback,
    { temperature: 0.8, maxTokens: 500 }
  );
}

export async function generateRoleplayScenario(
  env: Env,
  userId: string,
  input: RoleplayInput
) {
  const fallback = {
    scenarioTitle: 'Business Meeting Kick-off',
    setting: 'Virtual conference call with international teammates',
    roles: ['Project lead', 'Marketing specialist', 'Engineer'],
    goals: ['Align on project scope', 'Assign next steps'],
    scriptOutline: [
      'Introduction and greetings',
      'Discuss project objectives',
      'Clarify deliverables'
    ],
    vocabulary: [] as Array<{ phrase: string; meaning: string }>
  };

  const rolesText = (input.participantRoles || []).join(', ') || 'Flexible roles for 3-4 participants';
  const userPrompt = `Create a roleplay scenario for language learners.
Include scenarioTitle, setting, roles, goals, scriptOutline (array of steps), vocabulary (array of { phrase, meaning }).

Language: ${input.language || 'English'}
Level: ${input.level || 'Intermediate'}
Situation: ${input.situation || 'Business discussion'}
Participant roles: ${rolesText}
`;

  return callStructuredChat(env,
    'You design practical roleplay activities that build speaking confidence.',
    userPrompt,
    fallback,
    { temperature: 0.75, maxTokens: 850 }
  );
}

export async function translateExpression(
  env: Env,
  userId: string,
  input: TranslateInput
) {
  const fallback = {
    translation: input.text,
    pronunciation: null,
    usageNotes: [],
    examples: [] as Array<{ original: string; translated: string }>
  };

  const userPrompt = `Translate the following text for language learners.
Return JSON with fields: translation (string), pronunciation (string|null), usageNotes (string[]),
examples (array of { original, translated }).

Source language: ${input.fromLanguage || 'auto'}
Target language: ${input.toLanguage}
Text:
${input.text}
`;

  return callStructuredChat(env,
    'You are a bilingual language coach who provides nuanced translations with context.',
    userPrompt,
    fallback,
    { temperature: 0.4, maxTokens: 700 }
  );
}

export async function recommendSessionMatches(
  env: Env,
  userId: string,
  input: MatchRecommendationInput
) {
  const fallback = {
    matches: [] as Array<{ sessionId?: string; reason?: string; fitScore?: number }>,
    strategy: 'Recommend sessions by topic relevance and speaking level proximity.'
  };

  const profileSummary = JSON.stringify(input.userProfile ?? {});
  const sessionsInfo = JSON.stringify(input.availableSessions ?? []);

  const userPrompt = `Recommend up to five group sessions for the learner.
Return JSON with fields:
{
  "matches": [
    {
      "sessionId": string | null,
      "title": string,
      "fitScore": number (0-100),
      "reason": string
    }
  ],
  "strategy": string
}

Learner profile:
${profileSummary}

Available sessions:
${sessionsInfo}
`;

  return callStructuredChat(env,
    'You are an AI assistant matching language learners to the most suitable group discussions.',
    userPrompt,
    fallback,
    { temperature: 0.6, maxTokens: 900 }
  );
}

function progressKey(userId: string) {
  return `group-session:progress:${userId}`;
}

export async function saveLearningProgress(
  env: Env,
  record: Omit<LearningProgressRecord, 'savedAt'>
): Promise<LearningProgressRecord> {
  const existingRaw = await env.CACHE.get(progressKey(record.userId));
  let history: LearningProgressRecord[] = [];
  if (existingRaw) {
    try {
      history = JSON.parse(existingRaw) as LearningProgressRecord[];
    } catch (error) {
      log.warn('Failed to parse existing learning progress history', error as Error, {
        component: 'GROUP_SESSION_AI'
      });
      history = [];
    }
  }

  const entry: LearningProgressRecord = {
    ...record,
    savedAt: new Date().toISOString()
  };

  history.unshift(entry);
  if (history.length > PROGRESS_HISTORY_LIMIT) {
    history = history.slice(0, PROGRESS_HISTORY_LIMIT);
  }

  await env.CACHE.put(progressKey(record.userId), JSON.stringify(history), {
    expirationTtl: PROGRESS_TTL_SECONDS
  });

  return entry;
}

export async function listLearningProgress(env: Env, userId: string): Promise<LearningProgressRecord[]> {
  const raw = await env.CACHE.get(progressKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LearningProgressRecord[];
  } catch (error) {
    log.warn('Failed to parse stored learning progress', error as Error, {
      component: 'GROUP_SESSION_AI'
    });
    return [];
  }
}
