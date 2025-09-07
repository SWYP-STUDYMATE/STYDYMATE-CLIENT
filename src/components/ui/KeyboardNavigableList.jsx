import React, { useState, useRef, useEffect } from 'react';
import { useFocusManagement } from '../../hooks/useKeyboardNavigation';
import { createListItemAriaProps, createKeyboardHint } from '../../utils/accessibility';

/**
 * 키보드 네비게이션 가능한 리스트 컴포넌트
 * @param {Object} props
 * @param {Array} props.items - 리스트 아이템 배열
 * @param {Function} props.renderItem - 아이템 렌더링 함수 (item, index, isActive) => ReactNode
 * @param {Function} props.onItemSelect - 아이템 선택 핸들러
 * @param {Function} props.onItemActivate - 아이템 활성화 핸들러 (Enter/Space)
 * @param {number} props.initialIndex - 초기 활성 인덱스
 * @param {boolean} props.loop - 순환 네비게이션 여부
 * @param {boolean} props.autoFocus - 자동 포커스 여부
 * @param {string} props.className - 추가 CSS 클래스
 * @param {string} props.itemClassName - 아이템 CSS 클래스
 */
const KeyboardNavigableList = ({
  items = [],
  renderItem,
  onItemSelect,
  onItemActivate,
  initialIndex = 0,
  loop = true,
  autoFocus = false,
  className = '',
  itemClassName = ''
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  // 아이템 ref 배열 초기화
  useEffect(() => {
    itemRefs.current = items.map((_, index) => itemRefs.current[index] || React.createRef());
  }, [items.length]);

  // 포커스 관리
  const {
    focusNext,
    focusPrevious,
    focusIndex,
    focusFirst,
    focusLast
  } = useFocusManagement({
    focusableElements: itemRefs.current,
    initialIndex,
    loop,
    autoFocus
  });

  // 키보드 이벤트 처리
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = loop 
          ? (activeIndex + 1) % items.length
          : Math.min(activeIndex + 1, items.length - 1);
        setActiveIndex(nextIndex);
        focusNext();
        onItemSelect?.(items[nextIndex], nextIndex);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = loop 
          ? (activeIndex - 1 + items.length) % items.length
          : Math.max(activeIndex - 1, 0);
        setActiveIndex(prevIndex);
        focusPrevious();
        onItemSelect?.(items[prevIndex], prevIndex);
        break;
        
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        focusFirst();
        onItemSelect?.(items[0], 0);
        break;
        
      case 'End':
        e.preventDefault();
        const lastIndex = items.length - 1;
        setActiveIndex(lastIndex);
        focusLast();
        onItemSelect?.(items[lastIndex], lastIndex);
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        onItemActivate?.(items[activeIndex], activeIndex);
        break;
    }
  };

  // 마우스 클릭 처리
  const handleItemClick = (item, index) => {
    setActiveIndex(index);
    focusIndex(index);
    onItemSelect?.(item, index);
    onItemActivate?.(item, index);
  };

  // 마우스 호버 처리
  const handleItemMouseEnter = (index) => {
    setActiveIndex(index);
  };

  if (!items.length) {
    return (
      <div 
        className={`text-center py-8 text-gray-500 ${className}`}
        role="status"
      >
        표시할 항목이 없습니다
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className={`focus:outline-none ${className}`}
      role="listbox"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`목록, ${createKeyboardHint('↑ ↓', '항목 이동')}, ${createKeyboardHint('Enter', '선택')}`}
      aria-activedescendant={`list-item-${activeIndex}`}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const listItemProps = createListItemAriaProps(index + 1, items.length);
        
        return (
          <div
            key={index}
            ref={itemRefs.current[index]}
            id={`list-item-${index}`}
            className={`cursor-pointer transition-colors duration-150 focus:outline-none ${
              isActive 
                ? 'bg-green-50 border-green-500 ring-2 ring-green-500 ring-opacity-50' 
                : 'hover:bg-gray-50'
            } ${itemClassName}`}
            tabIndex={-1}
            onClick={() => handleItemClick(item, index)}
            onMouseEnter={() => handleItemMouseEnter(index)}
            {...listItemProps}
            aria-selected={isActive}
          >
            {renderItem ? renderItem(item, index, isActive) : (
              <div className="p-3">
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </div>
            )}
          </div>
        );
      })}
      
      {/* 스크린 리더용 사용법 안내 */}
      <div className="sr-only" aria-live="polite">
        {items.length}개 항목 중 {activeIndex + 1}번째가 선택되었습니다. 
        위아래 화살표 키로 이동하고 Enter 키로 선택하세요.
      </div>
    </div>
  );
};

/**
 * 간단한 텍스트 리스트 컴포넌트
 */
export const SimpleTextList = ({ 
  items = [], 
  onItemSelect,
  className = '',
  ...props 
}) => {
  return (
    <KeyboardNavigableList
      items={items}
      renderItem={(item, index, isActive) => (
        <div className={`p-3 ${isActive ? 'font-medium' : ''}`}>
          {item}
        </div>
      )}
      onItemSelect={onItemSelect}
      className={className}
      {...props}
    />
  );
};

/**
 * 카드 스타일 리스트 컴포넌트
 */
export const CardList = ({ 
  items = [], 
  onItemSelect,
  renderCard,
  className = '',
  ...props 
}) => {
  return (
    <KeyboardNavigableList
      items={items}
      renderItem={(item, index, isActive) => (
        <div className={`p-4 m-2 rounded-lg border ${
          isActive 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}>
          {renderCard ? renderCard(item, index, isActive) : (
            <div className="text-sm text-gray-600">
              {typeof item === 'object' ? JSON.stringify(item) : item}
            </div>
          )}
        </div>
      )}
      onItemSelect={onItemSelect}
      className={className}
      itemClassName=""
      {...props}
    />
  );
};

export default KeyboardNavigableList;