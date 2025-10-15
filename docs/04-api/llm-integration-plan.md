# LLM 통합 구현 계획

## 📋 현재 상태
- **화상 통화**: ✅ 기본 구현 완료 (WebRTC + Cloudflare Workers)
- **LLM 평가**: ❌ 미구현 (더미 데이터 사용 중)

## 🎯 LLM 통합이 필요한 기능

### 1. 레벨 테스트 평가
```typescript
// 필요한 구현 위치:
// /workers/src/handlers/leveltest.ts

export async function processVoiceTest(
  env: Env,
  userId: string,
  testId: string
): Promise<LevelTestResponse> {
  // 1. 음성을 텍스트로 변환 (Cloudflare AI - Whisper)
  const transcript = await transcribeAudio(env, audioUrl);

  // 2. LLM으로 평가 요청 (Cloudflare AI Workers)
  const evaluation = await evaluateWithLLM(env, transcript, testQuestions);

  // 3. 결과 파싱 및 저장
  return saveLevelTestResult(env, evaluation);
}

async function evaluateWithLLM(
  env: Env,
  transcript: string,
  questions: Question[]
): Promise<Evaluation> {
  // Cloudflare AI Workers 호출
  const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
    messages: [
      { role: 'system', content: EVALUATION_PROMPT },
      { role: 'user', content: `Transcript: ${transcript}` }
    ]
  });

  return response;
}
```

### 2. 실시간 대화 피드백 (화상 통화 중)
```javascript
// 프론트엔드: /src/pages/Session/VideoSession.jsx
// 실시간 자막 + AI 피드백

const handleRealtimeTranscript = async (transcript) => {
    // Workers API로 실시간 분석
    const feedback = await fetch(API_ENDPOINTS.WORKERS.AI_FEEDBACK, {
        method: 'POST',
        body: JSON.stringify({ 
            transcript,
            context: 'conversation',
            language: currentLanguage 
        })
    });
    
    setAIFeedback(feedback);
};
```

## 🔧 구현 방법

### Option 1: Cloudflare AI Workers 통합 (추천)
**장점**:
- Cloudflare 인프라 내에서 실행 (낮은 레이턴시)
- 자동 스케일링 및 비용 최적화
- 별도 API 키 불필요

**단점**:
- 제한된 모델 선택

**구현**:
```ts
// workers/src/routes/llm.ts
import { Hono } from 'hono';

const llmRoutes = new Hono();

llmRoutes.post('/chat', async (c) => {
  const body = await c.req.json();

  // Cloudflare AI Workers 사용
  const response = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
    messages: body.messages
  });

  return c.json({ success: true, data: response });
});

export default llmRoutes;
```

### Option 2: OpenAI API 통합
**장점**:
- 고품질 모델 (GPT-4)
- 다양한 기능 지원

**단점**:
- 외부 API 호출 레이턴시
- 별도 비용 발생

**구현**:
```typescript
// workers/src/handlers/ai.ts
export async function handleLevelTestEvaluation(
  env: Env,
  transcript: string,
  questions: Question[]
): Promise<Evaluation> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: LEVEL_TEST_EVALUATION_PROMPT
        },
        {
          role: 'user',
          content: `Transcript: ${transcript}\nQuestions: ${questions}`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
  });

  const result = await response.json();

  // 평가 결과 구조화
  return {
    level: extractLevel(result),
    scores: {
      pronunciation: extractScore(result, 'pronunciation'),
      fluency: extractScore(result, 'fluency'),
      grammar: extractScore(result, 'grammar'),
      vocabulary: extractScore(result, 'vocabulary')
    },
    feedback: result.choices[0].message.content
  };
}
```

## 📝 평가 프롬프트 예시

```javascript
const LEVEL_TEST_EVALUATION_PROMPT = `
You are an expert English language assessor. Evaluate the speaker's English proficiency based on CEFR standards.

Analyze the following aspects:
1. Pronunciation & Accent (0-100)
2. Fluency & Coherence (0-100)
3. Grammar Accuracy (0-100)
4. Vocabulary Range (0-100)
5. Interactive Communication (0-100)

Return a JSON object with:
{
  "cefrLevel": "A1|A2|B1|B2|C1|C2",
  "overallScore": 0-100,
  "pronunciation": 0-100,
  "fluency": 0-100,
  "grammar": 0-100,
  "vocabulary": 0-100,
  "interaction": 0-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
`;
```

## 🚀 구현 우선순위

### Phase 1: 레벨 테스트 LLM 평가 (필수)
1. Cloudflare Workers에 LLM 통합
2. 평가 프롬프트 최적화
3. 결과 구조화 및 D1 저장

### Phase 2: 실시간 피드백 (선택)
1. Durable Objects를 통한 실시간 전사
2. 문법/발음 오류 감지
3. 실시간 교정 제안

### Phase 3: 학습 추천 시스템 (미래)
1. 개인화된 학습 경로
2. 약점 기반 콘텐츠 추천
3. 진도 추적 및 분석

## 💰 비용 예상

### Cloudflare AI Workers 기준
- 무료 tier: 10,000 Neurons/day
- 유료: $0.011 per 1,000 Neurons
- 레벨 테스트 1회: 매우 저렴

### OpenAI GPT-4 기준 (선택 시)
- 입력: $0.03 / 1K tokens
- 출력: $0.06 / 1K tokens
- 레벨 테스트 1회: 약 $0.10-0.20

### 월간 예상 비용 (1000명 기준)
- Cloudflare AI: 거의 무료 ~ $10
- OpenAI (선택): $100-200

## ⚠️ 주의사항

1. **환경 변수 관리**
   - Wrangler secrets 사용
   - 키 로테이션 정책

2. **Rate Limiting**
   - Cloudflare 기본 제한 확인
   - 재시도 로직 구현

3. **비용 관리**
   - Cloudflare Analytics 모니터링
   - 예산 알림 설정

4. **프롬프트 최적화**
   - A/B 테스트
   - 지속적 개선

## 📌 다음 단계

1. **Cloudflare AI Workers 활성화**
2. **Workers에 LLM 핸들러 추가**
3. **레벨 테스트 플로우 연동**
4. **테스트 및 프롬프트 튜닝**
