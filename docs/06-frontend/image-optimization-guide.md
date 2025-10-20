# 이미지 최적화 가이드

## 개요

이 프로젝트는 `vite-imagetools`를 사용하여 자동 이미지 최적화를 제공합니다.

## 주요 기능

### 1. 자동 최적화
- **WebP 변환**: 모든 이미지를 자동으로 WebP 형식으로 변환
- **AVIF 지원**: AVIF 형식도 함께 생성하여 최신 브라우저에서 최적화된 이미지 제공
- **반응형 이미지**: 다양한 화면 크기에 맞는 이미지 자동 생성 (200px, 400px, 800px)
- **품질 최적화**: 80% 품질로 압축하여 파일 크기 감소

### 2. Lazy Loading
- 스크롤 시 이미지가 뷰포트에 들어올 때만 로드
- 초기 페이지 로드 속도 향상

### 3. Placeholder
- 이미지 로딩 중 회색 배경 표시
- 레이아웃 시프트(CLS) 방지

## 사용 방법

### OptimizedImage 컴포넌트 사용

```jsx
import OptimizedImage from '@/components/ui/OptimizedImage';

function MyComponent() {
  return (
    <OptimizedImage
      src="/images/profile.jpg"
      alt="프로필 이미지"
      width="200px"
      height="200px"
      lazy={true}
      placeholder={true}
      objectFit="cover"
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | 이미지 URL |
| `alt` | `string` | required | 대체 텍스트 |
| `width` | `string\|number` | - | 이미지 너비 |
| `height` | `string\|number` | - | 이미지 높이 |
| `className` | `string` | `''` | 추가 CSS 클래스 |
| `lazy` | `boolean` | `true` | Lazy loading 활성화 |
| `placeholder` | `boolean` | `true` | Placeholder 표시 |
| `objectFit` | `string` | `'cover'` | CSS object-fit 속성 |
| `onLoad` | `function` | - | 로드 완료 콜백 |
| `onError` | `function` | - | 에러 콜백 |

### 이미지 최적화 유틸리티

```javascript
import {
  optimizeImageUrl,
  generateSrcSet,
  preloadImage,
  resizeImage,
  compressImage,
  optimizeForUpload,
  isWebPSupported,
  isAVIFSupported
} from '@/utils/imageOptimization';

// 1. URL 최적화
const optimizedUrl = optimizeImageUrl('/images/photo.jpg', {
  width: 800,
  quality: 80,
  format: 'webp'
});

// 2. srcset 생성
const srcSet = generateSrcSet('/images/photo.jpg', [400, 800, 1200]);

// 3. 이미지 프리로드
await preloadImage('/images/hero.jpg');

// 4. 업로드 전 최적화
const file = event.target.files[0];
const optimizedFile = await optimizeForUpload(file);

// 5. 이미지 압축
const compressedBlob = await compressImage(file, 0.8);

// 6. WebP 지원 확인
if (isWebPSupported()) {
  console.log('WebP를 지원하는 브라우저입니다.');
}
```

## Vite Config 설정

`vite.config.js`에 다음과 같이 설정되어 있습니다:

```javascript
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    imagetools({
      defaultDirectives: (url) => {
        return new URLSearchParams({
          format: 'webp;avif;jpg',
          quality: '80',
          w: '800;400;200',
        });
      },
    }),
  ],
});
```

## 정적 이미지 Import

```jsx
// 기본 import
import heroImage from './assets/hero.jpg';

// 특정 크기와 형식 지정
import heroImageWebP from './assets/hero.jpg?w=800&format=webp';

// 여러 크기 생성 (srcset)
import heroImageSet from './assets/hero.jpg?w=400;800;1200&format=webp';
```

## 성능 최적화 팁

### 1. 적절한 이미지 크기 사용
```jsx
// ❌ 나쁜 예: 큰 이미지를 CSS로 축소
<img src="/images/large-photo.jpg" style={{ width: '200px' }} />

// ✅ 좋은 예: 적절한 크기의 이미지 사용
<OptimizedImage src="/images/photo.jpg" width="200px" height="200px" />
```

### 2. Lazy Loading 활용
```jsx
// 첫 화면에 보이는 이미지는 lazy=false
<OptimizedImage src="/hero.jpg" lazy={false} />

// 스크롤해야 보이는 이미지는 lazy=true
<OptimizedImage src="/gallery-1.jpg" lazy={true} />
```

### 3. 프리로드 활용
```jsx
import { preloadImages } from '@/utils/imageOptimization';

useEffect(() => {
  // 중요한 이미지는 미리 로드
  preloadImages([
    '/images/hero.jpg',
    '/images/logo.png',
  ]);
}, []);
```

### 4. 업로드 전 최적화
```jsx
import { optimizeForUpload } from '@/utils/imageOptimization';

async function handleFileChange(event) {
  const file = event.target.files[0];

  // 2MB 이상의 이미지는 자동으로 압축
  const optimizedFile = await optimizeForUpload(file);

  // 최적화된 파일 업로드
  await uploadFile(optimizedFile);
}
```

## 브라우저 지원

- **WebP**: Chrome, Firefox, Edge, Safari 14+
- **AVIF**: Chrome 85+, Firefox 93+
- **Fallback**: 지원하지 않는 브라우저는 자동으로 JPEG/PNG로 폴백

## 파일 크기 비교

일반적인 사진 이미지 (1920x1080) 기준:

| 형식 | 파일 크기 | 감소율 |
|------|-----------|--------|
| PNG | ~2.5 MB | - |
| JPEG (90%) | ~500 KB | 80% |
| WebP (80%) | ~200 KB | 92% |
| AVIF (80%) | ~150 KB | 94% |

## 주의사항

1. **이미지 경로**: 정적 이미지는 `public/` 또는 `src/assets/`에 저장
2. **외부 이미지**: 외부 URL 이미지는 최적화되지 않음 (CDN 사용 권장)
3. **빌드 시간**: 많은 이미지를 최적화하면 빌드 시간이 증가할 수 있음
4. **메모리**: 대용량 이미지 처리 시 메모리 사용량 증가

## 추가 리소스

- [vite-imagetools 문서](https://github.com/JonasKruckenberg/imagetools)
- [WebP 가이드](https://developers.google.com/speed/webp)
- [AVIF 가이드](https://web.dev/compress-images-avif/)
