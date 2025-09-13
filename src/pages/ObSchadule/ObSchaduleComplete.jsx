import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import CommonButton from "../../components/CommonButton";
import { useNavigate } from "react-router-dom";
import { getUserName } from "../../api";
import { completeOnboarding } from "../../api/user";

export default function ObSchaduleComplete() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

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

  const handleNext = async () => {
    try {
      // 서버에 온보딩 완료 상태 저장
      await completeOnboarding({
        completedAt: new Date().toISOString(),
        allStepsCompleted: true
      });
      console.log("✅ 온보딩 완료 상태 서버 저장 성공");
      
      
      navigate("/level-test");
    } catch (error) {
      console.error("온보딩 완료 저장 실패:", error);
      // 저장 실패해도 메인 페이지로 이동
      navigate("/main");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] h-screen max-w-[768px] w-full mx-auto">
        <Header />
        <div className="flex items-center justify-center h-full">
          <div className="text-[16px] text-[#767676]">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] h-screen max-w-[768px] w-full mx-auto">
      <Header />
      <div className="mx-auto mt-[52px] max-w-[720px] w-full">
        <h1 className="text-[32px] font-bold leading-[42px] text-[#111111]">
          {userName}님, 온보딩이 완료되었습니다! 🎉
        </h1>
        <p className="text-[16px] font-medium text-[#767676] mt-[12px] leading-[24px]">    
        지금부터 간단한 영어 레벨 테스트를 진행해 나에게 딱 맞는 파트너와 학습 방법을 추천해 드릴게요.
        </p>
      </div>
      <div className="mx-auto mt-[100px] max-w-[720px] w-full flex justify-center">
        <div
          className="max-w-[720px] w-full h-[405px] bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: "url('/assets/party4.png')" }}
        />
      </div>
      <div className="mx-auto mt-[151px] max-w-[720px] w-full flex justify-center">
        <CommonButton text="레벨 테스트 시작하기" onClick={handleNext} variant="complete" className="max-w-[720px] w-full" />
      </div>
    </div>
  );
} 