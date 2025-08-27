# 프론트엔드 스타일 가이드

## 📋 스타일 가이드 개요

본 문서는 STUDYMATE-CLIENT 프로젝트의 공식 디자인 시스템 및 스타일 가이드입니다. 모든 UI 개발 시 반드시 이 가이드를 준수해야 합니다.

## 🎨 디자인 시스템

### 색상 팔레트 (Color Palette)

#### Green 계열 (Primary Brand Color)
```css
/* CSS Variables */
:root {
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
}
```

#### Black 계열 (Text & UI)
```css
:root {
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
}
```

#### 기타 필수 색상
```css
:root {
  --white: #FFFFFF;          /* 카드 배경 */
  --background: #FAFAFA;     /* 페이지 배경 */
  --naver: #03C75A;          /* 네이버 로그인 */
  --red: #EA4335;            /* 에러/경고 */
  --blue: #4285F4;           /* 정보/링크 */
  --gray-border: #CED4DA;    /* 기본 테두리 */
  --gray-disabled: #F1F3F5;  /* 비활성 배경 */
}
```

### Tailwind CSS 색상 설정
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      green: {
        50: '#E6F9F1',
        100: '#B0EDD3',
        200: '#8AE4BE',
        300: '#54D7A0',
        400: '#33D08D',
        500: '#00C471',
        600: '#00B267',
        700: '#008B50',
        800: '#006C3E',
        900: '#00522F',
      },
      black: {
        50: '#E7E7E7',
        100: '#B5B5B5',
        200: '#929292',
        300: '#606060',
        400: '#414141',
        500: '#111111',
        600: '#0F0F0F',
        700: '#0C0C0C',
        800: '#090909',
        900: '#070707',
      },
      // 기타 색상...
    }
  }
}
```

## 🔤 타이포그래피 (Typography)

### 폰트 설정
```css
:root {
  --font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --letter-spacing: -0.025em;
}

body {
  font-family: var(--font-family);
  letter-spacing: var(--letter-spacing);
}
```

### 타이포그래피 스케일
```css
/* Heading Styles */
.text-h1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 42px;
  color: var(--black-500);
}

.text-h2 {
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
  color: var(--black-500);
}

.text-h3 {
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: var(--black-500);
}

/* Body Styles */
.text-large {
  font-size: 18px;
  font-weight: 700;
  line-height: 28px;
  color: var(--black-500);
}

.text-medium {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: var(--black-500);
}

.text-body {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--black-500);
}

.text-small {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--black-300);
}

/* Secondary Text */
.text-secondary {
  color: var(--black-200);
}
```

### Tailwind Typography Classes
```css
/* 사용 예시 */
.text-3xl { font-size: 32px; } /* H1 */
.text-2xl { font-size: 28px; } /* H2 */
.text-xl { font-size: 24px; }  /* H3 */
.text-lg { font-size: 18px; }  /* Large */
.text-base { font-size: 16px; } /* Medium */
.text-sm { font-size: 14px; }   /* Body */
.text-xs { font-size: 12px; }   /* Small */

.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.font-normal { font-weight: 400; }
```

## 📏 간격 시스템 (Spacing System)

### 간격 토큰
```css
:root {
  --spacing-1: 4px;   /* 0.25rem */
  --spacing-2: 8px;   /* 0.5rem */
  --spacing-3: 12px;  /* 0.75rem */
  --spacing-4: 16px;  /* 1rem */
  --spacing-5: 20px;  /* 1.25rem */
  --spacing-6: 24px;  /* 1.5rem */
  --spacing-8: 32px;  /* 2rem */
  --spacing-10: 40px; /* 2.5rem */
  --spacing-12: 48px; /* 3rem */
  --spacing-14: 56px; /* 3.5rem */
  --spacing-16: 64px; /* 4rem */
}
```

### 사용 규칙
- **페이지 여백**: 24px (좌우)
- **섹션 간격**: 32px, 40px
- **컴포넌트 간격**: 12px, 16px, 20px, 24px
- **내부 패딩**: 14px, 16px
- **아이콘 여백**: 8px, 12px

### Tailwind Spacing Classes
```css
.p-3  { padding: 12px; }        /* 내부 패딩 기본 */
.p-4  { padding: 16px; }        /* 내부 패딩 중간 */
.p-6  { padding: 24px; }        /* 페이지 패딩 */

.m-3  { margin: 12px; }         /* 컴포넌트 간격 기본 */
.m-4  { margin: 16px; }         /* 컴포넌트 간격 중간 */
.m-5  { margin: 20px; }         /* 컴포넌트 간격 큰 */
.m-6  { margin: 24px; }         /* 컴포넌트 간격 매우 큰 */

