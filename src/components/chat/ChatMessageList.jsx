import React, { useRef, useEffect } from "react";
import EmptyPlaceholder from "./EmptyPlaceholder";
import VoiceMessage from "./VoiceMessage";

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
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto space-y-2 p-4"
    >
      {messages.length === 0 ? (
        <EmptyPlaceholder />
      ) : (
        messages.map((msg, idx) => {
          const isMine = String(msg.sender.userId) === String(currentUserId);
          const prevMsg = messages[idx - 1];
          const sameUser =
            prevMsg &&
            String(prevMsg.sender.userId) === String(msg.sender.userId);
          const showAvatar = !sameUser;
          const isLast = idx === messages.length - 1;

          return (
            <div
              key={msg.messageId}
              className={`flex items-end ${isMine ? "justify-end" : "justify-start"
                }`}
            >
              {/* 다른 사람의 메시지 (왼쪽) */}
              {!isMine && (
                <div className="flex flex-col w-full">
                  {/* 프로필 사진과 이름 영역 - 한 줄로 정렬 */}
                  {showAvatar && (
                    <div className="flex items-center mb-1">
                      <img
                        src={
                          msg.sender.profileImage ||
                          "/assets/basicProfilePic.png"
                        }
                        alt={msg.sender.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {msg.sender.name}
                      </span>
                    </div>
                  )}

                  {/* 메시지 영역 */}
                  <div className="flex items-end ml-10">
                    <div className="flex items-end">
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
                      ) : msg.messageType === "AUDIO" && msg.audioUrl ? (
                        <VoiceMessage
                          audioUrl={msg.audioUrl}
                          duration={msg.audioDuration}
                          isMine={false}
                        />
                      ) : (
                        <div className="bg-pink-200 text-gray-900 px-4 py-2 rounded-lg rounded-tl-none whitespace-pre-wrap">
                          {msg.message}
                        </div>
                      )}
                      <span className="ml-2 text-xs text-gray-400 mb-1">
                        {formatTimestamp(msg.sentAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 내 메시지 (오른쪽) */}
              {isMine && (
                <div className="flex items-end w-full justify-end">
                  {/* 메시지 영역 */}
                  <div className="flex flex-col max-w-[70%] items-end">
                    <div className="flex items-end">
                      <span className="mr-2 text-xs text-gray-400 mb-1">
                        {formatTimestamp(msg.sentAt)}
                      </span>
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
                      ) : msg.messageType === "AUDIO" && msg.audioUrl ? (
                        <VoiceMessage
                          audioUrl={msg.audioUrl}
                          duration={msg.audioDuration}
                          isMine={true}
                        />
                      ) : (
                        <div className="bg-[#00C471] text-white px-4 py-2 rounded-lg rounded-tr-none whitespace-pre-wrap">
                          {msg.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 프로필 사진 영역 - 항상 유지 */}
                  <div className="w-10 flex-shrink-0 ml-2">
                    {showAvatar && (
                      <img
                        src={
                          msg.sender.profileImage ||
                          "/assets/basicProfilePic.png"
                        }
                        alt={msg.sender.name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
