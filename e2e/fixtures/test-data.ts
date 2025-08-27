// 테스트 데이터 픽스처

export const testUsers = {
  validUser: {
    email: 'test@naver.com',
    name: '테스트사용자',
    englishName: 'Test User',
    profileImage: null,
  },
  
  newUser: {
    email: 'newuser@naver.com', 
    name: '신규사용자',
    englishName: 'New User',
    location: 'Seoul, South Korea',
    selfBio: 'Hello! I am learning English.',
    birthYear: 1990,
    birthday: '03-15',
    gender: 'MALE'
  }
} as const;

export const onboardingData = {
  step1: {
    languages: [
      {
        languageId: 1,
        level: 'INTERMEDIATE'
      }
    ],
    nativeLanguage: 'Korean'
  },
  
  step2: {
    topics: [1, 3, 5],
    motivations: [2, 4], 
    learningStyles: [1, 3],
    communicationMethods: ['TEXT', 'VOICE']
  },
  
  step3: {
    preferredGender: 'ANY',
    preferredPersonalities: [1, 2, 4],
    groupSize: 'ONE_ON_ONE'
  },
  
  step4: {
    schedules: [
      {
        dayOfWeek: 'MONDAY',
        startTime: '19:00',
        endTime: '21:00'
      },
      {
        dayOfWeek: 'WEDNESDAY', 
        startTime: '20:00',
        endTime: '22:00'
      }
    ],
    dailyMinutes: 60,
    learningExceptions: ['BUSINESS_TRIP', 'EXAM_PERIOD']
  }
} as const;

export const chatData = {
  testMessage: 'Hello! How are you today?',
  longMessage: 'This is a very long message to test the chat interface. '.repeat(10),
  emojiMessage: '😀 🎉 ❤️ 👍',
  
  imageFile: {
    name: 'test-image.jpg',
    type: 'image/jpeg',
    size: 1024 * 50 // 50KB
  }
} as const;

export const matchingData = {
  partner: {
    id: 2,
    englishName: 'Sarah Kim',
    profileImage: 'https://api.languagemate.kr/uploads/profiles/2.jpg',
    location: 'Seoul, South Korea',
    nativeLanguage: 'English',
    learningLanguage: 'Korean',
    languageLevel: 'BEGINNER',
    matchScore: 85,
    commonInterests: ['Movies', 'Travel', 'Technology']
  },
  
  matchRequest: {
    message: '안녕하세요! 함께 언어 교환하고 싶어요.'
  }
} as const;

export const apiEndpoints = {
  auth: {
    naverCallback: '/login/oauth2/code/naver',
    refresh: '/api/v1/auth/refresh', 
    logout: '/api/v1/auth/logout'
  },
  
  user: {
    profile: '/api/v1/users/profile',
    updateProfile: '/api/v1/users/profile',
    uploadImage: '/api/v1/users/profile/image'
  },
  
  onboarding: {
    status: '/api/v1/onboarding/status',
    step: (step: number) => `/api/v1/onboarding/step/${step}`,
    complete: '/api/v1/onboarding/complete'
  },
  
  matching: {
    partners: '/api/v1/matching/partners',
    request: '/api/v1/matching/request',
    accept: (matchId: number) => `/api/v1/matching/accept/${matchId}`,
    reject: (matchId: number) => `/api/v1/matching/reject/${matchId}`
  },
  
  chat: {
    rooms: '/api/v1/chat/rooms',
    createRoom: '/api/v1/chat/rooms',
    messages: (roomId: number) => `/api/v1/chat/rooms/${roomId}/messages`
  },
  
  clova: {
    correction: '/api/v1/clova/correction'
  }
} as const;

export const selectors = {
  // Common selectors
  buttons: {
    submit: '[data-testid="submit-button"]',
    cancel: '[data-testid="cancel-button"]',
    next: '[data-testid="next-button"]',
    previous: '[data-testid="previous-button"]',
    complete: '[data-testid="complete-button"]'
  },
  
  inputs: {
    text: 'input[type="text"]',
    email: 'input[type="email"]',
    password: 'input[type="password"]',
    textarea: 'textarea'
  },
  
  // Page specific selectors
  login: {
    naverButton: '[data-testid="naver-login-button"]',
    autoLoginCheckbox: '[data-testid="auto-login-checkbox"]',
    agreementCheckbox: '[data-testid="agreement-checkbox"]'
  },
  
  onboarding: {
    stepIndicator: '[data-testid="step-indicator"]',
    languageSelect: '[data-testid="language-select"]',
    levelSelect: '[data-testid="level-select"]',
    topicCheckbox: '[data-testid="topic-checkbox"]',
    motivationCheckbox: '[data-testid="motivation-checkbox"]',
    genderRadio: '[data-testid="gender-radio"]',
    personalityCheckbox: '[data-testid="personality-checkbox"]',
    scheduleInput: '[data-testid="schedule-input"]'
  },
  
  main: {
    welcomeMessage: '[data-testid="welcome-message"]',
    navigationMenu: '[data-testid="navigation-menu"]',
    userProfile: '[data-testid="user-profile"]'
  },
  
  matching: {
    partnerCard: '[data-testid="partner-card"]',
    matchButton: '[data-testid="match-button"]',
    filterButton: '[data-testid="filter-button"]',
    searchInput: '[data-testid="search-input"]'
  },
  
  chat: {
    roomList: '[data-testid="chat-room-list"]',
    roomItem: '[data-testid="chat-room-item"]',
    messageList: '[data-testid="message-list"]',
    messageItem: '[data-testid="message-item"]',
    messageInput: '[data-testid="message-input"]',
    sendButton: '[data-testid="send-button"]',
    imageUpload: '[data-testid="image-upload"]'
  },
  
  profile: {
    profileImage: '[data-testid="profile-image"]',
    nameInput: '[data-testid="name-input"]',
    locationInput: '[data-testid="location-input"]',
    bioTextarea: '[data-testid="bio-textarea"]',
    saveButton: '[data-testid="save-button"]'
  }
} as const;

export const waitTimes = {
  short: 1000,    // 1초
  medium: 3000,   // 3초
  long: 5000,     // 5초
  api: 10000,     // 10초 (API 응답 대기)
  navigation: 15000  // 15초 (페이지 네비게이션 대기)
} as const;