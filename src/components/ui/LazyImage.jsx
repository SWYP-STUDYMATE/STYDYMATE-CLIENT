import React from 'react';
import { useLazyImage } from '../../hooks/useLazyLoading';
import { SkeletonLoader } from './LoadingSpinner';

/**
 * 지연 로딩 이미지 컴포넌트
 * @param {Object} props
 * @param {string} props.src - 실제 이미지 URL
 * @param {string} props.alt - 이미지 대체 텍스트
 * @param {string} props.placeholder - 플레이스홀더 이미지 URL
 * @param {string} props.className - 추가 CSS 클래스
 * @param {string} props.width - 이미지 너비
 * @param {string} props.height - 이미지 높이
 * @param {boolean} props.eager - 즉시 로딩 여부
 * @param {number} props.rootMargin - 뷰포트 확장 여백
 * @param {Function} props.onLoad - 로딩 완료 콜백
 * @param {Function} props.onError - 에러 콜백
 * @param {boolean} props.showSkeleton - 스켈레톤 표시 여부
 */
const LazyImage = ({
  src,
  alt = '',
  placeholder,
  className = '',
  width,
  height,
  eager = false,
  rootMargin = 100,
  onLoad,
  onError,
  showSkeleton = true,
  style = {},
  ...props
}) => {
  const {
    ref,
    src: currentSrc,
    isLoading,
    isLoaded,
    hasError,
    retry
  } = useLazyImage({
    src,
    placeholder,
    rootMargin,
    eager
  });

  React.useEffect(() => {
    if (isLoaded) {
      onLoad?.();
    }
  }, [isLoaded, onLoad]);

  React.useEffect(() => {
    if (hasError) {
      onError?.();
    }
  }, [hasError, onError]);

  const imageStyle = {
    width,
    height,
    ...style
  };

  // 에러 상태일 때
  if (hasError) {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-center bg-gray-100 text-gray-500 border border-gray-200 ${className}`}
        style={imageStyle}
        role="img"
        aria-label={alt || '이미지 로딩 실패'}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">이미지를 불러올 수 없습니다</div>
          <button
            onClick={retry}
            className="mt-2 px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            aria-label="이미지 다시 로딩"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 로딩 중일 때 스켈레톤 표시
  if (isLoading && showSkeleton && !currentSrc) {
    return (
      <div ref={ref} style={imageStyle}>
        <SkeletonLoader
          width="100%"
          height="100%"
          className={`${className}`}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="relative inline-block" style={imageStyle}>
      <img
        src={currentSrc || placeholder}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-70'
        } ${className}`}
        style={imageStyle}
        loading={eager ? 'eager' : 'lazy'}
        {...props}
      />
      
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

/**
 * 아바타 이미지 컴포넌트
 */
export const LazyAvatar = ({
  src,
  alt,
  size = 'medium',
  fallbackText = '',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-xl'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 ${className}`}>
      {src ? (
        <LazyImage
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          placeholder="/default-avatar.png"
          {...props}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-green-100 text-green-600 font-semibold ${textSizeClasses[size]}`}>
          {fallbackText.charAt(0).toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
};

/**
 * 카드 이미지 컴포넌트
 */
export const LazyCardImage = ({
  src,
  alt,
  aspectRatio = '16/9',
  className = '',
  ...props
}) => {
  const aspectRatioClass = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-4/3',
    '16/9': 'aspect-video',
    '3/2': 'aspect-3/2'
  };

  return (
    <div className={`relative overflow-hidden ${aspectRatioClass[aspectRatio]} ${className}`}>
      <LazyImage
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        {...props}
      />
    </div>
  );
};

/**
 * 갤러리 이미지 컴포넌트
 */
export const LazyGalleryImage = ({
  src,
  alt,
  thumbnail,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`cursor-pointer transition-transform hover:scale-105 ${className}`}
      onClick={() => onClick?.(src, alt)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(src, alt);
        }
      }}
      aria-label={`갤러리 이미지: ${alt}`}
    >
      <LazyImage
        src={thumbnail || src}
        alt={alt}
        className="w-full h-full object-cover rounded-lg shadow-md"
        placeholder="/image-placeholder.svg"
        {...props}
      />
    </div>
  );
};

/**
 * 배경 이미지 컴포넌트
 */
export const LazyBackgroundImage = ({
  src,
  children,
  className = '',
  overlayClass = '',
  ...props
}) => {
  const { ref, src: currentSrc, isLoaded } = useLazyImage({ src, ...props });

  return (
    <div
      ref={ref}
      className={`relative bg-gray-200 ${className}`}
      style={{
        backgroundImage: currentSrc ? `url(${currentSrc})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 오버레이 */}
      {overlayClass && (
        <div className={`absolute inset-0 ${overlayClass}`} />
      )}
      
      {/* 콘텐츠 */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* 로딩 상태 */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export default LazyImage;