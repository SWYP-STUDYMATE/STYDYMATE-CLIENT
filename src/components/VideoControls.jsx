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
  };

  // Tooltip component
  const Tooltip = ({ text, children }) => (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#2A2A2A] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {text}
      </div>
    </div>
  );

  // Control button component for consistent styling
  const ControlButton = ({ onClick, active, danger, children, tooltip, badge }) => (
    <Tooltip text={tooltip}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`relative p-3 rounded-full transition-all duration-200 ${
          danger
            ? 'bg-[#EA4335] hover:bg-[#D33B2C] text-white'
            : active
            ? 'bg-[#4285F4] hover:bg-[#3374E0] text-white'
            : 'bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {children}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EA4335] text-white text-xs rounded-full flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </button>
    </Tooltip>
  );

  return (
    <div className={`flex items-center justify-center gap-3 p-4 bg-[#1A1A1A] ${isMobile ? 'rounded-lg flex-wrap' : 'rounded-full'} ${className}`} ref={controlsRef}>
      {/* Primary Controls */}
      <div className="flex items-center gap-3">
        {/* Mic Toggle */}
        <ControlButton
          onClick={handleMicToggle}
          danger={!isMicOn}
          tooltip={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </ControlButton>

        {/* Camera Toggle */}
        <ControlButton
          onClick={handleCameraToggle}
          danger={!isCameraOn}
          tooltip={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </ControlButton>

        {/* Screen Share Toggle */}
        <ControlButton
          onClick={handleScreenShareToggle}
          active={isScreenSharing}
          tooltip={isScreenSharing ? 'Stop screen share' : 'Start screen share'}
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </ControlButton>

        {/* Raise Hand */}
        {showRaiseHandButton && (
          <ControlButton
            onClick={handleRaiseHand}
            active={handRaised}
            tooltip={handRaised ? 'Lower hand' : 'Raise hand'}
          >
            <Hand className="w-5 h-5" />
          </ControlButton>
        )}
      </div>

      {/* Divider */}
      {!isMobile && <div className="w-px h-8 bg-[#3A3A3A] mx-2" />}

      {/* Secondary Controls */}
      <div className="flex items-center gap-3">
        {/* Participants */}
        {showParticipantsButton && (
          <ControlButton
            onClick={handleParticipantsClick}
            tooltip={`Participants (${participantCount})`}
            badge={participantCount}
          >
            <Users className="w-5 h-5" />
          </ControlButton>
        )}

        {/* Chat */}
        {showChatButton && (
          <ControlButton
            onClick={handleChatClick}
            tooltip="Chat"
            badge={unreadChatCount}
          >
            <MessageSquare className="w-5 h-5" />
          </ControlButton>
        )}

        {/* Language Selector */}
        {showLanguageButton && (
          <div className="relative" ref={langMenuRef}>
            <ControlButton
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              tooltip="Change language"
            >
              <Languages className="w-5 h-5" />
            </ControlButton>
            
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
          <ControlButton
            onClick={handleSettingsClick}
            tooltip="Settings"
          >
            <Settings className="w-5 h-5" />
          </ControlButton>
        )}

        {/* More Options */}
        {showMoreButton && (
          <div className="relative" ref={moreMenuRef}>
            <ControlButton
              onClick={handleMoreOptionsClick}
              tooltip="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </ControlButton>
            
            {/* More Options Menu */}
            {showMoreMenu && !disabled && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-[#2A2A2A] rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onMoreOptionsClick?.('speaker-stats');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#3A3A3A] transition-colors flex items-center gap-3"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-white text-sm">Speaker Stats</span>
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onMoreOptionsClick?.('mute-all');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#3A3A3A] transition-colors flex items-center gap-3"
                >
                  <VolumeX className="w-4 h-4" />
                  <span className="text-white text-sm">Mute All</span>
                </button>
                <div className="my-1 border-t border-[#3A3A3A]" />
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onMoreOptionsClick?.('record');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#3A3A3A] transition-colors flex items-center gap-3"
                >
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                  <span className="text-white text-sm">Record Meeting</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      {!isMobile && <div className="w-px h-8 bg-[#3A3A3A] mx-2" />}

      {/* End Call Button */}
      <Tooltip text="End call">
        <button
          onClick={handleEndCall}
          disabled={disabled}
          className={`relative px-6 py-3 rounded-full transition-all duration-200 bg-[#EA4335] hover:bg-[#D33B2C] text-white flex items-center gap-2 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <PhoneOff className="w-5 h-5" />
          {!isMobile && <span className="font-medium">End Call</span>}
        </button>
      </Tooltip>
    </div>
  );
};

export default VideoControls;