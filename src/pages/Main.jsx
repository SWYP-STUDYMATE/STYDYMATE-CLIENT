import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MainHeader from "../components/MainHeader";
import GreetingCard from "../components/GreetingCard";
import StudyStats from "../components/StudyStats";
import LanguageProfile from "../components/LanguageProfile";
import LanguageExchangeMates from "../components/LanguageExchangeMates";
import MainAchievementsSection from "../components/MainAchievementsSection";

import { getStudyStats } from "../api/analytics";
import { getOnboardingData } from "../api/onboarding";
import { getMatches } from "../api/matching";
import { getUserProfile, getUserInfo } from "../api/user";
import { getMyAchievements, getMyAchievementStats } from "../api/achievement";

import useProfileStore from "../store/profileStore";

import { transformOnboardingDataToLanguageProfile } from "../utils/onboardingTransform";
import { toDisplayText } from "../utils/text";
import { setTokens, setAutoLoginEnabled, logTokenState } from "../utils/tokenStorage";

const SENSITIVE_QUERY_KEYS = [
  "accessToken",
  "refreshToken",
  "autoLogin",
  "userId",
  "provider",
  "state",
  "redirect",
  "code",
];

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
          || match?.partner?.name,
        "익명 사용자"
      ),
      location: toDisplayText(
        match?.partnerUserLocation
          || match?.location
          || match?.partner?.location,
        null
      ),
      nativeLanguage: toDisplayText(
        match?.partnerUserNativeLanguage
          || match?.nativeLanguage
          || match?.partner?.nativeLanguage,
        null
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
          || match?.partner?.bio,
        null
      ),
      lastActive: toDisplayText(
        match?.lastActiveTime
          || match?.matchedAt
          || match?.lastSessionAt,
        null
      ),
    };
  });

const normalizeAchievements = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.achievements)) return payload.achievements;
  if (Array.isArray(payload)) return payload;
  return [];
};

const INITIAL_MAIN_STATE = {
  loading: true,
  profile: null,
  profileError: null,
  studyStats: null,
  studyStatsError: null,
  languageProfile: null,
  languageProfileError: null,
  mates: [],
  matesError: null,
  achievements: [],
  achievementsStats: null,
  achievementsError: null,
  achievementsLoading: false,
};

const buildProfileSnapshot = (userInfo, userProfile) => {
  const englishName = toDisplayText(
    userInfo?.englishName
      || userInfo?.name
      || userInfo?.koreanName,
    "사용자"
  );

  const profileImage = userProfile?.profileImageUrl
    || userProfile?.profileImage
    || "/assets/basicProfilePic.png";

  const residence = toDisplayText(
    userProfile?.location?.city
      || userProfile?.residence
      || userProfile?.location?.region,
    "위치 정보 없음"
  ) || "위치 정보 없음";

  return {
    englishName,
    birthYear: userInfo?.birthYear ?? null,
    languageLevel: userProfile?.languageLevel ?? null,
    targetLanguage: userProfile?.targetLanguage ?? null,
    profileImage,
    residence,
  };
};

