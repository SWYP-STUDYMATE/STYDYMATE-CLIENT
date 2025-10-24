import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getPartnerRecommendations,
  searchPartners as searchPartnersApi,
  createMatchRequest,
  acceptMatchRequest,
  rejectMatchRequest,
  getReceivedMatchRequests,
  getSentMatchRequests,
  getMatches,
  getMatchingStatus,
  getRecommendedPartners,
  getMatchingHistory,
  analyzeCompatibility
} from "../api/matching";

const normalizePartner = (partner) => {
  if (!partner) return null;

  const firstTarget = partner.targetLanguages?.[0];
  const compatibility = partner.compatibilityScore;
  const normalizedScore =
    compatibility === undefined ? undefined :
      (compatibility > 1 ? Math.round(compatibility) : Math.round(compatibility * 100));

  return {
    id: partner.userId,
    userId: partner.userId,
    name: partner.englishName || '파트너',
    profileImage: partner.profileImageUrl,
    bio: partner.selfBio,
    age: partner.age,
    gender: partner.gender,
    location: partner.location,
    nativeLanguage: partner.nativeLanguage,
    learningLanguage: firstTarget?.languageName,
    level: firstTarget?.currentLevel || 'Intermediate',
    interests: partner.interests || [],
    personalities: partner.partnerPersonalities || [],
    matchScore: normalizedScore,
    isOnline: partner.onlineStatus === 'ONLINE',
    lastActive: partner.lastActiveTime,
  };
};

const normalizeWorkerMatch = (match) => ({
  id: match.partnerId,
  partnerId: match.partnerId,
  matchId: match.matchId,
  name: match.partnerName || match.partnerId,
  profileImage: match.partnerProfileImage,
  bio: match.partnerBio,
  nativeLanguage: match.partnerNativeLanguage || 'Unknown',
  learningLanguage: match.targetLanguage || 'Unknown',
  level: match.partnerLevel || 'Intermediate',
  interests: match.commonInterests || [],
  matchScore: match.score,
  suggestedTopics: match.suggestedTopics || [],
  isOnline: match.partnerOnlineStatus === 'ONLINE',
});

const extractPageContent = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== 'object') return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (payload.content) return payload.content;
  if (payload.data?.content) return payload.data.content;
  if (Array.isArray(payload.matches)) return payload.matches;
  if (Array.isArray(payload.data?.matches)) return payload.data.matches;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  return [];
};

