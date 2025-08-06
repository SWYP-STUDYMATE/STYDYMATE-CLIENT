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

  useEffect(() => {
    reloadChatRooms();

    const globalClient = initGlobalStompClient((newRoom) => {
        console.log("새 방 알림 수신:", newRoom);
        reloadChatRooms();
        setCurrentRoom(null); // 새로운 방 생성 시 현재 선택된 방 초기화
    });

    return () => {
        globalClient.disconnect();
    };
  }, []);

  const reloadChatRooms = () => {
    fetchChatRooms().then(setRooms);
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

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <MainHeader />
      <div className="flex flex-1 p-6 space-x-6 overflow-hidden">
        <Sidebar active="chat" />
        <div className="w-80 flex-shrink-0">
          <ChatRoomList
            rooms={rooms}
            onSelectRoom={setCurrentRoom}
            onNewRoomCreated={reloadChatRooms}
          />
        </div>
        <div className="flex-1">
          {currentRoom ? (
            <ChatWindow
              room={currentRoom}
              onBack={() => setCurrentRoom(null)}
              onNewMessage={handleNewMessage}
            />
          ) : (
            <EmptyPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}
