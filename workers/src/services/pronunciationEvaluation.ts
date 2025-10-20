// 정밀 발음 평가 시스템
// 음소 단위 분석, 억양 패턴, 리듬, 스트레스 평가

import { generateChatCompletion, sanitizeJsonResponse, type ChatMessage } from './ai';
import { log } from '../utils/logger';

// 음소 분석 결과
export interface PhonemeAnalysis {
  phoneme: string;              // 음소 기호 (IPA)
  word: string;                 // 해당 단어
  position: number;             // 단어 내 위치
  accuracy: number;             // 0-100, 정확도
  issues: string[];             // 발견된 문제점
  nativeSample?: string;        // 원어민 발음 예시 (IPA)
  userPronunciation?: string;   // 사용자 발음 (IPA)
}

// 억양 패턴 분석
export interface IntonationPattern {
  type: 'rising' | 'falling' | 'level' | 'fall-rise' | 'rise-fall';
  sentenceType: 'statement' | 'question' | 'command' | 'exclamation';
  isCorrect: boolean;
  expectedPattern: string;
  detectedPattern: string;
  confidence: number;  // 0-100
}

// 리듬 분석
export interface RhythmAnalysis {
  syllableCount: number;
  stressPattern: string;         // e.g., "10010" (1=stressed, 0=unstressed)
  expectedStress: string;
  rhythmType: 'stress-timed' | 'syllable-timed' | 'mora-timed';
  isNaturalRhythm: boolean;
  pauseLocations: number[];      // 문장 내 쉬는 위치 (단어 인덱스)
  speakingRate: number;          // 분당 음절 수 (syllables per minute)
  consistency: number;           // 0-100, 리듬 일관성
}

// 스트레스 분석
export interface StressAnalysis {
  wordStresses: Array<{
    word: string;
    expectedStress: number;      // 강세 위치 (음절 인덱스)
    detectedStress: number;
    isCorrect: boolean;
    syllableCount: number;
  }>;
  sentenceStress: {
    contentWords: string[];      // 강조되어야 할 내용어
    functionWords: string[];     // 약화되어야 할 기능어
    correctlyStressed: number;   // 올바르게 강세 준 단어 수
    totalContentWords: number;
  };
  overallAccuracy: number;       // 0-100
}

// 발음 오류 분류
export interface PronunciationError {
  type: 'substitution' | 'omission' | 'insertion' | 'distortion';
  phoneme: string;
  word: string;
  position: number;
  severity: 'critical' | 'major' | 'minor';
  suggestion: string;
  example: string;               // 올바른 발음 예시
}

// 종합 발음 평가 결과
export interface ComprehensivePronunciationEvaluation {
  overallScore: number;          // 0-100, 전체 발음 점수

  // 세부 점수
  scores: {
    segmental: number;           // 분절음 정확도 (개별 음소)
    suprasegmental: number;      // 초분절음 (억양, 리듬, 스트레스)
    intelligibility: number;     // 이해 가능성
    fluency: number;             // 유창성
    nativelikeness: number;      // 원어민다움
  };

  // 상세 분석
  phonemeAnalysis: PhonemeAnalysis[];
  intonationPatterns: IntonationPattern[];
  rhythmAnalysis: RhythmAnalysis;
  stressAnalysis: StressAnalysis;
  errors: PronunciationError[];

  // 개선 권장사항
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    exercises: string[];
  }[];

  // 강점 및 약점
  strengths: string[];
  weaknesses: string[];

  // CEFR 발음 레벨
  cefrLevel: string;             // A1-C2 기준 발음 수준
  nextLevelRequirements: string[];
}

/**
 * 음성 전사를 기반으로 음소 분석 수행
 */
async function analyzePhonemes(
  ai: Ai,
  transcription: string,
  targetLanguage: string = 'English'
): Promise<PhonemeAnalysis[]> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert phonetician specializing in ${targetLanguage} pronunciation analysis. Analyze the transcribed speech and identify phoneme-level pronunciation issues.

