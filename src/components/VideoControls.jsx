import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  Globe,
  Settings,
  Maximize,
  Users
} from 'lucide-react';

export default function VideoControls({
  isMuted = false,
  isVideoOn = true,
  isScreenSharing = false,
  currentLanguage = 'en',
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleLanguage,
  onEndCall,
  onOpenSettings,
  onToggleFullscreen,
  showVideo = true,
  showScreenShare = true,
  showLanguageToggle = true,
  showSettings = true,
  showFullscreen = true,
  showParticipants = false,
  participantCount = 0,
  onToggleParticipants,
  className = "",
  variant = "dark" // dark or light
}) {
  const baseButtonClass = `p-4 rounded-full transition-all duration-200 relative group`;

  const buttonVariants = {
    dark: {
      normal: "bg-[var(--black-400)] hover:bg-[var(--black-300)] text-white",
      active: "bg-[var(--green-500)] hover:bg-[var(--green-600)] text-white",
      danger: "bg-[var(--red)] hover:bg-[#D33B2C] text-white"
    },
    light: {
      normal: "bg-[var(--neutral-100)] hover:bg-[var(--black-50)] text-[var(--black-500)]",
      active: "bg-[var(--green-500)] hover:bg-[var(--green-600)] text-white",
      danger: "bg-[var(--red)] hover:bg-[#D33B2C] text-white"
    }
  };

  const tooltipClass = `absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
    bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 
    transition-opacity duration-200 pointer-events-none whitespace-nowrap`;

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      {/* Microphone Toggle */}
      <button
        onClick={onToggleMute}
        className={`${baseButtonClass} ${isMuted
            ? buttonVariants[variant].danger
            : buttonVariants[variant].normal
          }`}
        aria-label={isMuted ? "마이크 켜기" : "마이크 끄기"}
      >
        {isMuted ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        <span className={tooltipClass}>
          {isMuted ? "마이크 켜기" : "마이크 끄기"}
        </span>
      </button>

      {/* Video Toggle */}
      {showVideo && (
        <button
          onClick={onToggleVideo}
          className={`${baseButtonClass} ${!isVideoOn
              ? buttonVariants[variant].danger
              : buttonVariants[variant].normal
            }`}
          aria-label={isVideoOn ? "비디오 끄기" : "비디오 켜기"}
        >
          {isVideoOn ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
          <span className={tooltipClass}>
            {isVideoOn ? "비디오 끄기" : "비디오 켜기"}
          </span>
        </button>
      )}

      {/* Screen Share Toggle */}
      {showScreenShare && (
        <button
          onClick={onToggleScreenShare}
          className={`${baseButtonClass} ${isScreenSharing
              ? buttonVariants[variant].active
              : buttonVariants[variant].normal
            }`}
          aria-label={isScreenSharing ? "화면 공유 중지" : "화면 공유"}
        >
          {isScreenSharing ? (
            <MonitorOff className="w-6 h-6" />
          ) : (
            <Monitor className="w-6 h-6" />
          )}
          <span className={tooltipClass}>
            {isScreenSharing ? "화면 공유 중지" : "화면 공유"}
          </span>
        </button>
      )}

      {/* Language Toggle */}
      {showLanguageToggle && (
        <button
          onClick={onToggleLanguage}
          className={`${baseButtonClass} ${buttonVariants[variant].normal}`}
          aria-label="언어 전환"
        >
          <Globe className="w-6 h-6" />
          <span className={`${tooltipClass} text-center`}>
            언어 전환<br />
            {currentLanguage === 'en' ? 'EN → KO' : 'KO → EN'}
          </span>
        </button>
      )}

      {/* Participants */}
      {showParticipants && (
        <button
          onClick={onToggleParticipants}
          className={`${baseButtonClass} ${buttonVariants[variant].normal}`}
          aria-label="참가자 보기"
        >
          <div className="relative">
            <Users className="w-6 h-6" />
            {participantCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#00C471] text-white text-xs 
                rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {participantCount}
              </span>
            )}
          </div>
          <span className={tooltipClass}>
            참가자 ({participantCount})
          </span>
        </button>
      )}

      {/* Fullscreen */}
      {showFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className={`${baseButtonClass} ${buttonVariants[variant].normal}`}
          aria-label="전체 화면"
        >
          <Maximize className="w-6 h-6" />
          <span className={tooltipClass}>
            전체 화면
          </span>
        </button>
      )}

      {/* Settings */}
      {showSettings && (
        <button
          onClick={onOpenSettings}
          className={`${baseButtonClass} ${buttonVariants[variant].normal}`}
          aria-label="설정"
        >
          <Settings className="w-6 h-6" />
          <span className={tooltipClass}>
            설정
          </span>
        </button>
      )}

      {/* Divider */}
      <div className={`w-px h-10 ${variant === 'dark' ? 'bg-[var(--black-400)]' : 'bg-[var(--black-50)]'
        } mx-2`} />

      {/* End Call */}
      <button
        onClick={onEndCall}
        className={`${baseButtonClass} ${buttonVariants[variant].danger} px-6`}
        aria-label="통화 종료"
      >
        <PhoneOff className="w-6 h-6" />
        <span className={tooltipClass}>
          통화 종료
        </span>
      </button>
    </div>
  );
}