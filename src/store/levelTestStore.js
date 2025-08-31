import { create } from "zustand";
import { persist } from "zustand/middleware";
import { submitLevelTest, getLevelTestResult, completeLevelTest } from "../api/levelTest";
import { log } from '../utils/logger';

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
      
      // API 메서드들
      loadQuestions: async () => {
        try {
          const { getLevelTestQuestions } = await import('../api/levelTest.js');
          const response = await getLevelTestQuestions();
          
          if (response?.questions?.length > 0) {
            set({ 
              questions: response.questions,
              totalQuestions: response.questions.length
            });
            log('Questions loaded from Workers API:', response.questions.length);
          } else {
            console.log('Using default questions');
          }
        } catch (error) {
          console.error('Failed to load questions from Workers API:', error);
          // Use default questions on error
          console.log('Using default questions as fallback');
        }
      },
      
      // Workers API 개별 제출 방식
      submitQuestionAudio: async (audioBlob, questionNumber) => {
        try {
          const result = await submitLevelTest(audioBlob, questionNumber);
          log('Question audio submitted successfully:', { questionNumber, transcription: result.transcription });
          return result;
        } catch (error) {
          console.error('Failed to submit question audio:', error);
          throw error;
        }
      },
      
      // Workers API 완전 새로운 제출 방식
      submitTest: async () => {
        const state = get();
        if (state.recordings.length !== state.totalQuestions) {
          set({ submitError: 'Please complete all questions before submitting.' });
          return;
        }
        
        set({ isSubmitting: true, submitError: null });
        
        try {
          const userId = localStorage.getItem('userId') || crypto.randomUUID();
          
          // 1단계: 모든 오디오 파일을 Workers API에 개별 제출
          const submissions = [];
          for (let i = 0; i < state.recordings.length; i++) {
            const recording = state.recordings[i];
            try {
              const result = await submitLevelTest(recording.blob, i + 1);
              submissions.push({
                questionId: i + 1,
                transcription: result.transcription,
                saved: result.saved
              });
              log('Audio submitted for question:', i + 1);
            } catch (error) {
              console.error(`Failed to submit audio for question ${i + 1}:`, error);
              throw new Error(`Failed to submit question ${i + 1}`);
            }
          }
          
          // 2단계: Workers API에서 테스트 완료 및 결과 생성
          const completeResult = await completeLevelTest(userId);
          
          // 3단계: 결과 조회
          const result = await getLevelTestResult(userId);
          
          // Process result
          const testResult = {
            level: result.level || completeResult.level || 'B1',
            overallScore: result.overallScore || completeResult.overallScore || 65,
            scores: result.scores || completeResult.scores || {
              pronunciation: 70,
              fluency: 65,
              grammar: 60,
              vocabulary: 70,
              coherence: 65,
              interaction: 60
            },
            strengths: result.strengths || completeResult.strengths || [
              'Good pronunciation and intonation',
              'Natural speaking pace',
              'Clear communication'
            ],
            improvements: result.improvements || completeResult.improvements || [
              'Expand vocabulary range',
              'Use more complex grammar structures',
              'Improve coherence in longer responses'
            ],
            feedback: result.feedback || completeResult.feedback || 'Good overall performance. Continue practicing to improve fluency and expand vocabulary.',
            date: new Date().toISOString(),
            submissions // API 호출 기록 포함
          };
          
          set({ 
            testResult,
            testStatus: 'completed',
            isSubmitting: false
          });
          
          return testResult;
        } catch (error) {
          console.error('Test submission error:', error);
          set({ 
            submitError: error.message || 'Failed to submit test. Please try again.',
            isSubmitting: false
          });
          throw error;
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
      setTestResult: (result) => set({ 
        testResult: {
          ...result,
          date: new Date().toISOString()
        }
      }),
      
      // 전체 초기화
      resetTest: () => set((state) => {
        const firstQuestion = state.questions[0];
        const timerDuration = firstQuestion?.duration || 180;
        
        return {
          testStatus: "idle",
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
      partialize: (state) => ({
        // 지속성이 필요한 상태만 저장
        testResult: state.testResult,
        recordings: state.recordings.map(r => ({
          questionIndex: r.questionIndex,
          duration: r.duration,
          timestamp: r.timestamp,
          // blob은 저장하지 않음 (너무 큼)
        })),
      }),
    }
  )
);

export default useLevelTestStore;