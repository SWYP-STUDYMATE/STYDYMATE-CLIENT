import { useEffect, useState } from 'react';
import { getSessionActivity, generateMockAnalyticsData } from '../../api/analytics';

export default function WeeklyActivityChart({ data = null, loading = false }) {
    const [chartData, setChartData] = useState(null);
    const [animatedData, setAnimatedData] = useState([]);
    const [isLoading, setIsLoading] = useState(loading);

    useEffect(() => {
        if (data) {
            // 부모 컴포넌트에서 데이터를 전달받은 경우
            setChartData(data);
            setIsLoading(false);
        } else {
            // 독립적으로 데이터를 로드하는 경우
            loadWeeklyData();
        }
    }, [data]);

    const loadWeeklyData = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        
        try {
            let weeklyData;
            
            const response = await getSessionActivity('week');
            weeklyData = transformWeeklyData(response?.metrics?.dailyStats || []);
            
            setChartData(weeklyData);
        } catch (error) {
            console.error('Weekly activity data loading failed:', error);
            
            // 에러 시 Mock 데이터 사용
            const mockData = generateMockAnalyticsData();
            const fallbackData = transformWeeklyData(mockData.sessionStats);
            setChartData(fallbackData);
        } finally {
            setIsLoading(false);
        }
    };

    const transformWeeklyData = (apiData) => {
        const today = new Date();
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        const weeklyData = [];
        
        // 최근 7일간의 데이터 생성
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dayName = weekDays[date.getDay()];
            const dateStr = date.toISOString().split('T')[0];
            
            // API 데이터에서 해당 날짜 찾기
            const dayData = apiData.find(item => item.date === dateStr) || {};
            
            weeklyData.push({
                day: dayName,
                sessions: dayData.sessions || 0,
                minutes: dayData.minutes || 0
            });
        }
        
        return weeklyData;
    };

    // 실제 데이터 또는 변환된 데이터 사용
    const weeklyData = chartData || [];
    const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 1);

    useEffect(() => {
        // 데이터가 로드되면 애니메이션 효과 적용
        if (weeklyData.length > 0) {
            setAnimatedData(weeklyData.map(() => 0)); // 초기화
            const timer = setTimeout(() => {
                setAnimatedData(weeklyData.map(d => d.minutes));
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [weeklyData]);

    const getBarHeight = (minutes, index) => {
        const percentage = (animatedData[index] / maxMinutes) * 100;
        return `${percentage}%`;
    };

    const getBarColor = (minutes) => {
        if (minutes === 0) return 'bg-[var(--black-50)]';
        if (minutes < 30) return 'bg-[var(--green-50)]';
        if (minutes < 60) return 'bg-[var(--green-100)]';
        return 'bg-[var(--green-500)]';
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[18px] font-bold text-[var(--black-500)]">주간 활동</h3>
                    <span className="text-[12px] text-[var(--black-200)]">이번 주</span>
                </div>

                <div className="h-40 flex items-end justify-between gap-2">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full h-full flex items-end">
                                <div className="w-full bg-[var(--black-50)] rounded-t-lg animate-pulse h-16" />
                            </div>
                            <span className="text-[12px] text-[var(--black-300)] font-medium">
                                {['월', '화', '수', '목', '금', '토', '일'][index]}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--black-50)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[14px] text-[var(--black-300)]">이번 주 총 학습시간</p>
                            <div className="w-20 h-6 bg-[var(--black-50)] rounded animate-pulse mt-1"></div>
                        </div>
                        <div className="text-right">
                            <p className="text-[14px] text-[var(--black-300)]">평균 세션</p>
                            <div className="w-16 h-6 bg-[var(--black-50)] rounded animate-pulse mt-1"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-bold text-[var(--black-500)]">주간 활동</h3>
                <span className="text-[12px] text-[var(--black-200)]">이번 주</span>
            </div>

            <div className="h-40 flex items-end justify-between gap-2">
                {weeklyData.map((item, index) => (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full h-full flex items-end">
                            <div
                                className={`w-full ${getBarColor(item.minutes)} rounded-t-lg transition-all duration-500 ease-out`}
                                style={{ height: getBarHeight(item.minutes, index) }}
                            />
                        </div>
                        <span className="text-[12px] text-[var(--black-300)] font-medium">{item.day}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--black-50)]">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[14px] text-[var(--black-300)]">이번 주 총 학습시간</p>
                        <p className="text-[20px] font-bold text-[var(--black-500)]">
                            {Math.floor(weeklyData.reduce((sum, d) => sum + d.minutes, 0) / 60)}시간 {weeklyData.reduce((sum, d) => sum + d.minutes, 0) % 60}분
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[14px] text-[var(--black-300)]">평균 세션</p>
                        <p className="text-[20px] font-bold text-[var(--green-500)]">
                            {Math.round(weeklyData.filter(d => d.sessions > 0).reduce((sum, d) => sum + d.minutes, 0) / weeklyData.filter(d => d.sessions > 0).length || 0)}분
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}