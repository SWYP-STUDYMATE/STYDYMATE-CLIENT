/**
 * 이미지 최적화 유틸리티
 */

/**
 * 이미지 URL에 최적화 파라미터 추가
 * @param {string} url - 원본 이미지 URL
 * @param {Object} options - 최적화 옵션
 * @returns {string} - 최적화된 이미지 URL
 */
export function optimizeImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url;

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
  } = options;

  // 이미 쿼리 파라미터가 있는 경우
  const hasQuery = url.includes('?');
  const separator = hasQuery ? '&' : '?';

  const params = new URLSearchParams();

  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality) params.append('quality', quality);
  if (format) params.append('format', format);

  const queryString = params.toString();
  return queryString ? `${url}${separator}${queryString}` : url;
}

/**
 * 반응형 이미지 srcset 생성
 * @param {string} url - 원본 이미지 URL
 * @param {number[]} widths - 생성할 너비 배열
 * @returns {string} - srcset 문자열
 */
export function generateSrcSet(url, widths = [400, 800, 1200]) {
  if (!url || typeof url !== 'string') return '';

  return widths
    .map((width) => {
      const optimizedUrl = optimizeImageUrl(url, { width, format: 'webp' });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * 이미지 프리로드
 * @param {string} url - 이미지 URL
 * @returns {Promise<void>}
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 여러 이미지 프리로드
 * @param {string[]} urls - 이미지 URL 배열
 * @returns {Promise<void[]>}
 */
export function preloadImages(urls) {
  return Promise.all(urls.map(preloadImage));
}

/**
 * Base64 이미지를 Blob으로 변환
 * @param {string} base64 - Base64 인코딩된 이미지
 * @returns {Blob}
 */
export function base64ToBlob(base64) {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * 이미지 파일을 리사이징
 * @param {File} file - 원본 이미지 파일
 * @param {Object} options - 리사이징 옵션
 * @returns {Promise<Blob>}
 */
export function resizeImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // 비율 유지하면서 리사이징
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          mimeType,
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

/**
 * 이미지 압축
 * @param {File} file - 원본 이미지 파일
 * @param {number} quality - 압축 품질 (0-1)
 * @returns {Promise<Blob>}
 */
export async function compressImage(file, quality = 0.8) {
  return resizeImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality,
    mimeType: file.type,
  });
}

/**
 * 이미지 업로드 전 최적화
 * @param {File} file - 원본 이미지 파일
 * @returns {Promise<File>}
 */
export async function optimizeForUpload(file) {
  // 이미지 파일이 아닌 경우 원본 반환
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // 2MB 이하는 원본 반환
  if (file.size < 2 * 1024 * 1024) {
    return file;
  }

  // 압축
  const compressedBlob = await compressImage(file, 0.8);

  // File 객체로 변환
  return new File([compressedBlob], file.name, {
    type: compressedBlob.type,
    lastModified: Date.now(),
  });
}

/**
 * 이미지 형식 지원 여부 확인
 * @param {string} format - 이미지 형식 (webp, avif 등)
 * @returns {boolean}
 */
export function isFormatSupported(format) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  const mimeType = `image/${format}`;
  return canvas.toDataURL(mimeType).indexOf(`data:${mimeType}`) === 0;
}

/**
 * WebP 지원 여부 확인
 * @returns {boolean}
 */
export function isWebPSupported() {
  return isFormatSupported('webp');
}

/**
 * AVIF 지원 여부 확인
 * @returns {boolean}
 */
export function isAVIFSupported() {
  return isFormatSupported('avif');
}
