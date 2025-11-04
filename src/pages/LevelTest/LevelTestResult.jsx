import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLevelTestStore from '../../store/levelTestStore';
import RadarChart from '../../components/RadarChart';
import CommonButton from '../../components/CommonButton';
import ComprehensiveEvaluationDisplay from '../../components/ComprehensiveEvaluationDisplay';
import { getLevelTestResult, getVoiceTestResult, getDetailedEvaluation } from '../../api/levelTest';
import { Trophy, Target, BookOpen, Users, Calendar, ChevronRight, Sparkles } from 'lucide-react';

const LEVEL_DESCRIPTIONS = {
  A1: {
    title: 'Beginner',
    description: '기초적인 표현과 간단한 문장을 이해하고 사용할 수 있습니다.',
    color: 'bg-blue-500'
  },
  A2: {
    title: 'Elementary',
    description: '일상적인 표현과 기본적인 구문을 이해하고 간단한 의사소통이 가능합니다.',
    color: 'bg-green-500'
  },
  B1: {
    title: 'Intermediate',
    description: '일상생활, 여행, 관심사에 대해 자유롭게 대화할 수 있습니다.',
    color: 'bg-yellow-500'
  },
  B2: {
    title: 'Upper Intermediate',
    description: '복잡한 주제에 대해 명확하고 상세하게 의견을 표현할 수 있습니다.',
    color: 'bg-orange-500'
  },
  C1: {
    title: 'Advanced',
    description: '다양한 주제에 대해 유창하고 자발적으로 표현할 수 있습니다.',
    color: 'bg-red-500'
  },
  C2: {
    title: 'Proficient',
    description: '원어민 수준으로 모든 상황에서 자유롭게 의사소통이 가능합니다.',
    color: 'bg-purple-500'
  }
};

const SCORE_ORDER = ['pronunciation', 'fluency', 'grammar', 'vocabulary', 'coherence', 'interaction'];

const SCORE_LABELS = {
  pronunciation: '발음 (Pronunciation)',
  fluency: '유창성 (Fluency)',
  grammar: '문법 (Grammar)',
  vocabulary: '어휘 (Vocabulary)',
  coherence: '논리 전개 (Coherence)',
  interaction: '상호작용 (Interaction)'
};

