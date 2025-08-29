# 레벨 테스트 API 프론트엔드 통합 가이드

## 📋 현재 문제점 및 해결 방안

### 🚨 발견된 문제점들

#### 1. API 엔드포인트 불일치
```javascript
// ❌ 문제: POST로 GET 엔드포인트 호출
fetch(`${API_BASE_URL}/level-test/questions`, {
  method: 'POST',  // 잘못됨
  body: JSON.stringify({userId})  // 불필요한 body
});

// ✅ 수정: 올바른 GET 요청
fetch(`${API_BASE_URL}/level-test/questions`, {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### 2. 인증 토큰 키 불일치
```javascript
// ❌ 문제: 일관되지 않은 토큰 키 사용
localStorage.getItem('token')        // 일부 함수
localStorage.getItem('accessToken')  // 다른 함수

// ✅ 수정: 'accessToken'으로 통일
localStorage.getItem('accessToken')
```

#### 3. 잘못된 엔드포인트 사용
```javascript
// ❌ 문제: 잘못된 진행상황 조회
fetch(`${API_BASE_URL}/level-test/analyze`, { method: 'POST' });

// ✅ 수정: 올바른 진행상황 조회
fetch(`${API_BASE_URL}/level-test/progress/${userId}`, { method: 'GET' });
```

### 🔧 즉시 적용 가능한 수정사항

#### 1. `/src/api/levelTest.js` 수정
```javascript
// 수정된 API 클라이언트 적용
import { 
  getLevelTestQuestions,
  submitLevelTest, 
  completeLevelTest,
  getLevelTestResult,
  getLevelTestProgress 
} from './levelTest';

// 또는 개선된 API 클라이언트 사용
import levelTestAPI from './levelTestAPI';

// 사용 예시
try {
  const questions = await levelTestAPI.getQuestions();
  const result = await levelTestAPI.submitAnswer(audioBlob, 1);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('입력 검증 오류:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('네트워크 오류:', error.message);
  }
}
```

## 🎯 프론트엔드 컴포넌트별 통합 방안

### 1. LevelTestStart 컴포넌트

#### 현재 상태
- 질문 목록을 로드해야 함
- 테스트 세션 초기화 필요

#### 권장 구현
```javascript
// LevelTestStart.jsx
import { useState, useEffect } from 'react';
import levelTestAPI from '../api/levelTestAPI';
import useLevelTestStore from '../store/levelTestStore';

export default function LevelTestStart() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { setQuestions, resetTest } = useLevelTestStore();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const questionsData = await levelTestAPI.getQuestions();
      setQuestions(questionsData);
      setQuestions(questionsData); // store에도 저장
      
    } catch (error) {
      setError(error.message);
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    resetTest(); // 이전 테스트 데이터 클리어
    navigate('/level-test/recording');
  };

  if (loading) {
    return <LoadingSpinner message="질문을 불러오는 중..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadQuestions}
        retryLabel="다시 시도"
      />
    );
  }

  return (
    <div>
      {/* 테스트 소개 UI */}
      <p>{questions.length}개의 질문이 준비되었습니다.</p>
      <CommonButton onClick={startTest}>테스트 시작</CommonButton>
    </div>
  );
}
```

### 2. LevelTestRecording 컴포넌트

#### 현재 문제점
- API 에러 처리 부족
- 로딩 상태 관리 미흡
- 네트워크 오류 시 재시도 로직 없음

#### 권장 구현
```javascript
// LevelTestRecording.jsx (주요 부분 개선)
import { useState } from 'react';
import levelTestAPI, { APIError, NetworkError } from '../api/levelTestAPI';

