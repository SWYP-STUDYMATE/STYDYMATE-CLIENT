import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGroupSessionDetails,
  getSessionParticipants,
  joinGroupSession,
  leaveGroupSession,
  startGroupSession,
  endGroupSession,
  cancelGroupSession,
  kickParticipant,
  updateGroupSession
} from '../../api/groupSession';
import Header from '../../components/Header';
import { useAlert } from '../../hooks/useAlert';
import { 
  Users, Calendar, Clock, Globe, Lock, Video, Mic, MessageSquare,
  Play, Square, XCircle, UserMinus, Settings, Share2, Copy,
  CheckCircle, AlertCircle, BookOpen, Target, Hash, Star,
  ChevronLeft, Edit2, Trash2, UserPlus, LogOut
} from 'lucide-react';

export default function GroupSessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess, showInfo } = useAlert();
  
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  
  // 세션 수정 폼
  const [editSession, setEditSession] = useState({
    title: '',
    description: '',
    language: '',
    targetLevel: '',
    maxParticipants: 6,
    scheduledStartTime: '',
    durationMinutes: 60,
    topic: '',
    tags: []
  });

  const currentUserId = localStorage.getItem('userId'); // 현재 사용자 ID

  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      
      // 세션 상세 정보 로드
      const sessionResponse = await getGroupSessionDetails(sessionId);
      const sessionData = sessionResponse.data;
      setSession(sessionData);
      
      // 호스트 및 참가자 여부 확인
      setIsHost(sessionData.hostId === currentUserId);
      setIsParticipant(sessionData.participantIds?.includes(currentUserId));
      
      // 수정 폼 초기화
      setEditSession({
        title: sessionData.title,
        description: sessionData.description || '',
        language: sessionData.language,
        targetLevel: sessionData.targetLevel,
        maxParticipants: sessionData.maxParticipants,
        scheduledStartTime: sessionData.scheduledStartTime,
        durationMinutes: sessionData.durationMinutes,
        topic: sessionData.topic || '',
        tags: sessionData.tags || []
      });
      
      // 참가자 목록 로드
      try {
        const participantsResponse = await getSessionParticipants(sessionId);
        setParticipants(participantsResponse.data || []);
      } catch (error) {
        console.error('Failed to load participants:', error);
      }
    } catch (error) {
      console.error('Failed to load session details:', error);
      showError('세션 정보를 불러오는데 실패했습니다.');
      navigate('/group-session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    try {
      await joinGroupSession(sessionId);
      showSuccess('세션에 참가했습니다.');
      loadSessionDetails();
    } catch (error) {
      showError('세션 참가에 실패했습니다.');
      console.error(error);
    }
  };

  const handleLeaveSession = async () => {
    if (!confirm('정말 세션에서 나가시겠습니까?')) return;
    
    try {
      await leaveGroupSession(sessionId);
      showInfo('세션에서 나갔습니다.');
      navigate('/group-session');
    } catch (error) {
      showError('세션 나가기에 실패했습니다.');
      console.error(error);
    }
  };

  const handleStartSession = async () => {
    try {
      await startGroupSession(sessionId);
      showSuccess('세션이 시작되었습니다.');
      navigate(`/group-session/room/${sessionId}`);
    } catch (error) {
      showError('세션 시작에 실패했습니다.');
      console.error(error);
    }
  };

  const handleEndSession = async () => {
    if (!confirm('정말 세션을 종료하시겠습니까?')) return;
    
    try {
      await endGroupSession(sessionId);
      showSuccess('세션이 종료되었습니다.');
      loadSessionDetails();
    } catch (error) {
      showError('세션 종료에 실패했습니다.');
      console.error(error);
    }
  };

  const handleCancelSession = async () => {
    try {
      await cancelGroupSession(sessionId, cancelReason);
      showInfo('세션이 취소되었습니다.');
      setShowCancelModal(false);
      setCancelReason('');
      loadSessionDetails();
    } catch (error) {
      showError('세션 취소에 실패했습니다.');
      console.error(error);
    }
  };

  const handleUpdateSession = async () => {
    try {
      await updateGroupSession(sessionId, editSession);
      showSuccess('세션 정보가 수정되었습니다.');
      setShowEditModal(false);
      loadSessionDetails();
    } catch (error) {
      showError('세션 수정에 실패했습니다.');
      console.error(error);
    }
  };

  const handleKickParticipant = async (participantId, participantName) => {
    if (!confirm(`${participantName}님을 세션에서 내보내시겠습니까?`)) return;
    
    try {
      await kickParticipant(sessionId, participantId);
      showSuccess('참가자를 내보냈습니다.');
      loadSessionDetails();
    } catch (error) {
      showError('참가자 내보내기에 실패했습니다.');
      console.error(error);
    }
  };

  const handleCopyJoinCode = () => {
    if (session?.joinCode) {
      navigator.clipboard.writeText(session.joinCode);
      setCopiedCode(true);
      showSuccess('참가 코드가 복사되었습니다.');
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const handleShareSession = () => {
    const shareUrl = `${window.location.origin}/group-session/${sessionId}`;
    const shareText = `"${session.title}" 그룹 세션에 참여하세요!\n${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: session.title,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareText);
      showSuccess('공유 링크가 복사되었습니다.');
    }
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-5 h-5" />;
      case 'AUDIO': return <Mic className="w-5 h-5" />;
      case 'TEXT': return <MessageSquare className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getSessionStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="px-3 py-1.5 bg-[#4285F4] text-white text-[14px] rounded-full">예정됨</span>;
      case 'ONGOING':
        return <span className="px-3 py-1.5 bg-[#00C471] text-white text-[14px] rounded-full">진행중</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1.5 bg-[#606060] text-white text-[14px] rounded-full">종료됨</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1.5 bg-[#EA4335] text-white text-[14px] rounded-full">취소됨</span>;
      default:
        return null;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long'
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

  if (!session) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen max-w-[768px] w-full mx-auto">
        <Header />
        <div className="flex flex-col items-center justify-center h-[400px]">
          <AlertCircle className="w-12 h-12 text-[#B5B5B5] mb-4" />
          <p className="text-[#929292]">세션을 찾을 수 없습니다</p>
          <button
            onClick={() => navigate('/group-session')}
            className="mt-4 px-6 py-2 bg-[#111111] text-white rounded-[6px]"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen max-w-[768px] w-full mx-auto">
      <Header />
      
      {/* 헤더 섹션 */}
      <div className="bg-white p-6 border-b border-[#E7E7E7]">
        <button
          onClick={() => navigate('/group-session')}
          className="flex items-center gap-2 text-[#606060] mb-4 hover:text-[#111111]"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[14px]">목록으로</span>
        </button>

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getSessionStatusBadge(session.status)}
              {session.isPublic ? (
                <Globe className="w-5 h-5 text-[#606060]" />
              ) : (
                <Lock className="w-5 h-5 text-[#606060]" />
              )}
              {getSessionTypeIcon(session.sessionType)}
            </div>
            <h1 className="text-[24px] font-bold text-[#111111] mb-2">{session.title}</h1>
            {session.description && (
              <p className="text-[16px] text-[#606060]">{session.description}</p>
            )}
          </div>
          
          {isHost && session.status === 'SCHEDULED' && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-[#606060] hover:bg-[#F1F3F5] rounded-full"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleShareSession}
                className="p-2 text-[#606060] hover:bg-[#F1F3F5] rounded-full"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* 세션 정보 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#929292]" />
            <span className="text-[14px] text-[#606060]">학습 언어</span>
            <span className="text-[14px] font-medium text-[#111111]">{session.language}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#929292]" />
            <span className="text-[14px] text-[#606060]">레벨</span>
            <span className="text-[14px] font-medium text-[#111111]">{session.targetLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#929292]" />
            <span className="text-[14px] text-[#606060]">참가자</span>
            <span className="text-[14px] font-medium text-[#111111]">
              {session.currentParticipants || 0}/{session.maxParticipants}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#929292]" />
            <span className="text-[14px] text-[#606060]">진행 시간</span>
            <span className="text-[14px] font-medium text-[#111111]">{session.durationMinutes}분</span>
          </div>
        </div>

        {/* 시작 시간 */}
        {session.scheduledStartTime && (
          <div className="p-3 bg-[#F1F3F5] rounded-[6px] mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#606060]" />
              <span className="text-[14px] font-medium text-[#111111]">
                {formatDateTime(session.scheduledStartTime)}
              </span>
            </div>
          </div>
        )}

        {/* 참가 코드 (호스트만 보기) */}
        {isHost && session.joinCode && (
          <div className="p-3 bg-[#E6F9F1] rounded-[6px] mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#606060] mb-1">참가 코드</p>
                <p className="text-[20px] font-mono font-bold text-[#00C471] tracking-wider">
                  {session.joinCode}
                </p>
              </div>
              <button
                onClick={handleCopyJoinCode}
                className="p-2 text-[#00C471] hover:bg-white/50 rounded-full"
              >
                {copiedCode ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* 태그 */}
        {session.tags && session.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {session.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#F1F3F5] text-[#606060] text-[12px] rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          {session.status === 'SCHEDULED' && (
            <>
              {isHost ? (
                <>
                  <button
                    onClick={handleStartSession}
                    className="flex-1 py-3 bg-[#00C471] text-white rounded-[6px] 
                      font-medium hover:bg-[#00B267] transition-colors flex items-center 
                      justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    세션 시작
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-3 bg-[#F1F3F5] text-[#606060] rounded-[6px] 
                      font-medium hover:bg-[#E7E7E7] transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </>
              ) : isParticipant ? (
                <button
                  onClick={handleLeaveSession}
                  className="flex-1 py-3 bg-[#F1F3F5] text-[#606060] rounded-[6px] 
                    font-medium hover:bg-[#E7E7E7] transition-colors flex items-center 
                    justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  세션 나가기
                </button>
              ) : (
                <button
                  onClick={handleJoinSession}
                  className="flex-1 py-3 bg-[#00C471] text-white rounded-[6px] 
                    font-medium hover:bg-[#00B267] transition-colors flex items-center 
                    justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  세션 참가
                </button>
              )}
            </>
          )}
          
          {session.status === 'ONGOING' && (
            <>
              {(isHost || isParticipant) ? (
                <>
                  <button
                    onClick={() => navigate(`/group-session/room/${sessionId}`)}
                    className="flex-1 py-3 bg-[#00C471] text-white rounded-[6px] 
                      font-medium hover:bg-[#00B267] transition-colors flex items-center 
                      justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    세션 입장
                  </button>
                  {isHost && (
                    <button
                      onClick={handleEndSession}
                      className="px-4 py-3 bg-[#EA4335] text-white rounded-[6px] 
                        font-medium hover:bg-[#D33B2C] transition-colors"
                    >
                      <Square className="w-5 h-5" />
                    </button>
                  )}
                </>
              ) : (
                <button
                  disabled
                  className="flex-1 py-3 bg-[#F1F3F5] text-[#929292] rounded-[6px] 
                    font-medium cursor-not-allowed"
                >
                  진행 중인 세션
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 참가자 목록 */}
      <div className="p-6">
        <h2 className="text-[18px] font-bold text-[#111111] mb-4">
          참가자 ({participants.length}/{session.maxParticipants})
        </h2>
        
        {participants.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-[#B5B5B5] mx-auto mb-4" />
            <p className="text-[#929292]">아직 참가자가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="bg-white rounded-[10px] p-4 border border-[#E7E7E7] 
                  flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {participant.profileImage ? (
                    <img
                      src={participant.profileImage}
                      alt={participant.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#F1F3F5] 
                      flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#929292]" />
                    </div>
                  )}
                  <div>
                    <p className="text-[14px] font-medium text-[#111111]">
                      {participant.name}
                      {participant.id === session.hostId && (
                        <span className="ml-2 px-2 py-0.5 bg-[#00C471] text-white 
                          text-[10px] rounded-full">호스트</span>
                      )}
                    </p>
                    <p className="text-[12px] text-[#606060]">
                      {participant.language} • {participant.level}
                    </p>
                  </div>
                </div>
                
                {isHost && participant.id !== session.hostId && session.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleKickParticipant(participant.id, participant.name)}
                    className="p-2 text-[#929292] hover:text-[#EA4335] hover:bg-[#FFF5F5] 
                      rounded-full transition-colors"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 세션 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overlay-strong">
          <div className="bg-white rounded-[20px] w-full max-w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E7E7E7]">
              <h2 className="text-[20px] font-bold text-[#111111]">세션 정보 수정</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#606060] mb-2">
                  세션 제목
                </label>
                <input
                  type="text"
                  value={editSession.title}
                  onChange={(e) => setEditSession({ ...editSession, title: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                    focus:border-[#111111] outline-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#606060] mb-2">
                  설명
                </label>
                <textarea
                  value={editSession.description}
                  onChange={(e) => setEditSession({ ...editSession, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                    focus:border-[#111111] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#606060] mb-2">
                    최대 참가자
                  </label>
                  <input
                    type="number"
                    value={editSession.maxParticipants}
                    onChange={(e) => setEditSession({ ...editSession, maxParticipants: parseInt(e.target.value) })}
                    min="2"
                    max="10"
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
                    value={editSession.durationMinutes}
                    onChange={(e) => setEditSession({ ...editSession, durationMinutes: parseInt(e.target.value) })}
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
                  value={editSession.topic}
                  onChange={(e) => setEditSession({ ...editSession, topic: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                    focus:border-[#111111] outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#E7E7E7] flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 bg-[#F1F3F5] text-[#606060] rounded-[6px] 
                  font-medium hover:bg-[#E7E7E7] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpdateSession}
                className="flex-1 py-3 bg-[#00C471] text-white rounded-[6px] 
                  font-medium hover:bg-[#00B267] transition-colors"
              >
                수정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 세션 취소 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overlay-strong">
          <div className="bg-white rounded-[20px] w-full max-w-[400px]">
            <div className="p-6 border-b border-[#E7E7E7]">
              <h2 className="text-[20px] font-bold text-[#111111]">세션 취소</h2>
            </div>
            
            <div className="p-6">
              <p className="text-[14px] text-[#606060] mb-4">
                세션을 취소하면 모든 참가자에게 알림이 전송됩니다.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="취소 사유를 입력하세요 (선택사항)"
                rows={3}
                className="w-full px-4 py-3 border border-[#E7E7E7] rounded-[6px]
                  focus:border-[#111111] outline-none resize-none"
              />
            </div>

            <div className="p-6 border-t border-[#E7E7E7] flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="flex-1 py-3 bg-[#F1F3F5] text-[#606060] rounded-[6px] 
                  font-medium hover:bg-[#E7E7E7] transition-colors"
              >
                돌아가기
              </button>
              <button
                onClick={handleCancelSession}
                className="flex-1 py-3 bg-[#EA4335] text-white rounded-[6px] 
                  font-medium hover:bg-[#D33B2C] transition-colors"
              >
                세션 취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
