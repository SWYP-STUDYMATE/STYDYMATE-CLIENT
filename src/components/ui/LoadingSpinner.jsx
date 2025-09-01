import React from 'react';

/**
 * 모바일 최적화된 로딩 스피너 컴포넌트
 * 
 * @param {Object} props
 * @param {'small'|'medium'|'large'} props.size - 스피너 크기
 * @param {string} props.color - 스피너 색상
 * @param {string} props.message - 로딩 메시지
 * @param {string} props.className - 추가 CSS 클래스
 * @param {boolean} props.overlay - 오버레이 표시 여부
 * @param {boolean} props.fullscreen - 전체 화면 모드
 */
const LoadingSpinner = ({
  size = 'medium',
  color = '#00C471',
  message = '로딩 중...',
  className = '',
  overlay = false,
  fullscreen = false
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };

  const containerClasses = {
    small: 'gap-2',
    medium: 'gap-3',
    large: 'gap-4'
  };

  const textClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const spinnerElement = (
    <div 
      className={`${sizeClasses[size]} animate-spin`}
      role="status"
      aria-label={message}
    >
      <svg 
        className="w-full h-full" 
        fill="none" 
        viewBox="0 0 24 24"
        style={{ color }}
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  const content = (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
      {spinnerElement}
      {message && (
        <span 
          className={`${textClasses[size]} text-[#606060] font-medium text-center`}
          aria-live="polite"
        >
          {message}
        </span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 bg-white/90 backdrop-blur-sm flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * 인라인 로딩 스피너 (텍스트나 버튼 내부용)
 */
export const InlineSpinner = ({ size = 'small', color = '#00C471', className = '' }) => (
  <div 
    className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} animate-spin ${className}`}
    role="status"
    aria-label="로딩 중"
  >
    <svg 
      className="w-full h-full" 
      fill="none" 
      viewBox="0 0 24 24"
      style={{ color }}
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
);

/**
 * 스켈레톤 로딩 컴포넌트 (콘텐츠 모양 유지)
 */
export const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  className = '',
  rounded = false,
  lines = 1
}) => {
  const skeletonLine = (
    <div 
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse ${
        rounded ? 'rounded-full' : 'rounded'
      } ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="콘텐츠 로딩 중"
    />
  );

  if (lines === 1) {
    return skeletonLine;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} style={{ width: index === lines - 1 ? '75%' : width }}>
          {skeletonLine}
        </div>
      ))}
    </div>
  );
};

/**
 * 카드 스켈레톤 로더
 */
export const CardSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonLoader width="50px" height="50px" rounded />
      <div className="flex-1">
        <SkeletonLoader height="16px" className="mb-2" />
        <SkeletonLoader height="12px" width="60%" />
      </div>
    </div>
    <SkeletonLoader lines={3} height="12px" />
  </div>
);

export default LoadingSpinner;