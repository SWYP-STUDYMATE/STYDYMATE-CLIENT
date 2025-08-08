// Durable Object for WebRTC Room Management
export class WebRTCRoom {
  private state: DurableObjectState;
  private sessions: Map<string, WebSocket>;
  private roomData: RoomData;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sessions = new Map();
    this.roomData = {
      id: '',
      participants: [],
      maxParticipants: 4,
      createdAt: new Date().toISOString(),
      type: 'audio' // 'audio' | 'video'
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/websocket':
        return this.handleWebSocket(request);
      case '/join':
        return this.handleJoin(request);
      case '/leave':
        return this.handleLeave(request);
      case '/signal':
        return this.handleSignal(request);
      case '/info':
        return this.handleInfo();
      default:
        return new Response('Not Found', { status: 404 });
    }
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.state.acceptWebSocket(server);

    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);
        await this.handleMessage(server, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
        server.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });

    server.addEventListener('close', () => {
      const userId = this.getUserIdBySocket(server);
      if (userId) {
        this.handleParticipantLeave(userId);
      }
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleJoin(request: Request): Promise<Response> {
    try {
      const { userId, userName, roomType } = await request.json();

      if (this.roomData.participants.length >= this.roomData.maxParticipants) {
        return new Response(JSON.stringify({ 
          error: 'Room is full' 
        }), { status: 400 });
      }

      const participant: Participant = {
        id: userId,
        name: userName,
        joinedAt: new Date().toISOString(),
        audioEnabled: true,
        videoEnabled: roomType === 'video'
      };

      this.roomData.participants.push(participant);
      this.roomData.type = roomType || 'audio';

      // Notify all participants
      this.broadcast({
        type: 'participant-joined',
        participant
      });

      await this.state.storage.put('roomData', this.roomData);

      return new Response(JSON.stringify({ 
        success: true,
        roomData: this.roomData 
      }));
    } catch (error) {
      console.error('Join error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to join room' 
      }), { status: 500 });
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

  private async handleMessage(socket: WebSocket, message: any) {
    const { type, userId, data } = message;

    switch (type) {
      case 'register':
        this.sessions.set(userId, socket);
        socket.send(JSON.stringify({
          type: 'registered',
          roomData: this.roomData
        }));
        break;

      case 'offer':
      case 'answer':
      case 'ice-candidate':
        // Forward WebRTC signals
        const targetSocket = this.sessions.get(data.to);
        if (targetSocket) {
          targetSocket.send(JSON.stringify({
            type,
            from: userId,
            data: data.signal
          }));
        }
        break;

      case 'toggle-audio':
        this.updateParticipantStatus(userId, { audioEnabled: data.enabled });
        break;

      case 'toggle-video':
        this.updateParticipantStatus(userId, { videoEnabled: data.enabled });
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  }

  private updateParticipantStatus(userId: string, updates: Partial<Participant>) {
    const participant = this.roomData.participants.find(p => p.id === userId);
    if (participant) {
      Object.assign(participant, updates);
      this.broadcast({
        type: 'participant-updated',
        participant
      });
    }
  }

  private async handleParticipantLeave(userId: string) {
    this.roomData.participants = this.roomData.participants.filter(
      p => p.id !== userId
    );
    
    this.sessions.delete(userId);
    
    this.broadcast({
      type: 'participant-left',
      userId
    });

    await this.state.storage.put('roomData', this.roomData);

    // Clean up empty room after delay
    if (this.roomData.participants.length === 0) {
      setTimeout(() => {
        this.state.storage.deleteAll();
      }, 60000); // 1 minute
    }
  }

  private getUserIdBySocket(socket: WebSocket): string | undefined {
    for (const [userId, ws] of this.sessions.entries()) {
      if (ws === socket) return userId;
    }
    return undefined;
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message);
    this.sessions.forEach(socket => {
      try {
        socket.send(data);
      } catch (error) {
        console.error('Broadcast error:', error);
      }
    });
  }
}

// Type definitions
interface RoomData {
  id: string;
  participants: Participant[];
  maxParticipants: number;
  createdAt: string;
  type: 'audio' | 'video';
}

interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
}