import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Calendar, TrendingUp, Award, Target } from 'lucide-react';
import { getLevelTestHistory } from '../../api/analytics';

const LevelTestHistoryChart = ({ timeRange = 'year' }) => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('progress'); // 'progress', 'frequency', 'distribution'

  const LEVEL_ORDER = ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Proficient'];

  useEffect(() => {
    loadLevelTestHistory();
  }, [timeRange]);

  const loadLevelTestHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getLevelTestHistory();
      const data = transformLevelTestData(response, timeRange);
      setHistoryData(data);
    } catch (fetchError) {
      console.error('Level test history loading failed:', fetchError);
      setHistoryData(null);
      setError('레벨 테스트 기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const parseTestDate = (test) => {
    const candidates = [
      test?.date,
      test?.testDate,
      test?.completedAt,
      test?.createdAt,
      test?.created_date,
      test?.timestamp
    ];

    for (const candidate of candidates) {
      if (!candidate) continue;
      const date = new Date(candidate);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  };

  const filterTestsByRange = (tests, range) => {
    if (!range || !tests.length) return tests;

    const now = new Date();
    const start = new Date(now);

    switch (range) {
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        return tests;
    }

    return tests.filter((test) => {
      const date = parseTestDate(test);
      return date ? date >= start : true;
    });
  };

  const getLevelIndex = (test) => {
    if (Number.isFinite(test?.levelIndex)) {
      return Number(test.levelIndex);
    }

    if (Number.isFinite(test?.level)) {
      return Number(test.level);
    }

    const levelName = test?.level || test?.levelName || test?.resultLevel || test?.targetLevel;
    if (typeof levelName === 'string') {
      const normalized = levelName.trim().toLowerCase();
      const index = LEVEL_ORDER.findIndex((level) => level.toLowerCase() === normalized);
      if (index >= 0) {
        return index;
      }
    }

    return null;
  };

  const transformLevelTestData = (apiResponse, range) => {
    const levelTests = filterTestsByRange(apiResponse?.levelTests || [], range);
    
    return {
      tests: levelTests,
      languageDistribution: calculateLanguageDistribution(levelTests),
      levelProgression: calculateLevelProgression(levelTests),
      monthlyFrequency: calculateMonthlyFrequency(levelTests)
    };
  };

  const calculateLanguageDistribution = (tests) => {
    if (!tests.length) return [];

    const distribution = {};
    tests.forEach(test => {
      const language = test.language || 'Unknown';
      distribution[language] = (distribution[language] || 0) + 1;
    });
    
    const colors = ['#00C471', '#4285F4', '#FFB800', '#FF6B6B', '#9C27B0'];
    const total = tests.length;

    return Object.entries(distribution).map(([language, count], index) => ({
      name: language,
      value: count,
      color: colors[index % colors.length],
      percentage: Number(((count / total) * 100).toFixed(1))
    }));
  };

  const calculateLevelProgression = (tests) => {
    const grouped = {};

    tests.forEach(test => {
      const levelIndex = getLevelIndex(test);
      const dateObj = parseTestDate(test);

      if (levelIndex === null || !dateObj) return;

      const language = test.language || 'Unknown';
      if (!grouped[language]) {
        grouped[language] = [];
      }

      grouped[language].push({
        ...test,
        levelIndex,
        dateObj
      });
    });
    
    const progression = [];
    Object.entries(grouped).forEach(([language, langTests]) => {
      langTests.sort((a, b) => a.dateObj - b.dateObj);

      langTests.forEach((test, index) => {
        const cumulativeSum = langTests
          .slice(0, index + 1)
          .reduce((sum, current) => sum + current.levelIndex, 0);

        const monthLabel = test.dateObj.toLocaleDateString('ko-KR', { month: 'short' });
        const isoDate = test.dateObj.toISOString().split('T')[0];

        const { dateObj: _dateObj, ...rest } = test;
        progression.push({
          ...rest,
          language,
          date: isoDate,
          month: monthLabel,
          testNumber: index + 1,
          cumulativeProgress: Number((cumulativeSum / (index + 1)).toFixed(2))
        });
      });
    });
    
    return progression.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const calculateMonthlyFrequency = (tests) => {
    const monthly = {};
    tests.forEach(test => {
      const date = parseTestDate(test);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + 1;
    });
    
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [year, month] = key.split('-');
        const labelDate = new Date(Number(year), Number(month) - 1, 1);
        const label = labelDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
        return {
          month: label,
          tests: count
        };
      });
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

  if (error) {
    return (
      <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[var(--black-500)]">레벨 테스트 히스토리</h3>
          <button
            type="button"
            onClick={loadLevelTestHistory}
            className="px-3 py-1.5 bg-[#00C471] text-white text-[13px] font-semibold rounded-lg hover:bg-[#00B267] transition-colors"
          >
            다시 시도
          </button>
        </div>

        <div className="h-80 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <Calendar className="w-12 h-12 text-[var(--red-300,#F87171)] mx-auto mb-4" />
            <p className="text-[16px] text-[var(--black-400,#565656)] font-semibold mb-2">레벨 테스트 데이터를 불러올 수 없습니다</p>
            <p className="text-[14px] text-[var(--black-300,#808080)]">{error}</p>
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
          formatter={(value, _name, props) => [
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

  const renderDistributionChart = () => {
    if (!historyData.languageDistribution.length) {
      return (
        <div className="h-80 flex flex-col items-center justify-center text-center text-[var(--black-300)]">
          <Award className="w-12 h-12 text-[var(--black-200)] mb-3" />
          <p className="text-[16px] font-medium text-[var(--black-400)] mb-1">언어별 데이터가 없습니다</p>
          <p className="text-[14px]">레벨 테스트를 진행하면 언어별 통계를 확인할 수 있어요.</p>
        </div>
      );
    }

    return (
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
              <Tooltip formatter={(value) => [`${value}회`, '테스트 수']} />
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
  };

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
