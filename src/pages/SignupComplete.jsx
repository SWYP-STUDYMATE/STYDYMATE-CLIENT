import React, { useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const name = localStorage.getItem("userName") || "회원";

export default function SignupComplete() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="bg-white w-[768px] min-h-screen mx-auto">
        <Header />
        <div className="pt-[52px] px-[24px] flex flex-col ">
          <h1 className="font-bold text-[32px] mb-[12px] leading-[42px] tracking-[-0.8px]">
            {name}님 회원가입이 완료되었어요!
          </h1>
          <p className="text-gray-500 mb-8  whitespace-pre-line">
            이제 Language Mate에서 나에게 딱 맞는 파트너를 찾아보세요. <br /> 아래 버튼을 눌러 바로 온보딩을 시작해 주세요!
          </p>
          <div className="w-full flex justify-center mb-8">
            <div
              className="w-[447px] h-[421px] bg-center bg-no-repeat bg-contain bg-[url('/assets/party1.png')]"
            />
          </div>
          <button className="w-full py-3 rounded-lg font-bold text-lg bg-[#00c471] text-white mt-8">시작하기</button>
        </div>
      </div>
    </div>
  );
} 