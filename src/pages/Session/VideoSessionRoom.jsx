import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoControls from '../../components/VideoControls';
import LiveTranscription from '../../components/LiveTranscription';
import SubtitleDisplay, { SubtitleController } from '../../components/SubtitleDisplay';
import { Loader2, Signal, SignalZero, Users, Maximize2, Minimize2, Monitor } from 'lucide-react';

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

  // Partner info (mock data - replace with actual data from API)
  const [partnerInfo, setPartnerInfo] = useState({
    name: 'John Doe',
    avatar: '/assets/basicProfilePic.png',
    level: 'B2',
    nativeLanguage: 'English',
    learningLanguage: 'Korean'
  });

  // WebRTC refs
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const wsRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    // Check if Picture-in-Picture API is supported
    setPipSupported('pictureInPictureEnabled' in document);

    initializeCall();

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
      // Get user media (video and audio)
      const stream = await navigator.mediaDevices.getUserMedia({
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
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Setup WebSocket connection for signaling
      setupWebSocket();

      // Create peer connection
      setupPeerConnection();

    } catch (error) {
      console.error('Failed to initialize call:', error);
      setConnectionState('failed');
    }
  };

  const setupWebSocket = () => {
    // Replace with actual WebSocket URL
    wsRef.current = new WebSocket(`wss://your-signaling-server.com/room/${roomId}`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      wsRef.current.send(JSON.stringify({ type: 'join', roomId }));
    };

    wsRef.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'offer':
          await handleOffer(message.offer);
          break;
        case 'answer':
          await handleAnswer(message.answer);
          break;
        case 'ice-candidate':
          await handleIceCandidate(message.candidate);
          break;
        case 'user-joined':
          // Partner joined, create offer
          await createOffer();
          break;
        case 'user-left':
          handleUserLeft();
          break;
        case 'screen-share-started':
          handleRemoteScreenShare(true);
          break;
        case 'screen-share-stopped':
          handleRemoteScreenShare(false);
          break;
        default:
          break;
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionState('failed');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
      setConnectionState('disconnected');
    };
  };

  const setupPeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection(iceServers);

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      console.log('Received remote track');
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setConnectionState('connected');
    };

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate
        }));
      }
    };

    // Monitor connection state
    peerConnectionRef.current.onconnectionstatechange = () => {
      const state = peerConnectionRef.current.connectionState;
      console.log('Connection state:', state);

      if (state === 'connected') {
        setConnectionState('connected');
      } else if (state === 'failed' || state === 'disconnected') {
        setConnectionState('disconnected');
      }
    };

    // Monitor ICE connection state for signal strength
    peerConnectionRef.current.oniceconnectionstatechange = () => {
      const state = peerConnectionRef.current.iceConnectionState;

      if (state === 'connected' || state === 'completed') {
        // Get connection stats for signal strength
        peerConnectionRef.current.getStats().then(stats => {
          stats.forEach(report => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              // Mock signal strength based on RTT
              const rtt = report.currentRoundTripTime * 1000; // Convert to ms
              if (rtt < 50) setSignalStrength(3);
              else if (rtt < 100) setSignalStrength(2);
              else if (rtt < 200) setSignalStrength(1);
              else setSignalStrength(0);
            }
          });
        });
      }
    };
  };

  const createOffer = async () => {
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'offer',
          offer: offer
        }));
      }
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  };

  const handleOffer = async (offer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'answer',
          answer: answer
        }));
      }
    } catch (error) {
      console.error('Failed to handle offer:', error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  };

  const handleIceCandidate = async (candidate) => {
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  };

  const handleUserLeft = () => {
    setConnectionState('disconnected');
    cleanup();
  };

  const handleRemoteScreenShare = (isSharing) => {
    // Handle when remote user starts/stops screen sharing
    console.log('Remote screen share:', isSharing);
  };

  const handleMicToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
    }
  };

  const handleCameraToggle = () => {
    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = newCameraState;
      });
    }
  };

  const handleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

        screenStreamRef.current = screenStream;

        // Replace video track with screen share
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(
          s => s.track && s.track.kind === 'video'
        );

        if (sender) {
          sender.replaceTrack(screenTrack);
        }

        // Listen for screen share end
        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);

        // Notify remote user
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'screen-share-started'
          }));
        }
      } catch (error) {
        console.error('Failed to share screen:', error);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());

      // Replace screen share with camera
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(
        s => s.track && s.track.kind === 'video'
      );

      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }

      screenStreamRef.current = null;
      setIsScreenSharing(false);

      // Notify remote user
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'screen-share-stopped'
        }));
      }
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

  const handleEndCall = () => {
    cleanup();
    navigate('/sessions');
  };

  const handleLanguageToggle = () => {
    const newLang = currentLanguage === 'en' ? 'ko' : 'en';
    setCurrentLanguage(newLang);
    // Send language change to partner via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'language-change',
        language: newLang
      }));
    }
  };

  const cleanup = () => {
    // Exit PiP if active
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }

    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Clear interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
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
    if (signalStrength === 0) return <SignalZero className="w-5 h-5 text-red-500" />;
    return <Signal className={`w-5 h-5 ${signalStrength === 3 ? 'text-green-500' :
        signalStrength === 2 ? 'text-yellow-500' :
          'text-orange-500'
      }`} />;
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
      {/* Header */}
      <div className="bg-[#2A2A2A] border-b border-[#3A3A3A] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[20px] font-bold text-white">화상 통화</h1>
            <div className="flex items-center gap-2 text-[#929292]">
              <Users className="w-4 h-4" />
              <span className="text-sm">1:1 세션</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {getSignalIcon()}
              <span className="text-sm text-[#929292]">
                {connectionState === 'connected' ? '연결됨' :
                  connectionState === 'connecting' ? '연결 중...' :
                    '연결 끊김'}
              </span>
            </div>

            {/* Screen Share Indicator */}
            {isScreenSharing && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full">
                <Monitor className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500">화면 공유 중</span>
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
                className="p-2 rounded-lg hover:bg-[#3A3A3A] transition-colors"
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
            <Loader2 className="w-16 h-16 text-[#00C471] animate-spin mx-auto mb-4" />
            <p className="text-white text-lg mb-2">연결 중...</p>
            <p className="text-[#929292] text-sm">잠시만 기다려주세요</p>
          </div>
        ) : connectionState === 'failed' ? (
          <div className="text-center">
            <SignalZero className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">연결 실패</p>
            <p className="text-[#929292] text-sm mb-4">네트워크 연결을 확인해주세요</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#00C471] text-white rounded-lg hover:bg-[#00B267]"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
            {/* Remote Video (Partner) */}
            <div className="relative bg-[#2A2A2A] rounded-[20px] overflow-hidden aspect-video">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Partner Info Overlay */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={partnerInfo.avatar}
                    alt={partnerInfo.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{partnerInfo.name}</p>
                    <p className="text-[#929292] text-sm">Level {partnerInfo.level}</p>
                  </div>
                </div>
              </div>

              {/* Remote user indicators */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {/* Add remote user status indicators here */}
              </div>
            </div>

            {/* Local Video (Self) */}
            <div className="relative bg-[#2A2A2A] rounded-[20px] overflow-hidden aspect-video">
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
                    <div className="w-24 h-24 bg-[#3A3A3A] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-[#929292] text-3xl">👤</span>
                    </div>
                    <p className="text-[#929292]">카메라가 꺼져있습니다</p>
                  </div>
                </div>
              )}

              {/* Local user indicators */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {isMuted && (
                  <div className="bg-red-500/80 px-3 py-1 rounded-full">
                    <span className="text-white text-sm">음소거</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 flex justify-center">
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