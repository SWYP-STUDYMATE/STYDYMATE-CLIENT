import React, { useState } from "react";
import { createChatRoom } from "../../api/chat";
import { MessageCircle, Search } from "lucide-react";

export default function ChatRoomList({ rooms, onSelectRoom }) {
  const [filter, setFilter] = useState("전체");
  const [query, setQuery] = useState("");

  const filteredRooms = rooms
    .filter((r) => r.roomName.includes(query))
    .filter((r) => {
      if (filter === "전체") return true;
      if (filter === "개인") return r.participants.length === 2;
      if (filter === "그룹") return r.participants.length > 2;
      return true;
    });

  const myId = localStorage.getItem("userId");

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-center px-4">
        <MessageCircle className="w-5 h-5 text-gray-700 mr-2" />
        <span className="text-lg font-semibold text-gray-800">Chat</span>
      </div>

      <div className="px-4">
        <div className="flex items-center bg-white rounded-xl px-4 py-2 shadow-sm">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="파트너를 검색해보세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-sm text-gray-700"
          />
        </div>

        <div className="flex w-full space-x-2 mt-3">
          {["전체", "개인", "그룹"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-1 text-center px-4 py-1 rounded-xl text-sm font-medium transition-colors ${
                filter === type
                  ? "bg-[#00C471] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4">
        <div className="bg-white rounded-xl shadow-lg p-4 h-full overflow-y-auto space-y-2">
          {filteredRooms.map((room) => {
            const other = room.participants.find((p) => p.userId !== myId);
            const name = other ? other.name : room.roomName;
            return (
              <div
                key={room.roomId}
                onClick={() => onSelectRoom(room)}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg"
              >
                <img
                  src={other?.profileImage}
                  alt=""
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {room.lastMessage}
                  </p>
                </div>
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(room.lastMessageAt).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
          <button
            onClick={async () => {
              const name = prompt("새 채팅방 이름을 입력하세요");
              if (!name) return;
              const newRoom = await createChatRoom({
                roomName: name,
                participantIds: [],
              });
              // rooms 업데이트는 부모에서 handleNewRoom 등을 추가 구현 필요
            }}
            className="w-full mt-4 py-2 bg-[#00C471] text-white text-sm font-medium rounded-full hover:bg-[#00b364] transition-colors"
          >
            + 새 채팅방
          </button>
        </div>
      </div>
    </div>
  );
}
