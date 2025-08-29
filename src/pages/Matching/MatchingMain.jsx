import { useState, useEffect } from 'react';
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
import useMatchingStore from '../../store/matchingStore';

export default function MatchingMain() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('recommended');
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        matchedUsers,
        matchingStatus,
        isSearching,
        matchingFilters,
        startMatching,
        fetchRecommendedPartners,
        setMatchingFilters,
        resetMatching
    } = useMatchingStore();

    useEffect(() => {
        // 컴포넌트 마운트 시 추천 파트너 가져오기
        loadRecommendedPartners();
    }, []);

    const loadRecommendedPartners = async () => {
        setIsLoading(true);
        try {
            await fetchRecommendedPartners();
        } catch (error) {
            console.error('Failed to load recommended partners:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleFilterChange = (key, value) => {
        setMatchingFilters({ [key]: value });
    };

    const handleViewProfile = (userId) => {
        navigate(`/matching/profile/${userId}`);
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
                <div className="bg-white border-b border-[#E7E7E7] p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[14px] font-medium text-[#111111] mb-2">
                                학습 언어
                            </label>
                            <select
                                value={matchingFilters.targetLanguage}
                                onChange={(e) => handleFilterChange('targetLanguage', e.target.value)}
                                className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none"
                            >
                                <option value="en">English</option>
                                <option value="ko">Korean</option>
                                <option value="ja">Japanese</option>
                                <option value="zh">Chinese</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[14px] font-medium text-[#111111] mb-2">
                                실력 수준
                            </label>
                            <select
                                value={matchingFilters.proficiencyLevel}
                                onChange={(e) => handleFilterChange('proficiencyLevel', e.target.value)}
                                className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none"
                            >
                                <option value="">전체</option>
                                <option value="beginner">초급</option>
                                <option value="intermediate">중급</option>
                                <option value="advanced">고급</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[14px] font-medium text-[#111111] mb-2">
                                세션 유형
                            </label>
                            <select
                                value={matchingFilters.sessionType}
                                onChange={(e) => handleFilterChange('sessionType', e.target.value)}
                                className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none"
                            >
                                <option value="1on1">1:1 대화</option>
                                <option value="group">그룹 대화</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <CommonButton
                            onClick={() => setShowFilters(false)}
                            variant="primary"
                            className="px-6"
                        >
                            적용
                        </CommonButton>
                    </div>
                </div>
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
                    <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                        <h2 className="text-[18px] font-bold text-[#111111] mb-4">파트너 검색</h2>
                        <p className="text-[14px] text-[#666666] mb-6">
                            원하는 조건으로 언어 교환 파트너를 직접 찾아보세요.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-[14px] font-medium text-[#111111] mb-2">
                                    관심사
                                </label>
                                <input
                                    type="text"
                                    placeholder="영화, 음악, 여행 등"
                                    className="w-full h-12 px-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-[#111111] mb-2">
                                    학습 목표
                                </label>
                                <textarea
                                    placeholder="어떤 목표로 언어를 배우고 계신가요?"
                                    className="w-full h-24 px-4 py-3 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none resize-none"
                                />
                            </div>
                        </div>

                        <CommonButton
                            onClick={handleStartMatching}
                            variant="primary"
                            className="w-full"
                            disabled={isLoading}
                        >
                            <Search className="w-5 h-5 mr-2" />
                            검색하기
                        </CommonButton>
                    </div>
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
        </div>
    );
}