import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserProfile, getUserInfo } from "../api/user";
import { getStudyStats } from "../api/analytics";
import { getOnboardingData } from "../api/onboarding";
import { getMatches } from "../api/matching";
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
import { toDisplayText } from "../utils/text";
import { setTokens, setAutoLoginEnabled, logTokenState } from "../utils/tokenStorage";

const transformMatches = (matches = []) =>
  matches.map((match) => {
    const rawScore = match?.compatibilityScore;
    const normalizedScore = typeof rawScore === "number"
      ? Math.round(rawScore <= 1 ? rawScore * 100 : rawScore)
      : null;

    return {
      matchId: match?.matchId ?? match?.id,
      name: toDisplayText(
        match?.partnerName
          || match?.partnerUserName
          || match?.name
          || match?.partner?.name
      ) || "익명 사용자",
      location: toDisplayText(
        match?.partnerUserLocation
          || match?.location
          || match?.partner?.location
      ),
      nativeLanguage: toDisplayText(
        match?.partnerUserNativeLanguage
          || match?.nativeLanguage
          || match?.partner?.nativeLanguage
      ),
      profileImage: match?.partnerProfileImageUrl
        || match?.partnerUserProfileImage
        || match?.profileImage
        || match?.partner?.profileImage
        || null,
      compatibilityScore: normalizedScore,
      languageExchange: toDisplayText(
        match?.partnerUserBio
          || match?.bio
          || match?.partner?.bio
      ),
      lastActive: toDisplayText(
        match?.lastActiveTime
          || match?.matchedAt
          || match?.lastSessionAt
      ),
    };
  });

