# SEO 관리 시스템 가이드

## 개요

이 프로젝트는 `react-helmet-async`를 사용하여 동적 SEO 메타 태그 관리를 제공합니다.

## 주요 기능

### 1. 동적 메타 태그
- 페이지별 title, description, keywords 자동 설정
- Open Graph, Twitter Card 지원
- Canonical URL 관리

### 2. 구조화 데이터 (JSON-LD)
- Schema.org 구조화 데이터
- Organization, WebSite, WebApplication 정보
- BreadcrumbList, FAQPage 지원

### 3. 다국어 지원
- hreflang 태그 자동 생성
- 언어별 Canonical URL

## 사용 방법

### 기본 SEO 컴포넌트

```jsx
import SEO from '@/components/SEO';

function MyPage() {
  return (
    <>
      <SEO
        title="페이지 제목"
        description="페이지 설명"
        keywords={['키워드1', '키워드2']}
        image="/og-image.jpg"
      />
      {/* 페이지 콘텐츠 */}
    </>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | 페이지 제목 (자동으로 "| STUDYMATE" 추가) |
| `description` | `string` | - | 페이지 설명 |
| `keywords` | `string[]` | - | 키워드 배열 (기본 키워드와 병합) |
| `image` | `string` | `/og-image.jpg` | Open Graph 이미지 URL |
| `url` | `string` | 현재 URL | Canonical URL |
| `type` | `string` | `website` | Open Graph 타입 |
| `author` | `string` | - | 작성자 |
| `publishedTime` | `string` | - | 게시 시간 (ISO 8601) |
| `modifiedTime` | `string` | - | 수정 시간 (ISO 8601) |
| `noindex` | `boolean` | `false` | 검색 엔진 색인 방지 |
| `nofollow` | `boolean` | `false` | 링크 추적 방지 |
| `canonicalUrl` | `string` | - | Canonical URL (명시적 지정) |

### 자동 SEO 설정

페이지 경로를 기반으로 자동으로 SEO 설정:

```jsx
import { useLocation } from 'react-router-dom';
import SEO from '@/components/SEO';
import { getSEOForRoute } from '@/utils/seo';

function MyPage() {
  const location = useLocation();
  const seo = getSEOForRoute(location.pathname);

  return (
    <>
      <SEO {...seo} />
      {/* 페이지 콘텐츠 */}
    </>
  );
}
```

### 구조화 데이터 추가

```jsx
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import { ORGANIZATION_JSONLD, WEBAPP_JSONLD } from '@/utils/seo';

function HomePage() {
  return (
    <>
      <SEO
        title="홈"
        description="언어 교환 학습 플랫폼"
      />
      <StructuredData data={[ORGANIZATION_JSONLD, WEBAPP_JSONLD]} />
      {/* 페이지 콘텐츠 */}
    </>
  );
}
```

### BreadcrumbList 생성

```jsx
import StructuredData from '@/components/StructuredData';
import { createBreadcrumbList } from '@/utils/seo';

function ProfilePage() {
  const breadcrumbs = createBreadcrumbList([
    { name: '홈', url: 'https://languagemate.kr' },
    { name: '프로필', url: 'https://languagemate.kr/profile' },
  ]);

  return (
    <>
      <SEO title="프로필" />
      <StructuredData data={breadcrumbs} />
      {/* 페이지 콘텐츠 */}
    </>
  );
}
```

### FAQ 페이지

```jsx
import StructuredData from '@/components/StructuredData';
import { createFAQPage } from '@/utils/seo';

function FAQPage() {
  const faqs = createFAQPage([
    {
      question: 'STUDYMATE는 무료인가요?',
      answer: '네, STUDYMATE는 기본 기능을 무료로 제공합니다.',
    },
    {
      question: '어떤 언어를 지원하나요?',
      answer: '한국어, 영어, 일본어, 중국어 등 다양한 언어를 지원합니다.',
    },
  ]);

  return (
    <>
      <SEO title="FAQ" />
      <StructuredData data={faqs} />
      {/* 페이지 콘텐츠 */}
    </>
  );
}
```

### 사용자 프로필

```jsx
import StructuredData from '@/components/StructuredData';
import { createPersonProfile } from '@/utils/seo';

