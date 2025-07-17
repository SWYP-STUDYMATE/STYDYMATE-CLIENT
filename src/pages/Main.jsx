import React from "react";
import LogoutButton from "../components/LogoutButton";

export default function Main() {
  const name = localStorage.getItem("userName") || "회원";
  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">{name}님, 환영합니다!</h1>
      <p className="mb-8">메인 페이지에 오신 것을 환영해요.</p>
      <LogoutButton />
    </div>
  );
} 