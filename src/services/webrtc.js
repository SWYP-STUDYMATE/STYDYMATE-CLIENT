// WebRTC Connection Manager
import { webrtcAPI } from '../api/webrtc';
import { log } from '../utils/logger';
import { handleWebRTCError, withRetry, AppError, ERROR_TYPES } from '../utils/errorHandler';

class WebRTCConnectionManager {
  constructor() {
    this.localStream = null;
    this.remoteStreams = new Map();
    this.peerConnections = new Map();
    this.ws = null;
    this.roomId = null;
    this.userId = null;
    this.userName = null;
    this.isConnected = false;
    this.callbacks = {
      onLocalStream: null,
      onRemoteStream: null,
      onRemoteStreamRemoved: null,
      onParticipantJoined: null,
      onParticipantLeft: null,
      onParticipantUpdated: null,
      onConnectionStateChange: null,
      onError: null,
      onChatMessage: null,
    };

    // WebRTC configuration (will be updated from API)
    this.rtcConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    // State tracking
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 1000; // ms
    this.connectionCheckInterval = null;
    this.lastConnectionCheck = 0;
    this.connectionQuality = 'unknown'; // good, fair, poor, unknown
    this.reconnectTimeout = null;
    this.pendingIceCandidates = new Map(); // 대기 중인 ICE candidates
  }

