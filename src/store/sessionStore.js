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
      // 실제 API 호출 시도
      const response = await fetch('/api/v1/sessions/upcoming', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const sessions = await response.json();
        set({ upcomingSessions: sessions });
        return;
      }
    } catch (error) {
      console.error('Failed to load upcoming sessions from API, using dummy data:', error);
    }
    
    // API 실패 시 더미 데이터 사용
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const dummySessions = [
      {
        id: '1',
        date: new Date(year, month, today.getDate() + 2, 14, 0), // 오늘로부터 2일 후
        partnerId: 'emma123',
        partnerName: 'Emma Wilson',
        partnerImage: '/assets/basicProfilePic.png',
        type: 'video',
        duration: 60,
        language: 'en',
        status: 'scheduled'
      },
      {
        id: '2',
        date: new Date(year, month, today.getDate() + 2, 16, 30), // 오늘로부터 2일 후
        partnerId: 'john456',
        partnerName: 'John Smith',
        partnerImage: '/assets/basicProfilePic.png',
        type: 'audio',
        duration: 30,
        language: 'ko',
        status: 'scheduled'
      },
      {
        id: '3',
        date: new Date(year, month, today.getDate() + 5, 10, 0), // 오늘로부터 5일 후
        partnerId: 'group789',
        partnerName: '그룹 세션',
        partnerImage: '/assets/basicProfilePic.png',
        type: 'video',
        duration: 45,
        language: 'en',
        status: 'scheduled',
        participants: 4
      },
      {
        id: '4',
        date: new Date(year, month, today.getDate() - 3, 15, 0), // 3일 전
        partnerId: 'sarah111',
        partnerName: 'Sarah Johnson',
        partnerImage: '/assets/basicProfilePic.png',
        type: 'video',
        duration: 60,
        language: 'en',
        status: 'completed'
      },
      {
        id: '5',
        date: new Date(year, month, today.getDate() + 10, 19, 0), // 10일 후
        partnerId: 'mike222',
        partnerName: 'Mike Chen',
        partnerImage: '/assets/basicProfilePic.png',
        type: 'audio',
        duration: 45,
        language: 'ko',
        status: 'scheduled'
      }
    ];
    
    set({ 
      upcomingSessions: dummySessions.filter(s => s.status === 'scheduled'),
      sessions: dummySessions 
    });
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