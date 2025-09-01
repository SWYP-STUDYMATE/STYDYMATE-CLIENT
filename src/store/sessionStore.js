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

  // 예정된 세션들
  upcomingSessions: [],

  // 전체 세션 목록
  sessions: [],

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

  // 예정된 세션 불러오기
  loadUpcomingSessions: async () => {
    try {
      // 실제 API 호출
      const response = await fetch('/api/v1/sessions/upcoming', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const sessions = await response.json();
        set({ upcomingSessions: sessions });
        return sessions;
      } else {
        console.error('Failed to load upcoming sessions:', response.status);
        // API 실패 시 빈 상태로 설정
        set({ upcomingSessions: [] });
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load upcoming sessions from API:', error);
      // 에러 발생 시 빈 상태로 설정
      set({ upcomingSessions: [] });
      throw error;
    }
  },

  // 전체 세션 불러오기
  loadSessions: async () => {
    try {
      const response = await fetch('/api/v1/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const sessions = await response.json();
        set({ 
          sessions: sessions,
          upcomingSessions: sessions.filter(s => s.status === 'scheduled')
        });
        return sessions;
      } else {
        console.error('Failed to load sessions:', response.status);
        set({ sessions: [], upcomingSessions: [] });
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load sessions from API:', error);
      set({ sessions: [], upcomingSessions: [] });
      throw error;
    }
  },

  // 세션 추가
  addSession: (session) => set((state) => ({
    sessions: [...state.sessions, session],
    upcomingSessions: session.status === 'scheduled' 
      ? [...state.upcomingSessions, session]
      : state.upcomingSessions
  })),

  // 세션 업데이트
  updateSession: (sessionId, updates) => set((state) => {
    const updatedSessions = state.sessions.map(session => 
      session.id === sessionId ? { ...session, ...updates } : session
    );
    
    const updatedUpcoming = updatedSessions.filter(s => s.status === 'scheduled');
    
    return {
      sessions: updatedSessions,
      upcomingSessions: updatedUpcoming
    };
  }),

  // 세션 삭제
  deleteSession: (sessionId) => set((state) => ({
    sessions: state.sessions.filter(s => s.id !== sessionId),
    upcomingSessions: state.upcomingSessions.filter(s => s.id !== sessionId)
  })),

  // 전체 상태 초기화
  resetSessionStore: () => set({
    sessionStats: {
      totalSessions: 0,
      totalDuration: 0,
      weeklyStreak: 0,
      lastSessionDate: null,
    },
    sessionHistory: [],
    currentSession: null,
    upcomingSessions: [],
    sessions: []
  })
}));

export default useSessionStore;