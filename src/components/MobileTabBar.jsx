import React from 'react';
import { Users, Home, MessageCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * MobileTabBar - 모바일 전용 하단 네비게이션 바
 * 스타일 가이드 준수:
 * - 색상: Green-500 (#00C471), Black-500 (#111111)
 * - 터치 영역: 최소 44px
 * - transition-colors duration-200
 */
export default function MobileTabBar({ active = 'home' }) {
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', icon: Home, label: '홈', path: '/main' },
    { id: 'users', icon: Users, label: '매칭', path: '/matching' },
    { id: 'chat', icon: MessageCircle, label: '채팅', path: '/chat' },
    { id: 'schedule', icon: Calendar, label: '스케줄', path: '/schedule' },
  ];

  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="bg-white border-t border-[#E7E7E7] h-16 w-full flex items-center justify-around px-4 safe-area-bottom">
      {tabs.map(({ id, icon: Icon, label, path }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => handleTabClick(path)}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors duration-200"
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={`w-6 h-6 mb-1 ${
                isActive ? 'text-[#00C471]' : 'text-[#929292]'
              }`}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={`text-xs font-medium ${
                isActive ? 'text-[#00C471]' : 'text-[#929292]'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
