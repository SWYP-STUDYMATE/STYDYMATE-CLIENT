// Profile API with Cloudflare Workers integration
const WORKERS_API_URL = import.meta.env.VITE_WORKERS_URL || 'https://studymate-api.wjstks3474.workers.dev';

/**
 * Upload profile image to Cloudflare Workers
 * @param {File} imageFile - The image file to upload
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Upload result with URLs
 */
export async function uploadProfileImage(imageFile, metadata = {}) {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('type', 'profile');
    
    if (metadata && Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await fetch(`${WORKERS_API_URL}/api/v1/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || `Failed to upload profile image: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Profile image upload success:', result);
    
    // API 응답 구조에 맞게 반환 (data 속성이 있으면 사용, 없으면 전체 결과)
    return result.data || result;
  } catch (error) {
    console.error('Profile image upload error:', error);
    throw error;
  }
}

/**
 * Delete profile image
 * @param {string} imageUrlOrKey - The image URL or file key to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteProfileImage(imageUrlOrKey) {
  try {
    // Extract the file path from the URL if full URL is provided
    let fileKey = imageUrlOrKey;
    if (imageUrlOrKey.startsWith('http') || imageUrlOrKey.startsWith('/api/v1/upload/file/')) {
      fileKey = imageUrlOrKey.replace(`${WORKERS_API_URL}/api/v1/upload/file/`, '')
                             .replace('/api/v1/upload/file/', '');
    }
    
    const response = await fetch(`${WORKERS_API_URL}/api/v1/upload/file/${fileKey}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Delete failed' }));
      throw new Error(errorData.message || `Failed to delete profile image: ${response.status}`);
    }

    console.log('✅ Profile image deleted successfully:', fileKey);
    return true;
  } catch (error) {
    console.error('Profile image delete error:', error);
    throw error;
  }
}

/**
 * Get presigned URL for direct upload (for large files)
 * @param {string} fileName - The file name
 * @param {string} fileType - The file MIME type
 * @param {string} type - Upload type ('profile', 'chat', 'general')
 * @returns {Promise<Object>} Presigned URL data
 */
export async function getPresignedUrl(fileName, fileType, type = 'profile') {
  try {
    const response = await fetch(`${WORKERS_API_URL}/api/v1/upload/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      },
      body: JSON.stringify({
        fileName,
        fileType,
        type
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Presigned URL generation failed' }));
      throw new Error(errorData.message || `Failed to get presigned URL: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Presigned URL generated successfully');
    return result.data || result;
  } catch (error) {
    console.error('Presigned URL error:', error);
    throw error;
  }
}

/**
 * Upload chat image
 * @param {File} imageFile - The image file to upload
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Upload result with URLs
 */
export async function uploadChatImage(imageFile, metadata = {}) {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('type', 'chat');
    
    if (metadata && Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await fetch(`${WORKERS_API_URL}/api/v1/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || `Failed to upload chat image: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Chat image upload success:', result);
    return result.data || result;
  } catch (error) {
    console.error('Chat image upload error:', error);
    throw error;
  }
}

/**
 * Upload audio file (for level tests, speaking practice, etc.)
 * @param {File} audioFile - The audio file to upload
 * @param {string} folder - Folder name (e.g., 'level-test', 'speaking-practice')
 * @param {Object} metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Upload result
 */
export async function uploadAudioFile(audioFile, folder = 'general', metadata = {}) {
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('folder', folder);
    
    if (metadata && Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await fetch(`${WORKERS_API_URL}/api/v1/upload/audio`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || `Failed to upload audio file: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Audio file upload success:', result);
    return result.data || result;
  } catch (error) {
    console.error('Audio file upload error:', error);
    throw error;
  }
}

/**
 * Get file URL from key or relative path
 * @param {string} fileKeyOrPath - File key or relative path
 * @param {string} variant - Image variant ('thumbnail', 'medium', 'large')
 * @returns {string} Complete file URL
 */
export function getFileUrl(fileKeyOrPath, variant = null) {
  if (!fileKeyOrPath) return null;
  
  // If already a complete URL, return as is
  if (fileKeyOrPath.startsWith('http')) {
    return fileKeyOrPath;
  }
  
  // Build URL from file key/path
  let url = `${WORKERS_API_URL}/api/v1/upload/file/${fileKeyOrPath}`;
  if (variant) {
    url += `?variant=${variant}`;
  }
  
  return url;
}

/**
 * Get optimized image URL with parameters
 * @param {string} imageUrlOrKey - Image URL or file key
 * @param {Object} options - Optimization options {width, height, quality, format}
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(imageUrlOrKey, options = {}) {
  if (!imageUrlOrKey) return null;
  
  let baseUrl = imageUrlOrKey;
  if (!imageUrlOrKey.startsWith('http')) {
    baseUrl = getFileUrl(imageUrlOrKey);
  }
  
  const params = new URLSearchParams();
  if (options.width) params.append('w', options.width);
  if (options.height) params.append('h', options.height);
  if (options.quality) params.append('q', options.quality);
  if (options.format) params.append('f', options.format);
  
  if (params.toString()) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.toString()}`;
  }
  
  return baseUrl;
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {string} type - Expected file type ('image', 'audio', 'video')
 * @throws {Error} If file is invalid
 */
export function validateFile(file, type = 'image') {
  if (!file) {
    throw new Error('파일이 선택되지 않았습니다.');
  }

  const limits = {
    image: {
      types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
      maxSize: 10 * 1024 * 1024 // 10MB
    },
    audio: {
      types: ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
      maxSize: 50 * 1024 * 1024 // 50MB
    },
    video: {
      types: ['video/mp4', 'video/webm', 'video/quicktime'],
      maxSize: 100 * 1024 * 1024 // 100MB
    }
  };

  const typeConfig = limits[type];
  if (!typeConfig) {
    throw new Error('지원하지 않는 파일 타입입니다.');
  }

  if (!typeConfig.types.includes(file.type)) {
    const allowedTypes = typeConfig.types.map(t => t.split('/')[1].toUpperCase()).join(', ');
    throw new Error(`${allowedTypes} 파일만 업로드 가능합니다.`);
  }

  if (file.size > typeConfig.maxSize) {
    const maxSizeMB = typeConfig.maxSize / (1024 * 1024);
    throw new Error(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
  }
}