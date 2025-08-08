import { DurableObject } from 'cloudflare:workers';

// Durable Object for WebRTC Room Management with Hibernation Support
export class WebRTCRoom extends DurableObject {
  private roomData: RoomData;
  private roomId: string;

  constructor(state: DurableObjectState, env: any) {
    super(state, env);
    
    // Initialize room ID from Durable Object ID
    this.roomId = state.id.toString();
    
    // Initialize room data
    this.roomData = {
      id: this.roomId,
      participants: [],
      maxParticipants: 4,
      createdAt: new Date().toISOString(),
      type: 'audio',
      settings: {
        allowScreenShare: true,
        allowRecording: false,
        autoMuteOnJoin: false
      }
    };
    
    // Restore participants from hibernation
    this.restoreParticipants();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }
    
    // Handle HTTP requests
    switch (url.pathname) {
      case '/join':
        return this.handleJoin(request);
      case '/leave':
        return this.handleLeave(request);
      case '/info':
        return this.handleInfo();
      case '/settings':
        return this.handleSettings(request);
      default:
        return new Response('Not Found', { status: 404 });
    }
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const userName = url.searchParams.get('userName') || 'Anonymous';
    
    if (!userId) {
      return new Response('Missing userId parameter', { status: 400 });
    }
    
    // Check if room is full
    const activeParticipants = this.getActiveParticipants();
    if (activeParticipants.length >= this.roomData.maxParticipants) {
      return new Response(JSON.stringify({ error: 'Room is full' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    // Store user data with WebSocket for hibernation
    const userData: WebSocketData = {
      userId,
      userName,
      joinedAt: new Date().toISOString()
    };
    server.serializeAttachment(userData);
    
    // Accept WebSocket with hibernation support
    this.ctx.acceptWebSocket(server, [userId]);
    
    // Add participant to room
    const participant: Participant = {
      id: userId,
      name: userName,
      joinedAt: userData.joinedAt,
      audioEnabled: true,
      videoEnabled: this.roomData.type === 'video',
      isScreenSharing: false
    };
    
    this.roomData.participants.push(participant);
    await this.saveRoomData();
    
    // Send initial room state to new participant
    server.send(JSON.stringify({
      type: 'connected',
      roomData: this.roomData,
      userId
    }));
    
    // Notify other participants
    this.broadcast({
      type: 'participant-joined',
      participant
    }, userId);
    
    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleJoin(request: Request): Promise<Response> {
    try {
      const { userId, userName, roomType } = await request.json();
      
      // Check if user already in room
      const existingParticipant = this.roomData.participants.find(p => p.id === userId);
      if (existingParticipant) {
        return new Response(JSON.stringify({ 
          success: true,
          roomData: this.roomData,
          message: 'Already in room'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const activeParticipants = this.getActiveParticipants();
      if (activeParticipants.length >= this.roomData.maxParticipants) {
        return new Response(JSON.stringify({ 
          error: 'Room is full' 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Update room type if needed
      if (roomType && this.roomData.participants.length === 0) {
        this.roomData.type = roomType;
      }

      await this.saveRoomData();

      return new Response(JSON.stringify({ 
        success: true,
        roomData: this.roomData,
        websocketUrl: `/room/${this.roomId}/websocket?userId=${userId}&userName=${encodeURIComponent(userName)}`
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Join error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to join room' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleLeave(request: Request): Promise<Response> {
    try {
      const { userId } = await request.json();
      await this.handleParticipantLeave(userId);
      
      return new Response(JSON.stringify({ success: true }));
    } catch (error) {
      console.error('Leave error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to leave room' 
      }), { status: 500 });
    }
  }

  private async handleSignal(request: Request): Promise<Response> {
    try {
      const { from, to, signal } = await request.json();

      // Forward signal to specific participant
      const targetSocket = this.sessions.get(to);
      if (targetSocket) {
        targetSocket.send(JSON.stringify({
          type: 'signal',
          from,
          signal
        }));
      }

      return new Response(JSON.stringify({ success: true }));
    } catch (error) {
      console.error('Signal error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to send signal' 
      }), { status: 500 });
    }
  }

  private async handleInfo(): Promise<Response> {
    const roomData = await this.state.storage.get('roomData') || this.roomData;
    return new Response(JSON.stringify(roomData));
  }

  // WebSocket Hibernation API event handlers
  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    try {
      // Get user data from WebSocket attachment
      const userData = ws.deserializeAttachment() as WebSocketData;
      if (!userData) {
        ws.close(1008, 'User data not found');
        return;
      }
      
      const msg = typeof message === 'string' ? JSON.parse(message) : null;
      if (!msg) return;
      
      await this.handleWebSocketMessage(ws, userData.userId, msg);
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Invalid message format' 
      }));
    }
  }
  
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    const userData = ws.deserializeAttachment() as WebSocketData;
    if (userData) {
      await this.handleParticipantLeave(userData.userId);
    }
  }
  
  async webSocketError(ws: WebSocket, error: unknown) {
    console.error('WebSocket error:', error);
    const userData = ws.deserializeAttachment() as WebSocketData;
    if (userData) {
      await this.handleParticipantLeave(userData.userId);
    }
  }
  
  private async handleWebSocketMessage(ws: WebSocket, userId: string, message: any) {
    const { type, data } = message;

    switch (type) {
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        // Forward WebRTC signals to specific participant
        if (data.to) {
          this.sendToParticipant(data.to, {
            type,
            from: userId,
            data: data.signal || data
          });
        }
        break;

      case 'toggle-audio':
        await this.updateParticipantStatus(userId, { audioEnabled: data.enabled });
        break;

      case 'toggle-video':
        await this.updateParticipantStatus(userId, { videoEnabled: data.enabled });
        break;
        
      case 'toggle-screen-share':
        await this.updateParticipantStatus(userId, { isScreenSharing: data.enabled });
        this.broadcast({
          type: 'screen-share-changed',
          userId,
          isSharing: data.enabled
        }, userId);
        break;

      case 'chat':
        // Broadcast chat message to all participants
        this.broadcast({
          type: 'chat',
          from: userId,
          message: data.message,
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  }

  private async updateParticipantStatus(userId: string, updates: Partial<Participant>) {
    const participant = this.roomData.participants.find(p => p.id === userId);
    if (participant) {
      Object.assign(participant, updates);
      await this.saveRoomData();
      
      this.broadcast({
        type: 'participant-updated',
        participant
      });
    }
  }

  private async handleParticipantLeave(userId: string) {
    const participantIndex = this.roomData.participants.findIndex(p => p.id === userId);
    if (participantIndex === -1) return;
    
    // Remove participant
    this.roomData.participants.splice(participantIndex, 1);
    await this.saveRoomData();
    
    // Notify others
    this.broadcast({
      type: 'participant-left',
      userId
    });

    // Schedule room cleanup if empty
    const activeParticipants = this.getActiveParticipants();
    if (activeParticipants.length === 0) {
      // Use alarm for cleanup instead of setTimeout
      const cleanupTime = Date.now() + 60000; // 1 minute
      await this.ctx.storage.setAlarm(cleanupTime);
    }
  }
  
  // Handle alarm for room cleanup
  async alarm() {
    const activeParticipants = this.getActiveParticipants();
    if (activeParticipants.length === 0) {
      await this.ctx.storage.deleteAll();
    }
  }

  private async handleSettings(request: Request): Promise<Response> {
    if (request.method === 'GET') {
      return new Response(JSON.stringify(this.roomData.settings), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (request.method === 'PATCH') {
      try {
        const updates = await request.json();
        Object.assign(this.roomData.settings, updates);
        await this.saveRoomData();
        
        this.broadcast({
          type: 'settings-updated',
          settings: this.roomData.settings
        });
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response('Method not allowed', { status: 405 });
  }

  private broadcast(message: any, excludeUserId?: string) {
    const data = JSON.stringify(message);
    
    this.ctx.getWebSockets().forEach(ws => {
      try {
        const userData = ws.deserializeAttachment() as WebSocketData;
        if (userData && userData.userId !== excludeUserId) {
          ws.send(data);
        }
      } catch (error) {
        console.error('Broadcast error:', error);
      }
    });
  }
  
  private sendToParticipant(userId: string, message: any) {
    const data = JSON.stringify(message);
    const websockets = this.ctx.getWebSockets(userId);
    
    websockets.forEach(ws => {
      try {
        ws.send(data);
      } catch (error) {
        console.error(`Send to ${userId} error:`, error);
      }
    });
  }
  
  private getActiveParticipants(): Participant[] {
    const connectedUserIds = new Set<string>();
    
    this.ctx.getWebSockets().forEach(ws => {
      const userData = ws.deserializeAttachment() as WebSocketData;
      if (userData) {
        connectedUserIds.add(userData.userId);
      }
    });
    
    return this.roomData.participants.filter(p => connectedUserIds.has(p.id));
  }
  
  private async saveRoomData() {
    await this.ctx.storage.put('roomData', this.roomData);
  }
  
  private async restoreParticipants() {
    const stored = await this.ctx.storage.get<RoomData>('roomData');
    if (stored) {
      this.roomData = stored;
      
      // Update participants based on active WebSockets
      const activeParticipants = this.getActiveParticipants();
      this.roomData.participants = activeParticipants;
      
      if (activeParticipants.length !== stored.participants.length) {
        await this.saveRoomData();
      }
    }
  }
}

// Type definitions
interface RoomData {
  id: string;
  participants: Participant[];
  maxParticipants: number;
  createdAt: string;
  type: 'audio' | 'video';
  settings: RoomSettings;
}

interface RoomSettings {
  allowScreenShare: boolean;
  allowRecording: boolean;
  autoMuteOnJoin: boolean;
}

interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
}

interface WebSocketData {
  userId: string;
  userName: string;
  joinedAt: string;
}