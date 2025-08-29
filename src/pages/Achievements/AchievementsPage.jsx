import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Calendar, 
  BookOpen, 
  MessageSquare,
  Users,
  Clock,
  ChevronRight,
  Lock
} from 'lucide-react';

const AchievementsPage = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
    loadStats();
  }, []);

  const loadAchievements = async () => {
    // Mock 데이터 - 실제로는 API에서 가져옴
    const mockAchievements = [
      {
        id: '1',
        title: '첫 걸음',
        description: '첫 번째 세션을 완료했습니다',
        icon: BookOpen,
        category: 'session',
        isUnlocked: true,
        unlockedAt: '2024-01-15T10:00:00Z',
        progress: 100,
        maxProgress: 100,
        rarity: 'common',
        points: 10
      },
      {
        id: '2',
        title: '대화의 달인',
        description: '10번의 채팅 세션을 완료했습니다',
        icon: MessageSquare,
        category: 'chat',
        isUnlocked: true,
        unlockedAt: '2024-01-20T14:30:00Z',
        progress: 10,
        maxProgress: 10,
        rarity: 'rare',
        points: 25
      },
      {
        id: '3',
        title: '연속 학습',
        description: '7일 연속으로 세션에 참여했습니다',
        icon: Calendar,
        category: 'streak',
        isUnlocked: false,
        progress: 5,
        maxProgress: 7,
        rarity: 'epic',
        points: 50
      },
      {
        id: '4',
        title: '파트너 메이커',
        description: '5명의 새로운 파트너와 매칭했습니다',
        icon: Users,
        category: 'social',
        isUnlocked: false,
        progress: 3,
        maxProgress: 5,
        rarity: 'rare',
        points: 30
      }
    ];

    setAchievements(mockAchievements);
    setLoading(false);
  };

  const loadStats = () => {
    // Mock 통계 데이터
    setStats({
      totalPoints: 35,
      unlockedCount: 2,
      totalCount: 4,
      rank: 'Bronze',
      nextRankPoints: 100
    });
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getRarityBg = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100';
      case 'rare': return 'bg-blue-100';
      case 'epic': return 'bg-purple-100';
      case 'legendary': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'session': return '세션';
      case 'chat': return '채팅';
      case 'streak': return '연속';
      case 'social': return '소셜';
      default: return '일반';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#929292]">성취를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-[#111111] rotate-180" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#111111]">성취 & 배지</h1>
              <p className="text-sm text-[#929292]">
                {stats.unlockedCount}/{stats.totalCount} 달성 • {stats.totalPoints} 포인트
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-[#111111]">나의 진행 상황</h2>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-[#00C471]" />
              <span className="text-[14px] font-semibold text-[#111111]">{stats.rank}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-[24px] font-bold text-[#00C471] mb-1">
                {stats.totalPoints}
              </div>
              <div className="text-[12px] text-[#929292]">총 포인트</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-[#111111] mb-1">
                {stats.unlockedCount}
              </div>
              <div className="text-[12px] text-[#929292]">달성한 배지</div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold text-[#929292] mb-1">
                {stats.nextRankPoints - stats.totalPoints}
              </div>
              <div className="text-[12px] text-[#929292]">다음 등급까지</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[12px] text-[#929292] mb-2">
              <span>Silver까지 진행률</span>
              <span>{Math.round((stats.totalPoints / stats.nextRankPoints) * 100)}%</span>
            </div>
            <div className="w-full bg-[#E7E7E7] rounded-full h-2">
              <div 
                className="bg-[#00C471] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stats.totalPoints / stats.nextRankPoints) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold text-[#111111]">모든 성취</h3>
          
          <div className="grid gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-[16px] p-4 border transition-all ${
                    achievement.isUnlocked
                      ? 'border-[#00C471] shadow-sm'
                      : 'border-[#E7E7E7] opacity-75'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.isUnlocked 
                        ? `${getRarityBg(achievement.rarity)}` 
                        : 'bg-[#F1F3F5]'
                    }`}>
                      {achievement.isUnlocked ? (
                        <Icon className={`w-6 h-6 ${getRarityColor(achievement.rarity)}`} />
                      ) : (
                        <Lock className="w-6 h-6 text-[#929292]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className={`text-[16px] font-semibold ${
                            achievement.isUnlocked ? 'text-[#111111]' : 'text-[#929292]'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-[14px] ${
                            achievement.isUnlocked ? 'text-[#666666]' : 'text-[#929292]'
                          }`}>
                            {achievement.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`text-[12px] px-2 py-1 rounded-full ${
                            achievement.isUnlocked
                              ? `${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)}`
                              : 'bg-[#F1F3F5] text-[#929292]'
                          }`}>
                            {getCategoryName(achievement.category)}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-[#FFD700]" />
                            <span className="text-[12px] font-semibold text-[#111111]">
                              {achievement.points}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      {!achievement.isUnlocked && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[12px] text-[#929292] mb-1">
                            <span>진행률</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-[#E7E7E7] rounded-full h-1.5">
                            <div 
                              className="bg-[#00C471] h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Unlocked Date */}
                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <div className="mt-2 flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-[#929292]" />
                          <span className="text-[12px] text-[#929292]">
                            {new Date(achievement.unlockedAt).toLocaleDateString('ko-KR')} 달성
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#00C471] to-[#00B267] rounded-[20px] p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-bold mb-1">더 많은 성취를 달성해보세요!</h3>
              <p className="text-[14px] text-white/80">
                매일 세션에 참여하고 새로운 파트너와 대화해보세요.
              </p>
            </div>
            <button
              onClick={() => navigate('/sessions')}
              className="bg-white text-[#00C471] px-4 py-2 rounded-lg text-[14px] font-medium hover:bg-white/90 transition-colors"
            >
              세션 시작
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;