import { useEffect, useState } from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const SKILL_CATEGORIES = [
  { name: 'Grammar', fullName: '문법' },
  { name: 'Vocabulary', fullName: '어휘' },
  { name: 'Pronunciation', fullName: '발음' },
  { name: 'Fluency', fullName: '유창성' },
  { name: 'Comprehension', fullName: '이해력' },
  { name: 'Confidence', fullName: '자신감' }
];

export default function RadarChart({ scores = {}, animate = true }) {
  const [animatedScores, setAnimatedScores] = useState(
    SKILL_CATEGORIES.map(skill => ({
      skill: skill.name,
      skillKr: skill.fullName,
      score: 0,
      fullMark: 100
    }))
  );

  useEffect(() => {
    if (!animate) {
      setAnimatedScores(
        SKILL_CATEGORIES.map(skill => ({
          skill: skill.name,
          skillKr: skill.fullName,
          score: scores[skill.name.toLowerCase()] || 0,
          fullMark: 100
        }))
      );
      return;
    }

    // 애니메이션 효과
    const targetScores = SKILL_CATEGORIES.map(skill => ({
      skill: skill.name,
      skillKr: skill.fullName,
      score: scores[skill.name.toLowerCase()] || 0,
      fullMark: 100
    }));

    const animationDuration = 1500; // 1.5초
    const frameInterval = 16; // 약 60fps
    const totalFrames = animationDuration / frameInterval;
    let currentFrame = 0;

    const animationTimer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setAnimatedScores(
        targetScores.map((target, index) => ({
          ...target,
          score: Math.round(target.score * easeProgress)
        }))
      );

      if (currentFrame >= totalFrames) {
        clearInterval(animationTimer);
      }
    }, frameInterval);

    return () => clearInterval(animationTimer);
  }, [scores, animate]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-[#E7E7E7]">
          <p className="text-[14px] font-semibold text-[#111111]">
            {data.skillKr} ({data.skill})
          </p>
          <p className="text-[14px] text-[#00C471]">
            점수: {data.score}점
          </p>
        </div>
      );
    }
    return null;
  };

  // 평균 점수 계산
  const averageScore = Math.round(
    Object.values(scores).reduce((sum, score) => sum + (score || 0), 0) / 
    Object.values(scores).filter(score => score !== undefined).length || 0
  );

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={animatedScores}>
          <PolarGrid 
            gridType="polygon"
            radialLines={false}
            stroke="#E7E7E7"
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ 
              fill: '#666666', 
              fontSize: 14,
              fontWeight: 500
            }}
            className="select-none"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickCount={6}
            tick={{ 
              fill: '#929292', 
              fontSize: 12 
            }}
            axisLine={false}
          />
          <Radar
            name="Skills"
            dataKey="score"
            stroke="#00C471"
            strokeWidth={2}
            fill="#00C471"
            fillOpacity={0.3}
            animationDuration={animate ? 1500 : 0}
            animationEasing="ease-out"
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadarChart>
      </ResponsiveContainer>
      
      {/* 중앙 평균 점수 표시 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="bg-white/90 rounded-full px-4 py-2">
          <p className="text-[12px] text-[#666666]">평균</p>
          <p className="text-[24px] font-bold text-[#00C471]">{averageScore}</p>
        </div>
      </div>
    </div>
  );
}