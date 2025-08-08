import { useEffect, useState } from 'react';

export default function WeeklyActivityChart({ data = [] }) {
    const [animatedData, setAnimatedData] = useState(data.map(() => 0));

    // 더미 데이터 (실제로는 props로 받아야 함)
    const weeklyData = data.length > 0 ? data : [
        { day: '월', sessions: 2, minutes: 60 },
        { day: '화', sessions: 1, minutes: 30 },
        { day: '수', sessions: 3, minutes: 90 },
        { day: '목', sessions: 2, minutes: 45 },
        { day: '금', sessions: 1, minutes: 30 },
        { day: '토', sessions: 0, minutes: 0 },
        { day: '일', sessions: 1, minutes: 25 },
    ];

    const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 1);

    useEffect(() => {
        // 애니메이션 효과
        const timer = setTimeout(() => {
            setAnimatedData(weeklyData.map(d => d.minutes));
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const getBarHeight = (minutes, index) => {
        const percentage = (animatedData[index] / maxMinutes) * 100;
        return `${percentage}%`;
    };

    const getBarColor = (minutes) => {
        if (minutes === 0) return 'bg-[#E7E7E7]';
        if (minutes < 30) return 'bg-[#FFE4EC]';
        if (minutes < 60) return 'bg-[#B3E5D1]';
        return 'bg-[#00C471]';
    };

    return (
        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-bold text-[#111111]">주간 활동</h3>
                <span className="text-[12px] text-[#929292]">이번 주</span>
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
                        <span className="text-[12px] text-[#606060] font-medium">{item.day}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#E7E7E7]">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[14px] text-[#606060]">이번 주 총 학습시간</p>
                        <p className="text-[20px] font-bold text-[#111111]">
                            {Math.floor(weeklyData.reduce((sum, d) => sum + d.minutes, 0) / 60)}시간 {weeklyData.reduce((sum, d) => sum + d.minutes, 0) % 60}분
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[14px] text-[#606060]">평균 세션</p>
                        <p className="text-[20px] font-bold text-[#00C471]">
                            {Math.round(weeklyData.filter(d => d.sessions > 0).reduce((sum, d) => sum + d.minutes, 0) / weeklyData.filter(d => d.sessions > 0).length || 0)}분
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}