import React, { forwardRef, useState } from 'react';
import { createInputAriaProps, createAriaLabel } from '../../utils/accessibility';

/**
 * 접근성이 향상된 입력 필드 컴포넌트
 * @param {Object} props
 * @param {string} props.label - 라벨 텍스트
 * @param {string} props.placeholder - 플레이스홀더
 * @param {string} props.type - 입력 타입
 * @param {string} props.value - 입력 값
 * @param {Function} props.onChange - 변경 이벤트 핸들러
 * @param {boolean} props.required - 필수 입력 여부
 * @param {boolean} props.disabled - 비활성화 상태
 * @param {string} props.error - 에러 메시지
 * @param {string} props.helpText - 도움말 텍스트
 * @param {string} props.ariaLabel - 접근성 레이블
 * @param {string} props.className - 추가 CSS 클래스
 */
const AccessibleInput = forwardRef(({
  label,
  placeholder = '',
  type = 'text',
  value = '',
  onChange,
  required = false,
  disabled = false,
  error = '',
  helpText = '',
  ariaLabel = '',
  className = '',
  id,
  ...props
}, ref) => {
  const [inputId] = useState(id || `input-${Math.random().toString(36).substr(2, 9)}`);
  const [helpId] = useState(`${inputId}-help`);
  const [errorId] = useState(`${inputId}-error`);

  // 입력 필드 스타일 클래스 생성
  const getInputClasses = () => {
    const baseClasses = 'w-full px-4 py-3 text-base border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[44px]';
    
    if (error) {
      return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50`;
    }
    
    if (disabled) {
      return `${baseClasses} border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed`;
    }
    
    return `${baseClasses} border-gray-300 focus:border-green-500 focus:ring-green-500 ${className}`;
  };

  // 라벨 스타일 클래스 생성
  const getLabelClasses = () => {
    const baseClasses = 'block text-sm font-medium mb-2';
    
    if (error) {
      return `${baseClasses} text-red-700`;
    }
    
    if (disabled) {
      return `${baseClasses} text-gray-500`;
    }
    
    return `${baseClasses} text-gray-700`;
  };

  // 접근성 속성 생성
  const describedByIds = [];
  if (helpText) describedByIds.push(helpId);
  if (error) describedByIds.push(errorId);
  
  const ariaProps = createInputAriaProps(
    describedByIds.join(' '),
    required,
    !!error,
    error
  );

  const fullAriaLabel = createAriaLabel(
    ariaLabel || label || placeholder,
    required ? '필수 입력' : ''
  );

  return (
    <div className="w-full">
      {/* 라벨 */}
      {label && (
        <label 
          htmlFor={inputId}
          className={getLabelClasses()}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="필수 입력">
              *
            </span>
          )}
        </label>
      )}

      {/* 입력 필드 */}
      <input
        ref={ref}
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={getInputClasses()}
        aria-label={fullAriaLabel}
        {...ariaProps}
        {...props}
      />

      {/* 도움말 텍스트 */}
      {helpText && !error && (
        <p 
          id={helpId}
          className="mt-2 text-sm text-gray-600"
          role="note"
        >
          {helpText}
        </p>
      )}

      {/* 에러 메시지 */}
      {error && (
        <p 
          id={errorId}
          className="mt-2 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {/* 스크린 리더용 추가 정보 */}
      <div className="sr-only">
        {type === 'password' && '비밀번호 입력 필드'}
        {type === 'email' && '이메일 주소 입력 필드'}
        {type === 'tel' && '전화번호 입력 필드'}
        {required && '이 필드는 필수 입력입니다'}
        {disabled && '이 필드는 비활성화되어 있습니다'}
      </div>
    </div>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

/**
 * 접근성이 향상된 텍스트 영역 컴포넌트
 */
export const AccessibleTextarea = forwardRef(({
  label,
  placeholder = '',
  value = '',
  onChange,
  required = false,
  disabled = false,
  error = '',
  helpText = '',
  ariaLabel = '',
  rows = 4,
  className = '',
  id,
  ...props
}, ref) => {
  const [textareaId] = useState(id || `textarea-${Math.random().toString(36).substr(2, 9)}`);
  const [helpId] = useState(`${textareaId}-help`);
  const [errorId] = useState(`${textareaId}-error`);

  const getTextareaClasses = () => {
    const baseClasses = 'w-full px-4 py-3 text-base border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 resize-vertical';
    
    if (error) {
      return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50`;
    }
    
    if (disabled) {
      return `${baseClasses} border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed`;
    }
    
    return `${baseClasses} border-gray-300 focus:border-green-500 focus:ring-green-500 ${className}`;
  };

  const describedByIds = [];
  if (helpText) describedByIds.push(helpId);
  if (error) describedByIds.push(errorId);
  
  const ariaProps = createInputAriaProps(
    describedByIds.join(' '),
    required,
    !!error,
    error
  );

  const fullAriaLabel = createAriaLabel(
    ariaLabel || label || placeholder,
    required ? '필수 입력' : ''
  );

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId}
          className={`block text-sm font-medium mb-2 ${
            error ? 'text-red-700' : disabled ? 'text-gray-500' : 'text-gray-700'
          }`}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="필수 입력">
              *
            </span>
          )}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={getTextareaClasses()}
        aria-label={fullAriaLabel}
        {...ariaProps}
        {...props}
      />

      {helpText && !error && (
        <p 
          id={helpId}
          className="mt-2 text-sm text-gray-600"
          role="note"
        >
          {helpText}
        </p>
      )}

      {error && (
        <p 
          id={errorId}
          className="mt-2 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
});

AccessibleTextarea.displayName = 'AccessibleTextarea';

export default AccessibleInput;