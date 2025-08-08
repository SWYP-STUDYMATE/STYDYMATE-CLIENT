import { Hono } from 'hono';
import { Env } from '../index';
import { Variables, LevelTestSubmission, LevelTestResult } from '../types';
import { processAudio, analyzeText, calculateLevel, evaluateLanguageLevel, generateLevelFeedback } from '../services/ai';
import { saveToR2, getFromR2 } from '../services/storage';
import { successResponse, createdResponse, setCacheHeaders } from '../utils/response';
import { validationError, notFoundError } from '../middleware/error-handler';
import { auth } from '../middleware/auth';
import { UserCache, APICache } from '../services/cache';

export const levelTestRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// 테스트 질문 목록
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

// 질문 목록 조회
levelTestRoutes.get('/questions', async (c) => {
  return successResponse(c, {
    questions: TEST_QUESTIONS
  });
});

// 음성 파일 제출
levelTestRoutes.post('/audio', async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;
    const questionId = formData.get('questionId') as string;
    const userId = formData.get('userId') as string;

    if (!audioFile || !questionId || !userId) {
      throw validationError('Missing required fields', {
        audioFile: !audioFile ? 'Audio file is required' : null,
        questionId: !questionId ? 'Question ID is required' : null,
        userId: !userId ? 'User ID is required' : null
      });
    }

    // R2에 오디오 파일 저장
    const audioKey = `level-test/${userId}/${questionId}.webm`;
    const audioBuffer = await audioFile.arrayBuffer();
    await saveToR2(c.env.STORAGE, audioKey, audioBuffer, audioFile.type);

    // Whisper로 음성 인식 (언어 설정 추가)
    const transcription = await processAudio(c.env.AI, audioBuffer, {
      task: 'transcribe',
      language: 'en', // 영어로 고정
      vad_filter: true
    });

    // 결과 캐싱
    const cacheKey = `transcript:${userId}:${questionId}`;
    await c.env.CACHE.put(cacheKey, JSON.stringify({
      transcription,
      timestamp: new Date().toISOString()
    }), { expirationTtl: 86400 }); // 24시간 캐시

    return successResponse(c, {
      questionId,
      transcription,
      audioUrl: `/api/v1/level-test/audio/${userId}/${questionId}`
    });
  } catch (error) {
    console.error('Audio processing error:', error);
    return c.json({ error: 'Failed to process audio' }, 500);
  }
});

// AI 분석 요청 (개선된 버전)
levelTestRoutes.post('/analyze', async (c) => {
  try {
    const { userId, responses } = await c.req.json();

    if (!userId || !responses || !Array.isArray(responses)) {
      return c.json({ error: 'Invalid request data' }, 400);
    }

    // 레벨테스트 질문들
    const questions = [
      "Introduce yourself and tell me about your background.",
      "What are your hobbies and why do you enjoy them?",
      "Describe your typical day from morning to evening.",
      "What are your future goals and how do you plan to achieve them?"
    ];

    // 각 응답에 대한 개별 평가
    const evaluations = await Promise.all(
      responses.map(async (r: any, index: number) => {
        const cacheKey = `transcript:${userId}:${r.questionId}`;
        const cached = await c.env.CACHE.get(cacheKey);

        if (!cached) return null;

        const { transcription } = JSON.parse(cached);
        const question = questions[index] || questions[0];

        // 개별 응답 평가
        const evaluation = await evaluateLanguageLevel(
          c.env.AI,
          transcription.text || '',
          question
        );

        return {
          questionId: r.questionId,
          question,
          transcription: transcription.text,
          evaluation
        };
      })
    );

    // 유효한 평가만 필터링
    const validEvaluations = evaluations.filter(e => e !== null);

    // 전체 점수 계산
    const totalScores = {
      grammar: 0,
      vocabulary: 0,
      fluency: 0,
      taskAchievement: 0,
      communication: 0
    };

    validEvaluations.forEach(eval => {
      if (eval?.evaluation.scores) {
        totalScores.grammar += eval.evaluation.scores.grammar || 0;
        totalScores.vocabulary += eval.evaluation.scores.vocabulary || 0;
        totalScores.fluency += eval.evaluation.scores.fluency || 0;
        totalScores.taskAchievement += eval.evaluation.scores.taskAchievement || 0;
        totalScores.communication += eval.evaluation.scores.communication || 0;
      }
    });

    // 평균 점수 계산
    const avgScores = {
      grammar: Math.round(totalScores.grammar / validEvaluations.length),
      vocabulary: Math.round(totalScores.vocabulary / validEvaluations.length),
      fluency: Math.round(totalScores.fluency / validEvaluations.length),
      taskAchievement: Math.round(totalScores.taskAchievement / validEvaluations.length),
      communication: Math.round(totalScores.communication / validEvaluations.length)
    };

    // 최종 레벨 결정
    const avgScore = Object.values(avgScores).reduce((a, b) => a + b, 0) / 5;
    let finalLevel: string;

    if (avgScore >= 90) finalLevel = 'C2';
    else if (avgScore >= 80) finalLevel = 'C1';
    else if (avgScore >= 70) finalLevel = 'B2';
    else if (avgScore >= 60) finalLevel = 'B1';
    else if (avgScore >= 50) finalLevel = 'A2';
    else finalLevel = 'A1';

    // 결과 저장
    const resultKey = `level-test-result:${userId}`;
    const result = {
      level: finalLevel,
      scores: avgScores,
      evaluations: validEvaluations,
      feedback: validEvaluations.map(e => e?.evaluation.feedback).join('\n\n'),
      suggestions: validEvaluations.flatMap(e => e?.evaluation.suggestions || []),
      timestamp: new Date().toISOString()
    };

    await c.env.CACHE.put(resultKey, JSON.stringify(result), {
      expirationTtl: 2592000 // 30일 캐시
    });

    return c.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({ error: 'Failed to analyze responses' }, 500);
  }
});

