# 🗺️ STUDYMATE 구현 로드맵

> 기존 구조를 유지하면서 단계별로 기능을 추가하는 실행 계획

## 📅 전체 일정 (4주)

### Week 1: 레벨 테스트 구현
### Week 2: 매칭 시스템 구현  
### Week 3-4: 세션(Session) 구현
### Week 4: 프로필 개선 및 마무리

---

## 📝 Week 1: 레벨 테스트 구현

### Day 1-2: 기본 구조 및 라우팅
```javascript
// 1. 페이지 생성
src/pages/LevelTest/
├── LevelTestIntro.jsx      // 시작 화면
├── ConnectionCheck.jsx     // 연결 확인
├── AudioQuestion.jsx       // 음성 질문
├── LevelTestComplete.jsx   // 완료 화면
└── LevelTestResult.jsx     // 결과 화면

// 2. App.jsx에 라우트 추가
<Route path="/level-test" element={<LevelTestIntro />} />
<Route path="/level-test/connection" element={<ConnectionCheck />} />
<Route path="/level-test/question/:id" element={<AudioQuestion />} />
<Route path="/level-test/complete" element={<LevelTestComplete />} />
<Route path="/level-test/result" element={<LevelTestResult />} />

// 3. 스토어 생성
src/store/levelTestStore.js
```

### Day 3-4: 핵심 컴포넌트 개발
```javascript
// 오디오 녹음 컴포넌트
src/components/levelTest/AudioRecorder.jsx
- MediaRecorder API 구현
- 녹음 시작/중지
- 오디오 레벨 표시

// 연결 체크 컴포넌트  
src/components/levelTest/ConnectionChecker.jsx
- 마이크 권한 요청
- 네트워크 상태 확인
- 상태별 UI 표시

// 타이머 컴포넌트
src/components/levelTest/CountdownTimer.jsx
- 3분 카운트다운
- MM:SS 형식 표시
```

### Day 5: 결과 화면 및 차트
```javascript
// 레이더 차트 컴포넌트
src/components/levelTest/RadarChart.jsx
- recharts 라이브러리 사용
- 6개 영역 표시
- 애니메이션 적용

// 레벨 배지
src/components/levelTest/LevelBadge.jsx
```

### 체크포인트 ✅
- [ ] 음성 녹음 기능 작동
- [ ] 4개 질문 순차 진행
- [ ] 결과 차트 표시
- [ ] 기존 디자인 시스템 적용

---

## 📝 Week 2: 매칭 시스템 구현

### Day 1-2: 매칭 페이지 및 프로필
```javascript
// 1. 페이지 생성
src/pages/Matching/
├── MatchingList.jsx        // 매칭 목록
└── MatchingProfile.jsx     // 상세 프로필

// 2. 라우트 추가
<Route path="/matching" element={<MatchingList />} />
<Route path="/matching/profile/:userId" element={<MatchingProfile />} />

// 3. 스토어 생성
src/store/matchingStore.js
```

### Day 3-4: 매칭 컴포넌트
```javascript
// 프로필 카드
src/components/matching/MatchingProfileCard.jsx
- 사용자 정보 표시
- 온라인 상태 표시
- 관심사 태그

// 상태 표시기
src/components/matching/UserStatusIndicator.jsx

// 해시태그 리스트
src/components/matching/HashtagList.jsx
```

### Day 5: API 연동 및 채팅 연결
```javascript
// API 생성
src/api/matching.js
- 추천 목록 조회
- 프로필 상세 조회
- 매칭 요청

// 채팅 연동
- 기존 채팅 시스템과 연결
- "채팅 시작하기" 버튼 구현
```

### 체크포인트 ✅
- [ ] 매칭 프로필 표시
- [ ] 실시간 상태 표시
- [ ] 채팅 시작 기능
- [ ] 관심사 필터링

---

## 📝 Week 3-4: 세션(Session) 구현

### Day 1-3: 세션 기본 구조
```javascript
// 1. 페이지 생성
src/pages/Session/
├── SessionList.jsx         // 세션 목록
├── SessionCalendar.jsx     // 캘린더 뷰
├── AudioSession.jsx        // 오디오 세션
└── VideoSession.jsx        // 비디오 세션

// 2. 라우트 추가
<Route path="/session" element={<SessionList />} />
<Route path="/session/calendar" element={<SessionCalendar />} />
<Route path="/session/audio/:roomId" element={<AudioSession />} />
<Route path="/session/video/:roomId" element={<VideoSession />} />
```

