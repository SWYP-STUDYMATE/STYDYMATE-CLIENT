import React from "react";

export default function CommonButton({ text, variant = "primary", className = "", ...props }) {
  let variantClass = "";
  switch (variant) {
    case "success":
      variantClass = "bg-[#e6f9f1] text-[#00c471] hover:bg-[#009D5E] hover:text-white";
      break;
    case "secondary":
      variantClass = "bg-[#f1f3f5] text-[#929292] hover:bg-[#444444] hover:text-white";
      break;
    case "complete":
      variantClass = "bg-[#00C471] text-[#FFFFFF] hover:bg-[#009D5E]";
      break;
    case "primary":
    default:
      variantClass = "bg-[#111111] text-white hover:bg-[#444444] disabled:bg-[#F1F3F5] disabled:text-[#929292]";
      break;
  }

  return (
    <button
      className={`w-full h-[56px] text-[18px] font-bold rounded-[6px] transition-colors duration-200 ${variantClass} ${className}`}
      {...props}
    >
      {text}
    </button>
  );
} 