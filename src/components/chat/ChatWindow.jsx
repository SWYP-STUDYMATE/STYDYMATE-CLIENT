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
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected', 'reconnecting'
  const [failedMessages, setFailedMessages] = useState([]); // 전송 실패한 메시지 목록
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
        console.log('[ChatWindow] 📍 채팅방 초기화 시작', {
          roomId: room.roomId,
          roomName: room.roomName,
          timestamp: new Date().toISOString()
        });

        // 채팅 히스토리 로드
        console.log('[ChatWindow] 📥 채팅 히스토리 로드 시작...');
        const history = await fetchChatHistory(room.roomId);
        console.log('[ChatWindow] ✅ 채팅 히스토리 로드 완료', {
          messageCount: history.length,
          roomId: room.roomId
        });
        setMessages(history);

        // WebSocket 클라이언트 초기화
        console.log('[ChatWindow] 🔌 WebSocket 클라이언트 초기화 시작', {
          roomId: room.roomId,
          currentTime: new Date().toISOString()
        });
        setConnectionStatus('connecting');

        clientRef.current = await initStompClient(
          room.roomId,
          (msg) => {
            console.log('[ChatWindow] 📨 새 메시지 수신', {
              messageId: msg.messageId,
              senderId: msg.senderId,
              roomId: room.roomId
            });
            setMessages((prev) => [...prev, msg]);
            onNewMessage({
              roomId: room.roomId,
              message: msg.message,
              sentAt: msg.sentAt,
            });
          },
          (status, data) => {
            console.log(`[ChatWindow] 🔄 채팅방 ${room.roomId} WebSocket 상태 변경:`, {
              status,
              data,
              timestamp: new Date().toISOString()
            });
            if (status === 'connected') {
              setConnectionStatus('connected');
              console.log('[ChatWindow] ✅ WebSocket 연결 완료');
            } else if (status === 'disconnected') {
              setConnectionStatus('disconnected');
              showError('채팅 연결이 끊어졌습니다. 재연결 중...');
            } else if (status === 'reconnecting') {
              setConnectionStatus('reconnecting');
            }
          },
          (type, error) => {
            console.error(`[ChatWindow] ❌ 채팅방 ${room.roomId} WebSocket 에러:`, {
              type,
              error,
              errorMessage: error?.message,
              timestamp: new Date().toISOString()
            });
            setConnectionStatus('disconnected');

            // 에러 타입에 따른 메시지 표시
            let errorMessage = '채팅 연결에 문제가 발생했습니다.';
            if (type === 'connection_timeout') {
              errorMessage = '채팅 서버 연결 시간이 초과되었습니다. 재시도 중...';
            } else if (type === 'connection_failed') {
              errorMessage = '채팅 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
            } else if (type === 'max_reconnect_failed') {
              errorMessage = '채팅 서버 재연결에 실패했습니다. 페이지를 새로고침해주세요.';
            }
            showError(errorMessage);
          }
        );

        setConnectionStatus('connected');
        console.log('[ChatWindow] ✅ WebSocket 클라이언트 초기화 완료', {
          roomId: room.roomId,
          clientExists: !!clientRef.current,
          isConnected: clientRef.current?.isConnected()
        });

        // 타이핑 상태 구독
        console.log('[ChatWindow] 👤 타이핑 상태 구독 시작...');
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
          console.log('[ChatWindow] 📖 메시지 읽음 처리 시작...');
          await markMessagesAsRead(room.roomId);
          console.log('[ChatWindow] ✅ 메시지 읽음 처리 완료');
        } catch (error) {
          console.error('[ChatWindow] ❌ 메시지 읽음 처리 실패:', error);
        }

        console.log('[ChatWindow] 🎉 채팅방 초기화 전체 완료', {
          roomId: room.roomId,
          messageCount: messages.length,
          isConnected: clientRef.current?.isConnected()
        });
      } catch (error) {
        console.error('[ChatWindow] ❌ 채팅방 초기화 실패:', {
          error,
          errorMessage: error?.message,
          errorStack: error?.stack,
          roomId: room.roomId,
          timestamp: new Date().toISOString()
        });
        setConnectionStatus('disconnected');
        showError('채팅방 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
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
      // 연결 상태 확인
      if (connectionStatus !== 'connected') {
        throw new Error('WebSocket이 연결되지 않았습니다');
      }

      clientRef.current.send(
        "/pub/chat/message",
        {},
        JSON.stringify(messagePayload)
      );
      console.log('[ChatWindow] 메시지 전송 완료');

      // 입력 필드 초기화
      setInput("");
      setSelectedImageFiles([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('[ChatWindow] 메시지 전송 실패', error);

      // 실패한 메시지를 목록에 추가
      const failedMessage = {
        id: Date.now(),
        payload: messagePayload,
        text: text.trim(),
        images,
        audioData,
        error: error.message,
      };
      setFailedMessages(prev => [...prev, failedMessage]);

      showError(
        "메시지 전송에 실패했습니다. 네트워크 연결을 확인하고 재시도 버튼을 눌러주세요.",
        { duration: 5000 }
      );
    }
  };

  // 실패한 메시지 재전송
  const retryFailedMessage = async (failedMessageId) => {
    const failedMessage = failedMessages.find(m => m.id === failedMessageId);
    if (!failedMessage) return;

    // 실패 목록에서 제거
    setFailedMessages(prev => prev.filter(m => m.id !== failedMessageId));

    // 재전송 시도
    await sendMessage(failedMessage.text, failedMessage.images, failedMessage.audioData);
  };

  // 모든 실패한 메시지 재전송
  const retryAllFailedMessages = async () => {
    const messages = [...failedMessages];
    setFailedMessages([]);

    for (const failedMessage of messages) {
      await sendMessage(failedMessage.text, failedMessage.images, failedMessage.audioData);
      // 메시지 간 약간의 딜레이
      await new Promise(resolve => setTimeout(resolve, 100));
    }
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
    <div className="bg-white md:rounded-xl md:shadow-lg p-4 md:p-8 flex flex-col h-full w-full relative">
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

      {/* 연결 상태 표시 */}
      {connectionStatus !== 'connected' && (
        <div className={`mx-3 md:mx-6 mt-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
          connectionStatus === 'connecting' ? 'bg-blue-50 text-blue-700' :
          connectionStatus === 'reconnecting' ? 'bg-yellow-50 text-yellow-700' :
          'bg-red-50 text-red-700'
        }`}>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          <span>
            {connectionStatus === 'connecting' && '채팅방에 연결 중...'}
            {connectionStatus === 'reconnecting' && '재연결 시도 중...'}
            {connectionStatus === 'disconnected' && '채팅 연결이 끊어졌습니다'}
          </span>
        </div>
      )}

      {/* 실패한 메시지 재시도 */}
      {failedMessages.length > 0 && (
        <div className="mx-3 md:mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">
                {failedMessages.length}개의 메시지 전송 실패
              </span>
            </div>
            <button
              onClick={retryAllFailedMessages}
              className="px-3 py-1 bg-[#EA4335] text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              모두 재시도
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-[#E7E7E7] mx-3 md:mx-6 my-4" />

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
