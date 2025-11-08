import { useState, useEffect, useRef, useCallback } from 'react';
import { API_ENDPOINTS } from '../api/config.js';

// 기본 ICE 서버 설정 (백엔드 연결 실패 시 사용)
const FALLBACK_ICE_SERVERS = [
  // Cloudflare STUN (anycast)
  { urls: 'stun:stun.cloudflare.com:3478' },
  // Google STUN (백업)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // OpenRelay TURN (백업)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];

export default function useWebRTC(roomId, userId) {
  // 상태 관리
  const [connectionState, setConnectionState] = useState('new'); // new, connecting, connected, disconnected, failed
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    bitrate: 0,
    packetLoss: 0,
    latency: 0,
    quality: 'good' // good, fair, poor
  });

  // Refs
  const wsRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const iceServersRef = useRef(FALLBACK_ICE_SERVERS); // 동적 ICE 서버 설정

  // Polite Peer 패턴: 동시 접속 충돌 방지
  const makingOfferRef = useRef(new Map()); // 각 피어별 Offer 생성 중 상태
  const ignoreOfferRef = useRef(new Map()); // 각 피어별 Offer 무시 플래그
  const pendingCandidatesRef = useRef(new Map()); // 각 피어별 대기 중인 ICE candidates

  /**
   * 백엔드에서 ICE 서버 설정 가져오기
   * Cloudflare TURN이 설정되어 있으면 anycast로 최적 경로 자동 선택
   */
  const fetchIceServers = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.WORKERS.WEBRTC.BASE}/${roomId}/ice-servers`);

      if (!response.ok) {
        throw new Error('Failed to fetch ICE servers');
      }

      const data = await response.json();
      const iceServers = [
        ...(data.stunServers || []),
        ...(data.turnServers || [])
      ];

      if (iceServers.length > 0) {
        console.log('✅ [ICE] Fetched ICE servers from backend:', iceServers.length);
        iceServersRef.current = iceServers;
        return iceServers;
      }

      console.warn('⚠️ [ICE] No ICE servers from backend, using fallback');
      return FALLBACK_ICE_SERVERS;
    } catch (err) {
      console.error('❌ [ICE] Failed to fetch ICE servers, using fallback:', err);
      return FALLBACK_ICE_SERVERS;
    }
  }, [roomId]);

  // 미디어 스트림 획득
  const getUserMedia = useCallback(async (constraints = {}) => {
    try {
      const defaultConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: constraints.video !== false ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 24, max: 30 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        ...defaultConstraints,
        ...constraints
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setError(null);
      
      return stream;
    } catch (err) {
      console.error('Failed to get user media:', err);
      setError(err.message);
      
      // 비디오 실패시 오디오만 시도
      if (err.name === 'NotFoundError' && constraints.video !== false) {
        return getUserMedia({ video: false });
      }
      
      throw err;
    }
  }, []);

  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    if (!roomId || !userId) return;

    const wsUrl = API_ENDPOINTS.WORKERS.WEBRTC.WEBSOCKET(roomId, userId, userId);
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionState('connecting');
      
      // 사용자 정보 전송
      ws.send(JSON.stringify({
        type: 'join',
        userId,
        userName: userId // 실제로는 사용자 이름 전달
      }));
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'connected':
          console.log('Joined room:', message.roomData);
          break;
          
        case 'participant-joined':
          console.log('New participant:', message.participant);
          await createPeerConnection(message.participant.id, true);
          break;
          
        case 'participant-left':
          console.log('Participant left:', message.participantId);
          closePeerConnection(message.participantId);
          break;
          
        case 'offer':
          await handleOffer(message.from, message.data);
          break;
          
        case 'answer':
          await handleAnswer(message.from, message.data);
          break;
          
        case 'ice-candidate':
          await handleIceCandidate(message.from, message.data);
          break;
          
        case 'participant-updated':
          handleParticipantUpdate(message.participant);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('연결 오류가 발생했습니다');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionState('disconnected');
      
      // 재연결 시도
      setTimeout(() => {
        if (wsRef.current === ws) {
          connectWebSocket();
        }
      }, 3000);
    };

    wsRef.current = ws;
    return ws;
  }, [roomId, userId]);

  // Polite Peer 여부 판단 (userId가 사전순으로 작으면 polite)
  const isPolite = useCallback((peerId) => {
    return userId < peerId;
  }, [userId]);

  // Peer Connection 생성
  const createPeerConnection = useCallback(async (peerId, createOffer = false) => {
    console.log('Creating peer connection for:', peerId, 'isPolite:', isPolite(peerId));

    // 이미 존재하는 연결이 있으면 재사용
    if (peerConnectionsRef.current.has(peerId)) {
      console.log('Reusing existing peer connection for:', peerId);
      return peerConnectionsRef.current.get(peerId);
    }

    // 동적 ICE 서버 사용 (백엔드에서 가져온 설정)
    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
    console.log('📡 [ICE] Using ICE servers:', iceServersRef.current.length);
    peerConnectionsRef.current.set(peerId, pc);

    // 대기 중인 ICE candidates 큐 초기화
    if (!pendingCandidatesRef.current.has(peerId)) {
      pendingCandidatesRef.current.set(peerId, []);
    }

    // 로컬 스트림 추가
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // ICE 후보 처리
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          data: {
            to: peerId,
            signal: event.candidate
          }
        }));
      }
    };

    // 원격 스트림 처리
    pc.ontrack = (event) => {
      console.log('Received remote track from:', peerId);
      setRemoteStreams(prev => new Map(prev).set(peerId, event.streams[0]));
    };

    // 연결 상태 모니터링
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${peerId}:`, pc.connectionState);

      if (pc.connectionState === 'connected') {
        setConnectionState('connected');
        startStatsMonitoring(pc, peerId);
      } else if (pc.connectionState === 'failed') {
        handleConnectionFailure(peerId);
      }
    };

    // Negotiation 필요 시 처리 (Polite Peer 패턴)
    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current.set(peerId, true);
        await pc.setLocalDescription();

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'offer',
            data: {
              to: peerId,
              signal: pc.localDescription
            }
          }));
        }
      } catch (err) {
        console.error('Failed in negotiation:', err);
      } finally {
        makingOfferRef.current.set(peerId, false);
      }
    };

    // Offer 생성 및 전송 (초기 연결)
    if (createOffer) {
      try {
        makingOfferRef.current.set(peerId, true);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'offer',
            data: {
              to: peerId,
              signal: offer
            }
          }));
        }
      } catch (err) {
        console.error('Failed to create offer:', err);
        setError('연결 생성 실패');
      } finally {
        makingOfferRef.current.set(peerId, false);
      }
    }

    return pc;
  }, [isPolite]);

  // Offer 처리 (Polite Peer 패턴 적용)
  const handleOffer = useCallback(async (fromId, offer) => {
    console.log('Handling offer from:', fromId, 'isPolite:', isPolite(fromId));

    const pc = peerConnectionsRef.current.get(fromId) || await createPeerConnection(fromId, false);

    // Offer 충돌 감지 및 처리
    const offerCollision =
      pc.signalingState !== 'stable' ||
      makingOfferRef.current.get(fromId);

    // Impolite 피어이고 충돌 발생 시 무시
    const shouldIgnore = !isPolite(fromId) && offerCollision;
    ignoreOfferRef.current.set(fromId, shouldIgnore);

    if (shouldIgnore) {
      console.log('🚫 [Impolite Peer] Ignoring offer collision from:', fromId);
      return;
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // 대기 중인 ICE candidates 처리
      const pendingCandidates = pendingCandidatesRef.current.get(fromId) || [];
      console.log(`Processing ${pendingCandidates.length} pending ICE candidates for:`, fromId);

      for (const candidate of pendingCandidates) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Failed to add pending ICE candidate:', err);
        }
      }

      // 큐 비우기
      pendingCandidatesRef.current.set(fromId, []);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'answer',
          data: {
            to: fromId,
            signal: answer
          }
        }));
      }
    } catch (err) {
      console.error('Failed to handle offer:', err);
      setError('연결 수락 실패');
    }
  }, [createPeerConnection, isPolite]);

  // Answer 처리
  const handleAnswer = useCallback(async (fromId, answer) => {
    console.log('Handling answer from:', fromId);
    
    const pc = peerConnectionsRef.current.get(fromId);
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Failed to handle answer:', err);
        setError('연결 설정 실패');
      }
    }
  }, []);

  // ICE Candidate 처리 (개선: 대기 큐 지원)
  const handleIceCandidate = useCallback(async (fromId, candidate) => {
    const pc = peerConnectionsRef.current.get(fromId);

    if (!pc) {
      console.warn('No peer connection found for ICE candidate from:', fromId);
      return;
    }

    if (!candidate) {
      console.warn('Received null ICE candidate from:', fromId);
      return;
    }

    try {
      // Remote description이 설정되지 않았으면 큐에 대기
      if (!pc.remoteDescription || !pc.remoteDescription.type) {
        console.log('⏳ Queuing ICE candidate (no remote description yet) from:', fromId);
        const queue = pendingCandidatesRef.current.get(fromId) || [];
        queue.push(candidate);
        pendingCandidatesRef.current.set(fromId, queue);
        return;
      }

      // Remote description이 있으면 즉시 추가
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ ICE candidate added for:', fromId);
    } catch (err) {
      // Offer 무시 중이면 ICE candidate 에러도 무시
      if (ignoreOfferRef.current.get(fromId)) {
        console.log('⏭️ Ignoring ICE candidate error (offer was ignored) from:', fromId);
        return;
      }
      console.error('Failed to add ICE candidate:', err);
    }
  }, []);

  // 참가자 업데이트 처리
  const handleParticipantUpdate = useCallback((participant) => {
    console.log('Participant updated:', participant);
    // UI 업데이트 등 필요한 처리
  }, []);

  // 연결 실패 처리
  const handleConnectionFailure = useCallback((peerId) => {
    console.log('Connection failed for:', peerId);
    
    // ICE 재시작 시도
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.restartIce();
    }
  }, []);

  // Peer Connection 종료
  const closePeerConnection = useCallback((peerId) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }

    // Polite Peer 상태 초기화
    makingOfferRef.current.delete(peerId);
    ignoreOfferRef.current.delete(peerId);
    pendingCandidatesRef.current.delete(peerId);

    setRemoteStreams(prev => {
      const newStreams = new Map(prev);
      newStreams.delete(peerId);
      return newStreams;
    });
  }, []);

  // 비디오 품질 자동 조정 (TURN 사용 시)
  const adjustVideoQualityForRelay = useCallback(async (pc, usingRelay) => {
    try {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (!sender) return;

      const params = sender.getParameters();
      if (!params.encodings || params.encodings.length === 0) {
        params.encodings = [{}];
      }

      if (usingRelay) {
        // TURN 사용 시: 비트레이트를 낮춰서 비용 절감 (기본 대비 40% 수준)
        params.encodings[0].maxBitrate = 500000; // 500 kbps (원래 ~1.5 Mbps)
        params.encodings[0].scaleResolutionDownBy = 1.5; // 해상도 약간 낮춤
        params.encodings[0].maxFramerate = 24; // 30fps → 24fps
        console.log('📉 [비용 절감] TURN 사용으로 인해 비디오 품질 자동 감소 (500 kbps, 24fps)');
      } else {
        // 직접 연결: 고품질 복원
        params.encodings[0].maxBitrate = 1500000; // 1.5 Mbps
        params.encodings[0].scaleResolutionDownBy = 1.0; // 원본 해상도
        params.encodings[0].maxFramerate = 30; // 30fps
        console.log('📈 [품질 복원] 직접 연결로 비디오 품질 자동 증가 (1.5 Mbps, 30fps)');
      }

      await sender.setParameters(params);
    } catch (err) {
      console.error('Failed to adjust video quality:', err);
    }
  }, []);

  // 통계 모니터링 (TURN 사용 감지 및 자동 품질 조정)
  const startStatsMonitoring = useCallback((pc, peerId) => {
    let lastRelayState = false; // 이전 TURN 사용 상태 추적

    const interval = setInterval(async () => {
      if (pc.connectionState !== 'connected') {
        clearInterval(interval);
        return;
      }

      try {
        const stats = await pc.getStats();
        let totalBitrate = 0;
        let totalPacketLoss = 0;
        let totalPackets = 0;
        let rtts = [];
        let connectionType = 'unknown';
        let usingRelay = false;

        stats.forEach(report => {
          // 비디오 통계
          if (report.type === 'outbound-rtp' && report.kind === 'video') {
            totalBitrate += report.bytesSent * 8 / report.timestamp;
            totalPacketLoss += report.packetsLost || 0;
            totalPackets += report.packetsSent || 0;
          }

          // 연결 타입 및 RTT 확인
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            // 로컬/원격 candidate 정보 가져오기
            const localCandidate = stats.get(report.localCandidateId);
            const remoteCandidate = stats.get(report.remoteCandidateId);

            // TURN 사용 여부 확인 (relay 타입 감지)
            if (localCandidate?.candidateType === 'relay' || remoteCandidate?.candidateType === 'relay') {
              usingRelay = true;
              connectionType = 'relay (TURN)';
            } else if (localCandidate?.candidateType === 'host' && remoteCandidate?.candidateType === 'host') {
              connectionType = 'direct (host)';
            } else if (localCandidate?.candidateType === 'srflx' || remoteCandidate?.candidateType === 'srflx') {
              connectionType = 'NAT (STUN)';
            }

            if (report.currentRoundTripTime) {
              rtts.push(report.currentRoundTripTime * 1000); // ms
            }
          }
        });

        // TURN 사용 상태가 변경된 경우에만 품질 조정
        if (usingRelay !== lastRelayState) {
          await adjustVideoQualityForRelay(pc, usingRelay);
          lastRelayState = usingRelay;

          if (usingRelay) {
            console.warn(`⚠️ [TURN 사용 감지] Peer ${peerId}가 TURN 서버를 통해 연결됨 (비용 발생)`);
          }
        }

        const packetLossRate = totalPackets > 0 ? totalPacketLoss / totalPackets : 0;
        const avgLatency = rtts.length > 0 ? rtts.reduce((a, b) => a + b) / rtts.length : 0;

        // 품질 판단
        let quality = 'good';
        if (packetLossRate > 0.05 || avgLatency > 150) {
          quality = 'fair';
        }
        if (packetLossRate > 0.1 || avgLatency > 300) {
          quality = 'poor';
        }

        // TURN 사용 시 로그 및 경고
        if (usingRelay) {
          console.log(`💰 [비용 발생] TURN 릴레이 사용 중 - Bitrate: ${Math.round(totalBitrate / 1000)} kbps`);
        }

        setStats({
          bitrate: Math.round(totalBitrate / 1000), // kbps
          packetLoss: Math.round(packetLossRate * 100), // %
          latency: Math.round(avgLatency), // ms
          connectionType, // 연결 타입 추가
          usingRelay, // TURN 사용 여부 추가
          quality
        });
      } catch (err) {
        console.error('Failed to get stats:', err);
      }
    }, 2000);

    return interval;
  }, [adjustVideoQualityForRelay]);

  // 오디오 토글
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      const newState = audioTracks[0]?.enabled ?? false;
      setIsAudioEnabled(newState);
      
      // 서버에 상태 전송
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'toggle-audio',
          data: { enabled: newState }
        }));
      }
    }
  }, []);

  // 비디오 토글
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      const newState = videoTracks[0]?.enabled ?? false;
      setIsVideoEnabled(newState);
      
      // 서버에 상태 전송
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'toggle-video',
          data: { enabled: newState }
        }));
      }
    }
  }, []);

  // 연결 종료
  const disconnect = useCallback(() => {
    // 모든 Peer Connection 종료
    peerConnectionsRef.current.forEach((pc, peerId) => {
      closePeerConnection(peerId);
    });

    // 로컬 스트림 종료
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // WebSocket 종료
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // 통계 모니터링 중지
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    setConnectionState('disconnected');
    setRemoteStreams(new Map());
  }, [closePeerConnection]);

  // 초기 연결 설정
  useEffect(() => {
    if (!roomId || !userId) return;

    const init = async () => {
      try {
        // 1. ICE 서버 설정 가져오기 (Cloudflare TURN 포함)
        await fetchIceServers();
        console.log('✅ [Init] ICE servers configured');

        // 2. 미디어 스트림 획득
        await getUserMedia();
        console.log('✅ [Init] Media stream acquired');

        // 3. WebSocket 연결
        connectWebSocket();
        console.log('✅ [Init] WebSocket connecting');
      } catch (err) {
        console.error('❌ [Init] Failed to initialize:', err);
        setError('초기화 실패: ' + err.message);
      }
    };

    init();

    // 클린업
    return () => {
      disconnect();
    };
  }, [roomId, userId, fetchIceServers]); // fetchIceServers 추가

  return {
    // 상태
    connectionState,
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    error,
    stats,
    
    // 액션
    toggleAudio,
    toggleVideo,
    disconnect,
    getUserMedia
  };
}
