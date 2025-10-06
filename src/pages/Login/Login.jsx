import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { getToken, isAutoLoginEnabled, setAutoLoginEnabled } from "../../utils/tokenStorage";

export default function Login() {
  const [autoLogin, setAutoLogin] = useState(() => isAutoLoginEnabled());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = getToken("accessToken");
    if (accessToken) {
      // 저장된 리다이렉트 경로가 있으면 그곳으로, 없으면 메인으로
      const redirectPath = sessionStorage.getItem("redirectPath");
      if (redirectPath) {
        sessionStorage.removeItem("redirectPath");
        navigate(redirectPath, { replace: true });
      } else {
        navigate("/main", { replace: true });
      }
    }
  }, [navigate]);

  const API_BASE = import.meta.env.DEV
    ? ""
    : (import.meta.env.VITE_API_URL || import.meta.env.VITE_WORKERS_API_URL || "https://api.languagemate.kr");
  const FRONT_ORIGIN = window.location.origin

  const startLogin = useCallback((provider) => {
    setIsLoading(true);
    setError(null);
    setAutoLoginEnabled(autoLogin);
    
    const url = import.meta.env.DEV
  // dev: Vite 프록시를 타는 시작 엔드포인트로 이동
  ? `/api/v1/login/${provider}?target=${encodeURIComponent(FRONT_ORIGIN)}`
  // prod: 운영 API의 시작 엔드포인트로 이동
  : `${API_BASE}/api/v1/login/${provider}?target=${encodeURIComponent(FRONT_ORIGIN)}`;


    window.location.href = url;
  }, [API_BASE, FRONT_ORIGIN, autoLogin]);

  const handleNaverLogin = useCallback(() => startLogin("naver"), [startLogin]);
  const handleGoogleLogin = useCallback(() => startLogin("google"), [startLogin]);


  return (
    <div className="bg-[#FFFFFF] h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <div className="ml-[24px] mt-[53px]">
      <h1
        className="text-[32px] font-bold leading-[42px]"
      >
        Language Mate에 오신 것을 환영해요!
      </h1>
      <p className="mt-[12px] text-[16px] font-medium text-[#929292] leading-[24px]">간편하게 바로 시작해 보세요</p>
      </div>
      
      {/* 로딩 상태 */}
      {isLoading && (
        <div data-testid="loading" className="flex justify-center items-center ml-[24px] mt-[16px]">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00C471]"></div>
          <span className="ml-2 text-[14px] text-[#606060]">로그인 중...</span>
        </div>
      )}
      
      {/* 에러 메시지 */}
      {error && (
        <div data-testid="error-message" className="ml-[24px] mt-[16px] p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[6px]">
          <p className="text-[14px] text-[#DC2626] font-medium">{error}</p>
        </div>
      )}
      {/* 체크박스 */}
      <div className="flex items-center ml-[24px] mt-[32px] mb-[40px]">
        <button
          type="button"
          data-testid="auto-login-checkbox"
          aria-pressed={autoLogin}
          onClick={() => {
            setAutoLogin((v) => {
              const next = !v;
              setAutoLoginEnabled(next);
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
              setAutoLoginEnabled(next);
              return next;
            });
          }}
        >
          자동 로그인
        </label>
      </div>
      <div className="max-w-[720px] w-full mx-auto">
        <button
          data-testid="naver-login-button"
          className={`flex justify-center items-center w-full py-[14px] text-[#FFFFFF] text-[18px] font-bold leading-[28px] rounded-[6px] focus:outline-none transition-colors duration-200 ${
            isLoading 
              ? "bg-[#929292] cursor-not-allowed" 
              : "bg-[#09AA5C] cursor-pointer hover:bg-[#08964F]"
          }`}
          onClick={handleNaverLogin}
          disabled={isLoading}
          tabIndex={0}
        >
          <span className="inline-block w-4 h-4 mr-[15px] bg-[url('/assets/naverlogo.png')] bg-contain bg-no-repeat bg-center"></span>
          네이버로 로그인
        </button>
      </div>
      <div className="max-w-[720px] w-full mx-auto mt-[20px]">
        <button
          data-testid="google-login-button"
          className={`flex justify-center items-center w-full py-[14px] text-[18px] font-bold leading-[24px] rounded-[6px] focus:outline-none transition-colors duration-200 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] ${
            isLoading 
              ? "bg-[#F1F3F5] text-[#929292] cursor-not-allowed" 
              : "bg-[#FAFAFA] text-[#171717] cursor-pointer hover:bg-[#F1F3F5]"
          }`}
          onClick={handleGoogleLogin}
          disabled={isLoading}
          tabIndex={0}
        >
          <span className="inline-block w-4 h-4 mr-[15px] bg-[url('/assets/googlelogo.png')] bg-contain bg-no-repeat bg-center"></span>
          Google 로그인
        </button>
      </div>
    </div>
  );
}