function UserProfile({ user }) {
  const personData = createPersonProfile({
    name: user.name,
    image: user.profileImage,
    intro: user.intro,
    nativeLanguage: user.nativeLanguage,
    targetLanguage: user.targetLanguage,
  });

  return (
    <>
      <SEO
        title={`${user.name}의 프로필`}
        description={user.intro}
        image={user.profileImage}
        type="profile"
      />
      <StructuredData data={personData} />
      {/* 프로필 콘텐츠 */}
    </>
  );
}
```

## 페이지별 SEO 설정

`src/utils/seo.js`의 `SEO_CONFIG`에서 페이지별 기본 SEO 설정을 관리합니다:

```javascript
export const SEO_CONFIG = {
  home: {
    title: '홈',
    description: '전 세계 사람들과 실시간으로 언어를 교환하며 학습하세요.',
    keywords: ['언어 교환', '홈', '메인'],
  },
  // ... 다른 페이지
};
```

새로운 페이지를 추가할 때는 이 설정에 추가하세요.

## Open Graph 이미지

Open Graph 이미지는 `public/og-image.jpg`에 위치해야 합니다.

### 권장 사항:
- **크기**: 1200x630px
- **포맷**: JPG 또는 PNG
- **파일 크기**: 8MB 이하
- **비율**: 1.91:1

페이지별 다른 이미지를 사용하려면:

```jsx
<SEO
  title="특별 이벤트"
  image="/images/event-og-image.jpg"
/>
```

## 검색 엔진 최적화 팁

### 1. Title 최적화
```jsx
// ❌ 나쁜 예: 너무 짧음
<SEO title="프로필" />

// ✅ 좋은 예: 구체적이고 설명적
<SEO title="언어 학습 프로필 - 내 학습 현황과 성과 확인" />
```

### 2. Description 최적화
```jsx
// ❌ 나쁜 예: 너무 짧거나 키워드 나열
<SEO description="언어, 학습, 교환" />

// ✅ 좋은 예: 자연스럽고 유익한 문장 (120-160자)
<SEO description="전 세계 사람들과 실시간 화상 세션으로 언어를 교환하며 학습하세요. AI 기반 레벨 테스트와 실시간 번역 자막을 제공합니다." />
```

### 3. Keywords 사용
```jsx
// ✅ 관련성 높은 키워드 3-5개
<SEO keywords={['언어 교환', '화상 학습', '실시간 번역']} />
```

### 4. 중복 콘텐츠 방지
```jsx
// Canonical URL 명시적 지정
<SEO
  title="매칭"
  canonicalUrl="https://languagemate.kr/matching"
/>
```

### 5. 로봇 제어
```jsx
// 검색 결과에 표시 안 함 (개발 중 페이지)
<SEO
  title="테스트 페이지"
  noindex={true}
  nofollow={true}
/>
```

## 구조화 데이터 검증

Google의 [Rich Results Test](https://search.google.com/test/rich-results)를 사용하여 구조화 데이터를 검증하세요.

### 검증 절차:
1. 페이지 배포
2. Rich Results Test에 URL 입력
3. 오류 확인 및 수정
4. 재배포

## 성능 최적화

### 1. 중복 제거
각 페이지에서 SEO 컴포넌트는 한 번만 사용:

```jsx
// ❌ 나쁜 예
<SEO title="페이지 1" />
<SEO title="페이지 2" /> // 중복!

// ✅ 좋은 예
<SEO title="페이지 1" />
```

### 2. 동적 데이터
API 데이터를 기반으로 동적 SEO 생성:

```jsx
function ArticlePage({ article }) {
  return (
    <>
      <SEO
        title={article.title}
        description={article.summary}
        image={article.thumbnail}
        type="article"
        publishedTime={article.createdAt}
        modifiedTime={article.updatedAt}
      />
      {/* 콘텐츠 */}
    </>
  );
}
```

## 모바일 최적화

SEO 컴포넌트는 자동으로 모바일 최적화 메타 태그를 포함합니다:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
<meta name="format-detection" content="telephone=no" />
<meta name="theme-color" content="#00C471" />
```

## 소셜 미디어 미리보기 테스트

### Facebook/Meta:
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

### Twitter:
[Twitter Card Validator](https://cards-dev.twitter.com/validator)

### LinkedIn:
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## 주의사항

1. **HelmetProvider**: App.jsx에 HelmetProvider가 래핑되어 있어야 함
2. **SSR**: 현재는 CSR만 지원. SSR 사용 시 추가 설정 필요
3. **이미지 경로**: Open Graph 이미지는 절대 URL 사용 권장
4. **캐싱**: CDN 사용 시 메타 태그 캐싱 정책 확인

## 추가 리소스

- [react-helmet-async 문서](https://github.com/staylor/react-helmet-async)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
