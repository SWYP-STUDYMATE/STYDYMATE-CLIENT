import React from "react";
import { useNavigate } from "react-router-dom";
import useLangInfoStore from "../../store/langInfoStore";
import CompleteOnboarding from "../../components/CompleteOnboarding";
import useProfileStore from "../../store/profileStore";

export default function ObLangComplete() {
  const navigate = useNavigate();
  const wantedLanguages = useLangInfoStore((state) => state.wantedLanguages);
  const userName = useProfileStore((state) => state.name) || "회원";

  return (
    <CompleteOnboarding
      userName={userName}
      onboarding="언어 설정"
      subText="두 번째 단계"
      step={2}
      totalSteps={5}
      onNext={() => navigate("/onboarding-int/1")}
    />
  );
} 