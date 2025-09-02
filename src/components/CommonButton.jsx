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
      variantClass = "bg-[var(--green-50)] text-[var(--green-500)] hover:bg-[var(--green-600)] hover:text-white active:bg-[var(--green-700)]";
      break;
    case "secondary":
      variantClass = "bg-[var(--neutral-100)] text-[var(--black-300)] hover:bg-[var(--black-400)] hover:text-white active:bg-[var(--black-500)]";
      break;
    case "complete":
      variantClass = "bg-[var(--green-500)] text-white hover:bg-[var(--green-600)] active:bg-[var(--green-700)]";
      break;
    case "outline":
      variantClass = "bg-transparent border-2 border-[var(--black-500)] text-[var(--black-500)] hover:bg-[var(--black-500)] hover:text-white active:bg-[var(--black-600)]";
      break;
    case "ghost":
      variantClass = "bg-transparent text-[var(--black-500)] hover:bg-[var(--neutral-100)] active:bg-[var(--neutral-200)]";
      break;
    case "danger":
      variantClass = "bg-[#EA4335] text-white hover:bg-[#D23F31] active:bg-[#B93025]";
      break;
    case "primary":
    default:
      variantClass = "bg-[var(--black-500)] text-white hover:bg-[var(--black-400)] active:bg-[var(--black-600)] disabled:bg-[var(--neutral-100)] disabled:text-[var(--black-200)]";
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