// 결과 조회
levelTestRoutes.get('/result/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const resultKey = `level-test-result:${userId}`;

    const cached = await c.env.CACHE.get(resultKey);
    if (!cached) {
      return c.json({ error: 'Result not found' }, 404);
    }

    const result = JSON.parse(cached);
    return c.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Result retrieval error:', error);
    return c.json({ error: 'Failed to retrieve result' }, 500);
  }
});

// 오디오 파일 다운로드
levelTestRoutes.get('/audio/:userId/:questionId', async (c) => {
  try {
    const { userId, questionId } = c.req.param();
    const audioKey = `level-test/${userId}/${questionId}.webm`;

    const audioData = await getFromR2(c.env.STORAGE, audioKey);
    if (!audioData) {
      return c.json({ error: 'Audio not found' }, 404);
    }

    return new Response(audioData.body, {
      headers: {
        'Content-Type': audioData.httpMetadata?.contentType || 'audio/webm',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Audio retrieval error:', error);
    return c.json({ error: 'Failed to retrieve audio' }, 500);
  }
});

// 개별 질문 제출 (새로운 엔드포인트)
levelTestRoutes.post('/submit', async (c) => {
  try {
    const formData = await c.req.formData();
    const audio = formData.get('audio') as File;
    const questionNumber = formData.get('questionNumber') as string;
    const userId = formData.get('userId') as string;

    if (!audio || !questionNumber || !userId) {
      throw validationError('Missing required fields');
    }

    const qNum = parseInt(questionNumber);
    if (qNum < 1 || qNum > TEST_QUESTIONS.length) {
      throw validationError('Invalid question number');
    }

    // R2에 오디오 파일 저장
    const audioKey = `level-test/${userId}/question_${qNum}.webm`;
    const audioBuffer = await audio.arrayBuffer();
    await saveToR2(c.env.STORAGE, audioKey, audioBuffer, audio.type);

    // Whisper로 음성 인식
    const transcription = await processAudio(c.env.AI, audioBuffer, {
      task: 'transcribe',
      language: 'en',
      vad_filter: true,
      initial_prompt: TEST_QUESTIONS[qNum - 1].text
    });

    // 임시 저장
    const progressKey = `level-test-progress:${userId}`;
    const progress = await c.env.CACHE.get(progressKey);
    const progressData = progress ? JSON.parse(progress) : { answers: [] };

    progressData.answers[qNum - 1] = {
      questionNumber: qNum,
      audioKey,
      transcription: transcription.text,
      timestamp: new Date().toISOString()
    };

    await c.env.CACHE.put(progressKey, JSON.stringify(progressData), {
      expirationTtl: 86400 // 24시간
    });

    return successResponse(c, {
      questionNumber: qNum,
      transcription: transcription.text,
      saved: true
    });
  } catch (error) {
    console.error('Submit error:', error);
    return c.json({ error: 'Failed to submit answer' }, 500);
  }
});

// 테스트 완료 및 평가 (새로운 엔드포인트)
levelTestRoutes.post('/complete', async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      throw validationError('User ID is required');
    }

    // 진행 상황 가져오기
    const progressKey = `level-test-progress:${userId}`;
    const progress = await c.env.CACHE.get(progressKey);

    if (!progress) {
      throw validationError('No test data found');
    }

    const progressData = JSON.parse(progress);
    const answers = progressData.answers || [];

    if (answers.length < 2) {
      throw validationError('Insufficient answers for evaluation');
    }

    // 각 답변 평가
    const evaluations = await Promise.all(
      answers.map(async (answer: any) => {
        if (!answer || !answer.transcription) return null;

        const question = TEST_QUESTIONS[answer.questionNumber - 1];
        const evaluation = await evaluateLanguageLevel(
          c.env.AI,
          answer.transcription,
          question.text
        );

        return {
          questionNumber: answer.questionNumber,
          question: question.text,
          transcription: answer.transcription,
          evaluation,
          difficulty: question.difficulty
        };
      })
    );

    // 유효한 평가만 필터링
    const validEvaluations = evaluations.filter(e => e !== null);

    // 점수 계산
    const scoreCategories = ['pronunciation', 'fluency', 'grammar', 'vocabulary', 'coherence', 'interaction'];
    const totalScores: Record<string, number> = {};

    scoreCategories.forEach(category => {
      totalScores[category] = 0;
    });

    validEvaluations.forEach(evaluation => {
      if (evaluation?.evaluation.scores) {
        scoreCategories.forEach(category => {
          totalScores[category] += evaluation.evaluation.scores[category] || 0;
        });
      }
    });

    // 평균 점수
    const avgScores: Record<string, number> = {};
    scoreCategories.forEach(category => {
      avgScores[category] = Math.round(totalScores[category] / validEvaluations.length);
    });

    // 전체 평균
    const overallScore = Math.round(
      Object.values(avgScores).reduce((a, b) => a + b, 0) / scoreCategories.length
    );

    // CEFR 레벨 결정
    let level: string;
    if (overallScore >= 85) level = 'C2';
    else if (overallScore >= 75) level = 'C1';
    else if (overallScore >= 65) level = 'B2';
    else if (overallScore >= 55) level = 'B1';
    else if (overallScore >= 45) level = 'A2';
    else level = 'A1';

    // LLM으로 상세 피드백 생성
    const feedbackResponse = await generateLevelFeedback(
      c.env.AI,
      {
        grammar: avgScores.grammar || 0,
        vocabulary: avgScores.vocabulary || 0,
        fluency: avgScores.fluency || 0,
        pronunciation: avgScores.pronunciation || 0,
        taskAchievement: avgScores.coherence || 0,
        interaction: avgScores.interaction || 0
      },
      level as any
    );

    // 강점과 개선점
    const strengths = [];
    const improvements = [];

    Object.entries(avgScores).forEach(([category, score]) => {
      if (score >= 70) {
        strengths.push(`Strong ${category} skills`);
      } else if (score < 50) {
        improvements.push(`Focus on improving ${category}`);
      }
    });

    // 결과 저장
    const result = {
      userId,
      level,
      overallScore,
      scores: avgScores,
      strengths,
      improvements,
      feedback: feedbackResponse,
      evaluations: validEvaluations,
      timestamp: new Date().toISOString()
    };

    // 결과 캐시
    const resultKey = `level-test-result:${userId}`;
    await c.env.CACHE.put(resultKey, JSON.stringify(result), {
      expirationTtl: 2592000 // 30일
    });

    // 진행 상황 삭제
    await c.env.CACHE.delete(progressKey);

    return successResponse(c, result);
  } catch (error) {
    console.error('Complete error:', error);
    return c.json({
      error: 'Failed to complete test',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// 테스트 진행 상황 조회
levelTestRoutes.get('/progress/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const progressKey = `level-test-progress:${userId}`;

    const progress = await c.env.CACHE.get(progressKey);
    if (!progress) {
      return successResponse(c, {
        userId,
        completedQuestions: 0,
        totalQuestions: TEST_QUESTIONS.length,
        answers: []
      });
    }

    const progressData = JSON.parse(progress);
    const completedQuestions = progressData.answers?.filter((a: any) => a !== null).length || 0;

    return successResponse(c, {
      userId,
      completedQuestions,
      totalQuestions: TEST_QUESTIONS.length,
      answers: progressData.answers || []
    });
  } catch (error) {
    console.error('Progress error:', error);
    return c.json({ error: 'Failed to get progress' }, 500);
  }
});

// 전체 테스트 제출 (기존 엔드포인트 - 백업용)
levelTestRoutes.post('/submit-all', async (c) => {
  try {
    const formData = await c.req.formData();
    const userInfo = formData.get('userInfo');
    const userId = userInfo ? JSON.parse(userInfo as string).userId : crypto.randomUUID();

    const audioFiles: { questionNumber: number; file: File }[] = [];

    // 모든 오디오 파일 수집
    for (let i = 1; i <= 4; i++) {
      const audioFile = formData.get(`audio_${i}`) as File;
      if (audioFile) {
        audioFiles.push({ questionNumber: i, file: audioFile });
      }
    }

    if (audioFiles.length === 0) {
      throw validationError('No audio files provided');
    }

    // 각 오디오 파일 처리 및 분석
    const analyses = await Promise.all(
      audioFiles.map(async ({ questionNumber, file }) => {
        try {
          // R2에 저장
          const audioKey = `level-test/${userId}/question_${questionNumber}.webm`;
          const audioBuffer = await file.arrayBuffer();
          await saveToR2(c.env.STORAGE, audioKey, audioBuffer, file.type);

          // Whisper로 음성 인식
          const transcription = await processAudio(c.env.AI, audioBuffer, {
            task: 'transcribe',
            language: 'en',
            vad_filter: true
          });

          // 해당 질문에 대한 평가
          const question = TEST_QUESTIONS[questionNumber - 1];
          const evaluation = await evaluateLanguageLevel(
            c.env.AI,
            transcription.text || '',
            question.text
          );

          return {
            questionNumber,
            question: question.text,
            transcription: transcription.text,
            evaluation
          };
        } catch (error) {
          console.error(`Error processing question ${questionNumber}:`, error);
          return null;
        }
      })
    );

    // 유효한 분석만 필터링
    const validAnalyses = analyses.filter(a => a !== null);

    if (validAnalyses.length === 0) {
      throw new Error('Failed to analyze any audio files');
    }

    // 전체 점수 계산
    const scoreCategories = ['pronunciation', 'fluency', 'grammar', 'vocabulary', 'coherence', 'interaction'];
    const totalScores: Record<string, number> = {};

    scoreCategories.forEach(category => {
      totalScores[category] = 0;
    });

    validAnalyses.forEach(analysis => {
      if (analysis?.evaluation.scores) {
        scoreCategories.forEach(category => {
          totalScores[category] += analysis.evaluation.scores[category] || 0;
        });
      }
    });

    // 평균 점수 계산
    const avgScores: Record<string, number> = {};
    scoreCategories.forEach(category => {
      avgScores[category] = Math.round(totalScores[category] / validAnalyses.length);
    });

    // 전체 평균
    const overallScore = Math.round(
      Object.values(avgScores).reduce((a, b) => a + b, 0) / scoreCategories.length
    );

    // CEFR 레벨 결정
    let level: string;
    if (overallScore >= 85) level = 'C2';
    else if (overallScore >= 75) level = 'C1';
    else if (overallScore >= 65) level = 'B2';
    else if (overallScore >= 55) level = 'B1';
    else if (overallScore >= 45) level = 'A2';
    else level = 'A1';

    // 강점과 개선점 도출
    const strengths = [];
    const improvements = [];

    Object.entries(avgScores).forEach(([category, score]) => {
      if (score >= 70) {
        strengths.push(`Strong ${category} skills`);
      } else if (score < 50) {
        improvements.push(`Focus on improving ${category}`);
      }
    });

    // 피드백 생성
    const feedback = `Your English level is assessed as ${level}. ${overallScore >= 65 ? 'You demonstrate good command of English with' : 'You show developing English skills with'} an overall score of ${overallScore}/100. ${strengths.length > 0 ? `Your strengths include: ${strengths.join(', ')}.` : ''} ${improvements.length > 0 ? `Areas for improvement: ${improvements.join(', ')}.` : ''}`;

    // 결과 저장
    const result = {
      userId,
      level,
      overallScore,
      scores: avgScores,
      strengths,
      improvements,
      feedback,
      analyses: validAnalyses,
      timestamp: new Date().toISOString()
    };

    // 캐시에 저장
    const resultKey = `level-test-result:${userId}`;
    await c.env.CACHE.put(resultKey, JSON.stringify(result), {
      expirationTtl: 2592000 // 30일
    });

    return successResponse(c, result);
  } catch (error) {
    console.error('Test submission error:', error);
    return c.json({
      error: 'Failed to submit test',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});