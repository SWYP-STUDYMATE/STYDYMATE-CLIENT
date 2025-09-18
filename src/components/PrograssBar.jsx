import React, { useEffect, useRef, useState } from "react";

export default function ProgressBar({ total, value, className = "" }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  const prevPercent = total > 0 ? ((value - 1) / total) * 100 : 0;
  const [animPercent, setAnimPercent] = useState(percent);
  const [transition, setTransition] = useState("none");
  const barRef = useRef(null);

  useEffect(() => {
    if (value === 0 || total === 0) {
      setTransition("none");
      setAnimPercent(0);
      return;
    }
    // 1. 트랜지션 없이 prevPercent로 세팅
    setTransition("none");
    setAnimPercent(prevPercent);

    // 2. 다음 tick에 트랜지션 켜고 percent로 이동
    setTimeout(() => {
      setTransition("width 1s cubic-bezier(0.4,0,0.2,1)");
      setAnimPercent(percent);
    }, 20);
  }, [value, total]);

  return (
    <div
      className={`w-full max-w-[716px] h-[14px] bg-[var(--black-50)] overflow-hidden mx-auto relative ${className}`}
    >
      <div
        ref={barRef}
        className="h-full bg-[var(--green-500)] absolute left-0 top-0"
        style={{
          width: `${animPercent}%`,
          transition,
        }}
      />
    </div>
  );
}
