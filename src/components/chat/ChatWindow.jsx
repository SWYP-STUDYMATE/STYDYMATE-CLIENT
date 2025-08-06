import React, { useEffect, useState, useRef } from "react";
import {
  fetchChatHistory,
  initStompClient,
  uploadChatImages,
} from "../../api/chat";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInputArea from "./ChatInputArea";

export default function ChatWindow({ room, onNewMessage, currentUserId }) {
  if (!room) return null;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const clientRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchChatHistory(room.roomId).then(setMessages);
    clientRef.current = initStompClient(room.roomId, (msg) => {
      setMessages((prev) => [...prev, msg]);
      onNewMessage({
        roomId: room.roomId,
        message: msg.message,
        sentAt: msg.sentAt,
      });
    });
    return () => clientRef.current.disconnect();
  }, [room.roomId]);

  const sendMessage = async (text, images, audioData) => {
    let finalImageUrls = [];
    if (images.length) {
      try {
        finalImageUrls = await uploadChatImages(room.roomId, images);
      } catch {
        alert("이미지 업로드 실패");
        return;
      }
    }

    clientRef.current.send(
      "/pub/chat/message",
      {},
      JSON.stringify({
        roomId: room.roomId,
        message: text.trim(),
        imageUrls: finalImageUrls,
        audioData: audioData, // Base64 Data URL
        messageType: audioData
          ? "AUDIO"
          : finalImageUrls.length
          ? "IMAGE"
          : text.trim()
          ? "TEXT"
          : "TEXT",
      })
    );

    setInput("");
    setSelectedImageFiles([]);
    setImagePreviews([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, selectedImageFiles, null);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removeImagePreview = (idx) => {
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col h-full w-full">
      <ChatHeader room={room} currentUserId={currentUserId} />

      <div className="border-b border-gray-200 mx-6 my-4" />

      <ChatMessageList
        messages={messages}
        currentUserId={currentUserId}
        formatTimestamp={(dateStr) => {
          /* ... */
        }}
      />

      <ChatInputArea
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        handleEmojiClick={(e, emoji) => setInput((t) => t + emoji.emoji)}
        selectedImageFiles={selectedImageFiles}
        imagePreviews={imagePreviews}
        handleFileChange={handleFileChange}
        removeImagePreview={removeImagePreview}
        fileInputRef={fileInputRef}
        handleKeyDown={handleKeyDown}
      />
    </div>
  );
}
