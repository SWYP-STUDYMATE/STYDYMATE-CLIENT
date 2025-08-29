const API_BASE_URL = import.meta.env.VITE_WORKERS_API_URL || 'http://localhost:8787';

// 파일 업로드
export async function uploadFile(file, options = {}) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', localStorage.getItem('userId') || 'guest');
    
    if (options.sessionId) {
      formData.append('sessionId', options.sessionId);
    }
    
    if (options.category) {
      formData.append('category', options.category); // 'profile', 'session', 'chat', 'document'
    }
    
    if (options.isPublic !== undefined) {
      formData.append('isPublic', options.isPublic.toString());
    }

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
}

// 다중 파일 업로드
export async function uploadMultipleFiles(files, options = {}) {
  try {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    formData.append('userId', localStorage.getItem('userId') || 'guest');
    
    if (options.sessionId) {
      formData.append('sessionId', options.sessionId);
    }
    
    if (options.category) {
      formData.append('category', options.category);
    }

    const response = await fetch(`${API_BASE_URL}/files/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload multiple files error:', error);
    throw error;
  }
}

// 파일 삭제
export async function deleteFile(fileId) {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete file error:', error);
    throw error;
  }
}

// 파일 정보 조회
export async function getFileInfo(fileId) {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get file info error:', error);
    throw error;
  }
}

// 파일 목록 조회
export async function getUserFiles(options = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (options.category) {
      queryParams.append('category', options.category);
    }
    
    if (options.limit) {
      queryParams.append('limit', options.limit.toString());
    }
    
    if (options.offset) {
      queryParams.append('offset', options.offset.toString());
    }

    const response = await fetch(`${API_BASE_URL}/files/user?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get user files error:', error);
    throw error;
  }
}

// 파일 다운로드 URL 생성
export async function getDownloadUrl(fileId) {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/download-url`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get download URL error:', error);
    throw error;
  }
}

// 프로필 이미지 업로드 (특별한 처리)
export async function uploadProfileImage(imageFile, options = {}) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('userId', localStorage.getItem('userId') || 'guest');
    
    if (options.cropData) {
      formData.append('cropData', JSON.stringify(options.cropData));
    }

    const response = await fetch(`${API_BASE_URL}/files/profile/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload profile image error:', error);
    throw error;
  }
}

// 업로드 진행률을 추적하는 파일 업로드
export function uploadFileWithProgress(file, options = {}, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('userId', localStorage.getItem('userId') || 'guest');
    
    if (options.sessionId) {
      formData.append('sessionId', options.sessionId);
    }
    
    if (options.category) {
      formData.append('category', options.category);
    }

    // 진행률 추적
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete, event.loaded, event.total);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      } else {
        reject(new Error(`HTTP error! status: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    const token = localStorage.getItem('accessToken');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.open('POST', `${API_BASE_URL}/files/upload`);
    xhr.send(formData);
  });
}

// 파일 타입 검증
export function validateFileType(file, allowedTypes = []) {
  if (allowedTypes.length === 0) {
    return true; // 제한 없음
  }
  
  return allowedTypes.some(type => {
    if (type.includes('/')) {
      // MIME 타입으로 검증
      return file.type === type;
    } else {
      // 확장자로 검증
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
  });
}

// 파일 크기 검증
export function validateFileSize(file, maxSizeInMB) {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

// 이미지 파일 미리보기 URL 생성
export function createImagePreviewURL(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}