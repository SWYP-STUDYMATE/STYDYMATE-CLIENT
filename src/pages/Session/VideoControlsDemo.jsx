import { useState } from 'react';
import VideoControls from '../../components/VideoControls';
import { useNavigate } from 'react-router-dom';

export default function VideoControlsDemo() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [participantsVisible, setParticipantsVisible] = useState(false);
  const [participantCount, setParticipantCount] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [variant, setVariant] = useState('dark');
  const [events, setEvents] = useState([]);

  const addEvent = (event) => {
    setEvents(prev => [{
      time: new Date().toLocaleTimeString(),
      event
    }, ...prev.slice(0, 9)]);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    addEvent(`Mic ${isMuted ? 'unmuted' : 'muted'}`);
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    addEvent(`Video ${isVideoOn ? 'turned off' : 'turned on'}`);
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    addEvent(`Screen share ${isScreenSharing ? 'stopped' : 'started'}`);
  };

  const handleToggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ko' : 'en';
    setCurrentLanguage(newLang);
    addEvent(`Language changed to ${newLang.toUpperCase()}`);
  };

  const handleEndCall = () => {
    addEvent('Call ended');
    setTimeout(() => {
      navigate('/main');
    }, 1000);
  };

  const handleOpenSettings = () => {
    addEvent('Settings opened');
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    addEvent(`Fullscreen ${isFullscreen ? 'exited' : 'entered'}`);
  };

  const handleToggleParticipants = () => {
    setParticipantsVisible(!participantsVisible);
    addEvent(`Participants panel ${participantsVisible ? 'hidden' : 'shown'}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-[#111111] mb-2">VideoControls Component Demo</h1>
          <p className="text-[16px] text-[#666666]">Test and interact with all VideoControls features</p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-[20px] shadow-sm p-6 mb-8">
          <h2 className="text-[20px] font-bold text-[#111111] mb-4">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Theme Variant */}
            <div>
              <label className="text-[14px] text-[#666666] block mb-2">Theme Variant</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setVariant('dark')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    variant === 'dark' 
                      ? 'bg-[#111111] text-white' 
                      : 'bg-[#F1F3F5] text-[#111111] hover:bg-[#E7E7E7]'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setVariant('light')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    variant === 'light' 
                      ? 'bg-[#111111] text-white' 
                      : 'bg-[#F1F3F5] text-[#111111] hover:bg-[#E7E7E7]'
                  }`}
                >
                  Light
                </button>
              </div>
            </div>

            {/* Participant Count */}
            <div>
              <label className="text-[14px] text-[#666666] block mb-2">Participant Count</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setParticipantCount(Math.max(0, participantCount - 1))}
                  className="w-8 h-8 bg-[#F1F3F5] rounded-lg flex items-center justify-center hover:bg-[#E7E7E7]"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{participantCount}</span>
                <button
                  onClick={() => setParticipantCount(participantCount + 1)}
                  className="w-8 h-8 bg-[#F1F3F5] rounded-lg flex items-center justify-center hover:bg-[#E7E7E7]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Current Language */}
            <div>
              <label className="text-[14px] text-[#666666] block mb-2">Current Language</label>
              <div className="bg-[#F1F3F5] rounded-lg px-4 py-2 text-center font-medium">
                {currentLanguage === 'en' ? 'English' : '한국어'}
              </div>
            </div>
          </div>
        </div>

        {/* State Display */}
        <div className="bg-white rounded-[20px] shadow-sm p-6 mb-8">
          <h2 className="text-[20px] font-bold text-[#111111] mb-4">Current State</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#F8F9FA] rounded-lg">
              <div className="text-[14px] text-[#666666] mb-1">Microphone</div>
              <div className={`text-[16px] font-medium ${isMuted ? 'text-red-500' : 'text-green-500'}`}>
                {isMuted ? 'Muted' : 'Active'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-[#F8F9FA] rounded-lg">
              <div className="text-[14px] text-[#666666] mb-1">Camera</div>
              <div className={`text-[16px] font-medium ${isVideoOn ? 'text-green-500' : 'text-red-500'}`}>
                {isVideoOn ? 'On' : 'Off'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-[#F8F9FA] rounded-lg">
              <div className="text-[14px] text-[#666666] mb-1">Screen Share</div>
              <div className={`text-[16px] font-medium ${isScreenSharing ? 'text-blue-500' : 'text-gray-400'}`}>
                {isScreenSharing ? 'Sharing' : 'Not Sharing'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-[#F8F9FA] rounded-lg">
              <div className="text-[14px] text-[#666666] mb-1">Language</div>
              <div className="text-[16px] font-medium text-[#111111]">
                {currentLanguage.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Area */}
        <div className="bg-white rounded-[20px] shadow-sm p-8 mb-8">
          <h2 className="text-[20px] font-bold text-[#111111] mb-6 text-center">VideoControls Component</h2>
          
          {/* Controls Container */}
          <div className={`flex justify-center items-center py-12 rounded-[20px] ${
            variant === 'dark' ? 'bg-[#1A1A1A]' : 'bg-[#F8F9FA]'
          }`}>
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
              onToggleParticipants={handleToggleParticipants}
              showVideo={true}
              showScreenShare={true}
              showLanguageToggle={true}
              showSettings={true}
              showFullscreen={true}
              showParticipants={true}
              participantCount={participantCount}
              variant={variant}
            />
          </div>
          
          {/* Minimal Version */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-[16px] font-medium text-[#111111] mb-4 text-center">
              Minimal Version (Audio-only)
            </h3>
            <div className={`flex justify-center items-center py-8 rounded-[20px] ${
              variant === 'dark' ? 'bg-[#1A1A1A]' : 'bg-[#F8F9FA]'
            }`}>
              <VideoControls
                isMuted={isMuted}
                currentLanguage={currentLanguage}
                onToggleMute={handleToggleMute}
                onToggleLanguage={handleToggleLanguage}
                onEndCall={handleEndCall}
                showVideo={false}
                showScreenShare={false}
                showSettings={false}
                showFullscreen={false}
                showParticipants={false}
                variant={variant}
              />
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <h2 className="text-[20px] font-bold text-[#111111] mb-4">Event Log</h2>
          
          <div className="bg-[#F8F9FA] rounded-lg p-4 h-48 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-[#929292] text-center">No events yet. Try interacting with the controls above.</p>
            ) : (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 text-[14px]">
                    <span className="text-[#666666] font-mono">{event.time}</span>
                    <span className="text-[#111111]">{event.event}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/main')}
            className="px-6 py-3 bg-[#111111] text-white rounded-lg hover:bg-[#222222] transition-colors"
          >
            Back to Main
          </button>
        </div>
      </div>
    </div>
  );
}