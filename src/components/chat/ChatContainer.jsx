import React, { useState, useEffect } from "react";
import { fetchChatRooms } from "../../api/chat";
import Header from "../Header";
import Sidebar from "./Sidebar";
import ChatRoomList from "./ChatRoomList";
import EmptyPlaceholder from "./EmptyPlaceholder";
import ChatWindow from "./ChatWindow";

export default function ChatContainer() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);

  useEffect(() => {
    fetchChatRooms().then(setRooms);
  }, []);

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
      <Header />
      <div className="flex flex-1 p-6 space-x-6">
        <Sidebar active="chat" />
        <div className="w-80">
          <ChatRoomList rooms={rooms} onSelectRoom={setCurrentRoom} />
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
