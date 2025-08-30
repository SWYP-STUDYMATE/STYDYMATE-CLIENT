import React, { useState, useRef } from "react";
import { Mic, Paperclip, X, Smile } from "lucide-react";
import Picker from "emoji-picker-react";
import VoiceRecorder from "./VoiceRecorder";

export default function ChatInputArea({
  input,
  setInput,
  sendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  selectedImageFiles,
  imagePreviews,
  handleFileChange,
  removeImagePreview,
  fileInputRef,
}) {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  // 이모지 클릭 핸들러 수정
  const handleEmojiSelect = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false); // 이모지 선택 후 피커 닫기
  };

  const handleVoiceSend = (audioData) => {
    sendMessage("", [], audioData);
    setShowVoiceRecorder(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, selectedImageFiles, null);
      setInput("");
    }
  };



  return (
    <div className="mt-4 flex flex-col px-4">
      {/* 이모지 피커를 입력창 위에 표시 */}
      {showEmojiPicker && (
        <div className="mb-2">
          <Picker onEmojiClick={handleEmojiSelect} />
        </div>
      )}

      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-lg bg-gray-50">
          {imagePreviews.map((src, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 rounded-lg overflow-hidden"
            >
              <img
                src={src}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImagePreview(idx)}
                className="absolute top-0.5 right-0.5 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-1 transition-all"
                aria-label={`이미지 미리보기 ${idx + 1} 삭제`}
                type="button"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center">
        <div className="relative flex-1 flex items-center bg-gray-100 rounded-lg px-4 py-2">
          <button
            onClick={() => fileInputRef.current.click()}
            className="mr-2 p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 transition-colors"
            aria-label="이미지 첨부"
            type="button"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message"
            className="flex-1 bg-transparent outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 rounded px-2 py-1"
            aria-label="메시지 입력"
          />
          <button
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="ml-2 p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 transition-colors"
            aria-label={showEmojiPicker ? "이모지 피커 닫기" : "이모지 피커 열기"}
            type="button"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <button
          onClick={() => setShowVoiceRecorder(true)}
          className="ml-4 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2"
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
