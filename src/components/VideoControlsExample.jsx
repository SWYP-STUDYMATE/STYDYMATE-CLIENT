import React, { useState } from 'react';
import VideoControls from './VideoControls';

/**
 * VideoControls Component Example Usage
 * 
 * This example demonstrates how to use the VideoControls component
 * in a video calling application.
 */
const VideoControlsExample = () => {
    // State management for demo
    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [participantCount, setParticipantCount] = useState(5);
    const [unreadMessages, setUnreadMessages] = useState(3);
    const [handRaised, setHandRaised] = useState(false);
    const [callEnded, setCallEnded] = useState(false);

    // Event handlers
    const handleMicToggle = (isOn) => {
        setMicEnabled(isOn);
        console.log('Microphone:', isOn ? 'ON' : 'OFF');
    };

    const handleCameraToggle = (isOn) => {
        setCameraEnabled(isOn);
        console.log('Camera:', isOn ? 'ON' : 'OFF');
    };

    const handleScreenShareToggle = (isSharing) => {
        setScreenSharing(isSharing);
        console.log('Screen Share:', isSharing ? 'Started' : 'Stopped');
    };

    const handleEndCall = () => {
        setCallEnded(true);
        console.log('Call ended');
        // In a real app, you would disconnect from the call here
    };

    const handleLanguageChange = (langCode) => {
        setCurrentLanguage(langCode);
        console.log('Language changed to:', langCode);
    };

    const handleSettingsClick = () => {
        console.log('Settings clicked');
        // Open settings modal/panel
    };

    const handleParticipantsClick = () => {
        console.log('Participants panel clicked');
        // Open participants panel
    };

    const handleChatClick = () => {
        console.log('Chat panel clicked');
        setUnreadMessages(0); // Mark messages as read
        // Open chat panel
    };

    const handleRaiseHand = (isRaised) => {
        setHandRaised(isRaised);
        console.log('Hand:', isRaised ? 'Raised' : 'Lowered');
    };

    const handleMoreOptionsClick = (action) => {
        console.log('More options action:', action);
        switch (action) {
            case 'speaker-stats':
                console.log('Opening speaker stats...');
                break;
            case 'mute-all':
                console.log('Muting all participants...');
                break;
            case 'record':
                console.log('Starting recording...');
                break;
            default:
                break;
        }
    };

    if (callEnded) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Call Ended</h2>
                    <button
                        onClick={() => setCallEnded(false)}
                        className="px-6 py-3 bg-[#4285F4] hover:bg-[#3374E0] rounded-lg"
                    >
                        Start New Call
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
            {/* Main Content Area - Video Grid */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="grid grid-cols-2 gap-4 max-w-4xl w-full">
                    {/* Placeholder for video streams */}
                    {[...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="aspect-video bg-[#1A1A1A] rounded-lg flex items-center justify-center"
                        >
                            <div className="text-white text-center">
                                <div className="w-24 h-24 bg-[#2A2A2A] rounded-full mx-auto mb-4" />
                                <p className="text-sm">Participant {index + 1}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls at the bottom */}
            <div className="p-4">
                <VideoControls
                    onMicToggle={handleMicToggle}
                    onCameraToggle={handleCameraToggle}
                    onEndCall={handleEndCall}
                    onScreenShareToggle={handleScreenShareToggle}
                    onLanguageChange={handleLanguageChange}
                    onSettingsClick={handleSettingsClick}
                    onParticipantsClick={handleParticipantsClick}
                    onChatClick={handleChatClick}
                    onRaiseHand={handleRaiseHand}
                    onMoreOptionsClick={handleMoreOptionsClick}
                    initialMicState={micEnabled}
                    initialCameraState={cameraEnabled}
                    initialScreenShareState={screenSharing}
                    currentLanguage={currentLanguage}
                    participantCount={participantCount}
                    unreadChatCount={unreadMessages}
                    isHandRaised={handRaised}
                    isMobile={window.innerWidth < 768}
                />
            </div>

            {/* Demo State Display */}
            <div className="absolute top-4 left-4 bg-[#1A1A1A] p-4 rounded-lg text-white text-sm">
                <h3 className="font-bold mb-2">Demo State:</h3>
                <ul className="space-y-1">
                    <li>Mic: {micEnabled ? '🟢 ON' : '🔴 OFF'}</li>
                    <li>Camera: {cameraEnabled ? '🟢 ON' : '🔴 OFF'}</li>
                    <li>Screen Share: {screenSharing ? '🟢 Active' : '⚪ Inactive'}</li>
                    <li>Language: {currentLanguage.toUpperCase()}</li>
                    <li>Participants: {participantCount}</li>
                    <li>Unread Messages: {unreadMessages}</li>
                    <li>Hand Raised: {handRaised ? '✋ Yes' : '👋 No'}</li>
                </ul>
            </div>
        </div>
    );
};

export default VideoControlsExample;