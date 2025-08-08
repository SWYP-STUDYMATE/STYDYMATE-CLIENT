import { useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export function useLLM() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 텍스트 생성
  const generateText = useCallback(async (prompt, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/llm/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt,
          ...options
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.text;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 채팅 완성
  const generateChatCompletion = useCallback(async (messages, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/llm/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          messages,
          ...options
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 레벨 피드백 생성
  const generateLevelFeedback = useCallback(async (analysis, level) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/llm/level-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          analysis,
          level
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.feedback;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 대화 주제 생성
  const generateConversationTopics = useCallback(async (level, interests, language) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/llm/conversation-topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          level,
          interests,
          language
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.topics;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 세션 요약 생성
  const generateSessionSummary = useCallback(async (transcript, duration, participants) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/llm/session-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          transcript,
          duration,
          participants
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 스트리밍 텍스트 생성
  const generateTextStream = useCallback(async (prompt, options = {}, onChunk) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/llm/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt,
          stream: true,
          ...options
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullText += chunk;
        
        if (onChunk) {
          onChunk(chunk, fullText);
        }
      }

      return fullText;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateText,
    generateChatCompletion,
    generateLevelFeedback,
    generateConversationTopics,
    generateSessionSummary,
    generateTextStream
  };
}

// 사용 예시
/*
import { useLLM } from './hooks/useLLM';

function MyComponent() {
  const { generateText, generateLevelFeedback, loading, error } = useLLM();

  const handleGenerateText = async () => {
    try {
      const text = await generateText('Write a short story about learning a new language', {
        model: 'llama-3.2-3b-instruct',
        temperature: 0.8,
        max_tokens: 500
      });
      console.log(text);
    } catch (error) {
      console.error('Error generating text:', error);
    }
  };

  const handleGenerateFeedback = async () => {
    try {
      const feedback = await generateLevelFeedback({
        grammar: 75,
        vocabulary: 68,
        fluency: 72,
        pronunciation: 65,
        taskAchievement: 78,
        interaction: 70
      }, 'B1');
      console.log(feedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateText} disabled={loading}>
        Generate Text
      </button>
      <button onClick={handleGenerateFeedback} disabled={loading}>
        Generate Feedback
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
*/