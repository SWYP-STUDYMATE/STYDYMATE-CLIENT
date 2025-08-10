import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    Home,
    MessageCircle,
    Users,
    Calendar,
    User,
    Menu,
    X,
    Globe,
    Target,
    LogOut,
    Settings
} from 'lucide-react';
import useProfileStore from '../store/profileStore';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { name, profileImage } = useProfileStore();

    const menuItems = [
        { path: '/dashboard', icon: Home, label: '홈' },
        { path: '/sessions', icon: Calendar, label: '세션' },
        { path: '/matching', icon: Users, label: '매칭' },
        { path: '/chat', icon: MessageCircle, label: '채팅' },
        { path: '/profile', icon: User, label: '프로필' },
    ];

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            // 로그아웃 로직
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen page-bg flex">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 bg-white border-r border-[var(--black-50)]">
                <div className="p-6">
                    {/* Logo */}
                    <div className="flex items-center space-x-2 mb-8">
                        <Globe className="w-8 h-8 text-[var(--green-500)]" />
                        <span className="text-[20px] font-bold text-[var(--black-500)]">STUDYMATE</span>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center space-x-3 mb-8 p-3 bg-[var(--neutral-200)] rounded-lg">
                        <img
                            src={profileImage || "/assets/basicProfilePic.png"}
                            alt={name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <p className="text-[14px] font-semibold text-[var(--black-500)]">{name || "사용자"}</p>
                            <p className="text-[12px] text-[var(--black-300)]">Level: Intermediate</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                  transition-colors duration-200 ${active
                                            ? 'bg-[var(--green-500)] text-white'
                                            : 'text-[var(--black-300)] hover:bg-[var(--neutral-100)]'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-[14px] font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Divider */}
                    <div className="my-6 border-t border-[var(--black-50)]" />

                    {/* Secondary Menu */}
                    <nav className="space-y-2">
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
              text-[var(--black-300)] hover:bg-[var(--neutral-100)] transition-colors duration-200"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="text-[14px] font-medium">설정</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
              text-[var(--black-300)] hover:bg-[var(--neutral-100)] transition-colors duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-[14px] font-medium">로그아웃</span>
                        </button>
                    </nav>

                    {/* Study Stats */}
                    <div className="mt-8 p-4 bg-[var(--neutral-200)] rounded-lg">
                        <p className="text-[12px] text-[var(--black-200)] mb-2">이번 주 학습</p>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-[24px] font-bold text-[var(--green-500)]">12</span>
                            <span className="text-[14px] text-[var(--black-300)]">시간</span>
                        </div>
                        <div className="mt-2">
                            <div className="h-2 bg-[var(--black-50)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--green-500)] rounded-full transition-all duration-300"
                                    style={{ width: '75%' }}
                                />
                            </div>
                            <p className="text-[12px] text-[var(--black-200)] mt-1">목표의 75% 달성</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`lg:hidden fixed inset-0 z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
                <div className="relative w-64 h-full bg-white">
                    <div className="p-6">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Same content as desktop sidebar */}
                        <div className="flex items-center space-x-2 mb-8">
                            <Globe className="w-8 h-8 text-[#00C471]" />
                            <span className="text-[20px] font-bold text-[#111111]">STUDYMATE</span>
                        </div>

                        <div className="flex items-center space-x-3 mb-8 p-3 bg-[#F8F9FA] rounded-lg">
                            <img
                                src={profileImage || "/assets/basicProfilePic.png"}
                                alt={name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <p className="text-[14px] font-semibold text-[#111111]">{name || "사용자"}</p>
                                <p className="text-[12px] text-[#606060]">Level: Intermediate</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                    transition-colors duration-200 ${active
                                                ? 'bg-[#00C471] text-white'
                                                : 'text-[#606060] hover:bg-[#F1F3F5]'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[14px] font-medium">{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-[var(--black-50)] px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="text-[18px] font-bold text-[var(--black-500)]">STUDYMATE</span>
                        <div className="w-10" />
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}