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
    <div className="min-h-screen bg-[#FAFAFA] px-6">
      {/* Header */}
      <div className="pt-12 pb-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-[#111111] rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-[#111111]">설정</h1>
          <div className="w-10" />
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
              className="w-full bg-white rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-[#111111] font-medium">{item.title}</h3>
                  <p className="text-sm text-[#929292]">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#929292]" />
            </button>
          );
        })}
      </div>

      {/* Danger Zone */}
      <div className="mt-8 mb-6">
        <h2 className="text-lg font-semibold text-[#111111] mb-4">위험한 작업</h2>
        <button
          onClick={handleAccountDelete}
          className="w-full bg-white rounded-lg p-4 flex items-center justify-between hover:bg-red-50 transition-colors border border-red-200"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-left">
              <h3 className="text-red-600 font-medium">계정 삭제</h3>
              <p className="text-sm text-red-400">모든 데이터가 영구적으로 삭제됩니다</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-400" />
        </button>
      </div>

      {/* App Info */}
      <div className="text-center py-6 border-t border-gray-200">
        <p className="text-sm text-[#929292]">STUDYMATE v1.0.0</p>
        <p className="text-xs text-[#929292] mt-1">언어 교환 학습 플랫폼</p>
      </div>
    </div>
  );
};

export default SettingsMain;