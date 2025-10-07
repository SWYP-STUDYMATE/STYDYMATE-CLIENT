import { Hono } from 'hono';
import type { AppBindings as Env } from '../index';
import { Variables } from '../types';
import { auth } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';
import { processAudio, evaluateLanguageLevel, generateLevelFeedback } from '../services/ai';
import { saveToR2, getFromR2 } from '../services/storage';
import { log } from '../utils/logger';

const levelTestRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days
const HISTORY_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const MAX_HISTORY_ITEMS = 20;

const SCORE_KEYS = ['pronunciation', 'fluency', 'grammar', 'vocabulary', 'coherence', 'interaction'] as const;
type ScoreKey = typeof SCORE_KEYS[number];

interface LevelTestAnswer {
  questionId: number;
  transcription?: string;
  audioKey?: string;
  audioType?: string;
  submittedAt: string;
  responseTimeSeconds?: number | null;
  evaluation?: {
    scores: Record<ScoreKey, number>;
    feedback: string;
    suggestions: string[];
    estimatedLevel?: string;
  };
}

interface LevelTestResult {
  testId: string;
  level: string;
  estimatedLevel: string;
  overallScore: number;
  scores: Record<ScoreKey, number>;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  evaluations: Array<{
    questionId: number;
    question: string;
    transcription: string;
    scores: Record<ScoreKey, number>;
    feedback: string;
    suggestions: string[];
    estimatedLevel?: string;
  }>;
  completedAt: string;
  feedbackSummary: string;
}

interface LevelTestSession {
  testId: string;
  userId: string;
  languageCode: string;
  testType: string;
  testLevel: string;
  questionCount: number;
  mode: 'standard' | 'voice';
  questions: typeof TEST_QUESTIONS;
  answers: LevelTestAnswer[];
  status: 'in-progress' | 'completed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  result?: LevelTestResult;
}

interface LevelTestHistoryEntry {
  testId: string;
  startedAt: string;
  completedAt?: string;
  status: LevelTestSession['status'];
  languageCode: string;
  testType: string;
  testLevel: string;
  overallScore?: number;
  level?: string;
}

const optionalAuth = auth({ optional: true });
levelTestRoutes.use('*', optionalAuth);

const TEST_QUESTIONS = [
  {
    id: 1,
    text: "Introduce yourself. Tell me about your name, where you're from, and what you do.",
    korean: "자기소개를 해주세요. 이름, 출신지, 하는 일에 대해 말씀해주세요.",
    duration: 60,
    difficulty: 'A1-A2'
  },
  {
    id: 2,
    text: "Describe your typical day. What do you usually do from morning to evening?",
    korean: "일상적인 하루를 설명해주세요. 아침부터 저녁까지 보통 무엇을 하나요?",
    duration: 90,
    difficulty: 'A2-B1'
  },
  {
    id: 3,
    text: "Talk about a memorable experience you had recently. What happened and how did you feel?",
    korean: "최근에 있었던 기억에 남는 경험에 대해 이야기해주세요. 무슨 일이 있었고 어떻게 느꼈나요?",
    duration: 120,
    difficulty: 'B1-B2'
  },
  {
    id: 4,
    text: "What are your thoughts on technology's impact on education? Discuss both positive and negative aspects.",
    korean: "기술이 교육에 미치는 영향에 대한 당신의 생각은 무엇인가요? 긍정적인 면과 부정적인 면을 모두 논의해주세요.",
    duration: 180,
    difficulty: 'B2-C1'
  }
];

function generateTestId(): string {
  const now = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return String(now * 1000 + random);
}

function sessionKey(testId: string) {
  return `level-test:session:${testId}`;
}

function userHistoryKey(userId: string) {
  return `level-test:history:${userId}`;
}

