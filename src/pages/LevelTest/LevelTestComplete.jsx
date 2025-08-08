import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLevelTestStore from '../../stores/levelTestStore';
import CommonButton from '../../components/CommonButton';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function LevelTestComplete() {
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('uploading'); // uploading, analyzing, complete, error
  const [errorMessage, setErrorMessage] = useState('');

  const recordings = useLevelTestStore(state => state.recordings);
  const questions = useLevelTestStore(state => state.questions);
  const resetTest = useLevelTestStore(state => state.resetTest);

  // 임시 userId (실제로는 로그인 사용자 ID 사용)
  const userId = localStorage.getItem('userId') || 'test-user-' + Date.now();

  useEffect(() => {
    if (!recordings.length) {
      navigate('/level-test');
      return;
    }

    // userId 저장
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', userId);
    }

    uploadRecordings();
  }, []);

  const uploadRecordings = async () => {
    try {
      setUploadStatus('uploading');
      const totalRecordings = recordings.length;
      let uploadedCount = 0;
      const uploadResults = [];

      // 각 녹음 파일 업로드
      for (const recording of recordings) {
        const formData = new FormData();
        formData.append('audio', recording.blob, 'recording.webm');
        formData.append('questionId', String(recording.questionIndex + 1));
        formData.append('userId', userId);

        const response = await fetch('/api/level-test/audio', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload failed for question ${recording.questionIndex + 1}`);
        }

        const result = await response.json();
        uploadResults.push({
          questionId: String(recording.questionIndex + 1),
          transcription: result.transcription
        });

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalRecordings) * 50)); // 업로드는 전체의 50%
      }

      // 분석 요청
      setUploadStatus('analyzing');
      const analyzeResponse = await fetch('/api/level-test/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          responses: uploadResults.map((result, index) => ({
            questionId: result.questionId,
            question: questions[index].question,
            transcription: result.transcription
          }))
        })
      });

      if (!analyzeResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analysisResult = await analyzeResponse.json();
      setUploadProgress(100);
      setUploadStatus('complete');

      // 결과 저장
      useLevelTestStore.getState().setTestResult(analysisResult);

      // 2초 후 결과 페이지로 이동
      setTimeout(() => {
        navigate('/level-test/result');
      }, 2000);

    } catch (error) {
      console.error('Upload/Analysis error:', error);
      setUploadStatus('error');
      setErrorMessage(error.message || '처리 중 오류가 발생했습니다.');
    }
  };

  const handleRetry = () => {
    setUploadProgress(0);
    setErrorMessage('');
    uploadRecordings();
  };

  const handleRetake = () => {
    resetTest();
    navigate('/level-test');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* 상태 아이콘 */}
        <div className="flex justify-center mb-8">
          {uploadStatus === 'error' ? (
            <XCircle className="w-20 h-20 text-red-500" />
          ) : uploadStatus === 'complete' ? (
            <CheckCircle2 className="w-20 h-20 text-[#00C471]" />
          ) : (
            <Loader2 className="w-20 h-20 text-[#00C471] animate-spin" />
          )}
        </div>

        {/* 메시지 */}
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-[#111111] mb-3">
            {uploadStatus === 'uploading' && '음성 파일을 업로드하고 있어요'}
            {uploadStatus === 'analyzing' && 'AI가 레벨을 분석하고 있어요'}
            {uploadStatus === 'complete' && '분석이 완료되었어요!'}
            {uploadStatus === 'error' && '오류가 발생했어요'}
          </h1>
          <p className="text-[16px] text-[#666666]">
            {uploadStatus === 'uploading' && '잠시만 기다려주세요...'}
            {uploadStatus === 'analyzing' && '이 과정은 약 30초 정도 소요됩니다'}
            {uploadStatus === 'complete' && '곧 결과 화면으로 이동합니다'}
            {uploadStatus === 'error' && errorMessage}
          </p>
        </div>

        {/* 진행률 바 */}
        {uploadStatus !== 'error' && (
          <div className="mb-8">
            <div className="flex justify-between text-[14px] text-[#929292] mb-2">
              <span>진행률</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-3 bg-[#E7E7E7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00C471] transition-all duration-500 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 단계 표시 */}
        {uploadStatus !== 'error' && (
          <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] mb-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${uploadProgress >= 50 ? 'bg-[#00C471]' : 'bg-[#E7E7E7]'
                  }`}>
                  {uploadProgress >= 50 && (
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                      <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`text-[16px] ${uploadProgress >= 50 ? 'text-[#111111] font-semibold' : 'text-[#929292]'
                  }`}>
                  음성 파일 업로드
                </span>
              </div>

              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${uploadProgress >= 100 ? 'bg-[#00C471]' : 'bg-[#E7E7E7]'
                  }`}>
                  {uploadProgress >= 100 && (
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                      <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`text-[16px] ${uploadProgress >= 100 ? 'text-[#111111] font-semibold' : 'text-[#929292]'
                  }`}>
                  AI 레벨 분석
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 에러 시 버튼 */}
        {uploadStatus === 'error' && (
          <div className="space-y-3">
            <CommonButton
              onClick={handleRetry}
              variant="primary"
              className="w-full"
            >
              다시 시도
            </CommonButton>
            <CommonButton
              onClick={handleRetake}
              variant="secondary"
              className="w-full"
            >
              테스트 다시 하기
            </CommonButton>
          </div>
        )}
      </div>
    </div>
  );
}