import { Hono } from 'hono';
import { Env } from '../index';
import { Variables, WebRTCRoom } from '../types';
import { successResponse, createdResponse } from '../utils/response';
import { validationError, notFoundError, conflictError } from '../middleware/error-handler';
import { auth } from '../middleware/auth';

export const webrtcRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Create a new room
webrtcRoutes.post('/create', auth({ optional: true }), async (c) => {
  const { roomType = 'audio', maxParticipants = 4, metadata = {} } = await c.req.json();

  // Validate room type
  if (!['audio', 'video'].includes(roomType)) {
    throw validationError('Invalid room type. Must be "audio" or "video"');
  }

  // Validate max participants
  if (maxParticipants < 2 || maxParticipants > 10) {
    throw validationError('Max participants must be between 2 and 10');
  }

  // Generate unique room ID
  const roomId = crypto.randomUUID();

  // Create Durable Object instance
  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);

  // Initialize room
  const response = await room.fetch(new Request('http://room/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomType, maxParticipants, metadata })
  }));

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initialize room');
  }

  const data = {
    roomId,
    roomType,
    maxParticipants,
    metadata,
    websocketUrl: `/api/v1/room/${roomId}/ws`,
    joinUrl: `/api/v1/room/${roomId}/join`,
    createdAt: new Date().toISOString()
  };

  // Cache room info
  await c.env.CACHE.put(
    `room:${roomId}`,
    JSON.stringify(data),
    { expirationTtl: 3600 } // 1 hour
  );

  return createdResponse(c, data, `/api/v1/room/${roomId}`);
});

// Join a room
webrtcRoutes.post('/:roomId/join', auth({ optional: true }), async (c) => {
  const roomId = c.req.param('roomId');
  const { userId, userName, userMetadata = {} } = await c.req.json();

  if (!userId || !userName) {
    throw validationError('userId and userName are required');
  }

  // Check if room exists in cache
  const cachedRoom = await c.env.CACHE.get(`room:${roomId}`);
  if (!cachedRoom) {
    // Try to get room info from Durable Object
    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);

    const infoResponse = await room.fetch(new Request('http://room/info'));
    if (!infoResponse.ok) {
      throw notFoundError('Room');
    }
  }

  // Get Durable Object instance
  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);

  // Join room
  const response = await room.fetch(new Request('http://room/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userName, userMetadata })
  }));

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw conflictError(error.message || 'Room is full');
    }
    throw new Error(error.message || 'Failed to join room');
  }

  const result = await response.json();

  return successResponse(c, {
    ...result,
    websocketUrl: `/api/v1/room/${roomId}/ws?userId=${userId}&userName=${encodeURIComponent(userName)}`
  });
});

// Leave a room
webrtcRoutes.post('/:roomId/leave', auth({ optional: true }), async (c) => {
  const roomId = c.req.param('roomId');
  const { userId } = await c.req.json();

  if (!userId) {
    throw validationError('userId is required');
  }

  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);

  const response = await room.fetch(new Request('http://room/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  }));

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to leave room');
  }

  return successResponse(c, await response.json());
});

// WebSocket endpoint for signaling
webrtcRoutes.get('/:roomId/ws', async (c) => {
  const roomId = c.req.param('roomId');
  const userId = c.req.query('userId');
  const userName = c.req.query('userName') || 'Anonymous';
  const upgrade = c.req.header('Upgrade');

  if (!upgrade || upgrade !== 'websocket') {
    throw validationError('Expected WebSocket upgrade header');
  }

  if (!userId) {
    throw validationError('userId parameter is required');
  }

  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);

  // Forward WebSocket request with query parameters
  const wsUrl = `http://room/websocket?userId=${userId}&userName=${encodeURIComponent(userName)}`;

  return room.fetch(new Request(wsUrl, {
    headers: c.req.raw.headers
  }));
});