export default function LevelTestRecording() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleNext = async () => {
    if (!hasRecording || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const userId = localStorage.getItem('userId') || 'guest';
      const result = await levelTestAPI.submitAnswer(
        currentRecording.blob, 
        currentQuestionIndex + 1
      );
      
      // 성공 처리
      console.log('Submission successful:', result);
      
      if (currentQuestionIndex < totalQuestions - 1) {
        nextQuestion();
      } else {
        // 테스트 완료
        await completeTest();
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error);
      
      // 사용자 친화적 에러 메시지
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      
      if (error instanceof NetworkError) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else if (error.code === 'FILE_TOO_LARGE') {
        errorMessage = '음성 파일이 너무 큽니다. 다시 녹음해주세요.';
      } else if (error.code === 'TRANSCRIPTION_FAILED') {
        errorMessage = '음성 인식에 실패했습니다. 다시 시도해주세요.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      // 사용자에게 알림
      alert(errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeTest = async () => {
    try {
      setTestStatus('processing');
      
      const userId = localStorage.getItem('userId') || 'guest';
      const result = await levelTestAPI.completeTest(userId);
      
      setTestResult(result);
      navigate('/level-test/result');
      
    } catch (error) {
      console.error('Test completion error:', error);
      
      if (error.code === 'INSUFFICIENT_SUBMISSIONS') {
        alert('평가를 위해 더 많은 답변이 필요합니다.');
        return;
      }
      
      alert('테스트 완료 처리 중 오류가 발생했습니다.');
    }
  };

  // 재시도 로직
  const retrySubmission = async () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      await handleNext();
    } else {
      alert('여러 번 시도했지만 실패했습니다. 나중에 다시 시도해주세요.');
    }
  };

  return (
    <div>
      {/* 기존 UI */}
      
      {/* 에러 표시 */}
      {submitError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 text-sm">{submitError.message}</p>
          {submitError instanceof NetworkError && retryCount < 3 && (
            <button 
              onClick={retrySubmission}
              className="mt-2 text-sm text-red-600 underline"
            >
              다시 시도 ({retryCount + 1}/3)
            </button>
          )}
        </div>
      )}
      
      {/* 제출 버튼 */}
      <CommonButton
        onClick={handleNext}
        disabled={isSubmitting}
        variant="primary"
      >
        {isSubmitting ? (
          <>
            <Spinner className="mr-2" />
            {currentQuestionIndex < totalQuestions - 1 ? '제출 중...' : '완료 처리 중...'}
          </>
        ) : (
          currentQuestionIndex < totalQuestions - 1 ? '다음 질문' : '테스트 완료'
        )}
      </CommonButton>
    </div>
  );
}
```

### 3. LevelTestResult 컴포넌트

#### 권장 구현
```javascript
// LevelTestResult.jsx
import { useState, useEffect } from 'react';
import levelTestAPI from '../api/levelTestAPI';

export default function LevelTestResult() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = localStorage.getItem('userId') || 'guest';
      const resultData = await levelTestAPI.getResult(userId);
      
      setResult(resultData);
      
    } catch (error) {
      setError(error);
      console.error('Failed to load result:', error);
      
      if (error.code === 'RESULT_NOT_FOUND') {
        // 결과가 없으면 테스트 페이지로 리다이렉트
        setTimeout(() => {
          navigate('/level-test/start');
        }, 3000);
      }
      
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="결과를 불러오는 중..." />;
  }

  if (error) {
    return (
      <ErrorMessage>
        <h2>결과를 불러올 수 없습니다</h2>
        <p>{error.message}</p>
        {error.code === 'RESULT_NOT_FOUND' && (
          <p>잠시 후 테스트 페이지로 이동합니다...</p>
        )}
        <CommonButton onClick={loadResult}>다시 시도</CommonButton>
      </ErrorMessage>
    );
  }

  return (
    <div>
      {/* 결과 표시 UI */}
      <div className="result-card">
        <h1>레벨: {result.level}</h1>
        <p>전체 점수: {result.overallScore}/100</p>
        
        {/* 세부 점수 */}
        <div className="scores">
          {Object.entries(result.scores).map(([category, score]) => (
            <div key={category} className="score-item">
              <span>{category}: {score}</span>
            </div>
          ))}
        </div>
        
        {/* 피드백 */}
        <div className="feedback">
          <h3>상세 피드백</h3>
          <p>{result.feedback}</p>
          
          {result.strengths.length > 0 && (
            <div>
              <h4>강점</h4>
              <ul>
                {result.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}
          
          {result.improvements.length > 0 && (
            <div>
              <h4>개선점</h4>
              <ul>
                {result.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## 🔄 상태 관리 개선 (Zustand Store)

### 현재 Store 문제점
- API 에러 상태 관리 부족
- 로딩 상태 표준화 필요
- 데이터 동기화 문제

### 권장 Store 구조
```javascript
// store/levelTestStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import levelTestAPI from '../api/levelTestAPI';

const useLevelTestStore = create(
  persist(
    (set, get) => ({
      // 상태
      questions: [],
      currentQuestionIndex: 0,
      recordings: [],
      testStatus: 'idle', // idle, recording, processing, completed, error
      result: null,
      
      // 로딩 및 에러 상태
      loading: {
        questions: false,
        submission: false,
        completion: false,
        result: false
      },
      
      errors: {
        questions: null,
        submission: null,
        completion: null,
        result: null
      },

      // Actions
      setLoading: (type, isLoading) => 
        set(state => ({
          loading: { ...state.loading, [type]: isLoading }
        })),

      setError: (type, error) =>
        set(state => ({
          errors: { ...state.errors, [type]: error }
        })),

      clearError: (type) =>
        set(state => ({
          errors: { ...state.errors, [type]: null }
        })),

      // 질문 로드
      loadQuestions: async () => {
        const { setLoading, setError } = get();
        
        try {
          setLoading('questions', true);
          setError('questions', null);
          
          const questions = await levelTestAPI.getQuestions();
          set({ questions });
          
        } catch (error) {
          setError('questions', error);
          throw error;
        } finally {
          setLoading('questions', false);
        }
      },

      // 답변 제출
      submitAnswer: async (audioBlob, questionNumber) => {
        const { setLoading, setError } = get();
        
        try {
          setLoading('submission', true);
          setError('submission', null);
          
          const result = await levelTestAPI.submitAnswer(audioBlob, questionNumber);
          
          // 녹음 데이터 저장
          set(state => ({
            recordings: [
              ...state.recordings.filter(r => r.questionIndex !== questionNumber - 1),
              {
                questionIndex: questionNumber - 1,
                blob: audioBlob,
                transcription: result.transcription,
                timestamp: new Date().toISOString()
              }
            ]
          }));
          
          return result;
          
        } catch (error) {
          setError('submission', error);
          throw error;
        } finally {
          setLoading('submission', false);
        }
      },

      // 테스트 완료
      completeTest: async (userId) => {
        const { setLoading, setError } = get();
        
        try {
          setLoading('completion', true);
          setError('completion', null);
          set({ testStatus: 'processing' });
          
          const result = await levelTestAPI.completeTest(userId);
          
          set({ 
            result,
            testStatus: 'completed'
          });
          
          return result;
          
        } catch (error) {
          setError('completion', error);
          set({ testStatus: 'error' });
          throw error;
        } finally {
          setLoading('completion', false);
        }
      },

      // 결과 로드
      loadResult: async (userId) => {
        const { setLoading, setError } = get();
        
        try {
          setLoading('result', true);
          setError('result', null);
          
          const result = await levelTestAPI.getResult(userId);
          set({ result });
          
          return result;
          
        } catch (error) {
          setError('result', error);
          throw error;
        } finally {
          setLoading('result', false);
        }
      },

      // 리셋
      resetTest: () => set({
        currentQuestionIndex: 0,
        recordings: [],
        testStatus: 'idle',
        result: null,
        errors: {
          questions: null,
          submission: null,
          completion: null,
          result: null
        }
      })
    }),
    {
      name: 'level-test-storage',
      // 민감한 데이터는 저장하지 않음
      partialize: (state) => ({
        currentQuestionIndex: state.currentQuestionIndex,
        testStatus: state.testStatus,
        // recordings와 result는 세션 스토리지 사용
      })
    }
  )
);

export default useLevelTestStore;
```

## 🎨 UI/UX 개선 사항

### 1. 로딩 상태 개선
```javascript
// components/LoadingSpinner.jsx
export function LoadingSpinner({ message = '로딩 중...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-green-500 ${sizeClasses[size]}`} />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}
```

### 2. 에러 메시지 개선
```javascript
// components/ErrorMessage.jsx
export function ErrorMessage({ error, onRetry, retryLabel = '다시 시도' }) {
  const getErrorMessage = (error) => {
    if (error instanceof NetworkError) {
      return {
        title: '네트워크 연결 오류',
        message: '인터넷 연결을 확인하고 다시 시도해주세요.',
        icon: '🌐'
      };
    } else if (error instanceof ValidationError) {
      return {
        title: '입력 오류',
        message: error.message,
        icon: '⚠️'
      };
    } else {
      return {
        title: '오류 발생',
        message: error.message || '알 수 없는 오류가 발생했습니다.',
        icon: '❌'
      };
    }
  };

  const { title, message, icon } = getErrorMessage(error);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      
      {onRetry && (
        <CommonButton onClick={onRetry} variant="primary">
          {retryLabel}
        </CommonButton>
      )}
    </div>
  );
}
```

### 3. 진행률 표시 개선
```javascript
// components/TestProgress.jsx
export function TestProgress({ 
  current, 
  total, 
  showPercentage = true,
  showSteps = true 
}) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      {showSteps && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>질문 {current} / {total}</span>
          {showPercentage && <span>{percentage}% 완료</span>}
        </div>
      )}
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

## ⚡ 성능 최적화 팁

### 1. 음성 파일 최적화
```javascript
// utils/audioOptimizer.js
export const optimizeAudioBlob = async (blob, maxSize = 5 * 1024 * 1024) => {
  if (blob.size <= maxSize) {
    return blob;
  }

  // AudioContext를 사용한 압축 (웹에서 지원하는 경우)
  try {
    const audioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // 샘플링 레이트 조정
    const targetSampleRate = Math.min(audioBuffer.sampleRate, 16000);
    const offlineContext = new OfflineAudioContext(
      1, // mono
      audioBuffer.duration * targetSampleRate,
      targetSampleRate
    );
    
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();
    
    const renderedBuffer = await offlineContext.startRendering();
    
    // WAV로 변환 (간단한 압축)
    return bufferToWav(renderedBuffer);
    
  } catch (error) {
    console.warn('Audio optimization failed, using original:', error);
    return blob;
  }
};
```

### 2. 지연 로딩 및 프리페칭
```javascript
// 컴포넌트 지연 로딩
const LevelTestResult = lazy(() => import('./pages/LevelTest/LevelTestResult'));

// 라우팅에서 사용
<Route 
  path="/level-test/result" 
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <LevelTestResult />
    </Suspense>
  } 
/>

// 음성 파일 프리페치
const prefetchAudioFile = (userId, questionId) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = levelTestAPI.getAudioURL(userId, questionId);
  document.head.appendChild(link);
};
```

### 3. 메모리 관리
```javascript
// AudioRecorder 컴포넌트에서 메모리 정리
useEffect(() => {
  return () => {
    // 녹음 스트림 정리
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    // 오디오 URL 해제
    if (audioURLRef.current) {
      URL.revokeObjectURL(audioURLRef.current);
    }
  };
}, []);
```

## 📱 모바일 최적화

### 1. 터치 인터페이스 개선
```css
/* 터치 타겟 최소 크기 보장 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* iOS Safari 확대 방지 */
input, textarea, select {
  font-size: 16px;
}

/* 터치 하이라이트 제거 */
* {
  -webkit-tap-highlight-color: transparent;
}
```

### 2. 네트워크 상태 감지
```javascript
// hooks/useNetworkStatus.js
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState(
    navigator.connection?.effectiveType || 'unknown'
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleConnectionChange = () => {
      setConnectionType(navigator.connection?.effectiveType || 'unknown');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.connection?.addEventListener('change', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.connection?.removeEventListener('change', handleConnectionChange);
    };
  }, []);

  return { isOnline, connectionType };
};

// 사용 예시
const { isOnline, connectionType } = useNetworkStatus();

if (!isOnline) {
  return <OfflineMessage />;
}

if (connectionType === 'slow-2g' || connectionType === '2g') {
  return <SlowConnectionWarning />;
}
```

이러한 개선사항들을 단계적으로 적용하면 안정적이고 사용자 친화적인 레벨 테스트 경험을 제공할 수 있습니다.