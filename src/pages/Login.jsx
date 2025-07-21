import { useCallback } from "react";
import Header from "../components/Header";
import api from "../api";


export default function Login() {
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

  return (
    <div className="bg-[#FFFFFF] h-screen w-[768px] mx-auto">
      <Header />
      <h1
        className="text-[32px] font-bold leading-[42px] tracking-[-0.025em] ml-[24px] mt-[53px]"
      >
        Language Mate에 오신 것을 환영해요!
      </h1>
      <div className="w-[720px] mx-auto mt-[92px]">
        <button
          className="flex justify-center items-center w-full py-[14px] bg-[#09AA5C] text-[#FFFFFF] text-[18px] font-black leading-[28px] rounded-[6px] cursor-pointer focus:outline-none"
          onClick={handleNaverLogin}
          tabIndex={0}
        >
          <span className="inline-block w-4 h-4 mr-[15px] bg-[url('/assets/naverlogo.png')] bg-contain bg-no-repeat bg-center"></span>
          네이버로 간편 로그인
        </button>
      </div>
    </div>
  );
}
