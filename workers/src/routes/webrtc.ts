import { Hono } from 'hono';
import { Env } from '../index';

export const webrtcRoutes = new Hono<{ Bindings: Env }>();

// Create a new room
webrtcRoutes.post('/create', async (c) => {
  try {
    const { roomType, maxParticipants } = await c.req.json();
    
    // Generate unique room ID
    const roomId = crypto.randomUUID();
    
    // Create Durable Object instance
    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);
    
    // Initialize room
    const response = await room.fetch(new Request('http://room/info', {
      method: 'GET'
    }));
    
    return c.json({
      success: true,
      roomId,
      roomType: roomType || 'audio',
      maxParticipants: maxParticipants || 4,
      websocketUrl: `/api/room/${roomId}/ws`,
      joinUrl: `/api/room/${roomId}/join`
    });
  } catch (error) {
    console.error('Room creation error:', error);
    return c.json({ error: 'Failed to create room' }, 500);
  }
});

// Join a room
webrtcRoutes.post('/:roomId/join', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const { userId, userName } = await c.req.json();
    
    // Get Durable Object instance
    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);
    
    // Join room
    const response = await room.fetch(new Request('http://room/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName, roomType: c.req.query('roomType') || 'audio' })
    }));
    
    const result = await response.json();
    
    if (!response.ok) {
      return c.json(result, response.status);
    }
    
    // Add WebSocket URL to response
    if (result.success) {
      result.websocketUrl = `/api/room/${roomId}/ws?userId=${userId}&userName=${encodeURIComponent(userName)}`;
    }
    
    return c.json(result);
  } catch (error) {
    console.error('Room join error:', error);
    return c.json({ error: 'Failed to join room' }, 500);
  }
});

// Leave a room
webrtcRoutes.post('/:roomId/leave', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const { userId } = await c.req.json();
    
    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);
    
    const response = await room.fetch(new Request('http://room/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    }));
    
    return c.json(await response.json());
  } catch (error) {
    console.error('Room leave error:', error);
    return c.json({ error: 'Failed to leave room' }, 500);
  }
});

// WebSocket endpoint for signaling
webrtcRoutes.get('/:roomId/ws', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const userId = c.req.query('userId');
    const userName = c.req.query('userName') || 'Anonymous';
    const upgrade = c.req.header('Upgrade');
    
    if (!upgrade || upgrade !== 'websocket') {
      return c.json({ error: 'Expected WebSocket' }, 426);
    }
    
    if (!userId) {
      return c.json({ error: 'Missing userId parameter' }, 400);
    }
    
    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);
    
    // Forward WebSocket request with query parameters
    const url = new URL(c.req.url);
    const wsUrl = `http://room/websocket?userId=${userId}&userName=${encodeURIComponent(userName)}`;
    
    return room.fetch(new Request(wsUrl, {
      headers: c.req.raw.headers
    }));
  } catch (error) {
    console.error('WebSocket error:', error);
    return c.json({ error: 'Failed to establish WebSocket' }, 500);
  }
});

// Update room settings
webrtcRoutes.patch('/:roomId/settings', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const settings = await c.req.json();
    
    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);
    
    const response = await room.fetch(new Request('http://room/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }));
    
    return c.json(await response.json());
  } catch (error) {
    console.error('Settings update error:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// Get room info
webrtcRoutes.get('/:roomId/info', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    
    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);
    
    const response = await room.fetch(new Request('http://room/info'));
    
    return c.json(await response.json());
  } catch (error) {
    console.error('Room info error:', error);
    return c.json({ error: 'Failed to get room info' }, 500);
  }
});