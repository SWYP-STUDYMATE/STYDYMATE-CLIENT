import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/index";

export default function Navercallback() {
  const [message, setMessage] = useState("네이버 로그인 처리 중...");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDescription = params.get("error_description");

    // 콘솔로 code, state, error 찍기
    console.log("네이버 콜백 code:", code);
    console.log("네이버 콜백 state:", state);
    if (error) {
      console.log("네이버 콜백 error:", error, errorDescription);
      setMessage("네이버 로그인 실패: " + (errorDescription || error));
    } else if (code && state) {
      const fetchTokens = async () => { 
        try {
          // 백엔드 요청 URL도 콘솔에 찍기
          const url = `/login/oauth2/code/naver?code=${code}&state=${state}`;
          console.log("백엔드 요청 URL:", url);

          const res = await api.get(url);
          // 백엔드 응답 전체 콘솔에 찍기
          console.log("백엔드 응답:", res.data);

          if (typeof res.data === "string") {
            localStorage.setItem("accessToken", res.data);
            localStorage.setItem("isNewUser", "true"); // 임시로 신규회원 플래그 추가
            setMessage("토큰(문자열) 저장 완료! 약관 동의 페이지로 이동합니다...");
            setTimeout(() => {
              navigate("/agreement");
            }, 2000);
          } else if (res.data && res.data.accessToken && res.data.refreshToken) {
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            if (res.data.name) {
              localStorage.setItem("userName", res.data.name);
            }
            if (typeof res.data.isNewUser !== 'undefined') {
              localStorage.setItem('isNewUser', String(res.data.isNewUser));
            }
            setMessage("네이버 로그인 성공! 메인 페이지로 이동합니다...");
            setTimeout(() => {
              navigate("/agreement");
            }, 2000);
          } else {
            setMessage("토큰을 받아오지 못했습니다.");
          }
        } catch (e) {
          // 에러 객체도 콘솔에 찍기
          console.error("토큰 요청 실패:", e);
          setMessage("토큰 요청 실패: " + (e.response?.data?.message || e.message));
        }
      };
      fetchTokens();
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FFFFFF] w-[768px] mx-auto">
      <h2 className="text-2xl font-bold mb-4">{message}</h2>
    </div>
  );
}