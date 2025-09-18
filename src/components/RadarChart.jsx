import { useEffect, useMemo, useState } from 'react';
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

  const data = {
    labels: categories.map((category) => category.label),
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
            const skill = categories[context.dataIndex];
            return `${skill.label}: ${context.parsed.r}점`;
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

  if (categories.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center text-[14px] text-[#929292]">
        표시할 점수가 없습니다.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <Radar data={data} options={options} />

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="bg-white/90 rounded-full px-4 py-2">
          <p className="text-[12px] text-[#666666]">평균</p>
          <p className="text-[24px] font-bold text-[#00C471]">{averageScore}</p>
        </div>
      </div>
    </div>
  );
}
