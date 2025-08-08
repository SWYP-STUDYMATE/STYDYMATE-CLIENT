import { useState, useEffect } from 'react';
import { TrendingUp, Award, Target } from 'lucide-react';

export default function LanguageLevelProgress({ 
  language = 'English', 
  currentLevel = 'B1', 
  progress = 65,
  nextLevel = 'B2',
  skills = {
    speaking: 70,
    listening: 65,
    reading: 75,
    writing: 60
  }
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedSkills, setAnimatedSkills] = useState({
    speaking: 0,
    listening: 0,
    reading: 0,
    writing: 0
  });

  useEffect(() => {
    // 애니메이션 효과
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
      setAnimatedSkills(skills);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress, skills]);

  const levelColors = {
    'A1': '#FFE4EC',
    'A2': '#FFB3C1',
    'B1': '#B3E5D1',
    'B2': '#00C471',
    'C1': '#00A85F',
    'C2': '#008F50'
  };

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

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[18px] font-bold text-[#111111]">{language} 레벨</h3>
          <p className="text-[14px] text-[#606060]">현재 레벨: {currentLevel}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[#00C471]">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[14px] font-medium">+15% 이번 달</span>
          </div>
        </div>
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
              {currentLevel} → {nextLevel}
            </span>
          </div>
        </div>
        <p className="text-[12px] text-[#929292] mt-2">
          {100 - progress}% 더 학습하면 {nextLevel} 레벨에 도달해요!
        </p>
      </div>

      {/* Skills Breakdown */}
      <div className="space-y-3">
        <h4 className="text-[14px] font-medium text-[#111111] mb-3">영역별 실력</h4>
        {Object.entries(skills).map(([skill, value]) => (
          <div key={skill} className="flex items-center gap-3">
            <span className="text-[20px] w-8 text-center">{getSkillIcon(skill)}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-[#606060]">{getSkillName(skill)}</span>
                <span className="text-[12px] font-medium text-[#111111]">{animatedSkills[skill]}%</span>
              </div>
              <div className="h-2 bg-[#F1F3F5] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00C471] rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${animatedSkills[skill]}%`,
                    backgroundColor: value >= 80 ? '#00A85F' : value >= 60 ? '#00C471' : '#FFB3C1'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Goal */}
      <div className="mt-6 p-4 bg-[#F8FFF9] rounded-lg border border-[#00C471]/20">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-[#00C471] mt-0.5" />
          <div>
            <p className="text-[14px] font-medium text-[#111111]">다음 목표</p>
            <p className="text-[12px] text-[#606060] mt-1">
              말하기 실력을 75%까지 올려보세요. 주 3회 이상 음성 세션에 참여하면 빠르게 향상됩니다!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}