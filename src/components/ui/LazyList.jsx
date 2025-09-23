import React, { useState, useCallback } from 'react';
import { useLazyList, useInfiniteScroll } from '../../hooks/useLazyLoading';
import { SkeletonLoader } from './LoadingSpinner';
import { createAriaLabel } from '../../utils/accessibility';

/**
 * 지연 로딩 리스트 컴포넌트
 * @param {Object} props
 * @param {Array} props.items - 리스트 아이템 배열
 * @param {Function} props.renderItem - 아이템 렌더링 함수
 * @param {number} props.initialCount - 초기 로딩 개수
 * @param {number} props.loadMoreCount - 추가 로딩 개수
 * @param {string} props.className - 추가 CSS 클래스
 * @param {string} props.itemClassName - 아이템 CSS 클래스
 * @param {string} props.emptyMessage - 빈 리스트 메시지
 * @param {boolean} props.showSkeleton - 스켈레톤 표시 여부
 */
const LazyList = ({
  items = [],
  renderItem,
  initialCount = 10,
  loadMoreCount = 5,
  className = '',
  itemClassName = '',
  emptyMessage = '표시할 항목이 없습니다.',
  showSkeleton = true
}) => {
  const {
    visibleItems,
    hasMore,
    isLoading,
    sentinelRef,
    loadMore
  } = useLazyList({
    items,
    initialCount,
    loadMoreCount
  });

  // 빈 리스트 처리
  if (items.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-4xl mb-4">📋</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div 
      className={className}
      role="list"
      aria-label={createAriaLabel(`리스트`, `${items.length}개 항목 중 ${visibleItems.length}개 표시됨`)}
    >
      {/* 리스트 아이템들 */}
      {visibleItems.map((item, index) => (
        <div
          key={item.id || index}
          className={`list-item ${itemClassName}`}
          role="listitem"
          aria-setsize={items.length}
          aria-posinset={index + 1}
        >
          {renderItem(item, index)}
        </div>
      ))}

      {/* 무한 스크롤 센티넬 */}
      {hasMore && (
        <div ref={sentinelRef} className="py-4">
          {isLoading && showSkeleton ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonLoader
                  key={index}
                  height="80px"
                  className="rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-4 py-2 text-green-600 hover:text-green-700 disabled:opacity-50"
                aria-label={`추가로 ${loadMoreCount}개 항목 로딩`}
              >
                {isLoading ? '로딩 중...' : '더 보기'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 스크린 리더용 정보 */}
      <div className="sr-only" aria-live="polite">
        {visibleItems.length}개 항목이 표시되었습니다.
        {hasMore && ` ${items.length - visibleItems.length}개 항목이 더 있습니다.`}
      </div>
    </div>
  );
};

/**
 * 무한 스크롤 리스트 컴포넌트
 */
export const InfiniteScrollList = ({
  items = [],
  renderItem,
  fetchNextPage,
  hasNextPage = false,
  isFetchingNextPage = false,
  className = '',
  itemClassName = '',
  emptyMessage = '표시할 항목이 없습니다.',
  loadingMessage = '추가 항목을 불러오는 중...',
  showSkeleton = true
}) => {
  const { sentinelRef } = useInfiniteScroll(fetchNextPage, {
    hasNextPage,
    isFetchingNextPage
  });

  if (items.length === 0 && !isFetchingNextPage) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-4xl mb-4">📋</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div 
      className={className}
      role="list"
      aria-label={createAriaLabel(`무한 스크롤 리스트`, `${items.length}개 항목`)}
    >
      {/* 리스트 아이템들 */}
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className={`list-item ${itemClassName}`}
          role="listitem"
          aria-setsize={-1} // 무한 리스트이므로 총 개수 알 수 없음
          aria-posinset={index + 1}
        >
          {renderItem(item, index)}
        </div>
      ))}

      {/* 로딩 센티넬 */}
      {hasNextPage && (
        <div ref={sentinelRef} className="py-4">
          {isFetchingNextPage ? (
            showSkeleton ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonLoader
                    key={index}
                    height="80px"
                    className="rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                {loadingMessage}
              </div>
            )
          ) : (
            <div className="text-center">
              <div className="text-green-600 text-sm">
                스크롤하여 더 많은 항목을 로드하세요
              </div>
            </div>
          )}
        </div>
      )}

      {/* 스크린 리더용 정보 */}
      <div className="sr-only" aria-live="polite">
        {items.length}개 항목이 표시되었습니다.
        {isFetchingNextPage && ' 추가 항목을 불러오는 중입니다.'}
        {!hasNextPage && items.length > 0 && ' 모든 항목을 표시했습니다.'}
      </div>
    </div>
  );
};

/**
 * 가상화된 리스트 컴포넌트 (대용량 데이터용)
 */
export const VirtualizedList = ({
  items = [],
  renderItem,
  itemHeight = 80,
  containerHeight = 400,
  overscan = 5,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // 화면에 표시될 아이템 계산
  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="list"
      aria-label={createAriaLabel(`가상화된 리스트`, `${items.length}개 항목`)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleStart + index;
            return (
              <div
                key={item.id || actualIndex}
                style={{ height: itemHeight }}
                className="list-item"
                role="listitem"
                aria-setsize={items.length}
                aria-posinset={actualIndex + 1}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 스크린 리더용 정보 */}
      <div className="sr-only" aria-live="polite">
        {items.length}개 항목 중 {visibleItems.length}개를 표시하고 있습니다.
        현재 {visibleStart + 1}번째부터 {visibleEnd}번째 항목입니다.
      </div>
    </div>
  );
};

export default LazyList;
