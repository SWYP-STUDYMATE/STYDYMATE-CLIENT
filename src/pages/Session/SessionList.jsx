import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    Video,
    Mic,
    Plus,
    Users,
    Filter,
    ChevronRight,
    List,
    Loader2,
    Play,
    Trash2,
    Edit3
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useSessionStore from '../../store/sessionStore';
import { webrtcAPI } from '../../api/webrtc';
import api from '../../api/index.js';
import { log } from '../../utils/logger';

export default function SessionList() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [filterOpen, setFilterOpen] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [activeRooms, setActiveRooms] = useState([]);
    const [isJoining, setIsJoining] = useState('');

    const {
        sessions,
        upcomingSessions,
        sessionStats,
        loadSessions,
        cancelSession
    } = useSessionStore();

    // 전체 세션 데이터를 위한 상태  
    const [allSessions, setAllSessions] = useState([]);

    useEffect(() => {
        loadAllSessionsData();
        loadActiveRooms();
    }, []);

    // 모든 세션 데이터 로드
    const loadAllSessionsData = async () => {
        try {
            await loadSessions();
        } catch (error) {
            console.error('세션 데이터 로드 실패:', error);
        }
    };


    // Load active WebRTC rooms
    const loadActiveRooms = async () => {
        try {
            setLoadingRooms(true);
            log.info('활성 룸 목록 조회 시작', null, 'SESSION_LIST');

            const response = await api.get('/room/active');
            const rooms = response?.data?.data || response?.data || [];
            setActiveRooms(Array.isArray(rooms) ? rooms : []);
            log.info('활성 룸 목록 조회 완료', { count: Array.isArray(rooms) ? rooms.length : 0 }, 'SESSION_LIST');
        } catch (error) {
            // 404는 활성 룸이 없는 정상 케이스로 처리
            if (error.response?.status === 404) {
                log.info('현재 활성 세션이 없습니다', null, 'SESSION_LIST');
                setActiveRooms([]);
            } else {
                log.error('활성 룸 목록 조회 실패', error, 'SESSION_LIST');
                setActiveRooms([]);
            }
        } finally {
            setLoadingRooms(false);
        }
    };

    const formatSessionTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return `${diffMinutes}분 후`;
            }
            return `${diffHours}시간 후`;
        } else if (diffDays === 1) {
            return '내일';
        } else if (diffDays > 0 && diffDays < 7) {
            return `${diffDays}일 후`;
        } else {
            return date.toLocaleDateString('ko-KR', {
                month: 'numeric',
                day: 'numeric',
                weekday: 'short'
            });
        }
    };

    const handleStartSession = (session) => {
        if (session.type === 'video') {
            navigate(`/session/video/${session.id}`);
        } else {
            navigate(`/session/audio/${session.id}`);
        }
    };

    const handleJoinActiveRoom = async (room) => {
        try {
            setIsJoining(room.roomId);
            log.info('활성 룸 입장 시도', { roomId: room.roomId }, 'SESSION_LIST');

            const userId = localStorage.getItem('userId') || 'guest-' + Date.now();
            const userName = localStorage.getItem('userName') || 'Anonymous';

            // Try to join the room
            await webrtcAPI.joinRoom(room.roomId, { userId, userName });
            
            // Navigate to appropriate session room
            if (room.roomType === 'video') {
                navigate(`/session/video/${room.roomId}`);
            } else {
                navigate(`/session/audio/${room.roomId}`);
            }

        } catch (error) {
            log.error('활성 룸 입장 실패', error, 'SESSION_LIST');
            alert('세션 입장에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
        } finally {
            setIsJoining('');
        }
    };

    const handleCancelSession = (sessionId) => {
        if (window.confirm('이 세션을 취소하시겠습니까?')) {
            cancelSession(sessionId);
        }
    };

    const SessionCard = ({ session, isPast = false }) => (
        <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[var(--black-50)] mb-3 sm:mb-4">
            <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <img
                        src={session.partnerImage}
                        alt={session.partnerName}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                            <h3 className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[var(--black-500)] break-words">
                                {session.partnerName}
                            </h3>
                            {session.participants && (
                                <span className="flex items-center space-x-1 text-[11px] sm:text-[12px] text-[#929292] whitespace-nowrap">
                                    <Users className="w-3 h-3" />
                                    <span>{session.participants}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[12px] sm:text-[13px] md:text-[14px] text-[var(--black-300)]">
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="break-words">{formatSessionTime(session.scheduledAt)}</span>
                            </span>
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="break-words">{session.duration}분</span>
                            </span>
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                {session.type === 'video' ? (
                                    <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                ) : (
                                    <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                )}
                                <span className="break-words">{session.type === 'video' ? '화상' : '음성'}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {!isPast ? (
                    <CommonButton
                        onClick={() => handleStartSession(session)}
                        variant="ghost"
                        size="icon"
                        fullWidth={false}
                        icon={<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                        className="text-[var(--green-500)] flex-shrink-0 touch-manipulation"
                        aria-label="세션 시작"
                    />
                ) : (
                    session.rating && (
                        <div className="flex space-x-1 flex-shrink-0">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-[12px] sm:text-[13px] md:text-[14px] ${i < session.rating ? 'text-[var(--warning-yellow)]' : 'text-[var(--black-50)]'
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    )
                )}
            </div>

            {!isPast && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--neutral-100)]">
                    <span className="px-2.5 sm:px-3 py-1 bg-[var(--neutral-100)] text-[var(--black-300)] text-[11px] sm:text-[12px] rounded-full whitespace-nowrap">
                        {session.language === 'en' ? 'English' : '한국어'}
                    </span>
                    <div className="flex space-x-2 w-full sm:w-auto">
                        <CommonButton
                            onClick={() => handleCancelSession(session.id)}
                            variant="link"
                            size="xs"
                            fullWidth={false}
                            className="text-[var(--black-200)] hover:text-[var(--red)] flex-1 sm:flex-none touch-manipulation"
                        >
                            취소
                        </CommonButton>
                        <CommonButton
                            onClick={() => handleStartSession(session)}
                            variant="link"
                            size="xs"
                            fullWidth={false}
                            className="flex-1 sm:flex-none touch-manipulation"
                        >
                            참가하기
                        </CommonButton>
                    </div>
                </div>
            )}
        </div>
    );

    const ActiveRoomCard = ({ room }) => {
        const metadata = room.metadata || {};
        const session = room.session || {};
        const title = session.title || metadata.title || (room.roomType === 'video' ? '화상 세션' : '음성 세션');
        const language = session.languageCode || metadata.language || 'en';
        const hostName = session.hostName || metadata.hostName || metadata.createdByName || metadata.createdBy || '호스트';
        const createdAt = session.scheduledAt || metadata.createdAt || room.createdAt;
        const waitlistCount = session.waitlistCount ?? metadata.waitlistCount ?? room.waitlistCount ?? 0;
        const participantsLabel = `${room.currentParticipants}/${room.maxParticipants}명`;
        const isFull = room.currentParticipants >= room.maxParticipants;
        const languageLabel = language === 'ko' ? '한국어' : language === 'en' ? 'English' : language.toUpperCase();
        const roomStatus = room.status === 'active' ? '진행 중' : '대기 중';
        const createdAtLabel = createdAt
            ? new Date(createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            : null;

        return (
            <div className="bg-white rounded-[20px] p-4 sm:p-6 border border-[var(--black-50)] mb-4">
                <div className="flex items-start justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--neutral-100)] flex items-center justify-center text-[var(--black-300)] text-[16px] sm:text-[18px] flex-shrink-0">
                            {title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                                <h3 className="text-[14px] sm:text-[15px] md:text-[16px] font-semibold text-[var(--black-500)] break-words">
                                    {title}
                                </h3>
                                {metadata.isPrivate && (
                                    <span className="px-2 py-1 bg-[rgba(0,196,113,0.15)] text-[var(--green-600)] text-[9px] sm:text-[10px] rounded-full whitespace-nowrap">비공개</span>
                                )}
                                <span className={`px-2 py-1 text-[9px] sm:text-[10px] rounded-full whitespace-nowrap ${room.status === 'active' ? 'bg-[rgba(0,196,113,0.15)] text-[var(--green-600)]' : 'bg-[var(--neutral-100)] text-[var(--black-300)]'}`}>
                                    {roomStatus}
                                </span>
                            </div>
                            <div className="flex items-center flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-[12px] sm:text-[13px] md:text-[14px] text-[var(--black-300)] mb-2">
                                <span className="flex items-center space-x-1 whitespace-nowrap">
                                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="break-words">{participantsLabel}</span>
                                </span>
                                <span className="flex items-center space-x-1 whitespace-nowrap">
                                    {room.roomType === 'video' ? <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />}
                                    <span className="break-words">{room.roomType === 'video' ? '화상' : '음성'}</span>
                                </span>
                                {waitlistCount > 0 && (
                                    <span className="flex items-center space-x-1 whitespace-nowrap">
                                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="break-words">대기 {waitlistCount}명</span>
                                    </span>
                                )}
                                <span className="text-[var(--black-200)] break-words">{hostName} 님이 생성</span>
                            </div>
                            <div className="text-[11px] sm:text-[12px] text-[var(--black-200)] break-words">
                                {createdAtLabel ? `${createdAtLabel} 생성` : '방 정보 확인'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="px-2 sm:px-3 py-1 bg-[var(--neutral-100)] text-[var(--black-300)] text-[11px] sm:text-[12px] rounded-full whitespace-nowrap">
                            {languageLabel}
                        </span>
                        <CommonButton
                            onClick={() => handleJoinActiveRoom(room)}
                            disabled={isFull}
                            loading={isJoining === room.roomId}
                            variant={isFull ? "secondary" : "success"}
                            size="small"
                            fullWidth={false}
                            icon={!isFull && !isJoining ? <Play /> : undefined}
                            className="flex-1 sm:flex-none text-[12px] sm:text-[13px] md:text-[14px] touch-manipulation"
                        >
                            {isFull ? '만실' : '빠른 입장'}
                        </CommonButton>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen page-bg overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-[var(--black-50)] px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-[18px] sm:text-[20px] font-bold text-[var(--black-500)] break-words">세션</h1>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <CommonButton
                            onClick={() => navigate('/sessions/calendar')}
                            variant="ghost-icon"
                            size="icon"
                            fullWidth={false}
                            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
                            aria-label="캘린더 보기"
                            className="touch-manipulation"
                        />
                        <CommonButton
                            onClick={() => navigate('/sessions/create')}
                            variant="icon-primary"
                            size="icon"
                            fullWidth={false}
                            icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                            aria-label="세션 생성"
                            className="touch-manipulation"
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white p-4 sm:p-6 border-b border-[var(--black-50)]">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center">
                        <p className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-[var(--black-500)] break-words">
                            {sessionStats.totalSessions || 0}
                        </p>
                        <p className="text-[11px] sm:text-[12px] text-[var(--black-200)] break-words">완료 세션</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-[var(--black-500)] break-words">
                            {sessionStats.totalDuration || 0}분
                        </p>
                        <p className="text-[11px] sm:text-[12px] text-[var(--black-200)] break-words">총 학습시간</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[20px] sm:text-[22px] md:text-[24px] font-bold text-[var(--black-500)] break-words">
                            {sessionStats.completionRate || 0}%
                        </p>
                        <p className="text-[11px] sm:text-[12px] text-[var(--black-200)] break-words">완료율</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-[var(--black-50)] overflow-x-auto">
                <div className="flex min-w-full">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 text-[12px] sm:text-[13px] md:text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap touch-manipulation ${activeTab === 'active'
                            ? 'text-[var(--green-500)] border-[var(--green-500)]'
                            : 'text-[var(--black-200)] border-transparent'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="break-words">활성 세션</span>
                            {activeRooms.length > 0 && (
                                <span className="bg-[var(--green-500)] text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                    {activeRooms.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 py-3 text-[12px] sm:text-[13px] md:text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap touch-manipulation ${activeTab === 'upcoming'
                            ? 'text-[var(--green-500)] border-[var(--green-500)]'
                            : 'text-[var(--black-200)] border-transparent'
                            }`}
                    >
                        <span className="break-words">예정된 세션</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 py-3 text-[12px] sm:text-[13px] md:text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap touch-manipulation ${activeTab === 'past'
                            ? 'text-[var(--green-500)] border-[var(--green-500)]'
                            : 'text-[var(--black-200)] border-transparent'
                            }`}
                    >
                        <span className="break-words">지난 세션</span>
                    </button>
                </div>
            </div>

            {/* Filter Button */}
            <div className="p-3 sm:p-4">
                <CommonButton
                    onClick={() => setFilterOpen(!filterOpen)}
                    variant="outline"
                    size="small"
                    fullWidth={false}
                    icon={<Filter />}
                    className="border border-[var(--black-50)] bg-white text-[var(--black-300)] hover:bg-[var(--neutral-100)] touch-manipulation break-words"
                >
                    필터
                </CommonButton>
            </div>

            {/* Session List */}
            <div className="px-4 sm:px-6 pb-6">
                {activeTab === 'active' ? (
                    <>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <h2 className="text-[16px] sm:text-[17px] md:text-[18px] font-semibold text-[var(--black-500)] break-words">
                                지금 입장 가능한 세션
                            </h2>
                            <CommonButton
                                onClick={loadActiveRooms}
                                disabled={loadingRooms}
                                loading={loadingRooms}
                                variant="link"
                                size="small"
                                fullWidth={false}
                                className="text-[12px] sm:text-[13px] md:text-[14px] touch-manipulation break-words"
                            >
                                새로고침
                            </CommonButton>
                        </div>

                        {loadingRooms ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--green-500)]" />
                                <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[var(--black-200)] break-words">활성 세션을 불러오는 중...</p>
                            </div>
                        ) : activeRooms.length > 0 ? (
                            activeRooms.map(room => (
                                <ActiveRoomCard key={room.roomId} room={room} />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[var(--black-200)] mb-4 break-words">
                                    현재 활성 세션이 없습니다
                                </p>
                                <div className="space-y-2">
                                    <CommonButton
                                        onClick={() => navigate('/sessions/create')}
                                        variant="primary"
                                        className="w-full sm:w-auto text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                                    >
                                        새 세션 만들기
                                    </CommonButton>
                                    <CommonButton
                                        onClick={() => navigate('/matching')}
                                        variant="secondary"
                                        className="w-full sm:w-auto text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                                    >
                                        매칭으로 상대 찾기
                                    </CommonButton>
                                </div>
                            </div>
                        )}
                    </>
                ) : activeTab === 'upcoming' ? (
                    <>
                        {upcomingSessions.length > 0 ? (
                            upcomingSessions.map(session => (
                                <SessionCard key={session.id} session={session} />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[var(--black-200)] mb-4 break-words">
                                    예정된 세션이 없습니다
                                </p>
                                <CommonButton
                                    onClick={() => navigate('/matching')}
                                    variant="primary"
                                    className="w-full sm:w-auto text-[14px] sm:text-[15px] md:text-base py-[14px] touch-manipulation"
                                >
                                    매칭 시작하기
                                </CommonButton>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {sessions.filter(s => s.status === 'completed').length > 0 ? (
                            sessions.filter(s => s.status === 'completed').map(session => (
                                <SessionCard key={session.id} session={session} isPast />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[var(--black-200)] break-words">
                                    완료된 세션이 없습니다
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
