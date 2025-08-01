import React from "react";
import { Phone, Video } from "lucide-react";

export default function ChatHeader({ room, currentUserId }) {
  const currentUser = room.participants.find((u) => u.id === currentUserId) || {
    name: "",
    profileImage: "",
  };
  const partner = room.participants.find((u) => u.id !== currentUserId) || {
    name: "",
    profileImage: "",
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <img
          src={currentUser.profileImage}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full"
        />
        <span className="ml-3 text-lg font-semibold">{currentUser.name}</span>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            /* 전화 로직 */
          }}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => {
            /* 영상통화 로직 */
          }}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Video className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
