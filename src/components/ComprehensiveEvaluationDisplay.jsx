import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * CEFR 기반 종합 평가 결과 표시 컴포넌트
 * - 6차원 상세 분석 시각화
 * - 학습 계획 및 다음 레벨 전략 표시
 */
const ComprehensiveEvaluationDisplay = ({ evaluation }) => {
  const [activeTab, setActiveTab] = useState('scores');

  if (!evaluation) return null;

  const {
    overallLevel,
    subLevel,
    confidenceScore,
    detailedScores,
    pronunciationAnalysis,
    grammarAnalysis,
    vocabularyAnalysis,
    fluencyAnalysis,
    coherenceAnalysis,
    studyPlan,
    nextLevelStrategy
  } = evaluation;

  // CEFR 레벨에 따른 색상
  const getLevelColor = (level) => {
    const colors = {
      A1: '#EA4335',
      A2: '#EA4335',
      B1: '#4285F4',
      B2: '#4285F4',
      C1: '#00C471',
      C2: '#00C471'
    };
    return colors[level] || '#929292';
  };

  // 점수 바 컴포넌트
  const ScoreBar = ({ label, score, color = '#00C471' }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-[#111111]">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="w-full h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${score}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[10px] p-6 shadow-sm border border-[#E7E7E7]">
      {/* 전체 레벨 표시 */}
      <div className="text-center mb-6 pb-6 border-b border-[#E7E7E7]">
        <div className="inline-flex items-center gap-2 mb-2">
          <span
            className="text-4xl font-bold"
            style={{ color: getLevelColor(overallLevel) }}
          >
            {overallLevel}
          </span>
          <span className="text-lg text-[#929292]">
            ({subLevel === 'low' ? '하' : subLevel === 'mid' ? '중' : '상'})
          </span>
        </div>
        <div className="text-sm text-[#929292] mb-2">
          신뢰도: {Math.round(confidenceScore * 100)}%
        </div>
        <div className="text-xs text-[#929292]">
          Common European Framework of Reference
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'scores', label: '점수 분석' },
          { id: 'pronunciation', label: '발음' },
          { id: 'grammar', label: '문법' },
          { id: 'vocabulary', label: '어휘' },
          { id: 'fluency', label: '유창성' },
          { id: 'coherence', label: '일관성' },
          { id: 'plan', label: '학습 계획' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#00C471] text-white'
                : 'bg-[#FAFAFA] text-[#929292] hover:bg-[#E7E7E7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="min-h-[300px]">
        {activeTab === 'scores' && (
          <div>
            <h3 className="text-lg font-bold text-[#111111] mb-4">상세 점수</h3>
            <ScoreBar
              label="발음 (Pronunciation)"
              score={detailedScores.pronunciation}
              color={getLevelColor(overallLevel)}
            />
            <ScoreBar
              label="유창성 (Fluency)"
              score={detailedScores.fluency}
              color={getLevelColor(overallLevel)}
            />
            <ScoreBar
              label="문법 (Grammar)"
              score={detailedScores.grammar}
              color={getLevelColor(overallLevel)}
            />
            <ScoreBar
              label="어휘 (Vocabulary)"
              score={detailedScores.vocabulary}
              color={getLevelColor(overallLevel)}
            />
            <ScoreBar
              label="일관성 (Coherence)"
              score={detailedScores.coherence}
              color={getLevelColor(overallLevel)}
            />
            <ScoreBar
              label="상호작용 (Interaction)"
              score={detailedScores.interaction}
              color={getLevelColor(overallLevel)}
            />
          </div>
        )}

        {activeTab === 'pronunciation' && pronunciationAnalysis && (
          <div>
            <h3 className="text-lg font-bold text-[#111111] mb-4">발음 분석</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111111] mb-2">강점</h4>
                <ul className="list-disc list-inside text-sm text-[#414141]">
                  {pronunciationAnalysis.strengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#111111] mb-2">개선 필요</h4>
                <ul className="list-disc list-inside text-sm text-[#414141]">
                  {pronunciationAnalysis.improvements?.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grammar' && grammarAnalysis && (
          <div>
            <h3 className="text-lg font-bold text-[#111111] mb-4">문법 분석</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111111] mb-2">잘 사용한 구조</h4>
                <ul className="list-disc list-inside text-sm text-[#414141]">
                  {grammarAnalysis.strengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#111111] mb-2">발견된 오류</h4>
                {grammarAnalysis.errors?.map((err, i) => (
                  <div key={i} className="bg-[#FAFAFA] p-3 rounded-lg mb-2">
                    <div className="text-sm font-medium text-[#EA4335] mb-1">
                      {err.type}
                    </div>
                    <div className="text-sm text-[#111111]">{err.description}</div>
                    {err.correction && (
                      <div className="text-sm text-[#00C471] mt-1">
                        ✓ {err.correction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vocabulary' && vocabularyAnalysis && (
          <div>
            <h3 className="text-lg font-bold text-[#111111] mb-4">어휘 분석</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111111] mb-2">사용된 고급 어휘</h4>
                <div className="flex flex-wrap gap-2">
                  {vocabularyAnalysis.advancedWords?.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#E6F9F1] text-[#00C471] text-sm rounded-full"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#111111] mb-2">개선 제안</h4>
                <ul className="list-disc list-inside text-sm text-[#414141]">
                  {vocabularyAnalysis.improvements?.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fluency' && fluencyAnalysis && (
          <div>
            <h3 className="text-lg font-bold text-[#111111] mb-4">유창성 분석</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAFAFA] p-4 rounded-lg">
                  <div className="text-sm text-[#929292] mb-1">말하기 속도</div>
                  <div className="text-2xl font-bold text-[#111111]">
                    {fluencyAnalysis.speakingRate} <span className="text-sm">wpm</span>
                  </div>
                </div>
                <div className="bg-[#FAFAFA] p-4 rounded-lg">
                  <div className="text-sm text-[#929292] mb-1">일시정지 횟수</div>
                  <div className="text-2xl font-bold text-[#111111]">
                    {fluencyAnalysis.pauseCount}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#111111] mb-2">분석</h4>
                <p className="text-sm text-[#414141]">
                  {fluencyAnalysis.analysis}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coherence' && coherenceAnalysis && (
          <div>
            <h3 className="text-lg font-bold text-[#111111] mb-4">일관성 분석</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#111111] mb-2">논리적 구조</h4>
                <p className="text-sm text-[#414141]">
                  {coherenceAnalysis.structure}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#111111] mb-2">연결 표현</h4>
                <div className="flex flex-wrap gap-2">
                  {coherenceAnalysis.linkingWords?.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-[#E7E7E7] text-[#111111] text-sm rounded-full"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plan' && studyPlan && nextLevelStrategy && (
          <div>
            <h3 className="text-lg font-bold text-[#111111] mb-4">학습 계획</h3>

            {/* 단기 목표 */}
            <div className="mb-6">
              <h4 className="text-md font-bold text-[#111111] mb-3">
                단기 목표 (1-2주)
              </h4>
              <ul className="space-y-2">
                {studyPlan.shortTerm?.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#00C471] mt-1">•</span>
                    <span className="text-sm text-[#111111]">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 중기 목표 */}
            <div className="mb-6">
              <h4 className="text-md font-bold text-[#111111] mb-3">
                중기 목표 (1-2개월)
              </h4>
              <ul className="space-y-2">
                {studyPlan.mediumTerm?.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#4285F4] mt-1">•</span>
                    <span className="text-sm text-[#111111]">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 다음 레벨 전략 */}
            <div className="bg-[#E6F9F1] p-4 rounded-lg">
              <h4 className="text-md font-bold text-[#00C471] mb-3">
                다음 레벨: {nextLevelStrategy.targetLevel}
              </h4>
              <div className="text-sm text-[#111111] mb-2">
                예상 소요 기간: <strong>{nextLevelStrategy.estimatedTimeMonths}개월</strong>
              </div>
              <div className="text-sm text-[#111111]">
                <strong>주요 마일스톤:</strong>
                <ul className="list-disc list-inside mt-2">
                  {nextLevelStrategy.keyMilestones?.map((milestone, i) => (
                    <li key={i}>{milestone}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ComprehensiveEvaluationDisplay.propTypes = {
  evaluation: PropTypes.shape({
    overallLevel: PropTypes.string.isRequired,
    subLevel: PropTypes.string.isRequired,
    confidenceScore: PropTypes.number.isRequired,
    detailedScores: PropTypes.object.isRequired,
    pronunciationAnalysis: PropTypes.object,
    grammarAnalysis: PropTypes.object,
    vocabularyAnalysis: PropTypes.object,
    fluencyAnalysis: PropTypes.object,
    coherenceAnalysis: PropTypes.object,
    studyPlan: PropTypes.object,
    nextLevelStrategy: PropTypes.object
  })
};

export default ComprehensiveEvaluationDisplay;
