# 📚 STUDYMATE 개발 가이드

> 기존 구조를 최대한 활용하면서 점진적으로 개선하는 실용적인 가이드

## 🎯 개발 원칙

### 1. 기존 구조 존중
- **현재 폴더 구조 유지**: pages/, components/, store/ 구조 그대로 사용
- **기존 컴포넌트 활용**: CommonButton, Header 등 이미 만들어진 컴포넌트 재사용
- **Zustand 활용**: 이미 구축된 store들을 확장하여 사용

### 2. 점진적 개선
- 새로운 기능 추가 시에만 개선된 패턴 적용
- 기존 코드는 필요한 경우에만 리팩토링
- 작동하는 코드는 건드리지 않기

## 📁 현재 프로젝트 구조 (유지)

```
src/
├── pages/           # 페이지 컴포넌트 (그대로 유지)
│   ├── Login/       ✅ 완료
│   ├── ObInfo/      ✅ 완료  
│   ├── ObLang/      ✅ 완료
│   ├── ObInt/       ✅ 완료
│   ├── ObPartner/   ✅ 완료
│   ├── ObSchadule/  ✅ 완료
│   ├── Main.jsx     ✅ 완료
│   └── Chat/        ⚠️ 개선 필요
├── components/      # 컴포넌트 (기존 활용 + 추가)
├── store/           # Zustand 스토어 (기존 활용)
└── api/             # API 통신 (기존 활용)
```

## 🆕 추가할 폴더/파일만

### 1. 새로운 페이지 추가 위치
```
src/pages/
├── LevelTest/          # 🆕 레벨 테스트 (새로 추가)
│   ├── LevelTestIntro.jsx
│   ├── ConnectionCheck.jsx
│   ├── AudioQuestion.jsx
│   ├── LevelTestComplete.jsx
│   └── LevelTestResult.jsx
├── Matching/           # 🆕 매칭 (새로 추가)
│   └── MatchingProfile.jsx
├── Session/            # 🆕 세션 (새로 추가)
│   ├── SessionList.jsx
│   ├── SessionCalendar.jsx
│   ├── AudioSession.jsx
│   └── VideoSession.jsx
└── Profile/            # 🆕 프로필 (새로 추가)
    └── Profile.jsx
```

### 2. 새로운 컴포넌트 추가 위치
```
src/components/
├── (기존 컴포넌트들...)
├── levelTest/          # 🆕 레벨 테스트용 컴포넌트
│   ├── AudioRecorder.jsx
│   ├── CountdownTimer.jsx
│   ├── ConnectionChecker.jsx
│   ├── RadarChart.jsx
│   └── LevelBadge.jsx
├── matching/           # 🆕 매칭용 컴포넌트
│   ├── MatchingProfileCard.jsx
│   ├── UserStatusIndicator.jsx
│   └── HashtagList.jsx
├── session/            # 🆕 세션용 컴포넌트
│   ├── SessionCard.jsx
│   ├── VideoGrid.jsx
│   └── AudioControls.jsx
└── layout/             # 🆕 레이아웃 컴포넌트
    ├── DashboardLayout.jsx
    └── Sidebar.jsx
```

### 3. 새로운 스토어 추가
```javascript
// src/store/levelTestStore.js (새로 추가)
import { create } from 'zustand';

const useLevelTestStore = create((set) => ({
  currentQuestion: 1,
  totalQuestions: 4,
  recordings: [],
  connectionStatus: {
    microphone: false,
    internet: false
  },
  testResult: null,
  timer: 180,
  
  // 액션들
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  addRecording: (recording) => set((state) => ({
    recordings: [...state.recordings, recording]
  })),
  nextQuestion: () => set((state) => ({
    currentQuestion: state.currentQuestion + 1
  })),
  setTestResult: (result) => set({ testResult: result }),
  resetTest: () => set({
    currentQuestion: 1,
    recordings: [],
    testResult: null,
    timer: 180
  })
}));

export default useLevelTestStore;
```

```javascript
// src/store/matchingStore.js (새로 추가)
import { create } from 'zustand';

const useMatchingStore = create((set) => ({
  matchedUsers: [],
  currentMatch: null,
  matchingStatus: 'idle', // idle, searching, matched
  
  setMatchedUsers: (users) => set({ matchedUsers: users }),
  setCurrentMatch: (user) => set({ currentMatch: user }),
  setMatchingStatus: (status) => set({ matchingStatus: status })
}));

export default useMatchingStore;
```

## 🎨 디자인 시스템 활용법

### 기존 색상 그대로 사용
```css
/* 이미 정의된 색상 활용 */
--primary-green: #00C471;
--primary-black: #111111;
--text-secondary: #929292;
--background: #FAFAFA;
--white: #FFFFFF;
--border: #E7E7E7;
```

### 기존 CommonButton 활용 예시
```javascript
// 기존 CommonButton 그대로 사용
import CommonButton from '@/components/CommonButton';

// 사용 예시
<CommonButton
  onClick={handleNext}
  disabled={!isValid}
  className="mt-6"
>
  다음으로
</CommonButton>
```

## 📝 개발 순서 (우선순위)

