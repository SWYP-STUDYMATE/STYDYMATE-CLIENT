// WebRTC API Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const API_VERSION = 'v1';

class WebRTCAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/${API_VERSION}/room`;
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
      const response = await fetch(`${this.baseURL}/create`, {
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
      console.error('Room creation error:', error);
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
      const response = await fetch(`${this.baseURL}/${roomId}/join`, {
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
      console.error('Room join error:', error);
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
      const response = await fetch(`${this.baseURL}/${roomId}/leave`, {
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
      console.error('Room leave error:', error);
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
      const response = await fetch(`${this.baseURL}/${roomId}/info`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get room info');
      }

      return await response.json();
    } catch (error) {
      console.error('Room info error:', error);
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
      const response = await fetch(`${this.baseURL}/${roomId}/settings`, {
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
      console.error('Room settings update error:', error);
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
    return `${wsProtocol}//${apiHost}/api/${API_VERSION}/room/${roomId}/ws?userId=${userId}&userName=${encodeURIComponent(userName)}`;
  }
}

// Export singleton instance
export const webrtcAPI = new WebRTCAPI();

// Export for testing
export default WebRTCAPI;