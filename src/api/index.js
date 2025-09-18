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

// JWT 토큰 형식 검증 함수
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// 요청 인터셉터: accessToken 자동 첨부 및 로깅
api.interceptors.request.use(
  (config) => {
    // 시작 시간 기록
    config.startTime = Date.now();

    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // 🔍 디버깅 로그 추가
    console.log("🔍 [API Request Interceptor]");
    console.log("🔍 Request URL:", config.url);
    console.log("🔍 Request Method:", config.method?.toUpperCase());
    console.log("🔍 AccessToken exists:", !!token);
    console.log("🔍 RefreshToken exists:", !!refreshToken);

    // JWT 토큰 형식 검증
    if (token) {
      const isValid = isValidJWT(token);
      console.log("🔍 AccessToken preview:", token.substring(0, 20) + "...");
      console.log("🔍 AccessToken is valid JWT:", isValid);

      if (!isValid) {
        console.warn("🔍 ⚠️ Invalid JWT format detected, removing token");
        localStorage.removeItem("accessToken");
        // 잘못된 토큰이면 Authorization 헤더를 설정하지 않음
      } else {
        config.headers["Authorization"] = `Bearer ${token}`;
        console.log("🔍 Authorization header set");
      }
    } else {
      console.log("🔍 ❌ No access token found in localStorage");
    }

    // RefreshToken도 검증
    if (refreshToken && !isValidJWT(refreshToken)) {
      console.warn("🔍 ⚠️ Invalid refresh token format detected, removing token");
      localStorage.removeItem("refreshToken");
    }

    log.debug(`API 요청 시작: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    }, 'API');

    return config;
  },
  (error) => {
    console.log("🔍 ❌ API 요청 설정 실패:", error);
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

    // 🔍 디버깅 로그 추가
    console.log("🔍 [API Response Error Interceptor]");
    console.log("🔍 Error occurred for:", originalRequest?.method?.toUpperCase(), originalRequest?.url);
    console.log("🔍 Error status:", error.response?.status);
    console.log("🔍 Error data:", error.response?.data);
    console.log("🔍 Error headers:", error.response?.headers);

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

          // RefreshToken 형식 검증
          if (!isValidJWT(refreshToken)) {
            console.warn("🔍 ⚠️ Invalid refresh token format for 403 error");
            throw new Error("Invalid refresh token format");
          }
          
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
            // 새로 받은 토큰 형식 검증
            if (!isValidJWT(newAccessToken)) {
              console.error("🔍 ❌ Invalid JWT format received from server (403 handling)");
              throw new Error("Invalid JWT format received");
            }

            localStorage.setItem("accessToken", newAccessToken);
            console.log("🔍 ✅ New accessToken saved (403 handling)");

            if (newRefreshToken) {
              if (!isValidJWT(newRefreshToken)) {
                console.error("🔍 ❌ Invalid refresh token format received from server (403 handling)");
                throw new Error("Invalid refresh token format received");
              }
              localStorage.setItem("refreshToken", newRefreshToken);
              console.log("🔍 ✅ New refreshToken saved (403 handling)");
            }
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

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
        if (!refreshToken) {
          console.log("🔍 RefreshToken이 없음 - 로그인 페이지로 리다이렉트");
          // 토큰이 없으면 즉시 로그인 페이지로 이동
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          toast.error("로그인 필요", "로그인이 필요한 서비스입니다.");

          setTimeout(() => {
            window.location.href = "/";
          }, 1000);

          throw new Error("No refresh token");
        }

        // RefreshToken 형식 검증
        if (!isValidJWT(refreshToken)) {
          console.warn("🔍 ⚠️ Invalid refresh token format - 로그인 페이지로 리다이렉트");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          toast.error("토큰 오류", "토큰 형식이 올바르지 않습니다. 다시 로그인해주세요.");

          setTimeout(() => {
            window.location.href = "/";
          }, 1000);

          throw new Error("Invalid refresh token format");
        }
        
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

        const payload = res.data?.data ?? res.data;
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = payload;
        if (newAccessToken) {
          // 새로 받은 토큰 형식 검증
          if (!isValidJWT(newAccessToken)) {
            console.error("🔍 ❌ Invalid JWT format received from server");
            throw new Error("Invalid JWT format received");
          }

          localStorage.setItem("accessToken", newAccessToken);
          console.log("🔍 ✅ New accessToken saved");

          // refreshToken이 응답에 있으면 갱신, 없으면 기존 값 유지
          if (newRefreshToken) {
            if (!isValidJWT(newRefreshToken)) {
              console.error("🔍 ❌ Invalid refresh token format received from server");
              throw new Error("Invalid refresh token format received");
            }
            localStorage.setItem("refreshToken", newRefreshToken);
            console.log("🔍 ✅ New refreshToken saved");
          }
          // 원래 요청 헤더에 새 토큰 적용
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
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
