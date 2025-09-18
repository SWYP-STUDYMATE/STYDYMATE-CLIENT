import { create } from 'zustand';
import api from '../api/index.js';
import { getUserCalendar } from '../api/session';

const unwrapApiData = (response) => response?.data?.data ?? response?.data;

const extractContent = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.content) return payload.content;
  if (payload.data?.content) return payload.data.content;
  return payload.sessions || [];
};

const normalizeSession = (session) => {
  if (!session) return null;

  const originalStatus = typeof session.status === 'string' ? session.status : '';
  const normalizedStatus = originalStatus ? originalStatus.toLowerCase() : originalStatus;

  return {
    ...session,
    id: session.id ?? session.sessionId,
    type: session.type ?? (session.sessionType ? session.sessionType.toLowerCase() : undefined),
    duration: session.duration ?? session.durationMinutes,
    language: session.language ?? session.languageCode,
    status: normalizedStatus,
    rawStatus: originalStatus,
  };
};

const useSessionStore = create((set, get) => ({
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

  // 캘린더 데이터
  calendarEvents: [],
  calendarSlots: [],
  calendarRange: null,
  calendarLoading: false,
  calendarError: null,

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
      const response = await api.get('/sessions/my-sessions', {
        params: { page: 0, size: 50 }
      });

      const payload = unwrapApiData(response);
      const sessions = extractContent(payload)
        .map(normalizeSession)
        .filter(Boolean);
      const upcoming = sessions.filter((session) => session.status === 'scheduled');

      set({ upcomingSessions: upcoming });
      return upcoming;
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
      const response = await api.get('/sessions/my-sessions', {
        params: { page: 0, size: 100 }
      });

      const payload = unwrapApiData(response);
      const sessions = extractContent(payload)
        .map(normalizeSession)
        .filter(Boolean);
      const upcoming = sessions.filter((session) => session.status === 'scheduled');

      set({
        sessions,
        upcomingSessions: upcoming
      });
      return sessions;
    } catch (error) {
      console.error('Failed to load sessions from API:', error);
      set({ sessions: [], upcomingSessions: [] });
      throw error;
    }
  },

  // 세션 추가
  addSession: (session) => set((state) => {
    const normalized = normalizeSession(session);
    if (!normalized) return {};

    const sessions = [...state.sessions, normalized];
    return {
      sessions,
      upcomingSessions: normalized.status === 'scheduled'
        ? [...state.upcomingSessions, normalized]
        : state.upcomingSessions
    };
  }),

  // 캘린더 데이터 불러오기
  loadCalendar: async ({ startDate, endDate }) => {
    set({ calendarLoading: true, calendarError: null });

    const isoStart = startDate instanceof Date ? startDate.toISOString() : startDate;
    const isoEnd = endDate instanceof Date ? endDate.toISOString() : endDate;

    try {
      const [calendarResponse, sessionsResponse] = await Promise.all([
        getUserCalendar({ startDate: isoStart, endDate: isoEnd }),
        api.get('/sessions/my-sessions', { params: { page: 0, size: 100 } })
      ]);

      if (!calendarResponse?.success) {
        throw new Error(calendarResponse?.message || '캘린더 데이터를 불러오지 못했습니다.');
      }

      const calendarPayload = calendarResponse.data ?? { events: [], availableSlots: [] };

      const sessionsPayload = extractContent(unwrapApiData(sessionsResponse))
        .map(normalizeSession)
        .filter(Boolean);
      const sessionMap = new Map(
        sessionsPayload.map((session) => [session.sessionId ?? session.id, session])
      );

      const events = (calendarPayload.events || []).map((event) => {
        const start = event.startTime ? new Date(event.startTime) : null;
        const end = event.endTime ? new Date(event.endTime) : null;
        const relatedSession = event.sessionId ? sessionMap.get(event.sessionId) : null;

        const participantNames = [];
        if (relatedSession?.hostUserName) participantNames.push(relatedSession.hostUserName);
        if (relatedSession?.guestUserName) participantNames.push(relatedSession.guestUserName);

        return {
          ...event,
          start,
          end,
          durationMinutes: relatedSession?.durationMinutes ?? (start && end ? Math.max(0, Math.round((end - start) / 60000)) : null),
          participantNames,
          languageCode: relatedSession?.languageCode,
          maxParticipants: relatedSession?.maxParticipants,
          currentParticipants: relatedSession?.currentParticipants,
          hostUserName: relatedSession?.hostUserName,
          guestUserName: relatedSession?.guestUserName,
          rawStatus: relatedSession?.rawStatus ?? event.status,
        };
      });

      const slots = (calendarPayload.availableSlots || []).map((slot) => ({
        ...slot,
        start: slot.startTime ? new Date(slot.startTime) : null,
        end: slot.endTime ? new Date(slot.endTime) : null,
      }));

      const upcoming = sessionsPayload.filter((session) => session.status === 'scheduled');

      set({
        calendarEvents: events,
        calendarSlots: slots,
        calendarRange: { startDate, endDate },
        sessions: sessionsPayload,
        upcomingSessions: upcoming,
      });

      return { events, slots };
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      set({
        calendarEvents: [],
        calendarSlots: [],
        calendarError: error,
      });
      throw error;
    } finally {
      set({ calendarLoading: false });
    }
  },

  // 세션 업데이트
  updateSession: (sessionId, updates) => set((state) => {
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId) return session;
      return normalizeSession({ ...session, ...updates });
    }).filter(Boolean);
    
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
    sessions: [],
    calendarEvents: [],
    calendarSlots: [],
    calendarRange: null,
    calendarLoading: false,
    calendarError: null
  })
}));

export default useSessionStore;
