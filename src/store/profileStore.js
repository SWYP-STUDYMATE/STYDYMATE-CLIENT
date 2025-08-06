import { create } from "zustand";
import { persist } from "zustand/middleware";

// TODO: API 구현 완료 후 getUserProfile() API로 대체 예정
// 현재는 클라이언트 상태로 관리, 서버 DB와 동기화 필요
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
    }),
    {
      name: "profile-storage", // localStorage key
    }
  )
);

export default useProfileStore; 