// WebRTC API Client
import { handleApiError, handleWebRTCError, withRetry } from '../utils/errorHandler.js';
import { log } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_WORKERS_API_URL || 'http://localhost:8787';
const API_VERSION = 'v1';

class WebRTCAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}`;
  }

  /**
   * Create a new room
   * @param {Object} options - Room options
   * @param {'audio' | 'video'} options.roomType - Type of room
   * @param {number} options.maxParticipants - Maximum participants (default: 4)
   * @returns {Promise<Object>} Room creation result
   */
  async createRoom(options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/room/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomType: options.roomType || 'audio',
          maxParticipants: options.maxParticipants || 4
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      return await response.json();
    } catch (error) {
      log.error('WebRTC 룸 생성 실패', error, 'WEBRTC');
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Join a room
   * @param {string} roomId - Room ID
   * @param {Object} userInfo - User information
   * @returns {Promise<Object>} Join result with WebSocket URL
   */
  async joinRoom(roomId, userInfo) {
    try {
      const response = await fetch(`${this.baseURL}/webrtc/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userInfo.userId,
          userName: userInfo.userName || 'Anonymous'
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join room');
      }

      return result;
    } catch (error) {
      log.error('WebRTC 룸 입장 실패', error, 'WEBRTC');
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Leave a room
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Leave result
   */
  async leaveRoom(roomId, userId) {
    try {
      const response = await fetch(`${this.baseURL}/webrtc/${roomId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to leave room');
      }

      return await response.json();
    } catch (error) {
      log.error('WebRTC 룸 나가기 실패', error, 'WEBRTC');
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get room information
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Room information
   */
  async getRoomInfo(roomId) {
    try {
      const response = await fetch(`${this.baseURL}/webrtc/${roomId}/info`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get room info');
      }

      return await response.json();
    } catch (error) {
      log.error('WebRTC 룸 정보 조회 실패', error, 'WEBRTC');
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Update room settings
   * @param {string} roomId - Room ID
   * @param {Object} settings - Room settings to update
   * @returns {Promise<Object>} Update result
   */
  async updateRoomSettings(roomId, settings) {
    try {
      const response = await fetch(`${this.baseURL}/webrtc/${roomId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update room settings');
      }

      return await response.json();
    } catch (error) {
      log.error('WebRTC 룸 설정 업데이트 실패', error, 'WEBRTC');
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get ICE servers for WebRTC connection
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} ICE servers configuration
   */
  async getIceServers(roomId) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/room/${roomId}/ice-servers`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get ICE servers');
      }

      return await response.json();
    } catch (error) {
      log.error('ICE 서버 조회 실패', error, 'WEBRTC');
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get room metrics and analytics
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Room metrics data
   */
  async getRoomMetrics(roomId) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/room/${roomId}/metrics`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get room metrics');
      }

      return await response.json();
    } catch (error) {
      log.error('WebRTC 룸 메트릭 조회 실패', error, 'WEBRTC');
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Upload recording file to server
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID
   * @param {File} recordingFile - Recording file blob
   * @param {string} filename - Original filename
   * @param {number} duration - Recording duration in seconds
   * @returns {Promise<Object>} Upload result
   */
  async uploadRecording(roomId, userId, recordingFile, filename, duration = 0) {
    try {
      const formData = new FormData();
      formData.append('recording', recordingFile);
      formData.append('userId', userId);
      formData.append('filename', filename);
      formData.append('duration', duration.toString());

      const response = await fetch(`${this.baseURL}/api/v1/room/${roomId}/recording/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      return await response.json();
    } catch (error) {
      log.error('녹음 파일 업로드 실패', error, 'WEBRTC');
      handleApiError(error);
      throw error;
    }
  }

  /**
   * Get WebSocket URL for a room
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID
   * @param {string} userName - User name
   * @returns {string} WebSocket URL
   */
  getWebSocketURL(roomId, userId, userName = 'Anonymous') {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiHost = new URL(this.baseURL).host;
    return `${wsProtocol}//${apiHost}/api/v1/room/${roomId}/ws?userId=${userId}&userName=${encodeURIComponent(userName)}`;
  }
}

// Export singleton instance
export const webrtcAPI = new WebRTCAPI();

// Export for testing
export default WebRTCAPI;