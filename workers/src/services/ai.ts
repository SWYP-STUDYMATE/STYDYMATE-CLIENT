// Cloudflare Workers AI 서비스

// 오디오를 청크로 나누는 함수
export async function splitAudioIntoChunks(audioBuffer: ArrayBuffer, chunkSize: number = 1024 * 1024): Promise<ArrayBuffer[]> {
    const chunks: ArrayBuffer[] = [];

    // 1MB 청크로 나누기
    for (let i = 0; i < audioBuffer.byteLength; i += chunkSize) {
        const chunk = audioBuffer.slice(i, Math.min(i + chunkSize, audioBuffer.byteLength));
        chunks.push(chunk);
    }

    return chunks;
}

// 단일 청크 처리
async function processAudioChunk(
    ai: Ai,
    audioChunk: ArrayBuffer,
    options: WhisperOptions = {}
): Promise<WhisperResponse> {
    try {
        const response = await ai.run('@cf/openai/whisper-large-v3-turbo', {
            audio: [...new Uint8Array(audioChunk)],
            task: options.task || 'transcribe',
            language: options.language || 'auto',
            vad_filter: options.vad_filter || true,
            initial_prompt: options.initial_prompt,
            prefix: options.prefix
        });

        return response;
    } catch (error) {
        console.error('Whisper chunk processing error:', error);
        return { text: '[Error transcribing chunk]', word_count: 0 };
    }
}

// 메인 오디오 처리 함수 (청킹 지원)
export async function processAudio(
    ai: Ai,
    audioBuffer: ArrayBuffer,
    options: WhisperOptions = {}
): Promise<WhisperFullResponse> {
    try {
        // 파일 크기가 1MB 이하면 직접 처리
        if (audioBuffer.byteLength <= 1024 * 1024) {
            const response = await processAudioChunk(ai, audioBuffer, options);
            return {
                text: response.text || '',
                word_count: response.word_count || 0,
                words: response.words || [],
                chunks: 1
            };
        }

        // 큰 파일은 청크로 나누어 처리
        const chunks = await splitAudioIntoChunks(audioBuffer);
        const results: WhisperResponse[] = [];
        let fullTranscript = '';
        let totalWordCount = 0;
        const allWords: WhisperWord[] = [];
        let timeOffset = 0;

        for (const chunk of chunks) {
            const result = await processAudioChunk(ai, chunk, options);
            results.push(result);

            fullTranscript += result.text + ' ';
            totalWordCount += result.word_count || 0;

            // 단어 타임스탬프 조정
            if (result.words) {
                const adjustedWords = result.words.map(word => ({
                    ...word,
                    start: word.start + timeOffset,
                    end: word.end + timeOffset
                }));
                allWords.push(...adjustedWords);

                // 다음 청크를 위한 시간 오프셋 업데이트
                const lastWord = result.words[result.words.length - 1];
                if (lastWord) {
                    timeOffset = lastWord.end;
                }
            }
        }

        return {
            text: fullTranscript.trim(),
            word_count: totalWordCount,
            words: allWords,
            chunks: chunks.length
        };
    } catch (error) {
        console.error('Whisper processing error:', error);
        throw new Error('Failed to process audio with Whisper');
    }
}

// 텍스트 분석 함수
export async function analyzeText(ai: Ai, text: string): Promise<LanguageAnalysis> {
    try {
        // LLM으로 텍스트 분석
        const prompt = `
      Analyze the following English text for language proficiency assessment.
      Evaluate these 6 areas and provide a score (0-100) for each:
      1. Grammar accuracy
      2. Vocabulary range
      3. Fluency and coherence
      4. Pronunciation clarity (based on transcription quality)
      5. Task achievement
      6. Interaction skills

      Text to analyze: "${text}"

      Respond in JSON format with scores and brief feedback for each area.
    `;

        const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: 'You are a professional language assessment expert.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        // Parse the JSON response
        try {
            const analysis = JSON.parse(response.response);
            return analysis;
        } catch {
            // Fallback if JSON parsing fails
            return {
                grammar: 70,
                vocabulary: 70,
                fluency: 70,
                pronunciation: 70,
                taskAchievement: 70,
                interaction: 70,
                feedback: response.response
            };
        }
    } catch (error) {
        console.error('Text analysis error:', error);
        throw new Error('Failed to analyze text');
    }
}

