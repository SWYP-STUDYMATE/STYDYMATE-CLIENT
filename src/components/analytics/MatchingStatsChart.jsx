import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, Heart, TrendingUp, Clock, Target, UserCheck } from 'lucide-react';
import { getMatchingStats, generateMockAnalyticsData } from '../../api/analytics';

const MatchingStatsChart = ({ timeRange = 'month' }) => {
  const [matchingData, setMatchingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('success-rate'); // 'success-rate', 'frequency', 'duration', 'type'

  useEffect(() => {
    loadMatchingStats();
  }, [timeRange]);

  const loadMatchingStats = async () => {
    setLoading(true);
    
    try {
      let data;
      
      const response = await getMatchingStats(timeRange);
      data = transformMatchingData(response);
      
      setMatchingData(data);
    } catch (error) {
      console.error('Matching stats loading failed:', error);
      
      // 에러 시 Mock 데이터 사용
      const fallbackData = generateMockMatchingStats();
      setMatchingData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMatchingStats = () => {
    const currentDate = new Date();
    const data = [];
    
    // 최근 30일간의 매칭 데이터 생성
    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      const requests = Math.floor(Math.random() * 10) + 2; // 2-12 requests per day
      const successful = Math.floor(requests * (0.6 + Math.random() * 0.3)); // 60-90% success rate
      const failed = requests - successful;
      
      data.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        requests,
        successful,
        failed,
        successRate: ((successful / requests) * 100).toFixed(1),
        avgWaitTime: Math.floor(Math.random() * 300) + 30, // 30초 - 5분
        avgSessionDuration: Math.floor(Math.random() * 60) + 15 // 15-75분
      });
    }
    
    const totalRequests = data.reduce((sum, d) => sum + d.requests, 0);
    const totalSuccessful = data.reduce((sum, d) => sum + d.successful, 0);
    const totalFailed = data.reduce((sum, d) => sum + d.failed, 0);
    const overallSuccessRate = ((totalSuccessful / totalRequests) * 100).toFixed(1);
    
    // 매칭 타입별 분포
    const matchingTypes = [
      { name: '1:1 회화', value: 45, color: '#00C471' },
      { name: '그룹 세션', value: 25, color: '#4285F4' },
      { name: '랜덤 매칭', value: 20, color: '#FFB800' },
      { name: '주제별 토론', value: 10, color: '#FF6B6B' }
    ];
    
    // 언어별 매칭 성공률
    const languageStats = [
      { language: 'English', attempts: 120, successful: 108, successRate: 90 },
      { language: 'Japanese', attempts: 85, successful: 72, successRate: 84.7 },
      { language: 'Chinese', attempts: 56, successful: 45, successRate: 80.4 },
      { language: 'Korean', attempts: 42, successful: 38, successRate: 90.5 }
    ];
    
    // 시간대별 매칭 성공률
    const hourlyStats = [];
    for (let hour = 0; hour < 24; hour++) {
      const baseSuccessRate = hour >= 9 && hour <= 21 ? 80 : 60; // 9시-21시가 성공률 높음
      const variance = Math.random() * 20 - 10; // ±10% 변동
      
      hourlyStats.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        successRate: Math.max(30, Math.min(95, baseSuccessRate + variance)).toFixed(1),
        attempts: Math.floor(Math.random() * 20) + 1
      });
    }
    
    return {
      dailyStats: data,
      summary: {
        totalRequests,
        totalSuccessful,
        totalFailed,
        overallSuccessRate,
        avgWaitTime: Math.round(data.reduce((sum, d) => sum + d.avgWaitTime, 0) / data.length),
        avgSessionDuration: Math.round(data.reduce((sum, d) => sum + d.avgSessionDuration, 0) / data.length)
      },
      matchingTypes,
      languageStats,
      hourlyStats
    };
  };

  const transformMatchingData = (apiResponse) => {
    // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
    const events = apiResponse?.matchingEvents || [];
    
    // API 데이터 변환 로직 구현
    return generateMockMatchingStats(); // 임시로 Mock 데이터 반환
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[var(--black-500)]">매칭 성공률 통계</h3>
          <div className="w-32 h-8 bg-[var(--black-50)] rounded animate-pulse"></div>
        </div>
        
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[14px] text-[var(--black-300)]">매칭 통계 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!matchingData?.summary.totalRequests) {
    return (
      <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[var(--black-500)]">매칭 성공률 통계</h3>
        </div>
        
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <Users className="w-12 h-12 text-[var(--black-200)] mx-auto mb-4" />
            <p className="text-[16px] text-[var(--black-300)] mb-2">아직 매칭 기록이 없습니다</p>
            <p className="text-[14px] text-[var(--black-200)]">매칭을 시도하면 여기에 통계가 표시됩니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const renderSuccessRateChart = () => (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={matchingData.dailyStats}>
        <defs>
          <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00C471" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#00C471" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--black-50)" />
        <XAxis 
          dataKey="day" 
          stroke="var(--black-300)"
          fontSize={12}
        />
        <YAxis 
          stroke="var(--black-300)"
          fontSize={12}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid var(--black-50)',
            borderRadius: '8px'
          }}
          formatter={(value, name) => [`${value}%`, '성공률']}
        />
        <Area 
          type="monotone" 
          dataKey="successRate" 
          stroke="#00C471"
          strokeWidth={2}
          fill="url(#successGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderFrequencyChart = () => (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={matchingData.dailyStats.slice(-14)}> {/* 최근 2주 */}
        <CartesianGrid strokeDasharray="3 3" stroke="var(--black-50)" />
        <XAxis 
          dataKey="day" 
          stroke="var(--black-300)"
          fontSize={12}
        />
        <YAxis 
          stroke="var(--black-300)"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid var(--black-50)',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey="successful" fill="#00C471" name="성공" radius={[2, 2, 0, 0]} />
        <Bar dataKey="failed" fill="#FF6B6B" name="실패" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderTypeDistribution = () => (
    <div className="flex items-center justify-center">
      <div className="w-80 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={matchingData.matchingTypes}
              cx="50%"
              cy="50%"
              outerRadius={120}
              paddingAngle={3}
              dataKey="value"
            >
              {matchingData.matchingTypes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="ml-8">
        <h4 className="text-[16px] font-bold text-[var(--black-500)] mb-4">매칭 타입별 분포</h4>
        {matchingData.matchingTypes.map((type, index) => (
          <div key={index} className="flex items-center mb-3">
            <div 
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: type.color }}
            />
            <div className="flex-1">
              <div className="text-[14px] text-[var(--black-500)] font-medium">{type.name}</div>
              <div className="text-[12px] text-[var(--black-300)]">{type.value}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLanguageStats = () => (
    <div className="space-y-4">
      {matchingData.languageStats.map((lang, index) => (
        <div key={index} className="border border-[var(--black-50)] rounded-[12px] p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[16px] font-semibold text-[var(--black-500)]">{lang.language}</h4>
            <span className="text-[14px] font-bold text-[#00C471]">{lang.successRate}%</span>
          </div>
          <div className="flex items-center justify-between text-[12px] text-[var(--black-300)] mb-2">
            <span>{lang.successful}/{lang.attempts} 성공</span>
            <span>{lang.attempts - lang.successful} 실패</span>
          </div>
          <div className="w-full bg-[var(--black-50)] rounded-full h-2">
            <div 
              className="bg-[#00C471] h-2 rounded-full transition-all duration-500"
              style={{ width: `${lang.successRate}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[18px] font-bold text-[var(--black-500)]">매칭 성공률 통계</h3>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="px-3 py-2 text-[14px] border border-[var(--black-50)] rounded-lg bg-white text-[var(--black-500)] focus:border-[#00C471] focus:outline-none"
          >
            <option value="success-rate">성공률 추이</option>
            <option value="frequency">매칭 빈도</option>
            <option value="type">타입별 분포</option>
            <option value="language">언어별 성공률</option>
          </select>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-[var(--green-50)] rounded-[12px]">
          <div className="w-10 h-10 bg-[#00C471] rounded-full flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="text-[20px] font-bold text-[var(--black-500)]">
            {matchingData.summary.overallSuccessRate}%
          </div>
          <div className="text-[12px] text-[var(--black-300)]">전체 성공률</div>
        </div>

        <div className="text-center p-4 bg-[#F0F8FF] rounded-[12px]">
          <div className="w-10 h-10 bg-[#4285F4] rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="text-[20px] font-bold text-[var(--black-500)]">
            {matchingData.summary.totalRequests}
          </div>
          <div className="text-[12px] text-[var(--black-300)]">총 매칭 시도</div>
        </div>

        <div className="text-center p-4 bg-[#FFF8E1] rounded-[12px]">
          <div className="w-10 h-10 bg-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="text-[20px] font-bold text-[var(--black-500)]">
            {Math.floor(matchingData.summary.avgWaitTime / 60)}:{(matchingData.summary.avgWaitTime % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-[12px] text-[var(--black-300)]">평균 대기시간</div>
        </div>

        <div className="text-center p-4 bg-[#FFE6F0] rounded-[12px]">
          <div className="w-10 h-10 bg-[#FF6B6B] rounded-full flex items-center justify-center mx-auto mb-2">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div className="text-[20px] font-bold text-[var(--black-500)]">
            {matchingData.summary.avgSessionDuration}분
          </div>
          <div className="text-[12px] text-[var(--black-300)]">평균 세션시간</div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="mb-6">
        {selectedView === 'success-rate' && renderSuccessRateChart()}
        {selectedView === 'frequency' && renderFrequencyChart()}
        {selectedView === 'type' && renderTypeDistribution()}
        {selectedView === 'language' && renderLanguageStats()}
      </div>

      {/* 최근 매칭 성과 */}
      <div className="pt-4 border-t border-[var(--black-50)]">
        <h4 className="text-[16px] font-bold text-[var(--black-500)] mb-3">최근 7일 성과</h4>
        <div className="grid grid-cols-7 gap-2">
          {matchingData.dailyStats.slice(-7).map((day, index) => (
            <div key={index} className="text-center p-2 bg-[var(--green-50)] rounded-lg">
              <div className="text-[12px] text-[var(--black-300)] mb-1">
                {new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-[16px] font-bold text-[#00C471]">{day.successRate}%</div>
              <div className="text-[10px] text-[var(--black-200)]">
                {day.successful}/{day.requests}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchingStatsChart;