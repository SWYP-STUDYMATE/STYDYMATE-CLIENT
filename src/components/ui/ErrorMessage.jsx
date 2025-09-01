import React from 'react';
import { AlertCircle, RefreshCw, Wifi, X } from 'lucide-react';

/**
 * 모바일 최적화된 에러 메시지 컴포넌트
 * 
 * @param {Object} props
 * @param {'error'|'warning'|'info'|'network'} props.type - 에러 타입
 * @param {string} props.title - 에러 제목
 * @param {string} props.message - 에러 메시지
 * @param {Function} props.onRetry - 재시도 함수
 * @param {Function} props.onDismiss - 닫기 함수
 * @param {boolean} props.showRetry - 재시도 버튼 표시
 * @param {boolean} props.dismissible - 닫기 가능 여부
 * @param {string} props.className - 추가 CSS 클래스
 * @param {boolean} props.compact - 컴팩트 모드
 */
const ErrorMessage = ({
  type = 'error',
  title,
  message,
  onRetry,
  onDismiss,
  showRetry = false,
  dismissible = false,
  className = '',
  compact = false
}) => {
  const getIconAndStyles = () => {
    switch (type) {
      case 'network':
        return {
          icon: <Wifi className="w-5 h-5" />,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-500',
          defaultTitle: '네트워크 연결 오류',
          defaultMessage: '인터넷 연결을 확인해주세요.'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-500',
          defaultTitle: '주의',
          defaultMessage: '작업을 계속하기 전에 확인해주세요.'
        };
      case 'info':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          defaultTitle: '정보',
          defaultMessage: '참고하실 정보가 있습니다.'
        };
      default: // error
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          defaultTitle: '오류 발생',
          defaultMessage: '문제가 발생했습니다. 다시 시도해주세요.'
        };
    }
  };

  const { icon, bgColor, borderColor, textColor, iconColor, defaultTitle, defaultMessage } = getIconAndStyles();

  const displayTitle = title || defaultTitle;
  const displayMessage = message || defaultMessage;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-3 ${bgColor} ${borderColor} border rounded-lg ${className}`}>
        <div className={iconColor}>
          {icon}
        </div>
        <span className={`${textColor} text-sm font-medium flex-1`}>
          {displayMessage}
        </span>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`${iconColor} hover:${iconColor.replace('500', '600')} transition-colors`}
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`${bgColor} ${borderColor} border rounded-lg p-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={`${iconColor} flex-shrink-0 mt-0.5`}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`${textColor} text-base font-semibold mb-1`}>
            {displayTitle}
          </h3>
          <p className={`${textColor} text-sm leading-relaxed`}>
            {displayMessage}
          </p>
          
          {(showRetry || dismissible) && (
            <div className="flex items-center gap-2 mt-3">
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className={`
                    inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium 
                    ${textColor} border ${borderColor} rounded-md 
                    hover:bg-opacity-10 hover:bg-current transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current
                  `}
                  aria-label="다시 시도"
                >
                  <RefreshCw className="w-4 h-4" />
                  다시 시도
                </button>
              )}
              
              {dismissible && onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`
                    inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium 
                    ${textColor} hover:bg-opacity-10 hover:bg-current transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current
                  `}
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                  닫기
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 토스트 에러 메시지 컴포넌트
 */
export const ErrorToast = ({ 
  type = 'error', 
  message, 
  onDismiss,
  duration = 5000,
  className = '' 
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div 
      className={`
        fixed top-4 left-4 right-4 z-50 
        transform transition-all duration-300 ease-in-out
        ${className}
      `}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
    >
      <ErrorMessage
        type={type}
        message={message}
        onDismiss={onDismiss}
        dismissible
        compact
      />
    </div>
  );
};

/**
 * 네트워크 오류 전용 컴포넌트
 */
export const NetworkError = ({ onRetry, className = '' }) => (
  <ErrorMessage
    type="network"
    title="인터넷 연결 확인"
    message="네트워크 연결이 불안정합니다. WiFi나 데이터 연결을 확인하고 다시 시도해주세요."
    onRetry={onRetry}
    showRetry
    className={className}
  />
);

/**
 * 빈 상태 컴포넌트 
 */
export const EmptyState = ({ 
  icon, 
  title, 
  message, 
  actionText, 
  onAction,
  className = '' 
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    {icon && (
      <div className="text-gray-400 mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    {message && (
      <p className="text-gray-500 mb-6 max-w-sm">
        {message}
      </p>
    )}
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-[#00C471] text-white rounded-lg font-medium hover:bg-[#00B267] transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export default ErrorMessage;