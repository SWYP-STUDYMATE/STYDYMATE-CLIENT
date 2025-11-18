import React, { useState } from "react";
import { joinChatRoom } from "../../api/chat";
import { MessageCircle, Search, Plus } from "lucide-react";
import CreateChatRoomModal from "./CreateChatRoomModal";
import { useAlert } from "../../hooks/useAlert";

export default function ChatRoomList({
  rooms,
  onSelectRoom,
  onNewRoomCreated,
  onJoinRoom,
}) {
  const { showError } = useAlert();
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
      showError("채팅방 참여에 실패했습니다.");
    }
  };

  const handleRoomCreated = (newRoom) => {
    onSelectRoom(newRoom);
    onNewRoomCreated();
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-center px-4 pt-2 md:pt-0">
        <MessageCircle className="w-5 h-5 text-[#111111] mr-2" />
        <span className="text-lg font-semibold text-[#111111]">Chat</span>
      </div>

      <div className="px-4">
        <div className="flex items-center bg-white rounded-xl px-4 py-2 shadow-sm border border-[#E7E7E7]">
          <Search className="w-4 h-4 text-[#929292] mr-2" />
          <input
            type="text"
            placeholder="채팅방을 검색해보세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 rounded px-2 py-1 text-sm text-[#111111] placeholder-[#929292]"
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
                  className="w-full flex items-center p-3 md:p-3 min-h-[64px] hover:bg-gray-50 cursor-pointer rounded-lg border border-[#E7E7E7] focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2 transition-colors text-left"
                  aria-label={`${name} 채팅방 ${isParticipating ? '열기' : '참여하기'}`}
                  type="button"
                >
                  <img
                    src={other?.profileImage || "/assets/basicProfilePic.png"}
                    alt={`${name} 프로필 사진`}
                    className="w-12 h-12 md:w-10 md:h-10 rounded-full mr-3 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <p className="font-medium text-[#111111] truncate">{name}</p>
                        {/* 방장 배지 */}
                        {room.isOwner && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#E6F9F1] text-[#00C471] rounded flex-shrink-0">
                            방장
                          </span>
                        )}
                      </div>
                      {isParticipating && room.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#EA4335] rounded-full ml-2 flex-shrink-0">
                          {room.unreadCount > 99 ? '99+' : room.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#929292] truncate mt-1">
                      {isParticipating
                        ? room.lastMessage || "메시지가 없습니다"
                        : `참여자 ${room.participants.length}명`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-2 flex-shrink-0">
                    <span className="text-xs text-[#929292]">
                      {isParticipating && room.lastMessageAt
                        ? new Date(room.lastMessageAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : ""}
                    </span>
                    {isParticipating && room.isLastMessageRead === false && (
                      <div className="w-2 h-2 bg-[#00C471] rounded-full mt-1"></div>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center text-[#929292] py-8">
              채팅방이 없습니다
            </div>
          )}

          {/* 새 채팅방 생성 버튼 */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full mt-4 min-h-[48px] py-3 bg-[#00C471] text-white text-base font-bold rounded-lg hover:bg-[#00B267] transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:ring-offset-2"
            aria-label="새 채팅방 만들기"
            type="button"
          >
            <Plus className="w-5 h-5 mr-2" />새 채팅방
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
