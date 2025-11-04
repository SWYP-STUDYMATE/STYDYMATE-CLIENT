import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoControls from '../../components/VideoControls';
import LiveTranscription from '../../components/LiveTranscription';
import SubtitleDisplay, { SubtitleController } from '../../components/SubtitleDisplay';
import RealtimeSubtitlePanel from '../../components/RealtimeSubtitlePanel';
import TranslatedSubtitles from '../../components/TranslatedSubtitles';
import CommonButton from '../../components/CommonButton';
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

    console.log('🎥 [VideoSessionRoom] 초기화 시작', { roomId, isCameraOn, isMuted });
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

  // Attach local stream to video element when both are available
  useEffect(() => {
    if (!localStream || !localVideoRef.current) {
      return;
    }

    // 이미 스트림이 연결되어 있으면 중복 연결 방지
    if (localVideoRef.current.srcObject === localStream) {
      return;
    }

    console.log('🔄 [VideoSessionRoom] useEffect: 로컬 스트림을 비디오 요소에 연결');

    const videoElement = localVideoRef.current;
    videoElement.srcObject = localStream;

    // 비디오 재생
    videoElement.play()
      .then(() => {
        console.log('✅ [VideoSessionRoom] useEffect: 로컬 비디오 재생 시작');

        // 최종 상태 로그 (비디오 메타데이터 로드 대기)
        videoElement.addEventListener('loadedmetadata', () => {
          console.log('🎥 [VideoSessionRoom] useEffect: 로컬 비디오 최종 상태:', {
            hasStream: !!videoElement.srcObject,
            videoWidth: videoElement.videoWidth,
            videoHeight: videoElement.videoHeight,
            paused: videoElement.paused,
            readyState: videoElement.readyState
          });
        }, { once: true });
      })
      .catch((error) => {
        console.error('❌ [VideoSessionRoom] useEffect: 로컬 비디오 재생 실패:', error);
      });
  }, [localStream]);

  // Attach remote stream to video element when both are available
  useEffect(() => {
    if (!remoteStream || !remoteVideoRef.current) {
      return;
    }

    // 이미 스트림이 연결되어 있으면 중복 연결 방지
    if (remoteVideoRef.current.srcObject === remoteStream) {
      return;
    }

    console.log('🔄 [VideoSessionRoom] useEffect: 원격 스트림을 비디오 요소에 연결');
    remoteVideoRef.current.srcObject = remoteStream;

    // 원격 비디오 재생 (자동 재생)
    remoteVideoRef.current.play()
      .then(() => {
        console.log('✅ [VideoSessionRoom] useEffect: 원격 비디오 재생 시작');
      })
      .catch((error) => {
        console.error('❌ [VideoSessionRoom] useEffect: 원격 비디오 재생 실패:', error);
      });
  }, [remoteStream]);

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
      try {
        await webrtcManager.initializeMedia(constraints);
        log.info('미디어 초기화 성공', null, 'VIDEO_SESSION');
      } catch (mediaError) {
        log.error('미디어 접근 실패', mediaError, 'VIDEO_SESSION');

        // 사용자 친화적인 에러 메시지
        let errorMessage = '카메라/마이크 접근에 실패했습니다.';

        if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
          errorMessage = '카메라와 마이크 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.';
        } else if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
          errorMessage = '카메라 또는 마이크를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.';
        } else if (mediaError.name === 'NotReadableError' || mediaError.name === 'TrackStartError') {
          errorMessage = '다른 애플리케이션에서 카메라/마이크를 사용 중입니다. 다른 앱을 종료하고 다시 시도해주세요.';
        } else if (mediaError.name === 'OverconstrainedError' || mediaError.name === 'ConstraintNotSatisfiedError') {
          errorMessage = '요청한 카메라 해상도를 지원하지 않습니다. 다른 설정으로 시도합니다.';

          // Fallback to lower resolution
          try {
            const fallbackConstraints = {
              video: { width: 640, height: 480 },
              audio: true
            };
            await webrtcManager.initializeMedia(fallbackConstraints);
            log.info('대체 해상도로 미디어 초기화 성공', null, 'VIDEO_SESSION');
          } catch (fallbackError) {
            throw new Error('카메라 초기화에 실패했습니다.');
          }
        } else if (mediaError.name === 'TypeError') {
          errorMessage = 'HTTPS 연결이 필요합니다. 보안 연결(https://)을 사용해주세요.';
        } else if (mediaError.name === 'SecurityError') {
          errorMessage = '보안 정책으로 인해 미디어 접근이 차단되었습니다.';
        }

        alert(errorMessage);
        throw mediaError;
      }

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
      console.log('📋 [VideoSessionRoom] 룸 정보 로드:', info);

      if (info) {
        const metadata = info.metadata || {};
        const currentUserId = localStorage.getItem('userId');
        const participants = info.participants || [];

        console.log('👥 [VideoSessionRoom] 참가자 목록:', participants);
        console.log('👤 [VideoSessionRoom] 현재 사용자 ID:', currentUserId);

        const remoteParticipant = participants.find(
          (participant) => participant.id !== currentUserId && participant.userId !== currentUserId
        );

        console.log('🔍 [VideoSessionRoom] 원격 참가자:', remoteParticipant);

        if (remoteParticipant || Object.keys(metadata).length > 0) {
          setPartnerInfo({
            name: metadata.partnerName || remoteParticipant?.name || remoteParticipant?.userName || 'Partner',
            avatar: metadata.partnerAvatar || '/assets/basicProfilePic.png',
            level: metadata.partnerLevel || 'Unknown',
            nativeLanguage: metadata.partnerNativeLanguage || 'Unknown',
            learningLanguage: metadata.partnerLearningLanguage || 'Unknown'
          });
        } else {
          console.warn('⚠️ [VideoSessionRoom] 원격 참가자 정보를 찾을 수 없습니다');
          // 기본 파트너 정보 설정 (연결을 기다리는 상태)
          setPartnerInfo({
            name: 'Waiting...',
            avatar: '/assets/basicProfilePic.png',
            level: 'Unknown',
            nativeLanguage: 'Unknown',
            learningLanguage: 'Unknown'
          });
        }
      }
    } catch (error) {
      log.warn('룸 정보 로드 실패', error, 'VIDEO_SESSION');
      // 에러 발생 시에도 기본 파트너 정보 설정
      setPartnerInfo({
        name: 'Partner',
        avatar: '/assets/basicProfilePic.png',
        level: 'Unknown',
        nativeLanguage: 'Unknown',
        learningLanguage: 'Unknown'
      });
    }
  };

  // Setup WebRTC manager callbacks
  const setupWebRTCCallbacks = () => {
    // Local stream callback
    webrtcManager.on('onLocalStream', (stream) => {
      console.log('✅ [VideoSessionRoom] 로컬 스트림 수신', stream);
      console.log('🎥 [VideoSessionRoom] 스트림 트랙:', stream.getTracks());
      console.log('🎥 [VideoSessionRoom] 비디오 트랙:', stream.getVideoTracks());
      console.log('🎥 [VideoSessionRoom] 오디오 트랙:', stream.getAudioTracks());
      log.info('로컬 스트림 수신', null, 'VIDEO_SESSION');
      setLocalStream(stream); // ✅ 상태 업데이트 (자막용 + useEffect 트리거)
    });

    // Remote stream callback
    webrtcManager.on('onRemoteStream', (userId, stream) => {
      console.log('✅ [VideoSessionRoom] 원격 스트림 수신', { userId, stream });
      log.info('원격 스트림 수신', { userId }, 'VIDEO_SESSION');

      // Set first remote stream for subtitles and main video
      if (remoteVideosRef.current.size === 0) {
        setRemoteStream(stream); // ✅ 상태 업데이트 (자막용 + useEffect 트리거)
      }

      // Store stream in Map for multi-participant rendering
      remoteVideosRef.current.set(userId, stream);

      // Force re-render by updating a state (리렌더링 트리거)
      setConnectionStats(prev => ({ ...prev, lastUpdate: Date.now() }));
    });

    // Remote stream removed callback
    webrtcManager.on('onRemoteStreamRemoved', (userId, stream) => {
      console.log('❌ [VideoSessionRoom] 원격 스트림 제거:', userId);
      log.info('원격 스트림 제거', { userId }, 'VIDEO_SESSION');

      // remoteVideosRef에서 스트림 제거
      if (remoteVideosRef.current.has(userId)) {
        remoteVideosRef.current.delete(userId);
        console.log('🗑️ [VideoSessionRoom] 스트림 삭제 완료. 남은 스트림 수:', remoteVideosRef.current.size);
      }

      // 마지막 원격 스트림이 제거되면 상태도 초기화
      if (remoteVideosRef.current.size === 0) {
        setRemoteStream(null); // ✅ 자막용 스트림도 초기화
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      }

      // Update participants
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.delete(userId);
        console.log('👥 [VideoSessionRoom] 참가자 삭제. 남은 참가자 수:', updated.size);
        return updated;
      });

      // Force re-render (리렌더링 트리거)
      setConnectionStats(prev => ({ ...prev, lastUpdate: Date.now() }));
    });

    // Participant joined callback
    webrtcManager.on('onParticipantJoined', (participant) => {
      console.log('✅ [VideoSessionRoom] 참가자 입장:', participant);
      log.info('참가자 입장', participant, 'VIDEO_SESSION');

      setParticipants(prev => {
        const updated = new Map(prev);
        updated.set(participant.userId, participant);
        console.log('👥 [VideoSessionRoom] 업데이트된 참가자 목록:', Array.from(updated.keys()));
        return updated;
      });

      const currentUserId = localStorage.getItem('userId') || 'guest';
      if (participant.userId !== currentUserId) {
        console.log('🔄 [VideoSessionRoom] 파트너 정보 업데이트:', participant.userName);
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
      console.log('🚪 [VideoSessionRoom] 참가자 퇴장:', participant);
      log.info('참가자 퇴장', participant, 'VIDEO_SESSION');

      setParticipants(prev => {
        const updated = new Map(prev);
        updated.delete(participant.userId);
        console.log('👥 [VideoSessionRoom] 퇴장 후 남은 참가자 수:', updated.size);
        return updated;
      });

      const currentUserId = localStorage.getItem('userId') || 'guest';
      if (participant.userId !== currentUserId) {
        console.log('👋 [VideoSessionRoom] 파트너가 나갔습니다');
        // 파트너가 나가면 파트너 정보 초기화
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
                {/* 실제 연결된 원격 스트림 수 + 나 자신 = 총 참가자 수 */}
                {remoteVideosRef.current.size + 1}명 참가 중
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
              <CommonButton
                onClick={handlePictureInPicture}
                variant="ghost"
                size="icon"
                fullWidth={false}
                icon={isPipMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                className="text-white hover:bg-[var(--black-400)]"
                aria-label={isPipMode ? "PiP 모드 종료" : "PiP 모드"}
              />
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
            <CommonButton
              onClick={() => window.location.reload()}
              variant="success"
              size="default"
              fullWidth={false}
              className="px-6"
            >
              다시 시도
            </CommonButton>
          </div>
        ) : (
          <div className={`grid gap-6 w-full max-w-6xl ${
            // 실제 원격 스트림 수에 따라 동적 레이아웃 조정
            remoteVideosRef.current.size === 0 ? 'grid-cols-1 max-w-2xl' : // 나 혼자
            remoteVideosRef.current.size === 1 ? 'grid-cols-1 lg:grid-cols-2' : // 나 + 1명
            remoteVideosRef.current.size === 2 ? 'grid-cols-2 lg:grid-cols-2' : // 나 + 2명
            remoteVideosRef.current.size === 3 ? 'grid-cols-2 lg:grid-cols-2' : // 나 + 3명 (2x2 격자)
            'grid-cols-2 lg:grid-cols-3' // 나 + 4명 이상
          }`}>
            {/* Local Video (Self) - 항상 표시 */}
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

              {/* Local user info */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-2 px-3">
                <p className="text-white text-sm font-medium">나 (You)</p>
              </div>

              {/* Local user indicators */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {isMuted && (
                  <div className="bg-[rgba(234,67,53,0.8)] px-3 py-1 rounded-full">
                    <span className="text-white text-sm">음소거</span>
                  </div>
                )}
              </div>
            </div>

            {/* Remote Videos (실제 스트림이 있는 참가자만 표시) */}
            {Array.from(remoteVideosRef.current.entries()).map(([userId, stream]) => {
              // participants Map에서 해당 userId의 참가자 정보 가져오기
              const participant = participants.get(userId) || { userId, userName: 'Unknown' };

              return (
                <div
                  key={userId}
                  className="relative bg-[var(--black-400)] rounded-[20px] overflow-hidden aspect-video"
                >
                  <video
                    ref={(el) => {
                      if (el && stream && !el.srcObject) {
                        console.log(`🔗 [VideoSessionRoom] 참가자 ${userId} 스트림 연결`);
                        el.srcObject = stream;
                        el.play().catch(err => console.error('원격 비디오 재생 실패:', err));
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Partner Info Overlay */}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--green-500)] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {participant.userName?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{participant.userName || 'Anonymous'}</p>
                        <p className="text-[var(--black-200)] text-sm">참가자</p>
                      </div>
                    </div>
                  </div>

                  {/* Remote user status indicators */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {!participant.audioEnabled && (
                      <div className="bg-[rgba(234,67,53,0.8)] p-2 rounded-full">
                        <span className="text-white text-xs">🔇</span>
                      </div>
                    )}
                    {participant.isScreenSharing && (
                      <div className="bg-[rgba(66,133,244,0.8)] p-2 rounded-full">
                        <Monitor className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
          isSubtitleEnabled={isSubtitleEnabled}
          currentLanguage={currentLanguage}
          onToggleMute={handleMicToggle}
          onToggleVideo={handleCameraToggle}
          onToggleScreenShare={handleScreenShare}
          onToggleSubtitle={toggleSubtitle}
          onToggleLanguage={handleLanguageToggle}
          onEndCall={handleEndCall}
          showVideo={true}
          showScreenShare={true}
          showSubtitle={true}
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
