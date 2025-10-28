import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Target, Brain, ChevronRight } from 'lucide-react';

/**
 * AI 학습 인사이트 요약 카드
 * @param {Object} props
 * @param {Object} props.progressSummary - 진행 상황 요약 데이터
 * @param {boolean} props.loading - 로딩 상태
 */
export default function AILearningSummaryCard({ progressSummary, loading }) {
  const navigate = useNavigate();

  // React 19 호환성: useMemo로 데이터 안정화
  // 객체 자체가 아닌 필요한 원시값들을 의존성 배열에 추가
  const summaryData = useMemo(() => {
    // 로딩 중이거나 데이터가 없으면 null 반환
    if (loading || !progressSummary) {
      return null;
    }

    return {
      currentLevel: progressSummary.currentLevel || '-',
      sessionsThisWeek: progressSummary.sessionsThisWeek || 0,
      consistency: progressSummary.consistency
        ? `${Math.round(progressSummary.consistency * 100)}%`
        : '-',
      nextMilestone: progressSummary.nextMilestone || null,
      isFallback: progressSummary.fallback || false
    };
  }, [
    loading,
    progressSummary?.currentLevel,
    progressSummary?.sessionsThisWeek,
    progressSummary?.consistency,
    progressSummary?.nextMilestone,
    progressSummary?.fallback
  ]);

  // 로딩 중이거나 데이터가 없으면 렌더링하지 않음
  if (loading || !summaryData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#E6F9F1] to-[#B0EDD3] rounded-[20px] p-6 border border-[#00C471]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="w-6 h-6 text-[#00C471] mr-2" />
          <h3 className="text-[18px] font-bold text-[#111111]">AI 학습 인사이트</h3>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="text-[14px] text-[#00C471] font-medium flex items-center hover:text-[#00B267] transition-colors"
        >
          자세히 보기
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[10px] p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-[#00C471] mr-2" />
            <span className="text-[14px] text-[#929292]">현재 레벨</span>
          </div>
          <p className="text-[24px] font-bold text-[#111111]">
            {summaryData.currentLevel}
          </p>
        </div>

        <div className="bg-white rounded-[10px] p-4">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-[#00C471] mr-2" />
            <span className="text-[14px] text-[#929292]">이번 주 세션</span>
          </div>
          <p className="text-[24px] font-bold text-[#111111]">
            {summaryData.sessionsThisWeek}
          </p>
        </div>

        <div className="bg-white rounded-[10px] p-4">
          <div className="flex items-center mb-2">
            <Brain className="w-5 h-5 text-[#00C471] mr-2" />
            <span className="text-[14px] text-[#929292]">학습 일관성</span>
          </div>
          <p className="text-[24px] font-bold text-[#111111]">
            {summaryData.consistency}
          </p>
        </div>
      </div>

      {summaryData.nextMilestone && (
        <div className="mt-4 bg-white bg-opacity-50 rounded-[10px] p-4">
          <p className="text-[14px] text-[#666666] mb-1">다음 목표</p>
          <p className="text-[16px] font-semibold text-[#111111]">
            {summaryData.nextMilestone}
          </p>
        </div>
      )}

      {summaryData.isFallback && (
        <div className="mt-2 text-center">
          <p className="text-[12px] text-[#929292]">
            기본 데이터를 표시하고 있습니다
          </p>
        </div>
      )}
    </div>
  );
}
