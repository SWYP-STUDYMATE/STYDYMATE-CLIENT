import React from "react";
import { useParams } from "react-router-dom";
import ObSchadule1 from "./ObSchadule1";
import ObSchadule2 from "./ObSchadule2";
import ObSchadule3 from "./ObSchadule3";
import ObSchadule4 from "./ObSchadule4";
// import ObSchaduleComplete from "./ObSchaduleComplete";

export default function ObSchaduleRouter() {
  const { step } = useParams();
  if (step === "1") return <ObSchadule1 />;
  if (step === "2") return <ObSchadule2 />;
  if (step === "3") return <ObSchadule3 />;
  if (step === "4") return <ObSchadule4 />;
  if (step === "complete") return <div>ObSchaduleComplete (스케줄 온보딩 완료)</div>;
  return <div>잘못된 접근입니다.</div>;
} 