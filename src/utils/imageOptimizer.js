// 이미지 URL을 최적화된 포맷으로 변환
export const getOptimizedImageUrl = (url, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'auto'
  } = options;

  // Cloudflare Images URL인 경우
  if (url?.includes('imagedelivery.net')) {
    const params = [];
    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);
    if (quality) params.push(`q=${quality}`);
    if (format) params.push(`f=${format}`);
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.join('&')}`;
  }

  // 일반 이미지 URL
  return url;
};

// 반응형 이미지 srcset 생성
export const generateSrcSet = (url, sizes = [320, 640, 768, 1024, 1280]) => {
  if (!url) return '';
  
  return sizes
    .map(size => `${getOptimizedImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
};

// 이미지 사이즈 프리셋
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
  profile: { width: 200, height: 200 },
  cover: { width: 1920, height: 1080 }
};

// 이미지 로딩 우선순위
export const IMAGE_LOADING = {
  eager: 'eager',
  lazy: 'lazy',
  auto: 'auto'
};