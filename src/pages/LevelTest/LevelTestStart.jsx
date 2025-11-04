import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import useLevelTestStore from '../../store/levelTestStore';
import { useAlert } from '../../hooks/useAlert';
import { getUserFriendlyMessage } from '../../utils/errorHandler';
import { startVoiceTest } from '../../api/levelTest';

export default function LevelTestStart() {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetTest, setQuestions, setTestId, setTestStatus } = useLevelTestStore();

  const { showError } = useAlert();

  const handleStart = async () => {
    try {
      setIsAnimating(true);
      setIsLoading(true);
      
      // 테스트 초기화
      resetTest();
      
     const res = await startVoiceTest('English', 'Intermediate'); 
     const voice = res ?? {};
     const vid = voice?.testId ?? voice?.id;
     if (!vid) throw new Error('VOICE_TEST_ID_MISSING');

     setTestId(String(vid));
     sessionStorage.setItem('levelTest.testId', String(vid));

     // 질문 1개 구성: 백엔드 instructions를 그대로 표시
     const prompt = voice?.instructions || 'Please read the following text aloud clearly.';
     const duration = (voice?.estimatedDurationMinutes ?? 10) * 60;
     setQuestions([
       { id: 1, questionText: prompt, duration: duration, difficulty: 'VOICE' }
     ]);
     setTestStatus('connection-check');

     setTimeout(() => { navigate('/level-test/check'); }, 300);
    } catch (error) {
      console.error('Failed to start test:', error);
      const message = getUserFriendlyMessage(error);
      showError(message);
      setIsAnimating(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <div className="max-w-[768px] w-full mx-auto flex flex-col min-h-screen overflow-y-auto">
        {/* 헤더 */}
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-16 sm:pb-20">
          {/* 캐릭터 애니메이션 영역 */}
          <div className={`mb-8 sm:mb-12 transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gradient-to-br from-[var(--green-500)] to-[var(--green-600)] rounded-full flex items-center justify-center animate-pulse animate-float animate-glow">
              <div className="text-white text-5xl sm:text-6xl font-bold">AI</div>
            </div>
          </div>

          {/* 타이틀 */}
          <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[var(--black-500)] mb-3 sm:mb-4 text-center leading-[1.3] sm:leading-[1.35] md:leading-[42px] break-words px-4">
            AI 레벨 테스트
          </h1>

          {/* 설명 텍스트 */}
          <div className="text-center mb-8 sm:mb-12 px-4">
            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[var(--black-300)] leading-[1.4] sm:leading-[1.5] md:leading-[24px] mb-2 break-words">
              간단한 영어 대화를 통해
            </p>
            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[var(--black-300)] leading-[1.4] sm:leading-[1.5] md:leading-[24px] mb-2 break-words">
              당신의 영어 실력을 측정해드릴게요
            </p>
            <p className="text-[12px] sm:text-[13px] md:text-[14px] text-[var(--black-200)] leading-[1.4] sm:leading-[1.5] md:leading-[20px] mt-3 sm:mt-4 break-words">
              약 5-10분 소요
            </p>
          </div>

          {/* 특징 리스트 */}
          <div className="w-full max-w-[400px] space-y-3 sm:space-y-4 mb-8 sm:mb-12 px-4">
            <div className="flex items-start sm:items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[rgba(0,196,113,0.12)] rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[13px] sm:text-[14px] text-[var(--black-500)] leading-[1.4] sm:leading-[1.5] break-words">AI가 실시간으로 발음과 문법 분석</span>
            </div>
            <div className="flex items-start sm:items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[rgba(0,196,113,0.12)] rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[13px] sm:text-[14px] text-[var(--black-500)] leading-[1.4] sm:leading-[1.5] break-words">CEFR 기준에 따른 정확한 레벨 측정</span>
            </div>
            <div className="flex items-start sm:items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[rgba(0,196,113,0.12)] rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[13px] sm:text-[14px] text-[var(--black-500)] leading-[1.4] sm:leading-[1.5] break-words">맞춤형 학습 추천 제공</span>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-4 sm:px-6 pb-6 sm:pb-8">
          <CommonButton
            onClick={handleStart}
            className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px]"
            variant="success"
            disabled={isLoading}
          >
            {isLoading ? '준비 중...' : '시작하기'}
          </CommonButton>
        </div>
      </div>
    </div>
  );
}