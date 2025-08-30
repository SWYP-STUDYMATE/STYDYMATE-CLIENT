import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getUserCompleteProfile, updateUserCompleteProfile } from "../api/user";

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
          console.log('서버에서 프로필 로드 시도...');
          const profileData = await getUserCompleteProfile();
          console.log('서버 프로필 데이터:', profileData);
          
          set({
            englishName: profileData.englishName || "",
            name: profileData.name || "",
            residence: profileData.residence || "",
            profileImage: profileData.profileImage || null,
            intro: profileData.intro || "",
          });
          
          return profileData;
        } catch (error) {
          console.warn('서버 프로필 로드 실패:', error);
          // Mock 모드나 서버 오류 시 기본값 유지
          return null;
        }
      },
      
      // 서버에 프로필 저장
      saveProfileToServer: async (profileData) => {
        try {
          console.log('서버에 프로필 저장 시도:', profileData);
          const updatedProfile = await updateUserCompleteProfile(profileData);
          console.log('서버 프로필 저장 성공:', updatedProfile);
          
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
          console.error('서버 프로필 저장 실패:', error);
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
          console.warn('영어 이름 서버 저장 실패:', error);
        }
      },
      
      setResidenceSync: async (residence) => {
        set({ residence });
        try {
          await useProfileStore.getState().saveProfileToServer({ residence });
        } catch (error) {
          console.warn('거주지 서버 저장 실패:', error);
        }
      },
      
      setIntroSync: async (intro) => {
        set({ intro });
        try {
          await useProfileStore.getState().saveProfileToServer({ intro });
        } catch (error) {
          console.warn('소개 서버 저장 실패:', error);
        }
      },
      
      setProfileImageSync: async (profileImage) => {
        set({ profileImage });
        try {
          await useProfileStore.getState().saveProfileToServer({ profileImage });
        } catch (error) {
          console.warn('프로필 이미지 서버 저장 실패:', error);
        }
      },
      
      // 서버와 로컬 데이터 동기화 상태 확인
      syncWithServer: async () => {
        try {
          console.log('🔄 서버와 데이터 동기화 확인 중...');
          const serverProfile = await getUserCompleteProfile();
          const localProfile = useProfileStore.getState();
          
          // 서버 데이터가 더 최신인지 확인 (updatedAt 등으로 판단)
          const hasServerChanges = 
            serverProfile.englishName !== localProfile.englishName ||
            serverProfile.residence !== localProfile.residence ||
            serverProfile.profileImage !== localProfile.profileImage ||
            serverProfile.intro !== localProfile.intro;
          
          if (hasServerChanges) {
            console.log('⚠️ 서버에 더 최신 데이터 발견, 로컬 업데이트');
            set({
              englishName: serverProfile.englishName || localProfile.englishName,
              name: serverProfile.name || localProfile.name,
              residence: serverProfile.residence || localProfile.residence,
              profileImage: serverProfile.profileImage || localProfile.profileImage,
              intro: serverProfile.intro || localProfile.intro,
            });
            return true; // 동기화됨
          }
          
          console.log('✅ 로컬과 서버 데이터 일치');
          return false; // 이미 동기화됨
        } catch (error) {
          console.warn('서버 동기화 확인 실패:', error);
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