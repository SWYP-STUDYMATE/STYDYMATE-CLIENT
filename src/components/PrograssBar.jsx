import React from "react";

export default function ProgressBar({ total, value, className = "" }) {
  const percent = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className={`w-[716px] h-[14px] bg-[#E7E7E7] overflow-hidden mx-auto ${className}`}>
      <div
        className="h-full bg-[#00C471] transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
