# 컴포넌트 명세서

## 📦 필요 컴포넌트 목록

### ✅ 기존 컴포넌트 (재사용 가능)

| 컴포넌트명 | 위치 | 용도 | 재사용 가능 여부 |
|-----------|------|------|-----------------|
| CommonButton | `/components/CommonButton.jsx` | 공통 버튼 | ✅ 모든 버튼에 활용 |
| Header | `/components/Header.jsx` | 상단 헤더 | ✅ 일부 페이지 |
| MainHeader | `/components/MainHeader.jsx` | 메인 헤더 | ✅ 대시보드 페이지 |
| ProgressBar | `/components/PrograssBar.jsx` | 진행률 표시 | ✅ 레벨 테스트 |
| CommonChecklist | `/components/CommonChecklist.jsx` | 체크리스트 | ⚠️ 수정 필요 |

### 🆕 신규 개발 필요 컴포넌트

## 1. 레이아웃 컴포넌트

### DashboardLayout
```javascript
// 목적: 사이드바가 포함된 대시보드 레이아웃
// 위치: /components/layout/DashboardLayout.jsx

Props:
- children: ReactNode
- activeMenu?: string

기능:
- 좌측 사이드바 표시
- 메인 콘텐츠 영역
- 반응형 레이아웃

스타일:
- 사이드바: 80px 너비, 초록색 배경
- 메인: margin-left: 80px
```

### Sidebar
```javascript
// 목적: 좌측 네비게이션 바
// 위치: /components/layout/Sidebar.jsx

Props:
- activeItem?: string
- user?: UserInfo

메뉴 항목:
- 프로필 (상단)
- 홈
- 채팅
- 캘린더

기능:
- 활성 메뉴 하이라이트
- 라우팅 네비게이션
- 사용자 프로필 표시
```

## 2. 레벨 테스트 컴포넌트

### AudioRecorder
```javascript
// 목적: 음성 녹음 기능
// 위치: /components/levelTest/AudioRecorder.jsx

Props:
- onRecordingComplete: (audioBlob: Blob) => void
- maxDuration?: number (기본: 180초)
- isRecording: boolean
- onRecordingStart: () => void
- onRecordingStop: () => void

기능:
- MediaRecorder API 사용
- 실시간 오디오 레벨 표시
- 녹음 시작/중지
- 오디오 데이터 반환

상태:
- recording: boolean
- audioLevel: number
- duration: number
```

### CountdownTimer
```javascript
// 목적: 카운트다운 타이머
// 위치: /components/levelTest/CountdownTimer.jsx

Props:
- initialTime: number (초 단위)
- onTimeUp: () => void
- isPaused?: boolean

기능:
- MM:SS 형식 표시
- 자동 카운트다운
- 일시정지/재개
- 시간 종료 콜백

스타일:
- 크기: 18px
- 색상: #767676
- 위치: 헤더 중앙
```

### ConnectionChecker
```javascript
// 목적: 마이크/인터넷 연결 확인
// 위치: /components/levelTest/ConnectionChecker.jsx

Props:
- onConnectionReady: (status: ConnectionStatus) => void

기능:
- 마이크 권한 요청
- 오디오 입력 테스트
- 네트워크 상태 확인
- 상태별 UI 표시

상태:
- microphoneStatus: 'checking' | 'connected' | 'error'
- internetStatus: 'checking' | 'connected' | 'error'
```

### RadarChart
```javascript
// 목적: 6각형 레이더 차트
// 위치: /components/levelTest/RadarChart.jsx

Props:
- data: {
    fluency: number,
    pronunciation: number,
    vocabulary: number,
    grammar: number,
    expression: number
  }
- size?: number
- colors?: { fill: string, border: string }

기능:
- SVG 기반 렌더링
- 6개 축 표시
- 애니메이션 효과
- 반응형 크기

라이브러리:
- recharts 또는 직접 구현
```

### LevelBadge
```javascript
// 목적: 레벨 표시 배지
// 위치: /components/levelTest/LevelBadge.jsx

Props:
- level: 'Beginner' | 'Intermediate' | 'Intermediate High' | 'Advanced'
- size?: 'sm' | 'md' | 'lg'

스타일:
- Beginner: 주황색
- Intermediate: 초록색
- Advanced: 파란색
```

### QuestionCard
```javascript
// 목적: 질문 표시 카드
// 위치: /components/levelTest/QuestionCard.jsx

Props:
- question: string
- questionNumber: number
- totalQuestions: number

스타일:
- 배경: 연한 초록색
- 패딩: 24px
- 폰트: 16px
- Border radius: 10px
```

