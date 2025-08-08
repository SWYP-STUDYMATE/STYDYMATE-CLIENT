import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Monitor, 
  MonitorOff,
  Languages,
  Settings,
  Users,
  MessageSquare,
  Hand,
  MoreVertical,
  Volume2,
  VolumeX
} from 'lucide-react';

const VideoControls = ({
  onMicToggle,
  onCameraToggle,
  onEndCall,
  onScreenShareToggle,
  onLanguageChange,
  onSettingsClick,
  onParticipantsClick,
  onChatClick,
  onRaiseHand,
  onMoreOptionsClick,
  initialMicState = true,
  initialCameraState = true,
  initialScreenShareState = false,
  disabled = false,
  className = "",
  showLanguageButton = true,
  showSettingsButton = true,
  showParticipantsButton = true,
  showChatButton = true,
  showRaiseHandButton = true,
  showMoreButton = true,
  currentLanguage = "en",
  participantCount = 0,
  unreadChatCount = 0,
  isHandRaised = false,
  isMobile = false
}) => {
  const [isMicOn, setIsMicOn] = useState(initialMicState);
  const [isCameraOn, setIsCameraOn] = useState(initialCameraState);
  const [isScreenSharing, setIsScreenSharing] = useState(initialScreenShareState);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState("");
  const [handRaised, setHandRaised] = useState(isHandRaised);
  
  const controlsRef = useRef(null);
  const moreMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMicToggle = () => {
    const newState = !isMicOn;
    setIsMicOn(newState);
    onMicToggle?.(newState);
  };

  const handleCameraToggle = () => {
    const newState = !isCameraOn;
    setIsCameraOn(newState);
    onCameraToggle?.(newState);
  };

  const handleScreenShareToggle = () => {
    const newState = !isScreenSharing;
    setIsScreenSharing(newState);
    onScreenShareToggle?.(newState);
  };

  const handleEndCall = () => {
    onEndCall?.();
  };

  const handleLanguageSelect = (langCode) => {
    setShowLanguageMenu(false);
    onLanguageChange?.(langCode);
  };

  const handleSettingsClick = () => {
    onSettingsClick?.();
  };

  const handleParticipantsClick = () => {
    onParticipantsClick?.();
  };

  const handleChatClick = () => {
    onChatClick?.();
  };

  const handleRaiseHand = () => {
    const newState = !handRaised;
    setHandRaised(newState);
    onRaiseHand?.(newState);
  };

  const handleMoreOptionsClick = () => {
    setShowMoreMenu(!showMoreMenu);
    onMoreOptionsClick?.();
  };

  // 모바일 버전 (컴팩트 레이아웃)
  if (isMobile) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 flex items-center justify-around gap-2 p-4 bg-[#1A1A1A] ${className}`}>
        {/* Essential controls only */}
        <button
          onClick={handleMicToggle}
          disabled={disabled}
          className={`p-3 rounded-full transition-all duration-200 ${
            isMicOn 
              ? 'bg-[#2A2A2A] text-white' 
              : 'bg-[#EA4335] text-white'
          }`}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={handleCameraToggle}
          disabled={disabled}
          className={`p-3 rounded-full transition-all duration-200 ${
            isCameraOn 
              ? 'bg-[#2A2A2A] text-white' 
              : 'bg-[#EA4335] text-white'
          }`}
        >
          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={handleEndCall}
          disabled={disabled}
          className="px-6 py-3 rounded-full bg-[#EA4335] text-white"
        >
          <PhoneOff className="w-5 h-5" />
        </button>

        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={handleMoreOptionsClick}
            disabled={disabled}
            className="p-3 rounded-full bg-[#2A2A2A] text-white"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMoreMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#2A2A2A] rounded-lg shadow-lg py-2">
              <button
                onClick={handleScreenShareToggle}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-[#3A3A3A] text-white"
              >
                <Monitor className="w-5 h-5" />
                <span>{isScreenSharing ? 'Stop sharing' : 'Share screen'}</span>
              </button>
              {showParticipantsButton && (
                <button
                  onClick={handleParticipantsClick}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-[#3A3A3A] text-white"
                >
                  <Users className="w-5 h-5" />
                  <span>Participants ({participantCount})</span>
                </button>
              )}
              {showChatButton && (
                <button
                  onClick={handleChatClick}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-[#3A3A3A] text-white"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat {unreadChatCount > 0 && `(${unreadChatCount})`}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 데스크톱 버전 (전체 레이아웃)
  return (
    <div className={`flex items-center justify-center gap-3 p-4 bg-[#1A1A1A] rounded-full ${className}`}>
      {/* Primary Controls */}
      <div className="flex items-center gap-3">
        {/* Mic Toggle Button */}
        <button
          onClick={handleMicToggle}
          disabled={disabled}
          className={`relative p-3 rounded-full transition-all duration-200 ${
            isMicOn 
              ? 'bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white' 
              : 'bg-[#EA4335] hover:bg-[#D33B2C] text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
          title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </button>

        {/* Camera Toggle Button */}
        <button
          onClick={handleCameraToggle}
          disabled={disabled}
          className={`relative p-3 rounded-full transition-all duration-200 ${
            isCameraOn 
              ? 'bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white' 
              : 'bg-[#EA4335] hover:bg-[#D33B2C] text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraOn ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </button>

        {/* Screen Share Toggle Button */}
        <button
          onClick={handleScreenShareToggle}
          disabled={disabled}
          className={`relative p-3 rounded-full transition-all duration-200 ${
            isScreenSharing 
              ? 'bg-[#4285F4] hover:bg-[#3374E0] text-white' 
              : 'bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label={isScreenSharing ? 'Stop screen share' : 'Start screen share'}
          title={isScreenSharing ? 'Stop screen share' : 'Start screen share'}
        >
          {isScreenSharing ? (
            <MonitorOff className="w-5 h-5" />
          ) : (
            <Monitor className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-[#3A3A3A]" />

      {/* Secondary Controls */}
      <div className="flex items-center gap-3">
        {/* Raise Hand Button */}
        {showRaiseHandButton && (
          <button
            onClick={handleRaiseHand}
            disabled={disabled}
            className={`relative p-3 rounded-full transition-all duration-200 ${
              handRaised 
                ? 'bg-[#FBBC04] hover:bg-[#F9AB00] text-black' 
                : 'bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
            title={handRaised ? 'Lower hand' : 'Raise hand'}
          >
            <Hand className="w-5 h-5" />
          </button>
        )}

        {/* Participants Button */}
        {showParticipantsButton && (
          <button
            onClick={handleParticipantsClick}
            disabled={disabled}
            className={`relative p-3 rounded-full transition-all duration-200 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label={`Participants (${participantCount})`}
            title={`Participants (${participantCount})`}
          >
            <Users className="w-5 h-5" />
            {participantCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#4285F4] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {participantCount}
              </span>
            )}
          </button>
        )}

        {/* Chat Button */}
        {showChatButton && (
          <button
            onClick={handleChatClick}
            disabled={disabled}
            className={`relative p-3 rounded-full transition-all duration-200 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label={`Chat ${unreadChatCount > 0 ? `(${unreadChatCount} unread)` : ''}`}
            title={`Chat ${unreadChatCount > 0 ? `(${unreadChatCount} unread)` : ''}`}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#EA4335] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </button>
        )}

        {/* Language Selector */}
        {showLanguageButton && (
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              disabled={disabled}
              className={`relative p-3 rounded-full transition-all duration-200 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              aria-label="Change language"
              title="Change language"
            >
              <Languages className="w-5 h-5" />
            </button>
            
            {/* Language Dropdown Menu */}
            {showLanguageMenu && !disabled && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-[#2A2A2A] rounded-lg shadow-lg py-2 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-[#3A3A3A] transition-colors ${
                      currentLanguage === lang.code ? 'bg-[#3A3A3A]' : ''
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-white text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Button */}
        {showSettingsButton && (
          <button
            onClick={handleSettingsClick}
            disabled={disabled}
            className={`relative p-3 rounded-full transition-all duration-200 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-[#3A3A3A]" />

      {/* End Call Button */}
      <button
        onClick={handleEndCall}
        disabled={disabled}
        className={`relative px-6 py-3 rounded-full transition-all duration-200 bg-[#EA4335] hover:bg-[#D33B2C] text-white flex items-center gap-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        aria-label="End call"
        title="End call"
      >
        <PhoneOff className="w-5 h-5" />
        <span className="font-medium">End Call</span>
      </button>
    </div>
  );
};

export default VideoControls;