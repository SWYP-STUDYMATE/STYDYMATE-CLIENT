import React, { useEffect, useState, useRef } from "react";
import {
  fetchChatHistory,
  initStompClient,
  uploadChatImages,
  uploadChatAudio,
} from "../../api/chat";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInputArea from "./ChatInputArea";

export default function ChatWindow({
  room,
  onBack,
  onNewMessage,
  currentUserId,
}) {
  if (!room) return null;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const clientRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchChatHistory(room.roomId).then((history) => {
      setMessages(history);
    });
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

  const handleEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const sendMessage = async (text, images, audio) => {
    let finalImageUrls = [];
    let finalAudioUrl = null;
    let finalMessageType = "TEXT";
    let messageContent = text ? text.trim() : "";

    if (images && images.length > 0) {
      try {
        finalImageUrls = await uploadChatImages(room.roomId, images);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다.");
        return;
      }
    }

    if (audio) {
      try {
        finalAudioUrl = await uploadChatAudio(room.roomId, audio);
      } catch (error) {
        console.error("오디오 업로드 실패:", error);
        alert("오디오 업로드에 실패했습니다.");
        return;
      }
    }

    if (messageContent) {
      if (finalImageUrls.length > 0 || finalAudioUrl) {
        finalMessageType = "MIXED";
      } else {
        finalMessageType = "TEXT";
      }
    } else {
      if (finalImageUrls.length > 0) {
        finalMessageType = "IMAGE";
      } else if (finalAudioUrl) {
        finalMessageType = "AUDIO";
      }
    }

    if (!messageContent && finalImageUrls.length === 0 && !finalAudioUrl)
      return;

    clientRef.current.send(
      "/pub/chat/message",
      {},
      JSON.stringify({
        roomId: room.roomId,
        message: messageContent,
        imageUrls: finalImageUrls,
        audioUrl: finalAudioUrl,
        messageType: finalMessageType,
      })
    );
    setInput("");
    setImagePreviews([]);
    setSelectedImageFiles([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImageFiles(files);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);

    // 파일 입력 필드 초기화 (동일 파일 재선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImagePreview = (indexToRemove) => {
    setSelectedImageFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const formatTimestamp = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() < 12 ? "am" : "pm";
    const timeStr = `${hours}:${minutes}${ampm}`;
    return isToday ? `Today ${timeStr}` : timeStr;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col h-full w-full">
      <ChatHeader room={room} currentUserId={currentUserId} />

      <div className="border-b border-gray-200 mx-6 my-4" />

      <ChatMessageList
        messages={messages}
        currentUserId={currentUserId}
        formatTimestamp={formatTimestamp}
      />

      <ChatInputArea
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        handleKeyDown={handleKeyDown}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        handleEmojiClick={handleEmojiClick}
        selectedImageFiles={selectedImageFiles}
        imagePreviews={imagePreviews}
        handleFileChange={handleFileChange}
        removeImagePreview={removeImagePreview}
        fileInputRef={fileInputRef}
      />
    </div>
  );
}
