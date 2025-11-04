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
    <div className="min-h-screen bg-[#FAFAFA] px-4 sm:px-6 overflow-y-auto">
      {/* Header */}
      <div className="pt-8 sm:pt-10 md:pt-12 pb-4 sm:pb-5 md:pb-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-lg transition-colors touch-manipulation"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111] rotate-180" />
          </button>
          <h1 className="text-[18px] sm:text-[19px] md:text-xl font-bold text-[#111111] break-words">계정 설정</h1>
          <div className="w-8 sm:w-10" />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* 프로필 이미지 */}
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-[16px] sm:text-[17px] md:text-lg font-semibold text-[#111111] break-words">프로필 이미지</h2>
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-[#929292]" />
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
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-[16px] sm:text-[17px] md:text-lg font-semibold text-[#111111] break-words">기본 정보</h2>
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">영어 이름</label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.englishName}
                  onChange={(e) => handleInputChange('englishName', e.target.value)}
                  maxLength={50}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 transition-colors text-[13px] sm:text-[14px] md:text-sm touch-manipulation break-words ${
                    validationErrors.englishName 
                      ? 'border-[#EA4335] focus:ring-[#EA4335] focus:border-[#EA4335]'
                      : 'border-gray-200 focus:ring-[#00C471] focus:border-[#00C471]'
                  }`}
                  placeholder="예: John Smith"
                />
                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-[11px] sm:text-[12px] text-[#929292]">
                  {settings.englishName.length}/50
                </div>
              </div>
              {validationErrors.englishName && (
                <div className="flex items-center mt-1 text-[#EA4335] text-[11px] sm:text-[12px] break-words">
                  <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.englishName}
                </div>
              )}
              <div className="mt-1 text-[10px] sm:text-[11px] text-[#606060] break-words">
                영어 알파벳과 공백만 사용 가능 (2-50글자)
              </div>
            </div>

            <div>
              <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">거주지</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 sm:left-3 top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-[#929292]" />
                <input
                  type="text"
                  value={settings.residence}
                  onChange={(e) => handleInputChange('residence', e.target.value)}
                  className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors text-[13px] sm:text-[14px] md:text-sm touch-manipulation break-words"
                  placeholder="거주지를 입력하세요"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">자기소개</label>
              <textarea
                value={settings.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 transition-colors resize-none text-[13px] sm:text-[14px] md:text-sm touch-manipulation break-words ${
                  validationErrors.bio 
                    ? 'border-[#EA4335] focus:ring-[#EA4335] focus:border-[#EA4335]'
                    : 'border-gray-200 focus:ring-[#00C471] focus:border-[#00C471]'
                }`}
                rows="4"
                placeholder="간단한 자기소개를 작성해주세요"
                maxLength="500"
              />
              <div className="flex justify-between items-center mt-1">
                <div className="text-[10px] sm:text-[11px] text-[#606060] break-words">
                  학습 목표나 관심사를 포함하면 더 좋아요
                </div>
                <div className={`text-[11px] sm:text-[12px] font-medium break-words ${
                  settings.bio.length > 450 ? 'text-[#FFA500]' : 'text-[#929292]'
                }`}>
                  {settings.bio.length}/500
                </div>
              </div>
              {validationErrors.bio && (
                <div className="flex items-center mt-1 text-[#EA4335] text-[11px] sm:text-[12px] break-words">
                  <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.bio}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-[16px] sm:text-[17px] md:text-lg font-semibold text-[#111111] break-words">연락처</h2>
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">이메일</label>
              <div className="relative">
                <Mail className="absolute left-2.5 sm:left-3 top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-[#929292]" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 transition-colors text-[13px] sm:text-[14px] md:text-sm touch-manipulation break-words ${
                    validationErrors.email 
                      ? 'border-[#EA4335] focus:ring-[#EA4335] focus:border-[#EA4335]'
                      : 'border-gray-200 focus:ring-[#00C471] focus:border-[#00C471]'
                  }`}
                  placeholder="example@email.com"
                />
              </div>
              {validationErrors.email && (
                <div className="flex items-center mt-1 text-[#EA4335] text-[11px] sm:text-[12px] break-words">
                  <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">전화번호</label>
              <div className="relative">
                <Phone className="absolute left-2.5 sm:left-3 top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-[#929292]" />
                <input
                  type="tel"
                  value={settings.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 transition-colors text-[13px] sm:text-[14px] md:text-sm touch-manipulation break-words ${
                    validationErrors.phoneNumber 
                      ? 'border-[#EA4335] focus:ring-[#EA4335] focus:border-[#EA4335]'
                      : 'border-gray-200 focus:ring-[#00C471] focus:border-[#00C471]'
                  }`}
                  placeholder="010-1234-5678"
                />
              </div>
              {validationErrors.phoneNumber && (
                <div className="flex items-center mt-1 text-[#EA4335] text-[11px] sm:text-[12px] break-words">
                  <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.phoneNumber}
                </div>
              )}
              <div className="mt-1 text-[10px] sm:text-[11px] text-[#606060] break-words">
                선택사항입니다. 하이픈(-) 없이 입력 가능합니다.
              </div>
            </div>
          </div>
        </div>

        {/* 개인 정보 */}
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6">
          <h2 className="text-[16px] sm:text-[17px] md:text-lg font-semibold text-[#111111] mb-3 sm:mb-4 break-words">개인 정보</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">생년월일</label>
              <input
                type="date"
                value={settings.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors text-[13px] sm:text-[14px] md:text-sm touch-manipulation"
              />
            </div>

            <div>
              <label className="block text-[13px] sm:text-[14px] md:text-sm font-medium text-[#111111] mb-2 break-words">성별</label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {['male', 'female', 'other'].map((gender) => (
                  <label key={gender} className="flex items-center touch-manipulation">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={settings.gender === gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00C471] border-gray-300 focus:ring-[#00C471]"
                    />
                    <span className="ml-1.5 sm:ml-2 text-[12px] sm:text-[13px] md:text-sm text-[#111111] break-words">
                      {gender === 'male' ? '남성' : gender === 'female' ? '여성' : '기타'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="pb-6 sm:pb-8">
          <CommonButton
            onClick={handleSave}
            disabled={saving}
            variant="success"
            className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
          >
            {saving ? '저장 중...' : '변경사항 저장'}
          </CommonButton>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;