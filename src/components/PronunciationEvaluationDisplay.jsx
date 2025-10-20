import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * 발음 평가 결과 표시 컴포넌트
 * - 음소 레벨 분석
 * - 억양, 리듬, 스트레스 패턴
 * - 개선 추천사항
 */
const PronunciationEvaluationDisplay = ({ evaluation }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!evaluation) return null;

  const {
    overallScore,
    scores,
    phonemeAnalysis,
    intonationPatterns,
    rhythmAnalysis,
    stressAnalysis,
    errors,
    recommendations,
    strengths,
    weaknesses,
    cefrLevel
  } = evaluation;

  // 점수에 따른 색상
  const getScoreColor = (score) => {
    if (score >= 80) return '#00C471';
    if (score >= 60) return '#33D08D';
    if (score >= 40) return '#8AE4BE';
    return '#929292';
  };

  // 점수 게이지 컴포넌트
  const ScoreGauge = ({ label, score }) => (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-2">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="#E7E7E7"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={getScoreColor(score)}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-[#111111]">{score}</span>
        </div>
      </div>
      <div className="text-sm text-[#929292]">{label}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-[10px] p-6 shadow-sm border border-[#E7E7E7]">
      {/* 전체 점수 */}
      <div className="text-center mb-6 pb-6 border-b border-[#E7E7E7]">
        <div className="text-4xl font-bold mb-2" style={{ color: getScoreColor(overallScore) }}>
          {overallScore}점
        </div>
        <div className="text-sm text-[#929292] mb-2">
          CEFR 발음 레벨: <strong>{cefrLevel}</strong>
        </div>
      </div>

      {/* 차원별 점수 */}
      <div className="grid grid-cols-5 gap-4 mb-6 pb-6 border-b border-[#E7E7E7]">
        <ScoreGauge label="음소" score={scores.segmental} />
        <ScoreGauge label="억양/리듬" score={scores.suprasegmental} />
        <ScoreGauge label="명료도" score={scores.intelligibility} />
        <ScoreGauge label="유창성" score={scores.fluency} />
        <ScoreGauge label="원어민성" score={scores.nativelikeness} />
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: '종합' },
          { id: 'phonemes', label: '음소 분석' },
          { id: 'intonation', label: '억양' },
          { id: 'rhythm', label: '리듬' },
          { id: 'stress', label: '강세' },
          { id: 'errors', label: '오류' }
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 강점 */}
            {strengths && strengths.length > 0 && (
              <div>
                <h4 className="text-md font-bold text-[#111111] mb-3">
                  잘하고 있어요 👍
                </h4>
                <div className="space-y-2">
                  {strengths.map((strength, i) => (
                    <div key={i} className="flex items-start gap-2 bg-[#E6F9F1] p-3 rounded-lg">
                      <span className="text-[#00C471] mt-0.5">✓</span>
                      <span className="text-sm text-[#111111]">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 약점 */}
            {weaknesses && weaknesses.length > 0 && (
              <div>
                <h4 className="text-md font-bold text-[#111111] mb-3">
                  개선이 필요해요 💡
                </h4>
                <div className="space-y-2">
                  {weaknesses.map((weakness, i) => (
                    <div key={i} className="flex items-start gap-2 bg-[#FAFAFA] p-3 rounded-lg">
                      <span className="text-[#EA4335] mt-0.5">•</span>
                      <span className="text-sm text-[#111111]">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 추천사항 */}
            {recommendations && recommendations.length > 0 && (
              <div>
                <h4 className="text-md font-bold text-[#111111] mb-3">
                  추천 연습법 📚
                </h4>
                <div className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#4285F4] mt-1">{i + 1}.</span>
                      <span className="text-sm text-[#111111]">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'phonemes' && phonemeAnalysis && (
          <div>
            <h4 className="text-md font-bold text-[#111111] mb-4">음소별 분석</h4>
            <div className="space-y-3">
              {phonemeAnalysis.map((analysis, i) => (
                <div key={i} className="bg-[#FAFAFA] p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#111111]">/{analysis.phoneme}/</span>
                      <span className="text-sm text-[#929292]">
                        in "{analysis.word}"
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: getScoreColor(analysis.accuracy) }}
                    >
                      {analysis.accuracy}%
                    </span>
                  </div>
                  {analysis.issues && analysis.issues.length > 0 && (
                    <div className="text-sm text-[#EA4335]">
                      {analysis.issues.join(', ')}
                    </div>
                  )}
                  {analysis.nativeSample && (
                    <div className="text-sm text-[#00C471] mt-1">
                      원어민 발음: {analysis.nativeSample}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'intonation' && intonationPatterns && (
          <div>
            <h4 className="text-md font-bold text-[#111111] mb-4">억양 패턴 분석</h4>
            <div className="space-y-3">
              {intonationPatterns.map((pattern, i) => (
                <div key={i} className="bg-[#FAFAFA] p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold text-[#111111]">
                        {pattern.sentenceType === 'question' ? '의문문' :
                         pattern.sentenceType === 'statement' ? '평서문' :
                         pattern.sentenceType === 'command' ? '명령문' : '감탄문'}
                      </span>
                      <span className="text-sm text-[#929292] ml-2">
                        ({pattern.type} 패턴)
                      </span>
                    </div>
                    <span className={pattern.isCorrect ? 'text-[#00C471]' : 'text-[#EA4335]'}>
                      {pattern.isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="text-sm text-[#111111]">
                    예상: {pattern.expectedPattern} → 감지: {pattern.detectedPattern}
                  </div>
                  <div className="text-xs text-[#929292] mt-1">
                    신뢰도: {Math.round(pattern.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rhythm' && rhythmAnalysis && (
          <div>
            <h4 className="text-md font-bold text-[#111111] mb-4">리듬 분석</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAFAFA] p-4 rounded-lg">
                  <div className="text-sm text-[#929292] mb-1">음절 수</div>
                  <div className="text-2xl font-bold text-[#111111]">
                    {rhythmAnalysis.syllableCount}
                  </div>
                </div>
                <div className="bg-[#FAFAFA] p-4 rounded-lg">
                  <div className="text-sm text-[#929292] mb-1">말하기 속도</div>
                  <div className="text-2xl font-bold text-[#111111]">
                    {rhythmAnalysis.speakingRate} <span className="text-sm">spm</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FAFAFA] p-4 rounded-lg">
                <div className="text-sm font-bold text-[#111111] mb-2">
                  강세 패턴
                </div>
                <div className="flex gap-1 mb-2">
                  {rhythmAnalysis.stressPattern.split('').map((s, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                        s === '1'
                          ? 'bg-[#00C471] text-white'
                          : 'bg-[#E7E7E7] text-[#929292]'
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-[#929292]">
                  1 = 강세, 0 = 약세
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                rhythmAnalysis.isNaturalRhythm ? 'bg-[#E6F9F1]' : 'bg-[#FAFAFA]'
              }`}>
                <div className="text-sm">
                  {rhythmAnalysis.isNaturalRhythm ? (
                    <span className="text-[#00C471]">✓ 자연스러운 리듬</span>
                  ) : (
                    <span className="text-[#EA4335]">! 리듬 개선 필요</span>
                  )}
                </div>
                <div className="text-xs text-[#929292] mt-1">
                  리듬 타입: {
                    rhythmAnalysis.rhythmType === 'stress-timed' ? '강세 기반' :
                    rhythmAnalysis.rhythmType === 'syllable-timed' ? '음절 기반' : '모라 기반'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stress' && stressAnalysis && (
          <div>
            <h4 className="text-md font-bold text-[#111111] mb-4">강세 분석</h4>
            <div className="space-y-3">
              {stressAnalysis.wordStress?.map((word, i) => (
                <div key={i} className="bg-[#FAFAFA] p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-md font-bold text-[#111111]">{word.word}</span>
                    <span className={word.isCorrect ? 'text-[#00C471]' : 'text-[#EA4335]'}>
                      {word.isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="text-sm text-[#111111]">
                    올바른 강세: {word.correctStress}
                  </div>
                  {!word.isCorrect && word.userStress && (
                    <div className="text-sm text-[#EA4335]">
                      당신의 강세: {word.userStress}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'errors' && errors && (
          <div>
            <h4 className="text-md font-bold text-[#111111] mb-4">발음 오류 목록</h4>
            <div className="space-y-3">
              {errors.map((error, i) => (
                <div key={i} className="border-l-4 border-[#EA4335] bg-[#FAFAFA] p-4 rounded-r-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#EA4335]">
                      {error.type === 'substitution' ? '대체 오류' :
                       error.type === 'omission' ? '누락 오류' :
                       error.type === 'insertion' ? '삽입 오류' : '왜곡 오류'}
                    </span>
                    <span className="text-xs text-[#929292]">
                      심각도: {error.severity}/5
                    </span>
                  </div>
                  <div className="text-sm text-[#111111] mb-1">
                    {error.description}
                  </div>
                  {error.correction && (
                    <div className="text-sm text-[#00C471] mt-2">
                      ✓ {error.correction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PronunciationEvaluationDisplay.propTypes = {
  evaluation: PropTypes.shape({
    overallScore: PropTypes.number.isRequired,
    scores: PropTypes.object.isRequired,
    phonemeAnalysis: PropTypes.array,
    intonationPatterns: PropTypes.array,
    rhythmAnalysis: PropTypes.object,
    stressAnalysis: PropTypes.object,
    errors: PropTypes.array,
    recommendations: PropTypes.array,
    strengths: PropTypes.array,
    weaknesses: PropTypes.array,
    cefrLevel: PropTypes.string
  })
};

export default PronunciationEvaluationDisplay;
