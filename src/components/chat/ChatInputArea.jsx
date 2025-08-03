import React, { useState, useRef } from "react";
import { Camera, Smile, Mic, Paperclip, X } from "lucide-react";
import Picker from "emoji-picker-react";

export default function ChatInputArea({
  input,
  setInput,
  sendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  selectedImageFiles,
  imagePreviews,
  handleFileChange,
  removeImagePreview,
  fileInputRef,
}) {
  // 녹음 상태
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) =>
        audioChunksRef.current.push(e.data);
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("녹음 시작 실패:", err);
      alert("녹음을 시작할 수 없습니다.");
    }
  };

  // 녹음 중지 및 처리
  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      await handleRecordedAudio(blob);
    };
    mediaRecorder.stop();
    setIsRecording(false);
  };

  // 녹음 완료 후 업로드 및 메시지 전송
  const handleRecordedAudio = async (blob) => {
    try {
      const file = new File([blob], "voice.webm", { type: blob.type });
      await sendMessage(input, selectedImageFiles, file);
    } catch (err) {
      console.error("오디오 처리 실패:", err);
      alert("음성 메시지 전송에 실패했습니다.");
    }
  };

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
            onClick={() => fileInputRef.current.click()}
          />
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
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          className={`ml-4 p-3 rounded-lg ${
            isRecording ? "bg-red-500" : "bg-green-500"
          }`}
        >
          <Mic className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
