import { Hono } from 'hono';
import { Env } from '../index';
import { Variables } from '../types';
import { successResponse, createdResponse, noContentResponse, setCacheHeaders } from '../utils/response';
import { validationError, notFoundError, forbiddenError } from '../middleware/error-handler';
import { auth, getCurrentUser } from '../middleware/auth';
import { bodySizeLimit } from '../middleware/security';
import { saveToR2, getFromR2, deleteFromR2 } from '../services/storage';

export const uploadRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

interface UploadResponse {
  key: string;
  url: string;
  size: number;
  type: string;
  variants?: Record<string, string>;
  metadata?: Record<string, any>;
}

// File type and size limits
const FILE_LIMITS = {
  audio: {
    types: ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  image: {
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  video: {
    types: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSize: 100 * 1024 * 1024 // 100MB
  },
  document: {
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 20 * 1024 * 1024 // 20MB
  }
};

// Validate file
function validateFile(file: File, type: keyof typeof FILE_LIMITS): void {
  const limits = FILE_LIMITS[type];

  if (!limits.types.includes(file.type)) {
    throw validationError(`Invalid file type. Allowed types: ${limits.types.join(', ')}`);
  }

  if (file.size > limits.maxSize) {
    const maxSizeMB = limits.maxSize / (1024 * 1024);
    throw validationError(`File too large. Maximum size: ${maxSizeMB}MB`);
  }
}

// Generate unique file key
function generateFileKey(type: string, userId: string, fileName: string, folder?: string): string {
  const timestamp = Date.now();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const parts = [type];

  if (folder) {
    parts.push(folder);
  }

  parts.push(userId, `${timestamp}-${safeFileName}`);

  return parts.join('/');
}

// Upload audio file
uploadRoutes.post('/audio', auth(), bodySizeLimit(50 * 1024 * 1024), async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const folder = formData.get('folder') as string;
  const metadata = formData.get('metadata') as string;

  if (!file) {
    throw validationError('File is required');
  }

  const user = getCurrentUser(c)!;
  validateFile(file, 'audio');

  const buffer = await file.arrayBuffer();
  const key = generateFileKey('audio', user.id, file.name, folder);

  // Save file with metadata
  const uploadMetadata = metadata ? JSON.parse(metadata) : {};
  await saveToR2(c.env.STORAGE, key, buffer, file.type, {
    userId: user.id,
    originalName: file.name,
    ...uploadMetadata
  });

  const response: UploadResponse = {
    key,
    url: `/api/v1/upload/file/${key}`,
    size: file.size,
    type: file.type,
    metadata: uploadMetadata
  };

  return createdResponse(c, response, response.url);
});

// Upload image file
uploadRoutes.post('/image', auth(), bodySizeLimit(10 * 1024 * 1024), async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const type = formData.get('type') as string; // 'profile' | 'chat' | 'general'
  const metadata = formData.get('metadata') as string;

  if (!file) {
    throw validationError('File is required');
  }

  const user = getCurrentUser(c)!;
  validateFile(file, 'image');

  const buffer = await file.arrayBuffer();
  const key = generateFileKey('images', user.id, file.name, type || 'general');

  // Save file with metadata
  const uploadMetadata = metadata ? JSON.parse(metadata) : {};
  await saveToR2(c.env.STORAGE, key, buffer, file.type, {
    userId: user.id,
    originalName: file.name,
    imageType: type,
    ...uploadMetadata
  });

  // Generate variant URLs (for Cloudflare Images integration)
  let variants: Record<string, string> = {};
  if (type === 'profile') {
    variants = {
      thumbnail: `/api/v1/upload/file/${key}?variant=thumbnail`,
      medium: `/api/v1/upload/file/${key}?variant=medium`,
      large: `/api/v1/upload/file/${key}?variant=large`
    };
  }

  const response: UploadResponse = {
    key,
    url: `/api/v1/upload/file/${key}`,
    size: file.size,
    type: file.type,
    variants,
    metadata: uploadMetadata
  };

  // Cache profile image URL
  if (type === 'profile') {
    await c.env.CACHE.put(
      `profile-image:${user.id}`,
      JSON.stringify(response),
      { expirationTtl: 86400 } // 24 hours
    );
  }

  return createdResponse(c, response, response.url);
});

