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
    Filter,
    Sparkles
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import MatchingProfileCard from '../../components/MatchingProfileCard';
import AIMatchingResults from '../../components/AIMatchingResults';
import FilterPanel from '../../components/FilterPanel';
import useMatchingStore from '../../store/matchingStore';
import useToast from '../../hooks/useToast.jsx';
import { getAIBestMatches } from '../../api/matching';

export default function MatchingMain() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('recommended');
    const { showError, showSuccess, ToastContainer } = useToast();
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [aiMatches, setAiMatches] = useState([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [showAIResults, setShowAIResults] = useState(false);

    const {
        matchedUsers,
        matchingStatus,
        isSearching,
        matchingFilters,
        sentRequests,
        startMatching,
        fetchRecommendedPartners,
        fetchSentRequests,
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
        // 컴포넌트 마운트 시 추천 파트너 및 보낸 요청 목록 가져오기
        const initialize = async () => {
            await Promise.all([
                loadRecommendedPartners(),
                fetchSentRequests('pending') // pending 상태의 보낸 요청만 조회
            ]);
        };
        initialize();
    }, [loadRecommendedPartners, fetchSentRequests]);

    // 디버깅: sentRequests 데이터 구조 확인
    useEffect(() => {
        if (sentRequests.length > 0) {
            console.log('[MatchingMain] 보낸 요청 데이터:', sentRequests);
            console.log('[MatchingMain] 첫 번째 요청 예시:', sentRequests[0]);
            console.log('[MatchingMain] 파트너 정보:', sentRequests[0]?.partner);
        }
    }, [sentRequests]);

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
        if (!searchQuery.trim()) {
            showError('검색어를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            console.log('[MatchingMain] 검색 시작:', { searchQuery, filters: matchingFilters });
            
            // Workers API를 통한 파트너 검색
            const results = await searchPartners(searchQuery, matchingFilters);
            
            console.log('[MatchingMain] 검색 결과:', results);
            
            // 결과가 배열인지 확인
            if (Array.isArray(results)) {
                setSearchResults(results);
                if (results.length === 0) {
                    showError('검색 결과가 없습니다. 다른 검색어를 시도해보세요.');
                }
            } else if (results?.data && Array.isArray(results.data)) {
                setSearchResults(results.data);
                if (results.data.length === 0) {
                    showError('검색 결과가 없습니다. 다른 검색어를 시도해보세요.');
                }
            } else {
                console.warn('[MatchingMain] 예상과 다른 검색 결과 형식:', results);
                setSearchResults([]);
                showError('검색 결과를 처리하는 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('[MatchingMain] 검색 오류:', error);
            
            // 에러 메시지 추출
            let errorMessage = '매칭 파트너 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            
            if (error?.response?.data) {
                const errorData = error.response.data;
                if (errorData.error?.message) {
                    errorMessage = errorData.error.message;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } else if (error?.message) {
                if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
                    errorMessage = '네트워크 연결을 확인해주세요.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            // API 실패 시 빈 배열로 설정
            setSearchResults([]);
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAIMatching = async () => {
        setIsLoadingAI(true);
        try {
            const preferences = {
                languageWeight: 0.25,
                levelWeight: 0.15,
                semanticWeight: 0.15,
                scheduleWeight: 0.15,
                goalsWeight: 0.10,
                personalityWeight: 0.10,
                topicsWeight: 0.10
            };
            const matches = await getAIBestMatches(preferences, 5);
            const matchResults = matches.matches || [];
            
            if (matchResults.length === 0) {
                showError(matches.message || '매칭할 파트너를 찾지 못했습니다. 잠시 후 다시 시도해주세요.');
                setShowAIResults(false);
            } else {
                setAiMatches(matchResults);
                setShowAIResults(true);
                showSuccess('AI 매칭이 완료되었습니다!');
            }
        } catch (error) {
            console.error('AI matching error:', error);
            
            // 에러 메시지 추출
            let errorMessage = 'AI 매칭 중 오류가 발생했습니다. 다시 시도해주세요.';
            
            if (error?.response?.data) {
                // 백엔드에서 전달된 에러 메시지 사용
                const errorData = error.response.data;
                if (errorData.error?.message) {
                    errorMessage = errorData.error.message;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
                
                // 특정 에러 코드에 따른 메시지 커스터마이징
                const errorCode = errorData.error?.code || errorData.code;
                if (errorCode === 'USER_NOT_FOUND') {
                    errorMessage = '사용자 프로필을 찾을 수 없습니다. 프로필을 완성해주세요.';
                } else if (errorCode === 'AI_MATCHING_FAILED') {
                    errorMessage = 'AI 매칭 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
                } else if (errorCode === 'AI_SERVICE_UNAVAILABLE') {
                    errorMessage = 'AI 서비스가 현재 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
                } else if (errorCode === 'CONTEXT_MISSING_USER') {
                    errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
                }
            } else if (error?.message) {
                // 네트워크 에러 등의 경우
                if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
                    errorMessage = '네트워크 연결을 확인해주세요.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            showError(errorMessage);
        } finally {
            setIsLoadingAI(false);
        }
    };

    const handleRequestMatch = async (partnerId) => {
        try {
            // 기존 매칭 요청 로직 사용
            await startMatching();
            showSuccess('매칭 요청을 보냈습니다.');
        } catch (error) {
            console.error('Match request error:', error);
            showError('매칭 요청 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <div className="bg-white border-b border-[#E7E7E7] px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-[18px] sm:text-[20px] font-bold text-[#111111] break-words">매칭</h1>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="p-2 rounded-lg hover:bg-[#F1F3F5] transition-colors touch-manipulation"
                        >
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-[#666666]" />
                        </button>
                        <button
                            onClick={() => navigate('/matching/settings')}
                            className="p-2 rounded-lg hover:bg-[#F1F3F5] transition-colors touch-manipulation"
                        >
                            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-[#666666]" />
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
            <div className="bg-white border-b border-[#E7E7E7] overflow-x-auto">
                <div className="flex min-w-full">
                    <button
                        onClick={() => setActiveTab('recommended')}
                        className={`flex-1 py-3 text-[12px] sm:text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap touch-manipulation ${
                            activeTab === 'recommended'
                                ? 'text-[#00C471] border-[#00C471]'
                                : 'text-[#929292] border-transparent'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-1">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>추천</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-3 text-[12px] sm:text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap touch-manipulation ${
                            activeTab === 'sent'
                                ? 'text-[#00C471] border-[#00C471]'
                                : 'text-[#929292] border-transparent'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-1">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>보낸 요청</span>
                            {sentRequests.length > 0 && (
                                <span className="ml-1 px-1 sm:px-1.5 py-0.5 bg-[#00C471] text-white text-[9px] sm:text-[10px] rounded-full">
                                    {sentRequests.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex-1 py-3 text-[12px] sm:text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap touch-manipulation ${
                            activeTab === 'search'
                                ? 'text-[#00C471] border-[#00C471]'
                                : 'text-[#929292] border-transparent'
                        }`}
                    >
                        <div className="flex items-center justify-center space-x-1">
                            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>검색</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
                {activeTab === 'recommended' ? (
                    // 추천 탭
                    <>
                        {/* Quick Actions */}
                        <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7] mb-4 sm:mb-6">
                            <h2 className="text-[16px] sm:text-[18px] font-bold text-[#111111] mb-3 sm:mb-4 break-words">빠른 매칭</h2>
                            <p className="text-[13px] sm:text-[14px] text-[#666666] mb-3 sm:mb-4 leading-[1.4] sm:leading-[1.5] break-words">
                                AI가 당신에게 맞는 완벽한 언어 교환 파트너를 찾아드려요.
                            </p>
                            <div className="space-y-3">
                                <CommonButton
                                    onClick={handleStartMatching}
                                    variant="primary"
                                    className="w-full"
                                    disabled={isLoading || isSearching}
                                    loading={isSearching}
                                    icon={!isSearching ? <Search /> : undefined}
                                >
                                    {isSearching ? '매칭 중...' : '일반 매칭'}
                                </CommonButton>
                                <CommonButton
                                    onClick={handleAIMatching}
                                    variant="secondary"
                                    className="w-full bg-gradient-to-r from-[#E6F9F1] to-[#B0EDD3] hover:from-[#B0EDD3] hover:to-[#8AE4BE] text-[#111111] border-[#00C471]"
                                    disabled={isLoadingAI}
                                    icon={!isLoadingAI ? <Sparkles /> : undefined}
                                >
                                    {isLoadingAI ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00C471] mr-2" />
                                            AI 분석 중...
                                        </div>
                                    ) : (
                                        'AI 고급 매칭'
                                    )}
                                </CommonButton>
                            </div>
                        </div>

                        {/* AI Matching Results */}
                        {showAIResults && aiMatches.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <Sparkles className="w-5 h-5 text-[#00C471] mr-2" />
                                        <h2 className="text-[18px] font-bold text-[#111111]">AI 추천 매칭</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowAIResults(false)}
                                        className="text-[14px] text-[#929292]"
                                    >
                                        닫기
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {aiMatches.map((match) => (
                                        <AIMatchingResults
                                            key={match.partner.id}
                                            match={match}
                                            onRequestMatch={handleRequestMatch}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommended Partners */}
                        <div className="mb-4 sm:mb-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <h2 className="text-[16px] sm:text-[18px] font-bold text-[#111111] break-words">추천 파트너</h2>
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
                ) : activeTab === 'sent' ? (
                    // 보낸 요청 탭
                    <>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[18px] font-bold text-[#111111]">보낸 매칭 요청</h2>
                                <button
                                    onClick={() => fetchSentRequests('pending')}
                                    className="text-[14px] text-[#00C471] font-medium"
                                    disabled={isLoading}
                                >
                                    새로고침
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C471] mx-auto mb-4"></div>
                                    <p className="text-[14px] text-[#666666]">요청 목록을 불러오는 중...</p>
                                </div>
                            ) : sentRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {sentRequests.map((request) => {
                                        // 파트너 정보 추출 (백엔드 응답 구조: request.partner)
                                        const partnerName = request.partner?.name || request.receiverName || '파트너';
                                        const partnerImage = request.partner?.profileImageUrl || request.receiverProfileImage || '/default-avatar.png';
                                        const partnerUserId = request.partner?.userId || request.receiverId;
                                        
                                        // 날짜 파싱 (안전하게 처리)
                                        let dateDisplay = '날짜 정보 없음';
                                        try {
                                            if (request.createdAt) {
                                                const date = new Date(request.createdAt);
                                                if (!isNaN(date.getTime())) {
                                                    dateDisplay = date.toLocaleDateString('ko-KR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    });
                                                }
                                            }
                                        } catch (e) {
                                            console.warn('날짜 파싱 실패:', request.createdAt);
                                        }
                                        
                                        return (
                                        <div
                                            key={request.id || request.requestId}
                                            className="bg-white rounded-[10px] p-4 border border-[#E7E7E7] hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => handleViewProfile(partnerUserId)}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center">
                                                    <img
                                                        src={partnerImage}
                                                        alt={partnerName}
                                                        className="w-12 h-12 rounded-full object-cover mr-3 cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewProfile(partnerUserId);
                                                        }}
                                                    />
                                                    <div>
                                                        <h3 
                                                            className="text-[16px] font-bold text-[#111111] cursor-pointer hover:text-[#00C471] transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewProfile(partnerUserId);
                                                            }}
                                                        >
                                                            {partnerName}
                                                        </h3>
                                                        <p className="text-[12px] text-[#929292]">
                                                            {dateDisplay}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    {request.status === 'pending' && (
                                                        <span className="px-3 py-1 bg-[#E6F9F1] text-[#00C471] text-[12px] font-medium rounded-full">
                                                            대기 중
                                                        </span>
                                                    )}
                                                    {request.status === 'accepted' && (
                                                        <span className="px-3 py-1 bg-[#E6F9F1] text-[#00C471] text-[12px] font-medium rounded-full">
                                                            수락됨
                                                        </span>
                                                    )}
                                                    {request.status === 'rejected' && (
                                                        <span className="px-3 py-1 bg-[#F1F3F5] text-[#929292] text-[12px] font-medium rounded-full">
                                                            거절됨
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {request.message && (
                                                <div className="mt-3 p-3 bg-[#F1F3F5] rounded-lg">
                                                    <p className="text-[14px] text-[#666666]">{request.message}</p>
                                                </div>
                                            )}
                                        </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white rounded-[20px] p-8 border border-[#E7E7E7] text-center">
                                    <Users className="w-12 h-12 text-[#929292] mx-auto mb-4" />
                                    <h3 className="text-[16px] font-bold text-[#111111] mb-2">
                                        보낸 매칭 요청이 없습니다
                                    </h3>
                                    <p className="text-[14px] text-[#666666] mb-4">
                                        추천 탭에서 파트너를 찾아 매칭 요청을 보내보세요!
                                    </p>
                                    <CommonButton
                                        onClick={() => setActiveTab('recommended')}
                                        variant="secondary"
                                    >
                                        파트너 찾기
                                    </CommonButton>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // 검색 탭
                    <>
                        {/* Search Form */}
                        <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7] mb-4 sm:mb-6">
                            <h2 className="text-[16px] sm:text-[18px] font-bold text-[#111111] mb-3 sm:mb-4 break-words">파트너 검색</h2>
                            <p className="text-[13px] sm:text-[14px] text-[#666666] mb-4 sm:mb-6 leading-[1.4] sm:leading-[1.5] break-words">
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
                                            className="flex-1 h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-1 transition-all"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <CommonButton
                                            onClick={handleSearch}
                                            variant="primary"
                                            disabled={isLoading || !searchQuery.trim()}
                                            fullWidth={false}
                                            size="small"
                                            className="h-12 min-w-[120px] flex-shrink-0"
                                            icon={<Search />}
                                        >
                                            검색
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
