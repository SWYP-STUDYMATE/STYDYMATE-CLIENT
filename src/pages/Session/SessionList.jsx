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
        <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)] mb-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <img
                        src={session.partnerImage}
                        alt={session.partnerName}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-[16px] font-semibold text-[var(--black-500)]">
                                {session.partnerName}
                            </h3>
                            {session.participants && (
                                <span className="flex items-center space-x-1 text-[12px] text-[#929292]">
                                    <Users className="w-3 h-3" />
                                    <span>{session.participants}</span>
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-4 text-[14px] text-[var(--black-300)]">
                            <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatSessionTime(session.scheduledAt)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{session.duration}분</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                {session.type === 'video' ? (
                                    <Video className="w-4 h-4" />
                                ) : (
                                    <Mic className="w-4 h-4" />
                                )}
                                <span>{session.type === 'video' ? '화상' : '음성'}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {!isPast ? (
                    <button
                        onClick={() => handleStartSession(session)}
                        className="p-2 text-[var(--green-500)] hover:bg-[var(--neutral-100)] rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    session.rating && (
                        <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-[14px] ${i < session.rating ? 'text-[var(--warning-yellow)]' : 'text-[var(--black-50)]'
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
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--neutral-100)]">
                    <span className="px-3 py-1 bg-[var(--neutral-100)] text-[var(--black-300)] text-[12px] rounded-full">
                        {session.language === 'en' ? 'English' : '한국어'}
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleCancelSession(session.id)}
                            className="text-[14px] text-[var(--black-200)] hover:text-[var(--red)]"
                        >
                            취소
                        </button>
                        <button
                            onClick={() => handleStartSession(session)}
                            className="text-[14px] text-[var(--green-500)] hover:text-[var(--green-600)] font-medium"
                        >
                            참가하기
                        </button>
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
            <div className="bg-white rounded-[20px] p-6 border border-[var(--black-50)] mb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--neutral-100)] flex items-center justify-center text-[var(--black-300)] text-[18px]">
                            {title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-[16px] font-semibold text-[var(--black-500)]">
                                    {title}
                                </h3>
                                {metadata.isPrivate && (
                                    <span className="px-2 py-1 bg-[rgba(0,196,113,0.15)] text-[var(--green-600)] text-[10px] rounded-full">비공개</span>
                                )}
                                <span className={`px-2 py-1 text-[10px] rounded-full ${room.status === 'active' ? 'bg-[rgba(0,196,113,0.15)] text-[var(--green-600)]' : 'bg-[var(--neutral-100)] text-[var(--black-300)]'}`}>
                                    {roomStatus}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4 text-[14px] text-[var(--black-300)] mb-2">
                                <span className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>{participantsLabel}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    {room.roomType === 'video' ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    <span>{room.roomType === 'video' ? '화상' : '음성'}</span>
                                </span>
                                {waitlistCount > 0 && (
                                    <span className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>대기 {waitlistCount}명</span>
                                    </span>
                                )}
                                <span className="text-[var(--black-200)]">{hostName} 님이 생성</span>
                            </div>
                            <div className="text-[12px] text-[var(--black-200)]">
                                {createdAtLabel ? `${createdAtLabel} 생성` : '방 정보 확인'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-[var(--neutral-100)] text-[var(--black-300)] text-[12px] rounded-full">
                            {languageLabel}
                        </span>
                        <button
                            onClick={() => handleJoinActiveRoom(room)}
                            disabled={isJoining === room.roomId || isFull}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                                isFull
                                    ? 'bg-[var(--black-50)] text-[var(--black-200)] cursor-not-allowed'
                                    : 'bg-[var(--green-500)] text-white hover:bg-[var(--green-600)]'
                            }`}
                        >
                            {isJoining === room.roomId ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    입장 중...
                                </>
                            ) : isFull ? (
                                '만실'
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    빠른 입장
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen page-bg">
            {/* Header */}
            <div className="bg-white border-b border-[var(--black-50)] px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-[20px] font-bold text-[var(--black-500)]">세션</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => navigate('/sessions/calendar')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Calendar className="w-5 h-5 text-[var(--black-300)]" />
                        </button>
                        <button
                            onClick={() => navigate('/sessions/create')}
                            className="p-2 bg-[var(--green-500)] hover:bg-[var(--green-600)] text-white rounded-lg"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white p-6 border-b border-[var(--black-50)]">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-[24px] font-bold text-[var(--black-500)]">
                            {sessionStats.totalSessions || 0}
                        </p>
                        <p className="text-[12px] text-[var(--black-200)]">완료 세션</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[24px] font-bold text-[var(--black-500)]">
                            {sessionStats.totalDuration || 0}분
                        </p>
                        <p className="text-[12px] text-[var(--black-200)]">총 학습시간</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[24px] font-bold text_[var(--black-500)]">
                            {sessionStats.completionRate || 0}%
                        </p>
                        <p className="text-[12px] text-[var(--black-200)]">완료율</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-[var(--black-50)]">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'active'
                            ? 'text-[var(--green-500)] border-[var(--green-500)]'
                            : 'text-[var(--black-200)] border-transparent'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span>활성 세션</span>
                            {activeRooms.length > 0 && (
                                <span className="bg-[var(--green-500)] text-white text-[10px] px-2 py-1 rounded-full">
                                    {activeRooms.length}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'upcoming'
                            ? 'text-[var(--green-500)] border-[var(--green-500)]'
                            : 'text-[var(--black-200)] border-transparent'
                            }`}
                    >
                        예정된 세션
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${activeTab === 'past'
                            ? 'text-[var(--green-500)] border-[var(--green-500)]'
                            : 'text-[var(--black-200)] border-transparent'
                            }`}
                    >
                        지난 세션
                    </button>
                </div>
            </div>

            {/* Filter Button */}
            <div className="p-4">
                <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg 
          border border-[var(--black-50)] text-[14px] text-[var(--black-300)] hover:bg-[var(--neutral-100)]"
                >
                    <Filter className="w-4 h-4" />
                    <span>필터</span>
                </button>
            </div>

            {/* Session List */}
            <div className="px-6 pb-6">
                {activeTab === 'active' ? (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[18px] font-semibold text-[var(--black-500)]">
                                지금 입장 가능한 세션
                            </h2>
                            <button
                                onClick={loadActiveRooms}
                                disabled={loadingRooms}
                                className="flex items-center gap-2 text-[var(--green-500)] text-[14px] hover:text-[var(--green-600)]"
                            >
                                {loadingRooms ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    '새로고침'
                                )}
                            </button>
                        </div>

                        {loadingRooms ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--green-500)]" />
                                <p className="text-[var(--black-200)]">활성 세션을 불러오는 중...</p>
                            </div>
                        ) : activeRooms.length > 0 ? (
                            activeRooms.map(room => (
                                <ActiveRoomCard key={room.roomId} room={room} />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-[16px] text-[var(--black-200)] mb-4">
                                    현재 활성 세션이 없습니다
                                </p>
                                <div className="space-y-2">
                                    <CommonButton
                                        onClick={() => navigate('/sessions/create')}
                                        variant="primary"
                                    >
                                        새 세션 만들기
                                    </CommonButton>
                                    <CommonButton
                                        onClick={() => navigate('/matching')}
                                        variant="secondary"
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
                                <p className="text-[16px] text-[var(--black-200)] mb-4">
                                    예정된 세션이 없습니다
                                </p>
                                <CommonButton
                                    onClick={() => navigate('/matching')}
                                    variant="primary"
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
                                <p className="text-[16px] text-[var(--black-200)]">
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
