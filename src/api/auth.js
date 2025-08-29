import api from './index.js';

// 네이버 OAuth 로그인
export const naverLogin = async (code, state) => {
  try {
    const response = await api.post('/auth/oauth/naver', {
      code,
      state
    });
    return response.data;
  } catch (error) {
    console.error('Naver login error:', error);
    throw error;
  }
};

// Google OAuth 로그인
export const googleLogin = async (code) => {
  try {
    const response = await api.post('/auth/oauth/google', {
      code
    });
    return response.data;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

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
    throw error;
  }
};