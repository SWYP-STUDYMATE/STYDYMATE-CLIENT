import { useState, useEffect, useCallback } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function LazyImage({ 
  src, 
  alt, 
  placeholder = '/assets/basicProfilePic.png',
  className = '',
  loading = 'lazy',
  sizes,
  srcSet,
  priority = false,
  quality = 80,
  onLoad,
  onError,
  ...props 
}) {
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
  const [imageLoading, setImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [targetRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // 모바일 성능을 위한 이미지 최적화
  const getOptimizedSrc = useCallback((originalSrc) => {
    if (!originalSrc || hasError) return placeholder;
    
    // 이미 최적화된 URL이면 그대로 사용
    if (originalSrc.includes('?')) return originalSrc;
    
    // 모바일 디바이스 감지
    const isMobile = window.innerWidth <= 768;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // 기본 크기 계산
    let width = isMobile ? 400 : 800;
    
    // 고해상도 디스플레이 대응
    if (devicePixelRatio > 1.5) {
      width = Math.round(width * Math.min(devicePixelRatio, 2));
    }
    
    return `${originalSrc}?w=${width}&q=${quality}&f=webp`;
  }, [placeholder, hasError, quality]);

  useEffect(() => {
    if (priority) {
      // 우선순위 이미지는 즉시 로드
      loadImage(src);
      return;
    }

    if (!isIntersecting || !src) return;
    loadImage(src);
  }, [isIntersecting, src, priority]);

  const loadImage = useCallback((imageSrc) => {
    if (!imageSrc) return;

    setImageLoading(true);
    setHasError(false);
    
    const img = new Image();
    
    // 반응형 이미지 지원
    if (srcSet) img.srcset = srcSet;
    if (sizes) img.sizes = sizes;
    
    img.src = getOptimizedSrc(imageSrc);
    
    img.onload = () => {
      setImageSrc(img.src);
      setImageLoading(false);
      onLoad?.(img);
    };
    
    img.onerror = (error) => {
      setHasError(true);
      setImageLoading(false);
      onError?.(error);
      
      // 폴백으로 원본 URL 시도
      if (img.src !== imageSrc) {
        const fallbackImg = new Image();
        fallbackImg.src = imageSrc;
        fallbackImg.onload = () => {
          setImageSrc(imageSrc);
          setImageLoading(false);
          setHasError(false);
        };
      }
    };
  }, [getOptimizedSrc, srcSet, sizes, onLoad, onError]);

  return (
    <div 
      ref={targetRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: '#f3f4f6' }}
    >
      <img
        src={imageSrc}
        alt={alt}
        loading={priority ? 'eager' : loading}
        decoding="async"
        srcSet={srcSet}
        sizes={sizes}
        className={`
          ${className} 
          ${imageLoading ? 'opacity-0' : 'opacity-100'} 
          transition-all duration-300 ease-in-out
          ${!hasError ? 'object-cover' : 'object-contain'}
        `}
        style={{ 
          imageRendering: '-webkit-optimize-contrast',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
        {...props}
      />
      
      {/* 로딩 스켈레톤 */}
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gray-100 opacity-50" />
        </div>
      )}
      
      {/* 에러 상태 표시 */}
      {hasError && !imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21,19V5c0-1.1-0.9-2-2-2H5c-1.1,0-2,0.9-2,2v14c0,1.1,0.9,2,2,2h14C20.1,21,21,20.1,21,19z M8.5,13.5l2.5,3.01 L14.5,12l4.5,6H5L8.5,13.5z"/>
          </svg>
        </div>
      )}
      
      {/* 접근성 개선: 로딩 상태 알림 */}
      <div 
        className="sr-only" 
        aria-live="polite"
        aria-atomic="true"
      >
        {imageLoading ? `${alt} 이미지 로딩 중...` : hasError ? `${alt} 이미지 로딩 실패` : ''}
      </div>
    </div>
  );
}