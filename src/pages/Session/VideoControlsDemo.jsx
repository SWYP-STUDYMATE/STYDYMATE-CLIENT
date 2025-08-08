import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoControls from '../../components/VideoControls';

export default function VideoControlsDemo() {
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const [unreadChatCount, setUnreadChatCount] = useState(3);

  const handleMicToggle = () => {
    setIsMicOn(!isMicOn);
    console.log('Mic toggled:', !isMicOn);
  };

  const handleCameraToggle = () => {
    setIsCameraOn(!isCameraOn);
    console.log('Camera toggled:', !isCameraOn);
  };

  const handleEndCall = () => {
    console.log('Call ended');
    navigate('/main');
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    console.log('Screen share toggled:', !isScreenSharing);
  };

  const handleLanguageToggle = () => {
    setCurrentLanguage(currentLanguage === 'EN' ? 'KO' : 'EN');
    console.log('Language toggled to:', currentLanguage === 'EN' ? 'KO' : 'EN');
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    console.log('Fullscreen toggled:', !isFullscreen);
  };

  const handleParticipantsClick = () => {
    console.log('Participants clicked');
  };

  const handleChatClick = () => {
    setUnreadChatCount(0);
    console.log('Chat clicked');
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      {/* Header */}
      <div className="p-6 bg-black/50">
        <button 
          onClick={() => navigate(-1)}
          className="text-white hover:text-gray-300 transition-colors"
        >
          ← 뒤로가기
        </button>
      </div>

      {/* Demo Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-white text-3xl font-bold mb-12">VideoControls 컴포넌트 데모</h1>

        {/* Video Call Controls Demo */}
        <div className="space-y-12 w-full max-w-4xl">
          <div>
            <h2 className="text-white text-xl mb-4">비디오 통화 컨트롤 (2인)</h2>
            <div className="bg-gray-800 p-8 rounded-lg">
              <VideoControls
                isAudioOnly={false}
                onMicToggle={handleMicToggle}
                onCameraToggle={handleCameraToggle}
                onEndCall={handleEndCall}
                onScreenShare={handleScreenShare}
                onLanguageToggle={handleLanguageToggle}
                onSettingsClick={handleSettingsClick}
                onFullscreenToggle={handleFullscreenToggle}
                onChatClick={handleChatClick}
                isMicOn={isMicOn}
                isCameraOn={isCameraOn}
                isScreenSharing={isScreenSharing}
                isFullscreen={isFullscreen}
                currentLanguage={currentLanguage}
                participantCount={2}
                unreadChatCount={unreadChatCount}
              />
            </div>
          </div>

          <div>
            <h2 className="text-white text-xl mb-4">비디오 통화 컨트롤 (그룹 - 4인)</h2>
            <div className="bg-gray-800 p-8 rounded-lg">
              <VideoControls
                isAudioOnly={false}
                onMicToggle={handleMicToggle}
                onCameraToggle={handleCameraToggle}
                onEndCall={handleEndCall}
                onScreenShare={handleScreenShare}
                onLanguageToggle={handleLanguageToggle}
                onSettingsClick={handleSettingsClick}
                onFullscreenToggle={handleFullscreenToggle}
                onParticipantsClick={handleParticipantsClick}
                onChatClick={handleChatClick}
                isMicOn={isMicOn}
                isCameraOn={isCameraOn}
                isScreenSharing={isScreenSharing}
                isFullscreen={isFullscreen}
                currentLanguage={currentLanguage}
                participantCount={4}
                unreadChatCount={unreadChatCount}
              />
            </div>
          </div>

          <div>
            <h2 className="text-white text-xl mb-4">오디오 통화 컨트롤</h2>
            <div className="bg-gray-800 p-8 rounded-lg">
              <VideoControls
                isAudioOnly={true}
                onMicToggle={handleMicToggle}
                onEndCall={handleEndCall}
                onLanguageToggle={handleLanguageToggle}
                onSettingsClick={handleSettingsClick}
                onChatClick={handleChatClick}
                isMicOn={isMicOn}
                currentLanguage={currentLanguage}
                participantCount={2}
                unreadChatCount={0}
              />
            </div>
          </div>

          <div>
            <h2 className="text-white text-xl mb-4">상태 예제</h2>
            <div className="bg-gray-800 p-8 rounded-lg space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-white">마이크 끔 상태:</span>
                <VideoControls
                  isAudioOnly={false}
                  onMicToggle={handleMicToggle}
                  onCameraToggle={handleCameraToggle}
                  onEndCall={handleEndCall}
                  onScreenShare={handleScreenShare}
                  onLanguageToggle={handleLanguageToggle}
                  onSettingsClick={handleSettingsClick}
                  onFullscreenToggle={handleFullscreenToggle}
                  onChatClick={handleChatClick}
                  isMicOn={false}
                  isCameraOn={true}
                  isScreenSharing={false}
                  isFullscreen={false}
                  currentLanguage={currentLanguage}
                  participantCount={2}
                  unreadChatCount={0}
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white">카메라 끔 상태:</span>
                <VideoControls
                  isAudioOnly={false}
                  onMicToggle={handleMicToggle}
                  onCameraToggle={handleCameraToggle}
                  onEndCall={handleEndCall}
                  onScreenShare={handleScreenShare}
                  onLanguageToggle={handleLanguageToggle}
                  onSettingsClick={handleSettingsClick}
                  onFullscreenToggle={handleFullscreenToggle}
                  onChatClick={handleChatClick}
                  isMicOn={true}
                  isCameraOn={false}
                  isScreenSharing={false}
                  isFullscreen={false}
                  currentLanguage={currentLanguage}
                  participantCount={2}
                  unreadChatCount={0}
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white">화면 공유 중:</span>
                <VideoControls
                  isAudioOnly={false}
                  onMicToggle={handleMicToggle}
                  onCameraToggle={handleCameraToggle}
                  onEndCall={handleEndCall}
                  onScreenShare={handleScreenShare}
                  onLanguageToggle={handleLanguageToggle}
                  onSettingsClick={handleSettingsClick}
                  onFullscreenToggle={handleFullscreenToggle}
                  onChatClick={handleChatClick}
                  isMicOn={true}
                  isCameraOn={true}
                  isScreenSharing={true}
                  isFullscreen={false}
                  currentLanguage={currentLanguage}
                  participantCount={2}
                  unreadChatCount={0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Current State Display */}
        <div className="mt-12 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-white text-lg mb-4">현재 상태:</h3>
          <div className="grid grid-cols-2 gap-4 text-white">
            <div>마이크: {isMicOn ? '켜짐' : '꺼짐'}</div>
            <div>카메라: {isCameraOn ? '켜짐' : '꺼짐'}</div>
            <div>화면 공유: {isScreenSharing ? '공유 중' : '미공유'}</div>
            <div>전체화면: {isFullscreen ? '켜짐' : '꺼짐'}</div>
            <div>언어: {currentLanguage}</div>
            <div>읽지 않은 채팅: {unreadChatCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}