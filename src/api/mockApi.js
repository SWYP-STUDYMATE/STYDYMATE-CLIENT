// Enhanced Mock API for comprehensive testing without authentication
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || window.location.search.includes('mock=true');

// Mock 사용자 데이터베이스 - 다중 사용자 시뮬레이션
const mockUsers = [
  {
    id: 1,
    englishName: "Alex Johnson",
    koreanName: "알렉스",
    age: 25,
    level: "Advanced",
    profileImage: "/assets/basicProfilePic.png",
    totalStudyTime: "124시간",
    monthlyStudyTime: "32시간",
    streakDays: "12일",
    fixedMates: "8명",
    teachLanguages: ["영어 (Native)", "스페인어 (Advanced)"],
    learnLanguages: ["한국어 (Intermediate)", "일본어 (Beginner)"],
    interests: ["여행", "문화", "음악", "영화"]
  },
  {
    id: 2,
    englishName: "Sarah Kim",
    koreanName: "사라",
    age: 23,
    level: "Intermediate - H",
    profileImage: "/assets/basicProfilePic.png",
    totalStudyTime: "87시간",
    monthlyStudyTime: "18시간",
    streakDays: "6일",
    fixedMates: "5명",
    teachLanguages: ["한국어 (Native)", "영어 (Advanced)"],
    learnLanguages: ["프랑스어 (Intermediate)", "중국어 (Beginner)"],
    interests: ["요리", "독서", "드라마", "비즈니스"]
  },
  {
    id: 3,
    englishName: "Mike Chen",
    koreanName: "마이크",
    age: 28,
    level: "Expert",
    profileImage: "/assets/basicProfilePic.png",
    totalStudyTime: "203시간",
    monthlyStudyTime: "45시간",
    streakDays: "25일",
    fixedMates: "12명",
    teachLanguages: ["중국어 (Native)", "영어 (Advanced)"],
    learnLanguages: ["한국어 (Advanced)", "독일어 (Intermediate)"],
    interests: ["기술", "스포츠", "게임", "자기개발"]
  }
];

// 현재 활성 사용자 (localStorage에서 관리)
let currentUser = JSON.parse(localStorage.getItem('mockCurrentUser') || '0');

// 현재 사용자 정보 가져오기
const getCurrentUserData = () => mockUsers[currentUser] || mockUsers[0];