const useMatchingStore = create(
  persist(
    (set, get) => ({
      // 매칭 상태
      matchingStatus: "idle", // idle, searching, matched, failed
      isSearching: false,
      
      // 매칭 필터 조건
      matchingFilters: {
        targetLanguage: "", // 학습하고 싶은 언어
        nativeLanguage: "", // 도움을 줄 수 있는 언어
        proficiencyLevel: "", // beginner, intermediate, advanced, native
        location: "", // 지역
        minAge: "", // 최소 연령
        maxAge: "", // 최대 연령
        sessionType: "", // 1on1, group, text_only, voice_only, video
        timezone: "Asia/Seoul",
        availability: [], // 가능한 시간대 (morning, afternoon, evening, night, weekdays, weekends)
        interests: [], // 관심사
        learningGoals: [], // 학습 목표
      },
      
      // 매칭된 사용자 목록
      matchedUsers: [],

      // 현재 선택된 매칭 파트너
      selectedPartner: null,

      // 매칭 히스토리
      matchingHistory: [],

      // 보낸 매칭 요청 목록
      sentRequests: [],

      // 받은 매칭 요청 목록
      receivedRequests: [],
      
      // 액션들
      setMatchingStatus: (status) => set({ matchingStatus: status }),
      
      setMatchingFilters: (filters) => set((state) => ({
        matchingFilters: { ...state.matchingFilters, ...filters }
      })),
      
      resetMatchingFilters: () => set({
        matchingFilters: {
          targetLanguage: "",
          nativeLanguage: "",
          proficiencyLevel: "",
          location: "",
          minAge: "",
          maxAge: "",
          sessionType: "",
          timezone: "Asia/Seoul",
          availability: [],
          interests: [],
          learningGoals: [],
        }
      }),
      
      // 매칭 시작 (API 연동) - getPartnerRecommendations 사용
      startMatching: async () => {
        const state = get();
        set({
          isSearching: true,
          matchingStatus: "searching",
          matchedUsers: []
        });

        try {
          const result = await getPartnerRecommendations(state.matchingFilters);
          const partners = extractPageContent(result)
            .map(normalizePartner)
            .filter(Boolean);

          set({
            matchedUsers: partners,
            matchingStatus: partners.length > 0 ? "matched" : "failed",
            isSearching: false
          });

          set((current) => ({
            matchingHistory: [
              {
                filters: current.matchingFilters,
                result: partners,
                timestamp: new Date().toISOString()
              },
              ...current.matchingHistory
            ].slice(0, 20)
          }));

          return partners;
        } catch (error) {
          console.error('Matching error:', error);
          set({
            matchingStatus: "failed",
            isSearching: false
          });
          throw error;
        }
      },
      
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
      
      // 매칭 요청 수락 (API 연동) - requestId 사용
      acceptMatch: async (requestId, responseMessage = '') => {
        try {
          const result = await acceptMatchRequest(requestId, responseMessage);

          // 히스토리에 추가
          const state = get();
          state.addToHistory({
            requestId,
            status: "accepted",
            acceptedAt: new Date().toISOString()
          });

          return result;
        } catch (error) {
          console.error('Accept match request error:', error);
          throw error;
        }
      },
      
      // 매칭 요청 거절 (API 연동) - requestId 사용
      rejectMatch: async (requestId, responseMessage = '') => {
        try {
          await rejectMatchRequest(requestId, responseMessage);

          // 히스토리에 추가
          const state = get();
          state.addToHistory({
            requestId,
            status: "rejected",
            rejectedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Reject match request error:', error);
          throw error;
        }
      },
      
      // 필터 기반 매칭 가능 여부 체크
      canStartMatching: () => {
        const state = get();
        const { proficiencyLevel, availability } = state.matchingFilters;
        return proficiencyLevel && availability.length > 0;
      },
      
      // 추천 파트너 가져오기 (Workers API 우선 사용)
      fetchRecommendedPartners: async () => {
        try {
          const state = get();
          // Workers API 사용
          const result = await getPartnerRecommendations(state.matchingFilters);
          const partners = extractPageContent(result)
            .map(normalizePartner)
            .filter(Boolean);
          
          set({
            matchedUsers: partners,
            matchingStatus: partners.length > 0 ? "matched" : "idle"
          });
          return partners;
        } catch (error) {
          console.error('Fetch recommended partners error:', error);
          // Workers API 실패 시 my-matches fallback 호출
          try {
            const result = await getRecommendedPartners();
            const workerMatches = (result.matches || [])
              .map(normalizeWorkerMatch)
              .filter(Boolean);
            set({
              matchedUsers: workerMatches,
              matchingStatus: workerMatches.length > 0 ? "matched" : "idle"
            });
            return workerMatches;
          } catch (fallbackError) {
            console.error('Fallback API error:', fallbackError);
            throw error;
          }
        }
      },

      // 매칭 상태 확인
      fetchMatchingStatus: async () => {
        try {
          const status = await getMatchingStatus();
          const stats = status?.stats || status;
          set({
            matchingStatus: stats?.activeRequest ? "searching" : "idle",
            isSearching: Boolean(stats?.activeRequest)
          });
          return stats;
        } catch (error) {
          console.error('Fetch matching status error:', error);
          throw error;
        }
      },

      // 매칭 히스토리 가져오기
      fetchMatchingHistory: async () => {
        try {
          const history = await getMatchingHistory();
          set({
            matchingHistory: history?.matches || history?.content || []
          });
          return history;
        } catch (error) {
          console.error('Fetch matching history error:', error);
          throw error;
        }
      },

      // 호환성 분석
      analyzePartnerCompatibility: async (partnerId) => {
        try {
          const analysis = await analyzeCompatibility(partnerId);
          return analysis;
        } catch (error) {
          console.error('Analyze compatibility error:', error);
          throw error;
        }
      },

      // 매칭 요청 보내기 (Workers API)
      sendMatchRequest: async (partnerId, message = '') => {
        const { sentRequests } = get();

        // ✅ 중복 요청 방지: 이미 요청을 보낸 사용자인지 확인
        const alreadyRequested = sentRequests.some(
          req => req.receiverId === partnerId || req.targetUserId === partnerId
        );

        if (alreadyRequested) {
          console.warn('[matchingStore] Already sent request to this partner:', partnerId);
          return {
            success: false,
            alreadyRequested: true,
            message: '이미 매칭 요청을 보낸 사용자입니다.'
          };
        }

        try {
          console.log('[matchingStore] Sending match request:', {
            partnerId,
            hasMessage: !!message
          });

          const result = await createMatchRequest(partnerId, message);

          console.log('[matchingStore] Match request result:', result);

          // sentRequests 상태 업데이트
          set({
            sentRequests: [...sentRequests, {
              ...result,
              receiverId: partnerId,
              targetUserId: partnerId,
              status: 'pending',
              message,
              createdAt: new Date().toISOString()
            }]
          });

          return { ...result, success: true };
        } catch (error) {
          console.error('[matchingStore] Send match request error:', {
            error,
            message: error?.message,
            response: error?.response?.data,
            status: error?.response?.status
          });
          throw error;
        }
      },

      // 받은 매칭 요청 조회
      fetchReceivedRequests: async (status = 'pending') => {
        try {
          const result = await getReceivedMatchRequests(status);
          const requests = extractPageContent(result);
          set({ receivedRequests: requests });
          return requests;
        } catch (error) {
          console.error('Fetch received requests error:', error);
          throw error;
        }
      },

      // 보낸 매칭 요청 조회
      fetchSentRequests: async (status = 'pending') => {
        try {
          const result = await getSentMatchRequests(status);
          const requests = extractPageContent(result);

          // 로컬 스토리지와 서버 데이터 병합 (서버가 최신 상태)
          set({ sentRequests: requests });
          return requests;
        } catch (error) {
          console.error('Fetch sent requests error:', error);
          // 에러 발생 시 로컬 스토리지 데이터 유지
          throw error;
        }
      },

      // 매칭된 파트너 목록 조회
      fetchMatches: async () => {
        try {
          const result = await getMatches();
          return extractPageContent(result);
        } catch (error) {
          console.error('Fetch matches error:', error);
          throw error;
        }
      },

      // 파트너 검색 (Workers API)
      searchPartners: async (searchQuery, filters = {}) => {
        try {
          const result = await searchPartnersApi(searchQuery, filters);
          return extractPageContent(result)
            .map(normalizePartner)
            .filter(Boolean);
        } catch (error) {
          console.error('Search partners error:', error);
          throw error;
        }
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
        sentRequests: state.sentRequests, // 보낸 매칭 요청 상태 유지
      }),
    }
  )
);

export default useMatchingStore;
