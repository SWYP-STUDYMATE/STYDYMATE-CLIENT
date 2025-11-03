import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Users, Globe, Clock, Calendar,
  Target, Award, MessageSquare, Video, ChevronRight,
  RefreshCw, Filter, ChevronDown
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  getStudyStats, 
  getSessionActivity
} from '../../api/analytics';
import WeeklyActivityChart from '../../components/profile/WeeklyActivityChart';
import LevelTestHistoryChart from '../../components/analytics/LevelTestHistoryChart';
import MatchingStatsChart from '../../components/analytics/MatchingStatsChart';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [studyStatsResponse, sessionActivityResponse] = await Promise.all([
        getStudyStats(timeRange),
        getSessionActivity(timeRange)
      ]);

      const data = transformApiDataToAnalyticsData(studyStatsResponse, sessionActivityResponse);
      setAnalyticsData(data);
    } catch (fetchError) {
      console.error('Analytics data loading failed:', fetchError);
      setAnalyticsData(null);
      setError('학습 통계를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  /**
   * API 응답 데이터를 컴포넌트에서 사용하는 형태로 변환
   */
  const transformApiDataToAnalyticsData = (studyStats, sessionActivity) => {
    // API 응답 구조에 따라 데이터 변환 로직 구현
    const metrics = studyStats?.metrics || {};
    const safeNumber = (value, defaultValue = 0) => {
      if (typeof value === 'number' && !Number.isNaN(value)) return value;
      return defaultValue;
    };
    
    const transformedData = {
      overview: {
        totalSessions: safeNumber(metrics.totalSessions, 0),
        totalMinutes: safeNumber(metrics.totalMinutes, 0),
        weeklyGrowth: safeNumber(metrics.weeklyGrowth, 0),
        currentStreak: safeNumber(metrics.currentStreak, 0),
        averageSessionTime: safeNumber(metrics.averageSessionTime, 0),
        partnersCount: safeNumber(metrics.partnersCount, 0)
      },
      sessionStats: sessionActivity?.metrics?.dailyStats || [],
      languageProgress: Array.isArray(studyStats?.metrics?.languageProgress) 
        ? studyStats.metrics.languageProgress 
        : [],
      sessionTypes: Array.isArray(studyStats?.metrics?.sessionTypes)
        ? studyStats.metrics.sessionTypes
        : [],
      weeklyGoals: typeof studyStats?.metrics?.weeklyGoals === 'object' && 
                   studyStats?.metrics?.weeklyGoals !== null &&
                   !Array.isArray(studyStats?.metrics?.weeklyGoals)
        ? {
            current: safeNumber(studyStats.metrics.weeklyGoals.current, 0),
            target: safeNumber(studyStats.metrics.weeklyGoals.target, 7),
            streak: safeNumber(studyStats.metrics.weeklyGoals.streak, 0)
          }
        : {
            current: 0,
            target: 7,
            streak: 0
          },
      topPartners: Array.isArray(studyStats?.metrics?.topPartners)
        ? studyStats.metrics.topPartners
        : []
    };
    
    return transformedData;
  };

  const getTimeRangeLabel = (range) => {
    switch (range) {
      case 'day': return '오늘';
      case 'week': return '이번 주';
      case 'month': return '이번 달';
      case 'year': return '올해';
      default: return '이번 주';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#929292]">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <div className="bg-white border border-[#FFE0E0] rounded-[16px] px-8 py-10 text-center max-w-lg shadow-sm">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#FFF5F5] flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#E53E3E]" />
          </div>
          <h2 className="text-[20px] font-bold text-[#111111] mb-2">통계 데이터를 불러올 수 없습니다</h2>
          <p className="text-[14px] text-[#606060] mb-6">{error}</p>
          <button
            type="button"
            onClick={loadAnalyticsData}
            className="px-5 py-2 rounded-[8px] bg-[#00C471] text-white text-[14px] font-semibold hover:bg-[#00B267] transition-colors"
          >
            다시 시도
          </button>
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
                <h1 className="text-xl font-bold text-[#111111]">학습 통계</h1>
                <p className="text-sm text-[#929292]">
                  {getTimeRangeLabel(timeRange)} 학습 현황
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Time Range Selector */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-white border border-[#E7E7E7] rounded-lg px-4 py-2 pr-8 text-[14px] focus:border-[#00C471] focus:outline-none"
                >
                  <option value="day">오늘</option>
                  <option value="week">이번 주</option>
                  <option value="month">이번 달</option>
                  <option value="year">올해</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#929292] pointer-events-none" />
              </div>

              <button
                onClick={loadAnalyticsData}
                className="p-2 text-[#666666] hover:text-[#111111] hover:bg-[#F1F3F5] rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-[16px] p-4 border border-[#E7E7E7]">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-[#00C471]/10 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-[#00C471]" />
              </div>
              <div className="text-right">
                <div className="text-[20px] font-bold text-[#111111]">
                  {typeof analyticsData.overview.totalSessions === 'number' 
                    ? analyticsData.overview.totalSessions 
                    : 0}
                </div>
                <div className="text-[12px] text-[#929292]">총 세션</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-[#00C471]" />
              <span className="text-[12px] text-[#00C471] font-medium">
                +{typeof analyticsData.overview.weeklyGrowth === 'number' 
                  ? analyticsData.overview.weeklyGrowth 
                  : 0}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[16px] p-4 border border-[#E7E7E7]">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-[#4285F4]/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#4285F4]" />
              </div>
              <div className="text-right">
                <div className="text-[20px] font-bold text-[#111111]">
                  {typeof analyticsData.overview.totalMinutes === 'number' 
                    ? `${Math.floor(analyticsData.overview.totalMinutes / 60)}h ${analyticsData.overview.totalMinutes % 60}m`
                    : '0h 0m'}
                </div>
                <div className="text-[12px] text-[#929292]">총 학습시간</div>
              </div>
            </div>
            <div className="text-[12px] text-[#666666]">
              평균 {typeof analyticsData.overview.averageSessionTime === 'number' 
                ? analyticsData.overview.averageSessionTime 
                : 0}분/세션
            </div>
          </div>

          <div className="bg-white rounded-[16px] p-4 border border-[#E7E7E7]">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-[#FF6B6B]" />
              </div>
              <div className="text-right">
                <div className="text-[20px] font-bold text-[#111111]">
                  {typeof analyticsData.overview.currentStreak === 'number' 
                    ? analyticsData.overview.currentStreak 
                    : 0}
                </div>
                <div className="text-[12px] text-[#929292]">연속 학습</div>
              </div>
            </div>
            <div className="text-[12px] text-[#666666]">
              일 연속
            </div>
          </div>

          <div className="bg-white rounded-[16px] p-4 border border-[#E7E7E7]">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-[#9C27B0]/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-[#9C27B0]" />
              </div>
              <div className="text-right">
                <div className="text-[20px] font-bold text-[#111111]">
                  {typeof analyticsData.overview.partnersCount === 'number' 
                    ? analyticsData.overview.partnersCount 
                    : 0}
                </div>
                <div className="text-[12px] text-[#929292]">파트너</div>
              </div>
            </div>
            <div className="text-[12px] text-[#666666]">
              활성 파트너
            </div>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-bold text-[#111111]">주간 목표</h3>
            <button className="text-[14px] text-[#00C471] font-medium">
              목표 수정
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-[14px] mb-2">
              <span className="text-[#666666]">
                {typeof analyticsData.weeklyGoals.current === 'number' && typeof analyticsData.weeklyGoals.target === 'number'
                  ? `${analyticsData.weeklyGoals.current}/${analyticsData.weeklyGoals.target} 세션 완료`
                  : '0/7 세션 완료'}
              </span>
              <span className="text-[#111111] font-semibold">
                {typeof analyticsData.weeklyGoals.current === 'number' && typeof analyticsData.weeklyGoals.target === 'number' && analyticsData.weeklyGoals.target > 0
                  ? Math.round((analyticsData.weeklyGoals.current / analyticsData.weeklyGoals.target) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-[#E7E7E7] rounded-full h-3">
              <div 
                className="bg-[#00C471] h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${typeof analyticsData.weeklyGoals.current === 'number' && typeof analyticsData.weeklyGoals.target === 'number' && analyticsData.weeklyGoals.target > 0
                    ? Math.min(100, Math.round((analyticsData.weeklyGoals.current / analyticsData.weeklyGoals.target) * 100))
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-[12px]">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#00C471] rounded-full"></div>
              <span className="text-[#666666]">
                {typeof analyticsData.weeklyGoals.streak === 'number' 
                  ? `${analyticsData.weeklyGoals.streak}일`
                  : '0일'} 연속 목표 달성
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <WeeklyActivityChart data={analyticsData.sessionStats} />

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Session Activity Chart */}
          <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
            <h3 className="text-[18px] font-bold text-[#111111] mb-4">세션 활동</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.sessionStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#929292"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#929292" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E7E7E7',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#00C471" 
                    strokeWidth={3}
                    dot={{ fill: '#00C471', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#00C471', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Session Types Pie Chart */}
          <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
            <h3 className="text-[18px] font-bold text-[#111111] mb-4">세션 유형</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.sessionTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.sessionTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {analyticsData.sessionTypes.map((type, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <span className="text-[12px] text-[#666666]">
                    {type.name} ({type.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Analytics Charts */}
        <LevelTestHistoryChart timeRange={timeRange} />
        <MatchingStatsChart timeRange={timeRange} />

        {/* Language Progress */}
        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[18px] font-bold text-[#111111]">언어별 진도</h3>
            <button 
              onClick={() => navigate('/profile')}
              className="text-[14px] text-[#00C471] font-medium flex items-center space-x-1"
            >
              <span>자세히 보기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {analyticsData.languageProgress.map((lang, index) => (
              <div key={index} className="border border-[#E7E7E7] rounded-[12px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#F1F3F5] rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[#00C471]" />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-semibold text-[#111111]">{lang.language}</h4>
                      <p className="text-[14px] text-[#929292]">{lang.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[16px] font-bold text-[#111111]">{lang.progress}%</div>
                    <div className="text-[12px] text-[#929292]">{lang.sessions} 세션</div>
                  </div>
                </div>
                
                <div className="w-full bg-[#E7E7E7] rounded-full h-2">
                  <div 
                    className="bg-[#00C471] h-2 rounded-full transition-all duration-700"
                    style={{ width: `${lang.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Partners */}
        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-bold text-[#111111]">주요 파트너</h3>
            <button 
              onClick={() => navigate('/matching')}
              className="text-[14px] text-[#00C471] font-medium"
            >
              모든 파트너 보기
            </button>
          </div>

          <div className="space-y-3">
            {analyticsData.topPartners.map((partner, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-[#F9F9F9] rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="text-[20px]">{partner.flag}</div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-[#111111]">{partner.name}</h4>
                    <p className="text-[12px] text-[#929292]">{partner.sessions}번 세션</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-[#FFD700]" />
                    <span className="text-[12px] font-medium text-[#111111]">{partner.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
