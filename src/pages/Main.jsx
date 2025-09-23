import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserProfile, getUserInfo } from "../api/user";
import { getStudyStats } from "../api/analytics";
import { getOnboardingData } from "../api/onboarding";
import { getSpringBootMatches } from "../api/matching";
import useProfileStore from "../store/profileStore";
import MainHeader from "../components/MainHeader";
import Sidebar from "../components/chat/Sidebar";
import GreetingCard from "../components/GreetingCard";
import StudyStats from "../components/StudyStats";
import LanguageProfile from "../components/LanguageProfile";
import LanguageExchangeMates from "../components/LanguageExchangeMates";
import AchievementBadges from "../components/AchievementBadges";
import useAchievementOverview from "../hooks/useAchievementOverview";
import { transformOnboardingDataToLanguageProfile } from "../utils/onboardingTransform";

const transformMatches = (matches = []) =>
  matches.map((match) => {
    const rawScore = match?.compatibilityScore;
    const normalizedScore = typeof rawScore === "number"
      ? Math.round((rawScore <= 1 ? rawScore * 100 : rawScore))
      : null;

    return {
      matchId: match?.matchId,
      name: match?.partnerUserName || "익명 사용자",
      location: match?.partnerUserLocation || null,
      nativeLanguage: match?.partnerUserNativeLanguage || null,
      profileImage: match?.partnerUserProfileImage || null,
      compatibilityScore: normalizedScore,
      languageExchange: match?.partnerUserBio || null,
      lastActive: match?.lastActiveTime || null,
    };
  });

export default function Main() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { setProfileImage, setEnglishName, setResidence, loadProfileFromServer } = useProfileStore();
  const englishName = useProfileStore((state) => state.englishName);
  const birthYear = useProfileStore((state) => state.birthYear);
  const languageLevel = useProfileStore((state) => state.languageLevel);
  const targetLanguage = useProfileStore((state) => state.targetLanguage);

  const [studyStatsData, setStudyStatsData] = useState(null);
  const [studyStatsLoading, setStudyStatsLoading] = useState(true);
  const [studyStatsError, setStudyStatsError] = useState(null);

  const [languageProfileData, setLanguageProfileData] = useState(null);
  const [languageProfileLoading, setLanguageProfileLoading] = useState(true);

  const [mates, setMates] = useState([]);
  const [matesLoading, setMatesLoading] = useState(true);

  const {
    achievements: allAchievements,
    stats: achievementsStats,
    loading: achievementsLoading,
    error: achievementsError
  } = useAchievementOverview();

  const achievements = useMemo(() => {
    if (!allAchievements || allAchievements.length === 0) return [];
    return [...allAchievements]
      .filter((item) => item.isCompleted)
      .sort((a, b) => {
        const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 4);
  }, [allAchievements]);

  const currentYear = new Date().getFullYear();
  const normalizedBirthYear = birthYear ? Number(birthYear) : null;
  const userAge = normalizedBirthYear && !Number.isNaN(normalizedBirthYear)
    ? Math.max(0, currentYear - normalizedBirthYear)
    : null;
  const greetingLevel = languageLevel
    || languageProfileData?.learningLanguages?.[0]?.targetLevel
    || languageProfileData?.learningLanguages?.[0]?.level
    || targetLanguage
    || null;

  useEffect(() => {
    const params = new URLSearchParams(search);
    const accessToken = params.get("accessToken");
    const userId = params.get("userId");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      if (userId) {
        localStorage.setItem("userId", userId);
      }
      navigate("/main", { replace: true });
      return;
    }

    const loadStudyStats = async () => {
      setStudyStatsLoading(true);
      try {
        const response = await getStudyStats("month");
        const payload = response?.data ?? response;
        setStudyStatsData(payload);
        setStudyStatsError(null);
      } catch (error) {
        console.error("학습 통계 로드 실패:", error);
        setStudyStatsData(null);
        setStudyStatsError("학습 통계를 불러오지 못했습니다.");
      } finally {
        setStudyStatsLoading(false);
      }
    };

    const loadLanguageProfile = async () => {
      setLanguageProfileLoading(true);
      try {
        const response = await getOnboardingData();
        const payload = response?.data ?? response;
        const transformed = transformOnboardingDataToLanguageProfile(payload);
        setLanguageProfileData(transformed);
      } catch (error) {
        console.error("온보딩 데이터 로드 실패:", error);
        setLanguageProfileData(null);
      } finally {
        setLanguageProfileLoading(false);
      }
    };

    const loadMatchedPartners = async () => {
      setMatesLoading(true);
      try {
        const response = await getSpringBootMatches(0, 4);
        const payload = response?.data ?? response;
        const matchedContent = payload?.content ?? [];
        setMates(transformMatches(matchedContent));
      } catch (error) {
        console.error("매칭 데이터 로드 실패:", error);
        setMates([]);
      } finally {
        setMatesLoading(false);
      }
    };

    const loadProfile = async () => {
      try {
        console.log("🔄 프로필 로드 시작");
        const profileData = await loadProfileFromServer();

        if (profileData) {
          console.log("✅ 서버 프로필 로드 성공");
        } else {
          console.log("⚠️ 서버 프로필 로드 실패, 기존 API 사용");
          const userInfoResponse = await getUserInfo();
          const userInfoPayload = userInfoResponse?.data ?? userInfoResponse;
          setEnglishName(userInfoPayload?.englishName || userInfoPayload?.name || "사용자");

          const profileResponse = await getUserProfile();
          const profilePayload = profileResponse?.data ?? profileResponse;
          setProfileImage(profilePayload?.profileImageUrl || profilePayload?.profileImage || "/assets/basicProfilePic.png");
          setResidence(
            profilePayload?.location?.city
            || profilePayload?.residence
            || "위치 정보 없음"
          );
        }
      } catch (error) {
        console.error("프로필 로드 실패:", error);

        if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
          console.error("🔌 네트워크 연결 오류");
          setEnglishName("사용자");
          setProfileImage("/assets/basicProfilePic.png");
          setResidence("위치 정보 없음");
          return;
        }

        if (error.response?.status >= 500) {
          console.error("🚨 서버 내부 오류");
          setEnglishName("사용자");
          setProfileImage("/assets/basicProfilePic.png");
          setResidence("위치 정보 없음");
        }
      }
    };

    loadProfile().finally(() => {
      loadStudyStats();
      loadLanguageProfile();
      loadMatchedPartners();
    });
  }, [search, navigate, setProfileImage, setEnglishName, setResidence, loadProfileFromServer]);

  return (
    <div className="page-bg min-h-screen flex flex-col">
      <MainHeader />
      <div className="flex flex-1 p-6 space-x-6 overflow-hidden">
        <Sidebar active="home" />
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GreetingCard
              englishName={englishName}
              userAge={userAge}
              languageLevel={greetingLevel}
              achievementsStats={achievementsStats}
              achievementsLoading={achievementsLoading}
            />

            <StudyStats
              data={studyStatsData}
              loading={studyStatsLoading}
              error={studyStatsError}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            <LanguageProfile
              loading={languageProfileLoading}
              profile={languageProfileData}
              englishName={englishName}
              languageLevel={greetingLevel}
            />

            <LanguageExchangeMates
              loading={matesLoading}
              mates={mates}
              onRefresh={() => {
                getSpringBootMatches(0, 4)
                  .then((response) => {
                    const payload = response?.data ?? response;
                    const matchedContent = payload?.content ?? [];
                    setMates(transformMatches(matchedContent));
                  })
                  .catch((error) => {
                    console.error("매칭 데이터 리프레시 실패:", error);
                  });
              }}
            />
          </div>

          <div className="mt-6">
            <AchievementBadges
              achievements={achievements}
              loading={achievementsLoading}
              error={achievementsError}
              onRefresh={() => {
                if (achievementsLoading) return;
                getSpringBootMatches(0, 4)
                  .then((response) => {
                    const payload = response?.data ?? response;
                    const matchedContent = payload?.content ?? [];
                    setMates(transformMatches(matchedContent));
                  })
                  .catch((error) => {
                    console.error("매칭 데이터 리프레시 실패:", error);
                  });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