const toPercent = (value) => {
  if (value === null || value === undefined) return 0;
  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const ensureArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[;,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export default function LevelTestResult() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [detailedEvaluation, setDetailedEvaluation] = useState(null);
  const [isLoadingDetailed, setIsLoadingDetailed] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  const testResult = useLevelTestStore((state) => state.testResult);
  const resetTest = useLevelTestStore((state) => state.resetTest);
  const setTestResult = useLevelTestStore((state) => state.setTestResult);
  const testId = useLevelTestStore((state) => state.testId);

  const loadResult = useCallback(async () => {
    if (!testId) return;

    setIsLoading(true);
    setFetchError(null);

    try {
      const voicePayload = await getVoiceTestResult(Number(testId));
      const normalized = setTestResult(voicePayload);
      if (!normalized) {
        throw new Error('분석 결과가 비어 있습니다.');
      }
    } catch (voiceError) {
      console.error('Voice test result fetch failed:', voiceError);
      try {
        const fallbackPayload = await getLevelTestResult(Number(testId));
        const normalized = setTestResult(fallbackPayload);
        if (!normalized) {
          throw new Error('결과 데이터가 비어 있습니다.');
        }
      } catch (fallbackError) {
        console.error('Level test result fetch failed:', fallbackError);
        setFetchError(fallbackError?.message || voiceError?.message || '결과를 가져오지 못했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [setTestResult, testId]);

  useEffect(() => {
    if (!testId) {
      navigate('/level-test');
      return;
    }

    if (testResult) {
      setIsLoading(false);
      return;
    }

    loadResult();
  }, [testId, testResult, loadResult, navigate]);

  const handleRetakeTest = () => {
    resetTest();
    navigate('/level-test');
  };

  const handleStartLearning = () => {
    navigate('/main');
  };

  const handleRetryFetch = () => {
    if (!testId) {
      navigate('/level-test');
      return;
    }
    loadResult();
  };

  const handleLoadDetailedAnalysis = async () => {
    if (!testId || !testResult) return;

    setIsLoadingDetailed(true);
    try {
      // 첫 번째 질문의 상세 평가를 가져옴 (testResult에 questionId 정보가 있다고 가정)
      const questionId = 1; // 실제로는 testResult에서 질문 ID를 가져와야 함
      const detailed = await getDetailedEvaluation(testId, questionId);
      setDetailedEvaluation(detailed);
      setShowDetailedAnalysis(true);
    } catch (error) {
      console.error('Failed to load detailed evaluation:', error);
      alert('상세 분석을 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoadingDetailed(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C471] mx-auto mb-4" />
          <p className="text-[16px] text-[#666666]">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <div className="bg-white border border-[#E7E7E7] rounded-[20px] p-8 max-w-md text-center space-y-4">
          <Trophy className="w-12 h-12 text-[#FF6B6B] mx-auto" />
          <h2 className="text-[20px] font-bold text-[#111111]">결과를 표시할 수 없습니다</h2>
          <p className="text-[14px] text-[#666666] whitespace-pre-line">
            {fetchError || '결과 데이터를 찾지 못했습니다. 테스트를 다시 진행해주세요.'}
          </p>
          <div className="space-y-3">
            <CommonButton onClick={handleRetryFetch} variant="secondary" className="w-full">
              다시 시도하기
            </CommonButton>
            <CommonButton onClick={handleRetakeTest} variant="primary" className="w-full">
              테스트 다시 하기
            </CommonButton>
          </div>
        </div>
      </div>
    );
  }

  const levelValue = typeof testResult.level === 'string' ? testResult.level.trim() : '';
  const levelKey = levelValue.toUpperCase();
  const levelInfo = LEVEL_DESCRIPTIONS[levelKey] || {
    title: '분석 결과',
    description: '분석 정보를 확인해주세요.',
    color: 'bg-gray-400'
  };

  const strengthsArr = ensureArray(testResult.strengths);
  const improvementsArr = ensureArray(testResult.improvements);
  const feedback = testResult.feedback || '';

  const rawScores = testResult.scores || {};
  const orderedAvailableKeys = SCORE_ORDER.filter(
    (key) => rawScores[key] !== undefined && rawScores[key] !== null
  );
  const additionalScoreKeys = Object.keys(rawScores).filter(
    (key) => !orderedAvailableKeys.includes(key) && rawScores[key] !== undefined && rawScores[key] !== null
  );
  const scoreKeys = [...orderedAvailableKeys, ...additionalScoreKeys];

  const scores = scoreKeys.reduce((acc, key) => {
    acc[key] = toPercent(rawScores[key]);
    return acc;
  }, {});

  const hasScoreData = scoreKeys.length > 0;

  const formatScoreLabel = (key) => {
    if (SCORE_LABELS[key]) {
      return SCORE_LABELS[key];
    }

    const spaced = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]+/g, ' ')
      .trim();

    if (!spaced) {
      return key;
    }

    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-y-auto">
      <div className="bg-white border-b border-[#E7E7E7] px-4 sm:px-6 py-3 sm:py-4">
        <h1 className="text-[18px] sm:text-[20px] font-bold text-[#111111] text-center break-words">
          레벨 테스트 결과
        </h1>
      </div>

      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-lg mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full ${levelInfo.color} text-white mb-3 sm:mb-4`}>
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#111111] mb-2 break-words">
            {levelValue || '확인 필요'}
          </h2>
          <p className="text-[16px] sm:text-[17px] md:text-[18px] font-semibold text-[#666666] mb-2 break-words">
            {levelInfo.title}
          </p>
          <p className="text-[12px] sm:text-[13px] md:text-[14px] text-[#929292] break-words">
            {levelInfo.description}
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7] mb-4 sm:mb-6">
          <h3 className="text-[16px] sm:text-[18px] font-bold text-[#111111] mb-3 sm:mb-4 break-words">
            상세 분석 결과
          </h3>
          <div className="h-[250px] sm:h-[300px]">
            {hasScoreData ? (
              <RadarChart scores={scores} scoreKeys={scoreKeys} labels={SCORE_LABELS} animate={true} />
            ) : (
              <div className="text-[12px] sm:text-[13px] md:text-sm text-[#929292] text-center pt-12 sm:pt-16 break-words">
                표시할 점수가 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7] mb-4 sm:mb-6">
          <h3 className="text-[16px] sm:text-[18px] font-bold text-[#111111] mb-3 sm:mb-4 break-words">
            영역별 점수
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {hasScoreData ? (
              scoreKeys.map((skill) => (
                <div key={skill} className="flex items-center justify-between gap-2 sm:gap-4">
                  <span className="text-[13px] sm:text-[14px] md:text-[16px] text-[#666666] flex-1 min-w-0 break-words">
                    {formatScoreLabel(skill)}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="w-24 sm:w-32 h-2 bg-[#E7E7E7] rounded-full mr-2 sm:mr-3">
                      <div
                        className="h-full bg-[#00C471] rounded-full transition-all duration-1000"
                        style={{ width: `${scores[skill] ?? 0}%` }}
                      />
                    </div>
                    <span className="text-[13px] sm:text-[14px] md:text-[16px] font-semibold text-[#111111] w-10 sm:w-12 text-right">
                      {Number.isFinite(scores[skill]) ? scores[skill] : '-'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[12px] sm:text-[13px] md:text-sm text-[#929292] text-center break-words">
                표시할 점수가 없습니다.
              </div>
            )}
          </div>
        </div>

        {feedback && (
          <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7] mb-4 sm:mb-6">
            <h3 className="text-[16px] sm:text-[18px] font-bold text-[#111111] mb-3 sm:mb-4 break-words">
              AI 피드백
            </h3>
            <p className="text-[13px] sm:text-[14px] text-[#666666] leading-relaxed break-words">
              {feedback}
            </p>
          </div>
        )}

        {(strengthsArr.length > 0 || improvementsArr.length > 0) && (
          <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7] mb-4 sm:mb-6">
            {strengthsArr.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[#111111] mb-2 break-words">
                  🌟 강점
                </h4>
                <ul className="space-y-1">
                  {strengthsArr.map((strength, index) => (
                    <li key={`strength-${index}`} className="text-[13px] sm:text-[14px] text-[#666666] flex items-start break-words">
                      <span className="text-[#00C471] mr-2 flex-shrink-0">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {improvementsArr.length > 0 && (
              <div>
                <h4 className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[#111111] mb-2 break-words">
                  💪 개선점
                </h4>
                <ul className="space-y-1">
                  {improvementsArr.map((improvement, index) => (
                    <li key={`improvement-${index}`} className="text-[13px] sm:text-[14px] text-[#666666] flex items-start break-words">
                      <span className="text-[#FF6B6B] mr-2 flex-shrink-0">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!showDetailedAnalysis && (
          <div className="bg-gradient-to-r from-[#E6F9F1] to-[#B0EDD3] rounded-[20px] p-4 sm:p-6 border border-[#00C471] mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#00C471] mr-2" />
                <h3 className="text-[16px] sm:text-[18px] font-bold text-[#111111] break-words">
                  AI 상세 분석
                </h3>
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] md:text-[14px] text-[#666666] mb-3 sm:mb-4 break-words leading-[1.4] sm:leading-[1.5]">
              CEFR 기준에 따른 6차원 상세 평가, 발음 분석, 문법 분석, 어휘 분석, 학습 계획을 확인하세요.
            </p>
            <CommonButton
              onClick={handleLoadDetailedAnalysis}
              variant="primary"
              className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
              disabled={isLoadingDetailed}
            >
              {isLoadingDetailed ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2" />
                  분석 중...
                </div>
              ) : (
                <>
                  AI 상세 분석 보기
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </>
              )}
            </CommonButton>
          </div>
        )}

        {showDetailedAnalysis && detailedEvaluation && (
          <div className="mb-6">
            <ComprehensiveEvaluationDisplay evaluation={detailedEvaluation.evaluation?.comprehensiveData} />
          </div>
        )}

        <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[#E7E7E7] mb-6 sm:mb-8">
          <h3 className="text-[16px] sm:text-[17px] md:text-[18px] font-bold text-[#111111] mb-3 sm:mb-4 break-words">
            추천 학습 방법
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C471] mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
              <div>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[#111111] mb-1 break-words">
                  목표 설정
                </p>
                <p className="text-[13px] sm:text-[14px] text-[#666666] break-words">
                  현재 {levelValue || '현재 레벨'} 레벨에서 다음 레벨로 향상을 위한 구체적인 목표를 설정하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C471] mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
              <div>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[#111111] mb-1 break-words">
                  집중 학습
                </p>
                <p className="text-[13px] sm:text-[14px] text-[#666666] break-words">
                  가장 낮은 점수를 받은 영역부터 집중적으로 학습하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C471] mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
              <div>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[#111111] mb-1 break-words">
                  대화 연습
                </p>
                <p className="text-[13px] sm:text-[14px] text-[#666666] break-words">
                  비슷한 레벨의 학습자와 정기적으로 대화 연습을 하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C471] mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
              <div>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[#111111] mb-1 break-words">
                  꾸준한 학습
                </p>
                <p className="text-[13px] sm:text-[14px] text-[#666666] break-words">
                  매일 30분씩 꾸준히 학습하는 것이 중요합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <CommonButton
            onClick={handleStartLearning}
            variant="primary"
            className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
          >
            학습 시작하기
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </CommonButton>

          <CommonButton
            onClick={handleRetakeTest}
            variant="secondary"
            className="w-full text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
          >
            테스트 다시 하기
          </CommonButton>
        </div>
      </div>
    </div>
  );
}
