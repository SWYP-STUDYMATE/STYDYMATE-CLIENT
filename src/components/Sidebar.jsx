import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  User, 
  Bell,
  Award,
  BookOpen,
  Video,
  LogOut
} from 'lucide-react';
import useProfileStore from '../store/profileStore';

const Sidebar = ({ isOpen, onClose, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profileImage, englishName } = useProfileStore();

  const menuItems = [
    {
      id: 'main',
      label: '홈',
      icon: Home,
      path: '/main',
      description: '메인 대시보드'
    },
    {
      id: 'chat',
      label: '채팅',
      icon: MessageSquare,
      path: '/chat',
      description: '실시간 채팅',
      badge: '2' // 임시 알림 배지
    },
    {
      id: 'matching',
      label: '매칭',
      icon: Users,
      path: '/matching',
      description: '파트너 찾기'
    },
    {
      id: 'mates',
      label: '메이트',
      icon: BookOpen,
      path: '/mates',
      description: '내 파트너들'
    },
    {
      id: 'sessions',
      label: '세션',
      icon: Video,
      path: '/sessions',
      description: '화상 세션'
    },
    {
      id: 'schedule',
      label: '스케줄',
      icon: Calendar,
      path: '/schedule',
      description: '일정 관리'
    },
    {
      id: 'analytics',
      label: '통계',
      icon: BarChart3,
      path: '/analytics',
      description: '학습 분석'
    },
    {
      id: 'achievements',
      label: '성취',
      icon: Award,
      path: '/achievements',
      description: '배지 & 성취'
    },
    {
      id: 'profile',
      label: '프로필',
      icon: User,
      path: '/profile',
      description: '내 프로필'
    }
  ];

  const settingsItems = [
    {
      id: 'notifications',
      label: '알림',
      icon: Bell,
      path: '/notifications',
      description: '알림 센터'
    },
    {
      id: 'settings',
      label: '설정',
      icon: Settings,
      path: '/settings',
      description: '계정 설정'
    }
  ];

  const handleItemClick = (path) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActiveItem = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto lg:shadow-none
        w-80 lg:w-72
        ${className}
      `}>
        {/* Profile Section */}
        <div className="p-6 border-b border-[#E7E7E7]">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#F1F3F5] overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#00C471] flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-semibold text-[#111111] truncate">
                {englishName || '사용자'}
              </h3>
              <p className="text-[12px] text-[#929292]">
                언어 학습자
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-2">
            {/* Main Menu */}
            <div className="mb-6">
              <h4 className="text-[12px] font-semibold text-[#929292] uppercase tracking-wider px-3 mb-3">
                메인 메뉴
              </h4>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveItem(item.path);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-[#00C471] text-white'
                        : 'text-[#666666] hover:bg-[#F1F3F5] hover:text-[#111111]'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-medium">{item.label}</span>
                      <p className={`text-[12px] truncate ${
                        isActive ? 'text-green-100' : 'text-[#929292]'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Settings Menu */}
            <div className="mb-6">
              <h4 className="text-[12px] font-semibold text-[#929292] uppercase tracking-wider px-3 mb-3">
                설정
              </h4>
              {settingsItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveItem(item.path);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-[#00C471] text-white'
                        : 'text-[#666666] hover:bg-[#F1F3F5] hover:text-[#111111]'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-medium">{item.label}</span>
                      <p className={`text-[12px] truncate ${
                        isActive ? 'text-green-100' : 'text-[#929292]'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#E7E7E7]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-[#666666] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[14px] font-medium">로그아웃</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;