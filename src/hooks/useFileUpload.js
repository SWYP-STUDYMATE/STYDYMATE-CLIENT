import { useState, useCallback } from 'react';
import { getToken } from '../utils/tokenStorage';

/**
 * 파일 업로드를 위한 커스텀 훅
 * 실제 진행률 추적과 에러 처리를 포함
 * @param {Object} options - 업로드 옵션
 * @returns {Object} - 업로드 상태와 함수들
 */
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const resetState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setUploadedFile(null);
  }, []);

  /**
   * XMLHttpRequest를 사용한 실제 진행률 추적 업로드
   * @param {string} url - 업로드 URL
   * @param {FormData} formData - 폼 데이터
   * @param {Object} headers - 추가 헤더
   * @returns {Promise<Object>} - 업로드 결과
   */
  const uploadWithProgress = useCallback(async (url, formData, headers = {}) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // 업로드 진행률 추적
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      // 업로드 완료
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            setUploadProgress(100);
            resolve(result);
          } catch (e) {
            reject(new Error('응답 파싱 실패'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || `업로드 실패: ${xhr.status}`));
          } catch (e) {
            reject(new Error(`업로드 실패: ${xhr.status} ${xhr.statusText}`));
          }
        }
      };

      // 에러 처리
      xhr.onerror = () => {
        reject(new Error('네트워크 오류가 발생했습니다.'));
      };

      // 업로드 취소
      xhr.onabort = () => {
        reject(new Error('업로드가 취소되었습니다.'));
      };

      // 요청 시작
      xhr.open('POST', url);
      
      // 헤더 설정
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  }, []);

  /**
   * 파일 업로드 실행
   * @param {string} url - 업로드 URL
   * @param {FormData} formData - 폼 데이터
   * @param {Object} config - 설정 옵션
   * @returns {Promise<Object>} - 업로드 결과
   */
  const upload = useCallback(async (url, formData, config = {}) => {
    const { 
      headers = {}, 
      onSuccess, 
      onError,
      resetOnSuccess = true 
    } = config;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Authorization 헤더 자동 추가
      const token = getToken('accessToken');
      if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
      }

      const result = await uploadWithProgress(url, formData, headers);
      
      // 성공 처리
      const responseData = result.data || result;
      setUploadedFile(responseData);
      
      if (onSuccess) {
        onSuccess(responseData);
      }

      if (resetOnSuccess) {
        setTimeout(() => {
          resetState();
        }, 1000);
      }

      return responseData;
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || '업로드 중 오류가 발생했습니다.');
      
      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [uploadWithProgress, resetState]);

  /**
   * 여러 파일 동시 업로드
   * @param {Array} uploadTasks - 업로드 작업 배열 [{url, formData, config}]
   * @returns {Promise<Array>} - 업로드 결과 배열
   */
  const uploadMultiple = useCallback(async (uploadTasks) => {
    setIsUploading(true);
    setError(null);

    try {
      const results = [];
      let completedCount = 0;

      for (const task of uploadTasks) {
        const { url, formData, config = {} } = task;
        
        try {
          const result = await upload(url, formData, {
            ...config,
            resetOnSuccess: false,
            onSuccess: (data) => {
              completedCount++;
              setUploadProgress(Math.round((completedCount / uploadTasks.length) * 100));
              if (config.onSuccess) {
                config.onSuccess(data);
              }
            }
          });
          results.push({ success: true, data: result });
        } catch (error) {
          results.push({ success: false, error: error.message });
        }
      }

      return results;
    } catch (err) {
      setError(err.message || '다중 업로드 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [upload]);

  return {
    // 상태
    isUploading,
    uploadProgress,
    error,
    uploadedFile,

    // 함수
    upload,
    uploadMultiple,
    resetState,

    // 유틸리티
    setError,
    setUploadProgress
  };
}

/**
 * 이미지 업로드 전용 훅
 */
export function useImageUpload(options = {}) {
  const uploadHook = useFileUpload(options);
  const WORKERS_API_URL = import.meta.env.VITE_WORKERS_API_URL || 'https://api.languagemate.kr';

  const uploadImage = useCallback(async (file, type = 'general', metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    if (metadata && Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return uploadHook.upload(`${WORKERS_API_URL}/api/v1/upload/image`, formData, options);
  }, [uploadHook, WORKERS_API_URL, options]);

  return {
    ...uploadHook,
    uploadImage
  };
}

/**
 * 오디오 업로드 전용 훅
 */
export function useAudioUpload(options = {}) {
  const uploadHook = useFileUpload(options);
  const WORKERS_API_URL = import.meta.env.VITE_WORKERS_API_URL || 'https://api.languagemate.kr';

  const uploadAudio = useCallback(async (file, folder = 'general', metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    if (metadata && Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return uploadHook.upload(`${WORKERS_API_URL}/api/v1/upload/audio`, formData, options);
  }, [uploadHook, WORKERS_API_URL, options]);

  return {
    ...uploadHook,
    uploadAudio
  };
}