// Upload video file
uploadRoutes.post('/video', auth(), bodySizeLimit(100 * 1024 * 1024), async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const metadata = formData.get('metadata') as string;

  if (!file) {
    throw validationError('File is required');
  }

  const user = getCurrentUser(c)!;
  validateFile(file, 'video');

  // For large video files, consider using multipart upload
  // This is a simplified version
  const buffer = await file.arrayBuffer();
  const key = generateFileKey('videos', user.id, file.name);

  const uploadMetadata = metadata ? JSON.parse(metadata) : {};
  await saveToR2(c.env.STORAGE, key, buffer, file.type, {
    userId: user.id,
    originalName: file.name,
    ...uploadMetadata
  });

  const response: UploadResponse = {
    key,
    url: `/api/v1/upload/file/${key}`,
    size: file.size,
    type: file.type,
    metadata: uploadMetadata
  };

  return createdResponse(c, response, response.url);
});

// Get uploaded file
uploadRoutes.get('/file/*', async (c) => {
  const path = c.req.path.replace('/api/v1/upload/file/', '').replace('/api/upload/file/', '');
  const variant = c.req.query('variant');
  const download = c.req.query('download') === 'true';

  if (!path) {
    throw validationError('Invalid file path');
  }

  // Check cache first for frequently accessed files
  const cacheKey = `file:${path}${variant ? `:${variant}` : ''}`;
  const cached = await c.env.CACHE.get(cacheKey, { type: 'stream' });
  if (cached) {
    setCacheHeaders(c, { maxAge: 3600, sMaxAge: 86400 });
    return new Response(cached, {
      headers: c.res.headers
    });
  }

  const file = await getFromR2(c.env.STORAGE, path);

  if (!file) {
    throw notFoundError('File');
  }

  // Set appropriate headers
  const headers = new Headers();
  headers.set('Content-Type', file.httpMetadata?.contentType || 'application/octet-stream');

  if (download || file.httpMetadata?.contentDisposition) {
    const filename = file.customMetadata?.originalName || path.split('/').pop();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  } else {
    headers.set('Content-Disposition', 'inline');
  }

  // Set cache headers
  setCacheHeaders(c, {
    maxAge: 3600,       // 1 hour browser cache
    sMaxAge: 86400,     // 24 hours CDN cache
    private: false
  });

  Object.entries(c.res.headers).forEach(([key, value]) => {
    headers.set(key, value as string);
  });

  // Cache frequently accessed files
  if (!download && file.size < 1024 * 1024) { // Cache files under 1MB
    await c.env.CACHE.put(
      cacheKey,
      file.body,
      { expirationTtl: 3600 }
    );
  }

  return new Response(file.body, { headers });
});

// Delete file
uploadRoutes.delete('/file/*', auth(), async (c) => {
  const path = c.req.path.replace('/api/v1/upload/file/', '').replace('/api/upload/file/', '');
  const user = getCurrentUser(c)!;

  if (!path) {
    throw validationError('Invalid file path');
  }

  // Get file metadata to verify ownership
  const file = await getFromR2(c.env.STORAGE, path);
  if (!file) {
    throw notFoundError('File');
  }

  // Verify user owns the file
  const fileUserId = file.customMetadata?.userId;
  if (fileUserId !== user.id && user.role !== 'admin') {
    throw forbiddenError('You do not have permission to delete this file');
  }

  await deleteFromR2(c.env.STORAGE, path);

  // Clear related caches
  await c.env.CACHE.delete(`file:${path}`);
  if (path.includes('profile')) {
    await c.env.CACHE.delete(`profile-image:${user.id}`);
  }

  return noContentResponse(c);
});

// Get upload URL (for direct uploads)
uploadRoutes.post('/presigned-url', auth(), async (c) => {
  const { fileName, fileType, type = 'general' } = await c.req.json();

  if (!fileName || !fileType) {
    throw validationError('fileName and fileType are required');
  }

  const user = getCurrentUser(c)!;
  const key = generateFileKey(type, user.id, fileName);

  // In production, generate a presigned URL for direct upload to R2
  // This is a placeholder response
  return successResponse(c, {
    uploadUrl: `/api/v1/upload/${type}`,
    key,
    method: 'POST',
    fields: {
      key,
      fileName,
      fileType
    },
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
  });
});