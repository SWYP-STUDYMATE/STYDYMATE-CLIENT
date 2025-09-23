import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  MoreVertical,
  MessageSquare,
  Video,
  Calendar,
  ChevronRight,
  Globe,
  Clock,
  Award,
  MapPin,
  RefreshCw,
  Trash2,
  UserPlus,
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import { getSpringBootMatches, deleteSpringBootMatch } from '../../api/matching';
import { toast } from '../../components/toast-manager.jsx';

const PAGE_SIZE = 12;

const STATUS_LABELS = {
  ONLINE: '온라인',
  AWAY: '자리비움',
  IDLE: '자리비움',
  BUSY: '통화중',
  OFFLINE: '오프라인',
};

const FILTER_DEFINITIONS = [
  { key: 'all', label: '전체' },
  { key: 'online', label: '온라인' },
  { key: 'recent', label: '최근 활동' },
  { key: 'highScore', label: '호환도 80%+' },
];

const parseTopics = (topics) => {
  if (!topics) return [];
  if (Array.isArray(topics)) {
    return topics.map((topic) => String(topic).trim()).filter(Boolean);
  }
  if (typeof topics === 'string') {
    return topics.split(',').map((topic) => topic.trim()).filter(Boolean);
  }
  return [];
};

const extractPage = (payload) => {
  if (!payload) return { content: [] };
  if (Array.isArray(payload)) {
    return { content: payload, number: 0, last: true, totalElements: payload.length };
  }
  if (payload.content) return payload;
  if (payload.data?.content) return payload.data;
  if (payload.data?.data?.content) return payload.data.data;
  return payload;
};

const transformMate = (match) => {
  if (!match) return null;

  const status = (match.onlineStatus || 'OFFLINE').toUpperCase();
  const rawScore = match.compatibilityScore;
  const normalizedScore = typeof rawScore === 'number'
    ? Math.round((rawScore <= 1 ? rawScore * 100 : rawScore))
    : null;

  return {
    matchId: match.matchId,
    partnerUserId: match.partnerUserId,
    name: match.partnerUserName || '이름 미등록',
    profileImage: match.partnerUserProfileImage || null,
    location: match.partnerUserLocation || null,
    nativeLanguage: match.partnerUserNativeLanguage || null,
    bio: match.partnerUserBio || '',
    matchedAt: match.matchedAt || null,
    compatibilityScore: Number.isFinite(normalizedScore) ? normalizedScore : null,
    onlineStatus: status,
    statusLabel: STATUS_LABELS[status] || STATUS_LABELS.OFFLINE,
    lastActive: match.lastActiveTime || null,
    totalSessions: match.totalSessionsCompleted ?? 0,
    favoriteTopics: parseTopics(match.favoriteTopics),
  };
};

const mergeMatches = (prevList, nextList) => {
  const map = new Map();
  prevList.forEach((item) => {
    if (item?.matchId) {
      map.set(item.matchId, item);
    }
  });
  nextList.forEach((item) => {
    if (item?.matchId) {
      map.set(item.matchId, item);
    }
  });
  return Array.from(map.values());
};

const isRecentActive = (lastActive) => {
  if (!lastActive) return false;
  const timestamp = Date.parse(lastActive);
  if (Number.isNaN(timestamp)) return false;
  const diff = Date.now() - timestamp;
  return diff <= 24 * 60 * 60 * 1000;
};

const getStatusColor = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'ONLINE':
      return 'bg-green-500';
    case 'AWAY':
    case 'IDLE':
      return 'bg-yellow-500';
    case 'BUSY':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

const getTimeAgo = (dateString) => {
  if (!dateString) return '정보 없음';
  const timestamp = Date.parse(dateString);
  if (Number.isNaN(timestamp)) return '정보 없음';

  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return '방금 전';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 30) return `${diffDays}일 전`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}개월 전`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}년 전`;
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const getInitial = (name) => {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
};