Respond in JSON format:
{
  "phonemes": [
    {
      "phoneme": "θ",
      "word": "think",
      "position": 0,
      "accuracy": 65,
      "issues": ["fronting - pronounced as /s/ or /t/"],
      "nativeSample": "θ",
      "userPronunciation": "s"
    }
  ]
}`
    },
    {
      role: 'user',
      content: `Analyze the phonemes in this speech transcription:

"${transcription}"

Identify commonly mispronounced phonemes, especially:
- Consonant clusters
- Th-sounds (θ, ð)
- R and L sounds
- Vowel quality
- Final consonants

Provide accuracy scores and specific issues for each problematic phoneme.`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.3,
      max_tokens: 1500
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    if (Array.isArray(parsed.phonemes)) {
      return parsed.phonemes.map((p: any) => ({
        phoneme: p.phoneme || '',
        word: p.word || '',
        position: p.position || 0,
        accuracy: typeof p.accuracy === 'number' ? p.accuracy : 50,
        issues: Array.isArray(p.issues) ? p.issues : [],
        nativeSample: p.nativeSample,
        userPronunciation: p.userPronunciation
      }));
    }

    return [];
  } catch (error) {
    log.error('Failed to analyze phonemes:', error);
    return [];
  }
}

/**
 * 억양 패턴 분석
 */
async function analyzeIntonation(
  ai: Ai,
  transcription: string,
  targetLanguage: string = 'English'
): Promise<IntonationPattern[]> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert in ${targetLanguage} intonation patterns. Analyze the speech and identify intonation patterns for each sentence.

Respond in JSON format:
{
  "patterns": [
    {
      "type": "rising",
      "sentenceType": "question",
      "isCorrect": true,
      "expectedPattern": "rising at end",
      "detectedPattern": "rising at end",
      "confidence": 85
    }
  ]
}`
    },
    {
      role: 'user',
      content: `Analyze intonation patterns in this transcription:

"${transcription}"

For each sentence, identify:
- Intonation type (rising, falling, level, fall-rise, rise-fall)
- Sentence type (statement, question, command, exclamation)
- Whether the pattern matches the sentence type
- Confidence level`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.3,
      max_tokens: 1200
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    if (Array.isArray(parsed.patterns)) {
      return parsed.patterns.map((p: any) => ({
        type: p.type || 'level',
        sentenceType: p.sentenceType || 'statement',
        isCorrect: p.isCorrect !== false,
        expectedPattern: p.expectedPattern || '',
        detectedPattern: p.detectedPattern || '',
        confidence: typeof p.confidence === 'number' ? p.confidence : 50
      }));
    }

    return [];
  } catch (error) {
    log.error('Failed to analyze intonation:', error);
    return [];
  }
}

/**
 * 리듬 분석
 */
async function analyzeRhythm(
  ai: Ai,
  transcription: string,
  targetLanguage: string = 'English'
): Promise<RhythmAnalysis> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert in ${targetLanguage} speech rhythm analysis. Analyze the rhythm, stress patterns, and speaking rate.

Respond in JSON format:
{
  "syllableCount": 45,
  "stressPattern": "1001010010",
  "expectedStress": "1001010010",
  "rhythmType": "stress-timed",
  "isNaturalRhythm": true,
  "pauseLocations": [5, 12, 20],
  "speakingRate": 180,
  "consistency": 75
}`
    },
    {
      role: 'user',
      content: `Analyze the rhythm in this speech:

"${transcription}"

