// 이미지 최적화 유틸리티 함수들

// 프로필 이미지 기본값
export const DEFAULT_PROFILE_IMAGE = '/assets/basicProfilePic.png';

// WebP 지원 체크
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
};

// 이미지 URL 최적화
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.startsWith('http')) return url;
  
  const { width, height, quality = 85, format = 'auto' } = options;
  
  // Cloudflare Images 변환 API 사용
  const params = new URLSearchParams({
    url,
    ...(width && { w: width }),
    ...(height && { h: height }),
    q: quality,
    f: format
  });
  
  return `/api/images/transform?${params}`;
};

// 반응형 이미지 소스 생성
export const generateResponsiveSources = (baseUrl, alt) => {
  const sizes = [
    { width: 320, media: '(max-width: 640px)' },
    { width: 640, media: '(max-width: 768px)' },
    { width: 768, media: '(max-width: 1024px)' },
    { width: 1024, media: '(max-width: 1280px)' },
    { width: 1280, media: '(min-width: 1281px)' }
  ];
  
  return sizes.map(({ width, media }) => ({
    srcSet: getOptimizedImageUrl(baseUrl, { width }),
    media,
    type: 'image/webp'
  }));
};

// 블러 데이터 URL 생성 (작은 미리보기 이미지)
export const generateBlurDataURL = async (imageUrl) => {
  try {
    const response = await fetch(getOptimizedImageUrl(imageUrl, { 
      width: 40, 
      quality: 20 
    }));
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error generating blur data URL:', error);
    return null;
  }
};

// 이미지 프리로드
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
};

// 여러 이미지 프리로드
export const preloadImages = (srcArray) => {
  return Promise.all(srcArray.map(src => preloadImage(src)));
};