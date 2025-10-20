import api from './index.js';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';
import useToastStore from '../store/toastStore';

// OAuth 로그인 함수들은 실제로 사용되지 않음 - window.location.href로 직접 리다이렉트
// 아래 함수들은 향후 필요시 활용할 수 있도록 주석 처리

// // 네이버 OAuth 로그인 (현재 미사용)
// export const naverLogin = async (code, state) => {
//   try {
//     const response = await api.post('/auth/oauth/naver', {
//       code,
//       state
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Naver login error:', error);
//     throw error;
//   }
// };

// // Google OAuth 로그인 (현재 미사용)
// export const googleLogin = async (code) => {
//   try {
//     const response = await api.post('/auth/oauth/google', {
//       code
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Google login error:', error);
//     throw error;
//   }
// };

// 토큰 새로고침
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await api.post('/auth/refresh', null, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Refresh token error:', error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    useToastStore.getState().error(friendlyMessage);
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    useToastStore.getState().error(friendlyMessage);
    throw error;
  }
};

// 토큰 검증
export const verifyToken = async () => {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Verify token error:', error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    useToastStore.getState().error(friendlyMessage);
    throw error;
  }
};

// 사용자 정보 조회 (토큰 기반)
export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get me error:', error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    useToastStore.getState().error(friendlyMessage);
    throw error;
  }
};