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

    if (error) {
      setMessage("네이버 로그인 실패: " + (errorDescription || error));
    } else if (code && state) {
      // 네이버 code, state를 백엔드로 전달
      const fetchTokens = async () => { 
        try {
          // [백엔드 협업 필요]
          // /login/tokens 응답에 name(사용자 이름) 필드를 포함시켜 주세요.
          // 예시 응답: { accessToken: "...", refreshToken: "...", name: "홍길동" }
          const res = await api.get(`http://localhost:8080/login/tokens?code=${code}&state=${state}`);
          if (res.data && res.data.accessToken && res.data.refreshToken) {
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            if (res.data.name) {
              localStorage.setItem("userName", res.data.name);
            }
            // [백엔드 협업 필요]
            // isNewUser(또는 isAgreementRequired) 플래그를 응답에 포함시켜 주세요.
            // 예시: { ..., isNewUser: true }
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