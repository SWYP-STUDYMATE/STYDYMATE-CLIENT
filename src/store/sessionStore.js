import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSessionStore = create(
  persist(
    (set, get) => ({
      // 세션 목록
      sessions: [], // {id, partnerId, partnerName, type, status, scheduledAt, duration, etc.}
      
      // 현재 활성 세션
      activeSession: null,
      
      // 세션 상태
      sessionStatus: "idle", // idle, connecting, connected, disconnected, ended
      
      // WebRTC 연결 상태
      connectionState: {
        audio: false,
        video: false,
        screenshare: false,
        quality: "unknown", // unknown, poor, fair, good, excellent
      },
      
      // 세션 설정
      sessionSettings: {
        audioEnabled: true,
        videoEnabled: false,
        autoRecord: false,
        language: "en", // 현재 사용 언어
        subtitlesEnabled: false,
      },
      
      // 예정된 세션
      upcomingSessions: [],
      
      // 지난 세션
      pastSessions: [],
      
      // 세션 통계
      sessionStats: {
        totalSessions: 0,
        totalDuration: 0, // 분 단위
        averageDuration: 0,
        completionRate: 0,
      },
      
      // 액션들
      setSessions: (sessions) => set({ sessions }),
      
      addSession: (session) => set((state) => ({
        sessions: [...state.sessions, {
          ...session,
          id: session.id || Date.now().toString(),
          createdAt: new Date().toISOString()
        }]
      })),
      
      updateSession: (sessionId, updates) => set((state) => ({
        sessions: state.sessions.map(session =>
          session.id === sessionId ? { ...session, ...updates } : session
        )
      })),
      
      removeSession: (sessionId) => set((state) => ({
        sessions: state.sessions.filter(session => session.id !== sessionId)
      })),
      
      // 세션 시작
      startSession: (sessionId) => {
        const state = get();
        const session = state.sessions.find(s => s.id === sessionId);
        
        if (session) {
          set({
            activeSession: {
              ...session,
              startedAt: new Date().toISOString(),
              status: "active"
            },
            sessionStatus: "connecting"
          });
          
          // 세션 목록 업데이트
          state.updateSession(sessionId, { status: "active" });
        }
      },
      
      // 세션 종료
      endSession: () => {
        const state = get();
        const activeSession = state.activeSession;
        
        if (activeSession) {
          const endedAt = new Date().toISOString();
          const duration = Math.floor(
            (new Date(endedAt) - new Date(activeSession.startedAt)) / 1000 / 60
          ); // 분 단위
          
          // 지난 세션에 추가
          set((state) => ({
            activeSession: null,
            sessionStatus: "idle",
            pastSessions: [
              {
                ...activeSession,
                endedAt,
                duration,
                status: "completed"
              },
              ...state.pastSessions
            ].slice(0, 50), // 최근 50개만 유지
            connectionState: {
              audio: false,
              video: false,
              screenshare: false,
              quality: "unknown"
            }
          }));
          
          // 세션 목록에서 업데이트
          state.updateSession(activeSession.id, { 
            status: "completed",
            endedAt,
            duration
          });
          
          // 통계 업데이트
          state.updateSessionStats();
        }
      },
      
      // 연결 상태 업데이트
      setConnectionState: (updates) => set((state) => ({
        connectionState: { ...state.connectionState, ...updates }
      })),
      
      // 세션 상태 업데이트
      setSessionStatus: (status) => set({ sessionStatus: status }),
      
      // 세션 설정 업데이트
      updateSessionSettings: (settings) => set((state) => ({
        sessionSettings: { ...state.sessionSettings, ...settings }
      })),
      
      // 미디어 토글
      toggleAudio: () => set((state) => ({
        sessionSettings: {
          ...state.sessionSettings,
          audioEnabled: !state.sessionSettings.audioEnabled
        }
      })),
      
      toggleVideo: () => set((state) => ({
        sessionSettings: {
          ...state.sessionSettings,
          videoEnabled: !state.sessionSettings.videoEnabled
        }
      })),
      
      // 언어 전환
      switchLanguage: () => set((state) => ({
        sessionSettings: {
          ...state.sessionSettings,
          language: state.sessionSettings.language === "en" ? "ko" : "en"
        }
      })),
      
      // 예정된 세션 로드
      loadUpcomingSessions: () => {
        const state = get();
        const now = new Date();
        
        const upcoming = state.sessions
          .filter(session => 
            session.scheduledAt && 
            new Date(session.scheduledAt) > now &&
            session.status !== "completed" &&
            session.status !== "cancelled"
          )
          .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
        
        set({ upcomingSessions: upcoming });
      },
      
      // 세션 통계 업데이트
      updateSessionStats: () => {
        const state = get();
        const completedSessions = state.pastSessions.filter(
          s => s.status === "completed"
        );
        
        const totalSessions = completedSessions.length;
        const totalDuration = completedSessions.reduce(
          (sum, session) => sum + (session.duration || 0), 0
        );
        const averageDuration = totalSessions > 0 
          ? Math.round(totalDuration / totalSessions) 
          : 0;
        const completionRate = state.sessions.length > 0
          ? Math.round((completedSessions.length / state.sessions.length) * 100)
          : 0;
        
        set({
          sessionStats: {
            totalSessions,
            totalDuration,
            averageDuration,
            completionRate
          }
        });
      },
      
      // 세션 예약
      scheduleSession: (sessionData) => {
        const state = get();
        const newSession = {
          ...sessionData,
          id: Date.now().toString(),
          status: "scheduled",
          createdAt: new Date().toISOString()
        };
        
        state.addSession(newSession);
        state.loadUpcomingSessions();
      },
      
      // 세션 취소
      cancelSession: (sessionId) => {
        const state = get();
        state.updateSession(sessionId, { 
          status: "cancelled",
          cancelledAt: new Date().toISOString()
        });
        state.loadUpcomingSessions();
      },
      
      // 전체 초기화
      resetSessions: () => set({
        sessions: [],
        activeSession: null,
        sessionStatus: "idle",
        upcomingSessions: [],
        connectionState: {
          audio: false,
          video: false,
          screenshare: false,
          quality: "unknown"
        }
      }),
    }),
    {
      name: "session-storage",
      partialize: (state) => ({
        // 지속성이 필요한 상태만 저장
        sessions: state.sessions,
        pastSessions: state.pastSessions.slice(0, 10), // 최근 10개만
        sessionSettings: state.sessionSettings,
        sessionStats: state.sessionStats,
      }),
    }
  )
);

export default useSessionStore;