## 3. 매칭 컴포넌트

### MatchingProfileCard
```javascript
// 목적: 매칭된 사용자 프로필 카드
// 위치: /components/matching/MatchingProfileCard.jsx

Props:
- user: {
    name: string,
    age: number,
    country: string,
    profileImage: string,
    status: 'online' | 'away' | 'offline',
    bio: string,
    interests: string[]
  }
- onStartChat: () => void

기능:
- 프로필 이미지 표시
- 실시간 상태 표시
- 국가 플래그 표시
- 관심사 해시태그
```

### UserStatusIndicator
```javascript
// 목적: 사용자 온라인 상태 표시
// 위치: /components/matching/UserStatusIndicator.jsx

Props:
- status: 'online' | 'away' | 'offline'
- showText?: boolean

스타일:
- online: 초록색 점
- away: 주황색 점
- offline: 회색 점
```

### HashtagList
```javascript
// 목적: 관심사 해시태그 목록
// 위치: /components/matching/HashtagList.jsx

Props:
- tags: string[]
- maxTags?: number
- color?: string

스타일:
- 배경: 투명
- 테두리: 1px solid
- 패딩: 4px 8px
- 간격: 8px
```

## 4. 공통 UI 컴포넌트

### Modal
```javascript
// 목적: 모달 컴포넌트
// 위치: /components/common/Modal.jsx

Props:
- isOpen: boolean
- onClose: () => void
- title?: string
- children: ReactNode
- size?: 'sm' | 'md' | 'lg'

기능:
- 배경 딤 처리
- ESC 키로 닫기
- 외부 클릭으로 닫기
- 애니메이션
```

### LoadingSpinner
```javascript
// 목적: 로딩 스피너
// 위치: /components/common/LoadingSpinner.jsx

Props:
- size?: 'sm' | 'md' | 'lg'
- color?: string
- text?: string

스타일:
- 회전 애니메이션
- 중앙 정렬
```

### EmptyState
```javascript
// 목적: 빈 상태 표시
// 위치: /components/common/EmptyState.jsx

Props:
- icon?: ReactNode
- title: string
- description?: string
- action?: { label: string, onClick: () => void }

스타일:
- 중앙 정렬
- 아이콘: 48px
- 제목: 20px bold
- 설명: 14px gray
```

## 5. 애니메이션 컴포넌트

### CharacterAnimation
```javascript
// 목적: 랭메 캐릭터 애니메이션
// 위치: /components/animations/CharacterAnimation.jsx

Props:
- type: 'ufo' | 'wave' | 'thinking'
- size?: number

기능:
- SVG 또는 Lottie 애니메이션
- 부드러운 움직임
- 반응형 크기
```

### ProgressAnimation
```javascript
// 목적: 진행 상태 애니메이션
// 위치: /components/animations/ProgressAnimation.jsx

Props:
- progress: number (0-100)
- showPercentage?: boolean

스타일:
- 부드러운 전환
- 초록색 채우기
- 숫자 애니메이션
```

## 📊 컴포넌트 의존성 관계

```
DashboardLayout
├── Sidebar
└── Children (Pages)
    ├── LevelTestResult
    │   ├── LevelBadge
    │   ├── RadarChart
    │   └── CommonButton
    ├── MatchingProfile
    │   ├── MatchingProfileCard
    │   ├── UserStatusIndicator
    │   ├── HashtagList
    │   └── CommonButton
    └── AudioQuestion
        ├── QuestionCard
        ├── AudioRecorder
        ├── CountdownTimer
        └── CommonButton
```

## 🔧 기술 요구사항

### 필수 패키지
```json
{
  "dependencies": {
    "recharts": "^2.x.x",  // 레이더 차트
    "lottie-react": "^2.x.x",  // 애니메이션 (선택)
    "classnames": "^2.x.x"  // 조건부 클래스
  }
}
```

### Web APIs
- MediaRecorder API (음성 녹음)
- Web Audio API (오디오 레벨)
- Navigator.mediaDevices (마이크 권한)
- Navigator.onLine (네트워크 상태)

## ✅ 개발 우선순위

### Phase 1 (핵심)
1. DashboardLayout & Sidebar
2. AudioRecorder
3. CountdownTimer
4. ConnectionChecker

