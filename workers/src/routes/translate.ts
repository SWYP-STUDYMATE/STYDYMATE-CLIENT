import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// CORS 설정
app.use('/*', cors());

// 지원되는 언어 코드 매핑
const LANGUAGE_CODES: Record<string, string> = {
  'ko': 'Korean',
  'en': 'English',
  'ja': 'Japanese',
  'zh': 'Chinese',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'ru': 'Russian',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'pt': 'Portuguese',
  'it': 'Italian',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'pl': 'Polish',
  'tr': 'Turkish',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian',
  'ms': 'Malay'
};

// 언어 감지
async function detectLanguage(text: string, ai: Ai): Promise<string> {
  try {
    const prompt = `Detect the language of the following text and respond with ONLY the ISO 639-1 language code (e.g., 'en' for English, 'ko' for Korean, 'ja' for Japanese, etc.).

Text: "${text}"

Language code:`;

    const response = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { role: 'system', content: 'You are a language detection expert. Respond only with the ISO 639-1 language code.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const detectedCode = response.response.trim().toLowerCase();
    return LANGUAGE_CODES[detectedCode] ? detectedCode : 'en';

  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // 기본값
  }
}

// 번역 엔드포인트
app.post('/translate', async (c) => {
  try {
    const body = await c.req.json<{
      text: string;
      source?: string;
      target: string;
      preserveFormatting?: boolean;
    }>();

    if (!body.text || !body.target) {
      return c.json({ error: 'Text and target language are required' }, 400);
    }

    // 소스 언어 자동 감지
    const sourceLanguage = body.source || await detectLanguage(body.text, c.env.AI);
    const targetLanguage = body.target;

    // 같은 언어면 원문 반환
    if (sourceLanguage === targetLanguage) {
      return c.json({
        success: true,
        originalText: body.text,
        translatedText: body.text,
        sourceLanguage,
        targetLanguage,
        isIdentical: true
      });
    }

    // 번역 프롬프트 생성
    const prompt = `Translate the following text from ${LANGUAGE_CODES[sourceLanguage] || sourceLanguage} to ${LANGUAGE_CODES[targetLanguage] || targetLanguage}.
${body.preserveFormatting ? 'Preserve the original formatting including line breaks and punctuation.' : ''}

Original text:
"${body.text}"

Translation:`;

    // AI 번역 실행
    const response = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional translator. Provide accurate, natural translations while maintaining the original meaning and tone. Respond only with the translation, no explanations.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: Math.min(body.text.length * 3, 2000) // 번역은 보통 원문보다 길어질 수 있음
    });

    const translatedText = response.response.trim()
      .replace(/^["']/, '') // 앞 따옴표 제거
      .replace(/["']$/, ''); // 뒤 따옴표 제거

    return c.json({
      success: true,
      originalText: body.text,
      translatedText,
      sourceLanguage,
      targetLanguage,
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
    });

  } catch (error: any) {
    console.error('Translation error:', error);
    return c.json({ error: error.message || 'Translation failed' }, 500);
  }
});

// 일괄 번역 엔드포인트
app.post('/translate/batch', async (c) => {
  try {
    const body = await c.req.json<{
      texts: string[];
      source?: string;
      target: string;
    }>();

    if (!body.texts || body.texts.length === 0 || !body.target) {
      return c.json({ error: 'Texts array and target language are required' }, 400);
    }

    // 최대 10개까지만 허용
    const textsToTranslate = body.texts.slice(0, 10);

    // 병렬 번역 처리
    const translations = await Promise.all(
      textsToTranslate.map(async (text) => {
        try {
          const sourceLanguage = body.source || await detectLanguage(text, c.env.AI);
          
          if (sourceLanguage === body.target) {
            return {
              originalText: text,
              translatedText: text,
              sourceLanguage,
              targetLanguage: body.target,
              isIdentical: true
            };
          }

          const prompt = `Translate from ${LANGUAGE_CODES[sourceLanguage] || sourceLanguage} to ${LANGUAGE_CODES[body.target] || body.target}: "${text}"`;

          const response = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: [
              { role: 'system', content: 'You are a translator. Provide only the translation, no explanations.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: Math.min(text.length * 3, 1000)
          });

          return {
            originalText: text,
            translatedText: response.response.trim().replace(/^["']|["']$/g, ''),
            sourceLanguage,
            targetLanguage: body.target
          };

        } catch (error) {
          return {
            originalText: text,
            translatedText: '',
            error: 'Translation failed',
            sourceLanguage: body.source || 'unknown',
            targetLanguage: body.target
          };
        }
      })
    );

    return c.json({
      success: true,
      translations,
      total: translations.length
    });

  } catch (error: any) {
    console.error('Batch translation error:', error);
    return c.json({ error: error.message || 'Batch translation failed' }, 500);
  }
});

// 실시간 자막 번역 엔드포인트
app.post('/translate/subtitle', async (c) => {
  try {
    const body = await c.req.json<{
      subtitle: {
        text: string;
        language?: string;
        timestamp?: string;
      };
      targetLanguage: string;
      context?: string[]; // 이전 자막들 (문맥 이해용)
    }>();

    if (!body.subtitle?.text || !body.targetLanguage) {
      return c.json({ error: 'Subtitle text and target language are required' }, 400);
    }

    const sourceLanguage = body.subtitle.language || await detectLanguage(body.subtitle.text, c.env.AI);

    if (sourceLanguage === body.targetLanguage) {
      return c.json({
        success: true,
        originalSubtitle: body.subtitle,
        translatedSubtitle: {
          ...body.subtitle,
          translatedText: body.subtitle.text,
          targetLanguage: body.targetLanguage
        }
      });
    }

    // 문맥을 포함한 번역
    let contextPrompt = '';
    if (body.context && body.context.length > 0) {
      contextPrompt = `Previous conversation context:\n${body.context.slice(-3).join('\n')}\n\n`;
    }

    const prompt = `${contextPrompt}Translate this subtitle from ${LANGUAGE_CODES[sourceLanguage] || sourceLanguage} to ${LANGUAGE_CODES[body.targetLanguage] || body.targetLanguage}. Keep it concise for subtitles:

"${body.subtitle.text}"`;

    const response = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { 
          role: 'system', 
          content: 'You are a subtitle translator. Provide concise, natural translations suitable for real-time display. Consider the conversation context if provided.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const translatedText = response.response.trim().replace(/^["']|["']$/g, '');

    return c.json({
      success: true,
      originalSubtitle: body.subtitle,
      translatedSubtitle: {
        ...body.subtitle,
        translatedText,
        targetLanguage: body.targetLanguage,
        sourceLanguage
      }
    });

  } catch (error: any) {
    console.error('Subtitle translation error:', error);
    return c.json({ error: error.message || 'Subtitle translation failed' }, 500);
  }
});

// 지원 언어 목록
app.get('/languages', (c) => {
  const languages = Object.entries(LANGUAGE_CODES).map(([code, name]) => ({
    code,
    name,
    nativeName: getNativeName(code)
  }));

  return c.json({
    success: true,
    languages,
    total: languages.length
  });
});

// 언어의 원어 이름 반환
function getNativeName(code: string): string {
  const nativeNames: Record<string, string> = {
    'ko': '한국어',
    'en': 'English',
    'ja': '日本語',
    'zh': '中文',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'ru': 'Русский',
    'ar': 'العربية',
    'hi': 'हिन्दी',
    'pt': 'Português',
    'it': 'Italiano',
    'nl': 'Nederlands',
    'sv': 'Svenska',
    'pl': 'Polski',
    'tr': 'Türkçe',
    'vi': 'Tiếng Việt',
    'th': 'ไทย',
    'id': 'Bahasa Indonesia',
    'ms': 'Bahasa Melayu'
  };

  return nativeNames[code] || LANGUAGE_CODES[code] || code;
}

export default app;