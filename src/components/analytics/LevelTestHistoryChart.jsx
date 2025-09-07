import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Calendar, TrendingUp, Award, Target } from 'lucide-react';
import { getLevelTestHistory, generateMockAnalyticsData } from '../../api/analytics';

const LevelTestHistoryChart = ({ timeRange = 'year' }) => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('progress'); // 'progress', 'frequency', 'distribution'

  useEffect(() => {
    loadLevelTestHistory();
  }, [timeRange]);

  const loadLevelTestHistory = async () => {
    setLoading(true);
    
    try {
      let data;
      
      const response = await getLevelTestHistory();
      data = transformLevelTestData(response);
      
      setHistoryData(data);
    } catch (error) {
      console.error('Level test history loading failed:', error);
      
      // 에러 시 Mock 데이터 사용
      const fallbackData = generateMockLevelTestHistory();
      setHistoryData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockLevelTestHistory = () => {
    const tests = [];
    const languages = ['English', 'Japanese', 'Chinese'];
    const levels = ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced'];
    
    // 최근 12개월 동안의 레벨 테스트 데이터 생성
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      if (Math.random() > 0.6) { // 40% 확률로 레벨 테스트 실시
        const language = languages[Math.floor(Math.random() * languages.length)];
        const levelIndex = Math.min(Math.floor(Math.random() * 5), 4);
        
        tests.push({
          date: date.toISOString().split('T')[0],
          month: date.toLocaleDateString('ko-KR', { month: 'short' }),
          language,
          level: levels[levelIndex],
          levelIndex,
          score: Math.floor(Math.random() * 20) + 80, // 80-100점
          improvement: i < 11 ? Math.floor(Math.random() * 10) - 2 : 0 // -2 ~ +7점
        });
      }
    }
    
    return {
      tests,
      languageDistribution: calculateLanguageDistribution(tests),
      levelProgression: calculateLevelProgression(tests),
      monthlyFrequency: calculateMonthlyFrequency(tests)
    };
  };

  const transformLevelTestData = (apiResponse) => {
    const levelTests = apiResponse?.levelTests || [];
    
    return {
      tests: levelTests,
      languageDistribution: calculateLanguageDistribution(levelTests),
      levelProgression: calculateLevelProgression(levelTests),
      monthlyFrequency: calculateMonthlyFrequency(levelTests)
    };
  };

  const calculateLanguageDistribution = (tests) => {
    const distribution = {};
    tests.forEach(test => {
      distribution[test.language] = (distribution[test.language] || 0) + 1;
    });
    
    const colors = ['#00C471', '#4285F4', '#FFB800', '#FF6B6B', '#9C27B0'];
    return Object.entries(distribution).map(([language, count], index) => ({
      name: language,
      value: count,
      color: colors[index % colors.length],
      percentage: ((count / tests.length) * 100).toFixed(1)
    }));
  };

  const calculateLevelProgression = (tests) => {
    const grouped = {};
    tests.forEach(test => {
      if (!grouped[test.language]) {
        grouped[test.language] = [];
      }
      grouped[test.language].push(test);
    });
    
    const progression = [];
    Object.entries(grouped).forEach(([language, langTests]) => {
      langTests.sort((a, b) => new Date(a.date) - new Date(b.date));
      langTests.forEach((test, index) => {
        progression.push({
          ...test,
          testNumber: index + 1,
          cumulativeProgress: langTests.slice(0, index + 1).reduce((sum, t) => sum + t.levelIndex, 0) / (index + 1)
        });
      });
    });
    
    return progression.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const calculateMonthlyFrequency = (tests) => {
    const monthly = {};
    tests.forEach(test => {
      const month = new Date(test.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
      monthly[month] = (monthly[month] || 0) + 1;
    });
    
    return Object.entries(monthly).map(([month, count]) => ({
      month,
      tests: count
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[var(--black-500)]">레벨 테스트 히스토리</h3>
          <div className="w-32 h-8 bg-[var(--black-50)] rounded animate-pulse"></div>
        </div>
        
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[14px] text-[var(--black-300)]">레벨 테스트 데이터 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!historyData?.tests?.length) {
    return (
      <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[var(--black-500)]">레벨 테스트 히스토리</h3>
        </div>
        
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-[var(--black-200)] mx-auto mb-4" />
            <p className="text-[16px] text-[var(--black-300)] mb-2">아직 레벨 테스트 기록이 없습니다</p>
            <p className="text-[14px] text-[var(--black-200)]">레벨 테스트를 완료하면 여기에 결과가 표시됩니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const renderProgressChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={historyData.levelProgression}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--black-50)" />
        <XAxis 
          dataKey="month" 
          stroke="var(--black-300)"
          fontSize={12}
        />
        <YAxis 
          stroke="var(--black-300)"
          fontSize={12}
          domain={[0, 4]}
          tickFormatter={(value) => ['Beginner', 'Elementary', 'Intermediate', 'Upper-Int.', 'Advanced'][value] || value}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid var(--black-50)',
            borderRadius: '8px'
          }}
          labelFormatter={(label) => `테스트 날짜: ${label}`}
          formatter={(value, name, props) => [
            ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced'][Math.floor(value)],
            `${props.payload.language} 레벨`
          ]}
        />
        <Line 
          type="monotone" 
          dataKey="levelIndex" 
          stroke="#00C471" 
          strokeWidth={3}
          dot={{ fill: '#00C471', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#00C471', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderFrequencyChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={historyData.monthlyFrequency}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--black-50)" />
        <XAxis 
          dataKey="month" 
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
        <Bar 
          dataKey="tests" 
          fill="#4285F4" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderDistributionChart = () => (
    <div className="flex items-center justify-center">
      <div className="w-80 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={historyData.languageDistribution}
              cx="50%"
              cy="50%"
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {historyData.languageDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="ml-8">
        <h4 className="text-[16px] font-bold text-[var(--black-500)] mb-4">언어별 분포</h4>
        {historyData.languageDistribution.map((lang, index) => (
          <div key={index} className="flex items-center mb-3">
            <div 
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: lang.color }}
            />
            <div className="flex-1">
              <div className="text-[14px] text-[var(--black-500)] font-medium">{lang.name}</div>
              <div className="text-[12px] text-[var(--black-300)]">
                {lang.value}회 ({lang.percentage}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[18px] font-bold text-[var(--black-500)]">레벨 테스트 히스토리</h3>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="px-3 py-2 text-[14px] border border-[var(--black-50)] rounded-lg bg-white text-[var(--black-500)] focus:border-[#00C471] focus:outline-none"
          >
            <option value="progress">레벨 진행도</option>
            <option value="frequency">월별 빈도</option>
            <option value="distribution">언어별 분포</option>
          </select>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-[var(--green-50)] rounded-[12px]">
          <div className="w-10 h-10 bg-[#00C471] rounded-full flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="text-[20px] font-bold text-[var(--black-500)]">
            {historyData.tests.length}
          </div>
          <div className="text-[12px] text-[var(--black-300)]">총 테스트 수</div>
        </div>

        <div className="text-center p-4 bg-[#F0F8FF] rounded-[12px]">
          <div className="w-10 h-10 bg-[#4285F4] rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-[20px] font-bold text-[var(--black-500)]">
            {historyData.languageDistribution.length}
          </div>
          <div className="text-[12px] text-[var(--black-300)]">테스트 언어 수</div>
        </div>

        <div className="text-center p-4 bg-[#FFF8E1] rounded-[12px]">
          <div className="w-10 h-10 bg-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="text-[20px] font-bold text-[var(--black-500)]">
            {Math.round(historyData.tests.reduce((sum, test) => sum + test.score, 0) / historyData.tests.length) || 0}
          </div>
          <div className="text-[12px] text-[var(--black-300)]">평균 점수</div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="h-80">
        {selectedView === 'progress' && renderProgressChart()}
        {selectedView === 'frequency' && renderFrequencyChart()}
        {selectedView === 'distribution' && renderDistributionChart()}
      </div>

      {/* 최근 테스트 결과 */}
      <div className="mt-6 pt-4 border-t border-[var(--black-50)]">
        <h4 className="text-[16px] font-bold text-[var(--black-500)] mb-3">최근 테스트 결과</h4>
        <div className="space-y-2">
          {historyData.tests.slice(-3).reverse().map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[var(--green-50)] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#00C471] rounded-full"></div>
                <div>
                  <span className="text-[14px] font-medium text-[var(--black-500)]">{test.language}</span>
                  <span className="text-[12px] text-[var(--black-300)] ml-2">{test.level}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[14px] text-[var(--black-300)]">
                  {new Date(test.date).toLocaleDateString('ko-KR')}
                </span>
                <span className="text-[14px] font-bold text-[#00C471]">
                  {test.score}점
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelTestHistoryChart;