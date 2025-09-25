import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getUserCompleteProfile, updateUserCompleteProfile } from "../api/user";
import { log } from "../utils/logger";
import { toDisplayText } from "../utils/text";

const normalizeResidence = (value) => {
  const normalized = toDisplayText(value, "");
  return typeof normalized === "string" ? normalized : "";
};

// 서버와 동기화되는 프로필 스토어
const useProfileStore = create(
  persist(
    (set, get) => ({
      englishName: "",
      setEnglishName: (name) => set({ englishName: name ?? "" }),
      name: "",
      setName: (name) => set({ name: name ?? "" }),
      residence: "",
      setResidence: (residence) => set({ residence: normalizeResidence(residence) }),
      profileImage: null,
      setProfileImage: (profileImage) => set({ profileImage: profileImage ?? null }),
      intro: "",
      setIntro: (intro) => set({ intro: intro ?? "" }),
      birthYear: null,
      setBirthYear: (birthYear) => set({ birthYear: birthYear ?? null }),
      languageLevel: null,
      setLanguageLevel: (languageLevel) => set({ languageLevel: languageLevel ?? null }),
      targetLanguage: null,
      setTargetLanguage: (targetLanguage) => set({ targetLanguage: targetLanguage ?? null }),
      // 프로필 전체 초기화
      clearProfile: () => set({
        englishName: "",
        name: "",
        residence: "",
        profileImage: null,
        intro: "",
        birthYear: null,
        languageLevel: null,
        targetLanguage: null,
      }),
      
      // 서버에서 프로필 로드
      loadProfileFromServer: async () => {
        try {
          log.debug('서버에서 프로필 로드 시도', {}, 'PROFILE_STORE');
          const response = await getUserCompleteProfile();
          const profileData = response?.data ?? response;
          log.debug('서버 프로필 데이터 수신', { profileData }, 'PROFILE_STORE');
          
          set({
            englishName: profileData?.englishName ?? "",
            name: profileData?.koreanName ?? profileData?.englishName ?? "",
            residence: normalizeResidence(profileData?.location ?? profileData?.residence),
            profileImage: profileData?.profileImageUrl ?? null,
            intro: profileData?.selfBio ?? "",
            birthYear: profileData?.birthYear ?? null,
            languageLevel: profileData?.languageLevel ?? null,
            targetLanguage: profileData?.targetLanguage ?? null,
          });
          
          return profileData;
        } catch (error) {
          log.warn('서버 프로필 로드 실패', error, 'PROFILE_STORE');
          // 서버 오류 시 기본값 유지
          return null;
        }
      },
      
      // 서버에 프로필 저장
      saveProfileToServer: async (profileData) => {
        try {
          log.debug('서버에 프로필 저장 시도', { profileData }, 'PROFILE_STORE');
          await updateUserCompleteProfile(profileData);
          log.info('서버 프로필 저장 성공', { profileData }, 'PROFILE_STORE');

          const current = get();
          set({
            englishName: profileData.englishName ?? current.englishName,
            name: profileData.koreanName ?? profileData.name ?? current.name,
            residence: normalizeResidence(
              profileData.location ?? profileData.residence ?? current.residence
            ),
            profileImage: profileData.profileImageUrl ?? profileData.profileImage ?? current.profileImage,
            intro: profileData.selfBio ?? profileData.intro ?? current.intro,
            birthYear: profileData.birthYear ?? current.birthYear,
            languageLevel: profileData.languageLevel ?? current.languageLevel,
            targetLanguage: profileData.targetLanguage ?? current.targetLanguage,
          });
          
          return profileData;
        } catch (error) {
          log.error('서버 프로필 저장 실패', error, 'PROFILE_STORE');
          // 로컬 상태는 그대로 유지
          throw error;
        }
      },
      
      // 동기화된 setter 메서드들 (로컬 + 서버)
      setEnglishNameSync: async (name) => {
        set({ englishName: name });
        try {
          await useProfileStore.getState().saveProfileToServer({ englishName: name });
        } catch (error) {
          log.warn('영어 이름 서버 저장 실패', error, 'PROFILE_STORE');
        }
      },
      
      setResidenceSync: async (residence) => {
        const normalized = normalizeResidence(residence);
        set({ residence: normalized });
        try {
          await useProfileStore.getState().saveProfileToServer({
            location: normalized,
            residence: normalized,
          });
        } catch (error) {
          log.warn('거주지 서버 저장 실패', error, 'PROFILE_STORE');
        }
      },
      
      setIntroSync: async (intro) => {
        set({ intro });
        try {
          await useProfileStore.getState().saveProfileToServer({ intro });
        } catch (error) {
          log.warn('소개 서버 저장 실패', error, 'PROFILE_STORE');
        }
      },
      
      setProfileImageSync: async (profileImage) => {
        set({ profileImage });
        try {
          await useProfileStore.getState().saveProfileToServer({ profileImage });
        } catch (error) {
          log.warn('프로필 이미지 서버 저장 실패', error, 'PROFILE_STORE');
        }
      },
      
      // 서버와 로컬 데이터 동기화 상태 확인
      syncWithServer: async () => {
        try {
          log.debug('서버와 데이터 동기화 확인 중', {}, 'PROFILE_STORE');
          const response = await getUserCompleteProfile();
          const serverProfile = response?.data ?? response;
          const localProfile = useProfileStore.getState();
          
          // 서버 데이터가 더 최신인지 확인 (updatedAt 등으로 판단)
          const hasServerChanges = 
            serverProfile.englishName !== localProfile.englishName ||
            serverProfile.location !== localProfile.residence ||
            serverProfile.profileImageUrl !== localProfile.profileImage ||
            serverProfile.selfBio !== localProfile.intro ||
            (serverProfile.birthYear ?? null) !== localProfile.birthYear ||
            (serverProfile.languageLevel ?? null) !== localProfile.languageLevel ||
            (serverProfile.targetLanguage ?? null) !== localProfile.targetLanguage;
          
          if (hasServerChanges) {
            log.info('서버에 더 최신 데이터 발견, 로컬 업데이트 진행', {}, 'PROFILE_STORE');
            set({
              englishName: serverProfile.englishName || localProfile.englishName,
              name: serverProfile.koreanName || localProfile.name,
              residence: normalizeResidence(serverProfile.location ?? serverProfile.residence ?? localProfile.residence),
              profileImage: serverProfile.profileImageUrl || localProfile.profileImage,
              intro: serverProfile.selfBio || localProfile.intro,
              birthYear: serverProfile.birthYear ?? localProfile.birthYear,
              languageLevel: serverProfile.languageLevel ?? localProfile.languageLevel,
              targetLanguage: serverProfile.targetLanguage ?? localProfile.targetLanguage,
            });
            return true; // 동기화됨
          }
          
          log.debug('로컬과 서버 데이터 일치', {}, 'PROFILE_STORE');
          return false; // 이미 동기화됨
        } catch (error) {
          log.warn('서버 동기화 확인 실패', error, 'PROFILE_STORE');
          return false;
        }
      },
    }),
    {
      name: "profile-storage", // localStorage key
      partialize: (state) => ({
        englishName: state.englishName,
        name: state.name,
        residence: state.residence,
        profileImage: state.profileImage,
        intro: state.intro,
        birthYear: state.birthYear,
        languageLevel: state.languageLevel,
        targetLanguage: state.targetLanguage,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState ?? {}),
        setEnglishName: currentState.setEnglishName,
        setName: currentState.setName,
        setResidence: currentState.setResidence,
        setProfileImage: currentState.setProfileImage,
        setIntro: currentState.setIntro,
        setBirthYear: currentState.setBirthYear,
        setLanguageLevel: currentState.setLanguageLevel,
        setTargetLanguage: currentState.setTargetLanguage,
        clearProfile: currentState.clearProfile,
        loadProfileFromServer: currentState.loadProfileFromServer,
        saveProfileToServer: currentState.saveProfileToServer,
        setEnglishNameSync: currentState.setEnglishNameSync,
        setResidenceSync: currentState.setResidenceSync,
        setIntroSync: currentState.setIntroSync,
        setProfileImageSync: currentState.setProfileImageSync,
        syncWithServer: currentState.syncWithServer,
      }),
    }
  )
);

export default useProfileStore; 
