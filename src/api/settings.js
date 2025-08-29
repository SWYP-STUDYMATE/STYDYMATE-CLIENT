import api from './index.js';

// 계정 설정 관련 API
export const getAccountSettings = async () => {
  try {
    const response = await api.get('/settings/account');
    return response.data;
  } catch (error) {
    console.error('Get account settings error:', error);
    throw error;
  }
};

export const updateAccountSettings = async (settings) => {
  try {
    const response = await api.patch('/settings/account', settings);
    return response.data;
  } catch (error) {
    console.error('Update account settings error:', error);
    throw error;
  }
};

// 알림 설정 관련 API
export const getNotificationSettings = async () => {
  try {
    const response = await api.get('/settings/notifications');
    return response.data;
  } catch (error) {
    console.error('Get notification settings error:', error);
    throw error;
  }
};

export const updateNotificationSettings = async (settings) => {
  try {
    const response = await api.patch('/settings/notifications', settings);
    return response.data;
  } catch (error) {
    console.error('Update notification settings error:', error);
    throw error;
  }
};

// 개인정보 설정 관련 API
export const getPrivacySettings = async () => {
  try {
    const response = await api.get('/settings/privacy');
    return response.data;
  } catch (error) {
    console.error('Get privacy settings error:', error);
    throw error;
  }
};

export const updatePrivacySettings = async (settings) => {
  try {
    const response = await api.patch('/settings/privacy', settings);
    return response.data;
  } catch (error) {
    console.error('Update privacy settings error:', error);
    throw error;
  }
};

// 언어 설정 관련 API
export const getLanguageSettings = async () => {
  try {
    const response = await api.get('/settings/language');
    return response.data;
  } catch (error) {
    console.error('Get language settings error:', error);
    throw error;
  }
};

export const updateLanguageSettings = async (settings) => {
  try {
    const response = await api.patch('/settings/language', settings);
    return response.data;
  } catch (error) {
    console.error('Update language settings error:', error);
    throw error;
  }
};

// 계정 삭제 API
export const deleteAccount = async (password) => {
  try {
    const response = await api.delete('/settings/account', {
      data: { password }
    });
    return response.data;
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};

// 비밀번호 변경 API
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.patch('/settings/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

// 2단계 인증 설정 API
export const getTwoFactorSettings = async () => {
  try {
    const response = await api.get('/settings/two-factor');
    return response.data;
  } catch (error) {
    console.error('Get two factor settings error:', error);
    throw error;
  }
};

export const enableTwoFactor = async () => {
  try {
    const response = await api.post('/settings/two-factor/enable');
    return response.data;
  } catch (error) {
    console.error('Enable two factor error:', error);
    throw error;
  }
};

export const disableTwoFactor = async (code) => {
  try {
    const response = await api.post('/settings/two-factor/disable', { code });
    return response.data;
  } catch (error) {
    console.error('Disable two factor error:', error);
    throw error;
  }
};

// 데이터 내보내기 API
export const exportUserData = async () => {
  try {
    const response = await api.post('/settings/export');
    return response.data;
  } catch (error) {
    console.error('Export user data error:', error);
    throw error;
  }
};

// 로그인 기록 조회 API
export const getLoginHistory = async () => {
  try {
    const response = await api.get('/settings/login-history');
    return response.data;
  } catch (error) {
    console.error('Get login history error:', error);
    throw error;
  }
};