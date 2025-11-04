import React, { useState } from "react";
import { Mic, Paperclip, X, Send } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";

export default function ChatInputArea({
  input,
  setInput,
  sendMessage,
  selectedImageFiles,
  imagePreviews,
  handleFileChange,
  removeImagePreview,
  fileInputRef,
  onTypingStart,
  onTypingStop,
}) {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isComposing, setIsComposing] = useState(false); // 한글 입력 조합 상태

  const handleVoiceSend = (audioData) => {
    sendMessage("", [], audioData);
    setShowVoiceRecorder(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // 타이핑 상태 전송 (빈 문자열이 아닐 때)
    if (value.trim().length > 0 && onTypingStart) {
      onTypingStart();
    } else if (value.trim().length === 0 && onTypingStop) {
      onTypingStop();
    }
  };

  // 한글 입력 조합 시작
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // 한글 입력 조합 종료
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = (e) => {
    // 한글 조합 중일 때는 Enter 키로 메시지 전송하지 않음
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    // 메시지가 비어있고 이미지도 없으면 전송하지 않음
    if (!input.trim() && selectedImageFiles.length === 0) {
      return;
    }
    
    sendMessage(input, selectedImageFiles, null);
    setInput("");
    // 메시지 전송 시 타이핑 상태 중단
    if (onTypingStop) {
      onTypingStop();
    }
  };

  const canSend = input.trim().length > 0 || selectedImageFiles.length > 0;

  return (
    <div className="mt-4 flex flex-col px-4 pb-4">
      {/* 이미지 미리보기 */}
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 border border-[#E7E7E7] rounded-lg bg-[#FAFAFA]">
          {imagePreviews.map((src, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E7E7E7]"
            >
              <img
                src={src}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImagePreview(idx)}
                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80 focus:outline-none transition-all"
                aria-label={`이미지 미리보기 ${idx + 1} 삭제`}
                type="button"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 입력 영역 */}
      <div className="flex items-end gap-2">
        {/* 이미지 첨부 버튼 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2.5 rounded-lg bg-white border border-[#E7E7E7] hover:bg-[#F1F3F5] focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-1 transition-colors"
          aria-label="이미지 첨부"
          type="button"
        >
          <Paperclip className="w-5 h-5 text-[#666666]" />
        </button>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />

        {/* 입력창 */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="메시지를 입력하세요..."
            className="w-full px-4 py-3 bg-white border border-[#E7E7E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:border-transparent transition-all text-[14px] text-[#111111] placeholder:text-[#929292]"
            aria-label="메시지 입력"
          />
        </div>

        {/* 전송 버튼 */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 p-2.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-1 ${
            canSend
              ? "bg-[#00C471] hover:bg-[#00B064] text-white cursor-pointer"
              : "bg-[#E7E7E7] text-[#929292] cursor-not-allowed"
          }`}
          aria-label="메시지 전송"
          type="button"
        >
          <Send className="w-5 h-5" />
        </button>

        {/* 음성 녹음 버튼 */}
        <button
          onClick={() => setShowVoiceRecorder(true)}
          className="flex-shrink-0 p-2.5 rounded-lg bg-[#4A90E2] hover:bg-[#357ABD] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:ring-offset-1"
          aria-label="음성 메시지 녹음"
          type="button"
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onSend={handleVoiceSend}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}
    </div>
  );
}
