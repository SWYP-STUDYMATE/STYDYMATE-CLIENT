import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Users, 
  Calendar, 
  User,
  Bell,
  Video,
  BarChart3
} from 'lucide-react';
import NotificationBadge from './NotificationBadge';

const BottomNav = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'main',
      label: '홈',
      icon: Home,
      path: '/main'
    },
    {
      id: 'matching',
      label: '매칭',
      icon: Users,
      path: '/matching'
    },
    {
      id: 'chat',
      label: '채팅',
      icon: MessageSquare,
      path: '/chat'
    },
    {
      id: 'sessions',
      label: '세션',
      icon: Video,
      path: '/sessions'
    },
    {
      id: 'profile',
      label: '프로필',
      icon: User,
      path: '/profile'
    }
  ];

  const handleItemClick = (path) => {
    // Mock 모드 파라미터 유지
    const currentSearch = location.search;
    const mockParam = currentSearch.includes('mock=true') ? '?mock=true' : '';
    navigate(path + mockParam);
  };

  const isActiveItem = (path) => {
    return location.pathname.startsWith(path);
  };

  // 특정 페이지에서는 하단 내비게이션을 숨김
  const hideBottomNav = [
    '/login',
    '/signup',
    '/agreement',
    '/onboarding-info',
    '/signup-complete',
    '/'
  ].some(path => location.pathname === path || 
    (path === '/onboarding-info' && location.pathname.includes('/onboarding-info/')));

  if (hideBottomNav) {
    return null;
  }

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E7E7E7]
      lg:hidden
      ${className}
    `}>
      <div className="flex items-center justify-around py-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveItem(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.path)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 transition-colors ${
                isActive ? 'text-[#00C471]' : 'text-[#929292]'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6 mb-1" />
                
                {/* 채팅 알림 배지 (예시) */}
                {item.id === 'chat' && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold">2</span>
                  </div>
                )}
              </div>
              
              <span className={`text-[10px] font-medium truncate max-w-full ${
                isActive ? 'text-[#00C471]' : 'text-[#929292]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;