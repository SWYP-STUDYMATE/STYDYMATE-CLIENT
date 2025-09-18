import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, MapPin, Globe, Users, AlertTriangle } from 'lucide-react';
import { ProfileCardCompact } from './ProfileCard';
import useMatchingStore from '../store/matchingStore';

export default function ProfileSearch({ onProfileSelect, className = '' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    language: 'all',
    level: 'all',
    location: '',
    onlineOnly: false
  });
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [error, setError] = useState(null);

  // 디바운싱된 검색
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchPartners = useMatchingStore((state) => state.searchPartners);
  
  const buildSearchFilters = useCallback((filterOptions) => {
    const payload = {};

    if (filterOptions.language !== 'all') {
      payload.targetLanguage = filterOptions.language;
    }

    if (filterOptions.level !== 'all') {
      payload.proficiencyLevel = filterOptions.level;
    }

    if (filterOptions.location.trim()) {
      payload.location = filterOptions.location.trim();
    }

    return payload;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 프로필 검색 API 호출
  const searchProfiles = useCallback(async (query, filterOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const normalizedFilters = buildSearchFilters(filterOptions);
      const partners = await searchPartners(query.trim(), normalizedFilters);

      const filteredPartners = filterOptions.onlineOnly
        ? partners.filter((partner) => partner.isOnline)
        : partners;

      const normalizedResults = filteredPartners.map((partner) => ({
        ...partner,
        englishName: partner.englishName || partner.name,
        residence: partner.location ?? partner.residence ?? '',
      }));

      setResults(normalizedResults);
    } catch (error) {
      console.error('Profile search error:', error);
      setResults([]);
      setError('프로필을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [buildSearchFilters, searchPartners]);

  // 검색 실행
  useEffect(() => {
    searchProfiles(debouncedQuery, filters);
  }, [debouncedQuery, filters, searchProfiles]);

  // 필터 변경 핸들러
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      language: 'all',
      level: 'all',
      location: '',
      onlineOnly: false
    });
  };

  // 활성 필터 개수
  const activeFiltersCount = useMemo(() => (
    Object.values(filters).filter((value) => (
      value !== 'all' && value !== '' && value !== false
    )).length
  ), [filters]);

  return (
    <div className={`bg-white rounded-[16px] border border-[#E7E7E7] ${className}`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-[#E7E7E7]">
        <h2 className="text-[18px] font-bold text-[#111111] mb-4">프로필 검색</h2>
        
        {/* 검색 입력 */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-[#929292] absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="이름, 위치, 언어로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-[#E7E7E7] rounded-[8px] text-[14px] focus:outline-none focus:border-[#00C471]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#F3F4F6] rounded-full"
            >
              <X className="w-4 h-4 text-[#929292]" />
            </button>
          )}
        </div>

        {/* 필터 토글 버튼 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-[8px] text-[14px] font-medium transition-colors
              ${isFilterOpen ? 'bg-[#00C471] text-white' : 'bg-[#F3F4F6] text-[#606060] hover:bg-[#E7E7E7]'}
            `}
          >
            <Filter className="w-4 h-4" />
            필터
            {activeFiltersCount > 0 && (
              <span className={`
                px-2 py-1 text-[12px] rounded-full font-bold
                ${isFilterOpen ? 'bg-white/20' : 'bg-[#00C471] text-white'}
              `}>
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-[12px] text-[#929292] hover:text-[#606060] underline"
            >
              필터 초기화
            </button>
          )}
      </div>
    </div>

      {error && !isLoading && (
        <div className="px-4 py-3 border-b border-[#FFE0E0] bg-[#FFF5F5] flex items-center gap-2 text-[#C53030] text-[14px]">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => searchProfiles(debouncedQuery, filters)}
            className="ml-auto text-[#8B0000] underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 필터 옵션 */}
      {isFilterOpen && (
        <div className="p-4 bg-[#F8F9FA] border-b border-[#E7E7E7]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 언어 필터 */}
            <div>
              <label className="block text-[12px] font-medium text-[#606060] mb-2">
                <Globe className="w-3 h-3 inline mr-1" />
                언어
              </label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full p-2 border border-[#E7E7E7] rounded-[6px] text-[14px] bg-white"
              >
                <option value="all">전체 언어</option>
                <option value="english">영어</option>
                <option value="japanese">일본어</option>
                <option value="chinese">중국어</option>
                <option value="spanish">스페인어</option>
                <option value="french">프랑스어</option>
              </select>
            </div>

            {/* 레벨 필터 */}
            <div>
              <label className="block text-[12px] font-medium text-[#606060] mb-2">
                <Users className="w-3 h-3 inline mr-1" />
                레벨
              </label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full p-2 border border-[#E7E7E7] rounded-[6px] text-[14px] bg-white"
              >
                <option value="all">전체 레벨</option>
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
                <option value="expert">전문가</option>
              </select>
            </div>

            {/* 위치 필터 */}
            <div>
              <label className="block text-[12px] font-medium text-[#606060] mb-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                위치
              </label>
              <input
                type="text"
                placeholder="도시, 국가 입력..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full p-2 border border-[#E7E7E7] rounded-[6px] text-[14px]"
              />
            </div>

            {/* 온라인 상태 필터 */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onlineOnly}
                  onChange={(e) => handleFilterChange('onlineOnly', e.target.checked)}
                  className="w-4 h-4 text-[#00C471] rounded focus:ring-[#00C471]"
                />
                <span className="text-[14px] text-[#606060]">온라인 상태만</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-[#00C471] border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-[14px] text-[#929292]">검색 중...</p>
          </div>
        ) : (
          <>
            {/* 결과 개수 표시 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] text-[#606060]">
                {results.length}개의 프로필을 찾았습니다
                {debouncedQuery && (
                  <span className="text-[#111111] font-medium"> "{debouncedQuery}"</span>
                )}
              </p>
            </div>

            {/* 검색 결과 목록 */}
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((profile) => (
                  <ProfileCardCompact
                    key={profile.id}
                    profile={profile}
                    onClick={() => onProfileSelect?.(profile)}
                    showOnlineStatus={true}
                    className="hover:border-[#00C471] hover:shadow-sm transition-all duration-200"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-[#929292] mx-auto mb-3" />
                <p className="text-[16px] text-[#929292] mb-2">
                  {debouncedQuery || activeFiltersCount > 0 
                    ? '검색 결과가 없습니다' 
                    : '검색어를 입력해보세요'
                  }
                </p>
                <p className="text-[14px] text-[#929292]">
                  {debouncedQuery || activeFiltersCount > 0
                    ? '다른 검색어나 필터를 시도해보세요'
                    : '이름, 위치, 언어로 다른 사용자를 찾을 수 있습니다'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
