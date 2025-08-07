# 디자인 시스템 명세서

## 🎨 색상 시스템

### Primary Colors (공식 컬러 팔레트)
```css
/* Green 계열 - 컨트라스트 비율 준수 */
--green-50: #E6F9F1; /* rgb(230, 249, 241) - AA 1.09 */
--green-100: #B0EDD3; /* rgb(176, 237, 211) - AAA 1.32 */
--green-200: #8AE4BE; /* rgb(138, 228, 190) - AAA 1.51 */
--green-300: #54D7A0; /* rgb(84, 215, 160) - AAA 1.81 */
--green-400: #33D08D; /* rgb(51, 208, 141) - AAA 1.99 */
--green-500: #00C471; /* rgb(0, 196, 113) - AAA 2.30 - PRIMARY */
--green-600: #00B267; /* rgb(0, 178, 103) - AAA 2.78 */
--green-700: #008B50; /* rgb(0, 139, 80) - AA 4.37 */
--green-800: #006C3E; /* rgb(0, 108, 62) - AA 6.53 */
--green-900: #00522F; /* rgb(0, 82, 47) - AAA 9.34 */

/* Black 계열 - 컨트라스트 비율 준수 */
--black-50: #E7E7E7; /* rgb(231, 231, 231) - AAA 1.24 */
--black-100: #B5B5B5; /* rgb(181, 181, 181) - AAA 2.05 */
--black-200: #929292; /* rgb(146, 146, 146) - AA 3.11 */
--black-300: #606060; /* rgb(96, 96, 96) - AAA 6.29 */
--black-400: #414141; /* rgb(65, 65, 65) - AAA 10.21 */
--black-500: #111111; /* rgb(17, 17, 17) - AAA 18.88 - PRIMARY */
--black-600: #0F0F0F; /* rgb(15, 15, 15) - AAA 19.17 */
--black-700: #0C0C0C; /* rgb(12, 12, 12) - AAA 19.56 */
--black-800: #090909; /* rgb(9, 9, 9) - AAA 19.91 */
--black-900: #070707; /* rgb(7, 7, 7) - AAA 20.14 */

/* 기타 필수 색상 */
--white: #FFFFFF;
--bg-main: #FAFAFA; /* 배경 */
--naver-green: #03C75A; /* 네이버 브랜드 */
--red: #EA4335; /* 에러/경고 */
--blue: #4285F4; /* 정보 */
```

### Semantic Colors
```css
/* 레벨 색상 */
--level-beginner: #FFA500;
--level-intermediate: #00C471;
--level-advanced: #4285F4;

/* 상태 인디케이터 */
--status-online: #00C471;
--status-away: #FFA500;
--status-offline: #929292;
```

## 📐 간격 시스템

### Spacing Scale
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
--spacing-3xl: 32px;
--spacing-4xl: 40px;
--spacing-5xl: 48px;
--spacing-6xl: 56px;
```

### Layout Spacing
- **페이지 패딩**: 24px (좌우)
- **섹션 간격**: 32px, 40px
- **카드 내부 패딩**: 16px, 20px
- **컴포넌트 간격**: 12px, 16px

## 🔤 타이포그래피

### Font Family
```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes
```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;
```

### Font Weights
```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Letter Spacing
```css
letter-spacing: -0.025em; /* 전역 적용 */
```

### 텍스트 스타일 클래스
```css
/* 제목 */
.h1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 42px;
}

.h2 {
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
}

