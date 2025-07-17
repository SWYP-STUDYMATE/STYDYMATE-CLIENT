import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
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
    // accessToken 만료(401) & 재시도 안 했을 때만
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        const res = await axios.post("http://localhost:8080/auth/refresh", { refreshToken });
        const { accessToken: newAccessToken } = res.data;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          // 원래 요청 헤더에 새 토큰 적용
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // refresh 실패: 토큰 삭제 및 로그인 페이지로 이동
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 