### Phase 1: 레벨 테스트 (1주차)
1. **라우팅 추가** (App.jsx에 추가만)
```javascript
// App.jsx에 추가
import LevelTestIntro from './pages/LevelTest/LevelTestIntro';
import ConnectionCheck from './pages/LevelTest/ConnectionCheck';
// ... 기타 import

// Routes에 추가
<Route path="/level-test" element={<LevelTestIntro />} />
<Route path="/level-test/connection" element={<ConnectionCheck />} />
<Route path="/level-test/question/:id" element={<AudioQuestion />} />
<Route path="/level-test/complete" element={<LevelTestComplete />} />
<Route path="/level-test/result" element={<LevelTestResult />} />
```

2. **컴포넌트 개발**
- AudioRecorder.jsx - 음성 녹음
- CountdownTimer.jsx - 타이머
- ConnectionChecker.jsx - 연결 확인
- RadarChart.jsx - 결과 차트

3. **API 연동** (기존 api/index.js 활용)
```javascript
// api/levelTest.js (새로 추가)
import api from './index';

export const levelTestAPI = {
  startTest: () => api.post('/api/v1/level-test/start'),
  submitAudio: (audioBlob, questionId) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('questionId', questionId);
    return api.post('/api/v1/level-test/audio', formData);
  },
  getResult: () => api.get('/api/v1/level-test/result')
};
```

### Phase 2: 매칭 시스템 (2주차)
1. **매칭 프로필 페이지**
2. **실시간 상태 표시**
3. **채팅 연동**

### Phase 3: 세션 시스템 (3-4주차)
1. **WebRTC 설정**
2. **세션 룸 구현**
3. **캘린더 연동**

## 🔧 실제 구현 예시

### 1. AudioRecorder 컴포넌트 (신규)
```javascript
// src/components/levelTest/AudioRecorder.jsx
import { useState, useRef, useEffect } from 'react';
import CommonButton from '../CommonButton';

const AudioRecorder = ({ onRecordingComplete, maxDuration = 180 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('마이크 접근 오류:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, maxDuration]);

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
          isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
          {isRecording ? (
            <rect x="6" y="6" width="8" height="8" />
          ) : (
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          )}
        </svg>
      </button>
      
      {isRecording && (
        <div className="mt-4 text-center">
          <p className="text-lg font-bold">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</p>
          <p className="text-sm text-gray-600">녹음 중...</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
```

### 2. DashboardLayout 컴포넌트 (신규)
```javascript
// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu={location.pathname} />
      <main className="flex-1 ml-20 p-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
```

### 3. Sidebar 컴포넌트 (신규)
```javascript
// src/components/layout/Sidebar.jsx
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeMenu }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/main', icon: '🏠', label: '홈' },
    { path: '/chat', icon: '💬', label: '채팅' },
    { path: '/session', icon: '📅', label: '세션' },
    { path: '/profile', icon: '👤', label: '프로필' }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-green-500 flex flex-col items-center py-6">
      <div className="mb-8">
        <img src="/logo.png" alt="Logo" className="w-12 h-12" />
      </div>
      
      <nav className="flex-1 flex flex-col gap-4">
        {menuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center text-white transition-all ${
              activeMenu === item.path ? 'bg-green-600' : 'hover:bg-green-400'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
```

## 🚀 API 연동 패턴

### 기존 axios 인스턴스 활용
```javascript
// 기존 api/index.js는 그대로 두고
// 새로운 API 파일만 추가

// api/matching.js
import api from './index';

export const matchingAPI = {
  getRecommendations: () => api.get('/api/v1/matching/recommendations'),
  getProfile: (userId) => api.get(`/api/v1/matching/profile/${userId}`),
  sendMatchRequest: (userId) => api.post('/api/v1/matching/request', { userId })
};

// 사용 예시
import { matchingAPI } from '@/api/matching';

const loadRecommendations = async () => {
  try {
    const { data } = await matchingAPI.getRecommendations();
    setMatchedUsers(data.users);
  } catch (error) {
    console.error('매칭 로드 실패:', error);
  }
};
```

## ⚠️ 주의사항

### 하지 말아야 할 것들
1. **기존 페이지 구조 변경 금지** - ObInfo, ObLang 등은 그대로 유지
2. **기존 컴포넌트 수정 최소화** - 필요한 경우만 props 추가
3. **라우팅 구조 대규모 변경 금지** - 새 라우트만 추가

### 꼭 해야 할 것들
1. **기존 스타일 활용** - Tailwind 클래스 그대로 사용
2. **기존 API 패턴 유지** - axios 인터셉터 활용
3. **기존 상태관리 패턴 유지** - Zustand 사용법 통일

## 📋 체크리스트

### 레벨 테스트 구현 시
- [ ] 기존 Header 컴포넌트 재사용
- [ ] 기존 CommonButton 컴포넌트 활용
- [ ] 기존 ProgressBar 컴포넌트 활용
- [ ] 기존 api/index.js의 axios 인스턴스 사용
- [ ] 새로운 levelTestStore.js 추가
- [ ] App.jsx에 라우트만 추가

### 매칭 시스템 구현 시
- [ ] 기존 채팅 연동 코드 활용
- [ ] 기존 프로필 이미지 처리 로직 재사용
- [ ] WebSocket 연결은 기존 것 활용

## 🎯 성공 기준

1. **기존 기능 정상 작동** - 온보딩, 로그인 등 기존 기능 영향 없음
2. **점진적 개선** - 새 기능만 개선된 패턴 적용
3. **일관성 유지** - 기존 코드 스타일과 일치
4. **재사용성** - 기존 컴포넌트 최대한 활용

---

이 가이드를 따라 개발하면 기존 구조를 해치지 않으면서 새로운 기능을 안정적으로 추가할 수 있습니다.