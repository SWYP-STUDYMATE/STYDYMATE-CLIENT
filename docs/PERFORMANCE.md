# Performance Optimization Guide

## 적용된 최적화 기법

### 1. 코드 스플리팅 (Code Splitting)

#### 라우트 레벨 코드 스플리팅
- React.lazy()와 Suspense를 사용하여 라우트별 번들 분리
- 초기 로딩 시 필요한 코드만 로드
- 각 페이지는 사용자가 접근할 때 동적으로 로드

```javascript
const ChatPage = lazyLoad(() => import('./pages/Chat/ChatPage'));
```

#### Vendor 번들 최적화
- node_modules 기반 청킹 전략
- 주요 라이브러리별 번들 분리:
  - react-vendor: React 관련 라이브러리
  - ui-vendor: UI 컴포넌트 라이브러리
  - utils-vendor: 유틸리티 라이브러리
  - realtime-vendor: 실시간 통신 라이브러리

### 2. 이미지 최적화

#### LazyImage 컴포넌트
- Intersection Observer를 사용한 지연 로딩
- placeholder 이미지 표시
- 프로그레시브 로딩 효과
- 에러 핸들링

```javascript
<LazyImage 
  src="/path/to/image.jpg" 
  alt="Description"
  className="w-full h-auto"
/>
```

#### 이미지 포맷 최적화
- Cloudflare Images 자동 포맷 변환
- 반응형 이미지 srcset 생성
- 품질 및 크기 최적화

### 3. 번들 사이즈 최적화

#### Terser 압축
- 프로덕션 빌드 시 console.log 제거
- debugger 구문 제거
- 코드 최소화

#### CSS 코드 스플리팅
- 각 청크별 CSS 분리
- 사용하지 않는 CSS 제거

### 4. 성능 모니터링

#### Web Vitals 측정
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

#### 커스텀 성능 메트릭
- DOM 로딩 시간
- 리소스 로딩 시간
- 이미지 로딩 평균 시간

### 5. 빌드 최적화

#### Vite 설정 최적화
- modulePreload polyfill 활성화
- 효율적인 청크 파일명 전략
- 에셋 파일명 해싱

## 성능 목표

### Lighthouse 점수 목표
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### Core Web Vitals 목표
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

## 사용 방법

### 이미지 최적화
```javascript
import LazyImage from '@/components/LazyImage';
import { getOptimizedImageUrl, IMAGE_SIZES } from '@/utils/imageOptimizer';

// 기본 사용
<LazyImage src={imageUrl} alt="Description" />

// 최적화된 URL 생성
const optimizedUrl = getOptimizedImageUrl(imageUrl, IMAGE_SIZES.medium);
```

### 성능 측정
```javascript
import { reportWebVitals, measurePerformance } from '@/utils/webVitals';

// Web Vitals 리포팅
reportWebVitals(console.log);

// 커스텀 성능 측정
const metrics = measurePerformance();
```

## 추가 최적화 제안

1. **Service Worker 구현**
   - 오프라인 지원
   - 리소스 캐싱
   - 백그라운드 동기화

2. **폰트 최적화**
   - font-display: swap 적용
   - 서브셋 폰트 사용
   - 프리로드 적용

3. **API 최적화**
   - GraphQL 또는 JSON:API 도입
   - 데이터 페칭 최적화
   - 캐싱 전략 개선

4. **렌더링 최적화**
   - React.memo 적용
   - useMemo/useCallback 최적화
   - 가상 스크롤링 구현