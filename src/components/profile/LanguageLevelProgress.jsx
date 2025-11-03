import { useState, useEffect } from 'react';
import { TrendingUp, Award, Target } from 'lucide-react';

export default function LanguageLevelProgress({
    language,
    currentLevel,
    progress,
    nextLevel,
    skills = {},
    trendLabel = null,
    goalMessage = '다음 목표를 설정해 학습을 이어가세요.'
}) {
    // 안전하게 문자열 추출
    const safeString = (value, defaultValue = '') => {
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        if (value && typeof value === 'object') {
            return value.name || value.label || value.title || value.value || defaultValue;
        }
        return defaultValue;
    };

    // 안전하게 숫자 추출
    const safeNumber = (value, defaultValue = 0) => {
        if (typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            if (!Number.isNaN(parsed) && Number.isFinite(parsed)) return parsed;
        }
        return defaultValue;
    };

    const safeLanguage = safeString(language, '언어');
    const safeCurrentLevel = safeString(currentLevel, '');
    const safeNextLevel = safeString(nextLevel, '');
    const safeProgress = safeNumber(progress, 0);

    const [animatedProgress, setAnimatedProgress] = useState(0);
    const [animatedSkills, setAnimatedSkills] = useState({
        speaking: 0,
        listening: 0,
        reading: 0,
        writing: 0
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(safeProgress);
            setAnimatedSkills({
                speaking: safeNumber(skills.speaking, 0),
                listening: safeNumber(skills.listening, 0),
                reading: safeNumber(skills.reading, 0),
                writing: safeNumber(skills.writing, 0)
            });
        }, 100);

        return () => clearTimeout(timer);
    }, [safeProgress, skills]);

    const getSkillName = (skill) => {
        const names = {
            speaking: '말하기',
            listening: '듣기',
            reading: '읽기',
            writing: '쓰기'
        };
        return names[skill] || skill;
    };

    const getSkillIcon = (skill) => {
        const icons = {
            speaking: '🗣️',
            listening: '👂',
            reading: '📖',
            writing: '✍️'
        };
        return icons[skill] || '📚';
    };

    if (!safeLanguage || safeProgress == null || !safeCurrentLevel) {
        return (
            <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
                <h3 className="text-[18px] font-bold text-[#111111] mb-2">언어별 진도</h3>
                <p className="text-[14px] text-[var(--black-300)]">언어 학습 데이터를 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-[18px] font-bold text-[#111111]">{safeLanguage} 레벨</h3>
                    <p className="text-[14px] text-[#606060]">현재 레벨: {safeCurrentLevel}</p>
                </div>
                {trendLabel && typeof trendLabel === 'string' && (
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-[#00C471]">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-[14px] font-medium">{trendLabel}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] text-[#606060]">다음 레벨까지</span>
                    <span className="text-[14px] font-medium text-[#111111]">{animatedProgress}%</span>
                </div>
                <div className="relative h-10 bg-[#F1F3F5] rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00C471] to-[#00A85F] rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-3"
                        style={{ width: `${animatedProgress}%` }}
                    >
                        {animatedProgress > 20 && (
                            <Award className="w-5 h-5 text-white animate-pulse" />
                        )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[12px] font-medium text-[#606060]">
                            {safeCurrentLevel} → {safeNextLevel}
                        </span>
                    </div>
                </div>
                <p className="text-[12px] text-[#929292] mt-2">
                    {100 - safeProgress}% 더 학습하면 {safeNextLevel} 레벨에 도달해요!
                </p>
            </div>

            {/* Skills Breakdown */}
            <div className="space-y-3">
                <h4 className="text-[14px] font-medium text-[#111111] mb-3">영역별 실력</h4>
                {Object.entries(animatedSkills).map(([skill, value]) => {
                    const safeValue = safeNumber(value, 0);
                    return (
                        <div key={skill} className="flex items-center gap-3">
                            <span className="text-[20px] w-8 text-center">{getSkillIcon(skill)}</span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[12px] text-[#606060]">{getSkillName(skill)}</span>
                                    <span className="text-[12px] font-medium text-[#111111]">{safeValue}%</span>
                                </div>
                                <div className="h-2 bg-[#F1F3F5] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#00C471] rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${safeValue}%`,
                                            backgroundColor: safeValue >= 80 ? '#00A85F' : safeValue >= 60 ? '#00C471' : '#FFB3C1'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Next Goal */}
            <div className="mt-6 p-4 bg-[#F8FFF9] rounded-lg border border-[#00C471]/20">
                <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-[#00C471] mt-0.5" />
                    <div>
                        <p className="text-[14px] font-medium text-[#111111]">다음 목표</p>
                        <p className="text-[12px] text-[#606060] mt-1">{goalMessage}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
