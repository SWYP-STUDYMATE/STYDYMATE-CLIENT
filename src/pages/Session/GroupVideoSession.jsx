import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Users, 
  Mic, 
  MicOff,
  MoreVertical,
  Grid3x3,
  Presentation,
  Pin
} from 'lucide-react';
import VideoControls from '../../components/VideoControls';
import useSessionStore from '../../store/sessionStore';
import useProfileStore from '../../store/profileStore';

export default function GroupVideoSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [callDuration, setCallDuration] = useState(0);
  const [pinnedUserId, setPinnedUserId] = useState(null);
  const [layoutMode, setLayoutMode] = useState('grid'); // grid or speaker
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  
  const {
    activeSession,
    sessionStatus,
    connectionState,
    startSession,
    endSession,
    toggleAudio,
    toggleVideo,
    switchLanguage,
    sessionSettings
  } = useSessionStore();
  
  const { name: userName, profileImage: userProfileImage } = useProfileStore();
  
  // 더미 참가자 데이터 (실제로는 WebRTC에서 가져와야 함)
  const participants = [
    {
      id: 'user1',
      name: userName || "나",
      profileImage: userProfileImage || "/assets/basicProfilePic.png",
      isVideoOn: isVideoOn,
      isMuted: isMuted,
      isSpeaking: false,
      isLocal: true
    },
    {
      id: 'user2',
      name: "Emma Wilson",
      profileImage: "/assets/basicProfilePic.png",
      isVideoOn: true,
      isMuted: false,
      isSpeaking: activeSpeaker === 'user2',
      isLocal: false
    },
    {
      id: 'user3',
      name: "John Smith",
      profileImage: "/assets/basicProfilePic.png",
      isVideoOn: true,
      isMuted: true,
      isSpeaking: false,
      isLocal: false
    },
    {
      id: 'user4',
      name: "Sarah Johnson",
      profileImage: "/assets/basicProfilePic.png",
      isVideoOn: false,
      isMuted: false,
      isSpeaking: activeSpeaker === 'user4',
      isLocal: false
    }
  ];
  
  useEffect(() => {
    // 세션 시작
    if (sessionId && !activeSession) {
      startSession(sessionId);
    }
    
    // 랜덤하게 활성 스피커 변경 (시뮬레이션)
    const speakerInterval = setInterval(() => {
      const speakers = [null, 'user2', 'user4'];
      const randomSpeaker = speakers[Math.floor(Math.random() * speakers.length)];
      setActiveSpeaker(randomSpeaker);
    }, 3000);
    
    return () => {
      clearInterval(speakerInterval);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionId, startSession, activeSession]);
  
  useEffect(() => {
    // 통화 시간 타이머
    if (sessionStatus === 'connected' && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (sessionStatus !== 'connected' && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionStatus]);
  
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toggleAudio();
  };
  
  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toggleVideo();
  };
  
  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // 실제 화면 공유 로직 구현 필요
  };
  
  const handleToggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ko' : 'en';
    setCurrentLanguage(newLang);
    switchLanguage();
  };
  
  const handleEndCall = () => {
    if (window.confirm('통화를 종료하시겠습니까?')) {
      endSession();
      navigate('/sessions');
    }
  };
  
  const handlePinParticipant = (userId) => {
    setPinnedUserId(pinnedUserId === userId ? null : userId);
  };
  
  const handleToggleLayout = () => {
    setLayoutMode(layoutMode === 'grid' ? 'speaker' : 'grid');
  };
  
  const VideoTile = ({ participant, isLarge = false }) => (
    <div 
      className={`relative bg-[#1A1A1A] rounded-lg overflow-hidden group ${
        isLarge ? 'h-full' : ''
      } ${participant.isSpeaking ? 'ring-2 ring-[#00C471]' : ''}`}
    >
      {/* Video Stream or Avatar */}
      {participant.isVideoOn ? (
        <div className="w-full h-full bg-[#333]">
          {/* 실제 비디오 스트림 */}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
          <img
            src={participant.profileImage}
            alt={participant.name}
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>
      )}
      
      {/* Participant Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 
      bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[14px] text-white font-medium">
              {participant.name}
              {participant.isLocal && " (나)"}
            </span>
            {participant.isMuted && (
              <MicOff className="w-4 h-4 text-[#EA4335]" />
            )}
          </div>
          {!participant.isLocal && (
            <button
              onClick={() => handlePinParticipant(participant.id)}
              className="p-1 hover:bg-white/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pin className={`w-4 h-4 ${
                pinnedUserId === participant.id ? 'text-[#00C471]' : 'text-white'
              }`} />
            </button>
          )}
        </div>
      </div>
      
      {/* Speaking Indicator */}
      {participant.isSpeaking && (
        <div className="absolute top-2 right-2">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-3 bg-[#00C471] rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  const renderGridLayout = () => (
    <div className="grid grid-cols-2 gap-4 h-full p-6">
      {participants.map(participant => (
        <VideoTile key={participant.id} participant={participant} />
      ))}
    </div>
  );
  
  const renderSpeakerLayout = () => {
    const mainSpeaker = pinnedUserId 
      ? participants.find(p => p.id === pinnedUserId)
      : participants.find(p => p.isSpeaking) || participants[0];
    
    const otherParticipants = participants.filter(p => p.id !== mainSpeaker.id);
    
    return (
      <div className="flex h-full p-6">
        {/* Main Speaker */}
        <div className="flex-1 mr-4">
          <VideoTile participant={mainSpeaker} isLarge />
        </div>
        
        {/* Other Participants */}
        <div className="w-64 flex flex-col space-y-4">
          {otherParticipants.map(participant => (
            <div key={participant.id} className="h-48">
              <VideoTile participant={participant} />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#333333] px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-[18px] font-bold">그룹 비디오 세션</h1>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#929292]" />
              <span className="text-[14px] text-[#929292]">
                {participants.length}명 참가 중
              </span>
            </div>
            {sessionStatus === 'connected' && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00C471] rounded-full animate-pulse" />
                <span className="text-[14px] text-[#00C471]">연결됨</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-[18px] font-mono">
              {formatDuration(callDuration)}
            </div>
            <div className="text-[14px] text-[#929292]">
              {currentLanguage === 'en' ? 'English' : '한국어'}
            </div>
            <button
              onClick={handleToggleLayout}
              className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
              title={layoutMode === 'grid' ? '스피커 뷰로 전환' : '그리드 뷰로 전환'}
            >
              {layoutMode === 'grid' ? (
                <Presentation className="w-5 h-5" />
              ) : (
                <Grid3x3 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Video Area */}
      <div className="flex-1 relative overflow-hidden">
        {layoutMode === 'grid' ? renderGridLayout() : renderSpeakerLayout()}
        
        {/* Screen Share Indicator */}
        {isScreenSharing && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
          bg-[#00C471] text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-[14px] font-medium">화면 공유 중</span>
          </div>
        )}
        
        {/* Connection Status */}
        {sessionStatus === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-[#FFA500] rounded-full animate-pulse" />
                <p className="text-[18px] text-[#FFA500]">연결 중...</p>
              </div>
              <p className="text-[14px] text-[#929292]">
                그룹 화상 통화를 준비하고 있습니다
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Control Bar */}
      <div className="bg-[#1A1A1A] border-t border-[#333333] p-6 flex-shrink-0">
        <VideoControls
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          isScreenSharing={isScreenSharing}
          currentLanguage={currentLanguage}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onToggleLanguage={handleToggleLanguage}
          onEndCall={handleEndCall}
          showVideo={true}
          showScreenShare={true}
          showLanguageToggle={true}
          showSettings={true}
          showParticipants={true}
          participantCount={participants.length}
          variant="dark"
        />
      </div>
    </div>
  );
}