// WebRTC Connection Manager
import { webrtcAPI } from '../api/webrtc';

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

    // WebRTC configuration
    this.rtcConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
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
   * @returns {Promise<void>}
   */
  async connect(roomId, userInfo) {
    try {
      this.roomId = roomId;
      this.userId = userInfo.userId;
      this.userName = userInfo.userName || 'Anonymous';

      // Join room via API
      const joinResult = await webrtcAPI.joinRoom(roomId, userInfo);
      
      // Connect to WebSocket
      const wsUrl = webrtcAPI.getWebSocketURL(roomId, this.userId, this.userName);
      this.ws = new WebSocket(wsUrl);

      this.setupWebSocketHandlers();
      
      // Wait for WebSocket connection
      await new Promise((resolve, reject) => {
        this.ws.onopen = () => {
          this.isConnected = true;
          if (this.callbacks.onConnectionStateChange) {
            this.callbacks.onConnectionStateChange('connected');
          }
          resolve();
        };
        this.ws.onerror = reject;
      });

      // Request existing participants
      this.sendMessage({ type: 'get-participants' });
    } catch (error) {
      console.error('Connection error:', error);
      this.handleError('Failed to connect to room', error);
      throw error;
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
    console.error(message, error);
    if (this.callbacks.onError) {
      this.callbacks.onError(message, error);
    }
  }

  /**
   * Set callback
   * @param {string} name - Callback name
   * @param {Function} callback - Callback function
   */
  on(name, callback) {
    if (this.callbacks.hasOwnProperty(name)) {
      this.callbacks[name] = callback;
    }
  }

  /**
   * Remove callback
   * @param {string} name - Callback name
   */
  off(name) {
    if (this.callbacks.hasOwnProperty(name)) {
      this.callbacks[name] = null;
    }
  }
}

// Export singleton instance
export const webrtcManager = new WebRTCConnectionManager();

// Export class for testing
export default WebRTCConnectionManager;