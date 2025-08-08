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

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

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

  return (
    <div className={`flex items-center justify-center gap-3 p-4 bg-[#1A1A1A] rounded-full ${className}`}>
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
      >
        {isScreenSharing ? (
          <MonitorOff className="w-5 h-5" />
        ) : (
          <Monitor className="w-5 h-5" />
        )}
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-[#3A3A3A] mx-2" />

      {/* Language Selector */}
      {showLanguageButton && (
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            disabled={disabled}
            className={`relative p-3 rounded-full transition-all duration-200 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label="Change language"
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
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {/* Divider */}
      <div className="w-px h-8 bg-[#3A3A3A] mx-2" />

      {/* End Call Button */}
      <button
        onClick={handleEndCall}
        disabled={disabled}
        className={`relative px-6 py-3 rounded-full transition-all duration-200 bg-[#EA4335] hover:bg-[#D33B2C] text-white flex items-center gap-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        aria-label="End call"
      >
        <PhoneOff className="w-5 h-5" />
        <span className="font-medium">End Call</span>
      </button>
    </div>
  );
};

export default VideoControls;