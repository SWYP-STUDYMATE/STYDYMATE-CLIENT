import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: Env }>();

// CORS 설정
app.use('/*', cors());

// 텍스트 생성 엔드포인트
app.post('/generate', async (c) => {
  try {
    const body = await c.req.json<{
      prompt?: string;
      messages?: Array<{ role: string; content: string }>;
      model?: string;
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
      system?: string;
    }>();

    const model = body.model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
    
    // 메시지 형식 준비
    let messages;
    if (body.messages) {
      messages = body.messages;
    } else if (body.prompt) {
      messages = [
        { role: 'system', content: body.system || 'You are a helpful assistant.' },
        { role: 'user', content: body.prompt }
      ];
    } else {
      return c.json({ error: 'Either prompt or messages required' }, 400);
    }

    // 스트리밍 응답
    if (body.stream) {
      const stream = await c.env.AI.run(model, {
        messages,
        stream: true,
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 1000
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // 일반 응답
    const response = await c.env.AI.run(model, {
      messages,
      temperature: body.temperature || 0.7,
      max_tokens: body.max_tokens || 1000
    });

    return successResponse(c, {
      response: response.response,
      usage: response.usage,
      model: model
    });

  } catch (error) {
    console.error('LLM generation error:', error);
    return c.json({ error: error.message || 'Text generation failed' }, 500);
  }
});

// 영어 레벨 평가 엔드포인트
app.post('/evaluate-english', async (c) => {
  try {
    const { text, context } = await c.req.json<{
      text: string;
      context?: string;
    }>();

    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }

    const prompt = `You are an expert English language assessor. Evaluate the following English text for language proficiency.

${context ? `Context: ${context}\n` : ''}
Text to evaluate: "${text}"

Provide a detailed assessment with scores (0-100) for each of these 6 areas:
1. Grammar accuracy
2. Vocabulary range and appropriateness
3. Fluency and coherence
4. Pronunciation clarity (based on transcription quality if applicable)
5. Task achievement / Content relevance
6. Interaction skills / Communication effectiveness

Also determine the CEFR level (A1, A2, B1, B2, C1, or C2) based on the overall proficiency.

Response in JSON format with this structure:
{
  "scores": {
    "grammar": <0-100>,
    "vocabulary": <0-100>,
    "fluency": <0-100>,
    "pronunciation": <0-100>,
    "taskAchievement": <0-100>,
    "interaction": <0-100>
  },
  "averageScore": <0-100>,
  "cefrLevel": "<A1-C2>",
  "feedback": {
    "strengths": ["point 1", "point 2"],
    "improvements": ["point 1", "point 2"],
    "suggestions": ["suggestion 1", "suggestion 2"]
  },
  "detailedAnalysis": {
    "grammar": "Detailed grammar analysis...",
    "vocabulary": "Detailed vocabulary analysis...",
    "fluency": "Detailed fluency analysis...",
    "pronunciation": "Detailed pronunciation analysis...",
    "taskAchievement": "Detailed task achievement analysis...",
    "interaction": "Detailed interaction analysis..."
  }
}`;

    const response = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional English language assessment expert. Always respond with valid JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    try {
      const evaluation = JSON.parse(response.response);
      return successResponse(c, {
        evaluation,
        evaluatedText: text
      });
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트 응답 반환
      return successResponse(c, {
        evaluation: {
          textResponse: response.response,
          scores: {
            grammar: 70,
            vocabulary: 70,
            fluency: 70,
            pronunciation: 70,
            taskAchievement: 70,
            interaction: 70
          },
          averageScore: 70,
          cefrLevel: 'B1'
        },
        evaluatedText: text
      });
    }

  } catch (error) {
    console.error('English evaluation error:', error);
    return c.json({ error: error.message || 'Evaluation failed' }, 500);
  }
});

// 문법 체크 엔드포인트
app.post('/check-grammar', async (c) => {
  try {
    const { text } = await c.req.json<{ text: string }>();

    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }

    const prompt = `Check the grammar of the following text and provide corrections:

Text: "${text}"

Provide a response in JSON format:
{
  "hasErrors": boolean,
  "correctedText": "the corrected version of the text",
  "errors": [
    {
      "type": "grammar/spelling/punctuation",
      "original": "original text",
      "correction": "corrected text",
      "explanation": "why this is wrong and how to fix it"
    }
  ],
  "suggestions": ["general writing improvement suggestions"]
}`;

    const response = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { 
          role: 'system', 
          content: 'You are a grammar expert. Always respond with valid JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });

    try {
      const result = JSON.parse(response.response);
      return successResponse(c, result);
    } catch (parseError) {
      return c.json({
        error: 'Failed to parse grammar check response',
        rawResponse: response.response
      }, 400);
    }

  } catch (error) {
    console.error('Grammar check error:', error);
    return c.json({ error: error.message || 'Grammar check failed' }, 500);
  }
});

// 대화 연습 피드백 엔드포인트
app.post('/conversation-feedback', async (c) => {
  try {
    const { conversation, topic, level } = await c.req.json<{
      conversation: Array<{ speaker: string; text: string }>;
      topic?: string;
      level?: string;
    }>();

    if (!conversation || conversation.length === 0) {
      return c.json({ error: 'Conversation is required' }, 400);
    }

    const conversationText = conversation
      .map(turn => `${turn.speaker}: ${turn.text}`)
      .join('\n');

    const prompt = `Analyze this English conversation and provide detailed feedback:

${topic ? `Topic: ${topic}` : ''}
${level ? `Expected Level: ${level}` : ''}

Conversation:
${conversationText}

Provide comprehensive feedback in JSON format:
{
  "overallAssessment": "general assessment of the conversation",
  "participantFeedback": {
    "<speaker_name>": {
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "languageUse": "assessment of grammar, vocabulary, fluency",
      "communicationSkills": "assessment of interaction, turn-taking, etc."
    }
  },
  "suggestions": {
    "vocabulary": ["useful words/phrases for this topic"],
    "expressions": ["natural expressions to use"],
    "grammar": ["grammar points to focus on"]
  },
  "nextSteps": ["recommendation 1", "recommendation 2"]
}`;

    const response = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { 
          role: 'system', 
          content: 'You are an experienced English conversation coach. Always respond with valid JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 2000
    });

    try {
      const feedback = JSON.parse(response.response);
      return successResponse(c, {
        feedback,
        conversationLength: conversation.length,
        topic,
        level
      });
    } catch (parseError) {
      return successResponse(c, {
        feedback: {
          textResponse: response.response
        },
        conversationLength: conversation.length,
        topic,
        level
      });
    }

  } catch (error) {
    console.error('Conversation feedback error:', error);
    return c.json({ error: error.message || 'Feedback generation failed' }, 500);
  }
});

// 사용 가능한 모델 목록
app.get('/models', (c) => {
  return successResponse(c, {
    available_models: [
      {
        id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        name: 'Llama 3.3 70B Instruct',
        description: 'Fast 70B parameter model optimized for instruction following',
        context_window: 24000,
        recommended: true
      },
      {
        id: '@cf/meta/llama-3-8b-instruct',
        name: 'Llama 3 8B Instruct',
        description: 'Smaller, faster model for general tasks',
        context_window: 8192
      },
      {
        id: '@cf/microsoft/phi-2',
        name: 'Phi-2',
        description: 'Small but capable model from Microsoft',
        context_window: 2048
      },
      {
        id: '@cf/qwen/qwen1.5-14b-chat-awq',
        name: 'Qwen 1.5 14B',
        description: 'Multilingual model with strong performance',
        context_window: 32768
      }
    ],
    features: [
      'Text generation',
      'English evaluation',
      'Grammar checking',
      'Conversation feedback',
      'Streaming support'
    ]
  });
});

export default app;