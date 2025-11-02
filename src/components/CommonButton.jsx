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
  fullWidth = true, // 전체 너비 여부
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
    case "ghost-icon":
      variantClass = "bg-transparent text-[var(--black-300)] hover:bg-[#F1F3F5] active:bg-[#E7E7E7]";
      break;
    case "icon-primary":
      variantClass = "bg-[var(--green-500)] hover:bg-[var(--green-600)] text-white";
      break;
    case "danger":
      variantClass = "bg-[#EA4335] text-white hover:bg-[#D23F31] active:bg-[#B93025]";
      break;
    case "link":
      variantClass = "bg-transparent text-[var(--green-500)] hover:text-[var(--green-600)] font-medium";
      break;
    case "naver":
      variantClass = "bg-[#09AA5C] text-white hover:bg-[#08964F] disabled:bg-[#929292]";
      break;
    case "google":
      variantClass = "bg-[#FAFAFA] text-[#171717] hover:bg-[#F1F3F5] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] disabled:bg-[#F1F3F5] disabled:text-[#929292]";
      break;
    case "primary":
    default:
      variantClass = "bg-[#111111] text-white hover:bg-[#414141] active:bg-[#606060] disabled:bg-[#F1F3F5] disabled:text-[#929292]";
      break;
  }

  const sizeClasses = {
    xs: "h-[32px] text-[12px] px-2",
    small: "h-[40px] text-[14px] px-4",
    default: "h-[56px] text-[18px]",
    large: "h-[64px] text-[20px]",
    icon: "w-10 h-10 p-2", // 아이콘 전용
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
        ${fullWidth ? 'w-full' : ''} ${sizeClasses[size]} font-bold rounded-[6px]
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