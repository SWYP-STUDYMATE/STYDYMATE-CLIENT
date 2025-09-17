import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { getUserProfile, getUserInfo } from "../api/user";
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
  const { setProfileImage, setEnglishName, setResidence, loadProfileFromServer } = useProfileStore(); // 스토어 action 가져오기

  useEffect(() => {
    const params = new URLSearchParams(search);
    const accessToken = params.get("accessToken");
    const userId = params.get("userId");

    // OAuth 콜백에서 토큰을 URL 파라미터로 받은 경우 저장
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      if (userId) {
        localStorage.setItem("userId", userId);
      }
      // URL에서 토큰 파라미터 제거
      navigate("/main", { replace: true });
      return;
    }

    // OnboardingProtectedRoute에서 이미 로그인 & 온보딩 체크를 했으므로, 여기서는 프로필만 로드
    const loadProfile = async () => {
      try {
        // 프로필 로드
        console.log("🔄 프로필 로드 시작");
        const profileData = await loadProfileFromServer();

        if (profileData) {
          console.log("✅ 서버 프로필 로드 성공");
        } else {
          // 서버 실패 시 기존 방식으로 fallback
          console.log("⚠️ 서버 프로필 로드 실패, 기존 API 사용");
          const userInfoResponse = await getUserInfo();
          setEnglishName(userInfoResponse.englishName || userInfoResponse.name);

          const profileResponse = await getUserProfile();
          setProfileImage(profileResponse.profileImage);
          setResidence(profileResponse.residence);
        }
      } catch (error) {
        console.error("프로필 로드 실패:", error);

        // 네트워크 오류 - 기본 프로필로 설정
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          console.error("🔌 네트워크 연결 오류");
          setEnglishName("사용자");
          setProfileImage("/assets/basicProfilePic.png");
          setResidence("위치 정보 없음");
          return;
        }

        // 서버 오류 (5xx) 시 기본 프로필로 설정
        if (error.response?.status >= 500) {
          console.error("🚨 서버 내부 오류");
          setEnglishName("사용자");
          setProfileImage("/assets/basicProfilePic.png");
          setResidence("위치 정보 없음");
          return;
        }
      }
    };

    // 프로필 로드 실행
    loadProfile();
  }, [search, navigate, setProfileImage, setEnglishName, loadProfileFromServer]);

  const englishName = useProfileStore((state) => state.englishName);

  return (
    <div className="page-bg min-h-screen flex flex-col">
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
