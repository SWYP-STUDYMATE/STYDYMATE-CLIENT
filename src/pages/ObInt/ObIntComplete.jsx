import React from "react";
import CompleteOnboarding from "../../components/CompleteOnboarding";
import { useNavigate } from "react-router-dom";
import useProfileStore from "../../store/profileStore";

export default function ObIntComplete() {
  const navigate = useNavigate();
  const userName = useProfileStore((state) => state.name) || "회원";
  return (
    <CompleteOnboarding
      userName={userName}
      onboarding="학습 동기·관심사 설정"
      subText="세세 번째 단계"
      step={3}
      totalSteps={5}
      onNext={() => { navigate("/onboarding-partner/1"); }}
    />
  );
} 