import React from "react";
import CompleteOnboarding from "../../components/CompleteOnboarding";
import { useNavigate } from "react-router-dom";
import useProfileStore from "../../store/profileStore";

export default function OnboardingInfoComplete() {
  const navigate = useNavigate();
  const userName = useProfileStore((state) => state.name) || "회원";
  return (
    <CompleteOnboarding userName={userName} onboarding="기본 정보 작성" subText="1번째 단계" step={1} totalSteps={5} onNext={() => navigate("/onboarding-lang/1")} />
  );
}
