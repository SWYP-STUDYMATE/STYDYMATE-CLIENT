# LLM Text Generation API Documentation

The LLM API provides access to Cloudflare Workers AI's language models for text generation, chat completion, and specialized language learning features.

## Base URL
```
https://your-worker.workers.dev/api/llm
```

## Available Models

| Model ID | Name | Context Window | Function Calling | Cost (per M tokens) |
|----------|------|----------------|------------------|---------------------|
| `llama-3.3-70b-instruct-fp8-fast` | Llama 3.3 70B (Fast) | 24,000 | ✅ | $0.29 in / $2.25 out |
| `llama-3.2-3b-instruct` | Llama 3.2 3B | 128,000 | ❌ | $0.051 in / $0.34 out |
| `llama-4-scout-17b-16e-instruct` | Llama 4 Scout 17B | 131,000 | ✅ | $0.27 in / $0.85 out |
| `llama-3.1-8b-instruct` | Llama 3.1 8B | 7,968 | ❌ | $0.28 in / $0.83 out |
| `llama-3-8b-instruct` | Llama 3 8B | 8,192 | ❌ | $0.28 in / $0.83 out |
| `llama-2-7b-chat-fp16` | Llama 2 7B | 4,096 | ❌ | $0.56 in / $6.67 out |

## Endpoints

### 1. Get Available Models
```http
GET /api/llm/models
```

Returns a list of available models with their specifications.

**Response:**
```json
{
  "models": [
    {
      "id": "@cf/meta/llama-3.2-3b-instruct",
      "name": "Llama 3.2 3B",
      "contextWindow": 128000,
      "supportsTools": false,
      "costPerMInput": 0.051,
      "costPerMOutput": 0.34
    }
    // ... more models
  ]
}
```

### 2. Text Generation
```http
POST /api/llm/generate
```

Generate text from a prompt using specified model and parameters.

**Request Body:**
```json
{
  "prompt": "Write a short story about a robot learning to paint",
  "model": "llama-3.2-3b-instruct", // optional, defaults to llama-3.2-3b-instruct
  "stream": false, // optional, enable streaming response
  "max_tokens": 1024, // optional, default 1024
  "temperature": 0.7, // optional, default 0.7
  "top_p": 0.9, // optional, default 0.9
  "top_k": 40, // optional, default 40
  "repetition_penalty": 1.1, // optional, default 1.1
  "frequency_penalty": 0, // optional, default 0
  "presence_penalty": 0, // optional, default 0
  "seed": 12345 // optional, for reproducible results
}
```

**Response:**
```json
{
  "text": "Once upon a time, in a factory far away...",
  "model": "@cf/meta/llama-3.2-3b-instruct",
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 256,
    "total_tokens": 268
  }
}
```

### 3. Chat Completion
```http
POST /api/llm/chat/completions
```

