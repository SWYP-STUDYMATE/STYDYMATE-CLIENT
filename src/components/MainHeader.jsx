import React from 'react';
import OptimizedImage from './OptimizedImage';

export default function MainHeader() {
  return (
    <div className="bg-white border-b border-[var(--black-50)] h-[81px] w-full flex items-center justify-between px-10">
      {/* 로고 */}
      <div className="w-16 h-14 flex items-center justify-center">
        <OptimizedImage
          src="/assets/image286.png"
          alt="Language MATES Logo"
          className="w-full h-full object-contain"
          width={64}
          height={56}
          loading="eager"
        />
      </div>

      {/* 알림 아이콘 */}
      <div className="w-10 h-10 flex items-center justify-center">
        <OptimizedImage
          src="/assets/Vector.png"
          alt="Notification Icon"
          className="w-6 h-6 cursor-pointer transition-colors"
          width={24}
          height={24}
          loading="lazy"
        />
      </div>
    </div>
  );
}
