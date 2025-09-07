import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { getUserProfile, getUserInfo, getOnboardingStatus } from "../api/user";
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

    // Mock 모드 배너는 App.jsx에서 전역으로 처리

    const checkOnboardingAndLoadProfile = async () => {
      try {
        // 1. 온보딩 상태 확인
        console.log("🔄 온보딩 상태 확인 중...");
        const onboardingStatus = await getOnboardingStatus();
        console.log("온보딩 상태:", onboardingStatus);
        
        // 온보딩이 완료되지 않았으면 온보딩 페이지로 리다이렉트
        if (!onboardingStatus.isCompleted) {
          console.log("⚠️ 온보딩 미완료, 온보딩 페이지로 이동");
          // 현재 완료된 단계에 따라 적절한 온보딩 페이지로 이동
          const nextStep = onboardingStatus.nextStep || 1;
          navigate(`/onboarding-info/${nextStep}`, { replace: true });
          return;
        }
        
        // 2. 온보딩 완료 시 프로필 로드
        console.log("✅ 온보딩 완료, 프로필 로드 시작");
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
      } catch (error) {
        console.error("온보딩 확인 또는 프로필 로드 실패:", error);
        
        // 네트워크 오류 (서버 연결 불가)
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          console.error("🔌 네트워크 연결 오류: 서버에 연결할 수 없습니다.");
          // 서버 연결 문제시 기본 프로필로 설정 (UI는 계속 표시)
          setEnglishName("사용자");
          setProfileImage("/assets/basicProfilePic.png");
          setResidence("위치 정보 없음");
          return;
        }
        
        // 토큰이 유효하지 않으면 로그인 페이지로
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("🔐 인증 오류: 로그인 페이지로 이동");
          localStorage.clear();
          navigate("/", { replace: true });
          return;
        }
        
        // 서버 오류 (5xx) 시 기본 프로필로 설정
        if (error.response?.status >= 500) {
          console.error("🚨 서버 내부 오류: 기본 프로필로 설정");
          setEnglishName("사용자");
          setProfileImage("/assets/basicProfilePic.png");
          setResidence("위치 정보 없음");
          return;
        }
        
        // 온보딩 API 오류 시 기본 온보딩 페이지로
        if (error.response?.status === 404 || error.message.includes('onboarding')) {
          console.log("⚠️ 온보딩 API 오류, 기본 온보딩 페이지로 이동");
          navigate("/onboarding-info/1", { replace: true });
          return;
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
      checkOnboardingAndLoadProfile(); // 토큰 저장 후 온보딩 확인 및 프로필 요청
    } else if (localStorage.getItem("accessToken")) {
      checkOnboardingAndLoadProfile(); // 페이지 새로고침 시 온보딩 확인 및 프로필 요청
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
