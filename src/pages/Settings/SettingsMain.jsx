import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Globe, Trash2, Key, Download, Clock, ChevronRight } from 'lucide-react';

const SettingsMain = () => {
  const navigate = useNavigate();

  const settingsItems = [
    {
      id: 'account',
      title: '계정 설정',
      description: '프로필, 개인 정보 관리',
      icon: User,
      color: 'text-blue-500',
      path: '/settings/account'
    },
    {
      id: 'notifications',
      title: '알림 설정',
      description: '푸시 알림, 이메일 알림 설정',
      icon: Bell,
      color: 'text-green-500',
      path: '/settings/notifications'
    },
    {
      id: 'privacy',
      title: '개인정보 보호',
      description: '프로필 공개 범위, 데이터 관리',
      icon: Shield,
      color: 'text-purple-500',
      path: '/settings/privacy'
    },
    {
      id: 'language',
      title: '언어 설정',
      description: '앱 언어, 학습 언어 설정',
      icon: Globe,
      color: 'text-orange-500',
      path: '/settings/language'
    },
    {
      id: 'security',
      title: '보안 설정',
      description: '비밀번호 변경, 2단계 인증',
      icon: Key,
      color: 'text-red-500',
      path: '/settings/security'
    },
    {
      id: 'data',
      title: '데이터 관리',
      description: '데이터 내보내기, 로그인 기록',
      icon: Download,
      color: 'text-indigo-500',
      path: '/settings/data'
    },
    {
      id: 'login-history',
      title: '로그인 기록',
      description: '최근 로그인 활동 확인',
      icon: Clock,
      color: 'text-gray-500',
      path: '/settings/login-history'
    }
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  const handleAccountDelete = () => {
    navigate('/settings/delete-account');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 sm:px-6">
      {/* Header */}
      <div className="pt-8 sm:pt-12 pb-4 sm:pb-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-lg transition-colors touch-manipulation"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111] rotate-180" />
          </button>
          <h1 className="text-[20px] sm:text-[24px] font-bold text-[#111111] break-words">설정</h1>
          <div className="w-8 sm:w-10" />
        </div>
      </div>

      {/* Settings Items */}
      <div className="space-y-1">
        {settingsItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.path)}
              className="w-full bg-white rounded-lg p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 transition-colors touch-manipulation"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-[14px] sm:text-[15px] md:text-base text-[#111111] font-medium break-words">{item.title}</h3>
                  <p className="text-[12px] sm:text-[13px] md:text-sm text-[#929292] break-words">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#929292]" />
            </button>
          );
        })}
      </div>

      {/* Danger Zone */}
      <div className="mt-6 sm:mt-8 mb-4 sm:mb-6">
        <h2 className="text-[16px] sm:text-[18px] font-semibold text-[#111111] mb-3 sm:mb-4 break-words">위험한 작업</h2>
        <button
          onClick={handleAccountDelete}
          className="w-full bg-white rounded-lg p-3 sm:p-4 flex items-center justify-between hover:bg-red-50 transition-colors border border-red-200 touch-manipulation"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <h3 className="text-[14px] sm:text-[15px] md:text-base text-red-600 font-medium break-words">계정 삭제</h3>
              <p className="text-[11px] sm:text-[12px] md:text-sm text-red-400 break-words">모든 데이터가 영구적으로 삭제됩니다</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
        </button>
      </div>

      {/* App Info */}
      <div className="text-center py-4 sm:py-6 border-t border-gray-200">
        <p className="text-[12px] sm:text-[13px] md:text-sm text-[#929292] break-words">STUDYMATE v1.0.0</p>
        <p className="text-[11px] sm:text-[12px] text-[#929292] mt-1 break-words">언어 교환 학습 플랫폼</p>
      </div>
    </div>
  );
};

export default SettingsMain;