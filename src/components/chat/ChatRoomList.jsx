import React, { useEffect, useState } from 'react';
import { fetchChatRooms, createChatRoom } from '../../api/chat';

export default function ChatRoomList({ onSelectRoom }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchChatRooms();
        setRooms(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleCreate = async () => {
    const name = prompt('새 채팅방 이름을 입력하세요');
    if (!name) return;
    try {
      const room = await createChatRoom({ roomName: name, participantIds: [] });
      setRooms(prev => [room, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-1/3 border-r p-4 flex flex-col">
      <button
        onClick={handleCreate}
        className="mb-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        채팅방 생성
      </button>
      <div className="flex-1 overflow-y-auto">
        {rooms.map(room => (
          <div
            key={room.roomId}
            onClick={() => onSelectRoom(room)}
            className="flex items-center p-2 mb-2 cursor-pointer hover:bg-gray-100 rounded"
          >
            <img
              src={room.participants[0]?.profileImage}
              alt={room.participants[0]?.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1">
              <p className="font-semibold">{room.roomName}</p>
              <p className="text-sm text-gray-500 truncate">
                {room.lastMessage}
              </p>
            </div>
            <span className="text-xs text-gray-400 ml-2">
              {new Date(room.lastMessageAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