Determine:
- Total syllable count
- Stress pattern (1=stressed, 0=unstressed syllables)
- Expected stress pattern for natural speech
- Rhythm type (stress-timed for English)
- Natural pause locations
- Speaking rate (syllables per minute)
- Rhythm consistency (0-100)`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.3,
      max_tokens: 1000
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    return {
      syllableCount: parsed.syllableCount || 0,
      stressPattern: parsed.stressPattern || '',
      expectedStress: parsed.expectedStress || '',
      rhythmType: parsed.rhythmType || 'stress-timed',
      isNaturalRhythm: parsed.isNaturalRhythm !== false,
      pauseLocations: Array.isArray(parsed.pauseLocations) ? parsed.pauseLocations : [],
      speakingRate: parsed.speakingRate || 150,
      consistency: typeof parsed.consistency === 'number' ? parsed.consistency : 50
    };
  } catch (error) {
    log.error('Failed to analyze rhythm:', error);
    return {
      syllableCount: 0,
      stressPattern: '',
      expectedStress: '',
      rhythmType: 'stress-timed',
      isNaturalRhythm: false,
      pauseLocations: [],
      speakingRate: 150,
      consistency: 50
    };
  }
}

/**
 * 스트레스 분석
 */
async function analyzeStress(
  ai: Ai,
  transcription: string,
  targetLanguage: string = 'English'
): Promise<StressAnalysis> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert in ${targetLanguage} word and sentence stress. Analyze stress placement at word and sentence levels.

Respond in JSON format:
{
  "wordStresses": [
    {
      "word": "important",
      "expectedStress": 1,
      "detectedStress": 1,
      "isCorrect": true,
      "syllableCount": 3
    }
  ],
  "sentenceStress": {
    "contentWords": ["important", "meeting", "tomorrow"],
    "functionWords": ["the", "is", "at"],
    "correctlyStressed": 8,
    "totalContentWords": 10
  },
  "overallAccuracy": 80
}`
    },
    {
      role: 'user',
      content: `Analyze stress patterns in this speech:

"${transcription}"

Identify:
- Word-level stress for multi-syllable words
- Content words that should receive sentence stress
- Function words that should be reduced
- Overall stress accuracy`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.3,
      max_tokens: 1500
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    return {
      wordStresses: Array.isArray(parsed.wordStresses) ? parsed.wordStresses : [],
      sentenceStress: {
        contentWords: Array.isArray(parsed.sentenceStress?.contentWords)
          ? parsed.sentenceStress.contentWords : [],
        functionWords: Array.isArray(parsed.sentenceStress?.functionWords)
          ? parsed.sentenceStress.functionWords : [],
        correctlyStressed: parsed.sentenceStress?.correctlyStressed || 0,
        totalContentWords: parsed.sentenceStress?.totalContentWords || 0
      },
      overallAccuracy: typeof parsed.overallAccuracy === 'number' ? parsed.overallAccuracy : 50
    };
  } catch (error) {
    log.error('Failed to analyze stress:', error);
    return {
      wordStresses: [],
      sentenceStress: {
        contentWords: [],
        functionWords: [],
        correctlyStressed: 0,
        totalContentWords: 0
      },
      overallAccuracy: 50
    };
  }
}

/**
 * 발음 오류 분류 및 분석
 */
