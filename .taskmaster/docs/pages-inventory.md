# 페이지 인벤토리 및 구현 현황

## 📊 전체 현황 요약
- **총 페이지 수**: 53개
- **구현 완료**: 28개 (53%) - 로그인/온보딩 완료
- **구현 필요**: 22개 (41%) - 레벨 테스트, 매칭, 세션
- **개선 필요**: 3개 (6%) - 채팅 고도화

## ✅ 기존 구현된 페이지/컴포넌트

### 페이지 (Routes)
| 경로 | 컴포넌트 | 상태 | 비고 |
|------|---------|------|------|
| `/` | Login | ✅ 구현됨 | 로그인 페이지 |
| `/login/oauth2/code/naver` | Navercallback | ✅ 구현됨 | 네이버 OAuth 콜백 |
| `/agreement` | Agreement | ✅ 구현됨 | 약관 동의 |
| `/signup-complete` | SignupComplete | ✅ 구현됨 | 회원가입 완료 |
| `/main` | Main | ✅ 구현됨 | 메인 페이지 |
| `/onboarding-info/:step` | ObInfoRouter | ✅ 구현됨 | 온보딩 정보 |
| `/onboarding-lang/:step` | ObLangRouter | ✅ 구현됨 | 언어 설정 |
| `/onboarding-int/:step` | ObIntRouter | ✅ 구현됨 | 관심사 설정 |
| `/onboarding-partner/:step` | ObPartnerRouter | ✅ 구현됨 | 파트너 설정 |
| `/onboarding-schedule/:step` | ObScheduleRouter | ✅ 구현됨 | 스케줄 설정 |
| `/chat` | ChatPage | ✅ 구현됨 | 채팅 페이지 |

### 기존 컴포넌트
- CommonButton
- Header / MainHeader
- ProgressBar
- CommonChecklist
- 채팅 관련 컴포넌트들 (ChatContainer, ChatHeader, ChatInputArea 등)

### 프로필 페이지
| 페이지명 | 경로 | 상태 | 스크린샷 |
|---------|------|------|----------|
| 사용자 프로필 | `/profile` | ⚠️ 개선 필요 | 1.49.56.png, 1.50.24.png |
| 알림 시스템 | 프로필 내 기능 | ❌ 미구현 | 1.50.24.png |

## 🚧 구현 필요 페이지 (스크린샷 기반)

### 1. 레벨 테스트 플로우
| 페이지명 | 경로(예상) | 상태 | 스크린샷 |
|---------|-----------|------|----------|
| 레벨 테스트 시작 | `/level-test` | ❌ 미구현 | 12.33.06.png |
| 연결 상태 확인 | `/level-test/connection` | ❌ 미구현 | 12.33.11.png |
| 오디오 질문 | `/level-test/question/:id` | ❌ 미구현 | 12.33.17.png |
| 레벨 테스트 완료 | `/level-test/complete` | ❌ 미구현 | 12.33.20.png |
| AI 분석 결과 | `/level-test/result` | ❌ 미구현 | 12.35.08.png |

### 2. 매칭 플로우
| 페이지명 | 경로(예상) | 상태 | 스크린샷 |
|---------|-----------|------|----------|
| 매칭 프로필 | `/matching/profile/:userId` | ❌ 미구현 | 12.35.19.png |

### 3. 채팅 기능 (개선 필요)
| 페이지명 | 경로 | 상태 | 스크린샷 |
|---------|------|------|----------|
| 채팅 목록 | `/chat` | ⚠️ 기본 구현됨 | 1.47.55.png |
| 채팅방 | `/chat/:roomId` | ⚠️ 개선 필요 | 1.48.05.png, 1.48.34.png |
| 음성 메시지 | 채팅방 내 기능 | ❌ 미구현 | 1.48.43.png |

### 4. 세션(Session)
| 페이지명 | 경로(예상) | 상태 | 스크린샷 |
|---------|-----------|------|----------|
| 세션 목록 | `/session` | ❌ 미구현 | 1.49.26.png |
| 세션 캘린더 | `/session/calendar` | ❌ 미구현 | 1.49.37.png |
| 세션 연결 체크 (오디오) | `/session/audio/connection` | ❌ 미구현 | 1.51.12.png |
| 세션 연결 체크 (비디오) | `/session/video/connection` | ❌ 미구현 | 1.52.48.png |
| 오디오 세션 룸 (1:1) | `/session/audio/:roomId` | ❌ 미구현 | 1.51.30.png |
| 오디오 세션 룸 (그룹) | `/session/audio/:roomId` | ❌ 미구현 | 1.52.03.png |
| 비디오 세션 룸 (전체) | `/session/video/:roomId` | ❌ 미구현 | 1.52.53.png |
| 비디오 세션 룸 (혼합) | `/session/video/:roomId` | ❌ 미구현 | 1.53.04.png |
| 세션 예약 | `/session/book` | ❌ 미구현 | - |


## 🎨 디자인 시스템 요구사항

