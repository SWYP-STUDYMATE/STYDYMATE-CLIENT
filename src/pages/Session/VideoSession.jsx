import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Minimize2, Maximize2 } from 'lucide-react';
import VideoControls from '../../components/VideoControls';
import useSessionStore from '../../store/sessionStore';
import useProfileStore from '../../store/profileStore';

export default function VideoSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isPiPMode, setIsPiPMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
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
  
  // 더미 파트너 데이터 (실제로는 activeSession에서 가져와야 함)
  const partner = {
    name: "Emma Wilson",
    profileImage: "/assets/basicProfilePic.png",
    level: "Intermediate",
    nativeLanguage: "English",
    learningLanguage: "Korean"
  };
  
  useEffect(() => {
    // 세션 시작
    if (sessionId && !activeSession) {
      startSession(sessionId);
    }
    
    // 더미 비디오 스트림 설정 (실제로는 WebRTC로 구현)
    if (localVideoRef.current) {
      // 로컬 비디오 스트림 시뮬레이션
      localVideoRef.current.style.background = '#333';
    }
    if (remoteVideoRef.current) {
      // 리모트 비디오 스트림 시뮬레이션
      remoteVideoRef.current.style.background = '#222';
    }
    
    return () => {
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
  
  const handleTogglePiP = () => {
    setIsPiPMode(!isPiPMode);
  };
  
  const handleToggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const handleOpenSettings = () => {
    // 설정 모달 열기
    console.log('Open settings');
  };
  
  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#333333] px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-[18px] font-bold">1:1 비디오 세션</h1>
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
          </div>
        </div>
      </div>
      
      {/* Main Video Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Remote Video (Full Screen) */}
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
          {/* Partner Info Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <img
                src={partner.profileImage}
                alt={partner.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-[14px] font-semibold">{partner.name}</p>
                <p className="text-[12px] text-[#929292]">{partner.level}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Local Video (PiP) */}
        <div className={`absolute ${
          isPiPMode ? 'bottom-4 right-4' : 'top-4 right-4'
        } w-64 h-48 bg-[#1A1A1A] rounded-lg overflow-hidden shadow-2xl 
        transition-all duration-300 ${isVideoOn ? '' : 'opacity-50'}`}>
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
              <img
                src={userProfileImage || "/assets/basicProfilePic.png"}
                alt={userName}
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
          )}
          {/* PiP Controls */}
          <button
            onClick={handleTogglePiP}
            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 
            rounded-full transition-colors duration-200"
          >
            {isPiPMode ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
          {/* User Name */}
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
            <p className="text-[12px]">{userName || "나"}</p>
          </div>
        </div>
        
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
                화상 통화를 준비하고 있습니다
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
          onOpenSettings={handleOpenSettings}
          onToggleFullscreen={handleToggleFullscreen}
          showVideo={true}
          showScreenShare={true}
          showLanguageToggle={true}
          showSettings={true}
          showFullscreen={true}
          variant="dark"
        />
      </div>
    </div>
  );
}