async function classifyPronunciationErrors(
  ai: Ai,
  transcription: string,
  phonemeAnalysis: PhonemeAnalysis[]
): Promise<PronunciationError[]> {
  if (phonemeAnalysis.length === 0) {
    return [];
  }

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert in pronunciation error analysis. Classify pronunciation errors and provide corrective suggestions.

Respond in JSON format:
{
  "errors": [
    {
      "type": "substitution",
      "phoneme": "θ",
      "word": "think",
      "position": 0,
      "severity": "major",
      "suggestion": "Place tongue between teeth and blow air",
      "example": "Try: 'thin', 'thick', 'thank'"
    }
  ]
}`
    },
    {
      role: 'user',
      content: `Classify these pronunciation issues and provide corrections:

Transcription: "${transcription}"

Phoneme issues: ${JSON.stringify(phonemeAnalysis.slice(0, 10))}

For each error, determine:
- Error type (substitution, omission, insertion, distortion)
- Severity (critical, major, minor)
- Specific correction suggestion
- Practice examples`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.3,
      max_tokens: 1500
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    if (Array.isArray(parsed.errors)) {
      return parsed.errors.map((e: any) => ({
        type: e.type || 'substitution',
        phoneme: e.phoneme || '',
        word: e.word || '',
        position: e.position || 0,
        severity: e.severity || 'minor',
        suggestion: e.suggestion || '',
        example: e.example || ''
      }));
    }

    return [];
  } catch (error) {
    log.error('Failed to classify pronunciation errors:', error);
    return [];
  }
}

/**
 * 발음 개선 권장사항 생성
 */
async function generateRecommendations(
  ai: Ai,
  evaluation: Partial<ComprehensivePronunciationEvaluation>
): Promise<ComprehensivePronunciationEvaluation['recommendations']> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a pronunciation coach. Generate personalized improvement recommendations.

Respond in JSON format:
{
  "recommendations": [
    {
      "priority": "high",
      "category": "Consonant Sounds",
      "description": "Focus on 'th' sounds",
      "exercises": [
        "Practice minimal pairs: think/sink, thick/sick",
        "Tongue placement drills",
        "Record and compare with native speaker"
      ]
    }
  ]
}`
    },
    {
      role: 'user',
      content: `Based on this pronunciation analysis, generate improvement recommendations:

Overall Score: ${evaluation.overallScore || 0}/100
Segmental Score: ${evaluation.scores?.segmental || 0}/100
Suprasegmental Score: ${evaluation.scores?.suprasegmental || 0}/100

Main issues:
${evaluation.errors?.slice(0, 5).map(e => `- ${e.phoneme} in "${e.word}": ${e.suggestion}`).join('\n') || 'None identified'}

Weaknesses:
${evaluation.weaknesses?.join(', ') || 'None identified'}

Generate 3-5 prioritized recommendations with specific exercises.`
    }
  ];

  try {
    const response = await generateChatCompletion(ai, messages, {
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      temperature: 0.7,
      max_tokens: 1200
    });

    const sanitized = sanitizeJsonResponse(response);
    const parsed = JSON.parse(sanitized);

    if (Array.isArray(parsed.recommendations)) {
      return parsed.recommendations.map((r: any) => ({
        priority: r.priority || 'medium',
        category: r.category || '',
        description: r.description || '',
        exercises: Array.isArray(r.exercises) ? r.exercises : []
      }));
    }

    return [];
  } catch (error) {
    log.error('Failed to generate recommendations:', error);
    return [];
  }
}

/**
 * 종합 발음 평가 수행
 */
