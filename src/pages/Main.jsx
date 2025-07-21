import React from "react";
import LogoutButton from "../components/LogoutButton";
import api from "../api";

export default function Main() {
  const name = localStorage.getItem("userName") || "회원";

  // accessToken을 임의로 만료시키는 함수
  const expireAccessToken = () => {
    localStorage.setItem("accessToken", "expired_token");
    alert("accessToken이 만료된 값으로 변경되었습니다.\n아래 테스트 버튼을 눌러 API 요청을 해보세요!");
  };

  // 보호된 API 호출 테스트 함수
  const testProtectedApi = async () => {
    try {
      // 실제 존재하는 엔드포인트로 변경!
      const res = await api.get("/login/tokens");
      alert("API 요청 성공! (refresh 토큰이 정상 동작함)\n" + JSON.stringify(res.data));
    } catch (e) {
      alert("API 요청 실패: " + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">{name}님, 환영합니다!</h1>
      <p className="mb-8">임시로 만든 메인페이지입니다.</p>
      <div className="flex gap-4 mb-8">
        <button
          onClick={expireAccessToken}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          accessToken 만료시키기
        </button>
        <button
          onClick={testProtectedApi}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          보호 API 테스트
        </button>
      </div>
      <LogoutButton />
    </div>
  );
} 