### Day 4-6: WebRTC 구현
```javascript
// WebRTC 서비스
src/services/webrtc.js
- Peer 연결 설정
- 시그널링 서버 연동
- 미디어 스트림 관리

// 세션 컴포넌트
src/components/session/VideoGrid.jsx
- 참가자 비디오 표시
- 레이아웃 조정

src/components/session/AudioControls.jsx
- 마이크/카메라 컨트롤
- 볼륨 조절
```

### Day 7-8: 캘린더 및 예약
```javascript
// 캘린더 컴포넌트
src/components/session/SessionCalendar.jsx
- 월간 뷰
- 세션 표시
- 예약 기능
```

### 체크포인트 ✅
- [ ] 1:1 오디오 통화
- [ ] 4인 비디오 통화
- [ ] 세션 예약 기능
- [ ] 캘린더 표시

---

## 📝 Week 4: 프로필 및 마무리

### Day 1-2: 프로필 페이지 개선
```javascript
// 프로필 페이지
src/pages/Profile/Profile.jsx
- 학습 통계 표시
- 언어 정보
- 성취 배지

// 컴포넌트
src/components/profile/ProfileStats.jsx
src/components/profile/AchievementBadges.jsx
src/components/profile/MatesList.jsx
```

### Day 3-4: 레이아웃 통합
```javascript
// DashboardLayout 적용
src/components/layout/DashboardLayout.jsx
src/components/layout/Sidebar.jsx

// 페이지별 레이아웃 적용
- 레벨 테스트 결과
- 매칭 페이지
- 세션 페이지
- 프로필 페이지
```

### Day 5: 최종 테스트 및 버그 수정
- 전체 플로우 테스트
- 버그 수정
- 성능 최적화
- 문서 정리

---

## 🛠️ 기술 스택 추가 사항

### 필요한 패키지 설치
```bash
# 차트 라이브러리
npm install recharts

# 캘린더 (옵션)
npm install react-calendar

# WebRTC (세션용)
npm install simple-peer

# 이미지 처리 (옵션)
npm install react-image-crop
```

### API 엔드포인트 (예상)
```javascript
// 레벨 테스트
POST /api/v1/level-test/start
POST /api/v1/level-test/audio
GET  /api/v1/level-test/result

// 매칭
GET  /api/v1/matching/recommendations
GET  /api/v1/matching/profile/:userId
POST /api/v1/matching/request

// 세션
GET  /api/v1/session/list
POST /api/v1/session/create
GET  /api/v1/session/:roomId
POST /api/v1/session/join/:roomId
```

---

## 📊 진행 상황 추적

### Week 1 Progress
- [ ] Day 1-2: 기본 구조 ⏳
- [ ] Day 3-4: 핵심 컴포넌트
- [ ] Day 5: 결과 화면

### Week 2 Progress  
- [ ] Day 1-2: 매칭 페이지
- [ ] Day 3-4: 매칭 컴포넌트
- [ ] Day 5: API 연동

### Week 3-4 Progress
- [ ] Day 1-3: 세션 구조
- [ ] Day 4-6: WebRTC
- [ ] Day 7-8: 캘린더

### Week 4 Progress
- [ ] Day 1-2: 프로필
- [ ] Day 3-4: 레이아웃
- [ ] Day 5: 테스트

---

## 💡 개발 팁

### 1. 기존 코드 활용
```javascript
// CommonButton 사용
import CommonButton from '@/components/CommonButton';

// 기존 Header 사용
import Header from '@/components/Header';

// 기존 API 인스턴스 사용
import api from '@/api';
```

### 2. 스타일 일관성
```javascript
// 기존 Tailwind 클래스 사용
className="bg-green-500 text-white px-4 py-2 rounded"

// 기존 색상 변수 사용
style={{ backgroundColor: '#00C471' }}
```

### 3. 상태 관리 패턴
```javascript
// Zustand 패턴 유지
const useStore = create((set) => ({
  state: initialState,
  action: (payload) => set({ state: payload })
}));
```

---

## ⚠️ 리스크 관리

### 잠재적 이슈
1. **WebRTC 복잡도** - 세션 시스템 구현 시간 초과 가능
2. **API 미완성** - 백엔드 API 준비 상태 확인 필요
3. **브라우저 호환성** - 음성 녹음, WebRTC 지원 확인

### 대응 방안
1. **단계적 구현** - MVP 먼저, 고도화는 나중에
2. **Mock 데이터 사용** - API 없어도 개발 진행
3. **폴리필 적용** - 구형 브라우저 지원

---

이 로드맵을 따라 4주 안에 모든 핵심 기능을 구현할 수 있습니다.