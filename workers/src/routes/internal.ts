import { Hono } from 'hono';
import type { AppBindings as Env } from '../index';
import { Variables } from '../types';
import { evaluateLanguageLevel, generateLevelFeedback, generateChatCompletion, sanitizeJsonResponse } from '../services/ai';
import { successResponse, createdResponse } from '../utils/response';
import { validationError } from '../middleware/error-handler';
import { internalAuth } from '../middleware/auth';
import { log } from '../utils/logger';
import { selectWhisperModel, validateAudioSize, WHISPER_FILE_LIMITS } from '../constants/whisper';
import { getActiveRooms, upsertActiveRoom } from '../utils/activeRooms';

export const internalRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// 모든 내부 API는 Internal Secret 인증 필요
internalRoutes.use('*', internalAuth());

// Spring Boot 서버용 음성 전사 엔드포인트
internalRoutes.post('/transcribe', async (c) => {
  try {
    const body = await c.req.json();
    const { audio_url, audio_base64, language, user_context } = body;

    let audioBuffer: ArrayBuffer;

    if (audio_url) {
      // URL에서 오디오 다운로드
      const response = await fetch(audio_url);
      if (!response.ok) {
        return c.json({ error: 'Failed to fetch audio from URL' }, 400);
      }
      audioBuffer = await response.arrayBuffer();
    } else if (audio_base64) {
      // Base64 디코딩
      const binaryString = atob(audio_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      audioBuffer = bytes.buffer;
    } else {
      return c.json({ error: 'Either audio_url or audio_base64 must be provided' }, 400);
    }

    // 오디오 크기 검증
    const sizeValidation = validateAudioSize(audioBuffer.byteLength);
    if (!sizeValidation.isValid) {
      return c.json({
        error: 'Audio file too large',
        message: sizeValidation.message,
        details: {
          currentSize: audioBuffer.byteLength,
          maxSize: WHISPER_FILE_LIMITS.MAX_SIZE,
          recommendedSize: WHISPER_FILE_LIMITS.RECOMMENDED_SIZE
        }
      }, 400);
    }

    // 크기 경고 로깅
    if (!sizeValidation.isOptimal) {
      const warningMessage = sizeValidation.message || 'Audio file size exceeds recommended threshold';
      log.warn(warningMessage, undefined, {
        component: 'INTERNAL_API',
        audioSize: audioBuffer.byteLength
      });
    }

    // Whisper API 호출
    let result;
    try {
      // 2025년 Cloudflare Whisper API 형식:
      // ArrayBuffer -> Uint8Array -> spread into array
      const audioArray = [...new Uint8Array(audioBuffer)];

      // 언어별 모델 선택
      const modelSelection = selectWhisperModel(language);

      log.info('Processing audio for transcription', undefined, {
        component: 'INTERNAL_API',
        audioSize: audioBuffer.byteLength,
        arrayLength: audioArray.length,
        language: language || 'auto',
        model: modelSelection.model,
        languageName: modelSelection.languageName
      });

      type WhisperResponseShape = {
        text?: string;
        language?: string;
        vtt?: unknown;
        words?: any[];
      };

      const whisperResponse = await c.env.AI.run(modelSelection.model as any, {
        audio: audioArray
      }) as WhisperResponseShape;

      result = {
        text: whisperResponse?.text || '',
        language: whisperResponse?.language || language || 'unknown',
        vtt: whisperResponse?.vtt,
        words: whisperResponse?.words
      };

      log.info('Transcription successful', undefined, {
        component: 'INTERNAL_API',
        textLength: result.text.length,
        detectedLanguage: result.language
      });

    } catch (whisperError) {
      log.error('Whisper processing error', whisperError instanceof Error ? whisperError : new Error(String(whisperError)), undefined, {
        component: 'INTERNAL_API',
        audioSize: audioBuffer.byteLength,
        error: whisperError instanceof Error ? whisperError.message : 'Unknown error'
      });

      // 에러 발생 시 상세 정보 반환
      return c.json({
        error: 'Transcription failed',
        message: whisperError instanceof Error ? whisperError.message : 'Unknown error',
        details: {
          audioSize: audioBuffer.byteLength,
          maxAllowedSize: WHISPER_FILE_LIMITS.MAX_SIZE
        }
      }, 500);
    }

    return successResponse(c, {
      transcript: result.text || '',
      language: result.language,
      confidence: 1.0, // Whisper doesn't provide confidence scores
      word_count: result.text ? result.text.split(/\s+/).filter(word => word.length > 0).length : 0,
      processing_time: 0, // Would need to measure actual processing time
      vtt: result.vtt,
      words: result.words,
      user_context: user_context || null
    });

  } catch (error) {
    log.error('Internal transcription error', error as Error, undefined, { component: 'INTERNAL_API' });
    return c.json({
      error: 'Transcription failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Spring Boot 서버용 레벨 테스트 평가 엔드포인트
internalRoutes.post('/level-test', async (c) => {
  try {
    const body = await c.req.json();
    const { transcript, language, questions, user_context } = body;

    if (!transcript) {
      return c.json({ error: 'Transcript is required' }, 400);
    }

    // AI를 사용해 레벨 평가
    const evaluation = await evaluateLanguageLevel(
      c.env.AI,
      transcript,
      questions || "Please introduce yourself and talk about your interests."
    );

    return successResponse(c, {
      evaluation: evaluation,
      analyzed_text: transcript,
      language: language || 'en',
      user_context: user_context || null,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    log.error('Internal level test error', error as Error, { component: 'INTERNAL_API' });
    return c.json({
      error: 'Level test evaluation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// WebRTC 룸 메타데이터 동기화
internalRoutes.patch('/webrtc/rooms/:roomId/metadata', async (c) => {
  const roomId = c.req.param('roomId');

  if (!roomId) {
    return c.json({ error: 'roomId is required' }, 400);
  }

  try {
    const metadata = await c.req.json() as Record<string, unknown>;

    if (!metadata || typeof metadata !== 'object') {
      return c.json({ error: 'metadata object is required' }, 400);
    }

    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);

    const response = await room.fetch(new Request('http://room/metadata', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    }));

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
      return c.json({
        error: 'Failed to update metadata',
        details: errorBody?.message || null
      }, response.status as any);
    }

    // Update cached summary
    const cacheKey = `room:${roomId}`;
    const cached = await c.env.CACHE.get(cacheKey);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const updated = {
          ...cachedData,
          metadata: {
            ...(cachedData.metadata || {}),
            ...metadata
          }
        };
        await c.env.CACHE.put(cacheKey, JSON.stringify(updated), { expirationTtl: 3600 });
      } catch (cacheError) {
        log.warn('Failed to update cached room metadata', undefined, {
          component: 'INTERNAL_API',
          roomId,
          error: cacheError instanceof Error ? cacheError.message : String(cacheError)
        });
      }
    }

    // Ensure active room cache is refreshed
    const activeRooms = await getActiveRooms(c.env.CACHE);
    const index = activeRooms.findIndex(room => room.roomId === roomId);
    if (index >= 0) {
      const updatedRoom = {
        ...activeRooms[index],
        metadata: {
          ...(activeRooms[index].metadata || {}),
          ...metadata
        },
        updatedAt: new Date().toISOString()
      };
      await upsertActiveRoom(c.env.CACHE, updatedRoom);
    }

    const result = await response.json().catch(() => ({ success: true }));
    return successResponse(c, result);
  } catch (error) {
    log.error('WebRTC metadata sync error', error as Error, undefined, { component: 'INTERNAL_API', roomId });
    return c.json({
      error: 'Failed to sync metadata',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Spring Boot 서버용 대화 피드백 엔드포인트
internalRoutes.post('/conversation-feedback', async (c) => {
  try {
    const body = await c.req.json();
    const { transcript, context, user_level, user_context } = body;

    if (!transcript) {
      return c.json({ error: 'Transcript is required' }, 400);
    }

    // 단일 발화를 대화 형식으로 변환
    const conversation = [
      {
        speaker: 'user',
        text: transcript
      }
    ];

    // LLM으로 피드백 생성
    const prompt = `Analyze this English conversation and provide detailed feedback:

Context: ${context || 'General conversation'}
User Level: ${user_level || 'Unknown'}

Conversation:
User: ${transcript}

Provide comprehensive feedback in JSON format:
{
  "overallAssessment": "general assessment of the conversation",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "corrections": [
    {
      "original": "incorrect phrase",
      "correction": "corrected phrase",
      "explanation": "why this correction is needed"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "encouragement": "positive feedback message",
  "fluencyScore": 75
}`;

    const aiResponse = await generateChatCompletion(c.env.AI, [
      {
        role: 'system',
        content: 'You are an experienced English conversation coach. Always respond with valid JSON.'
      },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.4,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    let feedback;
    try {
      const sanitized = sanitizeJsonResponse(aiResponse.text);
      feedback = JSON.parse(sanitized);
    } catch (parseError) {
      log.warn('Conversation feedback parse error', undefined, {
        component: 'INTERNAL_API',
        rawPreview: aiResponse.text?.slice(0, 500),
        sanitizedPreview: sanitizeJsonResponse(aiResponse.text)?.slice(0, 500),
        errorMessage: parseError instanceof Error ? parseError.message : String(parseError),
        model: aiResponse.model
      });
      // JSON 파싱 실패 시 기본 구조 반환
      feedback = {
        overallAssessment: "The conversation shows your effort to communicate in English.",
        strengths: ["Shows willingness to practice English"],
        weaknesses: ["Could benefit from more practice"],
        corrections: [],
        suggestions: ["Continue practicing regularly", "Focus on clear pronunciation"],
        encouragement: "Keep practicing! You're making progress.",
        fluencyScore: 70
      };
    }

    return successResponse(c, {
      feedback: feedback,
      analyzed_text: transcript,
      context: context || 'general',
      user_level: user_level || 'unknown',
      user_context: user_context || null,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    log.error('Internal conversation feedback error', error as Error, undefined, { component: 'INTERNAL_API' });
    return c.json({
      error: 'Conversation feedback generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Spring Boot 서버용 학습 추천 엔드포인트 (AI 없이 정적)
internalRoutes.post('/learning-recommendations', async (c) => {
  try {
    const body = await c.req.json();
    const { user_level, weaknesses, strengths, user_context } = body;

    // 레벨별 추천 콘텐츠 생성
    const recommendations = generateStaticRecommendations(user_level, weaknesses);

    return successResponse(c, {
      recommendations: recommendations,
      user_level: user_level || 'B1',
      based_on_weaknesses: weaknesses || [],
      based_on_strengths: strengths || [],
      user_context: user_context || null,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    log.error('Internal learning recommendations error', error as Error, undefined, { component: 'INTERNAL_API' });
    return c.json({
      error: 'Learning recommendations generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// 정적 학습 추천 생성 함수
function generateStaticRecommendations(userLevel: string, weaknesses: string[]) {
  const levelContent: Record<string, any> = {
    'A1': {
      contents: [
        'Basic vocabulary flashcards (colors, numbers, family)',
        'Simple conversation dialogues',
        'English learning apps for beginners',
        'Children\'s English books'
      ],
      exercises: [
        'Daily greeting practice',
        'Basic sentence construction',
        'Pronunciation drills for common words',
        'Simple Q&A practice'
      ],
      timePerDay: '15-20 minutes'
    },
    'A2': {
      contents: [
        'Elementary reading passages',
        'Basic grammar workbooks',
        'English learning videos for beginners',
        'Simple news articles'
      ],
      exercises: [
        'Present and past tense practice',
        'Describing daily activities',
        'Basic conversation scenarios',
        'Listening to slow English podcasts'
      ],
      timePerDay: '20-30 minutes'
    },
    'B1': {
      contents: [
        'Intermediate reading materials',
        'English podcasts for learners',
        'Grammar reference books',
        'English news articles'
      ],
      exercises: [
        'Conversation role-play scenarios',
        'Grammar pattern drills',
        'Writing short paragraphs',
        'Listening comprehension practice'
      ],
      timePerDay: '30-45 minutes'
    },
    'B2': {
      contents: [
        'Advanced reading materials',
        'TED talks and presentations',
        'English novels and literature',
        'Professional English materials'
      ],
      exercises: [
        'Debate and discussion practice',
        'Academic writing exercises',
        'Business English conversations',
        'Complex listening materials'
      ],
      timePerDay: '45-60 minutes'
    },
    'C1': {
      contents: [
        'Advanced literature excerpts',
        'Native speaker podcasts',
        'Academic papers and articles',
        'Professional development materials'
      ],
      exercises: [
        'Advanced debate topics',
        'Professional presentation practice',
        'Academic writing and research',
        'Nuanced language practice'
      ],
      timePerDay: '60+ minutes'
    },
    'C2': {
      contents: [
        'Native-level literature',
        'Specialized academic content',
        'Professional publications',
        'Cultural and historical materials'
      ],
      exercises: [
        'Advanced writing and editing',
        'Teaching and mentoring others',
        'Professional presentations',
        'Creative language use'
      ],
      timePerDay: '60+ minutes'
    }
  };

  const level = userLevel.toUpperCase();
  const baseRecommendations = levelContent[level] || levelContent['B1'];

  // 약점에 따른 추가 추천
  const weaknessRecommendations: Record<string, string[]> = {
    'grammar': [
      'Focus on grammar exercises and rules',
      'Use grammar checking tools',
      'Practice sentence construction'
    ],
    'vocabulary': [
      'Expand vocabulary with themed word lists',
      'Use spaced repetition flashcards',
      'Read extensively in your interest areas'
    ],
    'pronunciation': [
      'Practice with pronunciation apps',
      'Record yourself speaking',
      'Listen to native speakers carefully'
    ],
    'fluency': [
      'Practice speaking regularly',
      'Join conversation groups',
      'Think in English daily'
    ]
  };

  let additionalSuggestions: string[] = [];
  weaknesses.forEach(weakness => {
    const suggestions = weaknessRecommendations[weakness.toLowerCase()];
    if (suggestions) {
      additionalSuggestions = additionalSuggestions.concat(suggestions);
    }
  });

  return {
    recommendedContents: baseRecommendations.contents,
    practiceExercises: baseRecommendations.exercises,
    estimatedTimePerDay: baseRecommendations.timePerDay,
    focusAreas: weaknesses,
    additionalSuggestions: additionalSuggestions,
    nextLevelGoals: getNextLevelGoals(level)
  };
}

function getNextLevelGoals(currentLevel: string): string[] {
  const goals: Record<string, string[]> = {
    'A1': ['Master basic grammar patterns', 'Build core vocabulary (500-1000 words)', 'Have simple conversations'],
    'A2': ['Use past and future tenses confidently', 'Describe experiences and events', 'Understand simple texts'],
    'B1': ['Express opinions and preferences', 'Handle routine tasks requiring English', 'Understand main ideas of complex texts'],
    'B2': ['Discuss abstract topics', 'Write clear, detailed text', 'Interact fluently with native speakers'],
    'C1': ['Use language flexibly for social and professional purposes', 'Write well-structured, detailed text', 'Understand virtually everything'],
    'C2': ['Express yourself spontaneously and precisely', 'Understand everything with ease', 'Summarize and argue effectively']
  };

  return goals[currentLevel] || goals['B1'];
}

export default internalRoutes;
