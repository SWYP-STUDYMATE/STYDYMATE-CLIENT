import React from "react";
import { useParams } from "react-router-dom";
import ObPartner1 from "./ObPartner1";
import ObPartner2 from "./ObPartner2";
import ObPartnerComplete from "./ObPartnerComplete";
// import ObPartnerComplete from "./ObPartnerComplete";

export default function ObPartnerRouter() {
  const { step } = useParams();
  if (step === "1") return <ObPartner1 />;
  if (step === "2") return <ObPartner2 />;
  if (step === "complete") return <ObPartnerComplete />;
  return <div>잘못된 접근입니다.</div>;
} 