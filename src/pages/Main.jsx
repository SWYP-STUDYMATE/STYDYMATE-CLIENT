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
    const userId = params.get("userId");

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
      if (userId) {
        localStorage.setItem("userId", userId);
      }
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
      <div className="bg-[#fafafa] min-h-screen flex flex-col">
        <MainHeader />
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
