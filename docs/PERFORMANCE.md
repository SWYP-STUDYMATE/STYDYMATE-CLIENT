# STUDYMATE 성능 최적화 가이드

## 개요

이 문서는 STUDYMATE 프론트엔드의 성능 최적화 전략과 구현 방법을 설명합니다.

## 최적화 목표

- Lighthouse 성능 점수: 90+ 달성
- First Contentful Paint (FCP): < 1.5초
- Largest Contentful Paint (LCP): < 2.5초
- Cumulative Layout Shift (CLS): < 0.1
- Total Blocking Time (TBT): < 300ms

## 구현된 최적화

### 1. 코드 스플리팅

#### 라우트 기반 스플리팅
```javascript
// src/utils/lazyLoad.jsx 사용
const ChatPage = lazyLoad(() => import('./pages/Chat/ChatPage'));
```

#### 번들 최적화
```javascript
// vite.config.js
manualChunks: (id) => {
  if (id.includes('react-router') || id.includes('react-dom')) {
    return 'react-vendor';
  }
  // ...
}
```

### 2. 이미지 최적화

#### OptimizedImage 컴포넌트
```javascript
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  loading="lazy"
/>
```

#### 이미지 포맷 자동 변환
- WebP/AVIF 자동 변환
- 반응형 이미지 지원
- Lazy loading 기본 적용

### 3. 리소스 로딩 최적화

#### 중요 리소스 프리로드
```html
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://api.studymate.kr">
```

#### 리소스 힌트
- DNS Prefetch
- Preconnect
- Prefetch
- Preload

### 4. PWA 지원

#### 서비스 워커
- 오프라인 지원
- 캐싱 전략
- 백그라운드 동기화

#### 앱 매니페스트
```json
{
  "name": "STUDYMATE",
  "short_name": "STUDYMATE",
  "display": "standalone",
  "theme_color": "#3B82F6"
}
```

### 5. 번들 사이즈 최적화

#### Tree Shaking
- ES6 모듈 사용
- Side-effect free 패키지 사용
- Production 빌드 시 자동 적용

#### 압축
- Terser 최적화
- Gzip/Brotli 압축
- CSS 최소화

## 성능 측정

### 1. 번들 분석
```bash
npm run analyze
```
`dist/stats.html` 파일에서 번들 구성 확인

### 2. Lighthouse CI
```bash
npm run lighthouse
```
성능 메트릭 자동 측정 및 검증

### 3. Web Vitals 모니터링
```javascript
// src/main.jsx에 구현됨
reportWebVitals((metric) => {
  // 분석 도구로 전송
});
```

## 성능 최적화 체크리스트

### 개발 시

- [ ] 이미지는 OptimizedImage 컴포넌트 사용
- [ ] 큰 컴포넌트는 lazy loading 적용
- [ ] 불필요한 re-render 방지 (React.memo 사용)
- [ ] 무거운 계산은 useMemo로 메모이제이션
- [ ] 이벤트 핸들러는 useCallback으로 최적화

### 배포 전

- [ ] `npm run build` 실행
- [ ] `npm run analyze`로 번들 사이즈 확인
- [ ] `npm run lighthouse`로 성능 점수 확인
- [ ] 이미지 파일 크기 확인 (< 200KB 권장)
- [ ] 불필요한 console.log 제거

## 모니터링

### Real User Monitoring (RUM)
- Web Vitals 실시간 수집
- 사용자 경험 지표 추적
- 성능 저하 알림

### 성능 대시보드
- 일별/주별 성능 추이
- 페이지별 성능 분석
- 사용자 세그먼트별 분석

## 트러블슈팅

### 느린 초기 로딩
1. 번들 사이즈 확인
2. 네트워크 요청 최적화
3. 중요 리소스 프리로드

### 느린 페이지 전환
1. 라우트 프리페치 구현
2. 컴포넌트 lazy loading
3. 상태 관리 최적화

### 높은 CLS
1. 이미지/광고 크기 명시
2. 폰트 로딩 최적화
3. 동적 콘텐츠 예약 공간

## 추가 리소스

- [Web.dev Performance](https://web.dev/performance/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)