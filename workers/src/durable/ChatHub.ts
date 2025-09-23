import type { DurableObjectState } from '@cloudflare/workers-types';
import type { Env } from '../index';
import { createChatMessage, ChatMessageCreatePayload } from '../services/chat';
import { queryFirst } from '../utils/db';
import { AppError } from '../utils/errors';
import { verify } from 'hono/jwt';
import { assertEnvVar } from '../utils/security';

interface ConnectionState {
  id: string;
  userId: string;
  subscriptions: Map<string, string>;
  buffer: string;
  profile?: { name?: string; profileImage?: string };
}

interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface AuthInfo {
  id: string;
  name?: string;
}

interface PublishEvent {
  destination: string;
  payload: unknown;
  headers?: Record<string, string>;
  userId?: string;
}

function parseStompFrame(raw: string): StompFrame | null {
  const trimmed = raw.replace(/\r/g, '');
  if (!trimmed.trim()) {
    return null;
  }
  const parts = trimmed.split('\n');
  const command = parts.shift() ?? '';
  const headers: Record<string, string> = {};
  while (parts.length > 0) {
    const line = parts.shift() as string;
    if (line === '') {
      break;
    }
    const idx = line.indexOf(':');
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      headers[key] = value;
    }
  }
  const body = parts.join('\n');
  return { command, headers, body };
}

function serializeStompFrame(frame: StompFrame): string {
  const headerLines = Object.entries(frame.headers)
    .map(([key, value]) => `${key}:${value}`)
    .join('\n');
  return `${frame.command}\n${headerLines}\n\n${frame.body}\0`;
}

function normalizeDestination(destination: string, userId?: string): string {
  if (destination.startsWith('/user/')) {
    const keyUser = userId ?? '';
    return `${destination}|${keyUser}`;
  }
  return destination;
}

function safeJsonParse<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

function buildMessageFrame(
  subscriptionId: string,
  destination: string,
  body: unknown
): StompFrame {
  return {
    command: 'MESSAGE',
    headers: {
      subscription: subscriptionId,
      'message-id': crypto.randomUUID(),
      destination,
      'content-type': 'application/json'
    },
    body: JSON.stringify(body ?? null)
  };
}

