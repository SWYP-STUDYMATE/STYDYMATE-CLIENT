# Analytics Dashboard (학습 통계 대시보드)

## 목차
1. [시스템 개요](#시스템-개요)
2. [아키텍처](#아키텍처)
3. [주요 컴포넌트](#주요-컴포넌트)
4. [차트 라이브러리 (Recharts)](#차트-라이브러리-recharts)
5. [데이터 변환 패턴](#데이터-변환-패턴)
6. [개발 가이드](#개발-가이드)

---

## 시스템 개요

### 주요 기능
- **📊 학습 통계**: 세션 수, 학습 시간, 주간 목표 진행률
- **📈 매칭 분석**: 성공률, 대기 시간, 언어별 통계
- **🎯 레벨 테스트**: 진행도 추적, 월별 빈도, 언어별 분포
- **🔄 실시간 메트릭**: WebSocket을 통한 서버 성능 모니터링 (Admin용)

### 기술 스택
- **차트 라이브러리**: Recharts 2.x (LineChart, BarChart, PieChart, AreaChart)
- **API 통신**: Axios (12개 Analytics 엔드포인트)
- **아이콘**: Lucide React (BarChart3, TrendingUp, Users, Globe, Clock, etc.)
- **날짜 처리**: JavaScript Date API + 다국어 포맷
- **WebSocket**: 실시간 메트릭 스트리밍 (AnalyticsDashboard)

### 라우팅
```
/analytics → AnalyticsPage (학습 통계 대시보드)
```

---

## 아키텍처

### 시스템 흐름도
```
사용자 진입 (/analytics)
    ↓
AnalyticsPage 마운트
    ↓
Promise.all([
  getStudyStats(timeRange),
  getSessionActivity(timeRange)
])
    ↓
transformApiDataToAnalyticsData()
    ↓
State 업데이트 (analyticsData)
    ↓
UI 렌더링:
  - Overview Cards (4개)
  - Weekly Goal Progress
  - WeeklyActivityChart
  - Session Activity (LineChart)
  - Session Types (PieChart)
  - LevelTestHistoryChart
  - MatchingStatsChart
  - Language Progress
  - Top Partners
```

### 데이터 흐름
1. **초기 로드**: `useEffect(() => { loadAnalyticsData(); }, [timeRange])`
2. **Time Range 변경**: 드롭다운 → API 재호출
3. **새로고침**: RefreshCw 버튼 → `loadAnalyticsData()`
4. **차트 뷰 전환**: `selectedView` state → 차트 조건부 렌더링

### 파일 구조
```
src/
├── pages/
│   └── Analytics/
│       ├── AnalyticsPage.jsx           # 메인 분석 페이지
│       └── AnalyticsDashboard.jsx      # 서버 메트릭 대시보드 (Admin)
└── components/
    ├── analytics/
    │   ├── MatchingStatsChart.jsx      # 매칭 통계 차트
    │   └── LevelTestHistoryChart.jsx   # 레벨 테스트 차트
    └── profile/
        └── WeeklyActivityChart.jsx     # 주간 활동 차트
```

---

## 주요 컴포넌트

### 1. AnalyticsPage (메인 대시보드)

**파일**: `src/pages/Analytics/AnalyticsPage.jsx` (486 lines)

**State:**
```javascript
const [loading, setLoading] = useState(true);
const [timeRange, setTimeRange] = useState('week');     // day | week | month | year
const [analyticsData, setAnalyticsData] = useState(null);
const [error, setError] = useState(null);
```

**데이터 구조:**
```javascript
const analyticsData = {
  overview: {
    totalSessions: 24,
    totalMinutes: 720,
    weeklyGrowth: 15,
    currentStreak: 5,
    averageSessionTime: 30,
    partnersCount: 8
  },
  sessionStats: [
    { date: '2025-01-10', sessions: 3 },
    { date: '2025-01-11', sessions: 5 }
  ],
  languageProgress: [
    {
      language: 'English',
      level: 'Intermediate',
      progress: 65,
      sessions: 12
    }
  ],
  sessionTypes: [
    { name: '1:1 회화', value: 60, color: '#00C471' },
    { name: '그룹 세션', value: 30, color: '#4285F4' },
    { name: '랜덤 매칭', value: 10, color: '#FFB800' }
  ],
  weeklyGoals: {
    current: 4,
    target: 7,
    streak: 2
  },
  topPartners: [
    {
      name: 'John Doe',
      flag: '🇺🇸',
      sessions: 8,
      rating: 4.8
    }
  ]
};
```

**주요 섹션:**

#### Overview Cards (4개)
```jsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  {/* 총 세션 */}
  <div className="bg-white rounded-[16px] p-3 sm:p-4 border border-[#E7E7E7]">
    <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C471]" />
    <div className="text-[20px] font-bold">{totalSessions}</div>
    <TrendingUp className="text-[#00C471]" />
    <span>+{weeklyGrowth}%</span>
  </div>

  {/* 총 학습시간 */}
  <div className="...">
    <Clock className="text-[#4285F4]" />
    <div>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
    <span>평균 {averageSessionTime}분/세션</span>
  </div>

  {/* 연속 학습 */}
  <div className="...">
    <Target className="text-[#FF6B6B]" />
    <div>{currentStreak}</div>
    <span>일 연속</span>
  </div>

  {/* 파트너 */}
  <div className="...">
    <Users className="text-[#9C27B0]" />
    <div>{partnersCount}</div>
    <span>활성 파트너</span>
  </div>
</div>
```

#### Weekly Goal (주간 목표)
```jsx
<div className="bg-white rounded-[20px] p-6">
  <h3>주간 목표</h3>
  <button>목표 수정</button>

  {/* Progress Bar */}
  <div className="flex justify-between">
    <span>{current}/{target} 세션 완료</span>
    <span>{Math.round((current / target) * 100)}%</span>
  </div>
  <div className="w-full bg-[#E7E7E7] rounded-full h-3">
    <div
      className="bg-[#00C471] h-3 rounded-full"
      style={{ width: `${Math.min(100, (current / target) * 100)}%` }}
    />
  </div>

  <div className="flex items-center">
    <div className="w-2 h-2 bg-[#00C471] rounded-full"></div>
    <span>{streak}일 연속 목표 달성</span>
  </div>
</div>
```

#### Session Activity Chart (LineChart)
```jsx
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={analyticsData.sessionStats}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
    <XAxis
      dataKey="date"
      tickFormatter={(value) =>
        new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      }
    />
    <YAxis />
    <Tooltip />
    <Line
      type="monotone"
      dataKey="sessions"
      stroke="#00C471"
      strokeWidth={3}
      dot={{ fill: '#00C471', r: 4 }}
    />
  </LineChart>
</ResponsiveContainer>
```

#### Session Types (PieChart)
```jsx
<ResponsiveContainer width="100%" height={256}>
  <PieChart>
    <Pie
      data={sessionTypes}
      cx="50%"
      cy="50%"
      innerRadius={60}
      outerRadius={100}
      paddingAngle={5}
      dataKey="value"
    >
      {sessionTypes.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

### 2. MatchingStatsChart (매칭 통계)

**파일**: `src/components/analytics/MatchingStatsChart.jsx` (712 lines)

**주요 기능:**
- 성공률 추이 (AreaChart)
- 매칭 빈도 (BarChart)
- 타입별 분포 (PieChart)
- 언어별 성공률 (Progress Bars)

**State:**
```javascript
const [matchingData, setMatchingData] = useState(null);
const [selectedView, setSelectedView] = useState('success-rate');
// 'success-rate' | 'frequency' | 'type' | 'language'
```

**데이터 변환 함수:**
```javascript
// 일자별 통계 처리
const processMatchingEvents = (events) => {
  const dailyMap = new Map();
  events.forEach((event) => {
    const dayKey = date.toISOString().split('T')[0];
    const status = resolveStatus(event); // SUCCESS | FAILED | REQUEST

    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, { date: dayKey, requests: 0, successful: 0, failed: 0 });
    }

    const dayEntry = dailyMap.get(dayKey);
    if (status === 'SUCCESS') {
      dayEntry.successful += 1;
      dayEntry.requests += 1;
    }
  });

  return Array.from(dailyMap.values()).map((day) => ({
    ...day,
    successRate: day.requests > 0
      ? ((day.successful / day.requests) * 100).toFixed(1)
      : 0
  }));
};
```

**성공률 AreaChart:**
```jsx
<ResponsiveContainer width="100%" height={320}>
  <AreaChart data={matchingData.dailyStats}>
    <defs>
      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#00C471" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#00C471" stopOpacity={0.1}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--black-50)" />
    <XAxis dataKey="day" />
    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
    <Tooltip formatter={(value) => [`${value}%`, '성공률']} />
    <Area
      type="monotone"
      dataKey="successRate"
      stroke="#00C471"
      fill="url(#successGradient)"
    />
  </AreaChart>
</ResponsiveContainer>
```

**통계 요약 카드:**
```jsx
<div className="grid grid-cols-4 gap-4">
  {/* 전체 성공률 */}
  <div className="bg-[var(--green-50)] rounded-[12px] p-4">
    <Target className="w-5 h-5 text-white" />
    <div className="text-[20px] font-bold">{overallSuccessRate}%</div>
    <div className="text-[12px]">전체 성공률</div>
  </div>

  {/* 총 매칭 시도 */}
  <div className="bg-[#F0F8FF] rounded-[12px] p-4">
    <Users />
    <div>{totalRequests}</div>
    <div>총 매칭 시도</div>
  </div>

  {/* 평균 대기시간 */}
  <div className="bg-[#FFF8E1] rounded-[12px] p-4">
    <Clock />
    <div>{Math.floor(avgWaitTime / 60)}:{(avgWaitTime % 60).toString().padStart(2, '0')}</div>
    <div>평균 대기시간</div>
  </div>

  {/* 평균 세션시간 */}
  <div className="bg-[#FFE6F0] rounded-[12px] p-4">
    <Heart />
    <div>{avgSessionDuration}분</div>
    <div>평균 세션시간</div>
  </div>
</div>
```

### 3. LevelTestHistoryChart (레벨 테스트 이력)

**파일**: `src/components/analytics/LevelTestHistoryChart.jsx` (481 lines)

**주요 기능:**
- 레벨 진행도 (LineChart)
- 월별 빈도 (BarChart)
- 언어별 분포 (PieChart)

**레벨 시스템:**
```javascript
const LEVEL_ORDER = [
  'Beginner',            // 0
  'Elementary',          // 1
  'Intermediate',        // 2
  'Upper-Intermediate',  // 3
  'Advanced',            // 4
  'Proficient'           // 5
];
```

**레벨 진행도 차트:**
```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={historyData.levelProgression}>
    <XAxis dataKey="month" />
    <YAxis
      domain={[0, 4]}
      tickFormatter={(value) =>
        ['Beginner', 'Elementary', 'Intermediate', 'Upper-Int.', 'Advanced'][value] || value
      }
    />
    <Tooltip
      formatter={(value, _name, props) => [
        ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced'][Math.floor(value)],
        `${props.payload.language} 레벨`
      ]}
    />
    <Line
      type="monotone"
      dataKey="levelIndex"
      stroke="#00C471"
      strokeWidth={3}
    />
  </LineChart>
</ResponsiveContainer>
```

### 4. AnalyticsDashboard (Admin 전용 - 서버 메트릭)

**파일**: `src/pages/Analytics/AnalyticsDashboard.jsx` (341 lines)

**⚠️ 주의: Admin/개발자 전용**
일반 사용자용이 아닌 서버 성능 모니터링 대시보드입니다.

**WebSocket 실시간 메트릭:**
```javascript
const connectToMetricsStream = () => {
  const ws = new WebSocket(`wss://${window.location.host}/api/v1/analytics/stream`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'metrics_update') {
      setRealTimeMetrics(data.data);
    }
  };

  window.metricsWs = ws;
};
```

**모니터링 지표:**
- Total Requests
- Avg Response Time
- Error Rate
- P95 Response Time
- Active Connections
- CPU Usage
- Memory Usage

---

## 차트 라이브러리 (Recharts)

### 설치
```bash
npm install recharts
```

### 주요 컴포넌트

**1. LineChart (시계열 데이터)**
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="sessions" stroke="#00C471" strokeWidth={3} />
</LineChart>
```

**2. BarChart (비교 데이터)**
```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="tests" fill="#4285F4" radius={[4, 4, 0, 0]} />
</BarChart>
```

**3. PieChart (비율 데이터)**
```jsx
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

<PieChart>
  <Pie
    data={data}
    cx="50%"
    cy="50%"
    outerRadius={100}
    paddingAngle={5}
    dataKey="value"
  >
    {data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.color} />
    ))}
  </Pie>
  <Tooltip />
</PieChart>
```

**4. AreaChart (트렌드 데이터)**
```jsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<AreaChart data={data}>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#00C471" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#00C471" stopOpacity={0.1}/>
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="day" />
  <YAxis />
  <Tooltip />
  <Area type="monotone" dataKey="successRate" stroke="#00C471" fill="url(#gradient)" />
</AreaChart>
```

**5. ResponsiveContainer (반응형)**
```jsx
import { ResponsiveContainer } from 'recharts';

<div className="h-64">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      {/* ... */}
    </LineChart>
  </ResponsiveContainer>
</div>
```

---

## 데이터 변환 패턴

### 안전한 데이터 추출
```javascript
const safeNumber = (value, defaultValue = 0) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  return defaultValue;
};

const totalSessions = safeNumber(metrics.totalSessions, 0);
const weeklyGrowth = safeNumber(metrics.weeklyGrowth, 0);
```

### API 응답 변환
```javascript
const transformApiDataToAnalyticsData = (studyStats, sessionActivity) => {
  const metrics = studyStats?.metrics || {};

  return {
    overview: {
      totalSessions: safeNumber(metrics.totalSessions, 0),
      totalMinutes: safeNumber(metrics.totalMinutes, 0),
      // ...
    },
    sessionStats: sessionActivity?.metrics?.dailyStats || [],
    languageProgress: Array.isArray(studyStats?.metrics?.languageProgress)
      ? studyStats.metrics.languageProgress
      : [],
    // ...
  };
};
```

### 날짜 파싱 헬퍼
```javascript
const parseEventDate = (event) => {
  const candidates = [
    event?.createdDate,
    event?.createdAt,
    event?.timestamp,
    event?.properties?.createdAt
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};
```

### 날짜 포맷팅
```javascript
// Recharts XAxis tickFormatter
<XAxis
  dataKey="date"
  tickFormatter={(value) =>
    new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
/>

// Tooltip labelFormatter
<Tooltip
  labelFormatter={(label) => `테스트 날짜: ${label}`}
  formatter={(value) => [`${value}%`, '성공률']}
/>
```

---

## 개발 가이드

### 1. 새 차트 추가하기

**Step 1: 데이터 구조 정의**
```javascript
const chartData = [
  { month: '1월', value: 30 },
  { month: '2월', value: 45 },
  { month: '3월', value: 60 }
];
```

**Step 2: Recharts 컴포넌트 선택**
- 시계열: LineChart, AreaChart
- 비교: BarChart
- 비율: PieChart
- 상관관계: ScatterChart

**Step 3: 반응형 래핑**
```jsx
<div className="h-64">
  <ResponsiveContainer width="100%" height="100%">
    <YourChart data={chartData}>
      {/* ... */}
    </YourChart>
  </ResponsiveContainer>
</div>
```

### 2. Time Range 필터링

```javascript
const filterDataByTimeRange = (data, timeRange) => {
  const now = new Date();
  const start = new Date(now);

  switch (timeRange) {
    case 'day':
      start.setDate(now.getDate() - 1);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return data;
  }

  return data.filter((item) => {
    const date = new Date(item.date);
    return date >= start;
  });
};
```

### 3. 에러 처리 패턴

```jsx
if (loading) {
  return (
    <div className="h-96 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin"></div>
      <p>통계 로딩 중...</p>
    </div>
  );
}

if (error) {
  return (
    <div className="text-center">
      <p>{error}</p>
      <button onClick={retry}>다시 시도</button>
    </div>
  );
}

if (!data?.length) {
  return (
    <div className="text-center">
      <p>아직 데이터가 없습니다.</p>
    </div>
  );
}
```

### 4. 성능 최적화

**Promise.all 병렬 처리:**
```javascript
const loadAnalyticsData = async () => {
  const [studyStatsResponse, sessionActivityResponse] = await Promise.all([
    getStudyStats(timeRange),
    getSessionActivity(timeRange)
  ]);

  const data = transformApiDataToAnalyticsData(studyStatsResponse, sessionActivityResponse);
  setAnalyticsData(data);
};
```

**데이터 변환 최적화:**
```javascript
// ❌ Bad: 매번 filter + map
const filteredData = data.filter(...).map(...);

// ✅ Good: 한 번에 처리
const processedData = data.reduce((acc, item) => {
  if (condition) {
    acc.push({ ...item, transformed: true });
  }
  return acc;
}, []);
```

### 5. 접근성 (Accessibility)

**ARIA 속성:**
```jsx
<select
  value={timeRange}
  onChange={(e) => setTimeRange(e.target.value)}
  aria-label="시간 범위 선택"
>
  <option value="day">오늘</option>
  <option value="week">이번 주</option>
</select>
```

**Tooltip 한국어:**
```jsx
<Tooltip
  contentStyle={{
    backgroundColor: 'white',
    border: '1px solid #E7E7E7',
    borderRadius: '8px'
  }}
  formatter={(value) => [`${value}%`, '성공률']}
  labelFormatter={(label) => `날짜: ${label}`}
/>
```

---

## 요약

### 핵심 특징
✅ **3가지 주요 차트**: 세션 활동, 매칭 통계, 레벨 테스트
✅ **12개 Analytics API**: getStudyStats, getSessionActivity, getMatchingStats, etc.
✅ **Recharts 라이브러리**: LineChart, BarChart, PieChart, AreaChart
✅ **반응형 디자인**: ResponsiveContainer + Tailwind breakpoints
✅ **Time Range 필터**: day | week | month | year
✅ **실시간 메트릭**: WebSocket 스트리밍 (Admin 대시보드)
✅ **안전한 데이터 처리**: safeNumber(), parseEventDate(), 에러 핸들링

### 주요 파일
- **AnalyticsPage.jsx** (486 lines) - 메인 대시보드
- **MatchingStatsChart.jsx** (712 lines) - 매칭 통계
- **LevelTestHistoryChart.jsx** (481 lines) - 레벨 테스트
- **AnalyticsDashboard.jsx** (341 lines) - 서버 메트릭 (Admin)

### 개발 원칙
1. **안전한 데이터 처리**: safeNumber, 날짜 파싱 헬퍼
2. **병렬 API 호출**: Promise.all
3. **에러 핸들링**: loading, error, empty states
4. **반응형**: ResponsiveContainer + Tailwind
5. **접근성**: ARIA 속성 + 한국어 레이블
