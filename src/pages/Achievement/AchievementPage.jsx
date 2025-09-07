import React, { useState, useEffect } from 'react';
import { 
  getMyAchievements, 
  getMyAchievementStats, 
  claimAchievementReward,
  ACHIEVEMENT_CATEGORIES 
} from '../../api/achievement';
import Header from '../../components/Header';
import { useAlert } from '../../hooks/useAlert';
import { Trophy, Star, Target, Award, TrendingUp, Gift } from 'lucide-react';

export default function AchievementPage() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useAlert();

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [achievementsData, statsData] = await Promise.all([
        getMyAchievements(),
        getMyAchievementStats()
      ]);
      
      setAchievements(achievementsData.data || []);
      setStats(statsData.data || {});
    } catch (error) {
      showError('업적 정보를 불러오는데 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (achievementId) => {
    try {
      await claimAchievementReward(achievementId);
      showSuccess('보상을 수령했습니다!');
      await loadAchievements(); // 리로드
    } catch (error) {
      showError('보상 수령에 실패했습니다.');
      console.error(error);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'STUDY': return <Trophy className="w-5 h-5" />;
      case 'SOCIAL': return <Star className="w-5 h-5" />;
      case 'MILESTONE': return <Target className="w-5 h-5" />;
      case 'SPECIAL': return <Award className="w-5 h-5" />;
      case 'STREAK': return <TrendingUp className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category) => {
    const names = {
      'ALL': '전체',
      'STUDY': '학습',
      'SOCIAL': '소셜',
      'MILESTONE': '마일스톤',
      'SPECIAL': '특별',
      'STREAK': '연속'
    };
    return names[category] || category;
  };

  const filteredAchievements = selectedCategory === 'ALL' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  if (loading) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen max-w-[768px] w-full mx-auto">
        <Header />
        <div className="flex justify-center items-center h-[400px]">
          <div className="text-[#929292]">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      
      {/* 통계 섹션 */}
      <div className="bg-white p-6 border-b border-[#E7E7E7]">
        <h1 className="text-[24px] font-bold text-[#111111] mb-4">나의 업적</h1>
        
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-[24px] font-bold text-[#00C471]">
                {stats.completedCount || 0}
              </div>
              <div className="text-[12px] text-[#929292]">완료</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-[#111111]">
                {stats.inProgressCount || 0}
              </div>
              <div className="text-[12px] text-[#929292]">진행중</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-[#4285F4]">
                {stats.totalPoints || 0}
              </div>
              <div className="text-[12px] text-[#929292]">포인트</div>
            </div>
          </div>
        )}

        {/* 진행률 바 */}
        <div className="bg-[#F1F3F5] rounded-full h-2 overflow-hidden">
          <div 
            className="bg-[#00C471] h-full transition-all duration-500"
            style={{ 
              width: `${stats ? (stats.completedCount / (stats.totalCount || 1) * 100) : 0}%` 
            }}
          />
        </div>
        <div className="text-[12px] text-[#929292] mt-1 text-right">
          {stats?.completedCount || 0} / {stats?.totalCount || 0} 완료
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="bg-white px-6 py-3 border-b border-[#E7E7E7]">
        <div className="flex gap-2 overflow-x-auto">
          {['ALL', ...Object.values(ACHIEVEMENT_CATEGORIES)].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors
                ${selectedCategory === category 
                  ? 'bg-[#00C471] text-white' 
                  : 'bg-[#F1F3F5] text-[#606060] hover:bg-[#E7E7E7]'
                }`}
            >
              {getCategoryName(category)}
            </button>
          ))}
        </div>
      </div>

      {/* 업적 리스트 */}
      <div className="p-6">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-[#B5B5B5] mx-auto mb-4" />
            <p className="text-[#929292]">아직 업적이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-[10px] p-4 border transition-all
                  ${achievement.isCompleted 
                    ? 'border-[#00C471] shadow-sm' 
                    : 'border-[#E7E7E7]'
                  }`}
              >
                <div className="flex items-start gap-4">
                  {/* 아이콘 */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center
                    ${achievement.isCompleted 
                      ? 'bg-[#E6F9F1]' 
                      : 'bg-[#F1F3F5]'
                    }`}
                  >
                    <div className={achievement.isCompleted ? 'text-[#00C471]' : 'text-[#B5B5B5]'}>
                      {getCategoryIcon(achievement.category)}
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-bold text-[16px] 
                        ${achievement.isCompleted ? 'text-[#111111]' : 'text-[#606060]'}`}
                      >
                        {achievement.title}
                      </h3>
                      {achievement.points > 0 && (
                        <span className="text-[14px] font-bold text-[#4285F4]">
                          +{achievement.points}P
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[14px] text-[#929292] mb-2">
                      {achievement.description}
                    </p>

                    {/* 진행 바 */}
                    {!achievement.isCompleted && (
                      <div className="mb-2">
                        <div className="bg-[#F1F3F5] rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#00C471] h-full transition-all"
                            style={{ 
                              width: `${(achievement.currentProgress / achievement.targetProgress) * 100}%` 
                            }}
                          />
                        </div>
                        <div className="text-[12px] text-[#929292] mt-1">
                          {achievement.currentProgress} / {achievement.targetProgress}
                        </div>
                      </div>
                    )}

                    {/* 보상 수령 버튼 */}
                    {achievement.isCompleted && !achievement.isRewardClaimed && (
                      <button
                        onClick={() => handleClaimReward(achievement.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00C471] text-white 
                          rounded-[6px] text-[14px] font-medium hover:bg-[#00B267] transition-colors"
                      >
                        <Gift className="w-4 h-4" />
                        보상 수령
                      </button>
                    )}

                    {/* 완료 날짜 */}
                    {achievement.isCompleted && achievement.completedAt && (
                      <div className="text-[12px] text-[#929292] mt-2">
                        완료: {new Date(achievement.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}