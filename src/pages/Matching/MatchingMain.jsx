import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Users,
    Settings,
    Heart,
    Star,
    Globe,
    Target,
    ChevronRight,
    Filter
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import MatchingProfileCard from '../../components/MatchingProfileCard';
import FilterPanel from '../../components/FilterPanel';
import useMatchingStore from '../../store/matchingStore';
import useToast from '../../hooks/useToast.jsx';

export default function MatchingMain() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('recommended');
    const { showError, showSuccess, ToastContainer } = useToast();
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const {
        matchedUsers,
        matchingStatus,
        isSearching,
        matchingFilters,
        startMatching,
        fetchRecommendedPartners,
        setMatchingFilters,
        searchPartners,
    } = useMatchingStore();

    const loadRecommendedPartners = useCallback(async () => {
        setIsLoading(true);
        try {
            await fetchRecommendedPartners();
        } catch (error) {
            console.error('Failed to load recommended partners:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchRecommendedPartners]);

    useEffect(() => {
        // 컴포넌트 마운트 시 추천 파트너 가져오기
        loadRecommendedPartners();
    }, [loadRecommendedPartners]);

    const handleStartMatching = async () => {
        setIsLoading(true);
        try {
            await startMatching();
        } catch (error) {
            console.error('Failed to start matching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = async (filters) => {
        setMatchingFilters(filters);
        
        setIsLoading(true);
        try {
            if (activeTab === 'recommended') {
                await loadRecommendedPartners();
            } else if (activeTab === 'search' && searchQuery.trim()) {
                // 검색 중인 경우 필터를 적용하여 재검색
                const results = await searchPartners(searchQuery, filters);
                setSearchResults(results);
            }
        } catch (error) {
            console.error('Failed to apply filters:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewProfile = (userId) => {
        navigate(`/matching/profile/${userId}`);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setIsLoading(true);
        try {
            // Spring Boot API를 통한 파트너 검색
            const results = await searchPartners(searchQuery, matchingFilters);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            // API 실패 시 빈 배열로 설정
            setSearchResults([]);
            // 사용자에게 에러 메시지 표시
            showError('매칭 파트너 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-[20px] font-bold text-[#111111]">매칭</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="p-2 rounded-lg hover:bg-[#F1F3F5] transition-colors"
                        >
                            <Filter className="w-5 h-5 text-[#666666]" />
                        </button>
                        <button
                            onClick={() => navigate('/matching/settings')}
                            className="p-2 rounded-lg hover:bg-[#F1F3F5] transition-colors"
                        >
                            <Settings className="w-5 h-5 text-[#666666]" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <FilterPanel
                    filters={matchingFilters}
                    onFiltersChange={handleFilterChange}
                    onClose={() => setShowFilters(false)}
                    showLocation={true}
                    showAge={true}
                    showAvailability={true}
                    showSessionPreferences={true}
                />
            )}

            {/* Tabs */}
            <div className="bg-white border-b border-[#E7E7E7]">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('recommended')}
                        className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
                            activeTab === 'recommended'
                                ? 'text-[#00C471] border-[#00C471]'
                                : 'text-[#929292] border-transparent'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>추천</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
                            activeTab === 'search'
                                ? 'text-[#00C471] border-[#00C471]'
                                : 'text-[#929292] border-transparent'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-1">
                            <Search className="w-4 h-4" />
                            <span>검색</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'recommended' ? (
                    <>
                        {/* Quick Actions */}
                        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] mb-6">
                            <h2 className="text-[18px] font-bold text-[#111111] mb-4">빠른 매칭</h2>
                            <p className="text-[14px] text-[#666666] mb-4">
                                AI가 당신에게 맞는 완벽한 언어 교환 파트너를 찾아드려요.
                            </p>
                            <CommonButton
                                onClick={handleStartMatching}
                                variant="primary"
                                className="w-full"
                                disabled={isLoading || isSearching}
                            >
                                {isSearching ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        매칭 중...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5 mr-2" />
                                        AI 매칭 시작
                                    </>
                                )}
                            </CommonButton>
                        </div>

                        {/* Recommended Partners */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[18px] font-bold text-[#111111]">추천 파트너</h2>
                                <button
                                    onClick={loadRecommendedPartners}
                                    className="text-[14px] text-[#00C471] font-medium"
                                    disabled={isLoading}
                                >
                                    새로고침
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C471] mx-auto mb-4"></div>
                                    <p className="text-[14px] text-[#666666]">파트너를 찾고 있어요...</p>
                                </div>
                            ) : matchedUsers.length > 0 ? (
                                <div className="space-y-4">
                                    {matchedUsers.map((user) => (
                                        <MatchingProfileCard
                                            key={user.id}
                                            user={user}
                                            onViewProfile={() => handleViewProfile(user.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-[20px] p-8 border border-[#E7E7E7] text-center">
                                    <Users className="w-12 h-12 text-[#929292] mx-auto mb-4" />
                                    <h3 className="text-[16px] font-bold text-[#111111] mb-2">
                                        아직 추천할 파트너가 없어요
                                    </h3>
                                    <p className="text-[14px] text-[#666666] mb-4">
                                        프로필을 완성하고 매칭을 시작해보세요!
                                    </p>
                                    <CommonButton
                                        onClick={() => navigate('/profile')}
                                        variant="secondary"
                                    >
                                        프로필 완성하기
                                    </CommonButton>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Search Tab */
                    <>
                        {/* Search Form */}
                        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] mb-6">
                            <h2 className="text-[18px] font-bold text-[#111111] mb-4">파트너 검색</h2>
                            <p className="text-[14px] text-[#666666] mb-6">
                                이름이나 관심사로 언어 교환 파트너를 직접 찾아보세요.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[14px] font-medium text-[#111111] mb-2">
                                        검색어
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="이름, 관심사, 학습 목표로 검색하세요"
                                            className="flex-1 h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <CommonButton
                                            onClick={handleSearch}
                                            variant="primary"
                                            disabled={isLoading || !searchQuery.trim()}
                                            className="px-6"
                                        >
                                            <Search className="w-5 h-5" />
                                        </CommonButton>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[16px] font-bold text-[#111111]">
                                    검색 결과 ({searchResults.length})
                                </h3>
                                {searchResults.length > 0 && (
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="flex items-center space-x-1 text-[14px] text-[#00C471] font-medium"
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span>필터</span>
                                    </button>
                                )}
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C471] mx-auto mb-4"></div>
                                    <p className="text-[14px] text-[#666666]">검색 중...</p>
                                </div>
                            ) : searchQuery && searchResults.length === 0 ? (
                                <div className="bg-white rounded-[20px] p-8 border border-[#E7E7E7] text-center">
                                    <Search className="w-12 h-12 text-[#929292] mx-auto mb-4" />
                                    <h4 className="text-[16px] font-bold text-[#111111] mb-2">
                                        검색 결과가 없습니다
                                    </h4>
                                    <p className="text-[14px] text-[#666666] mb-4">
                                        다른 검색어나 필터를 시도해보세요.
                                    </p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-4">
                                    {searchResults.map((user) => (
                                        <MatchingProfileCard
                                            key={user.id}
                                            user={user}
                                            onViewProfile={() => handleViewProfile(user.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-[20px] p-8 border border-[#E7E7E7] text-center">
                                    <Search className="w-12 h-12 text-[#929292] mx-auto mb-4" />
                                    <h4 className="text-[16px] font-bold text-[#111111] mb-2">
                                        파트너 검색
                                    </h4>
                                    <p className="text-[14px] text-[#666666]">
                                        위의 검색창에서 원하는 파트너를 찾아보세요.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Matching Status */}
            {matchingStatus === 'searching' && (
                <div className="fixed bottom-6 left-6 right-6">
                    <div className="bg-[#00C471] rounded-[20px] p-4 text-white text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="text-[14px] font-medium">완벽한 파트너를 찾고 있어요...</span>
                        </div>
                    </div>
                </div>
            )}
            
            <ToastContainer />
        </div>
    );
}
