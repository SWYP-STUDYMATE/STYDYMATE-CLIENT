import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import api from "../../api";

export default function Login() {
  const [autoLogin, setAutoLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/main", { replace: true });
    }
  }, [navigate]);

  const handleNaverLogin = useCallback(async () => {
    try {
      const response = await api.get("/login/naver");
      const loginUrl = response.data;
      if (loginUrl) {
        window.location.href = loginUrl;
      } else {
        alert("네이버 로그인 URL을 받아오지 못했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("네이버 로그인 요청에 실패했습니다.");
    }
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    try {
      const response = await api.get("/login/google");
      const loginUrl = response.data;
      if (loginUrl) {
        window.location.href = loginUrl;
      } else {
        alert("네이버 로그인 URL을 받아오지 못했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("구글 로그인 요청에 실패했습니다.");
    }
  }, []);

  return (
    <div className="bg-[#FFFFFF] h-screen w-[768px] mx-auto">
      <Header />
      <div className="ml-[24px] mt-[53px]">
      <h1
        className="text-[32px] font-bold leading-[42px]"
      >
        Language Mate에 오신 것을 환영해요!
      </h1>
      <p className="mt-[12px] text-[16px] font-medium text-[#929292] leading-[24px]">간편하게 바로 시작해 보세요</p>
      </div>
      {/* 체크박스 */}
      <div className="flex items-center ml-[24px] mt-[32px] mb-[40px]">
        <button
          type="button"
          aria-pressed={autoLogin}
          onClick={() => {
            setAutoLogin((v) => {
              const next = !v;
              console.log('autoLogin 상태:', next);
              return next;
            });
          }}
          className="w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-150 focus:outline-none"
          style={{
            borderColor: autoLogin ? "#00C471" : "#ced4da",
            backgroundColor: autoLogin ? "#00C471" : "#fff"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7.5L6 10.5L11 4.5"
              stroke={autoLogin ? "#fff" : "#ced4da"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <label
          htmlFor="auto-login"
          className="ml-2 text-[16px] font-medium text-[#212529]"
          onClick={() => {
            setAutoLogin((v) => {
              const next = !v;
              console.log('autoLogin 상태:', next);
              return next;
            });
          }}
        >
          자동 로그인
        </label>
      </div>
      <div className="w-[720px] mx-auto">
        <button
          className="flex justify-center items-center w-full py-[14px] bg-[#09AA5C] text-[#FFFFFF] text-[18px] font-bold leading-[28px] rounded-[6px] cursor-pointer focus:outline-none"
          onClick={handleNaverLogin}
          tabIndex={0}
        >
          <span className="inline-block w-4 h-4 mr-[15px] bg-[url('/assets/naverlogo.png')] bg-contain bg-no-repeat bg-center"></span>
          네이버로 로그인
        </button>
      </div>
      <div className="w-[720px] mx-auto mt-[20px]">
        <button
          className="flex justify-center items-center w-full py-[14px] bg-[#FAFAFA] text-[#171717] text-[18px] font-bold leading-[24px] rounded-[6px] cursor-pointer focus:outline-none shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
          onClick={handleGoogleLogin}
          tabIndex={0}
        >
          <span className="inline-block w-4 h-4 mr-[15px] bg-[url('/assets/googlelogo.png')] bg-contain bg-no-repeat bg-center"></span>
          Google 로그인
        </button>
      </div>
    </div>
  );
}
