import React from "react";

/**
 * CommonChecklistItem (상위에서 상태 관리)
 * @param {string} label - 표시할 텍스트(예: '취업/진학')
 * @param {boolean} checked - 선택 여부 (상위에서 관리)
 * @param {function} onChange - 클릭/체크 시 호출 (상위에서 관리)
 * @param {boolean} disabled - 비활성화 여부
 * @param {string} type - 'checkbox' | 'radio' (기본: 'checkbox')
 */
export default function CommonChecklistItem({ label, checked, onChange, disabled = false, type = "checkbox" }) {
  return (
    <label
      className={`flex items-center w-full px-[16px] py-[14px] bg-white border rounded-[6px] cursor-pointer transition min-h-[56px]
        ${checked ? "border-green-500 shadow-sm" : "border-[#e5e5e5]"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-green-300"}
      `}
    >
      <span className="flex items-center mr-4">
        <span
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full border transition
            ${checked ? "border-green-500" : "border-[#e9ecef]"}
            bg-white
          `}
        >
          {/* 항상 원이 있고 색상만 바뀜 */}
          <span className={`inline-block w-2.5 h-2.5 rounded-full transition ${checked ? "bg-green-400" : "bg-[#e9ecef]"}`} />
        </span>
      </span>
      <input
        type={type}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />
      <span className="text-[16px] font-medium text-[#111111] leading-[24px] select-none">
        {label}
      </span>
    </label>
  );
} 