async function loadSession(env: Env, testId: string): Promise<LevelTestSession | null> {
  const raw = await env.CACHE.get(sessionKey(testId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    log.error('Failed to parse level test session', error as Error, { component: 'LEVEL_TEST', testId });
    return null;
  }
}

async function requireSession(env: Env, testId: string): Promise<LevelTestSession> {
  const session = await loadSession(env, testId);
  if (!session) {
    throw new AppError('Level test not found', 404, 'LEVEL_TEST_NOT_FOUND');
  }
  return session;
}

function ensureOwnership(session: LevelTestSession, userId: string) {
  if (session.userId !== userId) {
    throw new AppError('You do not have access to this test', 403, 'LEVEL_TEST_FORBIDDEN');
  }
}

async function saveSession(env: Env, session: LevelTestSession) {
  await env.CACHE.put(sessionKey(session.testId), JSON.stringify(session), {
    expirationTtl: SESSION_TTL_SECONDS
  });
  await updateHistory(env, session.userId, session);
}

async function updateHistory(env: Env, userId: string, session: LevelTestSession) {
  const key = userHistoryKey(userId);
  const raw = await env.CACHE.get(key);
  let history: LevelTestHistoryEntry[] = [];
  if (raw) {
    try {
      history = JSON.parse(raw);
    } catch (error) {
      history = [];
    }
  }

  const summary: LevelTestHistoryEntry = {
    testId: session.testId,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    status: session.status,
    languageCode: session.languageCode,
    testType: session.testType,
    testLevel: session.testLevel,
    overallScore: session.result?.overallScore,
    level: session.result?.level
  };

  history = history.filter((item) => item.testId !== session.testId);
  history.unshift(summary);
  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }

  await env.CACHE.put(key, JSON.stringify(history), {
    expirationTtl: HISTORY_TTL_SECONDS
  });
}

async function getUserHistory(env: Env, userId: string): Promise<LevelTestHistoryEntry[]> {
  const raw = await env.CACHE.get(userHistoryKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function buildAudioKey(session: LevelTestSession, questionId: number) {
  return `level-test/${session.userId}/${session.testId}/question-${questionId}.webm`;
}

function buildAudioUrl(testId: string, questionId: number) {
  return `/api/v1/level-test/${testId}/audio/${questionId}`;
}

function sanitizeSession(session: LevelTestSession) {
  return {
    testId: Number(session.testId),
    status: session.status,
    languageCode: session.languageCode,
    testType: session.testType,
    testLevel: session.testLevel,
    mode: session.mode,
    startedAt: session.startedAt,
    completedAt: session.completedAt ?? null,
    questions: session.questions,
    answers: session.answers.map((answer) => ({
      questionId: answer.questionId,
      transcription: answer.transcription ?? null,
      submittedAt: answer.submittedAt,
      responseTimeSeconds: answer.responseTimeSeconds ?? null,
      audioUrl: answer.audioKey ? buildAudioUrl(session.testId, answer.questionId) : null,
      evaluation: answer.evaluation ?? null
    })),
    result: session.result
      ? {
          ...session.result,
          testId: Number(session.result.testId)
        }
      : null
  };
}

function getUserIdOrThrow(c: any): string {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
  }
  return userId;
}

function pickScore(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, value));
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(100, parsed));
    }
  }
  return undefined;
}

function upsertAnswer(session: LevelTestSession, questionId: number): LevelTestAnswer {
  const existing = session.answers.find((answer) => answer.questionId === questionId);
  if (existing) {
    return existing;
  }
  const answer: LevelTestAnswer = {
    questionId,
    submittedAt: new Date().toISOString(),
    responseTimeSeconds: null
  };
  session.answers.push(answer);
  return answer;
}

function resolveQuestion(session: LevelTestSession, questionId?: number | null) {
  if (questionId) {
    const question = session.questions.find((item) => item.id === questionId);
    if (!question) {
      throw new AppError('Invalid question id', 400, 'LEVEL_TEST_INVALID_QUESTION');
    }
    return question;
  }

  const unanswered = session.questions.find((question) => !session.answers.some((answer) => answer.questionId === question.id));
  if (!unanswered) {
    throw new AppError('All questions already answered', 400, 'LEVEL_TEST_COMPLETED');
  }
  return unanswered;
}