export async function performComprehensivePronunciationEvaluation(
  ai: Ai,
  transcription: string,
  targetLanguage: string = 'English'
): Promise<ComprehensivePronunciationEvaluation> {
  // 병렬로 모든 분석 수행
  const [
    phonemeAnalysis,
    intonationPatterns,
    rhythmAnalysis,
    stressAnalysis
  ] = await Promise.all([
    analyzePhonemes(ai, transcription, targetLanguage),
    analyzeIntonation(ai, transcription, targetLanguage),
    analyzeRhythm(ai, transcription, targetLanguage),
    analyzeStress(ai, transcription, targetLanguage)
  ]);

  // 발음 오류 분류
  const errors = await classifyPronunciationErrors(ai, transcription, phonemeAnalysis);

  // 세부 점수 계산
  const segmentalScore = phonemeAnalysis.length > 0
    ? Math.round(phonemeAnalysis.reduce((sum, p) => sum + p.accuracy, 0) / phonemeAnalysis.length)
    : 70;

  const intonationScore = intonationPatterns.length > 0
    ? Math.round(intonationPatterns.filter(p => p.isCorrect).length / intonationPatterns.length * 100)
    : 70;

  const rhythmScore = rhythmAnalysis.consistency;
  const stressScore = stressAnalysis.overallAccuracy;

  const suprasegmentalScore = Math.round(
    (intonationScore + rhythmScore + stressScore) / 3
  );

  // 전체 점수 계산 (가중 평균)
  const overallScore = Math.round(
    segmentalScore * 0.40 +        // 분절음 40%
    suprasegmentalScore * 0.35 +   // 초분절음 35%
    stressScore * 0.15 +           // 스트레스 15%
    intonationScore * 0.10         // 억양 10%
  );

  // 이해 가능성 점수
  const intelligibility = Math.round(
    segmentalScore * 0.6 + suprasegmentalScore * 0.4
  );

  // 유창성 점수 (리듬 + 속도)
  const fluency = Math.round(
    (rhythmScore + Math.min(rhythmAnalysis.speakingRate / 180 * 100, 100)) / 2
  );

  // 원어민다움 점수
  const nativelikeness = Math.round(
    (segmentalScore + suprasegmentalScore + stressScore) / 3 * 0.8  // 최대 80점
  );

  // CEFR 발음 레벨 결정
  let cefrLevel = 'A1';
  if (overallScore >= 90) cefrLevel = 'C2';
  else if (overallScore >= 80) cefrLevel = 'C1';
  else if (overallScore >= 70) cefrLevel = 'B2';
  else if (overallScore >= 60) cefrLevel = 'B1';
  else if (overallScore >= 45) cefrLevel = 'A2';

  // 강점 및 약점 파악
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (segmentalScore >= 80) strengths.push('Clear individual sound production');
  else if (segmentalScore < 60) weaknesses.push('Individual sound accuracy needs improvement');

  if (suprasegmentalScore >= 80) strengths.push('Natural intonation and rhythm');
  else if (suprasegmentalScore < 60) weaknesses.push('Prosody and speech melody need work');

  if (stressScore >= 80) strengths.push('Good word and sentence stress');
  else if (stressScore < 60) weaknesses.push('Stress placement needs attention');

  if (rhythmAnalysis.isNaturalRhythm) strengths.push('Natural speaking rhythm');
  else weaknesses.push('Speaking rhythm is not yet natural');

  // 부분 평가 결과로 권장사항 생성
  const partialEval: Partial<ComprehensivePronunciationEvaluation> = {
    overallScore,
    scores: { segmental: segmentalScore, suprasegmental: suprasegmentalScore,
              intelligibility, fluency, nativelikeness },
    errors,
    weaknesses
  };

  const recommendations = await generateRecommendations(ai, partialEval);

  // 다음 레벨 요구사항
  const nextLevelRequirements: string[] = [];
  if (cefrLevel === 'A1') {
    nextLevelRequirements.push('Master basic consonant and vowel sounds');
    nextLevelRequirements.push('Develop consistent word stress');
    nextLevelRequirements.push('Practice basic intonation patterns');
  } else if (cefrLevel === 'A2') {
    nextLevelRequirements.push('Improve difficult consonant clusters');
    nextLevelRequirements.push('Refine sentence stress and rhythm');
    nextLevelRequirements.push('Develop natural intonation for questions');
  } else if (cefrLevel === 'B1') {
    nextLevelRequirements.push('Perfect problematic phonemes (e.g., th, r, l)');
    nextLevelRequirements.push('Master connected speech and linking');
    nextLevelRequirements.push('Improve speech flow and naturalness');
  } else if (cefrLevel === 'B2') {
    nextLevelRequirements.push('Refine subtle pronunciation differences');
    nextLevelRequirements.push('Develop more native-like prosody');
    nextLevelRequirements.push('Reduce L1 interference in all contexts');
  } else if (cefrLevel === 'C1') {
    nextLevelRequirements.push('Perfect pronunciation in all contexts');
    nextLevelRequirements.push('Master regional variations and nuances');
    nextLevelRequirements.push('Achieve near-native fluency and naturalness');
  }

  return {
    overallScore,
    scores: {
      segmental: segmentalScore,
      suprasegmental: suprasegmentalScore,
      intelligibility,
      fluency,
      nativelikeness
    },
    phonemeAnalysis,
    intonationPatterns,
    rhythmAnalysis,
    stressAnalysis,
    errors,
    recommendations,
    strengths,
    weaknesses,
    cefrLevel,
    nextLevelRequirements
  };
}
