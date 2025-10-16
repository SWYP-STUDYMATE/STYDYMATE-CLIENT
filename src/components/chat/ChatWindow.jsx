import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  fetchChatHistory,
  initStompClient,
  uploadChatImages,
  leaveChatRoom,
  sendTypingStatus,
  subscribeToTyping,
  unsubscribeFromTyping,
  markMessagesAsRead,
} from "../../api/chat";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInputArea from "./ChatInputArea";
import TypingIndicator from "./TypingIndicator";
import MessageSearch from "./MessageSearch";
import { useAlert } from "../../hooks/useAlert";

export default function ChatWindow({
  room,
  onNewMessage,
  currentUserId,
  onLeaveRoom,
}) {
  // Guard early return without affecting hooks order
  const isRoomMissing = !room;
  const { showError } = useAlert();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const clientRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingSubscriptionRef = useRef(null);
  const isTypingSentRef = useRef(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (isRoomMissing) return undefined;

    const initializeChatRoom = async () => {
      try {
        console.log('[ChatWindow] 채팅방 초기화 시작', room.roomId);

        // 채팅 히스토리 로드
        const history = await fetchChatHistory(room.roomId);
        console.log('[ChatWindow] 채팅 히스토리 로드 완료', history.length);
        setMessages(history);

        // WebSocket 클라이언트 초기화
        console.log('[ChatWindow] WebSocket 클라이언트 초기화 시작');
        clientRef.current = await initStompClient(
          room.roomId,
          (msg) => {
            console.log('[ChatWindow] 새 메시지 수신', msg);
            setMessages((prev) => [...prev, msg]);
            onNewMessage({
              roomId: room.roomId,
              message: msg.message,
              sentAt: msg.sentAt,
            });
          },
          (status, data) => {
            console.log(`[ChatWindow] 채팅방 ${room.roomId} WebSocket 상태:`, status, data);
          },
          (type, error) => {
            console.error(`[ChatWindow] 채팅방 ${room.roomId} WebSocket 에러:`, type, error);
          }
        );
        console.log('[ChatWindow] WebSocket 클라이언트 초기화 완료', clientRef.current);

        // 타이핑 상태 구독
        typingSubscriptionRef.current = subscribeToTyping(room.roomId, (typingData) => {
          const { userId, userName, userProfileImage, isTyping } = typingData;
          
          // 본인의 타이핑 상태는 무시
          if (String(userId) === String(currentUserId)) {
            return;
          }
          
          setTypingUsers((prev) => {
            if (isTyping) {
              // 이미 있는 사용자인지 확인
              const exists = prev.find(user => String(user.userId) === String(userId));
              if (!exists) {
                return [...prev, {
                  userId,
                  name: userName,
                  profileImage: userProfileImage
                }];
              }
              return prev;
            } else {
              // 타이핑 중단 시 목록에서 제거
              return prev.filter(user => String(user.userId) !== String(userId));
            }
          });
        });

        // 채팅방 입장 시 메시지를 읽음 처리
        try {
          await markMessagesAsRead(room.roomId);
        } catch (error) {
          console.error("메시지 읽음 처리 실패:", error);
        }
      } catch (error) {
        console.error("채팅방 초기화 실패:", error);
      }
    };

    initializeChatRoom();

    return () => {
      if (clientRef.current?.disconnect) {
        clientRef.current.disconnect();
      }
      if (typingSubscriptionRef.current) {
        unsubscribeFromTyping(typingSubscriptionRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // 타이핑 상태 초기화
      setTypingUsers([]);
      isTypingSentRef.current = false;
    };
  }, [currentUserId, isRoomMissing, onNewMessage, room?.roomId]);

  // 타이핑 상태 관리 함수
  const handleTypingStart = useCallback(() => {
    if (!isTypingSentRef.current) {
      sendTypingStatus(room.roomId, true);
      isTypingSentRef.current = true;
    }

    // 기존 타임아웃 클리어
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 3초 후 타이핑 중단 신호 전송
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(room.roomId, false);
      isTypingSentRef.current = false;
    }, 3000);
  }, [room.roomId]);

  const handleTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (isTypingSentRef.current) {
      sendTypingStatus(room.roomId, false);
      isTypingSentRef.current = false;
    }
  }, [room.roomId]);

  // 메시지 하이라이트 및 스크롤 이동
  const handleHighlightMessage = useCallback((message) => {
    setHighlightedMessageId(message.messageId);
    
    // 3초 후 하이라이트 해제
    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 3000);

    // 해당 메시지로 스크롤
    setTimeout(() => {
      const messageElement = document.querySelector(`[data-message-id="${message.messageId}"]`);
      if (messageElement && messagesContainerRef.current) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F 또는 Cmd+F로 검색창 열기
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // ESC로 검색창 닫기
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setHighlightedMessageId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleLeaveRoom = async () => {
    try {
      await leaveChatRoom(room.roomId);
      if (onLeaveRoom) {
        onLeaveRoom();
      }
    } catch (error) {
      console.error("채팅방 나가기 실패:", error);
      showError("채팅방 나가기에 실패했습니다.");
    }
  };

  const sendMessage = async (text, images, audioData) => {
    console.log('[ChatWindow] sendMessage 호출됨', { text, images, audioData });

    // 타이핑 상태 중단
    handleTypingStop();

    // WebSocket 연결 확인
    if (!clientRef.current) {
      console.error('[ChatWindow] WebSocket 클라이언트가 없습니다');
      showError("채팅 연결이 끊어졌습니다. 페이지를 새로고침해주세요.");
      return;
    }

    // 메시지가 비어있는지 확인
    if (!text.trim() && !images.length && !audioData) {
      console.warn('[ChatWindow] 빈 메시지 전송 시도');
      return;
    }

    let finalImageUrls = [];
    if (images.length) {
      try {
        console.log('[ChatWindow] 이미지 업로드 시작', images.length);
        finalImageUrls = await uploadChatImages(room.roomId, images);
        console.log('[ChatWindow] 이미지 업로드 완료', finalImageUrls);
      } catch (error) {
        console.error('[ChatWindow] 이미지 업로드 실패', error);
        showError("이미지 업로드 실패");
        return;
      }
    }

    const messagePayload = {
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
    };

    console.log('[ChatWindow] WebSocket으로 메시지 전송', messagePayload);

    try {
      clientRef.current.send(
        "/pub/chat/message",
        {},
        JSON.stringify(messagePayload)
      );
      console.log('[ChatWindow] 메시지 전송 완료');
    } catch (error) {
      console.error('[ChatWindow] 메시지 전송 실패', error);
      showError("메시지 전송에 실패했습니다.");
      return;
    }

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

  if (isRoomMissing) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col h-full w-full relative">
      {/* 메시지 검색 */}
      <MessageSearch
        roomId={room.roomId}
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setHighlightedMessageId(null);
        }}
        messages={messages}
        onHighlightMessage={handleHighlightMessage}
      />
      
      <ChatHeader
        room={room}
        currentUserId={currentUserId}
        onLeaveRoom={handleLeaveRoom}
        onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
      />

      <div className="border-b border-gray-200 mx-6 my-4" />

      <div className="flex-1 min-h-0 flex flex-col">
        <ChatMessageList
          messages={messages}
          currentUserId={currentUserId}
          highlightedMessageId={highlightedMessageId}
          containerRef={messagesContainerRef}
          formatTimestamp={(dateStr) => {
            const date = new Date(dateStr);
            const now = new Date();
            const diffInHours = (now - date) / (1000 * 60 * 60);

            if (diffInHours < 24) {
              return date.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
            } else {
              return date.toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
            }
          }}
        />
        
        {/* 타이핑 인디케이터 */}
        <TypingIndicator typingUsers={typingUsers} />
      </div>

      <ChatInputArea
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        selectedImageFiles={selectedImageFiles}
        imagePreviews={imagePreviews}
        handleFileChange={handleFileChange}
        removeImagePreview={removeImagePreview}
        fileInputRef={fileInputRef}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
      />
    </div>
  );
}
