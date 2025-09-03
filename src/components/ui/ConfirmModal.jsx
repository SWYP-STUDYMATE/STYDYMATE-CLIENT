import React from 'react';
import { X, AlertCircle, CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import CommonButton from '../CommonButton';

// 확인/취소가 필요한 모달 (삭제, 중요한 액션 확인용)
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = '확인', 
  message, 
  type = 'confirm', // 'confirm', 'danger', 'warning'
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'primary' // 'primary', 'danger' 등
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
      case 'danger':
        return <XCircle {...iconProps} className="w-6 h-6 text-[#EA4335]" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-6 h-6 text-[#F59E0B]" />;
      default:
        return <HelpCircle {...iconProps} className="w-6 h-6 text-[#4285F4]" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'danger':
        return 'text-[#EA4335]';
      case 'warning':
        return 'text-[#F59E0B]';
      default:
        return 'text-[#4285F4]';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-20 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-[20px] w-full max-w-sm mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E7E7E7]">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className={`text-[18px] font-bold ${getHeaderColor()}`}>
              {title}
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

        {/* Footer Actions - 확인/취소 버튼 */}
        <div className="p-6 pt-0">
          <div className="flex space-x-3">
            <CommonButton
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              {cancelText}
            </CommonButton>
            <CommonButton
              onClick={handleConfirm}
              variant={confirmVariant}
              className="flex-1"
            >
              {confirmText}
            </CommonButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;