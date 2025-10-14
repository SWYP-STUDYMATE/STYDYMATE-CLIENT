import React, { useState } from 'react';
import OptimizedImage from './OptimizedImage';
import NotificationTestPanel from './NotificationTestPanel';
import { Bell } from 'lucide-react';

export default function MainHeader() {
  const [showTestPanel, setShowTestPanel] = useState(false);

  return (
    <>
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

        {/* 우측 알림 및 테스트 버튼들 */}
        <div className="flex items-center space-x-4">
          {/* 개발 모드에서만 테스트 패널 버튼 표시 */}
          {import.meta.env.DEV && (
            <button
              onClick={() => setShowTestPanel(true)}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              알림 테스트
            </button>
          )}
          
          {/* 알림 아이콘 (임시) */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-[#111111]">
            <Bell className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 테스트 패널 */}
      {showTestPanel && (
        <NotificationTestPanel onClose={() => setShowTestPanel(false)} />
      )}
    </>
  );
}
