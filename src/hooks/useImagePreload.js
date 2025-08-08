import { useEffect } from 'react';

/**
 * Preload images for better performance
 * @param {string[]} imageSrcs - Array of image URLs to preload
 */
export function useImagePreload(imageSrcs) {
  useEffect(() => {
    const imagePromises = imageSrcs.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    Promise.all(imagePromises)
      .then(() => {
        console.log('All images preloaded successfully');
      })
      .catch((error) => {
        console.error('Failed to preload some images:', error);
      });
  }, [imageSrcs]);
}

// Common images to preload
export const PRELOAD_IMAGES = [
  '/assets/basicProfilePic.png',
  '/assets/nochattinghistory.png',
  '/assets/googlelogo.png',
  '/assets/naverlogo.png',
];