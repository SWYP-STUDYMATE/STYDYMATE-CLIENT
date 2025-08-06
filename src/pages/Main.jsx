import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import api from "../api";
import ProgressBar from "../components/PrograssBar";
import TokenTest from "../components/TokenTest";
import CommonButton from "../components/CommonButton";
import useProfileStore from "../store/profileStore";
import CommonChecklistItem from "../components/CommonChecklist";
import MainHeader from "../components/MainHeader";
import Sidebar from "../components/chat/Sidebar";
import GreetingCard from "../components/GreetingCard";
import StudyStats from "../components/StudyStats";
import LanguageProfile from "../components/LanguageProfile";
import LanguageExchangeMates from "../components/LanguageExchangeMates";
import AchievementBadges from "../components/AchievementBadges";


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
        // TODO: 현재 네이버로부터 한국어 이름을 받아오는 주소이기 때문에 추후 영어 닉네임 받아오는 api 주소로 변경
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
        <img
          src={profileImage || "/assets/basicProfilePic.png"}
          alt="프로필"
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.onerror = null; // 무한 루프 방지
            e.target.src = "/assets/basicProfilePic.png";
          }}
        />
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

      <CommonChecklistItem
        label="취업/진학"
        checked={true}
        onChange={() => {}}
      />

    <div className="bg-[#fafafa] min-h-screen flex flex-col">
      <MainHeader/>
      <div className="flex flex-1 p-6 space-x-6 overflow-hidden">
          <Sidebar active="home" />
        <div className="flex-1 flex flex-col">
          {/* 상단 섹션 - 2단 레이아웃 */}
          <div className="flex space-x-6">
            {/* 왼쪽 열 */}
            <div className="flex-1 flex flex-col">
              <GreetingCard userName={englishName} />
              <div className="mt-6">
                <StudyStats />
              </div>
              <div className="mt-6">
                <LanguageProfile />
              </div>
            </div>
            {/* 오른쪽 열 */}
            <div className="w-[540px] flex flex-col">
              <LanguageExchangeMates />
            </div>
          </div>
          
          {/* 하단 섹션 - 전체 너비 */}
          <div className="mt-6">
            <AchievementBadges />
          </div>
        </div>
      </div>

    </div>
  );
}
