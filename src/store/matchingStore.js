import { create } from "zustand";
import { persist } from "zustand/middleware";

const useMatchingStore = create(
  persist(
    (set, get) => ({
      // 매칭 상태
      matchingStatus: "idle", // idle, searching, matched, failed
      isSearching: false,
      
      // 매칭 필터 조건
      matchingFilters: {
        targetLanguage: "en", // 학습하고 싶은 언어
        nativeLanguage: "ko", // 모국어
        proficiencyLevel: "", // beginner, intermediate, advanced
        sessionType: "1on1", // 1on1, group
        timezone: "Asia/Seoul",
        availability: [], // 가능한 시간대
        interests: [], // 관심사
        learningGoals: [], // 학습 목표
      },
      
      // 매칭된 사용자 목록
      matchedUsers: [],
      
      // 현재 선택된 매칭 파트너
      selectedPartner: null,
      
      // 매칭 히스토리
      matchingHistory: [],
      
      // 액션들
      setMatchingStatus: (status) => set({ matchingStatus: status }),
      
      setMatchingFilters: (filters) => set((state) => ({
        matchingFilters: { ...state.matchingFilters, ...filters }
      })),
      
      resetMatchingFilters: () => set({
        matchingFilters: {
          targetLanguage: "en",
          nativeLanguage: "ko",
          proficiencyLevel: "",
          sessionType: "1on1",
          timezone: "Asia/Seoul",
          availability: [],
          interests: [],
          learningGoals: [],
        }
      }),
      
      // 매칭 시작
      startMatching: () => set({ 
        isSearching: true, 
        matchingStatus: "searching",
        matchedUsers: [] 
      }),
      
      // 매칭 중지
      stopMatching: () => set({ 
        isSearching: false, 
        matchingStatus: "idle" 
      }),
      
      // 매칭 결과 설정
      setMatchedUsers: (users) => set({ 
        matchedUsers: users,
        matchingStatus: users.length > 0 ? "matched" : "failed",
        isSearching: false
      }),
      
      // 파트너 선택
      selectPartner: (partner) => set({ selectedPartner: partner }),
      
      // 파트너 선택 해제
      deselectPartner: () => set({ selectedPartner: null }),
      
      // 매칭 히스토리 추가
      addToHistory: (match) => set((state) => ({
        matchingHistory: [
          {
            ...match,
            timestamp: new Date().toISOString()
          },
          ...state.matchingHistory
        ].slice(0, 20) // 최근 20개만 유지
      })),
      
      // 매칭 수락
      acceptMatch: (partnerId) => {
        const state = get();
        const partner = state.matchedUsers.find(user => user.id === partnerId);
        
        if (partner) {
          set({
            selectedPartner: partner,
            matchingStatus: "matched"
          });
          
          // 히스토리에 추가
          state.addToHistory({
            partnerId: partner.id,
            partnerName: partner.name,
            status: "accepted",
            matchedAt: new Date().toISOString()
          });
        }
      },
      
      // 매칭 거절
      rejectMatch: (partnerId) => {
        const state = get();
        set((state) => ({
          matchedUsers: state.matchedUsers.filter(user => user.id !== partnerId)
        }));
        
        // 히스토리에 추가
        state.addToHistory({
          partnerId,
          status: "rejected",
          rejectedAt: new Date().toISOString()
        });
      },
      
      // 필터 기반 매칭 가능 여부 체크
      canStartMatching: () => {
        const state = get();
        const { proficiencyLevel, availability } = state.matchingFilters;
        return proficiencyLevel && availability.length > 0;
      },
      
      // 전체 초기화
      resetMatching: () => set({
        matchingStatus: "idle",
        isSearching: false,
        matchedUsers: [],
        selectedPartner: null,
      }),
    }),
    {
      name: "matching-storage",
      partialize: (state) => ({
        // 지속성이 필요한 상태만 저장
        matchingFilters: state.matchingFilters,
        matchingHistory: state.matchingHistory,
      }),
    }
  )
);

export default useMatchingStore;