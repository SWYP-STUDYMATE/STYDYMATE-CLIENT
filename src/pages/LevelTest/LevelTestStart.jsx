import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import useLevelTestStore from '../../store/levelTestStore';
import { useAlert } from '../../hooks/useAlert';
import { getUserFriendlyMessage } from '../../utils/errorHandler';

export default function LevelTestStart() {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetTest, startNewTest, loadQuestions } = useLevelTestStore();
  const { showError } = useAlert();

  const handleStart = async () => {
    try {
      setIsAnimating(true);
      setIsLoading(true);
      
      // 테스트 초기화
      resetTest();
      
      // Spring Boot API로 테스트 시작
      const testData = await startNewTest('en');
      
      if (testData?.testId) {
        // 질문 로드
        await loadQuestions();
        
        setTimeout(() => {
          navigate('/level-test/check');
        }, 300);
      } else {
        throw new Error('테스트를 시작할 수 없습니다.');
      }
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
      <div className="max-w-[768px] w-full mx-auto flex flex-col min-h-screen">
        {/* 헤더 */}
        <div className="px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          {/* 캐릭터 애니메이션 영역 */}
          <div className={`mb-12 transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <div className="w-48 h-48 bg-gradient-to-br from-[var(--green-500)] to-[var(--green-600)] rounded-full flex items-center justify-center animate-pulse animate-float animate-glow">
              <div className="text-white text-6xl font-bold">AI</div>
            </div>
          </div>

          {/* 타이틀 */}
          <h1 className="text-[32px] font-bold text-[var(--black-500)] mb-4 text-center leading-[42px]">
            AI 레벨 테스트
          </h1>

          {/* 설명 텍스트 */}
          <div className="text-center mb-12">
            <p className="text-[16px] text-[var(--black-300)] leading-[24px] mb-2">
              간단한 영어 대화를 통해
            </p>
            <p className="text-[16px] text-[var(--black-300)] leading-[24px] mb-2">
              당신의 영어 실력을 측정해드릴게요
            </p>
            <p className="text-[14px] text-[var(--black-200)] leading-[20px] mt-4">
              약 5-10분 소요
            </p>
          </div>

          {/* 특징 리스트 */}
          <div className="w-full max-w-[400px] space-y-4 mb-12">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[rgba(0,196,113,0.12)] rounded-full flex items-center justify-center mr-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[14px] text-[var(--black-500)]">AI가 실시간으로 발음과 문법 분석</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[rgba(0,196,113,0.12)] rounded-full flex items-center justify-center mr-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[14px] text-[var(--black-500)]">CEFR 기준에 따른 정확한 레벨 측정</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[rgba(0,196,113,0.12)] rounded-full flex items-center justify-center mr-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[14px] text-[var(--black-500)]">맞춤형 학습 추천 제공</span>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 pb-8">
          <CommonButton
            onClick={handleStart}
            className="w-full"
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