import { DurableObject } from 'cloudflare:workers';
import { log } from '../utils/logger';
import { upsertActiveRoom, removeActiveRoom } from '../utils/activeRooms';
import { ActiveRoomInfo } from '../types';

// Durable Object for WebRTC Room Management with Hibernation Support
export class WebRTCRoom extends DurableObject {
  private roomData: RoomData;
  private roomId: string;
  protected env: any;

  constructor(state: DurableObjectState, env: any) {
    super(state, env);
    this.env = env;
    
    // Initialize room ID from Durable Object ID
    this.roomId = state.id.toString();
    
    // Initialize room data
    this.roomData = {
      id: this.roomId,
      participants: [],
      maxParticipants: 4,
      createdAt: new Date().toISOString(),
      type: 'audio',
      metadata: {},
      settings: {
        allowScreenShare: true,
        allowRecording: false,
        autoMuteOnJoin: false,
        stunServers: [
          // Cloudflare STUN (anycast - 최적 경로 자동 선택)
          { urls: 'stun:stun.cloudflare.com:3478' },
          // Google STUN (백업)
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ],
        turnServers: this.getTurnServers(env),
        recordingSettings: {
          enabled: true,
          autoStart: false,
          maxDuration: 60, // 1시간
          format: 'webm',
          quality: 'medium',
          audioOnly: false
        }
      },
      metrics: {
        totalParticipants: 0,
        peakParticipants: 0,
        messagesExchanged: 0,
        connectionErrors: 0,
        lastActivity: new Date().toISOString(),
        sessionDuration: 0
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
      case '/init':
        return this.handleInit(request);
      case '/join':
        return this.handleJoin(request);
      case '/leave':
        return this.handleLeave(request);
      case '/info':
        return this.handleInfo();
      case '/settings':
        return this.handleSettings(request);
      case '/metadata':
        return this.handleMetadata(request);
      case '/ice-servers':
        return this.handleIceServers();
      case '/metrics':
        return this.handleMetrics();
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
    
    // Update metrics for participant join
    this.updateMetrics('join');
    await this.saveRoomData();
    await this.syncActiveRoomCache();
    
    // Send analytics
    await this.sendAnalytics('participant_joined', {
      userId,
      userName,
      totalParticipants: this.roomData.participants.length,
      roomType: this.roomData.type
    });
    
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

  /**
   * TURN 서버 설정 생성 (환경변수 기반)
   *
   * ⚠️ 비용 절감 전략:
   * - TURN은 최후의 수단 (직접 P2P 실패 시에만 사용)
   * - ICE 우선순위: STUN (무료) → TURN (유료)
   * - 브라우저가 자동으로 최적 경로 선택 (iceTransportPolicy 기본값 사용)
   */
  private getTurnServers(env: any): RTCIceServer[] {
    const servers: RTCIceServer[] = [];

    // Cloudflare TURN (프로덕션 - anycast로 최적 경로 자동 선택)
    if (env.CLOUDFLARE_TURN_USERNAME && env.CLOUDFLARE_TURN_PASSWORD) {
      // UDP TURN (기본, 성능 우수, 낮은 레이턴시)
      servers.push({
        urls: 'turn:turn.cloudflare.com:3478',
        username: env.CLOUDFLARE_TURN_USERNAME,
        credential: env.CLOUDFLARE_TURN_PASSWORD
      });

      // TCP TURN (UDP 차단 환경용 백업)
      servers.push({
        urls: 'turn:turn.cloudflare.com:3478?transport=tcp',
        username: env.CLOUDFLARE_TURN_USERNAME,
        credential: env.CLOUDFLARE_TURN_PASSWORD
      });

      console.log('✅ [TURN] Cloudflare TURN 활성화 (비용 발생 - P2P 실패 시에만 사용)');
    }

    // 백업 TURN 서버들 (Cloudflare TURN이 없을 때)
    if (servers.length === 0) {
      // OpenRelay (무료, 개발용, 불안정)
      servers.push(
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
      );
      console.warn('⚠️ [TURN] Cloudflare TURN 미설정 → OpenRelay 백업 사용');
    }

    return servers;
  }

  private async handleInit(request: Request): Promise<Response> {
    try {
      const { roomType = 'audio', maxParticipants = 4, metadata = {} } = await request.json() as {
        roomType?: 'audio' | 'video';
        maxParticipants?: number;
        metadata?: any;
      };

      // Update room data with initialization parameters
      this.roomData.type = roomType;
      this.roomData.maxParticipants = maxParticipants;
      this.roomData.createdAt = new Date().toISOString();
      this.roomData.metadata = metadata || {};
      
      // Save room data to storage
      await this.saveRoomData();
      await this.syncActiveRoomCache();

      return new Response(JSON.stringify({
        success: true,
        roomId: this.roomId,
        roomType,
        maxParticipants,
        metadata,
        createdAt: this.roomData.createdAt
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      log.error('Init error', error as Error, undefined, { component: 'WEBRTC_ROOM' });
      return new Response(JSON.stringify({ 
        error: 'Failed to initialize room' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleJoin(request: Request): Promise<Response> {
    try {
      const { userId, userName, roomType } = await request.json() as {
        userId: string;
        userName: string;
        roomType?: 'audio' | 'video';
      };
      
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
      log.error('Join error', error as Error, undefined, { component: 'WEBRTC_ROOM' });
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
      const { userId } = await request.json() as { userId: string };
      await this.handleParticipantLeave(userId);
      
      return new Response(JSON.stringify({ success: true }));
    } catch (error) {
      log.error('Leave error', error as Error, undefined, { component: 'WEBRTC_ROOM' });
      return new Response(JSON.stringify({ 
        error: 'Failed to leave room' 
      }), { status: 500 });
    }
  }

  private async handleSignal(request: Request): Promise<Response> {
    try {
      const { from, to, signal } = await request.json() as {
        from: string;
        to: string;
        signal: unknown;
      };

      // Forward signal to specific participant using WebSocket hibernation groups
      const websockets = this.ctx.getWebSockets(to);
      websockets.forEach((ws) => {
        try {
          ws.send(JSON.stringify({ type: 'signal', from, signal }));
        } catch (e) {
          log.error('Signal forward error', e as Error, undefined, { component: 'WEBRTC_ROOM' });
        }
      });

      return new Response(JSON.stringify({ success: true }));
    } catch (error) {
      log.error('Signal error', error as Error, undefined, { component: 'WEBRTC_ROOM' });
      return new Response(JSON.stringify({ 
        error: 'Failed to send signal' 
      }), { status: 500 });
    }
  }

  private async handleInfo(): Promise<Response> {
    const roomData = await this.ctx.storage.get('roomData') || this.roomData;
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
      log.error('WebSocket message error', error as Error, undefined, { component: 'WEBRTC_ROOM' });
      this.updateMetrics('error');
      await this.sendAnalytics('websocket_error', { error: String(error) });
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
    log.error('WebSocket error', error as Error, undefined, { component: 'WEBRTC_ROOM' });
    this.updateMetrics('error');
    await this.sendAnalytics('websocket_connection_error', { error: String(error) });
    
    const userData = ws.deserializeAttachment() as WebSocketData;
    if (userData) {
      await this.handleParticipantLeave(userData.userId);
    }
  }
  
  private async handleWebSocketMessage(ws: WebSocket, userId: string, message: any) {
    const { type, data } = message;
    
    // Update message metrics
    this.updateMetrics('message');

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
        
      case 'start-recording':
        // 녹화 시작 브로드캐스트
        if (this.roomData.settings.allowRecording && this.roomData.settings.recordingSettings?.enabled) {
          this.broadcast({
            type: 'recording-started',
            initiatedBy: userId,
            timestamp: new Date().toISOString(),
            settings: this.roomData.settings.recordingSettings
          });
          await this.sendAnalytics('recording_started', { userId });
        }
        break;

      case 'stop-recording':
        // 녹화 중지 브로드캐스트
        this.broadcast({
          type: 'recording-stopped',
          stoppedBy: userId,
          timestamp: new Date().toISOString()
        });
        await this.sendAnalytics('recording_stopped', { userId });
        break;

      case 'recording-chunk':
        // 녹화 청크 업로드 완료 알림
        await this.handleRecordingChunk(userId, data);
        break;

      case 'quality-report':
        // 연결 품질 리포트 처리
        await this.handleQualityReport(userId, data);
        break;
        
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        log.warn('Unknown message type', { component: 'WEBRTC_ROOM' }, { type });
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
    
    // Update metrics
    this.updateMetrics('leave');
    await this.saveRoomData();
    await this.syncActiveRoomCache();
    
    // Send analytics
    await this.sendAnalytics('participant_left', {
      userId,
      remainingParticipants: this.roomData.participants.length,
      sessionDuration: this.roomData.metrics.sessionDuration
    });
    
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
      await this.syncActiveRoomCache({ forceRemove: true });
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
        await this.syncActiveRoomCache();
        
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

  private async handleMetadata(request: Request): Promise<Response> {
    if (request.method !== 'PATCH' && request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const metadata = await request.json() as Record<string, unknown> | undefined;

      if (!metadata || typeof metadata !== 'object') {
        return new Response(JSON.stringify({ error: 'metadata object is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      this.roomData.metadata = {
        ...(this.roomData.metadata || {}),
        ...metadata
      };

      await this.saveRoomData();
      await this.syncActiveRoomCache();

      return new Response(JSON.stringify({
        success: true,
        metadata: this.roomData.metadata
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      log.error('Metadata update error', error as Error, undefined, { component: 'WEBRTC_ROOM' });
      return new Response(JSON.stringify({ error: 'Failed to update metadata' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async syncActiveRoomCache(options?: { forceRemove?: boolean }) {
    if (!this.env?.CACHE) {
      return;
    }

    try {
      if (options?.forceRemove) {
        await removeActiveRoom(this.env.CACHE, this.roomId);
        return;
      }

      const activeCount = this.getActiveParticipants().length;
      const roomInfo: ActiveRoomInfo = {
        roomId: this.roomId,
        roomType: this.roomData.type === 'video' ? 'video' : 'audio',
        currentParticipants: activeCount,
        maxParticipants: this.roomData.maxParticipants,
        status: activeCount > 0 ? 'active' : 'waiting',
        createdAt: this.roomData.createdAt,
        updatedAt: new Date().toISOString(),
        metadata: this.roomData.metadata || {}
      };

      await upsertActiveRoom(this.env.CACHE, roomInfo);
    } catch (error) {
      log.warn('Active room cache sync failed', undefined, {
        component: 'WEBRTC_ROOM',
        error: error instanceof Error ? error.message : String(error)
      });
    }
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
        log.error('Broadcast error', error as Error, undefined, { component: 'WEBRTC_ROOM' });
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
        log.error('Send to user error', error as Error, undefined, { component: 'WEBRTC_ROOM', userId });
      }
    });
  }

  private async handleIceServers(): Promise<Response> {
    const iceServers = [
      ...this.roomData.settings.stunServers || [],
      ...this.roomData.settings.turnServers || []
    ];

    return new Response(JSON.stringify({
      iceServers,
      ttl: 3600 // ICE 서버 정보 TTL (1시간)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleMetrics(): Promise<Response> {
    // Update session duration before returning metrics
    this.updateMetrics('message'); // This will update the session duration
    
    const activeParticipants = this.getActiveParticipants();
    
    const metricsData = {
      roomId: this.roomData.id,
      currentParticipants: activeParticipants.length,
      metrics: this.roomData.metrics,
      roomSettings: {
        type: this.roomData.type,
        maxParticipants: this.roomData.maxParticipants,
        createdAt: this.roomData.createdAt
      },
      participants: activeParticipants.map(p => ({
        id: p.id,
        name: p.name,
        joinedAt: p.joinedAt,
        audioEnabled: p.audioEnabled,
        videoEnabled: p.videoEnabled,
        isScreenSharing: p.isScreenSharing
      }))
    };

    return new Response(JSON.stringify(metricsData), {
      headers: { 'Content-Type': 'application/json' }
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

  private updateMetrics(type: 'join' | 'leave' | 'message' | 'error', data?: any) {
    const now = new Date().toISOString();
    this.roomData.metrics.lastActivity = now;

    switch (type) {
      case 'join':
        this.roomData.metrics.totalParticipants++;
        const currentCount = this.roomData.participants.length;
        if (currentCount > this.roomData.metrics.peakParticipants) {
          this.roomData.metrics.peakParticipants = currentCount;
        }
        break;
      case 'message':
        this.roomData.metrics.messagesExchanged++;
        break;
      case 'error':
        this.roomData.metrics.connectionErrors++;
        break;
    }

    // Calculate session duration
    const createdTime = new Date(this.roomData.createdAt).getTime();
    const currentTime = new Date(now).getTime();
    this.roomData.metrics.sessionDuration = Math.floor((currentTime - createdTime) / 1000);
  }

  private async sendAnalytics(event: string, data: any) {
    try {
      // Cloudflare Analytics Engine에 메트릭 전송 (env.ANALYTICS 바인딩 사용)
      if (this.env?.ANALYTICS) {
        await this.env.ANALYTICS.writeDataPoint({
          blobs: [this.roomData.id, event],
          doubles: [
            this.roomData.participants.length,
            this.roomData.metrics.peakParticipants,
            this.roomData.metrics.messagesExchanged,
            this.roomData.metrics.connectionErrors
          ],
          indexes: [this.roomData.id]
        });
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  private async handleRecordingChunk(userId: string, data: any) {
    try {
      const { filename, size, duration } = data;
      
      // 녹화 청크 메타데이터 저장
      const recordingMetadata = {
        roomId: this.roomData.id,
        userId,
        filename,
        size,
        duration,
        timestamp: new Date().toISOString(),
        participants: this.roomData.participants.map(p => ({
          id: p.id,
          name: p.name
        }))
      };

      // KV에 녹화 메타데이터 저장
      if (this.env?.CACHE) {
        const recordingKey = `recording:${this.roomData.id}:${filename}`;
        await this.env.CACHE.put(recordingKey, JSON.stringify(recordingMetadata), {
          expirationTtl: 86400 * 30 // 30일 보관
        });
      }

      // 다른 참가자들에게 녹화 청크 알림
      this.broadcast({
        type: 'recording-chunk-saved',
        filename,
        size,
        duration,
        uploadedBy: userId,
        timestamp: recordingMetadata.timestamp
      }, userId);

      await this.sendAnalytics('recording_chunk_saved', {
        userId,
        filename,
        size,
        duration
      });

    } catch (error) {
      console.error('Recording chunk handling error:', error);
    }
  }

  private async handleQualityReport(userId: string, data: any) {
    try {
      const { qualityData, timestamp } = data;
      
      // 품질 데이터를 KV에 저장 (실시간 분석용)
      if (this.env?.CACHE) {
        const qualityKey = `quality:${this.roomId}:${userId}:${Date.now()}`;
        const qualityReport = {
          roomId: this.roomData.id,
          userId,
          timestamp: timestamp || new Date().toISOString(),
          quality: qualityData,
          participantCount: this.roomData.participants.length
        };

        await this.env.CACHE.put(qualityKey, JSON.stringify(qualityReport), {
          expirationTtl: 3600 // 1시간 보관
        });
      }

      // Analytics Engine에 품질 데이터 전송
      await this.sendQualityAnalytics(userId, qualityData);

      // 품질이 나쁜 경우 다른 참가자들에게 알림
      if (qualityData.overall === 'poor' || qualityData.overall === 'fair') {
        this.broadcast({
          type: 'quality-alert',
          userId,
          quality: qualityData.overall,
          issues: this.extractQualityIssues(qualityData),
          timestamp: new Date().toISOString()
        }, userId);
      }

      // 참가자의 품질 정보 업데이트
      const participant = this.roomData.participants.find(p => p.id === userId);
      if (participant) {
        (participant as any).connectionQuality = qualityData.overall;
        (participant as any).lastQualityUpdate = new Date().toISOString();
        await this.saveRoomData();
      }

    } catch (error) {
      console.error('Quality report handling error:', error);
    }
  }

  private async sendQualityAnalytics(userId: string, qualityData: any) {
    try {
      if (this.env?.ANALYTICS) {
        await this.env.ANALYTICS.writeDataPoint({
          blobs: [this.roomData.id, userId, 'quality_report'],
          doubles: [
            qualityData.audio?.stats?.packetLossRate || 0,
            qualityData.video?.stats?.packetLossRate || 0,
            qualityData.network?.stats?.roundTripTime || 0,
            qualityData.audio?.stats?.jitter || 0,
            this.getQualityScore(qualityData.overall)
          ],
          indexes: [this.roomData.id, userId]
        });
      }
    } catch (error) {
      console.error('Quality analytics error:', error);
    }
  }

  private getQualityScore(quality: string): number {
    const scores: Record<string, number> = { 'excellent': 100, 'good': 75, 'fair': 50, 'poor': 25 };
    return scores[quality] || 0;
  }

  private extractQualityIssues(qualityData: any): string[] {
    const issues = [];
    
    if (qualityData.audio?.stats?.packetLossRate > 0.05) {
      issues.push('audio_packet_loss');
    }
    
    if (qualityData.video?.stats?.packetLossRate > 0.05) {
      issues.push('video_packet_loss');
    }
    
    if (qualityData.network?.stats?.roundTripTime > 300) {
      issues.push('high_latency');
    }
    
    if (qualityData.audio?.stats?.jitter > 50) {
      issues.push('audio_jitter');
    }
    
    return issues;
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
interface RoomMetrics {
  totalParticipants: number;
  peakParticipants: number;
  messagesExchanged: number;
  connectionErrors: number;
  lastActivity: string;
  sessionDuration: number; // in seconds
}

interface RoomSettings {
  allowScreenShare: boolean;
  allowRecording: boolean;
  autoMuteOnJoin: boolean;
  stunServers?: RTCIceServer[];
  turnServers?: RTCIceServer[];
  recordingSettings?: RecordingSettings;
}

interface RecordingSettings {
  enabled: boolean;
  autoStart: boolean;
  maxDuration: number; // in minutes
  format: 'webm' | 'mp4';
  quality: 'low' | 'medium' | 'high';
  audioOnly: boolean;
}

interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

interface RoomData {
  id: string;
  participants: Participant[];
  maxParticipants: number;
  createdAt: string;
  type: 'audio' | 'video';
  settings: RoomSettings;
  metrics: RoomMetrics;
  metadata?: Record<string, any>;
}

interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  lastQualityUpdate?: string;
}

interface WebSocketData {
  userId: string;
  userName: string;
  joinedAt: string;
}