### 색상 팔레트
```css
:root {
  --primary-green: #00C471;
  --primary-hover: #009D5E;
  --text-primary: #111111;
  --text-secondary: #767676;
  --background-main: #FAFAFA;
  --background-white: #FFFFFF;
  --border-light: #E7E7E7;
  --warning-yellow: #FFA500;
  --success-light: #E6F9F1;
}
```

### 레이아웃 구조
- 최대 너비: 768px (모바일 중심)
- 사이드바: 80px (대시보드 레이아웃)
- 컨테이너 패딩: 24px

### 공통 컴포넌트 스타일
- 버튼 높이: 56px
- Border Radius: 6px (버튼), 10px (카드)
- 폰트: Pretendard

## 🔧 필요한 신규 컴포넌트

### 레벨 테스트 관련
1. **LevelTestLayout** - 레벨 테스트 공통 레이아웃
2. **ConnectionChecker** - 마이크/인터넷 연결 확인
3. **AudioRecorder** - 음성 녹음 컴포넌트
4. **CountdownTimer** - 3분 카운트다운 타이머
5. **RadarChart** - 6각형 레이더 차트
6. **LevelBadge** - 레벨 표시 배지

### 매칭 관련
1. **MatchingProfile** - 매칭 프로필 카드
2. **UserStatusIndicator** - Active Now 상태 표시
3. **HashtagList** - 관심사 해시태그

### 레이아웃 관련
1. **DashboardLayout** - 사이드바 포함 레이아웃
2. **Sidebar** - 좌측 네비게이션 바

## 📁 프로젝트 구조 제안

```
src/
├── pages/
│   ├── LevelTest/
│   │   ├── LevelTestIntro.jsx
│   │   ├── ConnectionCheck.jsx
│   │   ├── AudioQuestion.jsx
│   │   ├── LevelTestComplete.jsx
│   │   └── LevelTestResult.jsx
│   └── Matching/
│       └── MatchingProfile.jsx
├── components/
│   ├── levelTest/
│   │   ├── AudioRecorder.jsx
│   │   ├── CountdownTimer.jsx
│   │   ├── ConnectionChecker.jsx
│   │   ├── RadarChart.jsx
│   │   └── LevelBadge.jsx
│   ├── matching/
│   │   ├── MatchingProfileCard.jsx
│   │   ├── UserStatusIndicator.jsx
│   │   └── HashtagList.jsx
│   └── layout/
│       ├── DashboardLayout.jsx
│       └── Sidebar.jsx
├── stores/
│   ├── levelTestStore.js
│   └── matchingStore.js
└── api/
    ├── levelTest.js
    └── matching.js
```

## 🛤️ 라우팅 구조

```javascript
// 추가 필요한 라우트
<Routes>
  {/* 기존 라우트... */}
  
  {/* 레벨 테스트 */}
  <Route path="/level-test" element={<LevelTestIntro />} />
  <Route path="/level-test/connection" element={<ConnectionCheck />} />
  <Route path="/level-test/question/:questionId" element={<AudioQuestion />} />
  <Route path="/level-test/complete" element={<LevelTestComplete />} />
  <Route path="/level-test/result" element={<LevelTestResult />} />
  
  {/* 매칭 */}
  <Route path="/matching/profile/:userId" element={<MatchingProfile />} />
</Routes>
```

## 📡 API 엔드포인트 (예상)

### 레벨 테스트
- `POST /api/v1/level-test/start` - 테스트 시작
- `POST /api/v1/level-test/audio` - 음성 제출
- `GET /api/v1/level-test/question/:id` - 질문 조회
- `POST /api/v1/level-test/complete` - 테스트 완료
- `GET /api/v1/level-test/result` - 결과 조회

### 매칭
- `GET /api/v1/matching/recommend` - 추천 매칭
- `GET /api/v1/matching/profile/:userId` - 프로필 조회
- `POST /api/v1/matching/start-chat` - 채팅 시작

## 📝 상태 관리 (Zustand)

### levelTestStore
```javascript
{
  currentQuestion: 1,
  totalQuestions: 4,
  audioData: [],
  connectionStatus: {
    microphone: false,
    internet: false
  },
  testResult: null,
  timer: 180 // 3분
}
```

### matchingStore
```javascript
{
  matchedUser: null,
  matchingStatus: 'idle',
  interests: []
}
```

## 🎯 우선순위

1. **높음**: 레벨 테스트 플로우 (핵심 기능)
2. **중간**: 매칭 프로필 화면
3. **낮음**: 추가 최적화 및 애니메이션

## 📋 체크리스트

### 레벨 테스트
- [ ] 라우팅 설정
- [ ] 페이지 컴포넌트 생성
- [ ] 오디오 녹음 기능 구현
- [ ] 타이머 구현
- [ ] 연결 상태 체크
- [ ] API 연동
- [ ] 상태 관리

### 매칭
- [ ] 프로필 화면 구현
- [ ] 실시간 상태 표시
- [ ] 채팅 연동

### 공통
- [ ] 사이드바 레이아웃
- [ ] 반응형 디자인
- [ ] 애니메이션 효과