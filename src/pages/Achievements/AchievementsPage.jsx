import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
  Award,
  Target,
  Clock,
  Gift
} from 'lucide-react';
import useAchievementOverview from '../../hooks/useAchievementOverview';
import { ACHIEVEMENT_CATEGORIES } from '../../api/achievement';

const CATEGORY_LABELS = {
  ALL: '전체',
  STUDY: '학습',
  SOCIAL: '소셜',
  MILESTONE: '마일스톤',
  SPECIAL: '특별',
  STREAK: '연속',
  ENGAGEMENT: '참여',
  PROFILE: '프로필',
  SESSION: '세션',
  CHAT: '채팅'
};

const TIER_COLORS = {
  BRONZE: 'text-orange-500',
  SILVER: 'text-gray-500',
  GOLD: 'text-yellow-500',
  PLATINUM: 'text-blue-500',
  DIAMOND: 'text-purple-500',
  LEGENDARY: 'text-amber-500'
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const AchievementCard = ({ item }) => {
  // 안전한 데이터 추출
  const achievement = item?.achievement || {};
  const isCompleted = item?.isCompleted ?? false;
  const progressPercentage = item?.progressPercentage ?? 0;
  const currentProgress = item?.currentProgress ?? 0;
  const targetValue = item?.targetValue ?? null;

  // 문자열 속성만 안전하게 추출
  const title = typeof achievement.title === 'string' ? achievement.title : '이름 없는 업적';
  const description = typeof achievement.description === 'string' ? achievement.description : '';
  const category = typeof achievement.category === 'string' ? achievement.category : null;
  const tier = typeof achievement.tier === 'string' ? achievement.tier : null;
  const xpReward = typeof achievement.xpReward === 'number' ? achievement.xpReward : null;

  const categoryLabel = category ? (CATEGORY_LABELS[category] || category) : '기타';
  const tierClass = tier ? (TIER_COLORS[tier] || 'text-[#929292]') : 'text-[#929292]';
  const progress = isCompleted ? 100 : Math.min(100, Math.max(0, progressPercentage));

  return (
    <div
      className={`bg-white rounded-[12px] p-3 sm:p-4 border transition-all ${
        isCompleted ? 'border-[#00C471] shadow-sm' : 'border-[#E7E7E7]'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-[#E6F9F1]' : 'bg-[#F1F3F5]'}`}>
          <Award className={`w-4 h-4 sm:w-5 sm:h-5 ${isCompleted ? 'text-[#00C471]' : 'text-[#B5B5B5]'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1 gap-2">
            <h3 className={`font-bold text-[14px] sm:text-[15px] md:text-[16px] flex-1 min-w-0 break-words ${isCompleted ? 'text-[#111111]' : 'text-[#606060]'}`}>
              {title}
            </h3>
            {xpReward ? (
              <span className="text-[12px] sm:text-[13px] md:text-[14px] font-bold text-[#4285F4] flex-shrink-0">+{xpReward} XP</span>
            ) : null}
          </div>
          <p className="text-[12px] sm:text-[13px] text-[#929292] mb-2 line-clamp-2 break-words">{description}</p>
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-[12px] text-[#929292] mb-2">
            <span className="px-2 py-0.5 sm:py-1 bg-[#F8F9FA] rounded-full whitespace-nowrap">{categoryLabel}</span>
            {tier && <span className={`${tierClass} whitespace-nowrap`}>{tier}</span>}
            {item.completedAt && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {formatDate(item.completedAt)} 완료
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[12px] text-[#929292]">
              <span>{isCompleted ? '완료됨' : '진행중'}</span>
              <span>
                {currentProgress}
                {targetValue ? ` / ${targetValue}` : ''}
              </span>
            </div>
            <div className="w-full bg-[#F1F3F5] rounded-full h-2">
              <div
                className={`h-2 rounded-full ${isCompleted ? 'bg-[#00C471]' : 'bg-[#00C471]/60'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsOverview = ({ stats }) => {
  if (!stats) return null;

  // 안전하게 숫자 추출
  const safeNumber = (value, defaultValue = 0) => {
    if (typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)) {
      return value;
    }
    return defaultValue;
  };

  const completionRate = Math.round(safeNumber(stats.completionRate, 0));
  const completedAchievements = safeNumber(stats.completedAchievements, 0);
  const inProgressAchievements = safeNumber(stats.inProgressAchievements, 0);
  const totalXpEarned = safeNumber(stats.totalXpEarned, 0);
  const unclaimedRewards = safeNumber(stats.unclaimedRewards, 0);

  return (
    <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7]">
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
        <h2 className="text-[16px] sm:text-[18px] font-bold text-[#111111] break-words">나의 진행 상황</h2>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C471]" />
          <span className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-[#111111] break-words">완료율 {completionRate}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="text-center">
          <div className="text-[20px] sm:text-[24px] font-bold text-[#00C471] mb-1 break-words">{completedAchievements}</div>
          <div className="text-[11px] sm:text-[12px] text-[#929292] break-words">완료한 배지</div>
        </div>
        <div className="text-center">
          <div className="text-[20px] sm:text-[24px] font-bold text-[#111111] mb-1 break-words">{inProgressAchievements}</div>
          <div className="text-[11px] sm:text-[12px] text-[#929292] break-words">진행 중</div>
        </div>
        <div className="text-center">
          <div className="text-[20px] sm:text-[24px] font-bold text-[#4285F4] mb-1 break-words">{totalXpEarned}</div>
          <div className="text-[11px] sm:text-[12px] text-[#929292] break-words">누적 XP</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[12px] text-[#929292] mb-2">
          <span>전체 진행률</span>
          <span>{completionRate}%</span>
        </div>
        <div className="w-full bg-[#F1F3F5] rounded-full h-3">
          <div
            className="bg-[#00C471] h-3 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
          />
        </div>
        {unclaimedRewards > 0 ? (
          <p className="text-[12px] text-[#929292] mt-2 flex items-center gap-1">
            <Gift className="w-3 h-3 text-[#FFA000]" />
            아직 수령하지 않은 보상 {unclaimedRewards}개가 있습니다.
          </p>
        ) : null}
      </div>
    </div>
  );
};

const CategoryFilter = ({ selected, onSelect }) => (
  <div className="bg-white px-4 sm:px-6 py-2 sm:py-3 border border-[#E7E7E7] rounded-[16px]">
    <div className="flex gap-2 overflow-x-auto pb-1">
      {['ALL', ...Object.values(ACHIEVEMENT_CATEGORIES)].map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[12px] sm:text-[13px] md:text-[14px] font-medium whitespace-nowrap transition-colors touch-manipulation ${
            selected === category ? 'bg-[#00C471] text-white' : 'bg-[#F1F3F5] text-[#606060] hover:bg-[#E7E7E7]'
          }`}
        >
          {CATEGORY_LABELS[category] || category}
        </button>
      ))}
    </div>
  </div>
);

const AchievementsList = ({ achievements = [], loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-[14px] text-[#929292]">
        업적을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  if (!Array.isArray(achievements) || achievements.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-12 h-12 text-[#B5B5B5] mx-auto mb-4" />
        <p className="text-[#929292]">해당 조건에 맞는 업적이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {achievements.map((item, index) => {
        // 안전한 key 생성: ID 우선, 없으면 인덱스 사용
        const itemId = item?.id ?? item?.achievement?.id;
        const safeKey = (itemId != null && typeof itemId !== 'object')
          ? `achievement-${itemId}`
          : `achievement-idx-${index}`;

        return <AchievementCard key={safeKey} item={item} />;
      })}
    </div>
  );
};

const RecentCompletions = ({ stats }) => {
  const items = stats?.recentCompletions ?? [];
  if (!items.length) return null;

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-[#00C471]" />
        <h3 className="text-[16px] font-bold text-[#111111]">최근 완료한 업적</h3>
      </div>
      <div className="space-y-3">
        {items.slice(0, 5).map((item, index) => (
          <div key={`${item.achievementTitle}-${index}`} className="flex items-center justify-between text-[14px] text-[#606060]">
            <span>{item.achievementTitle}</span>
            <span className="text-[12px] text-[#929292]">{formatDate(item.completedAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const UpcomingAchievements = ({ stats }) => {
  const items = stats?.nearCompletion ?? [];
  if (!items.length) return null;

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[#00C471]" />
        <h3 className="text-[16px] font-bold text-[#111111]">곧 달성 가능한 업적</h3>
      </div>
      <div className="space-y-3">
        {items.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-[14px] text-[#606060]">
            <span>{item.achievement?.title}</span>
            <span className="text-[12px] text-[#929292]">{Math.round(item.progressPercentage ?? 0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { achievements, stats, loading, error, refresh } = useAchievementOverview();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // 안전한 배열 보장
  const safeAchievements = Array.isArray(achievements) ? achievements : [];

  // ⚠️ useMemo 제거: React 19 참조 안정성 문제 방지
  // 직접 계산으로 변경 (safeAchievements가 이미 안정화되어 있으므로 성능 문제 없음)
  const filteredAchievements = selectedCategory === 'ALL'
    ? safeAchievements
    : safeAchievements.filter((item) => item.achievement?.category === selectedCategory);

  // 안전하게 숫자 추출
  const safeNumber = (value, defaultValue = 0) => {
    if (typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)) {
      return value;
    }
    return defaultValue;
  };

  const completedCount = safeNumber(stats?.completedAchievements, 0);
  const totalCount = safeNumber(stats?.totalAchievements, safeAchievements.length);
  const totalXp = safeNumber(stats?.totalXpEarned, 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111]" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <h1 className="text-[18px] sm:text-[20px] font-bold text-[#111111] break-words">성취 & 배지</h1>
                  <p className="text-[12px] sm:text-[13px] md:text-sm text-[#929292] break-words">
                    완료 {completedCount}/{totalCount} · 총 XP {totalXp}
                  </p>
                </div>
                <button
                  onClick={refresh}
                  className="px-3 py-1.5 text-[12px] sm:text-[13px] text-[#00C471] border border-[#00C471] rounded-full hover:bg-[#00C471]/10 touch-manipulation whitespace-nowrap flex-shrink-0"
                >
                  새로고침
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <StatsOverview stats={stats} />
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <AchievementsList achievements={filteredAchievements} loading={loading} error={error} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <RecentCompletions stats={stats} />
          <UpcomingAchievements stats={stats} />
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
