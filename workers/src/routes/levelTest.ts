import { Hono } from 'hono';
import { Env } from '../index';
import { processAudio, analyzeText, calculateLevel, evaluateLanguageLevel } from '../services/ai';
import { saveToR2, getFromR2 } from '../services/storage';

export const levelTestRoutes = new Hono<{ Bindings: Env }>();

// 음성 파일 제출
levelTestRoutes.post('/audio', async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;
    const questionId = formData.get('questionId') as string;
    const userId = formData.get('userId') as string;

    if (!audioFile || !questionId || !userId) {
      return c.json({ error: 'Missing required fields' }, 400);
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

    return c.json({
      success: true,
      questionId,
      transcription,
      audioUrl: `/api/level-test/audio/${userId}/${questionId}`
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