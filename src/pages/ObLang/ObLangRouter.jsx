import React from "react";
import { useParams } from "react-router-dom";
import ObLang1 from "./ObLang1";
import ObLang2 from "./ObLang2";
import ObLang3 from "./ObLang3";
import ObLangComplete from "./ObLangComplete";

export default function ObLangRouter() {
  const { step } = useParams();
  if (step === "1") return <ObLang1 />;
  if (step === "2") return <ObLang2 />;
  if (step === "3") return <ObLang3 />;
  if (step === "complete") return <ObLangComplete />;
  // 추후 ObLang2, ObLang3 등 추가 가능
  return <div>잘못된 접근입니다.</div>;
} 