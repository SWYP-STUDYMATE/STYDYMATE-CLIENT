import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * SEO 메타 태그 관리 컴포넌트
 * - Open Graph, Twitter Card 지원
 * - 동적 메타 태그 생성
 */
export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
  canonicalUrl,
}) {
  // 기본값
  const defaultTitle = 'STUDYMATE - 언어 교환 학습 플랫폼';
  const defaultDescription =
    '전 세계 사람들과 실시간으로 언어를 교환하며 학습하세요. AI 기반 레벨 테스트, 1:1 화상 세션, 실시간 번역 자막을 제공합니다.';
  const defaultKeywords = [
    '언어 교환',
    '언어 학습',
    '화상 채팅',
    '실시간 번역',
    '레벨 테스트',
    'AI 학습',
    'STUDYMATE',
  ];
  const defaultImage = '/og-image.jpg';
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://languagemate.kr';

  // 최종 값 계산
  const finalTitle = title ? `${title} | STUDYMATE` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords ? [...keywords, ...defaultKeywords] : defaultKeywords;
  const finalImage = image || defaultImage;
  const finalUrl = url || canonicalUrl || siteUrl;

  // robots 메타 태그
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  const robotsMeta = robotsContent.length > 0 ? robotsContent.join(',') : 'index,follow';

  return (
    <Helmet>
      {/* 기본 메타 태그 */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      <meta name="robots" content={robotsMeta} />
      {author && <meta name="author" content={author} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content="STUDYMATE" />
      <meta property="og:locale" content="ko_KR" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* 모바일 최적화 */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="format-detection" content="telephone=no" />

      {/* 테마 색상 */}
      <meta name="theme-color" content="#00C471" />
      <meta name="msapplication-TileColor" content="#00C471" />

      {/* Apple */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="STUDYMATE" />

      {/* 언어 */}
      <meta httpEquiv="content-language" content="ko" />
      <link rel="alternate" hrefLang="ko" href={finalUrl} />
      <link rel="alternate" hrefLang="en" href={`${siteUrl}/en`} />
      <link rel="alternate" hrefLang="x-default" href={siteUrl} />
    </Helmet>
  );
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.arrayOf(PropTypes.string),
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.oneOf([
    'website',
    'article',
    'profile',
    'video.other',
    'music.song',
    'book',
  ]),
  author: PropTypes.string,
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  noindex: PropTypes.bool,
  nofollow: PropTypes.bool,
  canonicalUrl: PropTypes.string,
};