function aggregateScores(evaluations: LevelTestResult['evaluations']): Record<ScoreKey, number> {
  const totals: Record<ScoreKey, { sum: number; count: number }> = {
    pronunciation: { sum: 0, count: 0 },
    fluency: { sum: 0, count: 0 },
    grammar: { sum: 0, count: 0 },
    vocabulary: { sum: 0, count: 0 },
    coherence: { sum: 0, count: 0 },
    interaction: { sum: 0, count: 0 }
  };

  for (const evaluation of evaluations) {
    for (const key of SCORE_KEYS) {
      const value = pickScore(evaluation.scores[key]);
      if (value !== undefined) {
        totals[key].sum += value;
        totals[key].count += 1;
      }
    }
  }

  const averages: Record<ScoreKey, number> = {
    pronunciation: 0,
    fluency: 0,
    grammar: 0,
    vocabulary: 0,
    coherence: 0,
    interaction: 0
  };

  for (const key of SCORE_KEYS) {
    averages[key] = totals[key].count > 0 ? Math.round(totals[key].sum / totals[key].count) : 0;
  }

  return averages;
}

function determineLevel(overallScore: number): string {
  if (overallScore >= 85) return 'C2';
  if (overallScore >= 75) return 'C1';
  if (overallScore >= 65) return 'B2';
  if (overallScore >= 55) return 'B1';
  if (overallScore >= 45) return 'A2';
  return 'A1';
}

async function evaluateSession(env: Env, session: LevelTestSession): Promise<LevelTestResult> {
  const evaluations: LevelTestResult['evaluations'] = [];

  for (const question of session.questions) {
    const answer = session.answers.find((item) => item.questionId === question.id);
    if (!answer?.transcription) {
      continue;
    }

    if (!answer.evaluation) {
      const evaluation = await evaluateLanguageLevel(env.AI, answer.transcription, question.text);
      const scores: Record<ScoreKey, number> = {
        pronunciation: pickScore(evaluation?.scores?.pronunciation) ?? 0,
        fluency: pickScore(evaluation?.scores?.fluency) ?? 0,
        grammar: pickScore(evaluation?.scores?.grammar) ?? 0,
        vocabulary: pickScore(evaluation?.scores?.vocabulary) ?? 0,
        coherence: pickScore(evaluation?.scores?.coherence) ?? 0,
        interaction: pickScore(evaluation?.scores?.interaction) ?? 0
      };

      answer.evaluation = {
        scores,
        feedback: evaluation?.feedback ?? '',
        suggestions: Array.isArray(evaluation?.suggestions) ? evaluation.suggestions.filter(Boolean) : [],
        estimatedLevel: evaluation?.estimatedLevel
      };
    }

    evaluations.push({
      questionId: question.id,
      question: question.text,
      transcription: answer.transcription,
      scores: answer.evaluation!.scores,
      feedback: answer.evaluation!.feedback,
      suggestions: answer.evaluation!.suggestions,
      estimatedLevel: answer.evaluation!.estimatedLevel
    });
  }

  if (evaluations.length === 0) {
    throw new AppError('No submissions to evaluate', 400, 'LEVEL_TEST_NO_SUBMISSIONS');
  }

  const averages = aggregateScores(evaluations);
  const overallScore = Math.round(
    SCORE_KEYS.reduce((sum, key) => sum + averages[key], 0) / SCORE_KEYS.length
  );
  const level = determineLevel(overallScore);

  const strengths = SCORE_KEYS.filter((key) => averages[key] >= 75).map((key) => key);
  const improvements = SCORE_KEYS.filter((key) => averages[key] <= 55).map((key) => key);

  const suggestions = Array.from(
    new Set(
      evaluations
        .flatMap((evaluation) => evaluation.suggestions)
        .filter(Boolean)
    )
  ).slice(0, 6);

  const analysis = {
    grammar: averages.grammar,
    vocabulary: averages.vocabulary,
    fluency: averages.fluency,
    pronunciation: averages.pronunciation,
    taskAchievement: averages.coherence,
    interaction: averages.interaction
  };

  const feedbackSummary = await generateLevelFeedback(env.AI, analysis, level as any);

  const result: LevelTestResult = {
    testId: session.testId,
    level,
    estimatedLevel: level,
    overallScore,
    scores: averages,
    strengths,
    improvements,
    suggestions,
    evaluations,
    completedAt: new Date().toISOString(),
    feedbackSummary
  };

  return result;
}

async function createSession(c: any, mode: 'standard' | 'voice') {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const body = await c.req.json().catch(() => ({}));

  const languageCode = typeof body?.languageCode === 'string' ? body.languageCode : typeof body?.targetLanguage === 'string' ? body.targetLanguage : 'en';
  const testType = typeof body?.testType === 'string' ? body.testType : 'SPEAKING';
  const testLevel = typeof body?.testLevel === 'string' ? body.testLevel : 'INTERMEDIATE';
  const requestedQuestions = Number(body?.totalQuestions) || TEST_QUESTIONS.length;
  const questionCount = Math.min(Math.max(requestedQuestions, 1), TEST_QUESTIONS.length);

  const testId = generateTestId();
  const questions = TEST_QUESTIONS.slice(0, questionCount).map((question, index) => ({
    ...question,
    id: index + 1
  }));

  const session: LevelTestSession = {
    testId,
    userId,
    languageCode,
    testType,
    testLevel,
    questionCount,
    mode,
    questions,
    answers: [],
    status: 'in-progress',
    startedAt: new Date().toISOString()
  };

  await saveSession(env, session);
  return session;
}

async function handleAudioSubmission(c: any, session: LevelTestSession, providedQuestionId?: number | null) {
  const env: Env = c.env;
  const formData = await c.req.formData();
  const audio = formData.get('audio') as File | null;
  if (!audio) {
    throw new AppError('Audio file missing', 400, 'LEVEL_TEST_AUDIO_REQUIRED');
  }

  const questionIdFromForm = formData.get('questionId');
  const questionNumber = providedQuestionId ?? (typeof questionIdFromForm === 'string' ? Number.parseInt(questionIdFromForm, 10) : undefined);

  const question = resolveQuestion(session, Number.isFinite(questionNumber) ? Number(questionNumber) : undefined);
  const answer = upsertAnswer(session, question.id);

  const audioBuffer = await audio.arrayBuffer();
  const audioKey = buildAudioKey(session, question.id);
  await saveToR2(env.STORAGE, audioKey, audioBuffer, audio.type || 'audio/webm');

  const transcription = await processAudio(env.AI, audioBuffer, {
    task: 'transcribe',
    language: session.languageCode || 'en',
    vad_filter: true,
    initial_prompt: question.text
  });

  answer.audioKey = audioKey;
  answer.audioType = audio.type || 'audio/webm';
  answer.transcription = transcription?.text ?? transcription;
  answer.submittedAt = new Date().toISOString();
  answer.responseTimeSeconds = typeof formData.get('responseTimeSeconds') === 'string'
    ? Number.parseFloat(formData.get('responseTimeSeconds') as string)
    : answer.responseTimeSeconds ?? null;
  answer.evaluation = undefined;

  await saveSession(env, session);

  return {
    testId: Number(session.testId),
    questionId: question.id,
    transcription: answer.transcription,
    audioUrl: buildAudioUrl(session.testId, question.id),
    submittedAt: answer.submittedAt
  };
}

// --- Routes ---

levelTestRoutes.get('/questions', (c) => {
  return successResponse(c, { questions: TEST_QUESTIONS });
});

levelTestRoutes.post('/start', auth(), async (c) => {
  const session = await createSession(c, 'standard');
  return successResponse(c, {
    testId: Number(session.testId),
    languageCode: session.languageCode,
    testType: session.testType,
    testLevel: session.testLevel,
    totalQuestions: session.questionCount,
    questions: session.questions,
    startedAt: session.startedAt
  });
});

levelTestRoutes.post('/restart', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const body = await c.req.json().catch(() => ({}));
  const previousTestId = typeof body?.previousTestId === 'string' ? body.previousTestId : typeof body?.testId === 'string' ? body.testId : undefined;

  if (previousTestId) {
    const previous = await loadSession(env, previousTestId);
    if (previous && previous.userId === userId && previous.status === 'in-progress') {
      previous.status = 'cancelled';
      previous.completedAt = new Date().toISOString();
      await saveSession(env, previous);
    }
  }

  const session = await createSession(c, 'standard');
  return successResponse(c, {
    testId: Number(session.testId),
    languageCode: session.languageCode,
    testType: session.testType,
    testLevel: session.testLevel,
    totalQuestions: session.questionCount,
    questions: session.questions,
    startedAt: session.startedAt
  });
});

levelTestRoutes.post('/voice/start', auth(), async (c) => {
  const session = await createSession(c, 'voice');
  return successResponse(c, {
    testId: Number(session.testId),
    languageCode: session.languageCode,
    testType: session.testType,
    testLevel: session.testLevel,
    totalQuestions: session.questionCount,
    questions: session.questions,
    startedAt: session.startedAt
  });
});

levelTestRoutes.post('/voice/:testId/upload', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param('testId');
  const session = await requireSession(env, testId);
  ensureOwnership(session, userId);
  if (session.status === 'completed') {
    throw new AppError('Test already completed', 400, 'LEVEL_TEST_ALREADY_COMPLETED');
  }
  const response = await handleAudioSubmission(c, session, null);
  return successResponse(c, response);
});

levelTestRoutes.post('/voice/transcribe', auth(), async (c) => {
  const userId = getUserIdOrThrow(c);
  const contentType = c.req.header('Content-Type') || '';

  let audioBuffer: ArrayBuffer | null = null;
  let mimeType = 'audio/webm';
  let whisperOptions: Record<string, unknown> = {};

  if (contentType.startsWith('multipart/form-data')) {
    const formData = await c.req.formData();
    const audio = formData.get('audio');
    if (!(audio instanceof File)) {
      throw new AppError('audio file is required', 400, 'LEVEL_TEST_AUDIO_REQUIRED');
    }
    audioBuffer = await audio.arrayBuffer();
    mimeType = audio.type || mimeType;
    whisperOptions = {
      language: formData.get('language') || undefined,
      task: formData.get('task') || undefined,
      initial_prompt: formData.get('initialPrompt') || undefined,
      prefix: formData.get('prefix') || undefined,
      vad_filter: formData.get('vadFilter') ?? formData.get('vad_filter') ?? undefined
    };
  } else {
    const body = await c.req.json().catch(() => ({}));
    if (typeof body.audio === 'string') {
      const cleaned = body.audio.replace(/^data:[^;]+;base64,/, '');
      const binaryString = atob(cleaned);
      const view = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        view[i] = binaryString.charCodeAt(i);
      }
      audioBuffer = view.buffer;
      mimeType = typeof body.mimeType === 'string' ? body.mimeType : mimeType;
    }
    whisperOptions = {
      language: typeof body.language === 'string' ? body.language : undefined,
      task: typeof body.task === 'string' ? body.task : undefined,
      initial_prompt: typeof body.initialPrompt === 'string' ? body.initialPrompt : undefined,
      prefix: typeof body.prefix === 'string' ? body.prefix : undefined,
      vad_filter: typeof body.vadFilter === 'boolean' ? body.vadFilter : undefined
    };
  }

  if (!audioBuffer) {
    throw new AppError('audio payload is required', 400, 'LEVEL_TEST_AUDIO_REQUIRED');
  }

  const transcription = await processAudio(c.env.AI, audioBuffer, {
    task: (whisperOptions.task as string) || 'transcribe',
    language: (whisperOptions.language as string) || 'auto',
    vad_filter: whisperOptions.vad_filter !== undefined ? Boolean(whisperOptions.vad_filter) : true,
    initial_prompt: whisperOptions.initial_prompt as string | undefined,
    prefix: whisperOptions.prefix as string | undefined
  });

  return successResponse(c, {
    userId,
    mimeType,
    transcription: transcription.text,
    wordCount: transcription.word_count,
    words: transcription.words ?? [],
    chunks: transcription.chunks
  });
});

levelTestRoutes.post('/voice/:testId/analyze', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param('testId');
  const session = await requireSession(env, testId);
  ensureOwnership(session, userId);

  const result = await evaluateSession(env, session);
  session.result = result;
  session.status = 'completed';
  session.completedAt = result.completedAt;
  await saveSession(env, session);

  return successResponse(c, {
    ...result,
    testId: Number(result.testId)
  });
});

levelTestRoutes.get('/voice/:testId/result', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param('testId');
  const session = await requireSession(env, testId);
  ensureOwnership(session, userId);
  if (!session.result) {
    throw new AppError('Result not available yet', 404, 'LEVEL_TEST_RESULT_NOT_READY');
  }
  return successResponse(c, {
    ...session.result,
    testId: Number(session.result.testId)
  });
});

