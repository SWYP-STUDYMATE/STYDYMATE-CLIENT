import { Hono } from 'hono';
import type { Env } from '../index';
import type { Variables } from '../types';
import { auth as authMiddleware } from '../middleware/auth';
import { AppError } from '../utils/errors';
import { successResponse } from '../utils/response';
import { performComprehensivePronunciationEvaluation } from '../services/pronunciationEvaluation';
import { processAudio } from '../services/ai';

const pronunciationRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

const requireAuth = authMiddleware();

pronunciationRoutes.use('*', requireAuth);

/**
 * POST /api/v1/pronunciation/evaluate
 * 음성 파일을 업로드하여 종합 발음 평가 수행
 *
 * Request:
 * - audio: File (음성 파일)
 * - targetLanguage: string (옵션, 기본값: 'English')
 * - text: string (옵션, 읽은 텍스트 - 비교용)
 *
 * Response:
 * - transcription: string
 * - evaluation: ComprehensivePronunciationEvaluation
 */
pronunciationRoutes.post('/evaluate', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');

  try {
    // Multipart form data 파싱
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;
    const targetLanguage = (formData.get('targetLanguage') as string) || 'English';
    const expectedText = formData.get('text') as string | null;

    if (!audioFile) {
      throw new AppError('Audio file is required', 400, 'MISSING_AUDIO');
    }

    // 음성 파일을 ArrayBuffer로 변환
    const audioBuffer = await audioFile.arrayBuffer();

    // Whisper로 음성 인식
    const transcription = await processAudio(c.env.AI, audioBuffer, {
      language: targetLanguage.toLowerCase() === 'english' ? 'en' :
                targetLanguage.toLowerCase() === 'korean' ? 'ko' : undefined
    });

    if (!transcription?.text) {
      throw new AppError('Failed to transcribe audio', 500, 'TRANSCRIPTION_FAILED');
    }

    // 종합 발음 평가 수행
    const evaluation = await performComprehensivePronunciationEvaluation(
      c.env.AI,
      transcription.text,
      targetLanguage
    );

    return successResponse(c, {
      transcription: transcription.text,
      expectedText: expectedText || null,
      evaluation
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      error instanceof Error ? error.message : 'Pronunciation evaluation failed',
      500,
      'PRONUNCIATION_EVAL_FAILED'
    );
  }
});

/**
 * POST /api/v1/pronunciation/evaluate-text
 * 텍스트 전사를 기반으로 발음 평가 수행
 * (음성 파일 없이 텍스트만으로 평가 - 테스트용)
 *
 * Request:
 * - transcription: string (음성 전사 텍스트)
 * - targetLanguage: string (옵션, 기본값: 'English')
 *
 * Response:
 * - evaluation: ComprehensivePronunciationEvaluation
 */
pronunciationRoutes.post('/evaluate-text', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');

  try {
    const body = await c.req.json();

    if (!body.transcription || typeof body.transcription !== 'string') {
      throw new AppError('Transcription text is required', 400, 'MISSING_TRANSCRIPTION');
    }

    const targetLanguage = body.targetLanguage || 'English';

    // 종합 발음 평가 수행
    const evaluation = await performComprehensivePronunciationEvaluation(
      c.env.AI,
      body.transcription,
      targetLanguage
    );

    return successResponse(c, {
      transcription: body.transcription,
      evaluation
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      error instanceof Error ? error.message : 'Pronunciation evaluation failed',
      500,
      'PRONUNCIATION_EVAL_FAILED'
    );
  }
});

/**
 * GET /api/v1/pronunciation/phonemes/:language
 * 특정 언어의 주요 음소 목록 및 연습 가이드 제공
 *
 * Response:
 * - language: string
 * - phonemes: Array<{ symbol: string, description: string, examples: string[] }>
 */
pronunciationRoutes.get('/phonemes/:language', async (c) => {
  const userId = c.get('userId');
  if (!userId) throw new AppError('User not found in context', 500, 'CONTEXT_MISSING_USER');

  const language = c.req.param('language');

  // 주요 언어별 음소 가이드 (간단한 예시)
  const phonemeGuides: Record<string, any> = {
    english: {
      language: 'English',
      phonemes: [
        {
          symbol: 'θ',
          description: 'Voiceless dental fricative (as in "think")',
          examples: ['think', 'ث', 'thank', 'three'],
          tips: 'Place tongue between teeth and blow air'
        },
        {
          symbol: 'ð',
          description: 'Voiced dental fricative (as in "this")',
          examples: ['this', 'that', 'they', 'though'],
          tips: 'Like θ but with voice'
        },
        {
          symbol: 'r',
          description: 'Alveolar approximant',
          examples: ['red', 'right', 'royal', 'around'],
          tips: 'Curl tongue slightly back, do not trill'
        },
        {
          symbol: 'l',
          description: 'Alveolar lateral approximant',
          examples: ['light', 'love', 'full', 'all'],
          tips: 'Touch tongue to alveolar ridge'
        }
      ]
    },
    korean: {
      language: 'Korean',
      phonemes: [
        {
          symbol: 'ㄱ/ㅋ/ㄲ',
          description: 'Plain/Aspirated/Tense k sounds',
          examples: ['가다', '카드', '까다'],
          tips: 'Distinguish between plain, aspirated, and tense'
        }
      ]
    }
  };

  const guide = phonemeGuides[language.toLowerCase()];

  if (!guide) {
    throw new AppError('Phoneme guide not available for this language', 404, 'LANGUAGE_NOT_SUPPORTED');
  }

  return successResponse(c, guide);
});

export default pronunciationRoutes;
