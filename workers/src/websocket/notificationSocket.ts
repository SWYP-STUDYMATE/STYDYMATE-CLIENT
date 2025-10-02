import { verify } from 'hono/jwt';
import type { Context } from 'hono';

import type { Env } from '../index';
import type { Variables } from '../types';
import { assertEnvVar } from '../utils/security';
import { listNotifications } from '../services/notifications';
import type { NotificationListItem } from '../types';

interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

interface SubscriptionContext {
  destination: string;
  pollTimer?: ReturnType<typeof setTimeout>;
}

const HEARTBEAT_INTERVAL_MS = 25000;
const NOTIFICATION_POLL_INTERVAL_MS = 15000;
const MAX_SENT_HISTORY = 200;

export async function handleNotificationWebSocket(
  c: Context<{ Bindings: Env; Variables: Variables }>
): Promise<Response> {
  const url = new URL(c.req.url);
  const token = url.searchParams.get('token')
    ?? extractBearerToken(c.req.header('Authorization'))
    ?? '';

  const user = await verifyUserToken(token, c.env);
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { 0: client, 1: server } = new WebSocketPair();
  const session = new NotificationSocketSession(server, c.env, user.id);
  session.start();

  return new Response(null, { status: 101, webSocket: client });
}

function extractBearerToken(authorizationHeader?: string | null): string | undefined {
  if (!authorizationHeader) return undefined;
  const match = authorizationHeader.match(/^Bearer (.+)$/i);
  return match?.[1];
}

async function verifyUserToken(token: string, env: Env): Promise<{ id: string } | null> {
  if (!token) return null;
  try {
    const secret = assertEnvVar(env.JWT_SECRET, 'JWT_SECRET');
    const verifyOptions: { alg: 'HS512'; iss?: string } = { alg: 'HS512' };
    const issuer = env.JWT_ISSUER ?? env.API_BASE_URL;
    if (issuer) {
      verifyOptions.iss = issuer;
    }

    const payload = await verify(token, secret, verifyOptions);
    if (typeof payload.sub !== 'string') {
      return null;
    }
    return { id: payload.sub };
  } catch (error) {
    console.error('[notifications-ws] Failed to verify token', error);
    return null;
  }
}

class NotificationSocketSession {
  private readonly ws: WebSocket;
  private readonly env: Env;
  private readonly userId: string;
  private buffer = '';
  private connected = false;
  private heartbeatTimer?: ReturnType<typeof setTimeout>;
  private readonly subscriptions = new Map<string, SubscriptionContext>();
  private readonly sentHistory = new Set<number>();
  private readonly sentOrder: number[] = [];

  constructor(ws: WebSocket, env: Env, userId: string) {
    this.ws = ws;
    this.env = env;
    this.userId = userId;
  }

  start() {
    this.ws.accept();
    this.ws.addEventListener('message', (event) => {
      this.handleIncomingData(event.data);
    });
    this.ws.addEventListener('close', () => {
      this.cleanup();
    });
    this.ws.addEventListener('error', (event) => {
      console.error('[notifications-ws] Socket error', event);
      this.cleanup();
    });
  }

  private handleIncomingData(data: unknown) {
    const text = typeof data === 'string'
      ? data
      : data instanceof ArrayBuffer
        ? new TextDecoder().decode(data)
        : '';

    if (!text) {
      return;
    }

    this.buffer += text;

    while (true) {
      const terminatorIndex = this.buffer.indexOf('\u0000');
      if (terminatorIndex === -1) {
        break;
      }

      const frameText = this.buffer.slice(0, terminatorIndex);
      this.buffer = this.buffer.slice(terminatorIndex + 1);

      const trimmed = frameText.trim();
      if (trimmed === '') {
        continue; // heartbeat
      }

      const frame = this.parseFrame(frameText);
      if (frame) {
        this.handleFrame(frame);
      }
    }
  }

  private parseFrame(raw: string): StompFrame | null {
    const lines = raw.split('\n');
    if (!lines.length) return null;

    const command = lines.shift()?.trim() ?? '';
    if (!command) return null;

    const headers: Record<string, string> = {};
    let line: string | undefined;
    while ((line = lines.shift()) !== undefined) {
      if (line === '') break;
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) continue;
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      headers[key] = value;
    }

