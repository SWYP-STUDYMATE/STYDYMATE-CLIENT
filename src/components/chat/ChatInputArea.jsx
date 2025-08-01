import React from "react";
import { Camera, Smile, Mic, Paperclip, X } from "lucide-react";
import Picker from "emoji-picker-react";

export default function ChatInputArea({
  input,
  setInput,
  sendMessage,
  handleKeyDown,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  selectedImageFiles,
  imagePreviews,
  handleFileChange,
  removeImagePreview,
  fileInputRef,
}) {
  return (
    <div className="mt-4 flex flex-col px-4">
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-lg bg-gray-50">
          {imagePreviews.map((src, index) => (
            <div
              key={index}
              className="relative w-20 h-20 rounded-lg overflow-hidden"
            >
              <img
                src={src}
                alt="미리보기"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImagePreview(index)}
                className="absolute top-0.5 right-0.5 bg-black bg-opacity-50 text-white rounded-full p-0.5 flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center">
        <div className="relative flex-1 flex items-center bg-gray-100 rounded-lg px-4 py-2">
          <Paperclip
            className="w-5 h-5 text-gray-500 mr-2 cursor-pointer"
            onClick={() => fileInputRef.current.click()} // 클립 아이콘 클릭 시 파일 입력 트리거
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden" // 숨겨진 파일 입력 요소
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message"
            className="flex-1 bg-transparent outline-none"
          />
          <div className="relative ml-2">
            <Smile
              className="w-5 h-5 text-gray-500 cursor-pointer"
              onClick={() => setShowEmojiPicker((v) => !v)}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 right-0 z-50">
                <Picker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            /* 음성 메시지 로직 */
          }}
          className="ml-4 p-3 bg-green-500 rounded-lg"
        >
          <Mic className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
