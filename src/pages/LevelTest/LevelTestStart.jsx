import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../components/CommonButton';
import useLevelTestStore from '../../store/levelTestStore';

export default function LevelTestStart() {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const { resetTest, setTestStatus } = useLevelTestStore();

  const handleStart = () => {
    setIsAnimating(true);
    resetTest(); // 테스트 초기화
    setTestStatus('connection-check');
    setTimeout(() => {
      navigate('/level-test/check');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <div className="max-w-[768px] w-full mx-auto flex flex-col min-h-screen">
        {/* 헤더 */}
        <div className="px-6 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          {/* 캐릭터 애니메이션 영역 */}
          <div className={`mb-12 transition-all duration-500 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <div className="w-48 h-48 bg-gradient-to-br from-[#00C471] to-[#00B267] rounded-full flex items-center justify-center animate-pulse animate-float animate-glow">
              <div className="text-white text-6xl font-bold">AI</div>
            </div>
          </div>

          {/* 타이틀 */}
          <h1 className="text-[32px] font-bold text-[#111111] mb-4 text-center leading-[42px]">
            AI 레벨 테스트
          </h1>

          {/* 설명 텍스트 */}
          <div className="text-center mb-12">
            <p className="text-[16px] text-[#606060] leading-[24px] mb-2">
              간단한 영어 대화를 통해
            </p>
            <p className="text-[16px] text-[#606060] leading-[24px] mb-2">
              당신의 영어 실력을 측정해드릴게요
            </p>
            <p className="text-[14px] text-[#929292] leading-[20px] mt-4">
              약 5-10분 소요
            </p>
          </div>

          {/* 특징 리스트 */}
          <div className="w-full max-w-[400px] space-y-4 mb-12">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#E6F9F1] rounded-full flex items-center justify-center mr-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#00C471" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[14px] text-[#111111]">AI가 실시간으로 발음과 문법 분석</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#E6F9F1] rounded-full flex items-center justify-center mr-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#00C471" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[14px] text-[#111111]">CEFR 기준에 따른 정확한 레벨 측정</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#E6F9F1] rounded-full flex items-center justify-center mr-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#00C471" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[14px] text-[#111111]">맞춤형 학습 추천 제공</span>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 pb-8">
          <CommonButton
            onClick={handleStart}
            className="w-full"
            variant="success"
          >
            시작하기
          </CommonButton>
        </div>
      </div>
    </div>
  );
}