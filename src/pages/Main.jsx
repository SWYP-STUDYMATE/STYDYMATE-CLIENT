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
import { isMockMode, showMockModeBanner, mockApiCalls } from "../api/mockApi";

export default function Main() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { setProfileImage, setEnglishName, setResidence, loadProfileFromServer } = useProfileStore(); // 스토어 action 가져오기

  useEffect(() => {
    const params = new URLSearchParams(search);
    const accessToken = params.get("accessToken");
    const userId = params.get("userId");

    // Mock 모드 배너 표시 (DOM 로드 후)
    setTimeout(() => {
      showMockModeBanner();
    }, 100);

    const fetchUserProfile = async () => {
      try {
        if (isMockMode()) {
          // Mock 모드: 가짜 데이터 사용
          console.log("🎭 Mock 모드로 사용자 정보 로드");
          const mockUserData = await mockApiCalls.getUserInfo();
          const userData = mockUserData.data;
          
          setEnglishName(userData.englishName);
          setProfileImage(userData.profileImage);
          setResidence("Seoul, Korea"); // Mock 거주지
        } else {
          // 실제 API 모드 - 서버에서 통합 프로필 로드
          console.log("🔄 서버에서 프로필 로드 시도...");
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
        }
      } catch (error) {
        console.error("프로필 정보를 가져오는데 실패했습니다.", error);
        if (!isMockMode()) {
          // 토큰이 유효하지 않으면 로그인 페이지로
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.clear();
            navigate("/", { replace: true });
          }
        }
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
