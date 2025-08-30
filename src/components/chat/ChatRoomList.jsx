import React, { useState } from "react";
import { joinChatRoom } from "../../api/chat";
import { MessageCircle, Search, Plus } from "lucide-react";
import CreateChatRoomModal from "./CreateChatRoomModal";

export default function ChatRoomList({
  rooms,
  onSelectRoom,
  onNewRoomCreated,
  onJoinRoom,
}) {
  const [query, setQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 모든 채팅방을 하나의 목록으로 합치기
  const allRooms = [...rooms];
  const filteredRooms = allRooms.filter((r) => r.roomName.includes(query));

  const myId = localStorage.getItem("userId");

  const handleRoomClick = async (room) => {
    // 이미 참여 중인 방이면 바로 선택
    if (room.participants.some((p) => p.userId === myId)) {
      onSelectRoom(room);
      return;
    }

    // 참여하지 않은 방이면 참여 후 선택
    try {
      await joinChatRoom(room.roomId);
      onJoinRoom();
      onSelectRoom(room);
    } catch (error) {
      console.error("채팅방 참여 실패:", error);
      alert("채팅방 참여에 실패했습니다.");
    }
  };

  const handleRoomCreated = (newRoom) => {
    onSelectRoom(newRoom);
    onNewRoomCreated();
  };

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
            placeholder="채팅방을 검색해보세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 rounded px-2 py-1 text-sm text-gray-700"
            aria-label="채팅방 검색"
          />
        </div>
      </div>

      <div className="flex-1 px-4">
        <div className="bg-white rounded-xl shadow-lg p-4 h-full overflow-y-auto space-y-2">
          {/* 모든 채팅방 목록 */}
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => {
              const isParticipating = room.participants.some(
                (p) => p.userId === myId
              );
              const other = room.participants.find((p) => p.userId !== myId);
              const name = other ? other.name : room.roomName;

              return (
                <button
                  key={room.roomId}
                  onClick={() => handleRoomClick(room)}
                  className="w-full flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 transition-colors text-left"
                  aria-label={`${name} 채팅방 ${isParticipating ? '열기' : '참여하기'}`}
                  type="button"
                >
                  <img
                    src={other?.profileImage || "/assets/basicProfilePic.png"}
                    alt={`${name} 프로필 사진`}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {isParticipating
                        ? room.lastMessage || "메시지가 없습니다"
                        : `참여자 ${room.participants.length}명`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    {isParticipating && room.lastMessageAt
                      ? new Date(room.lastMessageAt).toLocaleTimeString()
                      : ""}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-8">
              채팅방이 없습니다
            </div>
          )}

          {/* 새 채팅방 생성 버튼 */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full mt-4 py-2 bg-[#00C471] text-white text-sm font-medium rounded-full hover:bg-[#00b364] transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2"
            aria-label="새 채팅방 만들기"
            type="button"
          >
            <Plus className="w-4 h-4 mr-1" />새 채팅방
          </button>
        </div>
      </div>

      {/* Create Chat Room Modal */}
      <CreateChatRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}
