import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPublicGroupSessions,
  getMyGroupSessions,
  getUpcomingGroupSessions,
  getOngoingGroupSessions,
  createGroupSession,
  joinGroupSessionByCode
} from '../../api/groupSession';
import Header from '../../components/Header';
import { useAlert } from '../../hooks/useAlert';
import { 
  Users, Calendar, Clock, Globe, Lock, Video, Mic, MessageSquare, 
  Plus, Search, Filter, ChevronRight, UserPlus, Code, Play, BookOpen,
  Target, Hash, Star, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

export default function GroupSessionPage() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();
  
  // 상태 관리
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PUBLIC'); // PUBLIC, MY, UPCOMING, ONGOING
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [filters, setFilters] = useState({
    language: '',
    level: '',
    status: ''
  });
  
  // 새 세션 생성 폼
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    language: 'English',
    targetLevel: 'Intermediate',
    maxParticipants: 6,
    scheduledStartTime: '',
    durationMinutes: 60,
    isPublic: true,
    sessionType: 'VIDEO',
    topic: '',
    tags: []
  });

  useEffect(() => {
    loadSessions();
  }, [activeTab, filters]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      let data;
      
      switch (activeTab) {
        case 'PUBLIC':
          const publicResponse = await getPublicGroupSessions({
            language: filters.language,
            level: filters.level,
            status: filters.status
          });
          data = publicResponse.data?.content || publicResponse.data || [];
          break;
          
        case 'MY':
          const myResponse = await getMyGroupSessions();
          data = myResponse.data || [];
          break;
          
        case 'UPCOMING':
          const upcomingResponse = await getUpcomingGroupSessions();
          data = upcomingResponse.data?.content || upcomingResponse.data || [];
          break;
          
        case 'ONGOING':
          const ongoingResponse = await getOngoingGroupSessions();
          data = ongoingResponse.data || [];
          break;
          
        default:
          data = [];
      }
      
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      showError('세션 목록을 불러오는데 실패했습니다.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSession.title || !newSession.scheduledStartTime) {
      showError('필수 정보를 입력해주세요.');
      return;
    }

    try {
      const response = await createGroupSession(newSession);
      showSuccess('세션이 생성되었습니다.');
      setShowCreateModal(false);
      setNewSession({
        title: '',
        description: '',
        language: 'English',
        targetLevel: 'Intermediate',
        maxParticipants: 6,
        scheduledStartTime: '',
        durationMinutes: 60,
        isPublic: true,
        sessionType: 'VIDEO',
        topic: '',
        tags: []
      });
      loadSessions();
      
      // 생성된 세션 상세 페이지로 이동
      if (response.data?.id) {
        navigate(`/group-session/${response.data.id}`);
      }
    } catch (error) {
      showError('세션 생성에 실패했습니다.');
      console.error(error);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode || joinCode.length !== 6) {
      showError('올바른 참가 코드를 입력해주세요.');
      return;
    }

    try {
      const response = await joinGroupSessionByCode(joinCode);
      showSuccess('세션에 참가했습니다.');
      setShowJoinModal(false);
      setJoinCode('');
      
      // 세션 룸으로 이동
      if (response.data?.id) {
        navigate(`/group-session/room/${response.data.id}`);
      }
    } catch (error) {
      showError('세션 참가에 실패했습니다.');
      console.error(error);
    }
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-4 h-4" />;
      case 'AUDIO': return <Mic className="w-4 h-4" />;
      case 'TEXT': return <MessageSquare className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getSessionStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="px-2 py-1 bg-[#4285F4] text-white text-[12px] rounded-full">예정</span>;
      case 'ONGOING':
        return <span className="px-2 py-1 bg-[#00C471] text-white text-[12px] rounded-full">진행중</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-[#606060] text-white text-[12px] rounded-full">종료</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-[#EA4335] text-white text-[12px] rounded-full">취소</span>;
      default:
        return null;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    
    // 24시간 이내면 상대 시간 표시
    if (diff > 0 && diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      if (hours > 0) return `${hours}시간 ${minutes}분 후`;
      return `${minutes}분 후`;
    }
    
    // 그 외에는 날짜와 시간 표시
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen max-w-[768px] w-full mx-auto">
        <Header />
        <div className="flex justify-center items-center h-[400px]">
          <div className="text-[#929292]">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      
      {/* 헤더 섹션 */}
      <div className="bg-white p-6 border-b border-[#E7E7E7]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[24px] font-bold text-[#111111]">그룹 세션</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 bg-[#F1F3F5] text-[#606060] rounded-full text-[14px] 
                font-medium hover:bg-[#E7E7E7] transition-colors flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              코드로 참가
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#00C471] text-white rounded-full text-[14px] 
                font-medium hover:bg-[#00B267] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              새 세션
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'PUBLIC', label: '공개 세션', icon: <Globe className="w-4 h-4" /> },
            { id: 'MY', label: '내 세션', icon: <Users className="w-4 h-4" /> },
            { id: 'UPCOMING', label: '예정', icon: <Calendar className="w-4 h-4" /> },
            { id: 'ONGOING', label: '진행중', icon: <Play className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors
                flex items-center gap-2
                ${activeTab === tab.id
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#F1F3F5] text-[#606060] hover:bg-[#E7E7E7]'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 필터 (공개 세션 탭에서만 표시) */}
        {activeTab === 'PUBLIC' && (
          <div className="flex gap-2">
            <select
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="px-3 py-2 bg-[#F1F3F5] text-[#606060] rounded-[6px] text-[14px]
                border border-transparent focus:border-[#111111] outline-none"
            >
              <option value="">모든 언어</option>
              <option value="English">영어</option>
              <option value="Korean">한국어</option>
              <option value="Japanese">일본어</option>
              <option value="Chinese">중국어</option>
            </select>
            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
              className="px-3 py-2 bg-[#F1F3F5] text-[#606060] rounded-[6px] text-[14px]
                border border-transparent focus:border-[#111111] outline-none"
            >
              <option value="">모든 레벨</option>
              <option value="Beginner">초급</option>
              <option value="Intermediate">중급</option>
              <option value="Advanced">고급</option>
            </select>
          </div>
        )}
      </div>

      {/* 세션 리스트 */}
      <div className="p-6">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-[#B5B5B5] mx-auto mb-4" />
            <p className="text-[#929292]">
              {activeTab === 'MY' ? '참가한 세션이 없습니다' : '세션이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(`/group-session/${session.id}`)}
                className="bg-white rounded-[10px] p-4 border border-[#E7E7E7] 
                  hover:border-[#00C471] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getSessionStatusBadge(session.status)}
                      {session.isPublic ? (
                        <Globe className="w-4 h-4 text-[#606060]" />
                      ) : (
                        <Lock className="w-4 h-4 text-[#606060]" />
                      )}
                      {getSessionTypeIcon(session.sessionType)}
                    </div>
                    <h3 className="font-medium text-[16px] text-[#111111] mb-1">
                      {session.title}
                    </h3>
                    {session.description && (
                      <p className="text-[14px] text-[#606060] line-clamp-2">
                        {session.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#B5B5B5] ml-3" />
                </div>

                <div className="flex items-center gap-4 text-[12px] text-[#929292]">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {session.language}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {session.targetLevel}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {session.currentParticipants || 0}/{session.maxParticipants}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {session.durationMinutes}분
                  </div>
                </div>

                {session.scheduledStartTime && (
                  <div className="mt-3 pt-3 border-t border-[#F1F3F5]">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#606060]">
                        {formatDateTime(session.scheduledStartTime)}
                      </span>
                      {session.hostName && (
                        <span className="text-[12px] text-[#929292]">
                          호스트: {session.hostName}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {session.tags && session.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {session.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#F1F3F5] text-[#606060] text-[11px] rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 세션 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E7E7E7]">
              <h2 className="text-[20px] font-bold text-[#111111]">새 그룹 세션 만들기</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#606060] mb-2">
                  세션 제목 *
                </label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="예: 영어 프리토킹 모임"
                  className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                    focus:border-[#111111] outline-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#606060] mb-2">
                  설명
                </label>
                <textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  placeholder="세션에 대한 간단한 설명을 입력하세요"
                  rows={3}
                  className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                    focus:border-[#111111] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#606060] mb-2">
                    학습 언어
                  </label>
                  <select
                    value={newSession.language}
                    onChange={(e) => setNewSession({ ...newSession, language: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                      focus:border-[#111111] outline-none"
                  >
                    <option value="English">영어</option>
                    <option value="Korean">한국어</option>
                    <option value="Japanese">일본어</option>
                    <option value="Chinese">중국어</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#606060] mb-2">
                    목표 레벨
                  </label>
                  <select
                    value={newSession.targetLevel}
                    onChange={(e) => setNewSession({ ...newSession, targetLevel: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                      focus:border-[#111111] outline-none"
                  >
                    <option value="Beginner">초급</option>
                    <option value="Intermediate">중급</option>
                    <option value="Advanced">고급</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#606060] mb-2">
                    세션 유형
                  </label>
                  <select
                    value={newSession.sessionType}
                    onChange={(e) => setNewSession({ ...newSession, sessionType: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                      focus:border-[#111111] outline-none"
                  >
                    <option value="VIDEO">화상 통화</option>
                    <option value="AUDIO">음성 통화</option>
                    <option value="TEXT">텍스트 채팅</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#606060] mb-2">
                    최대 참가자
                  </label>
                  <input
                    type="number"
                    value={newSession.maxParticipants}
                    onChange={(e) => setNewSession({ ...newSession, maxParticipants: parseInt(e.target.value) })}
                    min="2"
                    max="10"
                    className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                      focus:border-[#111111] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#606060] mb-2">
                    시작 시간 *
                  </label>
                  <input
                    type="datetime-local"
                    value={newSession.scheduledStartTime}
                    onChange={(e) => setNewSession({ ...newSession, scheduledStartTime: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                      focus:border-[#111111] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-[#606060] mb-2">
                    진행 시간 (분)
                  </label>
                  <input
                    type="number"
                    value={newSession.durationMinutes}
                    onChange={(e) => setNewSession({ ...newSession, durationMinutes: parseInt(e.target.value) })}
                    min="30"
                    max="180"
                    step="30"
                    className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                      focus:border-[#111111] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#606060] mb-2">
                  주제
                </label>
                <input
                  type="text"
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                  placeholder="예: 일상 대화, 비즈니스 영어, 여행 회화"
                  className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                    focus:border-[#111111] outline-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#606060] mb-2">
                  공개 설정
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newSession.isPublic}
                      onChange={() => setNewSession({ ...newSession, isPublic: true })}
                      className="w-4 h-4 text-[#00C471]"
                    />
                    <span className="text-[14px] text-[#606060]">공개 (누구나 참가 가능)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!newSession.isPublic}
                      onChange={() => setNewSession({ ...newSession, isPublic: false })}
                      className="w-4 h-4 text-[#00C471]"
                    />
                    <span className="text-[14px] text-[#606060]">비공개 (초대만 가능)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#E7E7E7] flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-[#F1F3F5] text-[#606060] rounded-[6px] 
                  font-medium hover:bg-[#E7E7E7] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateSession}
                className="flex-1 py-3 bg-[#00C471] text-white rounded-[6px] 
                  font-medium hover:bg-[#00B267] transition-colors"
              >
                생성하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 참가 코드 입력 모달 */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[400px]">
            <div className="p-6 border-b border-[#E7E7E7]">
              <h2 className="text-[20px] font-bold text-[#111111]">참가 코드 입력</h2>
            </div>
            
            <div className="p-6">
              <p className="text-[14px] text-[#606060] mb-4">
                호스트로부터 받은 6자리 참가 코드를 입력하세요
              </p>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="예: ABC123"
                maxLength={6}
                className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                  focus:border-[#111111] outline-none text-center text-[20px] font-mono
                  uppercase tracking-wider"
              />
            </div>

            <div className="p-6 border-t border-[#E7E7E7] flex gap-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                }}
                className="flex-1 py-3 bg-[#F1F3F5] text-[#606060] rounded-[6px] 
                  font-medium hover:bg-[#E7E7E7] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleJoinByCode}
                disabled={joinCode.length !== 6}
                className={`flex-1 py-3 rounded-[6px] font-medium transition-colors
                  ${joinCode.length === 6
                    ? 'bg-[#00C471] text-white hover:bg-[#00B267]'
                    : 'bg-[#F1F3F5] text-[#929292] cursor-not-allowed'
                  }`}
              >
                참가하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}