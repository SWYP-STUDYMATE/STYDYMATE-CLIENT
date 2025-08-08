import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import AudioRecorder from '../../components/AudioRecorder';
import CountdownTimer from '../../components/CountdownTimer';
import useLevelTestStore from '../../store/levelTestStore';
import { submitLevelTest, completeLevelTest } from '../../api/levelTest';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function LevelTestRecording() {
  const navigate = useNavigate();
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const {
    currentQuestionIndex,
    totalQuestions,
    questions,
    recordings,
    nextQuestion,
    previousQuestion,
    setTestStatus,
    addRecording,
    setCurrentRecording,
    clearCurrentRecording,
    getRecordingForQuestion,
    isCurrentQuestionRecorded,
    isTestComplete,
    resetTimer,
    stopTimer,
    loadQuestions,
    submitTest,
    isSubmitting,
    submitError
  } = useLevelTestStore();

  const currentQuestion = questions[currentQuestionIndex];
  const hasRecording = isCurrentQuestionRecorded();
  const recordingForCurrentQuestion = getRecordingForQuestion(currentQuestionIndex);

  useEffect(() => {
    setTestStatus('recording');
    setIsTimerRunning(true);

    // Load questions if not already loaded
    if (questions.length === 0) {
      loadQuestions();
    }

    return () => {
      stopTimer();
      clearCurrentRecording();
    };
  }, [setTestStatus, stopTimer, clearCurrentRecording, loadQuestions, questions.length]);

  useEffect(() => {
    resetTimer();
    setIsTimerRunning(false);
    setTimeout(() => setIsTimerRunning(true), 100);
  }, [currentQuestionIndex, resetTimer]);

  const handleRecordingComplete = (blob) => {
    addRecording({
      blob,
      duration: 0 // Duration will be set by the store
    });
    setIsTimerRunning(false);
  };

  const handleTimeUp = () => {
    // Timer expired - auto move to next question if not recording
    if (!hasRecording) {
      alert('시간이 초과되었습니다. 다음 질문으로 이동합니다.');
      handleNext();
    }
  };

  const handleNext = async () => {
    if (hasRecording && !isSubmitting) {
      try {
        setIsSubmitting(true);

        // Submit current recording to API
        const userId = localStorage.getItem('userId') || 'guest';
        await submitLevelTest(currentRecording.blob, currentQuestionIndex + 1);

        if (currentQuestionIndex < totalQuestions - 1) {
          nextQuestion();
        } else {
          // All questions completed
          setTestStatus('processing');

          // Complete test and get evaluation
          const result = await completeLevelTest(userId);

          // Store result in store
          setTestResult(result);

          // Navigate to result page
          navigate('/level-test/result');
        }
      } catch (error) {
        console.error('Test submission error:', error);
        alert('테스트 제출에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (!hasRecording) {
      // Skip question (for testing)
      if (currentQuestionIndex < totalQuestions - 1) {
        nextQuestion();
      } else {
        navigate('/level-test/result');
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
    }
  };

  const handleRetry = () => {
    // Remove current recording from store
    const updatedRecordings = recordings.filter(r => r.questionIndex !== currentQuestionIndex);
    // This would need a new store method to update recordings
    resetTimer();
    setIsTimerRunning(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/level-test/check')}
            className="p-2 -ml-2"
          >
            <ChevronLeft className="w-6 h-6 text-[#111111]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#111111]">
            질문 {currentQuestionIndex + 1} / {totalQuestions}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-6 py-3">
        <div className="h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00C471] transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-8">
        {/* Question Card */}
        <div className="w-full max-w-2xl bg-white rounded-[20px] p-6 mb-8 border border-[#E7E7E7]">
          <p className="text-[20px] font-bold text-[#111111] mb-3">
            {currentQuestion?.text || currentQuestion?.question || ''}
          </p>
          <p className="text-[16px] text-[#606060]">
            {currentQuestion?.korean || ''}
          </p>
        </div>

        {/* Timer */}
        <div className="mb-8">
          <CountdownTimer
            duration={currentQuestion?.duration || 180}
            onTimeUp={handleTimeUp}
            autoStart={isTimerRunning}
          />
        </div>

        {/* Audio Recorder */}
        <div className="mb-8 w-full max-w-md">
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={hasRecording}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="w-full max-w-md space-y-3">
          {hasRecording && (
            <>
              <CommonButton
                onClick={handleRetry}
                variant="secondary"
                className="w-full"
              >
                다시 녹음하기
              </CommonButton>

              <CommonButton
                onClick={handleNext}
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></span>
                    제출 중...
                  </>
                ) : (
                  <>
                    {currentQuestionIndex < totalQuestions - 1 ? '다음 질문' : '테스트 완료'}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </CommonButton>
            </>
          )}

          {/* Previous Button - only show if not first question */}
          {currentQuestionIndex > 0 && (
            <CommonButton
              onClick={handlePrevious}
              variant="secondary"
              className="w-full"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              이전 질문
            </CommonButton>
          )}
        </div>

        {/* Skip Button - for testing */}
        {!hasRecording && (
          <button
            onClick={handleNext}
            className="mt-4 text-[#929292] text-sm underline"
          >
            이 질문 건너뛰기 (테스트용)
          </button>
        )}
      </div>
    </div>
  );
}