// CEFR 레벨 계산
export function calculateLevel(analysis: LanguageAnalysis): CEFRLevel {
    // Calculate average score
    const scores = [
        analysis.grammar,
        analysis.vocabulary,
        analysis.fluency,
        analysis.pronunciation,
        analysis.taskAchievement,
        analysis.interaction
    ];

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Map to CEFR levels
    if (averageScore >= 90) return 'C2';
    if (averageScore >= 80) return 'C1';
    if (averageScore >= 70) return 'B2';
    if (averageScore >= 60) return 'B1';
    if (averageScore >= 50) return 'A2';
    return 'A1';
}

// 임베딩 생성
export async function generateEmbedding(ai: Ai, text: string): Promise<number[]> {
    try {
        const response = await ai.run('@cf/baai/bge-base-en-v1.5', {
            text: text
        });

        return response.data[0] || [];
    } catch (error) {
        console.error('Embedding generation error:', error);
        throw new Error('Failed to generate embedding');
    }
}

// LLM 텍스트 생성 함수
export async function generateText(
    ai: Ai,
    prompt: string,
    options: LLMOptions = {}
): Promise<LLMResponse> {
    try {
        const model = options.model || '@cf/meta/llama-3.2-3b-instruct';
        const response = await ai.run(model, {
            prompt: prompt,
            stream: options.stream || false,
            max_tokens: options.max_tokens || 1024,
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            top_k: options.top_k || 40,
            repetition_penalty: options.repetition_penalty || 1.1,
            frequency_penalty: options.frequency_penalty || 0,
            presence_penalty: options.presence_penalty || 0,
            seed: options.seed
        });

        return {
            text: response.response || response,
            model: model,
            usage: response.usage || {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            }
        };
    } catch (error) {
        console.error('Text generation error:', error);
        throw new Error('Failed to generate text');
    }
}

// 대화형 텍스트 생성 함수 (Chat Completion)
export async function generateChatCompletion(
    ai: Ai,
    messages: ChatMessage[],
    options: LLMOptions = {}
): Promise<LLMResponse> {
    try {
        const model = options.model || '@cf/meta/llama-3.2-3b-instruct';

        // Function calling 지원 확인
        const supportsFunctions = ['llama-3.3-70b-instruct-fp8-fast', 'llama-4-scout-17b-16e-instruct'].some(
            m => model.includes(m)
        );

        const requestParams: any = {
            messages: messages,
            stream: options.stream || false,
            max_tokens: options.max_tokens || 1024,
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            top_k: options.top_k || 40,
            repetition_penalty: options.repetition_penalty || 1.1,
            frequency_penalty: options.frequency_penalty || 0,
            presence_penalty: options.presence_penalty || 0,
            seed: options.seed
        };

        // JSON 모드 지원
        if (options.response_format) {
            requestParams.response_format = options.response_format;
        }

        // Function calling 지원
        if (options.tools && supportsFunctions) {
            requestParams.tools = options.tools;
        }

        const response = await ai.run(model, requestParams);

        return {
            text: response.response || response,
            model: model,
            usage: response.usage || {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            },
            tool_calls: response.tool_calls
        };
    } catch (error) {
        console.error('Chat completion error:', error);
        throw new Error('Failed to generate chat completion');
    }
}

