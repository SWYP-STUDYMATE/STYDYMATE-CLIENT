import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Eye, Users, MapPin, Calendar, Lock } from 'lucide-react';
import { getPrivacySettings, updatePrivacySettings } from '../../api/settings';
import CommonButton from '../../components/CommonButton';
import { useAlert } from '../../hooks/useAlert';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState({
    // 프로필 공개 설정
    profileVisibility: 'public', // public, friends, private
    showAge: true,
    showLocation: true,
    showOnlineStatus: true,
    showLastSeen: false,
    
    // 매칭 설정
    allowMatching: true,
    matchingRadius: '50', // km
    showInSearch: true,
    
    // 연락처 설정
    allowDirectMessage: 'friends', // everyone, friends, none
    allowGroupInvite: 'friends',
    showEmail: false,
    showPhoneNumber: false,
    
    // 활동 설정
    showLearningStats: true,
    showAchievements: true,
    showSessionHistory: false,
    
    // 데이터 수집 동의
    allowAnalytics: true,
    allowPersonalization: true,
    allowMarketing: false,
    allowThirdPartySharing: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const data = await getPrivacySettings();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
      // 실패해도 기본 설정으로 진행
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePrivacySettings(settings);
      showSuccess('개인정보 설정이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
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

  const handleSelectChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-[#00C471]' : 'bg-gray-200'
      } cursor-pointer`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SettingItem = ({ icon: Icon, title, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-[#929292]" />
        <div>
          <h3 className="text-[#111111] font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-[#929292]">{description}</p>
          )}
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );

  const SelectSetting = ({ icon: Icon, title, description, value, options, onChange }) => (
    <div className="py-4">
      <div className="flex items-center space-x-3 mb-3">
        <Icon className="w-5 h-5 text-[#929292]" />
        <div>
          <h3 className="text-[#111111] font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-[#929292]">{description}</p>
          )}
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

  const privacyOptions = [
    { value: 'public', label: '모두에게 공개' },
    { value: 'friends', label: '친구에게만 공개' },
    { value: 'private', label: '비공개' }
  ];

  const contactOptions = [
    { value: 'everyone', label: '모든 사용자' },
    { value: 'friends', label: '친구만' },
    { value: 'none', label: '허용하지 않음' }
  ];

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
          <h1 className="text-xl font-bold text-[#111111]">개인정보 보호</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="space-y-6">
        {/* 프로필 공개 설정 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">프로필 공개 설정</h2>
            <Eye className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-1">
            <SelectSetting
              icon={Shield}
              title="프로필 공개 범위"
              description="다른 사용자가 프로필을 볼 수 있는 범위"
              value={settings.profileVisibility}
              options={privacyOptions}
              onChange={(value) => handleSelectChange('profileVisibility', value)}
            />
            
            <div className="border-t border-gray-100 pt-4">
              <SettingItem
                icon={Calendar}
                title="나이 공개"
                description="프로필에서 나이를 표시합니다"
                checked={settings.showAge}
                onChange={() => handleToggle('showAge')}
              />
              
              <SettingItem
                icon={MapPin}
                title="위치 정보 공개"
                description="거주지 정보를 표시합니다"
                checked={settings.showLocation}
                onChange={() => handleToggle('showLocation')}
              />
              
              <SettingItem
                icon={Users}
                title="온라인 상태 표시"
                description="현재 온라인 상태를 표시합니다"
                checked={settings.showOnlineStatus}
                onChange={() => handleToggle('showOnlineStatus')}
              />
              
              <SettingItem
                icon={Calendar}
                title="최근 접속 시간 표시"
                description="마지막 접속 시간을 표시합니다"
                checked={settings.showLastSeen}
                onChange={() => handleToggle('showLastSeen')}
              />
            </div>
          </div>
        </div>

        {/* 매칭 설정 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">매칭 설정</h2>
            <Users className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-4">
            <SettingItem
              icon={Users}
              title="매칭 허용"
              description="다른 사용자와의 매칭을 허용합니다"
              checked={settings.allowMatching}
              onChange={() => handleToggle('allowMatching')}
            />
            
            <SettingItem
              icon={Eye}
              title="검색 결과에 표시"
              description="매칭 검색 결과에 내 프로필이 표시됩니다"
              checked={settings.showInSearch}
              onChange={() => handleToggle('showInSearch')}
            />
            
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">매칭 거리 (km)</label>
              <select
                value={settings.matchingRadius}
                onChange={(e) => handleSelectChange('matchingRadius', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
              >
                <option value="10">10km</option>
                <option value="25">25km</option>
                <option value="50">50km</option>
                <option value="100">100km</option>
                <option value="unlimited">제한 없음</option>
              </select>
            </div>
          </div>
        </div>

        {/* 연락처 설정 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">연락처 설정</h2>
            <Lock className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-4">
            <SelectSetting
              icon={Users}
              title="직접 메시지 허용"
              description="누가 나에게 직접 메시지를 보낼 수 있는지 설정"
              value={settings.allowDirectMessage}
              options={contactOptions}
              onChange={(value) => handleSelectChange('allowDirectMessage', value)}
            />
            
            <SelectSetting
              icon={Users}
              title="그룹 초대 허용"
              description="누가 나를 그룹에 초대할 수 있는지 설정"
              value={settings.allowGroupInvite}
              options={contactOptions}
              onChange={(value) => handleSelectChange('allowGroupInvite', value)}
            />
            
            <div className="border-t border-gray-100 pt-4">
              <SettingItem
                icon={Lock}
                title="이메일 주소 공개"
                description="프로필에서 이메일을 표시합니다"
                checked={settings.showEmail}
                onChange={() => handleToggle('showEmail')}
              />
              
              <SettingItem
                icon={Lock}
                title="전화번호 공개"
                description="프로필에서 전화번호를 표시합니다"
                checked={settings.showPhoneNumber}
                onChange={() => handleToggle('showPhoneNumber')}
              />
            </div>
          </div>
        </div>

        {/* 활동 설정 */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#111111] mb-4">활동 정보 공개</h2>
          
          <div className="space-y-1">
            <SettingItem
              icon={Users}
              title="학습 통계 공개"
              description="학습 시간, 진도 등의 통계를 표시합니다"
              checked={settings.showLearningStats}
              onChange={() => handleToggle('showLearningStats')}
            />
            
            <SettingItem
              icon={Users}
              title="성취 배지 공개"
              description="획득한 배지와 성취를 표시합니다"
              checked={settings.showAchievements}
              onChange={() => handleToggle('showAchievements')}
            />
            
            <SettingItem
              icon={Calendar}
              title="세션 기록 공개"
              description="최근 세션 참여 기록을 표시합니다"
              checked={settings.showSessionHistory}
              onChange={() => handleToggle('showSessionHistory')}
            />
          </div>
        </div>

        {/* 데이터 수집 동의 */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#111111] mb-4">데이터 수집 동의</h2>
          
          <div className="space-y-1">
            <SettingItem
              icon={Shield}
              title="분석 데이터 수집"
              description="서비스 개선을 위한 익명 사용 데이터 수집"
              checked={settings.allowAnalytics}
              onChange={() => handleToggle('allowAnalytics')}
            />
            
            <SettingItem
              icon={Shield}
              title="개인화 데이터 수집"
              description="개인화된 추천을 위한 데이터 수집"
              checked={settings.allowPersonalization}
              onChange={() => handleToggle('allowPersonalization')}
            />
            
            <SettingItem
              icon={Shield}
              title="마케팅 활용 동의"
              description="마케팅 목적의 데이터 활용에 동의"
              checked={settings.allowMarketing}
              onChange={() => handleToggle('allowMarketing')}
            />
            
            <SettingItem
              icon={Shield}
              title="제3자 공유 동의"
              description="파트너사와의 데이터 공유에 동의"
              checked={settings.allowThirdPartySharing}
              onChange={() => handleToggle('allowThirdPartySharing')}
            />
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

export default PrivacySettings;