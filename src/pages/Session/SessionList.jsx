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
  ChevronRight
} from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useSessionStore from '../../store/sessionStore';

export default function SessionList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterOpen, setFilterOpen] = useState(false);
  
  const {
    sessions,
    upcomingSessions,
    pastSessions,
    sessionStats,
    loadUpcomingSessions,
    cancelSession
  } = useSessionStore();
  
  // 더미 데이터 (실제로는 API에서 가져와야 함)
  const dummyUpcomingSessions = [
    {
      id: '1',
      partnerId: 'emma123',
      partnerName: 'Emma Wilson',
      partnerImage: '/assets/basicProfilePic.png',
      type: 'video', // video or audio
      scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1시간 후
      duration: 60,
      language: 'en',
      status: 'scheduled'
    },
    {
      id: '2',
      partnerId: 'john456',
      partnerName: 'John Smith',
      partnerImage: '/assets/basicProfilePic.png',
      type: 'audio',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(), // 내일
      duration: 30,
      language: 'ko',
      status: 'scheduled'
    },
    {
      id: '3',
      partnerId: 'group789',
      partnerName: '그룹 세션',
      partnerImage: '/assets/basicProfilePic.png',
      type: 'video',
      scheduledAt: new Date(Date.now() + 172800000).toISOString(), // 2일 후
      duration: 45,
      language: 'en',
      status: 'scheduled',
      participants: 4
    }
  ];
  
  const dummyPastSessions = [
    {
      id: '4',
      partnerId: 'sarah111',
      partnerName: 'Sarah Johnson',
      partnerImage: '/assets/basicProfilePic.png',
      type: 'video',
      scheduledAt: new Date(Date.now() - 86400000).toISOString(), // 어제
      duration: 60,
      language: 'en',
      status: 'completed',
      rating: 5
    },
    {
      id: '5',
      partnerId: 'mike222',
      partnerName: 'Mike Chen',
      partnerImage: '/assets/basicProfilePic.png',
      type: 'audio',
      scheduledAt: new Date(Date.now() - 172800000).toISOString(), // 2일 전
      duration: 45,
      language: 'ko',
      status: 'completed',
      rating: 4
    }
  ];
  
  useEffect(() => {
    loadUpcomingSessions();
  }, [loadUpcomingSessions]);
  
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
  
  const handleCancelSession = (sessionId) => {
    if (window.confirm('이 세션을 취소하시겠습니까?')) {
      cancelSession(sessionId);
    }
  };
  
  const SessionCard = ({ session, isPast = false }) => (
    <div className="bg-white rounded-[20px] p-6 border border-[#E7E7E7] mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <img
            src={session.partnerImage}
            alt={session.partnerName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-[16px] font-semibold text-[#111111]">
                {session.partnerName}
              </h3>
              {session.participants && (
                <span className="flex items-center space-x-1 text-[12px] text-[#929292]">
                  <Users className="w-3 h-3" />
                  <span>{session.participants}</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-[14px] text-[#606060]">
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
            className="p-2 text-[#00C471] hover:bg-[#F1F3F5] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          session.rating && (
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-[14px] ${
                    i < session.rating ? 'text-[#FFA500]' : 'text-[#E7E7E7]'
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
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F1F3F5]">
          <span className="px-3 py-1 bg-[#F1F3F5] text-[#606060] text-[12px] rounded-full">
            {session.language === 'en' ? 'English' : '한국어'}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleCancelSession(session.id)}
              className="text-[14px] text-[#929292] hover:text-[#EA4335]"
            >
              취소
            </button>
            <button
              onClick={() => handleStartSession(session)}
              className="text-[14px] text-[#00C471] hover:text-[#00B267] font-medium"
            >
              참가하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E7E7] px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-[#111111]">세션</h1>
          <button
            onClick={() => navigate('/session/schedule')}
            className="p-2 bg-[#00C471] hover:bg-[#00B267] text-white rounded-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="bg-white p-6 border-b border-[#E7E7E7]">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-[24px] font-bold text-[#111111]">
              {sessionStats.totalSessions || 0}
            </p>
            <p className="text-[12px] text-[#929292]">완료 세션</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-bold text-[#111111]">
              {sessionStats.totalDuration || 0}분
            </p>
            <p className="text-[12px] text-[#929292]">총 학습시간</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-bold text-[#111111]">
              {sessionStats.completionRate || 0}%
            </p>
            <p className="text-[12px] text-[#929292]">완료율</p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white border-b border-[#E7E7E7]">
        <div className="flex">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === 'upcoming' 
                ? 'text-[#00C471] border-[#00C471]' 
                : 'text-[#929292] border-transparent'
            }`}
          >
            예정된 세션
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === 'past' 
                ? 'text-[#00C471] border-[#00C471]' 
                : 'text-[#929292] border-transparent'
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
          border border-[#E7E7E7] text-[14px] text-[#606060] hover:bg-[#F1F3F5]"
        >
          <Filter className="w-4 h-4" />
          <span>필터</span>
        </button>
      </div>
      
      {/* Session List */}
      <div className="px-6 pb-6">
        {activeTab === 'upcoming' ? (
          <>
            {dummyUpcomingSessions.length > 0 ? (
              dummyUpcomingSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-[16px] text-[#929292] mb-4">
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
            {dummyPastSessions.length > 0 ? (
              dummyPastSessions.map(session => (
                <SessionCard key={session.id} session={session} isPast />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-[16px] text-[#929292]">
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