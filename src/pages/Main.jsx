import React from "react";
import LogoutButton from "../components/LogoutButton";
import api from "../api";
import TokenTest from "../components/TokenTest";

export default function Main() {
  const name = localStorage.getItem("userName") || "회원";



  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">{name}님, 환영합니다!</h1>
      <p className="mb-8">임시로 만든 메인페이지입니다.</p>
      <LogoutButton />
      <TokenTest />
    </div>
  );
} 