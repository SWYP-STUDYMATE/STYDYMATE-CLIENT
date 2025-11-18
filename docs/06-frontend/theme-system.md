# Theme System (테마 시스템)

## 목차
1. [시스템 개요](#시스템-개요)
2. [현재 상태](#현재-상태)
3. [아키텍처](#아키텍처)
4. [ThemeStore (Zustand)](#themestore-zustand)
5. [ThemeToggle 컴포넌트](#themetoggle-컴포넌트)
6. [디자인 시스템 색상](#디자인-시스템-색상)
7. [Dark Mode 활성화 가이드](#dark-mode-활성화-가이드)
8. [모바일 최적화](#모바일-최적화)

---

## 시스템 개요

### ⚠️ 현재 상태: 준비 단계
Theme 시스템은 **구현은 완료**되었으나 **현재 비활성화** 상태입니다.
- ✅ themeStore.js 구현 완료
- ✅ ThemeToggle 컴포넌트 구현 완료
- ✅ 시스템 테마 감지 기능 구현
- ⏸️ UI에 ThemeToggle 미배치
- ⏸️ Dark mode CSS 변수 미정의

### 기술 스택
- **상태 관리**: Zustand (persist middleware, localStorage 저장)
- **스타일링**: Tailwind CSS 4.x (Vite 플러그인)
- **테마 전환**: `document.documentElement.classList` (Tailwind dark: 모드)
- **시스템 테마 감지**: `window.matchMedia('(prefers-color-scheme: dark)')`
- **아이콘**: Lucide React (Sun, Moon)

### 지원 예정 테마
1. **Light Mode** (현재 활성화): 밝은 배경, 어두운 텍스트
2. **Dark Mode** (준비 완료): 어두운 배경, 밝은 텍스트
3. **System Theme** (준비 완료): OS 설정 따라가기

---

## 현재 상태

### 라이트 모드만 활성화
**현재 프로젝트는 라이트 모드만 사용 중**입니다.

**구현된 것:**
- ✅ Zustand themeStore (persist)
- ✅ ThemeToggle 컴포넌트 (3가지 사이즈)
- ✅ 시스템 테마 자동 감지
- ✅ localStorage 저장/복원
- ✅ DOM 클래스 업데이트 (`dark` 클래스 추가/제거)

**미구현:**
- ❌ ThemeToggle 배치 (MainHeader 또는 SettingsMain)
- ❌ Dark mode CSS 변수 (`.dark` selector)
- ❌ Dark mode 색상 팔레트
- ❌ Dark mode 컴포넌트 스타일

### 활성화 시 예상 위치
```jsx
// MainHeader.jsx (예상)
import ThemeToggle from './ThemeToggle';

export default function MainHeader() {
  return (
    <div className="flex items-center">
      {/* 로고 */}
      {/* 알림 */}
      <ThemeToggle size="md" /> {/* 추가 필요 */}
    </div>
  );
}
```

---

## 아키텍처

### 시스템 흐름도
```
사용자 클릭 (ThemeToggle)
    ↓
themeStore.toggleTheme()
    ↓
Zustand State 업데이트 (isDarkMode: true/false)
    ↓
document.documentElement.classList.add/remove('dark')
    ↓
Tailwind CSS dark: 클래스 적용
    ↓
UI 리렌더링 (dark 모드 스타일)
    ↓
localStorage 자동 저장 (persist middleware)
```

### 시스템 테마 감지
```
사용자가 OS 다크 모드 변경
    ↓
window.matchMedia('(prefers-color-scheme: dark)') 이벤트
    ↓
themeStore.systemTheme 업데이트
    ↓
선택: useSystemTheme() 호출 시 자동 적용
```

### 파일 구조
```
src/
├── components/
│   └── ThemeToggle.jsx              # 테마 토글 버튼
├── store/
│   └── themeStore.js                # Zustand 테마 스토어
└── styles/
    ├── tailwind.css                 # Tailwind import
    └── index.css                    # CSS 변수 (현재 light만)
```

---

## ThemeStore (Zustand)

### 파일: `src/store/themeStore.js` (96 lines)

**구조:**
```javascript
const useThemeStore = create(
  persist(
    (set, get) => ({
      // 상태
      isDarkMode: false,                    // 다크 모드 여부
      systemTheme: false,                   // 시스템 테마 (dark 여부)

      // 액션
      toggleTheme: () => { /* ... */ },     // 테마 토글
      setTheme: (isDark) => { /* ... */ },  // 테마 직접 설정
      useSystemTheme: () => { /* ... */ },  // 시스템 테마 사용
      initializeTheme: () => { /* ... */ }  // 초기화 (hydration)
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) state.initializeTheme();
      }
    }
  )
);
```

### 주요 메서드

#### 1. toggleTheme()
```javascript
toggleTheme: () => {
  const newTheme = !get().isDarkMode;
  set({ isDarkMode: newTheme });

  // DOM 클래스 업데이트
  if (typeof document !== 'undefined') {
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
```

**동작:**
- 현재 테마 반전 (light ↔ dark)
- `<html>` 요소에 `dark` 클래스 추가/제거
- localStorage 자동 저장

#### 2. setTheme(isDark)
```javascript
setTheme: (isDark) => {
  set({ isDarkMode: isDark });

  // DOM 클래스 업데이트
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
```

**사용 예:**
```javascript
import useThemeStore from '../store/themeStore';

const SettingsMain = () => {
  const { setTheme } = useThemeStore();

  const handleThemeChange = (theme) => {
    setTheme(theme === 'dark');
  };
};
```

#### 3. useSystemTheme()
```javascript
useSystemTheme: () => {
  const systemTheme = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;

  set({
    isDarkMode: systemTheme,
    systemTheme
  });

  // DOM 클래스 업데이트
  if (typeof document !== 'undefined') {
    if (systemTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
```

**동작:**
- OS 다크 모드 설정 감지
- 앱 테마를 시스템 테마와 동기화

#### 4. initializeTheme()
```javascript
initializeTheme: () => {
  const stored = get().isDarkMode;
  if (typeof document !== 'undefined') {
    if (stored) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // 시스템 테마 변경 감지
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      set({ systemTheme: e.matches });
    });
  }
}
```

**동작:**
- 페이지 로드 시 localStorage에서 복원된 테마 적용
- 시스템 테마 변경 이벤트 리스너 등록
- `onRehydrateStorage` 콜백에서 자동 호출

### Persist 설정
```javascript
{
  name: 'theme-storage',
  onRehydrateStorage: () => (state) => {
    // 스토어 복원 후 테마 초기화
    if (state) {
      state.initializeTheme();
    }
  }
}
```

**저장되는 데이터:**
```javascript
// localStorage['theme-storage']
{
  "state": {
    "isDarkMode": false,
    "systemTheme": false
  },
  "version": 0
}
```

---

## ThemeToggle 컴포넌트

### 파일: `src/components/ThemeToggle.jsx` (71 lines)

**Props:**
```typescript
interface ThemeToggleProps {
  className?: string;      // 추가 Tailwind 클래스
  size?: 'sm' | 'md' | 'lg'; // 사이즈 (기본: md)
}
```

### 컴포넌트 구조
```jsx
const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center ${getSizeClasses()}
        rounded-full border-2 border-gray-200 dark:border-gray-700
        bg-gray-200 dark:bg-gray-700
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2
        ${className}`}
      role="switch"
      aria-checked={isDarkMode}
      aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <span className="sr-only">테마 변경</span>

      {/* 슬라이더 */}
      <span className={`inline-block ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
        rounded-full bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-200 ease-in-out
        ${isDarkMode
          ? size === 'sm' ? 'translate-x-4' : size === 'lg' ? 'translate-x-8' : 'translate-x-5'
          : 'translate-x-0'
        }
        flex items-center justify-center`}>
        {isDarkMode ? (
          <Moon className={`${getIconSize()} text-gray-600`} />
        ) : (
          <Sun className={`${getIconSize()} text-yellow-500`} />
        )}
      </span>
    </button>
  );
};
```

### 사이즈 시스템
```javascript
const getSizeClasses = () => {
  switch (size) {
    case 'sm':  return 'w-10 h-6';  // 작은 사이즈
    case 'lg':  return 'w-16 h-8';  // 큰 사이즈
    case 'md':  return 'w-12 h-7';  // 기본 사이즈
    default:    return 'w-12 h-7';
  }
};

const getIconSize = () => {
  switch (size) {
    case 'sm':  return 'w-3 h-3';
    case 'lg':  return 'w-5 h-5';
    case 'md':  return 'w-4 h-4';
    default:    return 'w-4 h-4';
  }
};
```

**사이즈별 크기:**
| Size | Container | Icon | Translate |
|------|-----------|------|-----------|
| sm   | 40px × 24px | 12px | 16px |
| md   | 48px × 28px | 16px | 20px |
| lg   | 64px × 32px | 20px | 32px |

### 접근성 (Accessibility)
```jsx
<button
  role="switch"                                    // ARIA role
  aria-checked={isDarkMode}                        // 현재 상태
  aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}  // 레이블
  className="focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2"  // 포커스 링
>
  <span className="sr-only">테마 변경</span>       {/* 스크린 리더 전용 */}
</button>
```

### 사용 예시
```jsx
import ThemeToggle from '../components/ThemeToggle';

// 기본 사이즈
<ThemeToggle />

// 작은 사이즈 (모바일)
<ThemeToggle size="sm" />

// 큰 사이즈 (설정 페이지)
<ThemeToggle size="lg" className="ml-4" />
```

---

## 디자인 시스템 색상

### 현재 라이트 모드 색상 (`:root`)

**파일**: `src/styles/index.css`

```css
:root {
  /* Green (Primary Brand) */
  --green-50: #E6F9F1;
  --green-100: #B0EDD3;
  --green-200: #8AE4BE;
  --green-300: #54D7A0;
  --green-400: #33D08D;
  --green-500: #00C471;  /* 메인 브랜드 컬러 */
  --green-600: #00B267;
  --green-700: #008B50;
  --green-800: #006C3E;
  --green-900: #00522F;

  /* Black / Gray */
  --black-50: #E7E7E7;   /* 테두리 */
  --black-100: #B5B5B5;
  --black-200: #929292;  /* 보조 텍스트 */
  --black-300: #606060;
  --black-400: #414141;
  --black-500: #111111;  /* 메인 텍스트 */
  --black-600: #0F0F0F;
  --black-700: #0C0C0C;
  --black-800: #090909;
  --black-900: #070707;

  /* Others */
  --white: #FFFFFF;      /* 카드 배경 */
  --bg-main: #FAFAFA;    /* 페이지 배경 */
  --red: #EA4335;        /* 에러/경고 */
  --blue: #4285F4;       /* 정보/링크 */
  --warning-yellow: #FFA500;
  --neutral-100: #F1F3F5;
  --neutral-200: #F8F9FA;
  --indigo: #4338CA;
  --indigo-700: #3730A3;
  --indigo-800: #312E81;
}
```

### Dark Mode 색상 (미정의, 예시)

**추가 필요:**
```css
.dark {
  /* Green (Primary Brand - 동일 유지) */
  --green-500: #00C471;

  /* Black / Gray (반전) */
  --black-50: #1A1A1A;   /* 테두리 (어두움) */
  --black-100: #2A2A2A;
  --black-200: #4A4A4A;  /* 보조 텍스트 */
  --black-300: #9A9A9A;
  --black-400: #CACACA;
  --black-500: #EFEFEF;  /* 메인 텍스트 (밝음) */

  /* Others */
  --white: #121212;      /* 카드 배경 (어두움) */
  --bg-main: #000000;    /* 페이지 배경 (검정) */
  --red: #FF6B6B;        /* 에러 (밝게) */
  --blue: #5B9FFF;       /* 정보 (밝게) */
}
```

### Tailwind dark: 클래스 활용
```jsx
<div className="bg-white dark:bg-gray-900">      {/* 배경 */}
<p className="text-[#111111] dark:text-white">    {/* 텍스트 */}
<div className="border-[#E7E7E7] dark:border-gray-700">  {/* 테두리 */}
```

---

## Dark Mode 활성화 가이드

### 1단계: CSS 변수 정의

**`src/styles/index.css`에 추가:**
```css
.dark {
  /* Green (Primary Brand - 유지) */
  --green-50: #E6F9F1;
  --green-500: #00C471;

  /* Black / Gray (반전) */
  --black-50: #1F1F1F;
  --black-100: #2A2A2A;
  --black-200: #4A4A4A;
  --black-300: #9A9A9A;
  --black-400: #CACACA;
  --black-500: #EFEFEF;

  /* Others */
  --white: #121212;
  --bg-main: #0A0A0A;
  --red: #FF6B6B;
  --blue: #5B9FFF;
}
```

### 2단계: 컴포넌트 dark: 클래스 추가

**예: MainHeader.jsx**
```jsx
<div className="bg-white dark:bg-gray-900 border-b border-[#E7E7E7] dark:border-gray-700">
  {/* 로고 */}
  <h1 className="text-[#111111] dark:text-white">Language MATES</h1>
</div>
```

**예: AchievementCard**
```jsx
<div className="bg-white dark:bg-gray-800 border border-[#E7E7E7] dark:border-gray-700">
  <p className="text-[#111111] dark:text-white">{title}</p>
  <p className="text-[#929292] dark:text-gray-400">{description}</p>
</div>
```

### 3단계: ThemeToggle 배치

**옵션 A: MainHeader (추천)**
```jsx
// src/components/MainHeader.jsx
import ThemeToggle from './ThemeToggle';

export default function MainHeader() {
  return (
    <div className="flex items-center justify-between px-4">
      {/* 로고 */}
      <div className="flex items-center space-x-4">
        {/* 알림 */}
        <ThemeToggle size="md" />  {/* 추가 */}
      </div>
    </div>
  );
}
```

**옵션 B: SettingsMain**
```jsx
// src/pages/Settings/SettingsMain.jsx
import ThemeToggle from '../../components/ThemeToggle';

export default function SettingsMain() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2>테마</h2>
        <ThemeToggle size="lg" />
      </div>
    </div>
  );
}
```

### 4단계: 테스트

**수동 테스트:**
1. ThemeToggle 클릭 → `<html>` 요소에 `dark` 클래스 확인
2. 페이지 새로고침 → localStorage에서 복원 확인
3. OS 다크 모드 변경 → `systemTheme` 업데이트 확인

**자동 테스트:**
```javascript
// ThemeToggle.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

test('toggles dark mode on click', () => {
  render(<ThemeToggle />);
  const button = screen.getByRole('switch');

  fireEvent.click(button);
  expect(document.documentElement.classList.contains('dark')).toBe(true);

  fireEvent.click(button);
  expect(document.documentElement.classList.contains('dark')).toBe(false);
});
```

### 5단계: Tailwind 설정 확인

**Tailwind CSS 4.x에서는 별도 설정 불필요**
- Vite 플러그인 방식 (`tailwindcss()`)에서 자동으로 `dark:` 클래스 지원
- `class` 전략 사용 (기본값)

---

## 모바일 최적화

### 파일: `src/styles/index.css`

**터치 최적화:**
```css
button,
[role="button"] {
  -webkit-tap-highlight-color: rgba(0, 196, 113, 0.3);
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
  min-height: 44px;  /* iOS 권장 터치 영역 */
  min-width: 44px;
}
```

**Safe Area 대응:**
```css
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

.safe-area-padding {
  padding-top: var(--safe-area-inset-top);
  padding-right: var(--safe-area-inset-right);
  padding-bottom: var(--safe-area-inset-bottom);
  padding-left: var(--safe-area-inset-left);
}
```

**iOS 100vh 이슈 대응:**
```css
:root {
  --vh: 1vh;
}

.h-screen-mobile {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}
```

**JavaScript에서 설정:**
```javascript
// App.jsx 또는 index.js
const setVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

setVH();
window.addEventListener('resize', setVH);
```

---

## 요약

### 현재 상태
- ✅ **구현 완료**: themeStore, ThemeToggle, 시스템 테마 감지
- ⏸️ **비활성화**: UI에 미배치, dark mode CSS 미정의
- 🎯 **목표**: 라이트/다크 모드 전환 기능 제공

### 활성화 체크리스트
- [ ] Dark mode CSS 변수 정의 (`.dark` selector)
- [ ] 모든 컴포넌트에 `dark:` 클래스 추가
- [ ] ThemeToggle 배치 (MainHeader 또는 SettingsMain)
- [ ] 초기화 함수 호출 (App.jsx)
- [ ] 테스트 (수동 + 자동)
- [ ] 라우트별 다크 모드 확인

### 핵심 파일
- **themeStore.js** (96 lines) - Zustand 스토어
- **ThemeToggle.jsx** (71 lines) - 토글 컴포넌트
- **index.css** (610 lines) - CSS 변수 + 모바일 최적화

### 개발 원칙
1. **CSS 변수 우선**: Tailwind 색상보다 디자인 시스템 변수 사용
2. **접근성**: ARIA 속성 + 포커스 링 + 스크린 리더 지원
3. **성능**: Zustand persist로 빠른 복원
4. **모바일**: 터치 최적화 + Safe Area 대응
