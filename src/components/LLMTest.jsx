import { useState } from 'react';
import { useLLM } from '../hooks/useLLM';
import { Loader2 } from 'lucide-react';

export default function LLMTest() {
  const { generateText, generateLevelFeedback, generateConversationTopics, loading, error } = useLLM();
  const [result, setResult] = useState('');
  const [testType, setTestType] = useState('text');

  // 텍스트 생성 테스트
  const handleGenerateText = async () => {
    try {
      const text = await generateText(
        '언어 학습의 중요성에 대해 한국어로 짧은 에세이를 작성해주세요.',
        {
          model: 'llama-3.2-3b-instruct',
          temperature: 0.8,
          max_tokens: 500
        }
      );
      setResult(text);
    } catch (error) {
      console.error('Error generating text:', error);
    }
  };

  // 레벨 피드백 생성 테스트
  const handleGenerateFeedback = async () => {
    try {
      const feedback = await generateLevelFeedback(
        {
          grammar: 75,
          vocabulary: 68,
          fluency: 72,
          pronunciation: 65,
          taskAchievement: 78,
          interaction: 70
        },
        'B1'
      );
      setResult(feedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
    }
  };

  // 대화 주제 생성 테스트
  const handleGenerateTopics = async () => {
    try {
      const topics = await generateConversationTopics(
        'B1',
        ['technology', 'travel', 'cooking', 'sports'],
        'English'
      );
      setResult(topics.join('\n'));
    } catch (error) {
      console.error('Error generating topics:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">LLM API Test</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Test Type</label>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="text">Text Generation</option>
          <option value="feedback">Level Feedback</option>
          <option value="topics">Conversation Topics</option>
        </select>
      </div>

      <div className="mb-6 space-x-4">
        {testType === 'text' && (
          <button
            onClick={handleGenerateText}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Generating...
              </span>
            ) : (
              'Generate Text'
            )}
          </button>
        )}

        {testType === 'feedback' && (
          <button
            onClick={handleGenerateFeedback}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Generating...
              </span>
            ) : (
              'Generate Feedback'
            )}
          </button>
        )}

        {testType === 'topics' && (
          <button
            onClick={handleGenerateTopics}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Generating...
              </span>
            ) : (
              'Generate Topics'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
}