export default function Main() {
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = location;

  console.count('[Main] render');

  const [state, setState] = useState(INITIAL_MAIN_STATE);
  const isMountedRef = useRef(true);

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  useEffect(() => {
    if (!search) {
      return;
    }

    const params = new URLSearchParams(search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const autoLoginParam = params.get("autoLogin");
    const userId = params.get("userId");

    if (autoLoginParam !== null) {
      setAutoLoginEnabled(autoLoginParam === "true");
    }

    if (accessToken || refreshToken) {
      setTokens({ accessToken, refreshToken });
      logTokenState("main:query-setTokens");
    }

    if (userId) {
      localStorage.setItem("userId", userId);
    }

    const sanitized = new URLSearchParams(search);
    let sanitizedChanged = false;
    for (const key of SENSITIVE_QUERY_KEYS) {
      if (sanitized.has(key)) {
        sanitized.delete(key);
        sanitizedChanged = true;
      }
    }

    if (sanitizedChanged) {
      const nextSearch = sanitized.toString();
      navigate({
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      }, { replace: true });
    }
  }, [search, navigate]);

  const loadProfileSection = useCallback(async () => {
    try {
      const [userInfoResponse, userProfileResponse] = await Promise.all([
        getUserInfo(),
        getUserProfile(),
      ]);

      const userInfo = userInfoResponse?.data ?? userInfoResponse ?? {};
      const userProfile = userProfileResponse?.data ?? userProfileResponse ?? {};

      const snapshot = buildProfileSnapshot(userInfo, userProfile);

      useProfileStore.setState((current) => ({
        ...current,
        englishName: snapshot.englishName ?? current.englishName,
        name: userInfo?.koreanName ?? snapshot.englishName ?? current.name,
        residence: snapshot.residence ?? current.residence,
        profileImage: snapshot.profileImage ?? current.profileImage,
        intro: userProfile?.selfBio ?? current.intro,
        birthYear: snapshot.birthYear,
        languageLevel: snapshot.languageLevel,
        targetLanguage: snapshot.targetLanguage,
      }));

      return { snapshot, error: null };
    } catch (error) {
      console.error("프로필 로드 실패:", error);
      return { snapshot: null, error: "프로필 정보를 불러오지 못했습니다." };
    }
  }, []);

  const loadStudyStatsSection = useCallback(async () => {
    try {
      const response = await getStudyStats("month");
      const payload = response?.data ?? response ?? null;
      return { data: payload, error: null };
    } catch (error) {
      console.error("학습 통계 로드 실패:", error);
      return { data: null, error: "학습 통계를 불러오지 못했습니다." };
    }
  }, []);

  const loadLanguageProfileSection = useCallback(async () => {
    try {
      const response = await getOnboardingData();
      const payload = response?.data ?? response ?? null;
      const transformed = transformOnboardingDataToLanguageProfile(payload);
      return { data: transformed, error: null };
    } catch (error) {
      console.error("언어 프로필 로드 실패:", error);
      return { data: null, error: "언어 프로필을 불러오지 못했습니다." };
    }
  }, []);

  const loadMatesSection = useCallback(async () => {
    try {
      const response = await getMatches(1, 4);
      const payload = response?.data ?? response ?? {};
      const rawContent = Array.isArray(payload?.data)
        ? payload.data
        : payload?.content ?? [];

      return { data: transformMatches(rawContent), error: null };
    } catch (error) {
      console.error("매칭 데이터 로드 실패:", error);
      return { data: [], error: "매칭 데이터를 불러오지 못했습니다." };
    }
  }, []);

  const loadAchievementsSection = useCallback(async () => {
    try {
      const [achievementsResponse, statsResponse] = await Promise.all([
        getMyAchievements(),
        getMyAchievementStats().catch(() => null),
      ]);

      const achievementsPayload = achievementsResponse?.data ?? achievementsResponse;
      const normalized = normalizeAchievements(achievementsPayload);
      const statsPayload = statsResponse ? statsResponse?.data ?? statsResponse : null;

      return { data: normalized, stats: statsPayload, error: null };
    } catch (error) {
      console.error("업적 로드 실패:", error);
      return { data: [], stats: null, error: "성취 배지를 불러오지 못했습니다." };
    }
  }, []);

  const initializeMainData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    const [
      profileResult,
      studyStatsResult,
      languageProfileResult,
      matesResult,
      achievementsResult,
    ] = await Promise.all([
      loadProfileSection(),
      loadStudyStatsSection(),
      loadLanguageProfileSection(),
      loadMatesSection(),
      loadAchievementsSection(),
    ]);

    if (!isMountedRef.current) {
      return;
    }

    setState({
      loading: false,
      profile: profileResult.snapshot,
      profileError: profileResult.error,
      studyStats: studyStatsResult.data,
      studyStatsError: studyStatsResult.error,
      languageProfile: languageProfileResult.data,
      languageProfileError: languageProfileResult.error,
      mates: matesResult.data,
      matesError: matesResult.error,
      achievements: achievementsResult.data,
      achievementsStats: achievementsResult.stats,
      achievementsError: achievementsResult.error,
      achievementsLoading: false,
    });
  }, [
    loadProfileSection,
    loadStudyStatsSection,
    loadLanguageProfileSection,
    loadMatesSection,
    loadAchievementsSection,
  ]);

  useEffect(() => {
    initializeMainData();
  }, [initializeMainData]);

  const handleRefreshAchievements = useCallback(async () => {
    setState((prev) => ({ ...prev, achievementsLoading: true }));
    const achievementsResult = await loadAchievementsSection();

    if (!isMountedRef.current) {
      return;
    }

    setState((prev) => ({
      ...prev,
      achievements: achievementsResult.data,
      achievementsStats: achievementsResult.stats,
      achievementsError: achievementsResult.error,
      achievementsLoading: false,
    }));
  }, [loadAchievementsSection]);

  const displayName = useMemo(() => (
    toDisplayText(state.profile?.englishName, "사용자")
  ), [state.profile]);

  const userAge = useMemo(() => {
    const parsed = state.profile?.birthYear ? Number(state.profile.birthYear) : null;
    if (!parsed || Number.isNaN(parsed)) {
      return null;
    }
    const currentYear = new Date().getFullYear();
    return Math.max(0, currentYear - parsed);
  }, [state.profile?.birthYear]);

  const greetingLevel = useMemo(() => {
    const directLevel = state.profile?.languageLevel
      || state.languageProfile?.learningLanguages?.[0]?.targetLevel
      || state.languageProfile?.learningLanguages?.[0]?.level
      || state.profile?.targetLanguage
      || null;

    return toDisplayText(directLevel, "레벨 정보 없음");
  }, [state.profile, state.languageProfile]);

  const matesEmptyMessage = state.matesError
    || "최근 매칭된 메이트가 없습니다.";

  return (
    <>
      <MainHeader />
      <div className="px-4 sm:px-6 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <GreetingCard
            userName={displayName}
            age={userAge}
            level={greetingLevel}
          />

          <StudyStats
            data={state.studyStats}
            loading={state.loading}
            errorMessage={state.studyStatsError}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <LanguageProfile
            loading={state.loading}
            profileData={state.languageProfile}
            emptyMessage={
              state.languageProfileError
                || "등록된 언어 정보가 없습니다."
            }
          />

          <LanguageExchangeMates
            mates={state.mates}
            loading={state.loading}
            emptyMessage={matesEmptyMessage}
          />
        </div>

        <MainAchievementsSection
          achievements={state.achievements}
          stats={state.achievementsStats}
          loading={state.loading || state.achievementsLoading}
          error={state.achievementsError}
          onRefresh={handleRefreshAchievements}
        />
      </div>
    </>
  );
}
