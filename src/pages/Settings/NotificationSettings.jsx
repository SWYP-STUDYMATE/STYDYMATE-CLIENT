import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Bell, Mail, MessageSquare, Video, Calendar, Award } from 'lucide-react';
import { getNotificationSettings, updateNotificationSettings } from '../../api/settings';
import CommonButton from '../../components/CommonButton';
import { useAlert } from '../../hooks/useAlert';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState({
    // 푸시 알림
    pushEnabled: true,
    pushChat: true,
    pushMatching: true,
    pushSession: true,
    pushLevelTest: true,
    pushAchievements: true,
    
    // 이메일 알림
    emailEnabled: true,
    emailWeeklySummary: true,
    emailSessionReminder: true,
    emailNewMatch: true,
    emailPromotions: false,
    
    // 소리 및 진동
    soundEnabled: true,
    vibrationEnabled: true,
    
    // 방해 금지 시간
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const data = await getNotificationSettings();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      // 실패해도 기본 설정으로 진행
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNotificationSettings(settings);
      showSuccess('알림 설정이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      showError('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleTimeChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange()}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-[#00C471]' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SettingItem = ({ icon: Icon, title, description, checked, onChange, disabled = false }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-[#929292]" />
        <div>
          <h3 className={`text-[#111111] font-medium ${disabled ? 'text-[#929292]' : ''}`}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-[#929292]">{description}</p>
          )}
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#929292] mt-2">로딩 중...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-[#111111]">알림 설정</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="space-y-6">
        {/* 푸시 알림 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">푸시 알림</h2>
            <Bell className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-1">
            <SettingItem
              icon={Bell}
              title="푸시 알림 활성화"
              description="모든 푸시 알림을 받습니다"
              checked={settings.pushEnabled}
              onChange={() => handleToggle('pushEnabled')}
            />
            
            <div className="border-t border-gray-100 pt-4">
              <SettingItem
                icon={MessageSquare}
                title="채팅 메시지"
                description="새로운 채팅 메시지 알림"
                checked={settings.pushChat}
                onChange={() => handleToggle('pushChat')}
                disabled={!settings.pushEnabled}
              />
              
              <SettingItem
                icon={Award}
                title="매칭 알림"
                description="새로운 매칭 파트너 알림"
                checked={settings.pushMatching}
                onChange={() => handleToggle('pushMatching')}
                disabled={!settings.pushEnabled}
              />
              
              <SettingItem
                icon={Video}
                title="세션 알림"
                description="예정된 세션 및 초대 알림"
                checked={settings.pushSession}
                onChange={() => handleToggle('pushSession')}
                disabled={!settings.pushEnabled}
              />
              
              <SettingItem
                icon={Award}
                title="레벨 테스트 및 성취"
                description="레벨 테스트 결과, 새로운 배지 알림"
                checked={settings.pushAchievements}
                onChange={() => handleToggle('pushAchievements')}
                disabled={!settings.pushEnabled}
              />
            </div>
          </div>
        </div>

        {/* 이메일 알림 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">이메일 알림</h2>
            <Mail className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-1">
            <SettingItem
              icon={Mail}
              title="이메일 알림 활성화"
              description="이메일로 알림을 받습니다"
              checked={settings.emailEnabled}
              onChange={() => handleToggle('emailEnabled')}
            />
            
            <div className="border-t border-gray-100 pt-4">
              <SettingItem
                icon={Calendar}
                title="주간 요약"
                description="주간 학습 활동 요약 이메일"
                checked={settings.emailWeeklySummary}
                onChange={() => handleToggle('emailWeeklySummary')}
                disabled={!settings.emailEnabled}
              />
              
              <SettingItem
                icon={Video}
                title="세션 리마인더"
                description="예정된 세션 1시간 전 알림"
                checked={settings.emailSessionReminder}
                onChange={() => handleToggle('emailSessionReminder')}
                disabled={!settings.emailEnabled}
              />
              
              <SettingItem
                icon={Award}
                title="새로운 매칭"
                description="새로운 매칭 파트너 이메일 알림"
                checked={settings.emailNewMatch}
                onChange={() => handleToggle('emailNewMatch')}
                disabled={!settings.emailEnabled}
              />
              
              <SettingItem
                icon={Mail}
                title="프로모션 및 이벤트"
                description="특별 이벤트 및 프로모션 정보"
                checked={settings.emailPromotions}
                onChange={() => handleToggle('emailPromotions')}
                disabled={!settings.emailEnabled}
              />
            </div>
          </div>
        </div>

        {/* 소리 및 진동 */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#111111] mb-4">소리 및 진동</h2>
          
          <div className="space-y-1">
            <SettingItem
              icon={Bell}
              title="알림 소리"
              description="알림 시 소리 재생"
              checked={settings.soundEnabled}
              onChange={() => handleToggle('soundEnabled')}
            />
            
            <SettingItem
              icon={Bell}
              title="진동"
              description="알림 시 진동 (모바일)"
              checked={settings.vibrationEnabled}
              onChange={() => handleToggle('vibrationEnabled')}
            />
          </div>
        </div>

        {/* 방해 금지 시간 */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#111111] mb-4">방해 금지 시간</h2>
          
          <div className="space-y-4">
            <SettingItem
              icon={Bell}
              title="방해 금지 시간 활성화"
              description="설정한 시간에는 알림을 받지 않습니다"
              checked={settings.quietHoursEnabled}
              onChange={() => handleToggle('quietHoursEnabled')}
            />
            
            {settings.quietHoursEnabled && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#111111]">시작 시간</span>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#111111]">종료 시간</span>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="pb-8">
          <CommonButton
            onClick={handleSave}
            disabled={saving}
            variant="success"
          >
            {saving ? '저장 중...' : '변경사항 저장'}
          </CommonButton>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;