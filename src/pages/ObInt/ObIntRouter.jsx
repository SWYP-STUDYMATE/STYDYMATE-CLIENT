import React from "react";
import { useParams } from "react-router-dom";
import ObInt1 from "./ObInt1";
import ObInt2 from "./ObInt2";
import ObInt3 from "./ObInt3";
import ObInt4 from "./ObInt4";
import ObIntComplete from "./ObIntComplete";

export default function ObIntRouter() {
  const { step } = useParams();
  if (step === "1") return <ObInt1 />;
  if (step === "2") return <ObInt2 />;
  if (step === "3") return <ObInt3 />;
  if (step === "4") return <ObInt4 />;
  if (step === "complete") return <ObIntComplete />;
  return <div>잘못된 접근입니다.</div>;
} 