// 동적 Mock 데이터 생성
const generateMockData = () => {
  const user = getCurrentUserData();
  
  return {
    // 현재 사용자 정보
    userInfo: user,

    // 매칭 파트너 목록 (현재 사용자 제외)
    matchingPartners: [
      { id: 1, name: "Dana Lee", nationality: "Korean", languages: "영어 ←> 한국어", profileImage: "/assets/basicProfilePic.png", age: 24, level: "Intermediate" },
      { id: 2, name: "Jason Park", nationality: "American", languages: "영어 ←> 한국어", profileImage: "/assets/basicProfilePic.png", age: 26, level: "Advanced" },
      { id: 3, name: "Edwin Simonis", nationality: "British", languages: "영어 ←> 한국어", profileImage: "/assets/basicProfilePic.png", age: 29, level: "Expert" },
      { id: 4, name: "Maria Rodriguez", nationality: "Spanish", languages: "스페인어 ←> 영어", profileImage: "/assets/basicProfilePic.png", age: 22, level: "Intermediate" },
      { id: 5, name: "Yuki Tanaka", nationality: "Japanese", languages: "일본어 ←> 영어", profileImage: "/assets/basicProfilePic.png", age: 25, level: "Advanced" }
    ].filter(partner => partner.name !== user.englishName),

    // 동적 채팅방 목록
    chatRooms: [
      { 
        id: 1, 
        name: `${user.englishName} & Dana Lee`, 
        participants: 2, 
        lastMessage: "안녕하세요! 오늘 세션 어떠셨나요?",
        lastTime: "방금 전",
        unreadCount: 2,
        partnerInfo: { name: "Dana Lee", profileImage: "/assets/basicProfilePic.png" }
      },
      { 
        id: 2, 
        name: "English Study Group", 
        participants: 5, 
        lastMessage: "Let's practice pronunciation today!",
        lastTime: "10분 전",
        unreadCount: 0,
        isGroup: true
      },
      { 
        id: 3, 
        name: `${user.englishName} & Jason Park`, 
        participants: 2, 
        lastMessage: "Thanks for the great session!",
        lastTime: "1시간 전",
        unreadCount: 1,
        partnerInfo: { name: "Jason Park", profileImage: "/assets/basicProfilePic.png" }
      }
    ],

    // 동적 세션 목록
    sessions: [
      { 
        id: 1, 
        title: "English Conversation Practice", 
        partner: "Dana Lee",
        partnerImage: "/assets/basicProfilePic.png",
        date: "2025-08-29",
        time: "14:00",
        duration: "30분",
        type: "video",
        status: "upcoming",
        language: "English"
      },
      {
        id: 2,
        title: "Korean Language Exchange",
        partner: "Jason Park",
        partnerImage: "/assets/basicProfilePic.png",
        date: "2025-08-30",
        time: "16:00",
        duration: "45분",
        type: "audio",
        status: "upcoming",
        language: "한국어"
      },
      {
        id: 3,
        title: "Group Discussion - Travel",
        partner: "Group Session",
        participants: 4,
        date: "2025-08-31",
        time: "19:00",
        duration: "60분",
        type: "video",
        status: "upcoming",
        language: "English"
      }
    ],

    // 개인화된 성취 배지
    achievements: [
      { id: 1, name: "첫 스터디 시작!", description: "첫 번째 세션을 완료했습니다", image: "/assets/target.png", earned: true, points: 10, earnedDate: "2024.1.15" },
      { id: 2, name: "연속 학습자", description: "7일 연속 세션에 참여했습니다", image: "/assets/calender.png", earned: parseInt(user.streakDays) >= 7, points: 25, progress: `${Math.min(parseInt(user.streakDays) || 0, 7)}/7` },
      { id: 3, name: "시간 지킴이", description: "약속된 시간에 정확히 참여했습니다", image: "/assets/time.png", earned: true, points: 15, earnedDate: "2024.1.20" },
      { id: 4, name: "대화의 달인", description: "10번의 채팅 세션을 완료했습니다", image: "/assets/dialog.png", earned: parseInt(user.totalStudyTime) >= 50, points: 30, progress: `8/10` },
      { id: 5, name: "파트너 메이커", description: "5명의 새로운 파트너와 매칭했습니다", image: "/assets/dialog.png", earned: parseInt(user.fixedMates) >= 5, points: 20, progress: `${Math.min(parseInt(user.fixedMates) || 0, 5)}/5` }
    ],

    // 개인화된 알림 목록
    notifications: [
      { 
        id: 1, 
        title: "새로운 매칭 요청", 
        content: "Dana Lee님이 매칭을 요청했습니다.", 
        time: "5분 전", 
        read: false,
        type: "match_request",
        actionData: { partnerId: 1, partnerName: "Dana Lee" }
      },
      { 
        id: 2, 
        title: "세션 예정", 
        content: "30분 후 Jason Park님과의 세션이 예정되어 있습니다.", 
        time: "25분 전", 
        read: false,
        type: "session_reminder",
        actionData: { sessionId: 2, partnerName: "Jason Park" }
      },
      { 
        id: 3, 
        title: "성취 달성!", 
        content: `축하합니다! '시간 지킴이' 배지를 획득했습니다.`, 
        time: "1시간 전", 
        read: true,
        type: "achievement",
        actionData: { achievementId: 3 }
      },
      { 
        id: 4, 
        title: "새 메시지", 
        content: "Dana Lee님이 메시지를 보냈습니다.", 
        time: "2시간 전", 
        read: false,
        type: "chat_message",
        actionData: { chatRoomId: 1, senderName: "Dana Lee" }
      }
    ],

    // 개인화된 분석 데이터
    analytics: {
      totalSessions: Math.floor(parseInt(user.totalStudyTime) / 1.5) || 58,
      averageScore: 8.2 + (user.id * 0.3),
      studyStreak: parseInt(user.streakDays) || 0,
      monthlyHours: parseInt(user.monthlyStudyTime) || 0,
      totalHours: parseInt(user.totalStudyTime) || 0,
      languageProgress: {
        korean: 60 + (user.id * 10),
        english: 70 + (user.id * 5),
        spanish: 30 + (user.id * 15),
        french: 25 + (user.id * 8),
        japanese: 40 + (user.id * 12),
        chinese: 35 + (user.id * 10)
      },
      weeklyActivity: [
        { day: 'Mon', sessions: 2, hours: 2.5 },
        { day: 'Tue', sessions: 1, hours: 1.0 },
        { day: 'Wed', sessions: 3, hours: 3.5 },
        { day: 'Thu', sessions: 2, hours: 2.0 },
        { day: 'Fri', sessions: 1, hours: 1.5 },
        { day: 'Sat', sessions: 0, hours: 0 },
        { day: 'Sun', sessions: 2, hours: 2.5 }
      ]
    }
  };
};

