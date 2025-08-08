// Cloudflare Workers AI 서비스

export async function processAudio(ai: Ai, audioBuffer: ArrayBuffer): Promise<string> {
  try {
    // Whisper 모델로 음성 인식
    const response = await ai.run('@cf/openai/whisper-large-v3-turbo', {
      audio: [...new Uint8Array(audioBuffer)],
      task: 'transcribe',
      language: 'en'
    });

    return response.text || '';
  } catch (error) {
    console.error('Whisper processing error:', error);
    throw new Error('Failed to process audio with Whisper');
  }
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