const MatesPage = () => {
  const navigate = useNavigate();
  const [mates, setMates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [menuTarget, setMenuTarget] = useState(null);

  const fetchMates = useCallback(async ({ page: targetPage = 0, append = false } = {}) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await getSpringBootMatches(targetPage, PAGE_SIZE);
      const pagePayload = extractPage(response);
      const content = Array.isArray(pagePayload?.content) ? pagePayload.content : [];
      const normalized = content.map(transformMate).filter(Boolean);

      setMates((prev) => {
        const nextList = append ? mergeMatches(prev, normalized) : normalized;
        setTotalCount(pagePayload?.totalElements ?? nextList.length);
        return nextList;
      });

      const currentPageIndex = pagePayload?.number ?? targetPage;
      const nextPageIndex = currentPageIndex + 1;
      setPage(nextPageIndex);
      setHasMore(pagePayload?.last === false);
    } catch (fetchError) {
      console.error('메이트 목록 로드 실패:', fetchError);
      setError('메이트 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      if (!append) {
        setMates([]);
        setTotalCount(0);
        setHasMore(false);
      }
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchMates({ page: 0, append: false });
  }, [fetchMates]);

  useEffect(() => {
    if (menuTarget && !mates.some((mate) => mate.matchId === menuTarget)) {
      setMenuTarget(null);
    }
  }, [mates, menuTarget]);

  const filterStats = useMemo(() => {
    const onlineCount = mates.filter((mate) => mate.onlineStatus === 'ONLINE').length;
    const recentCount = mates.filter((mate) => isRecentActive(mate.lastActive)).length;
    const highScoreCount = mates.filter((mate) => (mate.compatibilityScore ?? 0) >= 80).length;

    return {
      all: mates.length,
      online: onlineCount,
      recent: recentCount,
      highScore: highScoreCount,
    };
  }, [mates]);

  const filters = useMemo(() => (
    FILTER_DEFINITIONS.map((filter) => ({
      ...filter,
      count: filterStats[filter.key] ?? 0,
    }))
  ), [filterStats]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredMates = useMemo(() => (
    mates.filter((mate) => {
      const matchesSearch = !normalizedQuery
        || [mate.name, mate.bio, mate.nativeLanguage, mate.location]
          .some((field) => field && field.toLowerCase().includes(normalizedQuery));

      const matchesFilter = {
        all: true,
        online: mate.onlineStatus === 'ONLINE',
        recent: isRecentActive(mate.lastActive),
        highScore: (mate.compatibilityScore ?? 0) >= 80,
      }[filterType] ?? true;

      return matchesSearch && matchesFilter;
    })
  ), [mates, normalizedQuery, filterType]);

  const handleRefresh = () => {
    if (loading || loadingMore) return;
    fetchMates({ page: 0, append: false });
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchMates({ page, append: true });
  };

  const handleStartChat = (mate) => {
    navigate('/chat', { state: { partnerId: mate.partnerUserId, matchId: mate.matchId } });
  };

  const handleStartVideoCall = (mate) => {
    navigate(`/session/video/${mate.partnerUserId}`);
  };

  const handleScheduleSession = (mate) => {
    navigate('/session/schedule/new', { state: { partnerId: mate.partnerUserId } });
  };

  const handleRemoveMate = async (mate) => {
    if (!mate?.matchId) {
      return;
    }

    const confirmRemove = window.confirm(`정말로 ${mate.name}님과의 매칭을 해제하시겠습니까?`);
    if (!confirmRemove) {
      return;
    }

    try {
      await deleteSpringBootMatch(mate.matchId);
      setMates((prev) => prev.filter((item) => item.matchId !== mate.matchId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success('매칭 해제 완료', `${mate.name}님과의 매칭이 해제되었습니다.`);
    } catch (removeError) {
      console.error('매칭 해제 실패:', removeError);
      toast.error('매칭 해제 실패', '잠시 후 다시 시도해 주세요.');
    } finally {
      setMenuTarget(null);
    }
  };

  if (loading && mates.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#929292]">메이트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
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
                  {totalCount}명의 언어 교환 파트너
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loading || loadingMore}
                className="flex items-center space-x-2 border border-[#E7E7E7] text-[#666666] rounded-lg px-3 py-2 hover:border-[#00C471] hover:text-[#00C471] transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-[14px] font-medium">새로고침</span>
              </button>
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
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#929292]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="파트너 이름, 관심사, 언어로 검색"
              className="w-full h-12 pl-12 pr-4 border border-[#E7E7E7] rounded-lg focus:border-[#00C471] focus:outline-none bg-white"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-[14px]">{error}</p>
              <button
                onClick={() => fetchMates({ page: 0, append: false })}
                className="text-[13px] font-medium underline underline-offset-4"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {!loading && filteredMates.length === 0 ? (
            <div className="bg-white rounded-[20px] p-8 border border-[#E7E7E7] text-center">
              <Users className="w-12 h-12 text-[#929292] mx-auto mb-4" />
              <h3 className="text-[16px] font-bold text-[#111111] mb-2">
                {normalizedQuery ? '검색 결과가 없습니다' : '아직 메이트가 없습니다'}
              </h3>
              <p className="text-[14px] text-[#666666] mb-4">
                {normalizedQuery ? '다른 검색어를 시도해보세요.' : '새로운 언어 교환 파트너를 찾아보세요!'}
              </p>
              <CommonButton
                onClick={() => navigate('/matching')}
                variant="primary"
                size="small"
              >
                파트너 찾기
              </CommonButton>
            </div>
          ) : (
            filteredMates.map((mate) => (
              <div key={mate.matchId} className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
                <div className="flex items-start space-x-4">
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
                            {getInitial(mate.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(mate.onlineStatus)} border-2 border-white rounded-full`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="text-[18px] font-bold text-[#111111]">{mate.name}</h3>
                          {mate.location && (
                            <span className="flex items-center space-x-1 text-[12px] text-[#666666]">
                              <MapPin className="w-3 h-3" />
                              <span>{mate.location}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center flex-wrap gap-4 text-[13px] text-[#666666]">
                          {mate.nativeLanguage && (
                            <span className="flex items-center space-x-1">
                              <Globe className="w-4 h-4" />
                              <span>{mate.nativeLanguage}</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{mate.statusLabel} · {mate.lastActive ? getTimeAgo(mate.lastActive) : '활동 기록 없음'}</span>
                          </span>
                          {mate.matchedAt && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>매칭일 {formatDate(mate.matchedAt)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setMenuTarget((prev) => (prev === mate.matchId ? null : mate.matchId))}
                          className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-[#929292]" />
                        </button>

                        {menuTarget === mate.matchId && (
                          <div className="absolute right-0 top-10 bg-white border border-[#E7E7E7] rounded-lg shadow-lg py-2 z-10 min-w-[160px]">
                            <button
                              onClick={() => handleRemoveMate(mate)}
                              className="w-full px-4 py-2 text-left text-[14px] text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>매칭 해제</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-4 mb-4 text-[12px] text-[#929292]">
                      <span className="flex items-center space-x-1">
                        <Video className="w-3 h-3" />
                        <span>{mate.totalSessions}번 세션</span>
                      </span>
                      {typeof mate.compatibilityScore === 'number' && (
                        <span className="flex items-center space-x-1 text-[#00C471]">
                          <Award className="w-3 h-3" />
                          <span>호환도 {mate.compatibilityScore}%</span>
                        </span>
                      )}
                    </div>

                    {mate.favoriteTopics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mate.favoriteTopics.slice(0, 4).map((topic, index) => (
                          <span
                            key={`${mate.matchId}-topic-${index}`}
                            className="px-2 py-1 bg-[#F1F3F5] text-[#666666] rounded-lg text-[12px]"
                          >
                            {topic}
                          </span>
                        ))}
                        {mate.favoriteTopics.length > 4 && (
                          <span className="text-[12px] text-[#929292]">
                            +{mate.favoriteTopics.length - 4}개 더
                          </span>
                        )}
                      </div>
                    )}

                    {mate.bio && (
                      <p className="text-[14px] text-[#666666] bg-[#F9F9F9] p-3 rounded-lg mb-4 line-clamp-3">
                        {mate.bio}
                      </p>
                    )}

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

        {hasMore && (
          <div className="flex justify-center pt-4">
            <div className="w-full max-w-xs">
              <CommonButton
                variant="secondary"
                size="small"
                onClick={handleLoadMore}
                loading={loadingMore}
                disabled={loadingMore}
              >
                {loadingMore ? '불러오는 중...' : '더 불러오기'}
              </CommonButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatesPage;
