import React from 'react';

const TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name}님이 입력 중입니다...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name}님과 ${typingUsers[1].name}님이 입력 중입니다...`;
    } else {
      return `${typingUsers[0].name}님 외 ${typingUsers.length - 1}명이 입력 중입니다...`;
    }
  };

  return (
    <div className="flex items-center px-4 py-2 mb-2">
      <div className="flex items-center">
        {/* 첫 번째 사용자 프로필 이미지 */}
        <img
          src={typingUsers[0].profileImage || "/assets/basicProfilePic.png"}
          alt={typingUsers[0].name}
          className="w-6 h-6 rounded-full mr-2"
        />
        
        {/* 타이핑 텍스트 */}
        <span className="text-sm text-gray-600">
          {getTypingText()}
        </span>
        
        {/* 애니메이션 점들 */}
        <div className="flex ml-2 space-x-1">
          <div 
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;