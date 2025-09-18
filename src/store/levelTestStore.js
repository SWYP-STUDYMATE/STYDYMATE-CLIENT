  import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  startLevelTest,
  getLevelTestQuestions,
  submitVoiceAnswer,
  completeLevelTest,
  getLevelTestResult,
  getUserLevelTests
} from "../api/levelTest";
import { log } from '../utils/logger';
import { handleLevelTestError } from '../utils/errorHandler';

const SCORE_KEYS = ['pronunciation', 'fluency', 'grammar', 'vocabulary', 'coherence', 'interaction'];

const pickFirst = (...candidates) => candidates.find((value) => value !== undefined && value !== null);

const clampToPercent = (value) => {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(100, numeric));
};

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[;,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const pickList = (candidates = []) => {
  for (const candidate of candidates) {
    const list = toArray(candidate);
    if (list.length > 0) {
      return list;
    }
  }
  return [];
};

const extractScore = (sources, key) => {
  for (const source of sources) {
    if (!source) continue;
    const valueFromScores = source.scores?.[key];
    if (valueFromScores !== undefined && valueFromScores !== null) return valueFromScores;
    const valueFromScoresWithSuffix = source.scores?.[`${key}Score`];
    if (valueFromScoresWithSuffix !== undefined && valueFromScoresWithSuffix !== null) return valueFromScoresWithSuffix;
    const direct = source[key];
    if (direct !== undefined && direct !== null) return direct;
    const withSuffix = source[`${key}Score`];
    if (withSuffix !== undefined && withSuffix !== null) return withSuffix;
  }
  return null;
};

const normalizeTestResult = (primary, fallback = null, context = {}) => {
  if (!primary && !fallback) {
    return null;
  }

  const primaryPayload = primary?.data ?? primary;
  const fallbackPayload = fallback?.data ?? fallback;

  const analysisSources = [primaryPayload?.analysis, fallbackPayload?.analysis].filter(Boolean);

  const resolvedTestId = Number(
    pickFirst(
      context.testId,
      primaryPayload?.testId,
      fallbackPayload?.testId,
      primaryPayload?.id,
      fallbackPayload?.id
    )
  );

  const resolvedLevel = pickFirst(
    primaryPayload?.estimatedLevel,
    primaryPayload?.level,
    primaryPayload?.cefrLevel,
    fallbackPayload?.estimatedLevel,
    fallbackPayload?.level,
    fallbackPayload?.cefrLevel,
    context.level
  ) || null;

  const overallScoreCandidate = pickFirst(
    primaryPayload?.overallScore,
    primaryPayload?.estimatedScore,
    primaryPayload?.score,
    primaryPayload?.analysis?.overallScore,
    fallbackPayload?.overallScore,
    fallbackPayload?.estimatedScore,
    context.overallScore
  );

  const scoreSources = [primaryPayload, fallbackPayload, ...analysisSources].filter(Boolean);
  const normalizedScores = SCORE_KEYS.reduce((acc, key) => {
    acc[key] = clampToPercent(extractScore(scoreSources, key));
    return acc;
  }, {});

  const strengths = pickList([
    primaryPayload?.strengths,
    primaryPayload?.analysis?.strengths,
    fallbackPayload?.strengths,
    fallbackPayload?.analysis?.strengths,
    context.strengths
  ]);

  const improvements = pickList([
    primaryPayload?.improvements,
    primaryPayload?.weaknesses,
    primaryPayload?.analysis?.improvements,
    primaryPayload?.analysis?.weaknesses,
    fallbackPayload?.improvements,
    fallbackPayload?.weaknesses,
    fallbackPayload?.analysis?.improvements,
    fallbackPayload?.analysis?.weaknesses,
    context.improvements
  ]);

  const feedback = pickFirst(
    primaryPayload?.analysis?.feedback,
    primaryPayload?.feedback,
    fallbackPayload?.analysis?.feedback,
    fallbackPayload?.feedback,
    context.feedback
  ) || '';

  const completedAt = pickFirst(
    primaryPayload?.completedAt,
    primaryPayload?.date,
    fallbackPayload?.completedAt,
    fallbackPayload?.date,
    context.completedAt
  ) || null;

  return {
    testId: Number.isFinite(resolvedTestId) ? resolvedTestId : null,
    level: resolvedLevel,
    overallScore: clampToPercent(overallScoreCandidate),
    scores: normalizedScores,
    strengths,
    improvements,
    feedback,
    completedAt,
    submissions: context.submissions ?? [],
    updatedAt: new Date().toISOString(),
    raw: {
      primary: primary ?? null,
      fallback: fallback ?? null,
    },
  };
};

const useLevelTestStore = create(
  persist(
    (set, get) => ({
      // 테스트 진행 상태
      testStatus: "idle", // idle, connection-check, recording, processing, completed
      currentQuestionIndex: 0, // 현재 질문 번호 (0-3)
      totalQuestions: 4, // 총 질문 개수
      
      // 연결 상태
      connectionStatus: {
        microphone: false,
        internet: false,
        audioLevel: 0,
      },
      
      // 타이머
      timerSeconds: 180, // 3분 = 180초 (CountdownTimer 컴포넌트용)
      timeRemaining: 180, // 3분 = 180초 (기존 호환성 유지)
      isTimerRunning: false,
      
      // 녹음 데이터
      recordings: [], // {questionIndex, blob, duration, timestamp}[]
      currentRecording: null, // 현재 녹음 중인 데이터
      
      // 테스트 질문들
      questions: [
        {
          id: 1,
          text: "Introduce yourself. Tell me about your name, where you're from, and what you do.",
          korean: "자기소개를 해주세요. 이름, 출신지, 하는 일에 대해 말씀해주세요.",
          duration: 60,
          difficulty: 'A1-A2'
        },
        {
          id: 2,
          text: "Describe your typical day. What do you usually do from morning to evening?",
          korean: "일상적인 하루를 설명해주세요. 아침부터 저녁까지 보통 무엇을 하나요?",
          duration: 90,
          difficulty: 'A2-B1'
        },
        {
          id: 3,
          text: "Talk about a memorable experience you had recently. What happened and how did you feel?",
          korean: "최근에 있었던 기억에 남는 경험에 대해 이야기해주세요. 무슨 일이 있었고 어떻게 느꼈나요?",
          duration: 120,
          difficulty: 'B1-B2'
        },
        {
          id: 4,
          text: "What are your thoughts on technology's impact on education? Discuss both positive and negative aspects.",
          korean: "기술이 교육에 미치는 영향에 대한 당신의 생각은 무엇인가요? 긍정적인 면과 부정적인 면을 모두 논의해주세요.",
          duration: 180,
          difficulty: 'B2-C1'
        }
      ],
      
      // API 상태
      isSubmitting: false,
      submitError: null,
      setIsSubmitting: (value) => set({ isSubmitting: value }),
      
      // Spring Boot API 테스트 ID 및 상태
      testId: null,
      testLanguage: 'en',
      setTestId: (id) => set({ testId: id }),

      
      // API 메서드들
      startNewTest: async (language = 'en') => {
        try {
          set({ testLanguage: language });
          const testData = await startLevelTest(language);
          const testId = Number(testData?.testId);
          if (!testId) throw new Error('NO_TEST_ID_FROM_API');
          set({ testId, testStatus: 'idle' });

          return { ...testData, testId };
          
          
        } catch (error) {
          handleLevelTestError(error, 'startNewTest');
          throw error;
        }
      },
      
      loadQuestions: async () => {
        try {
            let activeId = get().testId;
             if (!activeId) {
              const started = await get().startNewTest(get().testLanguage);
              activeId = started?.testId ?? started?.id;
              if (!activeId) throw new Error('Failed to start test');
            }
            
            const response = await getLevelTestQuestions(activeId);

          if (response?.questions?.length > 0) {
            set({ 
              questions: response.questions,
              totalQuestions: response.questions.length
            });
            log('Questions loaded from Spring Boot:', response.questions.length);
          } else {
            console.log('Using default questions');
          }
        } catch (error) {
          handleLevelTestError(error, 'loadQuestions');
          console.log('Using default questions as fallback');
        }
      },
      
      // Spring Boot API 개별 제출 방식
      submitQuestionAudio: async (audioBlob, questionId) => {
        try {
          const state = get();
          if (!state.testId) {

            throw new Error('No active test');
          }
          const result = await submitVoiceAnswer(state.testId, questionId, audioBlob);

          log('Question audio submitted successfully:', { questionId, result });
          return result;
        } catch (error) {
          handleLevelTestError(error, 'submitQuestionAudio');
          throw error;
        }
      },
      
      // Spring Boot API 테스트 제출 방식
      submitTest: async () => {
        const state = get();
        if (state.recordings.length !== state.totalQuestions) {
          set({ submitError: 'Please complete all questions before submitting.' });
          return;
        }
        
        if (!state.testId) {

          set({ submitError: 'No active test found. Please restart the test.' });
          return;
        }
        
        set({ isSubmitting: true, submitError: null });
        
        try {
          // 1단계: 모든 음성 파일을 Spring Boot API에 제출
          const submissions = [];
          for (let i = 0; i < state.recordings.length; i++) {
            const recording = state.recordings[i];
            const question = state.questions[i];
            try {
              const result = await submitVoiceAnswer(
                state.testId,
                question?.id || (i + 1), 
                recording.blob
              );
              submissions.push({
                questionId: question?.id || (i + 1),
                audioUrl: result.audioUrl,
                saved: true
              });
              log('Audio submitted for question:', i + 1);
            } catch (error) {
              console.error(`Failed to submit audio for question ${i + 1}:`, error);
              // 개별 제출 실패 시 계속 진행
            }
          }
          
          // 2단계: 테스트 완료 처리
          const completeResult = await completeLevelTest(state.testId);

          
          // 3단계: 결과 조회
          const result = await getLevelTestResult(state.testId);

          const normalizedResult = normalizeTestResult(result, completeResult, {
            testId: state.testId,
            submissions,
            completedAt: result?.completedAt ?? completeResult?.completedAt
          });

          if (!normalizedResult) {
            throw new Error('레벨 테스트 결과를 파싱하지 못했습니다.');
          }

          set({ 
            testResult: normalizedResult,
            testStatus: 'completed',
            isSubmitting: false
          });
          
          return normalizedResult;
        } catch (error) {
          handleLevelTestError(error, 'submitTest');
          set({ 
            submitError: error.message || 'Failed to submit test. Please try again.',
            isSubmitting: false
          });
          throw error;
        }
      },
      
      // 사용자의 테스트 히스토리 조회
      loadTestHistory: async () => {
        try {
          const history = await getUserLevelTests();
          return history;
        } catch (error) {
          handleLevelTestError(error, 'loadTestHistory');
          return [];
        }
      },
      
      // 질문 관련 헬퍼 메서드들
      getCurrentQuestion: () => {
        const state = get();
        return state.questions[state.currentQuestionIndex];
      },
      
      getProgress: () => {
        const state = get();
        return ((state.currentQuestionIndex + 1) / state.totalQuestions) * 100;
      },
      
      isFirstQuestion: () => get().currentQuestionIndex === 0,
      isLastQuestion: () => {
        const state = get();
        return state.currentQuestionIndex === state.totalQuestions - 1;
      },
      
      hasCompletedAllQuestions: () => {
        const state = get();
        return state.recordings.length === state.totalQuestions;
      },
      
      // 테스트 결과
      testResult: null, // {level, scores, feedback, strengths, improvements, date}
      
      // 액션들
      setTestStatus: (status) => set({ testStatus: status }),
      
      setConnectionStatus: (status) => set((state) => ({
        connectionStatus: { ...state.connectionStatus, ...status }
      })),
      
      setAudioLevel: (level) => set((state) => ({
        connectionStatus: { ...state.connectionStatus, audioLevel: level }
      })),
      
      // 타이머 관리
      startTimer: () => set({ isTimerRunning: true }),
      stopTimer: () => set({ isTimerRunning: false }),
      decrementTimer: () => set((state) => ({
        timerSeconds: Math.max(0, state.timerSeconds - 1),
        timeRemaining: Math.max(0, state.timeRemaining - 1)
      })),
      resetTimer: () => set({ timerSeconds: 180, timeRemaining: 180, isTimerRunning: false }),
      setTimerSeconds: (seconds) => set({ timerSeconds: seconds, timeRemaining: seconds }),
      
      // 질문 설정
      setQuestions: (questions) => set({ 
        questions: questions || [],
        totalQuestions: questions?.length || 4
      }),

      // 질문 네비게이션
      nextQuestion: () => set((state) => {
        const nextIndex = Math.min(state.totalQuestions - 1, state.currentQuestionIndex + 1);
        const nextQuestion = state.questions[nextIndex];
        const timerDuration = nextQuestion?.duration || 180;
        
        return {
          currentQuestionIndex: nextIndex,
          timerSeconds: timerDuration,
          timeRemaining: timerDuration,
        };
      }),
      
      previousQuestion: () => set((state) => ({
        currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1)
      })),
      
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      
      // 녹음 관리
      addRecording: (recording) => set((state) => {
        // Remove any existing recording for this question
        const filteredRecordings = state.recordings.filter(
          r => r.questionIndex !== state.currentQuestionIndex
        );
        
        return {
          recordings: [...filteredRecordings, {
            ...recording,
            questionIndex: state.currentQuestionIndex,
            timestamp: new Date().toISOString()
          }]
        };
      }),
      
      setCurrentRecording: (recording) => set({ currentRecording: recording }),
      
      clearCurrentRecording: () => set({ currentRecording: null }),
      
      // AudioRecorder 컴포넌트용 메서드들
      startRecording: (blob) => set((state) => ({
        currentRecording: {
          blob,
          startTime: Date.now(),
          questionIndex: state.currentQuestionIndex
        }
      })),
      
      stopRecording: () => set((state) => {
        if (state.currentRecording) {
          const duration = Math.floor((Date.now() - state.currentRecording.startTime) / 1000);
          
          // Remove any existing recording for this question
          const filteredRecordings = state.recordings.filter(
            r => r.questionIndex !== state.currentQuestionIndex
          );
          
          return {
            recordings: [...filteredRecordings, {
              ...state.currentRecording,
              duration,
              timestamp: new Date().toISOString()
            }],
            currentRecording: null
          };
        }
        return state;
      }),
      
      updateRecordingDuration: (duration) => set((state) => {
        if (state.currentRecording) {
          return {
            currentRecording: {
              ...state.currentRecording,
              duration
            }
          };
        }
        return state;
      }),
      
      getRecordingForQuestion: (questionIndex) => {
        const state = get();
        return state.recordings.find(r => r.questionIndex === questionIndex);
      },
      
      // 테스트 결과
      setTestResult: (result, options = {}) => {
        if (!result) {
          set({ testResult: null });
          return null;
        }

        const normalized = normalizeTestResult(result, options?.fallback ?? null, {
          testId: options?.testId ?? get().testId,
          submissions: options?.submissions ?? [],
          completedAt: options?.completedAt ?? result?.completedAt ?? result?.date ?? null,
          strengths: options?.strengths,
          improvements: options?.improvements,
          level: options?.level,
          overallScore: options?.overallScore,
          feedback: options?.feedback
        });

        set({ testResult: normalized });
        return normalized;
      },
      
      // 전체 초기화
      resetTest: () => set((state) => {
        const firstQuestion = state.questions[0];
        const timerDuration = firstQuestion?.duration || 180;
        
        return {
          testStatus: "idle",
          testId: null,
          currentQuestionIndex: 0,
          connectionStatus: {
            microphone: false,
            internet: false,
            audioLevel: 0,
          },
          timerSeconds: timerDuration,
          timeRemaining: timerDuration,
          isTimerRunning: false,
          recordings: [],
          currentRecording: null,
          testResult: null,
          isSubmitting: false,
          submitError: null,
        };
      }),
      
      // 테스트 완료 여부 체크
      isTestComplete: () => {
        const state = get();
        return state.recordings.length === state.totalQuestions;
      },
      
      // 현재 질문이 녹음되었는지 체크
      isCurrentQuestionRecorded: () => {
        const state = get();
        return state.recordings.some(r => r.questionIndex === state.currentQuestionIndex);
      },
    }),
    {
      name: "level-test-storage", // localStorage key
      partialize: (state) => {
        const persistedResult = state.testResult
          ? {
              ...state.testResult,
              raw: undefined,
            }
          : null;

        return {
          // 지속성이 필요한 상태만 저장
          testResult: persistedResult,
          recordings: state.recordings.map((r) => ({
            questionIndex: r.questionIndex,
            duration: r.duration,
            timestamp: r.timestamp,
            // blob은 저장하지 않음 (너무 큼)
          })),
        };
      },
    }
  )
);

export default useLevelTestStore;
