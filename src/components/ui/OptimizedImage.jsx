import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * 최적화된 이미지 컴포넌트
 * - WebP/AVIF 자동 변환
 * - 반응형 이미지 제공 (srcset)
 * - Lazy Loading
 * - Placeholder 표시
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  placeholder = true,
  objectFit = 'cover',
  onLoad,
  onError,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 이미지 로드 처리
  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  // 에러 처리
  const handleError = (e) => {
    setHasError(true);
    console.error('Image load error:', src);
    onError?.(e);
  };

  // 반응형 이미지 srcset 생성
  const generateSrcSet = (imageSrc) => {
    if (!imageSrc || typeof imageSrc !== 'string') return '';

    // vite-imagetools 쿼리 파라미터가 있는 경우 그대로 사용
    if (imageSrc.includes('?')) {
      return imageSrc;
    }

    // 일반 URL인 경우 srcset 생성
    const sizes = [400, 800, 1200];
    return sizes
      .map((size) => `${imageSrc}?w=${size}&format=webp ${size}w`)
      .join(', ');
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {placeholder && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-[#F1F3F5] animate-pulse" />
      )}

      {/* 실제 이미지 */}
      {!hasError && (
        <img
          src={src}
          srcSet={generateSrcSet(src)}
          sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ objectFit }}
        />
      )}

      {/* 에러 상태 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F1F3F5]">
          <div className="text-center text-[#929292]">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      )}
    </div>
  );
}

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  lazy: PropTypes.bool,
  placeholder: PropTypes.bool,
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down']),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};
