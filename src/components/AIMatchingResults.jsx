import React from 'react';
import PropTypes from 'prop-types';

/**
 * AI 매칭 결과 표시 컴포넌트
 * - 7차원 호환성 점수 시각화
 * - AI 생성 매칭 이유 표시
 * - 추천 대화 주제 제공
 */
const AIMatchingResults = ({ match, onRequestMatch }) => {
  if (!match) return null;

  const {
    partner,
    scores,
    matchReason,
    conversationStarters,
    overallScore
  } = match;

  // 점수에 따른 색상 결정
  const getScoreColor = (score) => {
    if (score >= 80) return '#00C471'; // green-500
    if (score >= 60) return '#33D08D'; // green-400
    if (score >= 40) return '#8AE4BE'; // green-200
    return '#B5B5B5'; // black-100
  };

  // 점수 바 렌더링
  const ScoreBar = ({ label, score }) => (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium" style={{ color: '#111111' }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color: getScoreColor(score) }}>
          {score}점
        </span>
      </div>
      <div className="w-full h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${score}%`,
            backgroundColor: getScoreColor(score)
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[10px] p-6 shadow-sm border border-[#E7E7E7]">
      {/* 파트너 정보 */}
      <div className="flex items-center mb-6">
        <img
          src={partner.profileImage || '/default-avatar.png'}
          alt={partner.name}
          className="w-16 h-16 rounded-full object-cover mr-4"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#111111]">
            {partner.name}
          </h3>
          <p className="text-sm text-[#929292]">
            {partner.nativeLanguage} → {partner.targetLanguages?.[0]?.language || '학습 중'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: getScoreColor(overallScore) }}>
            {overallScore}
          </div>
          <div className="text-xs text-[#929292]">총점</div>
        </div>
      </div>

      {/* AI 매칭 이유 */}
      {matchReason && (
        <div className="mb-6 p-4 bg-[#E6F9F1] rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-2">
              <svg
                className="w-5 h-5 mt-0.5"
                fill="#00C471"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#111111] mb-1">AI 매칭 분석</h4>
              <p className="text-sm text-[#111111] leading-relaxed">
                {matchReason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7차원 호환성 점수 */}
      <div className="mb-6">
        <h4 className="text-md font-bold text-[#111111] mb-4">호환성 분석</h4>
        <ScoreBar label="언어 호환성" score={scores.languageCompatibility} />
        <ScoreBar label="레벨 적합도" score={scores.levelCompatibility} />
        <ScoreBar label="의미적 유사도" score={scores.semanticSimilarity} />
        <ScoreBar label="스케줄 일치도" score={scores.scheduleCompatibility} />
        <ScoreBar label="목표 일치도" score={scores.goalAlignment} />
        <ScoreBar label="성격 매칭" score={scores.personalityMatch} />
        <ScoreBar label="관심사 겹침도" score={scores.topicOverlap} />
      </div>

      {/* 추천 대화 주제 */}
      {conversationStarters && conversationStarters.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-bold text-[#111111] mb-3">추천 대화 주제</h4>
          <div className="flex flex-wrap gap-2">
            {conversationStarters.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-[#E6F9F1] text-[#00C471] text-sm rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 매칭 요청 버튼 */}
      <button
        onClick={() => onRequestMatch(partner.id)}
        className="w-full h-14 rounded-lg font-bold text-lg transition-colors duration-200"
        style={{
          backgroundColor: '#111111',
          color: 'white'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#414141';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#111111';
        }}
      >
        매칭 요청하기
      </button>
    </div>
  );
};

AIMatchingResults.propTypes = {
  match: PropTypes.shape({
    partner: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      profileImage: PropTypes.string,
      nativeLanguage: PropTypes.string,
      targetLanguages: PropTypes.arrayOf(PropTypes.object)
    }).isRequired,
    scores: PropTypes.shape({
      languageCompatibility: PropTypes.number.isRequired,
      levelCompatibility: PropTypes.number.isRequired,
      semanticSimilarity: PropTypes.number.isRequired,
      scheduleCompatibility: PropTypes.number.isRequired,
      goalAlignment: PropTypes.number.isRequired,
      personalityMatch: PropTypes.number.isRequired,
      topicOverlap: PropTypes.number.isRequired
    }).isRequired,
    matchReason: PropTypes.string,
    conversationStarters: PropTypes.arrayOf(PropTypes.string),
    overallScore: PropTypes.number.isRequired
  }),
  onRequestMatch: PropTypes.func.isRequired
};

export default AIMatchingResults;
