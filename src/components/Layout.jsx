import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { Menu, X } from 'lucide-react';
import { ToastManager } from './toast-manager.jsx';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  console.count('[Layout] render');

  // 사이드바를 숨길 페이지들
  const hideSidebarPages = [
    '/',
    '/login',
    '/signup',
    '/agreement',
    '/signup-complete'
  ];

  // 온보딩 페이지들도 포함
  const hideForOnboarding = location.pathname.includes('/onboarding-');
  const hideForLevelTest = location.pathname.includes('/level-test');
  const hideForSession = location.pathname.includes('/session/');

  const shouldHideSidebar = 
    hideSidebarPages.includes(location.pathname) || 
    hideForOnboarding || 
    hideForLevelTest ||
    hideForSession;

  // 라우트 변경 시 사이드바 닫기
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (shouldHideSidebar) {
    return (
      <>
        {children}
        <ToastManager />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar 
          isOpen={true} 
          onClose={() => {}} 
          className="relative"
        />
      </div>

      {/* Mobile Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        className="lg:hidden"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-[#E7E7E7] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[#666666] hover:text-[#111111] hover:bg-[#F1F3F5] rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h1 className="text-[18px] font-bold text-[#111111]">
            STUDYMATE
          </h1>
          
          <div className="w-10"></div> {/* Spacer for center alignment */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />

      {/* Toast Manager */}
      <ToastManager />
    </div>
  );
};

export default Layout;
