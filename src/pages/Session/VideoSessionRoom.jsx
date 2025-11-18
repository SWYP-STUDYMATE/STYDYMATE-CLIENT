import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoControls from '../../components/VideoControls';
import LiveTranscription from '../../components/LiveTranscription';
import SubtitleDisplay, { SubtitleController } from '../../components/SubtitleDisplay';
import RealtimeSubtitlePanel from '../../components/RealtimeSubtitlePanel';
import TranslatedSubtitles from '../../components/TranslatedSubtitles';
import CommonButton from '../../components/CommonButton';
import { Loader2, Signal, SignalZero, Users, Maximize2, Minimize2, Monitor, Clock, AlertTriangle } from 'lucide-react';
import { webrtcManager } from '../../services/webrtc';
import { webrtcAPI } from '../../api/webrtc';
import { log } from '../../utils/logger';
import { useSessionTimeControl } from '../../hooks/useSessionTimeControl';

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
  const [sessionMetadata, setSessionMetadata] = useState(null);

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

  // Session time control hook
  const { remainingMinutes, showEndWarning, sessionAccessInfo, dismissWarning } = useSessionTimeControl(sessionMetadata, roomId);

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

    const videoElement = localVideoRef.current;
    
    // 이미 같은 스트림이 연결되어 있으면 중복 연결 방지
    if (videoElement.srcObject === localStream) {
      return;
    }

    console.log('🔄 [VideoSessionRoom] 로컬 스트림 연결', {
      streamId: localStream.id,
      videoTracks: localStream.getVideoTracks().length,
      audioTracks: localStream.getAudioTracks().length
    });

    // 기존 스트림 정리
    if (videoElement.srcObject) {
      const oldStream = videoElement.srcObject;
      oldStream.getTracks().forEach(track => {
        if (track !== localStream.getTracks().find(t => t.id === track.id)) {
          track.stop();
        }
      });
    }

    videoElement.srcObject = localStream;

    // 비디오 재생
    const playPromise = videoElement.play();
    
    if (playPromise !== undefined) {
      playPromise
        .catch((error) => {
          console.error('❌ [VideoSessionRoom] 로컬 비디오 재생 실패:', error);
        });
    }

    // 클린업 함수
    return () => {
      if (videoElement.srcObject === localStream) {
        videoElement.srcObject = null;
      }
    };
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

    remoteVideoRef.current.srcObject = remoteStream;

    // 원격 비디오 재생 (자동 재생)
    remoteVideoRef.current.play()
      .catch((error) => {
        console.error('❌ [VideoSessionRoom] 원격 비디오 재생 실패:', error);
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

        // Load session time metadata
        if (metadata.scheduledStartTime || metadata.scheduledEndTime) {
          setSessionMetadata({
            scheduledStartTime: metadata.scheduledStartTime,
            scheduledEndTime: metadata.scheduledEndTime
          });
        }

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
            name: metadata.partnerName || remoteParticipant?.name || remoteParticipant?.userName || '게스트',
            avatar: metadata.partnerAvatar || remoteParticipant?.avatar || '/assets/basicProfilePic.png',
            level: metadata.partnerLevel || remoteParticipant?.level || null,
            nativeLanguage: metadata.partnerNativeLanguage || remoteParticipant?.nativeLanguage || null,
            learningLanguage: metadata.partnerLearningLanguage || remoteParticipant?.learningLanguage || null
          });
        } else {
          console.warn('⚠️ [VideoSessionRoom] 원격 참가자 정보를 찾을 수 없습니다');
          // 기본 파트너 정보 설정 (연결을 기다리는 상태)
          setPartnerInfo({
            name: '대기 중...',
            avatar: '/assets/basicProfilePic.png',
            level: null,
            nativeLanguage: null,
            learningLanguage: null
          });
        }
      }
    } catch (error) {
      log.warn('룸 정보 로드 실패', error, 'VIDEO_SESSION');
      // 에러 발생 시에도 기본 파트너 정보 설정
      setPartnerInfo({
        name: '대기 중...',
        avatar: '/assets/basicProfilePic.png',
        level: null,
        nativeLanguage: null,
        learningLanguage: null
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
      console.log('🎥 [VideoSessionRoom] 원격 스트림 상세:', {
        streamId: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoTracksInfo: stream.getVideoTracks().map(t => ({
          id: t.id,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted
        }))
      });
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
        const participantName = participant.userName || participant.name || '게스트';
        console.log('🔄 [VideoSessionRoom] 파트너 정보 업데이트:', participantName);
        
        // 참가자 정보가 있으면 더 자세한 정보로 업데이트
        // "대기 중..." 상태를 명확히 업데이트
        setPartnerInfo((prev) => {
          // 참가자가 실제로 입장했으므로 "대기 중..."이 아닌 실제 이름으로 업데이트
          return {
            name: participantName,
            avatar: participant.avatar || prev?.avatar || '/assets/basicProfilePic.png',
            level: participant.level || prev?.level || null,
            nativeLanguage: participant.nativeLanguage || prev?.nativeLanguage || null,
            learningLanguage: participant.learningLanguage || prev?.learningLanguage || null
          };
        });
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

    // Participant updated callback (음소거, 카메라 상태 등)
    webrtcManager.on('onParticipantUpdated', (participant) => {
      console.log('🔄 [VideoSessionRoom] 참가자 상태 업데이트:', participant);
      log.info('참가자 상태 업데이트', participant, 'VIDEO_SESSION');

      // 참가자 상태 업데이트
      setParticipants(prev => {
        const updated = new Map(prev);
        if (updated.has(participant.userId)) {
          // 기존 참가자 정보 업데이트
          const existing = updated.get(participant.userId);
          updated.set(participant.userId, {
            ...existing,
            ...participant
          });
        } else {
          // 새로운 참가자로 추가
          updated.set(participant.userId, participant);
        }
        return updated;
      });
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

        // Store original camera track for later restoration
        const originalVideoTrack = localStream?.getVideoTracks()[0];
        
        // Switch to screen share (webrtcManager will handle track replacement)
        await webrtcManager.switchDevice('videoinput', screenStream.getVideoTracks()[0]);
        
        // Store screen share track reference
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Listen for screen share end (user clicks stop in browser UI)
        screenTrack.onended = async () => {
          setIsScreenSharing(false);
          log.info('화면 공유 자동 종료', null, 'VIDEO_SESSION');
          
          // Return to camera
          if (originalVideoTrack && !originalVideoTrack.ended) {
            // If original track is still valid, restore it
            await webrtcManager.switchDevice('videoinput', originalVideoTrack);
          } else {
            // Otherwise, get new camera stream
            try {
              const cameraConstraints = {
                video: {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  facingMode: 'user'
                },
                audio: false
              };
              const cameraStream = await navigator.mediaDevices.getUserMedia(cameraConstraints);
              await webrtcManager.switchDevice('videoinput', cameraStream.getVideoTracks()[0]);
              // Stop unused tracks
              cameraStream.getTracks().forEach(track => {
                if (track !== cameraStream.getVideoTracks()[0]) {
                  track.stop();
                }
              });
            } catch (cameraError) {
              log.error('카메라 복원 실패', cameraError, 'VIDEO_SESSION');
            }
          }
          
          // Notify server about screen sharing state
          webrtcManager.toggleScreenShare(false);
          
          // Notify participants
          webrtcManager.sendChatMessage('screen-share-stopped');
        };

        setIsScreenSharing(true);
        log.info('화면 공유 시작', null, 'VIDEO_SESSION');

        // Notify server about screen sharing state
        webrtcManager.toggleScreenShare(true);
        
        // Notify participants via chat
        webrtcManager.sendChatMessage('screen-share-started');
      } else {
        // Stop screen sharing manually
        const currentVideoTrack = localStream?.getVideoTracks()[0];
        
        // Stop screen share track
        if (currentVideoTrack && currentVideoTrack.label.includes('screen')) {
          currentVideoTrack.stop();
        }
        
        setIsScreenSharing(false);
        log.info('화면 공유 중지', null, 'VIDEO_SESSION');
        
        // Return to camera
        try {
          const cameraConstraints = {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: false
          };
          const cameraStream = await navigator.mediaDevices.getUserMedia(cameraConstraints);
          await webrtcManager.switchDevice('videoinput', cameraStream.getVideoTracks()[0]);
          // Stop unused tracks
          cameraStream.getTracks().forEach(track => {
            if (track !== cameraStream.getVideoTracks()[0]) {
              track.stop();
            }
          });
        } catch (cameraError) {
          log.error('카메라 복원 실패', cameraError, 'VIDEO_SESSION');
        }
        
        // Notify server about screen sharing state
        webrtcManager.toggleScreenShare(false);
        
        // Notify participants
        webrtcManager.sendChatMessage('screen-share-stopped');
      }
    } catch (error) {
      log.error('화면 공유 오류', error, 'VIDEO_SESSION');
      
      // If user cancels the screen share dialog, reset state
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
        setIsScreenSharing(false);
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
    webrtcManager.off('onParticipantUpdated');
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
      {/* Session Access Denied Warning */}
      {sessionAccessInfo && !sessionAccessInfo.canJoin && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-[rgba(234,67,53,0.95)] backdrop-blur-sm rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-[320px]">
            <AlertTriangle className="w-6 h-6 text-white flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-medium">세션 접속 불가</p>
              <p className="text-white/80 text-sm mt-1">{sessionAccessInfo.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Session End Warning */}
      {showEndWarning && remainingMinutes !== null && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-[rgba(234,67,53,0.95)] backdrop-blur-sm rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-[320px]">
            <AlertTriangle className="w-6 h-6 text-white flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-medium">
                {remainingMinutes <= 1
                  ? '세션이 곧 종료됩니다!'
                  : `세션이 ${remainingMinutes}분 후 종료됩니다`}
              </p>
              <p className="text-white/80 text-sm mt-1">
                시간이 되면 자동으로 세션이 종료됩니다
              </p>
            </div>
            <button
              onClick={dismissWarning}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="경고 닫기"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

            {/* 세션 시간 정보 */}
            {sessionMetadata?.scheduledStartTime && sessionMetadata?.scheduledEndTime && (
              <div className="flex items-center gap-2 text-[var(--black-200)] text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(sessionMetadata.scheduledStartTime).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {' - '}
                  {new Date(sessionMetadata.scheduledEndTime).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
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
              <>
                <div className="text-white font-mono">
                  {formatDuration(duration)}
                </div>
                {remainingMinutes !== null && remainingMinutes > 0 && (
                  <div className={`flex items-center gap-1 ${remainingMinutes <= 5 ? 'text-[var(--red)]' : 'text-[var(--black-200)]'}`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">남은 시간: {remainingMinutes}분</span>
                  </div>
                )}
              </>
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
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Connection Status Overlay - 연결 상태와 관계없이 비디오는 항상 렌더링 */}
        {(connectionState === 'connecting' || connectionState === 'reconnecting') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
            <div className="text-center">
              <Loader2 className={`w-16 h-16 ${connectionState === 'connecting' ? 'text-[var(--green-500)]' : 'text-[var(--warning-yellow)]'} animate-spin mx-auto mb-4`} />
              <p className="text-white text-lg mb-2">{connectionState === 'connecting' ? '연결 중...' : '연결 복구 중...'}</p>
              <p className="text-[var(--black-200)] text-sm">{connectionState === 'connecting' ? '잠시만 기다려주세요' : '네트워크 연결을 복구하고 있습니다'}</p>
            </div>
          </div>
        )}

        {connectionState === 'failed' ? (
          <div className="text-center z-20 relative">
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
            {/* Local Video (Self) - 연결 상태와 관계없이 항상 표시 */}
            <div className="relative bg-[var(--black-400)] rounded-[20px] overflow-hidden aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isCameraOn ? 'opacity-0 pointer-events-none' : ''}`}
                style={{ display: 'block' }}
              />

              {/* 카메라 꺼짐 상태 UI (명확한 표시) */}
              {!isCameraOn && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none bg-[var(--black-400)]">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-[var(--black-300)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-[var(--black-200)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[var(--black-200)] text-sm font-medium">카메라가 꺼져있습니다</p>
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
                  <div className="bg-[rgba(234,67,53,0.9)] backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    <span className="text-white text-xs font-medium">음소거</span>
                  </div>
                )}
              </div>
            </div>

            {/* Remote Videos (실제 스트림이 있는 참가자만 표시) */}
            {Array.from(remoteVideosRef.current.entries()).map(([userId, stream]) => {
              // participants Map에서 해당 userId의 참가자 정보 가져오기
              const participant = participants.get(userId);

              // 파트너 정보가 있으면 우선 사용, 없으면 participant 정보 사용
              const displayName = partnerInfo?.name || participant?.userName || participant?.name || '게스트';
              const displayInitial = displayName.charAt(0).toUpperCase();
              const isGuest = !participant?.userName && !participant?.name && !partnerInfo?.name;

              // 비디오 트랙 상세 로깅
              const videoTracks = stream.getVideoTracks();
              const audioTracks = stream.getAudioTracks();

              console.log(`📹 [VideoSessionRoom] 참가자 ${userId} 비디오 트랙:`, videoTracks.map(t => ({
                id: t.id,
                label: t.label,
                enabled: t.enabled,
                readyState: t.readyState,
                muted: t.muted,
                kind: t.kind
              })));

              // 카메라 상태 확인 - 스트림이 있으면 기본적으로 활성화된 것으로 간주
              // readyState가 'live'이고 enabled가 true인 비디오 트랙이 하나라도 있으면 표시
              const hasVideoTracks = videoTracks.length > 0;
              const hasActiveVideoTrack = hasVideoTracks &&
                videoTracks.some(track => track.enabled && track.readyState === 'live');

              // ✅ 수정: 스트림이 있으면 일단 활성화된 것으로 간주 (participant 상태보다 스트림 상태 우선)
              // 비디오 트랙이 있고 readyState가 'ended'가 아니면 표시
              const isVideoEnabled = hasVideoTracks &&
                videoTracks.some(track => track.readyState !== 'ended');

              console.log(`✅ [VideoSessionRoom] 참가자 ${userId} 비디오 활성화:`, isVideoEnabled, {
                hasVideoTracks,
                hasActiveVideoTrack,
                trackStates: videoTracks.map(t => t.readyState)
              });

              const isAudioEnabled = audioTracks.length > 0 &&
                                     audioTracks.some(track => track.enabled && track.readyState === 'live');
              
              return (
                <div
                  key={userId}
                  className="relative bg-[var(--black-400)] rounded-[20px] overflow-hidden aspect-video"
                >
                  <video
                    ref={(el) => {
                      if (el && stream) {
                        // 스트림이 변경되었거나 아직 연결되지 않은 경우에만 업데이트
                        if (el.srcObject !== stream) {
                          el.srcObject = stream;
                          
                          // 비디오 재생 시도
                          const playVideo = async () => {
                            try {
                              await el.play();
                            } catch (err) {
                              console.error(`❌ [VideoSessionRoom] 참가자 ${userId} 비디오 재생 실패:`, err);
                              // 메타데이터 로드 후 재시도
                              el.addEventListener('loadedmetadata', () => {
                                el.play().catch(e => console.error('재시도 실패:', e));
                              }, { once: true });
                              
                              // canplay 이벤트로도 재시도
                              el.addEventListener('canplay', () => {
                                el.play().catch(e => console.error('canplay 재시도 실패:', e));
                              }, { once: true });
                            }
                          };
                          
                          playVideo();
                        } else {
                          // 이미 같은 스트림이 연결되어 있으면 재생 상태 확인
                          if (el.paused) {
                            el.play().catch(err => console.error('일시정지 상태 재생 실패:', err));
                          }
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${!isVideoEnabled ? 'opacity-0 pointer-events-none' : ''}`}
                  />

                  {/* 카메라 꺼짐 상태 UI (로컬 비디오와 동일한 스타일) */}
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none bg-[var(--black-400)]">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-[var(--black-300)] rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-12 h-12 text-[var(--black-200)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-[var(--black-200)] text-sm font-medium">카메라가 꺼져있습니다</p>
                      </div>
                    </div>
                  )}

                  {/* Partner Info Overlay */}
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      {/* 프로필 아바타 */}
                      {partnerInfo?.avatar && partnerInfo.avatar !== '/assets/basicProfilePic.png' ? (
                        <img
                          src={partnerInfo.avatar}
                          alt={displayName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[var(--green-500)]"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full ${isGuest ? 'bg-[var(--black-300)]' : 'bg-[var(--green-500)]'} flex items-center justify-center ${partnerInfo?.avatar && partnerInfo.avatar !== '/assets/basicProfilePic.png' ? 'hidden' : ''}`}>
                        <span className="text-white font-bold text-lg">
                          {displayInitial}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium text-sm truncate">{displayName}</p>
                          {isGuest && (
                            <span className="text-[var(--black-200)] text-xs px-1.5 py-0.5 bg-[var(--black-300)] rounded">
                              게스트
                            </span>
                          )}
                        </div>
                        {partnerInfo?.level && partnerInfo.level !== 'Unknown' ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[var(--black-200)] text-xs">
                              {partnerInfo.level}
                            </p>
                            {partnerInfo.nativeLanguage && partnerInfo.nativeLanguage !== 'Unknown' && (
                              <>
                                <span className="text-[var(--black-300)] text-xs">•</span>
                                <p className="text-[var(--black-200)] text-xs">
                                  {partnerInfo.nativeLanguage} → {partnerInfo.learningLanguage || '한국어'}
                                </p>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-[var(--black-200)] text-xs mt-0.5">참가자</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remote user status indicators */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {!isAudioEnabled && (
                      <div className="bg-[rgba(234,67,53,0.9)] backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                        <span className="text-white text-xs font-medium">음소거</span>
                      </div>
                    )}
                    {participant?.isScreenSharing && (
                      <div className="bg-[rgba(66,133,244,0.9)] backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                        <Monitor className="w-4 h-4 text-white" />
                        <span className="text-white text-xs font-medium">화면 공유</span>
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
          className={
            (connectionState !== 'connected' || sessionAccessInfo?.canJoin === false)
              ? 'opacity-50 pointer-events-none'
              : ''
          }
          variant="dark"
        />
      </div>
    </div>
  );
}
