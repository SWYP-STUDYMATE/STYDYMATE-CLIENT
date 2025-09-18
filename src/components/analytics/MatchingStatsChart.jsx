import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, Heart, TrendingUp, Clock, Target, UserCheck } from 'lucide-react';
import { getMatchingStats } from '../../api/analytics';

const MatchingStatsChart = ({ timeRange = 'month' }) => {
  const [matchingData, setMatchingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('success-rate'); // 'success-rate', 'frequency', 'duration', 'type'

  useEffect(() => {
    loadMatchingStats();
  }, [timeRange]);

  const loadMatchingStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMatchingStats(timeRange);
      const data = transformMatchingData(response);
      setMatchingData(data);
    } catch (fetchError) {
      console.error('Matching stats loading failed:', fetchError);
      setMatchingData(null);
      setError('매칭 통계를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // API 데이터 변환 헬퍼 함수들
  const parseEventDate = (event) => {
    const candidates = [
      event?.createdDate,
      event?.createdAt,
      event?.created_at,
      event?.timestamp,
      event?.eventTime,
      event?.time,
      event?.properties?.createdAt,
      event?.properties?.timestamp,
      event?.properties?.eventTime
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

  const resolveStatus = (event) => {
    const candidates = [
      event?.status,
      event?.properties?.status,
      event?.properties?.result,
      event?.event,
      event?.properties?.eventType
    ]
      .filter(Boolean)
      .map((value) => String(value).toUpperCase());

    if (candidates.some((value) => value.includes('SUCCESS') || value.includes('MATCHED') || value.includes('ACCEPT'))) {
      return 'SUCCESS';
    }
    if (candidates.some((value) => value.includes('FAIL') || value.includes('REJECT') || value.includes('DECLINE') || value.includes('CANCEL'))) {
      return 'FAILED';
    }
    if (candidates.some((value) => value.includes('REQUEST') || value.includes('PENDING'))) {
      return 'REQUEST';
    }
    return 'OTHER';
  };

  const extractWaitTimeSeconds = (event) => {
    const props = event?.properties || {};
    const keys = [
      'waitTimeSeconds',
      'wait_time_seconds',
      'waitTime',
      'wait_time',
      'matchingWaitSeconds',
      'matchWaitSeconds',
      'queueWaitSeconds',
      'queueWaitTime',
      'waitingSeconds',
      'waitingTime',
      'waitDurationSeconds',
      'waitDurationMillis',
      'waitTimeMs'
    ];

    for (const key of keys) {
      if (!(key in props)) continue;
      const value = props[key];
      if (value === null || value === undefined || value === '') continue;
      const num = Number(value);
      if (Number.isNaN(num)) continue;

      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('millis') || lowerKey.endsWith('ms')) {
        return Math.round(num / 1000);
      }
      if (lowerKey.includes('minute')) {
        return Math.round(num * 60);
      }
      if (lowerKey.includes('hour')) {
        return Math.round(num * 3600);
      }
      return Math.round(num);
    }

    return null;
  };

  const extractSessionDurationMinutes = (event) => {
    const props = event?.properties || {};
    const keys = [
      'sessionDurationMinutes',
      'durationMinutes',
      'sessionDuration',
      'duration',
      'callDuration',
      'meetingDuration',
      'conversationDuration',
      'lengthMinutes',
      'length',
      'sessionDurationSeconds',
      'durationSeconds'
    ];

    for (const key of keys) {
      if (!(key in props)) continue;
      const value = props[key];
      if (value === null || value === undefined || value === '') continue;
      const num = Number(value);
      if (Number.isNaN(num)) continue;

      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('millis') || lowerKey.endsWith('ms')) {
        return Math.round(num / 60000);
      }
      if (lowerKey.includes('second')) {
        return Math.round(num / 60);
      }
      if (lowerKey.includes('hour')) {
        return Math.round(num * 60);
      }
      return Math.round(num);
    }

    return null;
  };

  const matchTypeLabel = (event) => {
    const props = event?.properties || {};
    const rawType = props.matchType || props.matchingType || props.sessionType || props.roomType || props.channelType || props.mode || props.sessionMode;
    if (!rawType) return '기타';

    const normalized = String(rawType).toUpperCase();
    if (normalized.includes('GROUP')) return '그룹 세션';
    if (normalized.includes('RANDOM')) return '랜덤 매칭';
    if (normalized.includes('TEXT')) return '텍스트 채팅';
    if (normalized.includes('VOICE') || normalized.includes('AUDIO')) return '음성 매칭';
    if (normalized.includes('VIDEO')) return '영상 매칭';
    if (normalized.includes('DISCUSSION') || normalized.includes('TOPIC')) return '주제별 토론';
    if (normalized.includes('ONE') || normalized.includes('1:1') || normalized.includes('SOLO')) return '1:1 회화';
    return String(rawType);
  };

  const LANGUAGE_LABEL_MAP = {
    EN: 'English',
    ENGLISH: 'English',
    KO: 'Korean',
    KOREAN: 'Korean',
    JA: 'Japanese',
    JAPANESE: 'Japanese',
    ZH: 'Chinese',
    CHINESE: 'Chinese',
    ES: 'Spanish',
    SPANISH: 'Spanish',
    FR: 'French',
    FRENCH: 'French'
  };

  const languageLabel = (event) => {
    const props = event?.properties || {};
    const rawLanguage = props.targetLanguage || props.language || props.learningLanguage || props.sessionLanguage || props.partnerLanguage || props.requestLanguage;
    if (!rawLanguage) return '기타';

    const normalized = LANGUAGE_LABEL_MAP[String(rawLanguage).toUpperCase()];
    return normalized || String(rawLanguage);
  };

  const processMatchingEvents = (events) => {
    const dailyMap = new Map();

    events.forEach((event) => {
      const date = parseEventDate(event) || new Date();
      const dayKey = date.toISOString().split('T')[0];
      const status = resolveStatus(event);

      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, { date: dayKey, requests: 0, successful: 0, failed: 0 });
      }

      const dayEntry = dailyMap.get(dayKey);

      if (status === 'SUCCESS') {
        dayEntry.successful += 1;
        dayEntry.requests += 1;
      } else if (status === 'FAILED') {
        dayEntry.failed += 1;
        dayEntry.requests += 1;
      } else if (status === 'REQUEST') {
        dayEntry.requests += 1;
      }
    });

    return Array.from(dailyMap.values())
      .map((day) => ({
        ...day,
        day: new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        successRate: day.requests > 0 ? Number(((day.successful / day.requests) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const calculateSummaryStats = (events) => {
    let totalRequests = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;
    const waitTimes = [];
    const sessionDurations = [];

    events.forEach((event) => {
      const status = resolveStatus(event);

      if (status === 'SUCCESS') {
        totalSuccessful += 1;
        totalRequests += 1;
      } else if (status === 'FAILED') {
        totalFailed += 1;
        totalRequests += 1;
      } else if (status === 'REQUEST') {
        totalRequests += 1;
      }

      const waitSeconds = extractWaitTimeSeconds(event);
      if (Number.isFinite(waitSeconds) && waitSeconds > 0) {
        waitTimes.push(waitSeconds);
      }

      const durationMinutes = extractSessionDurationMinutes(event);
      if (Number.isFinite(durationMinutes) && durationMinutes > 0) {
        sessionDurations.push(durationMinutes);
      }
    });

    return {
      totalRequests,
      totalSuccessful,
      totalFailed,
      overallSuccessRate: totalRequests > 0
        ? Number(((totalSuccessful / totalRequests) * 100).toFixed(1))
        : 0,
      avgWaitTime: waitTimes.length > 0
        ? Math.round(waitTimes.reduce((sum, current) => sum + current, 0) / waitTimes.length)
        : 0,
      avgSessionDuration: sessionDurations.length > 0
        ? Math.round(sessionDurations.reduce((sum, current) => sum + current, 0) / sessionDurations.length)
        : 0
    };
  };

  const calculateTypeDistribution = (events) => {
    const counts = new Map();

    events.forEach((event) => {
      if (resolveStatus(event) !== 'SUCCESS') return;
      const label = matchTypeLabel(event);
      counts.set(label, (counts.get(label) || 0) + 1);
    });

    const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
    if (total === 0) return [];

    const colors = ['#00C471', '#4285F4', '#FFB800', '#FF6B6B', '#9C27B0', '#6366F1'];

    return Array.from(counts.entries()).map(([name, count], index) => ({
      name,
      value: count,
      percentage: Number(((count / total) * 100).toFixed(1)),
      color: colors[index % colors.length]
    }));
  };

  const calculateLanguageStats = (events) => {
    const statsMap = new Map();

    events.forEach((event) => {
      const status = resolveStatus(event);
      if (!['SUCCESS', 'FAILED', 'REQUEST'].includes(status)) return;

      const label = languageLabel(event);
      if (!statsMap.has(label)) {
        statsMap.set(label, { language: label, attempts: 0, successful: 0 });
      }

      const entry = statsMap.get(label);
      entry.attempts += 1;
      if (status === 'SUCCESS') {
        entry.successful += 1;
      }
    });

    const results = Array.from(statsMap.values())
      .filter((entry) => entry.attempts > 0)
      .map((entry) => ({
        ...entry,
        successRate: Number(((entry.successful / entry.attempts) * 100).toFixed(1))
      }));

    return results.sort((a, b) => b.successRate - a.successRate);
  };

  const calculateHourlyStats = (events) => {
    const hourlyMap = new Map();

    events.forEach((event) => {
      const status = resolveStatus(event);
      if (!['SUCCESS', 'FAILED'].includes(status)) return;

      const date = parseEventDate(event);
      if (!date) return;

      const hour = date.getHours();
      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, { hour, attempts: 0, successful: 0 });
      }

      const entry = hourlyMap.get(hour);
      entry.attempts += 1;
      if (status === 'SUCCESS') {
        entry.successful += 1;
      }
    });

    return Array.from(hourlyMap.values())
      .sort((a, b) => a.hour - b.hour)
      .map((entry) => ({
        hour: `${entry.hour.toString().padStart(2, '0')}:00`,
        attempts: entry.attempts,
        successRate: entry.attempts > 0
          ? Number(((entry.successful / entry.attempts) * 100).toFixed(1))
          : 0
      }));
  };

  const transformMatchingData = (apiResponse) => {
    // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
    const events = apiResponse?.matchingEvents || [];
    
    if (!events.length) {
      // API에서 데이터가 없으면 빈 통계 반환
      return {
        dailyStats: [],
        summary: {
          totalRequests: 0,
          totalSuccessful: 0,
          totalFailed: 0,
          overallSuccessRate: 0,
          avgWaitTime: 0,
          avgSessionDuration: 0
        },
        matchingTypes: [],
        languageStats: [],
        hourlyStats: []
      };
    }
    
    // 실제 API 데이터를 기반으로 변환
    const dailyStats = processMatchingEvents(events);
    const summary = calculateSummaryStats(events);
    const matchingTypes = calculateTypeDistribution(events);
    const languageStats = calculateLanguageStats(events);
    const hourlyStats = calculateHourlyStats(events);
    
    return {
      dailyStats,
      summary,
      matchingTypes,
      languageStats,
      hourlyStats
    };
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

  if (error) {
    return (
      <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[var(--black-500)]">매칭 성공률 통계</h3>
          <button
            type="button"
            onClick={loadMatchingStats}
            className="px-3 py-1.5 bg-[#00C471] text-white text-[13px] font-semibold rounded-lg hover:bg-[#00B267] transition-colors"
          >
            다시 시도
          </button>
        </div>

        <div className="h-96 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <Users className="w-12 h-12 text-[var(--red-300,#F87171)] mx-auto mb-4" />
            <p className="text-[16px] text-[var(--black-400,#565656)] font-semibold mb-2">매칭 통계를 불러오지 못했습니다</p>
            <p className="text-[14px] text-[var(--black-300,#808080)]">{error}</p>
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
          formatter={(value) => [`${value}%`, '성공률']}
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

  const renderTypeDistribution = () => {
    if (!matchingData.matchingTypes.length) {
      return (
        <div className="h-80 flex flex-col items-center justify-center text-center text-[var(--black-300)]">
          <Users className="w-12 h-12 text-[var(--black-200)] mb-3" />
          <p className="text-[16px] font-medium text-[var(--black-400)] mb-1">분석할 매칭 타입이 없습니다</p>
          <p className="text-[14px]">매칭을 완료하면 타입별 통계가 표시됩니다.</p>
        </div>
      );
    }

    return (
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
              <Tooltip formatter={(value) => [`${value}건`, '매칭 수']} />
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
                <div className="text-[12px] text-[var(--black-300)]">{type.percentage}% · {type.value}건</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLanguageStats = () => {
    if (!matchingData.languageStats.length) {
      return (
        <div className="h-80 flex flex-col items-center justify-center text-center text-[var(--black-300)]">
          <Users className="w-12 h-12 text-[var(--black-200)] mb-3" />
          <p className="text-[16px] font-medium text-[var(--black-400)] mb-1">언어별 매칭 데이터가 없습니다</p>
          <p className="text-[14px]">매칭 시도 후 다시 확인해주세요.</p>
        </div>
      );
    }

    return (
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
  };

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
