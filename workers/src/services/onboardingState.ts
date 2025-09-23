import type { Env } from '../index';

const PREFIX = 'onboarding';
const STEP_PREFIX = `${PREFIX}:step`;
const PROGRESS_PREFIX = `${PREFIX}:progress`;
const SESSION_PREFIX = `${PREFIX}:session`;
const DEFAULT_STEP_TTL = 60 * 60 * 24 * 7; // 7일
const SESSION_TTL = 60 * 60 * 2; // 2시간

interface StepData {
  stepNumber: number;
  savedAt: string;
  isCompleted: boolean;
  payload: Record<string, unknown>;
}

interface ProgressData {
  completedSteps: Record<string, boolean>;
  currentStep: number;
  progressPercentage: number;
  totalSteps: number;
  lastUpdatedAt: string;
  completed: boolean;
  estimatedMinutesRemaining?: number;
}

interface SessionDraft {
  lastAutoSavedAt: string;
  payload: Record<string, unknown>;
}

function buildStepKey(userId: string, stepNumber: number): string {
  return `${STEP_PREFIX}:${userId}:${stepNumber}`;
}

function buildProgressKey(userId: string): string {
  return `${PROGRESS_PREFIX}:${userId}`;
}

function buildSessionKey(userId: string): string {
  return `${SESSION_PREFIX}:${userId}`;
}

export async function saveOnboardingStep(
  env: Env,
  userId: string,
  stepNumber: number,
  payload: Record<string, unknown>,
  totalSteps: number,
  estimatedMinutesRemaining?: number
): Promise<void> {
  const stepKey = buildStepKey(userId, stepNumber);
  const nowIso = new Date().toISOString();

  const stepData: StepData = {
    stepNumber,
    savedAt: nowIso,
    isCompleted: true,
    payload
  };

  await env.CACHE.put(stepKey, JSON.stringify(stepData), { expirationTtl: DEFAULT_STEP_TTL });

  await updateOnboardingProgress(env, userId, stepNumber, totalSteps, estimatedMinutesRemaining);
}

export async function getOnboardingStep(
  env: Env,
  userId: string,
  stepNumber: number
): Promise<StepData | null> {
  const raw = await env.CACHE.get(buildStepKey(userId, stepNumber), { type: 'json' }) as StepData | null;
  return raw ?? null;
}

export async function saveOnboardingSessionDraft(
  env: Env,
  userId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const draft: SessionDraft = {
    lastAutoSavedAt: new Date().toISOString(),
    payload
  };

  await env.CACHE.put(buildSessionKey(userId), JSON.stringify(draft), { expirationTtl: SESSION_TTL });
}

export async function getOnboardingSessionDraft(
  env: Env,
  userId: string
): Promise<SessionDraft | null> {
  const raw = await env.CACHE.get(buildSessionKey(userId), { type: 'json' }) as SessionDraft | null;
  return raw ?? null;
}

export async function clearOnboardingState(env: Env, userId: string): Promise<void> {
  const progressKey = buildProgressKey(userId);
  const list = await env.CACHE.list({ prefix: `${STEP_PREFIX}:${userId}` });

  await Promise.all([
    env.CACHE.delete(progressKey),
    env.CACHE.delete(buildSessionKey(userId)),
    ...list.keys.map((key) => env.CACHE.delete(key.name))
  ]);
}

export async function getOnboardingProgress(
  env: Env,
  userId: string,
  totalSteps: number
): Promise<ProgressData> {
  const progressKey = buildProgressKey(userId);
  const raw = await env.CACHE.get(progressKey, { type: 'json' }) as ProgressData | null;

  if (raw) {
    return raw;
  }

  return {
    completedSteps: {},
    currentStep: 1,
    progressPercentage: 0,
    totalSteps,
    lastUpdatedAt: new Date().toISOString(),
    completed: false
  };
}

async function updateOnboardingProgress(
  env: Env,
  userId: string,
  completedStep: number,
  totalSteps: number,
  estimatedMinutesRemaining?: number
): Promise<void> {
  const progressKey = buildProgressKey(userId);
  const current = await getOnboardingProgress(env, userId, totalSteps);

  const completedSteps = { ...current.completedSteps, [`step${completedStep}`]: true };
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercentage = Math.min((completedCount / totalSteps) * 100, 100);

  const progress: ProgressData = {
    completedSteps,
    currentStep: Math.min(completedStep + 1, totalSteps),
    progressPercentage,
    totalSteps,
    lastUpdatedAt: new Date().toISOString(),
    completed: completedCount >= totalSteps,
    estimatedMinutesRemaining
  };

  await env.CACHE.put(progressKey, JSON.stringify(progress), {
    expirationTtl: DEFAULT_STEP_TTL
  });
}
export async function resetOnboardingProgress(env: Env, userId: string, totalSteps: number): Promise<void> {
  const progress: ProgressData = {
    completedSteps: {},
    currentStep: 1,
    progressPercentage: 0,
    totalSteps,
    lastUpdatedAt: new Date().toISOString(),
    completed: false
  };
  await env.CACHE.put(buildProgressKey(userId), JSON.stringify(progress), {
    expirationTtl: DEFAULT_STEP_TTL
  });
}
