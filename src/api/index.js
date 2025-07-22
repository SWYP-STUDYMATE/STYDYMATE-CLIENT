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
          "http://localhost:8080/auth/refresh",
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

export default api; 