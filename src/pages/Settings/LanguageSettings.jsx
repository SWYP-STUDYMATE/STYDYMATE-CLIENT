import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Globe, BookOpen, Volume2 } from 'lucide-react';
import { getLanguageSettings, updateLanguageSettings } from '../../api/settings';
import CommonButton from '../../components/CommonButton';
import { useAlert } from '../../hooks/useAlert';

const LanguageSettings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState({
    // 앱 언어
    appLanguage: 'ko',
    
    // 학습 언어 설정
    nativeLanguage: 'ko',
    targetLanguages: ['en'],
    
    // 번역 설정
    autoTranslate: true,
    showRomanization: false,
    translationService: 'google', // google, deepl, papago
    
    // 음성 설정
    speechLanguage: 'en-US',
    speechSpeed: 'normal', // slow, normal, fast
    voiceGender: 'female' // male, female
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];

  const translationServices = [
    { value: 'google', label: 'Google Translate' },
    { value: 'deepl', label: 'DeepL' },
    { value: 'papago', label: 'Papago' }
  ];

  const speechOptions = [
    { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
    { value: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
    { value: 'ko-KR', label: '한국어', flag: '🇰🇷' },
    { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
    { value: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳' }
  ];

  useEffect(() => {
    loadLanguageSettings();
  }, []);

  const loadLanguageSettings = async () => {
    try {
      setLoading(true);
      const data = await getLanguageSettings();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load language settings:', error);
      // 실패해도 기본 설정으로 진행
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateLanguageSettings(settings);
      showSuccess('언어 설정이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save language settings:', error);
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

  const handleTargetLanguageToggle = (langCode) => {
    setSettings(prev => ({
      ...prev,
      targetLanguages: prev.targetLanguages.includes(langCode)
        ? prev.targetLanguages.filter(l => l !== langCode)
        : [...prev.targetLanguages, langCode]
    }));
  };

  const getLanguageName = (code) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : code;
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
          <h1 className="text-xl font-bold text-[#111111]">언어 설정</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="space-y-6">
        {/* 앱 언어 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">앱 언어</h2>
            <Globe className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-3">인터페이스 언어</label>
            <div className="grid grid-cols-1 gap-2">
              {languages.slice(0, 4).map((lang) => (
                <label key={lang.code} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="appLanguage"
                    value={lang.code}
                    checked={settings.appLanguage === lang.code}
                    onChange={(e) => handleSelectChange('appLanguage', e.target.value)}
                    className="w-4 h-4 text-[#00C471] border-gray-300 focus:ring-[#00C471]"
                  />
                  <span className="ml-3 text-2xl">{lang.flag}</span>
                  <span className="ml-3 text-[#111111] font-medium">{lang.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 학습 언어 설정 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">학습 언어</h2>
            <BookOpen className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-6">
            {/* 모국어 */}
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-3">모국어</label>
              <select
                value={settings.nativeLanguage}
                onChange={(e) => handleSelectChange('nativeLanguage', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 학습 목표 언어 */}
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-3">
                학습 중인 언어 (복수 선택 가능)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {languages.filter(lang => lang.code !== settings.nativeLanguage).map((lang) => (
                  <label key={lang.code} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.targetLanguages.includes(lang.code)}
                      onChange={() => handleTargetLanguageToggle(lang.code)}
                      className="w-4 h-4 text-[#00C471] border-gray-300 rounded focus:ring-[#00C471]"
                    />
                    <span className="ml-3 text-2xl">{lang.flag}</span>
                    <span className="ml-3 text-[#111111] font-medium">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 번역 설정 */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#111111] mb-4">번역 설정</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#111111] font-medium">자동 번역</h3>
                <p className="text-sm text-[#929292]">채팅 시 자동으로 번역을 표시합니다</p>
              </div>
              <ToggleSwitch 
                checked={settings.autoTranslate} 
                onChange={() => handleToggle('autoTranslate')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#111111] font-medium">로마자 표기</h3>
                <p className="text-sm text-[#929292]">한자/한글 아래에 로마자를 표시합니다</p>
              </div>
              <ToggleSwitch 
                checked={settings.showRomanization} 
                onChange={() => handleToggle('showRomanization')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">번역 서비스</label>
              <select
                value={settings.translationService}
                onChange={(e) => handleSelectChange('translationService', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
              >
                {translationServices.map(service => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 음성 설정 */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111111]">음성 설정</h2>
            <Volume2 className="w-5 h-5 text-[#929292]" />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">음성 언어</label>
              <select
                value={settings.speechLanguage}
                onChange={(e) => handleSelectChange('speechLanguage', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00C471] focus:border-[#00C471] transition-colors"
              >
                {speechOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.flag} {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">음성 속도</label>
              <div className="flex space-x-4">
                {['slow', 'normal', 'fast'].map((speed) => (
                  <label key={speed} className="flex items-center">
                    <input
                      type="radio"
                      name="speechSpeed"
                      value={speed}
                      checked={settings.speechSpeed === speed}
                      onChange={(e) => handleSelectChange('speechSpeed', e.target.value)}
                      className="w-4 h-4 text-[#00C471] border-gray-300 focus:ring-[#00C471]"
                    />
                    <span className="ml-2 text-sm text-[#111111]">
                      {speed === 'slow' ? '느림' : speed === 'normal' ? '보통' : '빠름'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">음성 성별</label>
              <div className="flex space-x-4">
                {['female', 'male'].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="radio"
                      name="voiceGender"
                      value={gender}
                      checked={settings.voiceGender === gender}
                      onChange={(e) => handleSelectChange('voiceGender', e.target.value)}
                      className="w-4 h-4 text-[#00C471] border-gray-300 focus:ring-[#00C471]"
                    />
                    <span className="ml-2 text-sm text-[#111111]">
                      {gender === 'female' ? '여성' : '남성'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 언어 교환 현황 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3">현재 설정</h3>
          <div className="space-y-2 text-sm">
            <p className="text-blue-800">
              <span className="font-medium">모국어:</span> {getLanguageName(settings.nativeLanguage)}
            </p>
            <p className="text-blue-800">
              <span className="font-medium">학습 언어:</span>{' '}
              {settings.targetLanguages.map(lang => getLanguageName(lang)).join(', ')}
            </p>
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

export default LanguageSettings;