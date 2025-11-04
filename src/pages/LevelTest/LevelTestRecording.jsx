import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import AudioRecorder from '../../components/AudioRecorder';
import CountdownTimer from '../../components/CountdownTimer';
import useLevelTestStore from '../../store/levelTestStore';
import { uploadVoiceRecording } from '../../api/levelTest';
import { ChevronRight, ChevronLeft } from 'lucide-react';


export default function LevelTestRecording() {
  const navigate = useNavigate();
  const {
    testId,
    currentQuestionIndex,
    totalQuestions,
    questions,
    nextQuestion,
    previousQuestion,
    setTestStatus,
    addRecording,
    clearCurrentRecording,
    getRecordingForQuestion,
    isCurrentQuestionRecorded,
    resetTimer,
    stopTimer,
    loadQuestions,
    isSubmitting,
    setIsSubmitting,
    currentRecording
  } = useLevelTestStore();

  const currentQuestion = questions[currentQuestionIndex];
  const hasRecording = isCurrentQuestionRecorded();
  const recordingForCurrentQuestion = getRecordingForQuestion(currentQuestionIndex);
  const currentQuestionDuration = useMemo(() => {
    const durationValue = Number(currentQuestion?.duration);
    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      return 600;
    }
    return Math.floor(durationValue);
  }, [currentQuestion]);

  useEffect(() => {
    setTestStatus('recording');

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
    if (!currentQuestion) {
      return;
    }
    resetTimer(currentQuestionDuration);
  }, [currentQuestion, currentQuestionDuration, resetTimer]);

  const handleRecordingComplete = (blob) => {
    addRecording({
      blob,
      duration: 0 // Duration will be set by the store
    });
    stopTimer();
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

        // Submit current recording to Workers API (업로드만 수행, 분석은 마지막에)
        const recordingBlob = recordingForCurrentQuestion?.blob || currentRecording?.blob;
        if (recordingBlob) {
          // 녹음 파일만 업로드 (분석은 Complete 페이지에서 일괄 처리)
          await uploadVoiceRecording(testId, recordingBlob);
          console.log(`Question ${currentQuestionIndex + 1} recording uploaded successfully`);
        }

        if (currentQuestionIndex < totalQuestions - 1) {
          nextQuestion();
        } else {
          // All questions completed - navigate to complete page which will handle final analysis
          setTestStatus('processing');
          navigate('/level-test/complete');
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
        navigate('/level-test');
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
    resetTimer(currentQuestionDuration);
  };

  return (
    <div className="min-h-screen page-bg flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E7E7] px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/level-test/check')}
            className="p-2 -ml-2 touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--black-500)]" />
          </button>
          <h1 className="text-[16px] sm:text-[18px] font-bold text-[#111111] break-words">
            질문 {currentQuestionIndex + 1} / {totalQuestions}
          </h1>
          <div className="w-8 sm:w-10" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-4 sm:px-6 py-2 sm:py-3">
        <div className="h-2 bg-[var(--black-50)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--green-500)] transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-8">
        {/* Question Card */}
        <div className="w-full max-w-2xl bg-white rounded-[20px] p-4 sm:p-6 mb-6 sm:mb-8 border border-[var(--black-50)]">
          <p className="text-[16px] sm:text-[18px] md:text-[20px] font-bold text-[var(--black-500)] mb-2 sm:mb-3 break-words leading-[1.4] sm:leading-[1.5]">
            {currentQuestion?.questionText || currentQuestion?.text || ''}
          </p>
        </div>

        {/* Timer */}
        <div className="mb-6 sm:mb-8">
          <CountdownTimer
            duration={currentQuestionDuration}
            onTimeUp={handleTimeUp}
          />
        </div>

        {/* Audio Recorder */}
        <div className="mb-6 sm:mb-8 w-full max-w-md">
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={hasRecording}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="w-full max-w-md space-y-2 sm:space-y-3">
          {hasRecording && (
            <>
              <CommonButton
                onClick={handleRetry}
                variant="secondary"
                className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px]"
              >
                다시 녹음하기
              </CommonButton>

              <CommonButton
                onClick={handleNext}
                variant="primary"
                className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white inline-block mr-2"></span>
                    제출 중...
                  </>
                ) : (
                  <>
                    {currentQuestionIndex < totalQuestions - 1 ? '다음 질문' : '테스트 완료'}
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
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
              className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px]"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              이전 질문
            </CommonButton>
          )}
        </div>

        {/* Skip Button - for testing */}
        {!hasRecording && (
          <button
            onClick={handleNext}
            className="mt-4 text-[#929292] text-[12px] sm:text-[13px] md:text-sm underline touch-manipulation break-words"
          >
            이 질문 건너뛰기 (테스트용)
          </button>
        )}
      </div>
    </div>
  );
}
