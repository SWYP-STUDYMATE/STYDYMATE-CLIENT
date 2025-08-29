import React, { useState } from 'react';
import { X, RotateCcw, ChevronDown, MapPin, Users, Globe, Calendar, Clock, Target } from 'lucide-react';
import CommonButton from './CommonButton';

const FilterPanel = ({ 
  filters = {}, 
  onFiltersChange, 
  onClose, 
  showLocation = true,
  showAge = true,
  showAvailability = true,
  showSessionPreferences = true
}) => {
  const [localFilters, setLocalFilters] = useState({
    targetLanguage: '',
    nativeLanguage: '',
    proficiencyLevel: '',
    location: '',
    minAge: '',
    maxAge: '',
    sessionType: '',
    availability: [],
    interests: [],
    learningGoals: [],
    ...filters
  });

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ko', label: '한국어' },
    { value: 'ja', label: '日本語' },
    { value: 'zh', label: '中文' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ru', label: 'Русский' }
  ];

  const proficiencyLevels = [
    { value: 'beginner', label: '초급 (A1-A2)' },
    { value: 'intermediate', label: '중급 (B1-B2)' },
    { value: 'advanced', label: '고급 (C1-C2)' },
    { value: 'native', label: '원어민' }
  ];

  const sessionTypes = [
    { value: '1on1', label: '1:1 대화' },
    { value: 'group', label: '그룹 대화' },
    { value: 'text_only', label: '텍스트만' },
    { value: 'voice_only', label: '음성만' },
    { value: 'video', label: '화상 통화' }
  ];

  const availabilityOptions = [
    { value: 'morning', label: '오전 (06:00-12:00)' },
    { value: 'afternoon', label: '오후 (12:00-18:00)' },
    { value: 'evening', label: '저녁 (18:00-24:00)' },
    { value: 'night', label: '새벽 (00:00-06:00)' },
    { value: 'weekdays', label: '평일' },
    { value: 'weekends', label: '주말' }
  ];

  const interestOptions = [
    '영화', '음악', '여행', '요리', '스포츠', '독서', 
    '게임', '예술', '기술', '비즈니스', '문화', '역사',
    '과학', '패션', '건강', '자연', '사진', '언어학습'
  ];

  const learningGoalOptions = [
    '일상 대화', '비즈니스', '여행', '시험 준비', '학업',
    '취업', '이민', '문화 이해', '발음 교정', '문법',
    '어휘 확장', '듣기 실력', '말하기 실력', '읽기 실력', '쓰기 실력'
  ];

  const locationOptions = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산',
    '세종', '경기도', '강원도', '충청북도', '충청남도',
    '전라북도', '전라남도', '경상북도', '경상남도', '제주도',
    '기타 국가'
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterChange = (key, value) => {
    setLocalFilters(prev => {
      const currentArray = prev[key] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      targetLanguage: '',
      nativeLanguage: '',
      proficiencyLevel: '',
      location: '',
      minAge: '',
      maxAge: '',
      sessionType: '',
      availability: [],
      interests: [],
      learningGoals: []
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const getFilterCount = () => {
    return Object.values(localFilters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== null && value !== undefined;
    }).length;
  };

  return (
    <div className="bg-white border-b border-[#E7E7E7] max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#E7E7E7] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-[#00C471]" />
            <h3 className="text-[16px] font-bold text-[#111111]">필터</h3>
            {getFilterCount() > 0 && (
              <span className="bg-[#00C471] text-white text-[12px] px-2 py-1 rounded-full">
                {getFilterCount()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetFilters}
              className="p-2 text-[#929292] hover:text-[#111111] hover:bg-[#F1F3F5] rounded-lg transition-colors"
              title="필터 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#929292] hover:text-[#111111] hover:bg-[#F1F3F5] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className="px-6 py-4 space-y-6">
        {/* Language Filters */}
        <div className="space-y-4">
          <h4 className="text-[14px] font-semibold text-[#111111] flex items-center">
            <Globe className="w-4 h-4 mr-2 text-[#00C471]" />
            언어
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#929292] mb-2">
                학습하고 싶은 언어
              </label>
              <select
                value={localFilters.targetLanguage}
                onChange={(e) => handleFilterChange('targetLanguage', e.target.value)}
                className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none text-[14px]"
              >
                <option value="">선택하세요</option>
                {languageOptions.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#929292] mb-2">
                도움을 줄 수 있는 언어
              </label>
              <select
                value={localFilters.nativeLanguage}
                onChange={(e) => handleFilterChange('nativeLanguage', e.target.value)}
                className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none text-[14px]"
              >
                <option value="">선택하세요</option>
                {languageOptions.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Proficiency Level */}
        <div>
          <h4 className="text-[14px] font-semibold text-[#111111] mb-3">실력 수준</h4>
          <select
            value={localFilters.proficiencyLevel}
            onChange={(e) => handleFilterChange('proficiencyLevel', e.target.value)}
            className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none text-[14px]"
          >
            <option value="">전체</option>
            {proficiencyLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        {showLocation && (
          <div>
            <h4 className="text-[14px] font-semibold text-[#111111] mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-[#00C471]" />
              지역
            </h4>
            <select
              value={localFilters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none text-[14px]"
            >
              <option value="">전체 지역</option>
              {locationOptions.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        )}

        {/* Age Filter */}
        {showAge && (
          <div>
            <h4 className="text-[14px] font-semibold text-[#111111] mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-[#00C471]" />
              연령대
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#929292] mb-2">
                  최소 연령
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={localFilters.minAge}
                  onChange={(e) => handleFilterChange('minAge', e.target.value)}
                  className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none text-[14px]"
                  placeholder="18"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#929292] mb-2">
                  최대 연령
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={localFilters.maxAge}
                  onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                  className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none text-[14px]"
                  placeholder="65"
                />
              </div>
            </div>
          </div>
        )}

        {/* Session Preferences */}
        {showSessionPreferences && (
          <div>
            <h4 className="text-[14px] font-semibold text-[#111111] mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2 text-[#00C471]" />
              세션 선호
            </h4>
            <select
              value={localFilters.sessionType}
              onChange={(e) => handleFilterChange('sessionType', e.target.value)}
              className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none text-[14px]"
            >
              <option value="">전체</option>
              {sessionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Availability */}
        {showAvailability && (
          <div>
            <h4 className="text-[14px] font-semibold text-[#111111] mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-[#00C471]" />
              가능한 시간
            </h4>
            <div className="space-y-2">
              {availabilityOptions.map(option => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.availability.includes(option.value)}
                    onChange={() => handleArrayFilterChange('availability', option.value)}
                    className="w-4 h-4 text-[#00C471] border-[#E7E7E7] rounded focus:ring-[#00C471] focus:ring-2"
                  />
                  <span className="text-[14px] text-[#111111]">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        <div>
          <h4 className="text-[14px] font-semibold text-[#111111] mb-3">관심사</h4>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map(interest => (
              <button
                key={interest}
                onClick={() => handleArrayFilterChange('interests', interest)}
                className={`px-3 py-2 text-[12px] font-medium rounded-lg border transition-colors ${
                  localFilters.interests.includes(interest)
                    ? 'bg-[#00C471] text-white border-[#00C471]'
                    : 'bg-white text-[#666666] border-[#E7E7E7] hover:border-[#00C471] hover:text-[#00C471]'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Goals */}
        <div>
          <h4 className="text-[14px] font-semibold text-[#111111] mb-3">학습 목표</h4>
          <div className="flex flex-wrap gap-2">
            {learningGoalOptions.map(goal => (
              <button
                key={goal}
                onClick={() => handleArrayFilterChange('learningGoals', goal)}
                className={`px-3 py-2 text-[12px] font-medium rounded-lg border transition-colors ${
                  localFilters.learningGoals.includes(goal)
                    ? 'bg-[#00C471] text-white border-[#00C471]'
                    : 'bg-white text-[#666666] border-[#E7E7E7] hover:border-[#00C471] hover:text-[#00C471]'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-[#E7E7E7] px-6 py-4">
        <div className="flex space-x-3">
          <CommonButton
            onClick={handleResetFilters}
            variant="secondary"
            className="flex-1"
          >
            초기화
          </CommonButton>
          <CommonButton
            onClick={handleApplyFilters}
            variant="primary"
            className="flex-1"
          >
            적용 ({getFilterCount()})
          </CommonButton>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;