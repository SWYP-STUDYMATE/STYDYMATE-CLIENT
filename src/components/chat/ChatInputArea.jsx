import React, { useState, useRef } from "react";
import { Mic, Pause, Paperclip, X, Smile } from "lucide-react";
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeTypes = [
        'audio/webm; codecs=opus',
        'audio/ogg; codecs=opus',
        'audio/webm',
        'audio/mp4',
      ];
      const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

      if (!supportedType) {
        alert("브라우저가 음성 녹음을 지원하지 않습니다.");
        return;
      }

      const recorder = new MediaRecorder(stream, { mimeType: supportedType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        clearInterval(timerRef.current);
        setIsRecording(false);

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        console.log(
          "녹음 중지됨. Blob 생성됨. 크기:",
          blob.size,
          "타입:",
          blob.type
        );

        if (blob.size === 0) {
          alert("녹음된 오디오가 없습니다. 최소 1초 이상 녹음해주세요.");
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          sendMessage(input, selectedImageFiles, reader.result);
          setInput("");
          stream.getTracks().forEach((t) => t.stop());
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("녹음 시작 실패:", err);
      alert("녹음을 시작할 수 없습니다.");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, selectedImageFiles, null);
      setInput("");
    }
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  return (
    <div className="mt-4 flex flex-col px-4">
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
                className="absolute top-0.5 right-0.5 bg-black bg-opacity-50 text-white rounded-full p-0.5"
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
            onKeyDown={handleKeyDown}
            placeholder="Type your message"
            className="flex-1 bg-transparent outline-none"
          />
          <button
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="ml-2"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </button>
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="ml-4 p-3 rounded-lg bg-blue-500 text-white"
        >
          {isRecording ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      </div>
      {isRecording && (
        <div className="text-red-500 font-semibold mt-2">
          녹음 중... {formatTime(recordingTime)}
        </div>
      )}
    </div>
  );
}
