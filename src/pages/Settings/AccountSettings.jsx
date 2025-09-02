import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Camera, Mail, Phone, User, MapPin } from 'lucide-react';
import { getAccountSettings, updateAccountSettings } from '../../api/settings';
import { getUserProfile } from '../../api/user';
import CommonButton from '../../components/CommonButton';
import ProfileImageUpload from '../../components/ProfileImageUpload';
import { useAlert } from '../../hooks/useAlert.jsx';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState({
    email: '',
    phoneNumber: '',
    englishName: '',
    residence: '',
    profileImage: null,
    bio: '',
    birthDate: '',
    gender: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadAccountSettings();
  }, []);

  const loadAccountSettings = async () => {
    try {
      setLoading(true);
      
      // 프로필 정보와 계정 설정 정보를 모두 가져오기
      const [profileData, accountData] = await Promise.allSettled([
        getUserProfile(),
        getAccountSettings()
      ]);

      let combinedSettings = { ...settings };
      
      if (profileData.status === 'fulfilled') {
        combinedSettings = {
          ...combinedSettings,
          englishName: profileData.value.englishName || '',
          residence: profileData.value.residence || '',
          profileImage: profileData.value.profileImage || null,
          bio: profileData.value.bio || ''
        };
      }

      if (accountData.status === 'fulfilled') {
        combinedSettings = {
          ...combinedSettings,
          ...accountData.value
        };
      }

      setSettings(combinedSettings);
    } catch (error) {
      console.error('Failed to load account settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // 유효성 검사 함수
  const validateField = (field, value) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'englishName':
        if (value && !/^[a-zA-Z\s]*$/.test(value)) {
          errors[field] = '영어 알파벳과 공백만 입력 가능합니다';
        } else if (value && value.trim().length < 2) {
          errors[field] = '최소 2글자 이상 입력해주세요';
        } else if (value && value.length > 50) {
          errors[field] = '50글자를 초과할 수 없습니다';
        } else {
          delete errors[field];
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[field] = '올바른 이메일 형식을 입력해주세요';
        } else {
          delete errors[field];
        }
        break;
      case 'phoneNumber':
        if (value && !/^[\d-+\s()]*$/.test(value)) {
          errors[field] = '유효한 전화번호 형식을 입력해주세요';
        } else {
          delete errors[field];
        }
        break;
      case 'bio':
        if (value && value.length > 500) {
          errors[field] = '500글자를 초과할 수 없습니다';
        } else {
          delete errors[field];
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // 전체 유효성 검사
    const allValid = Object.keys(settings).every(field => 
      validateField(field, settings[field])
    );
    
    if (!allValid) {
      showError('입력 정보를 확인해주세요.');
      return;
    }
    
    try {
      setSaving(true);
      await updateAccountSettings(settings);
      showSuccess('계정 설정이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showError('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 실시간 유효성 검사
    validateField(field, value);
  };

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
          <h1 className="text-xl font-bold text-[#111111]">계정 설정</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="space-y-6">
        {/* 프로필 이미지 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">프로필 이미지</h2>
            <Camera className="w-5 h-5 text-[#929292]" />
          </div>
          <div className="flex justify-center">
            <ProfileImageUpload
              currentImage={settings.profileImage}
              onImageChange={(imageUrl) => handleInputChange('profileImage', imageUrl)}
              size="large"
            />
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">기본 정보</h2>
            <User className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">영어 이름</label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.englishName}
                  onChange={(e) => handleInputChange('englishName', e.target.value)}
                  maxLength={50}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                    validationErrors.englishName 
                      ? 'border-[#EA4335] focus:ring-[#EA4335] focus:border-[#EA4335]'
                      : 'border-gray-200 focus:ring-[#00C471] focus:border-[#00C471]'
                  }`}
                  placeholder="예: John Smith"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[12px] text-[#929292]">
                  {settings.englishName.length}/50
                </div>
              </div>
              {validationErrors.englishName && (
                <div className="flex items-center mt-1 text-[#EA4335] text-[12px]">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.englishName}
                </div>
              )}
              <div className="mt-1 text-[11px] text-[#606060]">
                영어 알파벳과 공백만 사용 가능 (2-50글자)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">거주지</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-[#929292]" />
                <input
                  type="text"
                  value={settings.residence}
                  onChange={(e) => handleInputChange('residence', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
                  placeholder="거주지를 입력하세요"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">자기소개</label>
              <textarea
                value={settings.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors resize-none ${
                  validationErrors.bio 
                    ? 'border-[#EA4335] focus:ring-[#EA4335] focus:border-[#EA4335]'
                    : 'border-gray-200 focus:ring-[#00C471] focus:border-[#00C471]'
                }`}
                rows="4"
                placeholder="간단한 자기소개를 작성해주세요"
                maxLength="500"
              />
              <div className="flex justify-between items-center mt-1">
                <div className="text-[11px] text-[#606060]">
                  학습 목표나 관심사를 포함하면 더 좋아요
                </div>
                <div className={`text-[12px] font-medium ${
                  settings.bio.length > 450 ? 'text-[#FFA500]' : 'text-[#929292]'
                }`}>
                  {settings.bio.length}/500
                </div>
              </div>
              {validationErrors.bio && (
                <div className="flex items-center mt-1 text-[#EA4335] text-[12px]">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.bio}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">연락처</h2>
            <Mail className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-[#929292]" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                    validationErrors.email 
                      ? 'border-[#EA4335] focus:ring-[#EA4335] focus:border-[#EA4335]'
                      : 'border-gray-200 focus:ring-[#00C471] focus:border-[#00C471]'
                  }`}
                  placeholder="example@email.com"
                />
              </div>
              {validationErrors.email && (
                <div className="flex items-center mt-1 text-[#EA4335] text-[12px]">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">전화번호</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-[#929292]" />
                <input
                  type="tel"
                  value={settings.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                    validationErrors.phoneNumber 
                      ? 'border-[#EA4335] focus:ring-[#EA4335] focus:border-[#EA4335]'
                      : 'border-gray-200 focus:ring-[#00C471] focus:border-[#00C471]'
                  }`}
                  placeholder="예: 010-1234-5678"
                />
              </div>
              {validationErrors.phoneNumber && (
                <div className="flex items-center mt-1 text-[#EA4335] text-[12px]">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.phoneNumber}
                </div>
              )}
              <div className="mt-1 text-[11px] text-[#606060]">
                숫자, 하이픈(-), 공백, 괄호(), 플러스(+) 기호 사용 가능
              </div>
            </div>
          </div>
        </div>

        {/* 개인 정보 */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#111111] mb-4">개인 정보</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">생년월일</label>
              <input
                type="date"
                value={settings.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">성별</label>
              <div className="flex space-x-4">
                {['male', 'female', 'other'].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={settings.gender === gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-4 h-4 text-[#00C471] border-gray-300 focus:ring-[#00C471]"
                    />
                    <span className="ml-2 text-sm text-[#111111]">
                      {gender === 'male' ? '남성' : gender === 'female' ? '여성' : '기타'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
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

export default AccountSettings;