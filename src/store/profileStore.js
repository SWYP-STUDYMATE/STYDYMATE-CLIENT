import { create } from "zustand";
import { persist } from "zustand/middleware";

const useProfileStore = create(
  persist(
    (set) => ({
      englishName: "",
      setEnglishName: (name) => set({ englishName: name }),
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