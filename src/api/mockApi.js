// Mock API for testing without authentication
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || window.location.search.includes('mock=true');

const mockData = {
  // 사용자 정보
  userInfo: {
    id: 1,
    englishName: "Test User",
    koreanName: "테스트 사용자", 
    age: 24,
    level: "Intermediate - H",
    profileImage: "/assets/basicProfilePic.png",
    totalStudyTime: "87시간",
    monthlyStudyTime: "0시간",
    streakDays: "0일",
    fixedMates: "4명"
  },

  // 매칭 파트너 목록
  matchingPartners: [
    { id: 1, name: "Dana Lee", nationality: "Korean", languages: "영어 ←> 한국어" },
    { id: 2, name: "Jason Park", nationality: "American", languages: "영어 ←> 한국어" },
    { id: 3, name: "Edwin Simonis", nationality: "British", languages: "영어 ←> 한국어" },
    { id: 4, name: "Andrew Tate", nationality: "American", languages: "영어 ←> 한국어" }
  ],

  // 채팅방 목록
  chatRooms: [
    { id: 1, name: "English Study Group", participants: 5, lastMessage: "안녕하세요!" },
    { id: 2, name: "Korean Practice", participants: 3, lastMessage: "Let's practice!" }
  ],

  // 세션 목록
  sessions: [
    { 
      id: 1, 
      title: "English Conversation", 
      partner: "Dana Lee",
      date: "2025-08-29",
      time: "14:00",
      duration: "30분",
      type: "video"
    },
    {
      id: 2,
      title: "Korean Practice",
      partner: "Jason Park", 
      date: "2025-08-30",
      time: "16:00",
      duration: "45분",
      type: "audio"
    }
  ],

  // 성취 배지
  achievements: [
    { id: 1, name: "첫 스터디 시작!", image: "/assets/target.png", earned: true },
    { id: 2, name: "연속 학습자", image: "/assets/calender.png", earned: true },
    { id: 3, name: "시간 지킴이", image: "/assets/time.png", earned: true },
    { id: 4, name: "대화의 달인", image: "/assets/dialog.png", earned: true }
  ],

  // 알림 목록
  notifications: [
    { id: 1, title: "새로운 매칭 요청", content: "Dana Lee님이 매칭을 요청했습니다.", time: "5분 전", read: false },
    { id: 2, title: "세션 예정", content: "30분 후 Jason Park님과의 세션이 예정되어 있습니다.", time: "25분 전", read: false },
    { id: 3, title: "레벨 테스트 완료", content: "영어 레벨 테스트가 완료되었습니다.", time: "1시간 전", read: true }
  ],

  // 분석 데이터
  analytics: {
    totalSessions: 87,
    averageScore: 8.5,
    studyStreak: 15,
    languageProgress: {
      korean: 75,
      english: 85,
      spanish: 45,
      french: 30
    }
  }
};

// Mock API 함수들
export const mockApiCalls = {
  // 사용자 정보
  getUserInfo: () => Promise.resolve({ data: mockData.userInfo }),
  getUserName: () => Promise.resolve({ data: { name: mockData.userInfo.englishName } }),

  // 매칭
  getMatchingPartners: () => Promise.resolve({ data: mockData.matchingPartners }),
  
  // 채팅
  getChatRooms: () => Promise.resolve({ data: mockData.chatRooms }),
  
  // 세션
  getSessions: () => Promise.resolve({ data: mockData.sessions }),
  
  // 성취
  getAchievements: () => Promise.resolve({ data: mockData.achievements }),
  
  // 알림
  getNotifications: () => Promise.resolve({ data: mockData.notifications }),
  
  // 분석
  getAnalytics: () => Promise.resolve({ data: mockData.analytics })
};

// API 호출을 Mock 또는 실제 API로 라우팅하는 래퍼
export const createMockableApi = (realApiCall, mockCall) => {
  return async (...args) => {
    if (MOCK_MODE) {
      console.log(`🎭 [Mock Mode] Calling mock API instead of real API`);
      // Mock 응답은 약간의 지연을 추가하여 실제 API처럼 느끼게 함
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      return mockCall(...args);
    } else {
      return realApiCall(...args);
    }
  };
};

// Mock 모드 확인 함수
export const isMockMode = () => MOCK_MODE;

// Mock 모드 토글 함수 (개발/테스트용)
export const toggleMockMode = () => {
  const url = new URL(window.location);
  if (url.searchParams.has('mock')) {
    url.searchParams.delete('mock');
  } else {
    url.searchParams.set('mock', 'true');
  }
  window.location.href = url.toString();
};

// Mock 배너 표시 함수
export const showMockModeBanner = () => {
  if (MOCK_MODE && typeof document !== 'undefined') {
    // Mock 모드 배너가 이미 있으면 제거
    const existingBanner = document.querySelector('#mock-mode-banner');
    if (existingBanner) {
      existingBanner.remove();
    }

    // Mock 모드 배너 생성
    const banner = document.createElement('div');
    banner.id = 'mock-mode-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(90deg, #ff6b35, #f7931e);
      color: white;
      text-align: center;
      padding: 8px;
      font-weight: bold;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    banner.innerHTML = `
      🎭 MOCK 모드 활성화 - 가짜 데이터로 테스트 중 
      <button onclick="window.mockApi.toggleMockMode()" style="
        margin-left: 10px; 
        background: rgba(255,255,255,0.2); 
        border: 1px solid rgba(255,255,255,0.5);
        color: white; 
        padding: 4px 8px; 
        border-radius: 4px;
        cursor: pointer;
      ">실제 API 모드로 전환</button>
    `;
    
    document.body.appendChild(banner);
    
    // body에 패딩 추가해서 배너 아래 콘텐츠가 가려지지 않게 함
    document.body.style.paddingTop = '40px';
    
    // 전역에서 접근할 수 있도록 window 객체에 추가
    window.mockApi = { toggleMockMode };
  }
};

export default { mockApiCalls, createMockableApi, isMockMode, showMockModeBanner };