import { create } from 'zustand';

const useSessionStore = create((set) => ({
  // 세션 통계
  sessionStats: {
    totalSessions: 0,
    totalDuration: 0, // 분 단위
    weeklyStreak: 0,
    lastSessionDate: null,
  },

  // 세션 히스토리
  sessionHistory: [],

  // 현재 진행중인 세션
  currentSession: null,

  // 세션 통계 업데이트
  updateSessionStats: (stats) => set((state) => ({
    sessionStats: {
      ...state.sessionStats,
      ...stats
    }
  })),

  // 세션 시작
  startSession: (sessionData) => set({
    currentSession: {
      ...sessionData,
      startTime: new Date(),
      status: 'active'
    }
  }),

  // 세션 종료
  endSession: () => set((state) => {
    if (!state.currentSession) return state;

    const endTime = new Date();
    const duration = Math.floor((endTime - state.currentSession.startTime) / 1000 / 60); // 분 단위

    const completedSession = {
      ...state.currentSession,
      endTime,
      duration,
      status: 'completed'
    };

    return {
      currentSession: null,
      sessionHistory: [...state.sessionHistory, completedSession],
      sessionStats: {
        ...state.sessionStats,
        totalSessions: state.sessionStats.totalSessions + 1,
        totalDuration: state.sessionStats.totalDuration + duration,
        lastSessionDate: endTime
      }
    };
  }),

  // 세션 히스토리 추가
  addSessionToHistory: (session) => set((state) => ({
    sessionHistory: [...state.sessionHistory, session]
  })),

  // 세션 히스토리 초기화
  clearSessionHistory: () => set({
    sessionHistory: []
  }),

  // 전체 상태 초기화
  resetSessionStore: () => set({
    sessionStats: {
      totalSessions: 0,
      totalDuration: 0,
      weeklyStreak: 0,
      lastSessionDate: null,
    },
    sessionHistory: [],
    currentSession: null
  })
}));

export default useSessionStore;