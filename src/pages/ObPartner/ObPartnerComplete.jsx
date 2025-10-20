import React from "react";
import CompleteOnboarding from "../../components/CompleteOnboarding";
import { useNavigate } from "react-router-dom";
import useProfileStore from "../../store/profileStore";

export default function ObPartnerComplete() {
  const navigate = useNavigate();
  const userName = useProfileStore((state) => state.name) || "회원";
  return (
    <CompleteOnboarding
      userName={userName}
      onboarding="소통&파트너 작성"
      subText="4 번째 단계"
      step={4}
      totalSteps={5}
      onNext={() => { navigate("/onboarding-schedule/1"); }}
    />
  );
} 