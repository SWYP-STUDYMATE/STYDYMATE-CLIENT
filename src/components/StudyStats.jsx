import React, { useState, useEffect } from 'react';
import { getStudyStats } from '../api/analytics';

const StudyStats = ({ data = null, loading = false, errorMessage = null }) => {
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(loading);
  const [error, setError] = useState(errorMessage);

  useEffect(() => {
    if (data) {
      // 부모 컴포넌트에서 데이터를 전달받은 경우
      const analyticsData = transformStatsData(data);
      setStatsData(analyticsData);
      setIsLoading(false);
      setError(null);
    } else {
      // 독립적으로 데이터를 로드하는 경우
      loadStatsData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  const loadStatsData = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      let analyticsData;
      
      const response = await getStudyStats('month'); // 월간 통계 조회
      analyticsData = transformStatsData(response);
      
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

  const transformStatsData = (apiResponse) => {
    // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
    const metrics = apiResponse?.metrics || {};
    
    return {
      overview: {
        totalMinutes: metrics.totalMinutes || 0,
        monthlyMinutes: metrics.monthlyMinutes || 0,
        currentStreak: metrics.currentStreak || 0,
        partnersCount: metrics.partnersCount || 0
      }
    };
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
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex-1 bg-white border border-[#e6f9f1] rounded-[10px] p-4 flex flex-col items-center justify-center min-h-[150px]"
          >
            <div className="text-center animate-pulse">
              <div className="h-8 bg-[#e5e5e5] rounded mb-2 w-20"></div>
              <div className="h-6 bg-[#e5e5e5] rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex gap-4">
        <div className="flex-1 bg-white border border-[#e6f9f1] rounded-[10px] p-6 flex items-center justify-center min-h-[150px]">
          <p className="text-center text-[#767676] text-base leading-[24px]">{error}</p>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="flex gap-4">
        <div className="flex-1 bg-white border border-[#e6f9f1] rounded-[10px] p-6 flex items-center justify-center min-h-[150px]">
          <p className="text-center text-[#767676] text-base leading-[24px]">표시할 학습 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex-1 bg-white border border-[#e6f9f1] rounded-[10px] p-4 flex flex-col items-center justify-center min-h-[150px] transition-all duration-300 hover:shadow-sm"
        >
          <div className="text-center">
            <div 
              className={`text-3xl font-bold mb-2 leading-[26px] transition-colors ${
                isZeroValue(stat.value) ? 'text-[#e5e5e5]' : 'text-[#111111]'
              }`}
            >
              {stat.value}
            </div>
            <div 
              className="text-xl text-[#212529] font-normal leading-[26px]"
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
