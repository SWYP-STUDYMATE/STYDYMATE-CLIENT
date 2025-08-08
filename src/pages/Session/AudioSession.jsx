import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Phone, PhoneOff, Globe, Volume2, VolumeX } from 'lucide-react';
import CommonButton from '../../components/CommonButton';
import useSessionStore from '../../store/sessionStore';
import useProfileStore from '../../store/profileStore';

export default function AudioSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  
  const [isMuted, setIsMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const timerRef = useRef(null);
  
  const {
    activeSession,
    sessionStatus,
    connectionState,
    startSession,
    endSession,
    toggleAudio,
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
  
  const handleToggleSpeaker = () => {
    setSpeakerMuted(!speakerMuted);
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
  
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#333333] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-[18px] font-bold">1:1 음성 세션</h1>
            {sessionStatus === 'connected' && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00C471] rounded-full animate-pulse" />
                <span className="text-[14px] text-[#00C471]">연결됨</span>
              </div>
            )}
          </div>
          <div className="text-[18px] font-mono">
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Profile Cards */}
        <div className="flex items-center justify-center space-x-16 mb-12">
          {/* User Profile */}
          <div className="text-center">
            <div className="relative mb-4">
              <img
                src={userProfileImage || "/assets/basicProfilePic.png"}
                alt={userName}
                className="w-32 h-32 rounded-full object-cover border-4 border-[#333333]"
              />
              {!isMuted && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00C471] rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <h3 className="text-[16px] font-semibold mb-1">{userName || "나"}</h3>
            <p className="text-[14px] text-[#929292]">
              {currentLanguage === 'en' ? 'Speaking English' : 'Speaking Korean'}
            </p>
          </div>
          
          {/* Connection Visual */}
          <div className="flex items-center">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-12 bg-[#00C471] rounded-full transition-all duration-300`}
                  style={{
                    height: `${Math.random() * 48 + 12}px`,
                    opacity: sessionStatus === 'connected' ? 1 : 0.3
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Partner Profile */}
          <div className="text-center">
            <div className="relative mb-4">
              <img
                src={partner.profileImage}
                alt={partner.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-[#333333]"
              />
              {!speakerMuted && sessionStatus === 'connected' && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#4285F4] rounded-full flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <h3 className="text-[16px] font-semibold mb-1">{partner.name}</h3>
            <p className="text-[14px] text-[#929292]">{partner.level}</p>
          </div>
        </div>
        
        {/* Language Info */}
        <div className="bg-[#1A1A1A] rounded-[20px] p-6 mb-8 max-w-md w-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] text-[#929292] mb-1">현재 언어</p>
              <p className="text-[18px] font-semibold">
                {currentLanguage === 'en' ? 'English' : '한국어'}
              </p>
            </div>
            <button
              onClick={handleToggleLanguage}
              className="p-3 bg-[#333333] hover:bg-[#414141] rounded-full transition-colors duration-200"
            >
              <Globe className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Connection Status */}
        {sessionStatus === 'connecting' && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#FFA500] rounded-full animate-pulse" />
              <p className="text-[14px] text-[#FFA500]">연결 중...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Control Bar */}
      <div className="bg-[#1A1A1A] border-t border-[#333333] p-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className={`p-4 rounded-full transition-colors duration-200 ${
              isMuted 
                ? 'bg-[#EA4335] hover:bg-[#D33B2C]' 
                : 'bg-[#333333] hover:bg-[#414141]'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
          
          {/* Speaker Button */}
          <button
            onClick={handleToggleSpeaker}
            className={`p-4 rounded-full transition-colors duration-200 ${
              speakerMuted 
                ? 'bg-[#EA4335] hover:bg-[#D33B2C]' 
                : 'bg-[#333333] hover:bg-[#414141]'
            }`}
          >
            {speakerMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>
          
          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-4 bg-[#EA4335] hover:bg-[#D33B2C] rounded-full transition-colors duration-200"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}