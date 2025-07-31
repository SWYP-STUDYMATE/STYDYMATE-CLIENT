// src/components/chat/ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import { fetchChatHistory, initStompClient } from "../../api/chat";
import EmptyPlaceholder from "./EmptyPlaceholder";
import { Phone, Video } from "lucide-react";

export default function ChatWindow({
  room,
  onBack,
  onNewMessage,
  currentUserId,
}) {
  if (!room) return null;

  const partner = room.participants?.find((u) => u.id !== currentUserId) || {
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
    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col h-[600px] w-full">
      <header className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <img
            src={partner.profileImage}
            alt={partner.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-lg font-semibold ml-2">{partner.name}</span>
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
      </header>
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
      <div className="mt-4 flex-shrink-0 flex items-center space-x-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border rounded-lg px-3 py-2 resize-none focus:outline-none"
          placeholder="메시지를 입력하세요"
          rows={1}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          전송
        </button>
      </div>
    </div>
  );
}
