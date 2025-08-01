import React, { useRef, useEffect } from "react";
import EmptyPlaceholder from "./EmptyPlaceholder";

export default function ChatMessageList({
  messages,
  currentUserId,
  formatTimestamp,
}) {
  const scrollRef = useRef();

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
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
                  {msg.messageType === "IMAGE" &&
                  msg.imageUrls &&
                  msg.imageUrls.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {msg.imageUrls.map((url, imgIdx) => (
                        <img
                            key={imgIdx}
                            src={url}
                            alt="채팅 이미지"
                            className="max-w-xs max-h-xs h-auto rounded-lg object-contain"
                          />
                      ))}
                    </div>
                  ) : (
                    <p
                      className={`px-4 py-2 rounded-lg whitespace-pre-wrap ${
                        isMine
                          ? "bg-green-100 text-gray-900 self-end"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.message}
                    </p>
                  )}
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
  );
}
