import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useLevelTestStore from '../../store/levelTestStore';

export default function LevelTestComplete() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  
  const testStatus = useLevelTestStore(state => state.testStatus);
  const setTestStatus = useLevelTestStore(state => state.setTestStatus);

  useEffect(() => {
    // 테스트 상태가 'processing'이 아니면 리디렉션
    if (testStatus !== 'processing') {
      navigate('/level-test');
      return;
    }

    // 3초 후 결과 페이지로 이동
    const timer = setTimeout(() => {
      setTestStatus('completed');
      navigate('/level-test/result');
    }, 3000);

    return () => clearTimeout(timer);
  }, [testStatus, navigate, setTestStatus]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {isProcessing && !error ? (
          <>
            <div className="mb-8">
              <div className="relative">
                <Loader2 className="w-20 h-20 text-[#00C471] animate-spin mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#00C471] opacity-20 rounded-full animate-ping" />
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
              <div className="w-2 h-2 bg-[#00C471] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#00C471] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#00C471] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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