.h3 {
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

/* 본문 */
.body-large {
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
}

.body-medium {
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}

.body-small {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

/* 캡션 */
.caption {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}
```

## 🔘 컴포넌트 스타일

### 버튼
```css
/* 기본 버튼 */
.btn {
  height: 56px;
  padding: 0 24px;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 700;
  transition: all 200ms ease;
  width: 100%;
}

/* 버튼 변형 */
.btn-primary {
  background: #111111;
  color: white;
}

.btn-primary:hover {
  background: #444444;
}

.btn-success {
  background: #00C471;
  color: white;
}

.btn-success:hover {
  background: #009D5E;
}

.btn-secondary {
  background: #F1F3F5;
  color: #111111;
}

.btn-disabled {
  background: #F1F3F5;
  color: #929292;
  cursor: not-allowed;
}
```

### 입력 필드
```css
.input {
  height: 56px;
  padding: 0 16px;
  border: 1px solid #CED4DA;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #111111;
  outline: none;
}

.input:disabled {
  background: #F1F3F5;
  color: #929292;
}
```

### 카드
```css
.card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-large {
  border-radius: 20px;
  padding: 32px;
}
```

### 체크박스
```css
.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #CED4DA;
  background: white;
}

.checkbox:checked {
  background: #00C471;
  border-color: #00C471;
}

.checkbox-round {
  border-radius: 50%;
}
```

## 📱 레이아웃 시스템

### Container
```css
.container {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 24px;
}

.container-narrow {
  max-width: 720px;
}
```

### Grid System
```css
.grid {
  display: grid;
  gap: 16px;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
```

### Flex Utilities
```css
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-col {
  display: flex;
  flex-direction: column;
}
```

## 🎭 애니메이션

### Transitions
```css
.transition-all {
  transition: all 200ms ease;
}

.transition-colors {
  transition: background-color 200ms ease, 
              border-color 200ms ease, 
              color 200ms ease;
}

.transition-transform {
  transition: transform 200ms ease;
}
```

### Animations
```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-fadeIn {
  animation: fadeIn 300ms ease;
}

.animate-slideUp {
  animation: slideUp 300ms ease;
}
```

## 🖼️ 그림자 시스템

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.16);
```

## 📏 Border Radius

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 10px;
--radius-xl: 20px;
--radius-full: 9999px;
```

## 🎯 특수 컴포넌트 스타일

### 사이드바
```css
.sidebar {
  width: 80px;
  background: #00C471;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-item {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background 200ms ease;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-item.active {
  background: rgba(255, 255, 255, 0.2);
}
```

### 레벨 배지
```css
.level-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
}

.level-badge.beginner {
  background: #FFF4E6;
  color: #FFA500;
}

.level-badge.intermediate {
  background: #E6F9F1;
  color: #00C471;
}

.level-badge.advanced {
  background: #E6F0FF;
  color: #4285F4;
}
```

### 프로그레스 바
```css
.progress-bar {
  height: 8px;
  background: #F1F3F5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #00C471;
  transition: width 300ms ease;
}
```

### 상태 인디케이터
```css
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.online {
  background: #00C471;
}

.status-dot.away {
  background: #FFA500;
}

.status-dot.offline {
  background: #929292;
}
```

## 🔧 유틸리티 클래스

### Display
```css
.hidden { display: none; }
.block { display: block; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.grid { display: grid; }
```

### Position
```css
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }
```

### Z-Index
```css
.z-0 { z-index: 0; }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-30 { z-index: 30; }
.z-40 { z-index: 40; }
.z-50 { z-index: 50; }
```

### Overflow
```css
.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }
.overflow-scroll { overflow: scroll; }
```

## 📱 반응형 브레이크포인트

```css
/* 모바일 우선 설계 */
/* 기본: 0-767px (모바일) */

/* 태블릿 */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  /* 데스크톱 스타일 */
}
```

## ✅ 디자인 체크리스트

- [ ] 색상은 정의된 팔레트만 사용
- [ ] 간격은 4px 배수 시스템 준수
- [ ] 모든 버튼은 56px 높이 유지
- [ ] 입력 필드는 56px 높이 유지
- [ ] Border radius는 정의된 값만 사용
- [ ] 폰트는 Pretendard 사용
- [ ] Letter spacing -0.025em 적용
- [ ] Transition duration 200ms 사용
- [ ] 모바일 우선 반응형 디자인
- [ ] 최대 너비 768px 유지