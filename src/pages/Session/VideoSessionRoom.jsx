import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoControls from '../../components/VideoControls';
import LiveTranscription from '../../components/LiveTranscription';
import SubtitleDisplay, { SubtitleController } from '../../components/SubtitleDisplay';
import RealtimeSubtitlePanel from '../../components/RealtimeSubtitlePanel';
import TranslatedSubtitles from '../../components/TranslatedSubtitles';
import { Loader2, Signal, SignalZero, Users, Maximize2, Minimize2, Monitor } from 'lucide-react';
import { webrtcManager } from '../../services/webrtc';
import { webrtcAPI } from '../../api/webrtc';
import { log } from '../../utils/logger';

export default function VideoSessionRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [connectionState, setConnectionState] = useState('connecting'); // connecting, connected, failed, disconnected
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [signalStrength, setSignalStrength] = useState(3); // 0-3
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isPipMode, setIsPipMode] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);

  // 실시간 자막 상태
  const [isSubtitleEnabled, setIsSubtitleEnabled] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [subtitlePosition, setSubtitlePosition] = useState('bottom');
  const [subtitleLanguage, setSubtitleLanguage] = useState('en');
  const [showOriginalSubtitle, setShowOriginalSubtitle] = useState(false);
  const [enableTranslation, setEnableTranslation] = useState(true);

  // Partner info (로드된 세션 데이터에서 가져옴)
  const [partnerInfo, setPartnerInfo] = useState(null);

  // WebRTC refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null); // For primary remote participant
  const remoteVideosRef = useRef(new Map()); // Support multiple participants
  const durationIntervalRef = useRef(null);
  const statsIntervalRef = useRef(null);

  // WebRTC state
  const [participants, setParticipants] = useState(new Map());
  const [connectionStats, setConnectionStats] = useState({});
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    // Check if Picture-in-Picture API is supported
    setPipSupported('pictureInPictureEnabled' in document);

    initializeCall();
    loadRoomInfo();

    return () => {
      cleanup();
    };
  }, [roomId]);

  useEffect(() => {
    if (connectionState === 'connected') {
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      // Clear timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [connectionState]);

  const initializeCall = async () => {
    try {
      setConnectionState('connecting');
      log.info('화상 세션 초기화 시작', { roomId }, 'VIDEO_SESSION');

      // Setup WebRTC manager callbacks
      setupWebRTCCallbacks();

      // Initialize media with video constraints
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      // Initialize media and connect to room
      await webrtcManager.initializeMedia(constraints);
      
      const userId = localStorage.getItem('userId') || 'guest-' + Date.now();
      const userName = localStorage.getItem('userName') || 'Anonymous';
      
      await webrtcManager.connect(roomId, { userId, userName }, {
        autoReconnect: true,
        connectionTimeout: 15000
      });

    } catch (error) {
      log.error('화상 세션 초기화 실패', error, 'VIDEO_SESSION');
      setConnectionState('failed');
    }
  };

  // 파트너 정보 로드
  const loadRoomInfo = async () => {
    try {
      const info = await webrtcAPI.getRoomInfo(roomId);
      if (info) {
        const metadata = info.metadata || {};
        const currentUserId = localStorage.getItem('userId');
        const remoteParticipant = (info.participants || []).find((participant) => participant.id !== currentUserId);

        setPartnerInfo({
          name: metadata.partnerName || remoteParticipant?.name || 'Partner',
          avatar: metadata.partnerAvatar || '/assets/basicProfilePic.png',
          level: metadata.partnerLevel || 'Unknown',
          nativeLanguage: metadata.partnerNativeLanguage || 'Unknown',
          learningLanguage: metadata.partnerLearningLanguage || 'Unknown'
        });
      }
    } catch (error) {
      log.warn('룸 정보 로드 실패', error, 'VIDEO_SESSION');
    }
  };

  // Setup WebRTC manager callbacks
  const setupWebRTCCallbacks = () => {
    // Local stream callback
    webrtcManager.on('onLocalStream', (stream) => {
      log.info('로컬 스트림 수신', null, 'VIDEO_SESSION');
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });

    // Remote stream callback
    webrtcManager.on('onRemoteStream', (userId, stream) => {
      log.info('원격 스트림 수신', { userId }, 'VIDEO_SESSION');
      
      // Set first remote stream for subtitles
      if (remoteVideosRef.current.size === 0) {
        setRemoteStream(stream);
      }
      
      // Create or update video element for remote participant
      let videoElement = remoteVideosRef.current.get(userId);
      if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.id = `remote-video-${userId}`;
        
        // For now, use the single remote video ref for the first participant
        // In the future, this can be expanded to support multiple video elements
        if (remoteVideosRef.current.size === 0 && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        
        remoteVideosRef.current.set(userId, videoElement);
      }
      
      videoElement.srcObject = stream;
    });

    // Remote stream removed callback
    webrtcManager.on('onRemoteStreamRemoved', (userId, stream) => {
      log.info('원격 스트림 제거', { userId }, 'VIDEO_SESSION');
      
      const videoElement = remoteVideosRef.current.get(userId);
      if (videoElement) {
        videoElement.srcObject = null;
        remoteVideosRef.current.delete(userId);
      }

      // Update participants
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.delete(userId);
        return updated;
      });
    });

    // Participant joined callback
    webrtcManager.on('onParticipantJoined', (participant) => {
      log.info('참가자 입장', participant, 'VIDEO_SESSION');
      setParticipants(prev => new Map(prev).set(participant.userId, participant));

      const currentUserId = localStorage.getItem('userId') || 'guest';
      if (participant.userId !== currentUserId) {
        setPartnerInfo((prev) => ({
          name: participant.userName || prev?.name || 'Partner',
          avatar: prev?.avatar || '/assets/basicProfilePic.png',
          level: prev?.level || 'Unknown',
          nativeLanguage: prev?.nativeLanguage || 'Unknown',
          learningLanguage: prev?.learningLanguage || 'Unknown'
        }));
      }
    });

    // Participant left callback
    webrtcManager.on('onParticipantLeft', (participant) => {
      log.info('참가자 퇴장', participant, 'VIDEO_SESSION');
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.delete(participant.userId);
        return updated;
      });

      const currentUserId = localStorage.getItem('userId') || 'guest';
      if (participant.userId !== currentUserId) {
        setPartnerInfo(null);
      }
    });

    // Connection state change callback
    webrtcManager.on('onConnectionStateChange', (state) => {
      log.info('연결 상태 변경', { state }, 'VIDEO_SESSION');
      setConnectionState(state);
      
      if (state === 'connected') {
        // Start stats and connection monitoring
        startStatsMonitoring();
        webrtcManager.startConnectionMonitoring();
      } else if (state === 'disconnected' || state === 'failed') {
        stopStatsMonitoring();
        webrtcManager.stopConnectionMonitoring();
      } else if (state === 'reconnecting') {
        // Show reconnecting state in UI
      }
    });

    // Error callback
    webrtcManager.on('onError', (message, error) => {
      log.error('WebRTC 오류', { message, error }, 'VIDEO_SESSION');
      setConnectionState('failed');
    });

    // Chat message callback
    webrtcManager.on('onChatMessage', (message) => {
      if (message.type === 'subtitle' && isSubtitleEnabled) {
        setTranscripts(prev => [...prev, {
          ...message,
          isRemote: true,
          timestamp: Date.now()
        }]);
      } else if (message.type === 'language-change') {
        setCurrentLanguage(message.language);
      }
    });
  };

  // Statistics monitoring functions
  const startStatsMonitoring = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    statsIntervalRef.current = setInterval(async () => {
      try {
        const stats = await webrtcManager.getConnectionStats();
        setConnectionStats(stats);
        
        // Update signal strength based on RTT
        let bestRtt = Infinity;
        Object.values(stats.detailedStats).forEach(peerStats => {
          if (peerStats.rtt && peerStats.rtt < bestRtt) {
            bestRtt = peerStats.rtt;
          }
        });

        if (bestRtt < Infinity) {
          if (bestRtt < 50) setSignalStrength(3);
          else if (bestRtt < 100) setSignalStrength(2);
          else if (bestRtt < 200) setSignalStrength(1);
          else setSignalStrength(0);
        }
        
      } catch (error) {
        log.error('통계 수집 실패', error, 'VIDEO_SESSION');
      }
    }, 2000); // Update stats every 2 seconds
  };

  const stopStatsMonitoring = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  };

  // Media control handlers
  const handleMicToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    webrtcManager.toggleAudio(!newMutedState);
    log.info('마이크 토글', { muted: newMutedState }, 'VIDEO_SESSION');
  };

  const handleCameraToggle = () => {
    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);
    webrtcManager.toggleVideo(newCameraState);
    log.info('카메라 토글', { enabled: newCameraState }, 'VIDEO_SESSION');
  };

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

        // Switch to screen share (webrtcManager will handle track replacement)
        await webrtcManager.switchDevice('videoinput', screenStream.getVideoTracks()[0]);
        
        // Listen for screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          log.info('화면 공유 자동 종료', null, 'VIDEO_SESSION');
        };

        setIsScreenSharing(true);
        log.info('화면 공유 시작', null, 'VIDEO_SESSION');

        // Notify participants via chat
        webrtcManager.sendChatMessage('screen-share-started');
      } else {
        // Stop screen sharing and return to camera
        setIsScreenSharing(false);
        log.info('화면 공유 중지', null, 'VIDEO_SESSION');
        
        // Notify participants
        webrtcManager.sendChatMessage('screen-share-stopped');
      }
    } catch (error) {
      log.error('화면 공유 오류', error, 'VIDEO_SESSION');
    }
  };

  const handlePictureInPicture = async () => {
    if (!pipSupported) return;

    try {
      if (!isPipMode && remoteVideoRef.current) {
        await remoteVideoRef.current.requestPictureInPicture();
        setIsPipMode(true);
      } else if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipMode(false);
      }
    } catch (error) {
      console.error('Failed to toggle PiP:', error);
    }
  };

  const handleEndCall = async () => {
    log.info('화상 통화 종료', null, 'VIDEO_SESSION');
    await cleanup();
    navigate('/sessions');
  };

  const handleLanguageToggle = () => {
    const newLang = currentLanguage === 'en' ? 'ko' : 'en';
    setCurrentLanguage(newLang);
    
    // Send language change to participants
    webrtcManager.sendChatMessage(JSON.stringify({
      type: 'language-change',
      language: newLang
    }));
    
    log.info('언어 전환', { from: currentLanguage, to: newLang }, 'VIDEO_SESSION');
  };

  // 실시간 전사 핸들러
  const handleTranscript = useCallback((transcript) => {
    const timestampedTranscript = {
      ...transcript,
      timestamp: Date.now()
    };
    
    setTranscripts(prev => [...prev, timestampedTranscript]);

    // 파트너에게 자막 전송
    webrtcManager.sendChatMessage(JSON.stringify({
      type: 'subtitle',
      subtitle: timestampedTranscript
    }));
  }, []);

  // 자막 토글
  const toggleSubtitle = () => {
    setIsSubtitleEnabled(prev => !prev);
    if (!isSubtitleEnabled) {
      setIsTranscribing(true);
    } else {
      setIsTranscribing(false);
    }
  };

  // 타겟 언어 목록 생성 (현재 언어와 자막 언어 포함)
  const getTargetLanguages = useCallback(() => {
    const languages = new Set([subtitleLanguage]);

    // 파트너 언어 추가
    if (partnerInfo && partnerInfo.nativeLanguage) {
      const langCode = partnerInfo.nativeLanguage.toLowerCase().substring(0, 2);
      languages.add(langCode);
    }

    // 현재 대화 언어 추가
    languages.add(currentLanguage);

    return Array.from(languages);
  }, [subtitleLanguage, currentLanguage, partnerInfo]);

  const cleanup = async () => {
    log.info('화상 세션 정리 시작', null, 'VIDEO_SESSION');

    // Exit PiP if active
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      log.warn('PiP 종료 실패', error, 'VIDEO_SESSION');
    }

    // Stop monitoring intervals
    stopStatsMonitoring();
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // Clean up remote video elements
    remoteVideosRef.current.forEach((videoElement) => {
      if (videoElement.parentNode) {
        videoElement.parentNode.removeChild(videoElement);
      }
    });
    remoteVideosRef.current.clear();

    // Disconnect WebRTC manager
    try {
      await webrtcManager.disconnect();
      log.info('WebRTC 연결 정리 완료', null, 'VIDEO_SESSION');
    } catch (error) {
      log.error('WebRTC 연결 정리 실패', error, 'VIDEO_SESSION');
    }

    setPartnerInfo(null);

    // Clear callbacks
    webrtcManager.off('onLocalStream');
    webrtcManager.off('onRemoteStream');
    webrtcManager.off('onRemoteStreamRemoved');
    webrtcManager.off('onParticipantJoined');
    webrtcManager.off('onParticipantLeft');
    webrtcManager.off('onConnectionStateChange');
    webrtcManager.off('onError');
    webrtcManager.off('onChatMessage');
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSignalIcon = () => {
    if (signalStrength === 0) return <SignalZero className="w-5 h-5 text-[var(--red)]" />;
    return <Signal className={`w-5 h-5 ${signalStrength === 3 ? 'text-[var(--green-500)]' :
      signalStrength === 2 ? 'text-[var(--warning-yellow)]' :
        'text-[var(--blue)]'
      }`} />;
  };

  return (
    <div className="min-h-screen bg-[var(--black-600)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--black-400)] border-b border-[var(--black-400)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[20px] font-bold text-white">화상 통화</h1>
            <div className="flex items-center gap-2 text-[var(--black-200)]">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {participants.size + 1}명 참가 중
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {getSignalIcon()}
              <span className="text-sm text-[var(--black-200)]">
                {connectionState === 'connected' ? '연결됨' :
                  connectionState === 'connecting' ? '연결 중...' :
                    connectionState === 'reconnecting' ? '복구 중...' :
                      connectionState === 'failed' ? '연결 실패' :
                        '연결 끊김'}
              </span>
            </div>

            {/* Screen Share Indicator */}
            {isScreenSharing && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(66,133,244,0.2)] rounded-full">
                <Monitor className="w-4 h-4 text-[var(--blue)]" />
                <span className="text-sm text-[var(--blue)]">화면 공유 중</span>
              </div>
            )}

            {/* Duration */}
            {connectionState === 'connected' && (
              <div className="text-white font-mono">
                {formatDuration(duration)}
              </div>
            )}

            {/* PiP Button */}
            {pipSupported && connectionState === 'connected' && (
              <button
                onClick={handlePictureInPicture}
                className="p-2 rounded-lg hover:bg-[var(--black-400)] transition-colors"
                title={isPipMode ? "PiP 모드 종료" : "PiP 모드"}
              >
                {isPipMode ? (
                  <Minimize2 className="w-5 h-5 text-white" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        {connectionState === 'connecting' ? (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[var(--green-500)] animate-spin mx-auto mb-4" />
            <p className="text-white text-lg mb-2">연결 중...</p>
            <p className="text-[var(--black-200)] text-sm">잠시만 기다려주세요</p>
          </div>
        ) : connectionState === 'reconnecting' ? (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[var(--warning-yellow)] animate-spin mx-auto mb-4" />
            <p className="text-white text-lg mb-2">연결 복구 중...</p>
            <p className="text-[var(--black-200)] text-sm">네트워크 연결을 복구하고 있습니다</p>
          </div>
        ) : connectionState === 'failed' ? (
          <div className="text-center">
            <SignalZero className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">연결 실패</p>
            <p className="text-[var(--black-200)] text-sm mb-4">네트워크 연결을 확인해주세요</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[var(--green-500)] text-white rounded-lg hover:bg-[var(--green-600)]"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
            {/* Remote Video (Partner) */}
            <div className="relative bg-[var(--black-400)] rounded-[20px] overflow-hidden aspect-video">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Partner Info Overlay */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {partnerInfo ? (
                    <>
                      <img
                        src={partnerInfo.avatar}
                        alt={partnerInfo.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-white font-medium">{partnerInfo.name}</p>
                        <p className="text-[var(--black-200)] text-sm">Level {partnerInfo.level}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
                      <div>
                        <p className="text-white font-medium">Loading...</p>
                        <p className="text-[var(--black-200)] text-sm">Partner info</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Remote user indicators */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {/* Add remote user status indicators here */}
              </div>
            </div>

            {/* Local Video (Self) */}
            <div className="relative bg-[var(--black-400)] rounded-[20px] overflow-hidden aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
              />

              {!isCameraOn && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-[var(--black-400)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-[var(--black-200)] text-3xl">👤</span>
                    </div>
                    <p className="text-[var(--black-200)]">카메라가 꺼져있습니다</p>
                  </div>
                </div>
              )}

              {/* Local user indicators */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {isMuted && (
                  <div className="bg-[rgba(234,67,53,0.8)] px-3 py-1 rounded-full">
                    <span className="text-white text-sm">음소거</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 실시간 번역 자막 오버레이 */}
      {isSubtitleEnabled && connectionState === 'connected' && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <TranslatedSubtitles
            localStream={localStream}
            remoteStream={remoteStream}
            sourceLanguage="auto"
            defaultTargetLanguage={currentLanguage}
            showOriginal={showOriginalSubtitle}
            showTranslation={enableTranslation}
            position={subtitlePosition}
          />
        </div>
      )}

      {/* 실시간 자막 패널 */}
      <div className="fixed top-4 right-4 w-96 z-50 pointer-events-auto">
        <RealtimeSubtitlePanel
          localStream={localStream}
          remoteStream={remoteStream}
          onTranscriptUpdate={(transcript) => {
            setTranscripts(prev => [...prev, transcript]);
          }}
        />
      </div>

      {/* Controls */}
      <div className="p-6 flex flex-col items-center gap-4">

        <VideoControls
          isMuted={isMuted}
          isVideoOn={isCameraOn}
          isScreenSharing={isScreenSharing}
          currentLanguage={currentLanguage}
          onToggleMute={handleMicToggle}
          onToggleVideo={handleCameraToggle}
          onToggleScreenShare={handleScreenShare}
          onToggleLanguage={handleLanguageToggle}
          onEndCall={handleEndCall}
          showVideo={true}
          showScreenShare={true}
          showLanguageToggle={true}
          showSettings={false}
          showFullscreen={false}
          showParticipants={false}
          className={connectionState !== 'connected' ? 'opacity-50 pointer-events-none' : ''}
          variant="dark"
        />
      </div>
    </div>
  );
}