// 언어 레벨 평가 함수
export async function evaluateLanguageLevel(
  ai: Ai,
  transcription: string,
  question: string
): Promise<any> {
  try {
    const prompt = `Evaluate the following English response for language proficiency.

Question asked: "${question}"
Student's response: "${transcription}"

Evaluate the response across these 6 dimensions and provide a score (0-100) for each:
1. Pronunciation clarity (based on transcription quality)
2. Fluency and flow
3. Grammar accuracy
4. Vocabulary range and appropriateness
5. Coherence and organization
6. Interaction and responsiveness to the question

Also provide:
- Brief feedback on overall performance
- 2-3 specific suggestions for improvement
- Estimated CEFR level (A1-C2)

Respond in JSON format:
{
  "scores": {
    "pronunciation": number,
    "fluency": number,
    "grammar": number,
    "vocabulary": number,
    "coherence": number,
    "interaction": number
  },
  "feedback": "string",
  "suggestions": ["string", "string", "string"],
  "estimatedLevel": "string"
}`;

    const response = await generateChatCompletion(ai, [
      { role: 'system', content: 'You are an expert English language assessor. Provide fair and constructive evaluations.' },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    });

    try {
      return JSON.parse(response.text);
    } catch {
      // Fallback evaluation
      return {
        scores: {
          pronunciation: 70,
          fluency: 70,
          grammar: 70,
          vocabulary: 70,
          coherence: 70,
          interaction: 70
        },
        feedback: "Good effort in responding to the question.",
        suggestions: ["Practice speaking more fluently", "Expand vocabulary range", "Work on grammar accuracy"],
        estimatedLevel: "B1"
      };
    }
  } catch (error) {
    console.error('Language evaluation error:', error);
    throw new Error('Failed to evaluate language level');
  }
}

// 레벨 피드백 생성
export async function generateLevelFeedback(
  ai: Ai,
  analysis: LanguageAnalysis,
  level: CEFRLevel
): Promise<string> {
    try {
        const prompt = `Based on the following language assessment results, provide personalized feedback and learning recommendations.

Level: ${level}
Scores:
- Grammar: ${analysis.grammar}/100
- Vocabulary: ${analysis.vocabulary}/100
- Fluency: ${analysis.fluency}/100
- Pronunciation: ${analysis.pronunciation}/100
- Task Achievement: ${analysis.taskAchievement}/100
- Interaction: ${analysis.interaction}/100

Provide:
1. Overall assessment (2-3 sentences)
2. Strengths (2-3 points)
3. Areas for improvement (2-3 points)
4. Specific study recommendations (3-4 actionable tips)
5. Next steps to reach the next CEFR level

Keep the tone encouraging and constructive. Format in clear sections.`;

        const response = await generateText(ai, prompt, {
            temperature: 0.6,
            max_tokens: 800
        });

        return response.text;
    } catch (error) {
        console.error('Feedback generation error:', error);
        return 'Unable to generate detailed feedback at this time.';
    }
}

// 대화 주제 생성
export async function generateConversationTopics(
    ai: Ai,
    level: string,
    interests: string[],
    language: string
): Promise<string[]> {
    try {
        const prompt = `Generate 5 conversation topics suitable for ${level} level ${language} learners.
Consider their interests: ${interests.join(', ')}.

Requirements:
- Topics should match their proficiency level
- Be engaging and relevant to their interests
- Include mix of everyday and educational topics
- Encourage natural conversation flow

Return ONLY a JSON array of 5 topic strings, no other text.`;

        const response = await generateText(ai, prompt, {
            temperature: 0.8,
            max_tokens: 200
        });

        try {
            const topics = JSON.parse(response.text);
            return Array.isArray(topics) ? topics : [];
        } catch {
            return [
                'Daily routines and habits',
                'Hobbies and free time activities',
                'Travel experiences and plans',
                'Technology in daily life',
                'Cultural differences and similarities'
            ];
        }
    } catch (error) {
        console.error('Topic generation error:', error);
        return [];
    }
}

