import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import CommonButton from "../../components/CommonButton";
import { getUserName } from "../../api";
import { getToken } from "../../utils/tokenStorage";

export default function SignupComplete() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("회원");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!getToken("accessToken")) {
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
      <div className="bg-white max-w-[768px] w-full min-h-screen mx-auto overflow-y-auto">
        <Header />
        <div className="pt-[40px] sm:pt-[48px] md:pt-[52px] px-4 sm:px-6 md:px-[24px] pb-[24px] sm:pb-[32px] flex flex-col">
          <h1 className="font-bold text-[24px] sm:text-[28px] md:text-[32px] mb-[12px] leading-[1.3] sm:leading-[1.35] md:leading-[42px] tracking-[-0.5px] sm:tracking-[-0.8px] break-words">
            {userName}님 회원가입이 완료되었어요!
          </h1>
          <p className="text-[14px] sm:text-[15px] md:text-base text-gray-500 mb-6 sm:mb-8 whitespace-pre-line leading-[1.5] sm:leading-[1.6] break-words">
            이제 Language Mate에서 나에게 딱 맞는 파트너를 찾아보세요. <br /> 아래 버튼을 눌러 바로 온보딩을 시작해 주세요!
          </p>
          <div className="w-full flex justify-center mb-6 sm:mb-8">
            <div
              className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[447px] h-[280px] sm:h-[340px] md:h-[421px] bg-center bg-no-repeat bg-contain bg-[url('/assets/party1.png')]"
            />
          </div>
          <CommonButton
            text="시작하기"
            onClick={() => navigate("/onboarding-info/1")}
            variant="complete"
            className="mt-6 sm:mt-8 w-full text-[14px] sm:text-[15px] md:text-base py-[14px]"
          />
        </div>
      </div>
    </div>
  );
} 
