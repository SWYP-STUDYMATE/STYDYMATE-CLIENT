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
};

export const getTokens = () => ({
  accessToken: getToken('accessToken'),
  refreshToken: getToken('refreshToken'),
});

export const removeToken = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {}
  try {
    sessionStorage.removeItem(key);
  } catch {}
};

export const clearTokens = () => {
  removeToken('accessToken');
  removeToken('refreshToken');
};
