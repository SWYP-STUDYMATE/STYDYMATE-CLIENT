import React from "react";
import { useParams } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute";
import OnboardingInfo1 from "./ObInfo1";
import OnboardingInfo2 from "./ObInfo2";
import OnboardingInfo3 from "./ObInfo3";
import OnboardingInfo4 from "./ObInfo4";
import OnboardingInfoComplete from "./ObInfoComplete";
import ObInfoGoogle from "../Login/ObInfoGoogle";

export default function OnboardingInfoRouter() {
  const { step } = useParams();

  const renderStep = () => {
    if (step === "1") return <OnboardingInfo1 />;
    if (step === "2") return <OnboardingInfo2 />;
    if (step === "3") return <OnboardingInfo3 />;
    if (step === "4") return <OnboardingInfo4 />;
    if (step === "complete") return <OnboardingInfoComplete />;
    if (step === "google") return <ObInfoGoogle />;
    return <div>잘못된 접근입니다.</div>;
  };

  return (
    <ProtectedRoute>
      {renderStep()}
    </ProtectedRoute>
  );
} 