// Update room settings
webrtcRoutes.patch('/:roomId/settings', auth({ optional: true }), async (c) => {
  const roomId = c.req.param('roomId');
  const settings = await c.req.json();

  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);

  const response = await room.fetch(new Request('http://room/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  }));

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update settings');
  }

  // Update cache if room exists
  const cachedRoom = await c.env.CACHE.get(`room:${roomId}`);
  if (cachedRoom) {
    const roomData = JSON.parse(cachedRoom);
    await c.env.CACHE.put(
      `room:${roomId}`,
      JSON.stringify({ ...roomData, ...settings }),
      { expirationTtl: 3600 }
    );
  }

  return successResponse(c, await response.json());
});

// Get room info
webrtcRoutes.get('/:roomId/info', async (c) => {
  const roomId = c.req.param('roomId');

  // Check cache first
  const cachedRoom = await c.env.CACHE.get(`room:${roomId}`);
  if (cachedRoom) {
    return successResponse(c, JSON.parse(cachedRoom));
  }

  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);

  const response = await room.fetch(new Request('http://room/info'));

  if (!response.ok) {
    if (response.status === 404) {
      throw notFoundError('Room');
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to get room info');
  }

  const data = await response.json();

  // Cache the result
  await c.env.CACHE.put(
    `room:${roomId}`,
    JSON.stringify(data),
    { expirationTtl: 3600 }
  );

  return successResponse(c, data);
});

// Get ICE servers for a room
webrtcRoutes.get('/:roomId/ice-servers', async (c) => {
  const roomId = c.req.param('roomId');

  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);

  const response = await room.fetch(new Request('http://room/ice-servers'));

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get ICE servers');
  }

  return successResponse(c, await response.json());
});

// Get room metrics and analytics
webrtcRoutes.get('/:roomId/metrics', auth({ optional: true }), async (c) => {
  const roomId = c.req.param('roomId');

  const id = c.env.ROOM.idFromName(roomId);
  const room = c.env.ROOM.get(id);

  const response = await room.fetch(new Request('http://room/metrics'));

  if (!response.ok) {
    if (response.status === 404) {
      throw notFoundError('Room');
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to get room metrics');
  }

  const data = await response.json();

  return successResponse(c, {
    ...data,
    analytics: {
      uptimeHours: Math.floor(data.metrics.sessionDuration / 3600),
      averageParticipants: data.metrics.totalParticipants > 0 ? 
        data.metrics.peakParticipants / Math.max(1, data.currentParticipants) : 0,
      messagesPerMinute: data.metrics.sessionDuration > 0 ? 
        (data.metrics.messagesExchanged / (data.metrics.sessionDuration / 60)) : 0
    }
  });
});

// Upload recording chunk to R2 storage
webrtcRoutes.post('/:roomId/recording/upload', auth({ optional: true }), async (c) => {
  const roomId = c.req.param('roomId');
  const formData = await c.req.formData();
  
  const file = formData.get('recording') as File;
  const userId = formData.get('userId') as string;
  const filename = formData.get('filename') as string;
  
  if (!file || !userId || !filename) {
    throw validationError('recording, userId, and filename are required');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const extension = filename.split('.').pop() || 'webm';
  const storageKey = `recordings/${roomId}/${userId}/${timestamp}-${filename}`;

  try {
    // Upload to R2
    await c.env.STORAGE.put(storageKey, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'video/webm'
      }
    });

    // Get Durable Object to notify about the upload
    const id = c.env.ROOM.idFromName(roomId);
    const room = c.env.ROOM.get(id);

    // Notify room about recording chunk
    await room.fetch(new Request('http://room/websocket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'recording-chunk',
        userId,
        data: {
          filename: storageKey,
          originalFilename: filename,
          size: file.size,
          duration: formData.get('duration') || 0,
          contentType: file.type
        }
      })
    }));

    return successResponse(c, {
      uploadedTo: storageKey,
      size: file.size,
      contentType: file.type,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recording upload error:', error);
    throw new Error('Failed to upload recording');
  }
});

// List active rooms (admin only)
webrtcRoutes.get('/list', auth({ roles: ['admin'] }), async (c) => {
  // This would require a separate storage mechanism to track active rooms
  // For now, return empty list
  return successResponse(c, {
    rooms: [],
    total: 0,
    message: 'Room listing requires additional infrastructure setup'
  });
});