import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Chart.js Radar 차트 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

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
    SKILL_CATEGORIES.map(skill => scores[skill.name.toLowerCase()] || 0)
  );

  useEffect(() => {
    if (!animate) {
      setAnimatedScores(
        SKILL_CATEGORIES.map(skill => scores[skill.name.toLowerCase()] || 0)
      );
      return;
    }

    // 애니메이션 효과
    const targetScores = SKILL_CATEGORIES.map(skill => scores[skill.name.toLowerCase()] || 0);

    const animationDuration = 1500; // 1.5초
    const frameInterval = 16; // 약 60fps
    const totalFrames = animationDuration / frameInterval;
    let currentFrame = 0;

    const animationTimer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setAnimatedScores(
        targetScores.map(score => Math.round(score * easeProgress))
      );

      if (currentFrame >= totalFrames) {
        clearInterval(animationTimer);
      }
    }, frameInterval);

    return () => clearInterval(animationTimer);
  }, [scores, animate]);

  // 평균 점수 계산
  const averageScore = Math.round(
    Object.values(scores).reduce((sum, score) => sum + (score || 0), 0) /
    Object.values(scores).filter(score => score !== undefined).length || 0
  );

  // Chart.js 데이터 구조
  const data = {
    labels: SKILL_CATEGORIES.map(skill => skill.fullName),
    datasets: [
      {
        label: '점수',
        data: animatedScores,
        backgroundColor: 'rgba(0, 196, 113, 0.3)',
        borderColor: '#00C471',
        borderWidth: 2,
        pointBackgroundColor: '#00C471',
        pointBorderColor: '#00C471',
        pointHoverBackgroundColor: '#00C471',
        pointHoverBorderColor: '#00C471',
      },
    ],
  };

  // Chart.js 옵션
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: animate ? 1500 : 0,
      easing: 'easeOutCubic',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const skill = SKILL_CATEGORIES[context.dataIndex];
            return `${skill.fullName}: ${context.parsed.r}점`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: function(value) {
            return value;
          }
        },
        grid: {
          color: '#E7E7E7'
        },
        angleLines: {
          color: '#E7E7E7'
        },
        pointLabels: {
          color: '#666666',
          font: {
            size: 14,
            weight: 500
          }
        }
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <Radar data={data} options={options} />

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