export default function Main() {
  const navigate = useNavigate();
  const { search } = useLocation();
  console.count('[Main] render');
  const [studyStatsData, setStudyStatsData] = useState(null);
  const [studyStatsLoading, setStudyStatsLoading] = useState(true);
  const [studyStatsError, setStudyStatsError] = useState(null);

  const [languageProfileData, setLanguageProfileData] = useState(null);
  const [languageProfileLoading, setLanguageProfileLoading] = useState(true);

  const [mates, setMates] = useState([]);
  const [matesLoading, setMatesLoading] = useState(true);

  const [profileSnapshot, setProfileSnapshot] = useState({
    englishName: "",
    birthYear: null,
    languageLevel: null,
    targetLanguage: null,
  });

  const updateProfileSnapshot = useCallback((next) => {
    setProfileSnapshot((prev) => {
      if (
        prev.englishName === (next.englishName ?? "") &&
        prev.birthYear === (next.birthYear ?? null) &&
        prev.languageLevel === (next.languageLevel ?? null) &&
        prev.targetLanguage === (next.targetLanguage ?? null)
      ) {
        return prev;
      }
      return {
        englishName: next.englishName ?? "",
        birthYear: next.birthYear ?? null,
        languageLevel: next.languageLevel ?? null,
        targetLanguage: next.targetLanguage ?? null,
      };
    });
  }, []);

  const fetchLatestMatches = useCallback(async () => {
    console.log('[Main][fetchLatestMatches] start');
    setMatesLoading(true);
    try {
      const response = await getMatches(1, 4);
      const payload = response?.data ?? response;
      const matchedContent = Array.isArray(payload?.data)
        ? payload.data
        : payload?.content ?? [];
      setMates(transformMatches(matchedContent));
      console.log('[Main][fetchLatestMatches] success', { count: matchedContent.length });
    } catch (error) {
      console.error("매칭 데이터 로드 실패:", error);
      setMates([]);
    } finally {
      setMatesLoading(false);
      console.log('[Main][fetchLatestMatches] finish');
    }
  }, []);

  const {
    achievements: allAchievements,
    stats: achievementsStats,
    loading: achievementsLoading,
    error: achievementsError
  } = useAchievementOverview();

  useEffect(() => {
    console.log('[Main][debug] loading flags', {
      studyStatsLoading,
      languageProfileLoading,
      matesLoading,
      achievementsLoading,
    });
  }, [studyStatsLoading, languageProfileLoading, matesLoading, achievementsLoading]);

  useEffect(() => {
    console.log('[Main][debug] primary data sets', {
      hasStudyStats: Boolean(studyStatsData),
      hasLanguageProfile: Boolean(languageProfileData),
      matesLength: mates?.length ?? 0,
      achievementsLength: allAchievements?.length ?? 0,
    });
  }, [studyStatsData, languageProfileData, mates, allAchievements]);

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
  const normalizedBirthYear = profileSnapshot.birthYear ? Number(profileSnapshot.birthYear) : null;
  const userAge = normalizedBirthYear && !Number.isNaN(normalizedBirthYear)
    ? Math.max(0, currentYear - normalizedBirthYear)
    : null;
  const greetingLevelRaw = profileSnapshot.languageLevel
    || languageProfileData?.learningLanguages?.[0]?.targetLevel
    || languageProfileData?.learningLanguages?.[0]?.level
    || profileSnapshot.targetLanguage
    || null;
  const greetingLevel = toDisplayText(greetingLevelRaw);

  const safeEnglishName = toDisplayText(profileSnapshot.englishName) || "사용자";

  useEffect(() => {
    const params = new URLSearchParams(search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const autoLoginParam = params.get("autoLogin");
    const userId = params.get("userId");

    const hasQueryTokens = Boolean(accessToken || refreshToken);

    if (!hasQueryTokens && autoLoginParam === null && !userId) {
      return;
    }

    if (autoLoginParam !== null) {
      setAutoLoginEnabled(autoLoginParam === "true");
    }

    if (hasQueryTokens) {
      setTokens({ accessToken, refreshToken });
      logTokenState("main:query-setTokens");
    }

    if (userId) {
      localStorage.setItem("userId", userId);
    }

    if (hasQueryTokens || userId || autoLoginParam !== null) {
      navigate("/main", { replace: true });
    }
  }, [search, navigate]);

  const hasInitializedDataFetch = useRef(false);

  useEffect(() => {
    if (hasInitializedDataFetch.current) {
      return;
    }
    hasInitializedDataFetch.current = true;

    let cancelled = false;

    const {
      loadProfileFromServer,
      setEnglishName,
      setResidence,
      setProfileImage,
      setLanguageLevel,
      setTargetLanguage,
      setBirthYear,
    } = useProfileStore.getState();

    const syncSnapshotFromStore = () => {
      const snap = useProfileStore.getState();
      updateProfileSnapshot({
        englishName: snap.englishName ?? snap.name ?? "",
        birthYear: snap.birthYear ?? null,
        languageLevel: snap.languageLevel ?? null,
        targetLanguage: snap.targetLanguage ?? null,
      });
    };

    const loadStudyStats = async () => {
      console.log('[Main][loadStudyStats] start');
      setStudyStatsLoading(true);
      try {
        const response = await getStudyStats("month");
        if (cancelled) return;
        const payload = response?.data ?? response;
        setStudyStatsData(payload);
        setStudyStatsError(null);
        console.log('[Main][loadStudyStats] success', { hasPayload: Boolean(payload) });
      } catch (error) {
        if (cancelled) return;
        console.error("학습 통계 로드 실패:", error);
        setStudyStatsData(null);
        setStudyStatsError("학습 통계를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setStudyStatsLoading(false);
          console.log('[Main][loadStudyStats] finish');
        }
      }
    };

    const loadLanguageProfile = async () => {
      console.log('[Main][loadLanguageProfile] start');
      setLanguageProfileLoading(true);
      try {
        const response = await getOnboardingData();
        if (cancelled) return;
        const payload = response?.data ?? response;
        const transformed = transformOnboardingDataToLanguageProfile(payload);
        setLanguageProfileData(transformed);
        console.log('[Main][loadLanguageProfile] success', { hasPayload: Boolean(payload) });
      } catch (error) {
        if (cancelled) return;
        console.error("온보딩 데이터 로드 실패:", error);
        setLanguageProfileData(null);
      } finally {
        if (!cancelled) {
          setLanguageProfileLoading(false);
          console.log('[Main][loadLanguageProfile] finish');
        }
      }
    };

    const loadProfile = async () => {
      console.log('[Main][loadProfile] start');
      try {
        const profileData = await loadProfileFromServer();

        if (cancelled) return;

        if (profileData) {
          console.log('[Main][loadProfile] profile loaded from server');
          updateProfileSnapshot({
            englishName: profileData.englishName ?? profileData.koreanName ?? profileData.name ?? "",
            birthYear: profileData.birthYear ?? null,
            languageLevel: profileData.languageLevel ?? null,
            targetLanguage: profileData.targetLanguage ?? null,
          });
        } else {
          console.log('[Main][loadProfile] fallback to legacy APIs');
          const userInfoResponse = await getUserInfo();
          const userInfoPayload = userInfoResponse?.data ?? userInfoResponse;

          setEnglishName(userInfoPayload?.englishName || userInfoPayload?.name || "사용자");
          setBirthYear(userInfoPayload?.birthYear ?? null);

          const profileResponse = await getUserProfile();
          const profilePayload = profileResponse?.data ?? profileResponse;
          setProfileImage(profilePayload?.profileImageUrl || profilePayload?.profileImage || "/assets/basicProfilePic.png");
          setResidence(
            profilePayload?.location?.city
            || profilePayload?.residence
            || "위치 정보 없음"
          );
          setLanguageLevel(profilePayload?.languageLevel ?? null);
          setTargetLanguage(profilePayload?.targetLanguage ?? null);

          updateProfileSnapshot({
            englishName: userInfoPayload?.englishName || userInfoPayload?.name || "사용자",
            birthYear: userInfoPayload?.birthYear ?? null,
            languageLevel: profilePayload?.languageLevel ?? null,
            targetLanguage: profilePayload?.targetLanguage ?? null,
          });
        }
        syncSnapshotFromStore();
      } catch (error) {
        if (cancelled) return;
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
        syncSnapshotFromStore();
      }
      console.log('[Main][loadProfile] finish');
    };

    const run = async () => {
      console.log('[Main][run] start');
      await loadProfile();
      if (cancelled) return;
      await Promise.all([
        loadStudyStats(),
        loadLanguageProfile(),
        fetchLatestMatches(),
      ]);
      console.log('[Main][run] finish');
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fetchLatestMatches]);

  return (
    <div className="page-bg min-h-screen flex flex-col">
      <MainHeader />
      <div className="flex flex-1 p-6 space-x-6 overflow-hidden">
        <Sidebar active="home" />
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GreetingCard
              userName={safeEnglishName}
              age={userAge}
              level={greetingLevel}
            />

            <StudyStats
              data={studyStatsData}
              loading={studyStatsLoading}
              errorMessage={studyStatsError}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            <LanguageProfile
              loading={languageProfileLoading}
              profileData={languageProfileData}
              englishName={englishName}
              languageLevel={greetingLevel}
            />

            <LanguageExchangeMates
              loading={matesLoading}
              mates={mates}
              onRefresh={fetchLatestMatches}
            />
          </div>

          <div className="mt-6">
            <AchievementBadges
              achievements={achievements}
              loading={achievementsLoading}
              error={achievementsError}
              onRefresh={fetchLatestMatches}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
