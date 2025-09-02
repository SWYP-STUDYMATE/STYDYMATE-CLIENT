# LLM 통합 구현 계획

## 📋 현재 상태
- **화상 통화**: ✅ 기본 구현 완료 (WebRTC + Workers API)
- **LLM 평가**: ❌ 미구현 (더미 데이터 사용 중)

## 🎯 LLM 통합이 필요한 기능

### 1. 레벨 테스트 평가
```java
// 필요한 구현 위치: 
// /STUDYMATE-SERVER/src/main/java/com/studymate/domain/leveltest/service/impl/LevelTestServiceImpl.java

@Service
public class LevelTestServiceImpl {
    
    @Value("${openai.api.key}")
    private String openaiApiKey;
    
    public LevelTestResponse processVoiceTest(UUID userId, Long testId) {
        // 1. 음성을 텍스트로 변환 (Workers API - Whisper)
        String transcript = workersApiClient.transcribeAudio(audioUrl);
        
        // 2. LLM으로 평가 요청
        String evaluation = evaluateWithLLM(transcript, testQuestions);
        
        // 3. 결과 파싱 및 저장
        return saveLevelTestResult(evaluation);
    }
    
    private String evaluateWithLLM(String transcript, List<Question> questions) {
        // OpenAI API 호출
        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model("gpt-4")
            .messages(List.of(
                new ChatMessage("system", EVALUATION_PROMPT),
                new ChatMessage("user", transcript)
            ))
            .build();
            
        return openAIClient.createChatCompletion(request);
    }
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

### Option 1: Spring Boot에 OpenAI 통합
**장점**: 
- 중앙화된 관리
- 데이터베이스 연동 용이

**단점**: 
- 응답 속도 느림
- 서버 부하 증가

**구현**:
```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.theokanning.openai-gpt3-java</groupId>
    <artifactId>service</artifactId>
    <version>0.16.0</version>
</dependency>
```

```yaml
# application.yml
openai:
  api:
    key: ${OPENAI_API_KEY}
    model: gpt-4
    temperature: 0.7
```

### Option 2: Workers API에 LLM 통합 (추천)
**장점**: 
- 빠른 응답 (엣지 실행)
- 자동 스케일링
- 실시간 처리 최적화

**단점**: 
- 별도 API 키 관리 필요

**구현**:
```javascript
// workers-api/src/handlers/ai.js
export async function handleLevelTestEvaluation(request, env) {
    const { transcript, questions } = await request.json();
    
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
1. Workers API에 OpenAI 통합
2. 평가 프롬프트 최적화
3. 결과 구조화 및 저장

### Phase 2: 실시간 피드백 (선택)
1. 화상 통화 중 실시간 전사
2. 문법/발음 오류 감지
3. 실시간 교정 제안

### Phase 3: 학습 추천 시스템 (미래)
1. 개인화된 학습 경로
2. 약점 기반 콘텐츠 추천
3. 진도 추적 및 분석

## 💰 비용 예상

### OpenAI GPT-4 기준
- 입력: $0.03 / 1K tokens
- 출력: $0.06 / 1K tokens
- 레벨 테스트 1회: 약 $0.10-0.20

### 월간 예상 비용 (1000명 기준)
- 레벨 테스트: $100-200
- 실시간 피드백: $500-1000

## ⚠️ 주의사항

1. **API 키 보안**
   - 환경 변수 사용
   - 키 로테이션 정책

2. **Rate Limiting**
   - 분당 요청 제한
   - 재시도 로직 구현

3. **비용 관리**
   - 사용량 모니터링
   - 예산 알림 설정

4. **프롬프트 최적화**
   - A/B 테스트
   - 지속적 개선

## 📌 다음 단계

1. **OpenAI API 키 발급**
2. **Workers API에 LLM 핸들러 추가**
3. **레벨 테스트 플로우 연동**
4. **테스트 및 프롬프트 튜닝**