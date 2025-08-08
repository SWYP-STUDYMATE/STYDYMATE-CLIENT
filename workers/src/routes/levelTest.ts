import { Hono } from 'hono';
import { Env } from '../index';
import { processAudio, analyzeText, calculateLevel } from '../services/ai';
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

    // Whisper로 음성 인식
    const transcription = await processAudio(c.env.AI, audioBuffer);

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

// AI 분석 요청
levelTestRoutes.post('/analyze', async (c) => {
  try {
    const { userId, responses } = await c.req.json();

    if (!userId || !responses || !Array.isArray(responses)) {
      return c.json({ error: 'Invalid request data' }, 400);
    }

    // 모든 응답 텍스트 수집
    const allTranscripts = await Promise.all(
      responses.map(async (r: any) => {
        const cacheKey = `transcript:${userId}:${r.questionId}`;
        const cached = await c.env.CACHE.get(cacheKey);
        return cached ? JSON.parse(cached).transcription : '';
      })
    );

    // AI로 텍스트 분석
    const analysis = await analyzeText(c.env.AI, allTranscripts.join(' '));
    
    // CEFR 레벨 계산
    const level = calculateLevel(analysis);

    // 결과 저장
    const resultKey = `level-test-result:${userId}`;
    await c.env.CACHE.put(resultKey, JSON.stringify({
      level,
      analysis,
      timestamp: new Date().toISOString()
    }), { expirationTtl: 2592000 }); // 30일 캐시

    return c.json({
      success: true,
      level,
      analysis
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