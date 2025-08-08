import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import AudioRecorder from '../../components/AudioRecorder';
import CountdownTimer from '../../components/CountdownTimer';
import useLevelTestStore from '../../stores/levelTestStore';
import { ChevronRight, ChevronLeft, RotateCw, Send } from 'lucide-react';

export default function LevelTestRecording() {
  const navigate = useNavigate();
  const [hasRecorded, setHasRecorded] = useState(false);
  
  const {
    currentQuestionIndex,
    totalQuestions,
    questions,
    recordings,
    getCurrentQuestion,
    nextQuestion,
    previousQuestion,
    isFirstQuestion,
    isLastQuestion,
    getProgress,
    hasCompletedAllQuestions,
    stopRecording
  } = useLevelTestStore();

  const currentQuestion = getCurrentQuestion();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopRecording();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleStopRecording();
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const newRecording = {
          questionId: questions[currentQuestion].id,
          blob: audioBlob,
          duration: recordingTime
        };
        setRecordings(prev => [...prev, newRecording]);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('마이크 권한을 허용해주세요.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleRetry = () => {
    setRecordings(prev => prev.filter(r => r.questionId !== questions[currentQuestion].id));
    setTimeLeft(180);
    setRecordingTime(0);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(180);
      setRecordingTime(0);
    } else {
      // Save recordings and navigate to complete page
      navigate('/level-test/complete');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasRecording = recordings.some(r => r.questionId === questions[currentQuestion].id);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-[18px] font-bold text-[#111111]">
            질문 {currentQuestion + 1} / {questions.length}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-6 py-3">
        <div className="h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00C471] transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Question */}
        <div className="bg-white rounded-[20px] p-6 mb-6 border border-[#E7E7E7]">
          <p className="text-[18px] font-bold text-[#111111] mb-3">
            {questions[currentQuestion].question}
          </p>
          <p className="text-[14px] text-[#929292]">
            {questions[currentQuestion].korean}
          </p>
        </div>

        {/* Timer */}
        <div className="text-center mb-8">
          <p className="text-[14px] text-[#929292] mb-2">남은 시간</p>
          <p className={`text-[32px] font-bold ${timeLeft < 30 ? 'text-[#EA4335]' : 'text-[#111111]'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>

        {/* Recording Visualization */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <div className={`relative ${isRecording ? 'animate-pulse' : ''}`}>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-[#EA4335]' : hasRecording ? 'bg-[#00C471]' : 'bg-[#E7E7E7]'
            }`}>
              {isRecording ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </div>
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-[#EA4335] animate-ping" />
            )}
          </div>
        </div>

        {/* Recording Time */}
        {(isRecording || hasRecording) && (
          <div className="text-center mb-6">
            <p className="text-[14px] text-[#929292]">
              {isRecording ? '녹음 중' : '녹음 완료'}: {formatTime(recordingTime)}
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="space-y-3">
          {!isRecording && !hasRecording && (
            <CommonButton
              onClick={startRecording}
              variant="primary"
              className="w-full"
            >
              <Mic className="w-5 h-5 mr-2" />
              녹음 시작
            </CommonButton>
          )}

          {isRecording && (
            <CommonButton
              onClick={handleStopRecording}
              variant="primary"
              className="w-full bg-[#EA4335] hover:bg-[#D33125]"
            >
              <MicOff className="w-5 h-5 mr-2" />
              녹음 중지
            </CommonButton>
          )}

          {hasRecording && !isRecording && (
            <>
              <CommonButton
                onClick={handleRetry}
                variant="secondary"
                className="w-full"
              >
                <RotateCw className="w-5 h-5 mr-2" />
                다시 녹음
              </CommonButton>
              <CommonButton
                onClick={handleNext}
                variant="primary"
                className="w-full"
              >
                {currentQuestion < questions.length - 1 ? '다음 질문' : '완료'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </CommonButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}