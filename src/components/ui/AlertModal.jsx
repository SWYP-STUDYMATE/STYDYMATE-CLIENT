import React from 'react';
import { X, AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import CommonButton from '../CommonButton';

// 단순 알림용 모달 (확인 버튼만 있음)
const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'error', 'warning'
  confirmText = '확인'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    const iconProps = { className: "w-6 h-6" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-6 h-6 text-[#00C471]" />;
      case 'error':
        return <XCircle {...iconProps} className="w-6 h-6 text-[#EA4335]" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-6 h-6 text-[#F59E0B]" />;
      default:
        return <AlertCircle {...iconProps} className="w-6 h-6 text-[#4285F4]" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success':
        return 'text-[#00C471]';
      case 'error':
        return 'text-[#EA4335]';
      case 'warning':
        return 'text-[#F59E0B]';
      default:
        return 'text-[#4285F4]';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-[20px] w-full max-w-sm mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E7E7E7]">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className={`text-[18px] font-bold ${getHeaderColor()}`}>
              {title || '알림'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 -mr-1 hover:bg-[#F1F3F5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#929292]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[16px] text-[#606060] leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Footer Actions - 단순 확인 버튼만 */}
        <div className="p-6 pt-0">
          <CommonButton
            onClick={onClose}
            variant="primary"
            className="w-full"
          >
            {confirmText}
          </CommonButton>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;