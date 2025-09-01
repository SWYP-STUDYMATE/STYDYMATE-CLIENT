import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getUserCompleteProfile, updateUserCompleteProfile } from "../api/user";
import { log } from "../utils/logger";

// 서버와 동기화되는 프로필 스토어
const useProfileStore = create(
  persist(
    (set) => ({
      englishName: "",
      setEnglishName: (name) => set({ englishName: name }),
      name: "",
      setName: (name) => set({ name }),
      residence: "",
      setResidence: (residence) => set({ residence }),
      profileImage: null,
      setProfileImage: (profileImage) => set({ profileImage }),
      intro: "",
      setIntro: (intro) => set({ intro }),
      // 프로필 전체 초기화
      clearProfile: () => set({
        englishName: "",
        name: "",
        residence: "",
        profileImage: null,
        intro: "",
      }),
      
      // 서버에서 프로필 로드
      loadProfileFromServer: async () => {
        try {
          log.debug('서버에서 프로필 로드 시도', {}, 'PROFILE_STORE');
          const profileData = await getUserCompleteProfile();
          log.debug('서버 프로필 데이터 수신', { profileData }, 'PROFILE_STORE');
          
          set({
            englishName: profileData.englishName || "",
            name: profileData.name || "",
            residence: profileData.residence || "",
            profileImage: profileData.profileImage || null,
            intro: profileData.intro || "",
          });
          
          return profileData;
        } catch (error) {
          log.warn('서버 프로필 로드 실패', error, 'PROFILE_STORE');
          // Mock 모드나 서버 오류 시 기본값 유지
          return null;
        }
      },
      
      // 서버에 프로필 저장
      saveProfileToServer: async (profileData) => {
        try {
          log.debug('서버에 프로필 저장 시도', { profileData }, 'PROFILE_STORE');
          const updatedProfile = await updateUserCompleteProfile(profileData);
          log.info('서버 프로필 저장 성공', { updatedProfile }, 'PROFILE_STORE');
          
          // 서버 응답으로 상태 업데이트
          set({
            englishName: updatedProfile.englishName || profileData.englishName,
            name: updatedProfile.name || profileData.name,
            residence: updatedProfile.residence || profileData.residence,
            profileImage: updatedProfile.profileImage || profileData.profileImage,
            intro: updatedProfile.intro || profileData.intro,
          });
          
          return updatedProfile;
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
        set({ residence });
        try {
          await useProfileStore.getState().saveProfileToServer({ residence });
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
          const serverProfile = await getUserCompleteProfile();
          const localProfile = useProfileStore.getState();
          
          // 서버 데이터가 더 최신인지 확인 (updatedAt 등으로 판단)
          const hasServerChanges = 
            serverProfile.englishName !== localProfile.englishName ||
            serverProfile.residence !== localProfile.residence ||
            serverProfile.profileImage !== localProfile.profileImage ||
            serverProfile.intro !== localProfile.intro;
          
          if (hasServerChanges) {
            log.info('서버에 더 최신 데이터 발견, 로컬 업데이트 진행', {}, 'PROFILE_STORE');
            set({
              englishName: serverProfile.englishName || localProfile.englishName,
              name: serverProfile.name || localProfile.name,
              residence: serverProfile.residence || localProfile.residence,
              profileImage: serverProfile.profileImage || localProfile.profileImage,
              intro: serverProfile.intro || localProfile.intro,
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
    }
  )
);

export default useProfileStore; 