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

// Whisper 모델 옵션
export interface WhisperOptions {
  task?: 'transcribe' | 'translate';
  language?: string; // 'auto', 'en', 'ko', 'ja', 'zh' 등
  vad_filter?: boolean; // Voice Activity Detection
  initial_prompt?: string; // 컨텍스트 제공
  prefix?: string; // 출력 접두사
}

// Whisper 응답 타입
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

// Type definitions
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