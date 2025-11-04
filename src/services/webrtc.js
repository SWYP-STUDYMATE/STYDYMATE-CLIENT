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
          this.rtcConfiguration.iceServers = iceServersConfig.iceServers;
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
    const { type, from, payload } = data;

    switch (type) {
      case 'connected':
        // WebSocket 연결 성공 메시지
        console.log('✅ WebSocket connected to room:', this.roomId);
        if (this.callbacks.onConnectionStateChange) {
          this.callbacks.onConnectionStateChange('connected');
        }
        break;

      case 'participant-joined':
        this.handleParticipantJoined(payload);
        break;

      case 'participant-left':
        this.handleParticipantLeft(payload);
        break;

      case 'participants-list':
        await this.handleParticipantsList(payload.participants);
        break;

      case 'offer':
        await this.handleOffer(from, payload);
        break;

      case 'answer':
        await this.handleAnswer(from, payload);
        break;

      case 'ice-candidate':
        await this.handleIceCandidate(from, payload);
        break;

      case 'chat-message':
        if (this.callbacks.onChatMessage) {
          this.callbacks.onChatMessage(payload);
        }
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  }

  /**
   * Handle participant joined
   * @param {Object} participant - Participant info
   */
  handleParticipantJoined(participant) {
    console.log('Participant joined:', participant);

    // payload가 undefined인 경우 처리
    if (!participant || !participant.userId) {
      console.warn('Invalid participant data in participant-joined message:', participant);
      return;
    }

    if (this.callbacks.onParticipantJoined) {
      this.callbacks.onParticipantJoined(participant);
    }
    // Create peer connection for new participant
    this.createPeerConnection(participant.userId);
  }

  /**
   * Handle participant left
   * @param {Object} participant - Participant info
   */
  handleParticipantLeft(participant) {
    console.log('Participant left:', participant);

    // payload가 undefined인 경우 처리
    if (!participant || !participant.userId) {
      console.warn('Invalid participant data in participant-left message:', participant);
      return;
    }

    const { userId } = participant;

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
      this.callbacks.onParticipantLeft(participant);
    }
  }

  /**
   * Handle participants list
   * @param {Array} participants - List of participants
   */
  async handleParticipantsList(participants) {
    // Create peer connections for existing participants
    for (const participant of participants) {
      if (participant.userId !== this.userId) {
        await this.createPeerConnection(participant.userId, true);
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
      return this.peerConnections.get(remoteUserId);
    }

    const pc = new RTCPeerConnection(this.rtcConfiguration);
    this.peerConnections.set(remoteUserId, pc);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Remote track received from:', remoteUserId);
      const [stream] = event.streams;
      this.remoteStreams.set(remoteUserId, stream);
      if (this.callbacks.onRemoteStream) {
        this.callbacks.onRemoteStream(remoteUserId, stream);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendMessage({
          type: 'ice-candidate',
          to: remoteUserId,
          payload: {
            candidate: event.candidate,
          },
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${remoteUserId}:`, pc.connectionState);
    };

    // Create offer if needed
    if (createOffer) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.sendMessage({
          type: 'offer',
          to: remoteUserId,
          payload: { sdp: offer },
        });
      } catch (error) {
        console.error('Failed to create offer:', error);
        this.handleError('Failed to create offer', error);
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
      const pc = await this.createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      this.sendMessage({
        type: 'answer',
        to: from,
        payload: { sdp: answer },
      });
    } catch (error) {
      console.error('Failed to handle offer:', error);
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
      const pc = this.peerConnections.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      }
    } catch (error) {
      console.error('Failed to handle answer:', error);
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
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
      this.handleError('Failed to handle ICE candidate', error);
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
    }
  }

  /**
   * Switch media device
   * @param {string} kind - Device kind ('audioinput' or 'videoinput')
   * @param {string} deviceId - Device ID
   */
  async switchDevice(kind, deviceId) {
    try {
      const constraints = {
        audio: kind === 'audioinput' ? { deviceId } : this.localStream.getAudioTracks().length > 0,
        video: kind === 'videoinput' ? { deviceId } : this.localStream.getVideoTracks().length > 0,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Replace tracks in peer connections
      const newTrack = kind === 'audioinput' 
        ? newStream.getAudioTracks()[0]
        : newStream.getVideoTracks()[0];
        
      const oldTrack = kind === 'audioinput'
        ? this.localStream.getAudioTracks()[0]
        : this.localStream.getVideoTracks()[0];

      this.peerConnections.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track === oldTrack);
        if (sender) {
          sender.replaceTrack(newTrack);
        }
      });

      // Update local stream
      this.localStream.removeTrack(oldTrack);
      this.localStream.addTrack(newTrack);
      oldTrack.stop();

      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(this.localStream);
      }
    } catch (error) {
      console.error('Failed to switch device:', error);
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