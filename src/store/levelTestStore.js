import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      timeRemaining: 180, // 3분 = 180초
      isTimerRunning: false,
      
      // 녹음 데이터
      recordings: [], // {questionIndex, blob, duration, timestamp}[]
      currentRecording: null, // 현재 녹음 중인 데이터
      
      // 테스트 질문들
      questions: [
        "자기소개를 해주세요. 이름, 나이, 직업 등을 포함해서 말씀해주세요.",
        "평소 영어 학습은 어떻게 하고 계신가요?",
        "가장 최근에 본 영화나 드라마에 대해 설명해주세요.",
        "영어를 배우는 목표가 무엇인가요?"
      ],
      
      // 테스트 결과
      testResult: null, // {level, scores, feedback, date}
      
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
        timeRemaining: Math.max(0, state.timeRemaining - 1)
      })),
      resetTimer: () => set({ timeRemaining: 180, isTimerRunning: false }),
      
      // 질문 네비게이션
      nextQuestion: () => set((state) => ({
        currentQuestionIndex: Math.min(state.totalQuestions - 1, state.currentQuestionIndex + 1),
        timeRemaining: 180, // 새 질문마다 타이머 리셋
      })),
      
      previousQuestion: () => set((state) => ({
        currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1)
      })),
      
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      
      // 녹음 관리
      addRecording: (recording) => set((state) => ({
        recordings: [...state.recordings, {
          ...recording,
          questionIndex: state.currentQuestionIndex,
          timestamp: new Date().toISOString()
        }]
      })),
      
      setCurrentRecording: (recording) => set({ currentRecording: recording }),
      
      clearCurrentRecording: () => set({ currentRecording: null }),
      
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
      resetTest: () => set({
        testStatus: "idle",
        currentQuestionIndex: 0,
        connectionStatus: {
          microphone: false,
          internet: false,
          audioLevel: 0,
        },
        timeRemaining: 180,
        isTimerRunning: false,
        recordings: [],
        currentRecording: null,
        testResult: null,
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