import { Hono } from 'hono';
import { Env } from '../index';
import { generateText, generateChatCompletion, AVAILABLE_MODELS } from '../services/ai';

export const llmRoutes = new Hono<{ Bindings: Env }>();

// 텍스트 생성 엔드포인트
llmRoutes.post('/generate', async (c) => {
  try {
    const { prompt, model, maxTokens, temperature, stream } = await c.req.json();

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    const response = await generateText(c.env.AI, prompt, {
      model,
      maxTokens,
      temperature,
      stream
    });

    if (stream) {
      // 스트리밍 응답
      return new Response(response.stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    return c.json({
      success: true,
      text: response.text,
      model: response.model,
      usage: response.usage
    });
  } catch (error) {
    console.error('Text generation error:', error);
    return c.json({ error: 'Failed to generate text' }, 500);
  }
});

// 채팅 완성 엔드포인트
llmRoutes.post('/chat', async (c) => {
  try {
    const { messages, model, maxTokens, temperature, stream } = await c.req.json();

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'Messages array is required' }, 400);
    }

    const response = await generateChatCompletion(c.env.AI, messages, {
      model,
      maxTokens,
      temperature,
      stream
    });

    if (stream) {
      // 스트리밍 응답
      return new Response(response.stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    return c.json({
      success: true,
      text: response.text,
      model: response.model,
      usage: response.usage
    });
  } catch (error) {
    console.error('Chat completion error:', error);
    return c.json({ error: 'Failed to generate chat completion' }, 500);
  }
});

// 사용 가능한 모델 목록
llmRoutes.get('/models', async (c) => {
  return c.json({
    success: true,
    models: AVAILABLE_MODELS
  });
});

// 프롬프트 템플릿 저장 (KV 사용)
llmRoutes.post('/templates', async (c) => {
  try {
    const { name, template, description } = await c.req.json();

    if (!name || !template) {
      return c.json({ error: 'Name and template are required' }, 400);
    }

    const templateData = {
      name,
      template,
      description,
      createdAt: new Date().toISOString()
    };

    await c.env.CACHE.put(`template:${name}`, JSON.stringify(templateData));

    return c.json({
      success: true,
      template: templateData
    });
  } catch (error) {
    console.error('Template save error:', error);
    return c.json({ error: 'Failed to save template' }, 500);
  }
});

// 프롬프트 템플릿 조회
llmRoutes.get('/templates/:name', async (c) => {
  try {
    const name = c.req.param('name');
    const cached = await c.env.CACHE.get(`template:${name}`);

    if (!cached) {
      return c.json({ error: 'Template not found' }, 404);
    }

    const template = JSON.parse(cached);
    return c.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Template retrieval error:', error);
    return c.json({ error: 'Failed to retrieve template' }, 500);
  }
});

// 배치 처리 엔드포인트
llmRoutes.post('/batch', async (c) => {
  try {
    const { prompts, model, maxTokens, temperature } = await c.req.json();

    if (!prompts || !Array.isArray(prompts)) {
      return c.json({ error: 'Prompts array is required' }, 400);
    }

    // 병렬로 여러 프롬프트 처리
    const results = await Promise.all(
      prompts.map(async (prompt) => {
        try {
          const response = await generateText(c.env.AI, prompt, {
            model,
            maxTokens,
            temperature
          });
          return {
            prompt,
            text: response.text,
            success: true
          };
        } catch (error) {
          return {
            prompt,
            error: error.message,
            success: false
          };
        }
      })
    );

    return c.json({
      success: true,
      results,
      model: model || AVAILABLE_MODELS.llama3_8b
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    return c.json({ error: 'Failed to process batch' }, 500);
  }
});