### Phase 2 (주요)
1. RadarChart
2. LevelBadge
3. QuestionCard
4. MatchingProfileCard

### Phase 3 (보조)
1. Modal
2. LoadingSpinner
3. EmptyState
4. Animations

## 📝 컴포넌트 테스트 체크리스트

각 컴포넌트별 테스트 항목:

### AudioRecorder
- [ ] 마이크 권한 요청 처리
- [ ] 녹음 시작/중지 동작
- [ ] 최대 시간 제한 (3분)
- [ ] 오디오 데이터 반환
- [ ] 에러 처리

### CountdownTimer
- [ ] 정확한 시간 카운트
- [ ] 일시정지/재개 기능
- [ ] 시간 종료 콜백
- [ ] 포맷팅 (MM:SS)

### ConnectionChecker
- [ ] 마이크 권한 확인
- [ ] 네트워크 상태 확인
- [ ] 상태별 UI 표시
- [ ] 에러 메시지 표시

### RadarChart
- [ ] 데이터 시각화 정확성
- [ ] 반응형 크기 조절
- [ ] 애니메이션 동작
- [ ] 축 라벨 표시

## 6. 알림 시스템 컴포넌트

### NotificationPopup
```javascript
// 목적: 알림 팝업 표시
// 위치: /components/notification/NotificationPopup.jsx

Props:
- notification: {
    id: string,
    sender: { name: string, avatar: string },
    message: string,
    timestamp: Date,
    type: 'message' | 'session' | 'matching' | 'system'
  }
- onReply?: () => void
- onClose: () => void
- position?: { top: number, right: number }

기능:
- 슬라이드 인/아웃 애니메이션
- 자동 닫기 (5초)
- 액션 버튼 처리
- 상대 시간 표시 (10 mins ago)

스타일:
- 너비: 320px
- 배경: 흰색
- 그림자: box-shadow
- Border radius: 10px
```

### NotificationBell
```javascript
// 목적: 헤더 알림 벨 아이콘
// 위치: /components/notification/NotificationBell.jsx

Props:
- hasUnread: boolean
- count?: number
- onClick: () => void

기능:
- 새 알림 시 빨간 점 표시
- 알림 개수 표시 (옵션)
- 클릭 이벤트 처리

스타일:
- 아이콘: 24px
- 빨간 점: 8px, position: absolute
- 카운트 배지: 빨간 원형
```

### NotificationList
```javascript
// 목적: 알림 목록 표시
// 위치: /components/notification/NotificationList.jsx

Props:
- notifications: Notification[]
- onNotificationClick: (id: string) => void
- onMarkAllRead: () => void

기능:
- 알림 목록 렌더링
- 읽음/안읽음 구분
- 무한 스크롤
- 필터링 (타입별)

스타일:
- 리스트 아이템 높이: 72px
- 안읽음: 배경색 다름
- 호버 효과
```

## 7. 프로필 컴포넌트

### ProfileStats
```javascript
// 목적: 학습 통계 카드
// 위치: /components/profile/ProfileStats.jsx

Props:
- stats: {
    totalHours: number,
    monthlyHours: number,
    streak: number,
    mates: number
  }

스타일:
- 4개 카드 그리드
- 큰 숫자: 32px bold
- 부제목: 14px gray
- 카드 간격: 16px
```

### LanguageSkills
```javascript
// 목적: 언어 능력 표시
// 위치: /components/profile/LanguageSkills.jsx

Props:
- native: Language[]
- learning: Language[]

Language: {
  name: string,
  level: string,
  flag?: string
}

스타일:
- 언어별 배지
- 레벨 표시
- 국기 아이콘
```

### AchievementBadges
```javascript
// 목적: 성취 배지 표시
// 위치: /components/profile/AchievementBadges.jsx

Props:
- badges: Badge[]

Badge: {
  id: string,
  name: string,
  icon: string,
  dateEarned: Date,
  description: string
}

기능:
- 배지 그리드 표시
- 호버 시 설명
- 획득 날짜 표시

스타일:
- 배지 크기: 64px
- 그리드: 4열
- 간격: 16px
```

### MatesList
```javascript
// 목적: 고정 메이트 목록
// 위치: /components/profile/MatesList.jsx

Props:
- mates: Mate[]
- onMateClick: (id: string) => void

Mate: {
  id: string,
  name: string,
  country: string,
  profileImage: string,
  languages: string
}

스타일:
- 리스트 형태
- 프로필 이미지: 40px 원형
- 언어 교환 방향 표시
```