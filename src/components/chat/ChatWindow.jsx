// src/components/chat/ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import { fetchChatHistory, initStompClient } from "../../api/chat";
import EmptyPlaceholder from "./EmptyPlaceholder";
import { Phone, Video, Camera, Smile, Mic } from "lucide-react";

export default function ChatWindow({
  room,
  onBack,
  onNewMessage,
  currentUserId,
}) {
  if (!room) return null;

  // 현재 로그인한 사용자 정보
  const currentUser = room.participants.find((u) => u.id === currentUserId) || {
    name: "",
    profileImage: "",
  };
  // 상대방 정보
  const partner = room.participants.find((u) => u.id !== currentUserId) || {
    name: "",
    profileImage: "",
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef();
  const clientRef = useRef(null);

  useEffect(() => {
    fetchChatHistory(room.roomId).then((history) => {
      setMessages(history);
      scrollToBottom();
    });
    clientRef.current = initStompClient(room.roomId, (msg) => {
      setMessages((prev) => [...prev, msg]);
      onNewMessage({
        roomId: room.roomId,
        message: msg.message,
        sentAt: msg.sentAt,
      });
      scrollToBottom();
    });
    return () => clientRef.current.disconnect();
  }, [room.roomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, 50);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    clientRef.current.send(
      "/pub/chat/message",
      {},
      JSON.stringify({ roomId: room.roomId, message: input })
    );
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={currentUser.profileImage}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full"
          />
          <span className="ml-3 text-lg font-semibold">{currentUser.name}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              /* 전화 로직 */
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              /* 영상통화 로직 */
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Video className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mx-6 my-4" />

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <EmptyPlaceholder />
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.sender.id === currentUserId;
            const prevMsg = messages[idx - 1];
            const sameUser = prevMsg && prevMsg.sender.id === msg.sender.id;
            const showAvatar = !sameUser;
            const isLast = idx === messages.length - 1;

            return (
              <div
                key={msg.messageId}
                className={`flex items-end ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                {!isMine && showAvatar && (
                  <img
                    src={msg.sender.profileImage}
                    alt={msg.sender.name}
                    className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                  />
                )}
                <div
                  className={`flex flex-col max-w-[60%] ${
                    !isMine && sameUser ? "pl-10" : ""
                  } ${isMine && sameUser ? "pr-10" : ""}`}
                >
                  {showAvatar && !isMine && (
                    <p className="text-sm font-medium mb-1">
                      {msg.sender.name}
                    </p>
                  )}
                  <div className="flex items-end">
                    {isMine && isLast && (
                      <span className="mr-2 text-xs text-gray-400">
                        {formatTimestamp(msg.sentAt)}
                      </span>
                    )}
                    <p
                      className={`px-4 py-2 rounded-lg whitespace-pre-wrap ${
                        isMine
                          ? "bg-green-100 text-gray-900 self-end"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.message}
                    </p>
                    {!isMine && isLast && (
                      <span className="ml-2 text-xs text-gray-400">
                        {formatTimestamp(msg.sentAt)}
                      </span>
                    )}
                  </div>
                </div>
                {isMine && showAvatar && (
                  <img
                    src={msg.sender.profileImage}
                    alt={msg.sender.name}
                    className="w-8 h-8 rounded-full ml-2 flex-shrink-0"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 입력 영역 */}
      <div className="mt-4 flex items-center px-4">
        <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message"
            className="flex-1 bg-transparent outline-none"
          />
          <Smile className="w-5 h-5 text-gray-500 mr-2 cursor-pointer" />
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
