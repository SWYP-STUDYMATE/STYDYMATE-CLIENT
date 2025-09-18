import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useLevelTestStore from '../../store/levelTestStore';
import { analyzeVoiceTest, getVoiceTestResult } from '../../api/levelTest';

export default function LevelTestComplete() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [hasAttemptedProcessing, setHasAttemptedProcessing] = useState(false);

  const setTestStatus = useLevelTestStore(state => state.setTestStatus);
  const setTestResult = useLevelTestStore(state => state.setTestResult);
  const recordings = useLevelTestStore(state => state.recordings);
  const testId     = useLevelTestStore(state => state.testId); 

  useEffect(() => {
    if (hasAttemptedProcessing) {
      return;
    }

    const numericTestId = Number(testId);

    if (!testId || Number.isNaN(numericTestId)) {
      setError('유효하지 않은 테스트 ID 입니다.');
      setIsProcessing(false);
      setHasAttemptedProcessing(true);
      return;
    }

    if (recordings.length === 0) {
      setError('녹음된 데이터가 없습니다.');
      setIsProcessing(false);
      setHasAttemptedProcessing(true);
      return;
    }

    const processTest = async () => {
      try {
        setIsProcessing(true);
        setTestStatus('processing');

        // 최소 2초 대기 (UX를 위해)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 1) 서버에 분석 요청
        await analyzeVoiceTest(numericTestId);

        // 2) 분석 완료될 때까지 result 폴링 (최대 6초, 500ms 간격)
        const MAX_TRIES = 12;
        const SLEEP_MS = 500;
        let result = null;

        for (let i = 0; i < MAX_TRIES; i++) {
          try {
            result = await getVoiceTestResult(numericTestId);
            if (result) {
              break;
            }
          } catch (e) {
            const code = e?.response?.data?.error?.code;
            if (code !== 'TEST_NOT_COMPLETED') {
              throw e;
            }
          }
          await new Promise(r => setTimeout(r, SLEEP_MS));
        }

        if (!result) {
          throw new Error('분석 결과를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.');
        }

        setTestResult(result?.data ?? result);
        setTestStatus('completed');
        setIsProcessing(false);
        Promise.resolve().then(() => navigate('/level-test/result'));
      } catch (err) {
        console.error('Test processing error:', err);
        setError(err.message || '테스트 분석 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    setHasAttemptedProcessing(true);
    processTest();
  }, [hasAttemptedProcessing, testId, recordings.length, setTestStatus, setTestResult, navigate]);


  return (
    <div className="min-h-screen page-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {isProcessing && !error ? (
          <>
            <div className="mb-8">
              <div className="relative">
                <Loader2 className="w-20 h-20 text-[#00C471] animate-spin mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-[var(--green-500)] opacity-20 rounded-full animate-ping" />
                </div>
              </div>
            </div>

            <h1 className="text-[24px] font-bold text-[#111111] mb-4">
              테스트 분석 중...
            </h1>

            <p className="text-[16px] text-[#666666] mb-2">
              AI가 당신의 영어 실력을 평가하고 있습니다.
            </p>

            <p className="text-[14px] text-[#929292]">
              잠시만 기다려주세요.
            </p>

            <div className="mt-8 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-[var(--green-500)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[var(--green-500)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[var(--green-500)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </>
        ) : error ? (
          <>
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>

            <h1 className="text-[24px] font-bold text-[#111111] mb-4">
              오류가 발생했습니다
            </h1>

            <p className="text-[16px] text-[#666666] mb-6">
              {error}
            </p>

            <CommonButton
              onClick={() => navigate('/level-test')}
              variant="primary"
              className="w-full max-w-xs"
            >
              처음으로 돌아가기
            </CommonButton>
          </>
        ) : (
          <>
            <div className="mb-8">
              <CheckCircle className="w-20 h-20 text-[#00C471] mx-auto" />
            </div>

            <h1 className="text-[24px] font-bold text-[#111111] mb-4">
              분석 완료!
            </h1>

            <p className="text-[16px] text-[#666666]">
              결과를 확인하고 있습니다...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