export class ChatHub {
  private connections = new Map<WebSocket, ConnectionState>();
  private destinationMap = new Map<string, Map<WebSocket, string>>();

  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];
      this.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    if (request.method === 'POST') {
      const event = await request.json<PublishEvent>();
      await this.publish(event.destination, event.payload, event.userId);
      return new Response(null, { status: 204 });
    }

    return new Response('Not Found', { status: 404 });
  }

  private acceptWebSocket(socket: WebSocket, userId?: string) {
    const id = crypto.randomUUID();
    const state: ConnectionState = {
      id,
      userId: userId ?? '',
      subscriptions: new Map(),
      buffer: ''
    };
    this.connections.set(socket, state);

    socket.accept();

    socket.addEventListener('message', (event) => {
      if (typeof event.data !== 'string') {
        return;
      }
      state.buffer += event.data as string;
      let frameEnd = state.buffer.indexOf('\0');
      while (frameEnd >= 0) {
        const rawFrame = state.buffer.slice(0, frameEnd);
        state.buffer = state.buffer.slice(frameEnd + 1);
        const frame = parseStompFrame(rawFrame);
        if (frame) {
          this.handleFrame(socket, state, frame).catch((error) => {
            console.error('[ChatHub] Failed to handle frame', error);
          });
        }
        frameEnd = state.buffer.indexOf('\0');
      }
    });

    socket.addEventListener('close', () => {
      this.cleanup(socket);
    });

    socket.addEventListener('error', () => {
      this.cleanup(socket);
    });
  }

  private async handleFrame(socket: WebSocket, state: ConnectionState, frame: StompFrame) {
    switch (frame.command) {
      case 'CONNECT': {
        const auth = await this.authenticateConnection(frame.headers);
        if (!auth) {
          this.sendError(socket, 'Unauthorized');
          socket.close(1008, 'Unauthorized');
          return;
        }
        state.userId = auth.id;
        const profile = await this.getUserProfile(auth.id);
        state.profile = {
          name: profile.name ?? auth.name,
          profileImage: profile.profileImage
        };
        this.sendFrame(socket, {
          command: 'CONNECTED',
          headers: {
            version: '1.2',
            'heart-beat': '0,0'
          },
          body: ''
        });
        break;
      }
      case 'SUBSCRIBE': {
        const destination = frame.headers.destination;
        const subscriptionId = frame.headers.id;
        if (!destination || !subscriptionId) {
          this.sendError(socket, 'SUBSCRIBE frame missing destination or id');
          return;
        }
        const key = normalizeDestination(destination, state.userId);
        state.subscriptions.set(subscriptionId, key);
        let subMap = this.destinationMap.get(key);
        if (!subMap) {
          subMap = new Map<WebSocket, string>();
          this.destinationMap.set(key, subMap);
        }
        subMap.set(socket, subscriptionId);
        break;
      }
      case 'UNSUBSCRIBE': {
        const subscriptionId = frame.headers.id;
        if (!subscriptionId) {
          return;
        }
        const key = state.subscriptions.get(subscriptionId);
        if (!key) {
          return;
        }
        state.subscriptions.delete(subscriptionId);
        const subMap = this.destinationMap.get(key);
        subMap?.delete(socket);
        if (subMap && subMap.size === 0) {
          this.destinationMap.delete(key);
        }
        break;
      }
      case 'SEND': {
        const destination = frame.headers.destination;
        if (!destination) {
          this.sendError(socket, 'SEND frame missing destination');
          return;
        }
        await this.handleSend(socket, destination, frame.body, state);
        break;
      }
      case 'DISCONNECT': {
        socket.close(1000, 'Client disconnect');
        break;
      }
      default:
        // Ignore other commands for now
        break;
    }
  }

  private async handleSend(socket: WebSocket, destination: string, body: string, state: ConnectionState) {
    if (!state.userId) {
      this.sendError(socket, 'Unauthorized');
      socket.close(1008, 'Unauthorized');
      return;
    }
    if (destination === '/pub/chat/message') {
      const parsed = safeJsonParse<Partial<ChatMessageCreatePayload>>(body) ?? {};
      const roomId = Number(parsed.roomId);
      if (!Number.isFinite(roomId)) {
        throw new AppError('roomId가 필요합니다.', 400, 'INVALID_ROOM_ID');
      }
      const message = await createChatMessage(this.env, state.userId, {
        roomId,
        message: parsed.message,
        imageUrls: parsed.imageUrls,
        audioData: parsed.audioData,
        audioUrl: parsed.audioUrl,
        messageType: parsed.messageType
      });
      await this.publish(`/sub/chat/room/${message.roomId}`, message);
    } else if (destination === '/pub/chat/typing') {
      const payload = safeJsonParse<{ roomId: number; isTyping: boolean }>(body);
      if (!payload || !Number.isFinite(payload.roomId)) {
        return;
      }
      const profile = state.profile ?? await this.getUserProfile(state.userId);
      state.profile = profile;
      await this.publish(`/sub/chat/room/${payload.roomId}/typing`, {
        userId: state.userId,
        userName: profile.name,
        userProfileImage: profile.profileImage,
        isTyping: Boolean(payload.isTyping),
        timestamp: nowIso()
      });
    }
  }

  private async authenticateConnection(headers: Record<string, string>): Promise<AuthInfo | null> {
    const authorization = headers['Authorization'] ?? headers['authorization'];
    if (!authorization) {
      return null;
    }
    const match = authorization.match(/^Bearer (.+)$/i);
    if (!match) {
      return null;
    }
    try {
      const secret = assertEnvVar(this.env.JWT_SECRET, 'JWT_SECRET');
      const verifyOptions: { alg: 'HS512'; iss?: string } = { alg: 'HS512' };
      const issuer = this.env.JWT_ISSUER ?? this.env.API_BASE_URL;
      if (issuer) {
        verifyOptions.iss = issuer;
      }
      const payload = await verify(match[1], secret, verifyOptions);
      const id = payload.sub ? String(payload.sub) : '';
      if (!id) {
        return null;
      }
      return { id, name: payload.name as string | undefined };
    } catch {
      return null;
    }
  }

  private async getUserProfile(userId: string): Promise<{ name?: string; profileImage?: string }> {
    const row = await queryFirst<{ name: string | null; profile_image: string | null }>(
      this.env.DB,
      'SELECT name, profile_image FROM users WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return {
      name: row?.name ?? undefined,
      profileImage: row?.profile_image ?? undefined
    };
  }

  private async publish(destination: string, payload: unknown, userId?: string) {
    const key = normalizeDestination(destination, userId);
    const subscribers = this.destinationMap.get(key);
    if (!subscribers || subscribers.size === 0) {
      return;
    }
    for (const [socket, subscriptionId] of subscribers.entries()) {
      if (socket.readyState !== WebSocket.OPEN) {
        continue;
      }
      this.sendFrame(socket, buildMessageFrame(subscriptionId, destination, payload));
    }
  }

  private sendFrame(socket: WebSocket, frame: StompFrame) {
    try {
      socket.send(serializeStompFrame(frame));
    } catch (error) {
      console.error('[ChatHub] Failed to send frame', error);
      socket.close(1011, 'Frame send error');
    }
  }

  private sendError(socket: WebSocket, message: string) {
    this.sendFrame(socket, {
      command: 'ERROR',
      headers: { message },
      body: message
    });
  }

  private cleanup(socket: WebSocket) {
    const state = this.connections.get(socket);
    if (!state) {
      return;
    }
    for (const [subscriptionId, key] of state.subscriptions.entries()) {
      const subMap = this.destinationMap.get(key);
      subMap?.delete(socket);
      if (subMap && subMap.size === 0) {
        this.destinationMap.delete(key);
      }
    }
    this.connections.delete(socket);
  }
}