levelTestRoutes.post('/submit', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const body = await c.req.json().catch(() => ({}));

  const testId = typeof body?.testId === 'number' ? String(body.testId) : typeof body?.testId === 'string' ? body.testId : undefined;
  const questionNumber = typeof body?.questionNumber === 'number' ? body.questionNumber : Number(body?.questionId);
  const userAnswer = typeof body?.userAnswer === 'string' ? body.userAnswer.trim() : undefined;

  if (!testId || !questionNumber || !userAnswer) {
    throw new AppError('testId, questionNumber and userAnswer are required', 400, 'LEVEL_TEST_INVALID_SUBMISSION');
  }

  const session = await requireSession(env, testId);
  ensureOwnership(session, userId);
  if (session.status === 'completed') {
    throw new AppError('Test already completed', 400, 'LEVEL_TEST_ALREADY_COMPLETED');
  }

  const question = resolveQuestion(session, questionNumber);
  const answer = upsertAnswer(session, question.id);
  answer.transcription = userAnswer;
  answer.submittedAt = new Date().toISOString();
  answer.responseTimeSeconds = typeof body?.responseTimeSeconds === 'number'
    ? body.responseTimeSeconds
    : answer.responseTimeSeconds ?? null;
  answer.evaluation = undefined;

  await saveSession(env, session);

  return successResponse(c, {
    testId: Number(session.testId),
    questionId: question.id,
    saved: true
  });
});

levelTestRoutes.post('/:testId/audio-answer', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param('testId');
  const session = await requireSession(env, testId);
  ensureOwnership(session, userId);
  if (session.status === 'completed') {
    throw new AppError('Test already completed', 400, 'LEVEL_TEST_ALREADY_COMPLETED');
  }

  const response = await handleAudioSubmission(c, session);
  return successResponse(c, response);
});

levelTestRoutes.post('/:testId/complete', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param('testId');
  const session = await requireSession(env, testId);
  ensureOwnership(session, userId);

  const result = await evaluateSession(env, session);
  session.result = result;
  session.status = 'completed';
  session.completedAt = result.completedAt;
  await saveSession(env, session);

  return successResponse(c, {
    ...result,
    testId: Number(result.testId)
  });
});

levelTestRoutes.get('/my-tests', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const history = await getUserHistory(env, userId);
  return successResponse(c, history.map((entry) => ({
    ...entry,
    testId: Number(entry.testId)
  })));
});

levelTestRoutes.get('/summary', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const history = await getUserHistory(env, userId);

  if (history.length === 0) {
    return successResponse(c, {
      totalTests: 0,
      completedTests: 0,
      averageScore: null,
      latestLevel: null,
      latestCompletedAt: null
    });
  }

  const completed = history.filter((item) => item.status === 'completed' && typeof item.overallScore === 'number');
  const averageScore = completed.length > 0
    ? Math.round(completed.reduce((sum, item) => sum + (item.overallScore || 0), 0) / completed.length)
    : null;

  const latestCompleted = completed.sort((a, b) => (b.completedAt ? Date.parse(b.completedAt) : 0) - (a.completedAt ? Date.parse(a.completedAt) : 0))[0];

  return successResponse(c, {
    totalTests: history.length,
    completedTests: completed.length,
    averageScore,
    latestLevel: latestCompleted?.level ?? null,
    latestCompletedAt: latestCompleted?.completedAt ?? null
  });
});

levelTestRoutes.get('/:testId/audio/:questionId', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param('testId');
  const questionId = Number.parseInt(c.req.param('questionId'), 10);

  const session = await requireSession(env, testId);
  ensureOwnership(session, userId);

  const answer = session.answers.find((item) => item.questionId === questionId);
  if (!answer?.audioKey) {
    throw new AppError('Audio not found for this question', 404, 'LEVEL_TEST_AUDIO_NOT_FOUND');
  }

  const audio = await getFromR2(env.STORAGE, answer.audioKey);
  if (!audio) {
    throw new AppError('Audio not found', 404, 'LEVEL_TEST_AUDIO_NOT_FOUND');
  }

  return new Response(audio.body, {
    headers: {
      'Content-Type': answer.audioType || audio.httpMetadata?.contentType || 'audio/webm',
      'Cache-Control': 'private, max-age=86400'
    }
  });
});

levelTestRoutes.get('/:testId', auth(), async (c) => {
  const env: Env = c.env;
  const userId = getUserIdOrThrow(c);
  const testId = c.req.param('testId');
  const session = await requireSession(env, testId);
  ensureOwnership(session, userId);
  return successResponse(c, sanitizeSession(session));
});

export { levelTestRoutes };
