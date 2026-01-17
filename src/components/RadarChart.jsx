import { useEffect, useMemo, useState } from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function RadarChart({ scores = {}, animate = true, scoreKeys = [], labels = {} }) {
  const categories = useMemo(() => {
    const keys = scoreKeys.length > 0 ? scoreKeys : Object.keys(scores);

    return keys.map((key) => ({
      key,
      label: labels[key] || key,
    }));
  }, [scoreKeys, scores, labels]);

  const targetScores = useMemo(
    () => categories.map(({ key }) => (Number.isFinite(scores[key]) ? scores[key] : 0)),
    [categories, scores]
  );

  const [animatedScores, setAnimatedScores] = useState(() => targetScores.map(() => 0));

  useEffect(() => {
    if (categories.length === 0) {
      setAnimatedScores([]);
      return;
    }

    if (!animate) {
      setAnimatedScores(targetScores.map((value) => Math.round(value)));
      return;
    }

    setAnimatedScores(targetScores.map(() => 0));

    const animationDuration = 1500; // 1.5초
    const frameInterval = 16; // 약 60fps
    const totalFrames = Math.max(Math.round(animationDuration / frameInterval), 1);
    let currentFrame = 0;

    const animationTimer = setInterval(() => {
      currentFrame += 1;
      const progress = currentFrame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setAnimatedScores(targetScores.map((score) => Math.round(score * easeProgress)));

      if (currentFrame >= totalFrames) {
        clearInterval(animationTimer);
      }
    }, frameInterval);

    return () => {
      clearInterval(animationTimer);
    };
  }, [targetScores, animate, categories.length]);

  const averageScore = categories.length > 0
    ? Math.round(targetScores.reduce((sum, score) => sum + (score || 0), 0) / categories.length)
    : 0;

  // recharts 데이터 형식으로 변환
  const data = useMemo(() => {
    return categories.map((category, index) => ({
      subject: category.label,
      score: animatedScores[index] || 0,
      fullMark: 100,
    }));
  }, [categories, animatedScores]);

  if (categories.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center text-[14px] text-[#929292]">
        표시할 점수가 없습니다.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#E7E7E7" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#666666', fontSize: 14, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickCount={6}
            tick={{ fill: '#999999', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="점수"
            dataKey="score"
            stroke="#00C471"
            strokeWidth={2}
            fill="rgba(0, 196, 113, 0.3)"
            dot={{ fill: '#00C471', strokeWidth: 0, r: 4 }}
            isAnimationActive={false}
          />
          <Tooltip
            formatter={(value, name) => [`${value}점`, '점수']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E7E7E7',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="bg-white/90 rounded-full px-4 py-2">
          <p className="text-[12px] text-[#666666]">평균</p>
          <p className="text-[24px] font-bold text-[#00C471]">{averageScore}</p>
        </div>
      </div>
    </div>
  );
}
