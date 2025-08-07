import React, { useState, useEffect } from "react";
import { fetchChatRooms, initGlobalStompClient } from "../../api/chat";
import Sidebar from "./Sidebar";
import ChatRoomList from "./ChatRoomList";
import EmptyPlaceholder from "./EmptyPlaceholder";
import ChatWindow from "./ChatWindow";
import MainHeader from "../MainHeader";

export default function ChatContainer() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);

  // 현재 사용자 ID 가져오기
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    reloadChatRooms();

    const globalClient = initGlobalStompClient((newRoom) => {
      console.log("새 방 알림 수신:", newRoom);
      console.log("현재 사용자 ID:", currentUserId);
      console.log("새로 생성된 방의 참여자들:", newRoom.participants);

      // 새로운 채팅방이 생성되었을 때 즉시 목록 새로고침
      reloadChatRooms();

      // 현재 선택된 방이 있다면 초기화 (새로운 방이 생성되었으므로)
      setCurrentRoom(null);
    });

    return () => {
      if (globalClient) {
        globalClient.disconnect();
      }
    };
  }, []);

  
  const reloadChatRooms = async () => {
    try {
      const roomsData = await fetchChatRooms();
      setRooms(roomsData);
      console.log("채팅방 목록 새로고침 완료:", roomsData.length, "개");
    } catch (error) {
      console.error("채팅방 목록 새로고침 실패:", error);
    }
  };

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

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <MainHeader />
      <div className="flex flex-1 p-6 space-x-6 overflow-hidden">
        <Sidebar active="chat" />
        <div className="w-80 flex-shrink-0">
          <ChatRoomList
            rooms={rooms}
            onSelectRoom={setCurrentRoom}
            onNewRoomCreated={handleNewRoomCreated}
            onJoinRoom={() => {
              reloadChatRooms();
            }}
          />
        </div>
        <div className="flex-1">
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
    </div>
  );
}
