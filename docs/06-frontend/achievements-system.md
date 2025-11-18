# Achievement System (성취 & 배지 시스템)

## 목차
1. [시스템 개요](#시스템-개요)
2. [아키텍처](#아키텍처)
3. [Achievement 카테고리 및 티어](#achievement-카테고리-및-티어)
4. [상태 관리 (Zustand Store)](#상태-관리-zustand-store)
5. [UI 컴포넌트](#ui-컴포넌트)
6. [진행도 추적 및 XP 보상](#진행도-추적-및-xp-보상)
7. [API 통합](#api-통합)
8. [개발 가이드](#개발-가이드)

---

## 시스템 개요

### 주요 기능
Achievement 시스템은 사용자의 학습 동기 부여와 참여를 높이기 위한 gamification 시스템입니다.

**핵심 기능:**
- 📊 **진행도 추적**: 실시간 업적 달성 현황 모니터링
- 🏆 **배지 획득**: 카테고리별/티어별 배지 시스템
- ⭐ **XP 보상**: 업적 완료 시 경험치 획득
- 📈 **통계 대시보드**: 완료율, 총 XP, 진행 중 업적 현황
- 🎯 **카테고리 필터링**: 학습/소셜/마일스톤 등 9가지 카테고리
- 🔔 **자동 추적**: 사용자 행동 기반 업적 자동 감지 (8가지 이벤트 타입)

### 기술 스택
- **상태 관리**: Zustand (persist middleware, 5분 캐시)
- **API 통신**: Axios (11개 엔드포인트)
- **UI 라이브러리**: Lucide React (Trophy, Award, Target, Clock, Gift 아이콘)
- **스타일링**: Tailwind CSS (반응형 디자인)
- **Hook**: useAchievementOverview (캐시 및 초기화 로직)

### 라우팅 구조
```
/achievements → AchievementsPage (전체 업적 페이지)
/main → MainAchievementsSection (메인 페이지 내 업적 섹션)
```

---

## 아키텍처

### 시스템 흐름도
```
사용자 행동 (학습/소셜/프로필 활동)
    ↓
백엔드 자동 감지 (8가지 이벤트 타입)
    ↓
achievementStore.fetchAchievements()
    ↓
Promise.all([
  getMyAchievements(),      // 업적 목록
  getMyAchievementStats()   // 통계 데이터
])
    ↓
Zustand Store 업데이트 (persist, 5분 TTL)
    ↓
UI 컴포넌트 렌더링 (AchievementsPage, AchievementBadges)
    ↓
진행도 바 & XP 표시
```

### 데이터 흐름
1. **초기 로드**:
   - `useAchievementOverview` 훅이 마운트 시 자동 fetch
   - `initializedRef`로 중복 호출 방지
   - 캐시된 데이터 확인 (5분 TTL)

2. **실시간 업데이트**:
   - 사용자 행동 → 백엔드 이벤트 추적 → 업적 진행도 업데이트
   - 수동 새로고침: `refresh()` 함수 호출

3. **로컬 캐싱**:
   - Zustand persist middleware로 localStorage 저장
   - `lastFetchedAt` 타임스탬프로 캐시 유효성 검증

### 파일 구조
```
src/
├── pages/
│   └── Achievements/
│       └── AchievementsPage.jsx          # 메인 업적 페이지
├── components/
│   ├── AchievementBadges.jsx             # 배지 카드 컴포넌트
│   └── MainAchievementsSection.jsx       # 메인 페이지 래퍼
├── hooks/
│   └── useAchievementOverview.js         # 업적 개요 훅
├── store/
│   └── achievementStore.js               # Zustand 스토어
└── api/
    └── achievement.js                    # 11개 API 함수
```

---

## Achievement 카테고리 및 티어

### 카테고리 (9가지)
```javascript
export const ACHIEVEMENT_CATEGORIES = {
  STUDY: 'STUDY',           // 학습 (세션 완료, 레벨 테스트 등)
  SOCIAL: 'SOCIAL',         // 소셜 (친구 추가, 매칭 등)
  MILESTONE: 'MILESTONE',   // 마일스톤 (100일 학습, 1000점 달성 등)
  SPECIAL: 'SPECIAL',       // 특별 (이벤트, 시즌 업적)
  STREAK: 'STREAK',         // 연속 (연속 출석, 연속 학습 등)
  ENGAGEMENT: 'ENGAGEMENT', // 참여 (세션 참여율, 피드백 등)
  PROFILE: 'PROFILE',       // 프로필 (프로필 완성도, 자기소개 등)
  SESSION: 'SESSION',       // 세션 (세션 횟수, 시간 등)
  CHAT: 'CHAT'              // 채팅 (메시지 수, 대화 시간 등)
};

const CATEGORY_LABELS = {
  ALL: '전체',
  STUDY: '학습',
  SOCIAL: '소셜',
  MILESTONE: '마일스톤',
  SPECIAL: '특별',
  STREAK: '연속',
  ENGAGEMENT: '참여',
  PROFILE: '프로필',
  SESSION: '세션',
  CHAT: '채팅'
};
```

### 티어 시스템 (6단계)
```javascript
const TIER_COLORS = {
  BRONZE: 'text-orange-500',      // 브론즈 (초급)
  SILVER: 'text-gray-500',        // 실버 (중급)
  GOLD: 'text-yellow-500',        // 골드 (상급)
  PLATINUM: 'text-blue-500',      // 플래티넘 (전문가)
  DIAMOND: 'text-purple-500',     // 다이아몬드 (마스터)
  LEGENDARY: 'text-amber-500'     // 레전더리 (전설)
};
```

**티어별 특징:**
- **BRONZE**: 첫 세션 완료, 프로필 등록 등 기본 업적
- **SILVER**: 10회 세션 완료, 5명 친구 추가 등 중급 업적
- **GOLD**: 50회 세션 완료, 레벨 업 등 상급 업적
- **PLATINUM**: 100회 세션, 전문가 레벨 달성 등
- **DIAMOND**: 500회 세션, 마스터 레벨 등
- **LEGENDARY**: 1000회 세션, 1년 연속 출석 등 최고 난이도

### 자동 추적 이벤트 타입 (8가지)
백엔드에서 자동으로 감지하는 사용자 행동:
1. **SESSION_COMPLETED** - 세션 완료
2. **LEVEL_TEST_PASSED** - 레벨 테스트 통과
3. **FRIEND_ADDED** - 친구 추가
4. **PROFILE_COMPLETED** - 프로필 완성
5. **CHAT_MESSAGE_SENT** - 채팅 메시지 전송
6. **DAILY_LOGIN** - 일일 로그인
7. **STREAK_MAINTAINED** - 연속 출석 유지
8. **XP_MILESTONE** - XP 마일스톤 달성

---

## 상태 관리 (Zustand Store)

### achievementStore.js 구조
```javascript
const useAchievementStore = create(
  persist(
    (set, get) => ({
      // 상태 필드
      achievements: [],              // 전체 업적 목록
      userAchievements: [],          // 사용자 완료 업적
      totalPoints: 0,                // 총 XP
      currentLevel: 1,               // 현재 레벨
      unlockedBadges: [],            // 잠금 해제된 배지 ID
      recentAchievements: [],        // 최근 업적 (최대 10개)
      stats: null,                   // 통계 객체 (아래 참조)
      lastFetchedAt: 0,              // 마지막 fetch 시간
      loading: false,
      error: null,

      // 액션
      setAchievements,               // 업적 목록 설정
      setUserAchievements,           // 사용자 업적 설정
      updateTotalPoints,             // 총 XP 업데이트
      addPoints,                     // XP 추가
      updateLevel,                   // 레벨 업데이트
      unlockBadge,                   // 배지 잠금 해제
      addRecentAchievement,          // 최근 업적 추가
      completeAchievement,           // 업적 완료 처리
      getAchievementProgress,        // 전체 진행도 계산
      getAchievementsByCategory,     // 카테고리별 필터
      isAchievementCompleted,        // 완료 여부 확인
      fetchAchievements,             // API 호출 (캐시 포함)
      reset                          // 전체 초기화
    }),
    {
      name: 'achievement-storage',
      partialize: (state) => ({      // localStorage에 저장할 필드
        achievements: state.achievements,
        userAchievements: state.userAchievements,
        totalPoints: state.totalPoints,
        currentLevel: state.currentLevel,
        unlockedBadges: state.unlockedBadges,
        recentAchievements: state.recentAchievements,
        stats: state.stats,
        lastFetchedAt: state.lastFetchedAt
      })
    }
  )
);
```

### stats 객체 구조
```javascript
const stats = {
  totalAchievements: 0,            // 전체 업적 수
  completedAchievements: 0,        // 완료한 업적 수
  inProgressAchievements: 0,       // 진행 중 업적 수
  totalXpEarned: 0,                // 총 획득 XP
  unclaimedRewards: 0,             // 미수령 보상 수
  completionRate: 0,               // 완료율 (0-100%)
  achievementsByCategory: {},      // 카테고리별 업적 수
  achievementsByTier: {},          // 티어별 업적 수
  recentCompletions: [],           // 최근 완료 업적 (최대 5개)
  nearCompletion: []               // 곧 달성 가능 업적 (진행도 80% 이상)
};
```

### 캐시 전략
```javascript
const ACHIEVEMENT_CACHE_TTL = 5 * 60 * 1000; // 5분

const shouldUseCache =
  !force &&
  state.achievements.length > 0 &&
  state.lastFetchedAt &&
  now - state.lastFetchedAt < ACHIEVEMENT_CACHE_TTL;
```

**캐시 동작:**
- 5분 이내 재요청 시 캐시된 데이터 반환
- `force: true` 옵션으로 강제 새로고침 가능
- 로딩 중일 때는 현재 상태 반환 (중복 요청 방지)

### 데이터 정규화
```javascript
const resolveAchievements = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.achievements)) return payload.achievements;
  if (Array.isArray(payload)) return payload;
  return [];
};

const normalizeStats = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  return {
    totalAchievements: typeof raw.totalAchievements === 'number' && !Number.isNaN(raw.totalAchievements)
      ? raw.totalAchievements
      : 0,
    completedAchievements: typeof raw.completedAchievements === 'number' && !Number.isNaN(raw.completedAchievements)
      ? raw.completedAchievements
      : 0,
    // ... 모든 숫자 필드 안전 처리
  };
};
```

---

## UI 컴포넌트

### 1. AchievementsPage (메인 업적 페이지)

**파일**: `src/pages/Achievements/AchievementsPage.jsx` (355 lines)

**구조:**
```jsx
const AchievementsPage = () => {
  const navigate = useNavigate();
  const { achievements, stats, loading, error, refresh } = useAchievementOverview();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredAchievements = selectedCategory === 'ALL'
    ? achievements
    : achievements.filter((item) => item.achievement?.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <h1>성취 & 배지</h1>
        <p>완료 {completedCount}/{totalCount} · 총 XP {totalXp}</p>
        <button onClick={refresh}>새로고침</button>
      </div>

      {/* 콘텐츠 */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <StatsOverview stats={stats} />
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <AchievementsList achievements={filteredAchievements} loading={loading} error={error} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <RecentCompletions stats={stats} />
          <UpcomingAchievements stats={stats} />
        </div>
      </div>
    </div>
  );
};
```

**주요 섹션:**
- **StatsOverview**: 진행 상황 대시보드
- **CategoryFilter**: 카테고리 필터 버튼 (가로 스크롤)
- **AchievementsList**: 업적 카드 리스트
- **RecentCompletions**: 최근 완료 업적 (최대 5개)
- **UpcomingAchievements**: 곧 달성 가능 업적 (진행도 기준)

### 2. AchievementCard (업적 카드 컴포넌트)

**구조:**
```jsx
const AchievementCard = ({ item }) => {
  const achievement = item?.achievement || {};
  const isCompleted = item?.isCompleted ?? false;
  const progressPercentage = item?.progressPercentage ?? 0;
  const currentProgress = item?.currentProgress ?? 0;
  const targetValue = item?.targetValue ?? null;

  return (
    <div className={`bg-white rounded-[12px] p-3 sm:p-4 border ${
      isCompleted ? 'border-[#00C471] shadow-sm' : 'border-[#E7E7E7]'
    }`}>
      {/* 아이콘 */}
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
        isCompleted ? 'bg-[#E6F9F1]' : 'bg-[#F1F3F5]'
      }`}>
        <Award className={isCompleted ? 'text-[#00C471]' : 'text-[#B5B5B5]'} />
      </div>

      {/* 제목 & XP */}
      <h3 className={isCompleted ? 'text-[#111111]' : 'text-[#606060]'}>
        {title}
      </h3>
      <span className="text-[#4285F4]">+{xpReward} XP</span>

      {/* 설명 */}
      <p className="text-[#929292] line-clamp-2">{description}</p>

      {/* 메타 정보 */}
      <div className="flex items-center gap-2 text-[#929292]">
        <span className="bg-[#F8F9FA] rounded-full">{categoryLabel}</span>
        <span className={tierClass}>{tier}</span>
        {completedAt && <Clock />} {formatDate(completedAt)} 완료
      </div>

      {/* 진행도 바 */}
      <div className="w-full bg-[#F1F3F5] rounded-full h-2">
        <div className={`h-2 rounded-full ${
          isCompleted ? 'bg-[#00C471]' : 'bg-[#00C471]/60'
        }`} style={{ width: `${progress}%` }} />
      </div>
      <span>{currentProgress} / {targetValue}</span>
    </div>
  );
};
```

**UI 패턴:**
- **완료 상태**: 초록 테두리 + 그림자 + 완전한 진행도 바
- **진행 중**: 회색 테두리 + 부분 진행도 바 (60% 투명도)
- **아이콘**: Award (Lucide React) 또는 커스텀 배지 이미지
- **XP 보상**: 파란색 (+XX XP) 표시
- **반응형**: sm/md 브레이크포인트 대응

### 3. StatsOverview (통계 대시보드)

**구조:**
```jsx
const StatsOverview = ({ stats }) => {
  const completionRate = Math.round(stats?.completionRate ?? 0);
  const completedAchievements = stats?.completedAchievements ?? 0;
  const inProgressAchievements = stats?.inProgressAchievements ?? 0;
  const totalXpEarned = stats?.totalXpEarned ?? 0;
  const unclaimedRewards = stats?.unclaimedRewards ?? 0;

  return (
    <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7]">
      <h2>나의 진행 상황</h2>
      <div className="flex items-center">
        <Trophy className="text-[#00C471]" />
        <span>완료율 {completionRate}%</span>
      </div>

      {/* 3열 그리드 통계 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="text-center">
          <div className="text-[24px] font-bold text-[#00C471]">{completedAchievements}</div>
          <div className="text-[#929292]">완료한 배지</div>
        </div>
        <div className="text-center">
          <div className="text-[24px] font-bold text-[#111111]">{inProgressAchievements}</div>
          <div className="text-[#929292]">진행 중</div>
        </div>
        <div className="text-center">
          <div className="text-[24px] font-bold text-[#4285F4]">{totalXpEarned}</div>
          <div className="text-[#929292]">누적 XP</div>
        </div>
      </div>

      {/* 전체 진행률 바 */}
      <div className="w-full bg-[#F1F3F5] rounded-full h-3">
        <div className="bg-[#00C471] h-3 rounded-full"
             style={{ width: `${completionRate}%` }} />
      </div>

      {/* 미수령 보상 알림 */}
      {unclaimedRewards > 0 && (
        <p className="text-[#929292] flex items-center gap-1">
          <Gift className="text-[#FFA000]" />
          아직 수령하지 않은 보상 {unclaimedRewards}개가 있습니다.
        </p>
      )}
    </div>
  );
};
```

### 4. CategoryFilter (카테고리 필터)

**구조:**
```jsx
const CategoryFilter = ({ selected, onSelect }) => (
  <div className="bg-white px-4 sm:px-6 py-2 sm:py-3 border border-[#E7E7E7] rounded-[16px]">
    <div className="flex gap-2 overflow-x-auto pb-1">
      {['ALL', ...Object.values(ACHIEVEMENT_CATEGORIES)].map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[12px] sm:text-[13px] md:text-[14px] font-medium whitespace-nowrap transition-colors touch-manipulation ${
            selected === category
              ? 'bg-[#00C471] text-white'
              : 'bg-[#F1F3F5] text-[#606060] hover:bg-[#E7E7E7]'
          }`}
        >
          {CATEGORY_LABELS[category] || category}
        </button>
      ))}
    </div>
  </div>
);
```

**특징:**
- **가로 스크롤**: `overflow-x-auto`로 모바일 대응
- **선택 상태**: 초록 배경 + 흰색 텍스트
- **미선택 상태**: 회색 배경 + 호버 효과
- **터치 최적화**: `touch-manipulation` 클래스

### 5. AchievementBadges (배지 카드 컴포넌트)

**파일**: `src/components/AchievementBadges.jsx` (213 lines)

**구조:**
```jsx
const AchievementBadgeCard = ({ item }) => {
  const achievement = item?.achievement || item;
  const isCompleted = item?.isCompleted ?? false;
  const progressPercentage = item?.progressPercentage ?? 0;

  return (
    <div className="bg-white rounded-[10px] p-4 w-[250px] h-[250px] flex flex-col items-center justify-between flex-shrink-0 border border-[#E7E7E7]">
      {/* 배지 아이콘 */}
      <div className="w-[150px] h-[120px] rounded mb-4 overflow-hidden">
        {renderBadgeIcon(item)}
      </div>

      {/* 제목 & 설명 */}
      <div className="text-center">
        <p className="text-[18px] font-bold text-[#111111]">{title}</p>
        <p className="text-[13px] text-[#606060] line-clamp-2">{description}</p>
      </div>

      {/* 진행도 바 */}
      <div className="w-full mt-3">
        <div className="flex items-center justify-between text-[12px] text-[#929292]">
          <span>{isCompleted ? '완료됨' : '진행중'}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-[#F1F3F5] rounded-full h-2">
          <div className={`h-2 rounded-full ${
            isCompleted ? 'bg-[#00C471]' : 'bg-[#00C471]/60'
          }`} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};
```

**renderBadgeIcon 로직:**
```javascript
const renderBadgeIcon = (achievement) => {
  const iconUrl = achievement?.badgeIconUrl;
  const badgeColor = achievement?.badgeColor || '#E6F9F1';
  const title = achievement?.title || '성취 배지';

  // 커스텀 이미지가 있으면 사용
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={title}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    );
  }

  // 없으면 첫 글자 + 배경색으로 대체
  return (
    <div
      className="w-full h-full flex items-center justify-center text-[24px] font-bold text-[#00C471]"
      style={{ backgroundColor: `${badgeColor}33` }} // 20% 투명도
    >
      {title.slice(0, 1)}
    </div>
  );
};
```

### 6. RecentCompletions & UpcomingAchievements

**최근 완료 업적:**
```jsx
const RecentCompletions = ({ stats }) => {
  const items = stats?.recentCompletions ?? [];
  if (!items.length) return null;

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-[#00C471]" />
        <h3 className="text-[16px] font-bold text-[#111111]">최근 완료한 업적</h3>
      </div>
      <div className="space-y-3">
        {items.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between text-[14px] text-[#606060]">
            <span>{item.achievementTitle}</span>
            <span className="text-[12px] text-[#929292]">{formatDate(item.completedAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**곧 달성 가능 업적:**
```jsx
const UpcomingAchievements = ({ stats }) => {
  const items = stats?.nearCompletion ?? [];
  if (!items.length) return null;

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[#00C471]" />
        <h3 className="text-[16px] font-bold text-[#111111]">곧 달성 가능한 업적</h3>
      </div>
      <div className="space-y-3">
        {items.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-[14px] text-[#606060]">
            <span>{item.achievement?.title}</span>
            <span className="text-[12px] text-[#929292]">{Math.round(item.progressPercentage ?? 0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 진행도 추적 및 XP 보상

### 진행도 계산
```javascript
const progress = isCompleted ? 100 : Math.min(100, Math.max(0, progressPercentage));

// currentProgress와 targetValue 표시
<span>{currentProgress} / {targetValue}</span>
```

**예시:**
- 세션 10회 완료 업적: `currentProgress: 7, targetValue: 10` → 70%
- 연속 출석 7일: `currentProgress: 5, targetValue: 7` → 71%
- 레벨업 업적: `currentProgress: 1, targetValue: 1` → 100%

### XP 보상 시스템
```javascript
// achievementStore.js
completeAchievement: (achievementId) => set((state) => {
  const achievement = state.achievements.find((item) => item.id === achievementId);
  if (!achievement) return state;

  return {
    userAchievements: [
      ...state.userAchievements,
      {
        ...achievement,
        completedAt: new Date().toISOString()
      }
    ],
    totalPoints: state.totalPoints + (achievement.points || 0),
    recentAchievements: [
      {
        ...achievement,
        completedAt: new Date().toISOString()
      },
      ...state.recentAchievements
    ].slice(0, 10) // 최대 10개
  };
})
```

**XP 보상 규칙:**
- **BRONZE**: 10-50 XP
- **SILVER**: 50-100 XP
- **GOLD**: 100-250 XP
- **PLATINUM**: 250-500 XP
- **DIAMOND**: 500-1000 XP
- **LEGENDARY**: 1000+ XP

### 레벨 시스템
```javascript
// 레벨업 조건 (예시)
const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  10: 5000,
  20: 20000
};

// 레벨 계산
const calculateLevel = (totalXp) => {
  for (const [level, threshold] of Object.entries(LEVEL_THRESHOLDS).reverse()) {
    if (totalXp >= threshold) return parseInt(level, 10);
  }
  return 1;
};
```

---

## API 통합

### 주요 API 엔드포인트 (11개)

**1. 업적 목록 조회**
```javascript
GET /api/v1/achievements/my
Response: {
  data: [
    {
      id: 1,
      achievement: {
        id: 'FIRST_SESSION',
        title: '첫 세션 완료',
        description: '첫 번째 세션을 완료했습니다',
        category: 'SESSION',
        tier: 'BRONZE',
        xpReward: 10,
        badgeIconUrl: 'https://...',
        badgeColor: '#FFD700'
      },
      isCompleted: true,
      progressPercentage: 100,
      currentProgress: 1,
      targetValue: 1,
      completedAt: '2025-01-15T10:30:00Z'
    }
  ]
}
```

**2. 통계 조회**
```javascript
GET /api/v1/achievements/my/stats
Response: {
  totalAchievements: 50,
  completedAchievements: 12,
  inProgressAchievements: 15,
  totalXpEarned: 1250,
  unclaimedRewards: 2,
  completionRate: 24,
  achievementsByCategory: {
    STUDY: 5,
    SOCIAL: 3,
    MILESTONE: 2
  },
  achievementsByTier: {
    BRONZE: 8,
    SILVER: 3,
    GOLD: 1
  },
  recentCompletions: [
    {
      achievementId: 'FIRST_SESSION',
      achievementTitle: '첫 세션 완료',
      completedAt: '2025-01-15T10:30:00Z'
    }
  ],
  nearCompletion: [
    {
      id: 2,
      achievement: { title: '10회 세션 완료' },
      progressPercentage: 80
    }
  ]
}
```

**3. 진행도 업데이트**
```javascript
PATCH /api/v1/achievements/{achievementId}/progress
Body: {
  currentProgress: 5
}
```

**4. 보상 수령**
```javascript
POST /api/v1/achievements/{achievementId}/claim
Response: {
  xpEarned: 50,
  badgeUnlocked: true,
  newLevel: 3
}
```

**전체 API 목록:**
- `getMyAchievements()` - 내 업적 목록
- `getMyAchievementStats()` - 내 업적 통계
- `getAchievementById(id)` - 특정 업적 조회
- `updateAchievementProgress(id, progress)` - 진행도 업데이트
- `claimAchievementReward(id)` - 보상 수령
- `getAchievementsByCategory(category)` - 카테고리별 업적
- `getAchievementsByTier(tier)` - 티어별 업적
- `getRecentCompletions()` - 최근 완료 업적
- `getNearCompletion()` - 곧 달성 가능 업적
- `getLeaderboard()` - 리더보드
- `trackAchievementEvent(eventType, metadata)` - 이벤트 추적

---

## 개발 가이드

### 1. 새 업적 추가하기

**백엔드 (데이터베이스)**
```sql
INSERT INTO achievements (
  id, title, description, category, tier,
  target_value, xp_reward, badge_icon_url, badge_color
) VALUES (
  'TEN_SESSIONS',
  '10회 세션 완료',
  '총 10번의 세션을 완료했습니다',
  'SESSION',
  'SILVER',
  10,
  50,
  'https://cdn.example.com/badges/ten-sessions.png',
  '#C0C0C0'
);
```

**프론트엔드 (자동 감지)**
- `fetchAchievements()`를 호출하면 자동으로 새 업적 표시
- 카테고리 필터에 자동으로 포함됨

### 2. 커스텀 이벤트 추적

**클라이언트 측에서 이벤트 발송:**
```javascript
import { trackAchievementEvent } from '../api/achievement';

// 예: 사용자가 프로필 사진 업로드 시
const handleProfileImageUpload = async (imageFile) => {
  await uploadProfileImage(imageFile);

  // 업적 이벤트 추적
  await trackAchievementEvent('PROFILE_COMPLETED', {
    imageUploaded: true,
    timestamp: new Date().toISOString()
  });

  // 업적 목록 새로고침 (선택 사항)
  await achievementStore.getState().fetchAchievements({ force: true });
};
```

### 3. 안전한 데이터 처리 패턴

**⚠️ 중요: React 19 무한 루프 방지**

```javascript
// ❌ BAD: useMemo with unstable dependencies
const filteredAchievements = useMemo(() => {
  return achievements.filter((item) => item.category === selectedCategory);
}, [achievements, selectedCategory]); // achievements 참조 변경 시 무한 루프

// ✅ GOOD: Direct calculation with stable array
const safeAchievements = Array.isArray(achievements) ? achievements : [];
const filteredAchievements = selectedCategory === 'ALL'
  ? safeAchievements
  : safeAchievements.filter((item) => item.achievement?.category === selectedCategory);
```

**안전한 숫자 추출:**
```javascript
const safeNumber = (value, defaultValue = 0) => {
  if (typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)) {
    return value;
  }
  return defaultValue;
};

const completedCount = safeNumber(stats?.completedAchievements, 0);
const totalXp = safeNumber(stats?.totalXpEarned, 0);
```

**안전한 문자열 추출:**
```javascript
import { toDisplayText } from '../utils/text';

const title = toDisplayText(achievement?.title, '성취 배지');
const description = toDisplayText(achievement?.description, '') || '';
```

### 4. 성능 최적화

**캐시 활용:**
```javascript
// 5분 이내 재요청 시 캐시 사용
const { achievements, stats, loading, refresh } = useAchievementOverview();

// 강제 새로고침 (캐시 무시)
await refresh({ force: true });
```

**이미지 최적화:**
```javascript
<img
  src={badgeIconUrl}
  alt={title}
  className="w-full h-full object-contain"
  loading="lazy" // 지연 로딩
/>
```

**배열 참조 안정성:**
```javascript
const EMPTY_ARRAY = []; // 상수로 정의

const achievements = useMemo(() => {
  return Array.isArray(rawAchievements) ? rawAchievements : EMPTY_ARRAY;
}, [rawAchievements]);
```

### 5. 에러 처리

**API 에러:**
```javascript
try {
  const response = await getMyAchievements();
  // 성공 처리
} catch (error) {
  console.error('Failed to load achievements:', error);
  // UI에 에러 메시지 표시
  setError('업적을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
}
```

**통계 API 실패 처리:**
```javascript
const [achievementsResponse, statsResponse] = await Promise.all([
  getMyAchievements().catch((error) => {
    console.error('Failed to load achievements:', error);
    throw error; // 업적 API 실패는 전체 실패
  }),
  getMyAchievementStats().catch((error) => {
    console.error('Failed to load achievement stats:', error);
    return null; // 통계 API 실패는 무시
  })
]);
```

### 6. 접근성 (Accessibility)

**키보드 네비게이션:**
```jsx
<button
  onClick={() => onSelect(category)}
  className="touch-manipulation" // 터치 최적화
  aria-pressed={selected === category} // 선택 상태
>
  {CATEGORY_LABELS[category]}
</button>
```

**스크린 리더 지원:**
```jsx
<img
  src={badgeIconUrl}
  alt={`${title} 배지`} // 명확한 대체 텍스트
  loading="lazy"
/>

<div role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
  <div style={{ width: `${progress}%` }} />
</div>
```

### 7. 디버깅 팁

**Zustand Devtools 활용:**
```javascript
import { devtools } from 'zustand/middleware';

const useAchievementStore = create(
  devtools(
    persist(
      (set, get) => ({ /* ... */ }),
      { name: 'achievement-storage' }
    ),
    { name: 'AchievementStore' } // DevTools 이름
  )
);
```

**콘솔 로깅:**
```javascript
console.log('[useAchievementOverview] Fetching achievements...', {
  force,
  lastFetchedAt,
  cacheAge: Date.now() - lastFetchedAt
});
```

**React DevTools Profiler:**
- `AchievementsPage` 렌더링 횟수 확인
- `useMemo` 의존성 문제 디버깅
- 불필요한 리렌더링 감지

---

## 요약

### 핵심 특징
✅ **9가지 카테고리** (STUDY, SOCIAL, MILESTONE 등)
✅ **6단계 티어** (BRONZE ~ LEGENDARY)
✅ **자동 추적** (8가지 이벤트 타입)
✅ **XP 보상 시스템** (레벨업 연동)
✅ **실시간 진행도** (진행 바 + 현황 표시)
✅ **5분 캐싱** (Zustand persist)
✅ **반응형 UI** (모바일 최적화)
✅ **React 19 안전 패턴** (무한 루프 방지)

### 주요 파일
- **AchievementsPage.jsx** (355 lines) - 메인 페이지
- **AchievementBadges.jsx** (213 lines) - 배지 컴포넌트
- **useAchievementOverview.js** (79 lines) - 커스텀 훅
- **achievementStore.js** (263 lines) - Zustand 스토어
- **achievement.js** - 11개 API 함수

### 개발 원칙
1. **안전한 데이터 처리**: `safeNumber()`, `toDisplayText()` 활용
2. **캐시 최적화**: 5분 TTL + force refresh 옵션
3. **무한 루프 방지**: useMemo 제거, 직접 계산 사용
4. **접근성**: ARIA 속성 + 키보드 네비게이션
5. **성능**: lazy loading + Promise.all 병렬 처리
