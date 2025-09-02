import React, { useState } from 'react';
import { X, Users, Globe, Lock, MessageCircle, Plus } from 'lucide-react';
import CommonButton from '../CommonButton';
import { createChatRoom } from '../../api/chat';

const CreateChatRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const [formData, setFormData] = useState({
    roomName: '',
    roomType: 'GROUP',
    isPublic: true,
    maxParticipants: 4,
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.roomName.trim()) {
      alert('채팅방 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      const newRoom = await createChatRoom({
        roomName: formData.roomName.trim(),
        roomType: formData.roomType,
        isPublic: formData.isPublic,
        maxParticipants: formData.maxParticipants,
        description: formData.description.trim(),
        participantIds: []
      });

      // 폼 초기화
      setFormData({
        roomName: '',
        roomType: 'GROUP',
        isPublic: true,
        maxParticipants: 4,
        description: ''
      });

      onRoomCreated(newRoom);
      onClose();
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-[20px] w-full max-w-md p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#00C471] bg-opacity-10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#00C471]" />
              </div>
              <h2 
                id="modal-title"
                className="text-[20px] font-bold text-[#111111]"
              >
                새 채팅방 만들기
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F1F3F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2"
              disabled={isLoading}
              aria-label="모달 닫기"
              type="button"
            >
              <X className="w-5 h-5 text-[#929292]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Room Name */}
            <div>
              <label className="block text-[14px] font-medium text-[#111111] mb-2">
                채팅방 이름 *
              </label>
              <input
                type="text"
                value={formData.roomName}
                onChange={(e) => handleInputChange('roomName', e.target.value)}
                placeholder="채팅방 이름을 입력하세요"
                className="w-full h-[56px] px-4 bg-[#FAFAFA] border border-[#CED4DA] rounded-[6px] text-[16px] text-[#111111] placeholder-[#929292] focus:outline-none focus:border-[#111111] transition-colors"
                maxLength={50}
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[14px] font-medium text-[#111111] mb-2">
                설명 (선택)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="채팅방에 대한 간단한 설명을 입력하세요"
                className="w-full h-[80px] px-4 py-3 bg-[#FAFAFA] border border-[#CED4DA] rounded-[6px] text-[16px] text-[#111111] placeholder-[#929292] focus:outline-none focus:border-[#111111] transition-colors resize-none"
                maxLength={200}
                disabled={isLoading}
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-[14px] font-medium text-[#111111] mb-2">
                채팅방 유형
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('roomType', 'GROUP')}
                  className={`flex items-center justify-center space-x-2 h-[48px] px-4 rounded-[6px] border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 ${
                    formData.roomType === 'GROUP'
                      ? 'border-[#00C471] bg-[#00C471] bg-opacity-5 text-[#00C471]'
                      : 'border-[#E7E7E7] text-[#606060] hover:border-[#CED4DA]'
                  }`}
                  disabled={isLoading}
                  aria-pressed={formData.roomType === 'GROUP'}
                  aria-label="그룹 채팅 유형 선택"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-[14px] font-medium">그룹 채팅</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('roomType', 'DIRECT')}
                  className={`flex items-center justify-center space-x-2 h-[48px] px-4 rounded-[6px] border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 ${
                    formData.roomType === 'DIRECT'
                      ? 'border-[#00C471] bg-[#00C471] bg-opacity-5 text-[#00C471]'
                      : 'border-[#E7E7E7] text-[#606060] hover:border-[#CED4DA]'
                  }`}
                  disabled={isLoading}
                  aria-pressed={formData.roomType === 'DIRECT'}
                  aria-label="1:1 채팅 유형 선택"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-[14px] font-medium">1:1 채팅</span>
                </button>
              </div>
            </div>

            {/* Privacy & Max Participants */}
            {formData.roomType === 'GROUP' && (
              <>
                {/* Privacy Setting */}
                <div>
                  <label className="block text-[14px] font-medium text-[#111111] mb-2">
                    공개 설정
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('isPublic', true)}
                      className={`flex items-center justify-center space-x-2 h-[48px] px-4 rounded-[6px] border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 ${
                        formData.isPublic
                          ? 'border-[#00C471] bg-[#00C471] bg-opacity-5 text-[#00C471]'
                          : 'border-[#E7E7E7] text-[#606060] hover:border-[#CED4DA]'
                      }`}
                      disabled={isLoading}
                      aria-pressed={formData.isPublic}
                      aria-label="공개 채팅방 선택"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-[14px] font-medium">공개</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleInputChange('isPublic', false)}
                      className={`flex items-center justify-center space-x-2 h-[48px] px-4 rounded-[6px] border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 ${
                        !formData.isPublic
                          ? 'border-[#00C471] bg-[#00C471] bg-opacity-5 text-[#00C471]'
                          : 'border-[#E7E7E7] text-[#606060] hover:border-[#CED4DA]'
                      }`}
                      disabled={isLoading}
                      aria-pressed={!formData.isPublic}
                      aria-label="비공개 채팅방 선택"
                    >
                      <Lock className="w-4 h-4" />
                      <span className="text-[14px] font-medium">비공개</span>
                    </button>
                  </div>
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-[14px] font-medium text-[#111111] mb-2">
                    최대 참여자 수
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 4, 6, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleInputChange('maxParticipants', num)}
                        className={`h-[40px] rounded-[6px] border-2 text-[14px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 ${
                          formData.maxParticipants === num
                            ? 'border-[#00C471] bg-[#00C471] bg-opacity-5 text-[#00C471]'
                            : 'border-[#E7E7E7] text-[#606060] hover:border-[#CED4DA]'
                        }`}
                        disabled={isLoading}
                        aria-pressed={formData.maxParticipants === num}
                        aria-label={`최대 ${num}명 참여자 선택`}
                      >
                        {num}명
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <CommonButton
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                취소
              </CommonButton>
              
              <CommonButton
                type="submit"
                variant="success"
                className="flex-1"
                disabled={isLoading || !formData.roomName.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    생성 중...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-1" />
                    채팅방 만들기
                  </div>
                )}
              </CommonButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateChatRoomModal;