import React, { forwardRef } from 'react';
import { createButtonAriaProps, createAriaLabel } from '../../utils/accessibility';

/**
 * 접근성이 향상된 버튼 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.children - 버튼 내용
 * @param {string} props.variant - 버튼 스타일 변형
 * @param {string} props.size - 버튼 크기
 * @param {boolean} props.disabled - 비활성화 상태
 * @param {boolean} props.loading - 로딩 상태
 * @param {boolean} props.pressed - 눌린 상태 (토글 버튼)
 * @param {boolean} props.expanded - 확장 상태 (드롭다운 버튼)
 * @param {string} props.ariaLabel - 접근성 레이블
 * @param {string} props.ariaDescription - 접근성 설명
 * @param {string} props.keyboardShortcut - 키보드 단축키
 * @param {Function} props.onClick - 클릭 이벤트 핸들러
 * @param {string} props.className - 추가 CSS 클래스
 */
const AccessibleButton = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  pressed = null,
  expanded = null,
  ariaLabel = '',
  ariaDescription = '',
  keyboardShortcut = '',
  onClick,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  // 버튼 스타일 클래스 생성
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      small: 'px-3 py-2 text-sm min-h-[36px] min-w-[36px]',
      medium: 'px-4 py-3 text-base min-h-[44px] min-w-[44px]',
      large: 'px-6 py-4 text-lg min-h-[52px] min-w-[52px]'
    };
    
    const variantClasses = {
      primary: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-green-500 text-green-500 hover:bg-green-50 focus:ring-green-500',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
    };
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  // 접근성 속성 생성
  const ariaProps = createButtonAriaProps(disabled || loading, pressed, expanded);
  
  // 완전한 접근성 레이블 생성
  const fullAriaLabel = createAriaLabel(
    ariaLabel || (typeof children === 'string' ? children : '버튼'),
    ariaDescription
  );

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e) => {
    // Enter 또는 Space 키로 버튼 활성화
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && !loading && onClick) {
        onClick(e);
      }
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      className={getButtonClasses()}
      disabled={disabled || loading}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={fullAriaLabel}
      aria-busy={loading}
      title={keyboardShortcut ? `단축키: ${keyboardShortcut}` : undefined}
      {...ariaProps}
      {...props}
    >
      {loading && (
        <div className="mr-2 animate-spin">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
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
      )}
      {children}
      
      {/* 스크린 리더용 상태 정보 */}
      {(pressed !== null || expanded !== null) && (
        <span className="sr-only">
          {pressed !== null && (pressed ? '선택됨' : '선택 안됨')}
          {expanded !== null && (expanded ? '펼쳐짐' : '접힘')}
        </span>
      )}
      
      {/* 키보드 단축키 힌트 */}
      {keyboardShortcut && (
        <span className="sr-only">
          , {keyboardShortcut} 키를 눌러 실행할 수 있습니다
        </span>
      )}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;