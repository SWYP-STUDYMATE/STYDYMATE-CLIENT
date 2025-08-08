import { Hono } from 'hono';
import { Env } from '../index';
import { saveToR2, getFromR2 } from '../services/storage';

export const uploadRoutes = new Hono<{ Bindings: Env }>();

// Upload audio file
uploadRoutes.post('/audio', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file || !userId) {
      return c.json({ error: 'Missing file or userId' }, 400);
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type' }, 400);
    }

    // Max size: 50MB
    if (file.size > 50 * 1024 * 1024) {
      return c.json({ error: 'File too large (max 50MB)' }, 400);
    }

    const buffer = await file.arrayBuffer();
    const key = `audio/${userId}/${Date.now()}-${file.name}`;
    
    await saveToR2(c.env.STORAGE, key, buffer, file.type);
    
    return c.json({
      success: true,
      key,
      url: `/api/upload/file/${key}`,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    return c.json({ error: 'Failed to upload audio' }, 500);
  }
});

// Upload image file
uploadRoutes.post('/image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string; // 'profile' | 'chat'
    
    if (!file || !userId) {
      return c.json({ error: 'Missing file or userId' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type' }, 400);
    }

    // Max size: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File too large (max 10MB)' }, 400);
    }

    const buffer = await file.arrayBuffer();
    const key = `images/${type || 'general'}/${userId}/${Date.now()}-${file.name}`;
    
    await saveToR2(c.env.STORAGE, key, buffer, file.type);

    // Generate different sizes for profile images
    let variants = {};
    if (type === 'profile') {
      // In production, you would integrate with Cloudflare Images API here
      // For now, we'll just store the original
      variants = {
        thumbnail: `/api/upload/file/${key}?size=thumbnail`,
        medium: `/api/upload/file/${key}?size=medium`,
        large: `/api/upload/file/${key}?size=large`
      };
    }
    
    return c.json({
      success: true,
      key,
      url: `/api/upload/file/${key}`,
      variants,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// Get uploaded file
uploadRoutes.get('/file/*', async (c) => {
  try {
    const key = c.req.path.replace('/api/upload/file/', '');
    
    if (!key) {
      return c.json({ error: 'Invalid file key' }, 400);
    }

    const file = await getFromR2(c.env.STORAGE, key);
    
    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Set appropriate cache headers
    const headers = new Headers();
    headers.set('Content-Type', file.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    
    if (file.httpMetadata?.contentDisposition) {
      headers.set('Content-Disposition', file.httpMetadata.contentDisposition);
    }

    return new Response(file.body, { headers });
  } catch (error) {
    console.error('File retrieval error:', error);
    return c.json({ error: 'Failed to retrieve file' }, 500);
  }
});

// Delete file
uploadRoutes.delete('/file/*', async (c) => {
  try {
    const key = c.req.path.replace('/api/upload/file/', '');
    const { userId } = await c.req.json();
    
    if (!key || !userId) {
      return c.json({ error: 'Invalid request' }, 400);
    }

    // Verify user owns the file (check if userId is in the key path)
    if (!key.includes(userId)) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await c.env.STORAGE.delete(key);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('File deletion error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});