    const body = lines.join('\n');
    return { command, headers, body };
  }

  private handleFrame(frame: StompFrame) {
    const { command } = frame;
    switch (command) {
      case 'CONNECT':
      case 'STOMP':
        this.handleConnect(frame);
        break;
      case 'SUBSCRIBE':
        this.handleSubscribe(frame);
        break;
      case 'UNSUBSCRIBE':
        this.handleUnsubscribe(frame);
        break;
      case 'DISCONNECT':
        this.handleDisconnect(frame);
        break;
      case 'SEND':
        // Notifications are server-driven; acknowledge politely
        this.ackReceipt(frame.headers['receipt']);
        break;
      default:
        console.warn('[notifications-ws] Unsupported STOMP command', command);
        this.sendError(`Unsupported command: ${command}`);
    }
  }

  private handleConnect(frame: StompFrame) {
    if (this.connected) {
      return;
    }

    const heartbeatHeader = frame.headers['heart-beat'] ?? '0,0';
    const [, clientHeartbeatRaw] = heartbeatHeader.split(',');
    const clientHeartbeat = Number(clientHeartbeatRaw) || 0;
    const serverHeartbeat = Math.max(clientHeartbeat, HEARTBEAT_INTERVAL_MS);

    this.connected = true;
    this.sendFrame('CONNECTED', {
      version: '1.2',
      'heart-beat': `0,${serverHeartbeat}`
    });

    this.scheduleHeartbeat(serverHeartbeat);
  }

  private scheduleHeartbeat(interval: number) {
    if (interval <= 0) return;
    const sendBeat = () => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('\n');
        this.heartbeatTimer = setTimeout(sendBeat, interval);
      }
    };
    this.heartbeatTimer = setTimeout(sendBeat, interval);
  }

  private handleSubscribe(frame: StompFrame) {
    const id = frame.headers['id'] ?? crypto.randomUUID();
    const destination = frame.headers['destination'];

    if (!destination) {
      this.sendError('SUBSCRIBE frame missing destination header');
      return;
    }

    this.subscriptions.set(id, { destination });

    if (destination.includes('notifications')) {
      this.startNotificationPolling(id, destination);
    }

    this.ackReceipt(frame.headers['receipt']);
  }

  private handleUnsubscribe(frame: StompFrame) {
    const id = frame.headers['id'];
    if (!id) {
      this.sendError('UNSUBSCRIBE frame missing id header');
      return;
    }
    this.stopNotificationPolling(id);
    this.subscriptions.delete(id);
    this.ackReceipt(frame.headers['receipt']);
  }

  private handleDisconnect(frame: StompFrame) {
    this.ackReceipt(frame.headers['receipt']);
    this.cleanup();
    this.ws.close(1000, 'Client disconnected');
  }

  private ackReceipt(receiptId?: string) {
    if (!receiptId) return;
    this.sendFrame('RECEIPT', { 'receipt-id': receiptId });
  }

  private sendError(message: string) {
    this.sendFrame('ERROR', { message }, message);
  }

  private sendFrame(command: string, headers: Record<string, string> = {}, body = '') {
    if (this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
    const frame = [command, ...headerLines, '', body, '\u0000'].join('\n');
    this.ws.send(frame);
  }

  private async startNotificationPolling(subscriptionId: string, destination: string) {
    const poll = async () => {
      try {
        await this.sendNotificationSnapshot(subscriptionId, destination);
      } catch (error) {
        console.error('[notifications-ws] Failed to send notification snapshot', error);
      }

      const context = this.subscriptions.get(subscriptionId);
      if (!context) return;
      context.pollTimer = setTimeout(poll, NOTIFICATION_POLL_INTERVAL_MS);
    };

    await poll();
  }

  private stopNotificationPolling(subscriptionId: string) {
    const context = this.subscriptions.get(subscriptionId);
    if (context?.pollTimer) {
      clearTimeout(context.pollTimer);
    }
  }

  private async sendNotificationSnapshot(subscriptionId: string, destination: string) {
    const result = await listNotifications(this.env, this.userId, {
      page: 1,
      size: 20,
      unreadOnly: true
    });

    const freshNotifications = result.data.filter((item) => this.registerNotification(item.id));

    for (const notification of freshNotifications) {
      const payload = this.serializeNotification(notification, result.unreadCount);
      this.sendFrame('MESSAGE', {
        subscription: subscriptionId,
        'message-id': crypto.randomUUID(),
        destination,
        'content-type': 'application/json'
      }, payload);
    }
  }

  private registerNotification(notificationId: number): boolean {
    if (this.sentHistory.has(notificationId)) {
      return false;
    }

    this.sentHistory.add(notificationId);
    this.sentOrder.push(notificationId);

    if (this.sentOrder.length > MAX_SENT_HISTORY) {
      const expired = this.sentOrder.shift();
      if (typeof expired === 'number') {
        this.sentHistory.delete(expired);
      }
    }

    return true;
  }

  private serializeNotification(notification: NotificationListItem, unreadCount: number): string {
    const payload = {
      ...notification,
      unreadCount,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(payload);
  }

  private cleanup() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    for (const [id, context] of this.subscriptions.entries()) {
      if (context.pollTimer) {
        clearTimeout(context.pollTimer);
      }
      this.subscriptions.delete(id);
    }
  }
}
