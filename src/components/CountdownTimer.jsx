import React, { useEffect, useRef } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import useLevelTestStore from '../store/levelTestStore';

const CountdownTimer = ({ duration = 180, onTimeUp, autoStart = false }) => {
  const intervalRef = useRef(null);
  
  const {
    timerSeconds,
    isTimerRunning,
    setTimerSeconds,
    startTimer,
    stopTimer,
    decrementTimer
  } = useLevelTestStore();

  useEffect(() => {
    // Initialize timer with duration
    setTimerSeconds(duration);
    
    if (autoStart) {
      startTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [duration, autoStart, setTimerSeconds, startTimer]);

  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        decrementTimer();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (timerSeconds === 0 && isTimerRunning) {
        stopTimer();
        if (onTimeUp) {
          onTimeUp();
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, timerSeconds, decrementTimer, stopTimer, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((duration - timerSeconds) / duration) * 100;
  };

  const getTimerColor = () => {
    const percentage = (timerSeconds / duration) * 100;
    if (percentage > 50) return '#00C471'; // Green
    if (percentage > 20) return '#FFA500'; // Orange
    return '#EA4335'; // Red
  };

  const isWarning = timerSeconds <= 30;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Circular Progress */}
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="#E7E7E7"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke={getTimerColor()}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (getProgressPercentage() / 100)}`}
            className="transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Clock className={`w-8 h-8 mb-2 ${isWarning ? 'text-[#EA4335]' : 'text-[#929292]'}`} />
          <div className={`text-3xl font-bold ${isWarning ? 'text-[#EA4335]' : 'text-[#111111]'}`}>
            {formatTime(timerSeconds)}
          </div>
          {isWarning && (
            <div className="text-sm text-[#EA4335] mt-1 animate-pulse">
              시간 초과 임박
            </div>
          )}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center space-x-4">
        {!isTimerRunning ? (
          <button
            onClick={startTimer}
            className="px-6 py-2 bg-[#00C471] hover:bg-[#00B267] text-white rounded-lg font-medium transition-colors duration-200"
          >
            타이머 시작
          </button>
        ) : (
          <button
            onClick={stopTimer}
            className="px-6 py-2 bg-[#929292] hover:bg-[#606060] text-white rounded-lg font-medium transition-colors duration-200"
          >
            타이머 정지
          </button>
        )}
        
        <button
          onClick={() => setTimerSeconds(duration)}
          className="px-6 py-2 bg-white hover:bg-[#F8F9FA] text-[#111111] border border-[#E7E7E7] rounded-lg font-medium transition-colors duration-200"
        >
          리셋
        </button>
      </div>

      {/* Warning Message */}
      {isWarning && (
        <div className="flex items-center space-x-2 p-3 bg-[#FFF4E6] rounded-lg">
          <AlertCircle className="w-5 h-5 text-[#FFA500]" />
          <p className="text-sm text-[#606060]">
            남은 시간이 30초 이하입니다. 답변을 마무리해주세요.
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center max-w-md">
        <p className="text-sm text-[#929292]">
          각 질문당 {Math.floor(duration / 60)}분의 시간이 주어집니다.
          시간 내에 답변을 완료해주세요.
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;