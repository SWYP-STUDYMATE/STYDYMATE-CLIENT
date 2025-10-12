import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { shallow } from "zustand/shallow";

import MainHeader from "../components/MainHeader";
import Sidebar from "../components/chat/Sidebar";
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

export default function Main() {
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = location;

  const [studyStatsState, setStudyStatsState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [languageProfileState, setLanguageProfileState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [matesState, setMatesState] = useState({
    items: [],
    loading: true,
    error: null,
  });
  const [achievementsState, setAchievementsState] = useState({
    items: [],
    stats: null,
    loading: true,
    error: null,
  });

  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

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
  }, [search, navigate, location.pathname]);

  const {
    englishName,
    name,
    birthYear,
    languageLevel,
    targetLanguage,
    loadProfileFromServer,
    setEnglishName,
    setBirthYear,
    setProfileImage,
    setResidence,
    setLanguageLevel,
    setTargetLanguage,
  } = useProfileStore(
    (state) => ({
      englishName: state.englishName,
      name: state.name,
      birthYear: state.birthYear,
      languageLevel: state.languageLevel,
      targetLanguage: state.targetLanguage,
      loadProfileFromServer: state.loadProfileFromServer,
      setEnglishName: state.setEnglishName,
      setBirthYear: state.setBirthYear,
      setProfileImage: state.setProfileImage,
      setResidence: state.setResidence,
      setLanguageLevel: state.setLanguageLevel,
      setTargetLanguage: state.setTargetLanguage,
    }),
    shallow
  );

  const fetchProfile = useCallback(async () => {
    try {
      const profileData = await loadProfileFromServer();

      if (!isMountedRef.current) {
        return;
      }

      if (profileData) {
        return;
      }

      const userInfoResponse = await getUserInfo();
      const userInfo = userInfoResponse?.data ?? userInfoResponse ?? {};

      const profileResponse = await getUserProfile();
      const profilePayload = profileResponse?.data ?? profileResponse ?? {};

      setEnglishName(userInfo?.englishName || userInfo?.name || "사용자");
      setBirthYear(userInfo?.birthYear ?? null);
      setProfileImage(
        profilePayload?.profileImageUrl
        || profilePayload?.profileImage
        || "/assets/basicProfilePic.png"
      );
      setResidence(
        profilePayload?.location?.city
        || profilePayload?.residence
        || "위치 정보 없음"
      );
      setLanguageLevel(profilePayload?.languageLevel ?? null);
      setTargetLanguage(profilePayload?.targetLanguage ?? null);
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
        setEnglishName("사용자");
        setProfileImage("/assets/basicProfilePic.png");
        setResidence("위치 정보 없음");
        return;
      }

      if (error?.response?.status >= 500) {
        setEnglishName("사용자");
        setProfileImage("/assets/basicProfilePic.png");
        setResidence("위치 정보 없음");
      }
    }
  }, [
    loadProfileFromServer,
    setBirthYear,
    setEnglishName,
    setLanguageLevel,
    setProfileImage,
    setResidence,
    setTargetLanguage,
  ]);

  const fetchStudyStats = useCallback(async () => {
    setStudyStatsState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getStudyStats("month");
      if (!isMountedRef.current) {
        return;
      }
      const payload = response?.data ?? response ?? null;
      setStudyStatsState({ data: payload, loading: false, error: null });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }
      setStudyStatsState({
        data: null,
        loading: false,
        error: "학습 통계를 불러오지 못했습니다.",
      });
    }
  }, []);

  const fetchLanguageProfile = useCallback(async () => {
    setLanguageProfileState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getOnboardingData();
      if (!isMountedRef.current) {
        return;
      }
      const payload = response?.data ?? response ?? null;
      const transformed = transformOnboardingDataToLanguageProfile(payload);
      setLanguageProfileState({ data: transformed, loading: false, error: null });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }
      setLanguageProfileState({
        data: null,
        loading: false,
        error: "언어 프로필을 불러오지 못했습니다.",
      });
    }
  }, []);

  const fetchMatches = useCallback(async () => {
    setMatesState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getMatches(1, 4);
      if (!isMountedRef.current) {
        return;
      }
      const payload = response?.data ?? response ?? {};
      const rawContent = Array.isArray(payload?.data)
        ? payload.data
        : payload?.content ?? [];

      setMatesState({
        items: transformMatches(rawContent),
        loading: false,
        error: null,
      });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }
      setMatesState({
        items: [],
        loading: false,
        error: "매칭 데이터를 불러오지 못했습니다.",
      });
    }
  }, []);

  const fetchAchievements = useCallback(async () => {
    setAchievementsState((prev) => ({ ...prev, loading: true, error: null }));

    const normalizeAchievements = (payload) => {
      if (!payload) return [];
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.achievements)) return payload.achievements;
      if (Array.isArray(payload)) return payload;
      return [];
    };

    try {
      const [achievementsPayload, statsPayload] = await Promise.all([
        getMyAchievements().catch((error) => {
          console.error("업적 목록 로드 실패", error);
          throw error;
        }),
        getMyAchievementStats().catch((error) => {
          console.warn("업적 통계 로드 실패", error);
          return null;
        }),
      ]);

      if (!isMountedRef.current) {
        return;
      }

      const normalized = normalizeAchievements(achievementsPayload);

      setAchievementsState({
        items: normalized,
        stats: statsPayload ?? null,
        loading: false,
        error: null,
      });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      setAchievementsState({
        items: [],
        stats: null,
        loading: false,
        error: "성취 배지를 불러오지 못했습니다.",
      });
    }
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    fetchProfile();
    fetchStudyStats();
    fetchLanguageProfile();
    fetchMatches();
    fetchAchievements();
  }, [fetchProfile, fetchStudyStats, fetchLanguageProfile, fetchMatches, fetchAchievements]);

  const displayName = useMemo(() => (
    toDisplayText(englishName || name, "사용자")
  ), [englishName, name]);

  const userAge = useMemo(() => {
    const parsed = birthYear ? Number(birthYear) : null;
    if (!parsed || Number.isNaN(parsed)) {
      return null;
    }
    const currentYear = new Date().getFullYear();
    return Math.max(0, currentYear - parsed);
  }, [birthYear]);

  const greetingLevel = useMemo(() => {
    const directLevel = languageLevel
      || languageProfileState.data?.learningLanguages?.[0]?.targetLevel
      || languageProfileState.data?.learningLanguages?.[0]?.level
      || targetLanguage
      || null;

    return toDisplayText(directLevel, "레벨 정보 없음");
  }, [languageLevel, languageProfileState.data, targetLanguage]);

  const matesEmptyMessage = matesState.error
    || "최근 매칭된 메이트가 없습니다.";

  return (
    <div className="page-bg min-h-screen flex flex-col">
      <MainHeader />
      <div className="flex flex-1 p-6 space-x-6 overflow-hidden">
        <Sidebar active="home" />
        <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GreetingCard
              userName={displayName}
              age={userAge}
              level={greetingLevel}
            />

            <StudyStats
              data={studyStatsState.data}
              loading={studyStatsState.loading}
              errorMessage={studyStatsState.error}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <LanguageProfile
              loading={languageProfileState.loading}
              profileData={languageProfileState.data}
              emptyMessage={
                languageProfileState.error
                  || "등록된 언어 정보가 없습니다."
              }
            />

            <LanguageExchangeMates
              mates={matesState.items}
              loading={matesState.loading}
              emptyMessage={matesEmptyMessage}
            />
          </div>

          <div className="mt-6">
            <MainAchievementsSection
              achievements={achievementsState.items}
              stats={achievementsState.stats}
              loading={achievementsState.loading}
              error={achievementsState.error}
              onRefresh={fetchAchievements}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
