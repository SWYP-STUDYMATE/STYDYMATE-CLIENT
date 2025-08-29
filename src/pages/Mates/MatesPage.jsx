import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Filter, Star, MessageSquare, Video, Calendar,
  Phone, MoreVertical, UserPlus, Heart, Trash2, ChevronRight,
  Globe, Clock, Award, MapPin
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';

const MatesPage = () => {
  const navigate = useNavigate();
  const [mates, setMates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedMate, setSelectedMate] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

  useEffect(() => {
    loadMates();
  }, []);

  const loadMates = async () => {
    // Mock 데이터 - 실제로는 API에서 가져옴
    const mockMates = [
      {
        id: '1',
        name: 'Sarah Kim',
        englishName: 'Sarah',
        profileImage: null,
        country: 'United States',
        flag: '🇺🇸',
        nativeLanguage: 'English',
        learningLanguage: 'Korean',
        level: 'Intermediate',
        lastActive: '2024-01-20T10:30:00Z',
        status: 'online',
        totalSessions: 15,
        averageRating: 4.9,
        matchedDate: '2024-01-01T00:00:00Z',
        favorited: true,
        notes: '발음이 정말 좋고 친절해요!',
        interests: ['K-pop', '영화', '요리'],
        timezone: 'America/New_York',
        nextSession: '2024-01-21T15:00:00Z'
      },
      {
        id: '2',
        name: 'Yuki Tanaka',
        englishName: 'Yuki',
        profileImage: null,
        country: 'Japan',
        flag: '🇯🇵',
        nativeLanguage: 'Japanese',
        learningLanguage: 'English',
        level: 'Beginner',
        lastActive: '2024-01-20T08:15:00Z',
        status: 'away',
        totalSessions: 8,
        averageRating: 4.7,
        matchedDate: '2024-01-10T00:00:00Z',
        favorited: false,
        notes: '',
        interests: ['애니메이션', '게임', '음식'],
        timezone: 'Asia/Tokyo',
        nextSession: null
      },
      {
        id: '3',
        name: 'Li Wei',
        englishName: 'Wei',
        profileImage: null,
        country: 'China',
        flag: '🇨🇳',
        nativeLanguage: 'Chinese',
        learningLanguage: 'English',
        level: 'Advanced',
        lastActive: '2024-01-19T22:45:00Z',
        status: 'offline',
        totalSessions: 22,
        averageRating: 4.8,
        matchedDate: '2023-12-15T00:00:00Z',
        favorited: true,
        notes: '중국 문화에 대해 많이 알려줘요',
        interests: ['역사', '철학', '여행'],
        timezone: 'Asia/Shanghai',
        nextSession: '2024-01-22T09:00:00Z'
      }
    ];

    setTimeout(() => {
      setMates(mockMates);
      setLoading(false);
    }, 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return '온라인';
      case 'away': return '자리비움';
      case 'offline': return '오프라인';
      default: return '오프라인';
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  const filteredMates = mates.filter(mate => {
    const matchesSearch = mate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mate.englishName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'favorites' && mate.favorited) ||
                         (filterType === 'online' && mate.status === 'online') ||
                         (filterType === 'recent' && new Date() - new Date(mate.lastActive) < 86400000);
    
    return matchesSearch && matchesFilter;
  });

  const handleStartChat = (mate) => {
    navigate(`/chat`, { state: { partnerId: mate.id } });
  };

  const handleStartVideoCall = (mate) => {
    navigate(`/session/video/${mate.id}`);
  };

  const handleScheduleSession = (mate) => {
    navigate('/session/schedule/new', { state: { partnerId: mate.id } });
  };

  const handleToggleFavorite = (mateId) => {
    setMates(prev => prev.map(mate => 
      mate.id === mateId ? { ...mate, favorited: !mate.favorited } : mate
    ));
  };

  const handleRemoveMate = (mateId) => {
    if (confirm('정말로 이 파트너를 제거하시겠습니까?')) {
      setMates(prev => prev.filter(mate => mate.id !== mateId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#929292]">메이트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <ChevronRight className="w-6 h-6 text-[#111111] rotate-180" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#111111]">내 메이트</h1>
                <p className="text-sm text-[#929292]">
                  {mates.length}명의 언어 교환 파트너
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/matching')}
              className="flex items-center space-x-2 bg-[#00C471] text-white px-4 py-2 rounded-lg hover:bg-[#00B267] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-[14px] font-medium">새 파트너 찾기</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search and Filter */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#929292]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="파트너 이름으로 검색"
              className="w-full h-12 pl-12 pr-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none bg-white"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: '전체', count: mates.length },
              { key: 'online', label: '온라인', count: mates.filter(m => m.status === 'online').length },
              { key: 'favorites', label: '즐겨찾기', count: mates.filter(m => m.favorited).length },
              { key: 'recent', label: '최근 활동', count: mates.filter(m => new Date() - new Date(m.lastActive) < 86400000).length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                  filterType === filter.key
                    ? 'bg-[#00C471] text-white'
                    : 'bg-white text-[#666666] border border-[#E7E7E7] hover:border-[#00C471]'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Mates List */}
        <div className="space-y-4">
          {filteredMates.length === 0 ? (
            <div className="bg-white rounded-[20px] p-8 border border-[#E7E7E7] text-center">
              <Users className="w-12 h-12 text-[#929292] mx-auto mb-4" />
              <h3 className="text-[16px] font-bold text-[#111111] mb-2">
                {searchQuery ? '검색 결과가 없습니다' : '아직 메이트가 없습니다'}
              </h3>
              <p className="text-[14px] text-[#666666] mb-4">
                {searchQuery ? '다른 검색어를 시도해보세요' : '새로운 언어 교환 파트너를 찾아보세요!'}
              </p>
              <CommonButton
                onClick={() => navigate('/matching')}
                variant="primary"
              >
                파트너 찾기
              </CommonButton>
            </div>
          ) : (
            filteredMates.map((mate) => (
              <div key={mate.id} className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                <div className="flex items-start space-x-4">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-[#F1F3F5] overflow-hidden">
                      {mate.profileImage ? (
                        <img
                          src={mate.profileImage}
                          alt={mate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#00C471] flex items-center justify-center">
                          <span className="text-white text-[18px] font-bold">
                            {mate.englishName[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Status Indicator */}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(mate.status)} border-2 border-white rounded-full`}></div>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-[18px] font-bold text-[#111111]">{mate.name}</h3>
                          <span className="text-[16px]">{mate.flag}</span>
                          {mate.favorited && <Heart className="w-4 h-4 fill-red-500 text-red-500" />}
                        </div>
                        <div className="flex items-center space-x-4 text-[14px] text-[#666666] mt-1">
                          <div className="flex items-center space-x-1">
                            <Globe className="w-4 h-4" />
                            <span>{mate.nativeLanguage} → {mate.learningLanguage}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{getStatusText(mate.status)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === mate.id ? null : mate.id)}
                          className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-[#929292]" />
                        </button>

                        {showActionMenu === mate.id && (
                          <div className="absolute right-0 top-10 bg-white border border-[#E7E7E7] rounded-lg shadow-lg py-2 z-10 min-w-[150px]">
                            <button
                              onClick={() => {
                                handleToggleFavorite(mate.id);
                                setShowActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-[14px] text-[#111111] hover:bg-[#F1F3F5] flex items-center space-x-2"
                            >
                              <Heart className={`w-4 h-4 ${mate.favorited ? 'fill-red-500 text-red-500' : 'text-[#929292]'}`} />
                              <span>{mate.favorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}</span>
                            </button>
                            <button
                              onClick={() => {
                                handleRemoveMate(mate.id);
                                setShowActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-[14px] text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>메이트 제거</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 mb-4 text-[12px] text-[#929292]">
                      <div className="flex items-center space-x-1">
                        <Video className="w-3 h-3" />
                        <span>{mate.totalSessions}번 세션</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{mate.averageRating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{getTimeAgo(mate.lastActive)}</span>
                      </div>
                    </div>

                    {/* Interests */}
                    {mate.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mate.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#F1F3F5] text-[#666666] rounded-lg text-[12px]"
                          >
                            {interest}
                          </span>
                        ))}
                        {mate.interests.length > 3 && (
                          <span className="text-[12px] text-[#929292]">
                            +{mate.interests.length - 3}개 더
                          </span>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {mate.notes && (
                      <p className="text-[14px] text-[#666666] bg-[#F9F9F9] p-3 rounded-lg mb-4">
                        "{mate.notes}"
                      </p>
                    )}

                    {/* Next Session */}
                    {mate.nextSession && (
                      <div className="bg-[#E6F9F1] p-3 rounded-lg mb-4">
                        <div className="flex items-center space-x-2 text-[14px] text-[#00C471]">
                          <Calendar className="w-4 h-4" />
                          <span>다음 세션: {new Date(mate.nextSession).toLocaleString('ko-KR')}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStartChat(mate)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-[#00C471] text-white py-2 rounded-lg hover:bg-[#00B267] transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-[14px] font-medium">채팅</span>
                      </button>
                      <button
                        onClick={() => handleStartVideoCall(mate)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-[#4285F4] text-white py-2 rounded-lg hover:bg-[#3367D6] transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        <span className="text-[14px] font-medium">화상통화</span>
                      </button>
                      <button
                        onClick={() => handleScheduleSession(mate)}
                        className="flex items-center justify-center px-3 py-2 border border-[#E7E7E7] text-[#666666] rounded-lg hover:border-[#00C471] hover:text-[#00C471] transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MatesPage;