Generate chat-based completions with conversation history.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful language learning assistant."
    },
    {
      "role": "user",
      "content": "How do I improve my English pronunciation?"
    }
  ],
  "model": "llama-3.2-3b-instruct", // optional
  "stream": false, // optional
  "max_tokens": 1024, // optional
  "temperature": 0.7, // optional
  "response_format": { // optional, for JSON responses
    "type": "json_object"
  },
  "tools": [ // optional, for function calling (only supported models)
    {
      "type": "function",
      "function": {
        "name": "get_pronunciation_tips",
        "description": "Get pronunciation tips for a specific word",
        "parameters": {
          "type": "object",
          "properties": {
            "word": {
              "type": "string",
              "description": "The word to get pronunciation tips for"
            }
          },
          "required": ["word"]
        }
      }
    }
  ]
}
```

**Response:**
```json
{
  "text": "Improving English pronunciation requires consistent practice...",
  "model": "@cf/meta/llama-3.2-3b-instruct",
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 128,
    "total_tokens": 173
  },
  "tool_calls": [ // if tools were provided and model supports it
    {
      "name": "get_pronunciation_tips",
      "arguments": {
        "word": "pronunciation"
      }
    }
  ]
}
```

### 4. Level Feedback Generation
```http
POST /api/llm/level-feedback
```

Generate personalized feedback based on language assessment results.

**Request Body:**
```json
{
  "analysis": {
    "grammar": 75,
    "vocabulary": 68,
    "fluency": 72,
    "pronunciation": 65,
    "taskAchievement": 78,
    "interaction": 70
  },
  "level": "B1"
}
```

**Response:**
```json
{
  "feedback": "Overall Assessment:\nYou've demonstrated solid B1 level proficiency with consistent performance across all areas. Your task achievement score of 78 shows you can effectively communicate your ideas.\n\nStrengths:\n- Good grammatical control with 75% accuracy\n- Strong task completion abilities\n- Balanced skill development across all areas\n\nAreas for Improvement:\n- Pronunciation (65%) needs focused practice\n- Vocabulary range could be expanded\n- Fluency can be enhanced with more practice\n\nStudy Recommendations:\n1. Practice shadowing native speakers for pronunciation\n2. Learn 10 new words daily with spaced repetition\n3. Engage in 15-minute daily speaking practice\n4. Record yourself and compare with native speakers\n\nNext Steps to B2:\nFocus on expanding vocabulary to 3,000-4,000 words, improve pronunciation clarity, and practice expressing complex ideas fluently."
}
```

### 5. Conversation Topics Generation
```http
POST /api/llm/conversation-topics
```

Generate conversation topics based on learner level and interests.

**Request Body:**
```json
{
  "level": "B1",
  "interests": ["technology", "travel", "cooking"],
  "language": "English"
}
```

**Response:**
```json
{
  "topics": [
    "How has technology changed the way we travel?",
    "Describe your favorite local dish and how to prepare it",
    "What mobile apps do you find most useful in daily life?",
    "Share a memorable travel experience and what you learned",
    "How do cooking traditions differ between cultures?"
  ]
}
```

### 6. Session Summary Generation
```http
POST /api/llm/session-summary
```

Generate a comprehensive summary of a language learning session.

**Request Body:**
```json
{
  "transcript": "Student: Hello, how are you today? Teacher: I'm doing well, thank you. How was your weekend? Student: It was great! I went to the park with my family...",
  "duration": 1800, // in seconds
  "participants": ["Student123", "Teacher456"]
}
```

**Response:**
```json
{
  "keyPoints": [
    "Discussed weekend activities",
    "Practiced past tense verbs",
    "Talked about family relationships",
    "Described outdoor activities"
  ],
  "vocabularyUsed": [
    "weekend", "family", "park", "activities",
    "enjoyed", "visited", "played", "weather"
  ],
  "grammarPatterns": [
    "Past simple tense",
    "Present perfect",
    "Question formation",
    "Time expressions"
  ],
  "speakingTime": {
    "Student123": 45,
    "Teacher456": 55
  },
  "suggestions": [
    "Practice more complex sentence structures",
    "Work on pronunciation of past tense endings",
    "Expand vocabulary for describing experiences",
    "Focus on natural conversation flow"
  ],
  "overallRating": 7
}
```

## Streaming Responses

For endpoints that support streaming (`generate` and `chat/completions`), set `stream: true` to receive Server-Sent Events:

```javascript
const response = await fetch('/api/llm/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    prompt: "Tell me a story",
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log('Received:', chunk);
}
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized
- `500`: Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

## Rate Limits

- Default: 100 requests per minute per API key
- Streaming requests count as 1 request regardless of duration
- Model-specific limits may apply based on compute requirements

## Best Practices

1. **Model Selection**
   - Use smaller models (3B-8B) for simple tasks and lower latency
   - Use larger models (70B) for complex reasoning and better quality
   - Consider cost vs. performance tradeoffs

2. **Temperature Settings**
   - Lower (0.1-0.5): More focused, deterministic outputs
   - Medium (0.6-0.8): Balanced creativity and coherence
   - Higher (0.9-1.0): More creative, varied outputs

3. **Token Optimization**
   - Set appropriate `max_tokens` to control costs
   - Use system prompts efficiently
   - Consider response format options for structured data

4. **Error Handling**
   - Implement retry logic for transient failures
   - Handle streaming disconnections gracefully
   - Validate inputs before sending requests