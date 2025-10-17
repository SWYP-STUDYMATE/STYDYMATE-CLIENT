import React from "react";
import { InlineSpinner } from "./ui/LoadingSpinner";

export default function CommonButton({ 
  text, 
  children, // children prop 추가
  variant = "primary", 
  className = "", 
  loading = false,
  disabled = false,
  size = "default",
  icon,
  iconPosition = "left",
  ...props 
}) {
  const isDisabled = disabled || loading;
  
  let variantClass = "";
  switch (variant) {
    case "success":
      variantClass = "bg-[#00C471] text-white hover:bg-[#00B267] active:bg-[#008B50]";
      break;
    case "secondary":
      variantClass = "bg-[#F1F3F5] text-[#111111] hover:bg-[#111111] hover:text-white active:bg-[#414141]";
      break;
    case "complete":
      variantClass = "bg-[#00C471] text-white hover:bg-[#00B267] active:bg-[#008B50]";
      break;
    case "outline":
      variantClass = "bg-transparent border-2 border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white active:bg-[#414141]";
      break;
    case "ghost":
      variantClass = "bg-transparent text-[#111111] hover:bg-[#F1F3F5] active:bg-[#E7E7E7]";
      break;
    case "danger":
      variantClass = "bg-[#EA4335] text-white hover:bg-[#D23F31] active:bg-[#B93025]";
      break;
    case "primary":
    default:
      variantClass = "bg-[#111111] text-white hover:bg-[#414141] active:bg-[#606060] disabled:bg-[#F1F3F5] disabled:text-[#929292]";
      break;
  }

  const sizeClasses = {
    small: "h-[40px] text-[14px] px-4",
    default: "h-[56px] text-[18px]",
    large: "h-[64px] text-[20px]"
  };

  const getContent = () => {
    if (loading) {
      return (
        <span className="flex items-center justify-center gap-2">
          <InlineSpinner size="small" color="currentColor" />
          <span>처리 중...</span>
        </span>
      );
    }

    if (icon) {
      const iconElement = React.cloneElement(icon, {
        className: `w-5 h-5 ${icon.props.className || ''}`
      });

      const buttonText = text || children;

      // 아이콘만 있고 텍스트가 없는 경우
      if (!buttonText) {
        return (
          <span className="flex items-center justify-center">
            {iconElement}
          </span>
        );
      }

      if (iconPosition === "right") {
        return (
          <span className="flex items-center justify-center gap-2">
            <span>{buttonText}</span>
            {iconElement}
          </span>
        );
      }

      return (
        <span className="flex items-center justify-center gap-2">
          {iconElement}
          <span>{buttonText}</span>
        </span>
      );
    }

    return text || children; // text가 없으면 children 사용
  };

  return (
    <button
      className={`
        w-full ${sizeClasses[size]} font-bold rounded-[6px] 
        transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2
        ${!isDisabled ? 'active:scale-[0.98] active:transform' : ''}
        ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${variantClass} 
        ${className}
      `}
      disabled={isDisabled}
      aria-label={loading ? '처리 중...' : undefined}
      {...props}
    >
      {getContent()}
    </button>
  );
} 