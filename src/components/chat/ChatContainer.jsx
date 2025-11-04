import React, { useState, useEffect, useCallback } from "react";
import { fetchChatRooms, initGlobalStompClient } from "../../api/chat";
import ChatRoomList from "./ChatRoomList";
import EmptyPlaceholder from "./EmptyPlaceholder";
import ChatWindow from "./ChatWindow";
import { useAlert } from "../../hooks/useAlert";

export default function ChatContainer() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // useAlert 훅 사용 (AlertProvider는 App.jsx에서 제공됨)
  const { showError } = useAlert();

  // 현재 사용자 ID 가져오기
  const currentUserId = localStorage.getItem("userId");

  const reloadChatRooms = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      console.log('[ChatContainer] 채팅방 목록 로드 시작...');
      const roomsData = await fetchChatRooms();
      
      if (!Array.isArray(roomsData)) {
        console.warn('[ChatContainer] 예상과 다른 데이터 형식:', roomsData);
        setRooms([]);
      } else {
        setRooms(roomsData);
        console.log('[ChatContainer] 채팅방 목록 새로고침 완료:', roomsData.length, "개");
      }
    } catch (error) {
      console.error('[ChatContainer] 채팅방 목록 새로고침 실패:', error);
      setHasError(true);
      
      // 에러 메시지 추출
      let errorMessage = '채팅방 목록을 불러오는데 실패했습니다.';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        console.error('[ChatContainer] 에러 응답 데이터:', errorData);
        
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // 특정 에러 코드에 따른 메시지 커스터마이징
        const errorCode = errorData.error?.code || errorData.code;
        if (errorCode === 'UNAUTHORIZED' || error.response?.status === 401) {
          errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
        } else if (errorCode === 'FORBIDDEN' || error.response?.status === 403) {
          errorMessage = '채팅방 목록을 조회할 권한이 없습니다.';
        }
      } else if (error?.message) {
        console.error('[ChatContainer] 에러 메시지:', error.message);
        if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          errorMessage = '네트워크 연결을 확인해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      try {
        showError(errorMessage);
      } catch (alertError) {
        console.error('[ChatContainer] showError 호출 실패:', alertError);
      }
      
      // 에러가 발생해도 빈 배열로 설정하여 페이지가 계속 동작하도록 함
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    reloadChatRooms();

    // 글로벌 WebSocket 클라이언트 초기화
    let globalClient = null;
    
    const initializeGlobalClient = async () => {
      try {
        globalClient = await initGlobalStompClient(
          (newRoom) => {
            console.log("새 방 알림 수신:", newRoom);
            console.log("현재 사용자 ID:", currentUserId);
            console.log("새로 생성된 방의 참여자들:", newRoom.participants);

            // 새로운 채팅방이 생성되었을 때 즉시 목록 새로고침
            reloadChatRooms();

            // 현재 선택된 방이 있다면 초기화 (새로운 방이 생성되었으므로)
            setCurrentRoom(null);
          },
          (status, data) => {
            console.log("WebSocket 연결 상태:", status, data);
          },
          (type, error) => {
            console.error("WebSocket 에러:", type, error);
            
            // 에러 타입에 따른 메시지 표시
            let errorMessage = '채팅 서버 연결에 문제가 발생했습니다.';
            if (type === 'connection_timeout') {
              errorMessage = '채팅 서버 연결 시간이 초과되었습니다.';
            } else if (type === 'connection_failed') {
              errorMessage = '채팅 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
            } else if (type === 'max_reconnect_failed') {
              errorMessage = '채팅 서버 재연결에 실패했습니다. 페이지를 새로고침해주세요.';
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            showError(errorMessage);
          }
        );
      } catch (error) {
        console.error("글로벌 클라이언트 초기화 실패:", error);
        
        // 에러 메시지 추출
        let errorMessage = '채팅 서버 연결 초기화에 실패했습니다.';
        if (error?.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        showError(errorMessage);
      }
    };

    initializeGlobalClient();

    return () => {
      if (globalClient) {
        globalClient.disconnect();
      }
    };
  }, [reloadChatRooms, showError, currentUserId]);

  const handleNewMessage = ({ roomId, message, sentAt }) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.roomId === roomId
          ? { ...r, lastMessage: message, lastMessageAt: sentAt }
          : r
      )
    );
  };

  const handleNewRoomCreated = () => {
    // 채팅방 생성 후 즉시 목록 새로고침
    reloadChatRooms();
  };

  const handleLeaveRoom = () => {
    // 채팅방 나가기 후 목록 새로고침 및 현재 방 초기화
    setCurrentRoom(null);
    reloadChatRooms();
  };

  // 에러 발생 시 표시할 UI
  if (hasError && rooms.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#FAFAFA]">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-[#FFF4F4] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#EA4335]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-[18px] font-bold text-[#111111] mb-2">
            채팅방 목록을 불러올 수 없습니다
          </h2>
          <p className="text-[14px] text-[#666666] mb-6">
            네트워크 연결을 확인하거나 페이지를 새로고침해주세요.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              reloadChatRooms();
            }}
            className="px-6 py-2 bg-[#00C471] text-white rounded-lg hover:bg-[#00B064] transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#FAFAFA]">
      {/* 채팅방 목록 - 모바일: currentRoom 없을 때만, 데스크톱: 항상 표시 */}
      <div className={`
        ${currentRoom ? 'hidden md:flex' : 'flex'}
        w-full md:w-80 flex-shrink-0 bg-white md:border-r border-[#E7E7E7]
      `}>
        {isLoading && rooms.length === 0 ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C471] mx-auto mb-4"></div>
              <p className="text-[14px] text-[#666666]">채팅방 목록을 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <ChatRoomList
            rooms={rooms}
            onSelectRoom={setCurrentRoom}
            onNewRoomCreated={handleNewRoomCreated}
            onJoinRoom={() => {
              reloadChatRooms();
            }}
          />
        )}
      </div>

      {/* 채팅 창 - 모바일: currentRoom 있을 때만, 데스크톱: 항상 표시 */}
      <div className={`
        ${currentRoom ? 'flex' : 'hidden md:flex'}
        flex-1 w-full
      `}>
        {currentRoom ? (
          <ChatWindow
            room={currentRoom}
            currentUserId={currentUserId}
            onBack={() => setCurrentRoom(null)}
            onNewMessage={handleNewMessage}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <EmptyPlaceholder />
        )}
      </div>
    </div>
  );
}
