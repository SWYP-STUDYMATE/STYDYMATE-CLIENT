import React, { useState } from 'react';
import ChatRoomList from './ChatRoomList';
import ChatWindow from './ChatWindow';

export default function ChatContainer() {
  const [currentRoom, setCurrentRoom] = useState(null);

  return (
    <div className="flex h-full bg-white">
      {!currentRoom ? (
        <ChatRoomList onSelectRoom={setCurrentRoom} />
      ) : (
        <ChatWindow room={currentRoom} onBack={() => setCurrentRoom(null)} />
      )}
    </div>
  );
}