  /**
   * Initialize media devices
   * @param {Object} constraints - Media constraints
   * @returns {Promise<MediaStream>} Local media stream
   */
  async initializeMedia(constraints = { audio: true, video: false }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(this.localStream);
      }
      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      this.handleError('Failed to access media devices', error);
      throw error;
    }
  }

  /**
   * Connect to a room
   * @param {string} roomId - Room ID
   * @param {Object} userInfo - User information
   * @param {Object} options - Connection options
   * @returns {Promise<void>}
   */
  async connect(roomId, userInfo, options = {}) {
    try {
      this.roomId = roomId;
      this.userId = userInfo.userId;
      this.userName = userInfo.userName || 'Anonymous';

      log.info('WebRTC 룸 연결 시작', { roomId, userId: this.userId }, 'WEBRTC');

      // Get ICE servers from API if room exists
      try {
        const iceServersConfig = await webrtcAPI.getIceServers(roomId);
        if (iceServersConfig && iceServersConfig.iceServers) {
          // 정규화된 ICE 서버 설정 사용
          const normalizedServers = this.normalizeIceServers(iceServersConfig.iceServers);
          this.rtcConfiguration.iceServers = normalizedServers;
          console.log('✅ [WebRTC] ICE 서버 설정 업데이트 (정규화 완료):', JSON.stringify(this.rtcConfiguration.iceServers, null, 2));
          log.info('ICE 서버 설정 업데이트', this.rtcConfiguration, 'WEBRTC');
        }
      } catch (iceError) {
        log.warn('ICE 서버 조회 실패, 기본 설정 사용', iceError, 'WEBRTC');
      }

      // Join room via API
      const joinResult = await webrtcAPI.joinRoom(roomId, userInfo);
      log.info('WebRTC 룸 입장 성공', joinResult, 'WEBRTC');
      
      // Connect to WebSocket
      const wsUrl = webrtcAPI.getWebSocketURL(roomId, this.userId, this.userName);
      this.ws = new WebSocket(wsUrl);

      this.setupWebSocketHandlers();
      
      // Wait for WebSocket connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, options.connectionTimeout || 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          
          if (this.callbacks.onConnectionStateChange) {
            this.callbacks.onConnectionStateChange('connected');
          }
          
          log.info('WebSocket 연결 성공', { roomId, userId: this.userId }, 'WEBRTC');
          resolve();
        };
        
        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          log.error('WebSocket 연결 실패', error, 'WEBRTC');
          reject(error);
        };
      });

      // Request existing participants
      this.sendMessage({ type: 'get-participants' });
      
    } catch (error) {
      log.error('WebRTC 연결 실패', error, 'WEBRTC');
      this.handleError('Failed to connect to room', error);
      
      // Attempt reconnection if configured
      if (options.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        log.info(`재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`, null, 'WEBRTC');
        
        setTimeout(() => {
          this.connect(roomId, userInfo, options);
        }, this.reconnectDelay * this.reconnectAttempts);
      } else {
        throw error;
      }
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupWebSocketHandlers() {
    this.ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        await this.handleWebSocketMessage(data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      if (this.callbacks.onConnectionStateChange) {
        this.callbacks.onConnectionStateChange('disconnected');
      }
      this.cleanup();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleError('WebSocket connection error', error);
    };
  }

  /**
   * Handle WebSocket messages
   * @param {Object} data - Message data
   */
  async handleWebSocketMessage(data) {
    // 메시지 구조 확인 (디버깅용)
    console.log('📨 [WebRTC] Received message:', data);
    
    // 서버가 보내는 메시지 형식: { type, from, data: signal }
    // data는 전체 메시지 객체
    const { type, from, data: messageData, payload, participant, participantId, userId } = data;

    switch (type) {
      case 'connected':
        // WebSocket 연결 성공 메시지
        console.log('✅ WebSocket connected to room:', this.roomId);
        
        // roomData에 기존 참가자 목록이 있으면 처리
        if (data.roomData && data.roomData.participants && Array.isArray(data.roomData.participants)) {
          console.log('📋 [WebRTC] connected 메시지에서 기존 참가자 목록 발견:', data.roomData.participants);
          await this.handleParticipantsList(data.roomData.participants);
        }
        
        if (this.callbacks.onConnectionStateChange) {
          this.callbacks.onConnectionStateChange('connected');
        }
        break;

      case 'participant-joined':
        // payload 또는 participant 필드 지원
        const joinedParticipant = participant || payload || messageData;
        if (!joinedParticipant) {
          console.warn('⚠️ [WebRTC] participant-joined message missing participant data:', data);
          return;
        }
        this.handleParticipantJoined(joinedParticipant);
        break;

      case 'participant-left':
        // payload, participant, 또는 participantId/userId 필드 지원
        let leftParticipant = participant || payload || messageData;
        
        // participantId나 userId만 있는 경우 객체로 변환
        if (!leftParticipant && (participantId || userId || data.userId)) {
          leftParticipant = {
            userId: participantId || userId || data.userId,
            id: participantId || userId || data.userId
          };
        }
        
        if (!leftParticipant) {
          console.warn('⚠️ [WebRTC] participant-left message missing participant data:', data);
          return;
        }
        this.handleParticipantLeft(leftParticipant);
        break;

      case 'participants-list':
        await this.handleParticipantsList(payload?.participants || messageData?.participants || data.participants);
        break;

      case 'offer':
        // 서버는 { type: 'offer', from: userId, data: offer } 형식으로 보냄
        // messageData가 직접 SDP 객체 { type: 'offer', sdp: '...' }
        const offerSdp = messageData || payload;
        console.log('📥 [WebRTC] Offer 메시지 수신:', { type, from, sdp: offerSdp });
        await this.handleOffer(from, offerSdp);
        break;

      case 'answer':
        // 서버는 { type: 'answer', from: userId, data: answer } 형식으로 보냄
        // messageData가 직접 SDP 객체 { type: 'answer', sdp: '...' }
        const answerSdp = messageData || payload;
        console.log('📥 [WebRTC] Answer 메시지 수신:', { type, from, sdp: answerSdp });
        await this.handleAnswer(from, answerSdp);
        break;

      case 'ice-candidate':
        // 서버는 { type: 'ice-candidate', from: userId, data: candidate } 형식으로 보냄
        // 하지만 실제로는 data가 { to, candidate } 형식일 수 있음
        // 서버가 data.signal || data를 보내므로, data가 { to, candidate }이면 그대로 전달됨
        let candidatePayload = messageData || payload;
        
        // payload가 { to, candidate } 형식인지 확인
        if (candidatePayload && candidatePayload.candidate && candidatePayload.to) {
          // candidate 필드 추출
          candidatePayload = candidatePayload.candidate;
          console.log('📥 [WebRTC] ICE candidate 메시지 수신 (to 필드 제거):', { type, from, candidate: candidatePayload });
        } else {
          console.log('📥 [WebRTC] ICE candidate 메시지 수신:', { type, from, candidate: candidatePayload });
        }
        
        await this.handleIceCandidate(from, candidatePayload);
        break;

      case 'chat-message':
        if (this.callbacks.onChatMessage) {
          this.callbacks.onChatMessage(payload || messageData || data);
        }
        break;

      case 'participant-updated':
        // 참가자 상태 업데이트 (음소거, 카메라 등)
        const updatedParticipant = participant || payload || messageData;
        if (updatedParticipant) {
          console.log('🔄 [WebRTC] 참가자 상태 업데이트:', updatedParticipant);
          if (this.callbacks.onParticipantUpdated) {
            const normalizedParticipant = this.normalizeParticipant(updatedParticipant);
            if (normalizedParticipant) {
              this.callbacks.onParticipantUpdated(normalizedParticipant);
            }
          }
        }
        break;

      default:
        console.warn('Unknown message type:', type, data);
    }
  }

  /**
   * Handle participant joined
   * @param {Object} participant - Participant info
   */
  handleParticipantJoined(participant) {
    console.log('✅ [WebRTC] Participant joined:', participant);
    console.log('🔍 [WebRTC] Participant data type:', typeof participant);
    console.log('🔍 [WebRTC] Participant keys:', participant ? Object.keys(participant) : 'null');

    // participant 데이터 정규화 (id 또는 userId 지원)
    const normalizedParticipant = this.normalizeParticipant(participant);
    
    if (!normalizedParticipant) {
      console.warn('❌ [WebRTC] Invalid participant data in participant-joined message:', participant);
      return;
    }

    console.log('✅ [WebRTC] Normalized participant:', normalizedParticipant);
    console.log('👤 [WebRTC] Current userId:', this.userId);
    console.log('👤 [WebRTC] Participant userId:', normalizedParticipant.userId);

    // 자기 자신이 아닌 경우에만 처리
    if (normalizedParticipant.userId === this.userId) {
      console.log('ℹ️ [WebRTC] 자기 자신의 입장 메시지이므로 무시');
      return;
    }

    if (this.callbacks.onParticipantJoined) {
      console.log('📢 [WebRTC] Calling onParticipantJoined callback');
      this.callbacks.onParticipantJoined(normalizedParticipant);
    } else {
      console.warn('⚠️ [WebRTC] onParticipantJoined callback not registered');
    }

    // Create peer connection for new participant
    console.log('🔗 [WebRTC] Creating peer connection for:', normalizedParticipant.userId);
    // 새로 들어온 참가자에 대해 offer를 생성해야 WebRTC 연결이 시작됩니다
    this.createPeerConnection(normalizedParticipant.userId, true);
  }

  /**
   * Handle participant left
   * @param {Object} participant - Participant info
   */
  handleParticipantLeft(participant) {
    console.log('Participant left:', participant);

    // participant 데이터 정규화 (id 또는 userId 지원)
    const normalizedParticipant = this.normalizeParticipant(participant);
    
    if (!normalizedParticipant) {
      console.warn('Invalid participant data in participant-left message:', participant);
      return;
    }

    const { userId } = normalizedParticipant;

    // Close and remove peer connection
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }

    // Remove remote stream
    const stream = this.remoteStreams.get(userId);
    if (stream) {
      this.remoteStreams.delete(userId);
      if (this.callbacks.onRemoteStreamRemoved) {
        this.callbacks.onRemoteStreamRemoved(userId, stream);
      }
    }

    if (this.callbacks.onParticipantLeft) {
      this.callbacks.onParticipantLeft(normalizedParticipant);
    }
  }

  /**
   * Normalize ICE server URLs to valid format
   * According to WebRTC spec:
   * - STUN URLs must start with "stun:" (e.g., "stun:stun.l.google.com:19302")
   * - TURN URLs must start with "turn:" or "turns:" (e.g., "turn:turn.example.com:3478")
   * - Default ports: STUN/TURN use 3478, TURN over TLS uses 5349
   * 
   * @param {Array} iceServers - ICE servers configuration
   * @returns {Array} Normalized ICE servers
   */
  normalizeIceServers(iceServers) {
    if (!Array.isArray(iceServers)) {
      console.warn('⚠️ [WebRTC] ICE 서버가 배열이 아닙니다:', iceServers);
      return this.rtcConfiguration.iceServers; // 기본 설정 반환
    }

    console.log('🔧 [WebRTC] ICE 서버 정규화 시작:', JSON.stringify(iceServers, null, 2));

    const normalized = iceServers.map((server, index) => {
      console.log(`🔍 [WebRTC] 서버 ${index} 처리 시작:`, JSON.stringify(server, null, 2));
      
      // urls가 문자열인 경우 배열로 변환
      const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
      
      // 각 URL을 정규화
      const normalizedUrls = urls.map(url => {
        if (typeof url !== 'string') {
          console.warn(`⚠️ [WebRTC] URL이 문자열이 아닙니다:`, url);
          return url;
        }

        console.log('🔍 [WebRTC] 정규화 전 URL:', url);

        // 이미 올바른 형식인지 확인 (stun: 또는 turn: 또는 turns:로 시작)
        if (url.match(/^(stun|turn|turns):/i)) {
          console.log('✅ [WebRTC] 이미 올바른 형식:', url);
          return url;
        }

        // STUN 서버 감지 및 정규화
        // 우선순위: cloudflare 포함 > stun.* 패턴 > stun 포함 (turn 미포함)
        const isCloudflare = url.includes('cloudflare');
        const isStunPattern = url.match(/^(stun[0-9]?\.|.*\.stun\.)/i);
        const hasStunButNotTurn = url.includes('stun') && !url.includes('turn');
        
        if (isCloudflare || isStunPattern || hasStunButNotTurn) {
          // 포트가 없으면 기본 포트 3478 추가
          if (!url.includes(':')) {
            const normalized = `stun:${url}:3478`;
            console.log('🔧 [WebRTC] STUN URL 정규화 (포트 추가):', url, '->', normalized);
            return normalized;
          }
          const normalized = `stun:${url}`;
          console.log('🔧 [WebRTC] STUN URL 정규화:', url, '->', normalized);
          return normalized;
        }

        // TURN 서버 감지 및 정규화 (username/credential이 있으면 TURN으로 간주)
        if (server.username || server.credential) {
          // 포트 번호가 있는지 확인
          if (url.includes(':')) {
            // TLS 포트(5349)를 사용하는 경우 turns: 사용
            const port = url.split(':').pop();
            const isTLS = port === '5349' || port === '443' || url.includes('tls') || url.includes('ssl');
            const protocol = isTLS ? 'turns' : 'turn';
            const normalized = `${protocol}:${url}`;
            console.log('🔧 [WebRTC] TURN URL 정규화:', url, '->', normalized);
            return normalized;
          }
          // 포트가 없으면 기본 포트 추가 (일반 TURN은 3478)
          const normalized = `turn:${url}:3478`;
          console.log('🔧 [WebRTC] TURN URL 정규화 (포트 추가):', url, '->', normalized);
          return normalized;
        }

        // 알 수 없는 형식은 stun:으로 가정하고 정규화 시도
        // (많은 경우 STUN 서버일 가능성이 높음)
        const normalized = `stun:${url}`;
        console.warn('⚠️ [WebRTC] 알 수 없는 ICE 서버 URL 형식, STUN으로 가정:', url, '->', normalized);
        return normalized;
      });

      const result = {
        ...server,
        urls: normalizedUrls.length === 1 ? normalizedUrls[0] : normalizedUrls
      };
      
      console.log(`✅ [WebRTC] 서버 ${index} 정규화 완료:`, JSON.stringify(result, null, 2));
      return result;
    });

    console.log('✅ [WebRTC] 정규화된 ICE 서버:', JSON.stringify(normalized, null, 2));
    return normalized;
  }

  /**
   * Normalize participant data (supports both 'id' and 'userId' fields)
   * @param {Object} participant - Participant data
   * @returns {Object|null} Normalized participant object
   */
  normalizeParticipant(participant) {
    if (!participant) return null;

    // 이미 정규화된 경우
    if (participant.userId) {
      return participant;
    }

    // id 필드가 있는 경우 userId로 변환
    if (participant.id) {
      return {
        ...participant,
        userId: participant.id,
        name: participant.name || participant.userName || 'Anonymous',
        userName: participant.userName || participant.name || 'Anonymous'
      };
    }

    // 문자열인 경우 (userId만 전달된 경우)
    if (typeof participant === 'string') {
      return {
        userId: participant,
        id: participant,
        name: 'Anonymous',
        userName: 'Anonymous'
      };
    }

    return null;
  }

  /**
   * Handle participants list
   * @param {Array} participants - List of participants
   */
  async handleParticipantsList(participants) {
    console.log('📋 [WebRTC] 참가자 목록 수신:', participants);
    console.log('👤 [WebRTC] 현재 사용자 ID:', this.userId);

    // Notify UI about all participants
    if (participants && participants.length > 0) {
      participants.forEach(participant => {
        // participant 데이터 정규화 (id 또는 userId 지원)
        const normalizedParticipant = this.normalizeParticipant(participant);
        
        if (!normalizedParticipant) {
          console.warn('⚠️ [WebRTC] 참가자 데이터 정규화 실패:', participant);
          return;
        }

        if (normalizedParticipant.userId && normalizedParticipant.userId !== this.userId) {
          console.log('➕ [WebRTC] 기존 참가자 알림:', normalizedParticipant);
          if (this.callbacks.onParticipantJoined) {
            this.callbacks.onParticipantJoined(normalizedParticipant);
          }
        }
      });
    }

    // Create peer connections for existing participants
    for (const participant of participants) {
      // participant 데이터 정규화
      const normalizedParticipant = this.normalizeParticipant(participant);
      
      if (!normalizedParticipant) {
        console.warn('⚠️ [WebRTC] 참가자 데이터 정규화 실패 (피어 연결 생성 스킵):', participant);
        continue;
      }

      if (normalizedParticipant.userId && normalizedParticipant.userId !== this.userId) {
        console.log('🔗 [WebRTC] 피어 연결 생성 시작:', normalizedParticipant.userId);
        await this.createPeerConnection(normalizedParticipant.userId, true);
      }
    }
  }

  /**
   * Create peer connection
   * @param {string} remoteUserId - Remote user ID
   * @param {boolean} createOffer - Whether to create offer
   * @returns {RTCPeerConnection}
   */
  async createPeerConnection(remoteUserId, createOffer = false) {
    if (this.peerConnections.has(remoteUserId)) {
      console.log('⚠️ [WebRTC] 이미 존재하는 피어 연결:', remoteUserId);
      return this.peerConnections.get(remoteUserId);
    }

    console.log(`🔗 [WebRTC] 새 피어 연결 생성: ${remoteUserId}, createOffer: ${createOffer}`);
    
    // ICE 서버 설정을 먼저 필터링 (잘못된 형식 제거)
    const rawIceServers = this.rtcConfiguration.iceServers || [];
    console.log('🔧 [WebRTC] 원본 ICE 서버 설정:', JSON.stringify(rawIceServers, null, 2));
    
    // 잘못된 형식의 URL을 즉시 제거하고 정규화
    const filteredIceServers = rawIceServers.filter(server => {
      if (!server || !server.urls) return false;
      const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
      return urls.some(url => {
        if (typeof url !== 'string') return true;
        // 이미 올바른 형식이거나, 정규화 가능한 형식인지 확인
        return url.match(/^(stun|turn|turns):/i) || 
               url.includes('cloudflare') || 
               url.includes('stun') || 
               url.includes('turn');
      });
    });
    
    console.log('🔧 [WebRTC] 필터링된 ICE 서버:', JSON.stringify(filteredIceServers, null, 2));
    console.log('🔧 [WebRTC] normalizeIceServers 함수 존재 여부:', typeof this.normalizeIceServers);
    
    // RTCPeerConnection 생성 전에 ICE 서버 설정을 다시 정규화 (안전장치)
    let normalizedIceServers;
    try {
      console.log('🔧 [WebRTC] normalizeIceServers 함수 호출 시작');
      normalizedIceServers = this.normalizeIceServers(filteredIceServers.length > 0 ? filteredIceServers : rawIceServers);
      console.log('✅ [WebRTC] 정규화 완료, 결과:', JSON.stringify(normalizedIceServers, null, 2));
    } catch (normalizeError) {
      console.error('❌ [WebRTC] ICE 서버 정규화 실패:', normalizeError);
      console.error('❌ [WebRTC] 정규화 에러 스택:', normalizeError?.stack);
      // 정규화 실패 시 기본 설정 사용
      normalizedIceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ];
      console.log('⚠️ [WebRTC] 기본 ICE 서버 설정 사용');
    }
    
    // 정규화된 서버로 설정 업데이트 (다음 연결을 위해)
    this.rtcConfiguration.iceServers = normalizedIceServers;
    
    const config = {
      ...this.rtcConfiguration,
      iceServers: normalizedIceServers
    };
    
    console.log('✅ [WebRTC] 최종 RTCPeerConnection 설정:', JSON.stringify(config, null, 2));
    
    let pc; // 함수 스코프에서 선언
    try {
      pc = new RTCPeerConnection(config);
      this.peerConnections.set(remoteUserId, pc);
      console.log('✅ [WebRTC] RTCPeerConnection 생성 성공');
    } catch (error) {
      console.error('❌ [WebRTC] RTCPeerConnection 생성 실패:', error);
      console.error('❌ [WebRTC] 시도한 설정:', JSON.stringify(config, null, 2));
      console.error('❌ [WebRTC] ICE 서버 설정 상세:', JSON.stringify(config.iceServers, null, 2));
      
      // 마지막 시도: 기본 설정으로 재시도
      console.log('🔄 [WebRTC] 기본 설정으로 재시도...');
      const fallbackConfig = {
        ...this.rtcConfiguration,
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      };
      try {
        pc = new RTCPeerConnection(fallbackConfig);
        this.peerConnections.set(remoteUserId, pc);
        console.log('✅ [WebRTC] 기본 설정으로 RTCPeerConnection 생성 성공');
        // 기본 설정으로 업데이트
        this.rtcConfiguration.iceServers = fallbackConfig.iceServers;
      } catch (fallbackError) {
        console.error('❌ [WebRTC] 기본 설정으로도 실패:', fallbackError);
        throw error; // 원래 에러를 throw
      }
    }

    // Add local stream tracks
    if (this.localStream && pc) {
      console.log(`📤 [WebRTC] 로컬 스트림 트랙 추가 (${remoteUserId}):`, this.localStream.getTracks().map(t => t.kind));
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    } else {
      console.warn('⚠️ [WebRTC] 로컬 스트림 없음 - 트랙을 추가할 수 없습니다');
    }

    // Handle incoming tracks
    if (pc) {
      pc.ontrack = (event) => {
        console.log(`📥 [WebRTC] 원격 트랙 수신 (${remoteUserId}):`, event.track.kind);
        const [stream] = event.streams;
        console.log(`🎥 [WebRTC] 원격 스트림 저장 (${remoteUserId}):`, stream.id, stream.getTracks().map(t => t.kind));
        this.remoteStreams.set(remoteUserId, stream);
        if (this.callbacks.onRemoteStream) {
          console.log(`✅ [WebRTC] onRemoteStream 콜백 호출 (${remoteUserId})`);
          this.callbacks.onRemoteStream(remoteUserId, stream);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`🧊 [WebRTC] ICE 후보 전송 (${remoteUserId}):`, event.candidate);
          // RTCIceCandidate 객체를 JSON으로 직렬화 (toJSON() 메서드 사용)
          const candidateData = event.candidate.toJSON();
          this.sendMessage({
            type: 'ice-candidate',
            data: {
              to: remoteUserId,
              candidate: candidateData,
            },
          });
        } else {
          // null candidate는 ICE gathering 완료를 의미
          console.log(`✅ [WebRTC] ICE gathering 완료 (${remoteUserId})`);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`🔄 [WebRTC] 연결 상태 변경 (${remoteUserId}): ${pc.connectionState}`);
      };

      // ICE connection state monitoring
      pc.oniceconnectionstatechange = () => {
        console.log(`🧊 [WebRTC] ICE 연결 상태 (${remoteUserId}): ${pc.iceConnectionState}`);
      };

      // Create offer if needed
      if (createOffer) {
        try {
          console.log(`📝 [WebRTC] Offer 생성 시작 (${remoteUserId})`);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log(`📤 [WebRTC] Offer 전송 (${remoteUserId})`);
          this.sendMessage({
            type: 'offer',
            data: {
              to: remoteUserId,
              signal: offer,
            },
          });
        } catch (error) {
          console.error(`❌ [WebRTC] Offer 생성 실패 (${remoteUserId}):`, error);
          this.handleError('Failed to create offer', error);
        }
      }
    }

    return pc;
  }

  /**
   * Handle offer
   * @param {string} from - Sender user ID
   * @param {Object} payload - Offer payload
   */
  async handleOffer(from, payload) {
    try {
      console.log('📥 [WebRTC] handleOffer 호출:', { from, payload });
      console.log('📥 [WebRTC] payload 타입:', typeof payload);
      console.log('📥 [WebRTC] payload 키:', payload ? Object.keys(payload) : 'null');
      
      const pc = await this.createPeerConnection(from);
      
      // payload는 서버에서 { type, from, data: offer } 형식으로 받았고
      // data 필드가 직접 SDP 객체 { type: 'offer', sdp: '...' }입니다
      if (!payload) {
        throw new Error('Offer payload is null or undefined');
      }
      
      // SDP 객체 검증
      if (typeof payload !== 'object') {
        throw new Error('Invalid offer payload type: ' + typeof payload);
      }
      
      // payload가 이미 SDP 객체인지 확인
      if (payload.type && payload.sdp) {
        // 이미 올바른 형식: { type: 'offer', sdp: '...' }
        console.log('✅ [WebRTC] SDP 객체 형식 확인됨:', { type: payload.type, sdpLength: payload.sdp.length });
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
      } else {
        // payload가 다른 형식일 수 있음 (예: { sdp: { type, sdp } })
        console.warn('⚠️ [WebRTC] 예상과 다른 payload 형식:', payload);
        throw new Error('SDP must have type and sdp fields');
      }
      
      // remote description 설정 후 대기 중인 ICE candidates 처리
      if (this.pendingIceCandidates.has(from)) {
        const pending = this.pendingIceCandidates.get(from);
        console.log(`🔄 [WebRTC] ${pending.length}개의 대기 중인 ICE candidate 처리`);
        for (const candidateData of pending) {
          try {
            // candidateData가 { to, candidate } 형식일 수 있으므로 처리
            let candidate = candidateData;
            
            // 문자열인 경우 파싱
            if (typeof candidateData === 'string') {
              candidate = {
                candidate: candidateData,
                sdpMid: null,
                sdpMLineIndex: null
              };
              // sdpMid와 sdpMLineIndex 추론
              if (candidateData.includes('audio') || candidateData.includes('rtp')) {
                candidate.sdpMLineIndex = 0;
                candidate.sdpMid = '0';
              } else if (candidateData.includes('video')) {
                candidate.sdpMLineIndex = 1;
                candidate.sdpMid = '1';
              } else {
                candidate.sdpMLineIndex = 0;
                candidate.sdpMid = '0';
              }
            }
            // 객체인 경우
            else if (candidateData && typeof candidateData === 'object') {
              if (candidateData.candidate && candidateData.to) {
                candidate = candidateData.candidate;
                // candidate가 문자열인 경우 객체로 변환
                if (typeof candidate === 'string') {
                  candidate = {
                    candidate: candidate,
                    sdpMid: candidateData.sdpMid !== undefined ? candidateData.sdpMid : null,
                    sdpMLineIndex: candidateData.sdpMLineIndex !== undefined ? candidateData.sdpMLineIndex : null
                  };
                  if (!candidate.sdpMid && !candidate.sdpMLineIndex) {
                    if (candidate.candidate.includes('audio') || candidate.candidate.includes('rtp')) {
                      candidate.sdpMLineIndex = 0;
                      candidate.sdpMid = '0';
                    } else if (candidate.candidate.includes('video')) {
                      candidate.sdpMLineIndex = 1;
                      candidate.sdpMid = '1';
                    } else {
                      candidate.sdpMLineIndex = 0;
                      candidate.sdpMid = '0';
                    }
                  }
                } else {
                  // candidate가 이미 객체인 경우
                  candidate = {
                    candidate: candidate.candidate || candidate,
                    sdpMid: candidate.sdpMid !== undefined ? candidate.sdpMid : (candidateData.sdpMid !== undefined ? candidateData.sdpMid : null),
                    sdpMLineIndex: candidate.sdpMLineIndex !== undefined ? candidate.sdpMLineIndex : (candidateData.sdpMLineIndex !== undefined ? candidateData.sdpMLineIndex : null)
                  };
                }
              } else if (candidateData.candidate && !candidateData.to) {
                candidate = candidateData.candidate;
                // candidate가 문자열인 경우 객체로 변환
                if (typeof candidate === 'string') {
                  candidate = {
                    candidate: candidate,
                    sdpMid: candidateData.sdpMid !== undefined ? candidateData.sdpMid : null,
                    sdpMLineIndex: candidateData.sdpMLineIndex !== undefined ? candidateData.sdpMLineIndex : null
                  };
                  if (!candidate.sdpMid && !candidate.sdpMLineIndex) {
                    if (candidate.candidate.includes('audio') || candidate.candidate.includes('rtp')) {
                      candidate.sdpMLineIndex = 0;
                      candidate.sdpMid = '0';
                    } else if (candidate.candidate.includes('video')) {
                      candidate.sdpMLineIndex = 1;
                      candidate.sdpMid = '1';
                    } else {
                      candidate.sdpMLineIndex = 0;
                      candidate.sdpMid = '0';
                    }
                  }
                } else {
                  // candidate가 이미 객체인 경우, sdpMid와 sdpMLineIndex 보존
                  candidate = {
                    candidate: candidate.candidate || candidate,
                    sdpMid: candidate.sdpMid !== undefined ? candidate.sdpMid : (candidateData.sdpMid !== undefined ? candidateData.sdpMid : null),
                    sdpMLineIndex: candidate.sdpMLineIndex !== undefined ? candidate.sdpMLineIndex : (candidateData.sdpMLineIndex !== undefined ? candidateData.sdpMLineIndex : null)
                  };
                }
              } else if (candidateData.candidate || candidateData.sdpMid !== undefined || candidateData.sdpMLineIndex !== undefined) {
                // 이미 RTCIceCandidateInit 형식인 경우
                candidate = {
                  candidate: candidateData.candidate || '',
                  sdpMid: candidateData.sdpMid !== undefined ? candidateData.sdpMid : null,
                  sdpMLineIndex: candidateData.sdpMLineIndex !== undefined ? candidateData.sdpMLineIndex : null
                };
              }
              
              // sdpMid와 sdpMLineIndex가 모두 null이면 기본값 설정
              if (candidate && candidate.candidate && candidate.sdpMid === null && candidate.sdpMLineIndex === null) {
                const candidateStr = candidate.candidate || '';
                if (candidateStr.includes('audio') || candidateStr.includes('rtp')) {
                  candidate.sdpMLineIndex = 0;
                  candidate.sdpMid = '0';
                } else if (candidateStr.includes('video')) {
                  candidate.sdpMLineIndex = 1;
                  candidate.sdpMid = '1';
                } else {
                  candidate.sdpMLineIndex = 0;
                  candidate.sdpMid = '0';
                }
              }
            }
            
            // candidate 유효성 검사
            if (!candidate || !candidate.candidate) {
              console.warn('⚠️ [WebRTC] 유효하지 않은 candidate:', candidateData);
              continue;
            }
            
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.warn('⚠️ [WebRTC] 대기 중인 ICE candidate 처리 실패:', err, 'candidateData:', candidateData);
          }
        }
        this.pendingIceCandidates.delete(from);
      }
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      console.log('📤 [WebRTC] Answer 생성 및 전송:', { type: answer.type, sdpLength: answer.sdp.length });
      this.sendMessage({
        type: 'answer',
        data: {
          to: from,
          signal: answer,
        },
      });
    } catch (error) {
      console.error('❌ [WebRTC] Failed to handle offer:', error);
      console.error('❌ [WebRTC] Payload was:', payload);
      console.error('❌ [WebRTC] Error stack:', error.stack);
      this.handleError('Failed to handle offer', error);
    }
  }

  /**
   * Handle answer
   * @param {string} from - Sender user ID
   * @param {Object} payload - Answer payload
   */
  async handleAnswer(from, payload) {
    try {
      console.log('📥 [WebRTC] handleAnswer 호출:', { from, payload });
      console.log('📥 [WebRTC] payload 타입:', typeof payload);
      console.log('📥 [WebRTC] payload 키:', payload ? Object.keys(payload) : 'null');
      
      const pc = this.peerConnections.get(from);
      if (!pc) {
        console.error('❌ [WebRTC] Peer connection not found for:', from);
        return;
      }
      
      // signaling state 확인
      const signalingState = pc.signalingState;
      console.log('🔍 [WebRTC] Current signaling state:', signalingState);
      
      // 이미 stable 상태면 answer를 설정할 수 없음 (이미 처리되었거나 offer가 없는 상태)
      if (signalingState === 'stable') {
        console.warn('⚠️ [WebRTC] Cannot set remote answer: signaling state is already stable');
        // remote description이 이미 설정되어 있는지 확인
        if (pc.remoteDescription) {
          console.log('✅ [WebRTC] Remote description already set, skipping answer');
          return;
        } else {
          console.warn('⚠️ [WebRTC] Signaling state is stable but no remote description - this is unexpected');
        }
      }
      
      // have-local-offer 상태가 아니면 answer를 받을 수 없음
      if (signalingState !== 'have-local-offer') {
        console.warn(`⚠️ [WebRTC] Unexpected signaling state for answer: ${signalingState}. Expected: have-local-offer`);
        // 이미 answered 상태일 수 있음
        if (signalingState === 'stable') {
          console.log('✅ [WebRTC] Already in stable state, answer may have been processed');
          return;
        }
      }
      
      // payload는 서버에서 { type, from, data: answer } 형식으로 받았고
      // data 필드가 직접 SDP 객체 { type: 'answer', sdp: '...' }입니다
      if (!payload) {
        throw new Error('Answer payload is null or undefined');
      }
      
      if (typeof payload !== 'object') {
        throw new Error('Invalid answer payload type: ' + typeof payload);
      }
      
      // payload가 이미 SDP 객체인지 확인
      if (payload.type && payload.sdp) {
        // 이미 올바른 형식: { type: 'answer', sdp: '...' }
        console.log('✅ [WebRTC] SDP 객체 형식 확인됨:', { type: payload.type, sdpLength: payload.sdp.length });
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
      } else {
        console.warn('⚠️ [WebRTC] 예상과 다른 payload 형식:', payload);
        throw new Error('SDP must have type and sdp fields');
      }
      
      // remote description 설정 후 대기 중인 ICE candidates 처리
      if (this.pendingIceCandidates.has(from)) {
        const pending = this.pendingIceCandidates.get(from);
        console.log(`🔄 [WebRTC] ${pending.length}개의 대기 중인 ICE candidate 처리`);
        for (const candidateData of pending) {
          try {
            // candidateData가 { to, candidate } 형식일 수 있으므로 처리
            let candidate = candidateData;
            
            // 문자열인 경우 파싱
            if (typeof candidateData === 'string') {
              candidate = {
                candidate: candidateData,
                sdpMid: null,
                sdpMLineIndex: null
              };
              // sdpMid와 sdpMLineIndex 추론
              if (candidateData.includes('audio') || candidateData.includes('rtp')) {
                candidate.sdpMLineIndex = 0;
                candidate.sdpMid = '0';
              } else if (candidateData.includes('video')) {
                candidate.sdpMLineIndex = 1;
                candidate.sdpMid = '1';
              } else {
                candidate.sdpMLineIndex = 0;
                candidate.sdpMid = '0';
              }
            }
            // 객체인 경우
            else if (candidateData && typeof candidateData === 'object') {
              if (candidateData.candidate && candidateData.to) {
                candidate = candidateData.candidate;
                // candidate가 문자열인 경우 객체로 변환
                if (typeof candidate === 'string') {
                  candidate = {
                    candidate: candidate,
                    sdpMid: null,
                    sdpMLineIndex: null
                  };
                  if (candidate.candidate.includes('audio') || candidate.candidate.includes('rtp')) {
                    candidate.sdpMLineIndex = 0;
                    candidate.sdpMid = '0';
                  } else if (candidate.candidate.includes('video')) {
                    candidate.sdpMLineIndex = 1;
                    candidate.sdpMid = '1';
                  } else {
                    candidate.sdpMLineIndex = 0;
                    candidate.sdpMid = '0';
                  }
                }
              } else if (candidateData.candidate && !candidateData.to) {
                candidate = candidateData.candidate;
                // candidate가 문자열인 경우 객체로 변환
                if (typeof candidate === 'string') {
                  candidate = {
                    candidate: candidate,
                    sdpMid: null,
                    sdpMLineIndex: null
                  };
                  if (candidate.candidate.includes('audio') || candidate.candidate.includes('rtp')) {
                    candidate.sdpMLineIndex = 0;
                    candidate.sdpMid = '0';
                  } else if (candidate.candidate.includes('video')) {
                    candidate.sdpMLineIndex = 1;
                    candidate.sdpMid = '1';
                  } else {
                    candidate.sdpMLineIndex = 0;
                    candidate.sdpMid = '0';
                  }
                }
              }
              
              // sdpMid와 sdpMLineIndex가 모두 null이면 기본값 설정
              if (candidate && typeof candidate === 'object' && candidate.sdpMid === null && candidate.sdpMLineIndex === null) {
                const candidateStr = candidate.candidate || '';
                if (candidateStr.includes('audio') || candidateStr.includes('rtp')) {
                  candidate.sdpMLineIndex = 0;
                  candidate.sdpMid = '0';
                } else if (candidateStr.includes('video')) {
                  candidate.sdpMLineIndex = 1;
                  candidate.sdpMid = '1';
                } else {
                  candidate.sdpMLineIndex = 0;
                  candidate.sdpMid = '0';
                }
              }
            }
            
            // candidate가 유효한 객체인지 확인
            if (!candidate || typeof candidate !== 'object' || !candidate.candidate) {
              console.warn('⚠️ [WebRTC] 대기 중인 ICE candidate가 유효하지 않음:', candidateData);
              continue;
            }
            
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.warn('⚠️ [WebRTC] 대기 중인 ICE candidate 처리 실패:', err);
          }
        }
        this.pendingIceCandidates.delete(from);
      }
    } catch (error) {
      console.error('❌ [WebRTC] Failed to handle answer:', error);
      console.error('❌ [WebRTC] Payload was:', payload);
      console.error('❌ [WebRTC] Error stack:', error.stack);
      this.handleError('Failed to handle answer', error);
    }
  }

  /**
   * Handle ICE candidate
   * @param {string} from - Sender user ID
   * @param {Object} payload - ICE candidate payload
   */
  async handleIceCandidate(from, payload) {
    try {
      const pc = this.peerConnections.get(from);
      if (!pc) {
        console.warn('⚠️ [WebRTC] Peer connection not found for:', from);
        return;
      }
      
      // payload 디버깅
      console.log('🔍 [WebRTC] handleIceCandidate payload:', {
        type: typeof payload,
        keys: payload ? Object.keys(payload) : 'null',
        hasCandidate: payload?.candidate !== undefined,
        hasTo: payload?.to !== undefined,
        payload: payload
      });
      
      // remote description이 설정되지 않았으면 ICE candidate를 큐에 저장
      if (pc.remoteDescription === null) {
        console.log('⏳ [WebRTC] Remote description이 없어 ICE candidate를 대기 중:', payload);
        // 큐에 저장하기 전에 candidate 필드 추출
        let candidateToQueue = payload;
        if (payload && typeof payload === 'object' && payload.candidate && payload.to) {
          candidateToQueue = payload.candidate;
        } else if (payload && typeof payload === 'object' && payload.candidate && !payload.to) {
          candidateToQueue = payload.candidate;
        }
        // payload 자체가 문자열인 경우 그대로 저장
        if (!this.pendingIceCandidates.has(from)) {
          this.pendingIceCandidates.set(from, []);
        }
        this.pendingIceCandidates.get(from).push(candidateToQueue);
        return;
      }
      
      // payload는 직접 RTCIceCandidateInit 객체이거나 null
      // null candidate는 연결이 완료되었음을 의미하므로 무시
      if (payload === null || payload === undefined) {
        console.log('✅ [WebRTC] ICE gathering 완료 (null candidate)');
        return;
      }
      
      // payload가 여전히 { to, candidate } 형식일 수 있음 (방어적 처리)
      let candidate = payload;
      if (payload && typeof payload === 'object') {
        // { to, candidate } 형식인지 확인
        if (payload.candidate && payload.to) {
          console.log('🔍 [WebRTC] {to, candidate} 형식 감지, candidate 필드 추출');
          // sdpMid와 sdpMLineIndex가 payload에 있으면 보존
          candidate = {
            candidate: payload.candidate,
            sdpMid: payload.sdpMid !== undefined ? payload.sdpMid : null,
            sdpMLineIndex: payload.sdpMLineIndex !== undefined ? payload.sdpMLineIndex : null
          };
        }
        // candidate 필드가 직접 있는 경우
        else if (payload.candidate && !payload.to) {
          console.log('🔍 [WebRTC] {candidate} 형식 감지, candidate 필드 사용');
          // sdpMid와 sdpMLineIndex가 payload에 있으면 보존
          candidate = {
            candidate: payload.candidate,
            sdpMid: payload.sdpMid !== undefined ? payload.sdpMid : null,
            sdpMLineIndex: payload.sdpMLineIndex !== undefined ? payload.sdpMLineIndex : null
          };
        }
        // payload 자체가 candidate 객체인 경우
        else if (payload.candidate || payload.sdpMid !== undefined || payload.sdpMLineIndex !== undefined) {
          console.log('🔍 [WebRTC] 직접 candidate 객체 형식');
          candidate = payload;
        }
      }
      
      // candidate가 문자열인 경우 파싱 (서버에서 직접 문자열로 보낼 수 있음)
      if (typeof candidate === 'string') {
        console.log('🔍 [WebRTC] Candidate가 문자열 형식, 파싱 필요:', candidate.substring(0, 80));
        // candidate 문자열을 파싱하여 RTCIceCandidateInit 객체로 변환
        // 형식: "candidate:foundation component protocol priority ip port typ type ..."
        const candidateStr = candidate;
        if (!candidateStr.includes('candidate:')) {
          console.warn('⚠️ [WebRTC] Invalid candidate string format (missing candidate: prefix):', candidateStr.substring(0, 80));
          return;
        }
        
        // payload에 sdpMid와 sdpMLineIndex가 있으면 사용, 없으면 추론
        let sdpMid = null;
        let sdpMLineIndex = null;
        
        if (payload && typeof payload === 'object') {
          sdpMid = payload.sdpMid !== undefined ? payload.sdpMid : null;
          sdpMLineIndex = payload.sdpMLineIndex !== undefined ? payload.sdpMLineIndex : null;
        }
        
        // candidate 문자열에서 sdpMid와 sdpMLineIndex 추출 시도
        // 일반적으로 sdpMid와 sdpMLineIndex는 candidate 문자열에 포함되지 않으므로
        // 기본값을 사용하거나 SDP에서 추론해야 함
        candidate = {
          candidate: candidateStr,
          sdpMid: sdpMid,
          sdpMLineIndex: sdpMLineIndex
        };
        
        // sdpMid와 sdpMLineIndex가 모두 null이면 추론
        if (candidate.sdpMid === null && candidate.sdpMLineIndex === null) {
          // sdpMid와 sdpMLineIndex를 추론 (candidate 문자열에서 직접 추론 불가능하므로 기본값 사용)
          // 실제로는 이전에 수신한 candidate들에서 패턴을 찾거나 SDP를 분석해야 하지만,
          // 여기서는 기본값으로 처리
          if (candidateStr.includes('audio') || candidateStr.includes('rtp')) {
            candidate.sdpMLineIndex = 0;
            candidate.sdpMid = '0';
          } else if (candidateStr.includes('video')) {
            candidate.sdpMLineIndex = 1;
            candidate.sdpMid = '1';
          } else {
            // 기본값으로 0 설정 (대부분의 경우 첫 번째 m-line이 audio)
            candidate.sdpMLineIndex = 0;
            candidate.sdpMid = '0';
          }
        }
        
        console.log('✅ [WebRTC] 문자열 candidate를 객체로 변환:', {
          candidate: candidateStr.substring(0, 50),
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex
        });
      }
      
      // candidate 객체 검증
      if (!candidate || typeof candidate !== 'object') {
        console.warn('⚠️ [WebRTC] Invalid candidate format:', candidate);
        return;
      }
      
      // candidate 필드가 문자열인지 확인 (RTCIceCandidateInit 형식)
      if (!candidate.candidate && candidate.candidate !== null) {
        console.warn('⚠️ [WebRTC] Candidate 객체에 candidate 필드가 없음:', candidate);
        return;
      }
      
      // sdpMid와 sdpMLineIndex가 모두 null이면 건너뛰기 (종료 candidate)
      if (candidate.candidate === null || candidate.candidate === '') {
        console.log('✅ [WebRTC] ICE gathering 완료 (null/empty candidate string)');
        return;
      }

      // ICE candidate 문자열 검증
      const candidateStr = candidate.candidate || '';

      // TCP candidate with port 9 필터링 (잘못된 형식)
      if (candidateStr.includes('tcp') && candidateStr.includes(' 9 typ ')) {
        console.warn('⚠️ [WebRTC] Invalid TCP candidate with port 9 skipped:', candidateStr.substring(0, 80));
        return;
      }

      // 필수 필드 검증
      if (!candidateStr.includes('candidate:')) {
        console.warn('⚠️ [WebRTC] Invalid candidate format (missing candidate: prefix):', candidateStr.substring(0, 80));
        return;
      }

      // sdpMid와 sdpMLineIndex가 모두 null이면 기본값 설정 시도
      if (candidate.sdpMid === null && candidate.sdpMLineIndex === null) {
        console.warn('⚠️ [WebRTC] sdpMid와 sdpMLineIndex가 모두 null, 기본값 설정 시도');
        // SDP에서 m-line 인덱스 추정 시도 (보수적 접근)
        if (candidateStr.includes('audio')) {
          candidate.sdpMLineIndex = 0;
          candidate.sdpMid = '0';
        } else if (candidateStr.includes('video')) {
          candidate.sdpMLineIndex = 1;
          candidate.sdpMid = '1';
        } else {
          // 기본값으로 0 설정
          candidate.sdpMLineIndex = 0;
          candidate.sdpMid = '0';
        }
      }

      // RTCIceCandidate 생성 및 추가 (try-catch로 개별 candidate 오류 처리)
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (candidateError) {
        console.warn('⚠️ [WebRTC] Failed to add ICE candidate (skipping):', {
          error: candidateError.message,
          candidate: candidateStr.substring(0, 80)
        });
        return;
      }
      console.log('✅ [WebRTC] ICE candidate 추가 성공:', { 
        from, 
        candidate: candidate.candidate?.substring(0, 50),
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex
      });
    } catch (error) {
      console.error('❌ [WebRTC] Failed to handle ICE candidate:', error);
      console.error('❌ [WebRTC] Payload was:', payload);
      console.error('❌ [WebRTC] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      // 에러를 무시하지 않고 로그만 남김 (ICE candidate는 실패해도 연결은 가능)
    }
  }

  /**
   * Send message via WebSocket
   * @param {Object} message - Message to send
   */
  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  /**
   * Send chat message
   * @param {string} text - Message text
   */
  sendChatMessage(text) {
    this.sendMessage({
      type: 'chat-message',
      payload: {
        userId: this.userId,
        userName: this.userName,
        text,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Toggle audio
   * @param {boolean} enabled - Whether audio should be enabled
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      
      // 서버에 상태 전송
      this.sendMessage({
        type: 'toggle-audio',
        data: { enabled }
      });
    }
  }

  /**
   * Toggle video
   * @param {boolean} enabled - Whether video should be enabled
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      
      // 서버에 상태 전송
      this.sendMessage({
        type: 'toggle-video',
        data: { enabled }
      });
    }
  }

  /**
   * Toggle screen sharing
   * @param {boolean} enabled - Whether screen sharing is enabled
   */
  toggleScreenShare(enabled) {
    // 서버에 화면 공유 상태 전송
    this.sendMessage({
      type: 'toggle-screen-share',
      data: { enabled }
    });
  }

  /**
   * Switch media device or replace track
   * @param {string} kind - Device kind ('audioinput' or 'videoinput')
   * @param {string|MediaStreamTrack} deviceIdOrTrack - Device ID or MediaStreamTrack object
   */
  async switchDevice(kind, deviceIdOrTrack) {
    try {
      let newTrack;
      let newStream = null;

      // If deviceIdOrTrack is a MediaStreamTrack, use it directly (for screen sharing)
      if (deviceIdOrTrack instanceof MediaStreamTrack) {
        newTrack = deviceIdOrTrack;
        console.log(`🔄 [WebRTC] 트랙 직접 교체 (${kind}):`, newTrack.label);
      } else {
        // Otherwise, get media from device
        const constraints = {
          audio: kind === 'audioinput' ? { deviceId: deviceIdOrTrack } : this.localStream?.getAudioTracks().length > 0,
          video: kind === 'videoinput' ? { deviceId: deviceIdOrTrack } : this.localStream?.getVideoTracks().length > 0,
        };

        newStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Get the track from the new stream
        newTrack = kind === 'audioinput' 
          ? newStream.getAudioTracks()[0]
          : newStream.getVideoTracks()[0];
      }
      
      if (!newTrack) {
        throw new Error(`Failed to get ${kind} track`);
      }

      // Find and replace old track
      const oldTrack = kind === 'audioinput'
        ? this.localStream?.getAudioTracks()[0]
        : this.localStream?.getVideoTracks()[0];

      if (!oldTrack) {
        console.warn(`⚠️ [WebRTC] 기존 ${kind} 트랙을 찾을 수 없습니다`);
        // If no old track, just add the new one
        if (this.localStream && newTrack) {
          this.localStream.addTrack(newTrack);
          // Add track to all peer connections
          this.peerConnections.forEach(pc => {
            pc.addTrack(newTrack, this.localStream);
          });
        }
      } else {
        // Replace tracks in peer connections
        this.peerConnections.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track === oldTrack);
          if (sender) {
            sender.replaceTrack(newTrack);
            console.log(`✅ [WebRTC] 피어 연결에서 트랙 교체 완료 (${kind})`);
          } else {
            // If sender not found, add track instead
            pc.addTrack(newTrack, this.localStream);
            console.log(`➕ [WebRTC] 피어 연결에 트랙 추가 (${kind})`);
          }
        });

        // Update local stream
        if (this.localStream) {
          this.localStream.removeTrack(oldTrack);
          this.localStream.addTrack(newTrack);
          oldTrack.stop();
          console.log(`🔄 [WebRTC] 로컬 스트림에서 트랙 교체 완료 (${kind})`);
        }
      }

      // Stop the stream if it was created (not screen sharing)
      if (newStream && newTrack !== deviceIdOrTrack) {
        // Stop other tracks in the stream that we didn't use
        newStream.getTracks().forEach(track => {
          if (track !== newTrack) {
            track.stop();
          }
        });
      }

      // Notify callback
      if (this.callbacks.onLocalStream && this.localStream) {
        this.callbacks.onLocalStream(this.localStream);
      }

      console.log(`✅ [WebRTC] 디바이스/트랙 교체 완료 (${kind})`);
    } catch (error) {
      console.error('❌ [WebRTC] Failed to switch device:', error);
      this.handleError('Failed to switch device', error);
      throw error;
    }
  }

  /**
   * Disconnect from room
   */
  async disconnect() {
    try {
      if (this.roomId && this.userId) {
        await webrtcAPI.leaveRoom(this.roomId, this.userId);
      }
    } catch (error) {
      console.error('Failed to leave room:', error);
    } finally {
      this.cleanup();
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Close WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Close peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Clear remote streams
    this.remoteStreams.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.isConnected = false;
    this.roomId = null;
    this.userId = null;
    this.userName = null;
  }

  /**
   * Handle error
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  handleError(message, error) {
    log.error(message, error, 'WEBRTC');
    handleWebRTCError(error);
    if (this.callbacks.onError) {
      this.callbacks.onError(message, error);
    }
  }

  /**
   * Get connection statistics
   * @returns {Promise<Object>} Connection statistics
   */
  async getConnectionStats() {
    const stats = {
      connectionState: this.isConnected ? 'connected' : 'disconnected',
      participantCount: this.remoteStreams.size,
      peerConnections: this.peerConnections.size,
      localStream: !!this.localStream,
      detailedStats: {}
    };

    // Get detailed stats for each peer connection
    for (const [peerId, pc] of this.peerConnections) {
      try {
        const peerStats = await pc.getStats();
        const statsObj = {};
        
        peerStats.forEach((report) => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            statsObj.rtt = report.currentRoundTripTime * 1000; // Convert to ms
            statsObj.bytesReceived = report.bytesReceived;
            statsObj.bytesSent = report.bytesSent;
          } else if (report.type === 'inbound-rtp' && report.kind === 'audio') {
            statsObj.audioPacketsReceived = report.packetsReceived;
            statsObj.audioPacketsLost = report.packetsLost;
          } else if (report.type === 'inbound-rtp' && report.kind === 'video') {
            statsObj.videoPacketsReceived = report.packetsReceived;
            statsObj.videoPacketsLost = report.packetsLost;
            statsObj.framesReceived = report.framesReceived;
          }
        });
        
        stats.detailedStats[peerId] = statsObj;
      } catch (error) {
        log.warn(`통계 조회 실패: ${peerId}`, error, 'WEBRTC');
      }
    }

    return stats;
  }

  /**
   * Create or join room
   * @param {Object} options - Room options
   * @returns {Promise<Object>} Room info
   */
  async createOrJoinRoom(options = {}) {
    try {
      let roomInfo;
      
      if (options.roomId) {
        // Try to get existing room info
        try {
          roomInfo = await webrtcAPI.getRoomInfo(options.roomId);
          log.info('기존 룸 정보 조회 성공', roomInfo, 'WEBRTC');
        } catch (error) {
          // Room doesn't exist, create it
          roomInfo = await webrtcAPI.createRoom({
            roomType: options.roomType || 'audio',
            maxParticipants: options.maxParticipants || 4
          });
          log.info('새 룸 생성 완료', roomInfo, 'WEBRTC');
        }
      } else {
        // Create new room
        roomInfo = await webrtcAPI.createRoom({
          roomType: options.roomType || 'audio',
          maxParticipants: options.maxParticipants || 4
        });
        log.info('새 룸 생성 완료', roomInfo, 'WEBRTC');
      }

      return roomInfo;
    } catch (error) {
      log.error('룸 생성/입장 실패', error, 'WEBRTC');
      throw error;
    }
  }

  /**
   * Start recording
   * @param {Object} options - Recording options
   * @returns {Promise<void>}
   */
  async startRecording(options = {}) {
    try {
      if (!this.localStream) {
        throw new Error('Local stream not available for recording');
      }

      // Create MediaRecorder with the local stream
      const mediaRecorder = new MediaRecorder(this.localStream, {
        mimeType: options.mimeType || 'audio/webm;codecs=opus'
      });

      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
          const filename = options.filename || `recording-${Date.now()}.webm`;
          
          // Upload recording if room and user info available
          if (this.roomId && this.userId) {
            await webrtcAPI.uploadRecording(
              this.roomId,
              this.userId,
              blob,
              filename,
              options.duration || 0
            );
            log.info('녹음 파일 업로드 완료', { filename, size: blob.size }, 'WEBRTC');
          }

          if (options.onRecordingComplete) {
            options.onRecordingComplete(blob, filename);
          }
        } catch (error) {
          log.error('녹음 처리 실패', error, 'WEBRTC');
          if (options.onError) {
            options.onError(error);
          }
        }
      };

      this.mediaRecorder = mediaRecorder;
      mediaRecorder.start(options.timeslice || 1000); // Collect data every second
      
      log.info('녹음 시작', options, 'WEBRTC');
      
    } catch (error) {
      log.error('녹음 시작 실패', error, 'WEBRTC');
      throw error;
    }
  }

  /**
   * Stop recording
   * @returns {Promise<void>}
   */
  async stopRecording() {
    try {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
        log.info('녹음 중지', null, 'WEBRTC');
      }
    } catch (error) {
      log.error('녹음 중지 실패', error, 'WEBRTC');
      throw error;
    }
  }

  /**
   * Start connection monitoring
   */
  startConnectionMonitoring() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }

    this.connectionCheckInterval = setInterval(async () => {
      try {
        await this.checkConnectionHealth();
      } catch (error) {
        log.error('연결 상태 모니터링 실패', error, 'WEBRTC');
      }
    }, 5000); // Check every 5 seconds

    log.info('WebRTC 연결 모니터링 시작', null, 'WEBRTC');
  }

  /**
   * Stop connection monitoring
   */
  stopConnectionMonitoring() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    log.info('WebRTC 연결 모니터링 중지', null, 'WEBRTC');
  }

  /**
   * Check connection health and trigger recovery if needed
   */
  async checkConnectionHealth() {
    const now = Date.now();
    this.lastConnectionCheck = now;

    if (!this.isConnected || this.peerConnections.size === 0) {
      return;
    }

    let unhealthyConnections = 0;
    let totalConnections = 0;

    for (const [peerId, pc] of this.peerConnections) {
      totalConnections++;
      const connectionState = pc.connectionState;
      const iceConnectionState = pc.iceConnectionState;

      log.debug(`연결 상태 확인: ${peerId}`, {
        connectionState,
        iceConnectionState
      }, 'WEBRTC');

      // Check for unhealthy connection states
      if (
        connectionState === 'failed' ||
        connectionState === 'disconnected' ||
        iceConnectionState === 'failed' ||
        iceConnectionState === 'disconnected'
      ) {
        unhealthyConnections++;
        log.warn(`비정상 연결 감지: ${peerId}`, {
          connectionState,
          iceConnectionState
        }, 'WEBRTC');

        // Try to recover this specific connection
        this.recoverPeerConnection(peerId);
      }
    }

    // Update connection quality
    const healthRatio = totalConnections > 0 ? 
      (totalConnections - unhealthyConnections) / totalConnections : 0;
    
    if (healthRatio >= 0.8) {
      this.connectionQuality = 'good';
    } else if (healthRatio >= 0.5) {
      this.connectionQuality = 'fair';
    } else {
      this.connectionQuality = 'poor';
      log.warn('연결 품질 저하 감지', { 
        healthyConnections: totalConnections - unhealthyConnections,
        totalConnections 
      }, 'WEBRTC');
    }

    // Trigger full reconnection if too many connections are unhealthy
    if (unhealthyConnections > totalConnections * 0.5 && totalConnections > 0) {
      log.error('다수 연결 실패 감지, 전체 재연결 시도', {
        unhealthyConnections,
        totalConnections
      }, 'WEBRTC');
      this.attemptReconnection();
    }
  }

  /**
   * Attempt to recover a specific peer connection
   * @param {string} peerId - Peer ID to recover
   */
  async recoverPeerConnection(peerId) {
    try {
      log.info(`피어 연결 복구 시도: ${peerId}`, null, 'WEBRTC');

      const pc = this.peerConnections.get(peerId);
      if (!pc) {
        log.warn(`피어 연결을 찾을 수 없음: ${peerId}`, null, 'WEBRTC');
        return;
      }

      // Close the problematic connection
      pc.close();
      this.peerConnections.delete(peerId);

      // Remove the remote stream
      const stream = this.remoteStreams.get(peerId);
      if (stream) {
        this.remoteStreams.delete(peerId);
        if (this.callbacks.onRemoteStreamRemoved) {
          this.callbacks.onRemoteStreamRemoved(peerId, stream);
        }
      }

      // Wait a bit before recreating
      setTimeout(() => {
        if (this.isConnected) {
          this.createPeerConnection(peerId, true);
        }
      }, 1000);

    } catch (error) {
      log.error(`피어 연결 복구 실패: ${peerId}`, error, 'WEBRTC');
    }
  }

  /**
   * Attempt full reconnection
   */
  async attemptReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      log.error('최대 재연결 시도 횟수 초과', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts
      }, 'WEBRTC');
      
      if (this.callbacks.onError) {
        this.callbacks.onError('Connection failed after multiple attempts', 
          new AppError('연결 실패', ERROR_TYPES.WEBRTC));
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    log.info(`전체 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`, {
      delay
    }, 'WEBRTC');

    if (this.callbacks.onConnectionStateChange) {
      this.callbacks.onConnectionStateChange('reconnecting');
    }

    // Clean up current connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.remoteStreams.clear();

    // Attempt reconnection after delay
    this.reconnectTimeout = setTimeout(async () => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          // Request participants list again
          this.sendMessage({ type: 'get-participants' });
          
          if (this.callbacks.onConnectionStateChange) {
            this.callbacks.onConnectionStateChange('connected');
          }
          
          this.reconnectAttempts = 0; // Reset on successful reconnection
          log.info('재연결 성공', null, 'WEBRTC');
        } else {
          // WebSocket is also disconnected, need full reconnection
          throw new Error('WebSocket connection lost');
        }
      } catch (error) {
        log.error(`재연결 실패 시도 ${this.reconnectAttempts}`, error, 'WEBRTC');
        // Retry again
        setTimeout(() => this.attemptReconnection(), 2000);
      }
    }, delay);
  }

  /**
   * Enhanced connect method with retry logic
   */
  async connectWithRetry(roomId, userInfo, options = {}) {
    return withRetry(
      () => this.connect(roomId, userInfo, options),
      options.maxRetries || 3,
      options.retryDelay || 2000
    );
  }

  /**
   * Set callback
   * @param {string} name - Callback name
   * @param {Function} callback - Callback function
   */
  on(name, callback) {
    if (Object.prototype.hasOwnProperty.call(this.callbacks, name)) {
      this.callbacks[name] = callback;
    }
  }

  /**
   * Remove callback
   * @param {string} name - Callback name
   */
  off(name) {
    if (Object.prototype.hasOwnProperty.call(this.callbacks, name)) {
      this.callbacks[name] = null;
    }
  }
}

// Export singleton instance
export const webrtcManager = new WebRTCConnectionManager();

// Export class for testing
export default WebRTCConnectionManager;