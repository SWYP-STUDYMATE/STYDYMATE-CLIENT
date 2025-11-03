import React from 'react';
import { toDisplayText } from '../utils/text';

const renderBadgeIcon = (achievement) => {
  // 안전하게 achievement 객체 추출
  const rawAchievement = achievement?.achievement || achievement;
  const safeAchievement = rawAchievement && typeof rawAchievement === 'object' && !Array.isArray(rawAchievement)
    ? rawAchievement
    : (typeof rawAchievement === 'string' ? { title: rawAchievement } : {});
  
  const iconUrl = safeAchievement?.badgeIconUrl || achievement?.badgeIconUrl;
  const badgeColor = safeAchievement?.badgeColor || achievement?.badgeColor || '#E6F9F1';
  
  // 안전하게 title 추출
  const titleRaw = safeAchievement?.title || achievement?.title || safeAchievement?.name || achievement?.name;
  const title = toDisplayText(titleRaw, '성취 배지');

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={title}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center text-[24px] font-bold text-[#00C471]"
      style={{ backgroundColor: `${badgeColor}33` }}
    >
      {title.slice(0, 1)}
    </div>
  );
};

const AchievementBadgeCard = ({ item }) => {
  // 안전하게 achievement 객체 추출
  const rawAchievement = item?.achievement || item;
  const achievement = rawAchievement && typeof rawAchievement === 'object' && !Array.isArray(rawAchievement) 
    ? rawAchievement 
    : (typeof rawAchievement === 'string' ? { title: rawAchievement } : {});
  
  const isCompleted = typeof item?.isCompleted === 'boolean' ? item.isCompleted : false;
  const progressPercentage = typeof item?.progressPercentage === 'number' && !Number.isNaN(item.progressPercentage)
    ? item.progressPercentage 
    : (isCompleted ? 100 : 0);
  
  // 안전하게 title 추출
  const titleRaw = achievement?.title || item?.title || achievement?.name || item?.name;
  const title = toDisplayText(titleRaw, '성취 배지');
  
  // 안전하게 description 추출
  const descriptionRaw = achievement?.description || item?.description || achievement?.details || item?.details;
  const description = toDisplayText(descriptionRaw, '') || '';
  
  const progress = isCompleted ? 100 : Math.min(100, Math.max(0, progressPercentage ?? 0));

  return (
    <div className="bg-white rounded-[10px] p-4 w-[250px] h-[250px] flex flex-col items-center justify-between flex-shrink-0 border border-[#E7E7E7]">
      <div className="w-[150px] h-[120px] rounded mb-4 overflow-hidden flex items-center justify-center">
        {renderBadgeIcon(item)}
      </div>
      <div className="text-center">
        <p className="text-[18px] font-bold text-[#111111] mb-1">{title}</p>
        <p className="text-[13px] text-[#606060] line-clamp-2 min-h-[36px]">{description}</p>
      </div>
      <div className="w-full mt-3">
        <div className="flex items-center justify-between text-[12px] text-[#929292] mb-1">
          <span>{isCompleted ? '완료됨' : '진행중'}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-[#F1F3F5] rounded-full h-2">
          <div
            className={`h-2 rounded-full ${isCompleted ? 'bg-[#00C471]' : 'bg-[#00C471]/60'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function AchievementBadges({
  achievements = [],
  stats = null,
  loading = false,
  error = null,
  limit = 4,
  onRefresh = null,
}) {
  // ⚠️ useMemo 제거: React 19 무한 루프 방지
  // achievements prop이 stabilizeRef로 안정화되므로 직접 변환해도 성능 문제 없음
  const sanitizedAchievements = !Array.isArray(achievements) ? [] : achievements.map((item) => {
    const normalizedTitle = toDisplayText(item.achievement?.title || item.title || item.name, '성취 배지');
    const normalizedDescription = toDisplayText(item.achievement?.description || item.description || item.details, '') || '';

    return {
      ...item,
      title: normalizedTitle,
      description: normalizedDescription,
      achievement: {
        ...item.achievement,
        title: normalizedTitle,
        description: normalizedDescription,
        badgeColor: item.achievement?.badgeColor || '#E6F9F1'
      }
    };
  });

  if (loading) {
    return (
      <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
        <div className="text-center mb-6">
          <div className="h-6 bg-[#F1F3F5] rounded w-1/3 mx-auto animate-pulse" />
          <div className="h-5 bg-[#F1F3F5] rounded w-1/2 mx-auto mt-3 animate-pulse" />
        </div>
        <div className="flex justify-center space-x-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="w-[250px] h-[250px] bg-[#F8F9FA] rounded-[10px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] text-center">
        <h2 className="text-[18px] font-bold text-[#111111] mb-2">🏆 성취 배지</h2>
        <p className="text-[14px] text-[#929292]">성취 배지를 불러오지 못했습니다.</p>
      </div>
    );
  }

  // 안전하게 숫자 추출
  const safeNumber = (value, defaultValue = 0) => {
    if (typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)) {
      return value;
    }
    return defaultValue;
  };

  const completedCountRaw = stats?.completedAchievements;
  const totalCountRaw = stats?.totalAchievements;

  const completedCount = completedCountRaw != null 
    ? safeNumber(completedCountRaw, sanitizedAchievements.filter((item) => item.isCompleted).length)
    : sanitizedAchievements.filter((item) => item.isCompleted).length;
  const totalCount = totalCountRaw != null
    ? safeNumber(totalCountRaw, sanitizedAchievements.length)
    : sanitizedAchievements.length;

  // ⚠️ useMemo 제거: sanitizedAchievements 의존성 문제로 무한 루프 발생
  // achievements prop이 stabilizeRef로 안정화되므로 직접 계산해도 성능 문제 없음
  let progressList = [];
  if (Array.isArray(sanitizedAchievements) && sanitizedAchievements.length > 0) {
    try {
      progressList = [...sanitizedAchievements]
        .sort((a, b) => {
          // 안전한 문자열 비교
          const dateA = a?.completedAt ?? '';
          const dateB = b?.completedAt ?? '';

          if (typeof dateA !== 'string' || typeof dateB !== 'string') return 0;

          return dateB.localeCompare(dateA);
        })
        .slice(0, limit);
    } catch (error) {
      console.error('[AchievementBadges] progressList 처리 오류:', error);
      progressList = [];
    }
  }

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
      <div className="mb-6 flex flex-col items-center space-y-3">
        <div className="text-center">
          <h2 className="text-[24px] font-extrabold text-[#111111] mb-2">🏆 성취 배지</h2>
          <div className="text-[14px] text-[#606060]">
            완료 {completedCount}개 · 총 {totalCount}개
          </div>
        </div>

        {typeof onRefresh === 'function' && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-2 text-sm font-medium text-[#00C471] border border-[#00C471] rounded-full hover:bg-[#E6F9F1] transition-colors"
          >
            새로고침
          </button>
        )}
      </div>

      {progressList.length === 0 ? (
        <p className="text-[14px] text-[#929292] text-center">아직 획득한 배지가 없습니다. 첫 성취를 달성해보세요!</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {progressList.map((item, index) => {
            // 안전한 key 생성: id 우선, 없으면 achievement.id, 둘 다 없으면 index 사용
            const safeKey = item?.id ?? item?.achievement?.id ?? `achievement-${index}`;
            return <AchievementBadgeCard key={safeKey} item={item} />;
          })}
        </div>
      )}
    </div>
  );
}
