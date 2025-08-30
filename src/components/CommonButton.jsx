import React from "react";

export default function CommonButton({ text, variant = "primary", className = "", ...props }) {
  let variantClass = "";
  switch (variant) {
    case "success":
      variantClass = "bg-[var(--green-50)] text-[var(--green-500)] hover:bg-[var(--green-600)] hover:text-white";
      break;
    case "secondary":
      variantClass = "bg-[var(--neutral-100)] text-[var(--black-300)] hover:bg-[var(--black-400)] hover:text-white";
      break;
    case "complete":
      variantClass = "bg-[var(--green-500)] text-white hover:bg-[var(--green-600)]";
      break;
    case "primary":
    default:
      variantClass = "bg-[var(--black-500)] text-white hover:bg-[var(--black-400)] disabled:bg-[var(--neutral-100)] disabled:text-[var(--black-200)]";
      break;
  }

  return (
    <button
      className={`w-full h-[56px] text-[18px] font-bold rounded-[6px] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 ${variantClass} ${className}`}
      {...props}
    >
      {text}
    </button>
  );
} 