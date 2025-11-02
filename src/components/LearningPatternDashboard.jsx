import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getLearningPattern } from '../api/analytics';

/**
 * 학습 패턴 분석 대시보드 컴포넌트
 * - 학습 습관 시각화
 * - 강점/약점 트렌드
 * - 맞춤형 학습 경로
 */
const LearningPatternDashboard = ({ userId, monthsBack = 3 }) => {
  const [pattern, setPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const fetchPattern = async () => {
      try {
        setLoading(true);
        const data = await getLearningPattern(monthsBack);
        setPattern(data);
      } catch (err) {
        console.error('Failed to fetch learning pattern:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPattern();
  }, [userId, monthsBack]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00C471] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-sm text-[#929292]">학습 패턴 분석 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FAFAFA] p-6 rounded-lg text-center">
        <div className="text-[#EA4335] mb-2">분석 실패</div>
        <div className="text-sm text-[#929292]">{error}</div>
      </div>
    );
  }

  if (!pattern) return null;

  const {
    studyHabits,
    progress,
    strengths,
    weaknesses,
    learningStyle,
    engagement,
    insights,
    personalizedPath
  } = pattern;

  // 일관성 점수 색상
  const getConsistencyColor = (consistency) => {
    if (consistency >= 0.8) return '#00C471';
    if (consistency >= 0.6) return '#33D08D';
    if (consistency >= 0.4) return '#8AE4BE';
    return '#929292';
  };

  // 트렌드 아이콘
  const TrendIcon = ({ trend }) => {
    if (trend === 'improving') {
      return <span className="text-[#00C471]">↗</span>;
    } else if (trend === 'declining') {
      return <span className="text-[#EA4335]">↘</span>;
    }
    return <span className="text-[#929292]">→</span>;
  };

  return (
    <div className="space-y-6">
      {/* 학습 진행 상황 요약 */}
      <div className="bg-white rounded-[10px] p-6 shadow-sm border border-[#E7E7E7]">
        <h2 className="text-xl font-bold text-[#111111] mb-6">학습 진행 상황</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 현재 레벨 */}
          <div className="bg-[#E6F9F1] p-4 rounded-lg">
            <div className="text-sm text-[#929292] mb-1">현재 레벨</div>
            <div className="text-3xl font-bold text-[#00C471]">
              {progress?.currentLevel ? String(progress.currentLevel) : '-'}
            </div>
            <div className="text-xs text-[#929292] mt-2">
              {progress?.monthsLearning ? `${progress.monthsLearning}개월 학습 중` : '학습 기록 없음'}
            </div>
          </div>

          {/* 주간 세션 */}
          <div className="bg-[#FAFAFA] p-4 rounded-lg">
            <div className="text-sm text-[#929292] mb-1">주간 세션</div>
            <div className="text-3xl font-bold text-[#111111]">
              {studyHabits?.sessionsPerWeek ? Math.round(studyHabits.sessionsPerWeek) : '-'}
            </div>
            <div className="text-xs text-[#929292] mt-2">
              평균 {studyHabits?.averageSessionDuration ? `${Math.round(studyHabits.averageSessionDuration)}분` : '-'}
            </div>
          </div>

          {/* 일관성 */}
          <div className="bg-[#FAFAFA] p-4 rounded-lg">
            <div className="text-sm text-[#929292] mb-1">학습 일관성</div>
            <div
              className="text-3xl font-bold"
              style={{ color: getConsistencyColor(studyHabits?.consistency ?? 0) }}
            >
              {studyHabits?.consistency ? `${Math.round(studyHabits.consistency * 100)}%` : '-'}
            </div>
            <div className="text-xs text-[#929292] mt-2">
              {studyHabits?.mostProductiveTime ? `${studyHabits.mostProductiveTime}에 가장 활발` : '분석 중...'}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: '종합' },
          { id: 'strengths', label: '강점' },
          { id: 'weaknesses', label: '약점' },
          { id: 'style', label: '학습 스타일' },
          { id: 'path', label: '맞춤 경로' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-[#00C471] text-white'
                : 'bg-[#FAFAFA] text-[#929292] hover:bg-[#E7E7E7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 섹션 컨텐츠 */}
      <div className="bg-white rounded-[10px] p-6 shadow-sm border border-[#E7E7E7]">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* 주요 발견사항 */}
            <div>
              <h3 className="text-lg font-bold text-[#111111] mb-4">주요 발견사항</h3>
              <div className="space-y-2">
                {insights.keyFindings?.map((finding, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[#00C471] mt-1">•</span>
                    <span className="text-sm text-[#111111]">{finding}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 추천사항 */}
            <div>
              <h3 className="text-lg font-bold text-[#111111] mb-4">추천사항</h3>
              <div className="space-y-2">
                {insights.recommendations?.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 bg-[#E6F9F1] p-3 rounded-lg"
                  >
                    <span className="text-[#00C471] mt-0.5">{i + 1}.</span>
                    <span className="text-sm text-[#111111]">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 다음 마일스톤 */}
            {insights.milestones && insights.milestones.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[#111111] mb-4">다음 마일스톤</h3>
                <div className="space-y-3">
                  {insights.milestones.map((milestone, i) => (
                    <div key={i} className="border-l-4 border-[#00C471] bg-[#FAFAFA] p-4 rounded-r-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-[#111111]">{milestone.title}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            milestone.priority === 'high'
                              ? 'bg-[#EA4335] text-white'
                              : milestone.priority === 'medium'
                              ? 'bg-[#4285F4] text-white'
                              : 'bg-[#929292] text-white'
                          }`}
                        >
                          {milestone.priority === 'high'
                            ? '높음'
                            : milestone.priority === 'medium'
                            ? '중간'
                            : '낮음'}
                        </span>
                      </div>
                      <p className="text-sm text-[#111111] mb-2">{milestone.description}</p>
                      <div className="text-xs text-[#929292]">
                        목표일: {new Date(milestone.targetDate).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'strengths' && (
          <div>
            <h3 className="text-lg font-bold text-[#111111] mb-4">강점 분석</h3>
            <div className="space-y-3">
              {strengths?.map((strength, i) => (
                <div key={i} className="bg-[#E6F9F1] p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-[#00C471]">{strength.area}</h4>
                    <div className="flex items-center gap-2">
                      <TrendIcon trend={strength.trend} />
                      <span className="text-sm font-bold text-[#00C471]">
                        {strength.score}점
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#111111]">{strength.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'weaknesses' && (
          <div>
            <h3 className="text-lg font-bold text-[#111111] mb-4">약점 및 개선 방법</h3>
            <div className="space-y-4">
              {weaknesses?.map((weakness, i) => (
                <div key={i} className="border border-[#E7E7E7] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-[#111111]">{weakness.area}</h4>
                    <div className="flex items-center gap-2">
                      <TrendIcon trend={weakness.trend} />
                      <span className="text-sm font-bold text-[#EA4335]">
                        {weakness.score}점
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#111111] mb-3">{weakness.details}</p>
                  <div className="bg-[#FAFAFA] p-3 rounded-lg">
                    <div className="text-xs font-bold text-[#111111] mb-2">추천 연습법</div>
                    <ul className="space-y-1">
                      {weakness.recommendations?.map((rec, j) => (
                        <li key={j} className="text-xs text-[#111111] flex items-start gap-2">
                          <span className="text-[#00C471]">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'style' && learningStyle && (
          <div className="space-y-6">
            {/* 선호하는 학습 방식 */}
            <div>
              <h3 className="text-lg font-bold text-[#111111] mb-4">선호하는 학습 방식</h3>
              <div className="flex flex-wrap gap-2">
                {learningStyle.primary?.map((style, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-[#00C471] text-white rounded-full text-sm font-medium"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>

            {/* 학습 활동 분포 */}
            <div>
              <h3 className="text-lg font-bold text-[#111111] mb-4">학습 활동 분포</h3>
              <div className="space-y-3">
                {Object.entries(learningStyle.engagement).map(([type, count]) => {
                  const total = Object.values(learningStyle.engagement).reduce(
                    (sum, val) => sum + val,
                    0
                  );
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={type}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-[#111111]">
                          {type === 'videoSessions'
                            ? '화상 세션'
                            : type === 'audioSessions'
                            ? '음성 세션'
                            : '텍스트 세션'}
                        </span>
                        <span className="text-sm text-[#929292]">
                          {count}회 ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00C471] transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 선호 활동 */}
            {learningStyle.preferredActivities && (
              <div>
                <h3 className="text-lg font-bold text-[#111111] mb-4">선호하는 활동</h3>
                <div className="flex flex-wrap gap-2">
                  {learningStyle.preferredActivities.map((activity, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-[#E6F9F1] text-[#00C471] rounded-full text-sm"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'path' && personalizedPath && (
          <div className="space-y-6">
            {/* 단기 목표 */}
            <div>
              <h3 className="text-lg font-bold text-[#111111] mb-4">
                단기 목표 (1-4주)
              </h3>
              <div className="space-y-3">
                {personalizedPath.shortTerm?.map((item, i) => (
                  <div key={i} className="border-l-4 border-[#00C471] bg-[#E6F9F1] p-4 rounded-r-lg">
                    <h4 className="font-bold text-[#111111] mb-2">{item.goal}</h4>
                    <div className="text-sm text-[#111111] mb-2">
                      예상 기간: {item.estimatedWeeks}주
                    </div>
                    <div className="text-sm text-[#929292]">
                      활동: {item.activities.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 중기 목표 */}
            <div>
              <h3 className="text-lg font-bold text-[#111111] mb-4">
                중기 목표 (1-3개월)
              </h3>
              <div className="space-y-3">
                {personalizedPath.mediumTerm?.map((item, i) => (
                  <div key={i} className="border-l-4 border-[#4285F4] bg-[#FAFAFA] p-4 rounded-r-lg">
                    <h4 className="font-bold text-[#111111] mb-2">{item.goal}</h4>
                    <div className="text-sm text-[#111111] mb-2">
                      예상 기간: {item.estimatedMonths}개월
                    </div>
                    <div className="text-sm text-[#929292]">
                      활동: {item.activities.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 장기 목표 */}
            {personalizedPath.longTerm && personalizedPath.longTerm.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[#111111] mb-4">
                  장기 목표 (6개월+)
                </h3>
                <div className="space-y-3">
                  {personalizedPath.longTerm.map((item, i) => (
                    <div key={i} className="border-l-4 border-[#929292] bg-[#FAFAFA] p-4 rounded-r-lg">
                      <h4 className="font-bold text-[#111111] mb-2">{item.goal}</h4>
                      <div className="text-sm text-[#111111] mb-2">
                        예상 기간: {item.estimatedMonths}개월
                      </div>
                      <div className="text-sm text-[#929292]">
                        활동: {item.activities.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

LearningPatternDashboard.propTypes = {
  userId: PropTypes.string,
  monthsBack: PropTypes.number
};

export default LearningPatternDashboard;
