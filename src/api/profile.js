// Profile API with Cloudflare Workers integration
const WORKERS_API_URL = import.meta.env.VITE_WORKERS_URL || 'https://studymate-api.wjstks3474.workers.dev';

/**
 * Upload profile image to Cloudflare Images
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} Upload result with URLs
 */
export async function uploadProfileImage(imageFile) {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('type', 'profile');
    
    const response = await fetch(`${WORKERS_API_URL}/api/v1/upload/image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        // Authorization header will be added if needed
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to upload profile image');
    }

    const result = await response.json();
    
    // Result includes variants for different sizes
    // {
    //   fileId: "...",
    //   url: "/api/v1/upload/file/...",
    //   size: 12345,
    //   type: "image/jpeg",
    //   variants: {
    //     thumbnail: "...?variant=thumbnail",
    //     medium: "...?variant=medium",
    //     large: "...?variant=large"
    //   },
    //   metadata: { ... }
    // }
    
    return result;
  } catch (error) {
    console.error('Profile image upload error:', error);
    throw error;
  }
}

/**
 * Delete profile image
 * @param {string} imageUrl - The image URL to delete
 * @returns {Promise<void>}
 */
export async function deleteProfileImage(imageUrl) {
  try {
    // Extract the file path from the URL
    const path = imageUrl.replace(`${WORKERS_API_URL}/api/v1/upload/file/`, '');
    
    const response = await fetch(`${WORKERS_API_URL}/api/v1/upload/file/${path}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete profile image');
    }
  } catch (error) {
    console.error('Profile image delete error:', error);
    throw error;
  }
}

/**
 * Get presigned URL for direct upload (if needed)
 * @param {string} fileName - The file name
 * @param {string} fileType - The file MIME type
 * @returns {Promise<Object>} Presigned URL data
 */
export async function getPresignedUrl(fileName, fileType) {
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
        type: 'profile'
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to get presigned URL');
    }

    return await response.json();
  } catch (error) {
    console.error('Presigned URL error:', error);
    throw error;
  }
}

/**
 * Update user profile with new image URL
 * @param {Object} profileData - Profile data including image URL
 * @returns {Promise<Object>} Updated profile
 */
export async function updateProfile(profileData) {
  try {
    // This would call your main backend API to update the user profile
    // For now, we'll store it locally
    const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const updatedProfile = {
      ...currentProfile,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    // In production, you'd call your backend API:
    // const response = await fetch('/api/user/profile', {
    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //   },
    //   body: JSON.stringify(profileData)
    // });
    
    return updatedProfile;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}