import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const WORKERS_API_URL = import.meta.env.VITE_WORKERS_API_URL || 'https://workers.languagemate.kr';

// ICE서버 설정
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TURN 서버 (필요시 추가)
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

    const wsUrl = `${WORKERS_API_URL.replace('https', 'wss')}/api/room/${roomId}/ws`;
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

  // Peer Connection 생성
  const createPeerConnection = useCallback(async (peerId, createOffer = false) => {
    console.log('Creating peer connection for:', peerId);
    
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnectionsRef.current.set(peerId, pc);

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

    // Offer 생성 및 전송
    if (createOffer) {
      try {
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
      }
    }

    return pc;
  }, []);

  // Offer 처리
  const handleOffer = useCallback(async (fromId, offer) => {
    console.log('Handling offer from:', fromId);
    
    try {
      const pc = await createPeerConnection(fromId, false);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
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
  }, [createPeerConnection]);

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

  // ICE Candidate 처리
  const handleIceCandidate = useCallback(async (fromId, candidate) => {
    const pc = peerConnectionsRef.current.get(fromId);
    if (pc && candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Failed to add ICE candidate:', err);
      }
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
    
    setRemoteStreams(prev => {
      const newStreams = new Map(prev);
      newStreams.delete(peerId);
      return newStreams;
    });
  }, []);

  // 통계 모니터링
  const startStatsMonitoring = useCallback((pc, peerId) => {
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

        stats.forEach(report => {
          if (report.type === 'outbound-rtp' && report.kind === 'video') {
            totalBitrate += report.bytesSent * 8 / report.timestamp;
            totalPacketLoss += report.packetsLost || 0;
            totalPackets += report.packetsSent || 0;
          }
          
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            if (report.currentRoundTripTime) {
              rtts.push(report.currentRoundTripTime * 1000); // ms
            }
          }
        });

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

        setStats({
          bitrate: Math.round(totalBitrate / 1000), // kbps
          packetLoss: Math.round(packetLossRate * 100), // %
          latency: Math.round(avgLatency), // ms
          quality
        });
      } catch (err) {
        console.error('Failed to get stats:', err);
      }
    }, 2000);

    return interval;
  }, []);

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
        // 미디어 스트림 획득
        await getUserMedia();
        
        // WebSocket 연결
        connectWebSocket();
      } catch (err) {
        console.error('Failed to initialize:', err);
        setError('초기화 실패: ' + err.message);
      }
    };

    init();

    // 클린업
    return () => {
      disconnect();
    };
  }, [roomId, userId]); // getUserMedia, connectWebSocket, disconnect는 의존성에서 제외

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