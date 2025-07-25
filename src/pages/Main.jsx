import React from "react";
import LogoutButton from "../components/LogoutButton";
import api from "../api";
import ProgressBar from "../components/PrograssBar";
import TokenTest from "../components/TokenTest";
import useProfileStore from "../store/profileStore";

export default function Main() {
  const englishName = useProfileStore((state) => state.englishName);
  const nickname = englishName || "회원";
  const residence = useProfileStore((state) => state.residence);
  const profileImage = useProfileStore((state) => state.profileImage);

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col items-center justify-center">
      <div className="w-[120px] h-[120px] rounded-full bg-[#e7e7e7] flex items-center justify-center overflow-hidden mb-6">
        {profileImage ? (
          <img src={profileImage} alt="프로필" className="object-cover w-full h-full" />
        ) : (
          <span className="text-[#929292] text-xl">No Image</span>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-4">{nickname}님, 환영합니다!</h1>
      <p className="mb-8">거주지&시간대: {residence}</p>
      <p className="mb-8">임시로 만든 메인페이지입니다. <br />테스트 주구창창 여기다 다 될거임</p>
      <LogoutButton />
      <TokenTest />
      <ProgressBar total={100} value={50} />
    </div>
  );
} 