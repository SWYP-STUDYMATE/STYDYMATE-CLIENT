import axios from "axios";
import useProfileStore from "../store/profileStore";

const api = axios.create({
  baseURL: "/api",
});

// 요청 인터셉터: accessToken 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: accessToken 만료 시 refresh_token으로 재발급
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 403 Forbidden 오류 처리
    if (error.response && error.response.status === 403) {
      console.error("403 Forbidden: 권한이 없습니다. 토큰 재발급을 시도합니다.");
      
      // 403 오류도 토큰 문제일 수 있으므로 한 번만 토큰 재발급 시도
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");
          
          console.log("403 오류 발생! refreshToken으로 재발급 시도");
          const res = await axios.post(
            "/api/auth/refresh",
            null,
            {
              headers: { Authorization: `Bearer ${refreshToken}` }
            }
          );
          
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;
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
          console.error("403 오류 후 토큰 재발급 실패:", refreshError);
        }
      }
      
      // 토큰 재발급으로도 해결되지 않으면 권한 문제로 처리
      console.error("403 Forbidden: 권한이 없습니다. 로그인 페이지로 이동합니다.");
      
      // 사용자에게 알림
      if (typeof window !== 'undefined') {
        alert("접근 권한이 없습니다. 다시 로그인해주세요.");
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
        console.log("accessToken 만료! refreshToken으로 재발급 시도");
        // 명세서에 따라 헤더로 refreshToken 전송
        const res = await axios.post(
          "/api/auth/refresh",
          null,
          {
            headers: { Authorization: `Bearer ${refreshToken}` }
          }
        );
        console.log("재발급 응답:", res.data);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;
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
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setTimeout(() => {
          window.location.href = "/";
        }, 5000);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// 유저 이름 저장 (API + zustand 동기화)
export const saveUserName = async (name) => {
  const res = await api.post("/user/name", { name });
  // zustand에도 동기화
  const setName = useProfileStore.getState().setName;
  setName(name);
  return res;
};

export default api;

