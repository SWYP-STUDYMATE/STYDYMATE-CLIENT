import axios from "axios";
import { log } from '../utils/logger';
import { handleApiError } from '../utils/errorHandler';
import { toast } from '../components/Toast';

const api = axios.create({
  // 프로덕션: 직접 api.languagemate.kr/api/v1 호출
  // 개발: vite.proxy('/api' → localhost:8080)에서 /api 제거됨
  baseURL: import.meta.env.DEV 
    ? "/api/v1"  // 개발환경: Vite proxy가 /api를 제거하므로 /api/v1
    : `${import.meta.env.VITE_API_URL}/api/v1`, // 프로덕션: 전체 URL 사용
});

// 요청 인터셉터: accessToken 자동 첨부 및 로깅
api.interceptors.request.use(
  (config) => {
    // 시작 시간 기록
    config.startTime = Date.now();
    
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    log.debug(`API 요청 시작: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    }, 'API');
    
    return config;
  },
  (error) => {
    log.error('API 요청 설정 실패', error, 'API');
    return Promise.reject(error);
  }
);

// 응답 인터셉터: accessToken 만료 시 refresh_token으로 재발급 및 로깅
api.interceptors.response.use(
  (response) => {
    // 응답 시간 계산 및 로깅
    const duration = response.config.startTime ? Date.now() - response.config.startTime : 0;
    const method = response.config.method?.toUpperCase() || 'UNKNOWN';
    const url = response.config.url || 'unknown';
    
    log.api(method, url, response.status, duration);
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 에러 로깅
    const duration = originalRequest.startTime ? Date.now() - originalRequest.startTime : 0;
    const method = originalRequest.method?.toUpperCase() || 'UNKNOWN';
    const url = originalRequest.url || 'unknown';
    
    if (error.response) {
      log.api(method, url, error.response.status, duration);
    } else {
      log.error(`네트워크 오류: ${method} ${url}`, error, 'API');
    }

    // 403 Forbidden 오류 처리
    if (error.response && error.response.status === 403) {
      log.warn("403 Forbidden: 권한이 없습니다. 토큰 재발급을 시도합니다.", null, 'AUTH');
      
      // 403 오류도 토큰 문제일 수 있으므로 한 번만 토큰 재발급 시도
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");
          
          log.info("403 오류 발생! refreshToken으로 재발급 시도", null, 'AUTH');
          
          // refresh 요청은 별도 axios 인스턴스로 무한 루프 방지
          const refreshApi = axios.create({
            baseURL: import.meta.env.DEV 
              ? "/api/v1"  // 개발환경: Vite proxy 사용
              : `${import.meta.env.VITE_API_URL}/api/v1`, // 프로덕션: 전체 URL 사용
          });
          
          const res = await refreshApi.post(
            "/auth/refresh",
            null,
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );
          
          // const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;
          const payload = res.data?.data ?? res.data; // ApiResponse 호환
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = payload;
          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            
            // mock 테스트일 때는 재요청하지 않음
            if (originalRequest._mock) {
              return Promise.resolve();
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          log.error("403 오류 후 토큰 재발급 실패", refreshError, 'AUTH');
        }
      }
      
      // 토큰 재발급으로도 해결되지 않으면 권한 문제로 처리
      log.error("403 Forbidden: 권한이 없습니다. 로그인 페이지로 이동합니다.", null, 'AUTH');
      
      // 사용자 친화적 에러 메시지 표시
      if (typeof window !== 'undefined') {
        toast.error("권한 오류", "접근 권한이 없습니다. 다시 로그인해주세요.");
      }
      
      // 토큰을 삭제하고 로그인 페이지로 리다이렉트
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      
      return Promise.reject(error);
    }
    
    // accessToken 만료(401) & 재시도 안 했을 때만
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        
        log.info("accessToken 만료! refreshToken으로 재발급 시도", null, 'AUTH');
        
        // refresh 요청은 별도 axios 인스턴스로 무한 루프 방지
        const refreshApi = axios.create({
          baseURL: import.meta.env.DEV 
            ? "/api/v1"  // 개발환경: Vite proxy 사용
            : `${import.meta.env.VITE_API_URL}/api/v1`, // 프로덕션: 전체 URL 사용
        });
        
        const res = await refreshApi.post(
          "/auth/refresh",
          null,
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );
        
        log.debug("토큰 재발급 응답 수신", res.data, 'AUTH');
        
        // const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;
        const payload = res.data?.data ?? res.data; // ApiResponse 호환
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = payload;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          // refreshToken이 응답에 있으면 갱신, 없으면 기존 값 유지
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          // 원래 요청 헤더에 새 토큰 적용
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          // mock 테스트일 때는 재요청하지 않음
          if (originalRequest._mock) {
            return Promise.resolve();
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // refresh 실패: 토큰 삭제 및 로그인 페이지로 이동
        log.error("토큰 재발급 실패, 로그인 페이지로 이동", refreshError, 'AUTH');
        
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        
        // 사용자 친화적 메시지
        toast.error("세션 만료", "로그인이 만료되었습니다. 다시 로그인해주세요.");
        
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        
        return Promise.reject(refreshError);
      }
    }

    // 일반적인 API 에러 처리
    try {
      handleApiError(error, `${method} ${url}`);
    } catch (handledError) {
      // handleApiError에서 처리된 에러를 사용자에게 표시
      if (typeof window !== 'undefined' && handledError.message) {
        const errorTitle = handledError.type === 'NETWORK_ERROR' ? '네트워크 오류' : 'API 오류';
        toast.error(errorTitle, handledError.message, { duration: 6000 });
      }
      return Promise.reject(handledError);
    }
    
    return Promise.reject(error);
  }
);

// 유저 이름 조회
export const getUserName = async () => {
  const res = await api.get("/user/name");
  return res.data;
};

// Note: 사용자 관련 API 함수들은 src/api/user에서 구현됨

export default api;

