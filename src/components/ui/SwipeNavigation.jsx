import React, { useState, useCallback } from 'react';
import useSwipeGesture from '../../hooks/useSwipeGesture';
import useKeyboardNavigation from '../../hooks/useKeyboardNavigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createAriaLabel, createStateAnnouncement, createGestureHint, createKeyboardHint } from '../../utils/accessibility';

/**
 * 스와이프 네비게이션 컴포넌트
 * @param {Object} props
 * @param {Array} props.items - 네비게이션 아이템 배열
 * @param {number} props.initialIndex - 초기 인덱스
 * @param {Function} props.onIndexChange - 인덱스 변경 콜백
 * @param {boolean} props.showIndicators - 인디케이터 표시 여부
 * @param {boolean} props.showNavButtons - 네비게이션 버튼 표시 여부
 * @param {string} props.className - 추가 CSS 클래스
 */
const SwipeNavigation = ({
  items = [],
  initialIndex = 0,
  onIndexChange,
  showIndicators = true,
  showNavButtons = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nextIndex);
    onIndexChange?.(nextIndex);
  }, [currentIndex, items.length, onIndexChange]);

  const handlePrevious = useCallback(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    setCurrentIndex(prevIndex);
    onIndexChange?.(prevIndex);
  }, [currentIndex, items.length, onIndexChange]);

  const swipeRef = useSwipeGesture({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    minDistance: 50,
    maxTime: 300
  });

  const keyboardRef = useKeyboardNavigation({
    onArrowLeft: handlePrevious,
    onArrowRight: handleNext,
    preventDefault: true
  });

  const goToIndex = useCallback((index) => {
    setCurrentIndex(index);
    onIndexChange?.(index);
  }, [onIndexChange]);

  if (!items.length) return null;

  return (
    <div className={`relative w-full ${className}`}>
      {/* 메인 콘텐츠 영역 */}
      <div 
        ref={(node) => {
          swipeRef.current = node;
          keyboardRef.current = node;
        }}
        className="relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        role="region"
        tabIndex={0}
        aria-label={createAriaLabel(
          "스와이프 네비게이션",
          createGestureHint('swipeLeft', '다음 항목으로 이동') + ', ' + 
          createGestureHint('swipeRight', '이전 항목으로 이동') + ', ' +
          createKeyboardHint('← →', '네비게이션')
        )}
        aria-live="polite"
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div 
              key={index}
              className="w-full flex-shrink-0"
              role="tabpanel"
              aria-label={`${index + 1}번째 항목`}
            >
              {typeof item === 'function' ? item(index) : item}
            </div>
          ))}
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      {showNavButtons && items.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 
                     bg-white/80 backdrop-blur-sm rounded-full p-2 
                     shadow-lg border border-gray-200
                     hover:bg-white hover:shadow-xl
                     focus:outline-none focus:ring-2 focus:ring-green-500
                     min-w-[44px] min-h-[44px] flex items-center justify-center
                     transition-all duration-200"
            aria-label="이전 항목"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 
                     bg-white/80 backdrop-blur-sm rounded-full p-2 
                     shadow-lg border border-gray-200
                     hover:bg-white hover:shadow-xl
                     focus:outline-none focus:ring-2 focus:ring-green-500
                     min-w-[44px] min-h-[44px] flex items-center justify-center
                     transition-all duration-200"
            aria-label="다음 항목"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {showIndicators && items.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 
                         min-w-[32px] min-h-[32px] flex items-center justify-center
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         ${index === currentIndex 
                           ? 'bg-green-500 w-4' 
                           : 'bg-gray-300 hover:bg-gray-400'
                         }`}
              aria-label={`${index + 1}번째 항목으로 이동`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* 스크린 리더용 현재 위치 표시 */}
      <div className="sr-only" aria-live="polite">
        {createStateAnnouncement('스와이프 네비게이션 항목', '현재 위치', currentIndex + 1, items.length)}
      </div>
    </div>
  );
};

/**
 * 간단한 이미지 캐러셀 컴포넌트
 */
export const ImageCarousel = ({ 
  images = [], 
  className = '',
  showThumbnails = false 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageItems = images.map((image, index) => (
    <div key={index} className="relative aspect-video">
      <img
        src={image.src}
        alt={image.alt || `이미지 ${index + 1}`}
        className="w-full h-full object-cover rounded-lg"
        loading={index === 0 ? 'eager' : 'lazy'}
      />
      {image.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
          <p className="text-sm">{image.caption}</p>
        </div>
      )}
    </div>
  ));

  return (
    <div className={className}>
      <SwipeNavigation
        items={imageItems}
        initialIndex={0}
        onIndexChange={setCurrentIndex}
        showIndicators={!showThumbnails}
        showNavButtons={true}
      />
      
      {/* 썸네일 네비게이션 */}
      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden
                         min-w-[44px] min-h-[44px] transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         ${index === currentIndex 
                           ? 'border-green-500' 
                           : 'border-gray-200 hover:border-gray-300'
                         }`}
              aria-label={`${index + 1}번째 이미지로 이동`}
            >
              <img
                src={image.src}
                alt={image.alt || `썸네일 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 탭 스와이프 네비게이션 컴포넌트
 */
export const SwipeableTabs = ({ 
  tabs = [], 
  className = '',
  tabClassName = '',
  contentClassName = '' 
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabContent = tabs.map(tab => tab.content);

  return (
    <div className={className}>
      {/* 탭 헤더 */}
      <div className={`flex overflow-x-auto scrollbar-hide border-b border-gray-200 ${tabClassName}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap
                       min-w-[44px] min-h-[44px] transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-green-500
                       ${index === activeTab
                         ? 'text-green-600 border-b-2 border-green-500'
                         : 'text-gray-500 hover:text-gray-700'
                       }`}
            role="tab"
            aria-selected={index === activeTab}
            aria-controls={`tabpanel-${index}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className={contentClassName}>
        <SwipeNavigation
          items={tabContent}
          initialIndex={activeTab}
          onIndexChange={setActiveTab}
          showIndicators={false}
          showNavButtons={false}
        />
      </div>
    </div>
  );
};

export default SwipeNavigation;