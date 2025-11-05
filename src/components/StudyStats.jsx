import React, { useState, useEffect } from 'react';
import { getStudyStats } from '../api/analytics';

const StudyStats = ({ data = null, loading = false, errorMessage = null }) => {
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ⚠️ useMemo 제거: React 19 무한 루프 방지
  // data prop이 stabilizeRef로 안정화되므로 직접 변환해도 성능 문제 없음
  useEffect(() => {
    // 부모로부터 데이터를 받은 경우
    if (data) {
      const safeNumber = (value, defaultValue = 0) => {
        if (typeof value === 'number' && !Number.isNaN(value)) return value;
        return defaultValue;
      };

      const transformedData = {
        overview: {
          totalMinutes: safeNumber(data.totalMinutes, 0),
          monthlyMinutes: safeNumber(data.monthlyMinutes, 0),
          currentStreak: safeNumber(data.streakDays, 0),
          partnersCount: safeNumber(data.partnersCount, 0)
        }
      };

      setStatsData(transformedData);
      setIsLoading(false);
      setError(null);
      return;
    }

    // 독립적으로 데이터를 로드하는 경우
    loadStatsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);  // ← transformedData 의존성 제거

  useEffect(() => {
    setError(errorMessage);
  }, [errorMessage]);

  const loadStatsData = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await getStudyStats('month'); // 월간 통계 조회
      // response는 직접 SessionStatsResponseType 형태
      const data = response?.data ?? response;

      const safeNumber = (value, defaultValue = 0) => {
        if (typeof value === 'number' && !Number.isNaN(value)) return value;
        return defaultValue;
      };

      const analyticsData = {
        overview: {
          totalMinutes: safeNumber(data.totalMinutes, 0),
          monthlyMinutes: safeNumber(data.monthlyMinutes, 0),
          currentStreak: safeNumber(data.streakDays, 0),
          partnersCount: safeNumber(data.partnersCount, 0)
        }
      };

      setStatsData(analyticsData);
      setError(null);
    } catch (error) {
      console.error('StudyStats data loading failed:', error);

      setStatsData(null);
      setError('학습 통계를 불러오지 못했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes === 0) return "0시간";
    if (!minutes) return "-";
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) return `${remainingMinutes}분`;
    if (remainingMinutes === 0) return `${hours}시간`;
    return `${hours}시간 ${remainingMinutes}분`;
  };

  // 실제 데이터 또는 Mock 데이터에서 통계 계산
  const overview = statsData?.overview || {};
  const stats = [
    {
      value: formatTime(overview.totalMinutes || 0),
      label: "전체 학습 시간"
    },
    {
      value: formatTime(overview.monthlyMinutes || 0),
      label: "이번 달 학습 시간"
    },
    {
      value: `${overview.currentStreak || 0}일`,
      label: "연속 학습일"
    },
    {
      value: `${overview.partnersCount || 0}명`,
      label: "활성 파트너"
    }
  ];

  const isZeroValue = (value) => {
    return value.includes('0시간') || value.includes('0일') || value.includes('0명');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white border border-[#E6F9F1] rounded-[10px] p-3 sm:p-4 flex flex-col items-center justify-center min-h-[110px] sm:min-h-[130px] lg:min-h-[150px]"
          >
            <div className="text-center animate-pulse">
              <div className="h-6 sm:h-8 bg-[#E7E7E7] rounded mb-2 w-16 sm:w-20"></div>
              <div className="h-5 sm:h-6 bg-[#E7E7E7] rounded w-20 sm:w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    // 안전하게 에러 메시지 추출
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error?.message || error?.error || '학습 통계를 불러오지 못했습니다.');
    
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white border border-[#E6F9F1] rounded-[10px] p-6 flex items-center justify-center min-h-[110px] sm:min-h-[150px]">
          <p className="text-center text-[#929292] text-sm sm:text-base leading-[20px] sm:leading-[24px]">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white border border-[#E6F9F1] rounded-[10px] p-6 flex items-center justify-center min-h-[110px] sm:min-h-[150px]">
          <p className="text-center text-[#929292] text-sm sm:text-base leading-[20px] sm:leading-[24px]">표시할 학습 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-[#E6F9F1] rounded-[10px] p-3 sm:p-4 flex flex-col items-center justify-center min-h-[110px] sm:min-h-[130px] lg:min-h-[150px] transition-all duration-200 hover:shadow-sm"
        >
          <div className="text-center">
            <div
              className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 leading-[24px] sm:leading-[26px] transition-colors ${
                isZeroValue(stat.value) ? 'text-[#E7E7E7]' : 'text-[#111111]'
              }`}
            >
              {stat.value}
            </div>
            <div
              className="text-sm sm:text-base lg:text-xl text-[#111111] font-normal leading-[20px] sm:leading-[24px] lg:leading-[26px]"
            >
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudyStats; 
