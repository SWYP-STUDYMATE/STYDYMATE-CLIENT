import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoControls from '../../components/VideoControls';
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, Signal, SignalLow } from 'lucide-react';

export default function AudioSessionRoom() {
  const navigate = useNavigate();
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, connected, ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('ko');
  const [connectionQuality, setConnectionQuality] = useState('good'); // good, fair, poor
  const [isIncoming, setIsIncoming] = useState(false);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // 더미 파트너 데이터
  const partner = {
    name: 'Emma Johnson',
    profileImage: '/assets/basicProfilePic.png',
    level: 'Intermediate',
    country: '🇺🇸 USA',
    languages: ['English (Native)', 'Korean (Learning)'],
    interests: ['Travel', 'K-pop', 'Cooking']
  };

  useEffect(() => {
    // 3초 후 연결 시뮬레이션
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
      startTimeRef.current = Date.now();
      
      // 통화 시간 업데이트
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }, 3000);

    // 연결 품질 랜덤 변경 시뮬레이션
    const qualityInterval = setInterval(() => {
      const qualities = ['good', 'fair', 'poor'];
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    }, 10000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(qualityInterval);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMicToggle = (state) => {
    setIsMicOn(state);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // 3초 후 이전 페이지로 이동
    setTimeout(() => {
      navigate(-1);
    }, 3000);
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'good':
        return <Signal className="w-4 h-4 text-[#00C471]" />;
      case 'fair':
        return <Signal className="w-4 h-4 text-[#FFA500]" />;
      case 'poor':
        return <SignalLow className="w-4 h-4 text-[#EA4335]" />;
      default:
        return <Signal className="w-4 h-4 text-[#929292]" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionQuality) {
      case 'good':
        return '연결 상태 양호';
      case 'fair':
        return '연결 상태 보통';
      case 'poor':
        return '연결 상태 불안정';
      default:
        return '연결 확인 중';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      {/* 헤더 */}
      <div className="bg-[#1A1A1A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-white text-[18px] font-medium">1:1 음성 세션</h1>
            {callStatus === 'connected' && (
              <div className="flex items-center gap-4 text-[#929292] text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(callDuration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getConnectionIcon()}
                  <span>{getConnectionText()}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 언어 표시 */}
          <div className="flex items-center gap-2">
            <span className="text-[#929292] text-sm">현재 언어:</span>
            <span className="text-white text-sm font-medium">
              {currentLanguage === 'ko' ? '한국어' : 
               currentLanguage === 'en' ? 'English' :
               currentLanguage === 'ja' ? '日本語' :
               currentLanguage === 'zh' ? '中文' : 'Español'}
            </span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* 프로필 영역 */}
          <div className="text-center mb-12">
            {/* 프로필 이미지 */}
            <div className="relative inline-block mb-6">
              <img 
                src={partner.profileImage} 
                alt={partner.name}
                className="w-48 h-48 rounded-full object-cover"
              />
              
              {/* 통화 상태 애니메이션 */}
              {callStatus === 'connecting' && (
                <div className="absolute inset-0 rounded-full border-4 border-[#4285F4] animate-pulse" />
              )}
              {callStatus === 'connected' && (
                <div className="absolute inset-0 rounded-full">
                  <div className="absolute inset-0 rounded-full border-4 border-[#00C471] animate-ping" />
                  <div className="absolute inset-0 rounded-full border-4 border-[#00C471]" />
                </div>
              )}
            </div>

            {/* 파트너 정보 */}
            <h2 className="text-white text-[28px] font-bold mb-2">{partner.name}</h2>
            <p className="text-[#929292] text-[16px] mb-4">{partner.country} • {partner.level}</p>
            
            {/* 언어 정보 */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {partner.languages.map((lang, index) => (
                <span key={index} className="text-[#E7E7E7] text-sm bg-[#2A2A2A] px-3 py-1 rounded-full">
                  {lang}
                </span>
              ))}
            </div>

            {/* 관심사 */}
            <div className="flex items-center justify-center gap-2">
              {partner.interests.map((interest, index) => (
                <span key={index} className="text-[#929292] text-sm">
                  #{interest}
                </span>
              ))}
            </div>

            {/* 통화 상태 메시지 */}
            <div className="mt-8">
              {callStatus === 'connecting' && (
                <div className="flex items-center justify-center gap-2 text-[#4285F4]">
                  <PhoneOutgoing className="w-5 h-5 animate-pulse" />
                  <span className="text-lg">연결 중...</span>
                </div>
              )}
              {callStatus === 'connected' && (
                <div className="flex items-center justify-center gap-2 text-[#00C471]">
                  <Phone className="w-5 h-5" />
                  <span className="text-lg">통화 중</span>
                </div>
              )}
              {callStatus === 'ended' && (
                <div className="flex items-center justify-center gap-2 text-[#EA4335]">
                  <Phone className="w-5 h-5" />
                  <span className="text-lg">통화 종료</span>
                </div>
              )}
            </div>
          </div>

          {/* 음성 웨이브 시각화 (연결됨 상태에서만) */}
          {callStatus === 'connected' && (
            <div className="bg-[#1A1A1A] rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center h-24">
                <div className="flex items-center gap-1">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-[#00C471] rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 60 + 20}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1.5s'
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-center text-[#929292] text-sm mt-4">
                {partner.name}님이 말하고 있습니다...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="bg-[#0F0F0F] p-6">
        <div className="max-w-4xl mx-auto">
          <VideoControls
            onMicToggle={handleMicToggle}
            onEndCall={handleEndCall}
            onLanguageChange={handleLanguageChange}
            initialMicState={isMicOn}
            currentLanguage={currentLanguage}
            showCameraButton={false}
            showScreenShareButton={false}
            showParticipantsButton={false}
            showChatButton={false}
            showRaiseHandButton={false}
            showSettingsButton={false}
            showMoreButton={false}
            disabled={callStatus === 'ended'}
          />
        </div>
      </div>
    </div>
  );
}