import React, { useState, useRef, useEffect } from "react";
import { Search, MoreVertical, LogOut, ChevronLeft } from "lucide-react";
import OptimizedImage from '../OptimizedImage';
import { DEFAULT_PROFILE_IMAGE } from '../../utils/imageUtils';

export default function ChatHeader({ room, currentUserId, onLeaveRoom, onSearchToggle, onBack }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const partner = room.participants.find((u) => u.userId !== currentUserId) || {
    name: "",
    profileImage: "",
  };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLeaveRoom = () => {
    if (window.confirm("정말로 이 채팅방을 나가시겠습니까?")) {
      onLeaveRoom();
    }
    setShowMenu(false);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        {/* 모바일 뒤로가기 버튼 */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 mr-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="채팅방 목록으로 돌아가기"
          >
            <ChevronLeft className="w-6 h-6 text-[#111111]" />
          </button>
        )}
        <OptimizedImage
          src={partner.profileImage || DEFAULT_PROFILE_IMAGE}
          alt={partner.name}
          className="w-10 h-10 rounded-full"
          width={40}
          height={40}
          loading="eager"
        />
        <span className="ml-3 text-lg font-semibold text-[#111111]">{room.roomName}</span>
      </div>
      <div className="flex items-center space-x-1 md:space-x-2">
        <button
          onClick={onSearchToggle}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="메시지 검색 (Ctrl+F)"
          aria-label="메시지 검색"
        >
          <Search className="w-5 h-5 text-[#606060]" />
        </button>

        {/* 메뉴 버튼 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="메뉴 열기"
          >
            <MoreVertical className="w-5 h-5 text-[#606060]" />
          </button>

          {/* 드롭다운 메뉴 */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E7E7E7] z-50">
              <button
                onClick={handleLeaveRoom}
                className="w-full flex items-center px-4 py-3 text-left text-[#111111] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3 text-[#606060]" />
                채팅방 나가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
