import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoControls from '../../components/VideoControls';
import { Loader2, Signal, SignalZero, Users } from 'lucide-react';

export default function AudioSessionRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [connectionState, setConnectionState] = useState('connecting'); // connecting, connected, failed, disconnected
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [signalStrength, setSignalStrength] = useState(3); // 0-3
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
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
  const peerConnectionRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
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
      // Get user media (audio only)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      localStreamRef.current = stream;
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
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
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
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

  const handleMicToggle = (state) => {
    setIsMuted(!state);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = state;
      });
    }
  };

  const handleEndCall = () => {
    cleanup();
    navigate('/sessions');
  };

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    // Send language change to partner via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'language-change',
        language: lang
      }));
    }
  };

  const cleanup = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
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
    return <Signal className={`w-5 h-5 ${
      signalStrength === 3 ? 'text-green-500' : 
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
            <h1 className="text-[20px] font-bold text-white">음성 통화</h1>
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
            
            {/* Duration */}
            {connectionState === 'connected' && (
              <div className="text-white font-mono">
                {formatDuration(duration)}
              </div>
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
          <div className="flex flex-col items-center gap-8">
            {/* Partner Profile */}
            <div className="bg-[#2A2A2A] rounded-[20px] p-8 flex flex-col items-center">
              <div className="relative mb-6">
                <img
                  src={partnerInfo.avatar}
                  alt={partnerInfo.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
                {connectionState === 'connected' && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#00C471] rounded-full border-2 border-[#2A2A2A]" />
                )}
              </div>
              
              <h2 className="text-[24px] font-bold text-white mb-2">
                {partnerInfo.name}
              </h2>
              
              <div className="flex items-center gap-4 text-[#929292] text-sm">
                <span className="px-3 py-1 bg-[#3A3A3A] rounded-full">
                  Level {partnerInfo.level}
                </span>
                <span>{partnerInfo.nativeLanguage} → {partnerInfo.learningLanguage}</span>
              </div>
              
              {isMuted && (
                <div className="mt-4 px-4 py-2 bg-red-500/20 rounded-lg">
                  <p className="text-red-500 text-sm">마이크가 음소거되었습니다</p>
                </div>
              )}
            </div>

            {/* Audio Visualization */}
            {connectionState === 'connected' && (
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#00C471] rounded-full animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 30}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden Audio Elements */}
      <audio ref={localAudioRef} muted autoPlay />
      <audio ref={remoteAudioRef} autoPlay />

      {/* Controls */}
      <div className="p-6 flex justify-center">
        <VideoControls
          onMicToggle={handleMicToggle}
          onEndCall={handleEndCall}
          onLanguageChange={handleLanguageChange}
          initialMicState={true}
          showLanguageButton={true}
          showCameraToggle={false}
          showScreenShareButton={false}
          showSettingsButton={false}
          showParticipantsButton={false}
          showChatButton={false}
          showRaiseHandButton={false}
          showMoreButton={false}
          currentLanguage={currentLanguage}
          disabled={connectionState !== 'connected'}
        />
      </div>
    </div>
  );
}