.space-y-3 > * + * { margin-top: 12px; } /* 세로 간격 */
.space-y-4 > * + * { margin-top: 16px; }
.space-y-5 > * + * { margin-top: 20px; }
```

## 🔘 컴포넌트 스타일

### 버튼 (Button)
```css
/* Base Button */
.btn-base {
  height: 56px;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 700;
  padding: 0 24px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Primary Button */
.btn-primary {
  background-color: var(--black-500);
  color: var(--white);
}

.btn-primary:hover {
  background-color: var(--black-400);
}

/* Success Button */
.btn-success {
  background-color: var(--green-50);
  color: var(--black-500);
}

.btn-success:hover {
  background-color: var(--green-100);
}

/* Complete Button */
.btn-complete {
  background-color: var(--green-500);
  color: var(--white);
}

.btn-complete:hover {
  background-color: var(--green-600);
}

/* Secondary Button */
.btn-secondary {
  background-color: var(--black-50);
  color: var(--black-500);
}

.btn-secondary:hover {
  background-color: var(--black-500);
  color: var(--white);
}

/* Disabled Button */
.btn-disabled {
  background-color: var(--gray-disabled);
  color: var(--black-200);
  cursor: not-allowed;
}
```

### 입력 필드 (Input)
```css
/* Base Input */
.input-base {
  height: 56px;
  border: 1px solid var(--gray-border);
  border-radius: 6px;
  padding: 0 16px;
  font-size: 16px;
  font-weight: 500;
  background-color: var(--white);
  transition: border-color 0.2s ease-in-out;
}

.input-base:focus {
  outline: none;
  border-color: var(--black-500);
}

.input-base::placeholder {
  color: var(--black-200);
  font-weight: 400;
}

/* Input Error State */
.input-error {
  border-color: var(--red);
}

/* Input Disabled State */
.input-disabled {
  background-color: var(--gray-disabled);
  color: var(--black-200);
  cursor: not-allowed;
}

/* Textarea */
.textarea-base {
  min-height: 120px;
  padding: 16px;
  resize: vertical;
  line-height: 1.5;
}
```

### 체크박스 (Checkbox)
```css
/* Custom Checkbox */
.checkbox-base {
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-border);
  border-radius: 4px;
  background-color: var(--white);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.checkbox-checked {
  background-color: var(--green-500);
  border-color: var(--green-500);
}

.checkbox-checked::after {
  content: '✓';
  color: var(--white);
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Round Checkbox */
.checkbox-round {
  border-radius: 50%;
}
```

### 카드 (Card)
```css
/* Base Card */
.card-base {
  background-color: var(--white);
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;
}

.card-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Large Card */
.card-large {
  border-radius: 10px;
  padding: 24px;
}

/* Extra Large Card */
.card-xl {
  border-radius: 20px;
  padding: 32px;
}

/* Card with Border */
.card-border {
  border: 1px solid var(--black-50);
}
```

## 📱 레이아웃 시스템

### 컨테이너 (Container)
```css
/* Page Container */
.container-page {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Content Container */
.container-content {
  max-width: 720px;
  margin: 0 auto;
}

/* Full Width Container */
.container-full {
  width: 100%;
  padding: 0 24px;
}
```

### 그리드 시스템
```css
/* Flexbox Grid */
.grid-base {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.grid-2 > * {
  flex: 1 1 calc(50% - 8px);
}

.grid-3 > * {
  flex: 1 1 calc(33.333% - 10.666px);
}

.grid-4 > * {
  flex: 1 1 calc(25% - 12px);
}

/* Responsive Grid */
@media (max-width: 640px) {
  .grid-2 > *,
  .grid-3 > *,
  .grid-4 > * {
    flex: 1 1 100%;
  }
}
```

### 플렉스 유틸리티
```css
/* Flex Utilities */
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

.flex-start {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-col-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

## 🎭 상태별 스타일

### 로딩 상태 (Loading)
```css
/* Loading Spinner */
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--black-100);
  border-top: 2px solid var(--green-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Loading Button */
.btn-loading {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Loading Skeleton */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 에러 상태 (Error)
```css
/* Error Text */
.text-error {
  color: var(--red);
  font-size: 14px;
  font-weight: 500;
}

/* Error Card */
.card-error {
  border: 1px solid var(--red);
  background-color: #fef2f2;
}

/* Error Icon */
.icon-error {
  color: var(--red);
}
```

### 성공 상태 (Success)
```css
/* Success Text */
.text-success {
  color: var(--green-600);
  font-size: 14px;
  font-weight: 500;
}

/* Success Card */
.card-success {
  border: 1px solid var(--green-500);
  background-color: var(--green-50);
}

/* Success Icon */
.icon-success {
  color: var(--green-500);
}
```

## 📐 반응형 디자인 (Responsive Design)

### 브레이크포인트 (Breakpoints)
```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;   /* Small devices */
  --breakpoint-md: 768px;   /* Medium devices */
  --breakpoint-lg: 1024px;  /* Large devices */
  --breakpoint-xl: 1280px;  /* Extra large devices */
}
```

### 미디어 쿼리
```css
/* Mobile (Default) */
.responsive-text {
  font-size: 14px;
}

/* Tablet */
@media (min-width: 640px) {
  .responsive-text {
    font-size: 16px;
  }
}

/* Desktop */
@media (min-width: 768px) {
  .responsive-text {
    font-size: 18px;
  }
}
```

### Tailwind 반응형 클래스
```css
/* 사용 예시 */
.text-sm          /* Mobile: 14px */
.sm:text-base     /* Tablet: 16px */
.md:text-lg       /* Desktop: 18px */

.p-4              /* Mobile: 16px padding */
.sm:p-6           /* Tablet: 24px padding */
.md:p-8           /* Desktop: 32px padding */

.grid-cols-1      /* Mobile: 1 column */
.sm:grid-cols-2   /* Tablet: 2 columns */
.md:grid-cols-3   /* Desktop: 3 columns */
```

## 🎨 애니메이션 & 트랜지션

### 기본 트랜지션
```css
/* Standard Transitions */
.transition-base {
  transition: all 0.2s ease-in-out;
}

.transition-fast {
  transition: all 0.15s ease-in-out;
}

.transition-slow {
  transition: all 0.3s ease-in-out;
}

/* Property-specific Transitions */
.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.2s ease-in-out;
}

.transition-opacity {
  transition: opacity 0.2s ease-in-out;
}
```

### 호버 애니메이션
```css
/* Button Hover */
.btn-hover-lift:hover {
  transform: translateY(-2px);
}

.btn-hover-scale:hover {
  transform: scale(1.02);
}

/* Card Hover */
.card-hover-shadow:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Icon Hover */
.icon-hover-rotate:hover {
  transform: rotate(90deg);
}
```

### 페이드 애니메이션
```css
/* Fade In */
.fade-in {
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

/* Slide Up */
.slide-up {
  transform: translateY(20px);
  opacity: 0;
  animation: slideUp 0.3s ease-out forwards;
}

@keyframes slideUp {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

## 📚 컴포넌트 사용법

### 공통 버튼 컴포넌트
```jsx
// CommonButton.tsx
import React from 'react';

interface CommonButtonProps {
  variant: 'primary' | 'success' | 'complete' | 'secondary' | 'disabled';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}

const CommonButton: React.FC<CommonButtonProps> = ({
  variant,
  size = 'medium',
  children,
  onClick,
  loading = false
}) => {
  const baseClasses = 'btn-base transition-colors duration-200';
  const variantClasses = {
    primary: 'btn-primary',
    success: 'btn-success',
    complete: 'btn-complete',
    secondary: 'btn-secondary',
    disabled: 'btn-disabled'
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${loading ? 'btn-loading' : ''}`}
      onClick={onClick}
      disabled={variant === 'disabled' || loading}
    >
      {loading && <div className="loading-spinner" />}
      {children}
    </button>
  );
};

export default CommonButton;
```

### 사용 예시
```jsx
// 버튼 사용 예시
<CommonButton variant="primary" onClick={handleSubmit}>
  로그인
</CommonButton>

<CommonButton variant="success">
  다음 단계
</CommonButton>

<CommonButton variant="complete" loading={isLoading}>
  온보딩 완료
</CommonButton>
```

## ✅ 스타일 가이드 체크리스트

### 새 컴포넌트 개발 시
- [ ] 정의된 색상 팔레트만 사용
- [ ] 간격 시스템(4px 배수) 준수
- [ ] Pretendard 폰트 사용
- [ ] 56px 버튼/입력 필드 높이
- [ ] 6px 기본 border-radius
- [ ] transition 효과 적용
- [ ] 반응형 디자인 고려
- [ ] 접근성 고려 (색상 대비, 키보드 네비게이션)
- [ ] 로딩/에러 상태 처리
- [ ] 호버 효과 구현

### 기존 컴포넌트 수정 시
- [ ] 기존 디자인 토큰 재사용
- [ ] 일관된 스타일 유지
- [ ] 다른 컴포넌트와의 조화
- [ ] 전역 스타일 영향도 확인

## 🔗 관련 도구 및 리소스

### 개발 도구
- **Tailwind CSS**: 유틸리티 클래스 프레임워크
- **PostCSS**: CSS 후처리 도구
- **Autoprefixer**: 벤더 프리픽스 자동 추가
- **PurgeCSS**: 사용하지 않는 CSS 제거

### 디자인 리소스
- **Figma**: 디자인 시스템 관리
- **Lucide React**: 아이콘 라이브러리
- **Google Fonts**: Pretendard 웹폰트

### 접근성 도구
- **axe-core**: 접근성 검사 도구
- **WAVE**: 웹 접근성 평가 도구
- **Color Contrast Analyzer**: 색상 대비 검사

## 📝 변경 이력

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2024-01-XX | 초기 스타일 가이드 작성 | Frontend Team |

## 🔗 관련 문서

- [컴포넌트 라이브러리](components/README.md)
- [API 연동 가이드](api-integration.md)
- [테스트 가이드](testing-guide.md)
- [성능 최적화 가이드](performance-guide.md)