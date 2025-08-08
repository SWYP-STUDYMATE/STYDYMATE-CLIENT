import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLevelTestStore from '../../store/levelTestStore';
import RadarChart from '../../components/RadarChart';
import CommonButton from '../../components/CommonButton';
import { Trophy, Target, BookOpen, Users, Calendar, ChevronRight } from 'lucide-react';

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

export default function LevelTestResult() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);
  const testResult = useLevelTestStore(state => state.testResult);
  const resetTest = useLevelTestStore(state => state.resetTest);
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // 테스트 결과가 스토어에 있으면 사용
    if (testResult) {
      setResult(testResult);
      setIsLoading(false);
      return;
    }

    // 없으면 API에서 가져오기
    if (!userId) {
      navigate('/level-test');
      return;
    }

    fetchResult();
  }, [testResult, userId]);

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/level-test/result/${userId}`);
      if (!response.ok) {
        throw new Error('Result not found');
      }
      
      const data = await response.json();
      setResult(data);
      useLevelTestStore.getState().setTestResult(data);
    } catch (error) {
      console.error('Failed to fetch result:', error);
      navigate('/level-test');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetakeTest = () => {
    resetTest();
    navigate('/level-test');
  };

  const handleStartLearning = () => {
    // 메인 페이지로 이동 (또는 매칭 페이지)
    navigate('/main');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C471] mx-auto mb-4"></div>
          <p className="text-[16px] text-[#666666]">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const levelInfo = LEVEL_DESCRIPTIONS[result.level] || LEVEL_DESCRIPTIONS.B1;
  const scores = result.analysis?.scores || {};

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
        <h1 className="text-[20px] font-bold text-[#111111] text-center">
          레벨 테스트 결과
        </h1>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Level Badge */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${levelInfo.color} text-white mb-4`}>
            <Trophy className="w-12 h-12" />
          </div>
          <h2 className="text-[32px] font-bold text-[#111111] mb-2">
            {result.level}
          </h2>
          <p className="text-[18px] font-semibold text-[#666666] mb-2">
            {levelInfo.title}
          </p>
          <p className="text-[14px] text-[#929292]">
            {levelInfo.description}
          </p>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] mb-6">
          <h3 className="text-[18px] font-bold text-[#111111] mb-4">
            상세 분석 결과
          </h3>
          <div className="h-[300px]">
            <RadarChart scores={scores} animate={true} />
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] mb-6">
          <h3 className="text-[18px] font-bold text-[#111111] mb-4">
            영역별 점수
          </h3>
          <div className="space-y-3">
            {Object.entries(scores).map(([skill, score]) => (
              <div key={skill} className="flex items-center justify-between">
                <span className="text-[16px] text-[#666666] capitalize">
                  {skill === 'grammar' && '문법 (Grammar)'}
                  {skill === 'vocabulary' && '어휘 (Vocabulary)'}
                  {skill === 'pronunciation' && '발음 (Pronunciation)'}
                  {skill === 'fluency' && '유창성 (Fluency)'}
                  {skill === 'comprehension' && '이해력 (Comprehension)'}
                  {skill === 'confidence' && '자신감 (Confidence)'}
                </span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-[#E7E7E7] rounded-full mr-3">
                    <div 
                      className="h-full bg-[#00C471] rounded-full transition-all duration-1000"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-[16px] font-semibold text-[#111111] w-12 text-right">
                    {score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {result.analysis?.feedback && (
          <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] mb-6">
            <h3 className="text-[18px] font-bold text-[#111111] mb-4">
              AI 피드백
            </h3>
            <p className="text-[14px] text-[#666666] leading-relaxed">
              {result.analysis.feedback}
            </p>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] mb-8">
          <h3 className="text-[18px] font-bold text-[#111111] mb-4">
            추천 학습 방법
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <Target className="w-5 h-5 text-[#00C471] mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-[16px] font-semibold text-[#111111] mb-1">
                  목표 설정
                </p>
                <p className="text-[14px] text-[#666666]">
                  현재 {result.level} 레벨에서 다음 레벨로 향상을 위한 구체적인 목표를 설정하세요.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <BookOpen className="w-5 h-5 text-[#00C471] mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-[16px] font-semibold text-[#111111] mb-1">
                  집중 학습
                </p>
                <p className="text-[14px] text-[#666666]">
                  가장 낮은 점수를 받은 영역부터 집중적으로 학습하세요.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Users className="w-5 h-5 text-[#00C471] mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-[16px] font-semibold text-[#111111] mb-1">
                  대화 연습
                </p>
                <p className="text-[14px] text-[#666666]">
                  비슷한 레벨의 학습자와 정기적으로 대화 연습을 하세요.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-[#00C471] mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-[16px] font-semibold text-[#111111] mb-1">
                  꾸준한 학습
                </p>
                <p className="text-[14px] text-[#666666]">
                  매일 30분씩 꾸준히 학습하는 것이 중요합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <CommonButton
            onClick={handleStartLearning}
            variant="primary"
            className="w-full"
          >
            학습 시작하기
            <ChevronRight className="w-5 h-5 ml-2" />
          </CommonButton>
          
          <CommonButton
            onClick={handleRetakeTest}
            variant="secondary"
            className="w-full"
          >
            테스트 다시 하기
          </CommonButton>
        </div>
      </div>
    </div>
  );
}