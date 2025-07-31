import React from 'react';

export default function EmptyPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-xl shadow-lg p-8">
      <img
        src="/assets/nochattinghistory.png"
        alt="No messages"
        className="w-110 h-110 object-contain mb-4"
      />
      <p className="text-lg font-medium text-gray-500">대화 내역이 없습니다.</p>
      <p className="mt-2 text-sm text-gray-400">새로운 대화를 시작해보세요!</p>
    </div>
  );
}
