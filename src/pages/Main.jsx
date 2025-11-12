import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MainHeader from "../components/MainHeader";
import GreetingCard from "../components/GreetingCard";
import StudyStats from "../components/StudyStats";
import LanguageProfile from "../components/LanguageProfile";
import LanguageExchangeMates from "../components/LanguageExchangeMates";
import MainAchievementsSection from "../components/MainAchievementsSection";
import AILearningSummaryCard from "../components/AILearningSummaryCard";

import { getStudyStats, getProgressSummary } from "../api/analytics";
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
  progressSummary: null,
  progressSummaryLoading: false,
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

  // ✅ 무한 루프 방지: 처리 완료 플래그 ref 추가
  const queryProcessedRef = useRef(false);

  useEffect(() => {
    if (!search) {
      queryProcessedRef.current = false;
      return;
    }

    // 이미 처리된 query string인지 확인 (무한 루프 방지)
    const params = new URLSearchParams(search);
    const hasSensitiveKeys = SENSITIVE_QUERY_KEYS.some(key => params.has(key));

    // 민감한 키가 없으면 이미 처리된 것으로 간주
    if (!hasSensitiveKeys && queryProcessedRef.current) {
      return;
    }

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
      queryProcessedRef.current = true; // 처리 완료 마킹
      navigate({
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      }, { replace: true });
    } else {
      queryProcessedRef.current = true;
    }
  }, [search, navigate, location.pathname]);

  const loadProfileSection = useCallback(async () => {
    try {
      const [userInfoResponse, userProfileResponse] = await Promise.all([
        getUserInfo(),
        getUserProfile(),
      ]);

      const userInfo = userInfoResponse?.data ?? userInfoResponse ?? {};
      const userProfile = userProfileResponse?.data ?? userProfileResponse ?? {};

      const snapshot = buildProfileSnapshot(userInfo, userProfile);

      // ✅ Zustand store 업데이트를 return 객체에 포함 (React Hook 규칙 준수)
      return {
        snapshot,
        error: null,
        storeUpdate: {
          englishName: snapshot.englishName,
          name: userInfo?.koreanName ?? snapshot.englishName,
          residence: snapshot.residence,
          profileImage: snapshot.profileImage,
          intro: userProfile?.selfBio,
          birthYear: snapshot.birthYear,
          languageLevel: snapshot.languageLevel,
          targetLanguage: snapshot.targetLanguage,
        }
      };
    } catch (error) {
      console.error("프로필 로드 실패:", error);
      return { snapshot: null, error: "프로필 정보를 불러오지 못했습니다.", storeUpdate: null };
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
    setState((prev) => ({ ...prev, loading: true, progressSummaryLoading: true }));

    // 🔄 모든 데이터 병렬 로드 (불필요한 렌더링 방지)
    const [
      profileResult,
      studyStatsResult,
      languageProfileResult,
      matesResult,
      achievementsResult,
      progressSummaryResult,
    ] = await Promise.all([
      loadProfileSection(),
      loadStudyStatsSection(),
      loadLanguageProfileSection(),
      loadMatesSection(),
      loadAchievementsSection(),
      // progressSummary도 함께 로드
      getProgressSummary()
        .then((response) => response?.data ?? response)
        .catch((error) => {
          console.error('Failed to load progress summary:', error);
          return null;
        }),
    ]);

    if (!isMountedRef.current) {
      return;
    }

    console.log('✅ [initializeMainData] 모든 데이터 로드 완료, setState 1회만 실행');

    // ✅ Zustand store 업데이트 (useEffect 외부에서 직접 호출)
    if (profileResult.snapshot) {
      useProfileStore.setState({
        englishName: profileResult.snapshot.englishName,
        residence: profileResult.snapshot.residence,
        profileImage: profileResult.snapshot.profileImage,
        birthYear: profileResult.snapshot.birthYear,
        languageLevel: profileResult.snapshot.languageLevel,
        targetLanguage: profileResult.snapshot.targetLanguage,
      });
    }

    // ✅ React 표준 패턴: 값을 직접 setState에 전달 (useMemo는 컴포넌트 레벨에서 사용)
    setState((prev) => ({
      ...prev,
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
      progressSummary: progressSummaryResult,
      progressSummaryLoading: false,
    }));
  }, [
    loadProfileSection,
    loadStudyStatsSection,
    loadLanguageProfileSection,
    loadMatesSection,
    loadAchievementsSection,
  ]);

  // ✅ 무한 루프 방지: 첫 마운트 시에만 실행
  useEffect(() => {
    initializeMainData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열로 첫 마운트에만 실행

  const handleRefreshAchievements = useCallback(async () => {
    setState((prev) => ({ ...prev, achievementsLoading: true }));
    const achievementsResult = await loadAchievementsSection();

    if (!isMountedRef.current) {
      return;
    }

    // ✅ React 표준 패턴: 값을 직접 setState에 전달
    setState((prev) => ({
      ...prev,
      achievements: achievementsResult.data,
      achievementsStats: achievementsResult.stats,
      achievementsError: achievementsResult.error,
      achievementsLoading: false,
    }));
  }, [loadAchievementsSection]);

  // ✅ 컴포넌트 레벨 값 계산 (React 표준 패턴)
  const displayName = toDisplayText(state.profile?.englishName, "사용자");

  // userAge 계산: 즉시 계산 (다른 컴포넌트와 동일한 패턴)
  const userAge = (() => {
    const parsed = state.profile?.birthYear ? Number(state.profile.birthYear) : null;
    if (parsed && !Number.isNaN(parsed)) {
      return Math.max(0, new Date().getFullYear() - parsed);
    }
    return null;
  })();

  // greetingLevel 계산 (useMemo 제거 - 배열 접근이 참조 불안정성을 일으킴)
  const directLevel = state.profile?.languageLevel
    || state.languageProfile?.learningLanguages?.[0]?.targetLevel
    || state.languageProfile?.learningLanguages?.[0]?.level
    || state.profile?.targetLanguage
    || null;
  const greetingLevel = toDisplayText(directLevel, "레벨 정보 없음");

  const matesEmptyMessage = state.matesError
    || "최근 매칭된 메이트가 없습니다.";

  return (
    <>
      <MainHeader />
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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

        {/* AI Learning Summary Card */}
        <AILearningSummaryCard
          progressSummary={state.progressSummary}
          loading={state.progressSummaryLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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
