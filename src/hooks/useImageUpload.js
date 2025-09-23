import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_WORKERS_API_URL || 'https://workers.languagemate.kr';

export function useImageUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadImage = useCallback(async (file, options = {}) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // 파일 검증
      if (!file || !(file instanceof File)) {
        throw new Error('유효한 이미지 파일을 선택해주세요.');
      }

      // 파일 타입 검증
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('JPEG, PNG, WebP, GIF 형식의 이미지만 업로드 가능합니다.');
      }

      // 파일 크기 검증 (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('파일 크기는 10MB를 초과할 수 없습니다.');
      }

      // FormData 생성
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', options.userId || localStorage.getItem('userId') || 'anonymous');
      formData.append('type', options.type || 'profile');

      // 업로드 진행률 시뮬레이션 (실제로는 XMLHttpRequest 사용 권장)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // 이미지 업로드
      const response = await fetch(`${API_URL}/api/v1/images/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-User-Id': options.userId || localStorage.getItem('userId') || 'anonymous'
        }
      });

      clearInterval(progressInterval);
      setProgress(95);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '이미지 업로드에 실패했습니다.');
      }

      const result = await response.json();
      setProgress(100);
      setUploadedImage(result);
      
      return result;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const deleteImage = useCallback(async (fileName) => {
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`${API_URL}/api/v1/images/${fileName}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': userId
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '이미지 삭제에 실패했습니다.');
      }

      setUploadedImage(null);
      return true;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getImageUrl = useCallback((fileName, variant = 'original') => {
    if (!fileName) return null;
    
    const baseUrl = API_URL;
    
    switch (variant) {
      case 'thumbnail':
        return `${baseUrl}/api/v1/images/transform/${fileName}?width=150&height=150&fit=cover`;
      case 'medium':
        return `${baseUrl}/api/v1/images/transform/${fileName}?width=400&height=400&fit=contain`;
      case 'large':
        return `${baseUrl}/api/v1/images/transform/${fileName}?width=800&height=800&fit=contain`;
      case 'original':
      default:
        return `${baseUrl}/api/v1/images/serve/${fileName}`;
    }
  }, []);

  const listUserImages = useCallback(async (userId, type) => {
    setLoading(true);
    setError(null);

    try {
      let url = `${API_URL}/api/v1/images/list/${userId}`;
      if (type) {
        url += `?type=${type}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '이미지 목록을 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      return result.images;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadedImage(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    // State
    loading,
    error,
    uploadedImage,
    progress,
    
    // Methods
    uploadImage,
    deleteImage,
    getImageUrl,
    listUserImages,
    reset
  };
}

// 이미지 프리뷰 생성 헬퍼
export function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

// 이미지 압축 헬퍼
export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // 비율 유지하며 리사이징
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
