import { useEffect, useState } from 'react';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const normalizeWeeklyData = (entries = []) => {
    if (!Array.isArray(entries) || entries.length === 0) {
        return [];
    }

    return entries.map((item) => {
        // 안전하게 숫자 추출
        const safeMinutes = (() => {
            const raw = item.minutes ?? item.totalMinutes ?? 0;
            if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
            return 0;
        })();
        
        const safeSessions = (() => {
            const raw = item.sessions ?? item.totalSessions ?? item.count ?? 0;
            if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
            return 0;
        })();
        
        const minutes = Number.isFinite(safeMinutes) ? safeMinutes : 0;
        const sessions = Number.isFinite(safeSessions) ? safeSessions : 0;
        
        let dayLabel = typeof item.day === 'string' ? item.day : '';
        
        if (!dayLabel) {
            const date = item.date ? new Date(item.date) : null;
            dayLabel = date && !Number.isNaN(date.getTime()) ? DAY_LABELS[date.getDay()] : '';
        }

        return {
            day: dayLabel || '',
            minutes,
            sessions,
        };
    });
};

export default function WeeklyActivityChart({
    data = [],
    loading = false,
    error = null,
    emptyMessage = '최근 학습 데이터가 없습니다.'
}) {
    // ⚠️ useMemo 제거: React 19 cascading dependency 문제 방지
    // 직접 계산으로 변경 (부모 컴포넌트가 data prop 참조 안정성 보장)
    const weeklyData = normalizeWeeklyData(data);
    const [animatedData, setAnimatedData] = useState([]);

    const maxMinutes = (() => {
        if (weeklyData.length === 0) {
            return 1;
        }
        const minutes = weeklyData.map((d) => d.minutes ?? 0);
        const maxValue = Math.max(...minutes);
        return Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 1;
    })();

    useEffect(() => {
        if (weeklyData.length === 0) {
            setAnimatedData([]);
            return;
        }

        setAnimatedData(weeklyData.map(() => 0));
        const timer = setTimeout(() => {
            setAnimatedData(weeklyData.map((d) => d.minutes ?? 0));
        }, 120);

        return () => clearTimeout(timer);
    }, [weeklyData]);

    const getBarHeight = (index) => {
        const value = animatedData[index] ?? 0;
        const percentage = (value / maxMinutes) * 100;
        return `${Math.max(0, Math.min(percentage, 100))}%`;
    };

    const getBarColor = (minutes) => {
        if (!minutes) return 'bg-[var(--black-50)]';
        if (minutes < 30) return 'bg-[var(--green-50)]';
        if (minutes < 60) return 'bg-[var(--green-100)]';
        return 'bg-[var(--green-500)]';
    };

    if (loading) {
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

    if (error) {
        // 안전하게 에러 메시지 추출
        const errorMessage = typeof error === 'string' 
            ? error 
            : (error?.message || error?.error || '주간 활동 데이터를 불러오지 못했습니다.');
        
        return (
            <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[18px] font-bold text-[var(--black-500)]">주간 활동</h3>
                    <span className="text-[12px] text-[var(--black-200)]">이번 주</span>
                </div>
                <p className="text-[14px] text-[var(--black-300)]">{errorMessage}</p>
            </div>
        );
    }

    if (weeklyData.length === 0) {
        return (
            <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[18px] font-bold text-[var(--black-500)]">주간 활동</h3>
                    <span className="text-[12px] text-[var(--black-200)]">이번 주</span>
                </div>
                <p className="text-[14px] text-[var(--black-300)]">{emptyMessage}</p>
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
                                style={{ height: getBarHeight(index) }}
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
                            {Math.floor(weeklyData.reduce((sum, d) => sum + (d.minutes ?? 0), 0) / 60)}시간 {weeklyData.reduce((sum, d) => sum + (d.minutes ?? 0), 0) % 60}분
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[14px] text-[var(--black-300)]">평균 세션</p>
                        <p className="text-[20px] font-bold text-[var(--green-500)]">
                            {(() => {
                                const activeDays = weeklyData.filter((d) => (d.sessions ?? 0) > 0);
                                if (activeDays.length === 0) return 0;
                                const totalMinutes = activeDays.reduce((sum, d) => sum + (d.minutes ?? 0), 0);
                                return Math.round(totalMinutes / activeDays.length);
                            })()}분
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