// Mock 데이터 getter (동적으로 생성)
const getMockData = () => generateMockData();

// Enhanced Mock API 함수들 - 완전한 기능적 시뮬레이션
export const mockApiCalls = {
  // ===== 사용자 관리 =====
  getUserInfo: () => {
    const data = getMockData();
    console.log(`🎭 [Mock] 사용자 정보 로드: ${data.userInfo.englishName}`);
    return Promise.resolve({ data: data.userInfo });
  },
  
  getUserName: () => {
    const data = getMockData();
    return Promise.resolve({ data: { name: data.userInfo.englishName } });
  },

  updateUserProfile: (profileData) => {
    console.log(`🎭 [Mock] 프로필 업데이트:`, profileData);
    // localStorage에서 현재 사용자 업데이트 시뮬레이션
    const userData = getCurrentUserData();
    Object.assign(userData, profileData);
    return Promise.resolve({ data: { success: true, message: "프로필이 성공적으로 업데이트되었습니다." } });
  },

  uploadProfileImage: (imageFile) => {
    console.log(`🎭 [Mock] 프로필 이미지 업로드:`, imageFile);
    return Promise.resolve({ 
      data: { 
        success: true, 
        imageUrl: "/assets/basicProfilePic.png",
        message: "프로필 이미지가 성공적으로 업로드되었습니다." 
      } 
    });
  },

  // ===== 사용자 전환 기능 =====
  switchUser: (userIndex) => {
    console.log(`🎭 [Mock] 사용자 전환: ${mockUsers[userIndex]?.englishName}`);
    currentUser = userIndex;
    localStorage.setItem('mockCurrentUser', JSON.stringify(userIndex));
    return Promise.resolve({ data: { success: true, user: getCurrentUserData() } });
  },

  getAllUsers: () => {
    return Promise.resolve({ data: mockUsers });
  },

  // ===== 매칭 시스템 =====
  getMatchingPartners: (filters = {}) => {
    const data = getMockData();
    let partners = [...data.matchingPartners];
    
    // 필터 적용 시뮬레이션
    if (filters.language) {
      partners = partners.filter(p => p.languages.includes(filters.language));
    }
    if (filters.level) {
      partners = partners.filter(p => p.level === filters.level);
    }
    if (filters.nationality) {
      partners = partners.filter(p => p.nationality === filters.nationality);
    }
    
    console.log(`🎭 [Mock] 매칭 파트너 로드: ${partners.length}명`);
    return Promise.resolve({ data: partners });
  },

  requestMatch: (partnerId) => {
    console.log(`🎭 [Mock] 매칭 요청 전송: 파트너 ID ${partnerId}`);
    return Promise.resolve({ 
      data: { 
        success: true, 
        message: "매칭 요청이 성공적으로 전송되었습니다.",
        matchId: Math.random().toString(36).substr(2, 9)
      } 
    });
  },

  acceptMatch: (matchId) => {
    console.log(`🎭 [Mock] 매칭 수락: ${matchId}`);
    return Promise.resolve({ 
      data: { 
        success: true, 
        message: "매칭이 성공적으로 수락되었습니다.",
        chatRoomId: Math.random().toString(36).substr(2, 9)
      } 
    });
  },

  rejectMatch: (matchId) => {
    console.log(`🎭 [Mock] 매칭 거절: ${matchId}`);
    return Promise.resolve({ 
      data: { 
        success: true, 
        message: "매칭 요청이 거절되었습니다." 
      } 
    });
  },

  // ===== 채팅 시스템 =====
  getChatRooms: () => {
    const data = getMockData();
    console.log(`🎭 [Mock] 채팅방 목록 로드: ${data.chatRooms.length}개`);
    return Promise.resolve({ data: data.chatRooms });
  },

  getChatMessages: (roomId, page = 1) => {
    console.log(`🎭 [Mock] 채팅 메시지 로드: 방 ${roomId}, 페이지 ${page}`);
    const messages = [
      { id: 1, senderId: 1, senderName: "Dana Lee", message: "안녕하세요! 오늘 세션 어떠셨나요?", timestamp: "2025-08-29T14:30:00Z", isMe: false },
      { id: 2, senderId: currentUser + 1, senderName: getCurrentUserData().englishName, message: "정말 좋았어요! 많이 배웠습니다.", timestamp: "2025-08-29T14:32:00Z", isMe: true },
      { id: 3, senderId: 1, senderName: "Dana Lee", message: "다음에도 함께 공부해요 😊", timestamp: "2025-08-29T14:35:00Z", isMe: false }
    ];
    return Promise.resolve({ data: { messages, hasMore: page < 3 } });
  },

  sendChatMessage: (roomId, message) => {
    console.log(`🎭 [Mock] 메시지 전송: 방 ${roomId} - "${message}"`);
    const newMessage = {
      id: Date.now(),
      senderId: currentUser + 1,
      senderName: getCurrentUserData().englishName,
      message,
      timestamp: new Date().toISOString(),
      isMe: true
    };
    return Promise.resolve({ data: newMessage });
  },

  createChatRoom: (partnerIds, roomName) => {
    console.log(`🎭 [Mock] 새 채팅방 생성: ${roomName}`);
    const newRoom = {
      id: Date.now(),
      name: roomName,
      participants: partnerIds.length + 1,
      lastMessage: "채팅방이 생성되었습니다.",
      lastTime: "방금 전",
      unreadCount: 0
    };
    return Promise.resolve({ data: newRoom });
  },

  // ===== 세션 관리 =====
  getSessions: (filter = 'upcoming') => {
    const data = getMockData();
    let sessions = [...data.sessions];
    
    if (filter === 'completed') {
      sessions = sessions.map(s => ({...s, status: 'completed', date: '2025-08-27'}));
    }
    
    console.log(`🎭 [Mock] 세션 목록 로드 (${filter}): ${sessions.length}개`);
    return Promise.resolve({ data: sessions });
  },

  joinSession: (sessionId) => {
    console.log(`🎭 [Mock] 세션 참가: ${sessionId}`);
    return Promise.resolve({ 
      data: { 
        success: true, 
        sessionUrl: `https://mock-session.languagemate.kr/room/${sessionId}`,
        message: "세션에 참가했습니다." 
      } 
    });
  },

  cancelSession: (sessionId) => {
    console.log(`🎭 [Mock] 세션 취소: ${sessionId}`);
    return Promise.resolve({ 
      data: { 
        success: true, 
        message: "세션이 성공적으로 취소되었습니다." 
      } 
    });
  },

  scheduleSession: (sessionData) => {
    console.log(`🎭 [Mock] 세션 예약:`, sessionData);
    const newSession = {
      id: Date.now(),
      ...sessionData,
      status: 'upcoming'
    };
    return Promise.resolve({ data: newSession });
  },

  // ===== 성취 시스템 =====
  getAchievements: () => {
    const data = getMockData();
    console.log(`🎭 [Mock] 성취 목록 로드: ${data.achievements.length}개`);
    return Promise.resolve({ data: data.achievements });
  },

  claimAchievement: (achievementId) => {
    console.log(`🎭 [Mock] 성취 보상 수령: ${achievementId}`);
    return Promise.resolve({ 
      data: { 
        success: true, 
        points: 25,
        message: "성취 보상을 받았습니다!" 
      } 
    });
  },

  // ===== 알림 시스템 =====
  getNotifications: () => {
    const data = getMockData();
    console.log(`🎭 [Mock] 알림 목록 로드: ${data.notifications.length}개`);
    return Promise.resolve({ data: data.notifications });
  },

  markNotificationAsRead: (notificationId) => {
    console.log(`🎭 [Mock] 알림 읽음 표시: ${notificationId}`);
    return Promise.resolve({ data: { success: true } });
  },

  markAllNotificationsAsRead: () => {
    console.log(`🎭 [Mock] 모든 알림 읽음 표시`);
    return Promise.resolve({ data: { success: true, count: 3 } });
  },

  handleNotificationAction: (notificationId, action) => {
    console.log(`🎭 [Mock] 알림 액션 처리: ${notificationId} - ${action}`);
    return Promise.resolve({ 
      data: { 
        success: true, 
        message: `알림 액션이 처리되었습니다: ${action}` 
      } 
    });
  },

  // ===== 분석 데이터 =====
  getAnalytics: (period = 'monthly') => {
    const data = getMockData();
    console.log(`🎭 [Mock] 분석 데이터 로드 (${period})`);
    return Promise.resolve({ data: data.analytics });
  },

  getDetailedStats: () => {
    const data = getMockData();
    return Promise.resolve({ 
      data: {
        ...data.analytics,
        todayStats: {
          sessionsCompleted: 2,
          hoursStudied: 1.5,
          messagesExchanged: 12,
          newVocabulary: 8
        }
      }
    });
  },

  // ===== 설정 관리 =====
  updateSettings: (settings) => {
    console.log(`🎭 [Mock] 설정 업데이트:`, settings);
    return Promise.resolve({ 
      data: { 
        success: true, 
        message: "설정이 성공적으로 저장되었습니다." 
      } 
    });
  },

  getSettings: () => {
    console.log(`🎭 [Mock] 설정 로드`);
    return Promise.resolve({ 
      data: {
        notifications: {
          email: true,
          push: true,
          sessionReminders: true,
          matchRequests: true
        },
        privacy: {
          profileVisible: true,
          showOnlineStatus: true,
          allowMessages: true
        },
        language: {
          appLanguage: 'ko',
          teachingLanguages: getCurrentUserData().teachLanguages,
          learningLanguages: getCurrentUserData().learnLanguages
        }
      }
    });
  },

  // ===== 인증 관련 =====
  logout: () => {
    console.log(`🎭 [Mock] 로그아웃`);
    localStorage.removeItem('mockCurrentUser');
    return Promise.resolve({ data: { success: true } });
  },

  refreshToken: () => {
    console.log(`🎭 [Mock] 토큰 갱신`);
    return Promise.resolve({ 
      data: { 
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      } 
    });
  }
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

// Enhanced Mock 배너 표시 함수 - 사용자 전환 기능 포함
export const showMockModeBanner = () => {
  console.log('🎭 showMockModeBanner 호출됨:', { MOCK_MODE, isMockMode: isMockMode() });
  
  if (isMockMode() && typeof document !== 'undefined') {
    // Mock 모드 배너가 이미 있으면 제거
    const existingBanner = document.querySelector('#mock-mode-banner');
    if (existingBanner) {
      existingBanner.remove();
    }

    getCurrentUserData();
    const userOptions = mockUsers.map((user, index) => 
      `<option value="${index}" ${index === currentUser ? 'selected' : ''}>${user.englishName} (${user.koreanName})</option>`
    ).join('');

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
      padding: 8px 12px;
      font-weight: bold;
      font-size: 13px;
      z-index: 9999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    `;
    banner.innerHTML = `
      <span>🎭 MOCK 모드 활성화</span>
      <span>|</span>
      <span>현재 사용자:</span>
      <select onchange="window.mockApi.switchUser(parseInt(this.value))" style="
        background: rgba(255,255,255,0.2); 
        border: 1px solid rgba(255,255,255,0.5);
        color: white; 
        padding: 2px 6px; 
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
      ">
        ${userOptions}
      </select>
      <span>|</span>
      <button onclick="window.mockApi.showMockActions()" style="
        background: rgba(255,255,255,0.2); 
        border: 1px solid rgba(255,255,255,0.5);
        color: white; 
        padding: 4px 8px; 
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">테스트 기능</button>
      <button onclick="window.mockApi.toggleMockMode()" style="
        background: rgba(255,255,255,0.2); 
        border: 1px solid rgba(255,255,255,0.5);
        color: white; 
        padding: 4px 8px; 
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">실제 API 모드</button>
    `;
    
    document.body.appendChild(banner);
    
    // body에 패딩 추가해서 배너 아래 콘텐츠가 가려지지 않게 함
    document.body.style.paddingTop = '52px';
    
    // 전역에서 접근할 수 있도록 window 객체에 추가
    window.mockApi = { 
      toggleMockMode,
      switchUser: async (userIndex) => {
        console.log(`🎭 사용자 전환: ${mockUsers[userIndex]?.englishName}`);
        await mockApiCalls.switchUser(userIndex);
        window.location.reload(); // 페이지 새로고침으로 UI 업데이트
      },
      showMockActions: () => {
        const actions = [
          '🎯 매칭 요청 시뮬레이션',
          '💬 새 메시지 수신',
          '🏆 성취 달성 알림',
          '📅 세션 예약 완료',
          '⚡ 실시간 알림 테스트'
        ];
        
        const actionMenu = actions.map((action, index) => 
          `${index + 1}. ${action}`
        ).join('\n');
        
        const choice = prompt(`Mock 테스트 기능을 선택하세요:\n\n${actionMenu}\n\n번호를 입력하세요 (1-5):`);
        
        if (choice && choice >= 1 && choice <= 5) {
          mockApiCalls.handleMockAction(parseInt(choice));
          alert(`${actions[choice - 1]}이(가) 실행되었습니다! 콘솔을 확인하세요.`);
        }
      },
      testNotification: () => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('STUDYMATE Mock 테스트', {
            body: '새로운 매칭 요청이 있습니다!',
            icon: '/assets/basicProfilePic.png'
          });
        }
      }
    };
  }
};

// Mock 액션 핸들러 추가
mockApiCalls.handleMockAction = (actionType) => {
  const actions = {
    1: () => {
      console.log('🎯 [Mock Action] 매칭 요청 시뮬레이션');
      mockApiCalls.requestMatch(Math.floor(Math.random() * 5) + 1);
    },
    2: () => {
      console.log('💬 [Mock Action] 새 메시지 수신 시뮬레이션');
      mockApiCalls.sendChatMessage(1, '안녕하세요! Mock 테스트 메시지입니다.');
    },
    3: () => {
      console.log('🏆 [Mock Action] 성취 달성 알림');
      mockApiCalls.claimAchievement(Math.floor(Math.random() * 5) + 1);
    },
    4: () => {
      console.log('📅 [Mock Action] 세션 예약 완료');
      mockApiCalls.scheduleSession({
        title: 'Mock Test Session',
        partner: 'Test Partner',
        date: '2025-08-30',
        time: '15:00',
        duration: '30분',
        type: 'video'
      });
    },
    5: () => {
      console.log('⚡ [Mock Action] 실시간 알림 테스트');
      window.mockApi.testNotification();
    }
  };
  
  if (actions[actionType]) {
    actions[actionType]();
  }
};

export default { mockApiCalls, createMockableApi, isMockMode, showMockModeBanner };