import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { createLoadingAriaProps } from '../../utils/accessibility';

/**
 * 지연 로딩을 위한 Suspense 경계 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.children - 지연 로딩될 컴포넌트들
 * @param {React.ComponentType} props.fallback - 로딩 중 표시할 컴포넌트
 * @param {string} props.fallbackMessage - 로딩 메시지
 * @param {boolean} props.fullscreen - 전체 화면 로딩 여부
 * @param {string} props.className - 추가 CSS 클래스
 * @param {Function} props.onError - 에러 처리 함수
 */
const LazyBoundary = ({
  children,
  fallback,
  fallbackMessage = '페이지를 불러오는 중...',
  fullscreen = false,
  className = '',
  onError
}) => {
  // 기본 폴백 컴포넌트
  const defaultFallback = (
    <div className={`flex items-center justify-center ${fullscreen ? 'min-h-screen' : 'min-h-[200px]'} ${className}`}>
      <LoadingSpinner
        size={fullscreen ? 'large' : 'medium'}
        message={fallbackMessage}
        fullscreen={false}
        {...createLoadingAriaProps(true, fallbackMessage, '로딩 완료')}
      />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <ErrorBoundaryWrapper onError={onError}>
        {children}
      </ErrorBoundaryWrapper>
    </Suspense>
  );
};

/**
 * 에러 경계 래퍼 컴포넌트
 */
class ErrorBoundaryWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LazyBoundary Error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px] p-6">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              페이지를 불러오는 중 오류가 발생했습니다
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              잠시 후 다시 시도해 주세요.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              aria-label="페이지 새로고침"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 페이지 레벨 지연 로딩 경계
 */
export const PageLazyBoundary = ({ children, pageName = '페이지', ...props }) => (
  <LazyBoundary
    fallbackMessage={`${pageName}를 불러오는 중...`}
    fullscreen={true}
    {...props}
  >
    {children}
  </LazyBoundary>
);

/**
 * 컴포넌트 레벨 지연 로딩 경계
 */
export const ComponentLazyBoundary = ({ children, componentName = '컴포넌트', ...props }) => (
  <LazyBoundary
    fallbackMessage={`${componentName}를 불러오는 중...`}
    fullscreen={false}
    {...props}
  >
    {children}
  </LazyBoundary>
);

/**
 * 모달 지연 로딩 경계
 */
export const ModalLazyBoundary = ({ children, ...props }) => (
  <LazyBoundary
    fallback={
      <div className="fixed inset-0 z-50 flex items-center justify-center overlay-strong">
        <div className="bg-white rounded-lg p-6">
          <LoadingSpinner size="medium" message="모달을 불러오는 중..." />
        </div>
      </div>
    }
    {...props}
  >
    {children}
  </LazyBoundary>
);

/**
 * 차트/그래프 지연 로딩 경계
 */
export const ChartLazyBoundary = ({ children, ...props }) => (
  <LazyBoundary
    fallback={
      <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <LoadingSpinner size="small" message="차트를 불러오는 중..." />
        </div>
      </div>
    }
    {...props}
  >
    {children}
  </LazyBoundary>
);

/**
 * 미디어 컴포넌트 지연 로딩 경계
 */
export const MediaLazyBoundary = ({ children, mediaType = '미디어', ...props }) => (
  <LazyBoundary
    fallback={
      <div className="w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-3xl mb-2">🎥</div>
          <LoadingSpinner 
            size="medium" 
            message={`${mediaType}를 불러오는 중...`}
            color="#FFFFFF"
          />
        </div>
      </div>
    }
    {...props}
  >
    {children}
  </LazyBoundary>
);

/**
 * 폼 컴포넌트 지연 로딩 경계
 */
export const FormLazyBoundary = ({ children, ...props }) => (
  <LazyBoundary
    fallback={
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-green-200 rounded animate-pulse"></div>
        </div>
      </div>
    }
    {...props}
  >
    {children}
  </LazyBoundary>
);

/**
 * 리스트 컴포넌트 지연 로딩 경계
 */
export const ListLazyBoundary = ({ children, itemCount = 5, ...props }) => (
  <LazyBoundary
    fallback={
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    }
    {...props}
  >
    {children}
  </LazyBoundary>
);

export default LazyBoundary;
