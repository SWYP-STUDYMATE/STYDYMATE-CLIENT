import React from "react";
import { useParams } from "react-router-dom";
import OnboardingInfo1 from "./OnboardingInfo1";
import OnboardingInfo2 from "./OnboardingInfo2";
import OnboardingInfo3 from "./OnboardingInfo3";
import OnboardingInfo4 from "./OnboardingInfo4";

export default function OnboardingInfoRouter() {
  const { step } = useParams();
  if (step === "1") return <OnboardingInfo1 />;
  if (step === "2") return <OnboardingInfo2 />;
  if (step === "3") return <OnboardingInfo3 />;
  if (step === "4") return <OnboardingInfo4 />;
  return <div>잘못된 접근입니다.</div>;
} 