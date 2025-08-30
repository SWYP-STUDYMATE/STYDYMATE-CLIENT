import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import CommonButton from "../../components/CommonButton";
import { getUserName } from "../../api";

export default function SignupComplete() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("회원");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userData = await getUserName();
        setUserName(userData.name || "회원");
      } catch (error) {
        console.error("사용자 이름 조회 실패:", error);
        setUserName("회원");
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#fafafa] min-h-screen">
        <div className="bg-white max-w-[768px] w-full min-h-screen mx-auto">
          <Header />
          <div className="flex items-center justify-center h-full">
            <div className="text-[16px] text-[#767676]">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="bg-white max-w-[768px] w-full min-h-screen mx-auto">
        <Header />
        <div className="pt-[52px] px-[24px] flex flex-col ">
          <h1 className="font-bold text-[32px] mb-[12px] leading-[42px] tracking-[-0.8px]">
            {userName}님 회원가입이 완료되었어요!
          </h1>
          <p className="text-gray-500 mb-8  whitespace-pre-line">
            이제 Language Mate에서 나에게 딱 맞는 파트너를 찾아보세요. <br /> 아래 버튼을 눌러 바로 온보딩을 시작해 주세요!
          </p>
          <div className="w-full flex justify-center mb-8">
            <div
              className="w-[447px] h-[421px] bg-center bg-no-repeat bg-contain bg-[url('/assets/party1.png')]"
            />
          </div>
          <CommonButton
            text="시작하기"
            onClick={() => navigate("/onboarding-info/1")}
            variant="complete"
            className="mt-8 w-full"
          />
        </div>
      </div>
    </div>
  );
} 