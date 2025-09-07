import React from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import usePullToRefresh from '../../hooks/usePullToRefresh';
import { createAriaLabel, createLoadingAriaProps, createGestureHint } from '../../utils/accessibility';

/**
 * 풀 투 리프레시 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.children - 스크롤 가능한 콘텐츠
 * @param {Function} props.onRefresh - 새로고침 콜백 함수 (async 지원)
 * @param {string} props.className - 추가 CSS 클래스
 * @param {number} props.threshold - 새로고침 트리거 임계값 (기본: 80px)
 * @param {number} props.maxPullDistance - 최대 당김 거리 (기본: 120px)
 * @param {boolean} props.disabled - 비활성화 여부 (기본: false)
 * @param {Object} props.messages - 사용자 정의 메시지
 */
const PullToRefresh = ({
  children,
  onRefresh,
  className = '',
  threshold = 80,
  maxPullDistance = 120,
  disabled = false,
  messages = {
    pullToRefresh: '새로고침하려면 아래로 당겨주세요',
    releaseToRefresh: '놓으면 새로고침됩니다',
    refreshing: '새로고침 중...'
  }
}) => {
  const { ref, pullDistance, isRefreshing, isPulling, canRefresh } = usePullToRefresh({
    onRefresh,
    threshold,
    maxPullDistance,
    disabled
  });

  const getIndicatorMessage = () => {
    if (isRefreshing) return messages.refreshing;
    if (canRefresh) return messages.releaseToRefresh;
    return messages.pullToRefresh;
  };

  const getIndicatorIcon = () => {
    if (isRefreshing) {
      return <RefreshCw className="w-5 h-5 animate-spin text-green-500" />;
    }
    return (
      <ArrowDown 
        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
          canRefresh ? 'rotate-180 text-green-500' : ''
        }`} 
      />
    );
  };

  const loadingAriaProps = createLoadingAriaProps(isRefreshing, messages.refreshing, '새로고침 완료');

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      role="region"
      aria-label={createAriaLabel(
        "풀 투 리프레시 영역",
        createGestureHint('pullDown', '새로고침')
      )}
    >
      {/* 풀 투 리프레시 인디케이터 */}
      <div 
        className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300"
        style={{
          height: `${pullDistance}px`,
          transform: `translateY(-${Math.max(0, threshold - pullDistance)}px)`,
          opacity: isPulling || isRefreshing ? 1 : 0
        }}
        role="status"
        {...loadingAriaProps}
      >
        <div className="flex flex-col items-center space-y-2 px-4 py-2">
          {getIndicatorIcon()}
          <span className={`text-sm font-medium transition-colors duration-200 ${
            canRefresh ? 'text-green-600' : 'text-gray-600'
          }`}>
            {getIndicatorMessage()}
          </span>
        </div>
      </div>

      {/* 스크롤 가능한 콘텐츠 */}
      <div 
        ref={ref}
        className="h-full overflow-y-auto"
        style={{
          transform: `translateY(${isPulling || isRefreshing ? pullDistance : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
          paddingTop: isRefreshing ? `${threshold}px` : '0'
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 간단한 풀 투 리프레시 래퍼 (기존 스크롤 컨테이너용)
 */
export const SimplePullToRefresh = ({ 
  children, 
  onRefresh, 
  className = '',
  ...options 
}) => {
  return (
    <PullToRefresh 
      onRefresh={onRefresh}
      className={`h-full ${className}`}
      {...options}
    >
      {children}
    </PullToRefresh>
  );
};

/**
 * 리스트 전용 풀 투 리프레시 컴포넌트
 */
export const ListPullToRefresh = ({ 
  items = [], 
  renderItem, 
  onRefresh, 
  emptyMessage = '데이터가 없습니다.',
  className = '',
  ...options 
}) => {
  return (
    <PullToRefresh 
      onRefresh={onRefresh}
      className={className}
      {...options}
    >
      <div className="space-y-2 p-4">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index}>
              {renderItem(item, index)}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default PullToRefresh;