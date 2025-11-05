import React, { useState } from 'react';
import OptimizedImage from './OptimizedImage';
import NotificationTestPanel from './NotificationTestPanel';
import NotificationBadge from './NotificationBadge';

export default function MainHeader() {
  const [showTestPanel, setShowTestPanel] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-[#E7E7E7] h-16 sm:h-20 lg:h-[81px] w-full flex items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* 로고 */}
        <div className="w-12 h-10 sm:w-14 sm:h-12 lg:w-16 lg:h-14 flex items-center justify-center">
          <OptimizedImage
            src="/assets/image286.png"
            alt="Language MATES Logo"
            className="w-full h-full object-contain"
            width={64}
            height={56}
            loading="eager"
          />
        </div>

        {/* 우측 알림 및 테스트 버튼들 */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* 개발 모드에서만 테스트 패널 버튼 표시 */}
          {import.meta.env.DEV && (
            <button
              onClick={() => setShowTestPanel(true)}
              className="px-2 py-1 text-xs bg-[#4285F4] text-white rounded hover:bg-[#3367d6] transition-colors"
            >
              알림 테스트
            </button>
          )}

          {/* 알림 아이콘 */}
          <NotificationBadge size="md" />
        </div>
      </div>

      {/* 테스트 패널 */}
      {showTestPanel && (
        <NotificationTestPanel onClose={() => setShowTestPanel(false)} />
      )}
    </>
  );
}
