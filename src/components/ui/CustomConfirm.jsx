import React from 'react';
import { X } from 'lucide-react';

/**
 * 커스텀 확인 팝업 컴포넌트
 */
const CustomConfirm = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "확인",
  message, 
  confirmText = "확인", 
  cancelText = "취소",
  type = "default" // default, warning, success
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning': return 'text-amber-500';
      case 'success': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return '❓';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-0"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0)', // 완전 투명 배경
        backdropFilter: 'none'
      }}
    >
      {/* 모달 컨텐츠 */}
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[320px] mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getIcon()}</span>
            <h3 className="text-[18px] font-bold text-[#111111]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#929292]" />
          </button>
        </div>
        
        {/* 메시지 */}
        <div className="px-6 pb-6">
          <p className="text-[16px] text-[#606060] leading-[24px]">
            {message}
          </p>
        </div>
        
        {/* 버튼들 */}
        <div className="flex space-x-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-[#F8F9FA] text-[#606060] text-[16px] font-medium rounded-[10px] hover:bg-[#E9ECEF] transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-[#00C471] text-white text-[16px] font-bold rounded-[10px] hover:bg-[#00B267] transition-colors duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomConfirm;