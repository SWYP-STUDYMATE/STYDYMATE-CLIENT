export const AUTO_LOGIN_KEY = 'autoLogin';

export const isAutoLoginEnabled = () => {
  try {
    return localStorage.getItem(AUTO_LOGIN_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAutoLoginEnabled = (enabled) => {
  try {
    localStorage.setItem(AUTO_LOGIN_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore quota errors etc.
  }
};

const getStoragePair = () => {
  const persist = isAutoLoginEnabled();
  const primary = persist ? localStorage : sessionStorage;
  const secondary = persist ? sessionStorage : localStorage;
  return { primary, secondary };
};

export const getToken = (key) => {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key) ?? null;
  } catch {
    return null;
  }
};

export const setToken = (key, value) => {
  try {
    const { primary, secondary } = getStoragePair();
    if (value) {
      primary.setItem(key, value);
    } else {
      primary.removeItem(key);
    }
    secondary.removeItem(key);
    logTokenState(`setToken:${key}`);
  } catch {
    // ignore storage errors
  }
};

export const setTokens = ({ accessToken, refreshToken }) => {
  if (typeof accessToken === 'string') {
    setToken('accessToken', accessToken);
  } else if (accessToken === null) {
    removeToken('accessToken');
  }

  if (typeof refreshToken === 'string') {
    setToken('refreshToken', refreshToken);
  } else if (refreshToken === null) {
    removeToken('refreshToken');
  }

  logTokenState('setTokens');
};

export const getTokens = () => ({
  accessToken: getToken('accessToken'),
  refreshToken: getToken('refreshToken'),
});

export const removeToken = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage`, error);
  }
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove ${key} from sessionStorage`, error);
  }

  logTokenState(`removeToken:${key}`);
};

export const clearTokens = () => {
  removeToken('accessToken');
  removeToken('refreshToken');
};

export function logTokenState(label = 'tokenState') {
  try {
    const snapshot = {
      label,
      timestamp: new Date().toISOString(),
      autoLogin: isAutoLoginEnabled(),
      localStorage: {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        userName: localStorage.getItem('userName'),
        isNewUser: localStorage.getItem('isNewUser'),
        autoLoginFlag: localStorage.getItem(AUTO_LOGIN_KEY)
      },
      sessionStorage: {
        accessToken: sessionStorage.getItem('accessToken'),
        refreshToken: sessionStorage.getItem('refreshToken'),
        redirectPath: sessionStorage.getItem('redirectPath')
      }
    };
    console.log('[tokenStorage]', snapshot);
  } catch (error) {
    console.warn('[tokenStorage] Failed to log token state', error);
  }
}
