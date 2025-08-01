import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import api from "../api";
import ProgressBar from "../components/PrograssBar";
import TokenTest from "../components/TokenTest";
import CommonButton from "../components/CommonButton";
import useProfileStore from "../store/profileStore";

export default function Main() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { setProfileImage, setEnglishName, setResidence } = useProfileStore(); // 스토어 action 가져오기

  useEffect(() => {
    const params = new URLSearchParams(search);
    const accessToken = params.get("accessToken");

    const fetchUserProfile = async () => {
      try {
        // 1. 사용자 이름(닉네임) 가져오기
        const nameResponse = await api.get("/user/name");
        setEnglishName(nameResponse.data.name);

        // 2. 프로필 이미지 URL 가져오기
        const profileResponse = await api.get("/user/profile");
        setProfileImage(profileResponse.data.url);
      } catch (error) {
        console.error("프로필 정보를 가져오는데 실패했습니다.", error);
        navigate("/", { replace: true });
      }
    };

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      // URL에서 토큰 파라미터 제거
      navigate("/main", { replace: true });
      fetchUserProfile(); // 토큰 저장 후 즉시 프로필 정보 요청
    } else if (localStorage.getItem("accessToken")) {
      fetchUserProfile(); // 페이지 새로고침 시 프로필 정보 요청
    } else {
      navigate("/", { replace: true });
    }
  }, [search, navigate, setProfileImage, setEnglishName]);

  const englishName = useProfileStore((state) => state.englishName);
  const nickname = englishName || "회원";
  const residence = useProfileStore((state) => state.residence);
  const profileImage = useProfileStore((state) => state.profileImage);

  const handleGoToChat = () => {
    navigate("/chat");
  };

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col items-center justify-center">
      <div className="w-[120px] h-[120px] rounded-full bg-[#e7e7e7] flex items-center justify-center overflow-hidden mb-6">
        {profileImage ? (
          <img
            src={profileImage}
            alt="프로필"
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-[#929292] text-xl">No Image</span>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-4">{nickname}님, 환영합니다!</h1>
      <p className="mb-8">거주지&시간대: {residence}</p>
      <p className="mb-8">
        임시로 만든 메인페이지입니다. <br />
        테스트 주구창창 여기다 다 될거임
      </p>
      <LogoutButton />
      <TokenTest />
      <ProgressBar total={100} value={50} />
      <div className="mt-8 w-64">
        <CommonButton text="채팅방으로 이동(테스트)" onClick={handleGoToChat} />
      </div>
    </div>
  );
}
