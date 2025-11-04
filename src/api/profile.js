import api from './index';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_WORKERS_API_URL ||
  'https://api.languagemate.kr';
const WORKERS_API_URL =
  import.meta.env.VITE_WORKERS_API_URL ||
  API_BASE_URL;

/**
 * 프로필 이미지 업로드
 * Workers API: POST /api/v1/users/me/profile-image
 */
export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);  // Workers는 'file' 필드명 사용

  const response = await api.post('/users/me/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 프로필 이미지 삭제
 */
export const deleteProfileImage = async () => {
  const response = await api.delete('/users/profile/image');
  return response.data;
};

/**
 * 채팅 이미지 업로드
 */
export const uploadChatImage = async (file, roomId) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('roomId', roomId);
  
  const response = await api.post('/chat/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * 오디오 파일 업로드
 */
export const uploadAudioFile = async (file, type = 'recording') => {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('type', type);
  
  const response = await api.post('/upload/audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @param {string|Object} typeOrOptions - 'image', 'audio', 'video' 또는 옵션 객체
 */
export const validateFile = (file, typeOrOptions = 'image') => {
  // 타입 문자열인 경우 기본 옵션 사용
  let options = {};

  if (typeof typeOrOptions === 'string') {
    switch (typeOrOptions) {
      case 'image':
        options = {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        };
        break;
      case 'audio':
        options = {
          maxSize: 50 * 1024 * 1024, // 50MB
          allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'],
          allowedExtensions: ['.mp3', '.wav', '.webm', '.ogg']
        };
        break;
      case 'video':
        options = {
          maxSize: 100 * 1024 * 1024, // 100MB
          allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
          allowedExtensions: ['.mp4', '.webm', '.mov']
        };
        break;
      default:
        options = {
          maxSize: 10 * 1024 * 1024,
          allowedTypes: [],
          allowedExtensions: []
        };
    }
  } else {
    options = {
      maxSize: typeOrOptions.maxSize || 10 * 1024 * 1024,
      allowedTypes: typeOrOptions.allowedTypes || [],
      allowedExtensions: typeOrOptions.allowedExtensions || []
    };
  }

  const {
    maxSize,
    allowedTypes,
    allowedExtensions
  } = options;

  // 파일 크기 검사
  if (file.size > maxSize) {
    throw new Error(`파일 크기는 ${maxSize / (1024 * 1024)}MB를 초과할 수 없습니다.`);
  }

  // 파일 타입 검사
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`허용되지 않는 파일 형식입니다. (${allowedTypes.join(', ')}만 가능)`);
  }

  // 파일 확장자 검사
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  if (allowedExtensions.length > 0 && !hasValidExtension) {
    throw new Error(`허용되지 않는 파일 확장자입니다. (${allowedExtensions.join(', ')}만 가능)`);
  }

  return true;
};

/**
 * 파일 URL 생성
 */
export const getFileUrl = (path) => {
  if (!path) return '/assets/basicProfilePic.png';
  
  // 절대 URL인 경우 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 상대 경로인 경우 API URL과 조합
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * 최적화된 이미지 URL 생성
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  // url이 객체인 경우 안전하게 처리
  if (url && typeof url === 'object') {
    url = url.url || url.imageUrl || url.src || url.path || null;
  }
  
  if (!url || typeof url !== 'string') return '/assets/basicProfilePic.png';
  
  const {
    width,
    height,
    quality = 85,
    format = 'webp'
  } = options;
  
  // 로컬 이미지인 경우 그대로 반환
  if (url.startsWith('/assets/') || url.startsWith('/images/')) {
    return url;
  }
  
  // Cloudflare Images 또는 다른 CDN 사용 시
  // 여기에 이미지 최적화 로직 추가
  // 예: return `${CDN_URL}/resize?url=${encodeURIComponent(url)}&w=${width}&h=${height}&q=${quality}&format=${format}`;

  const normalizedUrl = getFileUrl(url);
  const params = new URLSearchParams();

  if (width) params.set('w', width);
  if (height) params.set('h', height);
  if (quality && quality !== 85) params.set('q', quality);
  if (format && format !== 'webp') params.set('format', format);

  if (Array.from(params.keys()).length === 0) {
    return normalizedUrl;
  }

  const separator = normalizedUrl.includes('?') ? '&' : '?';
  return `${normalizedUrl}${separator}${params.toString()}`;
};

/**
 * 프로필 정보 업데이트
 */
export const updateProfile = async (profileData) => {
  const response = await api.patch('/users/profile', profileData);
  return response.data;
};

/**
 * 프로필 정보 조회
 */
export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

/**
 * 다른 사용자 프로필 조회
 */
export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}/profile`);
  return response.data;
};
