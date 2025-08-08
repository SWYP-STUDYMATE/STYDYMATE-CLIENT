// R2 Storage 서비스

export async function saveToR2(
  bucket: R2Bucket,
  key: string,
  data: ArrayBuffer | ReadableStream,
  contentType?: string,
  customMetadata?: Record<string, string>
): Promise<R2Object> {
  try {
    const httpMetadata: R2HTTPMetadata = {};
    
    if (contentType) {
      httpMetadata.contentType = contentType;
    }

    // Set cache control based on content type
    if (contentType?.startsWith('image/')) {
      httpMetadata.cacheControl = 'public, max-age=31536000'; // 1 year for images
    } else if (contentType?.startsWith('audio/')) {
      httpMetadata.cacheControl = 'public, max-age=86400'; // 24 hours for audio
    } else {
      httpMetadata.cacheControl = 'public, max-age=3600'; // 1 hour default
    }

    const object = await bucket.put(key, data, {
      httpMetadata,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        ...customMetadata
      }
    });

    return object;
  } catch (error) {
    console.error('R2 save error:', error);
    throw new Error(`Failed to save to R2: ${key}`);
  }
}

export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  try {
    const object = await bucket.get(key);
    return object;
  } catch (error) {
    console.error('R2 get error:', error);
    return null;
  }
}

export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  try {
    await bucket.delete(key);
  } catch (error) {
    console.error('R2 delete error:', error);
    throw new Error(`Failed to delete from R2: ${key}`);
  }
}

export async function listR2Objects(
  bucket: R2Bucket,
  prefix?: string,
  limit?: number
): Promise<R2Objects> {
  try {
    const options: R2ListOptions = {
      limit: limit || 1000
    };

    if (prefix) {
      options.prefix = prefix;
    }

    return await bucket.list(options);
  } catch (error) {
    console.error('R2 list error:', error);
    throw new Error('Failed to list R2 objects');
  }
}

export async function getSignedUrl(
  bucket: R2Bucket,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    // Note: R2 doesn't support signed URLs directly in Workers
    // This is a placeholder for when signed URL support is added
    // For now, return a direct URL through the Worker
    return `/api/upload/file/${key}`;
  } catch (error) {
    console.error('Signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }
}

// Utility function to validate file types
export function isValidFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const category = type.slice(0, -2);
      return mimeType.startsWith(category + '/');
    }
    return mimeType === type;
  });
}

// Utility function to generate unique file names
export function generateUniqueFileName(
  originalName: string,
  userId: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  
  // Sanitize filename
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50);
  
  return `${userId}/${timestamp}_${random}_${sanitized}.${extension}`;
}

// Type definitions for R2
interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

interface R2ListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  delimiters?: string;
  startAfter?: string;
}