// 세션 요약 생성
export async function generateSessionSummary(
    ai: Ai,
    transcript: string,
    duration: number,
    participants: string[]
): Promise<SessionSummary> {
    try {
        const prompt = `Analyze this language learning session and provide a structured summary.

Session Duration: ${Math.round(duration / 60)} minutes
Participants: ${participants.join(', ')}
Transcript: "${transcript}"

Provide a JSON response with:
{
  "keyPoints": ["list of 3-5 main topics discussed"],
  "vocabularyUsed": ["list of 5-10 key vocabulary items"],
  "grammarPatterns": ["list of 3-5 grammar structures used"],
  "speakingTime": { "participant1": percentage, "participant2": percentage },
  "suggestions": ["list of 3-4 improvement suggestions"],
  "overallRating": number (1-10)
}`;

        const response = await generateChatCompletion(ai, [
            { role: 'system', content: 'You are a language learning session analyzer. Respond only with valid JSON.' },
            { role: 'user', content: prompt }
        ], {
            temperature: 0.3,
            max_tokens: 600,
            response_format: { type: 'json_object' }
        });

        try {
            return JSON.parse(response.text);
        } catch {
            return {
                keyPoints: ['Session completed'],
                vocabularyUsed: [],
                grammarPatterns: [],
                speakingTime: {},
                suggestions: ['Continue practicing'],
                overallRating: 7
            };
        }
    } catch (error) {
        console.error('Session summary error:', error);
        throw new Error('Failed to generate session summary');
    }
}

// Type definitions
export interface WhisperOptions {
    task?: 'transcribe' | 'translate';
    language?: string;
    vad_filter?: boolean;
    initial_prompt?: string;
    prefix?: string;
}

export interface WhisperResponse {
    text: string;
    word_count?: number;
    words?: WhisperWord[];
    vtt?: string;
}

export interface WhisperWord {
    word: string;
    start: number;
    end: number;
}

export interface WhisperFullResponse extends WhisperResponse {
    chunks: number;
}

interface LanguageAnalysis {
    grammar: number;
    vocabulary: number;
    fluency: number;
    pronunciation: number;
    taskAchievement: number;
    interaction: number;
    feedback?: string;
}

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// LLM 타입 정의
export interface LLMOptions {
    model?: string;
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repetition_penalty?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    seed?: number;
    response_format?: {
        type: 'json_object' | 'json_schema';
        json_schema?: any;
    };
    tools?: Tool[];
}

export interface LLMResponse {
    text: string;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    tool_calls?: ToolCall[];
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_call_id?: string;
}

export interface Tool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            properties: Record<string, any>;
            required?: string[];
        };
    };
}

export interface ToolCall {
    name: string;
    arguments: Record<string, any>;
}

export interface SessionSummary {
    keyPoints: string[];
    vocabularyUsed: string[];
    grammarPatterns: string[];
    speakingTime: Record<string, number>;
    suggestions: string[];
    overallRating: number;
}

// 사용 가능한 모델 목록
export const AVAILABLE_MODELS = {
    // Llama 모델들
    'llama-3.3-70b-instruct-fp8-fast': {
        name: 'Llama 3.3 70B (Fast)',
        contextWindow: 24000,
        supportsTools: true,
        costPerMInput: 0.29,
        costPerMOutput: 2.25
    },
    'llama-3.2-3b-instruct': {
        name: 'Llama 3.2 3B',
        contextWindow: 128000,
        supportsTools: false,
        costPerMInput: 0.051,
        costPerMOutput: 0.34
    },
    'llama-4-scout-17b-16e-instruct': {
        name: 'Llama 4 Scout 17B',
        contextWindow: 131000,
        supportsTools: true,
        costPerMInput: 0.27,
        costPerMOutput: 0.85
    },
    'llama-3.1-8b-instruct': {
        name: 'Llama 3.1 8B',
        contextWindow: 7968,
        supportsTools: false,
        costPerMInput: 0.28,
        costPerMOutput: 0.83
    },
    'llama-3-8b-instruct': {
        name: 'Llama 3 8B',
        contextWindow: 8192,
        supportsTools: false,
        costPerMInput: 0.28,
        costPerMOutput: 0.83
    },
    'llama-2-7b-chat-fp16': {
        name: 'Llama 2 7B',
        contextWindow: 4096,
        supportsTools: false,
        costPerMInput: 0.56,
        costPerMOutput: 6.67
    }
};